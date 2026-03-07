import * as React from 'react';
import { cn } from '@shared/lib/cn';
import styles from '@shared/styles/themes/components/Table.module.scss';

function Table({
  className,
  ...props
}: React.ComponentProps<'table'>): React.ReactElement {
  return (
    <div className={styles.tableContainer}>
      <table className={cn(styles.table, className)} {...props} />
    </div>
  );
}

function TableHeader({
  className,
  ...props
}: React.ComponentProps<'thead'>): React.ReactElement {
  return <thead className={cn(styles.tableHeader, className)} {...props} />;
}

function TableBody({
  className,
  ...props
}: React.ComponentProps<'tbody'>): React.ReactElement {
  return <tbody className={cn(styles.tableBody, className)} {...props} />;
}

function TableFooter({
  className,
  ...props
}: React.ComponentProps<'tfoot'>): React.ReactElement {
  return <tfoot className={cn(styles.tableFooter, className)} {...props} />;
}

function TableRow({
  className,
  ...props
}: React.ComponentProps<'tr'>): React.ReactElement {
  return <tr className={cn(styles.tableRow, className)} {...props} />;
}

function TableHead({
  className,
  ...props
}: React.ComponentProps<'th'>): React.ReactElement {
  return <th className={cn(styles.tableHead, className)} {...props} />;
}

function TableCell({
  className,
  ...props
}: React.ComponentProps<'td'>): React.ReactElement {
  return <td className={cn(styles.tableCell, className)} {...props} />;
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<'caption'>): React.ReactElement {
  return <caption className={cn(styles.tableCaption, className)} {...props} />;
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
