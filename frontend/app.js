/**
 * TaskFlow Studio - White & Blue ("Tone Trắng - Xanh") Application Logic
 * Kanban Project Management inspired by Asana & Trello
 * Seamlessly integrates with FastAPI Backend & provides rich offline local persistence
 */

// ==========================================
// 1. Configuration & Initial State
// ==========================================

const API_BASE_URL = window.API_BASE_URL 
    || localStorage.getItem('API_BASE_URL') 
    || (window.location.port === "8000" ? "" : "http://localhost:8000");

// Default sample tasks matching both reference photos (Image 1 & Image 2)
const DEFAULT_DEMO_TASKS = [
    {
        id: 1,
        title: "Infographic on productivity",
        description: "Thiết kế infographic tổng hợp các mẹo gia tăng năng suất cho đội nhóm.",
        column: "new",
        tag: "pink",
        assignee: "Sarah",
        dueDate: "Jul 19",
        cover: "none",
        comments: 2,
        attachments: 0,
        checklist: "1/3",
        completed: false
    },
    {
        id: 2,
        title: "Case study layout designs",
        description: "Bố cục lưới và thiết kế typography cho tài liệu case study khách hàng.",
        column: "new",
        tag: "cyan",
        assignee: "Emma",
        dueDate: "Aug 4-7",
        cover: "none",
        comments: 1,
        attachments: 0,
        checklist: "2/5",
        completed: false
    },
    {
        id: 3,
        title: "Poster for volunteer event",
        description: "Áp phích truyền thông cho chiến dịch tình nguyện mùa hè xanh.",
        column: "new",
        tag: "pink",
        assignee: "David",
        dueDate: "Aug 16",
        cover: "none",
        comments: 3,
        attachments: 0,
        checklist: "",
        completed: false
    },
    {
        id: 4,
        title: "Social media assets",
        description: "Bộ nhận diện hình ảnh cho các kênh mạng xã hội, kích thước chuẩn 1080x1080.",
        column: "in_progress",
        tag: "green",
        assignee: "Alex",
        dueDate: "Monday",
        cover: "mountain", // Mountain vector art from Image 1
        comments: 0,
        attachments: 5,
        checklist: "4/10",
        completed: false
    },
    {
        id: 5,
        title: "Homepage design update",
        description: "Cập nhật lại hero banner và các khối tính năng chính của trang chủ.",
        column: "in_progress",
        tag: "blue",
        assignee: "Sarah",
        dueDate: "Today",
        cover: "none",
        comments: 14,
        attachments: 0,
        checklist: "4/4",
        completed: false
    },
    {
        id: 6,
        title: "Team Project Onboarding",
        description: "Hướng dẫn thành viên mới sử dụng công cụ quản lý dự án Kanban.",
        column: "in_progress",
        tag: "purple",
        assignee: "Emma",
        dueDate: "Tuần này",
        cover: "emojis", // 3D Cute Emojis from Image 2
        comments: 8,
        attachments: 2,
        checklist: "4/10",
        completed: false
    },
    {
        id: 7,
        title: "Featured blog image",
        description: "Ảnh minh họa cho bài viết kiến trúc Cloud và Microservices với FastAPI.",
        column: "complete",
        tag: "cyan",
        assignee: "Alex",
        dueDate: "Đã hoàn thành",
        cover: "airplane", // Origami Airplane art from Image 1
        comments: 0,
        attachments: 3,
        checklist: "3/3",
        completed: true
    },
    {
        id: 8,
        title: "How this project works",
        description: "Tài liệu quy trình làm việc chuẩn cho toàn bộ thành viên thiết kế.",
        column: "reference",
        tag: "purple",
        assignee: "Alex",
        dueDate: "Tài liệu",
        cover: "none",
        comments: 0,
        attachments: 1,
        checklist: "",
        completed: false
    },
    {
        id: 9,
        title: "Templates and spec",
        description: "Mẫu wireframe Figma, bảng màu và thư viện thành phần Design System.",
        column: "reference",
        tag: "purple",
        assignee: "David",
        dueDate: "Quy chuẩn",
        cover: "none",
        comments: 2,
        attachments: 4,
        checklist: "",
        completed: false
    },
    {
        id: 10,
        title: "Archives",
        description: "Kho lưu trữ các bản thiết kế các phiên bản trước.",
        column: "reference",
        tag: "purple",
        assignee: "Sarah",
        dueDate: "Lưu trữ",
        cover: "none",
        comments: 0,
        attachments: 0,
        checklist: "",
        completed: false
    }
];

const state = {
    token: localStorage.getItem('taskmaster_token') || null,
    user: null,
    tasks: [],
    currentView: 'board', // 'board' | 'list' | 'timeline' | 'calendar' | 'progress'
    searchQuery: '',
    hideCompleted: false,
    isStarred: localStorage.getItem('taskflow_starred') === 'true',
    isServerOnline: false,
    draggedTaskId: null,
    deleteTargetId: null,
    activeEditColor: 'blue',
    activeEditCover: 'none'
};

// ==========================================
// 2. SVG Vector Art Assets (Cover Illustrations)
// ==========================================

