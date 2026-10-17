export function cleanLines(text:string){ return text.replace(/\\n/g,'\n').trim(); }
export function short(text:string,n=100){ return text.length<=n?text:text.slice(0,n-1)+'…'; }
