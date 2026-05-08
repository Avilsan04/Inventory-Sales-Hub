import { http, HttpResponse, delay } from 'msw';
import { API_BASE_URL } from '@core/config';
import { getTenantBucket, resolveTenant, requirePermission } from '@app/mock/mockUtils';
import type { Employee, EmployeeRole } from '@entities/employee';
import mockData from '@app/mock/mock-data.json';

const baseEmployees: Employee[] = [...mockData.employees] as Employee[];

export const employeeHandlers = [
  http.get(`${API_BASE_URL}/employees`, async ({ request }) => {
    await delay(600);
    const denied = requirePermission(request, 'view:employees');
    if (denied) return denied;
    const tenantId = resolveTenant(request);
    const employees = getTenantBucket(tenantId, 'employees', () => baseEmployees);
    return HttpResponse.json(employees);
  }),

  http.get(`${API_BASE_URL}/employees/:id`, async ({ params, request }) => {
    await delay(400);
    const denied = requirePermission(request, 'view:employees');
    if (denied) return denied;
    const tenantId = resolveTenant(request);
    const employees = getTenantBucket(tenantId, 'employees', () => baseEmployees);
    const item = employees.find((e) => e.id === params['id']);
    if (!item) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(item);
  }),

  http.post(`${API_BASE_URL}/employees`, async ({ request }) => {
    await delay(600);
    const denied = requirePermission(request, 'create:employee');
    if (denied) return denied;
    const tenantId = resolveTenant(request);
    const employees = getTenantBucket(tenantId, 'employees', () => baseEmployees);
    const body = (await request.json()) as Partial<Employee>;
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
    employees.push(newEmployee);
    return HttpResponse.json<Employee>(newEmployee, { status: 201 });
  }),

  http.put(`${API_BASE_URL}/employees/:id`, async ({ params, request }) => {
    await delay(500);
    const denied = requirePermission(request, 'create:employee');
    if (denied) return denied;
    const tenantId = resolveTenant(request);
    const employees = getTenantBucket(tenantId, 'employees', () => baseEmployees);
    const body = (await request.json()) as Partial<Employee>;
    const idx = employees.findIndex((e) => e.id === params['id']);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    const existing = employees[idx];
    if (existing === undefined) return new HttpResponse(null, { status: 404 });
    const updated = { ...existing, ...body, updatedAt: new Date().toISOString() };
    employees[idx] = updated;
    return HttpResponse.json(updated);
  }),

  http.delete(`${API_BASE_URL}/employees/:id`, async ({ params, request }) => {
    await delay(400);
    const denied = requirePermission(request, 'create:employee');
    if (denied) return denied;
    const tenantId = resolveTenant(request);
    const employees = getTenantBucket(tenantId, 'employees', () => baseEmployees);
    const idx = employees.findIndex((e) => e.id === params['id']);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    const existing = employees[idx];
    if (existing === undefined) return new HttpResponse(null, { status: 404 });
    employees[idx] = { ...existing, isActive: false, updatedAt: new Date().toISOString() };
    return new HttpResponse(null, { status: 204 });
  }),

  http.patch(`${API_BASE_URL}/employees/:id/role`, async ({ params, request }) => {
    await delay(400);
    const denied = requirePermission(request, 'create:employee');
    if (denied) return denied;
    const tenantId = resolveTenant(request);
    const employees = getTenantBucket(tenantId, 'employees', () => baseEmployees);
    const body = (await request.json()) as { role: EmployeeRole };
    const idx = employees.findIndex((e) => e.id === params['id']);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    const existing = employees[idx];
    if (existing === undefined) return new HttpResponse(null, { status: 404 });
    const updated = { ...existing, role: body.role, updatedAt: new Date().toISOString() };
    employees[idx] = updated;
    return HttpResponse.json(updated);
  }),
];
