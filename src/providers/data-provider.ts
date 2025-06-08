import { httpClient } from '@/utils/http';
import type { DataProvider } from '@refinedev/core';

const API_URL = import.meta.env.VITE_API_URL;

export const dataProvider: DataProvider = {
  create: async ({ resource, variables, meta }) => {
    const response = await httpClient(`${API_URL}/${resource}`, {
      method: 'POST',
      body: variables as Record<string, unknown>,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status < 200 || response.status > 299) throw response;

    return response;
  },
  getOne: async ({ resource, id }) => {
    const response = await httpClient(`${API_URL}/${resource}/${id}`);

    if (response.status < 200 || response.status > 299) throw response;

    return response;
  },
  update: async ({ resource, id, variables }) => {
    const response = await httpClient(`${API_URL}/${resource}/${id}`, {
      method: "PUT",
      body: JSON.stringify(variables),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status < 200 || response.status > 299) throw response;

    return response;
  },
  getList: async ({ resource, filters, meta }) => {
    const response = await httpClient(`${API_URL}/${resource}`, {
      method: 'GET',
      params: {
        filters,
        ...(meta || {}),
      },
    });

    if (response.status < 200 || response.status > 299) throw response;

    return response;
  },
  
  deleteOne: async ({ resource, id }) => {
    const response = await httpClient(`${API_URL}/${resource}/${id}`, {
      method: "DELETE",
    });

    if (response.status < 200 || response.status > 299) throw response;

    return response;
  },
  getApiUrl: () => API_URL,
  // Optional methods:
  // getMany: () => { /* ... */ },
  // createMany: () => { /* ... */ },
  // deleteMany: () => { /* ... */ },
  // updateMany: () => { /* ... */ },
  // upload: async () => {
  //   const response = await httpClient(`${API_URL}/${resource}`, {
  //     method: 'POST',
  //     body: variables as Record<string, unknown>,
  //   });

  //   if (response.status < 200 || response.status > 299) throw response;

  //   return response;
  // },
};