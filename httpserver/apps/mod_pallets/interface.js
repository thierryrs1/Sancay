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
        refreshPalletsBtn: document.getElementById('refresh-pallets-btn'),
        openFilterBtn: document.getElementById('open-filter-btn'),
        filterModal: document.getElementById('filter-modal'),
        closeFilterModalBtn: document.getElementById('close-filter-modal'),
        clearFilterBtn: document.getElementById('clear-filter-btn'),
        applyFilterBtn: document.getElementById('apply-filter-btn'),
        filterPalletId: document.getElementById('filter-pallet-id'),
        filterOp: document.getElementById('filter-op'),
        filterItem: document.getElementById('filter-item'),
        filterDateStart: document.getElementById('filter-date-start'),
        filterDateEnd: document.getElementById('filter-date-end'),
        activeFiltersIndicatorDashboard: document.getElementById('active-filters-indicator-dashboard'),
        activeFiltersIndicatorHistory: document.getElementById('active-filters-indicator-history'),
        clearAllFiltersBtns: document.querySelectorAll('.clear-all-filters-btn'),
        scaleAuthModal: document.getElementById('scale-auth-modal'),
        closeScaleAuthModalBtn: document.getElementById('close-scale-auth-modal'),
        cancelScaleAuthBtn: document.getElementById('cancel-scale-auth-btn'),
        confirmScaleAuthBtn: document.getElementById('confirm-scale-auth-btn'),
        scaleAuthUser: document.getElementById('scale-auth-user'),
        scaleAuthPass: document.getElementById('scale-auth-pass')
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
    this.el.toggleScaleStatusBtn.addEventListener('click', () => this.openScaleAuthModal());
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

    this.el.closeModalBtn.addEventListener('click', () => {
        this.el.palletModal.classList.remove('is-active');
        this.el.palletModal.classList.remove('active');
        this.el.palletModal.style.display = 'none';
    });

    // Filter Modal Event Handlers
    if (this.el.openFilterBtn) {
        this.el.openFilterBtn.addEventListener('click', () => {
            if (this.el.filterPalletId) this.el.filterPalletId.value = this.filters.palletId || '';
            if (this.el.filterOp) this.el.filterOp.value = this.filters.op || '';
            if (this.el.filterItem) this.el.filterItem.value = this.filters.item || '';
            if (this.el.filterDateStart) this.el.filterDateStart.value = this.filters.dateStart || '';
            if (this.el.filterDateEnd) this.el.filterDateEnd.value = this.filters.dateEnd || '';

            this.el.filterModal.classList.add('is-active');
            this.el.filterModal.classList.add('active');
        });
    }

    if (this.el.closeFilterModalBtn) {
        this.el.closeFilterModalBtn.addEventListener('click', () => {
            this.el.filterModal.classList.remove('is-active');
            this.el.filterModal.classList.remove('active');
        });
    }

    if (this.el.clearFilterBtn) {
        this.el.clearFilterBtn.addEventListener('click', () => {
            if (this.el.filterPalletId) this.el.filterPalletId.value = '';
            if (this.el.filterOp) this.el.filterOp.value = '';
            if (this.el.filterItem) this.el.filterItem.value = '';
            if (this.el.filterDateStart) this.el.filterDateStart.value = '';
            if (this.el.filterDateEnd) this.el.filterDateEnd.value = '';

            this.filters = { palletId: '', op: '', item: '', dateStart: '', dateEnd: '' };

            this.renderDashboard();
            this.renderHistory();

            this.el.filterModal.classList.remove('is-active');
            this.el.filterModal.classList.remove('active');
            this.showToast(this._t('Filtros limpos com sucesso.'));
        });
    }

    if (this.el.applyFilterBtn) {
        this.el.applyFilterBtn.addEventListener('click', () => {
            this.filters.palletId = this.el.filterPalletId ? this.el.filterPalletId.value : '';
            this.filters.op = this.el.filterOp ? this.el.filterOp.value : '';
            this.filters.item = this.el.filterItem ? this.el.filterItem.value : '';
            this.filters.dateStart = this.el.filterDateStart ? this.el.filterDateStart.value : '';
            this.filters.dateEnd = this.el.filterDateEnd ? this.el.filterDateEnd.value : '';

            this.renderDashboard();
            this.renderHistory();

            this.el.filterModal.classList.remove('is-active');
            this.el.filterModal.classList.remove('active');
            this.showToast(this._t('Filtros aplicados com sucesso.'));
        });
    }

    if (this.el.clearAllFiltersBtns) {
        this.el.clearAllFiltersBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.filters = { palletId: '', op: '', item: '', dateStart: '', dateEnd: '' };
                this.renderDashboard();
                this.renderHistory();
                this.showToast(this._t('Filtros limpos com sucesso.'));
            });
        });
    }

    this.el.editPalletBtn.addEventListener('click', () => this.reopenPallet());
    this.el.printPalletBtn.addEventListener('click', () => this.printCurrentViewedPallet());

    this.el.confirmPrintBtn.addEventListener('click', () => {
        if (this.lastClosedPallet) this.printPallet(this.lastClosedPallet);
        this.el.successModal.classList.remove('active');
        this.el.successModal.classList.remove('is-active');
        this.switchView('dashboard');
    });

    this.el.skipPrintBtn.addEventListener('click', () => {
        this.el.successModal.classList.remove('active');
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

    if (this.el.closeScaleAuthModalBtn) {
        this.el.closeScaleAuthModalBtn.addEventListener('click', () => this.closeScaleAuthModal());
    }
    if (this.el.cancelScaleAuthBtn) {
        this.el.cancelScaleAuthBtn.addEventListener('click', () => this.closeScaleAuthModal());
    }
    if (this.el.confirmScaleAuthBtn) {
        this.el.confirmScaleAuthBtn.addEventListener('click', () => this.submitScaleAuth());
    }
    if (this.el.scaleAuthPass) {
        this.el.scaleAuthPass.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.submitScaleAuth();
        });
    }
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

    // Exibe o botão de filtros apenas no Painel de Controle (dashboard)
    if (this.el.openFilterBtn) {
        if (viewId === 'dashboard') {
            this.el.openFilterBtn.style.setProperty('display', 'flex', 'important');
        } else {
            this.el.openFilterBtn.style.setProperty('display', 'none', 'important');
        }
    }
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
    let active = this.sapActivePallets || this.pallets.filter(p => p.status === 'Em processo');

    // Aplicar filtros de pesquisa se houver filtros ativos
    const activeFilters = hasActiveFilters(this.filters);
    if (activeFilters) {
        active = active.filter(p => checkFilters(p, this.filters));
        if (this.el.activeFiltersIndicatorDashboard) {
            this.el.activeFiltersIndicatorDashboard.style.display = 'flex';
        }
    } else {
        if (this.el.activeFiltersIndicatorDashboard) {
            this.el.activeFiltersIndicatorDashboard.style.display = 'none';
        }
    }

    // Ordenar de forma crescente (mais antigo primeiro, mais recente por último)
    const sortedActive = [...active].sort((a, b) => {
        const dateA = a.startTime ? new Date(a.startTime.toString().replace(' ', 'T')) : new Date(0);
        const dateB = b.startTime ? new Date(b.startTime.toString().replace(' ', 'T')) : new Date(0);
        return dateA - dateB;
    });

    this.el.activePalletsList.innerHTML = sortedActive.map(p => {
        // Determinar o status com base no peso total
        const totalWeight = p.totalWeight || 0;
        const statusLabel = totalWeight === 0 ? this._t('Novo') : this._t('Em andamento');
        const statusBadgeStyle = totalWeight === 0 
            ? 'background: rgba(14, 165, 233, 0.15) !important; color: var(--primary) !important; border: 1px solid rgba(14, 165, 233, 0.25) !important;' 
            : 'background: rgba(245, 158, 11, 0.15) !important; color: var(--warning) !important; border: 1px solid rgba(245, 158, 11, 0.25) !important;';

        // Buscar o código do item associado à OP do pallet (robusto contra espaços)
        const itemCode = p.itemCode || (this.productionOrders && this.productionOrders.find(o => {
            const opA = `${o[0]}/${o[1]}`.replace(/\s+/g, '');
            const opB = p.op.toString().replace(/\s+/g, '');
            return opA === opB;
        })?.[2]) || '';

        // Buscar a descrição do item (material) associada à OP do pallet (robusto contra espaços)
        const material = p.material || (this.productionOrders && this.productionOrders.find(o => {
            const opA = `${o[0]}/${o[1]}`.replace(/\s+/g, '');
            const opB = p.op.toString().replace(/\s+/g, '');
            return opA === opB;
        })?.[3]) || '';

        // Formatação completa e resiliente de Data e Hora com dois dígitos garantidos
        let fullDateTimeStr = '---';
        try {
            if (p.startTime) {
                const dateObj = new Date(p.startTime.toString().replace(' ', 'T'));
                if (!isNaN(dateObj)) {
                    const pad = (num) => num.toString().padStart(2, '0');
                    const day = pad(dateObj.getDate());
                    const month = pad(dateObj.getMonth() + 1);
                    const year = dateObj.getFullYear();
                    const hours = pad(dateObj.getHours());
                    const minutes = pad(dateObj.getMinutes());
                    fullDateTimeStr = `${day}/${month}/${year} ${hours}:${minutes}`;
                }
            }
        } catch (e) {
            console.warn('Erro ao formatar data:', e);
        }

        const prodDisplay = itemCode 
            ? `${itemCode} | ${material || 'Sem descrição'}` 
            : (material || 'Sem descrição');

        return `
            <div class="pallet-card" onclick="openActivePallet('${p.id}')">
                <!-- Top Header: ID e Status -->
                <div style="display: flex !important; justify-content: space-between !important; align-items: center !important; margin-bottom: 0.75rem !important; padding: 0 !important;">
                    <div style="display: flex !important; align-items: center !important; gap: 8px !important; margin: 0 !important; padding: 0 !important;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 !important; padding: 0 !important;"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                        <span style="font-size: 1.4rem !important; font-weight: 800 !important; color: var(--text-strong) !important; letter-spacing: -0.01em !important; margin: 0 !important; padding: 0 !important;">Pallet #${p.id}</span>
                    </div>
                    <span class="badge" style="${statusBadgeStyle}">${statusLabel}</span>
                </div>

                <!-- Criado em (Data e Hora) -->
                <div style="font-size: 0.85rem !important; color: var(--text-muted) !important; margin-bottom: 1.5rem !important; display: flex !important; align-items: center !important; gap: 6px !important; padding: 0 !important; margin-top: 0 !important;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted) !important; margin: 0 !important; padding: 0 !important;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <span style="margin: 0 !important; padding: 0 !important;">Criado em: <strong style="color: var(--text-normal) !important; font-family: 'JetBrains Mono', monospace !important; font-weight: 700 !important;">${fullDateTimeStr}</strong></span>
                </div>

                <!-- Seção Produto (Código | Descrição) -->
                <div style="background: #f8fafc !important; border: 1px solid var(--border-color) !important; padding: 1.25rem !important; border-radius: var(--radius-md) !important; margin-bottom: 1.5rem !important; display: block !important; margin-top: 0 !important;">
                    <p style="font-size: 0.75rem !important; text-transform: uppercase !important; font-weight: 700 !important; color: var(--text-muted) !important; letter-spacing: 0.05em !important; margin-bottom: 8px !important; padding: 0 !important; margin-top: 0 !important; display: block !important; line-height: 1 !important;">Produto</p>
                    <p style="font-size: 1rem !important; font-weight: 700 !important; color: var(--text-strong) !important; line-height: 1.4 !important; white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important; margin: 0 !important; padding: 0 !important; display: block !important;" title="${prodDisplay}">
                        ${prodDisplay}
                    </p>
                </div>

                <!-- Info Grid: OP e Peso Lado a Lado -->
                <div style="display: flex !important; justify-content: space-between !important; align-items: center !important; margin-bottom: 2rem !important; padding: 0 4px !important; margin-top: 0 !important;">
                    <div style="margin: 0 !important; padding: 0 !important; display: block !important; text-align: left !important;">
                        <span style="display: block !important; font-size: 0.75rem !important; text-transform: uppercase !important; font-weight: 700 !important; color: var(--text-muted) !important; letter-spacing: 0.05em !important; margin-bottom: 8px !important; padding: 0 !important; margin-top: 0 !important; line-height: 1 !important;">Ordem de Produção</span>
                        <span style="font-family: 'JetBrains Mono', monospace !important; font-size: 0.95rem !important; font-weight: 700 !important; color: var(--primary) !important; background: rgba(37, 99, 235, 0.06) !important; padding: 6px 12px !important; border-radius: 6px !important; border: 1px solid rgba(37, 99, 235, 0.12) !important; display: inline-block !important; margin: 0 !important;">
                            OP ${p.op}
                        </span>
                    </div>
                    <div style="text-align: right !important; margin: 0 !important; padding: 0 !important; display: block !important;">
                        <span style="display: block !important; font-size: 0.75rem !important; text-transform: uppercase !important; font-weight: 700 !important; color: var(--text-muted) !important; letter-spacing: 0.05em !important; margin-bottom: 6px !important; padding: 0 !important; margin-top: 0 !important; line-height: 1 !important;">Total Acumulado</span>
                        <strong style="font-size: 1.8rem !important; font-weight: 800 !important; color: var(--text-strong) !important; margin: 0 !important; padding: 0 !important; display: inline-block !important; line-height: 1 !important;">${totalWeight.toFixed(2)} <span style="font-size: 1.05rem !important; font-weight: 600 !important; color: var(--text-muted) !important;">kg</span></strong>
                    </div>
                </div>

                <button class="btn primary">
                    <span>${this._t('Continuar')}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </button>
            </div>
        `;
    }).join('') || `<p style="color: var(--text-secondary)">${this._t('Vazio.')}</p>`;
}

