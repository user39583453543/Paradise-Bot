import type { ButtonInteraction, ChatInputCommandInteraction, RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';
export interface Command {
  data: { name: string; toJSON(): RESTPostAPIChatInputApplicationCommandsJSONBody };
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}
export interface ButtonHandler {
  customId: string;
  execute: (interaction: ButtonInteraction) => Promise<void>;
}
