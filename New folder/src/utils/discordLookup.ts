import {
  ChannelType,
  PermissionsBitField,
  type Guild,
  type GuildBasedChannel,
  type NewsChannel,
  type Role,
  type TextChannel,
} from 'discord.js';

export function normalizeName(name: string): string {
  return name
    .normalize('NFKC')
    .replace(/[\uFE0E\uFE0F\u200D]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function coreName(name: string): string {
  return normalizeName(name).replace(/^[^\p{L}\p{N}]+/u, '').trim();
}

function findByName<T extends { name: string }>(
  items: Iterable<T>,
  wanted: string,
): T | undefined {
  const list = [...items];
  const target = normalizeName(wanted);

  const exact = list.find((item) => normalizeName(item.name) === target);
  if (exact) return exact;

  const core = coreName(wanted);
  if (!core) return undefined;

  const matches = list.filter((item) => coreName(item.name) === core);
  return matches.length === 1 ? matches[0] : undefined;
}

export function findRole(guild: Guild, wanted: string): Role | undefined {
  return findByName(guild.roles.cache.values(), wanted);
}

export function findChannel(
  guild: Guild,
  wanted: string,
): GuildBasedChannel | undefined {
  return findByName(guild.channels.cache.values(), wanted);
}

export function findTextChannel(
  guild: Guild,
  wanted: string,
): TextChannel | NewsChannel | undefined {
  const textChannels = [...guild.channels.cache.values()].filter(
    (channel): channel is TextChannel | NewsChannel =>
      channel.type === ChannelType.GuildText ||
      channel.type === ChannelType.GuildAnnouncement,
  );

  return findByName(textChannels, wanted);
}

export function channelMention(guild: Guild, wanted: string): string {
  const channel = findChannel(guild, wanted);

  if (channel) return `<#${channel.id}>`;

  console.warn(
    `⚠️ [lookup] Channel "${wanted}" was not found. Showing its plain name instead.`,
  );

  return `**${wanted}**`;
}

export function missingChannelPermissions(
  guild: Guild,
  channel: TextChannel | NewsChannel,
  needed: bigint[],
): string[] {
  const me = guild.members.me;
  const have = me ? channel.permissionsFor(me) : null;

  if (!have) return [];

  return needed
    .filter((flag) => !have.has(flag))
    .flatMap((flag) => new PermissionsBitField(flag).toArray());
}
