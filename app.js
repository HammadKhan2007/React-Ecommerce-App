/* ShopSwift - Vanilla JS e-commerce front page */

const state = {
  products: [],
  filteredProducts: [],
  cart: { items: [] },
  filters: {
    search: "",
    categories: new Set(),
    priceMin: null,
    priceMax: null,
    ratingMin: 0,
    sort: "relevance",
  },
};

const dom = {
  searchForm: document.getElementById("searchForm"),
  searchInput: document.getElementById("searchInput"),
  sortSelect: document.getElementById("sortSelect"),
  productGrid: document.getElementById("productGrid"),
  resultCount: document.getElementById("resultCount"),
  filtersSummary: document.getElementById("filtersSummary"),
  categoryList: document.getElementById("categoryList"),
  priceMin: document.getElementById("priceMin"),
  priceMax: document.getElementById("priceMax"),
  priceApply: document.getElementById("priceApply"),
  ratingMin: document.getElementById("ratingMin"),
  clearFilters: document.getElementById("clearFilters"),
  applyFilters: document.getElementById("applyFilters"),
  filterToggle: document.getElementById("filterToggle"),
  filtersPanel: document.getElementById("filters"),
  filtersClose: document.getElementById("filtersClose"),
  overlay: document.getElementById("overlay"),
  cartToggle: document.getElementById("cartToggle"),
  cartClose: document.getElementById("cartClose"),
  cartDrawer: document.getElementById("cartDrawer"),
  cartItems: document.getElementById("cartItems"),
  cartSubtotal: document.getElementById("cartSubtotal"),
  cartCount: document.getElementById("cartCount"),
  checkoutBtn: document.getElementById("checkoutBtn"),
  quickView: document.getElementById("quickView"),
  quickViewClose: document.getElementById("quickViewClose"),
  quickViewContent: document.getElementById("quickViewContent"),
};

function formatCurrency(value) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(value);
}

function clamp(num, min, max) { return Math.max(min, Math.min(max, num)); }

function debounce(fn, delay) {
  let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

function loadProducts() {
  // Demo data. Replace with API fetch if needed.
  const demo = [
    { id: "p1", name: "AeroRun Pro Shoes", category: "Shoes", price: 129.99, rating: 4.6, image: "https://picsum.photos/seed/aerorun/600/600", description: "Lightweight running shoes with responsive cushioning for daily miles." },
    { id: "p2", name: "Nimbus Hoodie", category: "Apparel", price: 74.50, rating: 4.4, image: "https://picsum.photos/seed/hoodie/600/600", description: "Cozy fleece hoodie with a modern fit and secure kangaroo pocket." },
    { id: "p3", name: "Trailblaze Hiking Boots", category: "Shoes", price: 159.00, rating: 4.7, image: "https://picsum.photos/seed/hike/600/600", description: "Waterproof boots with rugged traction for challenging terrains." },
    { id: "p4", name: "Everyday Tee", category: "Apparel", price: 22.00, rating: 4.1, image: "https://picsum.photos/seed/tee/600/600", description: "Breathable cotton tee designed for all-day comfort and layering." },
    { id: "p5", name: "Traveler Backpack", category: "Accessories", price: 98.00, rating: 4.5, image: "https://picsum.photos/seed/backpack/600/600", description: "Versatile 24L pack with protected laptop sleeve and smart organization." },
    { id: "p6", name: "Sonic Wireless Earbuds", category: "Electronics", price: 89.99, rating: 4.2, image: "https://picsum.photos/seed/earbuds/600/600", description: "True wireless earbuds with noise isolation and 24-hour battery life." },
    { id: "p7", name: "Classic Leather Belt", category: "Accessories", price: 39.00, rating: 4.0, image: "https://picsum.photos/seed/belt/600/600", description: "Premium full-grain leather belt with brushed metal buckle." },
    { id: "p8", name: "Momentum Smartwatch", category: "Electronics", price: 199.99, rating: 4.3, image: "https://picsum.photos/seed/watch/600/600", description: "Fitness tracking, notifications, and multi-day battery on your wrist." },
    { id: "p9", name: "Lumen Sunglasses", category: "Accessories", price: 59.00, rating: 4.1, image: "https://picsum.photos/seed/sunglasses/600/600", description: "Polarized lenses with UV400 protection and featherlight frames." },
    { id: "p10", name: "Denim Flex Jeans", category: "Apparel", price: 64.00, rating: 4.0, image: "https://picsum.photos/seed/jeans/600/600", description: "Stretch denim with a tapered fit for everyday movement." },
    { id: "p11", name: "Cascade Portable Speaker", category: "Electronics", price: 79.00, rating: 4.4, image: "https://picsum.photos/seed/speaker/600/600", description: "Rich 360° sound, water-resistant body, and 12-hour playtime." },
    { id: "p12", name: "CityWalk Sneakers", category: "Shoes", price: 89.00, rating: 4.2, image: "https://picsum.photos/seed/sneakers/600/600", description: "Minimal sneakers crafted for comfort and urban versatility." },
  ];
  state.products = demo;
}

function uniqueCategories(products) {
  return [...new Set(products.map(p => p.category))].sort();
}

function buildCategoryFilters() {
  const cats = uniqueCategories(state.products);
  dom.categoryList.innerHTML = "";
  cats.forEach(cat => {
    const id = `cat-${cat.replace(/\s+/g, "-").toLowerCase()}`;
    const label = document.createElement("label");
    label.innerHTML = `<input type="checkbox" value="${cat}" id="${id}"><span>${cat}</span>`;
    dom.categoryList.appendChild(label);
  });
  dom.categoryList.addEventListener("change", () => {
    state.filters.categories = new Set(
      [...dom.categoryList.querySelectorAll('input[type="checkbox"]:checked')].map(cb => cb.value)
    );
    updateView();
  });
}

function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return "★".repeat(full) + (half ? "☆" : "") + "✩".repeat(empty);
}

