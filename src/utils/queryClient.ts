import { QueryClient } from '@tanstack/react-query'

// https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // retryDelay: 0,
      // retry: 3, // Will retry failed requests 3 times before displaying an error
      // refetchInterval: false,
      // refetchOnMount: true,
      // refetchOnReconnect: true,
      // refetchOnWindowFocus: true,
      staleTime: 5 * 60 * 1000, // 5 minutes stale time
    },
  },
})

export default queryClient;