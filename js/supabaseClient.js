import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Error(
        'Supabase env vars ontbreken. Check je .env-bestand en herstart `npm run dev`.'
    );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
        persistSession: true,       // bewaar de sessie in localStorage zodat refresh de gebruiker ingelogd houdt
        autoRefreshToken: true,     // vernieuw de JWT stilletjes voordat hij verloopt
        detectSessionInUrl: true,   // nodig voor OAuth + magic links
    },
});

// Stel beschikbaar op window tijdens development zodat je er vanuit de browser-console mee kunt spelen.
// Verwijder dit (of beveilig het met een build-flag) voordat je naar productie gaat.
if (import.meta.env.DEV) {
    window.supabase = supabase;
}