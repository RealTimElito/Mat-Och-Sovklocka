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

## Kom igång

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
