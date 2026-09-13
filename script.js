const WHATSAPP_NUMBER = '5565999999999'; // TROQUE AQUI PELO NÚMERO REAL DA LOJA, com DDI e DDD.

const menuBtn = document.getElementById('menuBtn');
const nav = document.getElementById('nav');
const filters = [...document.querySelectorAll('.filter')];
const cards = [...document.querySelectorAll('.product-card')];
const searchInput = document.getElementById('productSearch');
const noResults = document.getElementById('noResults');
const drawer = document.getElementById('quoteDrawer');
const backdrop = document.getElementById('drawerBackdrop');
const quoteList = document.getElementById('quoteList');
const quoteEmpty = document.getElementById('quoteEmpty');
const quoteCount = document.getElementById('quoteCount');
const quoteCountBottom = document.getElementById('quoteCountBottom');
const floatCount = document.getElementById('floatCount');
const toast = document.getElementById('toast');
const sendQuote = document.getElementById('sendQuote');
const clearQuote = document.getElementById('clearQuote');

let activeFilter = 'all';
let quote = [];

function openWhatsApp(message) {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener');
}

document.querySelectorAll('.js-whatsapp').forEach(button => {
  button.addEventListener('click', () => openWhatsApp(button.dataset.message || 'Olá! Quero atendimento da Wolf Paints & Coatings.'));
});

menuBtn.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuBtn.setAttribute('aria-expanded', 'false');
}));

function applyFilters() {
  const query = (searchInput.value || '').trim().toLowerCase();
  let visible = 0;
  cards.forEach(card => {
    const categories = card.dataset.category.split(' ');
    const searchable = `${card.dataset.search} ${card.querySelector('h3').textContent}`.toLowerCase();
    const filterMatch = activeFilter === 'all' || categories.includes(activeFilter);
    const searchMatch = !query || searchable.includes(query);
    const show = filterMatch && searchMatch;
    card.classList.toggle('hidden', !show);
    if (show) visible++;
  });
  noResults.hidden = visible !== 0;
}

filters.forEach(button => {
  button.addEventListener('click', () => {
    filters.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    activeFilter = button.dataset.filter;
    applyFilters();
  });
});
searchInput.addEventListener('input', applyFilters);

document.querySelectorAll('.filter-jump').forEach(button => {
  button.addEventListener('click', () => {
    const target = button.dataset.jumpFilter;
    const targetButton = filters.find(btn => btn.dataset.filter === target);
    if (targetButton) targetButton.click();
    document.getElementById('produtos').scrollIntoView({ behavior: 'smooth' });
  });
});

function showToast(message = 'Produto adicionado ao orçamento.') {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 1900);
}

function addToQuote(name, effect) {
  if (quote.some(item => item.name === name)) {
    showToast('Esse produto já está no seu orçamento.');
    return;
  }
  quote.push({ name, effect });
  renderQuote();
  showToast();
}

document.querySelectorAll('.js-add').forEach(button => {
  button.addEventListener('click', () => addToQuote(button.dataset.name, button.dataset.effect));
});

function renderQuote() {
  quoteList.innerHTML = '';
  quote.forEach((item, index) => {
    const row = document.createElement('div');
    row.className = 'quote-item';
    row.innerHTML = `<div><b>${item.name}</b><small>${item.effect}</small></div><button aria-label="Remover ${item.name}" data-index="${index}">×</button>`;
    quoteList.appendChild(row);
  });

  quoteList.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
      quote.splice(Number(button.dataset.index), 1);
      renderQuote();
    });
  });

  const count = quote.length;
  quoteEmpty.style.display = count ? 'none' : 'block';
  quoteCount.textContent = count;
  quoteCountBottom.textContent = `${count} ${count === 1 ? 'item' : 'itens'}`;
  floatCount.textContent = count;
  sendQuote.disabled = count === 0;
}

function openDrawer() {
  drawer.classList.add('open');
  backdrop.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  document.body.classList.add('drawer-open');
}
function closeDrawer() {
  drawer.classList.remove('open');
  backdrop.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('drawer-open');
}

['openQuote','openQuoteBottom','floatingQuote'].forEach(id => document.getElementById(id).addEventListener('click', openDrawer));
document.getElementById('closeQuote').addEventListener('click', closeDrawer);
backdrop.addEventListener('click', closeDrawer);
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeDrawer(); });

clearQuote.addEventListener('click', () => {
  quote = [];
  renderQuote();
});

sendQuote.addEventListener('click', () => {
  if (!quote.length) return;
  const items = quote.map((item, index) => `${index + 1}. ${item.name} — ${item.effect}`).join('\n');
  const message = `Olá! Montei este pedido no site da Wolf Paints & Coatings:\n\n${items}\n\nQuero receber valores, disponibilidade e orientação para escolher a melhor opção.`;
  openWhatsApp(message);
});

renderQuote();
