import {
  AttachmentBuilder,
  MessageFlags,
  PermissionFlagsBits,
  type Attachment,
  type ChatInputCommandInteraction,
} from 'discord.js';
import { findTextChannel, missingChannelPermissions } from '../../utils/discordLookup';
import { paradiseEmbed } from '../../utils/embeds';
import { STAFF_ONLY_MESSAGE, isStaff } from '../../utils/permissions';

/** Describes one kind of staff post (announcement, rust news, changelog...). */
export interface PostKind {
  label: string; // used in messages, e.g. "Announcement"
  emoji: string;
  color: number;
  channelName: string; // the channel's name from serverConfig.ts
  channelOverrideId?: string; // optional ID from .env
}

export interface PostContent {
  title: string;
  description: string;
  image: Attachment | null;
}

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB keeps us under Discord's upload limit
const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
};

/** Slash command text boxes are single line, so staff can type \n to start a new line. */
function unescapeNewlines(text: string): string {
  return text.replace(/\\n/g, '\n');
}

/**
 * The shared flow behind /announce and /changelog:
 * staff check -> image check -> find channel -> permission check -> post -> confirm.
 */
export async function publishStaffPost(
  interaction: ChatInputCommandInteraction,
  kind: PostKind,
  content: PostContent,
): Promise<void> {
  if (!interaction.inCachedGuild() || !isStaff(interaction.member)) {
    await interaction.reply({ content: STAFF_ONLY_MESSAGE, flags: MessageFlags.Ephemeral });
    return;
  }

  // Validate the optional image before doing anything else.
  let imageExtension: string | undefined;
  if (content.image) {
    imageExtension = content.image.contentType ? IMAGE_EXTENSIONS[content.image.contentType] : undefined;
    if (!imageExtension) {
      await interaction.reply({ content: '❌ The image must be a PNG, JPG, GIF or WEBP file.', flags: MessageFlags.Ephemeral });
      return;
    }
    if (content.image.size > MAX_IMAGE_BYTES) {
      await interaction.reply({ content: '❌ That image is too large. Please keep it under 8 MB.', flags: MessageFlags.Ephemeral });
      return;
    }
  }

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  const { guild } = interaction;

  const channel = findTextChannel(guild, kind.channelName, kind.channelOverrideId);
  if (!channel) {
    console.error(`❌ [post] Channel "${kind.channelName}" was not found in "${guild.name}". Check src/serverConfig.ts.`);
    await interaction.editReply(`❌ I could not find the **${kind.channelName}** channel.`);
    return;
  }

  const needed = [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks];
  if (content.image) needed.push(PermissionFlagsBits.AttachFiles);
  const missing = missingChannelPermissions(guild, channel, needed);
  if (missing.length > 0) {
    console.error(`❌ [post] Missing permissions in #${channel.name}: ${missing.join(', ')}`);
    await interaction.editReply(`❌ I am missing permissions in ${channel}: **${missing.join(', ')}**.`);
    return;
  }

  const embed = paradiseEmbed(kind.color)
    .setTitle(`${kind.emoji} ${content.title}`)
    .setDescription(unescapeNewlines(content.description))
    .setTimestamp();

  const files: AttachmentBuilder[] = [];
  if (content.image && imageExtension) {
    // Re-upload the image so it never expires, instead of linking Discord's temporary URL.
    const name = `paradise-image.${imageExtension}`;
    files.push(new AttachmentBuilder(content.image.url, { name }));
    embed.setImage(`attachment://${name}`);
  }

  try {
    await channel.send({ embeds: [embed], files });
  } catch (error) {
    console.error(`❌ [post] Could not send the ${kind.label} in #${channel.name}:`, error instanceof Error ? error.message : error);
    await interaction.editReply(`❌ I could not post that. Please check my permissions in ${channel} and try again.`);
    return;
  }

  console.log(`🌴 [post] ${interaction.user.username} published: ${kind.label} in #${channel.name}`);
  await interaction.editReply(`✅ Published in ${channel}.`);
}
