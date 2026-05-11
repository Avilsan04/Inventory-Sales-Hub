import * as React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Button } from './Button';
import { PAGE_SIZE_OPTIONS } from '@shared/hooks/useTableFilters';
import styles from '@shared/styles/themes/components/Pagination.module.scss';

interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
}

export function Pagination({
  page,
  pageCount,
  onPageChange,
  pageSize,
  onPageSizeChange,
}: PaginationProps): React.ReactElement {
  return (
    <div className={styles.root}>
      {pageSize !== undefined && onPageSizeChange !== undefined && (
        <div className={styles.pageSizeSelect}>
          <select
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value));
            }}
            className={styles.select}
            aria-label="Rows per page"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
        </div>
      )}
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => {
          onPageChange(page - 1);
        }}
        aria-label="Previous page"
      >
        <ChevronLeftIcon className={styles.icon} />
        Previous
      </Button>
      <span className={styles.pageInfo}>
        {page} / {Math.max(pageCount, 1)}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= pageCount}
        onClick={() => {
          onPageChange(page + 1);
        }}
        aria-label="Next page"
      >
        Next
        <ChevronRightIcon className={styles.icon} />
      </Button>
    </div>
  );
}
