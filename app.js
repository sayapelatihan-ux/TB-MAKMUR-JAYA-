const STORAGE_KEY = "tb-makmur-jaya-state-v1";

const initialProducts = [
  {
    id: "semen-portland",
    name: "Semen Portland",
    price: 65000,
    category: "Material Dasar",
    stock: 48,
    description: "Semen kualitas premium untuk konstruksi dinding dan lantai.",
    imageLabel: "Semen Portland",
    imageColor: ["#f97316", "#fde68a"],
    reviews: [
      { user: "Andi", text: "Kualitas bagus dan pengiriman cepat.", rating: 5 },
      { user: "Mira", text: "Sesuai kebutuhan proyek rumah saya.", rating: 4 }
    ]
  },
  {
    id: "cat-tembok",
    name: "Cat Tembok Premium",
    price: 145000,
    category: "Finishing",
    stock: 24,
    description: "Cat tembok anti bocor dengan warna tahan lama.",
    imageLabel: "Cat Tembok",
    imageColor: ["#f43f5e", "#fb7185"],
    reviews: [
      { user: "Rina", text: "Warna sangat rapi setelah dipakai.", rating: 5 },
      { user: "Doni", text: "Covering-nya bagus, tidak mudah luntur.", rating: 4 }
    ]
  },
  {
    id: "pipa-hdpe",
    name: "Pipa HDPE 2 inch",
    price: 89000,
    category: "Plumbing",
    stock: 30,
    description: "Pipa tahan korosi untuk saluran air bersih.",
    imageLabel: "Pipa HDPE",
    imageColor: ["#0f766e", "#34d399"],
    reviews: [
      { user: "Bambang", text: "Tidak bocor dan sangat awet.", rating: 5 },
      { user: "Lita", text: "Pemasangan sangat mudah.", rating: 4 }
    ]
  },
  {
    id: "keramik-40x40",
    name: "Keramik 40x40",
    price: 112000,
    category: "Lantai",
    stock: 56,
    description: "Keramik motif elegan untuk lantai rumah dan toko.",
    imageLabel: "Keramik 40x40",
    imageColor: ["#6366f1", "#a78bfa"],
    reviews: [
      { user: "Citra", text: "Tampilannya modern dan kualitas baik.", rating: 5 },
      { user: "Joko", text: "Pas untuk kebutuhan renovasi rumah.", rating: 4 }
    ]
  }
];

const credentials = {
  user: { username: "user", password: "user123", role: "user" },
  admin: { username: "admin", password: "admin123", role: "admin" }
};

const initialState = {
  user: null,
  role: null,
  cart: [],
  transactions: [],
  cashFlow: [
    { id: "flow-1", type: "pemasukan", title: "Modal awal", amount: 5000000, createdAt: new Date().toISOString() },
    { id: "flow-2", type: "pengeluaran", title: "Pembelian alat kerja", amount: 1200000, createdAt: new Date().toISOString() }
  ],
  activeCarouselIndex: 0,
  search: "",
  sort: "default"
};

function createProductImage(label, color1, color2) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450">
      <rect width="600" height="450" rx="28" fill="${color1}" />
      <rect x="60" y="70" width="480" height="310" rx="24" fill="${color2}" opacity="0.75" />
      <rect x="120" y="120" width="180" height="140" rx="16" fill="white" opacity="0.9" />
      <rect x="330" y="120" width="150" height="24" rx="12" fill="white" opacity="0.95" />
      <rect x="330" y="160" width="120" height="18" rx="9" fill="white" opacity="0.9" />
      <rect x="330" y="200" width="90" height="18" rx="9" fill="white" opacity="0.85" />
      <text x="300" y="340" font-size="32" font-family="Segoe UI, Arial" text-anchor="middle" fill="white" font-weight="700">${label}</text>
    </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const products = initialProducts.map((product) => ({
  ...product,
  image: createProductImage(product.imageLabel, product.imageColor[0], product.imageColor[1])
}));

function loadState() {
  if (typeof window === "undefined") {
    return { ...initialState, products, transactions: [], cashFlow: initialState.cashFlow.slice() };
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return { ...initialState, products, transactions: [], cashFlow: initialState.cashFlow.slice() };
  }

  try {
    const parsed = JSON.parse(stored);
    return {
      ...initialState,
      ...parsed,
      products,
      cart: parsed.cart || [],
      transactions: parsed.transactions || [],
      cashFlow: parsed.cashFlow || initialState.cashFlow.slice()
    };
  } catch {
    return { ...initialState, products, transactions: [], cashFlow: initialState.cashFlow.slice() };
  }
}

const state = loadState();

function saveState() {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(value);
}

export function calculateCartTotal(cart) {
  return cart.reduce((total, item) => total + item.price * item.qty, 0);
}

