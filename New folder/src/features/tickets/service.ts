import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, ModalBuilder, PermissionFlagsBits, TextInputBuilder, TextInputStyle, type ButtonInteraction, type ChatInputCommandInteraction, type Guild, type ModalSubmitInteraction, type TextChannel } from 'discord.js';
import { ChannelNames, RoleNames } from '../../serverConfig';

const PANEL_ID='paradise:ticket:create';
const MODAL_ID='paradise:ticket:questions';
const CLOSE_PREFIX='paradise:ticket:close:';
function staffRoleIds(guild:Guild){return [RoleNames.owner,RoleNames.administrator,RoleNames.moderator].map(n=>guild.roles.cache.find(r=>r.name===n)?.id).filter((id):id is string=>Boolean(id));}
function safe(n:string){return n.toLowerCase().replace(/[^a-z0-9-]/g,'').slice(0,18)||'member';}

export async function setupTicketPanel(i:ChatInputCommandInteraction){
  if(!i.guild)return;
  if(!i.memberPermissions?.has(PermissionFlagsBits.ManageGuild)){await i.reply({content:'🛡️ You need Manage Server to set up tickets.',ephemeral:true});return;}
  const c=i.guild.channels.cache.find(c=>c.name===ChannelNames.orderHere&&c.type===ChannelType.GuildText) as TextChannel|undefined;
  if(!c){await i.reply({content:`❌ I could not find ${ChannelNames.orderHere}.`,ephemeral:true});return;}
  const e=new EmbedBuilder().setColor(0x00b4d8).setTitle('🎫 PARADISE SUPPORT TICKETS').setDescription('Need help with an order, build, verification, or anything else?\n\nPress **Open Ticket** and Paradise will ask a few quick questions before creating your private ticket.\n\n🌴 Please give clear information so staff and builders can help you faster.');
  const row=new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId(PANEL_ID).setLabel('🎫 Open Ticket').setStyle(ButtonStyle.Primary));
  await c.send({embeds:[e],components:[row]});
  await i.reply({content:`✅ Ticket panel posted in ${c}.`,ephemeral:true});
}

export async function showTicketQuestions(i:ButtonInteraction){
  if(!i.guild)return;
  const existing=i.guild.channels.cache.find(c=>c.type===ChannelType.GuildText&&c.topic===`paradise-ticket:${i.user.id}`);
  if(existing){await i.reply({content:`🎫 You already have an open ticket: ${existing}`,ephemeral:true});return;}
  const modal=new ModalBuilder().setCustomId(MODAL_ID).setTitle('🏝️ Paradise Ticket');
  const subject=new TextInputBuilder().setCustomId('subject').setLabel('What are you contacting us about?').setStyle(TextInputStyle.Short).setPlaceholder('Example: Custom base order').setRequired(true).setMaxLength(100);
  const orderType=new TextInputBuilder().setCustomId('orderType').setLabel('What type of order do you want?').setStyle(TextInputStyle.Short).setPlaceholder('Base / compound / code / guide / other').setRequired(true).setMaxLength(100);
  const requirements=new TextInputBuilder().setCustomId('requirements').setLabel('What do you want built?').setStyle(TextInputStyle.Paragraph).setPlaceholder('Describe the build, size, style, server requirements, etc.').setRequired(true).setMaxLength(1000);
  const budget=new TextInputBuilder().setCustomId('budget').setLabel('Budget / payment information').setStyle(TextInputStyle.Short).setPlaceholder('Example: €50-€100').setRequired(false).setMaxLength(100);
  const extra=new TextInputBuilder().setCustomId('extra').setLabel('Anything else we should know?').setStyle(TextInputStyle.Paragraph).setPlaceholder('Deadlines, references, extra requirements, etc.').setRequired(false).setMaxLength(1000);
  modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(subject),new ActionRowBuilder<TextInputBuilder>().addComponents(orderType),new ActionRowBuilder<TextInputBuilder>().addComponents(requirements),new ActionRowBuilder<TextInputBuilder>().addComponents(budget),new ActionRowBuilder<TextInputBuilder>().addComponents(extra));
  await i.showModal(modal);
}

