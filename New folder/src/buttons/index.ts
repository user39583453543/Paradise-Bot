import { MessageFlags, type ButtonInteraction } from 'discord.js';
import { verifyButton } from '../features/verification/verifyButton';
import type { ButtonHandler } from '../types';

/**
 * The list of every button Paradise understands.
 * To add a new button later: create a handler (see features/verification/verifyButton.ts),
 * import it here, and add it to the list.
 */
export const buttonHandlers: ButtonHandler[] = [verifyButton];

const handlerMap = new Map(buttonHandlers.map((handler) => [handler.customId, handler]));

/** Called from index.ts whenever someone presses a button. Handles errors so the bot never crashes. */
export async function handleButtonInteraction(interaction: ButtonInteraction): Promise<void> {
  const handler = handlerMap.get(interaction.customId);

  if (!handler) {
    console.warn(`⚠️ [button] No handler for button "${interaction.customId}".`);
    await interaction
      .reply({ content: '🌊 This button is no longer active.', flags: MessageFlags.Ephemeral })
      .catch(() => undefined);
    return;
  }

  try {
    await handler.execute(interaction);
  } catch (error) {
    console.error(`❌ [button] "${interaction.customId}" failed:`, error);
    const reply = { content: '🌊 Something went wrong. Please try again in a moment.', flags: MessageFlags.Ephemeral } as const;
    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(reply);
      } else {
        await interaction.reply(reply);
      }
    } catch (replyError) {
      console.error('❌ [button] Could not send the error message:', replyError);
    }
  }
}
