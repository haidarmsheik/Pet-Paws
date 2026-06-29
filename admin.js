import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, push, update, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth, onAuthStateChanged, signOut, setPersistence, browserSessionPersistence } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const ADMIN_EMAIL = window.ADMIN_EMAIL;

const app = initializeApp(window.FIREBASE_CONFIG);
const auth = getAuth(app);
const database = getDatabase(app);

// Per-tab auth state so admin and user can be signed in on different tabs.
setPersistence(auth, browserSessionPersistence)
  .catch((err) => console.error("Failed to set auth persistence:", err));

const ordersRef = ref(database, 'orders');
const productsRef = ref(database, 'products');

let editingProductId = null;
let editingOrderId = null;
let ordersCache = {};
let productsCache = {};

const DEFAULT_PRODUCTS = [
  { name: "Alfa", price: 92, image: "image/alfafood.png" },
  { name: "Mix", price: 20, image: "image/mixfood.jpg" },
  { name: "Royal Canine", price: 17, image: "image/royalc.jpg" },
  { name: "Wilderness", price: 23, image: "image/wilderness.webp" },
  { name: "Alleva", price: 26, image: "image/allevafood.png" },
  { name: "Pro Plan", price: 28, image: "image/proplan.avif" },
  { name: "Premium Leash", price: 28, image: "image/leash.jpg" },
  { name: "Indoor Complete", price: 28, image: "image/indoorcomplete.jpg" },
  { name: "Equilibrio", price: 28, image: "image/equilibrio.jpg" },
  { name: "Cat Toy - Feather", price: 15, image: "image/toy1.jpg" },
  { name: "Cat Toy - Mouse", price: 12, image: "image/toy2.jpg" },
  { name: "Dog Treat - Premium", price: 18, image: "image/dogtreat.jpg" },
  { name: "Dog Treat - Natural", price: 22, image: "image/dogtreats.jpg" },
  { name: "Duo Shampoo", price: 25, image: "image/duoshamp.webp" },
  { name: "Dog Food - Premium", price: 45, image: "image/dog food-premium.webp" },
  { name: "Dog Food - Organic", price: 52, image: "image/dog food - organic.jpg" }
];

function maybeAutoSeedProducts() {
  if (localStorage.getItem('petpaws_admin_seeded') === 'true') return;
  if (Object.keys(productsCache).length > 0) {
    localStorage.setItem('petpaws_admin_seeded', 'true');
    return;
  }
  // Mark seeded BEFORE pushing to avoid re-entry from the onValue cascade.
  localStorage.setItem('petpaws_admin_seeded', 'true');
  DEFAULT_PRODUCTS.forEach((p) => {
    push(productsRef, p).catch((err) => console.error('Seed error:', err));
  });
}

function restoreDefaultProducts() {
  const existingNames = new Set(Object.values(productsCache).map((p) => p.name));
  const missing = DEFAULT_PRODUCTS.filter((p) => !existingNames.has(p.name));
  if (missing.length === 0) {
    alert('All default products are already in the catalog.');
    return;
  }
  if (!confirm(`Restore ${missing.length} missing default product(s)?`)) return;
  missing.forEach((p) => {
    push(productsRef, p).catch((err) => alert('Error: ' + err.message));
  });
  alert(`Restored ${missing.length} default product(s).`);
}

function statusClass(status) {
  return (status || 'pending').toLowerCase().replace(/[^a-z]+/g, '-');
}

