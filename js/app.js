import { AuthManager } from './managers/AuthManager.js';
import { StorageManager } from './managers/StorageManager.js';
import { MapManager } from './managers/MapManager.js';
import { UIManager } from './managers/UIManager.js';

class HangzApp {
    constructor() {
        this.storage = new StorageManager();
        this.auth = new AuthManager(this.storage);
        this.mapManager = new MapManager();
        this.ui = new UIManager();
        this.spots = [];
        this.currentFilter = 'all';
        this.selectedLocation = null;
    }

    async init() {
        await this.auth.restoreSession();
        
        this.spots = await this.storage.loadSpots(this.auth.getUserId());
        
        if (this.auth.isLoggedIn()) {
            this.ui.setLoggedInUser(this.auth.getCurrentUser());
            this.ui.showAddHint(true);
            this.hideLoginModal();
        } else {
            this.ui.setLoggedOut();
            this.showLoginModal();
        }
        
        this.mapManager.init(51.05, 4.38, 12);
        this.refreshMarkers();
        this.setupEventListeners();
        this.ui.switchView('map');
        this.updateProfileUI();

        // Reageer op login/logout wijzigingen van Supabase.
        this.auth.onChange(async () => {
            this.spots = await this.storage.loadSpots(this.auth.getUserId());
            if (this.auth.isLoggedIn()) {
                this.ui.setLoggedInUser(this.auth.getCurrentUser());
                this.ui.showAddHint(true);
                this.hideLoginModal(); 
            } else if (!this.auth.isGuestMode) {
                this.ui.setLoggedOut();
                this.showLoginModal();
            }
            this.refreshMarkers();
            this.updateProfileUI();
        });
    }

    showLoginModal() {
        const overlay = document.getElementById('loginOverlay');
        const loginBtn = document.getElementById('doLoginBtn');
        const registerBtn = document.getElementById('doRegisterBtn');
        const guestBtn = document.getElementById('guestLoginBtn');
        const emailInput = document.getElementById('loginEmail');
        const passwordInput = document.getElementById('loginPassword');
        const errorBox = document.getElementById('loginError');

        const showError = (msg) => { errorBox.textContent = msg; errorBox.classList.add('show'); };
        const clearError = () => { errorBox.textContent = ''; errorBox.classList.remove('show'); };

        loginBtn.onclick = async () => {
            clearError();
            try {
                await this.auth.login(emailInput.value.trim(), passwordInput.value);
                overlay.style.display = 'none';
            } catch (err) {
                showError(err.message || 'Inloggen mislukt');
            }
        };

        registerBtn.onclick = async () => {
            clearError();
            try {
                const { session } = await this.auth.register(emailInput.value.trim(), passwordInput.value);
                if (!session) {
                    showError('Account aangemaakt — controleer je e-mail om te bevestigen.');
                } else {
                    overlay.style.display = 'none';
                }
            } catch (err) {
                showError(err.message || 'Registratie mislukt');
            }
        };

        guestBtn.onclick = () => {
            this.auth.loginAsGuest();
            this.ui.setLoggedInUser('Gast');
            this.ui.showAddHint(false);
            overlay.style.display = 'none';
            this.updateProfileUI();
        };

        overlay.style.display = 'flex';
    }

    hideLoginModal() { 
        const overlay = document.getElementById('loginOverlay');
        overlay.style.display = 'none';
    }

    refreshMarkers() {
        this.mapManager.renderMarkers(this.spots, this.currentFilter);
    }

