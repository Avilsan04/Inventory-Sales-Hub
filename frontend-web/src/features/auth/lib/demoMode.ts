const DEMO_SESSION_FLAG = 'ish.demo';
const MOCK_SESSION_KEY = 'mock-session-user'; // must match STORAGE_SESSION_KEY in auth.mock.ts

export function activateDemoMode(): void {
  localStorage.setItem(MOCK_SESSION_KEY, 'test');
  sessionStorage.setItem(DEMO_SESSION_FLAG, 'true');
  window.location.href = '/dashboard';
}

export function deactivateDemoMode(): void {
  sessionStorage.removeItem(DEMO_SESSION_FLAG);
}

export function isDemoActive(): boolean {
  return sessionStorage.getItem(DEMO_SESSION_FLAG) === 'true';
}
