import 'dotenv/config';

/** Reads a required setting from .env and stops with a friendly message if it is missing. */
function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value || value.startsWith('paste-your-')) {
    console.error(`❌ [config] ${name} is missing. Copy .env.example to .env and fill it in.`);
    process.exit(1);
  }
  return value;
}

/** Reads an optional ID from .env (returns undefined when it is empty). */
function optionalId(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

export const config = {
  token: required('DISCORD_TOKEN'),
  clientId: required('CLIENT_ID'),
  // Optional. When set, slash commands are registered to this server only (instant).
  guildId: process.env.GUILD_ID?.trim() || undefined,

  /**
   * Optional ID overrides. Paradise finds channels and roles by their NAME (see serverConfig.ts),
   * so you can leave all of these empty. Set one only if you renamed something or have two
   * channels/roles with similar names.
   */
  ids: {
    verificationChannel: optionalId('VERIFICATION_CHANNEL_ID'),
    welcomeChannel: optionalId('WELCOME_CHANNEL_ID'),
    announcementsChannel: optionalId('ANNOUNCEMENTS_CHANNEL_ID'),
    rustNewsChannel: optionalId('RUST_NEWS_CHANNEL_ID'),
    changelogsChannel: optionalId('CHANGELOGS_CHANNEL_ID'),
    memberRole: optionalId('MEMBER_ROLE_ID'),
    beginnerRole: optionalId('BEGINNER_ROLE_ID'),
    ownerRole: optionalId('OWNER_ROLE_ID'),
    administratorRole: optionalId('ADMINISTRATOR_ROLE_ID'),
    moderatorRole: optionalId('MODERATOR_ROLE_ID'),
  },
};
