import {
  PermissionFlagsBits,
  type GuildMember,
  type Role,
} from 'discord.js';
import { findRole } from '../../utils/discordLookup';
import { VERIFY_GRANT_ROLES } from './constants';

export type VerifyOutcome =
  | {
      status: 'verified';
      granted: Role[];
      newlyVerified: boolean;
    }
  | {
      status: 'already-verified';
    }
  | {
      status: 'failed';
    };

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

export async function verifyMember(
  member: GuildMember,
): Promise<VerifyOutcome> {
  const guild = member.guild;

  const roles: Role[] = [];
  const missing: string[] = [];

  for (const name of VERIFY_GRANT_ROLES) {
    const role = findRole(guild, name);

    if (role) {
      roles.push(role);
    } else {
      missing.push(name);
    }
  }

  if (missing.length > 0) {
    console.error(
      `❌ [verify] Role(s) not found in "${guild.name}": ${missing
        .map((name) => `"${name}"`)
        .join(', ')}. Create them in Discord or fix the names in src/serverConfig.ts.`,
    );

    return { status: 'failed' };
  }

  const needed = roles.filter(
    (role) => !member.roles.cache.has(role.id),
  );

  if (needed.length === 0) {
    return { status: 'already-verified' };
  }

  for (const role of needed) {
    if (role.id === guild.id || role.managed) {
      console.error(
        `❌ [verify] "${role.name}" is a special role that cannot be assigned. Check src/serverConfig.ts.`,
      );

      return { status: 'failed' };
    }

    if (role.permissions.any(DANGEROUS_PERMISSIONS)) {
      console.error(
        `❌ [verify] Refusing to give "${role.name}": it has staff-level permissions.`,
      );

      return { status: 'failed' };
    }

    if (!role.editable) {
      console.error(
        `❌ [verify] Paradise cannot assign "${role.name}". Give the Paradise role "Manage Roles" permission and move it above this role.`,
      );

      return { status: 'failed' };
    }
  }

  try {
    await member.roles.add(
      needed.map((role) => role.id),
      'Paradise verification',
    );
  } catch (error) {
    console.error(
      `❌ [verify] Could not add roles to ${member.user.username}:`,
      error instanceof Error ? error.message : error,
    );

    return { status: 'failed' };
  }

  console.log(
    `🌴 [verify] ${member.user.username} verified (added: ${needed
      .map((role) => role.name)
      .join(', ')})`,
  );

  const memberRole = roles[0];

  const newlyVerified = needed.some(
    (role) => role.id === memberRole.id,
  );

  return {
    status: 'verified',
    granted: needed,
    newlyVerified,
  };
}
