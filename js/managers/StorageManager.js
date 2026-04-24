// managers/StorageManager.js
import { Spot } from '../models/Spot.js';
import { Gym } from '../models/Gym.js';
import { Restaurant } from '../models/Restaurant.js';

export class StorageManager {
    loadSpots() {
        const stored = localStorage.getItem('hangz_spots');
        if (stored) {
            const data = JSON.parse(stored);
            // Converteer elk item terug naar de juiste klasse
            return data.map(item => {
                switch (item.type) {
                    case 'Gym':
                        return new Gym(
                            item.id, item.name, item.description,
                            item.lat, item.lng, item.addedBy,
                            item.ratings, item.userRating,
                            item.hasShowers
                        );
                    case 'Restaurant':
                        return new Restaurant(
                            item.id, item.name, item.description,
                            item.lat, item.lng, item.addedBy,
                            item.ratings, item.userRating,
                            item.cuisineType
                        );
                    default:
                        return new Spot(
                            item.id, item.name, item.category,
                            item.description, item.lat, item.lng,
                            item.addedBy, item.ratings, item.userRating
                        );
                }
            });
        }
        return this.getDefaultSpots();
    }

    saveSpots(spots) {
        const plain = spots.map(spot => spot.toJSON());
        localStorage.setItem('hangz_spots', JSON.stringify(plain));
    }

    getDefaultSpots() {
        return [
            new Spot(1, 'Vrijbroekpark', 'park', 'Prachtig park in Mechelen met wandelpaden en dierenweide.', 51.0259, 4.4775, 'HangzDemo', [5,4,5,4,5], null),
            new Spot(2, 'Overkop', 'activiteit', 'Jongerencentrum in Willebroek met workshops en evenementen.', 51.0606, 4.3583, 'HangzDemo', [4,5,4,4], null),
            // Gebruik subclass Gym
            new Gym(3, 'Gym Willebroek', 'Moderne fitnessruimte met douches.', 51.0580, 4.3600, 'HangzDemo', [4,4,5], null, true),
            new Spot(4, 'Fort Breendonk', 'activiteit', 'Historisch fort met museum.', 51.0567, 4.3414, 'HangzDemo', [5,5,5,4,5], null),
            new Spot(5, 'Muziekschool Kerkstraat', 'muziekschool', 'Muziekschool voor alle leeftijden.', 51.0615, 4.3570, 'HangzDemo', [4,5,4], null),
            new Spot(6, 'De Blijk Park', 'park', 'Gezellig park met speeltuin.', 51.0630, 4.3550, 'HangzDemo', [4,4,5,4], null),
            // Gebruik subclass Restaurant
            new Restaurant(8, 'Pizzeria Italia', 'Authentieke Italiaanse pizza en pasta.', 51.0600, 4.3595, 'HangzDemo', [5,5,4], null, 'Italiaans'),
            new Spot(7, 'Pedicure Sophia', 'pedicure', 'Professionele pedicurepraktijk.', 51.0590, 4.3560, 'HangzDemo', [5,5,5], null)
        ];
    }
}