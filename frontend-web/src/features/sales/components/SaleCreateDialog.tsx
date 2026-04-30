import * as React from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckIcon } from 'lucide-react';
import { PlusIcon, TrashIcon } from 'lucide-react';
import { useCreateSale } from '@features/sales';
import { useCustomers } from '@features/customers';
import { useProducts } from '@features/products';
import { toast } from '@shared/hooks/useToast';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  FormField,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@shared/ui/composed';
import { Button, Input, Textarea, Label } from '@shared/ui/primitives';
import { cn } from '@shared/lib/cn';
import { MOCK_BANK_IBAN, type PaymentMethod } from '../models/checkout.types';
import styles from '@shared/styles/themes/components/DialogForm.module.scss';

// ── Validation helpers ───────────────────────────────────────────────────────

function luhnCheck(raw: string): boolean {
  const digits = raw.replace(/\s/g, '');
  if (!/^\d{16}$/.test(digits)) return false;
  let sum = 0;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits.charAt(i), 10);
    if ((digits.length - i) % 2 === 0) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

function isExpiryValid(expiry: string): boolean {
  const m = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(expiry);
  if (!m) return false;
  const [, monthStr, yearStr] = m;
  if (!monthStr || !yearStr) return false;
  const exp = new Date(2000 + parseInt(yearStr, 10), parseInt(monthStr, 10) - 1 + 1, 1);
  return exp > new Date();
}

// ── Zod schemas ───────────────────────────────────────────────────────────────

const itemSchema = z.object({
  productId: z.string().min(1, 'Select a product'),
  quantity: z.number().int('Must be integer').min(1, 'Min 1'),
  unitPrice: z.number().nonnegative('Must be ≥ 0'),
});

const checkoutSchema = z
  .object({
    customerId: z.string().optional(),
    currency: z.string().length(3, 'Must be 3 characters'),
    items: z.array(itemSchema).min(1, 'Add at least one item'),
    address: z.string().min(5, 'Minimum 5 characters'),
    contactName: z.string().min(1, 'Required'),
    contactPhone: z.string().min(6, 'Minimum 6 characters'),
    notes: z.string().optional(),
    paymentMethod: z.enum(['credit_card', 'bank_transfer', 'cash_on_delivery']),
    holderName: z.string().optional(),
    cardNumber: z.string().optional(),
    expiry: z.string().optional(),
    cvv: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.paymentMethod !== 'credit_card') return;
    if (!data.holderName?.trim())
      ctx.addIssue({ code: 'custom', path: ['holderName'], message: 'Required' });
    if (!luhnCheck(data.cardNumber ?? ''))
      ctx.addIssue({ code: 'custom', path: ['cardNumber'], message: 'Invalid card number' });
    if (!isExpiryValid(data.expiry ?? ''))
      ctx.addIssue({
        code: 'custom',
        path: ['expiry'],
        message: 'Invalid or expired date (MM/YY)',
      });
    if (!/^\d{3,4}$/.test(data.cvv ?? ''))
      ctx.addIssue({ code: 'custom', path: ['cvv'], message: 'Must be 3-4 digits' });
  });

type FormValues = z.infer<typeof checkoutSchema>;

// ── Step field maps ───────────────────────────────────────────────────────────

type FieldPath =
  | keyof FormValues
  | `items.${number}.productId`
  | `items.${number}.quantity`
  | `items.${number}.unitPrice`;

const STEP_FIELDS: Record<number, FieldPath[]> = {
  0: ['customerId', 'currency', 'items'],
  1: ['address', 'contactName', 'contactPhone'],
  2: ['paymentMethod', 'holderName', 'cardNumber', 'expiry', 'cvv'],
};

const STEPS = [
  'sales.checkout.stepItems',
  'sales.checkout.stepShipping',
  'sales.checkout.stepPayment',
  'sales.checkout.stepConfirm',
];

// ── Stepper component ─────────────────────────────────────────────────────────