    setupEventListeners() {
        this.ui.menuBtn.addEventListener('click', () => this.ui.toggleSidebar());
        this.ui.closeSidebarBtn.addEventListener('click', () => this.ui.closeSidebar());
        this.ui.overlay.addEventListener('click', () => this.ui.closeSidebar());

        this.ui.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.ui.filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.getAttribute('data-filter');
                this.refreshMarkers();
            });
        });
        this.ui.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const view = link.getAttribute('data-view');
                this.ui.switchView(view);
                if (view === 'map') {
                    this.mapManager.invalidateSize();
                    this.refreshMarkers();
                } else if (view === 'profile') {
                    this.updateProfileUI();
                }
            });
        });
        if (this.ui.tourBtn) {
            this.ui.tourBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.ui.openPanel('tutorial');
            });
        }
        if (this.ui.mySpotsBtn) {
            this.ui.mySpotsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.updateMySpotsPanel();
                this.ui.openPanel('myspots');
            });
        }
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const panel = link.getAttribute('data-panel');
                this.ui.closeSidebar();
                if (panel === 'addspot') this.ui.openPanel('addspot');
            });
        });
        this.ui.closePanelBtns.forEach(btn => {
            btn.addEventListener('click', () => this.ui.closeAllPanels());
        });
        this.mapManager.onMapClick((e) => {
            if (this.auth.isGuest()) {
                this.ui.showNotification('Log in om spots toe te voegen', 'error');
                return;
            }
            this.selectedLocation = e.latlng;
            this.ui.setSelectedCoords(e.latlng.lat, e.latlng.lng);
            this.ui.openPanel('addspot');
            this.ui.showAddHint(false);
        });
        this.ui.addSpotForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!this.selectedLocation) {
                this.ui.showNotification('Klik eerst op de kaart', 'error');
                return;
            }
            const formData = this.ui.getAddSpotFormData();
            if (formData.error) {
                this.ui.showNotification(formData.error, 'error');
                return;
            }
            const { name, category, description } = formData;
            if (!name) {
                this.ui.showNotification('Naam is verplicht', 'error');
                return;
            }
            if (!category) {
                this.ui.showNotification('Categorie is verplicht', 'error');
                return;
            }
            try {
                const newSpot = await this.storage.addSpot({
                    name,
                    category,
                    description: description || 'Geen beschrijving',
                    lat: this.selectedLocation.lat,
                    lng: this.selectedLocation.lng
                });
                this.spots.push(newSpot);
                this.refreshMarkers();
                this.ui.closeAllPanels();
                this.ui.resetAddSpotForm();
                this.selectedLocation = null;
                this.ui.showNotification('Spot toegevoegd!');
                this.updateProfileUI();
            } catch (err) {
                this.ui.showNotification(err.message || 'Fout bij toevoegen', 'error');
            }
        });
        this.ui.cancelAddBtn.addEventListener('click', () => {
            this.ui.closeAllPanels();
            this.selectedLocation = null;
        });
        // Alleen ingelogde gebruikers mogen beoordelen.
        this.mapManager.onMarkerClick = (spot) => {
            if (this.auth.isGuest()) {
                this.ui.showNotification('Log in om te beoordelen', 'error');
                return;
            }
            const currentUserRating = spot.getUserRating();
            this.ui.openSpotModal(spot, currentUserRating, async (rating) => {
                try {
                    await this.storage.rateSpot(spot.getId(), rating);
                    this.spots = await this.storage.loadSpots(this.auth.getUserId());
                    this.refreshMarkers();
                    this.ui.closeSpotModal();
                    this.ui.showNotification('Beoordeling opgeslagen');
                    this.updateProfileUI();
                } catch (err) {
                    this.ui.showNotification(err.message || 'Fout bij beoordeling', 'error');
                }
            });
        };
        this.mapManager.getMap().on('popupopen', (e) => {
            const marker = e.popup._source;
            const spot = this.spots.find(s => s.getId() === marker.spotId);
            if (spot) this.mapManager.onMarkerClick(spot);
        });
        this.ui.logoutBtn.addEventListener('click', async () => {
            try {
                await this.auth.logout();
                this.ui.showNotification('Uitgelogd');
            } catch (err) {
                this.ui.showNotification(err.message || 'Uitloggen mislukt', 'error');
            }
        });
        const cta = document.getElementById('featuresCtaBtn');
        if (cta) cta.addEventListener('click', () => this.ui.switchView('map'));
    }

    updateProfileUI() {
        const currentUser = this.auth.getCurrentUser();
        const userSpots = this.spots.filter(spot => spot.getAddedBy() === this.auth.getUserId());
        let userRatingsCount = 0;
        for (let i = 0; i < this.spots.length; i++) {
            if (this.spots[i].getUserRating() !== null) userRatingsCount++;
        }
        this.ui.updateProfileUI(currentUser, userSpots, userRatingsCount);
    }

    updateMySpotsPanel() {
        const currentUser = this.auth.getCurrentUser();
        const userSpots = this.spots.filter(spot => spot.getAddedBy() === this.auth.getUserId());
        if (userSpots.length === 0) {
            this.ui.mySpotsListPanel.innerHTML = '<p class="empty">Nog geen spots toegevoegd</p>';
        } else {
            const html = userSpots.map(spot => `
                <div class="user-spot-item">
                    <span><span data-lucide="map-pin"></span> ${spot.getName()}</span>
                    <span>⭐ ${spot.getAverageRating().toFixed(1)}</span>
                </div>
            `).join('');
            this.ui.mySpotsListPanel.innerHTML = html;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new HangzApp();
    window.app.init().catch(err => {
        console.error('App kon niet starten:', err);
        alert('Er ging iets mis bij het opstarten van de app. Check de console.');
    });
});
