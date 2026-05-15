import * as React from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@shared/ui/composed';

interface WarehouseFilterProps {
  warehouses?: Array<{ id: string; name: string; isActive: boolean }>;
  value: string | null;
  onValueChange: (id: string | null) => void;
  placeholder: string;
  allLabel: string;
}

export function WarehouseFilter({
  warehouses,
  value,
  onValueChange,
  placeholder,
  allLabel,
}: WarehouseFilterProps): React.ReactElement | null {
  if (!warehouses || warehouses.length === 0) return null;
  return (
    <Select
      value={value ?? ''}
      onValueChange={(val) => {
        onValueChange(val !== '' ? val : null);
      }}
    >
      <SelectTrigger size="sm" aria-label={placeholder}>
        <SelectValue placeholder={allLabel} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">{allLabel}</SelectItem>
        {warehouses
          .filter((w) => w.isActive)
          .map((w) => (
            <SelectItem key={w.id} value={w.id}>
              {w.name}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
}
