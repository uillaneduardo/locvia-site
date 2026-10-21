/* Locvia: protótipo de apoio ao aluguel de itens.
   Dados fictícios em memória. Não existe backend, cobrança ou reserva compartilhada. */
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const screen = $("screen");
  const modal = $("modal");
  const toast = $("toast");
  const sectorSelect = $("sector");
  const menuToggle = $("menu-toggle");
  const overlay = $("overlay");
  const titles = { hoje: "Hoje", alugueis: "Aluguéis", itens: "Meus itens", clientes: "Clientes" };
  const icons = {
    festas: "🎉", livros: "📚", equipamentos: "🧰", veiculos: "🚗"
  };
  let toastTimer;
  let returnFocus;
  const iso = (d) => [d.getFullYear(), String(d.getMonth()+1).padStart(2,"0"), String(d.getDate()).padStart(2,"0")].join("-");
  const today = iso(new Date());
  function offset(days) {
    const date = new Date(today + "T12:00:00");
    date.setDate(date.getDate() + days);
    return iso(date);
  }
  function plusDay(ymd) {
    const date = new Date(ymd + "T12:00:00");
    date.setDate(date.getDate() + 1);
    return iso(date);
  }
  const safe = (value) => String(value ?? "").replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const icon = (name) => '<svg class="ico" aria-hidden="true"><use href="#i-'+name+'"></use></svg>';
  const money = (n) => Number(n).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
  const shortDate = (s) => new Intl.DateTimeFormat("pt-BR",{day:"2-digit",month:"short"}).format(new Date(s+"T12:00:00")).replace(".","");
  const longDate = (s) => new Intl.DateTimeFormat("pt-BR",{day:"2-digit",month:"long",year:"numeric"}).format(new Date(s+"T12:00:00"));
  const initials = (s) => s.split(/\s+/).slice(0,2).map(x=>x[0]).join("").toUpperCase();

  const fixtures = {
    festas: {
      name:"Festa Aurora", initials:"FA", display:"Festas e decoração", description:"Mesas, painéis e peças para eventos.",
      items:[
        ["f1","Painel redondo areia","Decoração",1,85,"🟤"],
        ["f2","Kit de cilindros brancos","Decoração",3,65,"⚪"],
        ["f3","Cadeira Tiffany","Mobiliário",30,14,"🪑"],
        ["f4","Mesa bistrô","Mobiliário",4,48,"🪑"],
        ["f5","Arco metálico","Decoração",1,110,"✨"],
        ["f6","Bandeja para doces","Utensílios",15,12,"🍰"]
      ],
      clients:["Mariana Costa","Juliana Oliveira","Ateliê Florescer","Lucas Almeida","Ana Paula Lima"],
      rentals:[
        ["A-101",0,-3,-1,"out",[[0,1]]],
        ["A-102",1,1,3,"reserved",[[1,2],[5,5]]],
        ["A-103",2,0,2,"ready",[[2,20]]],
        ["A-104",3,3,5,"reserved",[[3,2]]],
        ["A-105",4,-1,2,"out",[[4,1]]],
        ["A-106",2,6,7,"reserved",[[2,8]]]
      ]
    },
    livros: {
      name:"Clube da Estante", initials:"CE", display:"Livros", description:"Exemplares para empréstimo e aluguel.",
      items:[
        ["l1","O Pequeno Príncipe","Literatura",2,8,"📖"],
        ["l2","Dom Casmurro","Literatura",1,9,"📕"],
        ["l3","Coleção de HQs","Quadrinhos",4,15,"📚"],
        ["l4","Livro de fotografia","Arte",1,18,"📷"],
        ["l5","Atlas ilustrado","Referência",3,10,"🌍"]
      ],
      clients:["Clara Matos","Rafael Dantas","Bianca Lima","Arthur Vieira"],
      rentals:[
        ["L-201",0,-5,-2,"out",[[0,1]]],
        ["L-202",1,1,8,"reserved",[[1,1]]],
        ["L-203",2,0,6,"ready",[[2,2]]],
        ["L-204",3,-1,3,"out",[[3,1]]]
      ]
    },
    equipamentos: {
      name:"Ponto Equipamentos", initials:"PE", display:"Equipamentos", description:"Ferramentas e equipamentos de trabalho.",
      items:[
        ["e1","Furadeira de impacto","Ferramentas",2,45,"🛠️"],
        ["e2","Lavadora de alta pressão","Limpeza",1,90,"💧"],
        ["e3","Projetor multimídia","Audiovisual",2,120,"📽️"],
        ["e4","Escada extensível","Ferramentas",3,38,"🪜"],
        ["e5","Caixa de som","Audiovisual",4,70,"🔊"]
      ],
      clients:["Daniel Rocha","Patrícia Alves","Construtora Vale","Oficina Horizonte"],
      rentals:[
        ["E-301",0,-4,-1,"out",[[0,1]]],
        ["E-302",1,1,3,"reserved",[[1,1]]],
        ["E-303",2,0,2,"ready",[[2,1]]],
        ["E-304",3,-1,3,"out",[[4,2]]]
      ]
    },
    veiculos: {
      name:"Rota Livre", initials:"RL", display:"Veículos", description:"Veículos e bicicletas por período.",
      items:[
        ["v1","Bicicleta elétrica","Bicicletas",2,75,"🚲"],
        ["v2","Van de carga","Utilitários",1,290,"🚐"],
        ["v3","Moto urbana","Motos",1,120,"🏍️"],
        ["v4","Carro compacto","Carros",2,170,"🚗"]
      ],
      clients:["Bruno Silva","Helena Martins","Entrega Boa","Carolina Souza"],
      rentals:[
        ["V-401",0,-3,-1,"out",[[0,1]]],
        ["V-402",1,1,3,"reserved",[[1,1]]],
        ["V-403",2,0,2,"ready",[[2,1]]],
        ["V-404",3,-1,2,"out",[[3,1]]]
      ]
    }
  };

  function loadFixture(segment) {
    const fixture = fixtures[segment];
    const items = fixture.items.map(([id,name,category,stock,price,emoji])=>({id,name,category,stock,price,emoji}));
    const clients = fixture.clients.map((name,i)=>({id:segment[0]+"c"+i,name}));
    const rentals = fixture.rentals.map(([id,ci,from,to,status,lines])=>({
      id,clientId:clients[ci].id,from:offset(from),to:offset(to),status,
      items:lines.map(([pi,qty])=>({id:items[pi].id,qty,price:items[pi].price}))
    }));
    return {items,clients,rentals,nextId:1000};
  }
  const databases = Object.fromEntries(Object.keys(fixtures).map(k=>[k,loadFixture(k)]));
  const state = {
    segment:"festas",view:titles[location.hash.slice(1)]?location.hash.slice(1):"hoje",
    filter:"todos",search:"",stockFrom:today,stockTo:offset(2),
    draft:null,dialog:null
  };
  const db = () => databases[state.segment];
  const config = () => fixtures[state.segment];
  const customer = id => db().clients.find(c=>c.id===id);
  const product = id => db().items.find(p=>p.id===id);
  const total = rental => rental.items.reduce((s,l)=>s+l.qty*l.price,0);
  const exists = (r) => r.status!=="returned" && r.status!=="cancelled";
  const isLate = r => r.status==="out" && r.to<today;
  const rentedEnd = r => r.status==="out" ? "9999-12-31" : r.to;
  function overlaps(a,b,c,d) { return a<=d && c<=b; }
  function peakOccupied(productId,from,to,excludeId) {
    if (!from || !to || from>to) return 0;
    const events=[];
    db().rentals.forEach(r=>{
      if(!exists(r) || r.id===excludeId || !overlaps(from,to,r.from,rentedEnd(r)))return;
      const qty=r.items.filter(line=>line.id===productId).reduce((s,line)=>s+line.qty,0);
      if(!qty)return;
      const start=r.from>from?r.from:from;
      const end=rentedEnd(r)<to?rentedEnd(r):to;
      events.push([start,qty]);events.push([plusDay(end),-qty]);
    });
    events.sort((a,b)=>a[0].localeCompare(b[0]));
    let n=0,max=0;
    for(let i=0;i<events.length;){
      const day=events[i][0];
      while(i<events.length && events[i][0]===day){n+=events[i][1];i++;}
      if(n>max)max=n;
    }
    return max;
  }
  const availability=(itemId,from,to) => {
    const p=product(itemId);
    if(!p || from>to)return 0;
    return Math.max(0,p.stock-peakOccupied(itemId,from,to));
  };
  function holders(itemId,from,to) {
    return db().rentals.filter(r=>exists(r) && r.items.some(l=>l.id===itemId) &&
      overlaps(from,to,r.from,rentedEnd(r)));
  }
  function statusName(r){
    if (isLate(r)) return "Devolução atrasada";
    return {reserved:"Reservado",ready:"Separado",out:"Com cliente",returned:"Devolvido",cancelled:"Cancelado"}[r.status]||r.status;
  }
  function statusBadge(r) {
    const cls=isLate(r)?"late":r.status;
    return '<span class="badge '+safe(cls)+'">'+safe(statusName(r))+'</span>';
  }
  const searchMatch = s=>!state.search || s.toLocaleLowerCase("pt-BR").includes(state.search.toLocaleLowerCase("pt-BR"));
  function heading(kicker,title,subtitle,button) {
    return '<div class="section-head"><div><div class="kicker">'+safe(kicker)+'</div><h1>'+safe(title)+'</h1><p>'+safe(subtitle)+'</p></div>'+(button||"")+'</div>';
  }
  const createBtn=()=>'<button type="button" class="primary-btn" data-action="new">'+icon("plus")+' Novo aluguel</button>';
  function infoBanner() {
    return '<div class="tip-banner">'+icon("info")+'<span><strong>Ambiente de demonstração.</strong> Explore à vontade: os registros são fictícios e as alterações só existem nesta aba. <button class="link-like" type="button" data-action="reset">Restaurar exemplo</button></span></div>';
  }
  function stat(label,value,sub,iconName,kind="") {
    return '<div class="stat '+kind+'"><div class="stat-head"><span>'+safe(label)+'</span>'+icon(iconName)+'</div><strong>'+safe(value)+'</strong><small>'+safe(sub)+'</small></div>';
  }
  function actionFor(r) {
    if(r.status==="reserved")return {label:"Marcar separado",next:"ready",icon:"box"};
    if(r.status==="ready")return {label:"Registrar retirada",next:"out",icon:"truck"};
    if(r.status==="out")return {label:"Registrar devolução",next:"returned",icon:"check"};
    return null;
  }
  function attention() {
    const tasks=[];
    db().rentals.forEach(r=>{
      const who=customer(r.clientId)?.name||"Cliente";
      const itemNames=r.items.map(l=>product(l.id)?.name||"Item").join(", ");
      if(isLate(r)) tasks.push({r,priority:0,title:"Devolução atrasada",desc:who+" · "+itemNames+" · era para "+shortDate(r.to),className:"red",iconName:"alert"});
      else if(r.status==="reserved" && r.from<=offset(1) && r.from>=today)
        tasks.push({r,priority:1,title:"Separar para "+(r.from===today?"hoje":"amanhã"),desc:who+" · "+itemNames,className:"amber",iconName:"box"});
      else if(r.status==="ready" && r.from<=offset(1))
        tasks.push({r,priority:2,title:"Pronto para retirada",desc:who+" · "+itemNames,className:"indigo",iconName:"truck"});
      else if(r.status==="out" && r.to<=offset(1))
        tasks.push({r,priority:3,title:"Devolução próxima",desc:who+" · prevista para "+shortDate(r.to),className:"blue",iconName:"clock"});
    });
    return tasks.sort((a,b)=>a.priority-b.priority || a.r.from.localeCompare(b.r.from));
  }
  function todayView() {
    const late=db().rentals.filter(isLate).length;
    const preparing=db().rentals.filter(r=>r.status==="reserved" && r.from<=offset(1) && r.from>=today).length;
    const withCustomer=db().rentals.filter(r=>r.status==="out").length;
    const availableNow=db().items.reduce((s,p)=>s+availability(p.id,today,today),0);
    const tasks=attention();
    const tasksHtml=tasks.map(t=>{
      const action=actionFor(t.r);
      return '<div class="task"><div class="task-icon '+t.className+'">'+icon(t.iconName)+'</div><div class="task-body"><strong>'+safe(t.title)+'</strong><p>'+safe(t.desc)+'</p><small>'+safe(t.r.id)+'</small></div>'+
        (action?'<button class="task-action" type="button" data-action="change" data-id="'+safe(t.r.id)+'" data-next="'+action.next+'">'+safe(action.label)+'</button>':'')+'</div>';
    }).join("") || '<div class="placeholder"><strong>Por enquanto, tudo em dia.</strong>Quando aparecer uma retirada, separação ou devolução, ela ficará aqui.</div>';
    const upcoming=db().rentals.filter(r=>exists(r)&&r.from>=today).sort((a,b)=>a.from.localeCompare(b.from)).slice(0,6);
    const upcomingHtml=upcoming.map(r=>{
      const d=new Date(r.from+"T12:00:00");
      return '<div class="movement"><div class="date-tile"><strong>'+d.getDate()+'</strong><small>'+safe(d.toLocaleDateString("pt-BR",{month:"short"}).replace(".",""))+'</small></div>'+
        '<div class="movement-body"><strong>'+safe(customer(r.clientId)?.name||"Cliente")+'</strong><small>'+safe(r.items.map(l=>product(l.id)?.name||"Item").join(", "))+'</small></div>'+
        '<button type="button" class="text-btn" data-rental="'+safe(r.id)+'">Ver</button></div>';
    }).join("") || '<div class="placeholder">Nenhum aluguel futuro registrado.</div>';
    return heading("Seu dia em ordem","O que precisa da sua atenção","Veja quem está com seus itens, o que separar e as próximas devoluções.",createBtn()) +
      infoBanner() +
      '<section class="stats" aria-label="Resumo do dia">' +
        stat("Precisam ser separados",String(preparing),"Para hoje e amanhã","box",preparing?"amber":"") +
        stat("Com clientes",String(withCustomer),"Itens entregues","truck") +
        stat("Devoluções atrasadas",String(late),"Precisam de contato","alert",late?"red":"") +
        stat("Itens livres agora",String(availableNow),"Unidades, considerando os aluguéis","check","indigo") +
      '</section><div class="main-grid">' +
        '<section class="panel"><div class="panel-head"><div><h2>Para não esquecer</h2><p>Ações que você pode resolver agora</p></div><span class="badge '+(tasks.length?"ready":"returned")+'">'+tasks.length+' '+(tasks.length===1?"pendência":"pendências")+'</span></div><div class="task-list">'+tasksHtml+'</div></section>' +
        '<section class="panel"><div class="panel-head"><div><h2>Próximos aluguéis</h2><p>Quem vem buscar e quando</p></div><button class="text-btn" type="button" data-view="alugueis">Ver todos →</button></div><div class="movement-list">'+upcomingHtml+'</div></section>' +
      '</div><p class="info-after">O Locvia é um apoio à rotina: as informações do exemplo mudam quando você registra uma retirada ou devolução.</p>';
  }
  function rentalsView() {
    const filters=[["todos","Todos"],["reserved","Para separar"],["ready","Separados"],["out","Com clientes"],["late","Atrasados"],["returned","Devolvidos"]];
    const buttons=filters.map(([id,label])=>'<button type="button" class="chip '+(state.filter===id?"active":"")+'" data-filter="'+id+'">'+label+'</button>').join("");
    const rentals=db().rentals.filter(r=>{
      if(state.filter==="late" && !isLate(r))return false;
      if(!["todos","late"].includes(state.filter) && state.filter!==r.status)return false;
      return searchMatch([r.id,customer(r.clientId)?.name,r.items.map(l=>product(l.id)?.name).join(" "),statusName(r)].join(" "));
    }).sort((a,b)=> (a.status==="returned")-(b.status==="returned") || a.from.localeCompare(b.from));
    const rows=rentals.map(r=>{
      const who=customer(r.clientId);
      return '<tr class="row-click" tabindex="0" role="button" data-rental="'+safe(r.id)+'" aria-label="Abrir aluguel '+safe(r.id)+'"><td><strong class="id-code">'+safe(r.id)+'</strong><small>'+r.items.length+' '+(r.items.length===1?"tipo de item":"tipos de itens")+'</small></td>'+
        '<td><div class="person-cell"><span class="round-initials">'+safe(initials(who?.name||""))+'</span><span><strong>'+safe(who?.name||"Cliente")+'</strong></span></div></td>' +
        '<td>'+shortDate(r.from)+' – '+shortDate(r.to)+'</td><td>'+statusBadge(r)+'</td><td class="align-end"><strong>'+money(total(r))+'</strong></td></tr>';
    }).join("") || '<tr><td colspan="5"><div class="placeholder"><strong>Nenhum aluguel encontrado.</strong>Tente outra busca ou filtro.</div></td></tr>';
    return heading("Tudo registrado","Seus aluguéis","Consulte rapidamente o que foi reservado, entregue ou devolvido.",createBtn()) +
      infoBanner()+'<div class="filters">'+buttons+'<label class="field-search">'+icon("search")+'<input id="list-search" type="search" value="'+safe(state.search)+'" placeholder="Buscar cliente ou item" aria-label="Buscar aluguéis"></label></div>' +
      '<section class="panel"><div class="panel-head"><div><h2>Aluguéis cadastrados</h2><p>'+rentals.length+' registros neste exemplo</p></div></div>'+
      '<div class="table-wrap"><table class="data-table"><thead><tr><th>Número</th><th>Cliente</th><th>Período</th><th>Situação</th><th class="align-end">Valor</th></tr></thead><tbody>'+rows+'</tbody></table></div></section>';
  }
  function itemsView() {
    const valid=state.stockFrom<=state.stockTo && state.stockFrom && state.stockTo;
    const filtered=db().items.filter(p=>searchMatch(p.name+" "+p.category));
    const cards=filtered.map(p=>{
      const free=valid?availability(p.id,state.stockFrom,state.stockTo):0;
      const share=valid?holders(p.id,state.stockFrom,state.stockTo):[];
      const notes=share.map(r=>{
        const c=customer(r.clientId);
        if(r.status==="out")return 'Com '+c.name+(isLate(r)?' · devolução atrasada':' · devolução em '+shortDate(r.to));
        return 'Reservado para '+c.name+' · '+shortDate(r.from);
      });
      return '<article class="item-card"><div class="item-card-top"><div class="item-emoji" aria-hidden="true">'+safe(p.emoji)+'</div><span class="item-code">'+safe(p.id.toUpperCase())+'</span></div>'+
        '<div class="item-card-body"><span class="item-type">'+safe(p.category)+'</span><h3>'+safe(p.name)+'</h3><div class="availability-line"><span>Disponíveis no período</span><strong class="'+(free===0?"none":"")+'">'+free+' de '+p.stock+'</strong></div>'+
        '<div class="meter" role="img" aria-label="'+free+' disponíveis de '+p.stock+'"><span style="width:'+(p.stock?Math.round(free/p.stock*100):0)+'%"></span></div>'+
        '<div class="with-whom">'+icon("info")+'<span>'+safe(notes.length?notes.slice(0,2).join(" / "):"Sem aluguéis nesse período.")+'</span></div>'+
        '<div class="card-footer"><span>Valor por aluguel*</span><strong>'+money(p.price)+'</strong></div></div></article>';
    }).join("")||'<div class="panel"><div class="placeholder"><strong>Nenhum item encontrado.</strong>Experimente outro termo.</div></div>';
    return heading("O que você tem","Meus itens","Confira quantas unidades estão livres e com quem estão as outras.",createBtn()) +
      infoBanner()+
      '<div class="date-filter"><strong>Ver disponibilidade</strong><label>De <input id="stock-from" type="date" value="'+safe(state.stockFrom)+'"></label><label>Até <input id="stock-to" type="date" value="'+safe(state.stockTo)+'"></label><span class="date-help">Escolha o período antes de prometer um item.</span></div>'+
      (!valid?'<div class="warn-inline red" style="margin-bottom:18px">'+icon("alert")+'A data final não pode vir antes da inicial.</div>':"")+
      '<div class="filters"><label class="field-search" style="margin-left:0">'+icon("search")+'<input id="list-search" value="'+safe(state.search)+'" type="search" placeholder="Buscar item" aria-label="Buscar itens"></label></div><div class="item-grid">'+cards+'</div>'+
      '<p class="info-after">*Valores apenas ilustrativos. Em um sistema real, cada empresa poderá definir seus preços e regras.</p>';
  }
  function clientsView() {
    const filtered=db().clients.filter(c=>searchMatch(c.name));
    const rows=filtered.map(c=>{
      const rentals=db().rentals.filter(r=>r.clientId===c.id);
      const out=rentals.filter(r=>r.status==="out").length;
      return '<tr class="row-click" role="button" tabindex="0" data-customer="'+safe(c.id)+'" aria-label="Ver '+safe(c.name)+'"><td><div class="person-cell"><span class="round-initials">'+safe(initials(c.name))+'</span><strong>'+safe(c.name)+'</strong></div></td><td>'+rentals.length+' '+(rentals.length===1?"aluguel":"aluguéis")+'</td><td>'+(out?'<span class="badge out">'+out+' com cliente</span>':'<span class="badge returned">Nada em aberto</span>')+'</td><td class="align-end"><button type="button" class="text-btn" data-customer="'+safe(c.id)+'">Ver detalhes →</button></td></tr>';
    }).join("")||'<tr><td colspan="4"><div class="placeholder">Nenhum cliente encontrado.</div></td></tr>';
    return heading("Quem aluga com você","Clientes","Veja de forma simples quem tem itens e os aluguéis de cada pessoa.") +
      infoBanner()+'<div class="filters"><label class="field-search" style="margin-left:0">'+icon("search")+'<input id="list-search" type="search" value="'+safe(state.search)+'" placeholder="Buscar cliente" aria-label="Buscar clientes"></label></div>'+
      '<section class="panel"><div class="panel-head"><div><h2>Seus clientes</h2><p>'+filtered.length+' contatos de demonstração</p></div></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Cliente</th><th>Histórico</th><th>Situação</th><th class="align-end">Detalhes</th></tr></thead><tbody>'+rows+'</tbody></table></div></section>';
  }
  function render() {
    const views={hoje:todayView,alugueis:rentalsView,itens:itemsView,clientes:clientsView};
    screen.innerHTML=views[state.view]();
    $("crumb").textContent=titles[state.view];
    $("workspace-name").textContent=config().name;
    $("workspace-symbol").textContent=config().initials;
    sectorSelect.value=state.segment;
    document.querySelectorAll(".nav-link").forEach(el=>{
      const active=el.dataset.view===state.view;
      el.classList.toggle("active",active);
      if(active)el.setAttribute("aria-current","page");else el.removeAttribute("aria-current");
    });
  }
  function closeMenu() {
    document.body.classList.remove("nav-open");
    menuToggle.setAttribute("aria-expanded","false");
    overlay.hidden=true;
  }
  function go(view) {
    if(!titles[view])return;
    state.view=view;state.filter="todos";state.search="";
    closeMenu();
    if(location.hash!=="#"+view)location.hash="#"+view;
    render();
    window.scrollTo(0,0);
  }
  function notify(message){
    toast.textContent=message;toast.hidden=false;
    clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.hidden=true,4200);
  }
  function openDialog(type,id){
    returnFocus=document.activeElement;
    state.dialog={type,id};
    modal.hidden=false;document.body.style.overflow="hidden";
    renderDialog();
    const control=modal.querySelector("select,button,input");
    if(control)control.focus();
  }
  function closeDialog(){
    modal.hidden=true;modal.innerHTML="";state.dialog=null;document.body.style.overflow="";
    if(returnFocus && returnFocus.isConnected)returnFocus.focus();
  }
  function dialogHeader(kicker,title){
    return '<header class="dialog-head"><div><small>'+safe(kicker)+'</small><h2 id="dialog-title">'+safe(title)+'</h2></div><button class="icon-btn" type="button" data-action="close" aria-label="Fechar">'+icon("close")+'</button></header>';
  }
  const dialogFoot=(buttons)=>'<footer class="dialog-foot">'+buttons+'</footer>';
  function startNew() {
    state.draft={clientId:db().clients[0].id,from:offset(1),to:offset(2),items:[]};
    openDialog("new");
  }
  function draftErrors(){
    const d=state.draft;const errs=[];
    if(!d || !d.from || !d.to || d.from<today || d.to<d.from)errs.push("Escolha um período válido a partir de hoje.");
    if(!d || !customer(d.clientId))errs.push("Escolha um cliente.");
    if(!d || !d.items.length)errs.push("Inclua pelo menos um item.");
    if(d && d.from && d.to && d.from<=d.to){
      d.items.forEach(l=>{
        const p=product(l.id);
        if(!p || l.qty>availability(l.id,d.from,d.to))errs.push((p?.name||"Item")+" não está disponível nessa quantidade para todo o período.");
      });
    }
    return errs;
  }
  function conflictMessage(itemId,from,to){
    const list=holders(itemId,from,to);
    if(!list.length)return "Nenhum aluguel no período escolhido.";
    return list.map(r=>{
      const name=customer(r.clientId)?.name||"Cliente";
      if(r.status==="out")return name+" ainda está com este item"+(isLate(r)?" (devolução atrasada).":".");
      return name+" reservou esse item para "+shortDate(r.from)+" a "+shortDate(r.to)+".";
    }).join(" ");
  }
  function newDialog(){
    const d=state.draft;
    const clients=db().clients.map(c=>'<option value="'+safe(c.id)+'"'+(c.id===d.clientId?" selected":"")+'>'+safe(c.name)+'</option>').join("");
    const options=db().items.map(p=>'<option value="'+safe(p.id)+'">'+safe(p.name)+'</option>').join("");
    const lines=d.items.map(l=>{
      const p=product(l.id),free=availability(l.id,d.from,d.to);
      return '<div class="cart-row"><div class="cart-main"><strong>'+safe(p.name)+'</strong><small>'+money(p.price)+' por unidade '+(l.qty>free?' · '+free+' disponível(is) no período':"")+'</small></div><span class="qty">'+l.qty+' un.</span><button type="button" data-action="remove-line" data-item="'+safe(l.id)+'">Remover</button></div>';
    }).join("")||'<div class="cart-empty">Nenhum item incluído ainda.</div>';
    const amount=d.items.reduce((s,l)=>s+product(l.id).price*l.qty,0);
    const errs=draftErrors();
    const validDate=d.from && d.to && d.from>=today && d.to>=d.from;
    return dialogHeader("REGISTRAR ALUGUEL","Um aluguel, sem complicação")+
      '<div class="dialog-body"><div class="form-grid"><label class="form-field wide">Quem vai alugar?<select id="draft-client">'+clients+'</select></label>' +
      '<label class="form-field">Retirada<input id="draft-from" type="date" min="'+today+'" value="'+safe(d.from)+'"></label>' +
      '<label class="form-field">Devolução prevista<input id="draft-to" type="date" min="'+safe(d.from)+'" value="'+safe(d.to)+'"></label></div>' +
      '<div class="form-section">Quais itens?</div><div class="add-line"><label class="form-field">Item<select id="draft-item">'+options+'</select></label>' +
      '<label class="form-field">Qtd.<input type="number" min="1" value="1" id="draft-qty"></label>' +
      '<button type="button" class="outline-btn" data-action="add-line">'+icon("plus")+' Incluir</button></div>'+
      '<div id="availability-message" class="info-after" aria-live="polite"></div><div class="cart-list">'+lines+'</div><div class="calc"><span>Total de referência</span><strong>'+money(amount)+'</strong></div>' +
      (errs.some(e=>!e.includes("Inclua pelo menos"))?'<div class="warn-inline red">'+icon("alert")+'<span>'+safe(errs.filter(e=>!e.includes("Inclua pelo menos")).join(" "))+'</span></div>':"")+
      '<p class="info-after">Os itens ficam reservados para o período inteiro. Um item que ainda está com o cliente continua ocupado até você registrar a devolução.</p></div>' +
      dialogFoot('<button type="button" class="outline-btn" data-action="close">Cancelar</button><button id="confirm-rent" type="button" class="primary-btn" data-action="confirm"'+(errs.length?" disabled":"")+'>'+icon("check")+' Confirmar aluguel</button>');
  }
  function refreshAvailability(){
    if(!state.dialog || state.dialog.type!=="new")return;
    const p=product($("draft-item")?.value);
    const qty=Number($("draft-qty")?.value)||0;
    const box=$("availability-message");
    if(!p || !box)return;
    const d=state.draft;
    if(!d.from || !d.to || d.from<today || d.to<d.from){
      box.innerHTML='<div class="warn-inline red">'+icon("alert")+'Corrija as datas para consultar a disponibilidade.</div>';return;
    }
    const already=d.items.find(x=>x.id===p.id)?.qty||0;
    const free=Math.max(0,availability(p.id,d.from,d.to)-already);
    const message=free===0?"Nenhuma unidade livre. "+conflictMessage(p.id,d.from,d.to):
      free+" "+(free===1?"unidade livre":"unidades livres")+" para essas datas." +
      (qty>free?" A quantidade informada é maior que a disponível.":"");
    box.innerHTML='<div class="warn-inline '+(free===0||qty>free?"red":"")+'">'+icon(free===0||qty>free?"alert":"shield")+'<span>'+safe(message)+'</span></div>';
  }
  function rentalDialog(id){
    const r=db().rentals.find(x=>x.id===id);if(!r)return dialogHeader("NÃO ENCONTRADO","Aluguel não encontrado");
    const c=customer(r.clientId);
    const lines=r.items.map(l=>'<tr><td>'+safe(product(l.id)?.name||"Item")+'</td><td>'+l.qty+' un.</td><td>'+money(l.price*l.qty)+'</td></tr>').join("");
    const action=actionFor(r);
    const actionHtml=action?'<button type="button" class="primary-btn" data-action="change" data-id="'+safe(r.id)+'" data-next="'+action.next+'">'+icon(action.iconName)+' '+safe(action.label)+'</button>':"";
    const cancel=r.status==="reserved"||r.status==="ready"?'<button type="button" class="outline-btn" data-action="cancel" data-id="'+safe(r.id)+'">Cancelar aluguel</button>':"";
    return dialogHeader("ALUGUEL "+safe(r.id),"Detalhes do aluguel")+
      '<div class="dialog-body"><div style="margin-bottom:20px">'+statusBadge(r)+'</div>'+
      '<div class="detail-info"><div><label>Cliente</label><strong>'+safe(c?.name||"Cliente")+'</strong></div><div><label>Situação</label><strong>'+safe(statusName(r))+'</strong></div>' +
      '<div><label>Retirada</label><strong>'+longDate(r.from)+'</strong></div><div><label>Devolução prevista</label><strong>'+longDate(r.to)+'</strong></div></div>'+
      '<div class="form-section">Itens deste aluguel</div><table class="rent-items"><tbody>'+lines+'</tbody></table><div class="detail-total"><span>Total de referência</span><strong>'+money(total(r))+'</strong></div>'+
      (isLate(r)?'<div class="warn-inline red">'+icon("alert")+'A devolução passou da data prevista. O item continua indisponível até você registrar o retorno.</div>':"")+
      '<p class="info-after">Use a ação abaixo para atualizar a situação deste aluguel. Na demonstração, a mudança vale somente nesta aba.</p></div>'+
      dialogFoot(cancel+'<button class="outline-btn" type="button" data-action="close">Fechar</button>'+actionHtml);
  }
  function customerDialog(id){
    const c=customer(id);if(!c)return dialogHeader("CLIENTE","Não encontrado");
    const list=db().rentals.filter(r=>r.clientId===id).sort((a,b)=>b.from.localeCompare(a.from));
    const rows=list.map(r=>'<tr><td><button type="button" class="text-btn" data-rental="'+safe(r.id)+'">'+safe(r.id)+'</button></td><td>'+shortDate(r.from)+'</td><td>'+statusBadge(r)+'</td></tr>').join("")||'<tr><td colspan="3">Nenhum aluguel neste exemplo.</td></tr>';
    return dialogHeader("CLIENTE","Histórico de "+safe(c.name))+
      '<div class="dialog-body"><div class="detail-info"><div><label>Cliente</label><strong>'+safe(c.name)+'</strong></div><div><label>Quantidade de aluguéis</label><strong>'+list.length+'</strong></div></div>'+
      '<div class="form-section">Registros</div><table class="rent-items"><tbody>'+rows+'</tbody></table></div>'+
      dialogFoot('<button type="button" class="outline-btn" data-action="close">Fechar</button>');
  }
  function renderDialog(){
    if(!state.dialog)return;
    const d=state.dialog;
    modal.innerHTML='<section class="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">'+
      (d.type==="new"?newDialog():d.type==="rental"?rentalDialog(d.id):customerDialog(d.id))+"</section>";
    if(d.type==="new")refreshAvailability();
  }
  function moveRental(id,next){
    const r=db().rentals.find(x=>x.id===id);
    if(!r || !actionFor(r) || actionFor(r).next!==next)return;
    if(next==="out" && r.from>today){notify("A retirada só pode ser registrada a partir da data combinada.");return;}
    r.status=next;
    closeDialog();render();
    notify(next==="ready"?"Itens marcados como separados.":next==="out"?"Retirada registrada. Os itens estão com o cliente.":"Devolução registrada. Os itens foram liberados.");
  }
  function addLine(){
    const p=product($("draft-item")?.value);
    const qty=Number($("draft-qty")?.value);
    const d=state.draft;
    if(!p || !Number.isInteger(qty) || qty<1 || d.to<d.from || d.from<today){
      notify("Confira o item, a quantidade e as datas.");return;
    }
    const already=d.items.find(l=>l.id===p.id);
    const room=availability(p.id,d.from,d.to)-(already?.qty||0);
    if(qty>room){
      notify("Não há unidades disponíveis nessa quantidade para o período.");refreshAvailability();return;
    }
    if(already)already.qty+=qty;else d.items.push({id:p.id,qty,price:p.price});
    renderDialog();
  }
  function createRental(){
    const errors=draftErrors();if(errors.length){notify(errors[0]);return;}
    const d=state.draft;
    const prefix=state.segment==="festas"?"A":state.segment==="livros"?"L":state.segment==="equipamentos"?"E":"V";
    let id;
    do{id=prefix+"-"+(++db().nextId);}while(db().rentals.some(r=>r.id===id));
    db().rentals.push({id,clientId:d.clientId,from:d.from,to:d.to,status:"reserved",items:d.items.map(l=>({...l}))});
    state.draft=null;closeDialog();go("alugueis");notify("Aluguel "+id+" confirmado na demonstração.");openDialog("rental",id);
  }

  document.addEventListener("click",event=>{
    const view=event.target.closest("[data-view]");
    if(view){go(view.dataset.view);return;}
    const rental=event.target.closest("[data-rental]");
    if(rental){openDialog("rental",rental.dataset.rental);return;}
    const client=event.target.closest("[data-customer]");
    if(client){openDialog("customer",client.dataset.customer);return;}
    const filter=event.target.closest("[data-filter]");
    if(filter){state.filter=filter.dataset.filter;render();return;}
    const action=event.target.closest("[data-action]");
    if(!action)return;
    const kind=action.dataset.action;
    if(kind==="new")startNew();
    if(kind==="close")closeDialog();
    if(kind==="add-line")addLine();
    if(kind==="confirm")createRental();
    if(kind==="remove-line"){state.draft.items=state.draft.items.filter(l=>l.id!==action.dataset.item);renderDialog();}
    if(kind==="change")moveRental(action.dataset.id,action.dataset.next);
    if(kind==="cancel"){
      const r=db().rentals.find(x=>x.id===action.dataset.id);
      if(r && ["reserved","ready"].includes(r.status)){r.status="cancelled";closeDialog();render();notify("Aluguel cancelado nesta demonstração. Disponibilidade liberada.");}
    }
    if(kind==="reset"){
      databases[state.segment]=loadFixture(state.segment);state.search="";state.filter="todos";state.stockFrom=today;state.stockTo=offset(2);render();notify("Dados de exemplo restaurados.");
    }
  });
  document.addEventListener("input",event=>{
    if(event.target.id==="list-search"){
      const pos=event.target.selectionStart;
      state.search=event.target.value.trim();
      render();
      const input=$("list-search");
      if(input){input.focus();try{input.setSelectionRange(pos,pos);}catch(e){}}
    }
    if(event.target.id==="draft-qty")refreshAvailability();
  });
  document.addEventListener("change",event=>{
    if(event.target.id==="stock-from"){state.stockFrom=event.target.value;render();}
    if(event.target.id==="stock-to"){state.stockTo=event.target.value;render();}
    if(event.target.id==="draft-client"){state.draft.clientId=event.target.value;}
    if(event.target.id==="draft-from"){state.draft.from=event.target.value;renderDialog();}
    if(event.target.id==="draft-to"){state.draft.to=event.target.value;renderDialog();}
    if(event.target.id==="draft-item")refreshAvailability();
  });
  sectorSelect.addEventListener("change",()=>{
    state.segment=sectorSelect.value;
    state.stockFrom=today;state.stockTo=offset(2);
    state.filter="todos";state.search="";
    closeDialog();go("hoje");
    notify("Agora você está explorando um negócio de "+config().display.toLowerCase()+".");
  });
  menuToggle.addEventListener("click",()=>{
    const open=!document.body.classList.contains("nav-open");
    document.body.classList.toggle("nav-open",open);
    menuToggle.setAttribute("aria-expanded",String(open));
    overlay.hidden=!open;
  });
  overlay.addEventListener("click",closeMenu);
  modal.addEventListener("click",event=>{if(event.target===modal)closeDialog();});
  document.addEventListener("keydown",event=>{
    if(event.key==="Escape"){if(!modal.hidden)closeDialog();else closeMenu();}
    const row=event.target.closest("[data-rental].row-click,[data-customer].row-click");
    if(row && (event.key==="Enter"||event.key===" ")){event.preventDefault();row.click();}
    if(!modal.hidden && event.key==="Tab"){
      const focusable=Array.from(modal.querySelectorAll('button:not(:disabled),select:not(:disabled),input:not(:disabled)'));
      if(!focusable.length)return;
      if(event.shiftKey&&document.activeElement===focusable[0]){event.preventDefault();focusable[focusable.length-1].focus();}
      else if(!event.shiftKey&&document.activeElement===focusable[focusable.length-1]){event.preventDefault();focusable[0].focus();}
    }
  });
  window.addEventListener("hashchange",()=>{
    const page=location.hash.slice(1);
    if(titles[page]&&page!==state.view){state.view=page;state.search="";state.filter="todos";render();}
  });
  render();
})();