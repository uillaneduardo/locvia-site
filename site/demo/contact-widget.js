/* Contato rápido: configuração pública, sem endpoint e sem inventar canais. */
(()=>{
"use strict";
const $=id=>document.getElementById(id),fab=$("contact-fab"),panel=$("contact-panel"),close=$("contact-close"),list=$("contact-channels");
if(!fab||!panel||!list)return;
const cfg=window.LocviaContactConfig||{};
const clean=s=>String(s||"").trim();
function escapeHTML(s){return clean(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
const tel=clean(cfg.phone).replace(/[^\d+]/g,"");
const wp=clean(cfg.whatsapp).replace(/\D/g,"");
const telegram=clean(cfg.telegram).replace(/^@/,"");
const telegramUrl=/^[a-z0-9_]{5,32}$/i.test(telegram)?"https://t.me/"+telegram:
 /^https:\/\/t\.me\/[a-z0-9_]{5,32}\/?$/i.test(telegram)?telegram:"";
const email=clean(cfg.email),mailValid=/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
const actions=[
 {key:"whatsapp",name:"WhatsApp",value:wp?"+ "+wp:"Aguardando configuração",href:wp.length>=10&&wp.length<=15?"https://wa.me/"+wp:null,icon:"◉"},
 {key:"telegram",name:"Telegram",value:telegramUrl?"Abrir conversa":"Aguardando configuração",href:telegramUrl||null,icon:"➤"},
 {key:"email",name:"E-mail",value:mailValid?email:"Aguardando configuração",href:mailValid?"mailto:"+email+"?subject="+encodeURIComponent(clean(cfg.subject)||"Dúvida sobre o Locvia"):null,icon:"✉"},
 {key:"phone",name:"Telefone",value:tel||"Aguardando configuração",href:/^\+?\d{10,15}$/.test(tel)?"tel:"+tel:null,icon:"☎"}
];
list.innerHTML=actions.map(a=>(a.href?'<a class="channel-link channel-'+a.key+'" href="'+escapeHTML(a.href)+'"'+(a.href.startsWith("http")?' target="_blank" rel="noopener noreferrer"':'')+'><span class="channel-icon" aria-hidden="true">'+a.icon+'</span><span><strong>'+a.name+'</strong><small>'+escapeHTML(a.value)+'</small></span><span aria-hidden="true">↗</span></a>':
 '<div class="channel-link channel-disabled channel-'+a.key+'" aria-disabled="true"><span class="channel-icon" aria-hidden="true">'+a.icon+'</span><span><strong>'+a.name+'</strong><small>Não configurado</small></span></div>')).join("");
function setOpen(open){panel.hidden=!open;fab.setAttribute("aria-expanded",String(open));fab.setAttribute("aria-label",open?"Fechar contatos rápidos":"Abrir contatos rápidos");}
fab.addEventListener("click",()=>setOpen(panel.hidden));
close?.addEventListener("click",()=>{setOpen(false);fab.focus();});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!panel.hidden){setOpen(false);fab.focus();}});
document.addEventListener("click",e=>{if(!panel.hidden&&!e.target.closest("#contact-widget"))setOpen(false);});
})();