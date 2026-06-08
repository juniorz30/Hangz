# Supabase setup & authenticatieflow — Hangz

Een stap-voor-stap plan om de huidige `AuthManager` (gebaseerd op localStorage) te vervangen door een echte Supabase auth-flow, en om spots naar Postgres te verhuizen achter Row Level Security.

Dit project is vanilla JavaScript met ES modules. Op dit moment wordt het direct vanuit de browser geladen (`<script type="module" src="js/app.js">`), maar om `npm`-pakketten zoals `@supabase/supabase-js` te kunnen gebruiken hebben we een klein beetje tooling nodig: **Vite**. Vite is een dev-server + bundler waarmee je gewoon `import { x } from 'een-npm-package'` kunt schrijven, met hot reload tijdens development en een geoptimaliseerde build voor productie. De setup is één `npm install` ver.

## Wat je aan het einde hebt

- Een login-modal waarmee gebruikers zich registreren en inloggen met e-mail + wachtwoord via Supabase.
- Een persistente sessie, zodat een terugkerende gebruiker niet opnieuw hoeft in te loggen.
- Een gastmodus waarmee je kunt rondkijken zonder account, maar zonder schrijfrechten.
- (Optioneel, Stap 7) Spots en beoordelingen opgeslagen in Postgres, gedeeld over alle apparaten, beschermd door Row Level Security.

## Roadmap

- **Stap 0** — Zet het npm-project en de dev-server op (Vite)
- **Stap 1** — Maak het Supabase-project aan en kopieer de URL + publishable key
- **Stap 2** — Configureer auth-providers en de Site URL allow-list
- **Stap 3** — Voeg de Supabase JS-client toe aan het project
- **Stap 4** — Update de markup van de login-modal
- **Stap 5** — Herschrijf `AuthManager` voor Supabase
- **Stap 6** — Koppel de nieuwe auth in `app.js`
- **Stap 7** — Verhuis spots van localStorage naar Postgres (optioneel)
- **Stap 8** — Test de volledige flow
- **Stap 9** — Checklist vóór de deploy
- **Stap 10** — Wat hierna komt

Volg de stappen in volgorde — elke stap gaat ervan uit dat de vorige is voltooid. Stappen 0–6 geven je werkende authenticatie; Stap 7 is een aparte, grotere klus die je kunt uitstellen.

---

## Stap 0 — Zet het npm-project en de dev-server op

**Je kunt `index.html` niet zomaar dubbelklikken** — ES modules weigeren te laden vanuit `file://`, en Supabase auth weigert elke origin die geen `http://` / `https://` is. Vite geeft je een fatsoenlijke dev-server in twee commando's.

### 0a. Initialiseer het npm-project

Vanuit de projectroot:

```bash
npm init -y
```

Dit maakt een standaard `package.json`. Open het bestand en vervang het `"scripts"`-blok door:

```json
"scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
}
```

Voeg ook `"type": "module"` toe op het topniveau (zodat Node `.js`-bestanden als ES modules behandelt — nodig voor een Vite-config later, mocht je die ooit toevoegen):

```json
{
    "name": "hangz",
    "version": "1.0.0",
    "type": "module",
    "scripts": { "dev": "vite", "build": "vite build", "preview": "vite preview" }
}
```

### 0b. Installeer de dependencies

```bash
npm install --save-dev vite
npm install @supabase/supabase-js
```

`vite` is een tool voor tijdens development (vandaar `--save-dev`). `@supabase/supabase-js` zit in de productiebundle.

### 0c. Voeg een `.gitignore` toe

Maak een `.gitignore` in de projectroot (of vul hem aan als hij al bestaat):

```
node_modules
dist
.env
.env.local
```

`node_modules` is enorm en kan worden gereproduceerd vanuit `package.json`. `dist` wordt gegenereerd door `npm run build`. `.env*`-bestanden bevatten vaak dingen die je niet wilt committen (meer hierover in Stap 3).

### 0d. Start de dev-server

```bash
npm run dev
```

Vite vindt `index.html` in de projectroot, serveert het, en print iets als:

```
  VITE v5.x.x  ready in 200 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open `http://localhost:5173/` in de browser. De Hangz-kaart hoort te laden met de bestaande "Welkom bij Hangz"-modal.

**Schrijf de URL op** — je hebt exact dezelfde nodig in Stap 2. Let op: Vite kiest een andere poort als 5173 al bezet is, dus kijk welke regel hij echt print.

> Wijzigingen aan je HTML/CSS/JS herladen nu automatisch (hot reload) — je hoeft de browser niet te verversen. Als er iets niet klopt, doe één hard refresh (`Cmd+Shift+R` / `Ctrl+Shift+R`) en kijk in de terminal waar `npm run dev` draait of er errors staan.

