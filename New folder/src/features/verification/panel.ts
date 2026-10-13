import { existsSync } from 'node:fs';
import path from 'node:path';
import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  type Guild,
} from 'discord.js';
import { ChannelNames } from '../../serverConfig';
import { Colors, SERVER_NAME } from '../../theme';
import { channelMention } from '../../utils/discordLookup';
import {
  BANNER_ATTACHMENT_NAME,
  VERIFY_BUTTON_ID,
} from './constants';

const BANNER_PATH = path.resolve(
  __dirname,
  '..',
  '..',
  '..',
  'assets',
  'verify-banner.png',
);

export function buildVerificationPanel(guild: Guild) {
  const embeds: EmbedBuilder[] = [];
  const files: AttachmentBuilder[] = [];

  if (existsSync(BANNER_PATH)) {
    files.push(
      new AttachmentBuilder(BANNER_PATH, {
        name: BANNER_ATTACHMENT_NAME,
        description:
          'Mekkers Building Paradise: verify to enter Paradise',
      }),
    );

    embeds.push(
      new EmbedBuilder()
        .setColor(Colors.tropicalTeal)
        .setImage(`attachment://${BANNER_ATTACHMENT_NAME}`),
    );
  } else {
    console.warn(
      `⚠️ [verify] Banner image not found at ${BANNER_PATH}. Posting the panel without it.`,
    );
  }

  const rules = channelMention(guild, ChannelNames.rules);

  const textEmbed = new EmbedBuilder()
    .setColor(Colors.tropicalTeal)
    .setDescription(
      [
        `# 🏝️ WELCOME TO ${SERVER_NAME.toUpperCase()}`,
        '🌴 *Rust builders, island bases and good vibes. All in one place.*',
        '',
        'To keep Paradise safe and beautiful, **every new member needs to verify** before they can explore the rest of the community.',
        '',
        '### 🌊 How it works',
        `**1️⃣** Read the rules in ${rules}`,
        '**2️⃣** Press the **✅ VERIFY** button below',
        '**3️⃣** Receive your 👤 **Member** and 🌱 **Beginner** roles and dive in!',
      ].join('\n'),
    )
    .setFooter({
      text: `${SERVER_NAME} 🌴 One click and you're in`,
    });

  embeds.push(textEmbed);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(VERIFY_BUTTON_ID)
      .setLabel('VERIFY')
      .setEmoji('✅')
      .setStyle(ButtonStyle.Success),
  );

  return {
    embeds,
    components: [row],
    files,
  };
}
