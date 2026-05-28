export function formatBoxDateTime(b) {
    const formatD = (dateStr) => {
        if (!dateStr) return '';
        let datePart = dateStr.toString().trim();
        if (datePart.includes('T')) {
            datePart = datePart.split('T')[0];
        } else if (datePart.includes(' ')) {
            datePart = datePart.split(' ')[0];
        }
        if (datePart.includes('-')) {
            const parts = datePart.split('-');
            if (parts.length === 3) {
                return `${parts[2]}/${parts[1]}/${parts[0]}`;
            }
        }
        return datePart;
    };

    const formatT = (tVal) => {
        if (tVal === undefined || tVal === null || tVal === '') return '';
        const tStr = tVal.toString().trim();

        // Se já vier com dois pontos (ex: "07:05" ou "07:05:00" do Service Layer)
        if (tStr.includes(':')) {
            const parts = tStr.split(':');
            const h = parts[0].padStart(2, '0');
            const m = parts[1].padStart(2, '0');
            return `${h}:${m}`;
        }

        // Se for inteiro (ex: 705 ou 1312)
        let val = parseInt(tStr);
        if (isNaN(val)) return '';
        let hours = Math.floor(val / 100);
        let minutes = val % 100;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    const dateVal = b.timestamp || b.time;
    if (!dateVal) return '---';

    if (b.createTime !== undefined && b.createTime !== null && b.createTime !== '') {
        const dStr = formatD(dateVal);
        const tStr = formatT(b.createTime);
        return tStr ? `${dStr} ${tStr}` : dStr;
    }

    const dateStr = dateVal.toString();
    if (dateStr.includes('T') && !dateStr.includes('T00:00:00')) {
        const dateObj = new Date(dateStr);
        if (!isNaN(dateObj)) {
            const day = dateObj.getDate().toString().padStart(2, '0');
            const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
            const year = dateObj.getFullYear();
            const hours = dateObj.getHours().toString().padStart(2, '0');
            const minutes = dateObj.getMinutes().toString().padStart(2, '0');
            return `${day}/${month}/${year} ${hours}:${minutes}`;
        }
    }

    return formatD(dateVal);
}

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
        tareBtn: document.getElementById('tare-btn'),
        tareInfo: document.getElementById('tare-info'),
        tareValue: document.getElementById('tare-value'),
        clearTareBtn: document.getElementById('clear-tare-btn'),
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
        filterPalletId: document.getElementById('filter-pallet-id-container'),
        filterOp: document.getElementById('filter-op-container'),
        filterItem: document.getElementById('filter-item-container'),
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
        scaleAuthPass: document.getElementById('scale-auth-pass'),
        settingScale: document.getElementById('setting-scale'),
        settingPrinter: document.getElementById('setting-printer'),
        settingLabel: document.getElementById('setting-label'),
        settingLanguage: document.getElementById('setting-language'),
        saveSettingsBtn: document.getElementById('save-settings-btn')
    };
}

