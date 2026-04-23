import * as React from 'react';

export function BrandMark({ size = 32 }: { size?: number }): React.ReactElement {
  return (
    <img
      src="/logo-mark.svg"
      alt="ISH"
      width={size}
      height={size}
      style={{ flexShrink: 0, borderRadius: size * 0.125 }}
    />
  );
}
