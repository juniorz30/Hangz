// models/Location.js
// Basisklasse voor alle locaties
export class Location {
    constructor(lat, lng) {
        if (typeof lat !== 'number' || typeof lng !== 'number') {
            throw new Error('Ongeldige coördinaten');
        }
        this.lat = lat;
        this.lng = lng;
    }

    getLat() { return this.lat; }
    getLng() { return this.lng; }

    // Zet coördinaten (setter met validatie)
    setCoords(lat, lng) {
        if (typeof lat !== 'number' || typeof lng !== 'number') {
            throw new Error('Ongeldige coördinaten');
        }
        this.lat = lat;
        this.lng = lng;
    }

    // Methode om coordinaten als object te krijgen
    toLatLng() {
        return { lat: this.lat, lng: this.lng };
    }
}