export function bindEvents() {
    // Fechar dropdowns ao clicar fora
    document.addEventListener('click', (e) => {
        // Dropdowns do Excel
        document.querySelectorAll('.excel-filter-dropdown').forEach(el => {
            el.classList.add('is-hidden');
        });

        // Dropdowns nativos de Filtros
        document.querySelectorAll('details.custom-dropdown[open]').forEach(details => {
            if (!details.contains(e.target)) {
                details.removeAttribute('open');
            }
        });
    });

    if (this.el.toggleSidebarBtn) {
        this.el.toggleSidebarBtn.addEventListener('click', () => this.toggleSidebar());
    }

    const toggleLayoutBtn = document.getElementById('toggle-layout-btn');
    if (toggleLayoutBtn) {
        toggleLayoutBtn.addEventListener('click', () => {
            const grid = document.getElementById('active-pallets-list');
            const iconGrid = document.getElementById('layout-icon-grid');
            const iconCarousel = document.getElementById('layout-icon-carousel');
            if (grid && grid.classList.contains('carousel-view')) {
                grid.classList.remove('carousel-view');
                iconGrid.style.setProperty('display', 'none', 'important');
                iconCarousel.style.setProperty('display', 'block', 'important');
                localStorage.setItem('sancay_dashboard_layout', 'grid');
            } else if (grid) {
                grid.classList.add('carousel-view');
                iconCarousel.style.setProperty('display', 'none', 'important');
                iconGrid.style.setProperty('display', 'block', 'important');
                localStorage.setItem('sancay_dashboard_layout', 'carousel');
            }
        });

        // Initialize from saved preference
        if (localStorage.getItem('sancay_dashboard_layout') === 'carousel') {
            const grid = document.getElementById('active-pallets-list');
            const iconGrid = document.getElementById('layout-icon-grid');
            const iconCarousel = document.getElementById('layout-icon-carousel');
            if (grid && iconGrid && iconCarousel) {
                grid.classList.add('carousel-view');
                iconCarousel.style.setProperty('display', 'none', 'important');
                iconGrid.style.setProperty('display', 'block', 'important');
            }
        }
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
    this.el.toggleScaleStatusBtn.addEventListener('click', () => {
        if (this.scaleManualMode) {
            this.toggleScale();
        } else {
            this.openScaleAuthModal();
        }
    });
    if (this.el.simulateWeightBtn) {
        this.el.simulateWeightBtn.addEventListener('click', () => this.simulateWeight());
    }
    this.el.registerBoxBtn.addEventListener('click', () => this.registerBox());

    if (this.el.tareBtn) {
        this.el.tareBtn.addEventListener('click', () => {
            if (this.scaleManualMode) {
                this.showToast(this._t('Tara indisponível no modo manual.'));
                return;
            }
            if (this.currentGrossWeight > 0) {
                this.scaleTare = this.currentGrossWeight;
                this.el.tareInfo.style.display = 'block';
                this.el.tareValue.textContent = this.scaleTare.toFixed(3);
                this.showToast(this._t('Tara registrada!'));

                // Atualiza a tela imediatamente descontando a tara
                const netWeight = Math.max(0, this.currentGrossWeight - this.scaleTare);
                if (this.el.liveWeightDisplay) {
                    this.el.liveWeightDisplay.textContent = netWeight.toFixed(3);
                }
            } else {
                this.showToast(this._t('Peso atual está zerado.'));
            }
        });
    }

    if (this.el.clearTareBtn) {
        this.el.clearTareBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.scaleTare = 0;
            this.el.tareInfo.style.display = 'none';
            this.showToast(this._t('Tara removida!'));

            // Retorna a exibir o peso bruto
            if (this.el.liveWeightDisplay) {
                this.el.liveWeightDisplay.textContent = this.currentGrossWeight ? this.currentGrossWeight.toFixed(3) : '0.000';
            }
        });
    }

    this.el.closePalletBtn.addEventListener('click', () => this.closePallet());
    this.el.pauseProductionBtn.addEventListener('click', () => this.pauseProduction());

    if (this.el.saveSettingsBtn) {
        this.el.saveSettingsBtn.addEventListener('click', () => {
            if (typeof this.saveUserSettings === 'function') {
                this.saveUserSettings();
            }
        });
    }

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
            const allPallets = (window.app && window.app.appData && window.app.appData.pendingPallets) ? window.app.appData.pendingPallets : (this.sapActivePallets || []);

            const updateSummary = (containerEl, defaultText) => {
                if (!containerEl) return;
                const summarySpan = containerEl.parentElement.querySelector('.selected-text');
                if (!summarySpan) return;
                const checked = Array.from(containerEl.querySelectorAll('input:checked'));
                summarySpan.textContent = checked.length > 0 ? `${checked.length} selecionado(s)` : defaultText;
            };

            const bindCheckboxEvents = (containerEl, defaultText) => {
                if (!containerEl) return;
                containerEl.querySelectorAll('input').forEach(cb => {
                    cb.addEventListener('change', () => updateSummary(containerEl, defaultText));
                });
                updateSummary(containerEl, defaultText);
            };

            if (this.el.filterPalletId) {
                const uniqueIds = [...new Set(allPallets.map(p => p.id).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b)));
                this.el.filterPalletId.innerHTML = uniqueIds.map(id => {
                    const isChecked = Array.isArray(this.filters.palletId) && this.filters.palletId.includes(id.toString()) ? 'checked' : '';
                    return `<label style="display:flex; align-items:center; gap:8px; padding:6px; cursor:pointer;"><input type="checkbox" value="${id}" ${isChecked}> ${id}</label>`;
                }).join('');
                bindCheckboxEvents(this.el.filterPalletId, this._t('Todos os Pallets'));
            }

            if (this.el.filterOp) {
                const uniqueOps = [...new Set(allPallets.map(p => p.op).filter(Boolean))].sort((a, b) => {
                    const partsA = String(a).split('/');
                    const partsB = String(b).split('/');
                    const numA1 = parseInt(partsA[0]) || 0;
                    const numA2 = parseInt(partsA[1]) || 0;
                    const numB1 = parseInt(partsB[0]) || 0;
                    const numB2 = parseInt(partsB[1]) || 0;
                    if (numA1 !== numB1) return numA1 - numB1;
                    return numA2 - numB2;
                });
                this.el.filterOp.innerHTML = uniqueOps.map(op => {
                    const isChecked = Array.isArray(this.filters.op) && this.filters.op.includes(op.toString()) ? 'checked' : '';
                    return `<label style="display:flex; align-items:center; gap:8px; padding:6px; cursor:pointer;"><input type="checkbox" value="${op}" ${isChecked}> ${op}</label>`;
                }).join('');
                bindCheckboxEvents(this.el.filterOp, this._t('Todas as OPs'));
            }

            if (this.el.filterItem) {
                const uniqueItemsMap = new Map();
                allPallets.forEach(p => {
                    const iCode = p.itemCode || '';
                    const iMat = p.material || '';
                    if (iCode) {
                        uniqueItemsMap.set(iCode, iMat);
                    }
                });

                let itemsHtml = '';
                Array.from(uniqueItemsMap.keys()).sort((a, b) => {
                    const nameA = uniqueItemsMap.get(a) || '';
                    const nameB = uniqueItemsMap.get(b) || '';
                    return String(nameA).localeCompare(String(nameB));
                }).forEach(code => {
                    const desc = uniqueItemsMap.get(code);
                    const isChecked = Array.isArray(this.filters.item) && this.filters.item.includes(code.toString()) ? 'checked' : '';
                    itemsHtml += `<label style="display:flex; align-items:center; gap:8px; padding:6px; cursor:pointer;"><input type="checkbox" value="${code}" ${isChecked}> ${code} | ${desc}</label>`;
                });
                this.el.filterItem.innerHTML = itemsHtml;
                bindCheckboxEvents(this.el.filterItem, this._t('Todos os Itens'));
            }

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
            if (this.el.filterPalletId) {
                this.el.filterPalletId.querySelectorAll('input').forEach(cb => cb.checked = false);
                const s = this.el.filterPalletId.parentElement.querySelector('.selected-text');
                if (s) s.textContent = this._t('Todos os Pallets');
            }
            if (this.el.filterOp) {
                this.el.filterOp.querySelectorAll('input').forEach(cb => cb.checked = false);
                const s = this.el.filterOp.parentElement.querySelector('.selected-text');
                if (s) s.textContent = this._t('Todas as OPs');
            }
            if (this.el.filterItem) {
                this.el.filterItem.querySelectorAll('input').forEach(cb => cb.checked = false);
                const s = this.el.filterItem.parentElement.querySelector('.selected-text');
                if (s) s.textContent = this._t('Todos os Itens');
            }
            if (this.el.filterDateStart) this.el.filterDateStart.value = '';
            if (this.el.filterDateEnd) this.el.filterDateEnd.value = '';

            this.filters = { palletId: [], op: [], item: [], dateStart: '', dateEnd: '' };

            this.renderDashboard();
            this.renderHistory();

            this.el.filterModal.classList.remove('is-active');
            this.el.filterModal.classList.remove('active');
            this.showToast(this._t('Filtros limpos com sucesso.'));
        });
    }

    if (this.el.applyFilterBtn) {
        this.el.applyFilterBtn.addEventListener('click', () => {
            this.filters.palletId = this.el.filterPalletId ? Array.from(this.el.filterPalletId.querySelectorAll('input:checked')).map(cb => cb.value) : [];
            this.filters.op = this.el.filterOp ? Array.from(this.el.filterOp.querySelectorAll('input:checked')).map(cb => cb.value) : [];
            this.filters.item = this.el.filterItem ? Array.from(this.el.filterItem.querySelectorAll('input:checked')).map(cb => cb.value) : [];
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
                this.filters = { palletId: [], op: [], item: [], dateStart: '', dateEnd: '' };
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
    if (viewId === 'process-view') {
        if (this.currentPallet) this.updateProcessView();
        // Chama a balança na hora sem esperar o intervalo de 5s do background
        if (typeof this.readScaleWeight === 'function') {
            this.readScaleWeight();
        }
    }

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
    if (this.sapActivePallets === undefined) {
        this.el.activePalletsList.innerHTML = `
            <div class="skeleton-card" style="grid-column: 1 / -1; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 3rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-color); min-height: 250px;">
                <div class="spinner" style="margin-bottom: 1rem;">
                    <div class="bounce1"></div>
                    <div class="bounce2"></div>
                    <div></div>
                </div>
                <p style="color: var(--text-muted); font-size: 0.95rem; font-weight: 600;">${this._t('Carregando pallets ativos...')}</p>
            </div>
        `;
        return;
    }
    let active = this.sapActivePallets;

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

        // Usar diretamente o código e a descrição vindos da API
        const itemCode = p.itemCode || '';
        const material = p.material || '';

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
            ? `${itemCode} | ${material || 'SEM DESCRIÇÃO'}`
            : (material || 'SEM DESCRIÇÃO');

        return `
            <div class="pallet-card" onclick="openActivePallet('${p.id}')" style="display: flex; flex-direction: column; gap: 16px; padding: 24px !important; background: #ffffff !important; border-radius: 16px !important; box-shadow: 0 4px 20px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02) !important; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; border: 1px solid #f1f5f9 !important; height: 100% !important; min-height: 100% !important;">

                <!-- Top Section -->
                <div style="display: flex !important; align-items: flex-start !important; gap: 16px !important; margin: 0 !important; padding: 0 16px !important; height: 72px !important; box-sizing: border-box !important;">
                    
                    <!-- Icon Container -->
                    <div style="width: 40px !important; height: 40px !important; border-radius: 10px !important; background: #eff6ff !important; border: 1px solid #bfdbfe !important; display: flex !important; align-items: center !important; justify-content: center !important; flex-shrink: 0 !important;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="4" y="10" width="7" height="6" />
                            <rect x="13" y="10" width="7" height="6" />
                            <rect x="8.5" y="4" width="7" height="6" />
                            <path d="M3 18h18 M5 18v2 M12 18v2 M19 18v2" />
                        </svg>
                    </div>

                    <!-- Info -->
                    <div style="flex: 1 !important; margin: 0 !important; padding: 0 !important; min-width: 0 !important; display: flex !important; flex-direction: column !important; justify-content: flex-start !important; gap: 4px !important;">
                        <!-- Row 1: ID and Badge -->
                        <div style="display: flex !important; justify-content: space-between !important; align-items: flex-start !important; gap: 8px !important; margin: 0 !important; padding: 0 !important;">
                            <div style="font-size: 1.1rem !important; font-weight: 800 !important; color: #0f172a !important; line-height: 1.1 !important; white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important;">${p.id}</div>
                            <div style="flex-shrink: 0 !important; margin: 0 !important; padding: 0 !important;">
                                <span style="${statusBadgeStyle} padding: 4px 8px !important; border-radius: 20px !important; font-size: 0.65rem !important; font-weight: 700 !important; letter-spacing: 0.05em !important; display: inline-flex !important; align-items: center !important; gap: 4px !important; text-transform: uppercase !important; box-shadow: none !important;">
                                    <span style="width: 6px !important; height: 6px !important; border-radius: 50% !important; background: currentColor !important;"></span>
                                    ${statusLabel}
                                </span>
                            </div>
                        </div>
                        <!-- Row 2: Date -->
                        <div style="font-size: 0.8rem !important; color: #64748b !important; margin-top: 2px !important; white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important;">Criado em: <span style="color: #475569 !important; font-weight: 500 !important;">${fullDateTimeStr}</span></div>
                        <!-- Row 3: Lote -->
                        ${p.distNumber ? `
                        <div style="font-size: 0.8rem !important; color: #64748b !important; margin-top: 2px !important; white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important;">Lote: <span style="color: #475569 !important; font-weight: 600 !important;">${p.distNumber}</span></div>` : ''}
                    </div>
                </div>

                <!-- Divider -->
                <hr style="border: 0 !important; height: 1px !important; background: #e2e8f0 !important; margin: 0 !important; padding: 0 !important;">

                <!-- Product Section -->
                <div style="background: #f8fafc !important; border: 1px solid #f1f5f9 !important; border-radius: 12px !important; padding: 16px !important; display: flex !important; gap: 16px !important; align-items: center !important; margin: 0 !important; height: 76px !important; box-sizing: border-box !important;">
                    <div style="width: 40px !important; height: 40px !important; border-radius: 10px !important; background: #eff6ff !important; border: 1px solid #dbeafe !important; display: flex !important; align-items: center !important; justify-content: center !important; flex-shrink: 0 !important;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </div>
                    <div style="margin: 0 !important; padding: 0 !important; min-width: 0 !important;">
                        <div style="font-size: 0.7rem !important; color: #64748b !important; font-weight: 700 !important; letter-spacing: 0.05em !important; margin-bottom: 2px !important;">PRODUTO</div>
                        <div style="font-size: 0.95rem !important; color: #0f172a !important; font-weight: 800 !important; line-height: 1.2 !important; display: -webkit-box !important; -webkit-line-clamp: 2 !important; -webkit-box-orient: vertical !important; overflow: hidden !important;">
                            ${itemCode ? `<span style="color: #334155 !important; font-weight: 600 !important; margin-right: 4px !important;">${itemCode} |</span>` : ''}${material || 'SEM DESCRIÇÃO'}
                        </div>
                    </div>
                </div>

                <!-- Metrics Section -->
                <div style="background: #f8fafc !important; border: 1px solid #f1f5f9 !important; border-radius: 12px !important; display: flex !important; align-items: center !important; margin: 0 !important; padding: 0 !important;">
                    <!-- Caixas -->
                    <div style="flex: 1 !important; padding: 16px !important; display: flex !important; gap: 16px !important; align-items: center !important; margin: 0 !important;">
                        <div style="width: 40px !important; height: 40px !important; border-radius: 10px !important; background: #eff6ff !important; border: 1px solid #dbeafe !important; display: flex !important; align-items: center !important; justify-content: center !important; flex-shrink: 0 !important;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                                <line x1="12" y1="22.08" x2="12" y2="12"></line>
                            </svg>
                        </div>
                        <div style="margin: 0 !important; padding: 0 !important;">
                            <div style="font-size: 0.7rem !important; color: #64748b !important; font-weight: 700 !important; letter-spacing: 0.05em !important; margin-bottom: 2px !important;">CAIXAS</div>
                            <div style="display: flex !important; align-items: baseline !important; gap: 4px !important; margin: 0 !important; padding: 0 !important; flex-wrap: nowrap !important;">
                                <div style="font-size: 1.8rem !important; color: #0f172a !important; font-weight: 800 !important; line-height: 1 !important;">${p.boxes ? p.boxes.length : 0}</div>
                                <div style="font-size: 0.9rem !important; color: #64748b !important; font-weight: 600 !important; white-space: nowrap !important;">/ ${p.expectedQty > 0 ? p.expectedQty : '-'} CX</div>
                            </div>
                        </div>
                    </div>

                    <!-- Vertical Divider -->
                    <div style="width: 1px !important; height: 50px !important; background: #e2e8f0 !important; margin: 0 !important; padding: 0 !important;"></div>

                    <!-- Peso -->
                    <div style="flex: 1 !important; padding: 16px !important; display: flex !important; gap: 16px !important; align-items: center !important; margin: 0 !important;">
                        <div style="width: 40px !important; height: 40px !important; border-radius: 10px !important; background: #eff6ff !important; border: 1px solid #dbeafe !important; display: flex !important; align-items: center !important; justify-content: center !important; flex-shrink: 0 !important;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="5" r="3"></circle>
                            <path d="M6.5 8a2 2 0 0 0-1.905 1.46L2.1 18.5A2 2 0 0 0 4 21h16a2 2 0 0 0 1.925-2.54L19.4 9.46A2 2 0 0 0 17.5 8Z"></path>
                        </svg>
                        </div>
                        <div style="margin: 0 !important; padding: 0 !important;">
                            <div style="font-size: 0.7rem !important; color: #64748b !important; font-weight: 700 !important; letter-spacing: 0.05em !important; margin-bottom: 2px !important;">PESO</div>
                            <div style="display: flex !important; align-items: baseline !important; gap: 4px !important; margin: 0 !important; padding: 0 !important;">
                                <div style="font-size: 1.8rem !important; color: #0f172a !important; font-weight: 800 !important; line-height: 1 !important;">${(p.totalWeight || 0).toFixed(2)}</div>
                                <div style="font-size: 0.9rem !important; color: #64748b !important; font-weight: 600 !important;">kg</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Button -->
                <button class="btn primary" style="width: 100% !important; justify-content: center !important; border-radius: 12px !important; padding: 14px !important; font-size: 1.05rem !important; font-weight: 600 !important; margin-top: auto !important; margin-bottom: 0 !important;">
                    <span>${this._t('Continuar')}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 4px !important;"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </button>
            </div>
        `;
    }).join('') || `<p style="color: var(--text-secondary)">${this._t('Vazio.')}</p>`;
}

