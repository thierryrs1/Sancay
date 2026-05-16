// State Management
let pallets = [];
try {
    pallets = JSON.parse(localStorage.getItem('pallets')) || [];
} catch (e) {
    console.error('Erro ao carregar dados:', e);
    pallets = [];
}
let currentPallet = null;
let currentView = 'dashboard';
let viewedPalletId = null;

// Constants
const OP_MAPPING = {
    'OP-2024-001': 'Ração Frango Starter 25kg',
    'OP-2024-002': 'Ração Bovino Elite 40kg',
    'OP-2024-003': 'Ração Suíno Crescimento 30kg'
};

// DOM Elements
const views = document.querySelectorAll('.view');
const navLinks = document.querySelectorAll('.nav-links li');
const opSelect = document.getElementById('op-select');
const materialInput = document.getElementById('material-type');
const startPalletBtn = document.getElementById('start-pallet-btn');
const activePalletsList = document.getElementById('active-pallets-list');
const historyList = document.getElementById('history-list');
const liveWeightDisplay = document.getElementById('live-weight');
const manualWeightInput = document.getElementById('manual-weight-input');
const toggleScaleStatusBtn = document.getElementById('toggle-scale-status');
const scaleStatusDot = document.getElementById('scale-status-dot');
const scaleStatusText = document.getElementById('scale-status-text');
const weightValueContainer = document.querySelector('.weight-value');
const scaleLabel = document.getElementById('scale-label');
const simulateWeightBtn = document.getElementById('simulate-weight');

let isScaleConnected = true;
const registerBoxBtn = document.getElementById('register-box-btn');
const closePalletBtn = document.getElementById('close-pallet-btn');
const pauseProductionBtn = document.getElementById('pause-production-btn');
const toast = document.getElementById('toast');
const palletModal = document.getElementById('pallet-modal');
const closeModalBtn = document.getElementById('close-modal');
const editPalletBtn = document.getElementById('edit-pallet-btn');
const printPalletBtn = document.getElementById('print-pallet-btn');
const successModal = document.getElementById('success-modal');
const confirmPrintBtn = document.getElementById('confirm-print-btn');
const skipPrintBtn = document.getElementById('skip-print-btn');
const confirmModal = document.getElementById('confirm-modal');
const confirmActionBtn = document.getElementById('modal-confirm-action');
const cancelActionBtn = document.getElementById('modal-cancel-action');
const confirmMsg = document.getElementById('confirm-msg');

// Initialize
function init() {
    setupNavigation();
    setupForms();
    renderDashboard();
    renderHistory();
    updateStats();

    // Auto-update scale simulation
    setInterval(() => {
        if (isScaleConnected && currentView === 'process-view' && !window.scaleLocked) {
            const base = 24.5 + (Math.random() * 1.5);
            liveWeightDisplay.textContent = base.toFixed(2);
        }
    }, 2000);

    // Modal Close logic
    closeModalBtn.addEventListener('click', () => palletModal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target === palletModal) palletModal.style.display = 'none';
    });

    // Edit logic
    editPalletBtn.addEventListener('click', () => {
        if (!viewedPalletId) return;
        const pallet = pallets.find(p => p.id === viewedPalletId);
        if (pallet) {
            pallet.status = 'Em processo';
            saveData();
            palletModal.style.display = 'none';
            startProcess(pallet);
            showToast('Pallet reaberto para edição');
        }
    });

    // Print logic
    printPalletBtn.addEventListener('click', () => {
        if (!viewedPalletId) return;
        const pallet = pallets.find(p => p.id === viewedPalletId);
        if (pallet) printPallet(pallet);
    });

    // Print Choice logic (Success Modal)
    confirmPrintBtn.addEventListener('click', () => {
        if (window.lastClosedPallet) {
            printPallet(window.lastClosedPallet);
        }
        successModal.style.display = 'none';
        switchView('dashboard');
    });

    skipPrintBtn.addEventListener('click', () => {
        successModal.style.display = 'none';
        switchView('dashboard');
    });
}

