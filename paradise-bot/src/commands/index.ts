import type { Command } from '../types';
import paradise from './paradise';
import ping from './ping';

/**
 * The list of every slash command Paradise has.
 * To add a new command later: create a file in this folder, import it here, and add it to the list.
 */
export const commands: Command[] = [ping, paradise];
