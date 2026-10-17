import { REST, Routes } from 'discord.js';
import { commands } from './commands';
import { config } from './config';

// Run this whenever you add or change a slash command: npm run deploy
async function main(): Promise<void> {
  const rest = new REST({ version: '10' }).setToken(config.token);
  const body = commands.map((command) => command.data.toJSON());

  console.log(`🌴 [deploy] Registering ${body.length} command(s)...`);

  if (config.guildId) {
    await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body });
    console.log('✅ [deploy] Done! Commands registered to your server (instant).');
  } else {
    await rest.put(Routes.applicationCommands(config.clientId), { body });
    console.log('✅ [deploy] Done! Commands registered globally (can take up to an hour to appear).');
  }
}

main().catch((error) => {
  console.error('❌ [deploy] Failed:', error instanceof Error ? error.message : error);
  console.error('   Check that DISCORD_TOKEN and CLIENT_ID in your .env are correct.');
  process.exit(1);
});
