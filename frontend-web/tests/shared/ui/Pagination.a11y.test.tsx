import * as React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { expect, describe, it } from 'vitest';
import { Pagination } from '../../../src/shared/ui/primitives/Pagination';

expect.extend(toHaveNoViolations);

describe('Pagination — accessibility (WCAG)', () => {
  it('has no axe violations on page 1', async () => {
    const { container } = render(
      <Pagination page={1} pageCount={5} onPageChange={() => undefined} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no axe violations on a middle page', async () => {
    const { container } = render(
      <Pagination page={3} pageCount={5} onPageChange={() => undefined} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no axe violations on last page', async () => {
    const { container } = render(
      <Pagination page={5} pageCount={5} onPageChange={() => undefined} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no axe violations with page size selector', async () => {
    const { container } = render(
      <Pagination
        page={2}
        pageCount={10}
        onPageChange={() => undefined}
        pageSize={10}
        onPageSizeChange={() => undefined}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
