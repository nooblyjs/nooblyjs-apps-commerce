/**
 * NooblyJS Store Admin Dashboard
 * JavaScript functionality for the admin interface
 */

class AdminDashboard {
  constructor() {
    this.apiBase = '/applications/ecommerce/api';
    this.currentSection = 'overview';
    this.currentUser = null;
  }

  // Initialize the admin dashboard
  async init() {
    this.setupEventListeners();
    await this.loadInitialData();
    this.showSection('overview');
  }

  // Set up event listeners
  setupEventListeners() {
    // Sidebar navigation
    document.querySelectorAll('.menu-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const section = item.getAttribute('data-section');
        this.showSection(section);
      });
    });

    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    if (mobileMenuToggle) {
      mobileMenuToggle.addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('mobile-open');
      });
    }

    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('collapsed');
      });
    }

    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.refreshCurrentSection();
      });
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.logout();
      });
    }
  }

  // Show a specific section
  showSection(sectionName) {
    // Update active menu item
    document.querySelectorAll('.menu-item').forEach(item => {
      item.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionName}"]`)?.classList.add('active');

    // Update page title
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
      pageTitle.textContent = this.getSectionTitle(sectionName);
    }

    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
      section.classList.remove('active');
    });

    // Show target section
    const targetSection = document.getElementById(`${sectionName}Section`);
    if (targetSection) {
      targetSection.classList.add('active');
    }

    this.currentSection = sectionName;
    this.loadSectionData(sectionName);
  }

  // Get section title
  getSectionTitle(section) {
    const titles = {
      overview: 'Dashboard Overview',
      analytics: 'Analytics',
      products: 'Products',
      categories: 'Categories',
      inventory: 'Inventory',
      orders: 'Orders',
      customers: 'Customers',
      promotions: 'Promotions',
      settings: 'Settings'
    };
    return titles[section] || 'Dashboard';
  }

  // Load initial dashboard data
  async loadInitialData() {
    try {
      await Promise.all([
        this.loadStats(),
        this.loadRecentOrders(),
        this.loadLowStock()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
      this.showNotification('Error loading dashboard data', 'error');
    }
  }

  // Load dashboard statistics
  async loadStats() {
    try {
      const [salesResponse, ordersResponse, customersResponse, productsResponse] = await Promise.all([
        fetch(`${this.apiBase}/admin/analytics/sales`),
        fetch(`${this.apiBase}/admin/orders`),
        fetch(`${this.apiBase}/admin/analytics/customers`),
        fetch(`${this.apiBase}/products`)
      ]);

      const salesData = await salesResponse.json();
      const ordersData = await ordersResponse.json();
      const customersData = await customersResponse.json();
      const productsData = await productsResponse.json();

      // Update stat cards
      this.updateElement('totalRevenue', `$${salesData.totalRevenue?.toFixed(2) || '0.00'}`);
      this.updateElement('totalOrders', ordersData.orders?.length || 0);
      this.updateElement('totalCustomers', customersData.totalCustomers || 0);
      this.updateElement('totalProducts', productsData.products?.length || 0);

      // Update badges
      this.updateElement('orderCount', ordersData.orders?.length || 0);
      this.updateElement('productCount', productsData.products?.length || 0);

    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  // Load recent orders for dashboard
  async loadRecentOrders() {
    try {
      const response = await fetch(`${this.apiBase}/admin/orders?limit=5`);
      const data = await response.json();

      const tableBody = document.getElementById('recentOrdersTable');
      if (tableBody && data.orders) {
        tableBody.innerHTML = data.orders.map(order => `
          <tr>
            <td>#${order.id.substr(0, 8)}</td>
            <td>${order.customerName || 'N/A'}</td>
            <td>$${order.total.toFixed(2)}</td>
            <td><span class="status ${order.status}">${order.status}</span></td>
            <td>${new Date(order.createdAt).toLocaleDateString()}</td>
          </tr>
        `).join('');
      }
    } catch (error) {
      console.error('Error loading recent orders:', error);
    }
  }

  // Load low stock items
  async loadLowStock() {
    try {
      const response = await fetch(`${this.apiBase}/admin/inventory?lowStock=10`);
      const data = await response.json();

      const lowStockList = document.getElementById('lowStockList');
      if (lowStockList && data.products) {
        if (data.products.length === 0) {
          lowStockList.innerHTML = '<p class="text-muted">No low stock items</p>';
        } else {
          lowStockList.innerHTML = data.products.map(product => `
            <div class="low-stock-item">
              <span class="product-name">${product.name}</span>
              <span class="stock-level ${product.inventory < 5 ? 'critical' : 'warning'}">${product.inventory} left</span>
            </div>
          `).join('');
        }
      }
    } catch (error) {
      console.error('Error loading low stock:', error);
    }
  }

  // Load section-specific data
  async loadSectionData(section) {
    switch (section) {
      case 'products':
        await this.loadProducts();
        break;
      case 'orders':
        await this.loadOrders();
        break;
      case 'analytics':
        await this.loadAnalytics();
        break;
      // Add other sections as needed
    }
  }

  // Load products
  async loadProducts() {
    try {
      const response = await fetch(`${this.apiBase}/products`);
      const data = await response.json();

      const tableBody = document.getElementById('productsTableBody');
      if (tableBody && data.products) {
        tableBody.innerHTML = data.products.map(product => `
          <tr>
            <td><input type="checkbox" value="${product.id}"></td>
            <td>
              <div class="product-info">
                <span class="product-name">${product.name}</span>
                <small class="product-sku">${product.sku}</small>
              </div>
            </td>
            <td>${product.sku}</td>
            <td>${product.category}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>${product.inventory}</td>
            <td><span class="status ${product.status || 'active'}">${product.status || 'active'}</span></td>
            <td>
              <button class="btn-icon" onclick="adminDashboard.editProduct('${product.id}')">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn-icon" onclick="adminDashboard.deleteProduct('${product.id}')">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        `).join('');
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  }

  // Load orders
  async loadOrders() {
    try {
      const response = await fetch(`${this.apiBase}/admin/orders`);
      const data = await response.json();

      const tableBody = document.getElementById('ordersTableBody');
      if (tableBody && data.orders) {
        tableBody.innerHTML = data.orders.map(order => `
          <tr>
            <td>#${order.id.substr(0, 8)}</td>
            <td>${order.customerName || 'N/A'}</td>
            <td>${order.itemCount || 1} items</td>
            <td>$${order.total.toFixed(2)}</td>
            <td><span class="status ${order.status}">${order.status}</span></td>
            <td>${new Date(order.createdAt).toLocaleDateString()}</td>
            <td>
              <button class="btn-icon" onclick="adminDashboard.viewOrder('${order.id}')">
                <i class="fas fa-eye"></i>
              </button>
            </td>
          </tr>
        `).join('');
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  }

  // Load analytics
  async loadAnalytics() {
    // Implementation for analytics charts would go here
    console.log('Loading analytics...');
  }

  // Refresh current section
  refreshCurrentSection() {
    this.loadSectionData(this.currentSection);
    this.showNotification('Data refreshed', 'success');
  }

  // Utility function to update element text content safely
  updateElement(id, content) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = content;
    }
  }

  // Show notification
  showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    if (container) {
      const notification = document.createElement('div');
      notification.className = `notification ${type}`;
      notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
      `;
      container.appendChild(notification);

      // Auto-remove after 5 seconds
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 5000);
    }
  }

  // Logout function
  logout() {
    if (confirm('Are you sure you want to logout?')) {
      // Implement logout logic
      window.location.href = '/applications/ecommerce/';
    }
  }

  // Product management functions
  editProduct(productId) {
    console.log('Edit product:', productId);
    // Implementation for product editing modal
  }

  deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
      console.log('Delete product:', productId);
      // Implementation for product deletion
    }
  }

  // Order management functions
  viewOrder(orderId) {
    console.log('View order:', orderId);
    // Implementation for order details modal
  }
}

// Initialize admin dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.adminDashboard = new AdminDashboard();
  adminDashboard.init();
});