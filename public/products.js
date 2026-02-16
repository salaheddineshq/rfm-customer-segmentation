// ===== GLOBAL STATE =====
let currentPage = 1;
let allProducts = [];
let filteredProducts = [];
let currentView = 'grid';
const PAGE_SIZE = 12;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadAllProducts();
});

// ===== EVENT LISTENERS =====
function initializeEventListeners() {
    document.getElementById('refreshBtn').addEventListener('click', loadAllProducts);
    document.getElementById('applyFilters').addEventListener('click', applyFilters);
    document.getElementById('exportProducts').addEventListener('click', exportProducts);

    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => switchView(btn.dataset.view));
    });

    document.getElementById('prevPage').addEventListener('click', () => changePage(-1));
    document.getElementById('nextPage').addEventListener('click', () => changePage(1));

    document.getElementById('productSearch').addEventListener('input', (e) => {
        document.getElementById('filterSearch').value = e.target.value;
        applyFilters();
    });

    const toggleBtn = document.querySelector('.toggle-sidebar');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleSidebar);
    }
}

// ===== SIDEBAR TOGGLE =====
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const content = document.getElementById('content');

    if (sidebar.style.left === '-260px') {
        sidebar.style.left = '0';
        content.style.left = '260px';
        content.style.width = 'calc(100% - 260px)';
    } else {
        sidebar.style.left = '-260px';
        content.style.left = '0';
        content.style.width = '100%';
    }
}

// ===== LOAD PRODUCTS =====
async function loadAllProducts() {
    showLoading(true);

    try {
        const response = await fetch('http://localhost:3000/api/products');
        if (!response.ok) throw new Error('Failed to load products');

        const data = await response.json();

        // ✅ FIX: convert all numeric fields immediately
        allProducts = (data.products || []).map(p => ({
            ...p,
            price: Number(p.price),
            quantity: Number(p.quantity)
        }));

        filteredProducts = [...allProducts];

        updateStatistics();
        updateCharts();
        displayProducts();
        showGrid();

    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Failed to load products', 'error');
        showNoProducts();
    } finally {
        showLoading(false);
    }
}


// ===== UPDATE STATISTICS =====
function updateStatistics() {
    const totalProducts = allProducts.length;
    const totalRevenue = allProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const avgPrice = totalProducts > 0 ? totalRevenue / allProducts.reduce((sum, p) => sum + p.quantity, 0) : 0;
    const totalQuantity = allProducts.reduce((sum, p) => sum + p.quantity, 0);

    document.getElementById('totalProducts').textContent = totalProducts;
    document.getElementById('totalRevenue').textContent = '$' + totalRevenue.toFixed(2);
    document.getElementById('avgPrice').textContent = '$' + avgPrice.toFixed(2);
    document.getElementById('totalQuantity').textContent = totalQuantity;

    updateProgressBars();
}

function updateProgressBars() {
    document.querySelectorAll('.progress').forEach(progress => {
        const value = progress.getAttribute('data-value');
        progress.style.setProperty('--value', value);
    });
}

// ===== UPDATE CHARTS =====
let topProductsChart = null;
let revenueChart = null;

function updateCharts() {
    createTopProductsChart();
    createRevenueChart();
}

