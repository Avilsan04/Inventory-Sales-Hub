import { http, HttpResponse, delay } from 'msw';
import { API_BASE_URL } from '@core/config';
import type { Employee, EmployeeRole } from '@entities/employee';
import mockData from '@app/mock/mock-data.json';

const mockEmployees: Employee[] = [...mockData.employees] as Employee[];

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
            name: body.name ?? 'Nuevo empleado',
            email: body.email ?? 'empleado@ish.dev',
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
        const existing = mockEmployees[idx];
        if (existing === undefined) return new HttpResponse(null, { status: 404 });
        const updated = { ...existing, role: body.role, updatedAt: new Date().toISOString() };
        mockEmployees[idx] = updated;
        return HttpResponse.json(updated);
    }),
];
