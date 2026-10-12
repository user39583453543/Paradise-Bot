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

export const config = {
  token: required('DISCORD_TOKEN'),
  clientId: required('CLIENT_ID'),
  // Optional. When set, slash commands are registered to this server only (instant).
  guildId: process.env.GUILD_ID?.trim() || undefined,
};
