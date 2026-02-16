// ===== GLOBAL STATE =====
let currentPage = 1;
let currentData = [];
let currentHeaders = [];
let totalRows = 0;
let currentFilters = {};
const PAGE_SIZE = 10;

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("isLoggedIn");
        window.location.replace("index.html");
    });
}


// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadAllCustomers();

    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const segment = urlParams.get('segment');
    if (segment) {
        document.getElementById('segmentSelect').value = segment;
        handleSearch();
    }
});

// ===== EVENT LISTENERS =====
function initializeEventListeners() {
    document.getElementById('loadBtn').addEventListener('click', handleSearch);
    document.getElementById('customerIdInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    document.getElementById('refreshBtn').addEventListener('click', () => {
        loadPage(currentPage);
    });

    document.getElementById('exportCsv').addEventListener('click', exportToCSV);
    document.getElementById('clearFilters').addEventListener('click', clearFilters);

    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) loadPage(currentPage - 1);
    });

    document.getElementById('nextPage').addEventListener('click', () => {
        const totalPages = Math.ceil(totalRows / PAGE_SIZE);
        if (currentPage < totalPages) loadPage(currentPage + 1);
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

// ===== LOAD ALL CUSTOMERS =====
async function loadAllCustomers() {
    currentFilters = {};
    currentPage = 1;
    await loadPage(1);
}

// ===== SEARCH FUNCTIONALITY =====
async function handleSearch() {
    const segment = document.getElementById('segmentSelect').value;
    const customerId = document.getElementById('customerIdInput').value.trim();

    currentFilters = {
        segment: segment || '',
        customerId: customerId || ''
    };

    currentPage = 1;
    await loadPage(1);
}

// ===== LOAD PAGE =====
async function loadPage(pageNumber) {
    showLoading(true);
    hideResults();

    try {
        const offset = (pageNumber - 1) * PAGE_SIZE;

        const response = await fetch('http://localhost:3000/api/clients', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                segment: currentFilters.segment || '',
                customerId: currentFilters.customerId || '',
                limit: PAGE_SIZE,
                offset: offset
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Failed to fetch data');
        }

        const countResponse = await fetch('http://localhost:3000/api/clients/count', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                segment: currentFilters.segment || '',
                customerId: currentFilters.customerId || ''
            })
        });

        if (countResponse.ok) {
            const countResult = await countResponse.json();
            totalRows = countResult.total || result.data.length;
        } else {
            totalRows = result.data.length;
        }

        handleSearchResults(result, pageNumber);

    } catch (error) {
        console.error('Search error:', error);
        showNotification(`Error: ${error.message}`, 'error');
        showNoResults();
    } finally {
        showLoading(false);
    }
}

function handleSearchResults(result, pageNumber) {
    if (!result.data || result.data.length === 0) {
        showNoResults();
        return;
    }

    currentData = result.data;
    currentPage = pageNumber;

    if (currentData.length > 0) {
        currentHeaders = Object.keys(currentData[0]);
    } else {
        currentHeaders = [];
    }

    displayResults();
    updatePaginationControls();

    const totalPages = Math.ceil(totalRows / PAGE_SIZE);
    showNotification(`Page ${currentPage} of ${totalPages} (${totalRows} customers)`, 'success');
}

function displayResults() {
    const headerRow = document.getElementById('tableHeader');
    const tbody = document.getElementById('tableBody');
    const container = document.getElementById('tableContainer');

    headerRow.innerHTML = '';
    tbody.innerHTML = '';

    currentHeaders.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });

    currentData.forEach(rowData => {
        const tr = document.createElement('tr');
        tr.style.cursor = "pointer";

        currentHeaders.forEach(header => {
            const td = document.createElement('td');
            td.textContent = formatCellValue(rowData[header], header);
            td.setAttribute('data-label', header);
            tr.appendChild(td);
        });

        // ADD CLICK HERE (ONLY ONCE)
        tr.addEventListener("click", () => {
            openCustomerProductsModal(rowData.CustomerID);
        });

        tbody.appendChild(tr);
    });


    document.getElementById('resultCount').textContent = totalRows;
    container.style.display = 'block';
    document.getElementById('noResults').style.display = 'none';
}

// ===== PAGINATION CONTROLS =====
function updatePaginationControls() {
    const totalPages = Math.ceil(totalRows / PAGE_SIZE);
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');

    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage >= totalPages;

    prevBtn.style.opacity = prevBtn.disabled ? '0.5' : '1';
    prevBtn.style.cursor = prevBtn.disabled ? 'not-allowed' : 'pointer';
    nextBtn.style.opacity = nextBtn.disabled ? '0.5' : '1';
    nextBtn.style.cursor = nextBtn.disabled ? 'not-allowed' : 'pointer';
}

