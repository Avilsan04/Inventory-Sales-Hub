import { httpClient } from '@core/http';
import type { HttpRequestConfig } from '@core/http';
import { parseOrThrow } from '@core/api/parseOrThrow';
import { customerListSchema, customerSchema } from '@entities/customer';
import { z } from 'zod';
import type { Customer, CreateCustomerDTO, UpdateCustomerDTO } from '@entities/customer';

const paginatedCustomerSchema = z.object({
  data: customerListSchema,
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export const customersApi = {
  getCustomers: async (): Promise<Customer[]> => {
    const res = await httpClient.get<unknown>('/customers');
    return parseOrThrow(paginatedCustomerSchema, res).data;
  },

  getCustomer: async (id: string): Promise<Customer> => {
    const res = await httpClient.get<unknown>(`/customers/${id}`);
    return parseOrThrow(customerSchema, res);
  },

  createCustomer: async (
    data: CreateCustomerDTO,
    config?: HttpRequestConfig
  ): Promise<Customer> => {
    const res = await httpClient.post<unknown>('/customers', data, config);
    return parseOrThrow(customerSchema, res);
  },

  updateCustomer: async (id: string, data: UpdateCustomerDTO): Promise<Customer> => {
    const res = await httpClient.put<unknown>(`/customers/${id}`, data);
    return parseOrThrow(customerSchema, res);
  },

  deleteCustomer: async (id: string): Promise<void> => {
    await httpClient.delete(`/customers/${id}`);
  },
};
