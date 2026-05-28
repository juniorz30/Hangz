// managers/UIManager.js
// Behandelt alle DOM updates, panels, modals, notificaties
import { CATEGORY_ICONS, DEFAULT_ICON } from '../utils/constants.js';

export class UIManager {
    constructor() {
        // DOM elementen referenties
        this.sidebar = document.getElementById('sidebar');
        this.overlay = document.getElementById('overlay');
        this.menuBtn = document.getElementById('menuToggle');
        this.closeSidebarBtn = document.getElementById('closeSidebarBtn');
        this.searchBar = document.getElementById('searchBar');
        this.searchToggle = document.getElementById('searchToggleBtn');
        this.clearSearchBtn = document.getElementById('clearSearchBtn');
        this.globalSearchInput = document.getElementById('globalSearchInput');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.tourBtn = document.getElementById('tourBtn');
        this.mySpotsBtn = document.getElementById('mySpotsBtn');
        this.views = document.querySelectorAll('.view');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.userNameSpan = document.getElementById('userNameDisplay');
        this.logoutBtn = document.getElementById('logoutHeaderBtn');
        this.addHint = document.getElementById('addHint');
        this.addSpotSidebarLink = document.getElementById('addSpotSidebarLink');
        // panels
        this.panels = {
            tutorial: document.getElementById('tutorialPanel'),
            about: document.getElementById('aboutPanel'),
            addspot: document.getElementById('addSpotPanel'),
            myspots: document.getElementById('mySpotsPanel')
        };
        this.mySpotsListPanel = document.getElementById('mySpotsListPanel');
        this.closePanelBtns = document.querySelectorAll('.closePanelBtn');
        // add spot form
        this.addSpotForm = document.getElementById('addSpotForm');
        this.spotNameInput = document.getElementById('spotName');
        this.spotCategorySelect = document.getElementById('spotCategory');
        this.spotCustomCategory = document.getElementById('spotCustomCategory');
        this.spotDescInput = document.getElementById('spotDesc');
        this.selectedCoordsSpan = document.getElementById('selectedCoords');
        this.cancelAddBtn = document.getElementById('cancelAddBtn');
        
        // Event listener voor custom category
        if (this.spotCategorySelect) {
            this.spotCategorySelect.addEventListener('change', (e) => {
                if (e.target.value === 'custom') {
                    this.spotCustomCategory.style.display = 'block';
                    this.spotCustomCategory.focus();
                } else {
                    this.spotCustomCategory.style.display = 'none';
                }
            });
        }
        // modal
        this.spotModal = document.getElementById('spotModal');
        this.closeModalBtn = document.getElementById('closeModalBtn');
        this.modalCategoryBadge = document.getElementById('modalCategoryBadge');
        this.modalSpotName = document.getElementById('modalSpotName');
        this.modalSpotDesc = document.getElementById('modalSpotDesc');
        this.modalStarsDisplay = document.getElementById('modalStarsDisplay');
        this.modalRatingText = document.getElementById('modalRatingText');
        this.modalAddedBy = document.getElementById('modalAddedBy');
        this.starRatingInput = document.getElementById('starRatingInput');
        // Close button event listener
        if (this.closeModalBtn) {
            this.closeModalBtn.addEventListener('click', () => this.closeSpotModal());
        }
        // profile
        this.profileUsernameLabel = document.getElementById('profileUsernameLabel');
        this.userSpotsListDiv = document.getElementById('userSpotsList');
        this.statUserSpots = document.getElementById('statUserSpots');
        this.statUserRatings = document.getElementById('statUserRatings');
        // Gast/Ingelogd status
        this.guestStatusBox = document.getElementById('guestStatusBox');
        this.userStatusBox = document.getElementById('userStatusBox');
        this.profileUserEmail = document.getElementById('profileUserEmail');
    }

    // Toon/verberg sidebar
    toggleSidebar(show) {
        if (show === undefined) show = !this.sidebar.classList.contains('open');
        if (show) {
            this.sidebar.classList.add('open');
            this.overlay.classList.add('active');
        } else {
            this.sidebar.classList.remove('open');
            this.overlay.classList.remove('active');
        }
    }

