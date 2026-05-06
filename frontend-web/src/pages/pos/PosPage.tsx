import * as React from 'react';
import {
  PlusIcon,
  ShoppingCartIcon,
  CreditCardIcon,
  BuildingIcon,
  BanknoteIcon,
  PackageIcon,
} from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useInventory } from '@features/inventory';
import { useCustomers } from '@features/customers';
import { useCreateSale } from '@features/sales';
import { useCartStore } from '@features/sales/stores/cartStore';
import { useCashSession } from '@features/sales/hooks/useCashSession';
import { usePosKeyboard } from '@features/sales/hooks/usePosKeyboard';
import { useEffectiveRole, PermissionGuard } from '@features/auth';
import { hasPermission } from '@shared/lib/permissions';
import { SaleReceiptDialog } from '@features/sales/components/SaleReceiptDialog';
import { OpenCashSessionDialog } from '@features/sales/components/OpenCashSessionDialog';
import { CloseCashSessionDialog } from '@features/sales/components/CloseCashSessionDialog';
import type { PaymentMethod } from '@features/sales/models/checkout.types';
import type { Sale } from '@entities/sale';
import { toast } from '@shared/hooks/useToast';
import { Input, Spinner, Badge, Button } from '@shared/ui/primitives';
import { cn } from '@shared/lib/cn';
import { formatCurrency } from '@shared/lib/formatCurrency';
import { calculateSaleTotals } from '@shared/lib/saleCalculations';
import type { InventoryItem } from '@entities/inventory';
import styles from '@shared/styles/themes/pages/Pos.module.scss';

const PAYMENT_OPTIONS: Array<{
  id: PaymentMethod;
  labelKey: string;
  icon: React.ReactElement;
}> = [
  { id: 'credit_card', labelKey: 'sales.checkout.creditCard', icon: <CreditCardIcon /> },
  { id: 'bank_transfer', labelKey: 'sales.checkout.bankTransfer', icon: <BuildingIcon /> },
  { id: 'cash_on_delivery', labelKey: 'sales.checkout.cashOnDelivery', icon: <BanknoteIcon /> },
];

function stockBadgeVariant(status: InventoryItem['status']): 'success' | 'warning' | 'destructive' {
  if (status === 'IN_STOCK') return 'success';
  if (status === 'LOW_STOCK') return 'warning';
  return 'destructive';
}

function stockBadgeLabel(status: InventoryItem['status'], t: (k: string) => string): string {
  if (status === 'IN_STOCK') return t('inventory.status_IN_STOCK');
  if (status === 'LOW_STOCK') return t('inventory.status_LOW_STOCK');
  return t('inventory.status_OUT_OF_STOCK');
}