export function renderHistory() {
    let closed = this.sapClosedPallets || this.pallets.filter(p => p.status === 'Finalizado');

    // Aplicar filtros de pesquisa se houver filtros ativos
    const activeFilters = hasActiveFilters(this.filters);
    if (activeFilters) {
        closed = closed.filter(p => checkFilters(p, this.filters));
        if (this.el.activeFiltersIndicatorHistory) {
            this.el.activeFiltersIndicatorHistory.style.display = 'flex';
        }
    } else {
        if (this.el.activeFiltersIndicatorHistory) {
            this.el.activeFiltersIndicatorHistory.style.display = 'none';
        }
    }

    closed = closed.reverse();
    this.el.historyList.innerHTML = closed.map(p => {
        const dateStr = p.displayTime && p.displayTime !== '---' ? p.displayTime : '---';
        const opStr = p.op || '---';
        const boxesCount = p.boxes ? p.boxes.length : 0;
        const totalWeight = typeof p.totalWeight === 'number' ? p.totalWeight.toFixed(2) : '0.00';
        
        let statusBadgeStyle = 'background: rgba(21, 128, 61, 0.12) !important; color: #15803d !important; border: 1px solid rgba(21, 128, 61, 0.3) !important;';
        let statusLabel = 'FINALIZADO';

        if (p.status && p.status.toUpperCase() === 'REMOVIDO') {
            statusBadgeStyle = 'background: rgba(239, 68, 68, 0.1) !important; color: #ef4444 !important; border: 1px solid rgba(239, 68, 68, 0.2) !important;';
            statusLabel = 'REMOVIDO';
        }

        return `
            <tr onclick="openPalletDetails('${p.id}')">
                <td class="sancay-td">#${p.id}</td>
                <td class="sancay-td">${dateStr}</td>
                <td class="sancay-td">${opStr}</td>
                <td class="sancay-td">${boxesCount}</td>
                <td class="sancay-td">${totalWeight} kg</td>
                <td class="sancay-td"><span class="badge" style="${statusBadgeStyle} font-size: 0.7rem !important; padding: 4px 10px !important; border-radius: 12px !important; font-weight: 700 !important; text-transform: uppercase !important; letter-spacing: 0.05em !important;">${this._t(statusLabel)}</span></td>
            </tr>
        `;
    }).join('') || `<tr><td colspan="6" style="text-align:center" class="sancay-td">${this._t('Sem registros.')}</td></tr>`;
}