function productCard(product) {
  const card = document.createElement("article");
  card.className = "card";
  card.innerHTML = `
    <div class="card-media">
      <img src="${product.image}" alt="${product.name}" loading="lazy" />
    </div>
    <div class="card-body">
      <h3 class="card-title">${product.name}</h3>
      <div class="rating"><span class="stars" aria-hidden="true">${renderStars(product.rating)}</span><span class="sr-only">Rated ${product.rating} out of 5</span></div>
      <div class="price">${formatCurrency(product.price)}</div>
      <div class="card-actions">
        <button class="btn" data-quick-view="${product.id}">Quick view</button>
        <button class="btn primary" data-add-to-cart="${product.id}">Add to cart</button>
      </div>
    </div>
  `;
  return card;
}

function renderProducts(products) {
  dom.productGrid.setAttribute("aria-busy", "true");
  dom.productGrid.innerHTML = "";
  const frag = document.createDocumentFragment();
  products.forEach(p => frag.appendChild(productCard(p)));
  dom.productGrid.appendChild(frag);
  dom.resultCount.textContent = String(products.length);
  dom.productGrid.setAttribute("aria-busy", "false");
}

function applyFiltersSort() {
  const { search, categories, priceMin, priceMax, ratingMin, sort } = state.filters;
  let list = state.products.slice();

  if (search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter(p => (p.name + " " + p.description).toLowerCase().includes(q));
  }
  if (categories.size > 0) {
    list = list.filter(p => categories.has(p.category));
  }
  if (priceMin != null) list = list.filter(p => p.price >= priceMin);
  if (priceMax != null) list = list.filter(p => p.price <= priceMax);
  if (ratingMin > 0) list = list.filter(p => p.rating >= ratingMin);

  switch (sort) {
    case "price-asc": list.sort((a,b) => a.price - b.price); break;
    case "price-desc": list.sort((a,b) => b.price - a.price); break;
    case "rating-desc": list.sort((a,b) => b.rating - a.rating); break;
    case "name-asc": list.sort((a,b) => a.name.localeCompare(b.name)); break;
    default: /* relevance: current order preserved */ break;
  }

  state.filteredProducts = list;
}

function summarizeFilters() {
  const parts = [];
  if (state.filters.categories.size) parts.push([...state.filters.categories].join(", "));
  if (state.filters.priceMin != null || state.filters.priceMax != null) {
    const min = state.filters.priceMin != null ? formatCurrency(state.filters.priceMin) : "";
    const max = state.filters.priceMax != null ? formatCurrency(state.filters.priceMax) : "";
    parts.push(`Price ${min}${min && max ? " – " : ""}${max}`.trim());
  }
  if (state.filters.ratingMin > 0) parts.push(`${state.filters.ratingMin}★+`);
  dom.filtersSummary.textContent = parts.length ? ` · ${parts.join(" · ")}` : "";
}

