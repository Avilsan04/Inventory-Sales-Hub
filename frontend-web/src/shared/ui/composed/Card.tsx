import * as React from 'react';
import { cn } from '@shared/lib/cn';
import styles from '@shared/styles/themes/components/Card.module.scss';

function Card({
  className,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  return <div className={cn(styles.card, className)} {...props} />;
}

function CardHeader({
  className,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  return <div className={cn(styles.cardHeader, className)} {...props} />;
}

function CardTitle({
  className,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  return <div className={cn(styles.cardTitle, className)} {...props} />;
}

function CardDescription({
  className,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  return <div className={cn(styles.cardDescription, className)} {...props} />;
}

function CardAction({
  className,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  return <div className={cn(styles.cardAction, className)} {...props} />;
}

function CardContent({
  className,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  return <div className={cn(styles.cardContent, className)} {...props} />;
}

function CardFooter({
  className,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  return <div className={cn(styles.cardFooter, className)} {...props} />;
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
