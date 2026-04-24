// models/Restaurant.js
import { Spot } from './Spot.js';

export class Restaurant extends Spot {
    #cuisineType;

    constructor(id, name, description, lat, lng, addedBy, ratings, userRating, cuisineType = 'onbekend') {
        super(id, name, 'restaurant', description, lat, lng, addedBy, ratings, userRating);
        this.#cuisineType = cuisineType;
    }

    getCuisineType() { return this.#cuisineType; }

    toJSON() {
        return {
            type: 'Restaurant',
            id: this.getId(),
            name: this.getName(),
            category: this.getCategory(),
            description: this.getDescription(),
            lat: this.getLat(),
            lng: this.getLng(),
            addedBy: this.getAddedBy(),
            ratings: this.getRatings(),
            userRating: this.getUserRating(),
            cuisineType: this.#cuisineType
        };
    }
}