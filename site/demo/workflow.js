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
  const titles = { hoje: "Hoje", alugueis: "Aluguéis", itens: "Meus itens", clientes: "Clientes", financeiro: "Financeiro", configuracoes: "Configurações", conta: "Minha conta" };
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
  const money = (n) => state?.financeHidden ? "•••••" : Number(n).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
  const currency = n => Number(n).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
  const round2 = n => Math.round((Number(n)+Number.EPSILON)*100)/100;
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
    const finance={
      payments:rentals.filter((r,i)=>i===0||i===2||i===3).map((r,i)=>{
        const amount=round2(r.items.reduce((sum,line)=>sum+line.price*line.qty,0)*(i===0?.5:i===1?1:.35));
        return {id:"P-"+(i+1),rentalId:r.id,amount,date:offset(-2+i)};
      }),
      expenses:[
        {id:"D-1",description:"Transporte e entregas",category:"Logística",amount:95,due:offset(-2),paidAt:offset(-2)},
        {id:"D-2",description:"Manutenção de itens",category:"Manutenção",amount:120,due:offset(1),paidAt:null},
        {id:"D-3",description:"Materiais de embalagem",category:"Materiais",amount:45,due:offset(4),paidAt:null}
      ],nextPayment:10,nextExpense:10
    };
    return {items,clients,rentals,finance,nextId:1000,nextClientId:1000,nextItemId:1000,settings:{name:fixture.name,preparationDays:1,defaultDays:1,logo:null,accent:"#455CD4",mode:"light",accessibility:false,notifications:{enabled:true,prepare:true,pickup:true,returnDue:true,overdue:true,daysBeforeReturn:1},financeHiddenByDefault:false}};
  }
  const databases = Object.fromEntries(Object.keys(fixtures).map(k=>[k,loadFixture(k)]));
  const state = {
    segment:"festas",view:titles[location.hash.slice(1)]?location.hash.slice(1):"hoje",
    filter:"todos",search:"",itemsMode:"grid",rentalsMode:"list",calendarMonth:today.slice(0,7),calendarDay:today,stockFrom:today,stockTo:offset(2),
    financeMonth:today.slice(0,7),financeFilter:"all",financeHidden:false,draft:null,dialog:null
  };
  const demoAccount={name:"Empreendedor Demo",email:"demo@exemplo.invalid",photo:null};
  const db = () => databases[state.segment];
  const config = () => fixtures[state.segment];
  const settings = () => db().settings;
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
      events.push([start,qty]);if(end!=="9999-12-31")events.push([plusDay(end),-qty]);
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
    return '<div class="tip-banner">'+icon("info")+'<span><strong>Ambiente de demonstração.</strong> Explore à vontade: os registros são fictícios e as alterações só existem nesta aba. <button class="link-like" type="button" data-action="reset-confirm">Restaurar exemplo</button></span></div>';
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
      else if(r.status==="reserved" && r.from<today) tasks.push({r,priority:0,title:"Separação e retirada pendentes",desc:who+" · "+itemNames+" · prevista para "+shortDate(r.from),className:"red",iconName:"alert"});
      else if(r.status==="reserved" && r.from<=offset(settings().preparationDays) && r.from>=today)
        tasks.push({r,priority:1,title:"Separar para "+(r.from===today?"hoje":r.from===offset(1)?"amanhã":shortDate(r.from)),desc:who+" · "+itemNames,className:"amber",iconName:"box"});
      else if(r.status==="ready" && r.from<=offset(1))
        tasks.push({r,priority:2,title:"Pronto para retirada",desc:who+" · "+itemNames,className:"indigo",iconName:"truck"});
      else if(r.status==="out" && r.to<=offset(1))
        tasks.push({r,priority:3,title:"Devolução próxima",desc:who+" · prevista para "+shortDate(r.to),className:"blue",iconName:"clock"});
    });
    return tasks.sort((a,b)=>a.priority-b.priority || a.r.from.localeCompare(b.r.from));
  }
  function todayView() {
    const late=db().rentals.filter(isLate).length;
    const preparing=db().rentals.filter(r=>r.status==="reserved" && r.from<=offset(settings().preparationDays)).length;
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
        stat("Precisam ser separados",String(preparing),"Até "+shortDate(offset(settings().preparationDays)),"box",preparing?"amber":"") +
        stat("Com clientes",String(withCustomer),"Itens entregues","truck") +
        stat("Devoluções atrasadas",String(late),"Precisam de contato","alert",late?"red":"") +
        stat("Itens livres agora",String(availableNow),"Unidades, considerando os aluguéis","check","indigo") +
      '</section><div class="main-grid">' +
        '<section class="panel"><div class="panel-head"><div><h2>Para não esquecer</h2><p>Ações que você pode resolver agora</p></div><span class="badge '+(tasks.length?"ready":"returned")+'">'+tasks.length+' '+(tasks.length===1?"pendência":"pendências")+'</span></div><div class="task-list">'+tasksHtml+'</div></section>' +
        '<section class="panel"><div class="panel-head"><div><h2>Próximos aluguéis</h2><p>Quem vem buscar e quando</p></div><button class="text-btn" type="button" data-view="alugueis">Ver todos →</button></div><div class="movement-list">'+upcomingHtml+'</div></section>' +
      '</div><p class="info-after">O Locvia é um apoio à rotina: as informações do exemplo mudam quando você registra uma retirada ou devolução.</p>';
  }
  // Calendário e lista usam a mesma fonte de dados e os mesmos filtros de aluguel.
  function filteredRentals() {
    return db().rentals.filter(r=>{
      if(state.filter==="late" && !isLate(r))return false;
      if(!["todos","late"].includes(state.filter) && state.filter!==r.status)return false;
      return searchMatch([r.id,customer(r.clientId)?.name||"",r.items.map(l=>product(l.id)?.name||"Item").join(" "),statusName(r)].join(" "));
    }).sort((a,b)=>(a.status==="returned")-(b.status==="returned") || a.from.localeCompare(b.from));
  }
  const ptWeekdays=["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
  function dateAt(year,month,day) {
    return year+"-"+String(month).padStart(2,"0")+"-"+String(day).padStart(2,"0");
  }
  function calendarDayRentals(day, all) {
    // Para estados de atraso, exibimos um alerta HOJE, mesmo que o período previsto já tenha passado.
    // Não duplicamos indefinidamente um aluguel atrasado em todos os dias futuros.
    return all.filter(r=>(r.from<=day && day<=r.to) || (day===today && isLate(r)));
  }
  function calendarView(rentals) {
    const [yy,mm]=state.calendarMonth.split("-").map(Number);
    const monthStart=new Date(yy,mm-1,1,12);
    const gridStart=new Date(yy,mm-1,1-monthStart.getDay(),12);
    const monthName=new Intl.DateTimeFormat("pt-BR",{month:"long",year:"numeric"}).format(monthStart);
    const dayLimit=new Date(yy,mm,0,12).getDate();
    const selected=state.calendarDay;
    const weekdays=ptWeekdays.map(w=>'<span class="calendar-weekday">'+w+'</span>').join("");
    const cells=Array.from({length:42},(_,i)=>{
      const dayDate=new Date(gridStart);
      dayDate.setDate(dayDate.getDate()+i);
      const day=iso(dayDate);
      const current=day.startsWith(state.calendarMonth),active=day===selected,isToday=day===today;
      const booked=calendarDayRentals(day,rentals);
      const labels=booked.slice(0,2).map(r=>'<span class="calendar-event '+(isLate(r)?"late":safe(r.status))+'">'+safe(customer(r.clientId)?.name||"Cliente")+'</span>').join("");
      const extra=booked.length>2?'<span class="calendar-more">+'+(booked.length-2)+' outros</span>':"";
      return '<button type="button" class="calendar-day'+(current?"":" outside")+(active?" selected":"")+(isToday?" today":"")+'" data-action="calendar-day" data-day="'+day+'" aria-pressed="'+active+'" aria-label="'+safe(longDate(day))+'; '+booked.length+' '+(booked.length===1?"aluguel":"aluguéis")+'">'+
        '<span class="calendar-date">'+dayDate.getDate()+(isToday?'<span class="today-point" aria-label="Hoje"></span>':"")+'</span>'+
        '<span class="calendar-events">'+labels+extra+'</span></button>';
    }).join("");
    const selection=calendarDayRentals(selected,rentals).sort((a,b)=>a.from.localeCompare(b.from));
    const items=selection.map(r=>'<button type="button" class="calendar-rental-entry" data-rental="'+safe(r.id)+'">'+
      '<span class="calendar-rental-description"><strong>'+safe(customer(r.clientId)?.name||"Cliente")+'</strong><small>'+safe(r.id)+' · '+safe(r.items.map(l=>product(l.id)?.name||"Item").join(", "))+'</small>'+
      '<small>'+safe(shortDate(r.from))+' a '+safe(shortDate(r.to))+'</small></span>'+statusBadge(r)+icon("chevron")+'</button>').join("")||
      '<p class="calendar-empty">Nenhum aluguel para esse dia com os filtros atuais.</p>';
    return '<div class="calendar-layout"><section class="panel calendar-panel">'+
      '<header class="calendar-header"><div><h2>'+safe(monthName[0].toUpperCase()+monthName.slice(1))+'</h2><p>'+rentals.length+' aluguéis correspondem aos filtros</p></div>'+
      '<div class="calendar-navigation"><button type="button" class="outline-btn" data-action="calendar-today">Hoje</button>'+
      '<button type="button" class="icon-btn" data-action="calendar-prev" aria-label="Mês anterior">'+icon("chevron")+'</button>'+
      '<button type="button" class="icon-btn" data-action="calendar-next" aria-label="Próximo mês">'+icon("chevron")+'</button></div></header>'+
      '<div class="calendar-weekdays" aria-hidden="true">'+weekdays+'</div>'+
      '<div class="calendar-days" role="group" aria-label="Dias do calendário de '+safe(monthName)+'">'+cells+'</div>'+
      '<footer class="calendar-footer"><span><i class="calendar-key reserved"></i> Reservado</span><span><i class="calendar-key ready"></i> Separado</span><span><i class="calendar-key out"></i> Com cliente</span><span><i class="calendar-key late"></i> Atrasado</span></footer>'+
      '</section><aside class="panel calendar-selected"><div class="panel-head"><div><h2>'+safe(longDate(selected))+'</h2><p>'+selection.length+' '+(selection.length===1?"aluguel":"aluguéis")+' para este dia</p></div></div>'+
      '<div class="calendar-rentals">'+items+'</div></aside></div>';
  }
  function moveCalendarMonth(delta) {
    const [y,m]=state.calendarMonth.split("-").map(Number);
    const date=new Date(y,m-1+delta,1,12);
    const first=iso(date);
    state.calendarMonth=first.slice(0,7);
    state.calendarDay=first;
    render();
  }

  function rentalsView() {
    const filters=[["todos","Todos"],["reserved","Para separar"],["ready","Separados"],["out","Com clientes"],["late","Atrasados"],["returned","Devolvidos"]];
    const buttons=filters.map(([id,label])=>'<button type="button" class="chip '+(state.filter===id?"active":"")+'" data-filter="'+id+'">'+label+'</button>').join("");
    const rentals=filteredRentals();
    const rows=rentals.map(r=>{
      const who=customer(r.clientId);
      return '<tr class="row-click" tabindex="0" role="button" data-rental="'+safe(r.id)+'" aria-label="Abrir aluguel '+safe(r.id)+'"><td><strong class="id-code">'+safe(r.id)+'</strong><small>'+r.items.length+' '+(r.items.length===1?"tipo de item":"tipos de itens")+'</small></td>'+
        '<td><div class="person-cell"><span class="round-initials">'+safe(initials(who?.name||""))+'</span><span><strong>'+safe(who?.name||"Cliente")+'</strong></span></div></td>'+
        '<td>'+shortDate(r.from)+' – '+shortDate(r.to)+'</td><td>'+statusBadge(r)+'</td><td class="align-end"><strong>'+money(total(r))+'</strong></td></tr>';
    }).join("") || '<tr><td colspan="5"><div class="placeholder"><strong>Nenhum aluguel encontrado.</strong>Tente outra busca ou filtro.</div></td></tr>';
    const toggle='<div class="rental-view-switch" role="group" aria-label="Modo de visualização dos aluguéis">'+
      '<button type="button" data-action="rentals-list" aria-pressed="'+(state.rentalsMode==="list")+'" aria-label="Ver aluguéis em lista">'+icon("list")+'<span>Lista</span></button>'+
      '<button type="button" data-action="rentals-calendar" aria-pressed="'+(state.rentalsMode==="calendar")+'" aria-label="Ver aluguéis em calendário">'+icon("calendar")+'<span>Calendário</span></button></div>';
    const list='<section class="panel"><div class="panel-head"><div><h2>Aluguéis cadastrados</h2><p>'+rentals.length+' registros neste exemplo</p></div></div>'+
      '<div class="table-wrap"><table class="data-table"><thead><tr><th>Número</th><th>Cliente</th><th>Período</th><th>Situação</th><th class="align-end">Valor</th></tr></thead><tbody>'+rows+'</tbody></table></div></section>';
    return heading("Tudo registrado","Seus aluguéis","Acompanhe seus aluguéis em lista ou no calendário.",createBtn()) +
      infoBanner()+'<div class="filters rentals-toolbar">'+buttons+'<label class="field-search">'+icon("search")+'<input id="list-search" type="search" value="'+safe(state.search)+'" placeholder="Buscar cliente ou item" aria-label="Buscar aluguéis"></label>'+toggle+'</div>'+
      (state.rentalsMode==="calendar"?calendarView(rentals):list);
  }
  function itemsView() {
    const valid=Boolean(state.stockFrom && state.stockTo && state.stockFrom<=state.stockTo);
    const filtered=db().items.filter(p=>searchMatch(p.name+" "+p.category));
    const compact=state.itemsMode==="grid";
    const toggle='<button type="button" class="outline-btn items-view-toggle" data-action="toggle-items-view" aria-label="'+(compact?"Visualizar itens em lista":"Visualizar itens em cartões")+'" title="'+(compact?"Ver em lista":"Ver em cartões")+'" aria-pressed="'+(!compact)+'">'+icon(compact?"list":"grid")+'<span>'+(compact?"Lista":"Cartões")+'</span></button>';
    const shared=(p)=>{
      const free=valid?availability(p.id,state.stockFrom,state.stockTo):0;
      const r=valid?holders(p.id,state.stockFrom,state.stockTo):[];
      const caption=r.length?(r.some(x=>x.status==="out")?"Com cliente / reservado":"Reservado no período"):"Sem reservas no período";
      const pct=p.stock?Math.round(free/p.stock*100):0;
      return {free,caption,pct};
    };
    const markup=filtered.map(p=>{
      const v=shared(p),pid=safe(p.id),name=safe(p.name),cat=safe(p.category),emoji=safe(p.emoji);
      const actions='<button class="mini-btn secondary" type="button" data-action="edit-item" data-id="'+pid+'" aria-label="Editar '+name+'">'+icon("pencil")+'<span>Editar</span></button>'+
        '<button class="mini-btn secondary danger-text" type="button" data-action="delete-item" data-id="'+pid+'" aria-label="Excluir '+name+'">'+icon("trash")+'<span>Excluir</span></button>';
      if(!compact){
        return '<article class="item-list-row"><button class="item-row-open" type="button" data-item="'+pid+'" aria-label="Abrir detalhes de '+name+'"><span class="item-small-emoji" aria-hidden="true">'+emoji+'</span>'+
          '<span class="item-row-name"><strong>'+name+'</strong><small>'+cat+'</small></span>'+
          '<span class="item-row-stock"><strong class="'+(v.free===0?"none":"")+'">'+v.free+' / '+p.stock+'</strong><small>Livres no período</small></span>'+
          '<span class="item-row-price">'+money(p.price)+'</span><span class="item-row-detail"><span>Detalhes</span>'+icon("chevron")+'</span></button>'+
          '<div class="item-row-actions">'+actions+'</div></article>';
      }
      return '<article class="item-card compact-item-card"><button type="button" class="item-card-open" data-item="'+pid+'" aria-label="Abrir detalhes de '+name+'">'+
        '<span class="item-card-top"><span class="item-emoji" aria-hidden="true">'+emoji+'</span><span class="item-code">'+safe(p.id.toUpperCase())+'</span></span>'+
        '<span class="item-card-body"><span class="item-type">'+cat+'</span><span class="item-card-title">'+name+'</span>'+
        '<span class="availability-line"><span>Livres no período</span><strong class="'+(v.free===0?"none":"")+'">'+v.free+' / '+p.stock+'</strong></span>'+
        '<span class="meter" role="img" aria-label="'+v.free+' de '+p.stock+' unidades disponíveis"><span style="width:'+v.pct+'%"></span></span>'+
        '<span class="item-availability-caption">'+safe(v.caption)+'</span>'+
        '<span class="card-footer"><span>Valor por aluguel</span><strong>'+money(p.price)+'</strong></span>'+
        '<span class="item-open-hint">Detalhes '+icon("chevron")+'</span></span></button>'+
        '<div class="card-actions">'+actions+'</div></article>';
    }).join("")||'<div class="panel empty-items"><div class="placeholder"><strong>Nenhum item encontrado.</strong>Experimente outra busca ou cadastre um novo item.</div></div>';
    return heading("O que você tem","Meus itens","Confira quantas unidades estão livres e com quem estão as outras.",'<button type="button" class="primary-btn" data-action="add-item">'+icon("plus")+' Novo item</button>')+
      infoBanner()+
      '<div class="date-filter"><strong>Ver disponibilidade</strong><label>De <input id="stock-from" type="date" value="'+safe(state.stockFrom)+'"></label><label>Até <input id="stock-to" type="date" value="'+safe(state.stockTo)+'"></label><span class="date-help">Confira as datas antes de alugar.</span></div>'+
      (!valid?'<div class="warn-inline red" style="margin-bottom:18px">'+icon("alert")+'A data final não pode vir antes da inicial.</div>':"")+
      '<div class="filters items-tools"><label class="field-search">'+icon("search")+'<input id="list-search" value="'+safe(state.search)+'" type="search" placeholder="Buscar item" aria-label="Buscar itens"></label>'+
      '<span class="items-count">'+filtered.length+' '+(filtered.length===1?"item":"itens")+'</span>'+toggle+'</div>'+
      '<div class="'+(compact?"item-grid":"item-list")+'" id="items-collection">'+markup+'</div>'+
      '<p class="info-after">Toque em um item para consultar quem está com ele, editar seu cadastro ou excluí-lo.</p>';
  }
  function clientsView() {
    const filtered=db().clients.filter(c=>searchMatch(c.name));
    const rows=filtered.map(c=>{
      const rentals=db().rentals.filter(r=>r.clientId===c.id);
      const out=rentals.filter(r=>r.status==="out").length;
      return '<tr class="row-click" role="button" tabindex="0" data-customer="'+safe(c.id)+'" aria-label="Ver '+safe(c.name)+'"><td><div class="person-cell"><span class="round-initials">'+safe(initials(c.name))+'</span><strong>'+safe(c.name)+'</strong></div></td><td>'+rentals.length+' '+(rentals.length===1?"aluguel":"aluguéis")+'</td><td>'+(out?'<span class="badge out">'+out+' com cliente</span>':'<span class="badge returned">Nada em aberto</span>')+'</td><td class="align-end"><div class="table-actions"><button type="button" class="mini-btn secondary" data-action="edit-customer" data-id="'+safe(c.id)+'">Editar</button><button type="button" class="mini-btn secondary danger-text" data-action="delete-customer" data-id="'+safe(c.id)+'">Excluir</button></div></td></tr>';
    }).join("")||'<tr><td colspan="4"><div class="placeholder">Nenhum cliente encontrado.</div></td></tr>';
    return heading("Quem aluga com você","Clientes","Veja de forma simples quem tem itens e os aluguéis de cada pessoa.",'<button type="button" class="primary-btn" data-action="add-customer">'+icon("plus")+' Novo cliente</button>') +
      infoBanner()+'<div class="filters"><label class="field-search" style="margin-left:0">'+icon("search")+'<input id="list-search" type="search" value="'+safe(state.search)+'" placeholder="Buscar cliente" aria-label="Buscar clientes"></label></div>'+
      '<section class="panel"><div class="panel-head"><div><h2>Seus clientes</h2><p>'+filtered.length+' contatos de demonstração</p></div></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Cliente</th><th>Histórico</th><th>Situação</th><th class="align-end">Ações</th></tr></thead><tbody>'+rows+'</tbody></table></div></section>';
  }

  // Preferências mínimas ligadas ao trabalho solo, independentes para cada cenário da demo.

  // Identidade da locadora: não altera o logo do produto Locvia.
  const ACCENT_COLORS=["#455CD4","#0F766E","#1D4ED8","#7C3AED","#B45309","#BE185D","#0E7490","#334155"];
  const LOGO_MAX_BYTES=5*1024*1024,LOGO_MIN_DIM=128,LOGO_MAX_DIM=4096,LOGO_OUTPUT=320;
  let cropState=null;
  const validAccent = value => /^#[0-9a-f]{6}$/i.test(String(value||"").trim())
    ? String(value).trim().toUpperCase() : null;
  function blendColors(a,b,part){
    const h=v=>v.replace("#","");
    const x=h(a),y=h(b);
    return "#"+[0,2,4].map(i=>Math.round(parseInt(x.slice(i,i+2),16)*(1-part)+parseInt(y.slice(i,i+2),16)*part).toString(16).padStart(2,"0")).join("").toUpperCase();
  }
  function luminance(hex){
    const vals=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4));
    return .2126*vals[0]+.7152*vals[1]+.0722*vals[2];
  }
  function readableBrandInk(accent,dark){
    const background=dark?"#182234":"#FFFFFF";
    const target=dark?"#FFFFFF":"#000000";
    const contrast=(a,b)=>{
      const x=luminance(a),y=luminance(b);
      return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
    };
    for(let i=0;i<=20;i++){
      const color=blendColors(accent,target,i/20);
      if(contrast(color,background)>=4.5)return color;
    }
    return target;
  }
  function logoImageTag(alt){
    return '<img class="branding-logo" src="'+safe(settings().logo)+'" alt="'+safe(alt)+'">';
  }
  function updateLogoBrand(){
    const badge=$("workspace-symbol");
    if(badge){
      badge.classList.toggle("has-logo",Boolean(settings().logo));
      badge.innerHTML=settings().logo?logoImageTag("Logo de "+settings().name):safe(config().initials);
    }
    const mobile=$("mobile-business-logo");
    if(mobile){
      mobile.classList.toggle("has-logo",Boolean(settings().logo));
      mobile.innerHTML=settings().logo?logoImageTag("Logo de "+settings().name):safe(config().initials);
    }
    const avatar=$("settings-brand-avatar");
    if(avatar){
      avatar.classList.toggle("has-logo",Boolean(settings().logo));
      avatar.innerHTML=settings().logo?logoImageTag("Logo de "+settings().name):safe(config().initials);
    }
    const thumb=$("settings-logo-preview");if(thumb)thumb.innerHTML=logoPreviewMarkup();
    const view=$("logo-view");if(view)view.hidden=!settings().logo;
    const remove=$("logo-remove");if(remove)remove.hidden=!settings().logo;
    const label=$("logo-upload-label");if(label)label.innerHTML=icon("pencil")+(settings().logo?" Trocar imagem":" Carregar imagem");
  }
  function paintPersonalization(){
    const p=settings(),dark=p.mode==="dark";
    const accent=validAccent(p.accent)||"#455CD4";
    const root=document.documentElement;
    root.dataset.mode=dark?"dark":"light";
    root.dataset.accessibility=p.accessibility?"on":"off";
    const backdrop=dark?"#182234":"#FFFFFF";
    const vars={
      "--primary":accent,
      "--primary-hover":blendColors(accent,dark?"#FFFFFF":"#000000",dark?.18:.13),
      "--primary-pale":blendColors(accent,backdrop,dark?.83:.92),
      "--primary-line":blendColors(accent,backdrop,dark?.64:.75),
      "--brand-ink":readableBrandInk(accent,dark),
      "--on-primary":luminance(accent)>.185?"#101723":"#FFFFFF",
      "--focus-ring":dark?"#FFCC74":"#596FDB"
    };
    Object.entries(vars).forEach(([k,v])=>root.style.setProperty(k,v));
  }
  function updateAppearanceControls(){
    document.querySelectorAll("[data-action='accent-preset']").forEach(btn=>{
      const selected=btn.dataset.color===settings().accent;
      btn.setAttribute("aria-pressed",String(selected));
      const swatch=btn.querySelector(".color-dot");
      if(swatch)swatch.innerHTML=selected?icon("check"):"";
    });
    document.querySelectorAll("[data-action='set-theme']").forEach(btn=>{
      btn.setAttribute("aria-pressed",String(btn.dataset.mode===settings().mode));
    });
    const input=$("custom-accent");if(input)input.value=settings().accent;
    const feedback=$("color-feedback");
    if(feedback){feedback.textContent="Cor atual: "+settings().accent;feedback.setAttribute("role","status");}
    const a11y=$("accessibility-toggle");if(a11y)a11y.checked=settings().accessibility;
  }
  function chooseAccent(value){
    const color=validAccent(value);
    if(!color){
      const info=$("color-feedback");
      if(info){info.setAttribute("role","alert");info.textContent="Digite uma cor válida com # e seis caracteres, por exemplo #0F766E.";}
      notify("Informe uma cor hexadecimal válida, como #0F766E.");return;
    }
    settings().accent=color;
    paintPersonalization();
    updateAppearanceControls();
    notify("Cor de destaque atualizada na demonstração.");
  }
  function logoViewDialog(){
    if(!settings().logo)return dialogHeader("LOGOTIPO","Nenhuma imagem cadastrada");
    return dialogHeader("MEU NEGÓCIO","Logotipo atual")+
      '<div class="dialog-body"><div class="logo-current-preview">'+logoImageTag("Logotipo atual de "+settings().name)+'</div>'+
      '<p class="crop-note">Imagem já recortada no formato quadrado 1:1. Apenas o negócio selecionado usa este logotipo.</p></div>'+
      dialogFoot('<button type="button" class="outline-btn" data-action="close">Fechar</button>');
  }
  function cropDialog(){
    if(!cropState)return dialogHeader("LOGOTIPO","Nenhuma imagem carregada");
    return dialogHeader("LOGOTIPO DO NEGÓCIO","Recortar imagem para 1:1")+
      '<div class="dialog-body"><div class="crop-container"><div class="crop-canvas-shell">'+
      '<canvas id="logo-crop-canvas" width="320" height="320" aria-label="Prévia quadrada do logotipo. Arraste para ajustar a posição" role="img"></canvas>'+
      '<span class="crop-guides" aria-hidden="true"></span></div><div class="crop-settings">'+
      '<label for="logo-crop-zoom">Ajustar zoom</label><input type="range" id="logo-crop-zoom" min="1" max="3" step="0.05" value="'+cropState.zoom+'">'+
      '<p class="crop-note">Arraste a imagem dentro do quadrado para escolher a área que será usada. Use o controle de zoom para aproximar ou afastar.</p>'+
      '<p class="crop-file-meta">'+safe(cropState.fileName)+' · '+cropState.width+' × '+cropState.height+' pixels</p>'+
      '<button type="button" class="outline-btn" data-action="crop-center">Centralizar imagem</button></div></div>'+
      '<p class="crop-note">O resultado será uma imagem PNG quadrada de 320 × 320 pixels, usada somente nesta demonstração.</p></div>'+
      dialogFoot('<button type="button" class="outline-btn" data-action="close">Cancelar</button>'+
        '<button type="button" class="primary-btn" data-action="crop-save">'+icon("check")+' Usar este recorte</button>');
  }
  function clampLogoPan(){
    if(!cropState)return;
    const scale=Math.max(LOGO_OUTPUT/cropState.width,LOGO_OUTPUT/cropState.height)*cropState.zoom;
    const w=cropState.width*scale,h=cropState.height*scale;
    cropState.panX=Math.max(-(w-LOGO_OUTPUT)/2,Math.min((w-LOGO_OUTPUT)/2,cropState.panX));
    cropState.panY=Math.max(-(h-LOGO_OUTPUT)/2,Math.min((h-LOGO_OUTPUT)/2,cropState.panY));
  }
  function drawLogoCrop(){
    const canvas=$("logo-crop-canvas");
    if(!canvas||!cropState?.img)return;
    const ctx=canvas.getContext("2d");
    if(!ctx){notify("Seu navegador não disponibilizou o editor de imagem.");return;}
    const scale=Math.max(LOGO_OUTPUT/cropState.width,LOGO_OUTPUT/cropState.height)*cropState.zoom;
    const w=cropState.width*scale,h=cropState.height*scale;
    clampLogoPan();
    ctx.clearRect(0,0,LOGO_OUTPUT,LOGO_OUTPUT);
    ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality="high";
    ctx.drawImage(cropState.img,(LOGO_OUTPUT-w)/2+cropState.panX,(LOGO_OUTPUT-h)/2+cropState.panY,w,h);
  }
  function readLogoFile(file){
    if(!file)return;
    if(!["image/png","image/jpeg","image/webp"].includes(file.type)){
      notify("Use uma imagem PNG, JPG ou WebP.");return;
    }
    if(!file.size||file.size>LOGO_MAX_BYTES){
      notify("A imagem precisa ter no máximo 5 MB.");return;
    }
    const reader=new FileReader();
    reader.addEventListener("error",()=>notify("Não foi possível abrir a imagem. Tente outro arquivo."));
    reader.addEventListener("load",()=>{
      const img=new Image();
      img.onerror=()=>notify("Não foi possível ler a imagem. Use PNG, JPG ou WebP válido.");
      img.onload=()=>{
        const width=img.naturalWidth,height=img.naturalHeight;
        if(width<LOGO_MIN_DIM||height<LOGO_MIN_DIM){
          notify("Imagem muito pequena. Use no mínimo 128 × 128 pixels.");return;
        }
        if(width>LOGO_MAX_DIM||height>LOGO_MAX_DIM){
          notify("Resolução muito alta. Cada lado pode ter até 4096 pixels.");return;
        }
        cropState={img,fileName:file.name.slice(0,100),width,height,zoom:1,panX:0,panY:0,drag:null};
        openDialog("logo-crop");
        drawLogoCrop();
      };
      img.src=String(reader.result);
    });
    reader.readAsDataURL(file);
  }
  function saveLogoCrop(){
    if(!cropState)return;
    const canvas=$("logo-crop-canvas");
    if(!canvas)return;
    try{
      drawLogoCrop();
      const data=canvas.toDataURL("image/png");
      if(!data.startsWith("data:image/png;base64,"))throw Error("encoding");
      settings().logo=data;
      closeDialog();
      updateLogoBrand();
      notify("Logotipo aplicado à identidade do negócio.");
    }catch(_){notify("Não foi possível concluir o recorte. Tente outra imagem.");}
  }


  // FINANCEIRO: contas do negócio, independentes da futura cobrança da assinatura SaaS.
  // Valores em centavos lógicos (duas casas) e lançamentos fictícios na memória da demo.
  function paidForRental(id){return round2(db().finance.payments.filter(p=>p.rentalId===id).reduce((a,p)=>a+p.amount,0));}
  function dueForRental(r){return Math.max(0,round2(total(r)-paidForRental(r.id)));}
  function financialMonthShift(delta){
    const [y,m]=state.financeMonth.split("-").map(Number);
    const d=new Date(y,m-1+delta,1,12);
    state.financeMonth=iso(d).slice(0,7);render();
  }
  const financeExpenses=()=>db().finance.expenses;
  function financeView(){
    const month=state.financeMonth;
    const rentals=db().rentals.filter(r=>r.status!=="cancelled"&&r.from.slice(0,7)===month);
    const payments=db().finance.payments.filter(p=>p.date.slice(0,7)===month);
    const paidExpenses=financeExpenses().filter(e=>e.paidAt?.slice(0,7)===month);
    const dueExpenses=financeExpenses().filter(e=>e.due.slice(0,7)===month);
    const received=round2(payments.reduce((s,p)=>s+p.amount,0));
    const outgoing=round2(paidExpenses.reduce((s,e)=>s+e.amount,0));
    const open=round2(rentals.reduce((s,r)=>s+dueForRental(r),0));
    const payable=round2(dueExpenses.filter(e=>!e.paidAt).reduce((s,e)=>s+e.amount,0));
    const dateLabel=new Intl.DateTimeFormat("pt-BR",{month:"long",year:"numeric"}).format(new Date(month+"-01T12:00:00"));
    const eye='<button type="button" class="outline-btn finance-hide-toggle" data-action="finance-toggle" aria-pressed="'+state.financeHidden+'" aria-label="'+(state.financeHidden?"Exibir valores financeiros":"Ocultar valores financeiros")+'">'+icon(state.financeHidden?"eye":"eye-off")+' '+(state.financeHidden?"Exibir valores":"Ocultar valores")+'</button>';
    const nav='<div class="finance-period"><button type="button" class="icon-btn" data-action="finance-prev" aria-label="Mês anterior">'+icon("chevron")+'</button><strong>'+safe(dateLabel)+'</strong><button type="button" class="icon-btn" data-action="finance-next" aria-label="Próximo mês">'+icon("chevron")+'</button><button class="outline-btn" type="button" data-action="finance-now">Mês atual</button></div>';
    const summary='<section class="finance-summary">'+
      financeMetric("Recebido",received,"Entradas efetivamente registradas","wallet")+
      financeMetric("Despesas pagas",outgoing,"Saídas registradas","credit-card")+
      financeMetric("Saldo do período",round2(received-outgoing),"Recebimentos menos pagamentos","check","primary")+
      financeMetric("A receber",open,"Aluguéis com saldo pendente","clock")+'</section>';
    const obligations='<div class="finance-help-line"><strong>Próximas ações</strong><span>Por receber nos aluguéis do mês: <b>'+money(open)+'</b> · despesas em aberto com vencimento no mês: <b>'+money(payable)+'</b></span></div>';
    const filters=[["all","Todas"],["income","Recebimentos"],["expense","Despesas"],["pending","Pendentes"]];
    const chips=filters.map(([key,label])=>'<button type="button" data-action="finance-filter" data-filter="'+key+'" class="chip'+(state.financeFilter===key?" active":"")+'" aria-pressed="'+(state.financeFilter===key)+'">'+label+'</button>').join("");
    const incomeRows=rentals.map(r=>{
      const due=dueForRental(r),paid=paidForRental(r.id);
      return {kind:"income",id:r.id,title:customer(r.clientId)?.name||"Cliente",subtitle:"Aluguel "+r.id+" · "+shortDate(r.from),
        date:r.from,amount:total(r),pending:due>0,settled:due<=0,
        html:'<td><span class="finance-type income">'+icon("arrow")+' Entrada</span></td><td><strong>'+safe(customer(r.clientId)?.name||"Cliente")+'</strong><small>Aluguel '+safe(r.id)+' · '+shortDate(r.from)+'</small></td>'+
        '<td>'+money(total(r))+'</td><td>'+(due>0?'<span class="badge ready">Falta '+money(due)+'</span>':'<span class="badge returned">Recebido</span>')+'</td>'+
        '<td class="align-end">'+(due>0?'<button class="mini-btn" type="button" data-action="finance-receive" data-id="'+safe(r.id)+'">Receber</button>':'<button class="text-btn" type="button" data-rental="'+safe(r.id)+'">Ver</button>')+'</td>'};
    });
    const expenseRows=dueExpenses.map(e=>({kind:"expense",id:e.id,date:e.due,amount:e.amount,pending:!e.paidAt,settled:!!e.paidAt,
      html:'<td><span class="finance-type expense">'+icon("credit-card")+' Saída</span></td><td><strong>'+safe(e.description)+'</strong><small>'+safe(e.category)+' · vence '+shortDate(e.due)+'</small></td>'+
      '<td>'+money(e.amount)+'</td><td>'+(e.paidAt?'<span class="badge returned">Paga</span>':'<span class="badge ready">A pagar</span>')+'</td>'+
      '<td class="align-end">'+(!e.paidAt?'<button class="mini-btn secondary" type="button" data-action="finance-pay" data-id="'+safe(e.id)+'">Marcar paga</button>':'<span class="finance-quiet">Concluída</span>')+'</td>'}));
    let rows=[...incomeRows,...expenseRows].filter(x=>state.financeFilter==="all"||(state.financeFilter==="pending"?x.pending:x.kind===state.financeFilter))
      .sort((a,b)=>a.date.localeCompare(b.date));
    const table=rows.map(x=>'<tr>'+x.html+'</tr>').join("")||'<tr><td colspan="5"><div class="placeholder"><strong>Nenhum lançamento encontrado.</strong>Você pode registrar uma despesa ou mudar o período.</div></td></tr>';
    const prefs='<p class="finance-disclaimer">Os dados são fictícios. <strong>Saldo do período</strong> representa entradas recebidas menos despesas pagas neste mês, não saldo bancário. Pagamentos parciais são considerados; valores previstos e recebidos não devem ser somados.</p>';
    return heading("Dinheiro em ordem","Financeiro","Acompanhe o que entrou, o que saiu e o que ainda precisa receber ou pagar.",
      '<button type="button" class="primary-btn" data-action="finance-add-expense">'+icon("plus")+' Nova despesa</button>')+
      infoBanner()+'<div class="finance-toolbar">'+nav+eye+'</div>'+summary+obligations+
      '<div class="filters finance-filterbar">'+chips+'</div>'+
      '<section class="panel"><div class="panel-head"><div><h2>Movimentações e pendências</h2><p>Recebimentos vinculados aos aluguéis e despesas do negócio</p></div></div>'+
      '<div class="table-wrap"><table class="data-table finance-table"><thead><tr><th>Tipo</th><th>Descrição</th><th>Valor total</th><th>Situação</th><th class="align-end">Ação</th></tr></thead><tbody>'+table+'</tbody></table></div></section>'+prefs;
  }
  function financeMetric(label,value,note,iconName,kind=""){
    return '<div class="finance-metric '+kind+'"><span class="finance-metric-top">'+safe(label)+icon(iconName)+'</span><strong>'+money(value)+'</strong><small>'+safe(note)+'</small></div>';
  }
  function expenseDialog(){
    return dialogHeader("DESPESAS DO NEGÓCIO","Registrar despesa")+
      '<form id="expense-form"><div class="dialog-body"><div class="form-grid">'+
      '<label class="form-field wide">Descrição *<input name="description" required maxlength="100" placeholder="Ex.: Transporte de itens"></label>'+
      '<label class="form-field">Categoria<select name="category"><option>Logística</option><option>Manutenção</option><option>Materiais</option><option>Administrativo</option><option>Outros</option></select></label>'+
      '<label class="form-field">Valor (R$) *<input name="amount" type="number" step="0.01" min="0.01" max="1000000" required placeholder="0,00"></label>'+
      '<label class="form-field">Vencimento *<input name="due" type="date" value="'+today+'" required></label>'+
      '<label class="form-field">Situação<select name="status"><option value="pending">A pagar</option><option value="paid">Já foi paga</option></select></label></div>'+
      '<p class="setting-hint">Essa despesa afeta o fluxo de caixa apenas quando é marcada como paga.</p></div>'+
      dialogFoot('<button type="button" class="outline-btn" data-action="close">Cancelar</button><button class="primary-btn" type="submit">'+icon("check")+' Salvar despesa</button>')+'</form>';
  }
  function receiveDialog(id){
    const r=db().rentals.find(x=>x.id===id);
    if(!r||r.status==="cancelled")return dialogHeader("RECEBIMENTO","Aluguel indisponível");
    const due=dueForRental(r);
    if(due<=0)return dialogHeader("RECEBIMENTO","Este aluguel já está quitado");
    return dialogHeader("REGISTRAR RECEBIMENTO","Recebimento de "+safe(customer(r.clientId)?.name||"cliente"))+
      '<form id="receive-form"><div class="dialog-body"><div class="finance-receive-overview"><strong>Aluguel '+safe(r.id)+'</strong>'+
      '<span>Total: '+money(total(r))+' · Recebido: '+money(paidForRental(r.id))+' · Falta: '+money(due)+'</span></div>'+
      '<input type="hidden" name="rentalId" value="'+safe(id)+'"><label class="form-field">Valor recebido agora (R$) *<input type="number" step="0.01" min="0.01" max="'+due.toFixed(2)+'" required name="amount" value="'+due.toFixed(2)+'"></label>'+
      '<p class="setting-hint">Aceita pagamento parcial. Não há movimentação bancária, Pix, cartão ou cobrança real nesta demo.</p></div>'+
      dialogFoot('<button type="button" class="outline-btn" data-action="close">Cancelar</button><button class="primary-btn" type="submit">'+icon("check")+' Confirmar recebimento</button>')+'</form>';
  }
  function saveExpense(form){
    const f=new FormData(form),description=String(f.get("description")||"").trim();
    const category=String(f.get("category")||"").trim(),amount=Number(f.get("amount")),due=String(f.get("due")||"");
    const status=String(f.get("status")||"");
    if(!description||description.length>100||!["Logística","Manutenção","Materiais","Administrativo","Outros"].includes(category)||
        !Number.isFinite(amount)||amount<=0||amount>1000000||!Number.isInteger(Math.round(amount*100))||
        Math.abs(amount*100-Math.round(amount*100))>0.00001||!isValidDay(due)||!["pending","paid"].includes(status)){
      notify("Confira os dados e o valor da despesa.");return;
    }
    const id="D-"+(++db().finance.nextExpense);
    db().finance.expenses.push({id,description,category,amount:round2(amount),due,paidAt:status==="paid"?today:null});
    state.financeMonth=due.slice(0,7);state.financeFilter="all";
    closeDialog();go("financeiro");notify("Despesa registrada na demonstração.");
  }
  function isValidDay(s){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;
    const d=new Date(s+"T12:00:00");return !Number.isNaN(d.getTime())&&iso(d)===s;
  }
  function saveReceive(form){
    const fd=new FormData(form),id=String(fd.get("rentalId")||"");
    const r=db().rentals.find(x=>x.id===id),amount=Number(fd.get("amount"));
    if(!r||r.status==="cancelled"||!Number.isFinite(amount)||amount<=0||
      Math.abs(amount*100-Math.round(amount*100))>.00001||round2(amount)>dueForRental(r)){
      notify("Valor inválido ou superior ao saldo disponível.");return;
    }
    db().finance.payments.push({id:"P-"+(++db().finance.nextPayment),rentalId:id,amount:round2(amount),date:today});
    closeDialog();render();notify("Recebimento de "+currency(amount)+" registrado na demonstração.");
  }
  function markExpensePaid(id){
    const expense=financeExpenses().find(e=>e.id===id);
    if(!expense||expense.paidAt)return;
    expense.paidAt=today;render();notify("Despesa marcada como paga no exemplo.");
  }
  function financePrivacySettings(){
    return '<section class="panel finance-privacy-panel"><div class="panel-head"><div><h2>Privacidade financeira</h2><p>Proteja valores de olhares próximos</p></div>'+icon("eye-off")+'</div>'+
      '<form id="finance-privacy-form"><div class="settings-form-body"><label class="accessibility-control" for="finance-private-default">'+
      '<input type="checkbox" name="hidden" id="finance-private-default"'+(settings().financeHiddenByDefault?" checked":"")+'>'+
      '<span><strong>Iniciar com valores ocultos</strong><small>Ao abrir ou trocar de negócio na demonstração, esconder totais e preços apresentados na interface.</small></span></label>'+
      '<p class="setting-hint">O botão de olho na tela Financeiro permite mostrar ou ocultar a qualquer momento. Não é uma medida de segurança de acesso: formulários de lançamento continuam exibindo os valores digitados.</p>'+
      '<div class="settings-footer"><button class="primary-btn" type="submit">'+icon("check")+' Salvar preferência</button></div></div></form></section>';
  }
  function saveFinancePrivacy(form){
    const fd=new FormData(form),hidden=fd.has("hidden");
    settings().financeHiddenByDefault=hidden;state.financeHidden=hidden;
    render();notify(hidden?"Valores ocultos por padrão.":"Valores visíveis por padrão.");
  }
  // Conta fictícia: autenticação, senha e dados de cobrança exigem API PHP em produção.
  function accountAvatar(){
    return demoAccount.photo?'<img alt="Foto do perfil" src="'+safe(demoAccount.photo)+'">':safe(initials(demoAccount.name));
  }
  function updateAccountTop(){
    const badge=$("account-avatar-top");if(badge)badge.innerHTML=accountAvatar();
  }
  function accountView(){
    return heading("Seu espaço","Minha conta","Atualize sua identificação e confira a situação da assinatura.")+
      infoBanner()+
      '<div class="account-grid"><section class="panel"><div class="panel-head"><div><h2>Meu perfil</h2><p>Informações pessoais e foto</p></div>'+icon("user")+'</div>'+
      '<form id="account-profile-form"><div class="settings-form-body"><div class="account-picture-line"><span class="account-big-avatar">'+accountAvatar()+'</span>'+
      '<div><label class="outline-btn logo-upload-label" for="account-photo-file">'+icon("pencil")+' Alterar foto</label>'+
      '<input class="visually-hidden-input" type="file" id="account-photo-file" accept="image/png,image/jpeg,image/webp">'+
      '<button type="button" class="text-btn" data-action="account-remove-photo"'+(demoAccount.photo?"":" hidden")+'>Remover</button>'+
      '<p class="setting-hint">PNG, JPG ou WebP, até 2 MB; imagem quadrada de até 160 px gerada localmente.</p></div></div>'+
      '<label class="form-field">Nome de exibição<input name="name" maxlength="90" required value="'+safe(demoAccount.name)+'"></label>'+
      '<div class="account-form-actions"><button class="primary-btn" type="submit">'+icon("check")+' Salvar perfil</button></div></div></form></section>'+
      '<section class="panel"><div class="panel-head"><div><h2>Acesso e segurança</h2><p>E-mail de login e senha</p></div>'+icon("shield")+'</div>'+
      '<div class="settings-form-body"><div class="account-data-line"><div><span>E-mail de acesso</span><strong>'+safe(demoAccount.email)+'</strong></div>'+
      '<button class="mini-btn secondary" type="button" data-action="account-change-email">Alterar</button></div>'+
      '<div class="account-data-line"><div><span>Senha</span><strong>••••••••</strong></div>'+
      '<button class="mini-btn secondary" type="button" data-action="account-password">Alterar</button></div>'+
      '<p class="setting-hint">Na plataforma real, mudanças de acesso exigirão confirmação segura e verificação de identidade. Não informe senhas reais nesta demo.</p></div></section>'+
      '<section class="panel"><div class="panel-head"><div><h2>Assinatura Locvia</h2><p>Situação e plano da plataforma</p></div>'+icon("credit-card")+'</div>'+
      '<div class="settings-form-body"><div class="account-subscription-plan"><span><strong>Demonstração</strong><small>Ambiente de avaliação, sem cobrança ativa</small></span><span class="badge returned">Sem assinatura</span></div>'+
      '<div class="account-data-line"><div><span>Plano atual</span><strong>Nenhum plano contratado</strong></div></div>'+
      '<div class="account-data-line"><div><span>Forma de pagamento</span><strong>Não cadastrada</strong></div></div>'+
      '<a class="outline-btn" href="mailto:uillaneduardo@ulln.com.br?subject=Locvia%20-%20planos%20e%20assinaturas">'+icon("mail")+' Consultar planos</a>'+
      '<p class="setting-hint">A contratação, a cobrança e a troca de cartão não estão disponíveis na demonstração.</p></div></section>'+
      '<section class="panel"><div class="panel-head"><div><h2>Histórico da assinatura</h2><p>Faturas e pagamentos do Locvia</p></div>'+icon("wallet")+'</div>'+
      '<div class="settings-form-body"><div class="account-empty-billing">'+icon("credit-card")+'<strong>Nenhuma cobrança realizada</strong><p>Quando houver uma assinatura ativa na plataforma real, as faturas e os comprovantes ficarão aqui.</p></div></div></section></div>';
  }
  function accountEmailDialog(){
    return dialogHeader("MINHA CONTA","Alterar e-mail de acesso")+
      '<form id="account-email-form"><div class="dialog-body"><p class="setting-hint">A mudança será simulada somente nesta aba. Em produção, o novo endereço deve ser verificado por e-mail.</p>'+
      '<label class="form-field">Novo e-mail<input type="email" name="email" required maxlength="150" autocomplete="off" value="'+safe(demoAccount.email)+'"></label></div>'+
      dialogFoot('<button class="outline-btn" data-action="close" type="button">Cancelar</button><button class="primary-btn" type="submit">Atualizar e-mail na demo</button>')+'</form>';
  }
  function passwordDialog(){
    return dialogHeader("SEGURANÇA DA CONTA","Alterar senha")+
      '<div class="dialog-body"><div class="warn-inline">'+icon("shield")+'A alteração de senha depende de autenticação real, validação da senha atual, controle de tentativas e sessões. Essas funções ainda não existem no protótipo.</div>'+
      '<p class="setting-hint">Não solicitamos nem armazenamos senhas nesta demonstração. Na plataforma operacional, esta ação abrirá um fluxo seguro de troca e revogação de sessões.</p></div>'+
      dialogFoot('<button class="primary-btn" data-action="close" type="button">Entendi</button>');
  }
  function saveAccountProfile(form){
    const fd=new FormData(form),name=String(fd.get("name")||"").trim();
    if(name.length<2||name.length>90){notify("Digite um nome de exibição válido.");return;}
    demoAccount.name=name;render();notify("Perfil atualizado nesta demonstração.");
  }
  function saveAccountEmail(form){
    const fd=new FormData(form),email=String(fd.get("email")||"").trim();
    if(email.length>150||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){notify("Informe um endereço de e-mail válido.");return;}
    demoAccount.email=email;closeDialog();render();notify("E-mail alterado apenas na demonstração. Nenhuma verificação foi enviada.");
  }
  function readAccountPhoto(file){
    if(!file)return;
    if(!["image/png","image/jpeg","image/webp"].includes(file.type)||file.size>2*1024*1024||!file.size){
      notify("Use PNG, JPG ou WebP de até 2 MB.");return;
    }
    const reader=new FileReader();
    reader.onerror=()=>notify("Não foi possível ler a foto.");
    reader.onload=()=>{
      const img=new Image();
      img.onerror=()=>notify("Imagem inválida.");
      img.onload=()=>{
        if(img.naturalWidth<64||img.naturalHeight<64||img.naturalWidth>4096||img.naturalHeight>4096){
          notify("Use foto com lados entre 64 e 4096 pixels.");return;
        }
        const canvas=document.createElement("canvas");
        canvas.width=160;canvas.height=160;
        const ctx=canvas.getContext("2d");
        if(!ctx){notify("Este navegador não permite tratar a foto.");return;}
        const size=Math.min(img.naturalWidth,img.naturalHeight);
        ctx.drawImage(img,(img.naturalWidth-size)/2,(img.naturalHeight-size)/2,size,size,0,0,160,160);
        try{demoAccount.photo=canvas.toDataURL("image/png");render();notify("Foto atualizada na demonstração.");}
        catch(_){notify("Não foi possível preparar a foto.");}
      };img.src=reader.result;
    };reader.readAsDataURL(file);
  }

  function logoPreviewMarkup() {
    return settings().logo
      ? '<img src="'+safe(settings().logo)+'" alt="Logotipo atual de '+safe(settings().name)+'">'
      : '<div class="logo-placeholder">'+icon("box")+'<span>Sem logotipo</span></div>';
  }

  const noticeKinds={
    prepare:{label:"Separar itens",icon:"box",className:"amber"},
    pickup:{label:"Retirada pendente",icon:"truck",className:"indigo"},
    returnDue:{label:"Devolução próxima",icon:"clock",className:"blue"},
    overdue:{label:"Devolução atrasada",icon:"alert",className:"red"}
  };
  function activeNotices(){
    const pref=settings().notifications;
    if(!pref.enabled)return [];
    const notices=[];
    for(const r of db().rentals){
      const who=customer(r.clientId)?.name||"Cliente";
      const items=r.items.map(x=>product(x.id)?.name||"Item").join(", ");
      let kind=null,detail="",priority=99;
      if(r.status==="out" && r.to<today && pref.overdue){
        kind="overdue";detail="Deveria ter voltado em "+shortDate(r.to);priority=0;
      }else if(r.status==="reserved" && r.from<=offset(settings().preparationDays) && pref.prepare){
        kind="prepare";detail="Separar para "+shortDate(r.from);priority=1;
      }else if(r.status==="ready" && r.from<=offset(1) && pref.pickup){
        kind="pickup";detail="Retirada prevista para "+shortDate(r.from);priority=2;
      }else if(r.status==="out" && r.to>=today && r.to<=offset(pref.daysBeforeReturn) && pref.returnDue){
        kind="returnDue";detail="Receber até "+shortDate(r.to);priority=3;
      }
      if(kind)notices.push({kind,detail,priority,r,who,items});
    }
    return notices.sort((a,b)=>a.priority-b.priority||a.r.from.localeCompare(b.r.from));
  }
  function updateNoticeBadge(){
    const count=activeNotices().length;
    const badge=$("notification-count");
    const trigger=$("notification-trigger");
    if(badge){badge.textContent=count>9?"9+":String(count);badge.hidden=count===0;}
    if(trigger)trigger.setAttribute("aria-label","Abrir avisos do negócio: "+count+" "+(count===1?"aviso":"avisos"));
  }
  function notificationsDialog(){
    const records=activeNotices(),pref=settings().notifications;
    const cards=records.map(n=>{
      const config=noticeKinds[n.kind];
      return '<button class="notice-entry" type="button" data-rental="'+safe(n.r.id)+'">'+
        '<span class="task-icon '+config.className+'">'+icon(config.icon)+'</span>'+
        '<span class="notice-info"><strong>'+safe(config.label)+' · '+safe(n.who)+'</strong>'+
        '<small>'+safe(n.items)+'</small><small>'+safe(n.detail)+' · '+safe(n.r.id)+'</small></span>'+
        icon("chevron")+'</button>';
    }).join("")||'<div class="placeholder"><strong>Nenhum aviso no momento.</strong>'+
      (pref.enabled?"Sua rotina está em dia ou as categorias estão desativadas.":"Os avisos estão desativados nas Configurações.")+'</div>';
    return dialogHeader("AVISOS DA DEMONSTRAÇÃO","O que merece atenção")+
      '<div class="dialog-body"><div class="warn-inline">'+icon("info")+
      'São avisos internos calculados a partir dos aluguéis. Não enviamos push, mensagens, e-mail ou SMS.</div>'+
      '<div class="notice-list">'+cards+'</div></div>'+
      dialogFoot('<button class="outline-btn" type="button" data-action="close">Fechar</button>'+
      '<button class="primary-btn" type="button" data-action="notification-settings">'+icon("settings")+' Configurar avisos</button>');
  }
  function notificationSettingsMarkup(){
    const n=settings().notifications;
    const checkbox=(key,label,desc)=>'<label class="notification-choice"><input type="checkbox" name="'+key+'"'+(n[key]?" checked":"")+
      '><span><strong>'+label+'</strong><small>'+desc+'</small></span></label>';
    return '<section class="panel notifications-settings"><div class="panel-head"><div><h2>Notificações</h2><p>Escolha o que merece um aviso dentro do Locvia</p></div>'+icon("bell")+'</div>'+
      '<form id="notification-settings-form"><div class="settings-form-body">'+
      checkbox("enabled","Ativar avisos internos","Exibir o contador no sino e as situações que exigem atenção")+
      '<div class="notification-options">'+
      checkbox("prepare","Itens para separar","Preparação de aluguéis próximos ou pendentes")+
      checkbox("pickup","Retiradas","Aluguéis separados com retirada prevista ou pendente")+
      checkbox("returnDue","Devoluções próximas","Itens com cliente cuja data de devolução está chegando")+
      checkbox("overdue","Devoluções atrasadas","Itens ainda com cliente depois da data prevista")+
      '<label class="form-field">Avisar sobre devoluções com antecedência<select name="daysBeforeReturn">'+
      [0,1,2,3,5,7].map(x=>'<option value="'+x+'"'+(x===n.daysBeforeReturn?" selected":"")+'>'+x+(x===1?" dia":" dias")+'</option>').join("")+'</select></label>'+
      '</div><div class="settings-footer"><button class="primary-btn" type="submit">'+icon("check")+' Salvar notificações</button></div>'+
      '<p class="setting-hint">Esses avisos são exibidos somente dentro da demonstração. Você não receberá notificações fora dela. As tarefas de Hoje continuam visíveis mesmo que os avisos do sino sejam desativados.</p></div></form></section>';
  }
  function saveNotificationSettings(form){
    const fd=new FormData(form),days=Number(fd.get("daysBeforeReturn"));
    if(![0,1,2,3,5,7].includes(days)){notify("Escolha uma antecedência válida.");return;}
    const enabled=fd.has("enabled");
    const config={enabled,daysBeforeReturn:days};
    for(const kind of ["prepare","pickup","returnDue","overdue"])config[kind]=fd.has(kind);
    settings().notifications=config;
    render();
    notify(enabled?"Preferências de notificações atualizadas.":"Avisos internos desativados. As tarefas continuam em Hoje.");
  }

  function settingsView(){
    const prefs=settings();
    return heading("Seu jeito de trabalhar","Configurações","Ajustes do negócio e da rotina de aluguéis neste cenário.")+infoBanner()+
      '<div class="settings-layout"><section class="panel settings-panel"><div class="panel-head"><div><h2>Dados do negócio</h2><p>Como a sua empresa aparece no Locvia</p></div>'+icon("settings")+'</div>'+
      '<form id="settings-form"><div class="settings-form-body"><label class="form-field wide">Nome do negócio<input name="businessName" maxlength="70" required value="'+safe(prefs.name)+'"></label>'+
      '<div class="settings-preview"><span id="settings-brand-avatar" class="round-initials'+(prefs.logo?" has-logo":"")+'">'+(prefs.logo?'<img class="branding-logo" src="'+safe(prefs.logo)+'" alt="Logo do negócio">':safe(config().initials))+'</span><div><strong>'+safe(prefs.name)+'</strong><small>Cenário de '+safe(config().display.toLowerCase())+'</small></div></div>'+
      '<div class="personalization-section" id="brand-config"><h3>Logotipo do negócio</h3><p class="section-description">Use uma imagem quadrada para identificar seu negócio no Locvia. A marca Locvia continua no topo do aplicativo.</p>'+
      '<div class="logo-settings-layout"><div id="settings-logo-preview" class="logo-sample">'+logoPreviewMarkup()+'</div><div class="logo-controls"><div class="logo-buttons">'+
      '<input class="visually-hidden-input" type="file" id="logo-file" accept="image/png,image/jpeg,image/webp" aria-describedby="logo-file-help">'+
      '<label class="outline-btn logo-upload-label" for="logo-file" id="logo-upload-label">'+icon("pencil")+(prefs.logo?" Trocar imagem":" Carregar imagem")+'</label>'+
      '<button type="button" class="outline-btn" data-action="view-logo" id="logo-view"'+(prefs.logo?"":" hidden")+'>Ver imagem</button>'+
      '<button type="button" class="outline-btn danger-text" data-action="remove-logo" id="logo-remove"'+(prefs.logo?"":" hidden")+'>Remover</button></div>'+
      '<p class="logo-help" id="logo-file-help"><strong>PNG, JPG ou WebP</strong> · até <strong>5 MB</strong> · de <strong>128 × 128</strong> a <strong>4096 × 4096 pixels</strong>. Recomendamos 512 × 512. Você pode recortar para 1:1 antes de usar.</p></div></div></div>'+
      '<div class="form-section">Organização dos aluguéis</div>'+
      '<label class="form-field wide">Lembrar de separar com quantos dias de antecedência?<select name="preparationDays">'+[0,1,2,3,5,7].map(n=>'<option value="'+n+'"'+(n===prefs.preparationDays?" selected":"")+'>'+n+(n===1?" dia":" dias")+'</option>').join("")+'</select></label>'+
      '<p class="setting-hint">Esse prazo define quando um aluguel aparece como pendência no painel Hoje.</p>'+
      '<label class="form-field wide">Duração sugerida para novos aluguéis<select name="defaultDays">'+[0,1,2,3,5,7,14,30].map(n=>'<option value="'+n+'"'+(n===prefs.defaultDays?" selected":"")+'>'+n+(n===1?" dia":" dias")+'</option>').join("")+'</select></label>'+
      '<p class="setting-hint">Sugere a data de devolução ao abrir um novo aluguel. Você pode ajustar o período.</p>'+
      '<div class="personalization-section"><h3>Aparência do Locvia</h3><p class="section-description">Escolha uma cor de destaque para os botões, seleções e ações. As mudanças aparecem na hora.</p>'+
      '<div class="brand-palette" role="group" aria-label="Paleta de cores de destaque">'+[
        ["#455CD4","Índigo"],["#0F766E","Verde-petróleo"],["#1D4ED8","Azul"],["#7C3AED","Violeta"],
        ["#B45309","Âmbar"],["#BE185D","Rosa"],["#0E7490","Ciano"],["#334155","Grafite"]
      ].map(([color,label])=>'<button type="button" class="color-choice" data-action="accent-preset" data-color="'+color+'" aria-pressed="'+(prefs.accent===color)+'" aria-label="Cor '+label+'" title="'+label+'"><span class="color-dot" style="background:'+color+'">'+(prefs.accent===color?icon("check"):"")+'</span></button>').join("")+'</div>'+
      '<div class="custom-color-row"><label class="form-field" for="custom-accent">Ou informe uma cor hexadecimal<input type="text" id="custom-accent" maxlength="7" autocomplete="off" spellcheck="false" value="'+safe(prefs.accent)+'" placeholder="#455CD4" aria-describedby="color-feedback"></label>'+
      '<button type="button" class="outline-btn" data-action="accent-custom">Aplicar cor</button></div><div id="color-feedback" class="color-feedback" role="status" aria-live="polite">Cor atual: '+safe(prefs.accent)+'</div>'+
      '<div class="form-section">Tema da interface</div><div class="theme-options" role="group" aria-label="Tema da interface">'+
      '<button type="button" class="theme-choice" data-action="set-theme" data-mode="light" aria-pressed="'+(prefs.mode==="light")+'">'+icon("sun")+' Claro</button>'+
      '<button type="button" class="theme-choice" data-action="set-theme" data-mode="dark" aria-pressed="'+(prefs.mode==="dark")+'">'+icon("moon")+' Escuro</button></div>'+
      '<label class="accessibility-control" for="accessibility-toggle"><input id="accessibility-toggle" type="checkbox"'+(prefs.accessibility?" checked":"")+'><span><strong>Modo de acessibilidade</strong><small>Texto maior, contraste reforçado, controles maiores, foco destacado e menos animações.</small></span></label>'+
      '<div class="personalization-note">A aparência e o logotipo são exclusivos desta demonstração. Ao recarregar a página, tudo volta ao padrão.</div></div>'+
      '<div class="settings-footer"><button class="primary-btn" type="submit">'+icon("check")+' Salvar preferências</button></div></div></form></section>'+
      '<aside class="settings-sidebar">'+notificationSettingsMarkup()+'<section class="panel"><div class="panel-head"><div><h2>Dados da demonstração</h2><p>Faça novos testes quando quiser</p></div></div><div class="settings-form-body"><p class="setting-hint">As alterações em clientes, itens, aluguéis e preferências permanecem somente enquanto esta página estiver aberta. Recarregar restaura os exemplos.</p><button type="button" class="outline-btn danger-text" data-action="reset-confirm">'+icon("refresh")+' Restaurar exemplos</button></div></section>'+
      '<section class="panel"><div class="panel-head"><div><h2>Sobre esta versão</h2><p>O que você pode experimentar</p></div></div><div class="settings-form-body"><div class="setting-line">'+icon("shield")+'<span>Disponibilidade por período e quantidade</span></div><div class="setting-line">'+icon("bell")+'<span>Avisos internos sobre tarefas de aluguel</span></div><div class="setting-line">'+icon("users")+'<span>Clientes e histórico de aluguéis</span></div><p class="setting-hint">Autenticação, notificações externas, pagamentos e sincronização entre usuários não fazem parte desta demonstração.</p></div></section></aside></div>';
  }
  function customerFormDialog(id){
    const c=id?customer(id):null;
    if(id&&!c)return dialogHeader("CLIENTE","Não encontrado");
    return dialogHeader(c?"EDITAR CLIENTE":"NOVO CLIENTE",c?"Editar "+c.name:"Cadastrar cliente")+
      '<form id="customer-form"><div class="dialog-body"><div class="form-grid">'+
      '<label class="form-field wide">Nome ou razão social *<input name="name" required maxlength="90" autocomplete="off" value="'+safe(c?.name||"")+'" placeholder="Ex.: Maria Oliveira"></label>'+
      '<label class="form-field">Telefone (opcional)<input name="phone" type="tel" maxlength="25" value="'+safe(c?.phone||"")+'" placeholder="(81) 99999-9999"></label>'+
      '<label class="form-field">E-mail (opcional)<input name="email" type="email" maxlength="120" value="'+safe(c?.email||"")+'" placeholder="cliente@exemplo.com"></label>'+
      '<label class="form-field wide">Observações (opcional)<input name="notes" maxlength="200" value="'+safe(c?.notes||"")+'" placeholder="Ex.: Retira no endereço da loja"></label></div>'+
      '<p class="info-after">Esses dados servem apenas para testar o cadastro na demo. Não informe dados pessoais reais.</p></div>'+
      dialogFoot('<button type="button" class="outline-btn" data-action="close">Cancelar</button><button type="submit" class="primary-btn">'+icon("check")+' Salvar cliente</button>')+
      '</form>';
  }
  function itemFormDialog(id){
    const p=id?product(id):null;
    if(id&&!p)return dialogHeader("ITEM","Não encontrado");
    return dialogHeader(p?"EDITAR ITEM":"NOVO ITEM",p?"Editar "+p.name:"Cadastrar item")+
      '<form id="item-form"><div class="dialog-body"><div class="form-grid">'+
      '<label class="form-field wide">Nome do item *<input name="name" required maxlength="90" autocomplete="off" value="'+safe(p?.name||"")+'" placeholder="Ex.: Mesa redonda"></label>'+
      '<label class="form-field">Categoria *<input name="category" required maxlength="45" value="'+safe(p?.category||"")+'" placeholder="Ex.: Decoração"></label>'+
      '<label class="form-field">Quantidade total *<input name="stock" required type="number" min="0" max="100000" step="1" value="'+(p?.stock??1)+'"></label>'+
      '<label class="form-field wide">Valor por aluguel (R$) *<input name="price" required type="number" min="0" max="1000000" step="0.01" value="'+(p?.price??0)+'"></label></div>'+
      '<p class="info-after">O valor é uma referência simples por unidade. A quantidade não pode ser reduzida abaixo do que já está comprometido em aluguéis.</p></div>'+
      dialogFoot('<button type="button" class="outline-btn" data-action="close">Cancelar</button><button type="submit" class="primary-btn">'+icon("check")+' Salvar item</button>')+
      '</form>';
  }
  function deleteDialog(type,id){
    const entity=type==="delete-customer"?"customer":"item";
    const model=entity==="customer"?customer(id):product(id);
    if(!model)return dialogHeader("EXCLUSÃO","Registro não encontrado");
    const refs=db().rentals.filter(r=>entity==="customer"?r.clientId===id:r.items.some(l=>l.id===id));
    const blocked=refs.length>0;
    return dialogHeader("EXCLUIR "+(entity==="customer"?"CLIENTE":"ITEM"),"Excluir "+model.name+"?")+
      '<div class="dialog-body"><p class="setting-hint">'+(blocked?
        'Este registro aparece em '+refs.length+' '+(refs.length===1?"aluguel":"aluguéis")+'. Para preservar o histórico, não pode ser excluído. Você pode editar seus dados.':
        'A exclusão retira o registro desta demonstração. Essa ação não pode ser desfeita sem restaurar os exemplos.')+'</p>'+
      (blocked?'<div class="warn-inline red">'+icon("alert")+'Exclusão indisponível: existem aluguéis vinculados, inclusive no histórico.</div>':"")+
      '</div>'+dialogFoot('<button type="button" class="outline-btn" data-action="close">Fechar</button>'+
      (blocked?'':'<button type="button" class="primary-btn destructive" data-action="delete-confirm" data-entity="'+entity+'" data-id="'+safe(id)+'">'+icon("trash")+' Confirmar exclusão</button>'));
  }
  function performDeletion(entity,id){
    if(!["customer","item"].includes(entity))return;
    const isCustomer=entity==="customer";
    const model=isCustomer?customer(id):product(id);
    if(!model)return;
    if(db().rentals.some(r=>isCustomer?r.clientId===id:r.items.some(l=>l.id===id))){
      notify("Registro em uso. Não é possível excluir.");return;
    }
    const list=isCustomer?db().clients:db().items;
    const at=list.findIndex(p=>p.id===id);if(at===-1)return;
    list.splice(at,1);closeDialog();render();notify((isCustomer?"Cliente":"Item")+" excluído da demonstração.");
  }
  function maxCommittedStock(id){
    const involved=db().rentals.filter(r=>exists(r)&&r.items.some(l=>l.id===id));
    if(!involved.length)return 0;
    const first=involved.reduce((d,r)=>r.from<d?r.from:d,involved[0].from);
    return peakOccupied(id,first,"9999-12-31");
  }
  function saveCustomer(form){
    const data=new FormData(form),name=String(data.get("name")||"").trim();
    const phone=String(data.get("phone")||"").trim(),email=String(data.get("email")||"").trim();
    const notes=String(data.get("notes")||"").trim();
    const id=state.dialog?.id,c=id?customer(id):null;
    if((id&&!c)||!name||name.length>90||phone.length>25||email.length>120||notes.length>200){
      notify("Confira os dados do cliente.");return;
    }
    if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){notify("Informe um e-mail válido.");return;}
    if(db().clients.some(x=>x.id!==id&&x.name.toLocaleLowerCase("pt-BR")===name.toLocaleLowerCase("pt-BR"))){
      notify("Já existe um cliente com esse nome.");return;
    }
    if(c){Object.assign(c,{name,phone,email,notes});}
    else db().clients.push({id:"cli-"+(++db().nextClientId),name,phone,email,notes});
    closeDialog();render();notify(c?"Cliente atualizado.":"Cliente cadastrado.");
  }
  function saveItem(form){
    const data=new FormData(form),name=String(data.get("name")||"").trim(),category=String(data.get("category")||"").trim();
    const stockString=String(data.get("stock")||""),priceString=String(data.get("price")||"");
    const stock=Number(stockString),price=Number(priceString);
    const id=state.dialog?.id,p=id?product(id):null;
    if((id&&!p)||!name||name.length>90||!category||category.length>45||!stockString||!Number.isSafeInteger(stock)||stock<0||stock>100000||
       !priceString||!Number.isFinite(price)||price<0||price>1000000||Math.abs(Math.round(price*100)-price*100)>0.000001){
      notify("Revise nome, categoria, quantidade e valor.");return;
    }
    if(db().items.some(x=>x.id!==id&&x.name.toLocaleLowerCase("pt-BR")===name.toLocaleLowerCase("pt-BR"))){
      notify("Já existe um item com esse nome.");return;
    }
    const min=p?maxCommittedStock(id):0;
    if(stock<min){notify("Estoque insuficiente: "+min+" unidade(s) já comprometida(s) em aluguéis.");return;}
    if(p){Object.assign(p,{name,category,stock,price});}
    else db().items.push({id:"item-"+(++db().nextItemId),name,category,stock,price,emoji:"📦"});
    closeDialog();render();notify(p?"Item atualizado.":"Item cadastrado.");
  }
  function saveSettings(form){
    const data=new FormData(form),name=String(data.get("businessName")||"").trim();
    const preparationDays=Number(data.get("preparationDays")),defaultDays=Number(data.get("defaultDays"));
    if(!name||name.length>70||![0,1,2,3,5,7].includes(preparationDays)||
       ![0,1,2,3,5,7,14,30].includes(defaultDays)){notify("Confira as preferências.");return;}
    Object.assign(settings(),{name,preparationDays,defaultDays});
    render();notify("Preferências atualizadas nesta demonstração.");
  }
  function resetConfirmDialog(){
    return dialogHeader("RESTAURAR CENÁRIO","Restaurar dados de exemplo?")+
      '<div class="dialog-body"><p class="setting-hint">Todos os clientes, itens, aluguéis e ajustes feitos no cenário '+safe(config().display)+' voltarão ao início. Outros cenários não serão afetados.</p></div>'+
      dialogFoot('<button type="button" class="outline-btn" data-action="close">Cancelar</button><button type="button" class="primary-btn destructive" data-action="reset">Restaurar cenário</button>');
  }

  function render() {
    const views={hoje:todayView,alugueis:rentalsView,itens:itemsView,clientes:clientsView,financeiro:financeView,configuracoes:settingsView,conta:accountView};
    screen.innerHTML=views[state.view]();
    $("crumb").textContent=titles[state.view];
    $("workspace-name").textContent=settings().name;
    paintPersonalization();
    updateLogoBrand();
    sectorSelect.value=state.segment;
    updateAccountTop();
    updateNoticeBadge();
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
    if(state.dialog?.type==="logo-crop")cropState=null;
    modal.hidden=true;modal.innerHTML="";state.dialog=null;document.body.style.overflow="";
    if(returnFocus && returnFocus.isConnected)returnFocus.focus();
  }
  function dialogHeader(kicker,title){
    return '<header class="dialog-head"><div><small>'+safe(kicker)+'</small><h2 id="dialog-title">'+safe(title)+'</h2></div><button class="icon-btn" type="button" data-action="close" aria-label="Fechar">'+icon("close")+'</button></header>';
  }
  const dialogFoot=(buttons)=>'<footer class="dialog-foot">'+buttons+'</footer>';
  function startNew() {
    if(!db().clients.length){go("clientes");notify("Cadastre um cliente antes de registrar um aluguel.");openDialog("customer-form");return;}
    if(!db().items.length){go("itens");notify("Cadastre um item antes de registrar um aluguel.");openDialog("item-form");return;}
    state.draft={clientId:db().clients[0].id,from:offset(1),to:offset(1+settings().defaultDays),items:[]};
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
    const options=[...db().items].sort((a,b)=>Number(availability(b.id,d.from,d.to)>0)-Number(availability(a.id,d.from,d.to)>0)).map(p=>'<option value="'+safe(p.id)+'">'+safe(p.name)+'</option>').join("");
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

  function itemDialog(id) {
    const p=product(id);
    if(!p)return dialogHeader("ITEM","Item não encontrado");
    const from=state.stockFrom,to=state.stockTo;
    const valid=Boolean(from&&to&&from<=to);
    const free=valid?availability(id,from,to):0;
    const using=valid?holders(id,from,to):[];
    const history=db().rentals.filter(r=>r.items.some(l=>l.id===id)).sort((a,b)=>b.from.localeCompare(a.from)).slice(0,8);
    const reservations=using.length?using.map(r=>
      '<div class="item-detail-rental"><span><strong>'+safe(customer(r.clientId)?.name||"Cliente")+'</strong><small>'+
      safe(r.status==="out"?"Ainda com o cliente":shortDate(r.from)+" a "+shortDate(r.to))+'</small></span>'+statusBadge(r)+'</div>'
    ).join(""):'<p class="setting-hint">Nenhum aluguel ocupa este item no período selecionado.</p>';
    const historyMarkup=history.length?history.map(r=>'<button type="button" class="detail-rental-link" data-rental="'+safe(r.id)+'"><span>'+safe(r.id)+' · '+safe(customer(r.clientId)?.name||"Cliente")+'</span>'+icon("chevron")+'</button>').join(""):'<p class="setting-hint">Ainda não há aluguéis para este item.</p>';
    return dialogHeader("MEUS ITENS","Detalhes de "+p.name)+
      '<div class="dialog-body"><div class="item-detail-heading"><span class="item-detail-emoji" aria-hidden="true">'+safe(p.emoji)+'</span><div><strong>'+safe(p.name)+'</strong><small>'+safe(p.category)+'</small></div></div>'+
      '<div class="detail-info item-detail-overview"><div><label>Quantidade total</label><strong>'+p.stock+' unidade(s)</strong></div>'+
      '<div><label>Valor por aluguel</label><strong>'+money(p.price)+'</strong></div>'+
      '<div><label>'+(valid?'Livres de '+safe(shortDate(from))+' a '+safe(shortDate(to)):'Disponibilidade no período')+'</label><strong class="'+(free===0?"none":"")+'">'+(valid?free+' de '+p.stock:'Confira as datas')+'</strong></div>'+
      '<div><label>Comprometidas nesse período</label><strong>'+(valid?p.stock-free:"—")+' unidade(s) no pico</strong></div></div>'+
      '<div class="form-section">Com quem está / reservas no período</div><div class="item-rentals">'+reservations+'</div>'+
      '<div class="form-section">Histórico recente</div><div class="item-history">'+historyMarkup+'</div>'+
      '<p class="info-after">Os valores e dados desta demonstração não são salvos após recarregar a página.</p></div>'+
      dialogFoot('<button type="button" class="outline-btn danger-text" data-action="delete-item" data-id="'+safe(id)+'">'+icon("trash")+' Excluir</button>'+
      '<button type="button" class="outline-btn" data-action="close">Fechar</button>'+
      '<button type="button" class="primary-btn" data-action="edit-item" data-id="'+safe(id)+'">'+icon("pencil")+' Editar item</button>');
  }

  function customerDialog(id){
    const c=customer(id);if(!c)return dialogHeader("CLIENTE","Não encontrado");
    const list=db().rentals.filter(r=>r.clientId===id).sort((a,b)=>b.from.localeCompare(a.from));
    const rows=list.map(r=>'<tr><td><button type="button" class="text-btn" data-rental="'+safe(r.id)+'">'+safe(r.id)+'</button></td><td>'+shortDate(r.from)+'</td><td>'+statusBadge(r)+'</td></tr>').join("")||'<tr><td colspan="3">Nenhum aluguel neste exemplo.</td></tr>';
    return dialogHeader("CLIENTE","Histórico de "+safe(c.name))+
      '<div class="dialog-body"><div class="detail-info"><div><label>Cliente</label><strong>'+safe(c.name)+'</strong></div><div><label>Quantidade de aluguéis</label><strong>'+list.length+'</strong></div></div>'+
      '<div class="form-section">Registros</div><table class="rent-items"><tbody>'+rows+'</tbody></table></div>'+
      dialogFoot('<button type="button" class="outline-btn" data-action="edit-customer" data-id="'+safe(c.id)+'">Editar</button><button type="button" class="outline-btn danger-text" data-action="delete-customer" data-id="'+safe(c.id)+'">Excluir</button><button type="button" class="outline-btn" data-action="close">Fechar</button>');
  }
  function renderDialog(){
    if(!state.dialog)return;
    const d=state.dialog;
    modal.innerHTML='<section class="dialog'+(d.type==="logo-crop"?" crop-dialog":"")+'" role="dialog" aria-modal="true" aria-labelledby="dialog-title">'+
      (d.type==="new"?newDialog():d.type==="rental"?rentalDialog(d.id):d.type==="customer"?customerDialog(d.id):d.type==="item"?itemDialog(d.id):d.type==="customer-form"?customerFormDialog(d.id):d.type==="item-form"?itemFormDialog(d.id):d.type==="logo-crop"?cropDialog():d.type==="logo-view"?logoViewDialog():d.type==="notifications"?notificationsDialog():d.type==="reset-confirm"?resetConfirmDialog():deleteDialog(d.type,d.id))+"</section>";
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
    const selectedItem=event.target.closest("[data-item]");
    if(selectedItem){openDialog("item",selectedItem.dataset.item);return;}
    const rental=event.target.closest("[data-rental]");
    if(rental){openDialog("rental",rental.dataset.rental);return;}
    const client=event.target.closest("[data-customer]");
    if(client && !event.target.closest("[data-action]")){openDialog("customer",client.dataset.customer);return;}
    const filter=event.target.closest("[data-filter]");
    if(filter){state.filter=filter.dataset.filter;render();return;}
    const action=event.target.closest("[data-action]");
    if(!action)return;
    const kind=action.dataset.action;
    if(kind==="new")startNew();
    if(kind==="open-notifications")openDialog("notifications");
    if(kind==="notification-settings"){closeDialog();go("configuracoes");}
    if(kind==="rentals-list"){state.rentalsMode="list";render();}
    if(kind==="rentals-calendar"){state.rentalsMode="calendar";render();}
    if(kind==="calendar-prev")moveCalendarMonth(-1);
    if(kind==="calendar-next")moveCalendarMonth(1);
    if(kind==="calendar-today"){state.calendarMonth=today.slice(0,7);state.calendarDay=today;render();}
    if(kind==="calendar-day"&&/^\d{4}-\d{2}-\d{2}$/.test(action.dataset.day)){
      state.calendarDay=action.dataset.day;
      state.calendarMonth=action.dataset.day.slice(0,7);
      render();
    }
    if(kind==="add-customer")openDialog("customer-form");
    if(kind==="edit-customer")openDialog("customer-form",action.dataset.id);
    if(kind==="delete-customer")openDialog("delete-customer",action.dataset.id);
    if(kind==="add-item")openDialog("item-form");
    if(kind==="toggle-items-view"){state.itemsMode=state.itemsMode==="grid"?"list":"grid";render();}
    if(kind==="edit-item")openDialog("item-form",action.dataset.id);
    if(kind==="delete-item")openDialog("delete-item",action.dataset.id);
    if(kind==="delete-confirm")performDeletion(action.dataset.entity,action.dataset.id);
    if(kind==="reset-confirm")openDialog("reset-confirm");
    if(kind==="view-logo"){if(settings().logo)openDialog("logo-view");else notify("Carregue um logotipo antes de visualizar.");}
    if(kind==="remove-logo"){
      if(settings().logo){settings().logo=null;updateLogoBrand();notify("Logotipo removido deste negócio.");}
    }
    if(kind==="crop-save")saveLogoCrop();
    if(kind==="crop-center"&&cropState){cropState.panX=0;cropState.panY=0;cropState.zoom=1;const zoom=$("logo-crop-zoom");if(zoom)zoom.value="1";drawLogoCrop();}
    if(kind==="accent-preset")chooseAccent(action.dataset.color);
    if(kind==="accent-custom")chooseAccent($("custom-accent")?.value);
    if(kind==="set-theme"&&["light","dark"].includes(action.dataset.mode)){
      settings().mode=action.dataset.mode;paintPersonalization();updateAppearanceControls();
      notify(action.dataset.mode==="dark"?"Modo escuro ativado.":"Modo claro ativado.");
    }
    if(kind==="close")closeDialog();
    if(kind==="add-line")addLine();
    if(kind==="confirm")createRental();
    if(kind==="remove-line"){state.draft.items=state.draft.items.filter(l=>l.id!==action.dataset.item);renderDialog();}
    if(kind==="change")moveRental(action.dataset.id,action.dataset.next);
    if(kind==="cancel"){
      const r=db().rentals.find(x=>x.id===action.dataset.id);
      if(r && ["reserved","ready"].includes(r.status)){
        if(paidForRental(r.id)>0){notify("Aluguel com pagamento: cancelamento e estorno exigem conferência. Não disponíveis na demo.");}
        else {r.status="cancelled";closeDialog();render();notify("Aluguel cancelado nesta demonstração. Disponibilidade liberada.");}
      }
    }
    if(kind==="reset"){
      databases[state.segment]=loadFixture(state.segment);state.financeHidden=settings().financeHiddenByDefault;closeDialog();state.search="";state.filter="todos";state.stockFrom=today;state.stockTo=offset(2);render();notify("Dados de exemplo restaurados.");
    }
  });

  document.addEventListener("submit",event=>{
    const id=event.target.id;
    if(!["customer-form","item-form","settings-form","notification-settings-form"].includes(id))return;
    event.preventDefault();
    if(id==="customer-form")saveCustomer(event.target);
    if(id==="item-form")saveItem(event.target);
    if(id==="settings-form")saveSettings(event.target);
    if(id==="notification-settings-form")saveNotificationSettings(event.target);
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
    if(event.target.id==="logo-crop-zoom"&&cropState){
      const zoom=Number(event.target.value);
      if(zoom>=1&&zoom<=3){cropState.zoom=zoom;drawLogoCrop();}
    }
    if(event.target.id==="custom-accent"){
      const help=$("color-feedback");
      if(help){
        const color=validAccent(event.target.value);
        help.setAttribute("role",color?"status":"alert");
        help.textContent=color?"Clique em Aplicar cor para usar "+color+".":"Informe # e seis dígitos, como #0F766E.";
      }
    }
  });
  document.addEventListener("change",event=>{
    if(event.target.id==="logo-file"){
      const file=event.target.files?.[0];event.target.value="";
      if(file)readLogoFile(file);return;
    }
    if(event.target.id==="accessibility-toggle"){
      settings().accessibility=Boolean(event.target.checked);
      paintPersonalization();
      notify(settings().accessibility?"Modo de acessibilidade ativado.":"Modo de acessibilidade desativado.");
      return;
    }
    if(event.target.id==="stock-from"){state.stockFrom=event.target.value;render();}
    if(event.target.id==="stock-to"){state.stockTo=event.target.value;render();}
    if(event.target.id==="draft-client"){state.draft.clientId=event.target.value;}
    if(event.target.id==="draft-from"){state.draft.from=event.target.value;renderDialog();}
    if(event.target.id==="draft-to"){state.draft.to=event.target.value;renderDialog();}
    if(event.target.id==="draft-item")refreshAvailability();
  });
  sectorSelect.addEventListener("change",()=>{
    state.segment=sectorSelect.value;
    state.financeHidden=settings().financeHiddenByDefault;
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
  modal.addEventListener("pointerdown",event=>{
    if(event.target.id!=="logo-crop-canvas"||!cropState)return;
    event.preventDefault();
    const canvas=event.target;
    cropState.drag={pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,x:cropState.panX,y:cropState.panY};
    canvas.setPointerCapture?.(event.pointerId);
  });
  modal.addEventListener("pointermove",event=>{
    if(!cropState?.drag||cropState.drag.pointerId!==event.pointerId)return;
    const canvas=$("logo-crop-canvas");
    if(!canvas)return;
    event.preventDefault();
    const width=canvas.getBoundingClientRect().width||LOGO_OUTPUT;
    const factor=LOGO_OUTPUT/width;
    cropState.panX=cropState.drag.x+(event.clientX-cropState.drag.startX)*factor;
    cropState.panY=cropState.drag.y+(event.clientY-cropState.drag.startY)*factor;
    drawLogoCrop();
  });
  for(const endEvent of ["pointerup","pointercancel"]){
    modal.addEventListener(endEvent,event=>{
      if(cropState?.drag&&event.pointerId===cropState.drag.pointerId)cropState.drag=null;
    });
  }
  document.addEventListener("keydown",event=>{
    if(event.key==="Escape"){if(!modal.hidden)closeDialog();else closeMenu();}
    const row=event.target.closest("[data-rental].row-click,[data-customer].row-click");
    if(row && event.target===row && (event.key==="Enter"||event.key===" ")){event.preventDefault();row.click();}
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