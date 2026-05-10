import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useOpenCashSession } from '../hooks/useOpenCashSession';
import { toast } from '@shared/hooks/useToast';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { Button, Input, Label } from '@shared/ui/primitives';
import styles from '@shared/styles/themes/components/DialogForm.module.scss';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@shared/ui/composed';
import { toCents } from '@shared/lib/formatCurrency';

const formSchema = z.object({
  openingBalance: z.number().min(0, 'Must be 0 or more'),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

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
          toast({ title: 'Cash session opened' });
          reset();
          onOpenChange(false);
          onSuccess?.();
        },
        onError: (err) => {
          toast({
            title: 'Failed to open session',
            description: err.message,
            variant: 'destructive',
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ maxWidth: '400px' }}>
        <DialogHeader>
          <DialogTitle>{t('pos.openCashSession')}</DialogTitle>
          <DialogDescription>{t('pos.openingBalanceHint')}</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            void handleSubmit(onSubmit)(e);
          }}
        >
          <div className={styles['body']}>
            <div>
              <Label htmlFor="openingBalance">{t('pos.openingBalance')}</Label>
              <Input
                id="openingBalance"
                type="number"
                step="0.01"
                min="0"
                style={{ marginTop: '0.375rem' }}
                {...register('openingBalance', { valueAsNumber: true })}
              />
              {errors.openingBalance && (
                <p
                  style={{
                    color: 'var(--color-destructive)',
                    fontSize: '0.75rem',
                    marginTop: '0.25rem',
                  }}
                >
                  {errors.openingBalance.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="openNotes">{t('pos.notesOptional')}</Label>
              <Input id="openNotes" style={{ marginTop: '0.375rem' }} {...register('notes')} />
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