export function openPalletDetails(id) {
    this.viewedPalletId = id;
    const p = (this.sapClosedPallets && this.sapClosedPallets.find(x => x.id === id)) || this.pallets.find(p => p.id === id);
    if (!p) return;
    document.getElementById('modal-op').textContent = p.op;
    document.getElementById('modal-material').textContent = p.material;
    
    let detailDateStr = '---';
    try {
        const rawDate = p.endTime || p.startTime;
        if (rawDate) {
            const dateObj = new Date(rawDate.toString().replace(' ', 'T'));
            if (!isNaN(dateObj)) {
                const pad = (num) => num.toString().padStart(2, '0');
                detailDateStr = `${pad(dateObj.getDate())}/${pad(dateObj.getMonth() + 1)}/${dateObj.getFullYear()} ${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}`;
            }
        }
    } catch(e) {}
    document.getElementById('modal-date').textContent = detailDateStr;
    document.getElementById('modal-boxes').textContent = p.boxes.length;
    document.getElementById('modal-weight').textContent = `${p.totalWeight.toFixed(2)} kg`;
    document.getElementById('modal-boxes-list').innerHTML = p.boxes.map((b, i) => {
        const timeStr = b.timestamp ? new Date(b.timestamp).toLocaleTimeString() : '---';
        const weightStr = typeof b.weight === 'number' ? `${b.weight.toFixed(2)} kg` : '---';
        return `<tr><td class="sancay-td">${i + 1}</td><td class="sancay-td">${timeStr}</td><td class="sancay-td"><strong class="sancay-value">${weightStr}</strong></td></tr>`;
    }).join('');
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

function checkFilters(p, filters) {
    if (!filters) return true;
    
    // 1. Pallet ID filter
    if (filters.palletId && filters.palletId.trim() !== '') {
        const query = filters.palletId.trim().toLowerCase();
        if (!p.id || !p.id.toString().toLowerCase().includes(query)) {
            return false;
        }
    }
    
    // 2. OP filter
    if (filters.op && filters.op.trim() !== '') {
        const query = filters.op.trim().toLowerCase();
        if (!p.op || !p.op.toString().toLowerCase().includes(query)) {
            return false;
        }
    }
    
    // 3. Item filter
    if (filters.item && filters.item.trim() !== '') {
        const query = filters.item.trim().toLowerCase();
        const codeMatch = p.itemCode && p.itemCode.toString().toLowerCase().includes(query);
        const nameMatch = p.material && p.material.toString().toLowerCase().includes(query);
        if (!codeMatch && !nameMatch) {
            return false;
        }
    }
    
    // 4. Date range filter
    const rawDate = p.startTime || p.endTime;
    if (rawDate) {
        try {
            const dateObj = new Date(rawDate.toString().replace(' ', 'T'));
            if (!isNaN(dateObj)) {
                // Get timestamp for start of day
                const dateVal = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()).getTime();
                
                if (filters.dateStart) {
                    const startLimit = new Date(filters.dateStart);
                    const startVal = new Date(startLimit.getFullYear(), startLimit.getMonth(), startLimit.getDate()).getTime();
                    if (dateVal < startVal) return false;
                }
                
                if (filters.dateEnd) {
                    const endLimit = new Date(filters.dateEnd);
                    const endVal = new Date(endLimit.getFullYear(), endLimit.getMonth(), endLimit.getDate()).getTime();
                    if (dateVal > endVal) return false;
                }
            }
        } catch(e) {}
    }
    
    return true;
}

function hasActiveFilters(filters) {
    if (!filters) return false;
    return !!(
        (filters.palletId && filters.palletId.trim() !== '') ||
        (filters.op && filters.op.trim() !== '') ||
        (filters.item && filters.item.trim() !== '') ||
        filters.dateStart ||
        filters.dateEnd
    );
}
