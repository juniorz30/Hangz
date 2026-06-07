// app.js - Hoofdapplicatie met compositie van alle managers
import { AuthManager } from './managers/AuthManager.js';
import { StorageManager } from './managers/StorageManager.js';
import { MapManager } from './managers/MapManager.js';
import { UIManager } from './managers/UIManager.js';
import { Spot } from './models/Spot.js';
import { generateId } from './utils/helpers.js';

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
        // Data laden
        this.spots = this.storage.loadSpots();
        
        // Herstel sessie van Supabase, NIEUW: wacht op Supabase voor je over de UI-state beslist
        await this.auth.restoreSession();
        
        // Check login status
        if (this.auth.isLoggedIn()) {
            this.ui.setLoggedInUser(this.auth.getCurrentUser());
            this.ui.showAddHint(true);
        } else {
            this.ui.setLoggedOut();
            this.showLoginModal();
        }
        
        // Kaart initialiseren
        this.mapManager.init(51.05, 4.38, 12);
        this.refreshMarkers();
        // Event listeners setup
        this.setupEventListeners();
        // Laat profiel zien als die actief is (standaard kaart)
        this.ui.switchView('map');
        // Update UI voor profiel later
        this.updateProfileUI();

        // Reageer op auth-wijzigingen van overal (andere tabs, token-expiry, enz.)
        this.auth.onChange(() => {
            if (this.auth.isLoggedIn()) {
                this.ui.setLoggedInUser(this.auth.getCurrentUser());
                this.ui.showAddHint(true);
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

        const showError = (msg) => { errorBox.textContent = msg; errorBox.style.display = 'block'; };
        const clearError = () => { errorBox.textContent = ''; errorBox.style.display = 'none'; };

        loginBtn.onclick = async () => {
            clearError();
            try {
                await this.auth.login(emailInput.value.trim(), passwordInput.value);
                overlay.style.display = 'none';
                // onAuthStateChange werkt de rest van de UI bij.
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
    }

    refreshMarkers() {
        this.mapManager.renderMarkers(this.spots, this.currentFilter);
    }

    setupEventListeners() {
        // Sidebar
        this.ui.menuBtn.addEventListener('click', () => this.ui.openSidebar());
        this.ui.closeSidebarBtn.addEventListener('click', () => this.ui.closeSidebar());
        this.ui.overlay.addEventListener('click', () => this.ui.closeSidebar());

        // Filter buttons
        this.ui.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.ui.filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.getAttribute('data-filter');
                this.refreshMarkers();
            });
        });
        // Navigatie
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
        // Tour button
        if (this.ui.tourBtn) {
            this.ui.tourBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.ui.openPanel('tutorial');
            });
        }
        // My Spots button
        if (this.ui.mySpotsBtn) {
            this.ui.mySpotsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.updateMySpotsPanel();
                this.ui.openPanel('myspots');
            });
        }
        // Sidebar links (panels)
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const panel = link.getAttribute('data-panel');
                this.ui.closeSidebar();
                if (panel === 'addspot') this.ui.openPanel('addspot');
            });
        });
        // Close panel buttons
        this.ui.closePanelBtns.forEach(btn => {
            btn.addEventListener('click', () => this.ui.closeAllPanels());
        });
        // Kaart klik (alleen als niet-gast)
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
        // Add spot form submit
        this.ui.addSpotForm.addEventListener('submit', (e) => {
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
            const newId = generateId();
            const newSpot = new Spot(newId, name, category, description || 'Geen beschrijving', this.selectedLocation.lat, this.selectedLocation.lng, this.auth.getCurrentUser(), [], null);
            this.spots.push(newSpot);
            this.storage.saveSpots(this.spots);
            this.refreshMarkers();
            this.ui.closeAllPanels();
            this.ui.resetAddSpotForm();
            this.selectedLocation = null;
            this.ui.showNotification('Spot toegevoegd!');
            this.updateProfileUI();
        });
        this.ui.cancelAddBtn.addEventListener('click', () => {
            this.ui.closeAllPanels();
            this.selectedLocation = null;
        });
        // Marker click handler - alleen niet-gasten mogen beoordelen
        this.mapManager.onMarkerClick = (spot) => {
            if (this.auth.isGuest()) {
                this.ui.showNotification('Log in om te beoordelen', 'error');
                return;
            }
            const currentUserRating = spot.getUserRating();
            this.ui.openSpotModal(spot, currentUserRating, (rating) => {
                // rating toevoegen
                spot.addRating(rating, this.auth.getCurrentUser());
                this.storage.saveSpots(this.spots);
                this.refreshMarkers();
                this.ui.closeSpotModal();
                this.ui.showNotification('Beoordeling opgeslagen');
                this.updateProfileUI();
            });
        };
        // Bind marker clicks via Leaflet's popupopen event
        this.mapManager.getMap().on('popupopen', (e) => {
            const marker = e.popup._source;
            const spot = this.spots.find(s => s.getId() === marker.spotId);
            if (spot) this.mapManager.onMarkerClick(spot);
        });
        // Logout
        this.ui.logoutBtn.addEventListener('click', async () 
        => {
            try {
                await this.auth.logout();
                this.ui.showNotification('Uitgelogd');
                // setLoggedOut / refreshMarkers / showLoginModal gebeuren automatisch
                // via de onChange-subscription die in init() is opgezet.
            } catch (err) {
                this.ui.showNotification(err.message || 'Uitloggen mislukt', 'error');
            }
        });
        // Features CTA
        const cta = document.getElementById('featuresCtaBtn');
        if (cta) cta.addEventListener('click', () => this.ui.switchView('map'));
    }

    updateProfileUI() {
        const currentUser = this.auth.getCurrentUser();
        const userSpots = this.spots.filter(spot => spot.getAddedBy() === currentUser);
        let userRatingsCount = 0;
        for (let i = 0; i < this.spots.length; i++) {
            if (this.spots[i].getUserRating() !== null) userRatingsCount++;
        }
        this.ui.updateProfileUI(currentUser, userSpots, userRatingsCount);
    }

    updateMySpotsPanel() {
        const currentUser = this.auth.getCurrentUser();
        const userSpots = this.spots.filter(spot => spot.getAddedBy() === currentUser);
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

// Start de app zodra DOM geladen is
document.addEventListener('DOMContentLoaded', () => {
    window.app = new HangzApp();
    window.app.init().catch(err => {
        console.error('App kon niet starten:', err);
        alert('Er ging iets mis bij het opstarten van de app. Check de console.');
    });
});

await sb.auth.signUp({ email, password }); 
await sb.auth.signInWithPassword({ email, password }); 
await sb.auth.signOut();
const { data: { session } } = await sb.auth.getSession()