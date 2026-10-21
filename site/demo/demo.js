/* Locvia demo: dados fictícios, mantidos somente em memória nesta aba. */
(function () {
  "use strict";

  const ICONS = { overview: "grid", products: "box", bookings: "calendar", clients: "users", finance: "wallet" };
  const pages = {
    "visao-geral": "Visão geral",
    acervo: "Acervo",
    locacoes: "Locações",
    clientes: "Clientes",
    financeiro: "Financeiro"
  };
  const customers = [
    { id: "c1", name: "Mariana Costa", kind: "Pessoa física", phone: "(81) 90000-0001", email: "mariana@example.com" },
    { id: "c2", name: "Ateliê Florescer", kind: "Empresa", phone: "(81) 90000-0002", email: "contato@example.com" },
    { id: "c3", name: "Lucas Almeida", kind: "Pessoa física", phone: "(81) 90000-0003", email: "lucas@example.com" },
    { id: "c4", name: "Casa de Festas Jardim", kind: "Empresa", phone: "(81) 90000-0004", email: "jardim@example.com" },
    { id: "c5", name: "Camila Nascimento", kind: "Pessoa física", phone: "(81) 90000-0005", email: "camila@example.com" }
  ];
  const products = [
    { id: "p1", name: "Kit mesa posta", category: "Decoração", quantity: 24, available: 18, price: 580 },
    { id: "p2", name: "Cadeira Tiffany", category: "Mobiliário", quantity: 120, available: 86, price: 420 },
    { id: "p3", name: "Mesa bistrô", category: "Mobiliário", quantity: 20, available: 12, price: 320 },
    { id: "p4", name: "Painel de arco", category: "Decoração", quantity: 10, available: 7, price: 490 },
    { id: "p5", name: "Suporte para doces", category: "Utensílios", quantity: 32, available: 21, price: 190 },
    { id: "p6", name: "Luminária decorativa", category: "Decoração", quantity: 18, available: 14, price: 250 }
  ];

  function dateOffset(days) {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() + days);
    return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
  }
  const state = {
    page: pages[location.hash.slice(1)] ? location.hash.slice(1) : "visao-geral",
    search: "",
    filter: "Todas",
    category: "Todas",
    nextId: 1054,
    bookings: [
      { id: 1048, customerId: "c4", productId: "p4", date: dateOffset(-2), status: "Concluída", amount: 490, paid: true },
      { id: 1049, customerId: "c1", productId: "p1", date: dateOffset(1), status: "Confirmada", amount: 580, paid: true },
      { id: 1050, customerId: "c2", productId: "p2", date: dateOffset(2), status: "Em preparação", amount: 840, paid: false },
      { id: 1051, customerId: "c3", productId: "p3", date: dateOffset(3), status: "Confirmada", amount: 320, paid: false },
      { id: 1052, customerId: "c5", productId: "p5", date: dateOffset(6), status: "Em andamento", amount: 380, paid: true },
      { id: 1053, customerId: "c4", productId: "p6", date: dateOffset(8), status: "Confirmada", amount: 500, paid: false }
    ]
  };
  const area = document.getElementById("app-content");
  const current = document.getElementById("current-section");
  const search = document.getElementById("search");
  const modal = document.getElementById("modal");
  const toast = document.getElementById("toast");
  const menuBtn = document.getElementById("menu-button");
  const overlay = document.getElementById("mobile-overlay");
  let lastFocus = null;
  let toastTimer;

  function esc(value) {
    return String(value).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function ico(name) {
    return '<svg class="ico" aria-hidden="true"><use href="#i-' + name + '"></use></svg>';
  }
  function money(value) {
    return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 });
  }
  function dateObj(value) { return new Date(value + "T12:00:00"); }
  function shortDate(value) {
    return dateObj(value).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "");
  }
  function longDate(value) {
    return dateObj(value).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  }
  function who(id) { return customers.find(function (c) { return c.id === id; }); }
  function item(id) { return products.find(function (p) { return p.id === id; }); }
  function sum(list) { return list.reduce(function (s, b) { return s + b.amount; }, 0); }
  function activeBookings() { return state.bookings.filter(function (b) { return b.status !== "Concluída"; }); }
  function initials(name) { return name.split(" ").slice(0, 2).map(function (s) { return s[0]; }).join("").toUpperCase(); }
  function badge(status) {
    const classes = { "Confirmada": "confirmada", "Em preparação": "preparacao", "Em andamento": "andamento", "Concluída": "concluida", "Pago": "pago", "Pendente": "pendente" };
    return '<span class="status ' + (classes[status] || "concluida") + '">' + esc(status) + '</span>';
  }
  function heading(kicker, title, text, action) {
    return '<div class="page-heading"><div><span class="heading-kicker">' + esc(kicker) + '</span><h1>' + esc(title) + '</h1><p>' + esc(text) + '</p></div>' + (action || "") + '</div>';
  }
  function newButton() {
    return '<button class="primary-btn" type="button" data-action="new-booking">' + ico("plus") + ' Nova locação</button>';
  }
  function notice() {
    return '<div class="notice">' + ico("sparkle") + '<span>Você está explorando uma demonstração. Nomes, valores e locações são exemplos; nenhuma alteração é salva ou enviada.</span></div>';
  }
  function kpi(label, value, sub, iconName) {
    return '<article class="kpi"><div class="kpi-label"><span>' + esc(label) + '</span>' + ico(iconName) + '</div><strong class="kpi-value">' + esc(value) + '</strong><span class="kpi-sub">' + sub + '</span></article>';
  }
  function bookingRows(bookings) {
    if (!bookings.length) return '<tr><td colspan="5"><div class="empty-state"><strong>Nenhuma locação encontrada</strong>Tente outro termo ou filtro.</div></td></tr>';
    return bookings.map(function (b) {
      return '<tr role="button" tabindex="0" data-booking-id="' + b.id + '" aria-label="Ver locação LC-' + b.id + '"><td><strong>LC-' + b.id + '</strong><small>' + esc(item(b.productId).name) + '</small></td>' +
        '<td><div class="person-cell"><div class="table-avatar">' + esc(initials(who(b.customerId).name)) + '</div><span><strong>' + esc(who(b.customerId).name) + '</strong></span></div></td>' +
        '<td>' + esc(shortDate(b.date)) + '</td><td>' + badge(b.status) + '</td><td class="amount">' + money(b.amount) + '</td></tr>';
    }).join("");
  }
  function bookingTable(bookings) {
    return '<div class="table-scroll"><table class="data-table"><thead><tr><th>Locação</th><th>Cliente</th><th>Entrega</th><th>Situação</th><th class="amount">Valor</th></tr></thead><tbody>' + bookingRows(bookings) + '</tbody></table></div>';
  }
  function searchMatch(text) {
    return !state.search || String(text).toLocaleLowerCase("pt-BR").includes(state.search.toLocaleLowerCase("pt-BR"));
  }
  function matchesBooking(b) {
    return searchMatch([b.id, "LC-" + b.id, who(b.customerId).name, item(b.productId).name, b.status].join(" "));
  }
  function upcoming() {
    return activeBookings().filter(function (b) { return b.date >= dateOffset(0); }).sort(function (a, b) { return a.date.localeCompare(b.date); });
  }
  function overview() {
    const dateText = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
    const next = upcoming();
    const near = next.filter(function (b) { return b.date <= dateOffset(7); }).length;
    const open = activeBookings();
    const stock = products.reduce(function (s, p) { return s + p.quantity; }, 0);
    const cards = '<div class="kpis">' +
      kpi("Locações em aberto", String(open.length), "<strong>" + near + "</strong> entregas nos próximos 7 dias", "calendar") +
      kpi("Itens no acervo", String(stock), "Em " + products.length + " produtos cadastrados", "box") +
      kpi("Receita prevista", money(sum(open)), "Valores das locações em aberto", "wallet") +
      kpi("Próximas entregas", String(near), "Nos próximos 7 dias", "truck") + '</div>';
    const latest = state.bookings.filter(matchesBooking).sort(function (a, b) { return b.id - a.id; }).slice(0, 5);
    const list = next.slice(0, 3).map(function (b) {
      const d = dateObj(b.date);
      return '<div class="next-item"><div class="next-date"><strong>' + d.getDate() + '</strong><small>' + d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "") + '</small></div><div><strong>' +
        esc(who(b.customerId).name) + '</strong><small>' + esc(item(b.productId).name) + '</small></div><span class="next-tag">LC-' + b.id + '</span></div>';
    }).join("") || '<div class="empty-state">Nenhuma entrega próxima.</div>';
    const vals = [32, 48, 41, 64, 84, 60, 53];
    const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
    const bars = vals.map(function (v, i) {
      return '<div class="chart-col"><div class="chart-bar" style="height:' + v + '%"></div><small>' + days[i] + '</small></div>';
    }).join("");
    return heading(dateText, "Visão geral", "Tudo o que importa para a sua locadora, em um só lugar.", newButton()) +
      notice() + cards +
      '<div class="columns"><section class="panel"><div class="panel-heading"><div><h2>Locações recentes</h2><p>Uma visão rápida dos últimos registros</p></div><button type="button" data-page="locacoes" class="panel-link">Ver todas →</button></div>' + bookingTable(latest) + '</section>' +
      '<section class="panel"><div class="panel-heading"><div><h2>Próximas entregas</h2><p>Fique de olho nas datas</p></div></div><div class="up-next">' + list + '</div></section></div>' +
      '<div class="subcolumns"><section class="panel"><div class="panel-heading"><div><h2>Ritmo da semana</h2><p>Visualização ilustrativa de movimentações</p></div></div><div class="activity-chart"><div class="chart-bar-area">' + bars + '</div><div class="chart-legend">Exemplo de movimentações ao longo da semana</div></div></section>' +
      '<section class="panel"><div class="panel-heading"><div><h2>Resumo do acervo</h2><p>Disponibilidade cadastrada na demonstração</p></div></div><div class="summary-list">' +
      products.slice(0, 4).map(function (p) { return '<div class="summary-row"><span>' + esc(p.name) + '</span><strong>' + p.available + ' de ' + p.quantity + '</strong></div>'; }).join("") +
      '</div></section></div>';
  }
  function inventory() {
    const filter = state.category;
    const filtered = products.filter(function (p) {
      return (filter === "Todas" || p.category === filter) && searchMatch(p.name + " " + p.category);
    });
    const options = ["Todas", "Decoração", "Mobiliário", "Utensílios"].map(function (cat) {
      return '<option value="' + esc(cat) + '"' + (cat === filter ? " selected" : "") + '>' + esc(cat === "Todas" ? "Todas as categorias" : cat) + '</option>';
    }).join("");
    const cards = filtered.map(function (p) {
      const rate = Math.round((p.available / p.quantity) * 100);
      return '<article class="item-card"><div class="item-art"><span class="art-figure">' + ico("box") + '</span></div><div class="item-content"><span class="item-cat">' + esc(p.category) + '</span><h3>' + esc(p.name) + '</h3>' +
        '<div class="item-stats"><span>Disponíveis</span><strong>' + p.available + ' de ' + p.quantity + '</strong></div><div class="stock-track"><div class="stock-fill" style="width:' + rate + '%"></div></div>' +
        '<div class="item-foot"><span>Valor de referência</span><strong>' + money(p.price) + '</strong></div></div></article>';
    }).join("") || '<div class="panel empty-wide"><div class="empty-state"><strong>Nenhum item encontrado</strong>Experimente outra categoria ou busca.</div></div>';
    return heading("PRODUTOS", "Acervo", products.length + " produtos de exemplo organizados em categorias.") + notice() +
      '<div class="filters"><span class="filter-label" style="margin-left:0">Categoria <select id="category-filter" aria-label="Filtrar categoria">' + options + '</select></span></div>' +
      '<div class="item-grid">' + cards + '</div>';
  }
  function bookingsPage() {
    const opts = ["Todas", "Confirmada", "Em preparação", "Em andamento", "Concluída"];
    const buttons = opts.map(function (v) {
      return '<button type="button" class="filter-btn' + (state.filter === v ? ' selected' : '') + '" data-status="' + esc(v) + '">' + esc(v === "Todas" ? "Todas" : v) + '</button>';
    }).join("");
    const filtered = state.bookings.filter(function (b) {
      return (state.filter === "Todas" || b.status === state.filter) && matchesBooking(b);
    }).sort(function (a, b) { return b.id - a.id; });
    return heading("AGENDA E RESERVAS", "Locações", "Acompanhe os pedidos e cada etapa da entrega à devolução.", newButton()) + notice() +
      '<div class="filters">' + buttons + '</div><section class="panel"><div class="panel-heading"><div><h2>Todos os registros</h2><p>' + filtered.length + ' locações encontradas</p></div></div>' + bookingTable(filtered) + '</section>';
  }
  function clientsPage() {
    const list = customers.filter(function (c) { return searchMatch(c.name + " " + c.kind + " " + c.email); });
    const rows = list.map(function (c) {
      const count = state.bookings.filter(function (b) { return b.customerId === c.id; }).length;
      return '<tr role="button" tabindex="0" data-client-id="' + c.id + '" aria-label="Ver cliente ' + esc(c.name) + '"><td><div class="person-cell"><div class="table-avatar">' + esc(initials(c.name)) + '</div><span><strong>' + esc(c.name) + '</strong><small>' + esc(c.kind) + '</small></span></div></td>' +
        '<td>' + esc(c.phone) + '</td><td>' + esc(c.email) + '</td><td>' + count + '</td></tr>';
    }).join("") || '<tr><td colspan="4"><div class="empty-state"><strong>Nenhum cliente encontrado</strong>Experimente outro nome.</div></td></tr>';
    return heading("RELACIONAMENTO", "Clientes", "Os contatos e o histórico de locações no mesmo lugar.") + notice() +
      '<section class="panel"><div class="panel-heading"><div><h2>Lista de clientes</h2><p>' + list.length + ' contatos de exemplo</p></div></div><div class="table-scroll"><table class="data-table"><thead><tr><th>Cliente</th><th>Telefone</th><th>E-mail</th><th>Locações</th></tr></thead><tbody>' + rows + '</tbody></table></div></section>';
  }
  function financePage() {
    const paid = state.bookings.filter(function (b) { return b.paid; });
    const unpaid = state.bookings.filter(function (b) { return !b.paid; });
    const filtered = state.bookings.filter(matchesBooking).sort(function (a, b) { return b.id - a.id; });
    const rows = filtered.map(function (b) {
      return '<tr role="button" tabindex="0" data-booking-id="' + b.id + '"><td><strong>LC-' + b.id + '</strong><small>' + esc(item(b.productId).name) + '</small></td><td>' + esc(who(b.customerId).name) + '</td><td>' + esc(shortDate(b.date)) + '</td><td>' + badge(b.paid ? "Pago" : "Pendente") + '</td><td class="amount">' + money(b.amount) + '</td></tr>';
    }).join("") || '<tr><td colspan="5"><div class="empty-state">Nenhum lançamento encontrado.</div></td></tr>';
    return heading("VALORES E RECEBIMENTOS", "Financeiro", "Uma visão simples dos valores vinculados às locações.") + notice() +
      '<div class="kpis">' + kpi("Total das locações", money(sum(state.bookings)), "Inclui todos os registros", "wallet") +
      kpi("Já recebido", money(sum(paid)), paid.length + " locações pagas", "check") +
      kpi("A receber", money(sum(unpaid)), unpaid.length + " pagamentos pendentes", "clock") +
      kpi("Locações registradas", String(state.bookings.length), "Neste ambiente demonstrativo", "calendar") + '</div>' +
      '<section class="panel"><div class="panel-heading"><div><h2>Pagamentos por locação</h2><p>Clique em uma linha para ver os detalhes</p></div></div><div class="table-scroll"><table class="data-table"><thead><tr><th>Referência</th><th>Cliente</th><th>Data</th><th>Pagamento</th><th class="amount">Valor</th></tr></thead><tbody>' + rows + '</tbody></table></div></section>';
  }

  function closeMobile() {
    document.body.classList.remove("nav-open");
    overlay.hidden = true;
    menuBtn.setAttribute("aria-expanded", "false");
  }
  function render() {
    current.textContent = pages[state.page];
    document.querySelectorAll("[data-page].side-link").forEach(function (btn) {
      const isActive = btn.dataset.page === state.page;
      btn.classList.toggle("active", isActive);
      if (isActive) btn.setAttribute("aria-current", "page");
      else btn.removeAttribute("aria-current");
    });
    const views = { "visao-geral": overview, acervo: inventory, locacoes: bookingsPage, clientes: clientsPage, financeiro: financePage };
    area.innerHTML = views[state.page]();
  }
  function go(page) {
    if (!pages[page]) return;
    state.page = page;
    state.search = "";
    state.filter = "Todas";
    search.value = "";
    closeMobile();
    if (location.hash !== "#" + page) location.hash = page;
    render();
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function showToast(message) {
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.hidden = true; }, 4000);
  }
  function openModal(html) {
    lastFocus = document.activeElement;
    modal.innerHTML = '<div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">' + html + '</div>';
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    const control = modal.querySelector("select, button, input");
    if (control) control.focus();
  }
  function closeModal() {
    modal.hidden = true;
    modal.innerHTML = "";
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.isConnected) lastFocus.focus();
  }
  function modalHeader(kicker, title) {
    return '<div class="modal-head"><div><span class="modal-subtitle">' + esc(kicker) + '</span><h2 id="modal-title">' + esc(title) + '</h2></div><button type="button" class="icon-button" data-action="close-modal" aria-label="Fechar">' + ico("close") + '</button></div>';
  }
  function createBookingModal() {
    const clientOptions = customers.map(function (c) { return '<option value="' + c.id + '">' + esc(c.name) + '</option>'; }).join("");
    const productOptions = products.filter(function (p) { return p.available > 0; }).map(function (p) {
      return '<option value="' + p.id + '">' + esc(p.name) + ' — ' + money(p.price) + '</option>';
    }).join("");
    openModal(modalHeader("CADASTRO DE EXEMPLO", "Nova locação") +
      '<form id="new-booking-form"><div class="modal-body"><label class="field">Cliente<select name="customer" required>' + clientOptions + '</select></label>' +
      '<label class="field">Produto<select name="product" id="booking-product" required>' + productOptions + '</select></label>' +
      '<label class="field">Data prevista de entrega<input type="date" name="date" min="' + dateOffset(0) + '" value="' + dateOffset(1) + '" required></label>' +
      '<div class="form-help">Valor do item: <strong id="booking-price">' + money(products[0].price) + '</strong>. Ao confirmar, a locação aparece nas telas desta demonstração, sem salvar dados no servidor.</div></div>' +
      '<div class="modal-actions"><button type="button" class="secondary-btn" data-action="close-modal">Cancelar</button><button type="submit" class="primary-btn">' + ico("check") + ' Criar locação</button></div></form>');
  }
  function bookingModal(id) {
    const b = state.bookings.find(function (x) { return x.id === Number(id); });
    if (!b) return;
    const buttons = '<div class="modal-actions">' +
      '<button class="secondary-btn" type="button" data-action="close-modal">Fechar</button>' +
      (!b.paid ? '<button class="secondary-btn" type="button" data-action="mark-paid" data-id="' + b.id + '">Registrar pagamento</button>' : "") +
      (b.status !== "Concluída" ? '<button class="primary-btn" type="button" data-action="complete" data-id="' + b.id + '">Concluir locação</button>' : "") + '</div>';
    openModal(modalHeader("LOCAÇÃO DE EXEMPLO", "LC-" + b.id) +
      '<div class="modal-body"><div class="detail-grid"><div><small>Cliente</small><strong>' + esc(who(b.customerId).name) + '</strong></div><div><small>Produto</small><strong>' + esc(item(b.productId).name) + '</strong></div>' +
      '<div><small>Entrega prevista</small><strong>' + esc(longDate(b.date)) + '</strong></div><div><small>Valor</small><strong>' + money(b.amount) + '</strong></div>' +
      '<div><small>Etapa</small>' + badge(b.status) + '</div><div><small>Pagamento</small>' + badge(b.paid ? "Pago" : "Pendente") + '</div></div></div>' + buttons);
  }
  function customerModal(id) {
    const c = who(id);
    if (!c) return;
    const related = state.bookings.filter(function (b) { return b.customerId === id; });
    openModal(modalHeader("CLIENTE DE EXEMPLO", c.name) +
      '<div class="modal-body"><div class="detail-grid"><div><small>Tipo</small><strong>' + esc(c.kind) + '</strong></div><div><small>Locações</small><strong>' + related.length + '</strong></div>' +
      '<div><small>Telefone fictício</small><strong>' + esc(c.phone) + '</strong></div><div><small>E-mail fictício</small><strong>' + esc(c.email) + '</strong></div><div class="full"><small>Último registro</small><strong>' + (related.length ? 'LC-' + related[related.length - 1].id : 'Sem registros') + '</strong></div></div></div>' +
      '<div class="modal-actions"><button class="secondary-btn" type="button" data-action="close-modal">Fechar</button></div>');
  }
  document.addEventListener("click", function (event) {
    const nav = event.target.closest("[data-page]");
    if (nav) { go(nav.dataset.page); return; }
    const b = event.target.closest("[data-booking-id]");
    if (b) { bookingModal(b.dataset.bookingId); return; }
    const c = event.target.closest("[data-client-id]");
    if (c) { customerModal(c.dataset.clientId); return; }
    const status = event.target.closest("[data-status]");
    if (status) { state.filter = status.dataset.status; render(); return; }
    const action = event.target.closest("[data-action]");
    if (!action) return;
    if (action.dataset.action === "new-booking") createBookingModal();
    if (action.dataset.action === "close-modal") closeModal();
    if (action.dataset.action === "mark-paid" || action.dataset.action === "complete") {
      const found = state.bookings.find(function (x) { return x.id === Number(action.dataset.id); });
      if (!found) return;
      if (action.dataset.action === "mark-paid") { found.paid = true; showToast("Pagamento registrado somente nesta demonstração."); }
      else { found.status = "Concluída"; showToast("Locação concluída nesta demonstração."); }
      closeModal();
      render();
    }
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") { if (!modal.hidden) closeModal(); closeMobile(); }
    const row = event.target.closest("[data-booking-id], [data-client-id]");
    if (row && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); row.click(); }
    if (!modal.hidden && event.key === "Tab") {
      const focusable = Array.from(modal.querySelectorAll("button:not([disabled]),select:not([disabled]),input:not([disabled])"));
      if (!focusable.length) return;
      if (event.shiftKey && document.activeElement === focusable[0]) { event.preventDefault(); focusable[focusable.length - 1].focus(); }
      else if (!event.shiftKey && document.activeElement === focusable[focusable.length - 1]) { event.preventDefault(); focusable[0].focus(); }
    }
  });
  modal.addEventListener("click", function (event) { if (event.target === modal) closeModal(); });
  document.addEventListener("submit", function (event) {
    if (event.target.id !== "new-booking-form") return;
    event.preventDefault();
    const form = new FormData(event.target);
    const customerId = form.get("customer");
    const productId = form.get("product");
    const date = form.get("date");
    const p = item(productId);
    if (!who(customerId) || !p || p.available < 1 || !/^\d{4}-\d{2}-\d{2}$/.test(date) || date < dateOffset(0)) {
      showToast("Revise os dados da locação.");
      return;
    }
    p.available -= 1;
    state.bookings.push({ id: state.nextId++, customerId: customerId, productId: productId, date: date, status: "Confirmada", amount: p.price, paid: false });
    closeModal();
    go("locacoes");
    showToast("Locação de exemplo criada. Ela não será salva ao recarregar.");
  });
  document.addEventListener("change", function (event) {
    if (event.target.id === "category-filter") { state.category = event.target.value; render(); }
    if (event.target.id === "booking-product") {
      const chosen = item(event.target.value);
      const label = document.getElementById("booking-price");
      if (chosen && label) label.textContent = money(chosen.price);
    }
  });
  search.addEventListener("input", function () { state.search = search.value.trim(); render(); });
  menuBtn.addEventListener("click", function () {
    const open = !document.body.classList.contains("nav-open");
    document.body.classList.toggle("nav-open", open);
    overlay.hidden = !open;
    menuBtn.setAttribute("aria-expanded", String(open));
  });
  overlay.addEventListener("click", closeMobile);
  window.addEventListener("hashchange", function () {
    const next = location.hash.slice(1);
    if (pages[next] && next !== state.page) go(next);
  });
  render();
})();