export function summarizeTransactions(transactions, cashFlow) {
  const income = cashFlow.filter((item) => item.type === "pemasukan").reduce((sum, item) => sum + item.amount, 0);
  const expense = cashFlow.filter((item) => item.type === "pengeluaran").reduce((sum, item) => sum + item.amount, 0);
  return {
    products: products.length,
    sales: transactions.length,
    income,
    expense,
    balance: income - expense
  };
}

export function authenticateUser(username, password) {
  const normalizedUsername = username.trim().toLowerCase();
  const normalizedPassword = password.trim();
  const account = credentials[normalizedUsername];

  if (!account || account.password !== normalizedPassword) {
    return { success: false, role: null, message: "Username atau password salah." };
  }

  return { success: true, role: account.role, message: "Login berhasil." };
}

function getProductById(id) {
  return products.find((product) => product.id === id);
}

function getFilteredProducts() {
  const search = state.search.toLowerCase();
  const filtered = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search) || product.category.toLowerCase().includes(search);
    return matchesSearch;
  });

  if (state.sort === "price-asc") {
    filtered.sort((a, b) => a.price - b.price);
  }
  if (state.sort === "price-desc") {
    filtered.sort((a, b) => b.price - a.price);
  }
  return filtered;
}

function renderFeaturedCarousel() {
  const featuredProduct = products[state.activeCarouselIndex % products.length];
  const featuredName = document.getElementById("featuredName");
  const featuredDesc = document.getElementById("featuredDesc");
  const featuredPrice = document.getElementById("featuredPrice");
  const featuredCategory = document.getElementById("featuredCategory");

  if (!featuredProduct || !featuredName || !featuredDesc || !featuredPrice || !featuredCategory) {
    return;
  }

  featuredName.textContent = featuredProduct.name;
  featuredDesc.textContent = featuredProduct.description;
  featuredPrice.textContent = formatCurrency(featuredProduct.price);
  featuredCategory.textContent = featuredProduct.category;
}

function renderProducts() {
  const productGrid = document.getElementById("productGrid");
  if (!productGrid) return;

  const filteredProducts = getFilteredProducts();
  productGrid.innerHTML = filteredProducts.map((product) => `
    <article class="product-card">
      <img class="product-image" src="${product.image}" alt="${product.name}" />
      <div class="product-body">
        <div class="product-title">
          <h4>${product.name}</h4>
          <span class="badge">${product.stock} stok</span>
        </div>
        <div class="product-meta">
          <div>${product.category}</div>
          <div>${product.description}</div>
        </div>
        <div class="price">${formatCurrency(product.price)}</div>
        <button class="btn primary" data-action="add-to-cart" data-product-id="${product.id}">+ Keranjang</button>
        <div class="reviews">
          <strong>Ulasan</strong>
          ${product.reviews.map((review) => `
            <div class="review-item">${"★".repeat(review.rating)} ${review.user}: ${review.text}</div>
          `).join("")}
        </div>
      </div>
    </article>
  `).join("");
}

function renderCart() {
  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");
  const checkoutBtn = document.getElementById("checkoutBtn");

  if (!cartItems || !cartTotal || !checkoutBtn) return;

  if (state.cart.length === 0) {
    cartItems.innerHTML = '<p class="small">Keranjang masih kosong. Tambahkan produk untuk memulai.</p>';
    cartTotal.textContent = formatCurrency(0);
    checkoutBtn.disabled = true;
    return;
  }

  checkoutBtn.disabled = false;
  cartItems.innerHTML = state.cart.map((item) => `
    <div class="cart-item">
      <div>
        <strong>${item.name}</strong>
        <div class="small">${formatCurrency(item.price)} / unit</div>
      </div>
      <div class="small">Qty ${item.qty}</div>
      <div class="actions">
        <button data-action="decrease-qty" data-product-id="${item.id}">-</button>
        <button data-action="increase-qty" data-product-id="${item.id}">+</button>
        <button data-action="remove-from-cart" data-product-id="${item.id}">Hapus</button>
      </div>
    </div>
  `).join("");
  cartTotal.textContent = formatCurrency(calculateCartTotal(state.cart));
}

function renderSummary() {
  const summaryCards = document.getElementById("summaryCards");
  if (!summaryCards) return;

  const summary = summarizeTransactions(state.transactions, state.cashFlow);
  summaryCards.innerHTML = `
    <div class="summary-card">
      <span class="small">Produk</span>
      <strong>${summary.products}</strong>
    </div>
    <div class="summary-card">
      <span class="small">Transaksi</span>
      <strong>${summary.sales}</strong>
    </div>
    <div class="summary-card">
      <span class="small">Saldo</span>
      <strong>${formatCurrency(summary.balance)}</strong>
    </div>
  `;
}

function renderCashFlow() {
  const cashFlowList = document.getElementById("cashFlowList");
  if (!cashFlowList) return;

  cashFlowList.innerHTML = state.cashFlow
    .slice(0, 8)
    .map((item) => `
      <li class="flow-item">
        <div>
          <strong>${item.title}</strong>
          <div class="small">${item.type === "pemasukan" ? "Uang masuk" : "Uang keluar"}</div>
        </div>
        <div>${formatCurrency(item.amount)}</div>
      </li>
    `)
    .join("");
}

