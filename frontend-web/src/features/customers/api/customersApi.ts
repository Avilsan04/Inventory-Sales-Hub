import { httpClient } from '@core/http';
import { customerListSchema, customerSchema } from '@entities/customer';
import type { Customer, CreateCustomerDTO, UpdateCustomerDTO } from '@entities/customer';

export const customersApi = {
  getCustomers: async (): Promise<Customer[]> => {
    const res = await httpClient.get<unknown>('/customers');
    return customerListSchema.parse(res);
  },

  getCustomer: async (id: string): Promise<Customer> => {
    const res = await httpClient.get<unknown>(`/customers/${id}`);
    return customerSchema.parse(res);
  },

  createCustomer: async (data: CreateCustomerDTO): Promise<Customer> => {
    const res = await httpClient.post<unknown>('/customers', data);
    return customerSchema.parse(res);
  },

  updateCustomer: async (id: string, data: UpdateCustomerDTO): Promise<Customer> => {
    const res = await httpClient.put<unknown>(`/customers/${id}`, data);
    return customerSchema.parse(res);
  },

  deleteCustomer: async (id: string): Promise<void> => {
    await httpClient.delete<unknown>(`/customers/${id}`);
  },
};
