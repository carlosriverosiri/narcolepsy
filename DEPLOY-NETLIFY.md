# Publicera Narcolepsy-projektet på Netlify

Steg-för-steg-guide för att deploya din Astro-webbplats till Netlify.

---

## Förutsättningar

- [x] Projektet finns på GitHub (du har redan pushat)
- [ ] Ett Netlify-konto (gratis)
- [ ] Webbläsare

---

## Steg 1: Skapa Netlify-konto

1. Gå till **https://www.netlify.com**
2. Klicka på **"Sign up"** (Registrera dig)
3. Välj **"Sign up with GitHub"** — då kopplas kontot direkt till din GitHub och du behöver inte hantera lösenord separat
4. Följ inbjudan (Authorize Netlify) så att Netlify får läsa dina GitHub-repos

---

## Steg 2: Starta ett nytt site från GitHub

1. I Netlify: klicka **"Add new site"** → **"Import an existing project"**
2. Välj **"Deploy with GitHub"**
3. Om du blir ombedd: **"Authorize Netlify"** / **"Configure Netlify on GitHub"** och välj antingen:
   - **All repositories**, eller  
   - **Only select repositories** och välj repot där Narcolepsy-projektet ligger (t.ex. `narcolepsy` eller `Narcolepsy`)
4. Klicka **"Install"** / **"Save"**
5. I listan över repos: hitta ditt **Narcolepsy-repo** och klicka **"Import"** / **"Connect"**

---

## Steg 3: Build-inställningar

Netlify försöker gissa kommandon. Kontrollera att det stämmer med nedan (om du har lagt till `netlify.toml` i repot behöver du ofta inte ändra något):

| Inställning        | Värde              | Kommentar                    |
|--------------------|--------------------|------------------------------|
| **Branch to deploy** | `main`           | Den branch du pushar till    |
| **Build command**   | `npm run build`  | Kör Astro build + Pagefind   |
| **Publish directory** | `dist`         | Astro skriver utfilen hit    |
| **Base directory**  | *(lämna tom)*    | Om projektet ligger i repo-root |

Om du **inte** har `netlify.toml` i repot:

1. Expandera **"Build settings"** / **"Options"**
2. **Build command:** skriv `npm run build`
3. **Publish directory:** skriv `dist`
4. **Environment variables** (om någon behövs senare):  
   Klicka **"Add variable"** / **"New variable"** och lägg till t.ex. `NODE_VERSION` = `20` om builden använder fel Node-version

Klicka sedan **"Deploy site"** (eller **"Deploy [repo-name]"**).

---

## Steg 4: Vänta på första builden

1. Du hamnar på **"Deploys"**-fliken
2. Status går från **"Building"** till **"Published"** (ofta 1–3 minuter)
3. Vid fel: klicka på **"Deploy log"** / **"Build log"** och scrolla till rött felmeddelande

**Vanliga problem:**

- **"npm not found" / "Node not found"**  
  Lägg till miljövariabel: `NODE_VERSION` = `20` (Site settings → Environment variables → Add variable), spara och **Trigger deploy** → **Deploy site**.

- **"Command not found: npx"** eller **pagefind** kraschar  
  I `package.json` ska build-scriptet vara:  
  `"build": "astro build && npx pagefind --site dist"`  
  Om du vill kan du temporärt testa utan pagefind:  
  `"build": "astro build"`  
  Spara, pusha till GitHub och deploya igen.

- **404 på sidor**  
  Kontrollera att **Publish directory** verkligen är `dist` och att `astro build` slutförs utan fel.

---

## Steg 5: Öppna webbplatsen

1. När status är **"Published"** visas en länk typ:  
   **https://[något-slumpat].netlify.app**
2. Klicka på länken för att öppna sajten
3. Testa några sidor (t.ex. `/`, `/diseases/`, `/science/gangliosides/`)

---

## Steg 6: (Valfritt) Eget domännamn

1. I Netlify: **Site configuration** → **Domain management** (eller **"Domain settings"**)
2. Klicka **"Add custom domain"** / **"Register domain"**
3. Ange domän (t.ex. `narcolepsy-hypothesis.com` — samma som i `astro.config.mjs` → `site`)
4. Följ Netlifys instruktioner:
   - **Köp domän via Netlify:** då sätter de DNS åt dig
   - **Har du redan domän:** lägg till den, sedan hos domänleverantören (t.ex. Loopia, One.com) sätt **A-record** eller **CNAME** enligt det Netlify visar
5. Aktivera **HTTPS** (Netlify ger gratis SSL) — brukar vara på som standard

---

## Steg 7: Automatisk deploy vid push

- Så fort du **pushat till GitHub** (t.ex. `git push origin main`) bygger Netlify om sajten automatiskt om du kopplade "Deploy with GitHub".
- Kolla **Deploys**-fliken för status och loggar.

---

## Sammanfattning: Snabbreferens

| Vad              | Värde / handling |
|------------------|------------------|
| Netlify          | https://www.netlify.com |
| Build command   | `npm run build` |
| Publish dir     | `dist` |
| Branch          | `main` |
| Node (vid behov)| Miljövariabel `NODE_VERSION` = `20` |

---

## Filen `netlify.toml` i repot

I projektet finns nu en **netlify.toml** som sätter:

- `command = "npm run build"`
- `publish = "dist"`
- `NODE_VERSION = "20"`
- Valbara säkerhets- och cache-headers

Om du lägger till den i repot och pushar behöver du oftast inte ändra build-inställningarna manuellt i Netlify — de används automatiskt.

**Commit och push av netlify.toml (om du vill):**

```bash
git add netlify.toml
git commit -m "Add Netlify config for deploy"
git push origin main
```

Därefter triggas en ny deploy och nästa build använder `netlify.toml`.
