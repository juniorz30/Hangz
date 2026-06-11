import { supabase } from '../supabaseClient.js';
import { Spot } from '../models/Spot.js';
import { Gym } from '../models/Gym.js';
import { Restaurant } from '../models/Restaurant.js';

export class StorageManager {
    async loadSpots(currentUserId) {
        const { data, error } = await supabase
            .from('spots')
            .select('id, name, category, description, lat, lng, extras, added_by, ratings(rating, user_id)');
        if (error) {
            console.error('Spots laden mislukt:', error);
            return [];
        }
        return data.map(row => this._rowToModel(row, currentUserId));
    }

    // added_by wordt door Supabase zelf ingevuld via auth.uid().
    async addSpot({ name, category, description, lat, lng, extras = {} }) {
        const { data, error } = await supabase
            .from('spots')
            .insert({ name, category, description, lat, lng, extras })
            .select('id, name, category, description, lat, lng, extras, added_by, ratings(rating, user_id)')
            .single();
        if (error) throw error;
        return this._rowToModel(data, data.added_by);
    }

    async rateSpot(spotId, rating) {
        const { error } = await supabase
            .from('ratings')
            .upsert({ spot_id: spotId, rating }, { onConflict: 'spot_id,user_id' });
        if (error) throw error;
    }

    _rowToModel(row, currentUserId) {
        const allRatings = (row.ratings || []).map(r => r.rating);
        const mine = (row.ratings || []).find(r => r.user_id === currentUserId);
        const userRating = mine ? mine.rating : null;

        if (row.category === 'gym') {
            return new Gym(
                row.id, row.name, row.description,
                row.lat, row.lng, row.added_by,
                allRatings, userRating,
                row.extras?.hasShowers ?? false
            );
        }
        if (row.category === 'restaurant') {
            return new Restaurant(
                row.id, row.name, row.description,
                row.lat, row.lng, row.added_by,
                allRatings, userRating,
                row.extras?.cuisineType ?? ''
            );
        }
        return new Spot(
            row.id, row.name, row.category, row.description,
            row.lat, row.lng, row.added_by,
            allRatings, userRating
        );
    }

    saveSpots() {}
    clearAllUserData() {}
}
