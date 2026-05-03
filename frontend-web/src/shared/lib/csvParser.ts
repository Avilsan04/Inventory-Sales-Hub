export interface ParsedRow {
  [key: string]: string;
}

export interface CsvParseResult {
  headers: string[];
  rows: ParsedRow[];
}

export function parseCsvText(text: string): CsvParseResult {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0]?.split(',').map((h) => h.trim().replace(/^"|"$/g, '')) ?? [];
  const rows: ParsedRow[] = lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
    const row: ParsedRow = {};
    headers.forEach((h, i) => {
      row[h] = values[i] ?? '';
    });
    return row;
  });
  return { headers, rows };
}

export async function parseCsvFile(file: File): Promise<CsvParseResult> {
  const text = await file.text();
  return parseCsvText(text);
}
