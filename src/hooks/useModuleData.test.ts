import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useModuleData } from './useModuleData';
import { saveToStore, loadFromStore } from '@/lib/utils';

// Mock database and utils
vi.mock('@/lib/database', () => ({
    loadRecords: vi.fn(),
    saveRecord: vi.fn(),
    deleteRecord: vi.fn(),
    updateRecord: vi.fn(),
    saveRecords: vi.fn(),
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

const adjustUsage = vi.fn();
const refreshUsage = vi.fn().mockResolvedValue(undefined);

vi.mock('@/components/UsageProvider', () => ({
    useUsage: () => ({ totalRecords: 0, refreshUsage, adjustUsage })
}));

beforeEach(() => {
    showToast.mockClear();
    confirmSpy.mockClear();
    confirmSpy.mockResolvedValue(true);
    adjustUsage.mockClear();
    refreshUsage.mockClear();
    vi.mocked(saveToStore).mockReset();
    vi.mocked(loadFromStore).mockReturnValue([
        { id: '1', title: 'Test Record', status: 'active' },
        { id: '2', title: 'Example Draft', status: 'draft' },
        { id: '3', title: 'Another Active', status: 'active' }
    ]);
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

    it('does not move the usage count when a save fails', async () => {
        vi.mocked(saveToStore).mockImplementation(() => {
            throw new Error('boom');
        });

        const { result } = renderHook(() => useModuleData({ module: 'test', storeKey: 'test' }));
        await act(async () => { });

        await act(async () => {
            await result.current.addItem({ id: '4', title: 'New Record', status: 'active' });
        });

        expect(adjustUsage).not.toHaveBeenCalled();
    });

    it('increments usage once on a successful create and decrements on delete', async () => {
        const { result } = renderHook(() => useModuleData({ module: 'test', storeKey: 'test' }));
        await act(async () => { });

        await act(async () => {
            await result.current.addItem({ id: '4', title: 'New Record', status: 'active' });
        });
        expect(adjustUsage).toHaveBeenCalledWith(1);

        adjustUsage.mockClear();
        await act(async () => {
            await result.current.removeItem('1');
        });
        expect(adjustUsage).toHaveBeenCalledWith(-1);
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

describe('useModuleData load failures', () => {
    it('reports corrupt stored data instead of rendering an empty module', async () => {
        vi.mocked(loadFromStore).mockImplementation(() => {
            throw new Error("Saved data on this device is corrupted and couldn't be read.");
        });

        const { result } = renderHook(() => useModuleData({ module: 'test', storeKey: 'test' }));
        await act(async () => { });

        expect(result.current.loadError).toContain('corrupted');
        expect(result.current.items).toHaveLength(0);
        expect(showToast).toHaveBeenCalledWith(
            expect.stringContaining("Couldn't load records"),
            'error'
        );
    });

    it('leaves loadError null on a healthy load', async () => {
        const { result } = renderHook(() => useModuleData({ module: 'test', storeKey: 'test' }));
        await act(async () => { });

        expect(result.current.loadError).toBeNull();
        expect(result.current.items).toHaveLength(3);
    });
});

describe('useModuleData addItems', () => {
    it('persists every record in a single write', async () => {
        const { result } = renderHook(() => useModuleData({ module: 'test', storeKey: 'test' }));
        await act(async () => { });

        await act(async () => {
            await result.current.addItems([
                { id: 'a', title: 'First', status: 'active' },
                { id: 'b', title: 'Second', status: 'active' },
                { id: 'c', title: 'Third', status: 'active' }
            ]);
        });

        expect(saveToStore).toHaveBeenCalledTimes(1);
        const written = vi.mocked(saveToStore).mock.calls[0][1] as { id: string }[];
        expect(written.map(i => i.id)).toEqual(['a', 'b', 'c', '1', '2', '3']);
        expect(result.current.items).toHaveLength(6);
        expect(adjustUsage).toHaveBeenCalledWith(3);
    });

    it('rolls back the whole batch if the write fails', async () => {
        vi.mocked(saveToStore).mockImplementation(() => { throw new Error('boom'); });

        const { result } = renderHook(() => useModuleData({ module: 'test', storeKey: 'test' }));
        await act(async () => { });

        let returned: boolean | undefined;
        await act(async () => {
            returned = await result.current.addItems([
                { id: 'a', title: 'First', status: 'active' },
                { id: 'b', title: 'Second', status: 'active' }
            ]);
        });

        expect(returned).toBe(false);
        expect(result.current.items).toHaveLength(3);
        expect(adjustUsage).not.toHaveBeenCalled();
    });
});
