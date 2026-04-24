// app.js - Hoofdapplicatie met compositie van alle managers
import { AuthManager } from './managers/AuthManager.js';
import { StorageManager } from './managers/StorageManager.js';
import { MapManager } from './managers/MapManager.js';
import { UIManager } from './managers/UIManager.js';
import { Spot } from './models/Spot.js';
import { generateId } from './utils/helpers.js';

class HangzApp {
    #auth;
    #storage;
    #mapManager;
    #ui;
    #spots;          // array van Spot objecten
    #currentFilter;
    #selectedLocation; // {lat, lng}

    constructor() {
        this.#auth = new AuthManager();
        this.#storage = new StorageManager();
        this.#mapManager = new MapManager();
        this.#ui = new UIManager();
        this.#spots = [];
        this.#currentFilter = 'all';
        this.#selectedLocation = null;
    }

    async init() {
        // Data laden
        this.#spots = this.#storage.loadSpots();
        // Check login status
        const isLoggedIn = this.#auth.isLoggedIn();
        if (!isLoggedIn) {
            this.#showLoginModal();
        } else {
            this.#ui.setLoggedInUser(this.#auth.getCurrentUser());
            this.#ui.showAddHint(true);
        }
        // Kaart initialiseren
        this.#mapManager.init(51.05, 4.38, 12);
        this.#refreshMarkers();
        // Event listeners setup
        this.#setupEventListeners();
        // Laat profiel zien als die actief is (standaard kaart)
        this.#ui.switchView('map');
        // Update UI voor profiel later
        this.#updateProfileUI();
    }

    #showLoginModal() {
        const loginOverlay = document.getElementById('loginOverlay');
        const doLogin = document.getElementById('doLoginBtn');
        const doRegister = document.getElementById('doRegisterBtn');
        const guest = document.getElementById('guestLoginBtn');
        const usernameInput = document.getElementById('loginUsername');
        const passwordInput = document.getElementById('loginPassword');

        const closeLogin = () => {
            loginOverlay.style.display = 'none';
            if (!this.#auth.isLoggedIn()) {
                // gast modus
                this.#auth.login('Gast', '');
                this.#ui.setLoggedInUser('Gast');
                this.#ui.showAddHint(false);
            }
            this.#updateProfileUI();
        };

