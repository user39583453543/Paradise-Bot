import {
  ChannelType,
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { buildGuideEmbed } from '../features/serverInfo/guide';
import type { Command } from '../types';
import { missingChannelPermissions } from '../utils/discordLookup';
import { ADMIN_ONLY_MESSAGE, isAdmin } from '../utils/permissions';

const TEXT_TYPES = [ChannelType.GuildText, ChannelType.GuildAnnouncement] as const;

const setupServerInfo: Command = {
  data: new SlashCommandBuilder()
    .setName('setup-server-info')
    .setDescription('Post the Paradise Guide embed in a channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setContexts(InteractionContextType.Guild)
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('Where to post the guide (defaults to this channel)')
        .addChannelTypes(...TEXT_TYPES),
    ),

  async execute(interaction) {
    if (!interaction.inCachedGuild() || !isAdmin(interaction.member)) {
      await interaction.reply({ content: ADMIN_ONLY_MESSAGE, flags: MessageFlags.Ephemeral });
      return;
    }

    const picked = interaction.options.getChannel('channel', false, TEXT_TYPES);
    const current = interaction.channel;
    const target =
      picked ??
      (current && (current.type === ChannelType.GuildText || current.type === ChannelType.GuildAnnouncement)
        ? current
        : null);

    if (!target) {
      await interaction.reply({ content: '❌ Please pick a text channel.', flags: MessageFlags.Ephemeral });
      return;
    }

    const missing = missingChannelPermissions(interaction.guild, target, [
      PermissionFlagsBits.ViewChannel,
      PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.EmbedLinks,
    ]);
    if (missing.length > 0) {
      console.error(`❌ [server-info] Missing permissions in #${target.name}: ${missing.join(', ')}`);
      await interaction.reply({
        content: `❌ I am missing permissions in ${target}: **${missing.join(', ')}**.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    await target.send({ embeds: [buildGuideEmbed(interaction.guild)] });
    await interaction.editReply(`✅ Paradise Guide posted in ${target}.`);
  },
};

export default setupServerInfo;
