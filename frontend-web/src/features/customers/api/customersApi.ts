import { httpClient } from '@core/http';
import { parseOrThrow } from '@core/api/parseOrThrow';
import { customerListSchema, customerSchema } from '@entities/customer';
import type { Customer, CreateCustomerDTO, UpdateCustomerDTO } from '@entities/customer';

export const customersApi = {
  getCustomers: async (): Promise<Customer[]> => {
    const res = await httpClient.get<unknown>('/customers');
    return parseOrThrow(customerListSchema, res);
  },

  getCustomer: async (id: string): Promise<Customer> => {
    const res = await httpClient.get<unknown>(`/customers/${id}`);
    return parseOrThrow(customerSchema, res);
  },

  createCustomer: async (data: CreateCustomerDTO): Promise<Customer> => {
    const res = await httpClient.post<unknown>('/customers', data);
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
