// managers/MapManager.js
export class MapManager {
    #map;
    #markers = [];      // Array van Leaflet marker objects
    #tileLayer;

    constructor() {
        this.#map = null;
    }

    // Initialiseer de kaart met dark tiles
    init(centerLat, centerLng, zoom) {
        this.#map = L.map('leafletMap').setView([centerLat, centerLng], zoom);
        this.#tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; CARTO',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(this.#map);
        return this.#map;
    }

    getMap() {
        return this.#map;
    }

    // Wis alle markers van de kaart
    clearMarkers() {
        for (let i = 0; i < this.#markers.length; i++) {
            this.#map.removeLayer(this.#markers[i]);
        }
        this.#markers = [];
    }

    // Teken markers op basis van een array van Spot objecten
    renderMarkers(spots, currentFilter, searchQuery = '') {
        this.clearMarkers();
        // filteren
        let filtered = spots;
        if (currentFilter !== 'all') {
            filtered = filtered.filter(spot => spot.getCategory() === currentFilter);
        }
        if (searchQuery !== '') {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(spot => spot.getName().toLowerCase().includes(q));
        }
        // markers toevoegen
        for (let i = 0; i < filtered.length; i++) {
            const spot = filtered[i];
            const marker = this.#createMarker(spot);
            this.#markers.push(marker);
        }
    }

    // Interne marker-creatie met custom icoon en popup
    #createMarker(spot) {
        const iconColor = this.#getCategoryColor(spot.getCategory());
        const customIcon = L.divIcon({
            html: `<div style="background: ${iconColor}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 6px black;"><i class="fas ${this.#getIconClass(spot.getCategory())}" style="color: white; font-size: 16px;"></i></div>`,
            iconSize: [32, 32],
            className: 'custom-div-icon'
        });
        const marker = L.marker([spot.getLat(), spot.getLng()], { icon: customIcon }).addTo(this.#map);
        marker.bindPopup(`<b>${spot.getName()}</b><br>${spot.getCategory()}<br>⭐ ${spot.getAverageRating().toFixed(1)}`);
        // store spot id in marker for later
        marker.spotId = spot.getId();
        return marker;
    }

    #getCategoryColor(category) {
        const colors = {
            park: '#2ecc71',
            gym: '#3498db',
            restaurant: '#e67e22',
            activiteit: '#9b59b6',
            muziekschool: '#e91e63',
            pedicure: '#1abc9c'
        };
        return colors[category] || '#ff7b2c';
    }

    #getIconClass(category) {
        const icons = {
            park: 'fa-tree',
            gym: 'fa-dumbbell',
            restaurant: 'fa-utensils',
            activiteit: 'fa-hiking',
            muziekschool: 'fa-music',
            pedicure: 'fa-spa'
        };
        return icons[category] || 'fa-map-marker-alt';
    }

    // Voeg een nieuwe marker toe (zonder hele hertekening)
    addMarker(spot, callbackOnClick) {
        const marker = this.#createMarker(spot);
        marker.on('click', () => callbackOnClick(spot));
        this.#markers.push(marker);
        return marker;
    }

    // Zet click handler op de kaart
    onMapClick(handler) {
        if (this.#map) {
            this.#map.on('click', handler);
        }
    }

    // Forceer resize (nodig bij view switch)
    invalidateSize() {
        if (this.#map) {
            setTimeout(() => this.#map.invalidateSize(), 100);
        }
    }
}