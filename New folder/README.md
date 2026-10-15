# 🏝️ Paradise

The Discord bot for **Mekkers Building Paradise**.

**Built so far:** Milestones 1 to 4.
- Foundation: `/ping`, `/paradise`
- Verification and welcome system (Milestone 2)
- Server information (Milestone 3)
- Announcements and changelogs (Milestone 4)

Built with Node.js, TypeScript and discord.js v14.

---

## What you need first

1. **Node.js 22 or newer** (the "LTS" version): https://nodejs.org
   Check it worked by opening a terminal and typing `node -v`. You should see `v22` or higher.
2. **A code editor**, for example Visual Studio Code: https://code.visualstudio.com
3. A **Discord account** and a server where you can manage the server.

---

## Step 1: Create the bot in Discord

1. Go to https://discord.com/developers/applications and click **New Application**. Name it `Paradise`.
2. On the **General Information** page, copy the **Application ID**. This is your `CLIENT_ID`.
3. Open the **Bot** tab on the left and click **Reset Token**. Copy the token straight away (Discord only shows it once). This is your `DISCORD_TOKEN`.
   - Treat the token like a password. Never share it, post it, or put it on GitHub.
   - You do **not** need to switch on any "Privileged Gateway Intents" for this milestone.
4. In Discord, open **User Settings → Advanced** and switch on **Developer Mode**.
5. Right-click your server's icon and choose **Copy Server ID**. This is your `GUILD_ID`.

## Step 2: Invite the bot to your server

1. In the Developer Portal, open **OAuth2 → URL Generator**.
2. Under **Scopes**, tick **`bot`** and **`applications.commands`**.
3. Under **Bot Permissions**, you don't need to tick anything for this milestone.
4. Copy the **Generated URL** at the bottom, paste it in your browser, pick your server and click **Authorize**.

Paradise will now appear in your member list (offline for now).

## Step 3: Install the project

1. Unzip this folder and open it in your editor.
2. Open a terminal **inside the `paradise-bot` folder**. In VS Code: **Terminal → New Terminal**.
3. Install the dependencies:

```
npm install
```

## Step 4: Add your secrets

Create your own `.env` file by copying the example.

- **Windows (Command Prompt or PowerShell):** `copy .env.example .env`
- **Mac / Linux:** `cp .env.example .env`

Open `.env` and fill it in:

```
DISCORD_TOKEN=your token from Step 1
CLIENT_ID=your application ID from Step 1
GUILD_ID=your server ID from Step 1
```

The `.gitignore` file already stops `.env` from being uploaded to GitHub. Only `.env.example` (with no real secrets) is safe to share.

## Step 5: Register the slash commands

Slash commands have to be sent to Discord once, and again whenever you add or change a command:

```
npm run deploy
```

You should see: `✅ [deploy] Done! Commands registered to your server (instant).`

## Step 6: Start the bot

```
npm run dev
```

You should see something like:

```
🏝️ [bot] Paradise is online as Paradise#1234
🌴 [bot] Loaded 2 command(s): /ping, /paradise
```

Leave this terminal open. The bot stays online while it runs. Press `Ctrl + C` to stop it.

## Step 7: Test it

In any channel of your server:

1. Type `/ping` and press Enter. Paradise replies with a teal **Pong!** embed showing the round trip and websocket latency.
2. Type `/paradise` and press Enter. Paradise replies with an ocean-blue welcome embed.

If you see both, Milestone 1 is working. 🎉

---

## Troubleshooting

| Problem | What to try |
| --- | --- |
| `/ping` doesn't appear when I type `/` | Run `npm run deploy` again. Check `GUILD_ID` is your server's ID. Restart Discord with `Ctrl + R`. Make sure you invited the bot with the `applications.commands` scope. |
| `Could not log in` | The token is wrong or was reset. Reset it in the Developer Portal and paste the new one into `.env`. |
| `Missing Access` when deploying | The bot isn't in that server yet (redo Step 2), or `GUILD_ID` is wrong. |
| "The application did not respond" | The bot isn't running. Start it with `npm run dev`. |
| `DISCORD_TOKEN is missing` | You haven't created `.env`, or the value is still the placeholder. |

If your token is ever leaked, reset it in the Developer Portal immediately.

---

## Project structure

