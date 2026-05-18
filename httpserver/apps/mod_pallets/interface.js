export function mapElements() {
    this.el = {
        mainContainer: document.getElementById('main-app-container'),
        toggleSidebarBtn: document.getElementById('toggle-sidebar'),
        views: document.querySelectorAll('.view'),
        navLinks: document.querySelectorAll('.nav-links li'),
        opSelect: document.getElementById('op-select'),
        materialInput: document.getElementById('material-type'),
        startPalletBtn: document.getElementById('start-pallet-btn'),
        activePalletsList: document.getElementById('active-pallets-list'),
        historyList: document.getElementById('history-list'),
        liveWeightDisplay: document.getElementById('live-weight'),
        manualWeightInput: document.getElementById('manual-weight-input'),
        toggleScaleStatusBtn: document.getElementById('toggle-scale-status'),
        scaleStatusDot: document.getElementById('scale-status-dot'),
        scaleStatusText: document.getElementById('scale-status-text'),
        weightValueContainer: document.querySelector('.weight-value'),
        scaleLabel: document.getElementById('scale-label'),
        simulateWeightBtn: document.getElementById('simulate-weight'),
        registerBoxBtn: document.getElementById('register-box-btn'),
        closePalletBtn: document.getElementById('close-pallet-btn'),
        pauseProductionBtn: document.getElementById('pause-production-btn'),
        toast: document.getElementById('toast'),
        palletModal: document.getElementById('pallet-modal'),
        closeModalBtn: document.getElementById('close-modal'),
        editPalletBtn: document.getElementById('edit-pallet-btn'),
        printPalletBtn: document.getElementById('print-pallet-btn'),
        successModal: document.getElementById('success-modal'),
        confirmPrintBtn: document.getElementById('confirm-print-btn'),
        skipPrintBtn: document.getElementById('skip-print-btn'),
        confirmModal: document.getElementById('confirm-modal'),
        confirmActionBtn: document.getElementById('modal-confirm-action'),
        cancelActionBtn: document.getElementById('modal-cancel-action'),
        confirmMsg: document.getElementById('confirm-msg'),
        viewTitle: document.getElementById('view-title'),
        progressBar: document.querySelector('.progress-bar'),
        activePalletsCount: document.getElementById('active-pallets-count'),
        todayBoxesCount: document.getElementById('today-boxes-count'),
        totalWeightCount: document.getElementById('total-weight-count'),
        refreshPalletsBtn: document.getElementById('refresh-pallets-btn')
    };
}

