import { AttachmentBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder, EmbedBuilder, MessageFlags, type ChatInputCommandInteraction, type GuildMember } from 'discord.js';
import { ChannelNames } from '../../serverConfig';
import { findTextChannel } from '../../utils/discordLookup';
import { Colors, SERVER_NAME } from '../../theme';
import { store, save, addPoints, nextId, type BuildRecord } from '../../data/store';
import { cleanLines, short } from '../../utils/text';
import { isStaff } from '../../utils/permissions';
export async function submitBuild(i:ChatInputCommandInteraction){
 if(!i.inCachedGuild()){await i.reply({content:'Use this in the server.',flags:MessageFlags.Ephemeral});return;}
 const title=i.options.getString('title',true), description=cleanLines(i.options.getString('description',true)), category=i.options.getString('category',true);
 const image=i.options.getAttachment('image'); const code=i.options.getString('code')??undefined;
 const ch=findTextChannel(i.guild,ChannelNames.submitABuild); if(!ch){await i.reply({content:`❌ Missing ${ChannelNames.submitABuild}.`,flags:MessageFlags.Ephemeral});return;}
 const id=nextId('build'); const rec:BuildRecord={id,userId:i.user.id,title,description,category,imageUrl:image?.url,code,status:'pending',createdAt:Date.now(),ratings:[]}; store().builds.push(rec); save();
 const embed=new EmbedBuilder().setColor(Colors.oceanBlue).setTitle(`🏛️ ${title}`).setDescription(description).addFields({name:'🏷️ Category',value:category,inline:true},{name:'👤 Builder',value:`${i.user}`,inline:true},{name:'📌 Status',value:'Pending staff review',inline:true}).setFooter({text:`${SERVER_NAME} · ${id}`}).setTimestamp(); if(image)embed.setImage(image.url);
 const row=new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId(`paradise:build:approve:${id}`).setLabel('Approve').setEmoji('✅').setStyle(ButtonStyle.Success),new ButtonBuilder().setCustomId(`paradise:build:reject:${id}`).setLabel('Reject').setEmoji('❌').setStyle(ButtonStyle.Danger));
 const msg=await ch.send({embeds:[embed],components:[row]}); rec.messageId=msg.id; save(); await i.reply({content:`✅ Build submitted for review in ${ch}.`,flags:MessageFlags.Ephemeral});
}
export async function reviewBuild(i:any, action:'approve'|'reject', id:string){
 if(!i.inCachedGuild() || !isStaff(i.member)){await i.reply({content:'🌴 Staff only.',flags:MessageFlags.Ephemeral});return;}
 const rec=store().builds.find(b=>b.id===id); if(!rec){await i.reply({content:'❌ Build not found.',flags:MessageFlags.Ephemeral});return;}
 if(rec.status!=='pending'){await i.reply({content:`ℹ️ This build is already ${rec.status}.`,flags:MessageFlags.Ephemeral});return;}
 rec.status=action==='approve'?'approved':'rejected'; save();
 if(action==='approve'){ addPoints(rec.userId,10); const ch=findTextChannel(i.guild,ChannelNames.buildShowcase); if(ch){ const e=new EmbedBuilder().setColor(Colors.palmGreen).setTitle(`🏛️ ${rec.title}`).setDescription(rec.description).addFields({name:'👤 Builder',value:`<@${rec.userId}>`,inline:true},{name:'🏷️ Category',value:rec.category,inline:true},{name:'⭐ Rating',value:'No ratings yet',inline:true}).setFooter({text:`${SERVER_NAME} · ${rec.id}`}); if(rec.imageUrl)e.setImage(rec.imageUrl); const row=new ActionRowBuilder<ButtonBuilder>().addComponents(...[1,2,3,4,5].map(n=>new ButtonBuilder().setCustomId(`paradise:rate:${rec.id}:${n}`).setLabel(String(n)).setEmoji('⭐').setStyle(ButtonStyle.Secondary))); await ch.send({embeds:[e],components:[row]}); }}
 await i.reply({content:`${action==='approve'?'✅ Approved':'❌ Rejected'} **${short(rec.title,80)}**.`,flags:MessageFlags.Ephemeral});
}
export async function rateBuild(i:any,id:string,rating:number){
 if(!i.inCachedGuild()){await i.reply({content:'Use this in the server.',flags:MessageFlags.Ephemeral});return;}
 const rec=store().builds.find(b=>b.id===id && b.status==='approved'); if(!rec){await i.reply({content:'❌ Build not found.',flags:MessageFlags.Ephemeral});return;}
 // one rating per user per build is tracked in memory by a simple synthetic map on the record.
 const anyRec=rec as any; anyRec.raters=anyRec.raters??{}; if(anyRec.raters[i.user.id]){await i.reply({content:'⭐ You already rated this build.',flags:MessageFlags.Ephemeral});return;} anyRec.raters[i.user.id]=rating; rec.ratings.push(rating); save();
 await i.reply({content:`⭐ You rated **${rating}/5**. Thanks!`,flags:MessageFlags.Ephemeral});
}
