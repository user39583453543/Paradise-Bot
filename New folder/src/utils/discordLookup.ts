import {
  ChannelType,
  PermissionsBitField,
  type Guild,
  type GuildBasedChannel,
  type NewsChannel,
  type Role,
  type TextChannel,
} from 'discord.js';

/** Lowercases and removes invisible emoji helper characters so names compare reliably. */
export function normalizeName(name: string): string {
  return name
    .normalize('NFKC')
    .replace(/[\uFE0E\uFE0F\u200D]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/** The "plain" part of a name: everything after any leading emoji, symbols and separators. */
function coreName(name: string): string {
  return normalizeName(name).replace(/^[^\p{L}\p{N}]+/u, '').trim();
}

/**
 * Finds the item whose name matches `wanted`.
 * 1. Exact match (ignoring invisible emoji characters and letter case).
 * 2. Otherwise, a match on the plain name only, but only if exactly one item matches.
 */
function findByName<T extends { name: string }>(items: Iterable<T>, wanted: string): T | undefined {
  const list = [...items];
  const target = normalizeName(wanted);
  const exact = list.find((item) => normalizeName(item.name) === target);
  if (exact) return exact;

  const core = coreName(wanted);
  if (!core) return undefined;
  const matches = list.filter((item) => coreName(item.name) === core);
  return matches.length === 1 ? matches[0] : undefined;
}

export function findRole(guild: Guild, wanted: string, overrideId?: string): Role | undefined {
  if (overrideId) {
    const byId = guild.roles.cache.get(overrideId);
    if (byId) return byId;
    console.warn(`⚠️ [lookup] Role ID ${overrideId} from .env was not found. Falling back to the name "${wanted}".`);
  }
  return findByName(guild.roles.cache.values(), wanted);
}

/** Finds any channel by name (text, forum, announcement...). Useful for <#mentions>. */
export function findChannel(guild: Guild, wanted: string): GuildBasedChannel | undefined {
  return findByName(guild.channels.cache.values(), wanted);
}

/** Finds a normal text or announcement channel, which are the ones Paradise can send messages in. */
export function findTextChannel(
  guild: Guild,
  wanted: string,
  overrideId?: string,
): TextChannel | NewsChannel | undefined {
  if (overrideId) {
    const byId = guild.channels.cache.get(overrideId);
    if (byId && (byId.type === ChannelType.GuildText || byId.type === ChannelType.GuildAnnouncement)) return byId;
    console.warn(`⚠️ [lookup] Channel ID ${overrideId} from .env is not a text channel I can see. Falling back to the name "${wanted}".`);
  }
  const textChannels = [...guild.channels.cache.values()].filter(
    (channel): channel is TextChannel | NewsChannel =>
      channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildAnnouncement,
  );
  return findByName(textChannels, wanted);
}

/** Returns "<#id>" so Discord shows a clickable channel link, or a bold fallback name. */
export function channelMention(guild: Guild, wanted: string): string {
  const channel = findChannel(guild, wanted);
  if (channel) return `<#${channel.id}>`;
  console.warn(`⚠️ [lookup] Channel "${wanted}" was not found. Showing its plain name instead.`);
  return `**${wanted}**`;
}

/** Lists which of the given permissions the bot is missing in a channel (for helpful console errors). */
export function missingChannelPermissions(
  guild: Guild,
  channel: TextChannel | NewsChannel,
  needed: bigint[],
): string[] {
  const me = guild.members.me;
  const have = me ? channel.permissionsFor(me) : null;
  if (!have) return [];
  return needed.filter((flag) => !have.has(flag)).flatMap((flag) => new PermissionsBitField(flag).toArray());
}

/** Returns a role mention (shown as a coloured pill in embeds), or its plain name if it can't be found. */
export function roleLabel(guild: Guild, wanted: string, overrideId?: string): string {
  const role = findRole(guild, wanted, overrideId);
  return role ? `${role}` : `**${wanted}**`;
}
