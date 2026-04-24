// managers/AuthManager.js
// Verantwoordelijk voor login/registratie en gebruikerssessie
export class AuthManager {
    #currentUser;

    constructor() {
        const stored = localStorage.getItem('hangz_user');
        this.#currentUser = stored || null;
    }

    // Inloggen (mock - later Supabase)
    login(username, password) {
        if (!username || username.trim() === '') return false;
        this.#currentUser = username.trim();
        localStorage.setItem('hangz_user', this.#currentUser);
        return true;
    }

    register(username, password) {
        return this.login(username, password);
    }

    logout() {
        this.#currentUser = null;
        localStorage.removeItem('hangz_user');
    }

    getCurrentUser() {
        return this.#currentUser || 'Gast';
    }

    isLoggedIn() {
        return this.#currentUser !== null;
    }
}