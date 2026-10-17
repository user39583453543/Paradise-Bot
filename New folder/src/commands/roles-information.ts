import { AttachmentBuilder, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import path from 'node:path';
import type { Command } from '../types';

const imagePath = path.resolve(process.cwd(), 'assets', 'roles-gfx.png');

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('roles-information')
    .setDescription('Post Paradise role and builder rank information.') as any,
  execute: async (i) => {
    if (!i.guild || !i.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
      await i.reply({ content: '🛡️ You need Manage Server to post the roles information panel.', ephemeral: true });
      return;
    }
    const file = new AttachmentBuilder(imagePath, { name: 'paradise-roles.png' });
    const embed = new EmbedBuilder()
      .setColor(0x00b4d8)
      .setTitle('👑 MEKKERS BUILDING PARADISE — ROLES')
      .setDescription('Here is what the main Paradise roles mean and how they fit into the community.')
      .setImage('attachment://paradise-roles.png')
      .setFooter({ text: '🏝️ Builders • Community • Grow Together' });
    await i.channel?.send({ embeds: [embed], files: [file] });
    await i.reply({ content: '✅ Roles information panel posted.', ephemeral: true });
  },
};

export default command;
