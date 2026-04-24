// managers/UIManager.js
// Behandelt alle DOM updates, panels, modals, notificaties
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
        this.views = document.querySelectorAll('.view');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.userNameSpan = document.getElementById('userNameDisplay');
        this.logoutBtn = document.getElementById('logoutHeaderBtn');
        this.addHint = document.getElementById('addHint');
        // panels
        this.panels = {
            tutorial: document.getElementById('tutorialPanel'),
            about: document.getElementById('aboutPanel'),
            addspot: document.getElementById('addSpotPanel')
        };
        this.closePanelBtns = document.querySelectorAll('.closePanelBtn');
        // add spot form
        this.addSpotForm = document.getElementById('addSpotForm');
        this.spotNameInput = document.getElementById('spotName');
        this.spotCategorySelect = document.getElementById('spotCategory');
        this.spotDescInput = document.getElementById('spotDesc');
        this.selectedCoordsSpan = document.getElementById('selectedCoords');
        this.cancelAddBtn = document.getElementById('cancelAddBtn');
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
        // profile
        this.profileUsernameLabel = document.getElementById('profileUsernameLabel');
        this.userSpotsListDiv = document.getElementById('userSpotsList');
        this.statUserSpots = document.getElementById('statUserSpots');
        this.statUserRatings = document.getElementById('statUserRatings');
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
        const icons = { park: 'fa-tree', gym: 'fa-dumbbell', restaurant: 'fa-utensils', activiteit: 'fa-hiking', muziekschool: 'fa-music', pedicure: 'fa-spa' };
        return icons[cat] || 'fa-location-dot';
    }

    // Modal voor spot details
    openSpotModal(spot, currentUserRating, onRatingCallback) {
        this.modalCategoryBadge.textContent = spot.getCategory();
        this.modalSpotName.textContent = spot.getName();
        this.modalSpotDesc.textContent = spot.getDescription();
        this.modalAddedBy.textContent = spot.getAddedBy();
        const avg = spot.getAverageRating();
        this.modalRatingText.textContent = `${avg.toFixed(1)} (${spot.getRatings().length} beoordelingen)`;
        // toon sterren
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= Math.round(avg)) starsHtml += '<i class="fas fa-star" style="color:#ff7b2c;"></i>';
            else starsHtml += '<i class="far fa-star" style="color:#aaa;"></i>';
        }
        this.modalStarsDisplay.innerHTML = starsHtml;
        // rating input
        const stars = this.starRatingInput.querySelectorAll('i');
        stars.forEach(star => {
            star.classList.remove('fas', 'far');
            star.classList.add('far');
            const val = parseInt(star.getAttribute('data-val'));
            if (currentUserRating && val <= currentUserRating) {
                star.classList.remove('far');
                star.classList.add('fas');
            }
        });
        // event listeners voor sterren (eenmalig, maar we vervangen ze elke keer)
        const newStarInput = this.starRatingInput.cloneNode(true);
        this.starRatingInput.parentNode.replaceChild(newStarInput, this.starRatingInput);
        this.starRatingInput = newStarInput;
        const starsNew = this.starRatingInput.querySelectorAll('i');
        starsNew.forEach(star => {
            star.addEventListener('click', (e) => {
                const rating = parseInt(star.getAttribute('data-val'));
                onRatingCallback(rating);
            });
            star.addEventListener('mouseover', () => {
                const val = parseInt(star.getAttribute('data-val'));
                starsNew.forEach(s => {
                    const sv = parseInt(s.getAttribute('data-val'));
                    if (sv <= val) {
                        s.classList.remove('far');
                        s.classList.add('fas');
                    } else {
                        s.classList.remove('fas');
                        s.classList.add('far');
                    }
                });
            });
            star.addEventListener('mouseout', () => {
                starsNew.forEach(s => {
                    const sv = parseInt(s.getAttribute('data-val'));
                    if (currentUserRating && sv <= currentUserRating) {
                        s.classList.remove('far');
                        s.classList.add('fas');
                    } else {
                        s.classList.remove('fas');
                        s.classList.add('far');
                    }
                });
            });
        });
        this.spotModal.classList.add('open');
    }

    closeSpotModal() {
        this.spotModal.classList.remove('open');
    }

    // Update hint visibility
    showAddHint(show) {
        this.addHint.style.display = show ? 'flex' : 'none';
    }

    // Update ingelogde user in header
    setLoggedInUser(username) {
        this.userNameSpan.textContent = username;
        this.logoutBtn.style.display = 'inline-block';
    }

    setLoggedOut() {
        this.userNameSpan.textContent = 'Gast';
        this.logoutBtn.style.display = 'none';
    }

    // Getters voor form
    getAddSpotFormData() {
        return {
            name: this.spotNameInput.value.trim(),
            category: this.spotCategorySelect.value,
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