function createTopProductsChart() {
    const ctx = document.getElementById('topProductsChart');

    // Group by product name and sum quantities
    const productGroups = {};
    allProducts.forEach(p => {
        if (!productGroups[p.product_name]) {
            productGroups[p.product_name] = 0;
        }
        productGroups[p.product_name] += p.quantity;
    });

    // Sort and get top 10
    const sorted = Object.entries(productGroups)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    const labels = sorted.map(([name]) => name);
    const data = sorted.map(([, qty]) => qty);

    if (topProductsChart) topProductsChart.destroy();

    topProductsChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#0078d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
                    '#3b82f6', '#ec4899', '#14b8a6', '#f97316', '#6366f1'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 10,
                        font: { size: 11 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${context.label}: ${context.parsed} units`;
                        }
                    }
                }
            }
        }
    });
}

function createRevenueChart() {
    const ctx = document.getElementById('revenueChart');

    // Group by product and calculate revenue
    const productRevenue = {};
    allProducts.forEach(p => {
        if (!productRevenue[p.product_name]) {
            productRevenue[p.product_name] = 0;
        }
        productRevenue[p.product_name] += p.price * p.quantity;
    });

    // Sort and get top 10
    const sorted = Object.entries(productRevenue)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    const labels = sorted.map(([name]) => name);
    const data = sorted.map(([, revenue]) => revenue);

    if (revenueChart) revenueChart.destroy();

    revenueChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Revenue ($)',
                data: data,
                backgroundColor: '#0078d4',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return '$' + value;
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return '$' + context.parsed.y.toFixed(2);
                        }
                    }
                }
            }
        }
    });
}

// ===== APPLY FILTERS =====
function applyFilters() {
    const searchTerm = document.getElementById('filterSearch').value.toLowerCase();
    const customerFilter = document.getElementById('filterCustomer').value.toLowerCase();
    const minPrice = parseFloat(document.getElementById('filterMinPrice').value) || 0;
    const maxPrice = parseFloat(document.getElementById('filterMaxPrice').value) || Infinity;

    filteredProducts = allProducts.filter(product => {
        const matchesSearch = product.product_name.toLowerCase().includes(searchTerm);
        const matchesCustomer = !customerFilter || product.customer_id.toLowerCase().includes(customerFilter);
        const matchesPrice = product.price >= minPrice && product.price <= maxPrice;

        return matchesSearch && matchesCustomer && matchesPrice;
    });

    currentPage = 1;
    displayProducts();

    if (filteredProducts.length > 0) {
        showGrid();
        showNotification(`Found ${filteredProducts.length} products`, 'success');
    } else {
        showNoProducts();
    }
}

// ===== DISPLAY PRODUCTS =====
function displayProducts() {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const pageProducts = filteredProducts.slice(start, end);

    if (currentView === 'grid') {
        displayGridView(pageProducts);
    } else {
        displayListView(pageProducts);
    }

    updatePagination();
    document.getElementById('productCount').textContent = filteredProducts.length;
}

function displayGridView(products) {
    const container = document.getElementById('gridView');
    container.innerHTML = '';

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';

        const price = Number(product.price);
        const quantity = Number(product.quantity);
        const subtotal = price * quantity;

        const imageUrl = product.image_url || 'https://via.placeholder.com/200?text=No+Image';

        card.innerHTML = `
        <div class="product-image">
            <img src="${imageUrl}" alt="${product.product_name}">
        </div>
        <div class="product-info">
            <h4>${product.product_name}</h4>
            <p class="customer-id">
                <i class='bx bx-user'></i> ${product.customer_id}
            </p>
            <div class="product-details">
                <span class="quantity">
                    <i class='bx bx-package'></i> ${quantity}x
                </span>
                <span class="price">$${price.toFixed(2)}</span>
            </div>
            <div class="product-footer">
                <span class="subtotal">
                    Subtotal: $${subtotal.toFixed(2)}
                </span>
                <button class="btn-view"
                    onclick="viewProductDetails(${product.id})">
                    <i class='bx bx-show'></i>
                </button>
            </div>
        </div>
    `;

        container.appendChild(card);
    });

}

function displayListView(products) {
    const tbody = document.getElementById('listViewBody');
    tbody.innerHTML = '';

    products.forEach(product => {
        const tr = document.createElement('tr');

        const price = Number(product.price);
        const quantity = Number(product.quantity);
        const subtotal = price * quantity;

        const imageUrl = product.image_url || '/images/no-image.png';
        const date = new Date(product.created_at).toLocaleDateString();

        tr.innerHTML = `
            <td><img src="${imageUrl}" alt="${product.product_name}" class="list-image"></td>
            <td><strong>${product.product_name}</strong></td>
            <td>${product.customer_id}</td>
            <td>${quantity}</td>
            <td>$${price.toFixed(2)}</td>
            <td><strong>$${subtotal.toFixed(2)}</strong></td>
            <td>${date}</td>
        `;

        tbody.appendChild(tr);
    });
}


// ===== VIEW SWITCHING =====
function switchView(view) {
    currentView = view;

    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });

    if (view === 'grid') {
        document.getElementById('gridView').style.display = 'grid';
        document.getElementById('listView').style.display = 'none';
    } else {
        document.getElementById('gridView').style.display = 'none';
        document.getElementById('listView').style.display = 'block';
    }

    // 🔥 IMPORTANT: re-render products
    displayProducts();
}


// ===== PAGINATION =====
function updatePagination() {
    const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');

    pageInfo.textContent = `Page ${currentPage} of ${totalPages || 1}`;

    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage >= totalPages;

    prevBtn.style.opacity = prevBtn.disabled ? '0.5' : '1';
    nextBtn.style.opacity = nextBtn.disabled ? '0.5' : '1';
}

function changePage(direction) {
    const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);
    const newPage = currentPage + direction;

    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        displayProducts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// ===== EXPORT =====
function exportProducts() {
    if (filteredProducts.length === 0) {
        showNotification('No products to export', 'warning');
        return;
    }

    try {
        const headers = ['Product Name', 'Customer ID', 'Quantity', 'Price', 'Subtotal', 'Date'];
        let csv = headers.join(',') + '\n';

        filteredProducts.forEach(product => {
            const subtotal = product.price * product.quantity;
            const date = new Date(product.created_at).toLocaleDateString();
            const row = [
                `"${product.product_name}"`,
                product.customer_id,
                product.quantity,
                product.price.toFixed(2),
                subtotal.toFixed(2),
                date
            ];
            csv += row.join(',') + '\n';
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `products_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();

        showNotification(`Exported ${filteredProducts.length} products`, 'success');
    } catch (error) {
        console.error('Export error:', error);
        showNotification('Failed to export', 'error');
    }
}

