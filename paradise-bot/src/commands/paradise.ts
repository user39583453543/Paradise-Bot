import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Colors, Emojis, SERVER_NAME } from '../theme';
import type { Command } from '../types';

const paradise: Command = {
  data: new SlashCommandBuilder()
    .setName('paradise')
    .setDescription('Meet Paradise, the bot for Mekkers Building Paradise'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(Colors.oceanBlue)
      .setTitle(`${Emojis.island} Welcome to Paradise ${Emojis.palm}`)
      .setDescription(
        [
          `${Emojis.wave} **Paradise** is the official bot of **${SERVER_NAME}**.`,
          '',
          'Where the sand is golden, the water is turquoise, and every base is built to be admired.',
        ].join('\n'),
      )
      .addFields(
        {
          name: `${Emojis.build} What is this place?`,
          value: 'A tropical home for Rust builders to share, learn and show off their work.',
        },
        {
          name: `${Emojis.shell} Try these`,
          value: '`/paradise` Meet the bot\n`/ping` Check my latency',
          inline: true,
        },
        {
          name: `${Emojis.sun} Status`,
          value: 'Foundation ready. More features are on the way!',
          inline: true,
        },
      )
      .setFooter({ text: `${SERVER_NAME} ${Emojis.palm}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

export default paradise;
