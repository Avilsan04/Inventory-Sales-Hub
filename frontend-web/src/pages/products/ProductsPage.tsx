import * as React from 'react';
import { PackageIcon, TagIcon, PencilIcon, TrashIcon } from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useProducts, useCategories, useDeleteProduct } from '@features/products';
import { toast } from '@shared/hooks/useToast';
import { Skeleton, Button } from '@shared/ui/primitives';
import {
    Card, CardHeader, CardTitle, CardAction, CardContent,
    Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
    ConfirmDialog,
} from '@shared/ui/composed';
import { ProductCreateDialog } from '@features/products/components/ProductCreateDialog';
import { ProductEditDialog } from '@features/products/components/ProductEditDialog';
import type { Product } from '@entities/product';
import styles from '@shared/styles/themes/pages/PageBase.module.scss';

const SKELETON_ROWS = 5;

export function ProductsPage(): React.ReactElement {
    const { translate: t } = useTranslationAdapter();
    const { data, isLoading, isError } = useProducts();
    const { data: categories } = useCategories();
    const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();

    const [createOpen, setCreateOpen] = React.useState(false);
    const [editProduct, setEditProduct] = React.useState<Product | null>(null);
    const [deleteId, setDeleteId] = React.useState<string | null>(null);

    const handleDelete = (): void => {
        if (deleteId === null) return;
        deleteProduct(deleteId, {
            onSuccess: () => { toast({ title: 'Product deleted' }); setDeleteId(null); },
            onError: (err) => { toast({ title: 'Delete failed', description: err.message, variant: 'destructive' }); },
        });
    };

    if (isError) {
        return (
            <div className={styles['errorContainer']} role="alert" aria-live="assertive">
                <p>{t('common.errorLoadingData')}</p>
            </div>
        );
    }

    return (
        <div className={styles['page']}>
            <header className={styles['header']}>
                <div>
                    <h1 className={styles['title']}>{t('nav.products')}</h1>
                    <p className={styles['subtitle']}>{t('products.subtitle')}</p>
                </div>
                <Button size="sm" onClick={() => { setCreateOpen(true); }}>
                    {`+ ${t('inventory.addProduct')}`}
                </Button>
            </header>

            <section className={styles['statsRow']} aria-label="Product statistics">
                <Card>
                    <CardHeader>
                        <CardTitle className={styles['statTitle']}>{t('products.totalProducts')}</CardTitle>
                        <CardAction><span className={styles['statIcon']}><PackageIcon aria-hidden="true" /></span></CardAction>
                    </CardHeader>
                    <CardContent>
                        <div className={styles['statValue']}>
                            {isLoading ? <Skeleton style={{ height: '2rem', width: '4rem' }} /> : (data?.length ?? 0)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className={styles['statTitle']}>{t('products.totalCategories')}</CardTitle>
                        <CardAction><span className={styles['statIcon']}><TagIcon aria-hidden="true" /></span></CardAction>
                    </CardHeader>
                    <CardContent>
                        <div className={styles['statValue']}>
                            {isLoading ? <Skeleton style={{ height: '2rem', width: '4rem' }} /> : (categories?.length ?? 0)}
                        </div>
                    </CardContent>
                </Card>
            </section>

            <section className={styles['content']}>
                <Card>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('inventory.productName')}</TableHead>
                                    <TableHead>{t('inventory.sku')}</TableHead>
                                    <TableHead>{t('inventory.price')}</TableHead>
                                    <TableHead>{t('inventory.category')}</TableHead>
                                    <TableHead />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading
                                    ? Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell colSpan={5}>
                                                <Skeleton style={{ height: '1.25rem', width: '100%' }} />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                    : !data || data.length === 0
                                        ? (
                                            <TableRow>
                                                <TableCell colSpan={5}>
                                                    <div className={styles['placeholderContainer']}>
                                                        <p className={styles['placeholder']}>{t('common.noData')}</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )
                                        : data.map((p) => (
                                            <TableRow key={p.id}>
                                                <TableCell>{p.name}</TableCell>
                                                <TableCell>{p.sku}</TableCell>
                                                <TableCell>{p.currency} {p.price.toFixed(2)}</TableCell>
                                                <TableCell>{p.category?.name ?? '—'}</TableCell>
                                                <TableCell>
                                                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                                                        <Button variant="ghost" size="icon-sm" onClick={() => { setEditProduct(p); }}>
                                                            <PencilIcon size={14} />
                                                        </Button>
                                                        <Button variant="ghost" size="icon-sm" onClick={() => { setDeleteId(p.id); }}>
                                                            <TrashIcon size={14} />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                }
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </section>

            <ProductCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
            <ProductEditDialog
                product={editProduct}
                open={editProduct !== null}
                onOpenChange={(open) => { if (!open) setEditProduct(null); }}
            />
            <ConfirmDialog
                open={deleteId !== null}
                onOpenChange={(open) => { if (!open) setDeleteId(null); }}
                title="Delete product?"
                description="This action cannot be undone."
                onConfirm={handleDelete}
                isPending={isDeleting}
            />
        </div>
    );
}