// ===== UI HELPERS =====
function showLoading(show) {
    document.getElementById('loadingIndicator').style.display = show ? 'block' : 'none';
}

function showGrid() {
    document.getElementById('productsGrid').style.display = 'block';
    document.getElementById('noProducts').style.display = 'none';
}

function showNoProducts() {
    document.getElementById('productsGrid').style.display = 'none';
    document.getElementById('noProducts').style.display = 'block';
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class='bx ${getIconForType(type)}'></i>
            <span>${message}</span>
        </div>
    `;

    Object.assign(notification.style, {
        position: 'fixed',
        top: '80px',
        right: '20px',
        padding: '16px 20px',
        borderRadius: '8px',
        backgroundColor: getColorForType(type),
        color: 'white',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: '10000',
        animation: 'slideIn 0.3s ease'
    });

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function getIconForType(type) {
    const icons = {
        success: 'bxs-check-circle',
        error: 'bxs-error-circle',
        warning: 'bxs-error',
        info: 'bxs-info-circle'
    };
    return icons[type] || icons.info;
}

function getColorForType(type) {
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#0078d4'
    };
    return colors[type] || colors.info;
}

// ===== VIEW PRODUCT DETAILS =====
function viewProductDetails(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    const subtotal = product.price * product.quantity;
    const imageUrl = product.image_url || '/images/no-image.png';
    const date = new Date(product.created_at).toLocaleDateString();

    const modalHTML = `
        <div class="product-modal-overlay" id="productModal">
            <div class="product-modal">
                <button class="modal-close" onclick="closeProductModal()">
                    <i class='bx bx-x'></i>
                </button>

                <div class="modal-content">
                    <div class="modal-image">
                        <img src="${imageUrl}" alt="${product.product_name}">
                    </div>

                    <div class="modal-details">
                        <h2>${product.product_name}</h2>

                        <p><strong>Customer:</strong> ${product.customer_id}</p>
                        <p><strong>Quantity:</strong> ${product.quantity}</p>
                        <p><strong>Unit Price:</strong> $${product.price.toFixed(2)}</p>
                        <p><strong>Total:</strong> $${subtotal.toFixed(2)}</p>
                        <p><strong>Date:</strong> ${date}</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}


