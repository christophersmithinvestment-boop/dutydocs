import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useModuleData } from './useModuleData';
import { saveToStore } from '@/lib/utils';

// Mock database and utils
vi.mock('@/lib/database', () => ({
    loadRecords: vi.fn(),
    saveRecord: vi.fn(),
    deleteRecord: vi.fn(),
    updateRecord: vi.fn(),
    migrateFromLocalStorage: vi.fn(),
    getTotalRecordCount: vi.fn().mockResolvedValue(3)
}));

vi.mock('@/lib/utils', () => ({
    loadFromStore: vi.fn().mockReturnValue([
        { id: '1', title: 'Test Record', status: 'active' },
        { id: '2', title: 'Example Draft', status: 'draft' },
        { id: '3', title: 'Another Active', status: 'active' }
    ]),
    saveToStore: vi.fn(),
    isClient: vi.fn().mockReturnValue(true)
}));

vi.mock('@/lib/supabase', () => ({
    isSupabaseConfigured: false // Force local storage mode for easier testing
}));

// The hook depends on the confirm dialog and toast providers; these tests
// exercise the hook itself, so stub them rather than mounting the UI.
const showToast = vi.fn();
const confirmSpy = vi.fn().mockResolvedValue(true);

vi.mock('@/components/ui/ConfirmDialog', () => ({
    useConfirm: () => confirmSpy
}));

vi.mock('@/components/ui/Toast', () => ({
    useToast: () => ({ showToast })
}));

beforeEach(() => {
    showToast.mockClear();
    confirmSpy.mockClear();
    confirmSpy.mockResolvedValue(true);
    vi.mocked(saveToStore).mockReset();
});

describe('useModuleData filtering', () => {
    it('filters by search term', async () => {
        const { result } = renderHook(() => useModuleData({ module: 'test', storeKey: 'test' }));

        await act(async () => {
            // Wait for useEffect
        });

        act(() => {
            result.current.setSearchTerm('Example');
        });

        expect(result.current.filteredItems).toHaveLength(1);
        expect(result.current.filteredItems[0].title).toBe('Example Draft');
    });

    it('filters by status', async () => {
        const { result } = renderHook(() => useModuleData({ module: 'test', storeKey: 'test' }));

        await act(async () => {
            // Wait for useEffect
        });

        act(() => {
            result.current.setStatusFilter('active');
        });

        expect(result.current.filteredItems).toHaveLength(2);
        expect(result.current.filteredItems.every(i => i.status === 'active')).toBe(true);
    });

    it('combines search and status filters', async () => {
        const { result } = renderHook(() => useModuleData({ module: 'test', storeKey: 'test' }));

        await act(async () => {
            // Wait for useEffect
        });

        act(() => {
            result.current.setSearchTerm('Another');
            result.current.setStatusFilter('active');
        });

        expect(result.current.filteredItems).toHaveLength(1);
        expect(result.current.filteredItems[0].title).toBe('Another Active');
    });
});

describe('useModuleData write failures', () => {
    it('addItem resolves false and rolls back when the save throws', async () => {
        vi.mocked(saveToStore).mockImplementation(() => {
            throw new Error('This device is out of storage space for DutyDocs.');
        });

        const { result } = renderHook(() => useModuleData({ module: 'test', storeKey: 'test' }));
        await act(async () => { });

        let returned: boolean | undefined;
        await act(async () => {
            returned = await result.current.addItem({ id: '4', title: 'New Record', status: 'active' });
        });

        expect(returned).toBe(false);
        expect(result.current.items).toHaveLength(3);
        expect(result.current.items.find(i => i.id === '4')).toBeUndefined();
        expect(showToast).toHaveBeenCalledWith(
            expect.stringContaining("Couldn't save"),
            'error'
        );
    });

    it('addItem resolves true and keeps the record when the save succeeds', async () => {
        const { result } = renderHook(() => useModuleData({ module: 'test', storeKey: 'test' }));
        await act(async () => { });

        let returned: boolean | undefined;
        await act(async () => {
            returned = await result.current.addItem({ id: '4', title: 'New Record', status: 'active' });
        });

        expect(returned).toBe(true);
        expect(result.current.items).toHaveLength(4);
        expect(showToast).not.toHaveBeenCalledWith(
            expect.stringContaining("Couldn't save"),
            'error'
        );
    });

    it('editItem restores the previous version when the save throws', async () => {
        vi.mocked(saveToStore).mockImplementation(() => {
            throw new Error('boom');
        });

        const { result } = renderHook(() => useModuleData({ module: 'test', storeKey: 'test' }));
        await act(async () => { });

        let returned: boolean | undefined;
        await act(async () => {
            returned = await result.current.editItem('1', { id: '1', title: 'Renamed', status: 'active' });
        });

        expect(returned).toBe(false);
        expect(result.current.items.find(i => i.id === '1')?.title).toBe('Test Record');
        expect(showToast).toHaveBeenCalledWith(
            expect.stringContaining("Couldn't save changes"),
            'error'
        );
    });

    it('removeItem restores the record when the delete throws', async () => {
        vi.mocked(saveToStore).mockImplementation(() => {
            throw new Error('boom');
        });

        const { result } = renderHook(() => useModuleData({ module: 'test', storeKey: 'test' }));
        await act(async () => { });

        await act(async () => {
            await result.current.removeItem('1');
        });

        expect(result.current.items).toHaveLength(3);
        expect(result.current.items.find(i => i.id === '1')).toBeDefined();
        expect(showToast).toHaveBeenCalledWith(
            expect.stringContaining("Couldn't delete"),
            'error'
        );
    });

    it('removeItem does nothing when the confirmation is declined', async () => {
        confirmSpy.mockResolvedValue(false);

        const { result } = renderHook(() => useModuleData({ module: 'test', storeKey: 'test' }));
        await act(async () => { });

        await act(async () => {
            await result.current.removeItem('1');
        });

        expect(result.current.items).toHaveLength(3);
        expect(saveToStore).not.toHaveBeenCalled();
        expect(showToast).not.toHaveBeenCalled();
    });
});
