import * as React from 'react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useInventory } from '@features/inventory';
import { useCustomers } from '@features/customers';
import { useCreateSale, useCart } from '@features/sales';
import { useCashSession } from '@features/sales/hooks/useCashSession';
import { useEffectiveRole, PermissionGuard } from '@features/auth';
import { hasPermission } from '@shared/lib/permissions';
import { SaleReceiptDialog } from '@features/sales/components/SaleReceiptDialog';
import { OpenCashSessionDialog } from '@features/sales/components/OpenCashSessionDialog';
import { CloseCashSessionDialog } from '@features/sales/components/CloseCashSessionDialog';
import type { Sale } from '@entities/sale';
import type { InventoryItem } from '@entities/inventory';
import { toast } from '@shared/hooks/useToast';
import { Button } from '@shared/ui/primitives';
import { PosProductBrowser, PosCart } from '@widgets/pos';
import type { PosCheckoutPayload } from '@widgets/pos';
import styles from '@shared/styles/themes/pages/Pos.module.scss';

export function PosPage(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { data: inventory, isPending } = useInventory();
  const { data: customers } = useCustomers();
  const { mutate: createSale, isPending: isCreating } = useCreateSale();
  const { addItem, clearCart } = useCart();
  const { data: cashSession, isLoading: isSessionLoading } = useCashSession();
  const role = useEffectiveRole();

  const [completedSale, setCompletedSale] = React.useState<Sale | null>(null);
  const [openSessionDialog, setOpenSessionDialog] = React.useState(false);
  const [closeSessionDialog, setCloseSessionDialog] = React.useState(false);

  const addToCart = (item: InventoryItem): void => {
    addItem({
      productId: item.id,
      productName: item.name,
      sku: item.sku,
      unitPrice: item.price,
      currency: item.currency,
      maxStock: item.quantity,
    });
  };

  const handleCheckout = (payload: PosCheckoutPayload): void => {
    createSale(
      {
        customerId: payload.customerId ?? undefined,
        currency: payload.currency,
        paymentMethod: payload.paymentMethod,
        discountPercent: payload.discountPercent,
        taxPercent: payload.taxPercent,
        items: payload.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
      },
      {
        onSuccess: (sale) => {
          clearCart();
          setCompletedSale(sale);
        },
        onError: (err) => {
          toast({ title: t('common.error'), description: err.message, variant: 'destructive' });
        },
      }
    );
  };

  return (
    <div className={styles['page']}>
      <header className={styles['header']}>
        <div className={styles['headerTitle']}>
          <h1 className={styles['title']}>{t('nav.pos')}</h1>
        </div>
        <div className={styles['headerActions']}>
          {cashSession?.status === 'open' ? (
            <>
              <span className={styles['sessionLabel']}>{t('pos.sessionOpen')}</span>
              <PermissionGuard permission="close:cash-session">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setCloseSessionDialog(true);
                  }}
                >
                  {t('pos.closeShift')}
                </Button>
              </PermissionGuard>
            </>
          ) : (
            hasPermission(role, 'open:cash-session') && (
              <Button
                size="sm"
                onClick={() => {
                  setOpenSessionDialog(true);
                }}
              >
                {t('pos.openShift')}
              </Button>
            )
          )}
        </div>
      </header>

      {!isSessionLoading && !cashSession && hasPermission(role, 'open:cash-session') && (
        <div className={styles['emptySession']}>
          <p className={styles['emptySessionText']}>{t('pos.noActiveSession')}</p>
          <Button
            onClick={() => {
              setOpenSessionDialog(true);
            }}
          >
            {t('pos.openShift')}
          </Button>
        </div>
      )}

      <div className={styles['splitPanel']}>
        <PosProductBrowser inventory={inventory} isPending={isPending} onAdd={addToCart} />
        <PosCart customers={customers} isCreating={isCreating} onCheckout={handleCheckout} />
      </div>

      <SaleReceiptDialog
        sale={completedSale}
        open={completedSale !== null}
        onOpenChange={(open) => {
          if (!open) setCompletedSale(null);
        }}
      />

      <OpenCashSessionDialog open={openSessionDialog} onOpenChange={setOpenSessionDialog} />

      {cashSession && (
        <CloseCashSessionDialog
          session={cashSession}
          open={closeSessionDialog}
          onOpenChange={setCloseSessionDialog}
        />
      )}
    </div>
  );
}
