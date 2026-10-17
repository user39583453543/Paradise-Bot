import { PermissionFlagsBits, type GuildMember, type Role } from 'discord.js';
import { findRole } from '../../utils/discordLookup';
import { VERIFY_GRANT_ROLES } from './constants';

export type VerifyOutcome =
  | { status: 'verified'; granted: Role[]; newlyVerified: boolean }
  | { status: 'already-verified' }
  | { status: 'failed' }; // details are printed to the console

/** Permissions that a verification role must never carry. If it does, we refuse to hand it out. */
const DANGEROUS_PERMISSIONS = [
  PermissionFlagsBits.Administrator,
  PermissionFlagsBits.ManageGuild,
  PermissionFlagsBits.ManageRoles,
  PermissionFlagsBits.ManageChannels,
  PermissionFlagsBits.ManageMessages,
  PermissionFlagsBits.KickMembers,
  PermissionFlagsBits.BanMembers,
  PermissionFlagsBits.ModerateMembers,
];

/** Gives a member the verification roles. Safe to call twice: it never adds a role they already have. */
export async function verifyMember(member: GuildMember): Promise<VerifyOutcome> {
  const guild = member.guild;

  // 1) Find the roles. If one is missing, tell the owner in the console.
  const roles: Role[] = [];
  const missing: string[] = [];
  for (const { name, overrideId } of VERIFY_GRANT_ROLES) {
    const role = findRole(guild, name, overrideId);
    if (role) roles.push(role);
    else missing.push(name);
  }
  if (missing.length > 0) {
    console.error(
      `❌ [verify] Role(s) not found in "${guild.name}": ${missing.map((n) => `"${n}"`).join(', ')}. ` +
        'Create them in Discord or fix the names in src/serverConfig.ts.',
    );
    return { status: 'failed' };
  }

  // 2) Work out which roles they still need.
  const needed = roles.filter((role) => !member.roles.cache.has(role.id));
  if (needed.length === 0) return { status: 'already-verified' };

  // 3) Safety checks before handing anything out.
  for (const role of needed) {
    if (role.id === guild.id || role.managed) {
      console.error(`❌ [verify] "${role.name}" is a special role that cannot be assigned. Check src/serverConfig.ts.`);
      return { status: 'failed' };
    }
    if (role.permissions.any(DANGEROUS_PERMISSIONS)) {
      console.error(
        `❌ [verify] Refusing to give "${role.name}": it has staff-level permissions ` +
          '(Administrator, Manage Roles, Kick/Ban, etc.). Remove them from that role or fix src/serverConfig.ts.',
      );
      return { status: 'failed' };
    }
    if (!role.editable) {
      console.error(
        `❌ [verify] Paradise cannot assign "${role.name}". In Discord: Server Settings > Roles, give the Paradise ` +
          'role the "Manage Roles" permission and drag it ABOVE this role.',
      );
      return { status: 'failed' };
    }
  }

  // 4) Give the roles.
  try {
    await member.roles.add(
      needed.map((role) => role.id),
      'Paradise verification',
    );
  } catch (error) {
    console.error(`❌ [verify] Could not add roles to ${member.user.username}:`, error instanceof Error ? error.message : error);
    return { status: 'failed' };
  }

  console.log(`🌴 [verify] ${member.user.username} verified (added: ${needed.map((r) => r.name).join(', ')})`);

  const memberRole = roles[0]; // the first entry in VERIFY_GRANT_ROLES is the Member role
  const newlyVerified = needed.some((role) => role.id === memberRole.id);
  return { status: 'verified', granted: needed, newlyVerified };
}
