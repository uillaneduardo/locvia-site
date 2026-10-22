/* Locvia — Orçamentos da demo. Sem backend; adaptador em memória por cenário.
   API REST futura: docs/orcamentos.md. */
(function () {
  "use strict";
  let app = null;
  let draft = null;
  let selectedId = null;
  const stores = Object.create(null);
  const html = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const brl = cents => (cents / 100).toLocaleString("pt-BR", {style:"currency",currency:"BRL"});
  const localDate = value => new Intl.DateTimeFormat("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric"}).format(new Date(value + "T12:00:00"));
  const cents = value => {
    const n = Number(value);
    return value !== "" && Number.isFinite(n) && n >= 0 && n <= 1000000 && Math.abs(n * 100 - Math.round(n * 100)) < 0.00001 ? Math.round(n * 100) : null;
  };
  const rawMoney = value => (value / 100).toFixed(2);
  const store = segment => (stores[segment] ||= {next:1000, quotes:[]});
  // Boundary between UI and data source: replace with an authenticated async REST client later.
  const repository = {
    list: segment => store(segment).quotes.slice(),
    get: (segment,id) => store(segment).quotes.find(q=>q.id===id) || null,
    create: (segment,payload) => {
      const db=store(segment),quote={...payload,id:"ORC-"+(++db.next)};
      db.quotes.unshift(quote);
      return quote;
    },
    reset: segment => {delete stores[segment];}
  };
  const quoteById = id => repository.get(app.segment(),id);
  const sum = d => {
    const subtotal = d.lines.reduce((amount,line) => amount + line.qty * (cents(line.price) ?? 0), 0);
    const fee = cents(d.fee) ?? 0;
    const discount = cents(d.discount) ?? 0;
    return {subtotal,fee,discount,total:Math.max(0,subtotal + fee - discount)};
  };
  const header = (label,title) => '<header class="dialog-head"><div><small>'+html(label)+'</small><h2 id="dialog-title">'+html(title)+'</h2></div><button class="icon-btn" type="button" data-action="close" aria-label="Fechar">'+app.icon("close")+'</button></header>';
  const footer = controls => '<footer class="dialog-foot">'+controls+'</footer>';
  const requiredData = () => app.clients().length && app.items().length;

  function newQuote() {
    if (!app.clients().length) {app.go("clientes");app.notify("Cadastre um cliente antes de emitir um orçamento.");return;}
    if (!app.items().length) {app.go("itens");app.notify("Cadastre um item antes de emitir um orçamento.");return;}
    draft = {clientId:app.clients()[0].id,from:app.offset(1),to:app.offset(1 + app.settings().defaultDays),
      validUntil:app.offset(7),lines:[],fee:"0.00",discount:"0.00",notes:""};
    selectedId = null;
    app.openDialog("quote-create");
  }
  function toolbarButton() {
    return '<button type="button" class="outline-btn" data-quote-action="new">'+app.icon("plus")+' Novo orçamento</button>';
  }
  function listMarkup() {
    const quotes = repository.list(app.segment());
    const rows = quotes.map(q => '<tr><td><button class="text-btn" type="button" data-quote-action="view" data-id="'+html(q.id)+'"><strong>'+html(q.id)+'</strong></button><small>'+localDate(q.issuedAt)+'</small></td>'+
      '<td>'+html(q.customer.name)+'</td><td>'+localDate(q.from)+' – '+localDate(q.to)+'</td>'+
      '<td>'+localDate(q.validUntil)+'</td><td class="align-end"><strong>'+app.money(q.totalCents / 100)+'</strong></td>'+
      '<td class="align-end"><button type="button" class="mini-btn secondary" data-quote-action="view" data-id="'+html(q.id)+'">Visualizar</button></td></tr>').join("");
    return '<section class="panel quote-list-panel"><div class="panel-head"><div><h2>Orçamentos emitidos</h2><p>'+quotes.length+' documento(s) fictício(s) neste cenário · não reservam itens</p></div>'+
      '<button type="button" class="outline-btn" data-quote-action="new">'+app.icon("plus")+' Criar orçamento</button></div>'+
      (quotes.length?'<div class="table-wrap"><table class="data-table"><thead><tr><th>Orçamento</th><th>Cliente</th><th>Período</th><th>Válido até</th><th class="align-end">Valor</th><th class="align-end">Ação</th></tr></thead><tbody>'+rows+'</tbody></table></div>':
      '<div class="quote-empty"><p>Emita um orçamento para apresentar itens e valores ao cliente, sem gerar um aluguel.</p><button type="button" class="text-btn" data-quote-action="new">Criar meu primeiro orçamento →</button></div>')+'</section>';
  }
  function editor() {
    if (!draft) return header("ORÇAMENTO","Nenhum rascunho aberto");
    const options = app.clients().map(c => '<option value="'+html(c.id)+'"'+(c.id===draft.clientId?" selected":"")+'>'+html(c.name)+'</option>').join("");
    const items = app.items().map(i=>'<option value="'+html(i.id)+'">'+html(i.name)+' · '+brl(Math.round(i.price * 100))+'</option>').join("");
    const rows = draft.lines.map(line => '<div class="quote-line" data-quote-line="'+html(line.itemId)+'">'+
      '<div class="quote-line-name"><strong>'+html(line.name)+'</strong><small>Preço original: '+brl(line.catalogPriceCents)+'</small></div>'+
      '<label class="form-field">Qtd.<input type="number" min="1" max="9999" step="1" inputmode="numeric" data-quote-qty="'+html(line.itemId)+'" value="'+html(line.qty)+'"></label>'+
      '<label class="form-field">Valor unitário (R$)<input type="number" min="0" max="1000000" step="0.01" inputmode="decimal" data-quote-price="'+html(line.itemId)+'" value="'+html(line.price)+'"></label>'+
      '<strong class="quote-line-total" data-quote-line-total="'+html(line.itemId)+'">'+brl(line.qty * (cents(line.price) ?? 0))+'</strong>'+
      '<button class="icon-btn" type="button" data-quote-action="remove" data-id="'+html(line.itemId)+'" aria-label="Remover '+html(line.name)+'">'+app.icon("trash")+'</button></div>').join("") ||
      '<p class="quote-quiet">Nenhum item incluído. Selecione um item e informe a quantidade.</p>';
    const amounts = sum(draft);
    return header("NOVO ORÇAMENTO","Preparar proposta para o cliente")+
      '<form id="quote-form"><div class="dialog-body"><div class="quote-note">Demonstração: o orçamento não reserva estoque nem gera cobrança. Dados fictícios.</div>'+
      '<div class="form-grid"><label class="form-field wide">Cliente *<select name="clientId" required>'+options+'</select></label>'+
      '<label class="form-field">Retirada prevista *<input name="from" type="date" min="'+app.today+'" required value="'+html(draft.from)+'"></label>'+
      '<label class="form-field">Devolução prevista *<input name="to" type="date" min="'+app.today+'" required value="'+html(draft.to)+'"></label>'+
      '<label class="form-field">Validade da proposta *<input name="validUntil" type="date" min="'+app.today+'" required value="'+html(draft.validUntil)+'"></label></div>'+
      '<div class="form-section">Itens e valores</div>'+
      '<div class="quote-add-row"><label class="form-field">Item<select id="quote-item">'+items+'</select></label>'+
      '<label class="form-field">Qtd.<input id="quote-qty-new" type="number" min="1" max="9999" step="1" value="1"></label>'+
      '<button class="outline-btn" type="button" data-quote-action="add">'+app.icon("plus")+' Incluir</button></div>'+
      '<div class="quote-lines">'+rows+'</div>'+
      '<div class="quote-adjustments"><label class="form-field">Entrega / serviços (R$)<input name="fee" type="number" min="0" max="1000000" step="0.01" value="'+html(draft.fee)+'"></label>'+
      '<label class="form-field">Desconto (R$)<input name="discount" type="number" min="0" max="1000000" step="0.01" value="'+html(draft.discount)+'"></label></div>'+
      '<div class="quote-totals"><div><span>Subtotal</span><strong data-quote-subtotal>'+brl(amounts.subtotal)+'</strong></div>'+
      '<div><span>Serviços</span><strong data-quote-fee>'+brl(amounts.fee)+'</strong></div>'+
      '<div><span>Desconto</span><strong data-quote-discount>'+brl(amounts.discount)+'</strong></div>'+
      '<div class="quote-grand-total"><span>Total do orçamento</span><strong data-quote-total>'+brl(amounts.total)+'</strong></div></div>'+
      '<label class="form-field wide quote-notes">Observações (opcional)<textarea name="notes" rows="3" maxlength="600" placeholder="Ex.: entrega a combinar, montagem no local...">'+html(draft.notes)+'</textarea></label>'+
      '<p class="setting-hint">A disponibilidade dos itens será verificada ao registrar um aluguel; esta proposta não bloqueia quantidades.</p></div>'+
      footer('<button type="button" class="outline-btn" data-action="close">Cancelar</button>'+
      '<button type="submit" class="primary-btn">'+app.icon("check")+' Emitir orçamento</button>')+'</form>';
  }
  function sync() {
    const form = document.getElementById("quote-form");
    if (!form || !draft) return;
    for(const name of ["clientId","from","to","validUntil","fee","discount","notes"]) {
      const field = form.elements.namedItem(name);
      if(field) draft[name] = field.value;
    }
    draft.lines.forEach(line => {
      const qty = form.querySelector('[data-quote-qty="'+line.itemId+'"]');
      const price = form.querySelector('[data-quote-price="'+line.itemId+'"]');
      if(qty) line.qty = Number(qty.value);
      if(price) line.price = price.value;
    });
  }
  function updateTotals() {
    if(!draft)return;
    const form = document.getElementById("quote-form");
    if(!form)return;
    const amounts=sum(draft);
    const set = (selector,value) => {const el=form.querySelector(selector);if(el)el.textContent=brl(value);};
    set("[data-quote-subtotal]",amounts.subtotal);
    set("[data-quote-fee]",amounts.fee);
    set("[data-quote-discount]",amounts.discount);
    set("[data-quote-total]",amounts.total);
    for(const line of draft.lines) set('[data-quote-line-total="'+line.itemId+'"]',line.qty * (cents(line.price) ?? 0));
  }
  function validate() {
    if(!draft || !app.client(draft.clientId))return "Selecione um cliente válido.";
    if(!/^\d{4}-\d{2}-\d{2}$/.test(draft.from) || draft.from < app.today || !/^\d{4}-\d{2}-\d{2}$/.test(draft.to) || draft.to < draft.from)
      return "Selecione um período válido a partir de hoje.";
    if(!/^\d{4}-\d{2}-\d{2}$/.test(draft.validUntil) || draft.validUntil < app.today)return "Confira a validade da proposta.";
    if(!draft.lines.length)return "Inclua pelo menos um item.";
    if(draft.notes.length>600)return "As observações devem ter no máximo 600 caracteres.";
    for(const line of draft.lines) {
      if(!app.item(line.itemId) || !Number.isInteger(line.qty) || line.qty<1 || line.qty>9999 || cents(line.price) === null)
        return "Confira a quantidade e o valor unitário de cada item.";
    }
    if(cents(draft.fee) === null || cents(draft.discount) === null)return "Confira os valores de serviços e desconto.";
    const values=sum(draft);
    if(values.discount>values.subtotal+values.fee)return "O desconto não pode superar o subtotal e os serviços.";
    if(values.total>1e11)return "O orçamento excede o limite de valores da demonstração.";
    return null;
  }
  function emit() {
    sync();
    const error=validate();
    if(error){app.notify(error);return;}
    const amount=sum(draft),client=app.client(draft.clientId),settings=app.settings();
    const payload = {
      status:"issued",issuedAt:app.today,validUntil:draft.validUntil,
      from:draft.from,to:draft.to,clientId:draft.clientId,customer:{name:client.name},
      issuer:{name:settings.name,logo:settings.logo || null},notes:draft.notes.trim(),
      lines:draft.lines.map(line=>({itemId:line.itemId,description:line.name,quantity:line.qty,unitPriceCents:cents(line.price)})),
      subtotalCents:amount.subtotal,feeCents:amount.fee,discountCents:amount.discount,totalCents:amount.total
    };
    const issued=repository.create(app.segment(),payload);
    selectedId=issued.id;draft=null;
    app.render();app.openDialog("quote-view");
    app.notify("Orçamento "+issued.id+" emitido somente nesta demonstração.");
  }
  function documentMarkup(q) {
    const logo=q.issuer.logo?'<img class="quote-document-logo" src="'+html(q.issuer.logo)+'" alt="Logotipo do negócio">':"";
    const lines=q.lines.map(line=>'<tr><td>'+html(line.description)+'</td><td>'+line.quantity+'</td><td>'+brl(line.unitPriceCents)+'</td><td class="num">'+brl(line.quantity * line.unitPriceCents)+'</td></tr>').join("");
    return '<article class="quote-document"><div class="quote-doc-top"><div>'+logo+'<strong class="quote-business">'+html(q.issuer.name)+'</strong><small>Proposta comercial demonstrativa</small></div>'+
      '<div class="quote-doc-number"><strong>ORÇAMENTO</strong><span>'+html(q.id)+'</span><small>Emitido em '+localDate(q.issuedAt)+'</small></div></div>'+
      '<div class="quote-demo-watermark">DEMONSTRAÇÃO · SEM VALIDADE COMERCIAL</div>'+
      '<div class="quote-doc-meta"><div><small>Cliente</small><strong>'+html(q.customer.name)+'</strong></div>'+
      '<div><small>Validade</small><strong>'+localDate(q.validUntil)+'</strong></div>'+
      '<div><small>Retirada prevista</small><strong>'+localDate(q.from)+'</strong></div>'+
      '<div><small>Devolução prevista</small><strong>'+localDate(q.to)+'</strong></div></div>'+
      '<table class="quote-doc-table"><thead><tr><th>Descrição</th><th>Qtd.</th><th>Unitário</th><th class="num">Total</th></tr></thead><tbody>'+lines+'</tbody></table>'+
      '<div class="quote-doc-total"><div><span>Subtotal</span><strong>'+brl(q.subtotalCents)+'</strong></div>'+
      '<div><span>Entrega / serviços</span><strong>'+brl(q.feeCents)+'</strong></div>'+
      '<div><span>Desconto</span><strong>− '+brl(q.discountCents)+'</strong></div>'+
      '<div class="quote-doc-grand"><span>Valor total</span><strong>'+brl(q.totalCents)+'</strong></div></div>'+
      (q.notes?'<div class="quote-doc-notes"><strong>Observações</strong><p>'+html(q.notes).replace(/\n/g,"<br>")+'</p></div>':"")+
      '<footer class="quote-doc-footer">Esta proposta é um exemplo fictício. Não comprova reserva, disponibilidade, contratação, pagamento nem operação fiscal. Gerada na demonstração Locvia.</footer></article>';
  }
  function viewer() {
    const q=quoteById(selectedId);
    if(!q)return header("ORÇAMENTO","Documento não encontrado");
    return header("ORÇAMENTO EMITIDO",q.id)+
      '<div class="dialog-body quote-preview"><div class="quote-note">Documento fictício. Use <strong>Imprimir / Salvar PDF</strong> no navegador para emitir uma cópia demonstrativa.</div>'+
      documentMarkup(q)+'</div>'+
      footer('<button class="outline-btn" type="button" data-action="close">Fechar</button>'+
      '<button class="primary-btn" type="button" data-quote-action="print" data-id="'+html(q.id)+'">'+app.icon("check")+' Imprimir / Salvar PDF</button>');
  }
  function printQuote(id) {
    const q=quoteById(id);
    if(!q){app.notify("Orçamento não encontrado.");return;}
    let root=document.getElementById("quote-print-root");
    if(!root){root=document.createElement("div");root.id="quote-print-root";document.body.appendChild(root);}
    root.innerHTML=documentMarkup(q);
    window.print();
  }
  function references(entity,id) {
    return repository.list(app.segment()).some(q=>entity==="customer"?q.clientId===id:q.lines.some(l=>l.itemId===id));
  }

  document.addEventListener("click",event=>{
    const target=event.target.closest("[data-quote-action]");
    if(!target || !app)return;
    const action=target.dataset.quoteAction,id=target.dataset.id;
    if(action==="new")newQuote();
    if(action==="view"){selectedId=id;app.openDialog("quote-view");}
    if(action==="print")printQuote(id);
    if(action==="add") {
      sync();
      const item=app.item(document.getElementById("quote-item")?.value);
      const qty=Number(document.getElementById("quote-qty-new")?.value);
      if(!item||!Number.isInteger(qty)||qty<1||qty>9999){app.notify("Escolha um item e quantidade válida.");return;}
      const previous=draft.lines.find(l=>l.itemId===item.id);
      if(previous){if(previous.qty+qty>9999){app.notify("Quantidade máxima: 9.999.");return;}previous.qty+=qty;}
      else draft.lines.push({itemId:item.id,name:item.name,qty,price:rawMoney(Math.round(item.price * 100)),catalogPriceCents:Math.round(item.price * 100)});
      app.renderDialog();
    }
    if(action==="remove" && draft){sync();draft.lines=draft.lines.filter(l=>l.itemId!==id);app.renderDialog();}
  });
  document.addEventListener("input",event=>{
    if(!event.target.closest("#quote-form")||!draft)return;
    sync();updateTotals();
  });
  document.addEventListener("change",event=>{
    if(!event.target.closest("#quote-form")||!draft)return;
    sync();updateTotals();
  });
  document.addEventListener("submit",event=>{
    if(event.target.id!=="quote-form")return;
    event.preventDefault();emit();
  });
  window.LocviaQuotes = {
    bind(context){app=context;},
    toolbarButton,listMarkup,
    dialogMarkup(type){return type==="quote-create"?editor():viewer();},
    reset(segment){repository.reset(segment);draft=null;selectedId=null;},
    references,
    repository
  };
})();