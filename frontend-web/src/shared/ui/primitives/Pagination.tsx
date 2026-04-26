import * as React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Button } from './Button';

interface PaginationProps {
    page: number;
    pageCount: number;
    onPageChange: (page: number) => void;
}

export function Pagination({ page, pageCount, onPageChange }: PaginationProps): React.ReactElement {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', minWidth: '4rem', textAlign: 'center' }}>
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
