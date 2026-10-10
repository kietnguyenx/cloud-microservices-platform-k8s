/**
 * TaskMaster Pro - Frontend Application Logic
 * Single Page Application (SPA) integrating with FastAPI Backend
 */

// ==========================================
// Configuration & State
// ==========================================

// Determine API Base URL dynamically (supports custom host, localhost, or reverse proxy)
const API_BASE_URL = window.API_BASE_URL 
    || localStorage.getItem('API_BASE_URL') 
    || (window.location.port === "8000" ? "" : "http://localhost:8000");

const state = {
    token: localStorage.getItem('taskmaster_token') || null,
    user: null,
    todos: [],
    currentFilter: 'all', // 'all' | 'active' | 'completed'
    searchQuery: '',
    deleteTargetId: null,
    isServerOnline: false
};

// ==========================================
// DOM Elements
// ==========================================

const DOM = {
    // Health status
    statusDot: document.getElementById('status-dot'),
    statusText: document.getElementById('status-text'),
    
    // Auth section
    authSection: document.getElementById('auth-section'),
    tabLogin: document.getElementById('tab-login'),
    tabRegister: document.getElementById('tab-register'),
    formLogin: document.getElementById('form-login'),
    formRegister: document.getElementById('form-register'),
    loginEmail: document.getElementById('login-email'),
    loginPassword: document.getElementById('login-password'),
    registerUsername: document.getElementById('register-username'),
    registerEmail: document.getElementById('register-email'),
    registerPassword: document.getElementById('register-password'),
    
    // User Nav
    navUserPanel: document.getElementById('nav-user-panel'),
    navUsername: document.getElementById('nav-username'),
    navEmail: document.getElementById('nav-email'),
    userAvatar: document.getElementById('user-avatar'),
    btnLogout: document.getElementById('btn-logout'),

    // Dashboard
    dashboardSection: document.getElementById('dashboard-section'),
    formCreateTodo: document.getElementById('form-create-todo'),
    inputTodoTitle: document.getElementById('input-todo-title'),
    inputTodoDescription: document.getElementById('input-todo-description'),
    
    // Stats
    statTotalCount: document.getElementById('stat-total-count'),
    statPendingCount: document.getElementById('stat-pending-count'),
    statCompletedCount: document.getElementById('stat-completed-count'),
    statProgressBar: document.getElementById('stat-progress-bar'),
    statProgressText: document.getElementById('stat-progress-text'),

    // Filters & Search
    filterTabs: document.querySelectorAll('.filter-tab'),
    countAll: document.getElementById('count-all'),
    countActive: document.getElementById('count-active'),
    countCompleted: document.getElementById('count-completed'),
    inputSearchTodo: document.getElementById('input-search-todo'),
    btnClearSearch: document.getElementById('btn-clear-search'),
    
    // Todo List & Empty State
    todoList: document.getElementById('todo-list'),
    emptyState: document.getElementById('empty-state'),
    emptyTitle: document.getElementById('empty-title'),
    emptyDesc: document.getElementById('empty-desc'),

    // Modals
    modalEdit: document.getElementById('modal-edit-todo'),
    formEdit: document.getElementById('form-edit-todo'),
    editTodoId: document.getElementById('edit-todo-id'),
    editTodoTitle: document.getElementById('edit-todo-title'),
    editTodoDescription: document.getElementById('edit-todo-description'),
    editTodoCompleted: document.getElementById('edit-todo-completed'),
    btnCloseEdit: document.getElementById('btn-close-edit-modal'),
    btnCancelEdit: document.getElementById('btn-cancel-edit'),

    modalDelete: document.getElementById('modal-delete-todo'),
    deleteTargetTitle: document.getElementById('delete-target-title'),
    btnCloseDelete: document.getElementById('btn-close-delete-modal'),
    btnCancelDelete: document.getElementById('btn-cancel-delete'),
    btnConfirmDelete: document.getElementById('btn-confirm-delete'),

    // Toast Container
    toastContainer: document.getElementById('toast-container')
};

