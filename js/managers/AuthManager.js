// managers/AuthManager.js
// Verantwoordelijk voor login/registratie en gebruikerssessie
export class AuthManager {
    #currentUser;
    #storageManager;

    constructor(storageManager) {
        this.#storageManager = storageManager;
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
        // Verwijder alle gebruikersgerelateerde data zodat de volgende gebruiker met schone data begint
        if (this.#storageManager) {
            this.#storageManager.clearAllUserData();
        }
    }

    getCurrentUser() {
        return this.#currentUser || 'Gast';
    }

    isLoggedIn() {
        return this.#currentUser !== null;
    }

    // Controleer of de gebruiker een gast is (geen echte account)
    // Dit is dé plek waar we bepalen wat een gast is - nooit meer elders doen!
    isGuest() {
        return this.#currentUser === null || this.#currentUser === 'Gast';
    }
}