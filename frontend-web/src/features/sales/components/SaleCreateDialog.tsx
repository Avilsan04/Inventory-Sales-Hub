import * as React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateSale } from '@features/sales';
import type { Customer } from '@entities/customer';
import type { Product } from '@entities/product';
import { toast } from '@shared/hooks/useToast';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@shared/ui/composed';
import { Button } from '@shared/ui/primitives';
import { toCents } from '@shared/lib/formatCurrency';
import { calculateSaleTotals } from '../lib/saleCalculations';
import { checkoutSchema, STEP_FIELDS } from '../lib/checkout.schemas';
import type { FormValues } from '../lib/checkout.schemas';
import { SaleCheckoutStepper } from './checkout/SaleCheckoutStepper';
import { SaleCheckoutStep0 } from './checkout/SaleCheckoutStep0';
import { SaleCheckoutStep1 } from './checkout/SaleCheckoutStep1';
import { SaleCheckoutStep2 } from './checkout/SaleCheckoutStep2';
import { SaleCheckoutStep3 } from './checkout/SaleCheckoutStep3';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customers: Customer[];
  products: Product[];
}

export function SaleCreateDialog({
  open,
  onOpenChange,
  customers,
  products,
}: Props): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { mutate, isPending } = useCreateSale();
  const [step, setStep] = React.useState(0);

  const methods = useForm<FormValues>({
    mode: 'onTouched',
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      currency: 'EUR',
      items: [{ productId: '', quantity: 1, unitPrice: 0 }],
      discountPercent: 0,
      taxPercent: 0,
      paymentMethod: 'credit_card',
    },
  });

  const { handleSubmit, reset, watch, trigger } = methods;
  const watchedItems = watch('items');
  const watchedDiscount = watch('discountPercent');
  const watchedTax = watch('taxPercent');

  const saleTotals = React.useMemo(
    () =>
      calculateSaleTotals({
        items: watchedItems.map((it) => ({
          unitPrice: toCents(it.unitPrice),
          quantity: it.quantity,
        })),
        discountPercent: watchedDiscount,
        taxPercent: watchedTax,
      }),
    [watchedItems, watchedDiscount, watchedTax]
  );

  const onClose = (): void => {
    reset();
    setStep(0);
    onOpenChange(false);
  };

  const handleNext = async (): Promise<void> => {
    const stepFields = STEP_FIELDS[step] ?? [];
    const ok = await trigger(stepFields as Parameters<typeof trigger>[0]);
    if (ok) setStep((s) => s + 1);
  };

  const onSubmit = (data: FormValues): void => {
    mutate(
      {
        customerId: data.customerId?.trim() !== '' ? data.customerId : undefined,
        items: data.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: toCents(item.unitPrice),
        })),
        currency: data.currency,
        discountPercent: data.discountPercent,
        taxPercent: data.taxPercent,
        shippingDetails: {
          address: data.address,
          contactName: data.contactName,
          contactPhone: data.contactPhone,
          notes: data.notes,
        },
        paymentMethod: data.paymentMethod,
      },
      {
        onSuccess: () => {
          toast({
            title: t('sales.checkout.orderPlaced'),
            description: t('sales.checkout.orderPlacedDesc'),
          });
          onClose();
        },
        onError: (err) => {
          toast({
            title: 'Failed to create order',
            description: err.message,
            variant: 'destructive',
          });
        },
      }
    );
  };

  const sharedProps = { customers, products, saleTotals };

  const STEP_COMPONENTS = [
    <SaleCheckoutStep0 key="step0" {...sharedProps} />,
    <SaleCheckoutStep1 key="step1" />,
    <SaleCheckoutStep2 key="step2" />,
    <SaleCheckoutStep3 key="step3" {...sharedProps} />,
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('sales.checkout.title')}</DialogTitle>
        </DialogHeader>

        <FormProvider {...methods}>
          <SaleCheckoutStepper current={step} translate={t} />

          {STEP_COMPONENTS[step]}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              {t('common.cancel')}
            </Button>

            {step > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setStep((s) => s - 1);
                }}
              >
                {t('sales.checkout.back')}
              </Button>
            )}

            {step < 3 && (
              <Button
                type="button"
                onClick={() => {
                  void handleNext();
                }}
              >
                {t('sales.checkout.next')}
              </Button>
            )}

            {step === 3 && (
              <Button
                type="button"
                disabled={isPending}
                onClick={() => {
                  void handleSubmit(onSubmit)();
                }}
              >
                {isPending ? t('sales.checkout.creating') : t('sales.checkout.placeOrder')}
              </Button>
            )}
          </DialogFooter>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