// ==========================================
// Toast Notification Helper
// ==========================================

function showToast(message, type = 'info', duration = 3500) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const iconSvg = {
        success: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
        error: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
        info: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`
    }[type] || '';

    toast.innerHTML = `
        ${iconSvg}
        <span>${escapeHtml(message)}</span>
    `;

    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ==========================================
// API Request Helper
// ==========================================

async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    if (state.token) {
        headers['Authorization'] = `Bearer ${state.token}`;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers
        });

        // Handle 401 Unauthorized (Expired or invalid token)
        if (response.status === 401) {
            if (state.token) {
                logout(false);
                showToast("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.", "error");
            }
            throw new Error("Unauthorized");
        }

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            let errorMsg = "Đã xảy ra lỗi";
            if (data) {
                if (typeof data.detail === 'string') {
                    errorMsg = data.detail;
                } else if (Array.isArray(data.detail) && data.detail.length > 0) {
                    errorMsg = data.detail.map(d => d.msg || d.message).join(", ");
                }
            }
            throw new Error(errorMsg);
        }

        return data;
    } catch (err) {
        if (err.message !== "Unauthorized") {
            console.error(`API Error on ${endpoint}:`, err);
        }
        throw err;
    }
}

// ==========================================
// Health & Liveness Check
// ==========================================

async function checkServerHealth() {
    try {
        const res = await fetch(`${API_BASE_URL}/healthz`, { method: 'GET' });
        if (res.ok) {
            state.isServerOnline = true;
            DOM.statusDot.className = 'status-dot online';
            DOM.statusText.textContent = 'Backend Online';
        } else {
            throw new Error();
        }
    } catch {
        state.isServerOnline = false;
        DOM.statusDot.className = 'status-dot offline';
        DOM.statusText.textContent = 'Backend Offline';
    }
}

// ==========================================
// Auth Handlers
// ==========================================

function switchAuthTab(targetTab) {
    if (targetTab === 'login') {
        DOM.tabLogin.classList.add('active');
        DOM.tabRegister.classList.remove('active');
        DOM.formLogin.style.display = 'block';
        DOM.formRegister.style.display = 'none';
    } else {
        DOM.tabRegister.classList.add('active');
        DOM.tabLogin.classList.remove('active');
        DOM.formRegister.style.display = 'block';
        DOM.formLogin.style.display = 'none';
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = DOM.loginEmail.value.trim();
    const password = DOM.loginPassword.value;

    if (!email || !password) {
        showToast("Vui lòng điền đầy đủ email và mật khẩu", "error");
        return;
    }

    try {
        const res = await apiRequest('/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        state.token = res.access_token;
        state.user = res.user;
        localStorage.setItem('taskmaster_token', res.access_token);

        showToast(`Đăng nhập thành công! Chào ${res.user.username}`, "success");
        initDashboard();
    } catch (err) {
        showToast(err.message || "Đăng nhập thất bại", "error");
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const username = DOM.registerUsername.value.trim();
    const email = DOM.registerEmail.value.trim();
    const password = DOM.registerPassword.value;

    if (!username || !email || !password) {
        showToast("Vui lòng nhập đầy đủ các trường thông tin", "error");
        return;
    }

    if (password.length < 6) {
        showToast("Mật khẩu phải chứa ít nhất 6 ký tự", "error");
        return;
    }

    try {
        const res = await apiRequest('/signup', {
            method: 'POST',
            body: JSON.stringify({ username, email, password })
        });

        state.token = res.access_token;
        state.user = res.user;
        localStorage.setItem('taskmaster_token', res.access_token);

        showToast("Đăng ký tài khoản thành công!", "success");
        initDashboard();
    } catch (err) {
        showToast(err.message || "Đăng ký thất bại", "error");
    }
}

function logout(showNotification = true) {
    state.token = null;
    state.user = null;
    state.todos = [];
    localStorage.removeItem('taskmaster_token');

    DOM.navUserPanel.style.display = 'none';
    DOM.dashboardSection.style.display = 'none';
    DOM.authSection.style.display = 'grid';

    // Clear form inputs
    DOM.loginPassword.value = '';
    DOM.registerPassword.value = '';

    if (showNotification) {
        showToast("Đã đăng xuất khỏi hệ thống", "info");
    }
}

async function checkSession() {
    if (!state.token) {
        logout(false);
        return;
    }

    try {
        const user = await apiRequest('/me');
        state.user = user;
        initDashboard();
    } catch {
        logout(false);
    }
}

// ==========================================
// Dashboard & Todo Logic
// ==========================================

function initDashboard() {
    // Show Nav User Info
    DOM.navUsername.textContent = state.user.username;
    DOM.navEmail.textContent = state.user.email;
    DOM.userAvatar.textContent = state.user.username.charAt(0).toUpperCase();
    DOM.navUserPanel.style.display = 'flex';

    // Show Dashboard, Hide Auth
    DOM.authSection.style.display = 'none';
    DOM.dashboardSection.style.display = 'flex';

    // Fetch Todos
    fetchTodos();
}

async function fetchTodos() {
    try {
        const todos = await apiRequest('/todos');
        state.todos = todos;
        updateStats();
        renderTodoList();
    } catch (err) {
        showToast("Không thể tải danh sách công việc", "error");
    }
}

async function handleCreateTodo(e) {
    e.preventDefault();
    const title = DOM.inputTodoTitle.value.trim();
    const description = DOM.inputTodoDescription.value.trim();

    if (!title) {
        showToast("Vui lòng nhập tiêu đề công việc", "error");
        return;
    }

    try {
        const newTodo = await apiRequest('/todos', {
            method: 'POST',
            body: JSON.stringify({
                title,
                description,
                completed: false
            })
        });

        // Add to state and render immediately
        state.todos.unshift(newTodo);
        DOM.inputTodoTitle.value = '';
        DOM.inputTodoDescription.value = '';
        
        updateStats();
        renderTodoList();
        showToast("Đã thêm công việc mới thành công!", "success");
    } catch (err) {
        showToast(err.message || "Không thể tạo công việc", "error");
    }
}

async function handleToggleTodo(todoId) {
    const todoIndex = state.todos.findIndex(t => t.id === todoId);
    if (todoIndex === -1) return;

    // Optimistic UI update
    const previousState = state.todos[todoIndex].completed;
    state.todos[todoIndex].completed = !previousState;
    updateStats();
    renderTodoList();

    try {
        const updated = await apiRequest(`/todos/${todoId}/toggle`, {
            method: 'PATCH'
        });
        state.todos[todoIndex] = updated;
        updateStats();
    } catch (err) {
        // Revert on error
        state.todos[todoIndex].completed = previousState;
        updateStats();
        renderTodoList();
        showToast("Lỗi khi cập nhật trạng thái", "error");
    }
}

function openEditModal(todoId) {
    const todo = state.todos.find(t => t.id === todoId);
    if (!todo) return;

    DOM.editTodoId.value = todo.id;
    DOM.editTodoTitle.value = todo.title;
    DOM.editTodoDescription.value = todo.description || '';
    DOM.editTodoCompleted.checked = todo.completed;

    DOM.modalEdit.showModal();
}

async function handleSaveEditTodo(e) {
    e.preventDefault();
    const id = parseInt(DOM.editTodoId.value, 10);
    const title = DOM.editTodoTitle.value.trim();
    const description = DOM.editTodoDescription.value.trim();
    const completed = DOM.editTodoCompleted.checked;

    if (!title) {
        showToast("Tiêu đề không được để trống", "error");
        return;
    }

    try {
        const updated = await apiRequest(`/todos/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                title,
                description,
                completed
            })
        });

        const index = state.todos.findIndex(t => t.id === id);
        if (index !== -1) {
            state.todos[index] = updated;
        }

        DOM.modalEdit.close();
        updateStats();
        renderTodoList();
        showToast("Cập nhật công việc thành công!", "success");
    } catch (err) {
        showToast(err.message || "Lỗi khi cập nhật", "error");
    }
}

