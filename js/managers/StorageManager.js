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
            new Spot(1, 'OverKop Willebroek', 'activiteit', 'Jongerencentrum voor 12-25 jaar met basketbal, zaalvoetbal, thaibox en een hangplek voor jongeren.', 51.0606, 4.3583, 'DemoSpot', [4,5,4,4], null),
            new Gym(2, 'Gym Willebroek', 'Moderne fitnessruimte met douches.', 51.0580, 4.3600, 'DemoSpot', [4,4,5], null, true),
            new Spot(3, 'Fort Breendonk', 'museum', 'Historisch fort met interessante geschiedenis.', 51.0567, 4.3414, 'DemoSpot', [5,5,5,4,5], null),
            new Spot(4, 'De Blijk Park', 'park', 'Gezellig park met speeltuin en wandelpaden.', 51.0630, 4.3550, 'DemoSpot', [4,4,5,4], null),
            new Restaurant(5, 'Popina', 'Heerlijke Italiaanse tapas en gerechten.', 51.0600, 4.3595, 'DemoSpot', [5,5,4], null, 'Italiaans'),
            new Spot(6, 'Pedicure Erlyanti', 'pedicure', 'Professionele pedicurepraktijk in het centrum.', 51.0590, 4.3560, 'DemoSpot', [5,5,5], null),
            new Spot(7, 'Delhaize Willebroek', 'supermarkt', 'Supermarkt met breed assortiment.', 51.0595, 4.3605, 'DemoSpot', [4,4,4,5], null),
            new Spot(8, 'Lidl Willebroek', 'supermarkt', 'Goedkope supermarkt met dagelijks assortiment.', 51.0610, 4.3540, 'DemoSpot', [4,4,4], null),
            new Spot(9, 'Bibliotheek Willebroek', 'bibliotheek', 'Openbare bibliotheek met boeken en computers.', 51.0620, 4.3575, 'DemoSpot', [5,4,5], null),
            new Spot(10, 'Station Willebroek', 'station', 'Treinstation met verbindingen naar Brussel.', 51.0550, 4.3620, 'DemoSpot', [4,4,4], null),
            new Restaurant(11, 'Best Kebab', 'Heerlijke Turkse kebab en mezze.', 51.0615, 4.3590, 'DemoSpot', [4,5,4], null, 'Turks'),
            new Restaurant(12, 'Emir Kebab', 'Smaakvolle kebab en Turkse specialiteiten.', 51.0580, 4.3520, 'DemoSpot', [5,4,5], null, 'Turks'),
            new Gym(13, 'Ironbase Gym', 'Professionele crossfit en fitnessclub met modern gereedschap.', 51.0605, 4.3650, 'DemoSpot', [4,4,4,5], null, true),
            new Spot(14, 'De Schalk', 'activiteit', 'Multifunctionele sportzaal voor atletiek en diverse sporten.', 51.0640, 4.3500, 'DemoSpot', [4,4,5], null),
            new Spot(15, 'Albert Heijn', 'winkel', 'Supermarkt en winkel voor dagelijkse boodschappen.', 51.0575, 4.3580, 'DemoSpot', [4,4,4], null),
            new Spot(16, 'Kruidvat Willebroek', 'winkel', 'Drogisterij met cosmetica en verzorgingsproducten.', 51.0615, 4.3520, 'DemoSpot', [4,5,4], null),
            new Spot(17, 'Piepel', 'activiteit', 'Sportzaal voor diverse activiteiten en jeugd.', 51.0630, 4.3610, 'DemoSpot', [5,4,5], null),
            new Spot(18, 'Coco Canal', 'restaurant', 'Trendy brunchplek met moderne gerechten en terras.', 51.0590, 4.3630, 'DemoSpot', [5,5,4], null),
            new Spot(19, 'Plan C', 'koffie', 'Hippe bar met gezellige sfeer en drinken.', 51.0560, 4.3550, 'DemoSpot', [4,4,4], null),
            new Spot(20, 'VTS', 'activiteit', 'Professionele sportzaal met diverse trainingsmogelijkheden.', 51.0670, 4.3520, 'DemoSpot', [4,4,4,5], null),

            //PUURS (20 spots)
            new Spot(21, 'Park Fort Liezele', 'park', 'Mooi park met historisch fort en wandelpaden.', 51.0410, 4.2720, 'DemoSpot', [4,4,5], null),
            new Spot(22, 'Station Puurs', 'station', 'Treinstation met directe verbinding naar Antwerpen.', 51.0380, 4.2750, 'DemoSpot', [4,4,4], null),
            new Spot(23, 'Delhaize Puurs', 'supermarkt', 'Supermarkt met compleet assortiment.', 51.0420, 4.2730, 'DemoSpot', [4,4,4,5], null),
            new Restaurant(24, 'Broox', 'Vers bereid eten met kwaliteit ingrediënten.', 51.0400, 4.2690, 'DemoSpot', [4,4,5], null, 'Modern'),
            new Restaurant(25, 'PuursFOOD', 'Lekker eten voor de hele familie.', 51.0415, 4.2780, 'DemoSpot', [5,4,5], null, 'Mixed'),
            new Spot(26, 'Bibliotheek Puurs', 'bibliotheek', 'Moderne bibliotheek met digitale diensten.', 51.0425, 4.2705, 'DemoSpot', [4,5,4], null),
            new Spot(27, 'Café De Vierklaver', 'koffie', 'Gezellig café met bruine kroeggevoel.', 51.0410, 4.2735, 'DemoSpot', [4,5,5], null),
            new Spot(28, 'STEPP Padel Tennis Club', 'activiteit', 'Moderne padel tennis club met professionele banen.', 51.0440, 4.2740, 'DemoSpot', [4,4,5], null),
            new Gym(29, 'Cross Gym', 'Intensieve crossfit en functionaltraining.', 51.0395, 4.2725, 'DemoSpot', [4,4,5], null, true),
            new Spot(30, 'Seinhuisje Puurs', 'station', 'Charmant historisch seinhuisje voor treinliefhebbers.', 51.0435, 4.2760, 'DemoSpot', [5,4,5], null),
            new Spot(31, 'Kalfort Puursica', 'activiteit', 'Sportcomplexe met meerdere sportterreinen.', 51.0405, 4.2695, 'DemoSpot', [4,4,5], null),
            new Spot(32, 'Knabbel en Babbel', 'broodje', 'Broodjeszaak met verse ingrediënten.', 51.0420, 4.2710, 'DemoSpot', [4,4,4], null),
            new Spot(33, 'Snack Grace', 'broodje', 'Lekker broodje en snacks.', 51.0430, 4.2750, 'DemoSpot', [4,4,4,5], null),
            new Restaurant(34, 'Kassita', 'Heerlijke Marokkaanse keuken en tajines.', 51.0415, 4.2745, 'DemoSpot', [5,4,5], null, 'Marokaans'),
            new Spot(35, 'The Binder', 'bioscoop', 'Bioscoop en theater in voormalig begijnhof.', 51.0380, 4.2680, 'DemoSpot', [4,5,4], null),
            new Spot(36, 'Muziekschool Campus Begijnhof', 'muziek', 'Professionele muziekles en studio\'s.', 51.0450, 4.2700, 'DemoSpot', [4,4,4,5], null),
            new Spot(37, 'Sjabi', 'koffie', 'Trendy koffiebar met broodjes.', 51.0390, 4.2770, 'DemoSpot', [4,4,4], null),
            new Spot(38, 'Rode Blok', 'activiteit', 'Creatief centrum met workshops en kunst.', 51.0425, 4.2720, 'DemoSpot', [4,5,4], null),
            new Spot(39, 'Klooster Park', 'park', 'Historisch park rond oud klooster.', 51.0460, 4.2730, 'DemoSpot', [4,4,5], null),
            new Spot(40, 'Bibliotheek Zuid Puurs', 'bibliotheek', 'Bibliotheekvestiging op het zuiden van Puurs.', 51.0370, 4.2760, 'DemoSpot', [4,4,4], null),

            // MECHELEN (20 spots) 
            new Spot(41, 'Vrijbroekpark', 'park', 'Prachtig park met dierenweide en wandelpaden.', 51.0259, 4.4775, 'DemoSpot', [5,4,5,4,5], null),
            new Spot(42, 'Dierentuin Mechelen', 'activiteit', 'Mooie dierentuin met diverse dieren.', 51.0245, 4.4800, 'DemoSpot', [5,4,5], null),
            new Spot(43, 'Sint-Romboutskathedraal', 'museum', 'Indrukwekkende gotische kathedraal en museum.', 51.0290, 4.4760, 'DemoSpot', [5,5,5,5], null),
            new Spot(44, 'Station Mechelen', 'station', 'Centraal treinstation met verbindingen overal heen.', 51.0320, 4.4770, 'DemoSpot', [4,4,4], null),
            new Spot(45, 'Delhaize Centrum Mechelen', 'supermarkt', 'Supermarkt in het centrum van Mechelen.', 51.0285, 4.4780, 'DemoSpot', [4,4,4,5], null),
            new Spot(46, 'Aldi Mechelen', 'supermarkt', 'Budget supermarkt met breed assortiment.', 51.0310, 4.4750, 'DemoSpot', [4,4,4], null),
            new Spot(47, 'Ici Paris', 'winkel', 'Beautywinkels met cosmetica en verzorgingsproducten.', 51.0295, 4.4765, 'DemoSpot', [5,5,5], null),
            new Spot(48, 'Bibliotheek Mechelen', 'bibliotheek', 'Moderne bibliotheek met leeszaal en computers.', 51.0305, 4.4755, 'DemoSpot', [5,4,5], null),
            new Spot(49, 'Inno', 'winkel', 'Trendsetters winkel met kleding en lifestyle.', 51.0280, 4.4790, 'DemoSpot', [4,5,4], null),
            new Spot(50, 'C&A', 'winkel', 'Kledingwinkel met mode voor heel het gezin.', 51.0340, 4.4730, 'DemoSpot', [4,4,4,5], null),
            new Gym(51, 'Basic Fit Mechelen', 'Fitness center met uitgebreide apparatuur.', 51.0300, 4.4800, 'DemoSpot', [4,4,5], null, true),
            new Spot(52, 'Museum Het Begijnhof', 'museum', 'Historisch begijnhof met museale functie.', 51.0325, 4.4710, 'DemoSpot', [5,4,5], null),
            new Spot(53, 'H&M', 'winkel', 'Modewinkels met sportkleding en jeugdkleding.', 51.0275, 4.4740, 'DemoSpot', [4,5,4], null),
            new Spot(54, 'Hema', 'winkel', 'Huis- en keukengerei met praktische huishoudartikelen.', 51.0295, 4.4775, 'DemoSpot', [5,4,5], null),
            new Spot(55, 'Carrefour Mechelen', 'supermarkt', 'Hypermarkt met groot assortiment.', 51.0310, 4.4785, 'DemoSpot', [4,4,4], null),
            new Restaurant(56, 'Otacos', 'Vers bereide taco\'s en burrito\'s.', 51.0285, 4.4765, 'DemoSpot', [5,5,5], null, 'Mexicaans'),
            new Restaurant(57, 'Belchicken', 'Knapperige gebakken kip en sides.', 51.0300, 4.4745, 'DemoSpot', [4,4,4], null, 'Belgisch'),
            new Spot(58, 'Groenpark Mechelen', 'park', 'Groen oasis in het centrum van Mechelen.', 51.0350, 4.4760, 'DemoSpot', [4,4,5], null),
            new Restaurant(59, 'Pokebowl Mechelen', 'Verse Hawaiian poke bowls met diverse toppings.', 51.0320, 4.4800, 'DemoSpot', [5,4,5], null, 'Hawaïaans'),
            new Spot(60, 'De Margriet', 'winkel', 'Biologische supermarkt met gezonde producten.', 51.0275, 4.4755, 'DemoSpot', [5,4,5], null)
        ];
    }

    // Verwijder alle gebruikersgerelateerde data uit localStorage
    clearAllUserData() {
        localStorage.removeItem('hangz_spots');
    }
}