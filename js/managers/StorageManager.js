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
            // WILLEBROEK (20 spots) 
            new Spot(1, 'OverKop Willebroek', 'activiteit', 'Jongerencentrum voor 12-25 jaar met basketbal, zaalvoetbal, thaibox en een hangplek voor jongeren.', 51.0606, 4.3583, 'HangzDemo', [4,5,4,4], null),
            new Gym(2, 'Gym Willebroek', 'Moderne fitnessruimte met douches.', 51.0580, 4.3600, 'HangzDemo', [4,4,5], null, true),
            new Spot(3, 'Fort Breendonk', 'museum', 'Historisch fort met interessante geschiedenis.', 51.0567, 4.3414, 'HangzDemo', [5,5,5,4,5], null),
            new Spot(4, 'De Blijk Park', 'park', 'Gezellig park met speeltuin en wandelpaden.', 51.0630, 4.3550, 'HangzDemo', [4,4,5,4], null),
            new Restaurant(5, 'Popina', 'Heerlijke Italiaanse tapas en gerechten.', 51.0600, 4.3595, 'HangzDemo', [5,5,4], null, 'Italiaans'),
            new Spot(6, 'Pedicure Erlyanti', 'pedicure', 'Professionele pedicurepraktijk in het centrum.', 51.0590, 4.3560, 'HangzDemo', [5,5,5], null),
            new Spot(7, 'Delhaize Willebroek', 'supermarkt', 'Supermarkt met breed assortiment.', 51.0595, 4.3605, 'HangzDemo', [4,4,4,5], null),
            new Spot(8, 'Lidl Willebroek', 'supermarkt', 'Goedkope supermarkt met dagelijks assortiment.', 51.0610, 4.3540, 'HangzDemo', [4,4,4], null),
            new Spot(9, 'Bibliotheek Willebroek', 'bibliotheek', 'Openbare bibliotheek met boeken en computers.', 51.0620, 4.3575, 'HangzDemo', [5,4,5], null),
            new Spot(10, 'Station Willebroek', 'station', 'Treinstation met verbindingen naar Brussel.', 51.0550, 4.3620, 'HangzDemo', [4,4,4], null),
            new Restaurant(11, 'Best Kebab', 'Heerlijke Turkse kebab en mezze.', 51.0615, 4.3590, 'HangzDemo', [4,5,4], null, 'Turks'),
            new Restaurant(12, 'Emir Kebab', 'Smaakvolle kebab en Turkse specialiteiten.', 51.0580, 4.3520, 'HangzDemo', [5,4,5], null, 'Turks'),
            new Gym(13, 'Ironbase Gym', 'Professionele crossfit en fitnessclub met modern gereedschap.', 51.0605, 4.3650, 'HangzDemo', [4,4,4,5], null, true),
            new Spot(14, 'De Schalk', 'activiteit', 'Multifunctionele sportzaal voor atletiek en diverse sporten.', 51.0640, 4.3500, 'HangzDemo', [4,4,5], null),
            new Spot(15, 'Albert Heijn', 'winkel', 'Supermarkt en winkel voor dagelijkse boodschappen.', 51.0575, 4.3580, 'HangzDemo', [4,4,4], null),
            new Spot(16, 'Kruidvat Willebroek', 'winkel', 'Drogisterij met cosmetica en verzorgingsproducten.', 51.0615, 4.3520, 'HangzDemo', [4,5,4], null),
            new Spot(17, 'Piepel', 'activiteit', 'Sportzaal voor diverse activiteiten en jeugd.', 51.0630, 4.3610, 'HangzDemo', [5,4,5], null),
            new Spot(18, 'Coco Canal', 'restaurant', 'Trendy brunchplek met moderne gerechten en terras.', 51.0590, 4.3630, 'HangzDemo', [5,5,4], null),
            new Spot(19, 'Plan C', 'koffie', 'Hippe bar met gezellige sfeer en drinken.', 51.0560, 4.3550, 'HangzDemo', [4,4,4], null),
            new Spot(20, 'VTS', 'activiteit', 'Professionele sportzaal met diverse trainingsmogelijkheden.', 51.0670, 4.3520, 'HangzDemo', [4,4,4,5], null),

            //PUURS (20 spots)
            new Spot(21, 'Centraal Park Puurs', 'park', 'Mooi park in het centrum met groen en bankjes.', 51.0410, 4.2720, 'HangzDemo', [4,4,5], null),
            new Spot(22, 'Station Puurs', 'station', 'Treinstation met directe verbinding naar Antwerpen.', 51.0380, 4.2750, 'HangzDemo', [4,4,4], null),
            new Spot(23, 'Delhaize Puurs', 'supermarkt', 'Supermarkt met compleet assortiment.', 51.0420, 4.2730, 'HangzDemo', [4,4,4,5], null),
            new Spot(24, 'Lidl Puurs', 'supermarkt', 'Budget supermarkt met goede prijzen.', 51.0400, 4.2690, 'HangzDemo', [4,4,4], null),
            new Restaurant(25, 'Restaurant Aan de Stroom', 'Mediterrane keuken met uitzicht op de rivier.', 51.0415, 4.2780, 'HangzDemo', [5,4,5], null, 'Mediterraan'),
            new Spot(26, 'Bibliotheek Puurs', 'bibliotheek', 'Moderne bibliotheek met digitale diensten.', 51.0425, 4.2705, 'HangzDemo', [4,5,4], null),
            new Spot(27, 'Café De Centrale', 'koffie', 'Traditioneel café met sterke Belgische koffie.', 51.0410, 4.2735, 'HangzDemo', [4,5,5], null),
            new Spot(28, 'Park De Watering', 'park', 'Park met wandelroutes en rustige zithoeken.', 51.0440, 4.2740, 'HangzDemo', [4,4,5], null),
            new Gym(29, 'Fitnessclub Puurs', 'Professionele gym met sauna en douchefaciliteiten.', 51.0395, 4.2725, 'HangzDemo', [4,4,5], null, true),
            new Spot(30, 'Museum Lokaal Puurs', 'museum', 'Klein museum over de geschiedenis van Puurs.', 51.0435, 4.2760, 'HangzDemo', [5,4,5], null),
            new Restaurant(31, 'Restaurant Sint-Genesious', 'Belgische huiskeuken met huisgemaakte geruchten.', 51.0405, 4.2695, 'HangzDemo', [4,4,5], null, 'Belgisch'),
            new Spot(32, 'Winkelcentrum Puurs', 'winkel', 'Winkelcentrum met diverse winkels en diensten.', 51.0420, 4.2710, 'HangzDemo', [4,4,4], null),
            new Spot(33, 'Jumbo Supermarkt Puurs', 'supermarkt', 'Grote supermarkt met breed assortiment.', 51.0430, 4.2750, 'HangzDemo', [4,4,4,5], null),
            new Spot(34, 'Espresso Bar Puurs', 'koffie', 'Italiaanse koffiebar met capuccino en espresso.', 51.0415, 4.2745, 'HangzDemo', [5,4,5], null),
            new Spot(35, 'Tennis Club Puurs', 'activiteit', 'Tennisclub met indoor en outdoor courts.', 51.0380, 4.2680, 'HangzDemo', [4,5,4], null),
            new Spot(36, 'Park Noord Puurs', 'park', 'Ruim park met speeltoestellen en voetbalveld.', 51.0450, 4.2700, 'HangzDemo', [4,4,4,5], null),
            new Spot(37, 'Carrefour Puurs', 'supermarkt', 'Grote hypermarkt met alles wat je nodig hebt.', 51.0390, 4.2770, 'HangzDemo', [4,4,4], null),
            new Restaurant(38, 'La Dolce Vita', 'Italiaans restaurant met pasta en pizza.', 51.0425, 4.2720, 'HangzDemo', [4,5,4], null, 'Italiaans'),
            new Spot(39, 'Klooster Park', 'park', 'Historisch park rond oud klooster.', 51.0460, 4.2730, 'HangzDemo', [4,4,5], null),
            new Spot(40, 'Bibliotheek Zuid Puurs', 'bibliotheek', 'Bibliotheekvestiging op het zuiden van Puurs.', 51.0370, 4.2760, 'HangzDemo', [4,4,4], null),

            // ===== MECHELEN (20 spots) =====
            new Spot(41, 'Vrijbroekpark', 'park', 'Prachtig park met dierenweide en wandelpaden.', 51.0259, 4.4775, 'HangzDemo', [5,4,5,4,5], null),
            new Spot(42, 'Dierentuin Mechelen', 'activiteit', 'Mooie dierentuin met diverse dieren.', 51.0245, 4.4800, 'HangzDemo', [5,4,5], null),
            new Spot(43, 'Sint-Romboutskathedraal', 'museum', 'Indrukwekkende gotische kathedraal en museum.', 51.0290, 4.4760, 'HangzDemo', [5,5,5,5], null),
            new Spot(44, 'Station Mechelen', 'station', 'Centraal treinstation met verbindingen overal heen.', 51.0320, 4.4770, 'HangzDemo', [4,4,4], null),
            new Spot(45, 'Delhaize Centrum Mechelen', 'supermarkt', 'Supermarkt in het centrum van Mechelen.', 51.0285, 4.4780, 'HangzDemo', [4,4,4,5], null),
            new Spot(46, 'Lidl Mechelen', 'supermarkt', 'Budget supermarkt met goede aanbiedingen.', 51.0310, 4.4750, 'HangzDemo', [4,4,4], null),
            new Restaurant(47, 'Restaurant Den Jonghe', 'Belgische topkeuken in het hartje van Mechelen.', 51.0295, 4.4765, 'HangzDemo', [5,5,5], null, 'Belgisch'),
            new Spot(48, 'Bibliotheek Mechelen', 'bibliotheek', 'Moderne bibliotheek met leeszaal en computers.', 51.0305, 4.4755, 'HangzDemo', [5,4,5], null),
            new Spot(49, 'Café De Oude Tuin', 'koffie', 'Oud-Mechelse koffiebar met terras.', 51.0280, 4.4790, 'HangzDemo', [4,5,4], null),
            new Spot(50, 'Busleytonpark', 'park', 'Groot stadspark met speelweide.', 51.0340, 4.4730, 'HangzDemo', [4,4,4,5], null),
            new Gym(51, 'Fitness Center Mechelen', 'State of the art gym in het centrum.', 51.0300, 4.4800, 'HangzDemo', [4,4,5], null, true),
            new Spot(52, 'Museum Het Begijnhof', 'museum', 'Historisch begijnhof met museale functie.', 51.0325, 4.4710, 'HangzDemo', [5,4,5], null),
            new Restaurant(53, 'Restaurant A l\'Africain', 'Afrikaanse gerechten en specialiteiten.', 51.0275, 4.4740, 'HangzDemo', [4,5,4], null, 'Afrikaans'),
            new Spot(54, 'Winkel De Stijl', 'winkel', 'Kunstwinkel met design en craft producten.', 51.0295, 4.4775, 'HangzDemo', [5,4,5], null),
            new Spot(55, 'Carrefour Express Mechelen', 'supermarkt', 'Compacte supermarkt in het centrum.', 51.0310, 4.4785, 'HangzDemo', [4,4,4], null),
            new Spot(56, 'Koffietijd Mechelen', 'koffie', 'Moderne koffieshop met speciality coffee.', 51.0285, 4.4765, 'HangzDemo', [5,5,5], null),
            new Spot(57, 'Paardenmarkt Mechelen', 'activiteit', 'Historisch marktplein met evenementen.', 51.0300, 4.4745, 'HangzDemo', [4,4,4], null),
            new Spot(58, 'Groenpark Mechelen', 'park', 'Groen oasis in het centrum van Mechelen.', 51.0350, 4.4760, 'HangzDemo', [4,4,5], null),
            new Restaurant(59, 'Restaurant La Traviata', 'Italiaans restaurant met opera muziek.', 51.0320, 4.4800, 'HangzDemo', [5,4,5], null, 'Italiaans'),
            new Spot(60, 'Boekwinkeltje Mechelen', 'winkel', 'Kleine boekwinkel met tweedehands en nieuw.', 51.0275, 4.4755, 'HangzDemo', [5,4,5], null)
        ];
    }

    // Verwijder alle gebruikersgerelateerde data uit localStorage
    clearAllUserData() {
        localStorage.removeItem('hangz_spots');
    }
}