// Navigation Logic
function setupNavigation() {
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const viewId = link.getAttribute('data-view');
            switchView(viewId);
        });
    });
}

function switchView(viewId) {
    views.forEach(v => v.classList.remove('active'));
    navLinks.forEach(l => l.classList.remove('active'));

    const targetView = document.getElementById(viewId);
    if (targetView) targetView.classList.add('active');

    const navLink = document.querySelector(`[data-view="${viewId}"]`);
    if (navLink) navLink.classList.add('active');

    currentView = viewId;

    // Always re-render when switching to these views to ensure data is fresh
    if (viewId === 'dashboard') renderDashboard();
    if (viewId === 'history') renderHistory();
    if (viewId === 'process-view' && currentPallet) updateProcessView();

    updateStats(); // Keep counts updated

    // Update Title
    const titleMap = {
        'dashboard': '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg> Painel de Controle',
        'new-pallet': '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"></path></svg> Novo Pallet',
        'history': '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Histórico de Produção',
        'process-view': '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> Montagem de Pallets'
    };
    document.getElementById('view-title').innerHTML = titleMap[viewId] || 'Portal';
}

// Form Logic
function setupForms() {
    opSelect.addEventListener('change', (e) => {
        const material = OP_MAPPING[e.target.value] || '';
        materialInput.value = material;
    });

    startPalletBtn.addEventListener('click', () => {
        const op = opSelect.value;
        if (!op) {
            showToast('Selecione uma OP para continuar');
            return;
        }

        const newPallet = {
            id: 'PL-' + Date.now().toString().slice(-6),
            op: op,
            material: materialInput.value,
            status: 'Em processo',
            startTime: new Date().toISOString(),
            boxes: [],
            totalWeight: 0
        };

        pallets.push(newPallet);
        saveData();
        startProcess(newPallet);
    });
}

function startProcess(pallet) {
    currentPallet = pallet;
    updateProcessView();
    switchView('process-view');
}

function updateProcessView() {
    if (!currentPallet) return;

    document.getElementById('current-pallet-id').textContent = `Pallet #${currentPallet.id}`;
    document.getElementById('current-pallet-op').textContent = `OP: ${currentPallet.op} | ${currentPallet.material}`;
    document.getElementById('current-box-count').textContent = currentPallet.boxes.length;
    document.getElementById('current-total-weight').textContent = `${currentPallet.totalWeight.toFixed(2)} kg`;

    // Update list
    const boxList = document.getElementById('current-boxes-list');
    boxList.innerHTML = currentPallet.boxes.slice(-5).reverse().map((box, index) => {
        const actualIndex = currentPallet.boxes.length - 1 - index;
        return `
        <li>
            <span>Caixa #${actualIndex + 1}</span>
            <div style="display: flex; align-items: center; gap: 1rem;">
                <span class="box-weight">${box.weight.toFixed(2)} kg</span>
                <button class="delete-box-btn" onclick="deleteBox(${actualIndex})" title="Excluir Caixa">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
            </div>
        </li>
        `;
    }).join('');

    // Update progress (target 40 boxes per pallet for demo)
    const progress = (currentPallet.boxes.length / 40) * 100;
    document.querySelector('.progress-bar').style.width = `${Math.min(progress, 100)}%`;
}

// Weighing Logic
toggleScaleStatusBtn.addEventListener('click', () => {
    isScaleConnected = !isScaleConnected;
    if (isScaleConnected) {
        scaleStatusDot.className = 'status-dot online';
        scaleStatusText.textContent = 'Balança Conectada';
        liveWeightDisplay.style.display = 'block';
        manualWeightInput.style.display = 'none';
        simulateWeightBtn.style.display = 'inline-block';
        scaleLabel.textContent = 'PESO ATUAL';
        weightValueContainer.classList.remove('disconnected');
    } else {
        scaleStatusDot.className = 'status-dot offline';
        scaleStatusText.textContent = 'Balança Desconectada';
        liveWeightDisplay.style.display = 'none';
        manualWeightInput.style.display = 'inline-block';
        simulateWeightBtn.style.display = 'none';
        scaleLabel.textContent = 'DIGITAR PESO (MANUAL)';
        weightValueContainer.classList.add('disconnected');
        manualWeightInput.focus();
    }
});

