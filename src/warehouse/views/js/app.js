/**
 * Warehouse Management System Dashboard Application
 *
 * @author NooblyJS Team
 * @version 2.0.0
 */

class WarehouseDashboard {
    constructor() {
        this.baseUrl = '/applications/warehouse/api';
        this.currentSection = 'dashboard';
        this.loadingModal = null;

        this.init();
    }

    async init() {
        console.log('Initializing Warehouse Management System Dashboard...');

        // Initialize Bootstrap components
        this.loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));

        // Set up event listeners
        this.setupEventListeners();

        // Check system health
        await this.checkSystemHealth();

        // Load initial dashboard data
        await this.loadDashboardData();

        console.log('Dashboard initialized successfully');
    }

    setupEventListeners() {
        // Sidebar navigation
        document.querySelectorAll('[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.closest('[data-section]').dataset.section;
                this.showSection(section);
            });
        });

        // Search functionality
        const productSearch = document.getElementById('product-search');
        if (productSearch) {
            productSearch.addEventListener('input', (e) => {
                this.searchProducts(e.target.value);
            });
        }
    }

    showSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.add('d-none');
        });
        document.getElementById(`${sectionName}-section`).classList.remove('d-none');

        // Update page title
        const titles = {
            dashboard: 'Dashboard',
            inventory: 'Inventory Management',
            inbound: 'Inbound Operations',
            outbound: 'Outbound Operations',
            resources: 'Resource Management',
            delivery: 'Delivery & Fulfillment',
            reports: 'Analytics & Reports'
        };
        document.getElementById('page-title').textContent = titles[sectionName] || 'Dashboard';

        this.currentSection = sectionName;

        // Load section-specific data
        this.loadSectionData(sectionName);
    }

    async loadSectionData(section) {
        switch (section) {
            case 'dashboard':
                await this.loadDashboardData();
                break;
            case 'inventory':
                await this.loadInventoryData();
                break;
            case 'inbound':
                await this.loadInboundData();
                break;
            case 'outbound':
                await this.loadOutboundData();
                break;
            case 'resources':
                await this.loadResourcesData();
                break;
            case 'delivery':
                await this.loadDeliveryData();
                break;
            case 'reports':
                await this.loadReportsData();
                break;
        }
    }

    async checkSystemHealth() {
        try {
            const response = await this.apiCall('/health');
            const statusElement = document.getElementById('system-status');

            if (response.status === 'healthy') {
                statusElement.className = 'badge bg-success me-3';
                statusElement.innerHTML = '<i class="fas fa-circle me-1"></i>System Online';
            } else {
                statusElement.className = 'badge bg-danger me-3';
                statusElement.innerHTML = '<i class="fas fa-circle me-1"></i>System Issues';
            }
        } catch (error) {
            console.error('Health check failed:', error);
            const statusElement = document.getElementById('system-status');
            statusElement.className = 'badge bg-warning me-3';
            statusElement.innerHTML = '<i class="fas fa-circle me-1"></i>System Unknown';
        }
    }

    async loadDashboardData() {
        try {
            // Simulate dashboard metrics (in real implementation, these would be API calls)
            this.updateDashboardMetrics({
                totalProducts: Math.floor(Math.random() * 1000) + 500,
                activeOrders: Math.floor(Math.random() * 50) + 10,
                staffOnline: Math.floor(Math.random() * 20) + 5,
                shipmentsToday: Math.floor(Math.random() * 30) + 8
            });

            this.addRecentActivity('Dashboard loaded successfully', 'success');
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            this.showAlert('Failed to load dashboard data', 'danger');
        }
    }

    updateDashboardMetrics(metrics) {
        document.getElementById('total-products').textContent = metrics.totalProducts;
        document.getElementById('active-orders').textContent = metrics.activeOrders;
        document.getElementById('staff-online').textContent = metrics.staffOnline;
        document.getElementById('shipments-today').textContent = metrics.shipmentsToday;
    }

    async loadInventoryData() {
        const tbody = document.getElementById('inventory-tbody');
        if (!tbody) return;

        try {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center"><div class="spinner-border" role="status"></div></td></tr>';

            // Simulate inventory data
            const inventoryData = [
                { sku: 'PROD001', name: 'Widget A', category: 'Electronics', available: 150, allocated: 25, status: 'Active' },
                { sku: 'PROD002', name: 'Component B', category: 'Hardware', available: 75, allocated: 10, status: 'Active' },
                { sku: 'PROD003', name: 'Device C', category: 'Electronics', available: 0, allocated: 0, status: 'Out of Stock' }
            ];

            tbody.innerHTML = inventoryData.map(item => `
                <tr>
                    <td><strong>${item.sku}</strong></td>
                    <td>${item.name}</td>
                    <td>${item.category}</td>
                    <td><span class="badge bg-success">${item.available}</span></td>
                    <td><span class="badge bg-warning">${item.allocated}</span></td>
                    <td>
                        <span class="badge ${item.status === 'Active' ? 'bg-success' : 'bg-danger'}">
                            ${item.status}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="dashboard.viewProduct('${item.sku}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-secondary" onclick="dashboard.editProduct('${item.sku}')">
                            <i class="fas fa-edit"></i>
                        </button>
                    </td>
                </tr>
            `).join('');

        } catch (error) {
            console.error('Failed to load inventory data:', error);
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Failed to load inventory data</td></tr>';
        }
    }

    async loadInboundData() {
        const poList = document.getElementById('purchase-orders-list');
        const receivingList = document.getElementById('receiving-tasks-list');

        if (poList) {
            poList.innerHTML = `
                <div class="list-group">
                    <div class="list-group-item">
                        <div class="d-flex w-100 justify-content-between">
                            <h6 class="mb-1">PO-2024-001</h6>
                            <small class="text-success">Confirmed</small>
                        </div>
                        <p class="mb-1">Electronics Supplier - 150 items</p>
                        <small>Expected: Tomorrow</small>
                    </div>
                </div>
            `;
        }

        if (receivingList) {
            receivingList.innerHTML = `
                <div class="list-group">
                    <div class="list-group-item">
                        <div class="d-flex w-100 justify-content-between">
                            <h6 class="mb-1">Receive PO-2024-001</h6>
                            <small class="text-warning">Pending</small>
                        </div>
                        <p class="mb-1">Dock Door 3</p>
                        <small>Assigned to: John Doe</small>
                    </div>
                </div>
            `;
        }
    }

    async loadOutboundData() {
        const ordersList = document.getElementById('orders-list');
        const wavesList = document.getElementById('waves-list');
        const pickTasksList = document.getElementById('pick-tasks-list');

        if (ordersList) {
            ordersList.innerHTML = `
                <div class="list-group">
                    <div class="list-group-item">
                        <div class="d-flex w-100 justify-content-between">
                            <h6 class="mb-1">ORD-2024-001</h6>
                            <small class="text-success">Allocated</small>
                        </div>
                        <p class="mb-1">Customer ABC - 5 items</p>
                        <small>Priority: High</small>
                    </div>
                </div>
            `;
        }

        if (wavesList) {
            wavesList.innerHTML = `
                <div class="list-group">
                    <div class="list-group-item">
                        <div class="d-flex w-100 justify-content-between">
                            <h6 class="mb-1">WAVE-001</h6>
                            <small class="text-info">Picking</small>
                        </div>
                        <p class="mb-1">15 orders, 45 items</p>
                        <small>Started: 2 hours ago</small>
                    </div>
                </div>
            `;
        }

        if (pickTasksList) {
            pickTasksList.innerHTML = `
                <div class="list-group">
                    <div class="list-group-item">
                        <div class="d-flex w-100 justify-content-between">
                            <h6 class="mb-1">Pick: PROD001</h6>
                            <small class="text-warning">In Progress</small>
                        </div>
                        <p class="mb-1">Location: A-01-B-03</p>
                        <small>Assigned to: Jane Smith</small>
                    </div>
                </div>
            `;
        }
    }

    async loadResourcesData() {
        const staffList = document.getElementById('staff-list');
        const equipmentList = document.getElementById('equipment-list');

        if (staffList) {
            staffList.innerHTML = `
                <div class="list-group">
                    <div class="list-group-item">
                        <div class="d-flex w-100 justify-content-between">
                            <h6 class="mb-1">John Doe</h6>
                            <span class="badge bg-success">Online</span>
                        </div>
                        <p class="mb-1">Picker - Morning Shift</p>
                        <small>Current task: Pick items for WAVE-001</small>
                    </div>
                    <div class="list-group-item">
                        <div class="d-flex w-100 justify-content-between">
                            <h6 class="mb-1">Jane Smith</h6>
                            <span class="badge bg-success">Online</span>
                        </div>
                        <p class="mb-1">Packer - Morning Shift</p>
                        <small>Current task: Pack orders</small>
                    </div>
                </div>
            `;
        }

        if (equipmentList) {
            equipmentList.innerHTML = `
                <div class="list-group">
                    <div class="list-group-item">
                        <div class="d-flex w-100 justify-content-between">
                            <h6 class="mb-1">Forklift-001</h6>
                            <span class="badge bg-warning">In Use</span>
                        </div>
                        <p class="mb-1">Toyota Model XYZ</p>
                        <small>Assigned to: Mike Johnson</small>
                    </div>
                    <div class="list-group-item">
                        <div class="d-flex w-100 justify-content-between">
                            <h6 class="mb-1">Scanner-001</h6>
                            <span class="badge bg-success">Available</span>
                        </div>
                        <p class="mb-1">Honeywell Scanner</p>
                        <small>Last used: 1 hour ago</small>
                    </div>
                </div>
            `;
        }
    }

    async loadDeliveryData() {
        const shipmentsList = document.getElementById('shipments-list');
        const returnsList = document.getElementById('returns-list');

        if (shipmentsList) {
            shipmentsList.innerHTML = `
                <div class="list-group">
                    <div class="list-group-item">
                        <div class="d-flex w-100 justify-content-between">
                            <h6 class="mb-1">SHIP-2024-001</h6>
                            <span class="badge bg-info">In Transit</span>
                        </div>
                        <p class="mb-1">UPS - Tracking: 1Z123456</p>
                        <small>ETA: Tomorrow 2:00 PM</small>
                    </div>
                </div>
            `;
        }

        if (returnsList) {
            returnsList.innerHTML = `
                <div class="list-group">
                    <div class="list-group-item">
                        <div class="d-flex w-100 justify-content-between">
                            <h6 class="mb-1">RMA-2024-001</h6>
                            <span class="badge bg-warning">Pending</span>
                        </div>
                        <p class="mb-1">Product: Widget A</p>
                        <small>Reason: Defective</small>
                    </div>
                </div>
            `;
        }
    }

    async loadReportsData() {
        // Reports data is loaded on demand when user clicks generate report buttons
        const reportResults = document.getElementById('report-results');
        if (reportResults) {
            reportResults.innerHTML = '<p class="text-muted">Select a report type above to generate analytics</p>';
        }
    }

    async generateReport(reportType) {
        const reportResults = document.getElementById('report-results');
        if (!reportResults) return;

        this.showLoading('Generating report...');

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            let reportHtml = '';

            switch (reportType) {
                case 'staff-performance':
                    reportHtml = this.generateStaffPerformanceReport();
                    break;
                case 'equipment-utilization':
                    reportHtml = this.generateEquipmentUtilizationReport();
                    break;
                case 'delivery-performance':
                    reportHtml = this.generateDeliveryPerformanceReport();
                    break;
            }

            reportResults.innerHTML = reportHtml;
            this.addRecentActivity(`Generated ${reportType} report`, 'info');

        } catch (error) {
            console.error('Failed to generate report:', error);
            reportResults.innerHTML = '<p class="text-danger">Failed to generate report. Please try again.</p>';
        } finally {
            this.hideLoading();
        }
    }

    generateStaffPerformanceReport() {
        return `
            <h6>Staff Performance Report</h6>
            <div class="table-responsive">
                <table class="table table-striped report-table">
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Tasks Completed</th>
                            <th>Avg Task Time</th>
                            <th>Quality Score</th>
                            <th>Efficiency</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>John Doe</td>
                            <td>125</td>
                            <td>18 min</td>
                            <td><span class="badge bg-success">95%</span></td>
                            <td><span class="badge bg-success">110%</span></td>
                        </tr>
                        <tr>
                            <td>Jane Smith</td>
                            <td>98</td>
                            <td>22 min</td>
                            <td><span class="badge bg-success">92%</span></td>
                            <td><span class="badge bg-warning">85%</span></td>
                        </tr>
                        <tr>
                            <td>Mike Johnson</td>
                            <td>87</td>
                            <td>25 min</td>
                            <td><span class="badge bg-warning">88%</span></td>
                            <td><span class="badge bg-warning">75%</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    generateEquipmentUtilizationReport() {
        return `
            <h6>Equipment Utilization Report</h6>
            <div class="table-responsive">
                <table class="table table-striped report-table">
                    <thead>
                        <tr>
                            <th>Equipment</th>
                            <th>Type</th>
                            <th>Utilization</th>
                            <th>Status</th>
                            <th>Last Service</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Forklift-001</td>
                            <td>Forklift</td>
                            <td><span class="badge bg-success">85%</span></td>
                            <td><span class="badge bg-success">Active</span></td>
                            <td>2024-01-15</td>
                        </tr>
                        <tr>
                            <td>Scanner-001</td>
                            <td>Barcode Scanner</td>
                            <td><span class="badge bg-warning">65%</span></td>
                            <td><span class="badge bg-success">Active</span></td>
                            <td>2024-02-01</td>
                        </tr>
                        <tr>
                            <td>Conveyor-001</td>
                            <td>Conveyor Belt</td>
                            <td><span class="badge bg-success">92%</span></td>
                            <td><span class="badge bg-warning">Maintenance</span></td>
                            <td>2024-01-10</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    generateDeliveryPerformanceReport() {
        return `
            <h6>Delivery Performance Report</h6>
            <div class="row">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-body text-center">
                            <h3 class="text-success">94.5%</h3>
                            <p>On-Time Delivery Rate</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-body text-center">
                            <h3 class="text-info">2.1 days</h3>
                            <p>Average Transit Time</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="table-responsive mt-3">
                <table class="table table-striped report-table">
                    <thead>
                        <tr>
                            <th>Carrier</th>
                            <th>Shipments</th>
                            <th>On-Time Rate</th>
                            <th>Avg Transit</th>
                            <th>Exception Rate</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>UPS</td>
                            <td>150</td>
                            <td><span class="badge bg-success">96%</span></td>
                            <td>2.0 days</td>
                            <td><span class="badge bg-success">2%</span></td>
                        </tr>
                        <tr>
                            <td>FedEx</td>
                            <td>120</td>
                            <td><span class="badge bg-success">93%</span></td>
                            <td>2.2 days</td>
                            <td><span class="badge bg-warning">4%</span></td>
                        </tr>
                        <tr>
                            <td>USPS</td>
                            <td>80</td>
                            <td><span class="badge bg-warning">89%</span></td>
                            <td>2.8 days</td>
                            <td><span class="badge bg-warning">6%</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    // Utility methods
    async apiCall(endpoint, options = {}) {
        const url = this.baseUrl + endpoint;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const response = await fetch(url, { ...defaultOptions, ...options });

        if (!response.ok) {
            throw new Error(`API call failed: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    }

    showLoading(message = 'Loading...') {
        document.getElementById('loading-message').textContent = message;
        this.loadingModal.show();
    }

    hideLoading() {
        this.loadingModal.hide();
    }

    showAlert(message, type = 'info') {
        const alertHtml = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

        // Add to top of main content
        const mainContent = document.querySelector('#main-content .container-fluid');
        mainContent.insertAdjacentHTML('afterbegin', alertHtml);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            const alert = mainContent.querySelector('.alert');
            if (alert) {
                alert.remove();
            }
        }, 5000);
    }

    addRecentActivity(message, type = 'info') {
        const activityList = document.getElementById('recent-activity');
        if (!activityList) return;

        const iconClass = {
            'success': 'fas fa-check-circle text-success',
            'info': 'fas fa-info-circle text-info',
            'warning': 'fas fa-exclamation-triangle text-warning',
            'danger': 'fas fa-times-circle text-danger'
        };

        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <i class="${iconClass[type] || iconClass.info}"></i>
            <span>${message}</span>
            <small class="text-muted">Just now</small>
        `;

        activityList.insertBefore(activityItem, activityList.firstChild);

        // Keep only last 10 activities
        const activities = activityList.querySelectorAll('.activity-item');
        if (activities.length > 10) {
            activities[activities.length - 1].remove();
        }
    }

    // Product management methods
    async addProduct() {
        const form = document.getElementById('addProductForm');
        const formData = new FormData(form);

        const productData = {
            sku: formData.get('sku'),
            name: formData.get('name'),
            description: formData.get('description'),
            category: formData.get('category')
        };

        this.showLoading('Adding product...');

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            this.addRecentActivity(`Product ${productData.sku} added successfully`, 'success');
            this.showAlert('Product added successfully!', 'success');

            // Close modal and refresh inventory
            bootstrap.Modal.getInstance(document.getElementById('addProductModal')).hide();
            form.reset();

            if (this.currentSection === 'inventory') {
                await this.loadInventoryData();
            }

        } catch (error) {
            console.error('Failed to add product:', error);
            this.showAlert('Failed to add product. Please try again.', 'danger');
        } finally {
            this.hideLoading();
        }
    }

    searchProducts(query) {
        const tbody = document.getElementById('inventory-tbody');
        if (!tbody) return;

        const rows = tbody.querySelectorAll('tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            if (text.includes(query.toLowerCase()) || query === '') {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    viewProduct(sku) {
        this.showAlert(`Viewing product: ${sku}`, 'info');
    }

    editProduct(sku) {
        this.showAlert(`Editing product: ${sku}`, 'info');
    }
}

// Global functions for onclick handlers
window.showSection = function(section) {
    if (window.dashboard) {
        window.dashboard.showSection(section);
    }
};

window.generateReport = function(reportType) {
    if (window.dashboard) {
        window.dashboard.generateReport(reportType);
    }
};

window.addProduct = function() {
    if (window.dashboard) {
        window.dashboard.addProduct();
    }
};

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.dashboard = new WarehouseDashboard();
});