import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCloseCashSession } from '@features/sales/hooks/useCloseCashSession';
import { toast } from '@shared/hooks/useToast';
import { formatCurrency, fromCents, toCents } from '@shared/lib/formatCurrency';
import { Button, Input, Label } from '@shared/ui/primitives';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@shared/ui/composed';
import type { CashSession } from '@entities/cash-session';

const formSchema = z.object({
  closingBalance: z.number().min(0, 'Must be 0 or more'),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CloseCashSessionDialogProps {
  session: CashSession;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CloseCashSessionDialog({
  session,
  open,
  onOpenChange,
  onSuccess,
}: CloseCashSessionDialogProps): React.ReactElement {
  const { mutate: closeSession, isPending } = useCloseCashSession(session.id);

  const {
    register,
    watch,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { closingBalance: fromCents(session.openingBalance) },
  });

  const closingBalanceEuros = watch('closingBalance');
  const expectedEuros = fromCents(session.expectedBalance ?? 0);
  const difference = closingBalanceEuros - expectedEuros;

  const onSubmit = (values: FormValues): void => {
    closeSession(
      { closingBalance: toCents(values.closingBalance), notes: values.notes },
      {
        onSuccess: () => {
          toast({ title: 'Cash session closed' });
          reset();
          onOpenChange(false);
          onSuccess?.();
        },
        onError: (err) => {
          toast({
            title: 'Failed to close session',
            description: err.message,
            variant: 'destructive',
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ maxWidth: '420px' }}>
        <DialogHeader>
          <DialogTitle>Close Cash Session</DialogTitle>
          <DialogDescription>
            Opened at{' '}
            {new Date(session.openedAt).toLocaleString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })}
            . Opening balance: {formatCurrency(session.openingBalance, 'EUR')}.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            void handleSubmit(onSubmit)(e);
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem 0' }}>
            <div>
              <Label htmlFor="closingBalance">Closing balance (€)</Label>
              <Input
                id="closingBalance"
                type="number"
                step="0.01"
                min="0"
                style={{ marginTop: '0.375rem' }}
                {...register('closingBalance', { valueAsNumber: true })}
              />
              {errors.closingBalance && (
                <p
                  style={{
                    color: 'var(--color-destructive)',
                    fontSize: '0.75rem',
                    marginTop: '0.25rem',
                  }}
                >
                  {errors.closingBalance.message}
                </p>
              )}
            </div>

            <div
              style={{
                background: 'var(--color-muted)',
                borderRadius: '0.375rem',
                padding: '0.75rem',
                fontSize: '0.875rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.25rem',
                }}
              >
                <span>Expected</span>
                <span style={{ fontFamily: 'monospace' }}>
                  {formatCurrency(toCents(expectedEuros), 'EUR')}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 600,
                  color:
                    difference < 0
                      ? 'var(--color-destructive)'
                      : difference > 0
                        ? 'var(--color-success)'
                        : undefined,
                }}
              >
                <span>Difference</span>
                <span style={{ fontFamily: 'monospace' }}>
                  {difference >= 0 ? '+' : ''}
                  {formatCurrency(toCents(Math.abs(difference)), 'EUR')}
                </span>
              </div>
            </div>

            <div>
              <Label htmlFor="closeNotes">Notes (optional)</Label>
              <Input id="closeNotes" style={{ marginTop: '0.375rem' }} {...register('notes')} />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending ? 'Closing…' : 'Close session'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
