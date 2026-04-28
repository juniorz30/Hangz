// models/Location.js
// Basisklasse voor alle locaties - 
export class Location {
    #lat; // latitude / breedtegraad en door die hash kunnen we deze variabelen privé maken, zodat ze niet direct van buitenaf kunnen worden aangepast
    #lng; // longitude / lengtegraad

    constructor(lat, lng) { // Validatie van coördinaten
        if (typeof lat !== 'number' || typeof lng !== 'number') {
            throw new Error('Ongeldige coördinaten'); // geef een foutmelding als de coördinaten niet van het juiste type zijn
        }
        this.#lat = lat; // Initialiseer de coördinaten
        this.#lng = lng;
    }

    getLat() { return this.#lat; }//getters voor coördinaten
    getLng() { return this.#lng; }//getters voor coördinaten

    // Zet coördinaten (setter met validatie)
    setCoords(lat, lng) {
        this.#lat = lat;
        this.#lng = lng;
    }

    // Methode om coordinaten als object te krijgen
    toLatLng() {// Geeft de coördinaten terug als een object met lat en lng
        return { lat: this.#lat, lng: this.#lng };
    }
}