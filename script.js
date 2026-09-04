// --- 1. DEFAULT SEED DATA ---
const defaultMedicines = [
  { id: 1, name: "Amoxicillin", dosage: "500mg Capsule", category: "Antibiotics", price: 15.00, stock: 85 },
  { id: 2, name: "Co-Amoxiclav (Augmentin)", dosage: "625mg Tablet", category: "Antibiotics", price: 42.50, stock: 40 },
  { id: 3, name: "Ciprofloxacin", dosage: "500mg Tablet", category: "Antibiotics", price: 28.00, stock: 60 },
  { id: 4, name: "Azithromycin", dosage: "500mg Tablet", category: "Antibiotics", price: 95.00, stock: 35 },
  { id: 5, name: "Cefalexin", dosage: "500mg Capsule", category: "Antibiotics", price: 22.00, stock: 50 },
  { id: 6, name: "Cefuroxime Axetil", dosage: "500mg Tablet", category: "Antibiotics", price: 65.00, stock: 45 },
  { id: 7, name: "Doxycycline", dosage: "100mg Capsule", category: "Antibiotics", price: 18.00, stock: 70 },
  { id: 8, name: "Amlodipine Besylate", dosage: "10mg Tablet", category: "Cardiovascular / BP", price: 9.50, stock: 120 },
  { id: 9, name: "Losartan Potassium", dosage: "50mg Tablet", category: "Cardiovascular / BP", price: 12.00, stock: 110 },
  { id: 10, name: "Metoprolol Tartrate", dosage: "50mg Tablet", category: "Cardiovascular / BP", price: 8.00, stock: 90 },
  { id: 11, name: "Atorvastatin", dosage: "20mg Tablet", category: "Cardiovascular / BP", price: 19.50, stock: 75 },
  { id: 12, name: "Rosuvastatin", dosage: "10mg Tablet", category: "Cardiovascular / BP", price: 24.00, stock: 65 },
  { id: 13, name: "Clopidogrel", dosage: "75mg Tablet", category: "Cardiovascular / BP", price: 17.50, stock: 80 },
  { id: 14, name: "Metformin HCl", dosage: "500mg Tablet", category: "Diabetes", price: 6.50, stock: 150 },
  { id: 15, name: "Gliclazide MR", dosage: "60mg Tablet", category: "Diabetes", price: 16.00, stock: 60 },
  { id: 16, name: "Sitagliptin (Januvia)", dosage: "100mg Tablet", category: "Diabetes", price: 58.00, stock: 30 },
  { id: 17, name: "Insulin Glargine Pen", dosage: "100 units/mL", category: "Diabetes", price: 850.00, stock: 20 },
  { id: 18, name: "Salbutamol Nebule", dosage: "2.5mg/2.5mL", category: "Respiratory", price: 25.00, stock: 95 },
  { id: 19, name: "Budesonide + Formoterol", dosage: "160/4.5mcg Inhaler", category: "Respiratory", price: 1150.00, stock: 15 },
  { id: 20, name: "Montelukast", dosage: "10mg Tablet", category: "Respiratory", price: 23.00, stock: 65 },
  { id: 21, name: "Mefenamic Acid", dosage: "500mg Capsule", category: "Pain & Anti-inflammatory", price: 7.50, stock: 140 },
  { id: 22, name: "Celecoxib", dosage: "200mg Capsule", category: "Pain & Anti-inflammatory", price: 21.00, stock: 80 },
  { id: 23, name: "Tramadol HCl", dosage: "50mg Capsule", category: "Pain & Anti-inflammatory", price: 26.00, stock: 40 },
  { id: 24, name: "Diclofenac Sodium", dosage: "50mg Tablet", category: "Pain & Anti-inflammatory", price: 11.00, stock: 85 },
  { id: 25, name: "Sertraline HCl", dosage: "50mg Tablet", category: "Mental Health & Neuro", price: 34.00, stock: 45 },
  { id: 26, name: "Escitalopram", dosage: "10mg Tablet", category: "Mental Health & Neuro", price: 29.50, stock: 50 },
  { id: 27, name: "Clonazepam (S2 Rx)", dosage: "2mg Tablet", category: "Mental Health & Neuro", price: 38.00, stock: 25 },
  { id: 28, name: "Omeprazole", dosage: "40mg Capsule", category: "Gastrointestinal", price: 18.00, stock: 90 },
  { id: 29, name: "Esomeprazole (Nexium)", dosage: "40mg Tablet", category: "Gastrointestinal", price: 62.00, stock: 45 },
  { id: 30, name: "Domperidone", dosage: "10mg Tablet", category: "Gastrointestinal", price: 10.50, stock: 85 }
];