export function bindEvents() {
    if (this.el.toggleSidebarBtn) {
        this.el.toggleSidebarBtn.addEventListener('click', () => this.toggleSidebar());
    }

    this.el.navLinks.forEach(link => {
        link.addEventListener('click', () => this.switchView(link.getAttribute('data-view')));
    });

    this.el.opSelect.addEventListener('change', (e) => {
        const index = e.target.value;
        if (index !== "") {
            const op = this.productionOrders[index];
            this.el.materialInput.value = `${op[4]} ${op[5]} divididas em ${op[6]} pallets`;

            // Save to app.appData.selectedOrder and add named property
            op.NextPallet = op[9];
            window.app.appData.selectedOrder = op;
        } else {
            this.el.materialInput.value = '';
            window.app.appData.selectedOrder = null;
        }
    });

    this.el.startPalletBtn.addEventListener('click', () => this.startNewPallet());
    this.el.toggleScaleStatusBtn.addEventListener('click', () => this.toggleScale());
    if (this.el.simulateWeightBtn) {
        this.el.simulateWeightBtn.addEventListener('click', () => this.simulateWeight());
    }
    this.el.registerBoxBtn.addEventListener('click', () => this.registerBox());
    this.el.closePalletBtn.addEventListener('click', () => this.closePallet());
    this.el.pauseProductionBtn.addEventListener('click', () => this.pauseProduction());

    if (this.el.refreshPalletsBtn) {
        this.el.refreshPalletsBtn.addEventListener('click', () => {
            const svgIcon = this.el.refreshPalletsBtn.querySelector('svg');
            if (svgIcon) {
                svgIcon.style.transform = 'rotate(360deg)';
                svgIcon.style.transition = 'transform 0.6s ease-in-out';
                setTimeout(() => {
                    svgIcon.style.transform = 'rotate(0deg)';
                    svgIcon.style.transition = 'none';
                }, 600);
            }
            this.fetchPendingPallets();
            this.showToast(this._t('Atualizando pallets...'));
        });
    }

    this.el.closeModalBtn.addEventListener('click', () => this.el.palletModal.style.display = 'none');
    this.el.editPalletBtn.addEventListener('click', () => this.reopenPallet());
    this.el.printPalletBtn.addEventListener('click', () => this.printCurrentViewedPallet());

    this.el.confirmPrintBtn.addEventListener('click', () => {
        if (this.lastClosedPallet) this.printPallet(this.lastClosedPallet);
        this.el.successModal.style.display = 'none';
        this.switchView('dashboard');
    });

    this.el.skipPrintBtn.addEventListener('click', () => {
        this.el.successModal.style.display = 'none';
        this.el.successModal.classList.remove('is-active');
        this.switchView('dashboard');
    });

    this.el.confirmActionBtn.addEventListener('click', () => {
        if (this.confirmCallback) this.confirmCallback();
        this.el.confirmModal.classList.remove('is-active');
    });

    this.el.cancelActionBtn.addEventListener('click', () => {
        this.el.confirmModal.classList.remove('is-active');
    });
}

export function toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    this.el.mainContainer.classList.toggle('sidebar-collapsed', this.isSidebarCollapsed);
    localStorage.setItem('sidebar_collapsed', this.isSidebarCollapsed);
}

export function switchView(viewId) {
    this.el.views.forEach(v => v.classList.remove('active'));
    this.el.navLinks.forEach(l => l.classList.remove('active'));

    const target = document.getElementById(viewId);
    if (target) target.classList.add('active');

    const nav = document.querySelector(`[data-view="${viewId}"]`);
    if (nav) nav.classList.add('active');

    this.currentView = viewId;
    if (viewId === 'dashboard') this.renderDashboard();
    if (viewId === 'history') this.renderHistory();
    if (viewId === 'process-view' && this.currentPallet) this.updateProcessView();

    this.updateStats();
    this.updateTitle(viewId);
}

export function updateTitle(viewId) {
    const titles = {
        'dashboard': `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg> ${this._t('Painel de Controle')}`,
        'new-pallet': `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"></path></svg> ${this._t('Novo Pallet')}`,
        'history': `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> ${this._t('Histórico de Produção')}`,
        'process-view': `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> ${this._t('Montagem de Pallets')}`
    };
    this.el.viewTitle.innerHTML = titles[viewId] || 'Portal';
}

export function populateOPDropdown() {
    if (!this.el.opSelect) return;

    const defaultValue = this.el.opSelect.value;
    this.el.opSelect.innerHTML = `<option value="">${this._t('Selecione a OP...')}</option>`;

    this.productionOrders.forEach((op, index) => {
        const option = document.createElement('option');
        const opDisplay = `${op[0]}/${op[1]}`;
        const itemCode = op[2];
        const itemName = op[3];
        const qty = op[4];
        const unit = op[5];

        option.value = index;
        option.textContent = `OP ${opDisplay} - [${itemCode} - ${itemName} - ${qty} ${unit}]`;
        this.el.opSelect.appendChild(option);
    });

    if (defaultValue) this.el.opSelect.value = defaultValue;
}