simulateWeightBtn.addEventListener('click', () => {
    window.scaleLocked = true;
    const weights = [24.9, 25.0, 25.1, 24.8, 25.2];
    const weight = weights[Math.floor(Math.random() * weights.length)];
    liveWeightDisplay.textContent = weight.toFixed(2);
    showToast('Peso estabilizado');

    setTimeout(() => { window.scaleLocked = false; }, 3000);
});

registerBoxBtn.addEventListener('click', () => {
    if (!currentPallet) return;

    let weight = 0;
    if (isScaleConnected) {
        weight = parseFloat(liveWeightDisplay.textContent);
    } else {
        weight = parseFloat(manualWeightInput.value);
        if (isNaN(weight) || weight <= 0) {
            showToast('Por favor, digite um peso válido!');
            return;
        }
        manualWeightInput.value = ''; // clear input after registration
        manualWeightInput.focus();
    }

    currentPallet.boxes.push({
        weight: weight,
        timestamp: new Date().toISOString()
    });

    currentPallet.totalWeight = currentPallet.boxes.reduce((sum, b) => sum + b.weight, 0);

    saveData();
    updateProcessView();
    updateStats(); // Update the top bar immediately
    showToast(`Caixa registrada: ${weight}kg`);
});

closePalletBtn.addEventListener('click', () => {
    if (!currentPallet) return;

    showConfirm(`Deseja encerrar o Pallet #${currentPallet.id} com ${currentPallet.boxes.length} caixas?`, () => {
        const palletToFinish = { ...currentPallet };
        currentPallet.status = 'Finalizado';
        currentPallet.endTime = new Date().toISOString();
        saveData();

        window.lastClosedPallet = palletToFinish;

        currentPallet = null;
        renderDashboard();
        renderHistory();
        updateStats();

        // Show the beautiful success modal
        document.getElementById('success-pallet-id').textContent = palletToFinish.id;
        successModal.style.display = 'block';
    });
});

pauseProductionBtn.addEventListener('click', () => {
    if (!currentPallet) return;

    saveData();
    currentPallet = null;
    switchView('dashboard');
    showToast('Produção pausada. Pallet salvo no painel.');
});

// Data Handling
function saveData() {
    localStorage.setItem('pallets', JSON.stringify(pallets));
}

function renderDashboard() {
    const activePallets = pallets.filter(p => p.status === 'Em processo');
    activePalletsList.innerHTML = activePallets.map(p => `
        <div class="pallet-card" onclick="openActivePallet('${p.id}')">
            <div class="card-head">
                <span class="badge">Ativo</span>
                <p>${new Date(p.startTime).toLocaleTimeString()}</p>
            </div>
            <h3>Pallet #${p.id}</h3>
            <p class="op-text">${p.op}</p>
            <div class="pallet-stats" style="margin-bottom: 1.5rem;">
                <div>
                    <span>Caixas</span>
                    <strong>${p.boxes.length}</strong>
                </div>
                <div>
                    <span>Total</span>
                    <strong>${p.totalWeight.toFixed(1)} kg</strong>
                </div>
            </div>
            <button class="btn primary" style="width: 100%;" onclick="event.stopPropagation(); openActivePallet('${p.id}')">Continuar Produção</button>
        </div>
    `).join('') || '<p style="color: var(--text-secondary)">Nenhum pallet em processo.</p>';
}

