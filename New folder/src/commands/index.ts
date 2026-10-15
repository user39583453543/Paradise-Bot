import type { Command } from '../types';
import announce from './announce';
import changelog from './changelog';
import paradise from './paradise';
import ping from './ping';
import serverInfo from './server-info';
import setupServerInfo from './setup-server-info';
import setupVerification from './setup-verification';

/**
 * The list of every slash command Paradise has.
 * To add a new command later: create a file in this folder, import it here, and add it to the list.
 */
export const commands: Command[] = [ping, paradise, setupVerification, serverInfo, setupServerInfo, announce, changelog];
