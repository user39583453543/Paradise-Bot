import { EmbedBuilder } from 'discord.js';
import { Colors, Emojis, SERVER_NAME } from '../theme';

export const BRAND_FOOTER = `${SERVER_NAME} ${Emojis.palm}`;

/** A Paradise embed with the standard colour and footer. Every new embed should start from this. */
export function paradiseEmbed(color: number = Colors.oceanBlue): EmbedBuilder {
  return new EmbedBuilder().setColor(color).setFooter({ text: BRAND_FOOTER });
}
