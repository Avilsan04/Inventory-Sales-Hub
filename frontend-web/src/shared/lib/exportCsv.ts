export function exportToCsv(data: Record<string, unknown>[], filename: string): void {
  if (data.length === 0) return;
  const first = data[0];
  if (first === undefined) return;
  const headers = Object.keys(first);

  const escape = (v: unknown): string => {
    if (v === null || v === undefined) return '';
    if (typeof v === 'object') return JSON.stringify(v);
    if (typeof v === 'symbol' || typeof v === 'function') return '';
    // v is narrowed to string | number | boolean | bigint — all safe for String()
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    const s = String(v);
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };

  const rows = data.map((row) => headers.map((h) => escape(row[h])).join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