function updateView() {
  applyFiltersSort();
  renderProducts(state.filteredProducts);
  summarizeFilters();
}

/* Cart logic */
function loadCart() {
  try { state.cart = JSON.parse(localStorage.getItem("shopswift_cart") || "{\"items\":[]}"); }
  catch { state.cart = { items: [] }; }
  if (!state.cart || !Array.isArray(state.cart.items)) state.cart = { items: [] };
}

function saveCart() {
  localStorage.setItem("shopswift_cart", JSON.stringify(state.cart));
}

function getCartItem(productId) {
  return state.cart.items.find(it => it.id === productId);
}

function getProductById(id) {
  return state.products.find(p => p.id === id);
}

function addToCart(productId, qty = 1) {
  const existing = getCartItem(productId);
  if (existing) existing.qty = clamp(existing.qty + qty, 1, 99);
  else state.cart.items.push({ id: productId, qty: clamp(qty, 1, 99) });
  saveCart();
  renderCart();
}

function updateQty(productId, qty) {
  const item = getCartItem(productId);
  if (!item) return;
  const n = clamp(Number(qty) || 0, 0, 99);
  if (n <= 0) removeFromCart(productId);
  else { item.qty = n; saveCart(); renderCart(); }
}

function removeFromCart(productId) {
  state.cart.items = state.cart.items.filter(it => it.id !== productId);
  saveCart(); renderCart();
}

function getSubtotal() {
  return state.cart.items.reduce((sum, it) => {
    const p = getProductById(it.id); return sum + (p ? p.price * it.qty : 0);
  }, 0);
}

