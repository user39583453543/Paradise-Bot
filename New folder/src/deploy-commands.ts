import 'dotenv/config';
import {
  REST,
  Routes,
} from 'discord.js';
import { commands } from './commands';

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token || !clientId || !guildId) {
  console.error(
    '❌ [deploy] Missing DISCORD_TOKEN, CLIENT_ID, or GUILD_ID in .env',
  );
  process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(token);

async function deploy() {
  console.log(
    `🏝️ [deploy] Registering ${commands.length} command(s)...`,
  );

  await rest.put(
    Routes.applicationGuildCommands(clientId, guildId),
    {
      body: commands.map((command) => command.data.toJSON()),
    },
  );

  console.log(
    '✅ [deploy] Done! Commands registered to your server (instant).',
  );
}

deploy().catch((error) => {
  console.error('❌ [deploy] Failed:', error);
  process.exit(1);
});
