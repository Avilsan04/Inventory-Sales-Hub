import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCloseCashSession } from '../hooks/useCloseCashSession';
import { toast } from '@shared/hooks/useToast';
import { formatCurrency, fromCents, toCents } from '@shared/lib/formatCurrency';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { Button, Input, Label } from '@shared/ui/primitives';
import { cn } from '@shared/lib/cn';
import styles from '@shared/styles/themes/components/DialogForm.module.scss';
import localStyles from './CloseCashSessionDialog.module.scss';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@shared/ui/composed';
import type { CashSession } from '@entities/cash-session';

type FormValues = {
  closingBalance: number;
  notes?: string;
};

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
  const { translate: t } = useTranslationAdapter();

  const formSchema = React.useMemo(
    () =>
      z.object({
        closingBalance: z.number().min(0, 'Must be 0 or more'),
        notes: z.string().optional(),
      }),
    []
  );

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
          toast({ title: t('sales.toasts.cashSessionClosed') });
          reset();
          onOpenChange(false);
          onSuccess?.();
        },
        onError: (err) => {
          toast({
            title: t('sales.toasts.closeFailed'),
            description: err.message,
            variant: 'destructive',
          });
        },
      }
    );
  };

  const openedAt = new Date(session.openedAt).toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={localStyles['dialogNarrow']}>
        <DialogHeader>
          <DialogTitle>{t('pos.closeCashSession')}</DialogTitle>
          <DialogDescription>
            {t('pos.sessionOpenedAtDesc', {
              date: openedAt,
              amount: formatCurrency(session.openingBalance, 'EUR'),
            })}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            void handleSubmit(onSubmit)(e);
          }}
        >
          <div className={styles['body']}>
            <div>
              <Label htmlFor="closingBalance">{t('pos.closingBalance')}</Label>
              <Input
                id="closingBalance"
                type="number"
                step="0.01"
                min="0"
                className={localStyles['inputOffset']}
                {...register('closingBalance', { valueAsNumber: true })}
              />
              {errors.closingBalance && (
                <p className={localStyles['fieldError']}>{errors.closingBalance.message}</p>
              )}
            </div>

            <div className={localStyles['summaryBox']}>
              <div className={localStyles['summaryRowCompact']}>
                <span>{t('pos.expected')}</span>
                <span className={localStyles['monoText']}>
                  {formatCurrency(toCents(expectedEuros), 'EUR')}
                </span>
              </div>
              <div
                className={cn(
                  localStyles['differenceRow'],
                  difference < 0 && localStyles['textDestructive'],
                  difference > 0 && localStyles['textSuccess']
                )}
              >
                <span>{t('pos.difference')}</span>
                <span className={localStyles['monoText']}>
                  {difference >= 0 ? '+' : ''}
                  {formatCurrency(toCents(Math.abs(difference)), 'EUR')}
                </span>
              </div>
            </div>

            <div>
              <Label htmlFor="closeNotes">{t('pos.notesOptional')}</Label>
              <Input
                id="closeNotes"
                className={localStyles['inputOffset']}
                {...register('notes')}
              />
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
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending ? t('pos.closing') : t('pos.closeSession')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