function createAdminProductRow(id, product) {
  const tr = document.createElement('tr');

  const idCell = document.createElement('td');
  idCell.textContent = id;

  const nameCell = document.createElement('td');
  nameCell.textContent = product.name || '';

  const priceCell = document.createElement('td');
  priceCell.textContent = `$${(product.price || 0).toFixed(2)}`;

  const imageCell = document.createElement('td');
  if (product.image) {
    const img = document.createElement('img');
    img.src = product.image;
    img.alt = product.name || '';
    img.className = 'product-image-preview';
    imageCell.appendChild(img);
  } else {
    imageCell.textContent = 'No Image';
  }

  const actionsCell = document.createElement('td');
  const editBtn = document.createElement('button');
  editBtn.className = 'btn-edit btn-sm';
  editBtn.textContent = 'Edit';
  editBtn.addEventListener('click', () => openProductForm(id, product));

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn-delete btn-sm';
  deleteBtn.textContent = 'Delete';
  deleteBtn.addEventListener('click', () => deleteProduct(id));

  actionsCell.appendChild(editBtn);
  actionsCell.appendChild(document.createTextNode(' '));
  actionsCell.appendChild(deleteBtn);

  tr.appendChild(idCell);
  tr.appendChild(nameCell);
  tr.appendChild(priceCell);
  tr.appendChild(imageCell);
  tr.appendChild(actionsCell);
  return tr;
}

function createAdminOrderRow(orderId, order, options = {}) {
  const { withActions = true, withLocation = true } = options;

  const tr = document.createElement('tr');
  const date = order.timestamp ? new Date(order.timestamp).toLocaleString() : '';
  const location = order.location || {};
  const hasMap = location.lat && location.lng;

  const customerCell = document.createElement('td');
  customerCell.textContent = order.customerName || '';
  tr.appendChild(customerCell);

  const totalCell = document.createElement('td');
  totalCell.textContent = `$${(order.total || 0).toFixed(2)}`;
  tr.appendChild(totalCell);

  const statusCell = document.createElement('td');
  const badge = document.createElement('span');
  badge.className = `status-badge ${statusClass(order.status)}`;
  badge.textContent = order.status || 'Pending';
  statusCell.appendChild(badge);
  tr.appendChild(statusCell);

  const dateCell = document.createElement('td');
  dateCell.textContent = date;
  tr.appendChild(dateCell);

  const itemsCell = document.createElement('td');
  const items = order.items || [];
  if (items.length === 0) {
    itemsCell.textContent = 'No items';
  } else {
    items.forEach((item, idx) => {
      if (idx > 0) itemsCell.appendChild(document.createElement('br'));
      itemsCell.appendChild(document.createTextNode(`${item.name} x${item.quantity}`));
    });
  }
  tr.appendChild(itemsCell);

  if (withLocation) {
    const locationCell = document.createElement('td');
    if (hasMap) {
      const link = document.createElement('a');
      link.href = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'View Map';
      locationCell.appendChild(link);
    } else {
      locationCell.textContent = order.addressText || order.deliveryAddress || order.address || 'No location';
    }
    tr.appendChild(locationCell);
  }

  if (withActions) {
    const actionsCell = document.createElement('td');
    const editBtn = document.createElement('button');
    editBtn.className = 'btn-edit btn-sm';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => openOrderForm(orderId, order));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete btn-sm';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteOrder(orderId));

    actionsCell.appendChild(editBtn);
    actionsCell.appendChild(document.createTextNode(' '));
    actionsCell.appendChild(deleteBtn);
    tr.appendChild(actionsCell);
  }

  return tr;
}

function renderOrdersInto(tableId, data, options) {
  const table = document.getElementById(tableId);
  if (!table) return;
  table.innerHTML = '';
  const ids = Object.keys(data || {});

  if (ids.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = options.withActions ? 7 : (options.withLocation ? 6 : 5);
    td.textContent = 'No orders';
    tr.appendChild(td);
    table.appendChild(tr);
    return;
  }

  ids
    .sort((a, b) => (data[b].timestamp || 0) - (data[a].timestamp || 0))
    .forEach(id => table.appendChild(createAdminOrderRow(id, data[id], options)));
}

// Product CRUD

