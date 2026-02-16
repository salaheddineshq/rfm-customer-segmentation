// ===== GLOBAL STATE =====
let currentPage = 1;
let currentData = [];
let currentHeaders = [];
let totalRows = 0;
let currentFilters = {};
const PAGE_SIZE = 10; // Show 10 rows per page

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadStatistics();
    setupSidebar();
    loadAllCustomers(); // Load all customers on page load
});

// ===== EVENT LISTENERS =====
function initializeEventListeners() {
    // Search functionality
    document.getElementById('loadBtn').addEventListener('click', handleSearch);
    document.getElementById('customerIdInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    // Navigation
    document.getElementById('refreshBtn').addEventListener('click', () => {
        loadStatistics();
        if (currentData.length > 0) {
            loadPage(currentPage);
        } else {
            loadAllCustomers();
        }
    });

    document.getElementById('helpBtn').addEventListener('click', () => {
        document.getElementById('help-section').scrollIntoView({ behavior: 'smooth' });
    });

    // Export functionality
    document.getElementById('exportCsv').addEventListener('click', exportToCSV);
    document.getElementById('clearFilters').addEventListener('click', clearFilters);

    // Pagination
    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            loadPage(currentPage - 1);
        }
    });
    
    document.getElementById('nextPage').addEventListener('click', () => {
        const totalPages = Math.ceil(totalRows / PAGE_SIZE);
        if (currentPage < totalPages) {
            loadPage(currentPage + 1);
        }
    });

    // Sidebar toggle
    document.querySelector('.toggle-sidebar').addEventListener('click', toggleSidebar);

    // Menu toggle
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
}

// ===== SIDEBAR FUNCTIONALITY =====
function setupSidebar() {
    const sideMenu = document.querySelectorAll('#sidebar .side-menu li a');
    sideMenu.forEach(item => {
        item.addEventListener('click', function() {
            sideMenu.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

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

// ===== STATISTICS =====
async function loadStatistics() {
    try {
        const response = await fetch('http://localhost:3000/api/statistics');
        if (!response.ok) throw new Error('Failed to load statistics');
        
        const data = await response.json();
        
        if (data.success && data.statistics) {
            updateStatisticsCards(data.statistics);
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
        showNotification('Failed to load statistics', 'error');
    }
}

function updateStatisticsCards(stats) {
    let totalCustomers = 0;
    let championsCount = 0;
    let atRiskCount = 0;
    let lostCount = 0;

    stats.forEach(row => {
        const segment = row.Segment;
        const count = parseInt(row.customer_count);
        
        totalCustomers += count;
        
        if (segment === 'Champions') championsCount = count;
        if (segment === 'At Risk') atRiskCount = count;
        if (segment === 'Lost') lostCount = count;
    });

    document.getElementById('totalCustomers').textContent = formatNumber(totalCustomers);
    document.getElementById('champions').textContent = formatNumber(championsCount);
    document.getElementById('atRisk').textContent = formatNumber(atRiskCount);
    document.getElementById('lost').textContent = formatNumber(lostCount);

    updateProgressBars();
}

function updateProgressBars() {
    document.querySelectorAll('.progress').forEach(progress => {
        const value = progress.getAttribute('data-value');
        progress.style.setProperty('--value', value);
    });
}

// ===== LOAD ALL CUSTOMERS (DEFAULT VIEW) =====
async function loadAllCustomers() {
    currentFilters = {};
    currentPage = 1;
    await loadPage(1);
}

// ===== SEARCH FUNCTIONALITY =====
async function handleSearch() {
    const segment = document.getElementById('segmentSelect').value;
    const customerId = document.getElementById('customerIdInput').value.trim();

    // Save current filters
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

        // Also get total count
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
    showNotification(`Showing page ${currentPage} of ${totalPages} (${totalRows} total customers)`, 'info');
}

function displayResults() {
    const headerRow = document.getElementById('tableHeader');
    const tbody = document.getElementById('tableBody');
    const container = document.getElementById('tableContainer');

    headerRow.innerHTML = '';
    tbody.innerHTML = '';

    // Create headers
    currentHeaders.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });

    // Create rows
    currentData.forEach(rowData => {
        const tr = document.createElement('tr');
        currentHeaders.forEach(header => {
            const td = document.createElement('td');
            td.textContent = formatCellValue(rowData[header], header);
            td.setAttribute('data-label', header);
            tr.appendChild(td);
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

    // Update page info
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

    // Enable/disable buttons
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage >= totalPages;

    // Update button styles
    if (prevBtn.disabled) {
        prevBtn.style.opacity = '0.5';
        prevBtn.style.cursor = 'not-allowed';
    } else {
        prevBtn.style.opacity = '1';
        prevBtn.style.cursor = 'pointer';
    }

    if (nextBtn.disabled) {
        nextBtn.style.opacity = '0.5';
        nextBtn.style.cursor = 'not-allowed';
    } else {
        nextBtn.style.opacity = '1';
        nextBtn.style.cursor = 'pointer';
    }
}

// ===== EXPORT FUNCTIONALITY =====
async function exportToCSV() {
    if (totalRows === 0) {
        showNotification('No data to export', 'warning');
        return;
    }

    try {
        showNotification('Fetching all data for export...', 'info');

        // Fetch all data (not just current page)
        const response = await fetch('http://localhost:3000/api/clients', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                segment: currentFilters.segment || '',
                customerId: currentFilters.customerId || '',
                limit: 10000, // Large number to get all
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
        link.setAttribute('download', `customer_data_${new Date().toISOString().slice(0,10)}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showNotification(`Exported ${allData.length} customers successfully`, 'success');
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
    showNotification('Filters cleared - showing all customers', 'info');
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
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
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
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ===== ERROR HANDLING =====
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

// ===== AUTH PROTECTION =====
if (localStorage.getItem("isLoggedIn") !== "true") {
    window.location.replace("index.html");
}


const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("isLoggedIn");
        window.location.replace("index.html");
    });
}