function Stepper({
  current,
  translate,
}: {
  current: number;
  translate: (k: string) => string;
}): React.ReactElement {
  return (
    <div className={styles['stepper']}>
      {STEPS.map((labelKey, i) => (
        <React.Fragment key={labelKey}>
          {i > 0 && (
            <div
              className={cn(styles['stepConnector'], i <= current && styles['stepConnectorDone'])}
            />
          )}
          <div className={styles['stepItem']}>
            <div
              className={cn(
                styles['stepDot'],
                i === current && styles['stepDotActive'],
                i < current && styles['stepDotDone']
              )}
            >
              {i < current ? <CheckIcon size={10} /> : i + 1}
            </div>
            <span
              className={cn(
                styles['stepLabel'],
                i === current && styles['stepLabelActive'],
                i < current && styles['stepLabelDone']
              )}
            >
              {translate(labelKey)}
            </span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ── Main component ────────────────────────────────────────────────────────────

export function SaleCreateDialog({ open, onOpenChange }: Props): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { mutate, isPending } = useCreateSale();
  const { data: customers } = useCustomers();
  const { data: products } = useProducts();

  const [step, setStep] = React.useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setValue,
    watch,
    trigger,
  } = useForm<FormValues>({
    mode: 'onTouched',
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      currency: 'EUR',
      items: [{ productId: '', quantity: 1, unitPrice: 0 }],
      paymentMethod: 'credit_card',
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const watchedItems = watch('items');
  const watchedMethod = watch('paymentMethod');

  const runningTotal = React.useMemo(
    () => watchedItems.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0),
    [watchedItems]
  );

  const onClose = (): void => {
    reset();
    setStep(0);
    onOpenChange(false);
  };

  const handleNext = async (): Promise<void> => {
    const fields = STEP_FIELDS[step] ?? [];
    const ok = await trigger(fields as Parameters<typeof trigger>[0]);
    if (ok) setStep((s) => s + 1);
  };

  const onSubmit = (data: FormValues): void => {
    mutate(
      {
        customerId: data.customerId?.trim() !== '' ? data.customerId : undefined,
        items: data.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        currency: data.currency,
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

  // ── Step renders ────────────────────────────────────────────────────────

  const renderItemErrors = (): React.ReactNode => {
    const ie = errors.items;
    if (!ie) return null;
    if (!Array.isArray(ie) && 'message' in ie && typeof ie.message === 'string') {
      return <p className={styles['errorBanner']}>{ie.message}</p>;
    }
    return null;
  };

  const renderStep0 = (): React.ReactElement => (
    <div className={styles['bodyScroll']}>
      <div className={styles['gridPriceShort']}>
        <FormField label={t('sales.checkout.customerOptional')}>
          <Controller
            name="customerId"
            control={control}
            render={({ field }) => (
              <Select value={field.value ?? ''} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t('sales.checkout.walkIn')} />
                </SelectTrigger>
                <SelectContent>
                  {customers?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
        <FormField label={t('sales.checkout.currency')} error={errors.currency?.message}>
          <Input {...register('currency')} maxLength={3} />
        </FormField>
      </div>

      <div>
        <p className={styles['sectionTitle']}>{t('sales.checkout.stepItems')}</p>
        {renderItemErrors()}
        {fields.map((field, index) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const rowErr = Array.isArray(errors.items) ? errors.items[index] : undefined;
          type RowErr = {
            productId?: { message?: string };
            quantity?: { message?: string };
            unitPrice?: { message?: string };
          };
          const row = rowErr as RowErr | undefined;
          return (
            <div key={field.id} className={styles['saleItemRow']}>
              <FormField
                label={index === 0 ? t('sales.checkout.product') : ''}
                error={row?.productId?.message}
              >
                <Controller
                  name={`items.${index}.productId`}
                  control={control}
                  render={({ field: f }) => (
                    <Select
                      value={f.value}
                      onValueChange={(v: string) => {
                        f.onChange(v);
                        const prod = products?.find((p) => p.id === v);
                        if (prod !== undefined) {
                          setValue(`items.${index}.unitPrice`, prod.price);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('sales.checkout.selectProduct')} />
                      </SelectTrigger>
                      <SelectContent>
                        {products?.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <FormField
                label={index === 0 ? t('sales.checkout.qty') : ''}
                error={row?.quantity?.message}
              >
                <Input
                  {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                  type="number"
                  min="1"
                  step="1"
                />
              </FormField>
              <FormField
                label={index === 0 ? t('sales.checkout.price') : ''}
                error={row?.unitPrice?.message}
              >
                <Input
                  {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                  type="number"
                  min="0"
                  step="0.01"
                />
              </FormField>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => {
                  remove(index);
                }}
                disabled={fields.length === 1}
                className={index === 0 ? styles['deleteBtnFirst'] : styles['deleteBtn']}
              >
                <TrashIcon size={14} />
              </Button>
            </div>
          );
        })}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            append({ productId: '', quantity: 1, unitPrice: 0 });
          }}
        >
          <PlusIcon size={14} /> {t('sales.checkout.addItem')}
        </Button>
      </div>

      <div className={styles['runningTotal']}>
        <span>{t('sales.checkout.runningTotal')}</span>
        <strong>
          {runningTotal.toFixed(2)} {watch('currency')}
        </strong>
      </div>
    </div>
  );

  const renderStep1 = (): React.ReactElement => (
    <div className={styles['body']}>
      <p className={styles['sectionTitle']}>{t('sales.checkout.shippingTitle')}</p>
      <FormField label={t('sales.checkout.address')} error={errors.address?.message}>
        <Input {...register('address')} placeholder={t('sales.checkout.addressPlaceholder')} />
      </FormField>
      <div className={styles['grid2']}>
        <FormField label={t('sales.checkout.contactName')} error={errors.contactName?.message}>
          <Input
            {...register('contactName')}
            placeholder={t('sales.checkout.contactNamePlaceholder')}
          />
        </FormField>
        <FormField label={t('sales.checkout.contactPhone')} error={errors.contactPhone?.message}>
          <Input
            {...register('contactPhone')}
            placeholder={t('sales.checkout.contactPhonePlaceholder')}
          />
        </FormField>
      </div>
      <FormField label={t('sales.checkout.notes')}>
        <Textarea {...register('notes')} placeholder={t('sales.checkout.notesPlaceholder')} />
      </FormField>
    </div>
  );

  const PAYMENT_OPTIONS: Array<{ method: PaymentMethod; icon: string; labelKey: string }> = [
    { method: 'credit_card', icon: '💳', labelKey: 'sales.checkout.creditCard' },
    { method: 'bank_transfer', icon: '🏦', labelKey: 'sales.checkout.bankTransfer' },
    { method: 'cash_on_delivery', icon: '💵', labelKey: 'sales.checkout.cashOnDelivery' },
  ];

  const renderStep2 = (): React.ReactElement => (
    <div className={styles['body']}>
      <p className={styles['sectionTitle']}>{t('sales.checkout.paymentTitle')}</p>
      <div className={styles['paymentCards']}>
        {PAYMENT_OPTIONS.map(({ method, icon, labelKey }) => (
          <button
            key={method}
            type="button"
            className={cn(
              styles['paymentCard'],
              watchedMethod === method && styles['paymentCardActive']
            )}
            onClick={() => {
              setValue('paymentMethod', method);
            }}
          >
            <span className={styles['paymentCardIcon']}>{icon}</span>
            <span>{t(labelKey)}</span>
          </button>
        ))}
      </div>

      {watchedMethod === 'credit_card' && (
        <>
          <FormField label={t('sales.checkout.holderName')} error={errors.holderName?.message}>
            <Input
              {...register('holderName')}
              placeholder={t('sales.checkout.holderNamePlaceholder')}
            />
          </FormField>
          <FormField label={t('sales.checkout.cardNumber')} error={errors.cardNumber?.message}>
            <Input
              {...register('cardNumber')}
              placeholder={t('sales.checkout.cardNumberPlaceholder')}
              maxLength={19}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
                const formatted = raw.replace(/(.{4})/g, '$1 ').trim();
                setValue('cardNumber', formatted);
              }}
            />
          </FormField>
          <div className={styles['grid2']}>
            <FormField label={t('sales.checkout.expiry')} error={errors.expiry?.message}>
              <Input
                {...register('expiry')}
                placeholder={t('sales.checkout.expiryPlaceholder')}
                maxLength={5}
                onChange={(e) => {
                  let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                  if (v.length > 2) v = `${v.slice(0, 2)}/${v.slice(2)}`;
                  setValue('expiry', v);
                }}
              />
            </FormField>
            <FormField label={t('sales.checkout.cvv')} error={errors.cvv?.message}>
              <Input
                {...register('cvv')}
                placeholder={t('sales.checkout.cvvPlaceholder')}
                maxLength={4}
                type="password"
              />
            </FormField>
          </div>
        </>
      )}

      {watchedMethod === 'bank_transfer' && (
        <>
          <Label>{t('sales.checkout.ibanLabel')}</Label>
          <div className={styles['ibanBox']}>{MOCK_BANK_IBAN}</div>
        </>
      )}

      {watchedMethod === 'cash_on_delivery' && (
        <div className={styles['infoBox']}>{t('sales.checkout.cashNote')}</div>
      )}
    </div>
  );

  const formValues = watch();
  const selectedCustomerName = customers?.find((c) => c.id === formValues.customerId)?.name;
  const paymentLabel = PAYMENT_OPTIONS.find((o) => o.method === formValues.paymentMethod);
  const maskedCard = formValues.cardNumber
    ? t('sales.checkout.maskedCard', { last4: formValues.cardNumber.replace(/\s/g, '').slice(-4) })
    : '';

  const renderStep3 = (): React.ReactElement => (
    <div className={styles['body']}>
      <p className={styles['sectionTitle']}>{t('sales.checkout.confirmTitle')}</p>

      {formValues.items
        .filter((it) => it.productId)
        .map((it) => {
          const pName = products?.find((p) => p.id === it.productId)?.name ?? it.productId;
          return (
            <div key={it.productId} className={styles['summaryRow']}>
              <span className={styles['summaryLabel']}>
                {pName} × {it.quantity}
              </span>
              <span className={styles['summaryValue']}>
                {(it.quantity * it.unitPrice).toFixed(2)} {formValues.currency}
              </span>
            </div>
          );
        })}

      <div className={styles['summaryRow']}>
        <span className={styles['summaryLabel']}>{t('sales.checkout.runningTotal')}</span>
        <strong className={styles['summaryValue']}>
          {runningTotal.toFixed(2)} {formValues.currency}
        </strong>
      </div>

      <div className={styles['summaryRow']}>
        <span className={styles['summaryLabel']}>{t('sales.checkout.shippingTo')}</span>
        <span className={styles['summaryValue']}>
          {selectedCustomerName ? `${selectedCustomerName} — ` : ''}
          {formValues.address}
        </span>
      </div>

      <div className={styles['summaryRow']}>
        <span className={styles['summaryLabel']}>{t('sales.checkout.payWith')}</span>
        <span className={styles['summaryValue']}>
          {paymentLabel ? t(paymentLabel.labelKey) : ''}
          {formValues.paymentMethod === 'credit_card' && formValues.cardNumber
            ? ` — ${maskedCard}`
            : ''}
        </span>
      </div>

      <p className={styles['infoText']}>{t('sales.checkout.estimatedDelivery')}</p>
    </div>
  );

  const STEP_RENDERS = [renderStep0, renderStep1, renderStep2, renderStep3];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('sales.checkout.title')}</DialogTitle>
        </DialogHeader>

        <Stepper current={step} translate={t} />

        {(STEP_RENDERS[step] ?? renderStep0)()}

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
      </DialogContent>
    </Dialog>
  );
}
