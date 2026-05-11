import * as React from 'react';
import styles from './DashboardShell.module.scss';

interface DashboardShellProps {
  children: React.ReactNode;
  className?: string;
}

interface SlotProps {
  children: React.ReactNode;
  className?: string;
  'aria-label'?: string;
}

function DashboardShellRoot({ children, className }: DashboardShellProps): React.ReactElement {
  return <div className={[styles['shell'], className].filter(Boolean).join(' ')}>{children}</div>;
}

function Header({ children, className }: SlotProps): React.ReactElement {
  return (
    <header className={[styles['header'], className].filter(Boolean).join(' ')}>{children}</header>
  );
}

function Main({ children, className }: SlotProps): React.ReactElement {
  return <main className={[styles['main'], className].filter(Boolean).join(' ')}>{children}</main>;
}

function Section({ children, className }: SlotProps): React.ReactElement {
  return (
    <section className={[styles['section'], className].filter(Boolean).join(' ')}>
      {children}
    </section>
  );
}

function KpiGrid({ children, className, 'aria-label': ariaLabel }: SlotProps): React.ReactElement {
  return (
    <section
      className={[styles['kpiGrid'], className].filter(Boolean).join(' ')}
      aria-label={ariaLabel}
    >
      {children}
    </section>
  );
}

function ChartsGrid({ children, className }: SlotProps): React.ReactElement {
  return (
    <div className={[styles['chartsGrid'], className].filter(Boolean).join(' ')}>{children}</div>
  );
}

function TablesGrid({ children, className }: SlotProps): React.ReactElement {
  return (
    <div className={[styles['tablesGrid'], className].filter(Boolean).join(' ')}>{children}</div>
  );
}

export const DashboardShell = Object.assign(DashboardShellRoot, {
  Header,
  Main,
  Section,
  KpiGrid,
  ChartsGrid,
  TablesGrid,
});
