// Data bawaan awal Flower Shop Amelia
const defaultProducts = [
  { id: 1, name: "Buket Mawar Pink Pastel", category: "Buket Tangan", price: 125000, emoji: "💐" },
  { id: 2, name: "Buket Tulip Putih Elegan", category: "Buket Tangan", price: 165000, emoji: "🌷" },
  { id: 3, name: "Buket Bunga Matahari", category: "Buket Tangan", price: 110000, emoji: "🌻" },
  { id: 4, name: "Mawar Merah Segar (Tangkai)", category: "Bunga Tangkai", price: 25000, emoji: "🌹" },
  { id: 5, name: "Bunga Lily Harum (Tangkai)", category: "Bunga Tangkai", price: 35000, emoji: "🪷" },
  { id: 6, name: "Bunga Sakura Mini", category: "Bunga Tangkai", price: 30000, emoji: "🌸" },
  { id: 7, name: "Pot Anggrek Bulan Ungu", category: "Vas & Pot", price: 185000, emoji: "🪻" },
  { id: 8, name: "Vas Kaca Kembang Sepatu", category: "Vas & Pot", price: 95000, emoji: "🌺" }
];

// Ambil data dari memori browser jika sudah pernah diubah Owner
let products = JSON.parse(localStorage.getItem("amelia_flower_catalog")) || defaultProducts;
let cart = [];
let activeCategory = "Semua";
let searchKeyword = "";
let isOwnerMode = true; // Default masuk sebagai Owner (Amelia)

// Format angka ke Rupiah
function formatRupiah(angka) {
  return "Rp " + Number(angka).toLocaleString("id-ID");
}

// Simpan katalog bunga ke browser
function saveCatalogToStorage() {
  localStorage.setItem("amelia_flower_catalog", JSON.stringify(products));
}