function renderLogin() {
  const loginStatus = document.getElementById("loginStatus");
  if (!loginStatus) return;
  loginStatus.textContent = state.user
    ? `Login sebagai ${state.user} (${state.role === "admin" ? "Admin" : "User"})`
    : "Belum login";
}

function render() {
  renderFeaturedCarousel();
  renderProducts();
  renderCart();
  renderSummary();
  renderCashFlow();
  renderLogin();
}

function addToCart(productId) {
  const product = getProductById(productId);
  if (!product) return;
  if (!state.user) {
    window.alert("Silakan login terlebih dahulu sebelum menambahkan produk ke keranjang.");
    return;
  }

  const existing = state.cart.find((item) => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    state.cart.push({ ...product, qty: 1 });
  }
  saveState();
  renderCart();
}

function updateCartQuantity(productId, delta) {
  const item = state.cart.find((entry) => entry.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    state.cart = state.cart.filter((entry) => entry.id !== productId);
  }
  saveState();
  renderCart();
}

function removeFromCart(productId) {
  state.cart = state.cart.filter((item) => item.id !== productId);
  saveState();
  renderCart();
}

function checkout() {
  if (!state.user) {
    window.alert("Login dulu sebelum checkout.");
    return;
  }
  if (state.cart.length === 0) {
    window.alert("Keranjang masih kosong.");
    return;
  }

  const total = calculateCartTotal(state.cart);
  const sale = {
    id: crypto.randomUUID(),
    customer: state.user,
    items: state.cart.map((item) => ({ name: item.name, qty: item.qty })),
    total,
    createdAt: new Date().toISOString()
  };

  state.transactions.unshift(sale);
  state.cashFlow.unshift({
    id: crypto.randomUUID(),
    type: "pemasukan",
    title: `Penjualan: ${sale.items.map((item) => `${item.name} x${item.qty}`).join(", ")}`,
    amount: total,
    createdAt: sale.createdAt
  });
  state.cart = [];
  saveState();
  render();
  window.alert("Checkout sukses. Transaksi barang dan uang masuk telah tercatat.");
}

function handleLogin(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const username = formData.get("username").toString();
  const password = formData.get("password").toString();

  if (!username || !password) {
    window.alert("Isi nama pengguna dan kata sandi.");
    return;
  }

  const authResult = authenticateUser(username, password);
  if (!authResult.success) {
    window.alert(authResult.message);
    return;
  }

  state.user = username;
  state.role = authResult.role;
  saveState();
  renderLogin();
  event.currentTarget.reset();
}

function handleCashFlow(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const title = formData.get("title").toString().trim();
  const amount = Number(formData.get("amount"));
  const type = formData.get("flowType").toString();

  if (!title || !amount) {
    window.alert("Lengkapi keterangan dan nominal.");
    return;
  }

  state.cashFlow.unshift({
    id: crypto.randomUUID(),
    type,
    title,
    amount,
    createdAt: new Date().toISOString()
  });
  saveState();
  renderSummary();
  renderCashFlow();
  event.currentTarget.reset();
}

function attachEvents() {
  document.getElementById("loginForm")?.addEventListener("submit", handleLogin);
  document.getElementById("cashFlowForm")?.addEventListener("submit", handleCashFlow);
  document.getElementById("checkoutBtn")?.addEventListener("click", checkout);
  document.getElementById("searchInput")?.addEventListener("input", (event) => {
    state.search = event.target.value;
    renderProducts();
  });
  document.getElementById("sortSelect")?.addEventListener("change", (event) => {
    state.sort = event.target.value;
    renderProducts();
  });

  document.querySelectorAll("[data-featured-nav]").forEach((button) => {
    button.addEventListener("click", () => {
      const direction = button.getAttribute("data-featured-nav");
      state.activeCarouselIndex = direction === "next"
        ? (state.activeCarouselIndex + 1) % products.length
        : (state.activeCarouselIndex - 1 + products.length) % products.length;
      renderFeaturedCarousel();
    });
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    const action = target instanceof Element ? target.getAttribute("data-action") : null;
    const productId = target instanceof Element ? target.getAttribute("data-product-id") : null;

    if (action === "add-to-cart" && productId) {
      addToCart(productId);
      return;
    }

    if (action === "increase-qty" && productId) {
      updateCartQuantity(productId, 1);
      return;
    }

    if (action === "decrease-qty" && productId) {
      updateCartQuantity(productId, -1);
      return;
    }

    if (action === "remove-from-cart" && productId) {
      removeFromCart(productId);
    }
  });
}

if (typeof window !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    attachEvents();
    render();
    setInterval(() => {
      state.activeCarouselIndex = (state.activeCarouselIndex + 1) % products.length;
      renderFeaturedCarousel();
    }, 4000);
  });
}