function openDeleteModal(todoId) {
    const todo = state.todos.find(t => t.id === todoId);
    if (!todo) return;

    state.deleteTargetId = todo.id;
    DOM.deleteTargetTitle.textContent = `"${todo.title}"`;
    DOM.modalDelete.showModal();
}

async function handleConfirmDelete() {
    if (!state.deleteTargetId) return;

    const id = state.deleteTargetId;
    try {
        await apiRequest(`/todos/${id}`, {
            method: 'DELETE'
        });

        state.todos = state.todos.filter(t => t.id !== id);
        state.deleteTargetId = null;
        DOM.modalDelete.close();

        updateStats();
        renderTodoList();
        showToast("Đã xóa công việc vĩnh viễn", "info");
    } catch (err) {
        showToast(err.message || "Không thể xóa công việc", "error");
    }
}

// ==========================================
// Stats & Rendering
// ==========================================

function updateStats() {
    const total = state.todos.length;
    const completed = state.todos.filter(t => t.completed).length;
    const pending = total - completed;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    DOM.statTotalCount.textContent = total;
    DOM.statPendingCount.textContent = pending;
    DOM.statCompletedCount.textContent = completed;
    DOM.statProgressText.textContent = `${percent}%`;
    DOM.statProgressBar.style.width = `${percent}%`;

    // Filter Badges
    DOM.countAll.textContent = total;
    DOM.countActive.textContent = pending;
    DOM.countCompleted.textContent = completed;
}

