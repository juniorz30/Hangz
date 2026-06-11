import { supabase } from '../supabaseClient.js';

export class AuthManager {
    constructor(storageManager) {
        this.storageManager = storageManager;
        this.currentUser = null;
        this.isGuestMode = false;
        this._listeners = new Set();
    }

    async restoreSession() {
        const { data: { session } } = await supabase.auth.getSession();
        this.currentUser = session?.user ?? null;

        supabase.auth.onAuthStateChange((_event, session) => {
            this.currentUser = session?.user ?? null;
            this._listeners.forEach(fn => fn(this.currentUser));
        });

        return this.currentUser;
    }

    onChange(fn) {
        this._listeners.add(fn);
        return () => this._listeners.delete(fn);
    }

    async register(email, password) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        this.isGuestMode = false;
        return data;
    }

    async login(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        this.isGuestMode = false;
        return data;
    }

    async logout() {
        const { error } = await supabase.auth.signOut({ scope: 'local' });
        if (error) throw error;
        this.isGuestMode = false;
        if (this.storageManager) this.storageManager.clearAllUserData();
    }

    loginAsGuest() {
        this.isGuestMode = true;
        this.currentUser = null;
    }

    getCurrentUser() {
        if (this.currentUser) {
            return this.currentUser.email;
        }
        return 'Gast';
    }

    getUserId() {
        return this.currentUser?.id ?? null;
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    isGuest() {
        return this.currentUser === null;
    }
}