export function renderHistory() {
    if (this.sapClosedPallets === undefined) {
        this.el.historyList.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; padding: 2rem;" class="sancay-td">
                    <div class="spinner" style="margin: 0 auto 0.5rem auto !important; display: inline-block;">
                        <div class="bounce1"></div>
                        <div class="bounce2"></div>
                        <div></div>
                    </div>
                    <div style="color: var(--text-muted); font-size: 0.9rem; font-weight: 600;">${this._t('Carregando histórico...')}</div>
                </td>
            </tr>
        `;
        return;
    }
    let closed = this.sapClosedPallets || [];

    if (this.el.activeFiltersIndicatorHistory) {
        this.el.activeFiltersIndicatorHistory.style.display = 'none';
    }


    // 2. Aplicar filtros de coluna do Excel
    Object.keys(this.historyColumnFilters).forEach(columnId => {
        const checkedSet = this.historyColumnFilters[columnId];
        if (checkedSet) {
            closed = closed.filter(p => {
                const val = getColumnValue(p, columnId);
                return checkedSet.has(val);
            });
        }
    });

    // 3. Aplicar ordenação
    if (this.historySortColumn) {
        const col = this.historySortColumn;
        const dir = this.historySortDirection === 'asc' ? 1 : -1;

        closed = [...closed].sort((a, b) => {
            let valA = getColumnValue(a, col);
            let valB = getColumnValue(b, col);

            if (col === 'id') {
                const numA = parseInt(a.id) || 0;
                const numB = parseInt(b.id) || 0;
                return (numA - numB) * dir;
            }
            if (col === 'boxes') {
                const numA = a.boxes ? a.boxes.length : 0;
                const numB = b.boxes ? b.boxes.length : 0;
                return (numA - numB) * dir;
            }
            if (col === 'weight') {
                const numA = typeof a.totalWeight === 'number' ? a.totalWeight : 0;
                const numB = typeof b.totalWeight === 'number' ? b.totalWeight : 0;
                return (numA - numB) * dir;
            }
            if (col === 'date') {
                const dateA = a.endTime ? new Date(a.endTime.toString().replace(' ', 'T')) : new Date(0);
                const dateB = b.endTime ? new Date(b.endTime.toString().replace(' ', 'T')) : new Date(0);
                return (dateA - dateB) * dir;
            }

            return valA.localeCompare(valB) * dir;
        });
    } else {
        // Ordenação padrão: mais recente primeiro
        closed = closed.slice().reverse();
    }

    // 4. Atualizar indicadores visuais de ordenação nos cabeçalhos
    const columns = ['id', 'date', 'op', 'boxes', 'weight', 'status'];
    columns.forEach(col => {
        const span = document.querySelector(`.sort-indicator-${col}`);
        if (span) {
            if (this.historySortColumn === col) {
                span.textContent = this.historySortDirection === 'asc' ? ' ▲' : ' ▼';
                span.style.color = 'var(--primary)';
            } else {
                span.textContent = '';
                span.style.color = '';
            }
        }
    });
    this.el.historyList.innerHTML = closed.map(p => {
        let dateStr = '---';
        try {
            if (p.startTime) {
                const dateObj = new Date(p.startTime.toString().replace(' ', 'T'));
                if (!isNaN(dateObj)) {
                    const day = String(dateObj.getDate()).padStart(2, '0');
                    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                    const year = dateObj.getFullYear();
                    const hh = String(dateObj.getHours()).padStart(2, '0');
                    const mm = String(dateObj.getMinutes()).padStart(2, '0');
                    dateStr = `${day}/${month}/${year} ${hh}:${mm}`;
                } else if (typeof p.startTime === 'string' && p.startTime.length >= 16) {
                    dateStr = p.startTime.substring(0, 16).replace('T', ' ');
                } else {
                    dateStr = p.startTime;
                }
            }
        } catch(e) {}
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
    const p = (this.sapClosedPallets && this.sapClosedPallets.find(x => x.id.trim() === id.trim())) || this.pallets.find(p => p.id.trim() === id.trim());
    if (!p) return;

    const updateButtonsVisibility = (status) => {
        const isCurrentlyRemoved = status && status.trim().toUpperCase() === 'REMOVIDO';
        if (isCurrentlyRemoved) {
            if (this.el.printPalletBtn) this.el.printPalletBtn.classList.add('is-hidden');
            if (this.el.editPalletBtn) this.el.editPalletBtn.classList.add('is-hidden');
        } else {
            if (this.el.printPalletBtn) this.el.printPalletBtn.classList.remove('is-hidden');
            if (this.el.editPalletBtn) this.el.editPalletBtn.classList.remove('is-hidden');
        }
    };

    updateButtonsVisibility(p.status);

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
    } catch (e) { }
    document.getElementById('modal-date').textContent = detailDateStr;
    document.getElementById('modal-boxes').textContent = p.boxes.length;
    document.getElementById('modal-boxes-badge').textContent = `${p.boxes.length} caixas`;
    document.getElementById('modal-weight').textContent = p.totalWeight.toFixed(2);
    
    // Configura o status badge inicial (se tiver status)
    if (p.status) {
        document.getElementById('modal-status-badge').textContent = p.status;
        document.getElementById('modal-status-dot').style.background = p.status === 'ENCERRADO' ? '#22c55e' : '#f97316';
    }

    const renderList = () => {
        document.getElementById('modal-boxes-list').innerHTML = p.boxes.map((b, i) => {
            const timeStr = formatBoxDateTime(b);
            const weightStr = typeof b.weight === 'number' ? `${b.weight.toFixed(2)} kg` : '---';
            
            const printHtml = b.lineId 
                ? `<button class="print-box-btn" onclick="printBoxLabel('${p.docEntry}', '${b.lineId}')" style="background: none !important; border: none !important; color: #1d4ed8 !important; cursor: pointer !important; padding: 4px !important; transition: opacity 0.2s !important;" onmouseover="this.style.opacity='0.7'" onmouseout="this.style.opacity='1'" title="${this._t('Imprimir Etiqueta da Caixa')}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                   </button>` 
                : '';

            return `<tr style="border-bottom: 1px solid #e2e8f0 !important; background: transparent !important; transition: background 0.2s !important;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                <td class="sancay-td" style="padding: 12px 16px !important; font-weight: 600 !important; color: #1e293b !important; font-size: 0.95rem !important;">${b.code || (i + 1)}</td>
                <td class="sancay-td" style="padding: 12px 16px !important; color: #475569 !important; font-size: 0.95rem !important; text-align: center !important;">${timeStr}</td>
                <td class="sancay-td" style="padding: 12px 16px !important; position: relative !important;">
                    <div style="display:flex; align-items:center; justify-content: center;">
                        <span style="font-size: 0.95rem !important; color: #475569 !important; font-weight: 500 !important;">${weightStr.replace(' kg', '')}</span>
                    </div>
                    <div style="position: absolute !important; right: 16px !important; top: 50% !important; transform: translateY(-50%) !important; display: flex !important;">
                        ${printHtml}
                    </div>
                </td>
            </tr>`;
        }).join('');
    };

    // Buscar as caixas na API getPallet para obter dados reais de pesos e datas/horas do SAP
    document.getElementById('bs-loading').classList.remove('is-hidden');
    fetch('http://192.168.30.14:9908/api/v1/getPallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ "U_SPS_PalletCode": p.id })
    })
        .then(r => r.json())
        .then(sapData => {
            document.getElementById('bs-loading').classList.add('is-hidden');
            if (sapData) {
                if (sapData.U_SPS_Status) {
                    p.status = sapData.U_SPS_Status;
                    updateButtonsVisibility(p.status);
                }
                if (sapData.SPS_PALLET_GROUP_LCollection) {
                    p.boxes = sapData.SPS_PALLET_GROUP_LCollection
                        .filter(l => l.U_SPS_Status !== 'REMOVIDO')
                        .map(l => ({
                            lineId: l.LineId,
                            code: l.U_SPS_BoxCode,
                            weight: parseFloat(l.U_SPS_BoxWeight || 0),
                            time: l.U_SPS_CreateDate,
                            status: l.U_SPS_Status || 'EMPESAGEM',
                            timestamp: l.U_SPS_CreateDate || new Date().toISOString(),
                            createTime: l.U_SPS_CreateTime
                        }));
                    p.totalWeight = p.boxes.reduce((sum, box) => sum + box.weight, 0);
                    document.getElementById('modal-boxes').textContent = p.boxes.length;
                    document.getElementById('modal-boxes-badge').textContent = `${p.boxes.length} caixas`;
                    document.getElementById('modal-weight').textContent = p.totalWeight.toFixed(2);
                    if (p.status) {
                        document.getElementById('modal-status-badge').textContent = p.status;
                        document.getElementById('modal-status-dot').style.background = p.status === 'ENCERRADO' ? '#22c55e' : '#f97316';
                    }
                }
            }
            renderList();
            this.el.palletModal.classList.add('is-active');
        })
        .catch(err => {
            console.error('Erro ao buscar caixas do pallet:', err);
            document.getElementById('bs-loading').classList.add('is-hidden');
            renderList();
            this.el.palletModal.classList.add('is-active');
        });
}

