import { AttachmentBuilder, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import path from 'node:path';
import type { Command } from '../types';

const imagePath = path.resolve(process.cwd(), 'assets', 'rules-gfx.png');

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('rules')
    .setDescription('Post the Paradise rules information panel.') as any,
  execute: async (i) => {
    if (!i.guild || !i.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
      await i.reply({ content: '🛡️ You need Manage Server to post the rules panel.', ephemeral: true });
      return;
    }
    const file = new AttachmentBuilder(imagePath, { name: 'paradise-rules.png' });
    const embed = new EmbedBuilder()
      .setColor(0x00b4d8)
      .setTitle('📜 MEKKERS BUILDING PARADISE — RULES')
      .setDescription('Please read and follow the rules below. Help us keep Paradise friendly, organised and enjoyable for everyone.')
      .setImage('attachment://paradise-rules.png')
      .setFooter({ text: '🏝️ Build • Share • Create • Belong' });
    await i.channel?.send({ embeds: [embed], files: [file] });
    await i.reply({ content: '✅ Rules panel posted.', ephemeral: true });
  },
};

export default command;
