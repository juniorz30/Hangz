// models/Location.js
// Basisklasse voor alle locaties - Dutch/Engels mix
export class Location {
    #lat; // latitude / breedtegraad
    #lng; // longitude / lengtegraad

    constructor(lat, lng) {
        if (typeof lat !== 'number' || typeof lng !== 'number') {
            throw new Error('Ongeldige coördinaten'); // Invalid coords
        }
        this.#lat = lat;
        this.#lng = lng;
    }

    getLat() { return this.#lat; }
    getLng() { return this.#lng; }

    // Zet coördinaten (setter met validatie)
    setCoords(lat, lng) {
        this.#lat = lat;
        this.#lng = lng;
    }

    // Methode om coordinaten als object te krijgen
    toLatLng() {
        return { lat: this.#lat, lng: this.#lng };
    }
}