import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdateEmployee } from '@features/employees';
import { toast } from '@shared/hooks/useToast';
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
import { Button, Input, Switch, Label } from '@shared/ui/primitives';
import type { Employee } from '@entities/employee';
import styles from '@shared/styles/themes/components/DialogForm.module.scss';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  email: z.email('Invalid email'),
  role: z.enum(['admin', 'manager', 'staff']),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmployeeEditDialog({ employee, open, onOpenChange }: Props): React.ReactElement {
  const { mutate, isPending } = useUpdateEmployee(employee?.id ?? '');
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<FormValues>({
    mode: 'onTouched',
    resolver: zodResolver(schema),
    defaultValues: { role: 'staff', isActive: true },
  });

  React.useEffect(() => {
    if (open && employee !== null) {
      reset({
        name: employee.name,
        email: employee.email,
        role: employee.role,
        isActive: employee.isActive,
      });
    }
  }, [open, employee, reset]);

  const onClose = (): void => {
    reset();
    onOpenChange(false);
  };

  const onSubmit = (data: FormValues): void => {
    if (employee === null) return;
    mutate(data, {
      onSuccess: () => {
        toast({ title: 'Employee updated' });
        onClose();
      },
      onError: (err) => {
        toast({ title: 'Update failed', description: err.message, variant: 'destructive' });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e: React.SyntheticEvent) => {
            void handleSubmit(onSubmit)(e);
          }}
        >
          <div className={styles['body']}>
            <FormField label="Name" required error={errors.name?.message}>
              <Input {...register('name')} />
            </FormField>
            <FormField label="Email" required error={errors.email?.message}>
              <Input {...register('email')} type="email" />
            </FormField>
            <FormField label="Role" required error={errors.role?.message}>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <div className={styles['activeRow']}>
                  <Switch checked={field.value} onCheckedChange={field.onChange} id="edit-active" />
                  <Label htmlFor="edit-active">Active</Label>
                </div>
              )}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
