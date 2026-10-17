import { MessageFlags, type ButtonInteraction, type ModalSubmitInteraction } from 'discord.js';
import { verifyButton } from '../features/verification/verifyButton';
import { reviewBuild, rateBuild } from '../features/builds/service';
import { claimOrder } from '../features/orders/service';
import type { ButtonHandler } from '../types';
import { createTicket, closeTicket, submitTicket, TicketButtonIds } from '../features/tickets/service';

export const buttonHandlers: ButtonHandler[] = [verifyButton];
const handlerMap = new Map(buttonHandlers.map((h) => [h.customId, h]));

export async function handleButtonInteraction(i: ButtonInteraction): Promise<void> {
  const exact = handlerMap.get(i.customId);
  try {
    if (exact) { await exact.execute(i); return; }
    if (i.customId === TicketButtonIds.panel) { await createTicket(i); return; }
    if (i.customId.startsWith(TicketButtonIds.closePrefix)) { await closeTicket(i, i.customId.slice(TicketButtonIds.closePrefix.length)); return; }
    const p = i.customId.split(':');
    if (p[0] !== 'paradise') return;
    if (p[1] === 'build' && (p[2] === 'approve' || p[2] === 'reject')) { await reviewBuild(i, p[2], p[3]); return; }
    if (p[1] === 'rate') { await rateBuild(i, p[2], Number(p[3])); return; }
    if (p[1] === 'order' && p[2] === 'claim') { await claimOrder(i, p[3]); return; }
    await i.reply({ content: '🌊 This button is no longer active.', flags: MessageFlags.Ephemeral });
  } catch (e) {
    console.error('❌ [button]', e);
    const reply = { content: '🌊 Something went wrong. Please try again.', flags: MessageFlags.Ephemeral } as const;
    try { if (i.replied || i.deferred) await i.followUp(reply); else await i.reply(reply); } catch {}
  }
}

export async function handleModalSubmit(i: ModalSubmitInteraction): Promise<void> {
  if (i.customId !== TicketButtonIds.modal) return;
  try {
    await submitTicket(i);
  } catch (e) {
    console.error('❌ [modal]', e);
    const reply = { content: '🌊 Something went wrong creating your ticket. Please try again.', flags: MessageFlags.Ephemeral } as const;
    try { if (i.replied || i.deferred) await i.followUp(reply); else await i.reply(reply); } catch {}
  }
}
