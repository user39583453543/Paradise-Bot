import type {
  ButtonInteraction,
  ChatInputCommandInteraction,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';

/** Every slash command file exports an object shaped like this. */
export interface Command {
  /** Any slash command builder works here, with or without options. */
  data: { name: string; toJSON(): RESTPostAPIChatInputApplicationCommandsJSONBody };
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

/**
 * Every button handler is shaped like this. The customId is the button's secret name:
 * when someone presses a button with that customId, Paradise runs `execute`.
 * Convention: "paradise:<feature>:<action>", for example "paradise:verify:confirm".
 */
export interface ButtonHandler {
  customId: string;
  execute: (interaction: ButtonInteraction) => Promise<void>;
}
