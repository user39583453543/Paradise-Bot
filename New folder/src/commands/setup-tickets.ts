import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../types';
import { setupTicketPanel } from '../features/tickets/service';
const command: Command={data:new SlashCommandBuilder().setName('setup-tickets').setDescription('Post the Paradise ticket panel.'),execute:async i=>{await setupTicketPanel(i);}};
export default command;
