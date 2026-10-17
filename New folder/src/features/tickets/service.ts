import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  ModalBuilder,
  PermissionFlagsBits,
  TextInputBuilder,
  TextInputStyle,
  type ButtonInteraction,
  type ChatInputCommandInteraction,
  type Guild,
  type ModalSubmitInteraction,
  type TextChannel,
} from 'discord.js';
import { ChannelNames, RoleNames } from '../../serverConfig';

const PANEL_ID = 'paradise:ticket:create';
const MODAL_ID = 'paradise:ticket:questions';
const CLOSE_PREFIX = 'paradise:ticket:close:';

function staffRoleIds(guild: Guild) {
  return [RoleNames.owner, RoleNames.administrator, RoleNames.moderator]
    .map((n) => guild.roles.cache.find((r) => r.name === n)?.id)
    .filter((id): id is string => Boolean(id));
}

function safe(n: string) {
  return n.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 18) || 'member';
}

export async function setupTicketPanel(i: ChatInputCommandInteraction) {
  if (!i.guild) return;
  if (!i.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
    await i.reply({ content: '🛡️ You need Manage Server to set up tickets.', ephemeral: true });
    return;
  }
  const c = i.guild.channels.cache.find(
    (c) => c.name === ChannelNames.orderHere && c.type === ChannelType.GuildText,
  ) as TextChannel | undefined;
  if (!c) {
    await i.reply({ content: `❌ I could not find ${ChannelNames.orderHere}.`, ephemeral: true });
    return;
  }
  const e = new EmbedBuilder()
    .setColor(0x00b4d8)
    .setTitle('🎫 PARADISE SUPPORT & BUILD ORDERS')
    .setDescription('Need a custom build, help with an order, verification, or support?\n\nPress **Create Ticket** and Paradise will ask a few quick questions before creating your private ticket.\n\n🌴 Please keep one request per ticket.');
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(PANEL_ID).setLabel('🎫 Create Ticket').setStyle(ButtonStyle.Primary),
  );
  await c.send({ embeds: [e], components: [row] });
  await i.reply({ content: `✅ Ticket panel posted in ${c}.`, ephemeral: true });
}

export async function createTicket(i: ButtonInteraction) {
  if (!i.guild) return;
  const existing = i.guild.channels.cache.find(
    (c) => c.type === ChannelType.GuildText && c.topic === `paradise-ticket:${i.user.id}`,
  );
  if (existing) {
    await i.reply({ content: `🎫 You already have an open ticket: ${existing}`, ephemeral: true });
    return;
  }

  const modal = new ModalBuilder()
    .setCustomId(MODAL_ID)
    .setTitle('🏝️ Paradise Ticket Details');

  const requestType = new TextInputBuilder()
    .setCustomId('request-type')
    .setLabel('What are you contacting us about?')
    .setPlaceholder('Custom build, order, support, verification, etc.')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(100);

  const buildRequest = new TextInputBuilder()
    .setCustomId('build-request')
    .setLabel('What do you want built / help with?')
    .setPlaceholder('Tell us what you want as clearly as possible.')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMaxLength(1000);

  const sizeStyle = new TextInputBuilder()
    .setCustomId('size-style')
    .setLabel('Size, style & references')
    .setPlaceholder('Base size, style, wipe type, links or reference images.')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(false)
    .setMaxLength(1000);

  const budget = new TextInputBuilder()
    .setCustomId('budget')
    .setLabel('Budget / payment details')
    .setPlaceholder('Your budget or anything staff should know about payment.')
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setMaxLength(200);

  const extra = new TextInputBuilder()
    .setCustomId('extra')
    .setLabel('Anything else we should know?')
    .setPlaceholder('Deadline, extra requirements, preferred builder, etc.')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(false)
    .setMaxLength(1000);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(requestType),
    new ActionRowBuilder<TextInputBuilder>().addComponents(buildRequest),
    new ActionRowBuilder<TextInputBuilder>().addComponents(sizeStyle),
    new ActionRowBuilder<TextInputBuilder>().addComponents(budget),
    new ActionRowBuilder<TextInputBuilder>().addComponents(extra),
  );

  await i.showModal(modal);
}

