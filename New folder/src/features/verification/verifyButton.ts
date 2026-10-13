import {
  EmbedBuilder,
  MessageFlags,
} from 'discord.js';
import { ChannelNames } from '../../serverConfig';
import { Colors, SERVER_NAME } from '../../theme';
import { channelMention } from '../../utils/discordLookup';
import type { ButtonHandler } from '../../types';
import { VERIFY_BUTTON_ID } from './constants';
import { verifyMember } from './verifyMember';
import { sendWelcomeMessage } from './welcome';

const inProgress = new Set<string>();

export const verifyButton: ButtonHandler = {
  customId: VERIFY_BUTTON_ID,

  async execute(interaction) {
    if (!interaction.inCachedGuild()) {
      await interaction.reply({
        content: 'Please use this button inside the server.',
        flags: MessageFlags.Ephemeral,
      });

      return;
    }

    const { guild, member } = interaction;

    if (inProgress.has(member.id)) {
      await interaction.reply({
        content: '🌊 Hang on, we are already verifying you...',
        flags: MessageFlags.Ephemeral,
      });

      return;
    }

    inProgress.add(member.id);

    try {
      await interaction.deferReply({
        flags: MessageFlags.Ephemeral,
      });

      const result = await verifyMember(member);

      if (result.status === 'failed') {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(Colors.sunsetOrange)
              .setTitle('🌊 Verification is not working right now')
              .setDescription(
                'Something is wrong on our side. Please let a staff member know and we will fix it quickly!',
              ),
          ],
        });

        return;
      }

      if (result.status === 'already-verified') {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(Colors.oceanBlue)
              .setTitle('🌴 You are already verified!')
              .setDescription(
                'Nothing more to do. Enjoy Paradise! 🏝️',
              ),
          ],
        });

        return;
      }

      const welcomeChannel = channelMention(
        guild,
        ChannelNames.welcome,
      );

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.palmGreen)
            .setTitle('✅ You are verified!')
            .setDescription(
              [
                `Welcome to **${SERVER_NAME}**, ${member}! 🏝️`,
                '',
                `You now have: ${result.granted
                  .map((role) => `${role}`)
                  .join(' ')}`,
                '',
                `Say hello in ${welcomeChannel} and start exploring! 🌴`,
              ].join('\n'),
            ),
        ],
      });

      if (result.newlyVerified) {
        await sendWelcomeMessage(member);
      }
    } finally {
      inProgress.delete(member.id);
    }
  },
};
