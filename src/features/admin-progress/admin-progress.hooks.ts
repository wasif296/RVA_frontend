import { useQuery } from '@tanstack/react-query';
import * as adminProgressApi from './admin-progress.api';
import type { AdminProgressListParams } from './admin-progress.api';

export function useAdminProgressListQuery(params: AdminProgressListParams) {
  return useQuery({
    queryKey: ['admin-progress', 'list', params],
    queryFn: () => adminProgressApi.listAdminProgress(params),
  });
}

export function useAdminUserProgressQuery(userId: string) {
  return useQuery({
    queryKey: ['admin-progress', 'user', userId],
    queryFn: () => adminProgressApi.getAdminUserProgress(userId),
    enabled: Boolean(userId),
  });
}
