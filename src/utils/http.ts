import { $fetch } from 'ofetch';
import type { FetchOptions } from 'ofetch';
import { parse } from 'cookie-es';

// https://velog.io/@hafnium1923/Access-Token-Refresh-Token
// https://stackoverflow.com/questions/76798256/how-can-i-repeat-previous-request-in-ofetch
// https://github.com/unjs/ofetch/issues/441
// https://github.com/unjs/ofetch/issues/79
// https://dev.to/neil585456525/enhance-user-experience-with-automatic-token-refresh-1013
// https://github.com/SMAccess/ecommerce/blob/master/composables/useAuthRequest.ts

export const defaultOptions = {
  baseURL: import.meta.env.VITE_API_URL,
  retry: 1,
  // Default retry status codes:
  // 408 - Request Timeout
  // 409 - Conflict
  // 425 - Too Early (Experimental)
  // 429 - Too Many Requests
  // 500 - Internal Server Error
  // 502 - Bad Gateway
  // 503 - Service Unavailable
  // 504 - Gateway Timeout
  retryStatusCodes: [408, 409, 425, 500, 502, 503, 504, 419],
  // Delay between retries in milliseconds.
  retryDelay: ({response}): number => {
    if(response?.status === 419) {
      // Retry immediately
      return 0;
    }
    // Retry after 500ms
    return 500;
  },
  timeout: 10000, // 10s timeout
  credentials: 'same-origin',
  headers: {
    Accept: 'application/json',
  },
  async onRequest({ options, request }) {
    // automatically set x-xsrf-token header for request
    // https://laravel.com/docs/12.x/sanctum#csrf-protection
    const csrfToken = parse(document.cookie)['XSRF-TOKEN']
    if (csrfToken) {
      options.headers.set('x-xsrf-token', csrfToken)
    }
  },
  async onResponseError({ response }) {
    // Handle "419 - CSRF token mismatch" error
    // https://laravel.com/docs/12.x/sanctum#csrf-protection
    if (response.status === 419) {
      // reinitialize XSRF-TOKEN cookie
      await $fetch('sanctum/csrf-cookie')
    }
  },
} as FetchOptions;

// use client side only
export const httpClient = $fetch.create(defaultOptions)
