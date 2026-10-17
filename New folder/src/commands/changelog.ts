import { InteractionContextType, SlashCommandBuilder } from 'discord.js';
import { config } from '../config';
import { publishStaffPost, type PostKind } from '../features/announcements/publish';
import { ChannelNames } from '../serverConfig';
import { Colors } from '../theme';
import type { Command } from '../types';

const CHANGELOG: PostKind = {
  label: 'Changelog',
  emoji: '📋',
  color: Colors.palmGreen,
  channelName: ChannelNames.changelogs,
  channelOverrideId: config.ids.changelogsChannel,
};

const changelog: Command = {
  data: new SlashCommandBuilder()
    .setName('changelog')
    .setDescription("Post a changelog about what's new in Paradise (staff only)")
    .setContexts(InteractionContextType.Guild)
    .addStringOption((o) => o.setName('title').setDescription('The headline').setRequired(true).setMaxLength(150))
    .addStringOption((o) =>
      o
        .setName('description')
        .setDescription('What changed. Type \\n for a new line')
        .setRequired(true)
        .setMaxLength(4000),
    )
    .addStringOption((o) => o.setName('version').setDescription('Optional version, like v1.2').setMaxLength(30))
    .addAttachmentOption((o) => o.setName('image').setDescription('An optional image')),

  async execute(interaction) {
    const version = interaction.options.getString('version');
    const title = interaction.options.getString('title', true);
    await publishStaffPost(interaction, CHANGELOG, {
      title: version ? `${version} · ${title}` : title,
      description: interaction.options.getString('description', true),
      image: interaction.options.getAttachment('image'),
    });
  },
};

export default changelog;