export function updateStats() {
    if (this.sapActivePallets === undefined) {
        if (this.el.activePalletsCount) this.el.activePalletsCount.textContent = '--';
        if (this.el.todayBoxesCount) this.el.todayBoxesCount.textContent = '--';
        if (this.el.totalWeightCount) this.el.totalWeightCount.textContent = '--';
        return;
    }

    const active = this.sapActivePallets;

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
    if (filters.palletId && Array.isArray(filters.palletId) && filters.palletId.length > 0) {
        if (!p.id || !filters.palletId.includes(p.id.toString())) {
            return false;
        }
    }

    // 2. OP filter
    if (filters.op && Array.isArray(filters.op) && filters.op.length > 0) {
        if (!p.op || !filters.op.includes(p.op.toString())) {
            return false;
        }
    }

    // 3. Item filter
    if (filters.item && Array.isArray(filters.item) && filters.item.length > 0) {
        const iCode = p.itemCode ? p.itemCode.toString() : '';
        if (!filters.item.includes(iCode)) {
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
                    const parts = filters.dateStart.split('-');
                    if (parts.length === 3) {
                        const startVal = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])).getTime();
                        if (dateVal < startVal) return false;
                    }
                }

                if (filters.dateEnd) {
                    const parts = filters.dateEnd.split('-');
                    if (parts.length === 3) {
                        const endVal = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])).getTime();
                        if (dateVal > endVal) return false;
                    }
                }
            }
        } catch (e) { }
    }

    return true;
}

