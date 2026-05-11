export function formatOrderId(id: string): string {
  return id.startsWith('ORD-') ? `#${id}` : `#${id.slice(0, 8).toUpperCase()}`;
}
