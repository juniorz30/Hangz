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

    init() {
        // Data laden
        this.spots = this.storage.loadSpots();
        // Check login status
        const isLoggedIn = this.auth.isLoggedIn();
        if (!isLoggedIn) {
            this.ui.setLoggedOut();
            this.showLoginModal();
        } else {
            this.ui.setLoggedInUser(this.auth.getCurrentUser());
            this.ui.showAddHint(true);
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
    }

    showLoginModal() {
        const loginOverlay = document.getElementById('loginOverlay');
        const doRegister = document.getElementById('doRegisterBtn');
        const guest = document.getElementById('guestLoginBtn');
        const usernameInput = document.getElementById('loginUsername');

        if (!loginOverlay || !doRegister || !guest) {
            console.error('Login elements not found!');
            return;
        }

        // DOORGAAN (registreren) BUTTON
        doRegister.addEventListener('click', () => {
            const user = usernameInput.value.trim();
            if (!user) {
                alert('Voer een gebruikersnaam in');
                return;
            }
            if (this.auth.register(user, '')) {
                this.ui.setLoggedInUser(user);
                this.ui.showAddHint(true);
                loginOverlay.style.display = 'none';
                this.updateProfileUI();
            } else {
                alert('Registratie mislukt');
            }
        });

        // GAST BUTTON
        guest.addEventListener('click', () => {
            this.auth.login('Gast', '');
            this.ui.setLoggedInUser('Gast');
            this.ui.showAddHint(false);
            loginOverlay.style.display = 'none';
            this.updateProfileUI();
        });

        loginOverlay.style.display = 'flex';
    }

    refreshMarkers() {
        const searchValue = document.getElementById('globalSearchInput').value;
        this.mapManager.renderMarkers(this.spots, this.currentFilter, searchValue);
    }

    setupEventListeners() {
        // Sidebar
        this.ui.menuBtn.addEventListener('click', () => this.ui.openSidebar());
        this.ui.closeSidebarBtn.addEventListener('click', () => this.ui.closeSidebar());
        this.ui.overlay.addEventListener('click', () => this.ui.closeSidebar());
        // Search
        this.ui.searchToggle.addEventListener('click', () => this.ui.openSearchBar());
        this.ui.clearSearchBtn.addEventListener('click', () => {
            document.getElementById('globalSearchInput').value = '';
            this.ui.closeSearchBar();
            this.refreshMarkers();
        });
        this.ui.globalSearchInput.addEventListener('input', () => this.refreshMarkers());
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
        this.ui.logoutBtn.addEventListener('click', () => {
            this.auth.logout();
            this.ui.setLoggedOut();
            this.ui.showAddHint(false);
            this.ui.showNotification('Uitgelogd');
            this.refreshMarkers();
            this.updateProfileUI();
            // Toon login modal
            this.showLoginModal();
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
}

// Start de app zodra DOM geladen is
document.addEventListener('DOMContentLoaded', () => {
    window.app = new HangzApp();
    window.app.init();
    console.log(window.app);
});