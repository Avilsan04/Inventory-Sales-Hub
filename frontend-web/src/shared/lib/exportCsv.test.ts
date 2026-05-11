import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportToCsv } from './exportCsv';

describe('exportToCsv', () => {
    let anchorClick: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        anchorClick = vi.fn();
        const mockAnchor = { click: anchorClick, href: '', download: '' } as unknown as HTMLAnchorElement;
        vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor);
        vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockAnchor);
        vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockAnchor);
        vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock');
        vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    });

    afterEach(() => { vi.restoreAllMocks(); });

    it('does nothing when data is empty', () => {
        exportToCsv([], 'test');
        expect(anchorClick).not.toHaveBeenCalled();
    });

    it('triggers download when data has rows', () => {
        exportToCsv([{ name: 'Item', qty: 5 }], 'inventory');
        expect(anchorClick).toHaveBeenCalledOnce();
    });

    it('does nothing when first row is undefined', () => {
        exportToCsv([], 'test');
        expect(anchorClick).not.toHaveBeenCalled();
    });

    it('calls revokeObjectURL after click to free memory', () => {
        const revoke = vi.spyOn(URL, 'revokeObjectURL');
        exportToCsv([{ x: 1 }], 'test');
        expect(revoke).toHaveBeenCalledWith('blob:mock');
    });
});