---

## Over het nieuwe API-key systeem (lees dit eerst)

Supabase migreert zijn API-key model. De relevante feiten:

- **Legacy keys** — `anon` (publiek) en `service_role` (geheim) — zijn JWT's. Ze werken nog steeds, maar Supabase heeft aangekondigd ze einde 2026 uit te faseren. Nieuwe projecten moeten ze niet meer gebruiken.
- **Nieuwe keys** — `publishable` en `secret`:
  - `sb_publishable_<22-tekens-random>_<8-tekens-checksum>` — veilig om aan de client-kant zichtbaar te maken. Dit is de directe vervanger van de `anon` key.
  - `sb_secret_<22-tekens-random>_<8-tekens-checksum>` — alleen voor server-kant. Nooit in de browser tonen. Vervanger van de `service_role` key.
- Beide nieuwe keys staan onder **Project Settings → API Keys** in het Supabase-dashboard (ook te vinden via het "Connect"-dialoog).
- De `@supabase/supabase-js` client accepteert de publishable key in dezelfde `createClient(url, key)` slot waar voorheen de `anon` key zat — geen API-wijzigingen, alleen een andere string.

De rest van dit document gebruikt alleen de publishable key. De secret key komt nooit in client-code voor en is niet nodig voor dit project (we hebben geen server).

---

## Stap 1 — Maak het Supabase-project aan

