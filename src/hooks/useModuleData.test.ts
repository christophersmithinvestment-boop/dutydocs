import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useModuleData } from './useModuleData';

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