export async function submitTicket(i: ModalSubmitInteraction) {
  if (!i.guild) return;
  await i.deferReply({ ephemeral: true });

  const existing = i.guild.channels.cache.find(
    (c) => c.type === ChannelType.GuildText && c.topic === `paradise-ticket:${i.user.id}`,
  );
  if (existing) {
    await i.editReply({ content: `🎫 You already have an open ticket: ${existing}` });
    return;
  }

  let cat = i.guild.channels.cache.find(
    (c) => c.type === ChannelType.GuildCategory && c.name === '🎫・TICKETS',
  );
  if (!cat) cat = await i.guild.channels.create({ name: '🎫・TICKETS', type: ChannelType.GuildCategory });

  const staff = staffRoleIds(i.guild);
  const ch = await i.guild.channels.create({
    name: `ticket-${safe(i.user.username)}`,
    type: ChannelType.GuildText,
    parent: cat.id,
    topic: `paradise-ticket:${i.user.id}`,
    permissionOverwrites: [
      { id: i.guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
      { id: i.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AttachFiles] },
      ...staff.map((id) => ({ id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageMessages] })),
    ],
  });

  const answers = [
    ['📌 Request', i.fields.getTextInputValue('request-type')],
    ['🏗️ Build / Help Needed', i.fields.getTextInputValue('build-request')],
    ['📐 Size, Style & References', i.fields.getTextInputValue('size-style') || 'Not provided'],
    ['💰 Budget / Payment', i.fields.getTextInputValue('budget') || 'Not provided'],
    ['📝 Extra Details', i.fields.getTextInputValue('extra') || 'Not provided'],
  ];

  const e = new EmbedBuilder()
    .setColor(0x2ec4b6)
    .setTitle('🎫 Paradise Ticket')
    .setDescription(`Welcome <@${i.user.id}>! Staff will be with you shortly.\n\nYour answers are below so the team can understand the request immediately.`)
    .addFields(answers.map(([name, value]) => ({ name, value: String(value).slice(0, 1024) })))
    .setFooter({ text: '🏝️ Mekkers Building Paradise' });

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(`${CLOSE_PREFIX}${ch.id}`).setLabel('🔒 Close Ticket').setStyle(ButtonStyle.Danger),
  );
  await ch.send({ content: `<@${i.user.id}>`, embeds: [e], components: [row] });
  await i.editReply({ content: `🎫 Your ticket is ready: ${ch}` });
}

export async function closeTicket(i: ButtonInteraction, channelId: string) {
  if (!i.guild || i.channelId !== channelId || i.channel?.type !== ChannelType.GuildText) return;
  const ch = i.channel as TextChannel;
  const m = await i.guild.members.fetch(i.user.id);
  if (!m.permissions.has(PermissionFlagsBits.ManageMessages) && !staffRoleIds(i.guild).some((id) => m.roles.cache.has(id))) {
    await i.reply({ content: '🛡️ Only staff can close this ticket.', ephemeral: true });
    return;
  }
  await i.deferReply({ ephemeral: true });

  let before: string | undefined;
  const allMessages: any[] = [];
  while (true) {
    const batch = await ch.messages.fetch({ limit: 100, before });
    if (batch.size === 0) break;
    allMessages.push(...batch.values());
    if (batch.size < 100) break;
    before = batch.last()?.id;
    if (!before) break;
  }
  const all = allMessages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
  const lines = all.map((x) => {
    const content = (x.content || '[no text]').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const at = [...x.attachments.values()].map((a) => `<a href="${a.url}">${a.name || 'attachment'}</a>`).join(' ');
    return `<div class="msg"><span>${new Date(x.createdTimestamp).toISOString()}</span> <b>${x.author.tag}</b>: ${content} ${at}</div>`;
  }).join('\n');

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Paradise Ticket Transcript</title><style>body{font-family:Arial;background:#073b4c;color:#f8f9fa;padding:30px}.box{max-width:1000px;margin:auto;background:#0b5067;padding:24px;border-radius:14px}.msg{padding:8px 0;border-bottom:1px solid #ffffff22}span{color:#90be6d;font-size:12px}a{color:#48cae4}</style></head><body><div class="box"><h1>🏝️ Paradise Ticket Transcript</h1><p><b>Ticket:</b> #${ch.name}</p><p><b>Owner:</b> ${ch.topic?.replace('paradise-ticket:', '') || 'unknown'}</p><p><b>Closed by:</b> ${i.user.tag}</p><p><b>Closed:</b> ${new Date().toISOString()}</p><hr>${lines || '<p>No messages found.</p>'}</div></body></html>`;

  let tc = i.guild.channels.cache.find(
    (c) => c.name === ChannelNames.ticketTranscripts && c.type === ChannelType.GuildText,
  ) as TextChannel | undefined;
  if (!tc) {
    tc = await i.guild.channels.create({
      name: ChannelNames.ticketTranscripts,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        { id: i.guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
        ...staffRoleIds(i.guild).map((id) => ({ id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory] })),
      ],
    });
  }

  await tc.send({
    embeds: [new EmbedBuilder().setColor(0x00b4d8).setTitle('📄 Ticket Transcript').addFields({ name: 'Ticket', value: `#${ch.name}` }, { name: 'Closed by', value: i.user.tag }).setTimestamp()],
    files: [new AttachmentBuilder(Buffer.from(html), { name: `${ch.name}-transcript.html` })],
  });
  await i.editReply({ content: `📄 Transcript saved in ${tc}. Closing ticket...` });
  setTimeout(() => ch.delete('Ticket closed; transcript saved').catch(() => {}), 1500);
}

export const TicketButtonIds = { panel: PANEL_ID, closePrefix: CLOSE_PREFIX, modal: MODAL_ID };
