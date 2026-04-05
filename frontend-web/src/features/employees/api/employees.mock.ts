import { http, HttpResponse, delay } from 'msw';
import { API_BASE_URL } from '@core/config';
import type { Employee, EmployeeRole } from '@entities/employee';

const mockEmployees: Employee[] = [
  {
    id: 'emp-001-0000-0000-0000-000000000001',
    name: 'Diana Prince',
    email: 'diana@company.com',
    role: 'admin',
    isActive: true,
    createdAt: '2024-06-01T10:00:00.000Z',
    updatedAt: '2025-01-15T08:00:00.000Z',
  },
  {
    id: 'emp-002-0000-0000-0000-000000000002',
    name: 'Peter Parker',
    email: 'peter@company.com',
    role: 'manager',
    isActive: true,
    createdAt: '2024-09-01T10:00:00.000Z',
    updatedAt: '2024-09-01T10:00:00.000Z',
  },
  {
    id: 'emp-003-0000-0000-0000-000000000003',
    name: 'Clark Kent',
    email: 'clark@company.com',
    role: 'staff',
    isActive: false,
    createdAt: '2024-11-01T10:00:00.000Z',
    updatedAt: '2025-02-01T10:00:00.000Z',
  },
];

export const employeeHandlers = [
  http.get(`${API_BASE_URL}/employees`, async () => {
    await delay(600);
    return HttpResponse.json(mockEmployees);
  }),

  http.get(`${API_BASE_URL}/employees/:id`, async ({ params }) => {
    await delay(400);
    const item = mockEmployees.find((e) => e.id === params['id']);
    if (!item) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(item);
  }),

  http.post(`${API_BASE_URL}/employees`, async ({ request }) => {
    await delay(600);
    const body = await request.json() as Partial<Employee>;
    const now = new Date().toISOString();
    return HttpResponse.json<Employee>(
      {
        id: crypto.randomUUID(),
        name: body.name ?? 'New Employee',
        email: body.email ?? 'new@company.com',
        role: body.role ?? 'staff',
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      { status: 201 }
    );
  }),

  http.put(`${API_BASE_URL}/employees/:id`, async ({ params, request }) => {
    await delay(500);
    const body = await request.json() as Partial<Employee>;
    const existing = mockEmployees.find((e) => e.id === params['id']);
    if (!existing) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json({ ...existing, ...body, updatedAt: new Date().toISOString() });
  }),

  http.delete(`${API_BASE_URL}/employees/:id`, async () => {
    await delay(400);
    return new HttpResponse(null, { status: 204 });
  }),

  http.patch(`${API_BASE_URL}/employees/:id/role`, async ({ params, request }) => {
    await delay(400);
    const body = await request.json() as { role: EmployeeRole };
    const existing = mockEmployees.find((e) => e.id === params['id']);
    if (!existing) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json({ ...existing, role: body.role, updatedAt: new Date().toISOString() });
  }),
];
