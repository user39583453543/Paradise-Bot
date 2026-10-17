import { ChannelType, type EmbedBuilder, type Guild } from 'discord.js';
import { Colors, Emojis } from '../../theme';
import { paradiseEmbed } from '../../utils/embeds';

const TEXT_TYPES = new Set<ChannelType>([
  ChannelType.GuildText,
  ChannelType.GuildAnnouncement,
  ChannelType.GuildForum,
  ChannelType.GuildMedia,
]);
const VOICE_TYPES = new Set<ChannelType>([ChannelType.GuildVoice, ChannelType.GuildStageVoice]);

/** The live "/server-info" embed. */
export async function buildServerInfoEmbed(guild: Guild): Promise<EmbedBuilder> {
  const owner = await guild.fetchOwner().catch(() => null);

  const channels = [...guild.channels.cache.values()];
  const text = channels.filter((c) => TEXT_TYPES.has(c.type)).length;
  const voice = channels.filter((c) => VOICE_TYPES.has(c.type)).length;
  const categories = channels.filter((c) => c.type === ChannelType.GuildCategory).length;

  const created = Math.floor(guild.createdTimestamp / 1000);
  const roleCount = Math.max(guild.roles.cache.size - 1, 0); // don't count @everyone

  const embed = paradiseEmbed(Colors.oceanBlue)
    .setTitle(`${Emojis.island} ${guild.name}`)
    .setDescription(`${Emojis.palm} A tropical home for Rust builders to share, learn and show off their work.`)
    .addFields(
      { name: '👥 Members', value: guild.memberCount.toLocaleString(), inline: true },
      { name: '👑 Owner', value: owner ? `${owner.user}` : 'Unknown', inline: true },
      { name: '📅 Created', value: `<t:${created}:D>\n(<t:${created}:R>)`, inline: true },
      {
        name: '💬 Channels',
        value: `**${text + voice}** total\n${text} text · ${voice} voice · ${categories} categories`,
        inline: true,
      },
      { name: '🎭 Roles', value: `${roleCount}`, inline: true },
      { name: '✨ Boosts', value: `Tier ${guild.premiumTier} · ${guild.premiumSubscriptionCount ?? 0} boosts`, inline: true },
    )
    .setTimestamp();

  const icon = guild.iconURL({ size: 512 });
  if (icon) embed.setThumbnail(icon);
  return embed;
}
