import { CATEGORY_ICONS, CATEGORY_COLORS, DEFAULT_ICON, DEFAULT_COLOR } from '../utils/constants.js';

export class MapManager {
    #map;
    #markers = [];
    #tileLayer;

    constructor() {
        this.#map = null;
    }

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

    clearMarkers() {
        for (let i = 0; i < this.#markers.length; i++) {
            this.#map.removeLayer(this.#markers[i]);
        }
        this.#markers = [];
    }

    renderMarkers(spots, currentFilter) {
        this.clearMarkers();
        let filtered = spots;
        if (currentFilter !== 'all') {
            filtered = filtered.filter(spot => spot.getCategory() === currentFilter);
        }
        for (let i = 0; i < filtered.length; i++) {
            const spot = filtered[i];
            const marker = this.#createMarker(spot);
            this.#markers.push(marker);
        }
    }

    #createMarker(spot) {
        const iconColor = this.#getCategoryColor(spot.getCategory());
        const customIcon = L.divIcon({
            html: `<div style="background: ${iconColor}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 6px black;"><i class="fas ${this.#getIconClass(spot.getCategory())}" style="color: white; font-size: 16px;"></i></div>`,
            iconSize: [32, 32],
            className: 'custom-div-icon'
        });
        const marker = L.marker([spot.getLat(), spot.getLng()], { icon: customIcon }).addTo(this.#map);
        marker.bindPopup(`<b>${spot.getName()}</b><br>${spot.getCategory()}<br>⭐ ${spot.getAverageRating().toFixed(1)}`);
        marker.spotId = spot.getId();
        return marker;
    }

    #getCategoryColor(category) {
        return CATEGORY_COLORS[category] || DEFAULT_COLOR;
    }

    #getIconClass(category) {
        return CATEGORY_ICONS[category] || DEFAULT_ICON;
    }

    addMarker(spot, callbackOnClick) {
        const marker = this.#createMarker(spot);
        marker.on('click', () => callbackOnClick(spot));
        this.#markers.push(marker);
        return marker;
    }

    onMapClick(handler) {
        if (this.#map) {
            this.#map.on('click', handler);
        }
    }

    invalidateSize() {
        if (this.#map) {
            setTimeout(() => this.#map.invalidateSize(), 100);
        }
    }
}
