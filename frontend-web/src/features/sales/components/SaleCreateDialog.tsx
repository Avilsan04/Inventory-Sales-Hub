import * as React from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateSale } from '@features/sales';
import { useCustomers } from '@features/customers';
import { useProducts } from '@features/products';
import { toast } from '@shared/hooks/useToast';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
    FormField,
    Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@shared/ui/composed';
import { Button, Input } from '@shared/ui/primitives';
import { PlusIcon, TrashIcon } from 'lucide-react';
import styles from '@shared/styles/themes/components/DialogForm.module.scss';

const itemSchema = z.object({
    productId: z.string().min(1, 'Select a product'),
    quantity: z.number().int('Must be integer').min(1, 'Min 1'),
    unitPrice: z.number().nonnegative('Must be ≥ 0'),
});

const schema = z.object({
    customerId: z.string().optional(),
    items: z.array(itemSchema).min(1, 'Add at least one item'),
    currency: z.string().length(3, 'Must be 3 characters'),
});

type FormValues = z.infer<typeof schema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SaleCreateDialog({ open, onOpenChange }: Props): React.ReactElement {
    const { mutate, isPending } = useCreateSale();
    const { data: customers } = useCustomers();
    const { data: products } = useProducts();

    const { register, handleSubmit, formState: { errors }, reset, control, setValue } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            currency: 'USD',
            items: [{ productId: '', quantity: 1, unitPrice: 0 }],
        },
    });

    const { fields, append, remove } = useFieldArray({ control, name: 'items' });

    const onClose = (): void => { reset(); onOpenChange(false); };

    const onSubmit = (data: FormValues): void => {
        mutate(
            {
                customerId: data.customerId !== '' ? data.customerId : undefined,
                items: data.items.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                })),
                currency: data.currency,
            },
            {
                onSuccess: () => { toast({ title: 'Sale created' }); onClose(); },
                onError: (err) => { toast({ title: 'Failed to create sale', description: err.message, variant: 'destructive' }); },
            },
        );
    };

    const itemErrors = errors.items;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader><DialogTitle>New Sale</DialogTitle></DialogHeader>
                <form onSubmit={(e: React.SyntheticEvent) => { void handleSubmit(onSubmit)(e); }}>
                    <div className={styles['bodyScroll']}>
                        <div className={styles['gridPriceShort']}>
                            <FormField label="Customer (optional)">
                                <Controller
                                    name="customerId"
                                    control={control}
                                    render={({ field }) => (
                                        <Select value={field.value ?? ''} onValueChange={field.onChange}>
                                            <SelectTrigger><SelectValue placeholder="Walk-in customer" /></SelectTrigger>
                                            <SelectContent>
                                                {customers?.map((c) => (
                                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </FormField>
                            <FormField label="Currency" error={errors.currency?.message}>
                                <Input {...register('currency')} maxLength={3} />
                            </FormField>
                        </div>

                        <div>
                            <p className={styles['sectionTitle']}>Items</p>
                            {typeof itemErrors === 'object' && !Array.isArray(itemErrors) && 'message' in itemErrors && typeof itemErrors.message === 'string' && (
                                <p className={styles['errorBanner']}>{itemErrors.message}</p>
                            )}
                            {fields.map((field, index) => {
                                // react-hook-form field array errors are typed as a complex union; safe cast needed
                                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                                const rowErr = Array.isArray(itemErrors) ? itemErrors[index] : undefined;
                                type RowErr = { productId?: { message?: string }; quantity?: { message?: string }; unitPrice?: { message?: string } };
                                const row = rowErr as RowErr | undefined;
                                return (
                                    <div key={field.id} className={styles['saleItemRow']}>
                                        <FormField label={index === 0 ? 'Product' : ''} error={row?.productId?.message}>
                                            <Controller
                                                // react-hook-form path type requires literal number index, not string
                                                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                                                name={`items.${index}.productId`}
                                                control={control}
                                                render={({ field: f }) => (
                                                    <Select
                                                        value={f.value}
                                                        onValueChange={(v: string) => {
                                                            f.onChange(v);
                                                            const prod = products?.find((p) => p.id === v);
                                                            if (prod !== undefined) {
                                                                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                                                                setValue(`items.${index}.unitPrice`, prod.price);
                                                            }
                                                        }}
                                                    >
                                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                                        <SelectContent>
                                                            {products?.map((p) => (
                                                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </FormField>
                                        <FormField label={index === 0 ? 'Qty' : ''} error={row?.quantity?.message}>
                                            <Input
                                                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                                                {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                                                type="number" min="1" step="1"
                                            />
                                        </FormField>
                                        <FormField label={index === 0 ? 'Price' : ''} error={row?.unitPrice?.message}>
                                            <Input
                                                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                                                {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                                                type="number" min="0" step="0.01"
                                            />
                                        </FormField>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon-sm"
                                            onClick={() => { remove(index); }}
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
                                onClick={() => { append({ productId: '', quantity: 1, unitPrice: 0 }); }}
                            >
                                <PlusIcon size={14} />
                                Add item
                            </Button>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={isPending}>{isPending ? 'Creating…' : 'Create Sale'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