1. Log in op [supabase.com](https://supabase.com) en klik op **New project**.
2. Vul in:
   - **Name**: `hangz` (of vergelijkbaar).
   - **Database password**: genereer een sterk wachtwoord en bewaar het in een wachtwoordmanager. Je hebt het niet nodig voor client-side auth, maar wel voor eventuele directe DB-toegang later.
   - **Region**: kies degene die het dichtst bij je gebruikers ligt (bijv. `West EU (Ireland)` voor een Belgisch publiek).
3. Wacht ~2 minuten op de provisioning.
4. Zodra het project klaar is, ga je naar **Project Settings → API Keys** en kopieer je:
   - **Project URL** (ziet eruit als `https://<project-ref>.supabase.co`).
   - **Publishable key** (begint met `sb_publishable_`).
5. Laat de **secret key** met rust — die heb je in dit project niet nodig. Behandel hem als een wachtwoord.

---

## Stap 2 — Configureer Auth-providers en URL's

In het Supabase-dashboard:

1. **Authentication → Providers → Email**: zet aan. Voor development kun je ook "Confirm email" uitzetten zodat registraties werken zonder dat je je inbox hoeft te checken; zet dit terug aan voordat je naar productie gaat.
2. **Authentication → URL Configuration**:
   - **Site URL**: de **exacte** URL die Vite in Stap 0 heeft geprint (meestal `http://localhost:5173`). Update dit naar je productie-domein zodra je deployt.
   - **Redirect URLs**: klik op **Add URL** en plak dezelfde waarde. Deze lijst is de allow-list voor OAuth-callbacks en magic-link/password-reset redirects — alles wat hier niet in staat wordt geweigerd, en dit is de meest voorkomende oorzaak van "redirect not allowed"-fouten later. Als je zowel `localhost` als `127.0.0.1` door elkaar gebruikt, voeg ze allebei toe. done

> **E-mail rate-limit waarschuwing voor dev**: de ingebouwde Supabase-e-mailservice heeft een limiet van ongeveer 4 bevestigingsmails per uur op het free tier. Als je herhaaldelijk registratieflows aan het testen bent, ren je hier snel tegenaan. Oplossingen: zet "Confirm email" uit tijdens dev, gebruik meerdere test-adressen, of koppel een echte SMTP-provider onder **Authentication → Emails → SMTP Settings**.
3. (Optioneel, voor later) **Authentication → Providers → Google / GitHub**: schakel de social providers in die je wilt. Ze vereisen een eigen OAuth-app bij Google/GitHub en de client ID + secret moeten in Supabase geplakt worden.

---

## Stap 3 — Voeg de Supabase-client toe aan het project

### 3a. Bewaar de project-URL en publishable key in `.env`

Vite leest elke variabele met prefix `VITE_` uit `.env`-bestanden en stelt ze beschikbaar aan client-code via `import.meta.env`. Maak een `.env`-bestand aan in de projectroot:

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxxxxxxxxxxxxxxx_xxxxxxxx
```

De publishable key is **veilig om in client-code zichtbaar te maken** — dat is het hele punt van de splitsing tussen publishable en secret. De beveiliging wordt aan de server-kant afgedwongen via Row Level Security (Stap 7), niet door deze key te verbergen. We gebruiken `.env` nog steeds vanwege het gemak: je kunt wisselen tussen een dev- en een prod-Supabase-project door enkel dit bestand aan te passen, zonder de broncode te wijzigen.

> `.env` staat in je `.gitignore` (Stap 0c), dus het wordt niet gecommit. Voor teamopstellingen commit je een `.env.example` met de variabele-namen maar lege waardes, zodat anderen weten wat ze moeten invullen.
>
> **Vite-valstrik**: Vite leest `.env`-bestanden alleen bij het opstarten van de dev-server. Als je `.env` aanpast, stop `npm run dev` (`Ctrl+C`) en start het opnieuw — hot reload pakt env-wijzigingen niet op.done

### 3b. Maak één gedeelde client

Maak een nieuw bestand `js/supabaseClient.js` (op hetzelfde niveau als `app.js`):

```js
// js/supabaseClient.js
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
```

Merk op dat er geen versienummer of CDN-URL meer staat — `npm install` heeft `@supabase/supabase-js` al vastgezet op een versie in `package.json`. Om later te upgraden, pas je die versie aan en draai je opnieuw `npm install`.

`index.html` hoeft niet aangepast te worden — `app.js` (en elke module die het importeert) laadt als ES module, dus `supabaseClient.js` importeren vanuit `AuthManager.js` werkt zonder verdere wijzigingen.

**Controleer voordat je verder gaat**: ververs de app, open de browser dev tools (`F12` of `Cmd+Option+I` op Mac, klik dan op **Console**), tik `supabase` en druk op Enter. Je hoort een object te zien (geen `undefined` en geen error). Zie je `Supabase env vars ontbreken`, dan ontbreekt je `.env` of ben je vergeten `npm run dev` te herstarten nadat je hem hebt aangemaakt.

---

## Stap 4 — Kies een auth-UX

De bestaande login-modal (`index.html` regels 22–33) vraagt om een gebruikersnaam met één "Doorgaan"-knop. Drie realistische opties:

| Optie | UX | Werk | Opmerkingen |
|---|---|---|---|
| E-mail + wachtwoord | Voeg een wachtwoordveld toe. Wissel tussen "Account maken" / "Log in". | Klein | Het dichtst bij de huidige modal. Aanbevolen startpunt. |
| Magic link | Eén e-mailveld. Submit stuurt een loginlink. | Klein | Geen wachtwoorden om te beheren, maar de gebruiker moet de pagina verlaten om op een mail te klikken. |
| OAuth (Google) | Eén "Doorgaan met Google"-knop. | Middel | Minst weerstand zodra het is opgezet, maar vereist setup van een Google Cloud project. |

Dit document gaat verder met **e-mail + wachtwoord**.

### Update de login-modal

In `index.html`, breid de modal uit met een e-mailveld, een wachtwoordveld, en zowel een "Log in"- als een "Account maken"-knop:

```html
<div id="loginOverlay" class="login-overlay">
    <div class="login-card">
        <div class="login-icon" data-lucide="map-pin"></div>
        <h2>Welkom bij Hangz</h2>
        <p>Maak een account of log in om spots toe te voegen en te beoordelen</p>
        <input type="email" id="loginEmail" placeholder="E-mail" autocomplete="email">
        <input type="password" id="loginPassword" placeholder="Wachtwoord" autocomplete="current-password">
        <div id="loginError" class="login-error" style="display:none; color:#c00;"></div>
        <div class="login-buttons">
            <button id="doLoginBtn" class="btn-primary">Log in</button>
            <button id="doRegisterBtn" class="btn-secondary">Account maken</button>
            <button id="guestLoginBtn" class="btn-text">Verder als gast (alleen kijken)</button>
        </div>
    </div>
</div>
```

(Verwijder het oude `loginUsername`-input — Supabase identificeert gebruikers op e-mail.)

---

## Stap 5 — Herschrijf `AuthManager` voor Supabase

Vervang `js/managers/AuthManager.js` door een Supabase-versie. Basisvorm:

```js
// js/managers/AuthManager.js
import { supabase } from '../supabaseClient.js';

export class AuthManager {
    constructor(storageManager) {
        this.storageManager = storageManager;
        this.currentUser = null;      // een Supabase User object, of null
        this.isGuestMode = false;     // true als de gebruiker "verder als gast" koos
        this._listeners = new Set();  // app-side subscribers
    }

    // Eén keer aanroepen bij het opstarten van de app, voordat je beslist of je de login-modal toont.
    async restoreSession() {
        const { data: { session } } = await supabase.auth.getSession();
        this.currentUser = session?.user ?? null;

        // Reageer op toekomstige wijzigingen (login vanuit een ander tabblad, token-refresh, uitloggen, enz.)
        supabase.auth.onAuthStateChange((_event, session) => {
            this.currentUser = session?.user ?? null;
            this._listeners.forEach(fn => fn(this.currentUser));
        });

        return this.currentUser;
    }

    onChange(fn) {
        this._listeners.add(fn);
        return () => this._listeners.delete(fn);
    }

    async register(email, password) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        // Als e-mailbevestiging AAN staat, is data.session null totdat de gebruiker op de link klikt.
        this.isGuestMode = false;  // een echte registratie verlaat de gastmodus
        return data;
    }

    async login(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        this.isGuestMode = false;  // een echte login verlaat de gastmodus
        return data;
    }

    async logout() {
        // De default scope is 'global', wat de gebruiker uitlogt op ELK apparaat.
        // 'local' is wat de meeste apps eigenlijk willen.
        const { error } = await supabase.auth.signOut({ scope: 'local' });
        if (error) throw error;
        this.isGuestMode = false;
        if (this.storageManager) this.storageManager.clearAllUserData();
    }

    loginAsGuest() {
        this.isGuestMode = true;
        this.currentUser = null;
    }

    getCurrentUser() {
        if (this.currentUser) {
            // Gebruik de e-mail als displaynaam. Vervang dit later door een `profiles`-tabel
            // als je usernames los wilt hebben van e-mailadressen.
            return this.currentUser.email;
        }
        return 'Gast';
    }

    getUserId() {
        return this.currentUser?.id ?? null;
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    isGuest() {
        return this.currentUser === null;
    }
}
```

Toelichting bij de keuzes:

- **`signOut({ scope: 'local' })`** — de default is `'global'`, wat sessies op elk apparaat van de gebruiker beëindigt. Dat is zelden wat je wilt.
- **`onAuthStateChange`** — abonneer één keer, in `restoreSession`. De callback vuurt bij `SIGNED_IN`, `SIGNED_OUT`, `TOKEN_REFRESHED`, `USER_UPDATED`, en een paar andere events. Eén waarheidsbron (`this.currentUser`) bijhouden en `onChange` exposen laat `app.js` reactief re-renderen in plaats van te pollen.
- **Geen wachtwoord-handling** — bewaar wachtwoorden nooit in localStorage, log ze nooit, geef ze nergens door behalve aan `signInWithPassword` / `signUp`.
- **Gastmodus zit alleen in geheugen** — `isGuestMode` leeft op de `AuthManager`-instantie. Als de gebruiker de pagina ververst, is die flag weg en verschijnt de login-modal opnieuw. Dat is met opzet (je wilt dat terugkerende gebruikers ofwel ingelogd zijn via de persistente Supabase-sessie, ofwel opnieuw gevraagd worden). Als je ook wilt dat gastmodus refresh overleeft, persisteer dan een flag zoals `localStorage.setItem('hangz_guest', '1')` in `loginAsGuest()` en check die in `restoreSession()`.

### Veelvoorkomende foutmeldingen die je zult zien

| Bericht | Wat er echt mis is |
|---|---|
| `Invalid login credentials` | Verkeerde e-mail/wachtwoord — Supabase zegt met opzet niet welke van de twee, om niet te lekken "dit e-mailadres bestaat". |
| `User already registered` | `signUp` aangeroepen met een bestaand e-mailadres. Vertel de gebruiker in plaats daarvan in te loggen. |
| `Email not confirmed` | Bevestiging staat aan en de gebruiker heeft nog niet op de link geklikt. |
| `For security purposes, you can only request this after X seconds` | E-mail rate-limit bereikt. Wacht, of zet bevestiging uit voor dev (Stap 2). |
| `Failed to fetch` in de browser-console | Verkeerde Project URL, of je lokale server staat uit. |

---

## Stap 6 — Koppel de nieuwe auth in `app.js`

Drie wijzigingen aan `js/app.js`:

### 6a. Maak `init()` async en herstel eerst de sessie

```js
async init() {
    this.spots = this.storage.loadSpots();

    await this.auth.restoreSession();          // NIEUW — wacht op Supabase voor je over de UI-state beslist

    if (this.auth.isLoggedIn()) {
        this.ui.setLoggedInUser(this.auth.getCurrentUser());
        this.ui.showAddHint(true);
    } else {
        this.ui.setLoggedOut();
        this.showLoginModal();
    }

    this.mapManager.init(51.05, 4.38, 12);
    this.refreshMarkers();
    this.setupEventListeners();
    this.ui.switchView('map');
    this.updateProfileUI();

    // Reageer op auth-wijzigingen van overal (andere tabs, token-expiry, enz.)
    this.auth.onChange(() => {
        if (this.auth.isLoggedIn()) {
            this.ui.setLoggedInUser(this.auth.getCurrentUser());
            this.ui.showAddHint(true);
        } else if (!this.auth.isGuestMode) {
            this.ui.setLoggedOut();
            this.showLoginModal();
        }
        this.refreshMarkers();
        this.updateProfileUI();
    });
}
```

En onderaan het bestand, hang er een `.catch` aan zodat opstartfouten daadwerkelijk zichtbaar worden in plaats van stilletjes verzwolgen:

```js
document.addEventListener('DOMContentLoaded', () => {
    window.app = new HangzApp();
    window.app.init().catch(err => {
        console.error('App kon niet starten:', err);
        alert('Er ging iets mis bij het opstarten van de app. Check de console.');
    });
});
```

Verwijder ook de oude `hangz_user`-key die de vorige mock-auth in localStorage achterliet. Vanuit de browser-console:

```js
localStorage.removeItem('hangz_user');
```

Anders kan oude state ervoor zorgen dat de nieuwe flow vreemd doet bij de eerste run.

### 6b. Bouw `showLoginModal` opnieuw op

```js
showLoginModal() {
    const overlay = document.getElementById('loginOverlay');
    const loginBtn = document.getElementById('doLoginBtn');
    const registerBtn = document.getElementById('doRegisterBtn');
    const guestBtn = document.getElementById('guestLoginBtn');
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    const errorBox = document.getElementById('loginError');

    const showError = (msg) => { errorBox.textContent = msg; errorBox.style.display = 'block'; };
    const clearError = () => { errorBox.textContent = ''; errorBox.style.display = 'none'; };

    loginBtn.onclick = async () => {
        clearError();
        try {
            await this.auth.login(emailInput.value.trim(), passwordInput.value);
            overlay.style.display = 'none';
            // onAuthStateChange werkt de rest van de UI bij.
        } catch (err) {
            showError(err.message || 'Inloggen mislukt');
        }
    };

    registerBtn.onclick = async () => {
        clearError();
        try {
            const { session } = await this.auth.register(emailInput.value.trim(), passwordInput.value);
            if (!session) {
                showError('Account aangemaakt — controleer je e-mail om te bevestigen.');
            } else {
                overlay.style.display = 'none';
            }
        } catch (err) {
            showError(err.message || 'Registratie mislukt');
        }
    };

    guestBtn.onclick = () => {
        this.auth.loginAsGuest();
        this.ui.setLoggedInUser('Gast');
        this.ui.showAddHint(false);
        overlay.style.display = 'none';
        this.updateProfileUI();
    };

    overlay.style.display = 'flex';
}
```

### 6c. Logout-handler

Zoek dit blok op (momenteel rond regel 215 van `app.js`):

```js
this.ui.logoutBtn.addEventListener('click', () => {
    this.auth.logout();
    this.ui.setLoggedOut();
    this.ui.showAddHint(false);
    this.ui.showNotification('Uitgelogd');
    this.refreshMarkers();
    this.updateProfileUI();
    this.showLoginModal();
});
```

Vervang het door:

```js
this.ui.logoutBtn.addEventListener('click', async () => {
    try {
        await this.auth.logout();
        this.ui.showNotification('Uitgelogd');
        // setLoggedOut / refreshMarkers / showLoginModal gebeuren automatisch
        // via de onChange-subscription die in init() is opgezet.
    } catch (err) {
        this.ui.showNotification(err.message || 'Uitloggen mislukt', 'error');
    }
});
```

---

## Stap 7 — Verhuis spots naar Postgres (optioneel, maar meestal het doel)

Tot nu toe authenticeert de app alleen gebruikers. Spots leven nog steeds in localStorage, dus twee gebruikers op verschillende apparaten zien verschillende data. Om ze gedeeld te maken:

> **Let op**: deze stap komt terug op delen van `app.js` die je in Stap 6 hebt aangeraakt — specifiek overal waar `this.storage.loadSpots()`, `this.storage.saveSpots()`, of een handmatige `new Spot(...)` voorkomt. Die aanroepen moeten `await`-bewust worden. Stap 7d laat precies zien welke call sites je moet aanpassen.

### 7a. Maak de tabellen aan

In **Database → SQL Editor**, klik op **New query**, plak dit, en klik op **Run**:

```sql
-- Spots die gebruikers aan de kaart toevoegen
create table public.spots (
    id          uuid primary key default gen_random_uuid(),
    name        text not null,
    category    text not null,
    description text,
    lat         double precision not null,
    lng         double precision not null,
    -- Data van subclasses (Gym.hasShowers, Restaurant.cuisineType, enz.) leeft hier.
    -- JSONB houdt het schema flexibel zonder per subclass-veld een eigen kolom te maken.
    extras      jsonb not null default '{}'::jsonb,
    added_by    uuid not null references auth.users(id) on delete cascade default auth.uid(),
    created_at  timestamptz not null default now()
);

-- Eén beoordeling per (spot, gebruiker). De composite primary key voorkomt duplicaten
-- zonder dat je een aparte unique index nodig hebt.
create table public.ratings (
    spot_id    uuid not null references public.spots(id) on delete cascade,
    user_id    uuid not null references auth.users(id) on delete cascade default auth.uid(),
    rating     smallint not null check (rating between 1 and 5),
    created_at timestamptz not null default now(),
    primary key (spot_id, user_id)
);

-- Indexen voor de queries die je echt gaat draaien
create index spots_added_by_idx on public.spots(added_by);
create index ratings_spot_id_idx on public.ratings(spot_id);
```

Controleer: in **Database → Tables** hoor je nu `spots` en `ratings` te zien staan met een open hangslot-icoontje (RLS staat nog uit — dat fixen we hierna).done

### 7b. Schakel Row Level Security in

**Dit is de kritieke stap.** Zonder RLS geeft de publishable key iedereen met view-source toegang volledige lees-/schrijfrechten op de tabellen. Met RLS dwingt de database zelf af wie wat mag.

```sql
alter table public.spots   enable row level security;
alter table public.ratings enable row level security;

-- Iedereen (ook niet-geauthenticeerde bezoekers) mag spots lezen
create policy "Spots are viewable by everyone"
    on public.spots for select
    using (true);

-- Alleen ingelogde gebruikers mogen spots aanmaken, en alleen op hun eigen naam
create policy "Authenticated users can add spots"
    on public.spots for insert
    to authenticated
    with check (auth.uid() = added_by);

-- Gebruikers mogen alleen hun eigen spots bewerken/verwijderen
create policy "Owners can update their spots"
    on public.spots for update
    to authenticated
    using (auth.uid() = added_by)
    with check (auth.uid() = added_by);

create policy "Owners can delete their spots"
    on public.spots for delete
    to authenticated
    using (auth.uid() = added_by);

-- Beoordelingen: iedereen mag lezen, ingelogde gebruikers mogen alleen hun eigen rij schrijven
create policy "Ratings are viewable by everyone"
    on public.ratings for select
    using (true);

create policy "Users can upsert their own rating"
    on public.ratings for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Users can change their own rating"
    on public.ratings for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
```

Draai daarna **Database → Advisors**. Er horen geen "RLS disabled"-waarschuwingen meer te zijn op `public.spots` of `public.ratings`. done

### 7c. Seed de default spots (eenmalig)

Je hebt momenteel 60 spots hardcoded in `StorageManager.getDefaultSpots()`. De simpelste manier om ze in de database te krijgen:

1. Open de app in de browser met de **oude** code nog actief (zodat `localStorage` gevuld is).
2. Dump ze als JSON vanuit de dev tools console:
   ```js
   copy(JSON.stringify(window.app.spots.map(s => s.toJSON()), null, 2))
   ```
   Dit kopieert de array naar je clipboard.
3. Zet elk item om in een `insert`-statement. De snelste route: plak de JSON in de SQL Editor met een helper:
   ```sql
   insert into public.spots (name, category, description, lat, lng, extras)
   select
       s->>'name',
       coalesce(s->>'category', lower(s->>'type')),
       s->>'description',
       (s->>'lat')::float8,
       (s->>'lng')::float8,
       (s - 'id' - 'name' - 'category' - 'type' - 'description'
          - 'lat' - 'lng' - 'addedBy' - 'ratings' - 'userRating')::jsonb
   from jsonb_array_elements('PLAK_HIER_JE_JSON_ARRAY'::jsonb) as s;
   ```
   De `s - 'x' - 'y'`-syntax verwijdert de bekende top-level keys, zodat alleen de subclass-velden (`hasShowers`, `cuisineType`, enz.) overblijven voor de `extras`-kolom.

`added_by` is bewust weggelaten — die default spots zijn van geen echte gebruiker, dus de `default auth.uid()` zal niets invullen. Of je draait de seed terwijl je ingelogd bent (en ze worden aan jou toegeschreven), of je doet `added_by null` in de insert en `alter`-t de kolom om null toe te staan voor seed-data. Voor een schoolproject is de eerste optie prima.

### 7d. Vervang `StorageManager` door Supabase-queries

Vervang de inhoud van `js/managers/StorageManager.js`:

```js
// js/managers/StorageManager.js
import { supabase } from '../supabaseClient.js';
import { Spot } from '../models/Spot.js';
import { Gym } from '../models/Gym.js';
import { Restaurant } from '../models/Restaurant.js';

export class StorageManager {
    // Haal alle spots + hun beoordelingen op in één query.
    // Geef currentUserId mee zodat we kunnen markeren welke beoordeling "van jou" is.
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

    // Persisteer één nieuwe spot. Geef added_by niet mee — de DB-default `auth.uid()`
    // vult het in, zodat de client niet kan liegen over wie het toevoegde.
    async addSpot({ name, category, description, lat, lng, extras = {} }) {
        const { data, error } = await supabase
            .from('spots')
            .insert({ name, category, description, lat, lng, extras })
            .select('id, name, category, description, lat, lng, extras, added_by, ratings(rating, user_id)')
            .single();
        if (error) throw error;
        return this._rowToModel(data, data.added_by);
    }

    // Upsert een beoordeling. user_id krijgt als default auth.uid() vanuit de DB.
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

        // We hebben geen "type"-kolom meer — de keuze van subclass wordt gestuurd
        // door welke extras de rij heeft. Pas deze vertakking aan op welk signaal je
        // ook gebruikt (bijv. een expliciete `type`-kolom als je dat liever hebt).
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

    // No-ops nu — alleen behouden zodat bestaande call sites niet crashen.
    // Verwijder de aanroepen in app.js / AuthManager en daarna deze methodes ook.
    saveSpots() {}
    clearAllUserData() {}
}
```

Je moet ook de **aanroepers** in `app.js` aanpassen, want `loadSpots` en `addSpot` zijn nu `async`:

- In `init()`: vervang `this.spots = this.storage.loadSpots();` door `this.spots = await this.storage.loadSpots(this.auth.getUserId());`. Draai dit opnieuw bij elke auth-state wijziging, zodat "jouw beoordeling" opnieuw berekend wordt na login/logout.
- In de add-spot form handler: vervang de handmatige `new Spot(...)` constructie + `this.spots.push(...)` + `this.storage.saveSpots(...)` door:
  ```js
  const newSpot = await this.storage.addSpot({ name, category, description, lat: this.selectedLocation.lat, lng: this.selectedLocation.lng });
  this.spots.push(newSpot);
  this.refreshMarkers();
  ```
- In de marker rating callback: vervang `spot.addRating(...)` + `this.storage.saveSpots(...)` door `await this.storage.rateSpot(spot.getId(), rating); this.spots = await this.storage.loadSpots(this.auth.getUserId());`. (Opnieuw laden is de simpelste juiste optie; optimalisatie komt later.)

De model-classes (`Spot`, `Gym`, `Restaurant`) bestaan nog steeds — ze blijven nuttig voor `getAverageRating()` en vergelijkbaar gedrag. Alleen de persistentielaag verandert. De `getDefaultSpots()`-methode en `clearAllUserData()` kunnen verwijderd worden zodra je bevestigt dat er niks breekt.

Let op: de spot-`id` was eerst een nummer en is nu een UUID-string — overal waar de code id's vergelijkt (bijv. `marker.spotId === spot.getId()`) blijft het werken omdat JS `===` gebruikt en beide kanten nu strings zijn.
done
---

## Stap 8 — Test de flow van begin tot eind

Voordat je het af noemt, loop elk pad handmatig door. **Open eerst de dev tools** (`F12` op Windows/Linux, `Cmd+Option+I` op Mac) en houd de **Console**-tab zichtbaar — de meeste fouten verschijnen daar als rode tekst.

1. **Eerste registratie**
   - Open de app in een schoon browserprofiel (of een privé/incognito venster).
   - Vul een nieuw e-mailadres + wachtwoord in, klik op **Account maken**.
   - Als e-mailbevestiging aan staat: check je inbox, klik de link, kom terug en log in.
   - **Controleer**: in het Supabase-dashboard, **Authentication → Users**, hoor je een nieuwe rij met dat e-mailadres te zien.
2. **Sessie blijft bestaan**
   - Hard refresh de pagina (`Cmd+Shift+R` op Mac, `Ctrl+Shift+R` elders).
   - **Controleer**: de login-modal hoort NIET te verschijnen; de header moet nog steeds je e-mail tonen.
3. **Uitloggen**
   - Klik op de logout-knop in de header.
   - **Controleer**: de login-modal komt terug, het "Mijn spots"-paneel toont "Nog geen spots toegevoegd".
4. **Gastmodus**
   - Klik op **Verder als gast**.
   - **Controleer**: op de kaart klikken toont een "Log in om spots toe te voegen"-toast en op een marker klikken toont "Log in om te beoordelen".
   - **Bekende beperking**: hard refresh tijdens gastmodus en je krijgt de login-modal weer te zien — gastmodus zit met opzet alleen in het geheugen (zie de notes bij Stap 5).
5. **RLS-handhaving** (dit is de test die er echt toe doet — overslaan betekent dat je database open ligt voor de hele wereld)
   - Log uit zodat je niet geauthenticeerd bent.
   - Plak en run in de dev tools console:
     ```js
     await window.supabase.from('spots').insert({
         name: 'evil',
         category: 'park',
         lat: 0,
         lng: 0
     });
     ```
   - **Verwacht**: een object als `{ data: null, error: { code: '42501', message: 'new row violates row-level security policy ...' } }`.
   - **Als `data` niet null is** of je ziet geen error: RLS is verkeerd geconfigureerd. Ga terug naar Stap 7b voor je verder gaat. Iedereen op het internet kan nu naar je database schrijven.
   - Probeer ook: log in als gebruiker A, voeg een spot toe. Log uit, log in als gebruiker B, probeer in de console:
     ```js
     await window.supabase.from('spots').update({ name: 'hacked' }).eq('id', '<de-spot-id-van-gebruiker-A>');
     ```
     **Verwacht**: geeft `data: []` terug (nul rijen geüpdatet) — RLS filtert de update stilletjes naar enkel de rijen die je bezit, en dat zijn er nul.
6. **Sync tussen apparaten** (alleen relevant na Stap 7)
   - Voeg een spot toe in Chrome, ververs Firefox (ingelogd als dezelfde gebruiker). De spot hoort te verschijnen.

---

## Stap 9 — Vóór je deployt

- Bouw de productiebundle: `npm run build`. Vite zet statische bestanden in `dist/`. Test het lokaal met `npm run preview` voordat je iets pusht.
- Configureer je hosting (Netlify / Vercel / GitHub Pages / Cloudflare Pages — allemaal werken met een statische `dist/`). Voor Netlify/Vercel: build command `npm run build`, publish directory `dist`. Zet `VITE_SUPABASE_URL` en `VITE_SUPABASE_PUBLISHABLE_KEY` in de environment-variables UI van de host zodat de productiebuild ze oppakt — ze worden ingebakken op build-time, niet uitgelezen op runtime.
- In Supabase **Authentication → URL Configuration**, vervang `localhost` door het productiedomein in zowel **Site URL** als **Redirect URLs**. Laat de localhost-entry in de Redirect URLs lijst staan als je dev nog wilt laten werken.
- Zet "Confirm email" terug aan als je het voor dev had uitgezet.
- Grep de repo op `sb_secret_` — er horen nul matches te zijn. Is er wel een match, dan is de secret key gelekt en moet hij meteen geroteerd worden in **Project Settings → API Keys**.
- Draai **Database → Advisors** nog één keer. Los alle `error`-level findings op.
- Check even **Authentication → Rate Limits** — de defaults zijn prima voor een klein project, maar het is goed om te weten waar ze leven.

---

## Stap 10 — Wat je hierna waarschijnlijk wilt (niet in scope hier)

- **Username apart van e-mail**: voeg een `public.profiles`-tabel toe met `auth.users.id` als sleutel, sla een `display_name` op, en join die mee bij het laden van spots zodat de kaart geen e-mailadressen blootstelt via `added_by`.
- **Wachtwoord resetten**: `supabase.auth.resetPasswordForEmail(email, { redirectTo })` + een kleine "reset"-pagina.
- **Social login**: zet Google aan in Supabase, vervang de login-modal door één `supabase.auth.signInWithOAuth({ provider: 'google' })`-knop. De `detectSessionInUrl: true` config uit Stap 3b regelt de callback al.
- **Realtime updates**: `supabase.channel('spots').on('postgres_changes', { event: '*', schema: 'public', table: 'spots' }, ...)` zodat een spot die op het ene apparaat wordt toegevoegd direct opduikt op de kaart van iedereen. Gratis op het Supabase-plan, ~10 regels code.

---

## Snelle referentie

| Onderwerp | Waar |
|---|---|
| Publishable / secret keys | Dashboard → Project Settings → API Keys |
| Auth-providers | Dashboard → Authentication → Providers |
| Site URL & redirect allow-list | Dashboard → Authentication → URL Configuration |
| SQL editor | Dashboard → Database → SQL Editor |
| RLS policy editor (GUI) | Dashboard → Database → Tables → (tabel) → Policies |
| Beveiligingswaarschuwingen | Dashboard → Database → Advisors |
| Gebruikerslijst | Dashboard → Authentication → Users |
| Client library | `@supabase/supabase-js` (geïnstalleerd via `npm install`) |
| Dev-server | `npm run dev` (Vite, default poort 5173) |
| Productiebuild | `npm run build` (output naar `dist/`), preview met `npm run preview` |
| Env vars | `.env` in de projectroot, prefix met `VITE_`, uitlezen via `import.meta.env.VITE_*` |
| Sessie-opslag | `localStorage` (automatisch beheerd door de client wanneer `persistSession: true`) |