const SVG_COVERS = {
    // 1. Mountain Sunset (Inspired by Image 1 "Social media assets")
    mountain: `
        <svg viewBox="0 0 400 160" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#eff6ff"/>
                    <stop offset="100%" stop-color="#ffffff"/>
                </linearGradient>
                <linearGradient id="mount1" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#3b82f6"/>
                    <stop offset="100%" stop-color="#1d4ed8"/>
                </linearGradient>
                <linearGradient id="mount2" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#2563eb"/>
                    <stop offset="100%" stop-color="#1e40af"/>
                </linearGradient>
            </defs>
            <rect width="400" height="160" fill="url(#skyGrad)"/>
            <!-- Golden Sun -->
            <circle cx="280" cy="65" r="28" fill="#fbbf24" opacity="0.95"/>
            <!-- Background Mountains -->
            <polygon points="120,160 220,55 320,160" fill="#93c5fd" opacity="0.6"/>
            <!-- Foreground Mountains -->
            <polygon points="40,160 160,40 280,160" fill="url(#mount1)"/>
            <polygon points="200,160 300,70 400,160" fill="url(#mount2)"/>
            <!-- Coral Tree -->
            <path d="M110,140 Q100,105 110,95 Q135,80 145,105 Q145,130 110,140 Z" fill="#f43f5e"/>
            <line x1="120" y1="140" x2="120" y2="160" stroke="#78350f" stroke-width="3" stroke-linecap="round"/>
            <circle cx="140" cy="120" r="14" fill="#fb7185"/>
            <!-- Winding Road -->
            <path d="M220,160 C240,140 270,145 290,130 C305,120 315,125 330,122" fill="none" stroke="#64748b" stroke-width="2.5" stroke-dasharray="4 2"/>
        </svg>
    `,

    // 2. Origami Paper Airplanes (Inspired by Image 1 "Featured blog image")
    airplane: `
        <svg viewBox="0 0 400 160" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="airGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#f0f9ff"/>
                    <stop offset="100%" stop-color="#eff6ff"/>
                </linearGradient>
            </defs>
            <rect width="400" height="160" fill="url(#airGrad)"/>
            <!-- Wind Trails -->
            <path d="M40,110 Q140,80 240,95" fill="none" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="5 4" stroke-linecap="round"/>
            <path d="M70,50 Q180,30 290,55" fill="none" stroke="#cbd5e1" stroke-width="1.8" stroke-dasharray="4 3" stroke-linecap="round"/>
            <!-- Big Blue Airplane -->
            <g transform="translate(190, 30) rotate(-10)">
                <polygon points="0,40 100,10 40,55" fill="#3b82f6"/>
                <polygon points="100,10 40,55 35,42" fill="#2563eb"/>
                <polygon points="0,40 40,55 35,42" fill="#60a5fa"/>
            </g>
            <!-- Coral Pink Airplane -->
            <g transform="translate(180, 75) rotate(5) scale(0.95)">
                <polygon points="0,40 100,10 40,55" fill="#f43f5e"/>
                <polygon points="100,10 40,55 35,42" fill="#e11d48"/>
                <polygon points="0,40 40,55 35,42" fill="#fb7185"/>
            </g>
        </svg>
    `,

    // 3. Cute 3D Emojis Banner (Inspired by Image 2 "Team Project")
    emojis: `
        <svg viewBox="0 0 400 160" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="emojiBg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#3b82f6"/>
                    <stop offset="50%" stop-color="#6366f1"/>
                    <stop offset="100%" stop-color="#8b5cf6"/>
                </linearGradient>
            </defs>
            <rect width="400" height="160" fill="url(#emojiBg)"/>
            <!-- Floating Glows -->
            <circle cx="80" cy="50" r="16" fill="#f43f5e" opacity="0.4"/>
            <circle cx="320" cy="110" r="20" fill="#38bdf8" opacity="0.4"/>
            <!-- Emoji 1: Cyan Square Face -->
            <g transform="translate(80, 50)">
                <rect x="0" y="0" width="55" height="55" rx="14" fill="#38bdf8"/>
                <circle cx="18" cy="22" r="3.5" fill="#0f172a"/>
                <circle cx="37" cy="22" r="3.5" fill="#0f172a"/>
                <path d="M20,34 Q27.5,42 35,34" fill="none" stroke="#0f172a" stroke-width="3" stroke-linecap="round"/>
            </g>
            <!-- Emoji 2: Purple Square Face -->
            <g transform="translate(150, 42)">
                <rect x="0" y="0" width="60" height="60" rx="16" fill="#c084fc"/>
                <circle cx="20" cy="24" r="4" fill="#0f172a"/>
                <circle cx="40" cy="24" r="4" fill="#0f172a"/>
                <path d="M22,36 Q30,44 38,36" fill="none" stroke="#0f172a" stroke-width="3.5" stroke-linecap="round"/>
            </g>
            <!-- Emoji 3: Pink Square Face -->
            <g transform="translate(225, 48)">
                <rect x="0" y="0" width="55" height="55" rx="14" fill="#fb7185"/>
                <circle cx="18" cy="22" r="3.5" fill="#0f172a"/>
                <circle cx="37" cy="22" r="3.5" fill="#0f172a"/>
                <line x1="20" y1="35" x2="35" y2="35" stroke="#0f172a" stroke-width="3" stroke-linecap="round"/>
            </g>
            <!-- Thumbs up and hearts -->
            <g transform="translate(300, 60)">
                <rect x="0" y="0" width="40" height="40" rx="10" fill="rgba(255,255,255,0.2)"/>
                <text x="12" y="27" font-size="20">👍</text>
            </g>
            <g transform="translate(30, 70)">
                <rect x="0" y="0" width="36" height="36" rx="8" fill="rgba(255,255,255,0.2)"/>
                <text x="9" y="25" font-size="18">❤️</text>
            </g>
        </svg>
    `
};

