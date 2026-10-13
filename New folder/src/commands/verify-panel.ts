import {
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { postVerificationPanel } from '../features/verification/postPanel';
import type { Command } from '../types';

const verifyPanel: Command = {
  data: new SlashCommandBuilder()
    .setName('verify-panel')
    .setDescription(
      'Post (or repost) the verification panel in the verify channel',
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setContexts(InteractionContextType.Guild),

  async execute(interaction) {
    if (
      !interaction.inCachedGuild() ||
      !interaction.memberPermissions.has(
        PermissionFlagsBits.Administrator,
      )
    ) {
      await interaction.reply({
        content: 'Only administrators can use this command.',
        flags: MessageFlags.Ephemeral,
      });

      return;
    }

    await interaction.deferReply({
      flags: MessageFlags.Ephemeral,
    });

    const result = await postVerificationPanel(interaction.guild);

    if (result.ok) {
      await interaction.editReply(
        `✅ Verification panel posted in <#${result.channelId}>.`,
      );
    } else {
      await interaction.editReply(`❌ ${result.reason}`);
    }
  },
};

export default verifyPanel;
