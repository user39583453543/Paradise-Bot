import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
export interface BuildRecord { id:string; messageId?:string; userId:string; title:string; description:string; category:string; imageUrl?:string; code?:string; status:'pending'|'approved'|'rejected'; createdAt:number; ratings:number[]; }
export interface OrderRecord { id:string; userId:string; title:string; details:string; budget?:string; status:'open'|'claimed'|'completed'|'cancelled'; claimedBy?:string; createdAt:number; }
export interface TutorialRecord { id:string; userId:string; title:string; description:string; url?:string; status:'pending'|'approved'|'rejected'; createdAt:number; }
export interface PortfolioRecord { id:string; userId:string; title:string; description:string; url?:string; status:'pending'|'approved'|'rejected'; createdAt:number; }
export interface StoreData { builds:BuildRecord[]; orders:OrderRecord[]; tutorials:TutorialRecord[]; portfolios:PortfolioRecord[]; points:Record<string,number>; }
const file=path.resolve(process.cwd(),'data.json');
const empty=():StoreData=>({builds:[],orders:[],tutorials:[],portfolios:[],points:{}});
let data:StoreData;
try { data=existsSync(file)?JSON.parse(readFileSync(file,'utf8')):empty(); } catch { data=empty(); }
export function store(){ return data; }
export function save(){ try { writeFileSync(file,JSON.stringify(data,null,2)); } catch(e){ console.warn('⚠️ [store] Could not save data:',e); } }
export function addPoints(userId:string, amount:number){ data.points[userId]=(data.points[userId]??0)+amount; save(); }
export function nextId(prefix:string){ return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,7)}`; }
