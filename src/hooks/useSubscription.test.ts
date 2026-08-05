import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { User } from '@supabase/supabase-js';
import { useSubscription, MAX_FREE_RECORDS } from './useSubscription';

// The hook reads the signed-in user from AuthProvider; these tests drive
// that user directly rather than mounting the provider.
const currentUser = vi.hoisted(() => ({ value: null as Partial<User> | null }));

vi.mock('@/components/AuthProvider', () => ({
    useAuth: () => ({ user: currentUser.value, loading: false, signOut: vi.fn() }),
}));

function signedInAs(user: Partial<User> | null) {
    currentUser.value = user;
    return renderHook(() => useSubscription()).result.current;
}

const starter = (email = 'starter@example.com'): Partial<User> => ({
    email,
    app_metadata: { plan: 'starter' },
    user_metadata: {},
});

const pro = (email = 'pro@example.com'): Partial<User> => ({
    email,
    app_metadata: { plan: 'pro' },
    user_metadata: {},
});

// The 11 Pro-only modules, as nav-slug names — the vocabulary
// hasModuleAccess() is actually called with (href.replace(/-/g, "_")).
const PRO_ONLY_MODULES = [
    'permits',
    'asset_register',
    'ppe_register',
    'inspections',
    'first_aid',
    'emergency_contacts',
    'training_records',
    'fire_drills',
    'toolbox_talks',
    'dse',
    'manual_handling',
];

const CORE_SLUGS = ['risk_assessment', 'coshh', 'rams', 'incidents', 'near_miss'];

describe('useSubscription tier resolution', () => {
    it('treats a user with no plan at all as Starter', () => {
        const { isPro, isStarter } = signedInAs({ email: 'nobody@example.com', app_metadata: {} });
        expect(isPro).toBe(false);
        expect(isStarter).toBe(true);
    });

    it('reads Pro from app_metadata', () => {
        expect(signedInAs(pro()).isPro).toBe(true);
    });

    // This is the vulnerability this whole change exists to close.
    // supabase.auth.updateUser({ data: { plan: 'pro' } }) writes
    // user_metadata, which any signed-in user can call. It must not
    // move the tier needle.
    it('ignores a self-granted plan in user_metadata', () => {
        const forged: Partial<User> = {
            email: 'attacker@example.com',
            app_metadata: { plan: 'starter' },
            user_metadata: { plan: 'pro' },
        };
        const { isPro, isStarter, plan } = signedInAs(forged);
        expect(isPro).toBe(false);
        expect(isStarter).toBe(true);
        expect(plan).toBe('starter');
    });

    it('ignores user_metadata even when app_metadata is absent', () => {
        const forged: Partial<User> = {
            email: 'attacker@example.com',
            user_metadata: { plan: 'pro' },
        };
        expect(signedInAs(forged).isPro).toBe(false);
    });

    it('keeps the TEMP_TEST_EMAILS override working', () => {
        // Bianca's whitelist access is deliberately preserved; removing it
        // is a separate parked task.
        expect(signedInAs(starter('bianca.byrne1@icloud.com')).isPro).toBe(true);
        expect(signedInAs(starter('BIANCA.BYRNE1@ICLOUD.COM')).isPro).toBe(true);
    });

    it('keeps the master emails working', () => {
        expect(signedInAs(starter('christophersmithinvestment@gmail.com')).isPro).toBe(true);
        expect(signedInAs(starter('hello@dutydocsapp.com')).isPro).toBe(true);
    });
});

describe('module access', () => {
    // Forced-failure case per gated module: a Starter account must be
    // refused every one of the 11 Pro modules.
    it.each(PRO_ONLY_MODULES)('denies %s to a Starter account', (moduleName) => {
        expect(signedInAs(starter()).hasModuleAccess(moduleName)).toBe(false);
    });

    it.each(PRO_ONLY_MODULES)('allows %s to a Pro account', (moduleName) => {
        expect(signedInAs(pro()).hasModuleAccess(moduleName)).toBe(true);
    });

    it.each(CORE_SLUGS)('allows core module %s to a Starter account', (moduleName) => {
        expect(signedInAs(starter()).hasModuleAccess(moduleName)).toBe(true);
    });

    it.each(PRO_ONLY_MODULES)('denies %s to a forged user_metadata Pro', (moduleName) => {
        const forged: Partial<User> = {
            email: 'attacker@example.com',
            user_metadata: { plan: 'pro' },
        };
        expect(signedInAs(forged).hasModuleAccess(moduleName)).toBe(false);
    });
});

describe('record cap', () => {
    it('caps a Starter account at the free limit', () => {
        const { isLimitReached } = signedInAs(starter());
        expect(isLimitReached(MAX_FREE_RECORDS - 1)).toBe(false);
        expect(isLimitReached(MAX_FREE_RECORDS)).toBe(true);
        expect(isLimitReached(MAX_FREE_RECORDS + 10)).toBe(true);
    });

    it('does not cap a Pro account', () => {
        expect(signedInAs(pro()).isLimitReached(MAX_FREE_RECORDS * 100)).toBe(false);
    });

    it('does not let a forged user_metadata plan lift the cap', () => {
        const forged: Partial<User> = {
            email: 'attacker@example.com',
            user_metadata: { plan: 'pro' },
        };
        expect(signedInAs(forged).isLimitReached(MAX_FREE_RECORDS)).toBe(true);
    });
});
