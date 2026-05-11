export function isStaleSession(openedAt: string): boolean {
  return new Date(openedAt).toDateString() !== new Date().toDateString();
}
