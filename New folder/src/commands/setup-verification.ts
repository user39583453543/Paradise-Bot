import { InteractionContextType, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { postVerificationPanel } from '../features/verification/postPanel';
import type { Command } from '../types';
import { ADMIN_ONLY_MESSAGE, isAdmin } from '../utils/permissions';

const setupVerification: Command = {
  data: new SlashCommandBuilder()
    .setName('setup-verification')
    .setDescription('Post (or repost) the verification panel in the verify channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setContexts(InteractionContextType.Guild),

  async execute(interaction) {
    // Double-check on our side too, in case the server's command permissions were changed.
    if (!interaction.inCachedGuild() || !isAdmin(interaction.member)) {
      await interaction.reply({ content: ADMIN_ONLY_MESSAGE, flags: MessageFlags.Ephemeral });
      return;
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const result = await postVerificationPanel(interaction.guild);

    if (result.ok) {
      await interaction.editReply(`✅ Verification panel posted in <#${result.channelId}>.`);
    } else {
      await interaction.editReply(`❌ ${result.reason}`);
    }
  },
};

export default setupVerification;