// ==========================================
// 3. Helper Functions
// ==========================================

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const iconMap = {
        success: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
        error: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
        info: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`
    };

    toast.innerHTML = `
        ${iconMap[type] || ''}
        <span>${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.transition = 'all 200ms ease';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 200);
    }, duration);
}

// ==========================================
// 4. Persistence & Data Loading
// ==========================================

function saveTasksToStorage() {
    try {
        localStorage.setItem('taskflow_tasks', JSON.stringify(state.tasks));
    } catch (e) {
        console.error("Storage error:", e);
    }
}

function loadTasksFromStorage() {
    try {
        const stored = localStorage.getItem('taskflow_tasks');
        if (stored) {
            state.tasks = JSON.parse(stored);
            return;
        }
    } catch (e) {
        console.warn("Failed reading localStorage:", e);
    }
    // Fallback to rich demo data
    state.tasks = JSON.parse(JSON.stringify(DEFAULT_DEMO_TASKS));
    saveTasksToStorage();
}

// ==========================================
// 5. Backend REST API Communication
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

    const response = await fetch(url, {
        ...options,
        headers
    });

    if (!response.ok) {
        let errData = {};
        try {
            errData = await response.json();
        } catch {
            errData = { detail: response.statusText };
        }
        throw new Error(errData.detail || `Lỗi HTTP ${response.status}`);
    }

    return response.json();
}

async function checkServerHealth() {
    const badge = document.getElementById('server-status-badge');
    const text = document.getElementById('server-status-text');

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        const res = await fetch(`${API_BASE_URL}/healthz`, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
            state.isServerOnline = true;
            badge.classList.add('online');
            text.textContent = "Backend: Online 🟢";
            return true;
        }
    } catch {
        // Offline
    }

    state.isServerOnline = false;
    badge.classList.remove('online');
    text.textContent = "Chế độ Local 🟡";
    return false;
}

// Convert Backend Todo to TaskFlow Kanban Task
function todoToTask(todo) {
    let meta = {};
    let desc = todo.description || '';

    // Check if extra metadata is encoded in JSON
    if (desc.startsWith('{') && desc.endsWith('}')) {
        try {
            meta = JSON.parse(desc);
            desc = meta.desc || '';
        } catch {
            meta = {};
        }
    }

    return {
        id: todo.id,
        title: todo.title,
        description: desc,
        column: meta.column || (todo.completed ? 'complete' : 'new'),
        tag: meta.tag || (todo.completed ? 'green' : 'blue'),
        assignee: meta.assignee || 'Alex',
        dueDate: meta.dueDate || (todo.completed ? 'Hoàn thành' : 'Hôm nay'),
        cover: meta.cover || 'none',
        comments: meta.comments || 0,
        attachments: meta.attachments || 0,
        checklist: meta.checklist || '',
        completed: Boolean(todo.completed)
    };
}

// Convert TaskFlow Kanban Task to Backend Payload
function taskToTodoPayload(task) {
    const meta = {
        desc: task.description,
        column: task.column,
        tag: task.tag,
        assignee: task.assignee,
        dueDate: task.dueDate,
        cover: task.cover,
        comments: task.comments || 0,
        attachments: task.attachments || 0,
        checklist: task.checklist || ''
    };

    return {
        title: task.title,
        description: JSON.stringify(meta),
        completed: task.column === 'complete' || Boolean(task.completed)
    };
}

async function syncWithBackendIfAvailable() {
    if (!state.token) return;

    try {
        const todos = await apiRequest('/todos');
        if (Array.isArray(todos) && todos.length > 0) {
            state.tasks = todos.map(todoToTask);
            saveTasksToStorage();
            renderCurrentView();
        }
    } catch (e) {
        console.warn("Backend sync failed:", e.message);
    }
}

// ==========================================
// 6. Rendering Logic: Kanban Board View
// ==========================================

function getFilteredTasks() {
    return state.tasks.filter(task => {
        // Filter out completed if requested
        if (state.hideCompleted && task.completed) return false;

        // Search query filter
        if (state.searchQuery) {
            const q = state.searchQuery.toLowerCase();
            const matchTitle = (task.title || '').toLowerCase().includes(q);
            const matchDesc = (task.description || '').toLowerCase().includes(q);
            const matchAssignee = (task.assignee || '').toLowerCase().includes(q);
            if (!matchTitle && !matchDesc && !matchAssignee) return false;
        }

        return true;
    });
}

