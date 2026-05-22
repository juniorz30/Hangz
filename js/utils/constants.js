// constants.js - Vaste waarden die op meerdere plekken gebruikt worden
// Centrale plek zodat je niet dezelfde waarden 2× hoeft uit te typen

// Iconen voor elke categorie (Font Awesome klassen)
export const CATEGORY_ICONS = {
    park: 'fa-tree',
    gym: 'fa-dumbbell',
    restaurant: 'fa-utensils',
    activiteit: 'fa-hiking',
    muziekschool: 'fa-music',
    pedicure: 'fa-spa',
    winkel: 'fa-shopping-bag',
    bibliotheek: 'fa-book',
    supermarkt: 'fa-shopping-cart',
    museum: 'fa-landmark',
    koffie: 'fa-coffee'
};

// Kleuren voor elke categorie (hex waarden)
export const CATEGORY_COLORS = {
    park: '#2ecc71',
    gym: '#3498db',
    restaurant: '#e67e22',
    activiteit: '#9b59b6',
    muziekschool: '#e91e63',
    pedicure: '#1abc9c',
    winkel: '#f39c12',
    bibliotheek: '#9b59b6',
    supermarkt: '#e74c3c',
    museum: '#8e44ad',
    koffie: '#c0392b'
};

// Default icoon/kleur als categorie onbekend is
export const DEFAULT_ICON = 'fa-map-marker-alt';
export const DEFAULT_COLOR = '#ff7b2c';
