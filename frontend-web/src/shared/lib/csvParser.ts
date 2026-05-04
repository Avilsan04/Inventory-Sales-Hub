import Papa from 'papaparse';

export interface ParsedRow {
  [key: string]: string;
}

export interface CsvParseResult {
  headers: string[];
  rows: ParsedRow[];
}

export function parseCsvText(text: string): CsvParseResult {
  const result = Papa.parse<ParsedRow>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });
  return {
    headers: result.meta.fields ?? [],
    rows: result.data,
  };
}

export async function parseCsvFile(file: File): Promise<CsvParseResult> {
  const text = await file.text();
  return parseCsvText(text);
}