function renderHistory() {
    const closedPallets = pallets.filter(p => p.status === 'Finalizado').reverse();
    historyList.innerHTML = closedPallets.map(p => `
        <tr onclick="openPalletDetails('${p.id}')">
            <td>#${p.id}</td>
            <td>${new Date(p.endTime).toLocaleString()}</td>
            <td>${p.op}</td>
            <td>${p.boxes.length}</td>
            <td>${p.totalWeight.toFixed(2)} kg</td>
            <td><span class="badge" style="background: var(--accent-success)">Finalizado</span></td>
        </tr>
    `).join('') || '<tr><td colspan="6" style="text-align:center">Nenhum registro encontrado.</td></tr>';
}

function openPalletDetails(id) {
    viewedPalletId = id;
    const pallet = pallets.find(p => p.id === id);
    if (!pallet) return;

    document.getElementById('modal-op').textContent = pallet.op;
    document.getElementById('modal-material').textContent = pallet.material;
    document.getElementById('modal-date').textContent = new Date(pallet.endTime || pallet.startTime).toLocaleString();
    document.getElementById('modal-boxes').textContent = pallet.boxes.length;
    document.getElementById('modal-weight').textContent = `${pallet.totalWeight.toFixed(2)} kg`;

    const list = document.getElementById('modal-boxes-list');
    list.innerHTML = pallet.boxes.map((box, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>${new Date(box.timestamp).toLocaleTimeString()}</td>
            <td><strong>${box.weight.toFixed(2)} kg</strong></td>
        </tr>
    `).join('') || '<tr><td colspan="3" style="text-align:center">Nenhuma caixa registrada.</td></tr>';

    palletModal.style.display = 'block';
}

function updateStats() {
    const activeCount = pallets.filter(p => p.status === 'Em processo').length;
    const totalBoxes = pallets.reduce((sum, p) => sum + p.boxes.length, 0);
    const totalWeight = pallets.reduce((sum, p) => sum + p.totalWeight, 0);

    document.getElementById('active-pallets-count').textContent = activeCount;
    document.getElementById('today-boxes-count').textContent = totalBoxes;
    document.getElementById('total-weight-count').textContent = totalWeight.toFixed(2);
}

function openActivePallet(id) {
    const pallet = pallets.find(p => p.id === id);
    if (pallet) startProcess(pallet);
}

function printPallet(pallet) {
    if (!pallet) return;

    // Populate Print Template
    document.getElementById('print-id').textContent = pallet.id;
    document.getElementById('print-op').textContent = pallet.op;
    document.getElementById('print-material').textContent = pallet.material;
    document.getElementById('print-date').textContent = new Date(pallet.endTime || pallet.startTime).toLocaleString();
    document.getElementById('print-boxes').textContent = pallet.boxes.length;
    document.getElementById('print-weight').textContent = `${pallet.totalWeight.toFixed(2)} kg`;

    const printList = document.getElementById('print-items-list');
    printList.innerHTML = pallet.boxes.map((box, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>${new Date(box.timestamp).toLocaleTimeString()}</td>
            <td>${box.weight.toFixed(2)}</td>
        </tr>
    `).join('');

    // Trigger Print
    window.print();
}

// Confirmation Helper
let confirmCallback = null;
function showConfirm(msg, onConfirm) {
    confirmMsg.textContent = msg;
    confirmCallback = onConfirm;
    confirmModal.style.display = 'block';
}

confirmActionBtn.addEventListener('click', () => {
    if (confirmCallback) confirmCallback();
    confirmModal.style.display = 'none';
    confirmCallback = null;
});

cancelActionBtn.addEventListener('click', () => {
    confirmModal.style.display = 'none';
    confirmCallback = null;
});

// Utils
window.deleteBox = function (index) {
    if (!currentPallet || !currentPallet.boxes[index]) return;

    showConfirm(`Deseja excluir a Caixa #${index + 1}?`, () => {
        currentPallet.boxes.splice(index, 1);
        currentPallet.totalWeight = currentPallet.boxes.reduce((sum, b) => sum + b.weight, 0);
        saveData();
        updateProcessView();
        updateStats();
        showToast('Caixa excluída com sucesso.');
    });
};

function showToast(msg) {
    toast.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

init();
