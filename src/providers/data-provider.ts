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

    const data = await response.json();

    return { data };
  },
  getOne: async ({ resource, id }) => {
    const response = await httpClient(`${API_URL}/${resource}/${id}`);

    if (response.status < 200 || response.status > 299) throw response;

    const data = await response.json();

    return { data };
  },
  update: async ({ resource, id, variables }) => {
    const response = await httpClient(`${API_URL}/${resource}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(variables),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status < 200 || response.status > 299) throw response;

    const data = await response.json();

    return { data };
  },
  getList: async ({ resource }) => {
    const response = await httpClient(`${API_URL}/${resource}`);

    if (response.status < 200 || response.status > 299) throw response;

    const data = await response.json();

    return {
      data,
      total: 0, // We'll cover this in the next steps.
    };
  },
  
  deleteOne: () => {
    throw new Error('Not implemented');
  },
  getApiUrl: () => API_URL,
  // Optional methods:
  // getMany: () => { /* ... */ },
  // createMany: () => { /* ... */ },
  // deleteMany: () => { /* ... */ },
  // updateMany: () => { /* ... */ },
  // custom: () => { /* ... */ },
};