        doLogin.onclick = () => {
            const user = usernameInput.value.trim();
            const pwd = passwordInput.value;
            if (this.#auth.login(user, pwd)) {
                this.#ui.setLoggedInUser(user);
                this.#ui.showAddHint(true);
                loginOverlay.style.display = 'none';
                this.#updateProfileUI();
            } else {
                alert('Ongeldige gegevens');
            }
        };
        doRegister.onclick = () => {
            const user = usernameInput.value.trim();
            const pwd = passwordInput.value;
            if (this.#auth.register(user, pwd)) {
                this.#ui.setLoggedInUser(user);
                this.#ui.showAddHint(true);
                loginOverlay.style.display = 'none';
                this.#updateProfileUI();
            }
        };
        guest.onclick = () => {
            this.#auth.login('Gast', '');
            this.#ui.setLoggedInUser('Gast');
            this.#ui.showAddHint(false);
            loginOverlay.style.display = 'none';
            this.#updateProfileUI();
        };
        loginOverlay.style.display = 'flex';
    }

    #refreshMarkers() {
        const searchValue = document.getElementById('globalSearchInput').value;
        this.#mapManager.renderMarkers(this.#spots, this.#currentFilter, searchValue);
    }

    #setupEventListeners() {
        // Sidebar
        this.#ui.menuBtn.onclick = () => this.#ui.toggleSidebar(true);
        this.#ui.closeSidebarBtn.onclick = () => this.#ui.closeSidebar();
        this.#ui.overlay.onclick = () => this.#ui.closeSidebar();
        // Search
        this.#ui.searchToggle.onclick = () => this.#ui.toggleSearchBar();
        this.#ui.clearSearchBtn.onclick = () => {
            document.getElementById('globalSearchInput').value = '';
            this.#refreshMarkers();
        };
        this.#ui.globalSearchInput.oninput = () => this.#refreshMarkers();
        // Filter buttons
        this.#ui.filterBtns.forEach(btn => {
            btn.onclick = () => {
                this.#ui.filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.#currentFilter = btn.getAttribute('data-filter');
                this.#refreshMarkers();
            };
        });
        // Navigatie
        this.#ui.navLinks.forEach(link => {
            link.onclick = (e) => {
                e.preventDefault();
                const view = link.getAttribute('data-view');
                this.#ui.switchView(view);
                if (view === 'map') {
                    this.#mapManager.invalidateSize();
                    this.#refreshMarkers();
                } else if (view === 'profile') {
                    this.#updateProfileUI();
                }
            };
        });
        // Sidebar links (panels)
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.onclick = (e) => {
                e.preventDefault();
                const panel = link.getAttribute('data-panel');
                this.#ui.closeSidebar();
                if (panel === 'tutorial') this.#ui.openPanel('tutorial');
                else if (panel === 'about') this.#ui.openPanel('about');
                else if (panel === 'addspot') this.#ui.openPanel('addspot');
            };
        });
        // Close panel buttons
        this.#ui.closePanelBtns.forEach(btn => {
            btn.onclick = () => this.#ui.closeAllPanels();
        });
        // Kaart klik (alleen als ingelogd)
        this.#mapManager.onMapClick((e) => {
            if (this.#auth.isLoggedIn() && this.#auth.getCurrentUser() !== 'Gast') {
                this.#selectedLocation = e.latlng;
                this.#ui.setSelectedCoords(e.latlng.lat, e.latlng.lng);
                this.#ui.openPanel('addspot');
                this.#ui.showAddHint(false);
            } else {
                this.#ui.showNotification('Log eerst in om spots toe te voegen', 'error');
            }
        });
        // Add spot form submit
        this.#ui.addSpotForm.onsubmit = (e) => {
            e.preventDefault();
            if (!this.#selectedLocation) {
                this.#ui.showNotification('Klik eerst op de kaart', 'error');
                return;
            }
            const { name, category, description } = this.#ui.getAddSpotFormData();
            if (!name) {
                this.#ui.showNotification('Naam is verplicht', 'error');
                return;
            }
            const newId = generateId();
            const newSpot = new Spot(newId, name, category, description || 'Geen beschrijving', this.#selectedLocation.lat, this.#selectedLocation.lng, this.#auth.getCurrentUser(), [], null);
            this.#spots.push(newSpot);
            this.#storage.saveSpots(this.#spots);
            this.#refreshMarkers();
            this.#ui.closeAllPanels();
            this.#ui.resetAddSpotForm();
            this.#selectedLocation = null;
            this.#ui.showNotification('Spot toegevoegd!');
            this.#updateProfileUI();
        };
        this.#ui.cancelAddBtn.onclick = () => {
            this.#ui.closeAllPanels();
            this.#selectedLocation = null;
        };
        // Marker click (via event delegation op map? maar we hebben markers met spotId, en we gebruiken de map click op marker)
        // We moeten de marker click handler koppelen via MapManager. We overschrijven de marker creatie.
        // Oplossing: na elke renderMarkers, voeg click handlers toe.
        this.#mapManager.getMap().on('click', (e) => {
            // alleen als er op marker geklikt wordt, bubbelt? Leaflet geeft marker click apart.
        });
        // We voegen een functie toe in MapManager om markers te voorzien van click callback.
        // Maar we kunnen ook de bestaande `addMarker` gebruiken. 
        // Hier een tijdelijke fix: we herschrijven renderMarkers zodat markers ook click hebben.
        // Laten we een extra methode in MapManager zetten om clicks te binden.
        // Ik voeg een patch toe: na renderMarkers, zoek alle markers en bind click.
        this.#mapManager.onMarkerClick = (spot) => {
            if (!this.#auth.isLoggedIn() && this.#auth.getCurrentUser() === 'Gast') {
                this.#ui.showNotification('Log in om te beoordelen', 'error');
                return;
            }
            const currentUserRating = spot.getUserRating();
            this.#ui.openSpotModal(spot, currentUserRating, (rating) => {
                // rating toevoegen
                spot.addRating(rating, this.#auth.getCurrentUser());
                this.#storage.saveSpots(this.#spots);
                this.#refreshMarkers();
                this.#ui.closeSpotModal();
                this.#ui.showNotification('Beoordeling opgeslagen');
                this.#updateProfileUI();
            });
        };
        // Bind marker clicks via Leaflet's popupopen event
        this.#mapManager.getMap().on('popupopen', (e) => {
            const marker = e.popup._source;
            const spot = this.#spots.find(s => s.getId() === marker.spotId);
            if (spot) this.#mapManager.onMarkerClick(spot);
        });
        // Logout
        this.#ui.logoutBtn.onclick = () => {
            this.#auth.logout();
            this.#ui.setLoggedOut();
            this.#ui.showAddHint(false);
            this.#ui.showNotification('Uitgelogd');
            this.#refreshMarkers();
            this.#updateProfileUI();
        };
        // Features CTA
        const cta = document.getElementById('featuresCtaBtn');
        if (cta) cta.onclick = () => this.#ui.switchView('map');
    }

    #updateProfileUI() {
        const currentUser = this.#auth.getCurrentUser();
        const userSpots = this.#spots.filter(spot => spot.getAddedBy() === currentUser);
        let userRatingsCount = 0;
        for (let i = 0; i < this.#spots.length; i++) {
            if (this.#spots[i].getUserRating() !== null) userRatingsCount++;
        }
        this.#ui.updateProfileUI(currentUser, userSpots, userRatingsCount);
    }
}

// Start de app zodra DOM geladen is
document.addEventListener('DOMContentLoaded', () => {
    window.app = new HangzApp();
    window.app.init();
});