    closeSidebar() { this.toggleSidebar(false); }

    // Search bar open/close
    toggleSearchBar(force) {
        if (force !== undefined) {
            if (force) this.searchBar.classList.add('open');
            else this.searchBar.classList.remove('open');
        } else {
            this.searchBar.classList.toggle('open');
        }
    }

    // Switch tussen views (kaart, features, profiel)
    switchView(viewId) {
        this.views.forEach(v => v.classList.remove('active'));
        const activeView = document.getElementById(viewId + 'View');
        if (activeView) activeView.classList.add('active');
        // update active class in nav
        this.navLinks.forEach(link => {
            const target = link.getAttribute('data-view');
            if (target === viewId) link.classList.add('active');
            else link.classList.remove('active');
        });
        // als map view, laat kaart opnieuw tekenen
        if (viewId === 'map') {
            setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
        }
    }

    // Open een slide-panel
    openPanel(panelId) {
        if (this.panels[panelId]) {
            this.closeAllPanels();
            this.panels[panelId].classList.add('open');
            this.overlay.classList.add('active');
        }
    }

    closeAllPanels() {
        Object.values(this.panels).forEach(panel => {
            if (panel) panel.classList.remove('open');
        });
        this.overlay.classList.remove('active');
    }

    // Notificatie (kleine popup)
    showNotification(message, type = 'info') {
        const notif = document.createElement('div');
        notif.className = 'notification';
        notif.textContent = message;
        notif.style.position = 'fixed';
        notif.style.bottom = '20px';
        notif.style.left = '50%';
        notif.style.transform = 'translateX(-50%)';
        notif.style.backgroundColor = type === 'error' ? '#e74c3c' : '#2ecc71';
        notif.style.color = 'white';
        notif.style.padding = '10px 20px';
        notif.style.borderRadius = '40px';
        notif.style.zIndex = '3000';
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 2500);
    }

    // Update profiel info
    updateProfileUI(username, userSpots, userRatingsCount) {
        // GAST of INGELOGD STATUS TONEN
        if (username === 'Gast') {
            // Toon de gast status box
            this.guestStatusBox.style.display = 'block';
            this.userStatusBox.style.display = 'none';
        } else {
            // Toon de ingelogd status box met email/username
            this.userStatusBox.style.display = 'block';
            this.guestStatusBox.style.display = 'none';
            this.profileUserEmail.textContent = username; // Dit kan later je email zijn
        }
        
        // Update de rest van de profiel informatie
        this.profileUsernameLabel.textContent = username;
        this.statUserSpots.textContent = userSpots.length;
        this.statUserRatings.textContent = userRatingsCount;
        if (userSpots.length === 0) {
            this.userSpotsListDiv.innerHTML = '<p class="empty">Nog geen spots toegevoegd</p>';
        } else {
            const html = userSpots.map(spot => `
                <div class="user-spot-item">
                    <span><i class="fas ${this.getCategoryIcon(spot.getCategory())}"></i> ${spot.getName()}</span>
                    <span>⭐ ${spot.getAverageRating().toFixed(1)}</span>
                </div>
            `).join('');
            this.userSpotsListDiv.innerHTML = html;
        }
    }

    getCategoryIcon(cat) {
        // Pak het icoon uit constants.js, of gebruik DEFAULT_ICON
        return CATEGORY_ICONS[cat] || DEFAULT_ICON;
    }

    // Modal voor spot details
    openSpotModal(spot, currentUserRating, onRatingCallback) {
        this.modalCategoryBadge.textContent = spot.getCategory();
        // Maak spot naam een link naar Google Maps
        const mapsUrl = `https://maps.google.com/?q=${spot.getLat()},${spot.getLng()}`;
        this.modalSpotName.innerHTML = `<a href="${mapsUrl}" target="_blank" style="color: inherit; text-decoration: none;">${spot.getName()}</a>`;
        this.modalSpotDesc.textContent = spot.getDescription();
        this.modalAddedBy.textContent = spot.getAddedBy();
        const avg = spot.getAverageRating();
        this.modalRatingText.textContent = `${avg.toFixed(1)} (${spot.getRatings().length} beoordelingen)`;
        
        // Toon sterren voor gemiddelde rating
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= Math.round(avg)) starsHtml += '<span style="color:#ff7b2c;" data-lucide="star"></span>';
            else starsHtml += '<span style="color:#aaa; opacity:0.5;" data-lucide="star"></span>';
        }
        this.modalStarsDisplay.innerHTML = starsHtml;
        
        // Vernieuw de stervoren voor gebruiker rating input (clone node)
        const newStarInput = this.starRatingInput.cloneNode(true);
        this.starRatingInput.parentNode.replaceChild(newStarInput, this.starRatingInput);
        this.starRatingInput = newStarInput;
        
        // Update Lucide icons
        if (window.lucide && window.lucide.createIcons) {
            window.lucide.createIcons();
        }
        
        // Event listeners voor rating sterren
        const starsNew = this.starRatingInput.querySelectorAll('[data-lucide="star"]');
        starsNew.forEach(star => {
            star.style.cursor = 'pointer';
            star.addEventListener('click', (e) => {
                const rating = parseInt(star.getAttribute('data-val'));
                onRatingCallback(rating);
            });
            star.addEventListener('mouseover', () => {
                const val = parseInt(star.getAttribute('data-val'));
                starsNew.forEach(s => {
                    const sv = parseInt(s.getAttribute('data-val'));
                    if (sv <= val) {
                        s.style.color = '#ff7b2c';
                        s.style.opacity = '1';
                    } else {
                        s.style.color = '#aaa';
                        s.style.opacity = '0.5';
                    }
                });
            });
            star.addEventListener('mouseout', () => {
                starsNew.forEach(s => {
                    const sv = parseInt(s.getAttribute('data-val'));
                    if (currentUserRating && sv <= currentUserRating) {
                        s.style.color = '#ff7b2c';
                        s.style.opacity = '1';
                    } else {
                        s.style.color = '#aaa';
                        s.style.opacity = '0.5';
                    }
                });
            });
        });
        
        // Zorg ervoor dat Lucide icons worden gerendered
        if (window.lucide && window.lucide.createIcons) {
            window.lucide.createIcons();
        }
        
        this.spotModal.classList.add('open');
    }

    closeSpotModal() {
        this.spotModal.classList.remove('open');
    }

    // Update hint visibility
    showAddHint(show) {
        this.addHint.style.display = show ? 'flex' : 'none';
    }

    setLoggedInUser(username) {
        this.userNameSpan.textContent = `Hey, ${username}`;
        this.logoutBtn.style.display = 'inline-block';
        // Toon "Locatie toevoegen" in sidebar als je ingelogd bent
        if (this.addSpotSidebarLink) {
            this.addSpotSidebarLink.style.display = 'block';
        }
    }

    setLoggedOut() {
        this.userNameSpan.textContent = 'Gast';
        this.logoutBtn.style.display = 'none';
        // Verberg "Locatie toevoegen" in sidebar als je gast bent
        if (this.addSpotSidebarLink) {
            this.addSpotSidebarLink.style.display = 'none';
        }
    }

    // Getters voor form
    getAddSpotFormData() {
        let category = this.spotCategorySelect.value.trim();
        // Als custom categorie gekozen, gebruik dan de tekst uit het custom input veld
        if (category === 'custom') {
            category = this.spotCustomCategory.value.trim();
            if (!category) {
                return {
                    name: '',
                    category: '',
                    description: '',
                    error: 'Voer een categorie in'
                };
            }
        }
        return {
            name: this.spotNameInput.value.trim(),
            category: category,
            description: this.spotDescInput.value.trim()
        };
    }

    resetAddSpotForm() {
        this.addSpotForm.reset();
        this.selectedCoordsSpan.textContent = 'Nog geen locatie gekozen';
    }

    setSelectedCoords(lat, lng) {
        this.selectedCoordsSpan.textContent = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }

    getSelectedCoordsSpan() { return this.selectedCoordsSpan; }

    addEventListenerToElement(elementId, event, callback) {
        const el = document.getElementById(elementId);
        if (el) el.addEventListener(event, callback);
    }
}