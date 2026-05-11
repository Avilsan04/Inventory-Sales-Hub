import * as React from 'react';
import { parseCsvFile, type ParsedRow } from '@shared/lib/csvParser';
import { toast } from '@shared/hooks/useToast';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { Button } from '@shared/ui/primitives';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@shared/ui/composed';
import { useBatchCreateProducts } from '../hooks/useBatchCreateProducts';
import type { CreateProductDTO } from '@entities/product';

type Step = 'upload' | 'preview' | 'result';

interface ParsedProduct extends CreateProductDTO {
  _rowIndex: number;
  _error?: string;
}

function validateRow(row: ParsedRow, priceRaw: number): string | undefined {
  const errors: string[] = [];
  if (!row['name']) errors.push('name required');
  if (!row['sku'] || row['sku'].length < 3) errors.push('sku min 3 chars');
  if (isNaN(priceRaw) || priceRaw < 0) errors.push('invalid price');
  return errors.length > 0 ? errors.join(', ') : undefined;
}

function rowToDTO(row: ParsedRow, index: number): ParsedProduct {
  const priceRaw = parseFloat(row['price'] ?? row['purchasePrice'] ?? '0');
  const price = isNaN(priceRaw) ? 0 : priceRaw;
  const categoryRaw = row['categoryId'];
  return {
    name: row['name'] ?? '',
    sku: row['sku'] ?? '',
    purchasePrice: price,
    salePrice: price,
    description: row['description'] || undefined,
    categoryId: categoryRaw ? Number(categoryRaw) : undefined,
    _rowIndex: index,
    _error: validateRow(row, priceRaw),
  };
}

interface ProductCsvImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductCsvImportDialog({
  open,
  onOpenChange,
}: ProductCsvImportDialogProps): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const [step, setStep] = React.useState<Step>('upload');
  const [parsed, setParsed] = React.useState<ParsedProduct[]>([]);
  const [result, setResult] = React.useState<{ success: number; failed: number } | null>(null);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { create, isPending } = useBatchCreateProducts();

  const onClose = (): void => {
    setStep('upload');
    setParsed([]);
    setResult(null);
    onOpenChange(false);
  };

  const processFile = async (file: File): Promise<void> => {
    const { rows } = await parseCsvFile(file);
    const products = rows.map((r, i) => rowToDTO(r, i));
    setParsed(products);
    setStep('preview');
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (): void => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) void processFile(file);
  };

  const handleImport = async (): Promise<void> => {
    const valid = parsed.filter((p) => !p._error);
    const batchResult = await create(valid.map(({ _rowIndex: _r, _error: _e, ...dto }) => dto));
    setResult({ success: batchResult.successCount, failed: batchResult.failureCount });
    setStep('result');
    if (batchResult.successCount > 0) {
      toast({ title: `${batchResult.successCount} products imported` });
    }
  };

  const validCount = parsed.filter((p) => !p._error).length;
  const invalidCount = parsed.filter((p) => p._error).length;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent style={{ maxWidth: '700px' }}>
        <DialogHeader>
          <DialogTitle>{t('products.importFromCsv')}</DialogTitle>
        </DialogHeader>

        {step === 'upload' && (
          <div style={{ padding: '1.5rem' }}>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
              }}
              style={{
                border: `2px dashed ${isDragOver ? 'var(--color-primary)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-lg)',
                padding: '2.5rem 2rem',
                textAlign: 'center',
                cursor: 'pointer',
                background: isDragOver ? 'var(--color-muted)' : 'transparent',
                transition: 'border-color 0.15s ease, background 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  color: isDragOver ? 'var(--color-primary)' : 'var(--color-muted-foreground)',
                }}
                aria-hidden="true"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p style={{ fontWeight: 600, color: 'var(--color-foreground)', margin: 0 }}>
                {t('products.dropCsvHere')}
              </p>
              <p
                style={{ fontSize: '0.8125rem', color: 'var(--color-muted-foreground)', margin: 0 }}
              >
                {t('products.csvColumnsHint')}
              </p>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--color-primary)',
                  textDecoration: 'underline',
                  fontWeight: 500,
                }}
              >
                {t('products.orClickToSelect')}
              </span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => {
                void handleFile(e);
              }}
              style={{ display: 'none' }}
            />
          </div>
        )}

        {step === 'preview' && (
          <>
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--color-muted-foreground)',
                padding: '0.5rem 0',
              }}
            >
              {t('products.csvPreviewSummary', { valid: validCount, invalid: invalidCount })}
            </p>
            <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>{t('products.name')}</TableHead>
                    <TableHead>{t('inventory.sku')}</TableHead>
                    <TableHead>{t('inventory.price')}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsed.map((p) => (
                    <TableRow
                      key={p._rowIndex}
                      style={
                        p._error
                          ? { background: 'var(--color-destructive-muted, #fee2e2)' }
                          : undefined
                      }
                    >
                      <TableCell>{p._rowIndex + 1}</TableCell>
                      <TableCell>{p.name}</TableCell>
                      <TableCell>{p.sku}</TableCell>
                      <TableCell>{p.purchasePrice.toFixed(2)}</TableCell>
                      <TableCell
                        style={{
                          color: p._error ? 'var(--color-destructive)' : 'var(--color-success)',
                        }}
                      >
                        {p._error ?? '✓'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        {step === 'result' && result && (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>{t('products.importComplete')}</p>
            <p style={{ color: 'var(--color-muted-foreground)', marginTop: '0.5rem' }}>
              {t('products.importResultSummary', {
                success: result.success,
                failed: result.failed,
              })}
            </p>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {step === 'result' ? t('common.close') : t('common.cancel')}
          </Button>
          {step === 'preview' && (
            <Button
              type="button"
              onClick={() => {
                void handleImport();
              }}
              disabled={isPending || validCount === 0}
            >
              {isPending
                ? t('products.importing')
                : t('products.importCount', { count: validCount })}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
