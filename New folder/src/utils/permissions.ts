import { PermissionFlagsBits, type GuildMember } from 'discord.js';
import { config } from '../config';
import { RoleNames } from '../serverConfig';
import { findRole } from './discordLookup';

function hasRole(member: GuildMember, name: string, overrideId?: string): boolean {
  const role = findRole(member.guild, name, overrideId);
  return role !== undefined && member.roles.cache.has(role.id);
}

/** Server owner, anyone with the Administrator permission, or the 👑 Owner / 🛡️ Administrator roles. */
export function isAdmin(member: GuildMember): boolean {
  return (
    member.id === member.guild.ownerId ||
    member.permissions.has(PermissionFlagsBits.Administrator) ||
    hasRole(member, RoleNames.owner, config.ids.ownerRole) ||
    hasRole(member, RoleNames.administrator, config.ids.administratorRole)
  );
}

/** Admins plus the 🔨 Moderator role. */
export function isStaff(member: GuildMember): boolean {
  return isAdmin(member) || hasRole(member, RoleNames.moderator, config.ids.moderatorRole);
}

export const STAFF_ONLY_MESSAGE = '🌴 Only Paradise staff can use this command.';
export const ADMIN_ONLY_MESSAGE = '🌴 Only Paradise administrators can use this command.';
