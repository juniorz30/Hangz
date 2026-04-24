// models/Gym.js
import { Spot } from './Spot.js';

export class Gym extends Spot {
    #hasShowers;

    constructor(id, name, description, lat, lng, addedBy, ratings, userRating, hasShowers = false) {
        super(id, name, 'gym', description, lat, lng, addedBy, ratings, userRating);
        this.#hasShowers = hasShowers;
    }

    hasShowers() { return this.#hasShowers; }

    toJSON() {
        return {
            type: 'Gym',
            id: this.getId(),
            name: this.getName(),
            category: this.getCategory(),
            description: this.getDescription(),
            lat: this.getLat(),
            lng: this.getLng(),
            addedBy: this.getAddedBy(),
            ratings: this.getRatings(),
            userRating: this.getUserRating(),
            hasShowers: this.#hasShowers
        };
    }
}