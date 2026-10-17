import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../types';
import { postRolesInformation } from '../features/infoPanels';
const command: Command = { data: new SlashCommandBuilder().setName('roles-information').setDescription('Post information about Paradise roles.'), execute: postRolesInformation };
export default command;