function renderBoardView() {
    const filtered = getFilteredTasks();

    const columns = {
        new: document.getElementById('cards-new'),
        in_progress: document.getElementById('cards-in_progress'),
        complete: document.getElementById('cards-complete'),
        reference: document.getElementById('cards-reference')
    };

    const counts = {
        new: 0,
        in_progress: 0,
        complete: 0,
        reference: 0
    };

    // Clear column cards
    Object.values(columns).forEach(col => {
        if (col) col.innerHTML = '';
    });

    // Populate filtered cards into respective columns
    filtered.forEach(task => {
        const colKey = task.column || (task.completed ? 'complete' : 'new');
        if (!columns[colKey]) return;

        counts[colKey] = (counts[colKey] || 0) + 1;
        const cardEl = createCardElement(task);
        columns[colKey].appendChild(cardEl);
    });

    // Update column badge counters
    document.getElementById('count-new').textContent = counts.new;
    document.getElementById('count-in_progress').textContent = counts.in_progress;
    document.getElementById('count-complete').textContent = counts.complete;
    document.getElementById('count-reference').textContent = counts.reference;

    // Update global summary bar
    updateSummaryStats();
}

function createCardElement(task) {
    const card = document.createElement('article');
    card.className = `task-card ${task.completed ? 'is-completed' : ''}`;
    card.setAttribute('draggable', 'true');
    card.setAttribute('data-id', task.id);
    card.id = `task-card-${task.id}`;

    // 1. Cover Illustration (if any)
    let coverHtml = '';
    if (task.cover && SVG_COVERS[task.cover]) {
        coverHtml = `<div class="card-cover" onclick="openEditTaskModal(${task.id})">${SVG_COVERS[task.cover]}</div>`;
    }

    // 2. Color Stripe (Cyan, Pink, Blue, Purple, Amber, Green)
    const stripeClass = `stripe-${task.tag || 'blue'}`;

    // 3. Checklist Badge (e.g. 4/10 or 4/4)
    let checklistHtml = '';
    if (task.checklist) {
        const isDone = task.checklist.includes('/') && task.checklist.split('/')[0] === task.checklist.split('/')[1];
        checklistHtml = `
            <div class="card-checklist-badge ${isDone ? 'is-all-done' : ''}" title="Tiến độ checklist">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
                <span>${escapeHtml(task.checklist)}</span>
            </div>
        `;
    }

    // 4. Assignee Avatar
    const assigneeInitial = (task.assignee || 'U').charAt(0).toUpperCase();
    const avatarBg = {
        Alex: '#3b82f6',
        Sarah: '#ec4899',
        David: '#10b981',
        Emma: '#f59e0b'
    }[task.assignee] || '#6366f1';

    // 5. Comments & Attachments Meta
    let metaItems = '';
    if (task.comments > 0) {
        metaItems += `
            <span class="card-meta-item" title="${task.comments} bình luận">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                <span>${task.comments}</span>
            </span>
        `;
    }
    if (task.attachments > 0) {
        metaItems += `
            <span class="card-meta-item" title="${task.attachments} tệp đính kèm">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                <span>${task.attachments}</span>
            </span>
        `;
    }

    card.innerHTML = `
        ${coverHtml}
        <div class="card-color-stripe ${stripeClass}"></div>
        <div class="card-body">
            <div class="card-title-row">
                <input type="checkbox" class="card-checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTaskComplete(${task.id}, event)" title="${task.completed ? 'Đánh dấu chưa xong' : 'Đánh dấu hoàn thành'}">
                <h4 class="card-title" onclick="openEditTaskModal(${task.id})">${escapeHtml(task.title)}</h4>
                <button class="card-quick-menu-btn" onclick="openEditTaskModal(${task.id})" title="Chỉnh sửa">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                </button>
            </div>
            ${task.description ? `<p class="card-desc" onclick="openEditTaskModal(${task.id})">${escapeHtml(task.description)}</p>` : ''}
            ${checklistHtml}
        </div>
        <div class="card-footer">
            <div class="card-footer-left">
                <div class="card-assignee-avatar" style="background: ${avatarBg};" title="Người phụ trách: ${escapeHtml(task.assignee)}">${assigneeInitial}</div>
                ${task.dueDate ? `<span class="card-due-date ${task.dueDate.toLowerCase() === 'today' || task.dueDate.toLowerCase() === 'hôm nay' ? 'is-today' : ''}"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line></svg>${escapeHtml(task.dueDate)}</span>` : ''}
            </div>
            <div class="card-footer-right">
                ${metaItems}
            </div>
        </div>
    `;

    // Attach Drag and Drop handlers
    attachDragEventsToCard(card, task);

    return card;
}

// ==========================================
// 7. Drag and Drop Interaction
// ==========================================

function attachDragEventsToCard(card, task) {
    card.addEventListener('dragstart', (e) => {
        state.draggedTaskId = task.id;
        card.classList.add('is-dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(task.id));
    });

    card.addEventListener('dragend', () => {
        card.classList.remove('is-dragging');
        state.draggedTaskId = null;
        document.querySelectorAll('.kanban-column').forEach(col => col.classList.remove('drag-over'));
    });
}

function initDragAndDropColumns() {
    const columns = document.querySelectorAll('.kanban-column');

    columns.forEach(col => {
        const colKey = col.dataset.column;

        col.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            col.classList.add('drag-over');
        });

        col.addEventListener('dragleave', (e) => {
            // Only remove when really leaving column
            if (!col.contains(e.relatedTarget)) {
                col.classList.remove('drag-over');
            }
        });

        col.addEventListener('drop', async (e) => {
            e.preventDefault();
            col.classList.remove('drag-over');

            const taskId = state.draggedTaskId || parseInt(e.dataTransfer.getData('text/plain'), 10);
            if (!taskId) return;

            const task = state.tasks.find(t => t.id === taskId);
            if (!task) return;

            const oldColumn = task.column;
            if (oldColumn === colKey) return;

            // Move to new column
            task.column = colKey;
            if (colKey === 'complete') {
                task.completed = true;
                task.dueDate = task.dueDate || 'Đã xong';
            } else if (oldColumn === 'complete') {
                task.completed = false;
            }

            saveTasksToStorage();
            renderBoardView();
            showToast(`Đã chuyển thẻ sang cột ${getColumnName(colKey)}`, 'success', 2000);

            // Sync with backend if connected
            if (state.token && state.isServerOnline) {
                try {
                    await apiRequest(`/todos/${task.id}`, {
                        method: 'PUT',
                        body: JSON.stringify(taskToTodoPayload(task))
                    });
                } catch (err) {
                    console.error("Backend update failed:", err);
                }
            }
        });
    });
}

