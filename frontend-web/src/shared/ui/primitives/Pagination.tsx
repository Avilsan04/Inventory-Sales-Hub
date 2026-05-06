import * as React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Button } from './Button';
import styles from '@shared/styles/themes/components/Pagination.module.scss';

interface PaginationProps {
    page: number;
    pageCount: number;
    onPageChange: (page: number) => void;
}

export function Pagination({ page, pageCount, onPageChange }: PaginationProps): React.ReactElement {
    return (
        <div className={styles.root}>
            <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => { onPageChange(page - 1); }}
                aria-label="Previous page"
            >
                <ChevronLeftIcon size={14} />
                Previous
            </Button>
            <span className={styles.pageInfo}>
                {page} / {Math.max(pageCount, 1)}
            </span>
            <Button
                variant="outline"
                size="sm"
                disabled={page >= pageCount}
                onClick={() => { onPageChange(page + 1); }}
                aria-label="Next page"
            >
                Next
                <ChevronRightIcon size={14} />
            </Button>
        </div>
    );
}
