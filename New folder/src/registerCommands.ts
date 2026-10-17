import { REST, Routes } from 'discord.js';
import { commands } from './commands';
import { config } from './config';

/**
 * Sends Paradise's slash commands to Discord.
 * Runs automatically every time the bot starts, and also with "npm run deploy".
 */
export async function registerCommands(): Promise<void> {
  const rest = new REST({ version: '10' }).setToken(config.token);
  const body = commands.map((command) => command.data.toJSON());

  console.log(`🌴 [commands] Registering ${body.length} command(s)...`);

  if (config.guildId) {
    await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body });
    console.log('✅ [commands] Registered to your server (instant).');
  } else {
    await rest.put(Routes.applicationCommands(config.clientId), { body });
    console.log('✅ [commands] Registered globally (can take up to an hour to appear).');
  }
}