function renderCart() {
  dom.cartItems.innerHTML = "";
  const frag = document.createDocumentFragment();
  state.cart.items.forEach(it => {
    const p = getProductById(it.id); if (!p) return;
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <div>
        <h4 class="cart-item-title">${p.name}</h4>
        <div class="muted">${formatCurrency(p.price)}</div>
        <button class="btn ghost remove-btn" data-remove="${p.id}">Remove</button>
      </div>
      <div class="qty">
        <label class="sr-only" for="qty-${p.id}">Quantity for ${p.name}</label>
        <input id="qty-${p.id}" type="number" min="0" max="99" step="1" value="${it.qty}" data-qty="${p.id}">
      </div>
    `;
    frag.appendChild(row);
  });
  dom.cartItems.appendChild(frag);
  const subtotal = getSubtotal();
  dom.cartSubtotal.textContent = formatCurrency(subtotal);
  const count = state.cart.items.reduce((n, it) => n + it.qty, 0);
  dom.cartCount.textContent = String(count);
  dom.checkoutBtn.disabled = count === 0;
}

/* Drawer & modal */
function openDrawer() {
  dom.cartDrawer.hidden = false; dom.overlay.hidden = false;
  dom.cartDrawer.classList.add("open"); dom.overlay.classList.add("show");
  dom.cartToggle.setAttribute("aria-expanded", "true");
}
function closeDrawer() {
  dom.cartDrawer.classList.remove("open"); dom.overlay.classList.remove("show");
  dom.cartToggle.setAttribute("aria-expanded", "false");
  setTimeout(() => { dom.cartDrawer.hidden = true; dom.overlay.hidden = true; }, 200);
}

function openFilters() {
  dom.filtersPanel.classList.add("open"); dom.overlay.hidden = false; dom.overlay.classList.add("show");
  dom.filterToggle.setAttribute("aria-expanded", "true");
}
function closeFilters() {
  dom.filtersPanel.classList.remove("open"); dom.overlay.classList.remove("show");
  dom.filterToggle.setAttribute("aria-expanded", "false");
  setTimeout(() => { dom.overlay.hidden = true; }, 200);
}

function openQuickView(product) {
  dom.quickView.hidden = false; dom.overlay.hidden = false; dom.overlay.classList.add("show");
  const content = document.createElement("div");
  content.className = "modal-content";
  content.innerHTML = `
    <div>
      <img src="${product.image}" alt="${product.name}">
    </div>
    <div>
      <h3 style="margin-top:0">${product.name}</h3>
      <div class="rating"><span class="stars" aria-hidden="true">${renderStars(product.rating)}</span><span class="sr-only">Rated ${product.rating} of 5</span></div>
      <p class="muted">${product.description}</p>
      <div class="price" style="margin:12px 0">${formatCurrency(product.price)}</div>
      <div style="display:flex; gap:8px">
        <button class="btn" id="qvAdd1">Add to cart</button>
        <button class="btn primary" id="qvBuyNow">Buy now</button>
      </div>
    </div>
  `;
  dom.quickViewContent.innerHTML = ""; dom.quickViewContent.appendChild(content);
  document.getElementById("qvAdd1").onclick = () => addToCart(product.id, 1);
  document.getElementById("qvBuyNow").onclick = () => { addToCart(product.id, 1); openDrawer(); };
}
function closeQuickView() {
  dom.quickView.hidden = true; dom.overlay.classList.remove("show");
  setTimeout(() => { if (!dom.cartDrawer.classList.contains("open") && !dom.filtersPanel.classList.contains("open")) dom.overlay.hidden = true; }, 200);
}

/* Event wiring */
function wireEvents() {
  if (dom.searchForm) dom.searchForm.addEventListener("submit", (e) => { e.preventDefault(); });
  dom.searchInput.addEventListener("input", debounce(e => { state.filters.search = e.target.value; updateView(); }, 250));
  dom.sortSelect.addEventListener("change", e => { state.filters.sort = e.target.value; updateView(); });
  dom.priceApply.addEventListener("click", () => {
    const min = dom.priceMin.value.trim(); const max = dom.priceMax.value.trim();
    state.filters.priceMin = min === "" ? null : Math.max(0, Number(min));
    state.filters.priceMax = max === "" ? null : Math.max(0, Number(max));
    updateView();
  });
  dom.ratingMin.addEventListener("change", () => { state.filters.ratingMin = Number(dom.ratingMin.value) || 0; updateView(); });
  dom.clearFilters.addEventListener("click", () => { clearAllFilters(); updateView(); });
  if (dom.applyFilters) dom.applyFilters.addEventListener("click", () => { closeFilters(); });

  dom.filterToggle.addEventListener("click", openFilters);
  if (dom.filtersClose) dom.filtersClose.addEventListener("click", closeFilters);
  if (dom.quickViewClose) dom.quickViewClose.addEventListener("click", closeQuickView);

  dom.cartToggle.addEventListener("click", openDrawer);
  dom.cartClose.addEventListener("click", closeDrawer);

  dom.overlay.addEventListener("click", () => {
    if (!dom.overlay.hidden) {
      if (!dom.quickView.hidden) closeQuickView();
      if (dom.cartDrawer.classList.contains("open")) closeDrawer();
      if (dom.filtersPanel.classList.contains("open")) closeFilters();
    }
  });

  dom.productGrid.addEventListener("click", (e) => {
    const addBtn = e.target.closest('[data-add-to-cart]');
    if (addBtn) { addToCart(addBtn.dataset.addToCart); }
    const qvBtn = e.target.closest('[data-quick-view]');
    if (qvBtn) { const p = getProductById(qvBtn.dataset.quickView); if (p) openQuickView(p); }
  });

  dom.cartItems.addEventListener("input", (e) => {
    const qtyEl = e.target.closest('[data-qty]');
    if (qtyEl) updateQty(qtyEl.dataset.qty, qtyEl.value);
  });
  dom.cartItems.addEventListener("click", (e) => {
    const rem = e.target.closest('[data-remove]');
    if (rem) removeFromCart(rem.dataset.remove);
  });

  dom.checkoutBtn.addEventListener("click", () => {
    alert("Checkout stub: integrate your checkout flow here.");
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (!dom.quickView.hidden) closeQuickView();
      else if (dom.cartDrawer.classList.contains("open")) closeDrawer();
      else if (dom.filtersPanel.classList.contains("open")) closeFilters();
    }
  });
}

function clearAllFilters() {
  state.filters.search = ""; dom.searchInput.value = "";
  state.filters.categories = new Set();
  dom.categoryList.querySelectorAll('input[type="checkbox"]').forEach(cb => { cb.checked = false; });
  state.filters.priceMin = null; state.filters.priceMax = null; dom.priceMin.value = ""; dom.priceMax.value = "";
  state.filters.ratingMin = 0; dom.ratingMin.value = "0";
  state.filters.sort = "relevance"; dom.sortSelect.value = "relevance";
  summarizeFilters();
}

function init() {
  loadProducts();
  buildCategoryFilters();
  loadCart();
  renderCart();
  updateView();
  wireEvents();
}

init();
