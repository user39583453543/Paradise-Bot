/**
 * The exact names of the channels and roles in the Discord server.
 *
 * If you rename something in Discord, change it here too. Paradise ignores tiny emoji
 * differences (like the invisible "variation selector" some emojis carry), and falls back to
 * matching the plain name (e.g. "verify") when the emoji part doesn't match.
 */
export const ChannelNames = {
  welcome: '👋・welcome',
  verify: '✅・verify',
  announcements: '📢・announcements',
  rules: '📜・rules',
  rustNews: '📰・rust-news',
  changelogs: '📋・changelogs',
  hallOfFame: '🏆・hall-of-fame',
  buildShowcase: '🏛️・build-showcase',
  baseCodes: '🔐・base-codes',
  tutorialsGuides: '📚・tutorials-guides',
  builderPortfolio: '🎨・builder-portfolio',
  submitABuild: '📄・submit-a-build',
  buildRatings: '⭐・build-ratings',
  buildRequests: '📄・build-requests',
  orderHere: '🛒・order-here',
  staffLogs: '🛡️・staff-logs',
  moderationLogs: '🔨・mod-logs',
} as const;

export const RoleNames = {
  owner: '👑 Owner',
  administrator: '🛡️ Administrator',
  moderator: '🔨 Moderator',
  verifiedBuilder: '💎 Verified Builder',
  expert: '🏆 Expert',
  advancedBuilder: '🔷 Advanced Builder',
  builder: '🔨 Builder',
  beginner: '🌱 Beginner',
  member: '👤 Member',
  bots: '🤖 Bots',
} as const;