function hasActiveFilters(filters) {
    if (!filters) return false;
    return !!(
        (Array.isArray(filters.palletId) ? filters.palletId.length > 0 : (filters.palletId && filters.palletId.trim() !== '')) ||
        (Array.isArray(filters.op) ? filters.op.length > 0 : (filters.op && filters.op.trim() !== '')) ||
        (Array.isArray(filters.item) ? filters.item.length > 0 : (filters.item && filters.item.trim() !== '')) ||
        filters.dateStart ||
        filters.dateEnd
    );
}

// ==========================================
// Excel-Like Column Filtering & Sorting Logic
// ==========================================

function getColumnValue(p, columnId) {
    if (columnId === 'id') return `#${p.id}`;
    if (columnId === 'date') return p.displayTime && p.displayTime !== '---' ? p.displayTime : '---';
    if (columnId === 'op') return p.op || '---';
    if (columnId === 'boxes') return p.boxes ? p.boxes.length.toString() : '0';
    if (columnId === 'weight') return typeof p.totalWeight === 'number' ? `${p.totalWeight.toFixed(2)} kg` : '0.00 kg';
    if (columnId === 'status') return p.status && p.status.toUpperCase() === 'REMOVIDO' ? 'REMOVIDO' : 'FINALIZADO';
    return '';
}

