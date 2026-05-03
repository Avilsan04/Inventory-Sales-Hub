export type UOM = 'unit' | 'kg' | 'litre' | 'box' | 'pack';

export const UOM_OPTIONS: Array<{ value: UOM; label: string }> = [
  { value: 'unit', label: 'Unit' },
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'litre', label: 'Litre (L)' },
  { value: 'box', label: 'Box' },
  { value: 'pack', label: 'Pack' },
];

export function formatQuantityWithUom(qty: number, uom: UOM): string {
  const unit = UOM_OPTIONS.find((o) => o.value === uom)?.label ?? uom;
  return `${qty} ${unit}`;
}