function getFilteredTodos() {
    return state.todos.filter(todo => {
        // Status filter
        if (state.currentFilter === 'active' && todo.completed) return false;
        if (state.currentFilter === 'completed' && !todo.completed) return false;

        // Search filter
        if (state.searchQuery) {
            const query = state.searchQuery.toLowerCase();
            const matchTitle = (todo.title || '').toLowerCase().includes(query);
            const matchDesc = (todo.description || '').toLowerCase().includes(query);
            if (!matchTitle && !matchDesc) return false;
        }

        return true;
    });
}

function renderTodoList() {
    const filteredTodos = getFilteredTodos();

    if (filteredTodos.length === 0) {
        DOM.todoList.innerHTML = '';
        DOM.emptyState.style.display = 'flex';
        
        if (state.searchQuery) {
            DOM.emptyTitle.textContent = "Không tìm thấy kết quả phù hợp";
            DOM.emptyDesc.textContent = `Không có công việc nào khớp với từ khóa "${state.searchQuery}".`;
        } else if (state.currentFilter === 'completed') {
            DOM.emptyTitle.textContent = "Chưa có công việc nào hoàn thành";
            DOM.emptyDesc.textContent = "Hãy hoàn thành các công việc đang chờ để xem tiến độ tại đây!";
        } else if (state.currentFilter === 'active') {
            DOM.emptyTitle.textContent = "Không còn việc nào đang chờ!";
            DOM.emptyDesc.textContent = "Tuyệt vời! Bạn đã hoàn thành toàn bộ các công việc đề ra.";
        } else {
            DOM.emptyTitle.textContent = "Chưa có công việc nào";
            DOM.emptyDesc.textContent = "Hãy thêm công việc đầu tiên ở ô bên trên để bắt đầu ngày làm việc hiệu quả!";
        }
        return;
    }

    DOM.emptyState.style.display = 'none';

    DOM.todoList.innerHTML = filteredTodos.map(todo => {
        const dateStr = todo.created_at 
            ? new Date(todo.created_at).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
            : '';

        return `
            <article class="todo-item glass-card ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                <div class="todo-left">
                    <label class="custom-checkbox-label" title="${todo.completed ? 'Đánh dấu chưa xong' : 'Đánh dấu đã xong'}">
                        <input type="checkbox" ${todo.completed ? 'checked' : ''} onchange="handleToggleTodo(${todo.id})">
                        <span class="checkbox-custom"></span>
                    </label>
                    <div class="todo-content">
                        <h4 class="todo-title">${escapeHtml(todo.title)}</h4>
                        ${todo.description ? `<p class="todo-desc">${escapeHtml(todo.description)}</p>` : ''}
                        <div class="todo-meta">
                            <span class="todo-badge ${todo.completed ? 'badge-done' : 'badge-active'}">
                                ${todo.completed ? 'Đã xong' : 'Đang làm'}
                            </span>
                            ${dateStr ? `<span class="todo-date">${dateStr}</span>` : ''}
                        </div>
                    </div>
                </div>
                <div class="todo-actions">
                    <button class="btn-action action-edit" onclick="openEditModal(${todo.id})" title="Chỉnh sửa công việc">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button class="btn-action action-delete" onclick="openDeleteModal(${todo.id})" title="Xóa công việc">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            </article>
        `;
    }).join('');
}

