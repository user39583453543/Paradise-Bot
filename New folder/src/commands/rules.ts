import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../types';
import { postRules } from '../features/infoPanels';
const command: Command = { data: new SlashCommandBuilder().setName('rules').setDescription('Post the Paradise rules panel.'), execute: postRules };
export default command;
