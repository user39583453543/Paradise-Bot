import { existsSync } from 'node:fs';
import path from 'node:path';
import { AttachmentBuilder, EmbedBuilder, type ChatInputCommandInteraction } from 'discord.js';
import { Colors, SERVER_NAME } from '../theme';
import { ChannelNames, RoleNames } from '../serverConfig';

const ASSET_DIR = path.resolve(__dirname, '..', '..', 'assets');

function asset(name: string) {
  const filePath = path.join(ASSET_DIR, name);
  return existsSync(filePath) ? new AttachmentBuilder(filePath, { name }) : undefined;
}

async function postPanel(i: ChatInputCommandInteraction, title: string, description: string, fileName: string) {
  if (!i.guild) return;
  const file = asset(fileName);
  const embed = new EmbedBuilder()
    .setColor(Colors.tropicalTeal)
    .setTitle(title)
    .setDescription(description)
    .setFooter({ text: `${SERVER_NAME} 🌴` })
    .setTimestamp();
  if (file) embed.setImage(`attachment://${fileName}`);
  await i.reply({ embeds: [embed], files: file ? [file] : [] });
}

export async function postRules(i: ChatInputCommandInteraction) {
  await postPanel(i, '📜 PARADISE RULES', [
    '🌴 **Respect the Paradise community.**',
    '✦ Be respectful to administrators, staff and other members.',
    '✦ Do not dox, threaten, harass or target other members.',
    '✦ When publishing a build, credit the builder.',
    '✦ Keep criticism constructive and related to building.',
    '',
    '### 💬 Chat Rules',
    '✦ No NSFW content.',
    '✦ No spam or excessive trolling.',
    '✦ No racism, harassment or discrimination.',
    '✦ Do not share malicious content, IP grabbers or viruses.',
    '',
    '### 🔊 Voice Rules',
    '✦ No disruptive or intentionally loud noises.',
    '✦ No harassment, racism or sexism.',
    '✦ Keep voice channels enjoyable for everyone.',
  ].join('\n'), 'rules-gfx.png');
}

export async function postOrderInformation(i: ChatInputCommandInteraction) {
  await postPanel(i, '🛒 PARADISE ORDER INFORMATION', [
    '🏝️ **Custom Rust building orders**',
    '',
    'You can use Paradise to request custom building work from our builders.',
    '',
    '### 🏗️ Orders you can request',
    '✦ Custom bases and compounds',
    '✦ Build designs based on your requirements',
    '✦ Base codes and building packages',
    '✦ Building guides / walkthroughs where available',
    '✦ Other Rust construction requests approved by staff',
    '',
    '### 💳 How ordering works',
    '1️⃣ Open an order/support ticket.',
    '2️⃣ Tell us what you want built and provide your requirements.',
    '3️⃣ A staff member reviews the request.',
    '4️⃣ A builder can discuss the build, price and timeline with you.',
    '5️⃣ Once everything is agreed, the order can be started.',
    '',
    '🌴 **Please give as much detail as possible so our builders can quote and plan accurately.**',
  ].join('\n'), 'orders-gfx.png');
}

export async function postRolesInformation(i: ChatInputCommandInteraction) {
  const role = (name: string) => `<@&${i.guild?.roles.cache.find(r => r.name === name)?.id ?? ''}>`;
  await postPanel(i, '👑 PARADISE ROLES', [
    '🏝️ **Your Paradise progression**',
    '',
    `👑 ${role(RoleNames.owner)} — Server owner`,
    `🛡️ ${role(RoleNames.administrator)} — Server administration`,
    `🔨 ${role(RoleNames.moderator)} — Moderation and community support`,
    `💎 ${role(RoleNames.verifiedBuilder)} — Approved / verified builder`,
    `🏆 ${role(RoleNames.expert)} — High-level builder`,
    `🔷 ${role(RoleNames.advancedBuilder)} — Advanced builder`,
    `🔨 ${role(RoleNames.builder)} — Builder role`,
    `🌱 ${role(RoleNames.beginner)} — New builder / starting member`,
    `👤 ${role(RoleNames.member)} — Verified community member`,
    '',
    '### 🌴 Builder progression',
    'Builder ranks are awarded through staff review, build quality, contribution and activity within Paradise.',
    '',
    '💎 Want a builder role? Submit your work through the appropriate Paradise build systems and let staff review it.',
  ].join('\n'), 'roles-gfx.png');
}
