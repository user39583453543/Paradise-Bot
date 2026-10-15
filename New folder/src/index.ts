import { Client, Events, GatewayIntentBits, MessageFlags } from 'discord.js';
import { handleButtonInteraction } from './buttons';
import { commands } from './commands';
import { config } from './config';

// "Guilds" is the only intent slash commands need.
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Look up commands by name for fast access.
const commandMap = new Map(commands.map((command) => [command.data.name, command]));

client.once(Events.ClientReady, (readyClient) => {
  console.log(`🏝️ [bot] Paradise is online as ${readyClient.user.tag}`);
  console.log(`🌴 [bot] Loaded ${commandMap.size} command(s): ${[...commandMap.keys()].map((n) => `/${n}`).join(', ')}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  // Button presses (like the VERIFY button) are handled in src/buttons.
  if (interaction.isButton()) {
    await handleButtonInteraction(interaction);
    return;
  }

  if (!interaction.isChatInputCommand()) return;

  const command = commandMap.get(interaction.commandName);
  if (!command) {
    console.warn(`⚠️ [bot] Unknown command: /${interaction.commandName}. Did you run "npm run deploy"?`);
    await interaction.reply({ content: 'I do not know that command yet.', flags: MessageFlags.Ephemeral });
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`❌ [bot] /${interaction.commandName} failed:`, error);
    const reply = { content: '🌊 Something went wrong. Please try again in a moment.', flags: MessageFlags.Ephemeral } as const;
    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(reply);
      } else {
        await interaction.reply(reply);
      }
    } catch (replyError) {
      console.error('❌ [bot] Could not send the error message:', replyError);
    }
  }
});

client.on(Events.Error, (error) => console.error('❌ [discord] Client error:', error.message));
client.on(Events.Warn, (message) => console.warn('⚠️ [discord]', message));

process.on('unhandledRejection', (reason) => {
  console.error('❌ [process] Unhandled promise rejection:', reason);
});

client.login(config.token).catch((error) => {
  // Only the error message is printed, never the token itself.
  console.error('❌ [bot] Could not log in:', error instanceof Error ? error.message : error);
  console.error('   Check that DISCORD_TOKEN in your .env is correct and that you are online.');
  process.exit(1);
});
