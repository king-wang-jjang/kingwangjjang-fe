'use client';

import type { AdminUser } from 'src/api/admin-user-api';

import { useState } from 'react';

import {
  Box,
  Chip,
  Stack,
  Alert,
  Avatar,
  Button,
  Dialog,
  Divider,
  TextField,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';

import { useAdminUser, useUpdateAdminUser } from 'src/hooks/use-admin-users';

import { memberDate, memberName, memberError } from './user-utils';

export function UserDetailDialog({
  memberId,
  onClose,
  onSaved,
}: {
  memberId: string;
  onClose: () => void;
  onSaved: (name: string) => void;
}) {
  const detail = useAdminUser(memberId);
  const mutation = useUpdateAdminUser();

  return (
    <Dialog
      open
      fullWidth
      maxWidth="sm"
      onClose={mutation.isPending ? undefined : onClose}
      aria-labelledby="member-detail-title"
    >
      <DialogTitle id="member-detail-title">회원 상세</DialogTitle>
      {detail.isPending ? (
        <DialogContent>
          <Stack role="status" spacing={2} sx={{ py: 5, alignItems: 'center' }}>
            <CircularProgress size={28} />
            <Typography color="text.secondary">회원 정보를 불러오고 있습니다.</Typography>
          </Stack>
        </DialogContent>
      ) : detail.isError || !detail.data ? (
        <DialogContent>
          <Alert
            severity="error"
            action={
              <Button color="inherit" onClick={() => detail.refetch()}>
                다시 시도
              </Button>
            }
          >
            {memberError(detail.error)}
          </Alert>
        </DialogContent>
      ) : (
        <MemberForm
          member={detail.data}
          saving={mutation.isPending}
          error={mutation.isError ? memberError(mutation.error) : null}
          onClose={onClose}
          onSave={async (displayName) => {
            try {
              const updated = await mutation.mutateAsync({ memberId, displayName });
              onSaved(memberName(updated));
            } catch {
              // The mutation error remains visible in the form for retry.
            }
          }}
        />
      )}
      {(detail.isPending || detail.isError || !detail.data) && (
        <DialogActions>
          <Button onClick={onClose}>닫기</Button>
        </DialogActions>
      )}
    </Dialog>
  );
}

function MemberForm({
  member,
  saving,
  error,
  onClose,
  onSave,
}: {
  member: AdminUser;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (displayName: string | null) => Promise<void>;
}) {
  const [displayName, setDisplayName] = useState(member.displayName || '');
  const normalized = displayName.trim() || null;
  const nameLength = Array.from(displayName.trim()).length;
  const canSave = normalized !== (member.displayName || null) && nameLength <= 40 && !saving;
  const name = memberName(member);
  const fields = [
    ['회원 ID', member.Id],
    ['로그인 ID', member.userId],
    ['로그인 방식', member.authProvider === 'kakao' ? '카카오' : member.authProvider],
    ['원래 닉네임', member.nickname || '제공되지 않음'],
    ['가입일 (한국 시간)', memberDate(member.createTime)],
  ];

  return (
    <Box
      component="form"
      onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (canSave) onSave(normalized);
      }}
    >
      <DialogContent sx={{ pt: 1 }}>
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Avatar
              src={member.profileImage || undefined}
              alt={name}
              sx={{ width: 48, height: 48 }}
            >
              {name.charAt(0)}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" sx={{ overflowWrap: 'anywhere' }}>
                {name}
              </Typography>
              <Chip
                size="small"
                label={member.role === 'admin' ? '관리자' : '일반 회원'}
                color={member.role === 'admin' ? 'primary' : 'default'}
                variant="outlined"
              />
            </Box>
          </Stack>
          <Box
            component="dl"
            sx={{ m: 0, display: 'grid', gridTemplateColumns: '110px minmax(0, 1fr)', gap: 1.25 }}
          >
            {fields.map(([label, value]) => (
              <DetailField key={label} label={label} value={value} />
            ))}
          </Box>
          <Divider />
          <TextField
            autoFocus
            fullWidth
            label="표시 이름"
            value={displayName}
            disabled={saving}
            onChange={(event) => setDisplayName(event.target.value)}
            error={nameLength > 40}
            helperText={`${nameLength}/40자 · 비워두면 원래 닉네임을 사용합니다.`}
          />
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button color="inherit" onClick={onClose} disabled={saving}>
          닫기
        </Button>
        <Button type="submit" variant="contained" disabled={!canSave}>
          {saving ? '저장 중...' : '변경 저장'}
        </Button>
      </DialogActions>
    </Box>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <>
      <Typography component="dt" variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography component="dd" variant="body2" sx={{ m: 0, overflowWrap: 'anywhere' }}>
        {value}
      </Typography>
    </>
  );
}
