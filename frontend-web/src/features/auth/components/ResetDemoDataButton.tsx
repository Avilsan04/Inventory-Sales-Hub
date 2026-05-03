import * as React from 'react';
import { Button } from '@shared/ui/primitives';
import { ConfirmDialog } from '@shared/ui/composed';

export function ResetDemoDataButton(): React.ReactElement | null {
  const [open, setOpen] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);

  if (!import.meta.env.DEV) return null;

  const handleReset = async (): Promise<void> => {
    setIsPending(true);
    const { resetDemoData } = await import('@app/mock/db');
    await resetDemoData();
    // resetDemoData calls window.location.reload() after re-seeding
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setOpen(true);
        }}
        style={{ color: 'var(--color-destructive)', borderColor: 'var(--color-destructive)' }}
      >
        Reset demo data
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="¿Resetear todos los datos demo?"
        description="Se borrarán todas las ventas, ajustes y cambios. La app se recargará con datos de fábrica."
        onConfirm={() => {
          void handleReset();
        }}
        isPending={isPending}
      />
    </>
  );
}
