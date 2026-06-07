// managers/AuthManager.js
import { supabase } from '../supabaseClient.js';

export class AuthManager {
    constructor(storageManager) {
        this.storageManager = storageManager;
        this.currentUser = null;      // een Supabase User object, of null
        this.isGuestMode = false;     // true als de gebruiker "verder als gast" koos
        this._listeners = new Set();  // app-side subscribers
    }

    // Eén keer aanroepen bij het opstarten van de app, voordat je beslist of je de login-modal toont.
    async restoreSession() {
        const { data: { session } } = await supabase.auth.getSession();
        this.currentUser = session?.user ?? null;

        // Reageer op toekomstige wijzigingen (login vanuit een ander tabblad, token-refresh, uitloggen, enz.)
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
        // Als e-mailbevestiging AAN staat, is data.session null totdat de gebruiker op de link klikt.
        this.isGuestMode = false;  // een echte registratie verlaat de gastmodus
        return data;
    }

    async login(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        this.isGuestMode = false;  // een echte login verlaat de gastmodus
        return data;
    }

    async logout() {
        // De default scope is 'global', wat de gebruiker uitlogt op ELK apparaat.
        // 'local' is wat de meeste apps eigenlijk willen.
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
            // Gebruik de e-mail als displaynaam. Vervang dit later door een `profiles`-tabel
            // als je usernames los wilt hebben van e-mailadressen.
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