function getColumnName(key) {
    return {
        new: 'New Requests',
        in_progress: 'In Progress',
        complete: 'Complete',
        reference: 'Reference'
    }[key] || key;
}

// ==========================================
// 8. Other Views (List, Calendar, Progress)
// ==========================================

function switchView(viewName) {
    state.currentView = viewName;

    // Update Tab UI
    document.querySelectorAll('.view-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.view === viewName);
    });

    // Hide all view containers
    document.getElementById('view-board').style.display = 'none';
    document.getElementById('view-list').style.display = 'none';
    document.getElementById('view-calendar').style.display = 'none';
    document.getElementById('view-progress').style.display = 'none';

    // Show active view
    if (viewName === 'board') {
        document.getElementById('view-board').style.display = 'flex';
        renderBoardView();
    } else if (viewName === 'list') {
        document.getElementById('view-list').style.display = 'block';
        renderListView();
    } else if (viewName === 'calendar') {
        document.getElementById('view-calendar').style.display = 'flex';
        renderCalendarView();
    } else if (viewName === 'progress') {
        document.getElementById('view-progress').style.display = 'flex';
        renderProgressView();
    }
}

function renderCurrentView() {
    switchView(state.currentView);
}

function renderListView() {
    const tbody = document.getElementById('list-table-body');
    const filtered = getFilteredTasks();

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;color:#94a3b8;">Không có công việc nào</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(task => {
        const badgeMap = {
            new: '<span class="list-col-badge badge-new">New Requests</span>',
            in_progress: '<span class="list-col-badge badge-progress">In Progress</span>',
            complete: '<span class="list-col-badge badge-complete">Complete</span>',
            reference: '<span class="list-col-badge badge-reference">Reference</span>'
        };

        return `
            <tr>
                <td>
                    <input type="checkbox" class="card-checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTaskComplete(${task.id}, event)">
                </td>
                <td style="font-weight: 600; cursor: pointer;" onclick="openEditTaskModal(${task.id})">
                    <span style="${task.completed ? 'text-decoration: line-through; color: #94a3b8;' : ''}">${escapeHtml(task.title)}</span>
                </td>
                <td>${badgeMap[task.column] || task.column}</td>
                <td style="color: #64748b; font-size: 0.82rem;">${escapeHtml(task.dueDate || '-')}</td>
                <td>
                    <span style="display:inline-flex;align-items:center;gap:0.35rem;font-size:0.82rem;font-weight:500;">
                        <span style="width:20px;height:20px;border-radius:50%;background:#3b82f6;color:white;display:inline-flex;align-items:center;justify-content:center;font-size:0.65rem;">${(task.assignee || 'U')[0]}</span>
                        ${escapeHtml(task.assignee)}
                    </span>
                </td>
                <td>${task.checklist ? `<span class="card-checklist-badge">${escapeHtml(task.checklist)}</span>` : '-'}</td>
                <td style="text-align: right;">
                    <button class="btn-col-action" onclick="openEditTaskModal(${task.id})" title="Sửa">✏️</button>
                    <button class="btn-col-action" onclick="openDeleteModal(${task.id})" title="Xóa" style="color:#ef4444;">🗑️</button>
                </td>
            </tr>
        `;
    }).join('');
}

function renderCalendarView() {
    const grid = document.getElementById('calendar-grid');
    const now = new Date();
    const monthName = now.toLocaleString('vi-VN', { month: 'long', year: 'numeric' });
    document.getElementById('calendar-month-title').textContent = monthName.toUpperCase();

    const daysOfWeek = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    let html = daysOfWeek.map(d => `<div class="calendar-day-header">${d}</div>`).join('');

    // Generate 28 dummy days for current month view
    for (let day = 1; day <= 28; day++) {
        // Find tasks for this day
        const dayTasks = state.tasks.filter(t => (t.id % 28) + 1 === day);
        const chipsHtml = dayTasks.map(t => `
            <div class="calendar-task-chip" onclick="openEditTaskModal(${t.id})" title="${escapeHtml(t.title)}">
                ${escapeHtml(t.title)}
            </div>
        `).join('');

        html += `
            <div class="calendar-day-cell">
                <span class="calendar-day-num">${day}</span>
                ${chipsHtml}
            </div>
        `;
    }

    grid.innerHTML = html;
}

