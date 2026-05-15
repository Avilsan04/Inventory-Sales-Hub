import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useOpenCashSession } from '../hooks/useOpenCashSession';
import { toast } from '@shared/hooks/useToast';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { Button, Input, Label } from '@shared/ui/primitives';
import dialogStyles from '@shared/styles/themes/components/DialogForm.module.scss';
import styles from './OpenCashSessionDialog.module.scss';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@shared/ui/composed';
import { toCents } from '@shared/lib/formatCurrency';

type FormValues = { openingBalance: number; notes?: string };

interface OpenCashSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function OpenCashSessionDialog({
  open,
  onOpenChange,
  onSuccess,
}: OpenCashSessionDialogProps): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { mutate: openSession, isPending } = useOpenCashSession();

  const formSchema = React.useMemo(
    () =>
      z.object({
        openingBalance: z.number().min(0, t('validation.minZero')),
        notes: z.string().optional(),
      }),
    [t]
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { openingBalance: 0 },
  });

  const onSubmit = (values: FormValues): void => {
    openSession(
      { openingBalance: toCents(values.openingBalance), notes: values.notes },
      {
        onSuccess: () => {
          toast({ title: t('sales.toasts.cashSessionOpened') });
          reset();
          onOpenChange(false);
          onSuccess?.();
        },
        onError: (err) => {
          toast({
            title: t('sales.toasts.openFailed'),
            description: err.message,
            variant: 'destructive',
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={styles['dialogNarrow']}>
        <DialogHeader>
          <DialogTitle>{t('pos.openCashSession')}</DialogTitle>
          <DialogDescription>{t('pos.openingBalanceHint')}</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            void handleSubmit(onSubmit)(e);
          }}
        >
          <div className={dialogStyles['body']}>
            <div>
              <Label htmlFor="openingBalance">{t('pos.openingBalance')}</Label>
              <Input
                id="openingBalance"
                type="number"
                step="0.01"
                min="0"
                className={styles['inputOffset']}
                {...register('openingBalance', { valueAsNumber: true })}
              />
              {errors.openingBalance && (
                <p className={styles['fieldError']}>{errors.openingBalance.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="openNotes">{t('pos.notesOptional')}</Label>
              <Input id="openNotes" className={styles['inputOffset']} {...register('notes')} />
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
            <Button type="submit" disabled={isPending}>
              {isPending ? t('pos.opening') : t('pos.openSession')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
