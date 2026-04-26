import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateCustomer } from '@features/customers';
import { toast } from '@shared/hooks/useToast';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, FormField,
} from '@shared/ui/composed';
import { Button, Input } from '@shared/ui/primitives';
import styles from '@shared/styles/themes/components/DialogForm.module.scss';

const schema = z.object({
    name: z.string().min(1, 'Required'),
    email: z.email('Invalid email'),
    phone: z.string().optional(),
    address: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CustomerCreateDialog({ open, onOpenChange }: Props): React.ReactElement {
    const { mutate, isPending } = useCreateCustomer();
    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
        resolver: zodResolver(schema),
    });

    const onClose = (): void => { reset(); onOpenChange(false); };

    const onSubmit = (data: FormValues): void => {
        mutate(data, {
            onSuccess: () => { toast({ title: 'Customer added' }); onClose(); },
            onError: (err) => { toast({ title: 'Failed to add', description: err.message, variant: 'destructive' }); },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader><DialogTitle>New Customer</DialogTitle></DialogHeader>
                <form onSubmit={(e: React.SyntheticEvent) => { void handleSubmit(onSubmit)(e); }}>
                    <div className={styles['body']}>
                        <FormField label="Name" required error={errors.name?.message}>
                            <Input {...register('name')} placeholder="Full name" />
                        </FormField>
                        <FormField label="Email" required error={errors.email?.message}>
                            <Input {...register('email')} type="email" placeholder="email@example.com" />
                        </FormField>
                        <FormField label="Phone" error={errors.phone?.message}>
                            <Input {...register('phone')} placeholder="+1 555 000 0000" />
                        </FormField>
                        <FormField label="Address" error={errors.address?.message}>
                            <Input {...register('address')} placeholder="123 Main St" />
                        </FormField>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={isPending}>{isPending ? 'Adding…' : 'Add Customer'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
