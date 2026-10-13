# 🏝️ Paradise Bot

Discord.js v14 bot for Mekkers Building Paradise.

## Commands
- `/ping`
- `/paradise`
- `/verify-panel` — Administrator only

## Local setup
1. `npm install`
2. Copy `.env.example` to `.env`
3. Fill in `DISCORD_TOKEN`, `CLIENT_ID`, and `GUILD_ID`
4. `npm run build`
5. `npm run deploy`
6. `npm start`

## Verification
Run `/verify-panel` as an Administrator. It posts the Paradise verification panel in `✅・verify`.

The verification button grants only:
- 👤 Member
- 🌱 Beginner

The banner image is stored at `assets/verify-banner.png`.
