import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../types';

const paradise: Command = {
  data: new SlashCommandBuilder()
    .setName('paradise')
    .setDescription('Show the Paradise bot status.'),

  async execute(interaction) {
    await interaction.reply(
      '🏝️ Welcome to Mekkers Building Paradise!',
    );
  },
};

export default paradise;
