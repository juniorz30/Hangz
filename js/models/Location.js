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

    setCoords(lat, lng) {
        if (typeof lat !== 'number' || typeof lng !== 'number') {
            throw new Error('Ongeldige coördinaten');
        }
        this.lat = lat;
        this.lng = lng;
    }

    toLatLng() {
        return { lat: this.lat, lng: this.lng };
    }
}
