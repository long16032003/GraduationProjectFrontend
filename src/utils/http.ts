import { $fetch, FetchOptions, FetchRequest } from 'ofetch';
import { defu } from 'defu';

// https://velog.io/@hafnium1923/Access-Token-Refresh-Token
// https://stackoverflow.com/questions/76798256/how-can-i-repeat-previous-request-in-ofetch
// https://github.com/unjs/ofetch/issues/441
// https://github.com/unjs/ofetch/issues/79
// https://dev.to/neil585456525/enhance-user-experience-with-automatic-token-refresh-1013
// https://github.com/SMAccess/ecommerce/blob/master/composables/useAuthRequest.ts


export const defaultOptions = {
  retry: 3,
  // Default retry status codes:
  // 408 - Request Timeout
  // 409 - Conflict
  // 425 - Too Early (Experimental)
  // 429 - Too Many Requests
  // 500 - Internal Server Error
  // 502 - Bad Gateway
  // 503 - Service Unavailable
  // 504 - Gateway Timeout
  retryStatusCodes: [408, 409, 425, 429, 500, 502, 503, 504],
  retryDelay: 500, // delay between retries in ms
  timeout: 10000, // 10s timeout
  credentials: 'same-origin',
  headers: {
    Accept: 'application/json',
  },
  async onRequest() {

  },
  async onResponseError({ response }) {
    // Handle the response errors
    if (response.status === 419) {
      //
    }
  },
} as FetchOptions;

// use client side only
export function $http(url: FetchRequest, options?: FetchOptions) {
  return $fetch(url, defu(options, defaultOptions));
}
