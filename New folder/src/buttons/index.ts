import { MessageFlags, type ButtonInteraction } from 'discord.js';
import { verifyButton } from '../features/verification/verifyButton';
import type { ButtonHandler } from '../types';

export const buttonHandlers: ButtonHandler[] = [verifyButton];

const handlerMap = new Map(
  buttonHandlers.map((handler) => [handler.customId, handler]),
);

export async function handleButtonInteraction(
  interaction: ButtonInteraction,
): Promise<void> {
  const handler = handlerMap.get(interaction.customId);

  if (!handler) {
    console.warn(
      `⚠️ [button] No handler for button "${interaction.customId}".`,
    );

    await interaction
      .reply({
        content: '🌊 This button is no longer active.',
        flags: MessageFlags.Ephemeral,
      })
      .catch(() => undefined);

    return;
  }

  try {
    await handler.execute(interaction);
  } catch (error) {
    console.error(
      `❌ [button] "${interaction.customId}" failed:`,
      error,
    );

    const reply = {
      content: '🌊 Something went wrong. Please try again in a moment.',
      flags: MessageFlags.Ephemeral,
    } as const;

    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(reply);
      } else {
        await interaction.reply(reply);
      }
    } catch (replyError) {
      console.error(
        '❌ [button] Could not send the error message:',
        replyError,
      );
    }
  }
}