export function renderDashboard() {
    const active = this.sapActivePallets || this.pallets.filter(p => p.status === 'Em processo');

    // Ordenar de forma crescente (mais antigo primeiro, mais recente por último)
    const sortedActive = [...active].sort((a, b) => {
        const dateA = a.startTime ? new Date(a.startTime.toString().replace(' ', 'T')) : new Date(0);
        const dateB = b.startTime ? new Date(b.startTime.toString().replace(' ', 'T')) : new Date(0);
        return dateA - dateB;
    });

    this.el.activePalletsList.innerHTML = sortedActive.map(p => {
        const timeStr = p.displayTime || (p.startTime ? new Date(p.startTime).toLocaleTimeString() : '---');
        return `
            <div class="pallet-card" onclick="openActivePallet('${p.id}')">
                <div class="card-head"><span class="badge">Ativo</span><p>${timeStr}</p></div>
                <h3>${this._t('Pallet')} #${p.id}</h3><p class="op-text">${p.op}</p>
                <div class="pallet-stats">
                    <div><span>Total</span><strong>${(p.totalWeight || 0).toFixed(2)} kg</strong></div>
                </div>
                <button class="btn primary" style="width: 100%; margin-top: 10px;">${this._t('Continuar')}</button>
            </div>
        `;
    }).join('') || `<p style="color: var(--text-secondary)">${this._t('Vazio.')}</p>`;
}

export function renderHistory() {
    const closed = this.pallets.filter(p => p.status === 'Finalizado').reverse();
    this.el.historyList.innerHTML = closed.map(p => `
        <tr onclick="openPalletDetails('${p.id}')">
            <td class="sancay-td">#${p.id}</td>
            <td class="sancay-td">${new Date(p.endTime).toLocaleString()}</td>
            <td class="sancay-td">${p.op}</td>
            <td class="sancay-td">${p.boxes.length}</td>
            <td class="sancay-td">${p.totalWeight.toFixed(2)} kg</td>
            <td class="sancay-td"><span class="badge" style="background: var(--accent-success)">${this._t('Finalizado')}</span></td>
        </tr>
    `).join('') || `<tr><td colspan="6" style="text-align:center" class="sancay-td">${this._t('Sem registros.')}</td></tr>`;
}

export function openPalletDetails(id) {
    this.viewedPalletId = id;
    const p = this.pallets.find(p => p.id === id);
    if (!p) return;
    document.getElementById('modal-op').textContent = p.op;
    document.getElementById('modal-material').textContent = p.material;
    document.getElementById('modal-date').textContent = new Date(p.endTime || p.startTime).toLocaleString();
    document.getElementById('modal-boxes').textContent = p.boxes.length;
    document.getElementById('modal-weight').textContent = `${p.totalWeight.toFixed(2)} kg`;
    document.getElementById('modal-boxes-list').innerHTML = p.boxes.map((b, i) => `<tr><td class="sancay-td">${i + 1}</td><td class="sancay-td">${new Date(b.timestamp).toLocaleTimeString()}</td><td class="sancay-td"><strong class="sancay-value">${b.weight.toFixed(2)} kg</strong></td></tr>`).join('');
    this.el.palletModal.classList.add('is-active');
}

export function updateStats() {
    const active = this.sapActivePallets || this.pallets.filter(p => p.status === 'Em processo');

    // Sum boxes and weight from active pallets
    const totalBoxes = active.reduce((acc, p) => acc + (p.boxes ? p.boxes.length : 0), 0);
    const totalWeight = active.reduce((acc, p) => acc + (p.totalWeight || 0), 0);

    if (this.el.activePalletsCount) this.el.activePalletsCount.textContent = active.length;
    if (this.el.todayBoxesCount) this.el.todayBoxesCount.textContent = totalBoxes;
    if (this.el.totalWeightCount) this.el.totalWeightCount.textContent = totalWeight.toFixed(2);
}

export function showToast(msg) {
    this.el.toast.textContent = msg; this.el.toast.style.display = 'block';
    setTimeout(() => this.el.toast.style.display = 'none', 3000);
}

export function showConfirm(msg, onConfirm) {
    this.el.confirmMsg.textContent = msg;
    this.confirmCallback = onConfirm;
    this.el.confirmModal.classList.add('is-active');
}
