import * as React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { expect, describe, it } from 'vitest';
import { Button } from '../../../src/shared/ui/primitives/Button';

expect.extend(toHaveNoViolations);

describe('Button — accessibility (WCAG)', () => {
  it('has no axe violations — default button', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no axe violations — destructive variant', async () => {
    const { container } = render(<Button variant="destructive">Delete</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no axe violations — disabled state', async () => {
    const { container } = render(<Button disabled>Disabled</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no axe violations — icon button with aria-label', async () => {
    const { container } = render(
      <Button size="icon-sm" aria-label="Delete item">
        <span aria-hidden="true">×</span>
      </Button>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