let products = [];
let cart = [];
let quantities = {};
let currentCategory = "all";

// --- 8. CUSTOMER SERVICE CHAT INITIALIZATION ---
let custId = localStorage.getItem("quickmed_cust_id");
if (!custId) {
  custId = "CUST-" + Math.floor(1000 + Math.random() * 9000);
  localStorage.setItem("quickmed_cust_id", custId);
}
let chatLog = JSON.parse(localStorage.getItem(`quickmed_chat_${custId}`)) || [
  { sender: "CS", text: "Hello! Welcome to QuickMed. Having a problem? Let us know!", time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
];

// --- 2. LOCAL OFFLINE INITIALIZATION ---
function loadLocalInventory() {
  const saved = localStorage.getItem("quickmed_inventory");
  if (saved) {
    try { products = JSON.parse(saved); } catch(e) { products = [...defaultMedicines]; }
  } else {
    products = [...defaultMedicines];
    localStorage.setItem("quickmed_inventory", JSON.stringify(products));
  }
  applyCurrentFilter();
  updateCartPricesLive();
}
loadLocalInventory();

// --- 3. CROSS-TAB OFFLINE SYNC ---
const syncChannel = new BroadcastChannel("quickmed_sync");
syncChannel.onmessage = function(event) {
  if (event.data && (event.data.type === "INVENTORY_UPDATED" || event.data.type === "ALL_SAVED")) {
    loadLocalInventory();
  }
  if (event.data && event.data.type === "CHAT_UPDATE") {
    chatLog = JSON.parse(localStorage.getItem(`quickmed_chat_${custId}`)) || chatLog;
    if (document.getElementById("chatWindow") && document.getElementById("chatWindow").classList.contains("open")) {
      renderChatUI();
    }
  }
};

window.addEventListener("storage", (e) => {
  if (e.key === "quickmed_inventory") loadLocalInventory();
  if (e.key === `quickmed_chat_${custId}`) {
    chatLog = JSON.parse(e.newValue) || chatLog;
    if (document.getElementById("chatWindow") && document.getElementById("chatWindow").classList.contains("open")) {
      renderChatUI();
    }
  }
});

// --- 4. FIREBASE CLOUD SETUP (SMART ONLINE HYBRID) ---
const firebaseConfig = {
  apiKey: "AIzaSyCQgeKNV8TWAakuE8ESukV5XlQGAZgdFGU",
  authDomain: "quickmed-pharmacy.firebaseapp.com",
  databaseURL: "https://quickmed-pharmacy-default-rtdb.firebaseio.com",
  projectId: "quickmed-pharmacy"
};

let db = null;
try {
  if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    db = firebase.database();

    db.ref("inventory").on("value", (snapshot) => {
      const data = snapshot.val();
      if (data && Object.keys(data).length > 0) {
        products = Array.isArray(data) ? data.filter(Boolean) : Object.values(data);
        localStorage.setItem("quickmed_inventory", JSON.stringify(products));
        applyCurrentFilter();
        updateCartPricesLive();
      } else {
        db.ref("inventory").set(products);
      }
    });

    // Live Cloud Chat Sync for Website
    db.ref(`chats/${custId}/messages`).on("value", (snapshot) => {
      const data = snapshot.val();
      if (data) {
        chatLog = Object.values(data);
      } else {
        // BUG FIX: Instantly clear history if Admin deletes the chat
        chatLog = [
          { 
            sender: "CS", 
            text: "Your problem has been solved. If you still need help, feel free to chat again!", 
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            isEndChat: true
          }
        ];
      }
      localStorage.setItem(`quickmed_chat_${custId}`, JSON.stringify(chatLog));
      if (document.getElementById("chatWindow") && document.getElementById("chatWindow").classList.contains("open")) {
        renderChatUI();
      }
    });

    // Live Queue Counter
    db.ref("chats").on("value", (snapshot) => {
      const data = snapshot.val();
      const statusText = document.getElementById("chatQueueStatus");
      if (statusText) {
        if (data) {
          const activeUsers = Object.keys(data).length;
          statusText.innerText = `Queue: ${activeUsers} customer(s) waiting in line...`;
        } else {
          statusText.innerText = `Queue: 0 customers waiting`;
        }
      }
    });
  }
} catch(e) { console.log("Firebase standby / Offline Mode Active."); }

