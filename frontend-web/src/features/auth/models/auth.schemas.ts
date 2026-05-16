import { z } from 'zod';
import { AUTH_VALIDATION_RULES } from './auth.constants';

export const loginFormSchema = z.object({
  email: z.email('Valid email required'),
  password: z
    .string()
    .min(
      AUTH_VALIDATION_RULES.MIN_PASSWORD_LENGTH,
      `Min ${String(AUTH_VALIDATION_RULES.MIN_PASSWORD_LENGTH)} characters`
    ),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

const passwordFields = {
  password: z
    .string()
    .min(
      AUTH_VALIDATION_RULES.MIN_PASSWORD_LENGTH,
      `Min ${String(AUTH_VALIDATION_RULES.MIN_PASSWORD_LENGTH)} characters`
    ),
  confirmPassword: z.string(),
};

export const registerCustomerSchema = z
  .object({
    username: z
      .string()
      .min(
        AUTH_VALIDATION_RULES.MIN_USERNAME_LENGTH,
        `Min ${String(AUTH_VALIDATION_RULES.MIN_USERNAME_LENGTH)} characters`
      ),
    email: z.email('Valid email required'),
    ...passwordFields,
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const registerCompanySchema = z
  .object({
    companyName: z.string().min(1, 'Required'),
    cif: z.string().min(1, 'Required'),
    legalRepresentative: z.string().min(1, 'Required'),
    legalEmail: z.email('Valid email required'),
    phone: z.string().min(6, 'Min 6 characters'),
    ...passwordFields,
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterCustomerValues = z.infer<typeof registerCustomerSchema>;
export type RegisterCompanyValues = z.infer<typeof registerCompanySchema>;
