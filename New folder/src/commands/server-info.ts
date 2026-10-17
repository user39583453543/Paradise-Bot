import { InteractionContextType, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { buildServerInfoEmbed } from '../features/serverInfo/serverInfo';
import type { Command } from '../types';

const serverInfo: Command = {
  data: new SlashCommandBuilder()
    .setName('server-info')
    .setDescription('See information about Mekkers Building Paradise')
    .setContexts(InteractionContextType.Guild),

  async execute(interaction) {
    if (!interaction.inCachedGuild()) {
      await interaction.reply({ content: 'Please use this command inside the server.', flags: MessageFlags.Ephemeral });
      return;
    }
    await interaction.deferReply();
    await interaction.editReply({ embeds: [await buildServerInfoEmbed(interaction.guild)] });
  },
};

export default serverInfo;
