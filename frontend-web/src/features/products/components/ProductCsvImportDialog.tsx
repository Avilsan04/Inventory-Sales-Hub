import * as React from 'react';
import { parseCsvFile, type ParsedRow } from '@shared/lib/csvParser';
import { toCents } from '@shared/lib/formatCurrency';
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

function rowToDTO(row: ParsedRow, index: number): ParsedProduct {
  const priceRaw = parseFloat(row['price'] ?? '0');
  const errors: string[] = [];
  if (!row['name']) errors.push('name required');
  if (!row['sku'] || row['sku'].length < 3) errors.push('sku min 3 chars');
  if (isNaN(priceRaw) || priceRaw < 0) errors.push('invalid price');
  return {
    name: row['name'] ?? '',
    sku: row['sku'] ?? '',
    price: toCents(isNaN(priceRaw) ? 0 : priceRaw),
    currency: row['currency'] || 'EUR',
    description: row['description'] || undefined,
    categoryId: row['categoryId'] || undefined,
    uom: ((): CreateProductDTO['uom'] => {
      const v = row['uom'];
      return v && ['unit', 'kg', 'litre', 'box', 'pack'].includes(v)
        ? (v as CreateProductDTO['uom'])
        : 'unit';
    })(),
    _rowIndex: index,
    _error: errors.length > 0 ? errors.join(', ') : undefined,
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
  const { create, isPending } = useBatchCreateProducts();

  const onClose = (): void => {
    setStep('upload');
    setParsed([]);
    setResult(null);
    onOpenChange(false);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { rows } = await parseCsvFile(file);
    const products = rows.map((r, i) => rowToDTO(r, i));
    setParsed(products);
    setStep('preview');
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
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p
              style={{
                marginBottom: '1rem',
                color: 'var(--color-muted-foreground)',
                fontSize: '0.875rem',
              }}
            >
              {t('products.csvColumnsHint')}
            </p>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => {
                void handleFile(e);
              }}
              style={{ display: 'block', margin: '0 auto' }}
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
                      <TableCell>{(p.price / 100).toFixed(2)}</TableCell>
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
