import { InteractionContextType, SlashCommandBuilder } from 'discord.js';
import { config } from '../config';
import { publishStaffPost, type PostKind } from '../features/announcements/publish';
import { ChannelNames } from '../serverConfig';
import { Colors } from '../theme';
import type { Command } from '../types';

const TARGETS: Record<string, PostKind> = {
  announcements: {
    label: 'Announcement',
    emoji: '📢',
    color: Colors.oceanBlue,
    channelName: ChannelNames.announcements,
    channelOverrideId: config.ids.announcementsChannel,
  },
  'rust-news': {
    label: 'Rust news',
    emoji: '📰',
    color: Colors.sunsetOrange,
    channelName: ChannelNames.rustNews,
    channelOverrideId: config.ids.rustNewsChannel,
  },
};

const announce: Command = {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Post an announcement or Rust news update (staff only)')
    .setContexts(InteractionContextType.Guild)
    .addStringOption((o) => o.setName('title').setDescription('The headline').setRequired(true).setMaxLength(200))
    .addStringOption((o) =>
      o
        .setName('description')
        .setDescription('The message. Type \\n for a new line')
        .setRequired(true)
        .setMaxLength(4000),
    )
    .addStringOption((o) =>
      o
        .setName('where')
        .setDescription('Where to post it (default: announcements)')
        .addChoices(
          { name: '📢 announcements', value: 'announcements' },
          { name: '📰 rust-news', value: 'rust-news' },
        ),
    )
    .addAttachmentOption((o) => o.setName('image').setDescription('An optional image')),

  async execute(interaction) {
    const kind = TARGETS[interaction.options.getString('where') ?? 'announcements'] ?? TARGETS.announcements;
    await publishStaffPost(interaction, kind, {
      title: interaction.options.getString('title', true),
      description: interaction.options.getString('description', true),
      image: interaction.options.getAttachment('image'),
    });
  },
};

export default announce;
