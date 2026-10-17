import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Colors, Emojis } from '../theme';
import type { Command } from '../types';

const ping: Command = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription("Check Paradise's latency"),

  async execute(interaction) {
    // Measure how long Discord takes to answer us.
    const start = Date.now();
    await interaction.deferReply();
    const roundTrip = Date.now() - start;

    // The websocket ping can be -1 for the first few seconds after the bot starts.
    const wsPing = interaction.client.ws.ping;
    const wsText = wsPing >= 0 ? `${Math.round(wsPing)}ms` : 'Still measuring…';

    const embed = new EmbedBuilder()
      .setColor(Colors.tropicalTeal)
      .setTitle(`${Emojis.ping} Pong!`)
      .addFields(
        { name: `${Emojis.wave} Round trip`, value: `${roundTrip}ms`, inline: true },
        { name: `${Emojis.sun} Websocket`, value: wsText, inline: true },
      )
      .setFooter({ text: 'Paradise is awake and the tide is calm.' });

    await interaction.editReply({ embeds: [embed] });
  },
};

export default ping;
