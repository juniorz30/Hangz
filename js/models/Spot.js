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
        this.#id = id;
        this.#name = name;
        this.#category = category;
        this.#description = description;
        this.#addedBy = addedBy;
        this.#ratings = ratings;
        this.#userRating = userRating;
    }

    // Getters
    getId() { return this.#id; }
    getName() { return this.#name; }
    getCategory() { return this.#category; }
    getDescription() { return this.#description; }
    getAddedBy() { return this.#addedBy; }
    getRatings() { return [...this.#ratings]; }
    getUserRating() { return this.#userRating; }

    // Berekent gemiddelde met for-loop
    getAverageRating() {
        if (this.#ratings.length === 0) return 0;
        let sum = 0;
        for (let i = 0; i < this.#ratings.length; i++) {
            sum += this.#ratings[i];
        }
        return sum / this.#ratings.length;
    }

    // Voeg rating toe (vervangt oude rating van dezelfde gebruiker)
    addRating(rating, username) {
        // Verwijder eventuele bestaande rating van deze gebruiker
        const index = this.#ratings.findIndex(r => r.user === username);
        if (index !== -1) this.#ratings.splice(index, 1);
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