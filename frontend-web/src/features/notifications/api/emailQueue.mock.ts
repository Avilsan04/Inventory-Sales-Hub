import { http, HttpResponse } from 'msw';
import { API_BASE_URL } from '@core/config';

interface EmailQueueEntry {
  type: string;
  itemId: string;
  itemName: string;
  quantity: number;
  status: string;
  queuedAt: string;
}

const emailQueue: EmailQueueEntry[] = [];

export const emailQueueHandlers = [
  http.post(`${API_BASE_URL}/notifications/email-queue`, async ({ request }) => {
    const body = (await request.json()) as Omit<EmailQueueEntry, 'queuedAt'>;
    const entry: EmailQueueEntry = { ...body, queuedAt: new Date().toISOString() };
    emailQueue.push(entry);
    console.info('[EmailQueue] Queued alert:', entry);
    return HttpResponse.json({ queued: true });
  }),
];
