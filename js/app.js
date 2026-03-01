// ===== Hangz Application =====

// ===== Data =====
const defaultSpots = [
    {
        id: 1,
        name: "Vrijbroekpark",
        category: "park",
        description: "Een prachtig groot park in Mechelen met wandelpaden, speeltuinen en een dierenweide. Perfect voor een dagje uit met vrienden of familie.",
        lat: 51.0259,
        lng: 4.4775,
        addedBy: "Hangz",
        ratings: [5, 4, 5, 4, 5],
        userRating: null
    },
    {
        id: 2,
        name: "Overkop",
        category: "activiteit",
        description: "Jongerencentrum in Willebroek met diverse activiteiten, workshops en een gezellige hangplek voor jongeren.",
        lat: 51.0606,
        lng: 4.3583,
        addedBy: "Hangz",
        ratings: [4, 5, 4, 4],
        userRating: null
    },
    {
        id: 3,
        name: "Gym Willebroek",
        category: "gym",
        description: "Moderne fitnessruimte in Willebroek met alle benodigde apparatuur voor een goede workout.",
        lat: 51.0580,
        lng: 4.3600,
        addedBy: "Hangz",
        ratings: [4, 4, 5],
        userRating: null
    },
    {
        id: 4,
        name: "Fort Breendonk",
        category: "activiteit",
        description: "Historisch fort met museum en herdenkingsplaats. Een indrukwekkende locatie om te bezoeken.",
        lat: 51.0567,
        lng: 4.3414,
        addedBy: "Hangz",
        ratings: [5, 5, 5, 4, 5],
        userRating: null
    },
    {
        id: 5,
        name: "Muziekschool Kerkstraat",
        category: "muziekschool",
        description: "Muziekschool in het centrum van Willebroek. Les in verschillende instrumenten en zang.",
        lat: 51.0615,
        lng: 4.3570,
        addedBy: "Hangz",
        ratings: [4, 5, 4],
        userRating: null
    },
    {
        id: 6,
        name: "De Blijk Park",
        category: "park",
        description: "Gezellig park in Willebroek met wandelpaden, een speeltuin en mooie groene zones.",
        lat: 51.0630,
        lng: 4.3550,
        addedBy: "Hangz",
        ratings: [4, 4, 5, 4],
        userRating: null
    },
    {
        id: 7,
        name: "Pedicure Sophia",
        category: "pedicure",
        description: "Professionele pedicurepraktijk in Willebroek. Ontspannende behandelingen voor je voeten.",
        lat: 51.0590,
        lng: 4.3560,
        addedBy: "Hangz",
        ratings: [5, 5, 5],
        userRating: null
    }
];

// Category icons mapping
const categoryIcons = {
    park: 'fa-tree',
    gym: 'fa-dumbbell',
    restaurant: 'fa-utensils',
    activiteit: 'fa-hiking',
    muziekschool: 'fa-music',
    pedicure: 'fa-spa'
};

const categoryLabels = {
    park: 'Park',
    gym: 'Gym',
    restaurant: 'Restaurant',
    activiteit: 'Activiteit',
    muziekschool: 'Muziekschool',
    pedicure: 'Pedicure'
};

// ===== State =====
let map;
let markers = [];
let spots = [];
let currentFilter = 'all';
let selectedLocation = null;
let currentSpotId = null;

// ===== DOM Elements =====
const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
const closeSidebar = document.getElementById('closeSidebar');
const overlay = document.getElementById('overlay');
const searchToggle = document.getElementById('searchToggle');
const searchBar = document.getElementById('searchBar');
const searchInput = document.getElementById('searchInput');
const clearSearch = document.getElementById('clearSearch');
const filterBtns = document.querySelectorAll('.filter-btn');
const navLinks = document.querySelectorAll('.nav-link');
const views = document.querySelectorAll('.view');
const sidebarLinks = document.querySelectorAll('.sidebar-link');
const slidePanels = document.querySelectorAll('.slide-panel');
const closePanelBtns = document.querySelectorAll('.close-panel');
const addSpotForm = document.getElementById('addSpotForm');
const addSpotPanel = document.getElementById('addSpotPanel');
const cancelAddSpot = document.getElementById('cancelAddSpot');
const locationPreview = document.getElementById('locationPreview');
const locationCoords = document.getElementById('locationCoords');
const spotModal = document.getElementById('spotModal');
const closeModal = document.querySelector('.close-modal');
const starInput = document.getElementById('starInput');
const usernameInput = document.getElementById('usernameInput');
const saveUsername = document.getElementById('saveUsername');
const addSpotHint = document.getElementById('addSpotHint');

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', () => {
    initData();
    initMap();
    initEventListeners();
    loadUserData();
    updateUserSpotsList();
    updateStats();
});

