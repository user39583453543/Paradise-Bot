import { PermissionFlagsBits, type Guild, type Message } from 'discord.js';
import { config } from '../../config';
import { ChannelNames } from '../../serverConfig';
import { findTextChannel, missingChannelPermissions } from '../../utils/discordLookup';
import { VERIFY_BUTTON_ID } from './constants';
import { buildVerificationPanel } from './panel';

export type PostPanelResult = { ok: true; channelId: string } | { ok: false; reason: string };

function hasVerifyButton(message: Message): boolean {
  return message.components.some(
    (row) => 'components' in row && row.components.some((c) => 'customId' in c && c.customId === VERIFY_BUTTON_ID),
  );
}

/** Posts the verification panel in the verify channel and removes any older copy Paradise posted. */
export async function postVerificationPanel(guild: Guild): Promise<PostPanelResult> {
  const channel = findTextChannel(guild, ChannelNames.verify, config.ids.verificationChannel);
  if (!channel) {
    console.error(`❌ [verify] Channel "${ChannelNames.verify}" was not found in "${guild.name}". Check src/serverConfig.ts.`);
    return { ok: false, reason: `I could not find the **${ChannelNames.verify}** channel.` };
  }

  const missingPerms = missingChannelPermissions(guild, channel, [
    PermissionFlagsBits.ViewChannel,
    PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.EmbedLinks,
    PermissionFlagsBits.AttachFiles,
    PermissionFlagsBits.ReadMessageHistory,
  ]);
  if (missingPerms.length > 0) {
    console.error(`❌ [verify] Paradise is missing permissions in #${channel.name}: ${missingPerms.join(', ')}.`);
    return { ok: false, reason: `I am missing permissions in ${channel}: **${missingPerms.join(', ')}**.` };
  }

  let sent: Message;
  try {
    sent = await channel.send(buildVerificationPanel(guild));
  } catch (error) {
    console.error('❌ [verify] Could not post the verification panel:', error instanceof Error ? error.message : error);
    return { ok: false, reason: 'Discord refused the message. Check the console for details.' };
  }

  // Tidy up: delete older panels from Paradise so there is only ever one.
  try {
    const recent = await channel.messages.fetch({ limit: 50 });
    const botId = guild.client.user.id;
    for (const message of recent.values()) {
      if (message.id !== sent.id && message.author.id === botId && hasVerifyButton(message)) {
        await message.delete();
      }
    }
  } catch (error) {
    console.warn('⚠️ [verify] Posted the new panel, but could not remove the old one:', error instanceof Error ? error.message : error);
  }

  console.log(`🌴 [verify] Verification panel posted in #${channel.name}`);
  return { ok: true, channelId: channel.id };
}
