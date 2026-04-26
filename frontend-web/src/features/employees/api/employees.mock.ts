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
        updatedAt: '2025-02-10T09:00:00.000Z',
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
    {
        id: 'emp-004-0000-0000-0000-000000000004',
        name: 'Bruce Wayne',
        email: 'bruce@company.com',
        role: 'admin',
        isActive: true,
        createdAt: '2024-05-15T10:00:00.000Z',
        updatedAt: '2025-03-05T11:00:00.000Z',
    },
    {
        id: 'emp-005-0000-0000-0000-000000000005',
        name: 'Tony Stark',
        email: 'tony@company.com',
        role: 'manager',
        isActive: true,
        createdAt: '2024-07-01T10:00:00.000Z',
        updatedAt: '2025-01-20T14:00:00.000Z',
    },
    {
        id: 'emp-006-0000-0000-0000-000000000006',
        name: 'Natasha Romanoff',
        email: 'natasha@company.com',
        role: 'staff',
        isActive: true,
        createdAt: '2024-08-15T10:00:00.000Z',
        updatedAt: '2025-02-25T10:00:00.000Z',
    },
    {
        id: 'emp-007-0000-0000-0000-000000000007',
        name: 'Steve Rogers',
        email: 'steve@company.com',
        role: 'manager',
        isActive: true,
        createdAt: '2024-06-20T10:00:00.000Z',
        updatedAt: '2025-03-10T09:00:00.000Z',
    },
    {
        id: 'emp-008-0000-0000-0000-000000000008',
        name: 'Sam Wilson',
        email: 'sam@company.com',
        role: 'staff',
        isActive: true,
        createdAt: '2024-10-01T10:00:00.000Z',
        updatedAt: '2025-01-28T11:00:00.000Z',
    },
    {
        id: 'emp-009-0000-0000-0000-000000000009',
        name: 'Wanda Maximoff',
        email: 'wanda@company.com',
        role: 'staff',
        isActive: false,
        createdAt: '2024-12-01T10:00:00.000Z',
        updatedAt: '2025-03-15T10:00:00.000Z',
    },
    {
        id: 'emp-010-0000-0000-0000-000000000010',
        name: 'Scott Lang',
        email: 'scott@company.com',
        role: 'staff',
        isActive: true,
        createdAt: '2025-01-10T10:00:00.000Z',
        updatedAt: '2025-02-20T12:00:00.000Z',
    },
    {
        id: 'emp-011-0000-0000-0000-000000000011',
        name: 'Pepper Potts',
        email: 'pepper@company.com',
        role: 'manager',
        isActive: true,
        createdAt: '2024-07-15T10:00:00.000Z',
        updatedAt: '2025-04-01T09:00:00.000Z',
    },
    {
        id: 'emp-012-0000-0000-0000-000000000012',
        name: 'Nick Fury',
        email: 'nick@company.com',
        role: 'admin',
        isActive: true,
        createdAt: '2024-04-01T10:00:00.000Z',
        updatedAt: '2025-03-20T15:00:00.000Z',
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
        const newEmployee: Employee = {
            id: crypto.randomUUID(),
            name: body.name ?? 'New Employee',
            email: body.email ?? 'new@company.com',
            role: body.role ?? 'staff',
            isActive: true,
            createdAt: now,
            updatedAt: now,
        };
        mockEmployees.push(newEmployee);
        return HttpResponse.json<Employee>(newEmployee, { status: 201 });
    }),

    http.put(`${API_BASE_URL}/employees/:id`, async ({ params, request }) => {
        await delay(500);
        const body = await request.json() as Partial<Employee>;
        const idx = mockEmployees.findIndex((e) => e.id === params['id']);
        if (idx === -1) return new HttpResponse(null, { status: 404 });
        const existing = mockEmployees[idx];
        if (existing === undefined) return new HttpResponse(null, { status: 404 });
        const updated = { ...existing, ...body, updatedAt: new Date().toISOString() };
        mockEmployees[idx] = updated;
        return HttpResponse.json(updated);
    }),

    http.delete(`${API_BASE_URL}/employees/:id`, async () => {
        await delay(400);
        return new HttpResponse(null, { status: 204 });
    }),

    http.patch(`${API_BASE_URL}/employees/:id/role`, async ({ params, request }) => {
        await delay(400);
        const body = await request.json() as { role: EmployeeRole };
        const idx = mockEmployees.findIndex((e) => e.id === params['id']);
        if (idx === -1) return new HttpResponse(null, { status: 404 });
        const existingEmp = mockEmployees[idx];
        if (existingEmp === undefined) return new HttpResponse(null, { status: 404 });
        const updated = { ...existingEmp, role: body.role, updatedAt: new Date().toISOString() };
        mockEmployees[idx] = updated;
        return HttpResponse.json(updated);
    }),
];
