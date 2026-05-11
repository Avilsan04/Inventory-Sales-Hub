import type { Customer, CreateCustomerDTO, UpdateCustomerDTO } from '@entities/customer';

export interface ICustomersApi {
  readonly getCustomers: () => Promise<Customer[]>;
  readonly getCustomer: (id: string) => Promise<Customer>;
  readonly createCustomer: (data: CreateCustomerDTO) => Promise<Customer>;
  readonly updateCustomer: (id: string, data: UpdateCustomerDTO) => Promise<Customer>;
  readonly deleteCustomer: (id: string) => Promise<void>;
}