function openProductForm(id = null, product = null) {
  const form = document.getElementById('product-form');
  const container = document.getElementById('product-form-container');
  if (!form || !container) return;

  if (product) {
    editingProductId = id;
    document.getElementById('product-name').value = product.name || '';
    document.getElementById('product-price').value = product.price || '';
    document.getElementById('product-image').value = product.image || '';
    document.getElementById('product-description').value = product.description || '';
  } else {
    editingProductId = null;
    form.reset();
  }

  container.style.display = 'block';
  container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function closeProductForm() {
  const container = document.getElementById('product-form-container');
  if (container) container.style.display = 'none';
  editingProductId = null;
}

function submitProductForm(event) {
  event.preventDefault();
  const productData = {
    name: document.getElementById('product-name').value.trim(),
    price: parseFloat(document.getElementById('product-price').value),
    image: document.getElementById('product-image').value.trim(),
    description: document.getElementById('product-description').value.trim()
  };

  if (!productData.name || !(productData.price > 0) || !productData.image) {
    alert('Please fill all required fields.');
    return;
  }

  const promise = editingProductId
    ? update(ref(database, 'products/' + editingProductId), productData)
    : push(productsRef, productData);

  promise
    .then(() => {
      alert(editingProductId ? 'Product updated!' : 'Product added!');
      closeProductForm();
      document.getElementById('product-form').reset();
    })
    .catch(error => alert('Error: ' + error.message));
}

function deleteProduct(productId) {
  if (!confirm('Delete this product?')) return;
  remove(ref(database, 'products/' + productId))
    .then(() => alert('Product deleted.'))
    .catch(error => alert('Error: ' + error.message));
}

// Order CRUD

function openOrderForm(id = null, order = null) {
  const container = document.getElementById('order-form-container');
  const title = document.getElementById('order-form-title');
  if (!container) return;

  if (order) {
    editingOrderId = id;
    title.textContent = 'Edit Order';
    document.getElementById('order-customer-name').value = order.customerName || '';
    document.getElementById('order-phone').value = order.phone || '';
    document.getElementById('order-address').value = order.address || order.deliveryAddress || '';
    document.getElementById('order-status').value = order.status || 'Pending';
    document.getElementById('order-payment-method').value = order.paymentMethod || 'Cash on Delivery';
    document.getElementById('order-notes').value = order.notes || '';
    const itemsSubtotal = (order.items || []).reduce((s, i) => s + (i.price || 0) * (i.quantity || 0), 0);
    const delivery = Math.max(0, (order.total || itemsSubtotal) - itemsSubtotal);
    document.getElementById('order-delivery').value = delivery.toFixed(2);
    renderOrderItems(order.items || []);
    recalculateOrderTotal();
  } else {
    editingOrderId = null;
    title.textContent = 'Add New Order';
    document.getElementById('order-form').reset();
    document.getElementById('order-delivery').value = '4.00';
    renderOrderItems([]);
    addOrderItemRow();
  }

  container.style.display = 'block';
  container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function closeOrderForm() {
  const container = document.getElementById('order-form-container');
  if (container) container.style.display = 'none';
  editingOrderId = null;
}

function renderOrderItems(items) {
  const container = document.getElementById('order-items-container');
  if (!container) return;
  container.innerHTML = '';
  items.forEach(item => container.appendChild(buildOrderItemRow(item)));
}

function buildOrderItemRow(item = {}) {
  const row = document.createElement('div');
  row.className = 'order-item-row';

  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.placeholder = 'Item name';
  nameInput.value = item.name || '';
  nameInput.className = 'order-item-name';
  nameInput.required = true;

  const qtyInput = document.createElement('input');
  qtyInput.type = 'number';
  qtyInput.min = '1';
  qtyInput.value = item.quantity || 1;
  qtyInput.className = 'order-item-qty';
  qtyInput.addEventListener('input', recalculateOrderTotal);

  const priceInput = document.createElement('input');
  priceInput.type = 'number';
  priceInput.min = '0';
  priceInput.step = '0.01';
  priceInput.value = item.price != null ? item.price : '';
  priceInput.className = 'order-item-price';
  priceInput.placeholder = '0.00';
  priceInput.addEventListener('input', recalculateOrderTotal);

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'btn-delete btn-sm';
  removeBtn.textContent = '×';
  removeBtn.title = 'Remove item';
  removeBtn.addEventListener('click', () => {
    row.remove();
    recalculateOrderTotal();
  });

  row.appendChild(nameInput);
  row.appendChild(qtyInput);
  row.appendChild(priceInput);
  row.appendChild(removeBtn);
  return row;
}

function addOrderItemRow() {
  const container = document.getElementById('order-items-container');
  if (!container) return;
  container.appendChild(buildOrderItemRow());
  recalculateOrderTotal();
}

function recalculateOrderTotal() {
  const rows = document.querySelectorAll('#order-items-container .order-item-row');
  let subtotal = 0;
  rows.forEach(row => {
    const qty = parseFloat(row.querySelector('.order-item-qty').value) || 0;
    const price = parseFloat(row.querySelector('.order-item-price').value) || 0;
    subtotal += qty * price;
  });
  const delivery = parseFloat(document.getElementById('order-delivery').value) || 0;
  const totalEl = document.getElementById('order-total');
  if (totalEl) totalEl.value = (subtotal + delivery).toFixed(2);
}

function collectOrderItems() {
  return Array.from(document.querySelectorAll('#order-items-container .order-item-row'))
    .map(row => ({
      name: row.querySelector('.order-item-name').value.trim(),
      quantity: parseInt(row.querySelector('.order-item-qty').value, 10) || 1,
      price: parseFloat(row.querySelector('.order-item-price').value) || 0
    }))
    .filter(item => item.name);
}

function submitOrderForm(event) {
  event.preventDefault();

  const customerName = document.getElementById('order-customer-name').value.trim();
  const address = document.getElementById('order-address').value.trim();

  if (!customerName || !address) {
    alert('Customer name and address are required.');
    return;
  }

  const items = collectOrderItems();
  if (items.length === 0) {
    alert('Add at least one item.');
    return;
  }

  const total = parseFloat(document.getElementById('order-total').value) || 0;
  if (!(total > 0)) {
    alert('Total must be greater than 0.');
    return;
  }

  const status = document.getElementById('order-status').value;
  const paymentMethod = document.getElementById('order-payment-method').value;

  const baseUpdate = {
    customerName,
    phone: document.getElementById('order-phone').value.trim(),
    address,
    deliveryAddress: address,
    addressText: address,
    notes: document.getElementById('order-notes').value.trim(),
    status,
    paymentMethod,
    items,
    total
  };

  if (editingOrderId) {
    update(ref(database, 'orders/' + editingOrderId), baseUpdate)
      .then(() => {
        alert('Order updated!');
        closeOrderForm();
      })
      .catch(error => alert('Error: ' + error.message));
  } else {
    const newOrder = {
      ...baseUpdate,
      userId: 'admin-created',
      timestamp: Date.now()
    };
    push(ordersRef, newOrder)
      .then(() => {
        alert('Order added!');
        closeOrderForm();
      })
      .catch(error => alert('Error: ' + error.message));
  }
}

function deleteOrder(orderId) {
  if (!confirm('Delete this order? This cannot be undone.')) return;
  remove(ref(database, 'orders/' + orderId))
    .then(() => alert('Order deleted.'))
    .catch(error => alert('Error: ' + error.message));
}

// Tabs

function activateTab(tabName) {
  document.querySelectorAll('.nav-link[data-tab]').forEach(link => {
    link.classList.toggle('active', link.dataset.tab === tabName);
  });
  document.querySelectorAll('.admin-section').forEach(section => {
    section.classList.toggle('active', section.id === tabName + '-section');
  });
}

// Stats

function updateDashboardStats() {
  const ordersArr = Object.values(ordersCache);
  const productsCount = Object.keys(productsCache).length;
  const totalRevenue = ordersArr.reduce((sum, o) => sum + getOrderTotal(o), 0);
  const pendingOrders = ordersArr.filter(o => (o.status || 'Pending') === 'Pending').length;

  const elTotalProducts = document.getElementById('total-products');
  const elTotalOrders = document.getElementById('total-orders');
  const elPendingOrders = document.getElementById('pending-orders');
  const elRevenue = document.getElementById('total-revenue');

  if (elTotalProducts) elTotalProducts.textContent = productsCount;
  if (elTotalOrders) elTotalOrders.textContent = ordersArr.length;
  if (elPendingOrders) elPendingOrders.textContent = pendingOrders;
  if (elRevenue) elRevenue.textContent = `$${totalRevenue.toFixed(2)}`;

  updateDashboardCharts(ordersArr);
}

function formatCurrency(value) {
  return `$${(value || 0).toFixed(2)}`;
}

function getOrderTotal(order) {
  const total = Number(order && order.total);
  return Number.isFinite(total) ? total : 0;
}

function setEmptyChart(chart, message) {
  chart.innerHTML = '';
  const empty = document.createElement('div');
  empty.className = 'chart-empty';
  empty.textContent = message;
  chart.appendChild(empty);
}

function renderStatusChart(ordersArr) {
  const chart = document.getElementById('status-chart');
  const totalEl = document.getElementById('status-chart-total');
  if (!chart) return;

  const totalOrders = ordersArr.length;
  if (totalEl) totalEl.textContent = `${totalOrders} order${totalOrders === 1 ? '' : 's'}`;

  if (totalOrders === 0) {
    setEmptyChart(chart, 'No orders yet');
    return;
  }

  const statusCounts = ordersArr.reduce((counts, order) => {
    const status = order.status || 'Pending';
    counts[status] = (counts[status] || 0) + 1;
    return counts;
  }, {});

  const rows = Object.entries(statusCounts)
    .sort((a, b) => b[1] - a[1]);
  const maxCount = Math.max(...rows.map(([, count]) => count));

  chart.innerHTML = '';
  rows.forEach(([status, count]) => {
    const row = document.createElement('div');
    row.className = 'chart-row';

    const label = document.createElement('span');
    label.className = 'chart-label';
    label.textContent = status;

    const track = document.createElement('div');
    track.className = 'chart-track';

    const fill = document.createElement('div');
    fill.className = 'chart-fill';
    fill.style.setProperty('--chart-value', `${(count / maxCount) * 100}%`);
    track.appendChild(fill);

    const value = document.createElement('span');
    value.className = 'chart-value';
    value.textContent = count;

    row.appendChild(label);
    row.appendChild(track);
    row.appendChild(value);
    chart.appendChild(row);
  });
}

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function buildLastSevenDays() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    return {
      key: dateKey(date),
      label: date.toLocaleDateString(undefined, { weekday: 'short' }),
      revenue: 0
    };
  });
}

