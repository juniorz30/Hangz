import { Location } from './Location.js';

export class Spot extends Location {
    constructor(id, name, category, description, lat, lng, addedBy, ratings = [], userRating = null) {
        super(lat, lng);
        this.id = id;
        this.name = name;
        this.category = category;
        this.description = description;
        this.addedBy = addedBy;
        this.ratings = ratings;
        this.userRating = userRating;
    }

    getId() { return this.id; }
    getName() { return this.name; }
    getCategory() { return this.category; }
    getDescription() { return this.description; }
    getAddedBy() { return this.addedBy; }
    getRatings() { return this.ratings.slice(); }
    getUserRating() { return this.userRating; }

    getAverageRating() {
        if (this.ratings.length === 0) return 0;
        let sum = 0;
        for (let i = 0; i < this.ratings.length; i++) {
            const r = this.ratings[i];
            sum += (typeof r === 'number') ? r : r.value;
        }
        return sum / this.ratings.length;
    }

    addRating(rating, username) {
        this.ratings = this.ratings.filter(r => r.user !== username);
        this.ratings.push({ value: rating, user: username });
        this.userRating = rating;
    }

    setUserRating(rating) {
        this.userRating = rating;
    }

    toJSON() {
        return {
            type: 'Spot',
            id: this.id,
            name: this.name,
            category: this.category,
            description: this.description,
            lat: this.getLat(),
            lng: this.getLng(),
            addedBy: this.addedBy,
            ratings: this.ratings,
            userRating: this.userRating
        };
    }
}