function renderProgressView() {
    const total = state.tasks.length;
    const inProgress = state.tasks.filter(t => t.column === 'in_progress').length;
    const complete = state.tasks.filter(t => t.column === 'complete' || t.completed).length;
    const reference = state.tasks.filter(t => t.column === 'reference').length;

    document.getElementById('metric-total').textContent = total;
    document.getElementById('metric-in-progress').textContent = inProgress;
    document.getElementById('metric-done').textContent = complete;
    document.getElementById('metric-reference').textContent = reference;
}

function updateSummaryStats() {
    const total = state.tasks.length;
    const newCount = state.tasks.filter(t => t.column === 'new').length;
    const progressCount = state.tasks.filter(t => t.column === 'in_progress').length;
    const completeCount = state.tasks.filter(t => t.column === 'complete' || t.completed).length;

    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-new').textContent = newCount;
    document.getElementById('stat-progress').textContent = progressCount;
    document.getElementById('stat-complete').textContent = completeCount;

    const pct = total === 0 ? 0 : Math.round((completeCount / total) * 100);
    document.getElementById('stat-percent-text').textContent = `${pct}%`;
    document.getElementById('stat-percent-bar').style.width = `${pct}%`;
}

// ==========================================
// 9. Task Actions: Create, Edit, Toggle, Delete
// ==========================================

function openNewTaskModal(defaultColumn = 'new') {
    const modal = document.getElementById('modal-task');
    const form = document.getElementById('form-task');
    form.reset();

    document.getElementById('modal-task-title').textContent = "Thêm công việc mới";
    document.getElementById('task-id').value = '';
    document.getElementById('task-column-select').value = defaultColumn;

    // Reset color & cover selections
    setSelectedColor('blue');
    setSelectedCover('none');

    modal.showModal();
    document.getElementById('task-title-input').focus();
}

function openEditTaskModal(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    const modal = document.getElementById('modal-task');
    document.getElementById('modal-task-title').textContent = "Chỉnh sửa công việc";
    document.getElementById('task-id').value = task.id;
    document.getElementById('task-title-input').value = task.title;
    document.getElementById('task-column-select').value = task.column;
    document.getElementById('task-desc-input').value = task.description || '';
    document.getElementById('task-assignee-select').value = task.assignee || 'Alex';
    document.getElementById('task-duedate-input').value = task.dueDate || '';
    document.getElementById('task-checklist-input').value = task.checklist || '';

    setSelectedColor(task.tag || 'blue');
    setSelectedCover(task.cover || 'none');

    modal.showModal();
}

function quickAddPrompt(column) {
    openNewTaskModal(column);
}

async function handleSaveTask(e) {
    e.preventDefault();
    const idVal = document.getElementById('task-id').value;
    const isEdit = Boolean(idVal);

    const title = document.getElementById('task-title-input').value.trim();
    if (!title) {
        showToast("Vui lòng nhập tiêu đề công việc", "error");
        return;
    }

    const column = document.getElementById('task-column-select').value;
    const description = document.getElementById('task-desc-input').value.trim();
    const assignee = document.getElementById('task-assignee-select').value;
    const dueDate = document.getElementById('task-duedate-input').value.trim();
    const checklist = document.getElementById('task-checklist-input').value.trim();
    const tag = state.activeEditColor || 'blue';
    const cover = state.activeEditCover || 'none';
    const completed = column === 'complete';

    if (isEdit) {
        const taskId = parseInt(idVal, 10);
        const index = state.tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
            state.tasks[index] = {
                ...state.tasks[index],
                title,
                column,
                description,
                assignee,
                dueDate,
                checklist,
                tag,
                cover,
                completed
            };

            showToast("Đã cập nhật công việc thành công!", "success");

            if (state.token && state.isServerOnline) {
                try {
                    await apiRequest(`/todos/${taskId}`, {
                        method: 'PUT',
                        body: JSON.stringify(taskToTodoPayload(state.tasks[index]))
                    });
                } catch (err) {
                    console.error("Backend error:", err);
                }
            }
        }
    } else {
        // Create New Task
        const newId = Date.now();
        const newTask = {
            id: newId,
            title,
            column,
            description,
            assignee,
            dueDate,
            checklist,
            tag,
            cover,
            comments: 0,
            attachments: 0,
            completed
        };

        state.tasks.unshift(newTask);
        showToast("Đã tạo công việc mới!", "success");

        if (state.token && state.isServerOnline) {
            try {
                const created = await apiRequest('/todos', {
                    method: 'POST',
                    body: JSON.stringify(taskToTodoPayload(newTask))
                });
                newTask.id = created.id;
            } catch (err) {
                console.error("Backend error:", err);
            }
        }
    }

    saveTasksToStorage();
    document.getElementById('modal-task').close();
    renderCurrentView();
}

async function toggleTaskComplete(taskId, e) {
    if (e) e.stopPropagation();

    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    task.completed = !task.completed;
    if (task.completed) {
        task.column = 'complete';
        showToast(`Đã hoàn thành: "${task.title}"`, 'success', 2000);
    } else {
        task.column = 'in_progress';
        showToast(`Đã chuyển lại sang Đang làm`, 'info', 2000);
    }

    saveTasksToStorage();
    renderCurrentView();

    if (state.token && state.isServerOnline) {
        try {
            await apiRequest(`/todos/${taskId}`, {
                method: 'PUT',
                body: JSON.stringify(taskToTodoPayload(task))
            });
        } catch (err) {
            console.error("Backend error:", err);
        }
    }
}

