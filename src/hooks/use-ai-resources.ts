import type { AINodeInput } from 'src/api/ai-resource-api';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  checkAINode,
  createAINode,
  deleteAINode,
  updateAINode,
  checkAllAINodes,
  getAIResourceDashboard,
} from 'src/api/ai-resource-api';

export const AI_RESOURCES_QUERY_KEY = ['ai', 'resources'] as const;

export function useAIResources() {
  const queryClient = useQueryClient();
  const overview = useQuery({
    queryKey: AI_RESOURCES_QUERY_KEY,
    queryFn: getAIResourceDashboard,
    staleTime: 4_000,
    refetchInterval: 5_000,
    refetchIntervalInBackground: false,
  });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: AI_RESOURCES_QUERY_KEY });

  const createMutation = useMutation({ mutationFn: createAINode, onSuccess: invalidate });
  const updateMutation = useMutation({
    mutationFn: ({ nodeId, input }: { nodeId: string; input: AINodeInput }) =>
      updateAINode(nodeId, input),
    onSuccess: invalidate,
  });
  const deleteMutation = useMutation({ mutationFn: deleteAINode, onSuccess: invalidate });
  const checkMutation = useMutation({ mutationFn: checkAINode, onSuccess: invalidate });
  const checkAllMutation = useMutation({ mutationFn: checkAllAINodes, onSuccess: invalidate });

  return {
    ...overview,
    createNode: createMutation.mutateAsync,
    updateNode: updateMutation.mutateAsync,
    deleteNode: deleteMutation.mutateAsync,
    checkNode: checkMutation.mutateAsync,
    checkAllNodes: checkAllMutation.mutateAsync,
    isMutating:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending ||
      checkMutation.isPending ||
      checkAllMutation.isPending,
  };
}