```
paradise-bot/
├── src/
│   ├── commands/
│   │   ├── index.ts       <- list of all commands
│   │   ├── ping.ts        <- /ping
│   │   └── paradise.ts    <- /paradise
│   ├── config.ts          <- reads and checks .env
│   ├── theme.ts           <- Paradise colours and emojis
│   ├── types.ts           <- the shape every command follows
│   ├── deploy-commands.ts <- registers slash commands with Discord
│   └── index.ts           <- starts the bot
├── .env.example           <- template (safe to share)
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the bot and restarts it when you save a file |
| `npm run deploy` | Registers your slash commands with Discord |
| `npm run typecheck` | Checks the TypeScript code for mistakes |
| `npm run build` | Compiles to the `dist/` folder |
| `npm start` | Runs the compiled bot from `dist/` (used for hosting) |

## Adding a command later

1. Create a file in `src/commands/`, copying `ping.ts` as a starting point.
2. Import it in `src/commands/index.ts` and add it to the `commands` list.
3. Run `npm run deploy`, then restart the bot.

---

# Milestones 2 to 4

## Commands

| Command | Who | What it does |
| --- | --- | --- |
| `/ping` | Everyone | Shows the bot's latency |
| `/paradise` | Everyone | Introduction embed |
| `/server-info` | Everyone | Live stats: members, owner, created date, channels, roles, boosts |
| `/setup-verification` | Admins | Posts (or reposts) the verification panel in `✅・verify` |
| `/setup-server-info` | Admins | Posts the "Paradise Guide" embed in a channel you pick |
| `/announce` | Staff | Posts to `📢・announcements` or `📰・rust-news` (title, text, optional image) |
| `/changelog` | Staff | Posts to `📋・changelogs` (title, text, optional version and image) |

"Admins" means the server owner, anyone with the Administrator permission, or the `👑 Owner` / `🛡️ Administrator` roles.
"Staff" means admins plus the `🔨 Moderator` role.
Tip for `/announce` and `/changelog`: slash command boxes are one line, so type `\n` where you want a new line.

## How verification works

1. An admin runs `/setup-verification`. Paradise posts the panel (banner image, welcome text, green VERIFY button) in `✅・verify` and deletes any older panel it posted.
2. A new member presses **VERIFY**. Paradise gives them `👤 Member` and `🌱 Beginner`, and replies privately.
3. Paradise posts a welcome message in `👋・welcome` (once per person per hour).
4. Pressing VERIFY again just says "you are already verified". Nothing is duplicated.

The button can only ever give the two roles listed in `src/features/verification/constants.ts`.
Paradise refuses to hand out a role that has staff-level permissions, so nobody can use the button to gain power.

## Discord setup Paradise needs

1. **Server Settings > Roles > Paradise** (the role Discord created for the bot): turn on **Manage Roles**, **View Channels**, **Send Messages**, **Embed Links**, **Attach Files** and **Read Message History**.
2. Drag the **Paradise** role **above** `👤 Member` and `🌱 Beginner` in the role list. Discord only lets a bot give roles that sit below its own.
3. Make sure `👤 Member` and `🌱 Beginner` do **not** have Administrator, Manage Roles, Manage Channels, Manage Messages, Kick, Ban or Timeout permissions.
4. Unverified people must be able to **see** `✅・verify` (and read `📜・rules`). Hide the rest of the server from everyone except `👤 Member`.
5. Paradise must be allowed to send messages and embeds in `👋・welcome`, `📢・announcements`, `📰・rust-news`, `📋・changelogs`, and any channel you post the guide in.

## Updating the bot on Railway

1. On your computer, copy the new `src` folder and `assets` folder (and `README.md`, `.env.example`) over your existing project folder. Do not copy `node_modules` or `.env`.
2. Register the new slash commands (once per change): `npm run deploy`
3. On GitHub, open your repo, go **inside the `paradise-bot` folder**, click **Add file > Upload files**, drag in `src`, `assets`, `README.md` and `.env.example`, and commit. Railway redeploys automatically.
4. No new Railway variables are needed. The ID variables in `.env.example` are optional.

## Testing checklist

- [ ] `/setup-verification`: panel appears in `✅・verify` with the banner image on top and the VERIFY button underneath
- [ ] Press VERIFY with a test account: private confirmation, both roles added, welcome message in `👋・welcome`
- [ ] Press VERIFY again: "already verified", no second welcome message
- [ ] Run `/setup-verification` again: only one panel remains
- [ ] `/server-info` shows correct numbers
- [ ] `/setup-server-info` posts the guide where you choose
- [ ] `/announce` and `/changelog` post in the right channels (try with and without an image)
- [ ] A normal member running `/announce` gets a friendly "staff only" message