// ===== STYLES =====
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
    
    .charts-row {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 24px;
        margin-bottom: 24px;
    }
    
    .chart-card {
        background: white;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .chart-header {
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid #e5e7eb;
    }
    
    .chart-header h3 {
        font-size: 16px;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .products-container {
        background: white;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .products-card {
        padding: 0;
    }
    
    .products-filters {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 15px;
        padding: 20px;
        background: #f9fafb;
        border-top: 1px solid #e5e7eb;
    }
    
    .products-controls {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid #e5e7eb;
    }
    
    .view-controls {
        display: flex;
        gap: 8px;
    }
    
    .view-btn {
        padding: 8px 16px;
        border: 1px solid #e5e7eb;
        background: white;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        transition: all 0.3s;
    }
    
    .view-btn:hover {
        background: #f9fafb;
    }
    
    .view-btn.active {
        background: #0078d4;
        color: white;
        border-color: #0078d4;
    }
    
    .products-count {
        font-size: 14px;
        color: #6b7280;
    }
    
    .grid-view {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 20px;
        padding: 20px;
    }
    
    .product-card {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        overflow: hidden;
        transition: all 0.3s;
    }
    
    .product-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    }
    
    .product-image {
        width: 100%;
        height: 200px;
        overflow: hidden;
        background: #f9fafb;
    }
    
    .product-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .product-info {
        padding: 15px;
    }
    
    .product-info h4 {
        font-size: 15px;
        margin-bottom: 8px;
        color: #1f2937;
    }
    
    .customer-id {
        font-size: 12px;
        color: #6b7280;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        gap: 4px;
    }
    
    .product-details {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        padding: 8px 0;
        border-top: 1px solid #e5e7eb;
        border-bottom: 1px solid #e5e7eb;
    }
    
    .quantity {
        font-size: 13px;
        color: #6b7280;
        display: flex;
        align-items: center;
        gap: 4px;
    }
    
    .price {
        font-size: 16px;
        font-weight: 700;
        color: #0078d4;
    }
    
    .product-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .subtotal {
        font-size: 14px;
        font-weight: 600;
        color: #10b981;
    }
    
    .btn-view {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: none;
        background: #0078d4;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        transition: all 0.3s;
    }
    
    .btn-view:hover {
        background: #005a9e;
        transform: scale(1.1);
    }
    
    .list-view {
        padding: 20px;
    }
    
    .list-image {
        width: 50px;
        height: 50px;
        object-fit: cover;
        border-radius: 6px;
    }
    
    @media (max-width: 768px) {
        .charts-row {
            grid-template-columns: 1fr;
        }
        
        .products-filters {
            grid-template-columns: 1fr;
        }
        
        .grid-view {
            grid-template-columns: 1fr;
        }
    }
        /* ===== PRODUCT MODAL ===== */
.product-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 20000;
    animation: fadeIn 0.3s ease;
}

.product-modal {
    background: white;
    width: 800px;
    max-width: 95%;
    border-radius: 16px;
    padding: 30px;
    position: relative;
    animation: slideUp 0.3s ease;
}

.modal-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
}

.modal-image img {
    width: 100%;
    border-radius: 12px;
    object-fit: cover;
}

.modal-details h2 {
    margin-bottom: 15px;
    font-size: 22px;
}

.modal-details p {
    margin-bottom: 10px;
    font-size: 15px;
    color: #374151;
}


.modal-close {
    position: absolute;
    top: 15px;
    right: 15px;
    border: none;
    background: #f3f4f6;
    width: 35px;
    height: 35px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 20px;
}

.modal-close:hover {
    background: #e5e7eb;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slideUp {
    from { transform: translateY(30px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

`;
document.head.appendChild(style);

function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) modal.remove();
}
