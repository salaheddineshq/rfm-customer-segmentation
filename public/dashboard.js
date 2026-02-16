// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadStatistics();
});

// ===== EVENT LISTENERS =====
function initializeEventListeners() {
    document.getElementById('refreshBtn').addEventListener('click', loadStatistics);
    
    const toggleBtn = document.querySelector('.toggle-sidebar');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleSidebar);
    }
}

localStorage.getItem("isLoggedIn")
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("isLoggedIn");
        window.location.replace("index.html");
    });
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

// ===== LOAD STATISTICS =====
async function loadStatistics() {
    try {
        const response = await fetch('http://localhost:3000/api/statistics');
        if (!response.ok) throw new Error('Failed to load statistics');
        
        const data = await response.json();
        
        if (data.success && data.statistics) {
            updateStatisticsCards(data.statistics);
            updateCharts(data.statistics);
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

// ===== CHARTS =====
let segmentChart = null;
let rfmChart = null;

function updateCharts(stats) {
    createSegmentChart(stats);
    createRFMChart(stats);
}

function createSegmentChart(stats) {
    const ctx = document.getElementById('segmentChart');
    
    const labels = stats.map(s => s.Segment);
    const data = stats.map(s => parseInt(s.customer_count));
    
    const colors = [
        '#10b981', // Champions - Green
        '#3b82f6', // Loyal - Blue
        '#8b5cf6', // Potential Loyalist - Purple
        '#f59e0b', // At Risk - Orange
        '#ef4444', // Need Attention - Red
        '#6b7280'  // Lost - Gray
    ];
    
    if (segmentChart) {
        segmentChart.destroy();
    }
    
    segmentChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 0,
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12,
                            family: "'Poppins', sans-serif"
                        },
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 13
                    },
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${context.parsed} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function createRFMChart(stats) {
    const ctx = document.getElementById('rfmChart');
    
    const labels = stats.map(s => s.Segment);
    const recency = stats.map(s => parseFloat(s.avg_recency).toFixed(1));
    const frequency = stats.map(s => parseFloat(s.avg_frequency).toFixed(1));
    const monetary = stats.map(s => (parseFloat(s.avg_monetary) / 100).toFixed(1)); // Scale down
    
    if (rfmChart) {
        rfmChart.destroy();
    }
    
    rfmChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Avg Recency',
                    data: recency,
                    backgroundColor: '#3b82f6',
                    borderRadius: 6
                },
                {
                    label: 'Avg Frequency',
                    data: frequency,
                    backgroundColor: '#8b5cf6',
                    borderRadius: 6
                },
                {
                    label: 'Avg Monetary (÷100)',
                    data: monetary,
                    backgroundColor: '#10b981',
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12,
                            family: "'Poppins', sans-serif"
                        },
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 13
                    }
                }
            }
        }
    });
}

// ===== UTILITY FUNCTIONS =====
function formatNumber(num) {
    return new Intl.NumberFormat().format(num);
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
