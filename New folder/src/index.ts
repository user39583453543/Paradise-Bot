import 'dotenv/config';
import {
  Client,
  Collection,
  GatewayIntentBits,
  Events,
} from 'discord.js';
import { handleButtonInteraction } from './buttons';
import { commands } from './commands';

const token = process.env.DISCORD_TOKEN;

if (!token) {
  console.error(
    '❌ [config] DISCORD_TOKEN is missing. Copy .env.example to .env and fill it in.',
  );
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

const commandMap = new Collection<string, (interaction: any) => Promise<void>>();

for (const command of commands) {
  commandMap.set(command.data.name, command.execute);
}

client.once(Events.ClientReady, (readyClient) => {
  console.log(
    `🏝️ [bot] Paradise is online as ${readyClient.user.tag}`,
  );
  console.log(
    `🏝️ [bot] Loaded ${commands.length} command(s): ${commands
      .map((command) => `/${command.data.name}`)
      .join(', ')}`,
  );
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isButton()) {
    await handleButtonInteraction(interaction);
    return;
  }

  if (!interaction.isChatInputCommand()) return;

  const execute = commandMap.get(interaction.commandName);

  if (!execute) {
    await interaction.reply({
      content: '🌊 That command is not available right now.',
      ephemeral: true,
    });
    return;
  }

  try {
    await execute(interaction);
  } catch (error) {
    console.error(
      `❌ [command] /${interaction.commandName} failed:`,
      error,
    );

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: '🌊 Something went wrong. Please try again.',
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: '🌊 Something went wrong. Please try again.',
        ephemeral: true,
      });
    }
  }
});

client.login(token);
