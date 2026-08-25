# MOSK — Mat- & sovklocka

En barnvänlig dagklocka som visar när det är dags att äta, vila och sova. Rutiner läggs upp per veckodag och sparas per användare.

## Funktioner

- Visuell dygnsklocka med nästa hållpunkt och tid kvar
- Scheman per dag (mat, sömn, vila m.m.)
- Inloggning med konton och lagring i Postgres
- Inställningar för tidsformat och webbläsarnotiser

## Stack

- **Frontend:** React, Vite, Tailwind
- **Backend:** Express, Prisma, PostgreSQL

## Kom igång med Docker

Kräver Docker med Compose.

```bash
# Bara Postgres (tom databas med schemat applicerat) för lokal utveckling
docker compose up -d db migrate

# Hela appen (Postgres + API + webb via nginx)
docker compose up --build
```

Med hela stacken igång: webben på http://localhost:8080, API:t på http://localhost:3001.
Databasen startar tom — den har bara schemat, inga användare eller events. Skapa ett konto via appens signup.

Sätt gärna `JWT_SECRET` innan du kör något utanför lokal lek:

```bash
JWT_SECRET=din-hemlighet docker compose up --build
```

## Kom igång lokalt (utan Docker för app-koden)

```bash
# Backend
cd server
cp .env.example .env   # sätt DATABASE_URL och JWT_SECRET
npm install
npx prisma migrate dev
npm run dev

# Frontend (ny terminal)
npm install
npm run dev
```

Kopiera aldrig en riktig `.env` till git — den är gitignorerad.
