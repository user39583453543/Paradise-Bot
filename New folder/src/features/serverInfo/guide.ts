import type { EmbedBuilder, Guild } from 'discord.js';
import { config } from '../../config';
import { ChannelNames, RoleNames } from '../../serverConfig';
import { Colors, Emojis, SERVER_NAME } from '../../theme';
import { channelMention, roleLabel } from '../../utils/discordLookup';
import { paradiseEmbed } from '../../utils/embeds';

/** The polished "Paradise Guide" embed for the server's information channel. */
export function buildGuideEmbed(guild: Guild): EmbedBuilder {
  const c = (name: string) => channelMention(guild, name);
  const r = (name: string, overrideId?: string) => roleLabel(guild, name, overrideId);

  return paradiseEmbed(Colors.tropicalTeal)
    .setDescription(
      [
        `# ${Emojis.island} ${SERVER_NAME.toUpperCase()}`,
        `${Emojis.palm} *Where the sand is golden, the water is turquoise, and every base is built to be admired.*`,
        '',
        'Your guide to everything in Paradise. Take a look around!',
      ].join('\n'),
    )
    .addFields(
      {
        name: '📢 News & Info',
        value: [
          `${c(ChannelNames.rules)} · The rules of Paradise`,
          `${c(ChannelNames.announcements)} · Official announcements`,
          `${c(ChannelNames.rustNews)} · Rust news and updates`,
          `${c(ChannelNames.changelogs)} · What's new in Paradise`,
          `${c(ChannelNames.hallOfFame)} · Our proudest moments`,
        ].join('\n'),
      },
      {
        name: `${Emojis.build} Build Library`,
        value: [
          `${c(ChannelNames.buildShowcase)} · Approved builds from our community`,
          `${c(ChannelNames.submitABuild)} · Share your own build`,
          `${c(ChannelNames.buildRatings)} · Rate and discuss builds`,
          `${c(ChannelNames.baseCodes)} · Base codes for approved builds`,
          `${c(ChannelNames.tutorialsGuides)} · Learn new building tricks`,
          `${c(ChannelNames.builderPortfolio)} · Meet our builders`,
        ].join('\n'),
      },
      {
        name: '🛒 Orders & Requests',
        value: [
          `${c(ChannelNames.orderHere)} · Order a custom build`,
          `${c(ChannelNames.buildRequests)} · Browse and claim build requests`,
        ].join('\n'),
      },
      {
        name: '🌱 Builder Ranks',
        value: [
          `${r(RoleNames.beginner, config.ids.beginnerRole)} → ${r(RoleNames.builder)} → ${r(RoleNames.advancedBuilder)} → ${r(RoleNames.expert)}`,
          `${r(RoleNames.verifiedBuilder)} · Builders approved by our staff`,
        ].join('\n'),
      },
    );
}
