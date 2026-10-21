/* Busca local e acessível na Central de Ajuda. Nenhum dado é enviado. */
(() => {
  "use strict";
  const search = document.getElementById("faq-search");
  const sections = [...document.querySelectorAll("[data-faq-section]")];
  const questions = [...document.querySelectorAll(".question")];
  const status = document.getElementById("search-status");
  const empty = document.getElementById("no-results");
  const clear = document.getElementById("clear-search");

  const normalized = (value) => String(value || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR").replace(/\s+/g, " ").trim();

  const content = new Map(questions.map(el => [el, normalized(el.textContent)]));
  let wasFiltering = false;

  function filter() {
    const query = normalized(search.value);
    const terms = query.split(" ").filter(Boolean);
    if (!query && !wasFiltering) return;
    if (query && !wasFiltering) {
      questions.forEach(el => { el.dataset.beforeSearchOpen = el.open ? "yes" : "no"; });
    }

    const matched = questions.filter(el => {
      const matches = terms.every(term => content.get(el).includes(term));
      el.hidden = !matches;
      if (query && matches && el.dataset.beforeSearchOpen === "yes") el.open = true;
      if (query && matches && terms.length && terms.join("").length >= 4) el.open = true;
      if (!query) {
        el.hidden = false;
        el.open = el.dataset.beforeSearchOpen === "yes";
        delete el.dataset.beforeSearchOpen;
      }
      return matches;
    });

    sections.forEach(section => {
      section.hidden = Boolean(query) && !section.querySelector(".question:not([hidden])");
    });
    empty.hidden = !query || matched.length > 0;
    status.textContent = query
      ? matched.length + (matched.length === 1 ? " resposta encontrada." : " respostas encontradas.")
      : "Veja os assuntos abaixo ou pesquise por uma palavra.";
    wasFiltering = Boolean(query);
  }

  search.addEventListener("input", filter);
  clear.addEventListener("click", () => {
    search.value = "";
    filter();
    search.focus();
  });

  // "/" foca a pesquisa, assim como ocorre em várias ferramentas de ajuda.
  document.addEventListener("keydown", event => {
    if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey) return;
    const target = event.target;
    if (target && (target.matches("input, textarea, select") || target.isContentEditable)) return;
    event.preventDefault();
    search.focus();
  });

  if (location.search) {
    const phrase = new URLSearchParams(location.search).get("q");
    if (phrase) { search.value = phrase.slice(0, 100); filter(); }
  }
})();
