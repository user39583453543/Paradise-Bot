import { AttachmentBuilder, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import path from 'node:path';
import type { Command } from '../types';

const imagePath = path.resolve(process.cwd(), 'assets', 'orders-gfx.png');

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('order-information')
    .setDescription('Post Paradise custom build order information.') as any,
  execute: async (i) => {
    if (!i.guild || !i.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
      await i.reply({ content: '🛡️ You need Manage Server to post the order information panel.', ephemeral: true });
      return;
    }
    const file = new AttachmentBuilder(imagePath, { name: 'paradise-orders.png' });
    const embed = new EmbedBuilder()
      .setColor(0x2ec4b6)
      .setTitle('🛒 MEKKERS BUILDING PARADISE — ORDERS')
      .setDescription('Looking for a custom Rust build? Use a Paradise ticket and give the builder as much detail as possible so we can quote and build exactly what you want.')
      .setImage('attachment://paradise-orders.png')
      .setFooter({ text: '🏝️ Quality builds • Trusted builders • Your vision' });
    if (i.channel && 'send' in i.channel) {
      await i.channel.send({ embeds: [embed], files: [file] });
    }
    await i.reply({ content: '✅ Order information panel posted.', ephemeral: true });
  },
};

export default command;
