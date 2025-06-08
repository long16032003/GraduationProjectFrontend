import type { QueryClient } from '@tanstack/react-query';
import type { LoaderFunctionArgs } from 'react-router';
import { dataProvider } from '@/providers/data-provider.ts';

export const loader =
  (queryClient: QueryClient) =>
    async ({ params }: LoaderFunctionArgs) => {
      const { data } = await queryClient.ensureQueryData({
        queryKey: ['permissions'],
        queryFn: async () => dataProvider.getList({
          resource: 'permissions',
        }),
      });
      return { params: params, data };
    };