function openDeleteModal(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    state.deleteTargetId = taskId;
    document.getElementById('delete-task-preview').textContent = `"${task.title}"`;
    document.getElementById('modal-delete').showModal();
}

async function handleConfirmDelete() {
    if (!state.deleteTargetId) return;

    const id = state.deleteTargetId;
    state.tasks = state.tasks.filter(t => t.id !== id);
    state.deleteTargetId = null;

    saveTasksToStorage();
    document.getElementById('modal-delete').close();
    renderCurrentView();
    showToast("Đã xóa công việc", "info");

    if (state.token && state.isServerOnline) {
        try {
            await apiRequest(`/todos/${id}`, { method: 'DELETE' });
        } catch (err) {
            console.error("Backend error:", err);
        }
    }
}

// Color and Cover selection UI helpers
function setSelectedColor(colorName) {
    state.activeEditColor = colorName;
    document.querySelectorAll('.color-radio-opt').forEach(opt => {
        opt.classList.toggle('selected', opt.dataset.color === colorName);
    });
}

function setSelectedCover(coverName) {
    state.activeEditCover = coverName;
    document.querySelectorAll('.cover-opt').forEach(opt => {
        opt.classList.toggle('selected', opt.dataset.cover === coverName);
    });
}

// ==========================================
// 10. Star, Search, Filter & Dedicated Auth Page
// ==========================================

function showAuthPage() {
    const authPage = document.getElementById('auth-page');
    const workspace = document.getElementById('workspace-view');
    if (authPage) authPage.style.display = 'flex';
    if (workspace) workspace.style.display = 'none';
}

function showWorkspaceView() {
    const authPage = document.getElementById('auth-page');
    const workspace = document.getElementById('workspace-view');
    if (authPage) authPage.style.display = 'none';
    if (workspace) workspace.style.display = 'flex';
    updateUserUI();
    renderCurrentView();
}

function toggleStarProject() {
    state.isStarred = !state.isStarred;
    localStorage.setItem('taskflow_starred', String(state.isStarred));
    const btn = document.getElementById('btn-star-project');
    if (btn) btn.classList.toggle('is-starred', state.isStarred);
    showToast(state.isStarred ? "Đã thêm vào dự án yêu thích ⭐" : "Đã bỏ khỏi mục yêu thích", "info");
}