// ===== Data Management =====
function initData() {
    const storedSpots = localStorage.getItem('hangz_spots');
    if (storedSpots) {
        spots = JSON.parse(storedSpots);
    } else {
        spots = [...defaultSpots];
        saveSpots();
    }
}

function saveSpots() {
    localStorage.setItem('hangz_spots', JSON.stringify(spots));
}

function loadUserData() {
    const username = localStorage.getItem('hangz_username');
    if (username) {
        usernameInput.value = username;
    }
}

// ===== Map Initialization =====
function initMap() {
    // Initialize Leaflet map centered on Willebroek/Mechelen area
    map = L.map('map').setView([51.0500, 4.3800], 12);
    
    // Add dark theme tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);
    
    // Add click handler for adding spots
    map.on('click', handleMapClick);
    
    // Add markers for all spots
    renderMarkers();
}

function renderMarkers() {
    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    // Filter spots
    const filteredSpots = currentFilter === 'all' 
        ? spots 
        : spots.filter(spot => spot.category === currentFilter);
    
    // Add markers
    filteredSpots.forEach(spot => {
        const marker = createMarker(spot);
        markers.push(marker);
    });
}

function createMarker(spot) {
    const iconClass = categoryIcons[spot.category] || 'fa-map-marker-alt';
    
    const customIcon = L.divIcon({
        className: 'custom-marker-container',
        html: `<div class="custom-marker ${spot.category}"><i class="fas ${iconClass}"></i></div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
    });
    
    const marker = L.marker([spot.lat, spot.lng], { icon: customIcon }).addTo(map);
    
    // Add popup
    const popupContent = `
        <div>
            <h3>${spot.name}</h3>
            <p>${categoryLabels[spot.category]}</p>
        </div>
    `;
    
    marker.bindPopup(popupContent);
    
    // Open modal on click
    marker.on('click', () => {
        openSpotModal(spot);
    });
    
    return marker;
}

function handleMapClick(e) {
    selectedLocation = e.latlng;
    locationCoords.textContent = `${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`;
    locationPreview.style.borderColor = 'var(--accent-primary)';
    
    // Show add spot panel
    openPanel('addSpotPanel');
    
    // Hide hint
    addSpotHint.style.display = 'none';
}

// ===== Event Listeners =====
function initEventListeners() {
    // Sidebar toggle
    menuBtn.addEventListener('click', () => {
        sidebar.classList.add('active');
        overlay.classList.add('active');
    });
    
    closeSidebar.addEventListener('click', closeSidebarMenu);
    overlay.addEventListener('click', closeSidebarMenu);
    
    // Search toggle
    searchToggle.addEventListener('click', () => {
        searchBar.classList.toggle('active');
        if (searchBar.classList.contains('active')) {
            searchInput.focus();
        }
    });
    
    clearSearch.addEventListener('click', () => {
        searchInput.value = '';
        renderMarkers();
    });
    
    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        if (query === '') {
            renderMarkers();
            return;
        }
        
        const filteredSpots = spots.filter(spot => 
            spot.name.toLowerCase().includes(query)
        );
        
        // Clear and re-render markers
        markers.forEach(marker => map.removeLayer(marker));
        markers = [];
        
        filteredSpots.forEach(spot => {
            const marker = createMarker(spot);
            markers.push(marker);
        });
    });
    
    // Filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderMarkers();
        });
    });
    
    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const view = link.dataset.view;
            switchView(view);
            
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
    
    // Sidebar links
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const panel = link.dataset.panel;
            
            if (panel === 'add') {
                // Show hint on map
                closeSidebarMenu();
                switchView('map');
                addSpotHint.style.display = 'flex';
                setTimeout(() => {
                    addSpotHint.style.display = 'none';
                }, 5000);
            } else if (panel === 'tutorial') {
                closeSidebarMenu();
                openPanel('tutorialPanel');
            } else if (panel === 'about') {
                closeSidebarMenu();
                openPanel('aboutPanel');
            }
        });
    });
    
    // Close panel buttons
    closePanelBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            closeAllPanels();
        });
    });
    
    // Cancel add spot
    cancelAddSpot.addEventListener('click', () => {
        closeAllPanels();
        selectedLocation = null;
        locationCoords.textContent = 'Klik eerst op de kaart';
        locationPreview.style.borderColor = 'var(--border-color)';
        addSpotForm.reset();
    });
    
    // Add spot form
    addSpotForm.addEventListener('submit', handleAddSpot);
    
    // Close modal
    closeModal.addEventListener('click', () => {
        spotModal.classList.remove('active');
        currentSpotId = null;
    });
    
    // Star rating
    const stars = starInput.querySelectorAll('i');
    stars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = parseInt(star.dataset.rating);
            handleRating(rating);
        });
        
        star.addEventListener('mouseenter', () => {
            const rating = parseInt(star.dataset.rating);
            highlightStars(rating);
        });
    });
    
    starInput.addEventListener('mouseleave', () => {
        const spot = spots.find(s => s.id === currentSpotId);
        if (spot && spot.userRating) {
            highlightStars(spot.userRating);
        } else {
            highlightStars(0);
        }
    });
    
    // Save username
    saveUsername.addEventListener('click', () => {
        const username = usernameInput.value.trim();
        if (username) {
            localStorage.setItem('hangz_username', username);
            showNotification('Gebruikersnaam opgeslagen!');
        }
    });
    
    // Close modal on outside click
    spotModal.addEventListener('click', (e) => {
        if (e.target === spotModal) {
            spotModal.classList.remove('active');
            currentSpotId = null;
        }
    });
}

// ===== View Management =====
function switchView(viewName) {
    views.forEach(view => view.classList.remove('active'));
    
    if (viewName === 'map') {
        document.getElementById('mapView').classList.add('active');
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
    } else if (viewName === 'features') {
        document.getElementById('featuresView').classList.add('active');
    } else if (viewName === 'profile') {
        document.getElementById('profileView').classList.add('active');
        updateUserSpotsList();
        updateStats();
    }
}

// ===== Panel Management =====
function openPanel(panelId) {
    closeAllPanels();
    document.getElementById(panelId).classList.add('active');
    overlay.classList.add('active');
}

function closeAllPanels() {
    slidePanels.forEach(panel => panel.classList.remove('active'));
    overlay.classList.remove('active');
}

function closeSidebarMenu() {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
}

// ===== Spot Management =====
function handleAddSpot(e) {
    e.preventDefault();
    
    if (!selectedLocation) {
        showNotification('Klik eerst op de kaart om een locatie te selecteren', 'error');
        return;
    }
    
    const name = document.getElementById('spotName').value.trim();
    const category = document.getElementById('spotCategory').value;
    const description = document.getElementById('spotDescription').value.trim();
    const username = localStorage.getItem('hangz_username') || 'Anoniem';
    
    const newSpot = {
        id: Date.now(),
        name,
        category,
        description: description || 'Geen beschrijving beschikbaar.',
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        addedBy: username,
        ratings: [],
        userRating: null
    };
    
    spots.push(newSpot);
    saveSpots();
    
    // Reset form
    addSpotForm.reset();
    selectedLocation = null;
    locationCoords.textContent = 'Klik eerst op de kaart';
    locationPreview.style.borderColor = 'var(--border-color)';
    
    // Close panel and refresh
    closeAllPanels();
    renderMarkers();
    
    showNotification('Spot succesvol toegevoegd!');
    updateUserSpotsList();
    updateStats();
}

// ===== Modal =====
function openSpotModal(spot) {
    currentSpotId = spot.id;
    
    document.getElementById('modalTitle').textContent = spot.name;
    document.getElementById('modalCategory').textContent = categoryLabels[spot.category];
    document.getElementById('modalDescription').textContent = spot.description;
    document.getElementById('modalAddedBy').textContent = spot.addedBy;
    
    // Update rating display
    updateRatingDisplay(spot);
    
    // Update star input
    highlightStars(spot.userRating || 0);
    
    spotModal.classList.add('active');
}

// ===== Rating =====
function updateRatingDisplay(spot) {
    const avgRating = calculateAverageRating(spot.ratings);
    const starsContainer = document.getElementById('modalRatingStars');
    const valueContainer = document.getElementById('modalRatingValue');
    const countContainer = document.getElementById('modalRatingCount');
    
    // Generate star HTML
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.round(avgRating)) {
            starsHtml += '<i class="fas fa-star"></i>';
        } else {
            starsHtml += '<i class="far fa-star"></i>';
        }
    }
    
    starsContainer.innerHTML = starsHtml;
    valueContainer.textContent = avgRating.toFixed(1);
    countContainer.textContent = `(${spot.ratings.length} beoordeling${spot.ratings.length !== 1 ? 'en' : ''})`;
}

function calculateAverageRating(ratings) {
    if (!ratings || ratings.length === 0) return 0;
    const sum = ratings.reduce((a, b) => a + b, 0);
    return sum / ratings.length;
}

function highlightStars(rating) {
    const stars = starInput.querySelectorAll('i');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.remove('far');
            star.classList.add('fas');
        } else {
            star.classList.remove('fas');
            star.classList.add('far');
        }
    });
}

function handleRating(rating) {
    const spot = spots.find(s => s.id === currentSpotId);
    if (!spot) return;
    
    // Remove previous rating if exists
    if (spot.userRating) {
        const index = spot.ratings.indexOf(spot.userRating);
        if (index > -1) {
            spot.ratings.splice(index, 1);
        }
    }
    
    // Add new rating
    spot.ratings.push(rating);
    spot.userRating = rating;
    
    saveSpots();
    updateRatingDisplay(spot);
    highlightStars(rating);
    
    showNotification('Beoordeling opgeslagen!');
    updateStats();
}

// ===== User Spots List =====
function updateUserSpotsList() {
    const username = localStorage.getItem('hangz_username');
    const container = document.getElementById('userSpotsList');
    
    if (!username) {
        container.innerHTML = '<p class="empty-state">Stel eerst een gebruikersnaam in</p>';
        return;
    }
    
    const userSpots = spots.filter(spot => spot.addedBy === username);
    
    if (userSpots.length === 0) {
        container.innerHTML = '<p class="empty-state">Je hebt nog geen spots toegevoegd</p>';
        return;
    }
    
    container.innerHTML = userSpots.map(spot => `
        <div class="user-spot-item">
            <div class="user-spot-icon ${spot.category}">
                <i class="fas ${categoryIcons[spot.category]}"></i>
            </div>
            <div class="user-spot-info">
                <h4>${spot.name}</h4>
                <span>${categoryLabels[spot.category]}</span>
            </div>
            <div class="user-spot-rating">
                <i class="fas fa-star"></i> ${calculateAverageRating(spot.ratings).toFixed(1)}
            </div>
        </div>
    `).join('');
}

// ===== Stats =====
function updateStats() {
    const username = localStorage.getItem('hangz_username');
    
    if (!username) {
        document.getElementById('statsAdded').textContent = '0';
        document.getElementById('statsRated').textContent = '0';
        return;
    }
    
    const userSpots = spots.filter(spot => spot.addedBy === username);
    const ratedSpots = spots.filter(spot => spot.userRating !== null);
    
    document.getElementById('statsAdded').textContent = userSpots.length;
    document.getElementById('statsRated').textContent = ratedSpots.length;
}

// ===== Notification =====
function showNotification(message, type = 'success') {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        background-color: ${type === 'success' ? 'var(--success)' : 'var(--error)'};
        color: white;
        padding: 14px 24px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        z-index: 2000;
        animation: slideUp 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===== CSS Animations =====
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
    
    @keyframes slideDown {
        from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
        }
    }
`;
document.head.appendChild(style);