// Make functions accessible to inline onclicks
window.handleToggleTodo = handleToggleTodo;
window.openEditModal = openEditModal;
window.openDeleteModal = openDeleteModal;

// ==========================================
// Event Listeners Setup
// ==========================================

function setupEventListeners() {
    // Auth Tabs
    DOM.tabLogin.addEventListener('click', () => switchAuthTab('login'));
    DOM.tabRegister.addEventListener('click', () => switchAuthTab('register'));

    // Auth Forms
    DOM.formLogin.addEventListener('submit', handleLogin);
    DOM.formRegister.addEventListener('submit', handleRegister);
    DOM.btnLogout.addEventListener('click', () => logout(true));

    // Create Todo Form
    DOM.formCreateTodo.addEventListener('submit', handleCreateTodo);

    // Filters
    DOM.filterTabs.forEach(btn => {
        btn.addEventListener('click', () => {
            DOM.filterTabs.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.currentFilter = btn.dataset.filter;
            renderTodoList();
        });
    });

    // Search
    DOM.inputSearchTodo.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.trim();
        DOM.btnClearSearch.style.display = state.searchQuery ? 'grid' : 'none';
        renderTodoList();
    });

    DOM.btnClearSearch.addEventListener('click', () => {
        DOM.inputSearchTodo.value = '';
        state.searchQuery = '';
        DOM.btnClearSearch.style.display = 'none';
        renderTodoList();
    });

    // Edit Modal
    DOM.formEdit.addEventListener('submit', handleSaveEditTodo);
    DOM.btnCloseEdit.addEventListener('click', () => DOM.modalEdit.close());
    DOM.btnCancelEdit.addEventListener('click', () => DOM.modalEdit.close());

    // Delete Modal
    DOM.btnConfirmDelete.addEventListener('click', handleConfirmDelete);
    DOM.btnCloseDelete.addEventListener('click', () => DOM.modalDelete.close());
    DOM.btnCancelDelete.addEventListener('click', () => DOM.modalDelete.close());

    // Close modals on outside backdrop click
    [DOM.modalEdit, DOM.modalDelete].forEach(modal => {
        modal.addEventListener('click', (e) => {
            const rect = modal.getBoundingClientRect();
            const isInDialog = (
                rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
                rect.left <= e.clientX && e.clientX <= rect.left + rect.width
            );
            if (!isInDialog) {
                modal.close();
            }
        });
    });
}

// ==========================================
// Application Bootstrap
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    checkServerHealth();
    setInterval(checkServerHealth, 30000); // Check server health every 30s
    checkSession();
});
