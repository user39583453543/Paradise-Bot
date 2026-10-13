import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../types';

const ping: Command = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check if Paradise is online.'),

  async execute(interaction) {
    await interaction.reply('🏝️ Pong! Paradise is online.');
  },
};

export default ping;
