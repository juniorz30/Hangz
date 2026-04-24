// models/Park.js
import { Spot } from './Spot.js';

export class Park extends Spot {
    #hasPlayground;

    constructor(id, name, description, lat, lng, addedBy, ratings, userRating, hasPlayground) {
        super(id, name, 'park', description, lat, lng, addedBy, ratings, userRating);
        this.#hasPlayground = hasPlayground;
    }

    hasPlayground() { return this.#hasPlayground; }
}