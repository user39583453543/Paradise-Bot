import type { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

/** Every slash command file exports an object shaped like this. */
export interface Command {
  data: SlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}
