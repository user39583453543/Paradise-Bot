import type {
  ButtonInteraction,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';

export interface Command {
  data: SlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export interface ButtonHandler {
  customId: string;
  execute: (interaction: ButtonInteraction) => Promise<void>;
}