// ===== EXPORT FUNCTIONALITY =====
async function exportToCSV() {
    if (totalRows === 0) {
        showNotification('No data to export', 'warning');
        return;
    }

    try {
        showNotification('Fetching all data for export...', 'info');

        const response = await fetch('http://localhost:3000/api/clients', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                segment: currentFilters.segment || '',
                customerId: currentFilters.customerId || '',
                limit: 10000,
                offset: 0
            })
        });

        const result = await response.json();
        const allData = result.data;

        if (!allData || allData.length === 0) {
            showNotification('No data to export', 'warning');
            return;
        }

        const headers = Object.keys(allData[0]);
        let csvContent = headers.join(',') + '\n';

        allData.forEach(rowData => {
            const row = headers.map(header => {
                const cell = rowData[header];
                const cellStr = String(cell).replace(/"/g, '""');
                return cellStr.includes(',') ? `"${cellStr}"` : cellStr;
            });
            csvContent += row.join(',') + '\n';
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `customers_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showNotification(`Exported ${allData.length} customers`, 'success');
    } catch (error) {
        console.error('Export error:', error);
        showNotification('Failed to export data', 'error');
    }
}

// ===== FILTER FUNCTIONALITY =====
function clearFilters() {
    document.getElementById('segmentSelect').value = '';
    document.getElementById('customerIdInput').value = '';
    currentFilters = {};
    loadAllCustomers();
    showNotification('Filters cleared', 'info');
}

// ===== UI HELPERS =====
function showLoading(show) {
    document.getElementById('loadingIndicator').style.display = show ? 'block' : 'none';
}

function hideResults() {
    document.getElementById('tableContainer').style.display = 'none';
    document.getElementById('noResults').style.display = 'none';
}

function showNoResults() {
    document.getElementById('tableContainer').style.display = 'none';
    document.getElementById('noResults').style.display = 'block';
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
        animation: 'slideIn 0.3s ease',
        maxWidth: '400px'
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

// ===== UTILITY FUNCTIONS =====
function formatNumber(num) {
    return new Intl.NumberFormat().format(num);
}

function formatCellValue(value, header) {
    if (value === null || value === undefined) return '-';

    if (header && (header.toLowerCase().includes('date') || header.toLowerCase().includes('_at'))) {
        return new Date(value).toLocaleString();
    }

    if (header && header.toLowerCase().includes('monetary')) {
        return '$' + parseFloat(value).toFixed(2);
    }

    if (typeof value === 'number' && !header.toLowerCase().includes('id')) {
        return formatNumber(value);
    }

    return value;
}

// ===== ANIMATIONS =====
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
`;
document.head.appendChild(style);

window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});
// ===== OPEN CUSTOMER PRODUCTS MODAL =====
async function openCustomerProductsModal(customerId) {
    const modal = document.getElementById("customerModal");
    const modalBody = document.getElementById("modalBody");

    modal.style.display = "flex";
    modalBody.innerHTML = `
        <div class="loading-indicator">
            <div class="spinner"></div>
            <p>Loading products...</p>
        </div>
    `;

    try {
        const response = await fetch(`http://localhost:3000/api/customers/${customerId}/products`);
        const result = await response.json();

        if (!result.success || !result.products.length) {
            modalBody.innerHTML = "<p>No products found for this customer.</p>";
            return;
        }

        modalBody.innerHTML = "";

        result.products.forEach(product => {
            const div = document.createElement("div");
            div.className = "product-item";
            div.innerHTML = `
                <strong>${product.product_name}</strong><br>
                Quantity: ${product.quantity} <br>
                Price: $${product.price}
            `;
            modalBody.appendChild(div);
        });

        modalBody.innerHTML = "";

        let total = 0;

        result.products.forEach(product => {
    const div = document.createElement("div");
    div.className = "product-item";
    div.style.display = "flex";
    div.style.gap = "15px";
    div.style.alignItems = "center";

    const productTotal = product.quantity * product.price;
    total += productTotal;

    div.innerHTML = `
        <img src="${product.image_url || 'https://via.placeholder.com/80'}" 
             style="width:80px;height:80px;border-radius:8px;object-fit:cover;" />

        <div>
            <strong>${product.product_name}</strong><br>
            Quantity: ${product.quantity}<br>
            Price: $${product.price}<br>
            Subtotal: $${productTotal.toFixed(2)}
        </div>
    `;

    modalBody.appendChild(div);
});


        // 🔥 ADD TOTAL HERE (AFTER LOOP)
        const totalDiv = document.createElement("div");
        totalDiv.style.marginTop = "15px";
        totalDiv.style.fontWeight = "bold";
        totalDiv.style.fontSize = "16px";
        totalDiv.innerHTML = `Total Spent: $${total.toFixed(2)}`;

        modalBody.appendChild(totalDiv);


    } catch (error) {
        modalBody.innerHTML = "<p>Error loading products.</p>";
    }
}

// ===== CLOSE MODAL =====
const closeBtn = document.getElementById("closeModal");
if (closeBtn) {
    closeBtn.addEventListener("click", () => {
        document.getElementById("customerModal").style.display = "none";
    });
}


// Close when clicking outside
window.addEventListener("click", (e) => {
    const modal = document.getElementById("customerModal");
    if (e.target === modal) {
        modal.style.display = "none";
    }
});