function resetDemoData() {
    state.tasks = JSON.parse(JSON.stringify(DEFAULT_DEMO_TASKS));
    saveTasksToStorage();
    renderCurrentView();
    showToast("Đã khôi phục dữ liệu mẫu gốc từ hình ảnh!", "success");
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

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

        showWorkspaceView();
        showToast(`Chào mừng trở lại, ${res.user.username}! 👋`, 'success');
        syncWithBackendIfAvailable();
    } catch (err) {
        showToast(err.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản.", "error");
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('register-username').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;

    if (!username || !email || !password) {
        showToast("Vui lòng nhập đầy đủ thông tin đăng ký", "error");
        return;
    }

    if (password.length < 6) {
        showToast("Mật khẩu phải có tối thiểu 6 ký tự", "error");
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

        showWorkspaceView();
        showToast("Tạo tài khoản thành công! 🚀", "success");
        syncWithBackendIfAvailable();
    } catch (err) {
        showToast(err.message || "Đăng ký thất bại", "error");
    }
}

function logout() {
    state.token = null;
    state.user = null;
    localStorage.removeItem('taskmaster_token');
    showAuthPage();
    updateUserUI();
    showToast("Đã đăng xuất khỏi tài khoản", "info");
}

function updateUserUI() {
    const profileBar = document.getElementById('user-profile-bar');
    const gotoAuthBtn = document.getElementById('btn-header-goto-auth');
    const avatar = document.getElementById('header-user-avatar');
    const name = document.getElementById('header-user-name');

    if (state.user && state.token) {
        if (profileBar) profileBar.style.display = 'flex';
        if (gotoAuthBtn) gotoAuthBtn.style.display = 'none';
        if (avatar) avatar.textContent = (state.user.username || 'U')[0].toUpperCase();
        if (name) name.textContent = state.user.username;
    } else {
        if (profileBar) profileBar.style.display = 'none';
        if (gotoAuthBtn) gotoAuthBtn.style.display = 'inline-flex';
    }
}

async function verifyInitialSession() {
    if (!state.token) {
        showAuthPage();
        return;
    }

    try {
        const user = await apiRequest('/me');
        state.user = user;
        showWorkspaceView();
        syncWithBackendIfAvailable();
    } catch {
        state.token = null;
        localStorage.removeItem('taskmaster_token');
        showAuthPage();
    }
}

// ==========================================
// 11. Event Listeners Setup
// ==========================================

function setupEventListeners() {
    // View Tabs
    document.querySelectorAll('.view-tab').forEach(tab => {
        tab.addEventListener('click', () => switchView(tab.dataset.view));
    });

    // Top action buttons
    const btnNewTask = document.getElementById('btn-open-new-task-modal');
    if (btnNewTask) btnNewTask.addEventListener('click', () => openNewTaskModal('new'));

    const btnStar = document.getElementById('btn-star-project');
    if (btnStar) btnStar.addEventListener('click', toggleStarProject);

    const btnReset = document.getElementById('btn-reset-demo');
    if (btnReset) btnReset.addEventListener('click', resetDemoData);

    // Toggle hide completed
    const toggleCompletedBtn = document.getElementById('btn-toggle-completed');
    if (toggleCompletedBtn) {
        toggleCompletedBtn.addEventListener('click', () => {
            state.hideCompleted = !state.hideCompleted;
            toggleCompletedBtn.classList.toggle('is-filtered', state.hideCompleted);
            toggleCompletedBtn.querySelector('span').textContent = state.hideCompleted ? "Chưa xong" : "Tất cả";
            renderCurrentView();
        });
    }

    // Search input
    const searchInput = document.getElementById('input-search');
    const clearBtn = document.getElementById('btn-clear-search');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            state.searchQuery = e.target.value.trim();
            if (clearBtn) clearBtn.style.display = state.searchQuery ? 'block' : 'none';
            renderCurrentView();
        });

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                searchInput.value = '';
                state.searchQuery = '';
                clearBtn.style.display = 'none';
                renderCurrentView();
            });
        }

        // Shortcut: Ctrl+K or Cmd+K
        window.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                searchInput.focus();
                searchInput.select();
            }
        });
    }

    // Color Tags selector
    document.querySelectorAll('.color-radio-opt').forEach(opt => {
        opt.addEventListener('click', () => setSelectedColor(opt.dataset.color));
    });

    // Cover art options selector
    document.querySelectorAll('.cover-opt').forEach(opt => {
        opt.addEventListener('click', () => setSelectedCover(opt.dataset.cover));
    });

    // Task Modal Form
    const formTask = document.getElementById('form-task');
    if (formTask) formTask.addEventListener('submit', handleSaveTask);

    const btnCloseTask = document.getElementById('btn-close-task-modal');
    if (btnCloseTask) btnCloseTask.addEventListener('click', () => document.getElementById('modal-task').close());

    const btnCancelTask = document.getElementById('btn-cancel-task');
    if (btnCancelTask) btnCancelTask.addEventListener('click', () => document.getElementById('modal-task').close());

    // Delete Modal
    const btnConfirmDelete = document.getElementById('btn-confirm-delete');
    if (btnConfirmDelete) btnConfirmDelete.addEventListener('click', handleConfirmDelete);

    const btnCloseDelete = document.getElementById('btn-close-delete-modal');
    if (btnCloseDelete) btnCloseDelete.addEventListener('click', () => document.getElementById('modal-delete').close());

    const btnCancelDelete = document.getElementById('btn-cancel-delete');
    if (btnCancelDelete) btnCancelDelete.addEventListener('click', () => document.getElementById('modal-delete').close());

    // Dedicated Auth Page Controls
    const tabAuthLogin = document.getElementById('tab-auth-login');
    const tabAuthRegister = document.getElementById('tab-auth-register');
    const formAuthLogin = document.getElementById('form-auth-login');
    const formAuthRegister = document.getElementById('form-auth-register');
    const btnSwitchToLogin = document.getElementById('btn-switch-to-login');
    const btnExploreGuest = document.getElementById('btn-explore-as-guest');
    const btnHeaderGotoAuth = document.getElementById('btn-header-goto-auth');
    const btnHeaderLogout = document.getElementById('btn-header-logout');

    if (tabAuthLogin && tabAuthRegister) {
        tabAuthLogin.addEventListener('click', () => {
            tabAuthLogin.classList.add('active');
            tabAuthRegister.classList.remove('active');
            if (formAuthLogin) formAuthLogin.style.display = 'flex';
            if (formAuthRegister) formAuthRegister.style.display = 'none';
        });

        tabAuthRegister.addEventListener('click', () => {
            tabAuthRegister.classList.add('active');
            tabAuthLogin.classList.remove('active');
            if (formAuthRegister) formAuthRegister.style.display = 'flex';
            if (formAuthLogin) formAuthLogin.style.display = 'none';
        });
    }

    if (btnSwitchToLogin && tabAuthLogin) {
        btnSwitchToLogin.addEventListener('click', () => tabAuthLogin.click());
    }

    if (btnExploreGuest) {
        btnExploreGuest.addEventListener('click', () => {
            showWorkspaceView();
            showToast("Đang trải nghiệm ở chế độ Khách (Demo)", "info");
        });
    }

    if (btnHeaderGotoAuth) {
        btnHeaderGotoAuth.addEventListener('click', showAuthPage);
    }

    if (btnHeaderLogout) {
        btnHeaderLogout.addEventListener('click', logout);
    }

    if (formAuthLogin) formAuthLogin.addEventListener('submit', handleLogin);
    if (formAuthRegister) formAuthRegister.addEventListener('submit', handleRegister);

    // Backdrop click close for dialogs
    document.querySelectorAll('.app-dialog').forEach(modal => {
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

// Global exposure for inline HTML events
window.quickAddPrompt = quickAddPrompt;
window.openEditTaskModal = openEditTaskModal;
window.openDeleteModal = openDeleteModal;
window.toggleTaskComplete = toggleTaskComplete;

// ==========================================
// 12. Application Bootstrap
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    loadTasksFromStorage();
    setupEventListeners();
    initDragAndDropColumns();

    // Check favorite status
    if (state.isStarred) {
        const starBtn = document.getElementById('btn-star-project');
        if (starBtn) starBtn.classList.add('is-starred');
    }

    // Check initial user authentication session
    verifyInitialSession();
});
