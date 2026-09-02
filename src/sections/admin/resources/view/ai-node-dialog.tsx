'use client';

import type {
  AIProvider,
  AINodeInput,
  AINodeModel,
  AICapability,
  AIResourceNode,
} from 'src/api/ai-resource-api';

import { useRef, useState } from 'react';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import {
  Box,
  Chip,
  Stack,
  Alert,
  Button,
  Switch,
  Dialog,
  Divider,
  MenuItem,
  TextField,
  Typography,
  IconButton,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

const CAPABILITIES: { value: AICapability; label: string }[] = [
  { value: 'analysis', label: 'Analysis' },
  { value: 'chat', label: 'Chat' },
  { value: 'vision', label: 'Vision' },
];

const EMPTY_MODEL: AINodeModel = {
  name: '',
  capabilities: ['analysis'],
  enabled: true,
  isDefault: true,
};

function initialInput(node: AIResourceNode | null): AINodeInput {
  if (!node) {
    return {
      name: '',
      provider: 'ollama',
      baseUrl: '',
      enabled: true,
      priority: 100,
      weight: 1,
      maxConcurrency: 1,
      timeoutSeconds: 60,
      apiKeyEnv: null,
      models: [{ ...EMPTY_MODEL }],
    };
  }

  return {
    name: node.name,
    provider: node.provider,
    baseUrl: node.baseUrl,
    enabled: node.enabled,
    priority: node.priority,
    weight: node.weight,
    maxConcurrency: node.maxConcurrency,
    timeoutSeconds: node.timeoutSeconds,
    apiKeyEnv: node.apiKeyEnv,
    models: node.models.map((model) => ({ ...model, capabilities: [...model.capabilities] })),
  };
}

type Props = {
  node: AIResourceNode | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (input: AINodeInput) => Promise<void>;
};

export function AINodeDialog({ node, saving, onClose, onSubmit }: Props) {
  const [input, setInput] = useState(() => initialInput(node));
  const nextModelKey = useRef(input.models.length);
  const [modelKeys, setModelKeys] = useState(() =>
    input.models.map((_, index) => `model-${index}`)
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const updateModel = (index: number, changes: Partial<AINodeModel>) => {
    setInput((current) => ({
      ...current,
      models: current.models.map((model, modelIndex) =>
        modelIndex === index ? { ...model, ...changes } : model
      ),
    }));
  };

  const toggleCapability = (index: number, capability: AICapability) => {
    const model = input.models[index];
    const exists = model.capabilities.includes(capability);
    const capabilities = exists
      ? model.capabilities.filter((item) => item !== capability)
      : [...model.capabilities, capability];
    updateModel(index, { capabilities });
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setValidationError(null);

    if (!input.name.trim() || !input.baseUrl.trim()) {
      setValidationError('Node 이름과 Base URL을 입력해 주세요.');
      return;
    }
    try {
      const url = new URL(input.baseUrl);
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error('invalid protocol');
    } catch {
      setValidationError('Base URL은 http 또는 https로 시작하는 올바른 주소여야 합니다.');
      return;
    }
    if (input.models.some((model) => !model.name.trim() || model.capabilities.length === 0)) {
      setValidationError('각 모델의 이름과 capability를 한 개 이상 지정해 주세요.');
      return;
    }

    await onSubmit(input);
  };

  return (
    <Dialog open onClose={saving ? undefined : onClose} fullWidth maxWidth="md">
      <Box component="form" onSubmit={submit}>
        <DialogTitle sx={{ pb: 1 }}>{node ? 'AI Node 수정' : 'AI Node 추가'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            <Typography variant="body2" color="text.secondary">
              연결 정보와 라우팅 용량을 설정합니다. API key 값은 저장하지 않습니다.
            </Typography>
            {validationError && <Alert severity="error">{validationError}</Alert>}

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                gap: 2,
              }}
            >
              <TextField
                required
                label="Node 이름"
                value={input.name}
                onChange={(event) => setInput({ ...input, name: event.target.value })}
              />
              <TextField
                select
                label="Provider"
                value={input.provider}
                onChange={(event) =>
                  setInput({ ...input, provider: event.target.value as AIProvider })
                }
              >
                <MenuItem value="ollama">Ollama</MenuItem>
                <MenuItem value="openai_compatible">OpenAI compatible / vLLM</MenuItem>
              </TextField>
              <TextField
                required
                label="Base URL"
                value={input.baseUrl}
                onChange={(event) => setInput({ ...input, baseUrl: event.target.value })}
                placeholder="http://ai-node:11434"
                sx={{ gridColumn: { sm: '1 / -1' } }}
              />
              <TextField
                label="API key 환경변수"
                value={input.apiKeyEnv || ''}
                onChange={(event) => setInput({ ...input, apiKeyEnv: event.target.value || null })}
                placeholder="AI_NODE_API_KEY_PRIMARY"
                helperText="비밀 값이 아닌 서버 환경변수 이름만 입력합니다."
                sx={{ gridColumn: { sm: '1 / -1' } }}
              />
              <TextField
                label="우선순위"
                type="number"
                value={input.priority}
                onChange={(event) => setInput({ ...input, priority: Number(event.target.value) })}
                helperText="숫자가 작을수록 먼저 선택"
              />
              <TextField
                label="가중치"
                type="number"
                value={input.weight}
                onChange={(event) => setInput({ ...input, weight: Number(event.target.value) })}
                slotProps={{ htmlInput: { min: 1, max: 100 } }}
                helperText="같은 우선순위 내 분산 비율"
              />
              <TextField
                label="최대 동시 처리"
                type="number"
                value={input.maxConcurrency}
                onChange={(event) =>
                  setInput({ ...input, maxConcurrency: Number(event.target.value) })
                }
                slotProps={{ htmlInput: { min: 1 } }}
              />
              <TextField
                label="Timeout (초)"
                type="number"
                value={input.timeoutSeconds}
                onChange={(event) =>
                  setInput({ ...input, timeoutSeconds: Number(event.target.value) })
                }
                slotProps={{ htmlInput: { min: 1, max: 600 } }}
              />
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={input.enabled}
                  onChange={(event) => setInput({ ...input, enabled: event.target.checked })}
                />
              }
              label={input.enabled ? '라우팅에 사용' : '비활성화'}
            />

            <Divider />

            <Stack spacing={1.5}>
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="subtitle1">모델</Typography>
                  <Typography variant="caption" color="text.secondary">
                    모델별로 처리할 작업 종류를 선택합니다.
                  </Typography>
                </Box>
                <Button
                  size="small"
                  startIcon={<AddRoundedIcon />}
                  onClick={() => {
                    const modelKey = `model-${nextModelKey.current}`;
                    nextModelKey.current += 1;
                    setInput({
                      ...input,
                      models: [
                        ...input.models,
                        { ...EMPTY_MODEL, isDefault: input.models.length === 0 },
                      ],
                    });
                    setModelKeys((current) => [...current, modelKey]);
                  }}
                >
                  모델 추가
                </Button>
              </Stack>

              {input.models.map((model, index) => (
                <Box
                  key={modelKeys[index]}
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    bgcolor: 'background.raised',
                  }}
                >
                  <Stack spacing={1.5}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                      <TextField
                        required
                        fullWidth
                        label={`모델 ${index + 1}`}
                        value={model.name}
                        onChange={(event) => updateModel(index, { name: event.target.value })}
                        placeholder="gemma4:e4b"
                      />
                      <IconButton
                        aria-label={`모델 ${index + 1} 삭제`}
                        disabled={input.models.length === 1}
                        onClick={() => {
                          setInput({
                            ...input,
                            models: input.models.filter((_, modelIndex) => modelIndex !== index),
                          });
                          setModelKeys((current) =>
                            current.filter((_, modelIndex) => modelIndex !== index)
                          );
                        }}
                      >
                        <DeleteOutlineRoundedIcon />
                      </IconButton>
                    </Stack>
                    <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                      {CAPABILITIES.map((capability) => {
                        const selected = model.capabilities.includes(capability.value);
                        return (
                          <Chip
                            key={capability.value}
                            label={capability.label}
                            color={selected ? 'primary' : 'default'}
                            variant={selected ? 'filled' : 'outlined'}
                            onClick={() => toggleCapability(index, capability.value)}
                          />
                        );
                      })}
                    </Stack>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ sm: 2 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            size="small"
                            checked={model.enabled}
                            onChange={(event) =>
                              updateModel(index, { enabled: event.target.checked })
                            }
                          />
                        }
                        label="모델 활성화"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            size="small"
                            checked={model.isDefault}
                            onChange={(event) =>
                              updateModel(index, { isDefault: event.target.checked })
                            }
                          />
                        }
                        label="기본 모델"
                      />
                    </Stack>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button color="inherit" onClick={onClose} disabled={saving}>
            취소
          </Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? '저장 중…' : node ? '변경 저장' : 'Node 추가'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