export function handleHistorySort(columnId) {
    if (this.historySortColumn === columnId) {
        this.historySortDirection = this.historySortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        this.historySortColumn = columnId;
        this.historySortDirection = 'asc';
    }
    this.renderHistory();
}

export function toggleHistoryFilterDropdown(event, columnId) {
    event.stopPropagation();

    const dropdown = document.getElementById('excel-filter-dropdown');
    if (!dropdown) return;

    if (!dropdown.classList.contains('is-hidden') && this.activeFilterColumn === columnId) {
        dropdown.classList.add('is-hidden');
        this.activeFilterColumn = null;
        return;
    }

    this.activeFilterColumn = columnId;
    this.populateHistoryFilterDropdown(columnId);

    dropdown.classList.remove('is-hidden');

    const rect = event.currentTarget.getBoundingClientRect();
    dropdown.style.top = `${rect.bottom + 5}px`;
    dropdown.style.left = `${Math.max(10, rect.right - 220)}px`;
}

export function populateHistoryFilterDropdown(columnId) {
    const dropdown = document.getElementById('excel-filter-dropdown');
    if (!dropdown) return;

    const items = this.sapClosedPallets || [];
    const values = [...new Set(items.map(p => getColumnValue(p, columnId)))].sort((a, b) => {
        if (columnId === 'id' || columnId === 'boxes') {
            const numA = parseInt(a.replace(/[^0-9]/g, '')) || 0;
            const numB = parseInt(b.replace(/[^0-9]/g, '')) || 0;
            return numA - numB;
        }
        if (columnId === 'weight') {
            const numA = parseFloat(a.replace(/[^0-9.]/g, '')) || 0;
            const numB = parseFloat(b.replace(/[^0-9.]/g, '')) || 0;
            return numA - numB;
        }
        return a.localeCompare(b);
    });

    if (!this.historyColumnFilters[columnId]) {
        this.historyColumnFilters[columnId] = new Set(values);
    }

    const checkedSet = this.historyColumnFilters[columnId];

    dropdown.innerHTML = `
        <div style="font-weight: 700 !important; margin-bottom: 6px !important; display: flex !important; justify-content: space-between !important; align-items: center !important;">
            <span style="color: var(--text-strong) !important;">${this._t('Filtrar')}</span>
            <span style="font-size: 0.75rem !important; color: var(--text-muted) !important; font-weight: normal !important;">${values.length} ${this._t('valores')}</span>
        </div>
        <input type="text" class="excel-filter-search" placeholder="${this._t('Pesquisar...')}" oninput="filterHistoryDropdownItems('${columnId}')" id="filter-search-${columnId}">
        <div class="excel-filter-list" id="filter-list-${columnId}">
            <label class="excel-filter-item select-all">
                <input type="checkbox" onchange="selectAllHistoryFilter('${columnId}', this.checked)" ${checkedSet.size === values.length ? 'checked' : ''}>
                <span style="font-weight: 600 !important;">(${this._t('Selecionar Tudo')})</span>
            </label>
            ${values.map(val => `
                <label class="excel-filter-item">
                    <input type="checkbox" value="${val.replace(/"/g, '&quot;')}" ${checkedSet.has(val) ? 'checked' : ''}>
                    <span>${val}</span>
                </label>
            `).join('')}
        </div>
        <div class="excel-filter-actions">
            <button class="excel-filter-btn cancel" onclick="closeHistoryFilter('${columnId}')">${this._t('Cancelar')}</button>
            <button class="excel-filter-btn apply" onclick="applyHistoryFilter('${columnId}')">${this._t('Aplicar')}</button>
        </div>
    `;
}

