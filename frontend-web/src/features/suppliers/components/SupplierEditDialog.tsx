import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdateSupplier } from '@features/suppliers';
import { toast } from '@shared/hooks/useToast';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, FormField,
} from '@shared/ui/composed';
import { Button, Input } from '@shared/ui/primitives';
import type { Supplier } from '@entities/supplier';
import styles from '@shared/styles/themes/components/DialogForm.module.scss';

const schema = z.object({
    name: z.string().min(1, 'Required'),
    email: z.email('Invalid email').optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    contactPerson: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
    supplier: Supplier | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SupplierEditDialog({ supplier, open, onOpenChange }: Props): React.ReactElement {
    const { mutate, isPending } = useUpdateSupplier(supplier?.id ?? '');
    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
        resolver: zodResolver(schema),
    });

    React.useEffect(() => {
        if (open && supplier !== null) {
            reset({
                name: supplier.name,
                email: supplier.email ?? undefined,
                phone: supplier.phone ?? undefined,
                address: supplier.address ?? undefined,
                contactPerson: supplier.contactPerson ?? undefined,
            });
        }
    }, [open, supplier, reset]);

    const onClose = (): void => { reset(); onOpenChange(false); };

    const onSubmit = (data: FormValues): void => {
        if (supplier === null) return;
        mutate(data, {
            onSuccess: () => { toast({ title: 'Supplier updated' }); onClose(); },
            onError: (err) => { toast({ title: 'Update failed', description: err.message, variant: 'destructive' }); },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader><DialogTitle>Edit Supplier</DialogTitle></DialogHeader>
                <form onSubmit={(e: React.SyntheticEvent) => { void handleSubmit(onSubmit)(e); }}>
                    <div className={styles['body']}>
                        <FormField label="Company name" required error={errors.name?.message}>
                            <Input {...register('name')} />
                        </FormField>
                        <FormField label="Email" error={errors.email?.message}>
                            <Input {...register('email')} type="email" />
                        </FormField>
                        <FormField label="Phone" error={errors.phone?.message}>
                            <Input {...register('phone')} />
                        </FormField>
                        <FormField label="Address" error={errors.address?.message}>
                            <Input {...register('address')} />
                        </FormField>
                        <FormField label="Contact person" error={errors.contactPerson?.message}>
                            <Input {...register('contactPerson')} />
                        </FormField>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={isPending}>{isPending ? 'Saving…' : 'Save'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