export function PosPage(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { data: inventory, isPending } = useInventory();
  const { data: customers } = useCustomers();
  const { mutate: createSale, isPending: isCreating } = useCreateSale();

  const {
    items: cart,
    customerId,
    paymentMethod,
    addItem,
    changeQty,
    clearCart,
    setCustomer,
    setPaymentMethod,
  } = useCartStore();
  const { data: cashSession, isLoading: isSessionLoading } = useCashSession();
  const role = useEffectiveRole();

  const [search, setSearch] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);
  const searchRef = React.useRef<HTMLInputElement | null>(null);
  const [discountPercent, setDiscountPercent] = React.useState(0);
  const [taxPercent, setTaxPercent] = React.useState(0);

  usePosKeyboard({
    searchRef,
    onClearSearch: () => {
      setSearch('');
    },
  });
  const [completedSale, setCompletedSale] = React.useState<Sale | null>(null);
  const [openSessionDialog, setOpenSessionDialog] = React.useState(false);
  const [closeSessionDialog, setCloseSessionDialog] = React.useState(false);

  const categories = React.useMemo((): string[] => {
    if (!inventory) return [];
    return [...new Set(inventory.map((i) => i.category).filter((c): c is string => Boolean(c)))];
  }, [inventory]);

  const filteredProducts = React.useMemo((): InventoryItem[] => {
    if (!inventory) return [];
    return inventory.filter((item) => {
      if (item.status === 'OUT_OF_STOCK') return false;
      if (activeCategory && item.category !== activeCategory) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!item.name.toLowerCase().includes(q) && !item.sku.toLowerCase().includes(q))
          return false;
      }
      return true;
    });
  }, [inventory, activeCategory, search]);

  const saleTotals = React.useMemo(
    () => calculateSaleTotals({ items: cart, discountPercent, taxPercent }),
    [cart, discountPercent, taxPercent]
  );
  const currency = cart[0]?.currency ?? 'EUR';

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

  const handleCheckout = (): void => {
    if (cart.length === 0) return;
    createSale(
      {
        customerId: customerId ?? undefined,
        currency,
        paymentMethod,
        discountPercent,
        taxPercent,
        items: cart.map((i) => ({
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

  if (isPending) {
    return (
      <div className={styles['placeholderContainer']}>
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className={styles['page']}>
      <header className={styles['header']}>
        <div className={styles['headerTitle']}>
          <h1 className={styles['title']}>{t('nav.pos')}</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {cashSession?.status === 'open' ? (
            <>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
                {t('pos.sessionOpen')}
              </span>
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
        <div
          style={{
            background: 'var(--color-muted)',
            borderRadius: '0.5rem',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <p style={{ marginBottom: '1rem', color: 'var(--color-muted-foreground)' }}>
            {t('pos.noActiveSession')}
          </p>
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
        {/* Left: product browser */}
        <div className={styles['products']}>
          <div className={styles['searchBar']}>
            <Input
              ref={searchRef}
              type="search"
              placeholder={`${t('common.search').split(',')[0]}… (F2)`}
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setSearch(e.target.value);
              }}
              aria-label={t('common.search')}
            />
          </div>

          {categories.length > 0 && (
            <div
              className={styles['categoryPills']}
              role="group"
              aria-label={t('inventory.category')}
            >
              <button
                type="button"
                className={cn(styles['pill'], activeCategory === null && styles['pillActive'])}
                onClick={() => {
                  setActiveCategory(null);
                }}
              >
                {t('inventory.allProducts')}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={cn(styles['pill'], activeCategory === cat && styles['pillActive'])}
                  onClick={() => {
                    setActiveCategory(cat);
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {filteredProducts.length === 0 ? (
            <div className={styles['emptyProducts']}>{t('common.noData')}</div>
          ) : (
            <div className={styles['productGrid']}>
              {filteredProducts.map((item) => (
                <div
                  key={item.id}
                  className={styles['productCard']}
                  role="button"
                  tabIndex={0}
                  data-pos-product
                  aria-label={`${t('inventory.addProduct')}: ${item.name}`}
                  onClick={() => {
                    addToCart(item);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') addToCart(item);
                  }}
                >
                  <div className={styles['productIconWrap']}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className={styles['productImg']} />
                    ) : (
                      <PackageIcon size={32} aria-hidden="true" />
                    )}
                  </div>
                  <p className={styles['productName']}>{item.name}</p>
                  <p className={styles['productSku']}>{item.sku}</p>
                  <div className={styles['productFooter']}>
                    <p className={styles['productPrice']}>
                      {formatCurrency(item.price, item.currency, 'es-ES')}
                    </p>
                    <Badge variant={stockBadgeVariant(item.status)} showDot={false}>
                      {stockBadgeLabel(item.status, t)}
                    </Badge>
                  </div>
                  <button
                    type="button"
                    className={styles['addBtn']}
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(item);
                    }}
                    aria-label={`${t('inventory.addProduct')}: ${item.name}`}
                  >
                    <PlusIcon aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: cart */}
        <aside className={styles['cart']}>
          <div className={styles['cartHeader']}>
            <p className={styles['cartTitle']}>{t('catalog.cart')}</p>
            <p className={styles['cartCount']}>
              {cart.reduce((a, i) => a + i.quantity, 0)} {t('sales.items').toLowerCase()}
            </p>
          </div>

          {cart.length === 0 ? (
            <div className={styles['cartEmpty']}>
              <ShoppingCartIcon aria-hidden="true" />
              <p>{t('catalog.emptyCart')}</p>
            </div>
          ) : (
            <div className={styles['cartItems']}>
              {cart.map((item) => (
                <div key={item.productId} className={styles['cartItem']}>
                  <div className={styles['cartItemInfo']}>
                    <p className={styles['cartItemName']}>{item.productName}</p>
                    <p className={styles['cartItemPrice']}>
                      {formatCurrency(item.unitPrice, item.currency, 'es-ES')} / ud.
                    </p>
                  </div>
                  <div className={styles['qtyControls']}>
                    <button
                      type="button"
                      className={styles['qtyBtn']}
                      onClick={() => {
                        changeQty(item.productId, -1);
                      }}
                      aria-label={t('pos.decreaseQty')}
                    >
                      −
                    </button>
                    <span className={styles['qtyValue']}>{item.quantity}</span>
                    <button
                      type="button"
                      className={styles['qtyBtn']}
                      onClick={() => {
                        changeQty(item.productId, 1);
                      }}
                      aria-label={t('pos.increaseQty')}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className={styles['cartFooter']}>
            <div className={styles['totals']}>
              <div className={styles['totalRow']}>
                <span>{t('pos.subtotal')}</span>
                <span>{formatCurrency(saleTotals.subtotal, currency, 'es-ES')}</span>
              </div>
              <div className={styles['totalRow']} style={{ alignItems: 'center' }}>
                <label
                  htmlFor="pos-discount"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  {t('pos.discount')}
                </label>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <input
                    id="pos-discount"
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    value={discountPercent}
                    onChange={(e) => {
                      setDiscountPercent(Number(e.target.value));
                    }}
                    style={{
                      width: '3.5rem',
                      padding: '0.125rem 0.25rem',
                      border: '1px solid var(--color-border)',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                    }}
                    aria-label="Discount %"
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
                    %
                  </span>
                  <span>−{formatCurrency(saleTotals.discountAmount, currency, 'es-ES')}</span>
                </span>
              </div>
              <div className={styles['totalRow']} style={{ alignItems: 'center' }}>
                <label
                  htmlFor="pos-tax"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  {t('pos.tax')}
                </label>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <input
                    id="pos-tax"
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    value={taxPercent}
                    onChange={(e) => {
                      setTaxPercent(Number(e.target.value));
                    }}
                    style={{
                      width: '3.5rem',
                      padding: '0.125rem 0.25rem',
                      border: '1px solid var(--color-border)',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                    }}
                    aria-label="Tax %"
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
                    %
                  </span>
                  <span>+{formatCurrency(saleTotals.taxAmount, currency, 'es-ES')}</span>
                </span>
              </div>
              <div className={styles['totalRowFinal']}>
                <span>{t('pos.total')}</span>
                <span>{formatCurrency(saleTotals.total, currency, 'es-ES')}</span>
              </div>
            </div>

            <select
              className={styles['customerSelect']}
              value={customerId ?? ''}
              onChange={(e) => {
                setCustomer(e.target.value !== '' ? e.target.value : null);
              }}
              aria-label={t('sales.checkout.customerOptional')}
            >
              <option value="">{t('sales.checkout.customerOptional')}</option>
              {customers?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <div>
              <p className={styles['payLabel']}>{t('sales.checkout.paymentTitle')}</p>
              <div className={styles['payButtons']}>
                {PAYMENT_OPTIONS.map(({ id, labelKey, icon }) => (
                  <button
                    key={id}
                    type="button"
                    className={cn(styles['payBtn'], paymentMethod === id && styles['payBtnActive'])}
                    onClick={() => {
                      setPaymentMethod(id);
                    }}
                    aria-pressed={paymentMethod === id}
                  >
                    {icon}
                    <span>{t(labelKey)}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              className={styles['ctaBtn']}
              onClick={handleCheckout}
              disabled={cart.length === 0 || isCreating}
            >
              {isCreating ? t('sales.checkout.creating') : t('sales.checkout.placeOrder')}
            </button>
          </div>
        </aside>
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
