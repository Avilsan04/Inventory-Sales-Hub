import { http, HttpResponse, delay } from 'msw';
import { API_BASE_URL } from '@core/config';
import type { CashSession, OpenCashSessionDTO, CloseCashSessionDTO } from '@entities/cash-session';

let currentSession: CashSession | null = null;

function computeExpectedBalance(openedAt: string): number {
  // In real system, sum cash sales since openedAt. Here: static 0 as placeholder.
  void openedAt;
  return 0;
}

export const cashSessionHandlers = [
  http.get(`${API_BASE_URL}/cash-sessions/current`, async () => {
    await delay(150);
    if (!currentSession) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(currentSession);
  }),

  http.post(`${API_BASE_URL}/cash-sessions/open`, async ({ request }) => {
    await delay(200);
    if (currentSession?.status === 'open') {
      return new HttpResponse(JSON.stringify({ message: 'Session already open' }), { status: 409 });
    }
    const dto = (await request.json()) as OpenCashSessionDTO;
    currentSession = {
      id: crypto.randomUUID(),
      employeeId: 'emp-001',
      employeeName: 'Staff User',
      openingBalance: dto.openingBalance,
      status: 'open',
      openedAt: new Date().toISOString(),
      notes: dto.notes,
    };
    return HttpResponse.json(currentSession, { status: 201 });
  }),

  http.post(`${API_BASE_URL}/cash-sessions/:id/close`, async ({ params, request }) => {
    await delay(200);
    if (!currentSession || currentSession.id !== params['id']) {
      return new HttpResponse(null, { status: 404 });
    }
    const dto = (await request.json()) as CloseCashSessionDTO;
    const expected = computeExpectedBalance(currentSession.openedAt);
    currentSession = {
      ...currentSession,
      closingBalance: dto.closingBalance,
      expectedBalance: expected,
      difference: dto.closingBalance - expected,
      status: 'closed',
      closedAt: new Date().toISOString(),
      notes: dto.notes ?? currentSession.notes,
    };
    const closed = currentSession;
    currentSession = null;
    return HttpResponse.json(closed);
  }),
];