function renderRevenueChart(ordersArr) {
  const chart = document.getElementById('revenue-chart');
  const totalEl = document.getElementById('revenue-chart-total');
  if (!chart) return;

  const days = buildLastSevenDays();
  const daysByKey = days.reduce((map, day) => {
    map[day.key] = day;
    return map;
  }, {});

  ordersArr.forEach(order => {
    if (!order.timestamp) return;
    const orderDate = new Date(order.timestamp);
    const day = daysByKey[dateKey(orderDate)];
    if (day) day.revenue += getOrderTotal(order);
  });

  const totalRevenue = days.reduce((sum, day) => sum + day.revenue, 0);
  if (totalEl) totalEl.textContent = formatCurrency(totalRevenue);

  if (totalRevenue === 0) {
    setEmptyChart(chart, 'No revenue in the last 7 days');
    return;
  }

  const maxRevenue = Math.max(...days.map(day => day.revenue));

  chart.innerHTML = '';
  days.forEach(day => {
    const bar = document.createElement('div');
    bar.className = 'timeline-bar';

    const value = document.createElement('span');
    value.className = 'timeline-value';
    value.textContent = formatCurrency(day.revenue);

    const wrap = document.createElement('div');
    wrap.className = 'timeline-fill-wrap';

    const fill = document.createElement('div');
    fill.className = 'timeline-fill';
    fill.classList.toggle('is-zero', day.revenue === 0);
    fill.style.setProperty('--chart-value', `${(day.revenue / maxRevenue) * 100}%`);
    wrap.appendChild(fill);

    const label = document.createElement('span');
    label.className = 'timeline-label';
    label.textContent = day.label;

    bar.appendChild(value);
    bar.appendChild(wrap);
    bar.appendChild(label);
    chart.appendChild(bar);
  });
}