// Tampilkan kartu bunga ke layar
function renderProducts() {
  const grid = document.getElementById("productGrid");

  const filtered = products.filter(item => {
    const matchCat = activeCategory === "Semua" || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchCat && matchSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<p style="color:#7a686e; grid-column: 1/-1; text-align:center; padding: 30px;">Varian bunga tidak ditemukan.</p>`;
    return;
  }

  grid.innerHTML = filtered.map(item => `
    <div class="product-card">
      ${isOwnerMode ? `
        <div class="admin-card-actions">
          <button class="btn-icon-edit" title="Edit Varian & Harga" onclick="openEditModal(${item.id})">✏️</button>
          <button class="btn-icon-delete" title="Hapus Varian" onclick="deleteProduct(${item.id})">🗑️</button>
        </div>
      ` : ""}
      <div>
        <div class="product-img-box">${item.emoji}</div>
        <span class="product-tag">${item.category}</span>
        <h3 class="product-title">${item.name}</h3>
      </div>
      <div>
        <div class="product-price">${formatRupiah(item.price)}</div>
        <button class="btn-add-cart" onclick="addToCart(${item.id})">+ Tambah</button>
      </div>
    </div>
  `).join("");
}

// ================= FITUR ADMIN / OWNER =================

function openAddModal() {
  document.getElementById("modalTitle").innerText = "Tambah Varian Bunga Baru";
  document.getElementById("editProductId").value = "";
  document.getElementById("prodName").value = "";
  document.getElementById("prodCategory").value = "Buket Tangan";
  document.getElementById("prodPrice").value = "";
  document.getElementById("prodEmoji").value = "💐";
  document.getElementById("productModal").classList.remove("hidden");
}

function openEditModal(id) {
  const item = products.find(p => p.id === id);
  if (!item) return;

  document.getElementById("modalTitle").innerText = "Edit Varian & Harga Bunga";
  document.getElementById("editProductId").value = item.id;
  document.getElementById("prodName").value = item.name;
  document.getElementById("prodCategory").value = item.category;
  document.getElementById("prodPrice").value = item.price;
  document.getElementById("prodEmoji").value = item.emoji;
  document.getElementById("productModal").classList.remove("hidden");
}

function closeProductModal() {
  document.getElementById("productModal").classList.add("hidden");
}

function selectEmoji(emoji) {
  document.getElementById("prodEmoji").value = emoji;
}

function saveProduct() {
  const idVal = document.getElementById("editProductId").value;
  const name = document.getElementById("prodName").value.trim();
  const category = document.getElementById("prodCategory").value;
  const price = Number(document.getElementById("prodPrice").value);
  const emoji = document.getElementById("prodEmoji").value || "🌸";

  if (!name || price <= 0) {
    alert("Nama bunga dan harga wajib diisi dengan benar!");
    return;
  }

  if (idVal) {
    // Mode Edit Bunga yang sudah ada
    const target = products.find(p => p.id === Number(idVal));
    if (target) {
      target.name = name;
      target.category = category;
      target.price = price;
      target.emoji = emoji;
    }
  } else {
    // Mode Tambah Varian Bunga Baru
    products.push({
      id: Date.now(),
      name,
      category,
      price,
      emoji
    });
  }

  saveCatalogToStorage();
  renderProducts();
  renderCart(); // Perbarui harga di keranjang jika item sedang dipilih
  closeProductModal();
}

function deleteProduct(id) {
  const item = products.find(p => p.id === id);
  if (!item) return;

  if (confirm(`Yakin ingin menghapus "${item.name}" dari katalog?`)) {
    products = products.filter(p => p.id !== id);
    cart = cart.filter(c => c.id !== id);
    saveCatalogToStorage();
    renderProducts();
    renderCart();
  }
}

// ================= GANTI MODE OWNER / KASIR =================

function openRoleModal() {
  document.getElementById("pinError").classList.add("hidden");
  document.getElementById("ownerPinInput").value = "";
  if (!isOwnerMode) {
    document.getElementById("pinSection").classList.remove("hidden");
  } else {
    document.getElementById("pinSection").classList.add("hidden");
  }
  document.getElementById("roleModal").classList.remove("hidden");
}

function closeRoleModal() {
  document.getElementById("roleModal").classList.add("hidden");
}

function switchToOwner() {
  if (!isOwnerMode) {
    const pin = document.getElementById("ownerPinInput").value;
    if (pin !== "1234") {
      document.getElementById("pinError").classList.remove("hidden");
      return;
    }
  }
  isOwnerMode = true;
  document.getElementById("roleLabel").innerText = "👩‍💼 Amelia (Owner)";
  document.getElementById("btnTambahVarian").classList.remove("hidden");
  renderProducts();
  closeRoleModal();
}

function switchToCashier() {
  isOwnerMode = false;
  document.getElementById("roleLabel").innerText = "🧑‍💻 Mode Kasir";
  document.getElementById("btnTambahVarian").classList.add("hidden");
  renderProducts();
  closeRoleModal();
}

// ================= FITUR KERANJANG & KASIR =================

function addToCart(id) {
  const existing = cart.find(c => c.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, qty: 1 });
  }
  renderCart();
}

function updateQty(id, delta) {
  const item = cart.find(c => c.id === id);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(c => c.id !== id);
  }
  renderCart();
}

function clearCart() {
  cart = [];
  document.getElementById("cashInput").value = "";
  renderCart();
}

function getCartTotal() {
  return cart.reduce((sum, item) => {
    const prod = products.find(p => p.id === item.id);
    return sum + (prod ? prod.price * item.qty : 0);
  }, 0);
}

function renderCart() {
  const container = document.getElementById("cartItems");
  const total = getCartTotal();
  document.getElementById("totalDisplay").innerText = formatRupiah(total);

  if (cart.length === 0) {
    container.innerHTML = `<div class="empty-cart">Belum ada bunga yang dipilih.</div>`;
    calculateChange();
    return;
  }

  container.innerHTML = cart.map(item => {
    const prod = products.find(p => p.id === item.id);
    if (!prod) return "";
    return `
      <div class="cart-item">
        <div class="cart-item-info">
          <h4>${prod.emoji} ${prod.name}</h4>
          <span>${formatRupiah(prod.price * item.qty)}</span>
        </div>
        <div class="qty-controls">
          <button class="qty-btn" onclick="updateQty(${prod.id}, -1)">-</button>
          <span>${item.qty}</span>
          <button class="qty-btn" onclick="updateQty(${prod.id}, 1)">+</button>
        </div>
      </div>
    `;
  }).join("");

  calculateChange();
}

function handlePaymentMethodChange() {
  const method = document.getElementById("paymentMethod").value;
  const cashSection = document.getElementById("cashInputSection");

  if (method === "Tunai (Cash)") {
    cashSection.classList.remove("hidden");
  } else {
    cashSection.classList.add("hidden");
  }
  calculateChange();
}

function setExactCash() {
  const total = getCartTotal();
  if (total > 0) {
    document.getElementById("cashInput").value = total;
    calculateChange();
  }
}

function setQuickCash(amount) {
  document.getElementById("cashInput").value = amount;
  calculateChange();
}

function calculateChange() {
  const total = getCartTotal();
  const method = document.getElementById("paymentMethod").value;
  const btnCheckout = document.getElementById("btnCheckout");

  if (total === 0) {
    document.getElementById("changeDisplay").innerText = "Rp 0";
    btnCheckout.disabled = true;
    return;
  }

  if (method !== "Tunai (Cash)") {
    btnCheckout.disabled = false;
    return;
  }

  const cash = Number(document.getElementById("cashInput").value);
  const change = cash - total;

  if (change >= 0) {
    document.getElementById("changeDisplay").innerText = formatRupiah(change);
    btnCheckout.disabled = false;
  } else {
    document.getElementById("changeDisplay").innerText = "Kurang " + formatRupiah(Math.abs(change));
    btnCheckout.disabled = true;
  }
}

function processCheckout() {
  const total = getCartTotal();
  const method = document.getElementById("paymentMethod").value;
  const cash = method === "Tunai (Cash)" ? Number(document.getElementById("cashInput").value) : total;
  const change = cash - total;

  const itemsHtml = cart.map(item => {
    const prod = products.find(p => p.id === item.id);
    return `<div>• ${prod.name} (${item.qty}x) — <b>${formatRupiah(prod.price * item.qty)}</b></div>`;
  }).join("");

  document.getElementById("receiptContent").innerHTML = `
    ${itemsHtml}
    <hr style="margin: 10px 0; border: 0; border-top: 1px dashed #ccc;">
    <div>Metode Bayar: <b>${method}</b></div>
    <div>Total Belanja: <b>${formatRupiah(total)}</b></div>
    <div>Dibayar: <b>${formatRupiah(cash)}</b></div>
    <div>Kembalian: <b>${formatRupiah(change)}</b></div>
  `;

  document.getElementById("receiptModal").classList.remove("hidden");
}

function closeReceiptModal() {
  document.getElementById("receiptModal").classList.add("hidden");
  clearCart();
}

// Event Listener Pencarian & Filter Kategori
document.getElementById("searchInput").addEventListener("input", e => {
  searchKeyword = e.target.value;
  renderProducts();
});

document.querySelectorAll(".cat-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeCategory = btn.dataset.category;
    renderProducts();
  });
});

// Jalankan pertama kali saat halaman dibuka
renderProducts();
renderCart();