// --- 5. UI RENDERING ---
function imgFallback(imgTag) {
  imgTag.onerror = null;
  imgTag.src = "https://placehold.co/200x200?text=Rx+Slot";
}

function renderProducts(items) {
  const grid = document.getElementById("productsGrid");
  if (!grid) return;
  grid.innerHTML = "";

  items.forEach(product => {
    if (!quantities[product.id]) quantities[product.id] = 1;
    const isOutOfStock = Number(product.stock) <= 0;

    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <div>
        <div class="card-img-wrap">
          <img src="picsmed/${product.id}.png" alt="${product.name}" onerror="imgFallback(this)" />
        </div>
        <span class="slot-tag">Rx Slot #${product.id}</span>
        <span class="card-tag">${product.category}</span>
        <h3>${product.name}</h3>
        <p class="dosage">${product.dosage}</p>
        <p class="stock-tag" style="color: ${isOutOfStock ? '#dc2626' : '#059669'};">
          <i class="fa-solid ${isOutOfStock ? 'fa-ban' : 'fa-check'}"></i> 
          Stock: ${isOutOfStock ? 'OUT OF STOCK' : product.stock}
        </p>
        <p class="price">₱${Number(product.price).toFixed(2)}</p>
      </div>
      <div class="card-bottom">
        <div class="quantity-stepper">
          <button type="button" onclick="changeQty(${product.id}, -1)" ${isOutOfStock ? 'disabled' : ''}>-</button>
          <span id="qty-${product.id}">${quantities[product.id]}</span>
          <button type="button" onclick="changeQty(${product.id}, 1)" ${isOutOfStock ? 'disabled' : ''}>+</button>
        </div>
        <button type="button" class="add-btn" onclick="addToCart(${product.id})" ${isOutOfStock ? 'disabled style="background:#94a3b8; cursor:not-allowed;"' : ''}>
          <i class="fa-solid fa-cart-plus"></i> ${isOutOfStock ? 'Unavailable' : 'Add to Cart'}
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function changeQty(id, delta) {
  const item = products.find(p => p.id === id);
  if (!item) return;
  const next = (quantities[id] || 1) + delta;
  if (next >= 1 && next <= item.stock) {
    quantities[id] = next;
    const span = document.getElementById(`qty-${id}`);
    if (span) span.innerText = next;
  }
}

function addToCart(id) {
  const prod = products.find(p => p.id === id);
  if (!prod || prod.stock <= 0) return;
  const qty = quantities[id] || 1;
  const existing = cart.find(c => c.id === id);
  if (existing) existing.qty = Math.min(prod.stock, existing.qty + qty);
  else cart.push({ ...prod, qty });
  quantities[id] = 1;
  const qtyElem = document.getElementById(`qty-${id}`);
  if (qtyElem) qtyElem.innerText = 1;
  updateCartUI();
  toggleCart(true);
}

function updateCartPricesLive() {
  cart.forEach(cartItem => {
    const fresh = products.find(p => p.id === cartItem.id);
    if (fresh) {
      cartItem.price = fresh.price;
      if (cartItem.qty > fresh.stock) cartItem.qty = Math.max(1, fresh.stock);
    }
  });
  updateCartUI();
}

function updateCartUI() {
  const cartList = document.getElementById("cartItemsList");
  if (!cartList) return;
  cartList.innerHTML = "";
  let total = 0, itemCount = 0;

  if (cart.length === 0) {
    cartList.innerHTML = `<p class="empty-msg">No medicines selected yet.</p>`;
  } else {
    cart.forEach((item, index) => {
      const subtotal = item.price * item.qty;
      total += subtotal; itemCount += item.qty;
      const itemRow = document.createElement("div");
      itemRow.className = "cart-item";
      itemRow.innerHTML = `
        <div><h4>${item.name}</h4><small>₱${Number(item.price).toFixed(2)} x ${item.qty} (${item.dosage})</small></div>
        <div><strong>₱${subtotal.toFixed(2)}</strong>
          <button onclick="removeFromCart(${index})" style="background:none; border:none; color:#ef4444; margin-left:8px; cursor:pointer; font-weight:bold;">&times;</button>
        </div>`;
      cartList.appendChild(itemRow);
    });
  }

  document.getElementById("cartCount").innerText = itemCount;
  document.getElementById("cartTotalItems").innerText = itemCount;
  document.getElementById("cartTotalPrice").innerText = `₱${total.toFixed(2)}`;
}

function removeFromCart(index) { cart.splice(index, 1); updateCartUI(); }

function toggleCart(forceOpen = false) {
  const drawer = document.getElementById("cartDrawer");
  const overlay = document.getElementById("cartOverlay");
  if (!drawer || !overlay) return;
  if (forceOpen) { drawer.classList.add("open"); overlay.style.display = "block"; } 
  else { drawer.classList.toggle("open"); overlay.style.display = drawer.classList.contains("open") ? "block" : "none"; }
}

function openCheckout() {
  if (cart.length === 0) return alert("Select prescription medication first!");
  toggleCart(false);
  document.getElementById("modalTotalAmount").innerText = `₱${cart.reduce((s, i) => s + (i.price * i.qty), 0).toFixed(2)}`;
  document.getElementById("checkoutModal").classList.add("open");
}

function closeCheckout() { document.getElementById("checkoutModal").classList.remove("open"); }

function compressRxFile(file, callback) {
  if (!file) return callback("");
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement("canvas");
      const MAX = 900;
      let w = img.width, h = img.height;
      if (w > h && w > MAX) { h *= MAX/w; w = MAX; }
      else if (h > MAX) { w *= MAX/h; h = MAX; }
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      callback(canvas.toDataURL("image/jpeg", 0.7));
    };
    img.onerror = () => callback(e.target.result);
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// --- 6. AUTO PDF RECEIPT GENERATOR ---
function generateAndDownloadPDFReceipt(order) {
  if (typeof html2pdf === 'undefined') {
    alert("PDF library not loaded. Please ensure you added html2pdf.js to index.html.");
    return;
  }

  const receiptContainer = document.createElement('div');
  receiptContainer.style.position = 'absolute';
  receiptContainer.style.left = '-9999px';
  receiptContainer.style.top = '-9999px';
  
  receiptContainer.innerHTML = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #ffffff; padding: 40px; color: #0f172a; width: 650px;">
      <h1 style="margin: 0 0 5px 0; color: #1e3a8a; font-size: 26px;">QuickMedRx Pharmacy</h1>
      <div style="color: #64748b; font-size: 14px; margin-bottom: 30px;">Official Digital Order Receipt</div>
      
      <div style="display: flex; justify-content: space-between; margin-bottom: 25px;">
        <div>
          <strong style="display: block; font-size: 11px; text-transform: uppercase; color: #94a3b8; margin-bottom: 4px;">Order Reference</strong>
          <div style="font-size: 18px; color: #0f172a; font-weight: 700;">${order.id}</div>
        </div>
        <div style="text-align: right;">
          <strong style="display: block; font-size: 11px; text-transform: uppercase; color: #94a3b8; margin-bottom: 4px;">Date Issued</strong>
          <div style="font-size: 14px; color: #0f172a; font-weight: 500;">${order.date}</div>
        </div>
      </div>
      
      <div style="margin-bottom: 25px;">
        <strong style="display: block; font-size: 11px; text-transform: uppercase; color: #94a3b8; margin-bottom: 4px;">Tracking Number</strong>
        <div style="display: inline-block; background: #fef3c7; color: #b45309; padding: 6px 12px; border-radius: 6px; font-weight: 700; font-size: 13px;">Pending Admin Pharmacist Approval</div>
      </div>

      <div style="height: 1px; background: #e2e8f0; margin: 30px 0;"></div>

      <div style="margin-bottom: 25px;">
        <strong style="display: block; font-size: 11px; text-transform: uppercase; color: #94a3b8; margin-bottom: 4px;">Patient Information</strong>
        <div style="font-size: 15px; font-weight: 600;">${order.customer}</div>
        <div style="font-size: 14px; color: #475569; margin-top: 4px;">CP: ${order.phone}</div>
        <div style="font-size: 14px; color: #475569; margin-top: 4px;">Address: ${order.address}</div>
      </div>

      <div style="margin-bottom: 25px;">
        <strong style="display: block; font-size: 11px; text-transform: uppercase; color: #94a3b8; margin-bottom: 4px;">Physician Information</strong>
        <div style="font-size: 15px; font-weight: 600;">${order.doctorName || 'N/A'}</div>
        <div style="font-size: 14px; color: #475569; margin-top: 4px;">PRC License No: ${order.doctorLicense || 'N/A'}</div>
      </div>
      
      <div style="margin-bottom: 25px;">
        <strong style="display: block; font-size: 11px; text-transform: uppercase; color: #94a3b8; margin-bottom: 8px;">Prescribed Medicines Ordered</strong>
        <div style="font-size: 14px; font-weight: 500;">
          ${order.items.map(i => `
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #e2e8f0;">
              <span>• ${i.name} (${i.dosage}) x ${i.qty}</span>
              <span>₱${(i.price * i.qty).toFixed(2)}</span>
            </div>
          `).join('')}
        </div>
      </div>
      
      <div style="display: flex; justify-content: space-between; background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
        <strong style="font-size: 14px; text-transform: uppercase; color: #0f172a;">Total Payable (${order.paymentMethod})</strong>
        <div style="font-size: 18px; font-weight: 800; color: #059669;">₱${Number(order.totalAmount).toFixed(2)}</div>
      </div>

      <div style="height: 1px; background: #e2e8f0; margin: 30px 0;"></div>

      <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 15px; border-radius: 8px; font-size: 12px; color: #1e40af; line-height: 1.5; text-align: center;">
        This document serves as your official receipt and offline proof of transaction. The tracking number is intentionally held as "Pending" until the QuickMed admin portal verifies your prescription slip.
      </div>
    </div>
  `;

  document.body.appendChild(receiptContainer);

  const opt = {
    margin:       0.4,
    filename:     `QuickMed_Receipt_${order.id}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(receiptContainer.firstElementChild).save().then(() => {
    document.body.removeChild(receiptContainer);
  });
}

// --- 7. HYBRID CHECKOUT HANDLER ---
function submitOrder(e) {
  e.preventDefault();
  try {
    const name = document.getElementById("custName").value.trim();
    const phone = document.getElementById("custPhone").value.trim();
    const doctor = document.getElementById("doctorName").value.trim();
    const fileInput = document.getElementById("rxFile");
    const payment = document.querySelector('input[name="paymentMethod"]:checked') ? document.querySelector('input[name="paymentMethod"]:checked').value : "COD";
    
    const submitBtn = document.querySelector(".place-order-btn");
    if (submitBtn) { submitBtn.disabled = true; submitBtn.innerText = "Processing Prescription..."; }

    const orderRef = "RX-" + Math.floor(100000 + Math.random() * 900000);

    const finalizeOrder = (base64Data) => {
      const orderRecord = {
        id: orderRef,
        customer: name,
        address: document.getElementById("custAddress").value.trim(),
        phone: phone,
        doctorName: doctor,
        doctorLicense: document.getElementById("doctorLicense").value.trim(),
        prescriptionFile: fileInput.files.length > 0 ? fileInput.files[0].name : "rx-upload.jpg",
        prescriptionData: base64Data,
        rxStatus: "Pending Pharmacist Verification",
        paymentMethod: payment,
        items: [...cart],
        totalAmount: cart.reduce((s, i) => s + (i.price * i.qty), 0),
        date: new Date().toLocaleString(),
        timestamp: Date.now()
      };

      cart.forEach(cartItem => {
        const pIndex = products.findIndex(p => p.id === cartItem.id);
        if (pIndex !== -1) products[pIndex].stock = Math.max(0, products[pIndex].stock - cartItem.qty);
      });
      localStorage.setItem("quickmed_inventory", JSON.stringify(products));

      let localOrders = JSON.parse(localStorage.getItem("quickmed_orders")) || [];
      localOrders.unshift(orderRecord);
      localStorage.setItem("quickmed_orders", JSON.stringify(localOrders));

      generateAndDownloadPDFReceipt(orderRecord);

      syncChannel.postMessage({ type: "NEW_ORDER" });
      syncChannel.postMessage({ type: "INVENTORY_UPDATED" });

      if (typeof db !== 'undefined' && db && navigator.onLine) {
        db.ref("inventory").set(products);
        db.ref("orders/" + orderRef).set(orderRecord);
      }

      alert(`Success! Order ${orderRef} submitted.\n\nYour Official PDF Order Receipt has automatically downloaded to your computer as proof of transaction!`);
      
      cart = []; updateCartUI(); closeCheckout(); applyCurrentFilter(); document.getElementById("orderForm").reset();
      if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = `<i class="fa-solid fa-shield-check"></i> Submit Order for Dispensing`; }
    };

    if (fileInput.files && fileInput.files[0]) compressRxFile(fileInput.files[0], finalizeOrder);
    else finalizeOrder("");

  } catch (error) { alert("Checkout error: " + error.message); }
}

function applyCurrentFilter() {
  const query = document.getElementById("searchInput") ? document.getElementById("searchInput").value.toLowerCase() : "";
  let filtered = products;
  if (currentCategory !== "all") filtered = filtered.filter(p => p.category === currentCategory);
  if (query) filtered = filtered.filter(p => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query) || p.dosage.toLowerCase().includes(query));
  renderProducts(filtered);
}

function filterCategory(cat, btn) {
  currentCategory = cat;
  document.querySelectorAll(".cat-pill").forEach(p => p.classList.remove("active"));
  btn.classList.add("active");
  applyCurrentFilter();
}

// --- 9. CHAT UI LOGIC ---
document.addEventListener("DOMContentLoaded", () => {
  const title = document.getElementById("chatTitleID");
  if(title) title.innerHTML = `<i class="fa-solid fa-headset"></i> Support ID: ${custId}`;
  
  if (!navigator.onLine || typeof db === 'undefined' || !db) {
    const statusText = document.getElementById("chatQueueStatus");
    if(statusText) statusText.innerText = `Queue: 1 customer(s) waiting in line... (Offline Mode)`;
  }
});

function toggleChat() {
  const win = document.getElementById("chatWindow");
  if(!win) return;
  win.classList.toggle("open");
  if (win.classList.contains("open")) {
    renderChatUI();
    document.getElementById("chatInputText").focus();
  }
}

function renderChatUI() {
  const box = document.getElementById("chatMessages");
  if(!box) return;
  box.innerHTML = "";
  
  chatLog.forEach(msg => {
    const div = document.createElement("div");
    
    if (msg.isEndChat) {
      div.className = `chat-bubble cs-bubble`;
      div.style.background = "#ecfdf5";
      div.style.borderColor = "#a7f3d0";
      div.style.color = "#065f46";
      div.style.textAlign = "center";
      div.style.maxWidth = "90%";
      div.style.margin = "0 auto";
      div.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${msg.text} <span class="chat-time" style="color: #065f46;">${msg.time}</span>`;
    } else {
      div.className = `chat-bubble ${msg.sender === "Customer" ? "my-bubble" : "cs-bubble"}`;
      div.innerHTML = `${msg.text} <span class="chat-time">${msg.time}</span>`;
    }
    box.appendChild(div);
  });
  box.scrollTop = box.scrollHeight;
}

function sendChatMessage(e) {
  e.preventDefault();
  const input = document.getElementById("chatInputText");
  const text = input.value.trim();
  if(!text) return;

  if (chatLog.length > 0 && chatLog[chatLog.length - 1].isEndChat) {
    chatLog = [
      { sender: "CS", text: "Welcome back! How can we help you today?", time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
    ];
  }

  const msgObj = {
    sender: "Customer",
    text: text,
    time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
  };

  chatLog.push(msgObj);
  localStorage.setItem(`quickmed_chat_${custId}`, JSON.stringify(chatLog));
  
  syncChannel.postMessage({ type: "CHAT_UPDATE" });

  if (typeof db !== 'undefined' && db && navigator.onLine) {
    db.ref(`chats/${custId}/info`).update({
       id: custId,
       lastActive: Date.now(),
       status: "waiting"
    });
    db.ref(`chats/${custId}/messages`).set(chatLog);
  }

  input.value = "";
  renderChatUI();
}