function updateDashboardCharts(ordersArr = Object.values(ordersCache)) {
  renderStatusChart(ordersArr);
  renderRevenueChart(ordersArr);
}

// Auth + dashboard wiring

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = 'admin-login.html';
    return;
  }

  if (user.email !== ADMIN_EMAIL) {
    alert('Access denied. Admin privileges required.');
    sessionStorage.removeItem('adminSession');
    sessionStorage.removeItem('adminEmail');
    signOut(auth).then(() => {
      window.location.href = 'Home.html';
    });
    return;
  }

  sessionStorage.setItem('adminSession', 'true');
  sessionStorage.setItem('adminEmail', user.email);
  loadDashboard();
});

function loadDashboard() {
  // Tabs
  document.querySelectorAll('.nav-link[data-tab]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      activateTab(link.dataset.tab);
    });
  });

  // Logout
  const logoutLink = document.getElementById('admin-logout-link');
  if (logoutLink) {
    logoutLink.addEventListener('click', (e) => {
      e.preventDefault();
      sessionStorage.removeItem('adminSession');
      sessionStorage.removeItem('adminEmail');
      signOut(auth)
        .then(() => { window.location.href = 'admin-login.html'; })
        .catch(() => { window.location.href = 'admin-login.html'; });
    });
  }

  // Product form wiring
  const addProductBtn = document.getElementById('add-product-btn');
  if (addProductBtn) addProductBtn.addEventListener('click', () => openProductForm());

  const cancelProductBtn = document.getElementById('cancel-product-btn');
  if (cancelProductBtn) cancelProductBtn.addEventListener('click', closeProductForm);

  const productForm = document.getElementById('product-form');
  if (productForm) productForm.addEventListener('submit', submitProductForm);

  // Order form wiring
  const addOrderBtn = document.getElementById('add-order-btn');
  if (addOrderBtn) addOrderBtn.addEventListener('click', () => openOrderForm());

  const cancelOrderBtn = document.getElementById('cancel-order-btn');
  if (cancelOrderBtn) cancelOrderBtn.addEventListener('click', closeOrderForm);

  const orderForm = document.getElementById('order-form');
  if (orderForm) orderForm.addEventListener('submit', submitOrderForm);

  const addItemBtn = document.getElementById('add-order-item-btn');
  if (addItemBtn) addItemBtn.addEventListener('click', addOrderItemRow);

  const deliveryInput = document.getElementById('order-delivery');
  if (deliveryInput) deliveryInput.addEventListener('input', recalculateOrderTotal);

  // Firebase listeners
  onValue(productsRef, (snapshot) => {
    productsCache = snapshot.val() || {};
    const productsTable = document.getElementById('products-list');
    if (productsTable) {
      productsTable.innerHTML = '';
      const ids = Object.keys(productsCache);
      if (ids.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 5;
        td.textContent = 'No products';
        tr.appendChild(td);
        productsTable.appendChild(tr);
      } else {
        ids.forEach(id => productsTable.appendChild(createAdminProductRow(id, productsCache[id])));
      }
    }
    updateDashboardStats();
    maybeAutoSeedProducts();
  });

  const restoreDefaultsBtn = document.getElementById('restore-defaults-btn');
  if (restoreDefaultsBtn) restoreDefaultsBtn.addEventListener('click', restoreDefaultProducts);

  onValue(ordersRef, (snapshot) => {
    ordersCache = snapshot.val() || {};
    renderOrdersInto('orders-list', ordersCache, { withActions: false, withLocation: false });
    renderOrdersInto('orders-list-full', ordersCache, { withActions: true, withLocation: true });
    updateDashboardStats();
  });
}

window.addEventListener('beforeunload', () => {
  sessionStorage.removeItem('adminSession');
  sessionStorage.removeItem('adminEmail');
});
