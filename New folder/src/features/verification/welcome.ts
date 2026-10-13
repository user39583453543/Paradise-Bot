import {
  EmbedBuilder,
  PermissionFlagsBits,
  type GuildMember,
} from 'discord.js';
import { ChannelNames } from '../../serverConfig';
import { Colors, SERVER_NAME } from '../../theme';
import {
  channelMention,
  findTextChannel,
  missingChannelPermissions,
} from '../../utils/discordLookup';

const WELCOME_COOLDOWN_MS = 60 * 60 * 1000;
const recentlyWelcomed = new Map<string, number>();

function pruneOldEntries(now: number): void {
  for (const [userId, time] of recentlyWelcomed) {
    if (now - time > WELCOME_COOLDOWN_MS) {
      recentlyWelcomed.delete(userId);
    }
  }
}

export async function sendWelcomeMessage(
  member: GuildMember,
): Promise<void> {
  const now = Date.now();

  pruneOldEntries(now);

  if (recentlyWelcomed.has(member.id)) return;

  recentlyWelcomed.set(member.id, now);

  const guild = member.guild;
  const channel = findTextChannel(guild, ChannelNames.welcome);

  if (!channel) {
    console.error(
      `❌ [welcome] Channel "${ChannelNames.welcome}" was not found in "${guild.name}".`,
    );
    return;
  }

  const missingPerms = missingChannelPermissions(guild, channel, [
    PermissionFlagsBits.ViewChannel,
    PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.EmbedLinks,
  ]);

  if (missingPerms.length > 0) {
    console.error(
      `❌ [welcome] Paradise is missing permissions in #${channel.name}: ${missingPerms.join(', ')}`,
    );
    return;
  }

  const explore = [
    `📜 ${channelMention(guild, ChannelNames.rules)}  Read the rules`,
    `📢 ${channelMention(guild, ChannelNames.announcements)}  Catch the latest news`,
    `🏛️ ${channelMention(guild, ChannelNames.buildShowcase)}  Admire incredible builds`,
    `📚 ${channelMention(guild, ChannelNames.tutorialsGuides)}  Learn new building tricks`,
    `📄 ${channelMention(guild, ChannelNames.submitABuild)}  Share your own base`,
    `🛒 ${channelMention(guild, ChannelNames.orderHere)}  Order a custom build`,
  ];

  const embed = new EmbedBuilder()
    .setColor(Colors.sandGold)
    .setAuthor({
      name: `${member.user.username} has arrived in Paradise!`,
      iconURL: member.displayAvatarURL(),
    })
    .setDescription(
      [
        `# 🌴 Welcome, ${member.displayName}!`,
        `Welcome to **${SERVER_NAME}**, ${member}! 🏝️`,
        'Grab a coconut and explore our Rust building community:',
        '',
        ...explore,
      ].join('\n'),
    )
    .setThumbnail(member.displayAvatarURL({ size: 256 }))
    .setFooter({
      text: `@${member.user.username} 🌊 Paradise now has ${guild.memberCount} members`,
    });

  try {
    await channel.send({
      content: `${member}`,
      embeds: [embed],
      allowedMentions: { users: [member.id] },
    });
  } catch (error) {
    console.error(
      '❌ [welcome] Could not send the welcome message:',
      error instanceof Error ? error.message : error,
    );
  }
}
