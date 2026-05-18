// models/Spot.js
import { Location } from './Location.js';

export class Spot extends Location {
    #id;
    #name;
    #category;
    #description;
    #addedBy;
    #ratings;
    #userRating;

    constructor(id, name, category, description, lat, lng, addedBy, ratings = [], userRating = null) {
        super(lat, lng);
        this.#id = id; // door die this.# slaan we deze variabele op in de klasse, maar kunnen we er niet direct van buitenaf bij, wat veiliger is
        this.#name = name;
        this.#category = category;
        this.#description = description;
        this.#addedBy = addedBy;
        this.#ratings = ratings; // verscil tussen ratings en userRating is dat ratings een array is van alle ratings van alle gebruikers, terwijl userRating alleen de rating van de huidige gebruiker bijhoudt
        this.#userRating = userRating;
    }

    // Getters
    getId() { return this.#id; } //
    getName() { return this.#name; }
    getCategory() { return this.#category; }
    getDescription() { return this.#description; }
    getAddedBy() { return this.#addedBy; }
    getRatings() { return [...this.#ratings]; }
    getUserRating() { return this.#userRating; }

    // Berekent gemiddelde van alle ratings
    // NOTE: ratings kunnen getallen zijn (5, 4) OF objecten ({ value: 5, user: 'Jan' })
    // Dit gebeurde omdat seed-data getallen heeft, maar addRating() objecten maakt.
    getAverageRating() {
        if (this.#ratings.length === 0) return 0;
        let sum = 0;
        for (let i = 0; i < this.#ratings.length; i++) {
            const r = this.#ratings[i];
            // Als het een getal is, use het direct; anders pak .value
            sum += (typeof r === 'number') ? r : r.value;
        }
        return sum / this.#ratings.length;
    }

    // Voeg rating toe (vervangt oude rating van dezelfde gebruiker)
    addRating(rating, username) {
        // Verwijder oude rating van deze gebruiker en voeg nieuwe toe
        this.#ratings = this.#ratings.filter(r => r.user !== username);
        this.#ratings.push({ value: rating, user: username });
        this.#userRating = rating;
    }

    setUserRating(rating) {
        this.#userRating = rating;
    }

    // Converteer naar plain object met type-aanduiding
    toJSON() {
        return {
            type: 'Spot',        // !!! Belangrijk voor het laden
            id: this.#id,
            name: this.#name,
            category: this.#category,
            description: this.#description,
            lat: this.getLat(),
            lng: this.getLng(),
            addedBy: this.#addedBy,
            ratings: this.#ratings,
            userRating: this.#userRating
        };
    }
}