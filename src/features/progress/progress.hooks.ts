import { useQuery } from '@tanstack/react-query';
import * as progressApi from './progress.api';

export function useMyProgressQuery() {
  return useQuery({
    queryKey: ['progress', 'me'],
    queryFn: () => progressApi.getMyProgress(),
  });
}
