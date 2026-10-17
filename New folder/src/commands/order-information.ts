import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../types';
import { postOrderInformation } from '../features/infoPanels';
const command: Command = { data: new SlashCommandBuilder().setName('order-information').setDescription('Post information about Paradise orders.'), execute: postOrderInformation };
export default command;
