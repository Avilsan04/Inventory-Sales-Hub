import { http, HttpResponse, delay } from 'msw';
import { API_BASE_URL } from '@core/config';
import { getTenantBucket, resolveTenant, requirePermission } from '@app/mock/mockUtils';
import type { EmployeeRole } from '@entities/employee';
import mockData from '@app/mock/mock-data.json';

const baseEmployees = [...mockData.employees];

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
    const item = employees.find((e) => String(e.id) === params['id']);
    if (!item) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(item);
  }),

  http.post(`${API_BASE_URL}/employees`, async ({ request }) => {
    await delay(600);
    const denied = requirePermission(request, 'create:employee');
    if (denied) return denied;
    const tenantId = resolveTenant(request);
    const employees = getTenantBucket(tenantId, 'employees', () => baseEmployees);
    const body = (await request.json()) as Record<string, unknown>;
    const now = new Date().toISOString();
    const newEmployee = {
      id: employees.length + 1,
      username:
        (body['username'] as string | undefined) ??
        (body['name'] as string | undefined) ??
        'Nuevo empleado',
      email: (body['email'] as string | undefined) ?? 'empleado@ish.dev',
      role: (body['role'] as string | undefined) ?? 'staff',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    employees.push(newEmployee);
    return HttpResponse.json(newEmployee, { status: 201 });
  }),

  http.put(`${API_BASE_URL}/employees/:id`, async ({ params, request }) => {
    await delay(500);
    const denied = requirePermission(request, 'create:employee');
    if (denied) return denied;
    const tenantId = resolveTenant(request);
    const employees = getTenantBucket(tenantId, 'employees', () => baseEmployees);
    const body = (await request.json()) as Record<string, unknown>;
    const idx = employees.findIndex((e) => String(e.id) === params['id']);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    const existing = employees[idx];
    if (existing === undefined) return new HttpResponse(null, { status: 404 });
    const updated = { ...existing, ...body, updatedAt: new Date().toISOString() };
    employees[idx] = updated;
    return HttpResponse.json(updated);
  }),

  http.delete(`${API_BASE_URL}/employees/:id`, async ({ params, request }) => {
    await delay(400);
    const denied = requirePermission(request, 'delete:employee');
    if (denied) return denied;
    const tenantId = resolveTenant(request);
    const employees = getTenantBucket(tenantId, 'employees', () => baseEmployees);
    const idx = employees.findIndex((e) => String(e.id) === params['id']);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    const existing = employees[idx];
    if (existing === undefined) return new HttpResponse(null, { status: 404 });
    employees[idx] = {
      ...existing,
      isActive: false,
      updatedAt: new Date().toISOString(),
    };
    return new HttpResponse(null, { status: 204 });
  }),

  http.patch(`${API_BASE_URL}/employees/:id/role`, async ({ params, request }) => {
    await delay(400);
    const denied = requirePermission(request, 'create:employee');
    if (denied) return denied;
    const tenantId = resolveTenant(request);
    const employees = getTenantBucket(tenantId, 'employees', () => baseEmployees);
    const body = (await request.json()) as { role: EmployeeRole };
    const idx = employees.findIndex((e) => String(e.id) === params['id']);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    const existing = employees[idx];
    if (existing === undefined) return new HttpResponse(null, { status: 404 });
    const updated = { ...existing, role: body.role, updatedAt: new Date().toISOString() };
    employees[idx] = updated;
    return HttpResponse.json(updated);
  }),
];