export async function createTicketFromAnswers(i:ModalSubmitInteraction){
  if(!i.guild)return;
  await i.deferReply({ephemeral:true});
  const existing=i.guild.channels.cache.find(c=>c.type===ChannelType.GuildText&&c.topic===`paradise-ticket:${i.user.id}`);
  if(existing){await i.editReply({content:`🎫 You already have an open ticket: ${existing}`});return;}
  let cat=i.guild.channels.cache.find(c=>c.type===ChannelType.GuildCategory&&c.name==='🎫・TICKETS');
  if(!cat)cat=await i.guild.channels.create({name:'🎫・TICKETS',type:ChannelType.GuildCategory});
  const staff=staffRoleIds(i.guild);
  const ch=await i.guild.channels.create({name:`ticket-${safe(i.user.username)}`,type:ChannelType.GuildText,parent:cat.id,topic:`paradise-ticket:${i.user.id}`,permissionOverwrites:[{id:i.guild.roles.everyone.id,deny:[PermissionFlagsBits.ViewChannel]},{id:i.user.id,allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.ReadMessageHistory,PermissionFlagsBits.AttachFiles]},...staff.map(id=>({id,allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.ReadMessageHistory,PermissionFlagsBits.ManageMessages]}))]});
  const subject=i.fields.getTextInputValue('subject');
  const orderType=i.fields.getTextInputValue('orderType');
  const requirements=i.fields.getTextInputValue('requirements');
  const budget=i.fields.getTextInputValue('budget')||'Not provided';
  const extra=i.fields.getTextInputValue('extra')||'None provided';
  const e=new EmbedBuilder().setColor(0x2ec4b6).setTitle('🎫 PARADISE TICKET').setDescription(`Welcome <@${i.user.id}>!\n\nA member of staff will be with you shortly.`).addFields(
    {name:'📌 Request',value:subject},
    {name:'🛒 Order Type',value:orderType},
    {name:'🏗️ Requirements',value:requirements.slice(0,1024)},
    {name:'💳 Budget',value:budget},
    {name:'📝 Extra Information',value:extra.slice(0,1024)},
  ).setFooter({text:'Paradise • Please keep all order information in this ticket'});
  const row=new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId(`${CLOSE_PREFIX}${ch.id}`).setLabel('🔒 Close Ticket').setStyle(ButtonStyle.Danger));
  await ch.send({content:`<@${i.user.id}> <@&${RoleNames.moderator}>`,embeds:[e],components:[row]});
  await i.editReply({content:`🎫 Your ticket is ready: ${ch}`});
}

export async function closeTicket(i:ButtonInteraction,channelId:string){if(!i.guild||i.channelId!==channelId||i.channel?.type!==ChannelType.GuildText)return;const ch=i.channel as TextChannel;const m=await i.guild.members.fetch(i.user.id);if(!m.permissions.has(PermissionFlagsBits.ManageMessages)&&!staffRoleIds(i.guild).some(id=>m.roles.cache.has(id))){await i.reply({content:'🛡️ Only staff can close this ticket.',ephemeral:true});return;}await i.deferReply({ephemeral:true});let before: string | undefined; const allMessages=[] as any[]; while(true){const batch=await ch.messages.fetch({limit:100,before}); if(batch.size===0)break; allMessages.push(...batch.values()); if(batch.size<100)break; before=batch.last()?.id; if(!before)break;} const all=allMessages.sort((a,b)=>a.createdTimestamp-b.createdTimestamp);const lines=all.map(x=>{const content=(x.content||'[no text]').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');const at=[...x.attachments.values()].map(a=>`<a href="${a.url}">${a.name||'attachment'}</a>`).join(' ');return `<div class="msg"><span>${new Date(x.createdTimestamp).toISOString()}</span> <b>${x.author.tag}</b>: ${content} ${at}</div>`;}).join('\n');const html=`<!doctype html><html><head><meta charset="utf-8"><title>Paradise Ticket Transcript</title><style>body{font-family:Arial;background:#073b4c;color:#f8f9fa;padding:30px}.box{max-width:1000px;margin:auto;background:#0b5067;padding:24px;border-radius:14px}.msg{padding:8px 0;border-bottom:1px solid #ffffff22}span{color:#90be6d;font-size:12px}a{color:#48cae4}</style></head><body><div class="box"><h1>🏝️ Paradise Ticket Transcript</h1><p><b>Ticket:</b> #${ch.name}</p><p><b>Owner:</b> ${ch.topic?.replace('paradise-ticket:','')||'unknown'}</p><p><b>Closed by:</b> ${i.user.tag}</p><p><b>Closed:</b> ${new Date().toISOString()}</p><hr>${lines||'<p>No messages found.</p>'}</div></body></html>`;let tc=i.guild.channels.cache.find(c=>c.name===ChannelNames.ticketTranscripts&&c.type===ChannelType.GuildText) as TextChannel|undefined;if(!tc)tc=await i.guild.channels.create({name:ChannelNames.ticketTranscripts,type:ChannelType.GuildText,permissionOverwrites:[{id:i.guild.roles.everyone.id,deny:[PermissionFlagsBits.ViewChannel]},...staffRoleIds(i.guild).map(id=>({id,allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.ReadMessageHistory]}))]});await tc.send({embeds:[new EmbedBuilder().setColor(0x00b4d8).setTitle('📄 Ticket Transcript').addFields({name:'Ticket',value:`#${ch.name}`},{name:'Closed by',value:i.user.tag}).setTimestamp()],files:[new AttachmentBuilder(Buffer.from(html),{name:`${ch.name}-transcript.html`})]});await i.editReply({content:`📄 Transcript saved in ${tc}. Closing ticket...`});setTimeout(()=>ch.delete('Ticket closed; transcript saved').catch(()=>{}),1500);}
export const TicketButtonIds={panel:PANEL_ID,closePrefix:CLOSE_PREFIX,modal:MODAL_ID};