export function filterHistoryDropdownItems(columnId) {
    const searchVal = document.getElementById(`filter-search-${columnId}`).value.toLowerCase().trim();
    const listItems = document.querySelectorAll(`#filter-list-${columnId} .excel-filter-item:not(.select-all)`);

    listItems.forEach(item => {
        const text = item.querySelector('span').textContent.toLowerCase();
        if (text.includes(searchVal)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

export function selectAllHistoryFilter(columnId, checked) {
    const listContainer = document.getElementById(`filter-list-${columnId}`);
    if (!listContainer) return;
    const checkBoxes = listContainer.querySelectorAll('.excel-filter-item:not(.select-all) input[type="checkbox"]');
    checkBoxes.forEach(cb => {
        const parent = cb.closest('.excel-filter-item');
        if (parent && parent.style.display !== 'none') {
            cb.checked = checked;
        }
    });
}

export function applyHistoryFilter(columnId) {
    const listContainer = document.getElementById(`filter-list-${columnId}`);
    if (!listContainer) return;

    const checkBoxes = listContainer.querySelectorAll('.excel-filter-item:not(.select-all) input[type="checkbox"]');

    const checkedValues = new Set();
    checkBoxes.forEach(cb => {
        if (cb.checked) {
            checkedValues.add(cb.value);
        }
    });

    this.historyColumnFilters[columnId] = checkedValues;

    const triggerBtn = document.querySelector(`th[ondblclick*="'${columnId}'"] .filter-trigger-btn`);
    if (triggerBtn) {
        const items = this.sapClosedPallets || [];
        const totalUniqueValuesCount = new Set(items.map(p => getColumnValue(p, columnId))).size;

        if (checkedValues.size < totalUniqueValuesCount) {
            triggerBtn.classList.add('active');
            triggerBtn.style.color = 'var(--primary)';
        } else {
            triggerBtn.classList.remove('active');
            triggerBtn.style.color = '';
        }
    }

    this.closeHistoryFilter(columnId);
    this.renderHistory();
}

export function closeHistoryFilter(columnId) {
    const dropdown = document.getElementById('excel-filter-dropdown');
    if (dropdown) {
        dropdown.classList.add('is-hidden');
    }
    this.activeFilterColumn = null;
}
