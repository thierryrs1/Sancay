import { OP_MAPPING } from './constants.js';
import { getPortalTemplate } from './template.js';
import { getData } from './api.js';

const BASE_URL = new URL('.', import.meta.url).href;

export class SancayPortal {
    constructor() {
        this.pallets = this.loadData();
        this.productionOrders = [];
        this.currentPallet = null;
        this.currentView = 'dashboard';
        this.isScaleConnected = true;
        this.viewedPalletId = null;
        this.confirmCallback = null;
        this.translations = {};
        this.isSidebarCollapsed = localStorage.getItem('sidebar_collapsed') === 'true';

        // Initialize appData structure as requested
        window.app = window.app || {};
        window.app.appData = window.app.appData || {};
        window.app.appData.selectedOrder = [];
        
        console.log('Sancay Portal Modernized Initialized');

        // SAP Credentials from .env
        this.sapConfig = {
            user: 'Support',
            pass: 'Sps@1234',
            schema: 'SANCAY_HOM_BR',
            baseUrl: 'https://192.168.30.192:50000/b1s/v1/'
        };

        // Expose functions to global scope for HTML onclick events
        window.openActivePallet = (id) => this.openActivePallet(id);
        window.openPalletDetails = (id) => this.openPalletDetails(id);
        window.deleteBox = (idx) => this.deleteBox(idx);
    }

    loadData() {
        try {
            return JSON.parse(localStorage.getItem('pallets')) || [];
        } catch (e) {
            console.error('Erro ao carregar dados:', e);
            return [];
        }
    }

    saveData() {
        localStorage.setItem('pallets', JSON.stringify(this.pallets));
    }

    async init(containerId = 'app-container') {
        const lang = (window.appInfo && window.appInfo.language) || 'PTB';
        const scriptPath = `${BASE_URL}i18n/${lang}.js`;

        try {
            await this.loadLanguageScript(scriptPath);
            this.translations = window.portalTranslations || {};
        } catch (e) {
            console.warn(`Translation for ${lang} not found, falling back to PTB`);
            await this.loadLanguageScript(`${BASE_URL}i18n/PTB.js`);
            this.translations = window.portalTranslations || {};
        }

        this._t = (key) => this.translations[key] || key;

        const container = document.getElementById(containerId) || document.body;
        container.innerHTML = getPortalTemplate(this._t);

        this.injectAssets();
        this.mapElements();

        if (this.isSidebarCollapsed) {
            this.el.mainContainer.classList.add('sidebar-collapsed');
        }

        this.bindEvents();
        this.startScaleSimulation();

        this.fetchProductionOrders();

        this.renderDashboard();
        this.renderHistory();
        this.updateStats();
        this.fetchPendingPallets();
    }

    fetchPendingPallets() {
        const _this = this;
        getData('getAux', 'getPalletsPendentes&dg_limit=1000', '', (err, data) => {
            if (err) {
                console.error('Erro ao buscar pallets pendentes:', err);
                return;
            }

            const sapPallets = (data && data.value) ? data.value : (Array.isArray(data) ? data : [data]);

            const mappedPallets = sapPallets.map(p => {
                const startTime = p[4] || p.CreateDate;
                let formattedTime = '---';
                try {
                    if (startTime) {
                        const dateObj = new Date(startTime.replace(' ', 'T')); // Garante formato ISO
                        if (!isNaN(dateObj)) formattedTime = dateObj.toLocaleTimeString();
                    }
                } catch (e) { console.warn('Data inválida:', startTime); }

                return {
                    id: p[0] || p.U_SPS_PalletCode,
                    op: p[1] || p.U_SPS_OPCode,
                    material: '',
                    status: 'Em processo',
                    displayTime: formattedTime,
                    startTime: startTime,
                    boxes: Array(parseInt(p[2] || p.Caixas || 0)).fill({}),
                    totalWeight: parseFloat(p[3] || p.Peso || 0)
                };
            });

            // Log removido para limpeza

            if (!window.app) window.app = {};
            if (!window.app.appData) window.app.appData = {};
            window.app.appData.pendingPallets = mappedPallets;

            _this.sapActivePallets = mappedPallets;
            _this.renderDashboard();
            _this.updateStats();
        });
    }

    fetchProductionOrders() {
        const _this = this;

        getData('getAux', 'getOrdens&dg_limit=1000', '', (err, data) => {
            if (err) {
                console.warn('Using mockup OPs due to error');
                _this.productionOrders = [
                    ['241', '10', 'PA000001', 'Item Acabado (Caixa)', '90', 'CX', '3', '01-03', '2', '2']
                ];
            } else {
                const orders = (data && data.value) ? data.value : (data || []);
                _this.productionOrders = orders;

                if (!window.app) window.app = {};
                if (!window.app.appData) window.app.appData = {};
                window.app.appData.getOrdens = orders;
            }
            _this.populateOPDropdown();
        });
    }

    populateOPDropdown() {
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

    loadLanguageScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    injectAssets() {
        if (!document.getElementById('portal-fonts')) {
            const fonts = document.createElement('link');
            fonts.id = 'portal-fonts';
            fonts.rel = 'stylesheet';
            fonts.href = "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=JetBrains+Mono:wght@500;700&display=swap";
            document.head.appendChild(fonts);

            const css = document.createElement('link');
            css.rel = 'stylesheet';
            css.href = BASE_URL + "style.css";
            document.head.appendChild(css);
        }
    }

    mapElements() {
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
            totalWeightCount: document.getElementById('total-weight-count')
        };
    }

    bindEvents() {
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

    toggleSidebar() {
        this.isSidebarCollapsed = !this.isSidebarCollapsed;
        this.el.mainContainer.classList.toggle('sidebar-collapsed', this.isSidebarCollapsed);
        localStorage.setItem('sidebar_collapsed', this.isSidebarCollapsed);
    }

    startScaleSimulation() {
        setInterval(() => {
            if (this.isScaleConnected && this.currentView === 'process-view' && !this.scaleLocked) {
                const base = 24.5 + (Math.random() * 1.5);
                if (this.el.liveWeightDisplay) this.el.liveWeightDisplay.textContent = base.toFixed(2);
            }
        }, 2000);
    }

    switchView(viewId) {
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

    updateTitle(viewId) {
        const titles = {
            'dashboard': `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg> ${this._t('Painel de Controle')}`,
            'new-pallet': `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"></path></svg> ${this._t('Novo Pallet')}`,
            'history': `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> ${this._t('Histórico de Produção')}`,
            'process-view': `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> ${this._t('Montagem de Pallets')}`
        };
        this.el.viewTitle.innerHTML = titles[viewId] || 'Portal';
    }

    async startNewPallet() {
        if (!window.app.appData.selectedOrder) {
            this.showToast(this._t('Selecione uma OP primeiro.'));
            return;
        }

        const op = window.app.appData.selectedOrder;

        try {
            document.getElementById('bs-loading').classList.remove('is-hidden');

            // 1. New External API Call (genneratePallet)
            const palletPayload = {
                "U_SPS_Tipo": "PALLET",
                "U_SPS_OPCode": `${op[0]}/${op[1]}`,
                "U_SPS_PalletCode": `${op[9]}-${op[0]}/${op[1]}`,
                "U_SPS_Status": "ABERTO",
                "U_SPS_QRCode": `${op[9]}-${op[0]}/${op[1]}`,
                "U_SPS_ExpectedQty": parseFloat(op[4] || 0),
                "U_SPS_CreateUser": "manager",
                "U_SPS_Printed": "N"
            };

            try {
                const response = await fetch('http://192.168.30.14:9908/api/v1/genneratePallet', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(palletPayload)
                });

                const res = await response.json();
                // Log removido para limpeza

                document.getElementById('bs-loading').classList.add('is-hidden');
                this.showToast(this._t('Pallet gerado com sucesso!'));

                // 2. Local Creation for UI/Dashboard
                const newPallet = {
                    id: (this.pallets.length > 0 ? Math.max(...this.pallets.map(p => parseInt(p.id))) + 1 : 1).toString(),
                    docEntry: res.DocEntry || res.AbsoluteEntry, // Capturar ID do SAP
                    op: `${op[0]}/${op[1]}`,
                    itemCode: op[2], // Salvar código do item para as linhas
                    material: op[3], // Item Name
                    expectedQty: parseFloat(op[4] || 0), // U_SPS_ExpectedQty
                    startTime: new Date().toISOString(),
                    status: 'Em processo',
                    boxes: [],
                    totalWeight: 0
                };

                this.pallets.push(newPallet);
                this.saveData();
                this.startProcess(newPallet);

            } catch (err) {
                console.error('Erro na nova API:', err);
                this.showToast('Erro API: ' + err.message);
                document.getElementById('bs-loading').classList.add('is-hidden');
            }

            /* COMENTADO: Lógica antiga via Beas postAux
            const dadosPost = `@${op[0]}@@${op[1]}@@${op[4]}@@${op[6]}@@manager@`;
            getData('postAux', 'postPallet', dadosPost, (err, res) => {
                // ... logic
            });
            */

        } catch (error) {
            console.error('Erro geral ao iniciar pallet:', error);
            document.getElementById('bs-loading').classList.add('is-hidden');
        }
    }

    startProcess(pallet) {
        this.currentPallet = pallet;
        this.updateProcessView();
        this.switchView('process-view');
    }

    updateProcessView() {
        if (!this.currentPallet) return;
        document.getElementById('current-pallet-id').textContent = `${this._t('Pallet')} #${this.currentPallet.id}`;
        document.getElementById('current-pallet-op').textContent = `${this._t('OP')}: ${this.currentPallet.op} | ${this.currentPallet.material}`;

        // Update progress
        const currentCount = this.currentPallet.boxes.length;
        const expected = this.currentPallet.expectedQty || 0;
        const progressPercent = expected > 0 ? Math.min((currentCount / expected) * 100, 100) : 0;

        document.getElementById('current-box-count').textContent = `${currentCount} / ${expected}`;
        if (this.el.progressBar) {
            this.el.progressBar.style.width = `${progressPercent}%`;
        }

        const boxList = document.getElementById('current-boxes-list');
        boxList.innerHTML = this.currentPallet.boxes.slice(-5).reverse().map((box, index) => {
            const actualIndex = this.currentPallet.boxes.length - 1 - index;
            return `<li><span>${this._t('Caixa')} #${actualIndex + 1}</span><div style="display: flex; align-items: center; gap: 1rem;"><span class="box-weight">${box.weight.toFixed(2)} kg</span><button class="delete-box-btn" onclick="deleteBox(${actualIndex})"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></button></div></li>`;
        }).join('');
        document.getElementById('current-total-weight').textContent = `${this.currentPallet.totalWeight.toFixed(2)} kg`;
    }

    toggleScale() {
        this.isScaleConnected = !this.isScaleConnected;
        if (this.isScaleConnected) {
            this.el.scaleStatusDot.className = 'status-dot online';
            this.el.scaleStatusText.textContent = this._t('Balança Conectada');
            this.el.liveWeightDisplay.style.display = 'block';
            this.el.manualWeightInput.style.display = 'none';
            if (this.el.simulateWeightBtn) this.el.simulateWeightBtn.style.display = 'inline-block';
            this.el.scaleLabel.textContent = this._t('PESO ATUAL');
            this.el.weightValueContainer.classList.remove('disconnected');
        } else {
            this.el.scaleStatusDot.className = 'status-dot offline';
            this.el.scaleStatusText.textContent = this._t('Balança Desconectada');
            this.el.liveWeightDisplay.style.display = 'none';
            this.el.manualWeightInput.style.display = 'inline-block';
            if (this.el.simulateWeightBtn) this.el.simulateWeightBtn.style.display = 'none';
            this.el.scaleLabel.textContent = this._t('DIGITAR PESO (MANUAL)');
            this.el.weightValueContainer.classList.add('disconnected');
            this.el.manualWeightInput.focus();
        }
    }

    simulateWeight() {
        this.scaleLocked = true;
        const weights = [24.9, 25.0, 25.1, 24.8, 25.2];
        const weight = weights[Math.floor(Math.random() * weights.length)];
        this.el.liveWeightDisplay.textContent = weight.toFixed(2);
        this.showToast(this._t('Peso estabilizado'));
        setTimeout(() => { this.scaleLocked = false; }, 3000);
    }

    async registerBox() {
        if (!this.currentPallet) return;
        let weight = this.isScaleConnected ? parseFloat(this.el.liveWeightDisplay.textContent) : parseFloat(this.el.manualWeightInput.value);
        if (isNaN(weight) || weight <= 0) return this.showToast(this._t('Peso inválido!'));

        const newBox = {
            weight,
            timestamp: new Date().toISOString()
        };

        // Adicionar localmente para feedback imediato
        this.currentPallet.boxes.push(newBox);
        this.currentPallet.totalWeight = this.currentPallet.boxes.reduce((sum, b) => sum + b.weight, 0);

        if (!this.isScaleConnected) {
            this.el.manualWeightInput.value = '';
            this.el.manualWeightInput.focus();
        }

        try {
            document.getElementById('bs-loading').classList.remove('is-hidden');
            
            // Sincronizar com o SAP via Nova API (updatePallet)
            const boxNum = this.currentPallet.boxes.length;
            const updatePayload = {
                "DocEntry": this.currentPallet.docEntry,
                "U_SPS_Tipo": "PALLET",
                "U_SPS_OPCode": this.currentPallet.op,
                "U_SPS_PalletCode": this.currentPallet.id,
                "U_SPS_Status": "EM PROCESSO",
                "SPS_PALLET_GROUP_LCollection": [
                    {
                        "U_SPS_OPCode": this.currentPallet.op,
                        "U_SPS_ItemCode": this.currentPallet.itemCode || "",
                        "U_SPS_DistNumber": this.currentPallet.op,
                        "U_SPS_BoxCode": `CX-${boxNum}`,
                        "U_SPS_BoxWeight": weight,
                        "U_SPS_BoxQRCode": `CX-${boxNum}`,
                        "U_SPS_Status": "EMPESAGEM",
                        "U_SPS_CreateDate": new Date().toISOString().split('T')[0],
                        "U_SPS_CreateUser": "manager",
                        "U_SPS_Printed": "N"
                    }
                ]
            };

            console.log('Enviando caixa para o SAP (JSON):', JSON.stringify(updatePayload, null, 2));

            const response = await fetch('http://192.168.30.14:9908/api/v1/updatePallet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatePayload)
            });

            const res = await response.json();
            document.getElementById('bs-loading').classList.add('is-hidden');
            this.showToast(this._t('Caixa registrada'));
        } catch (err) {
            console.error('Erro ao sincronizar caixa com SAP:', err);
            document.getElementById('bs-loading').classList.add('is-hidden');
            this.showToast(this._t('Erro ao sincronizar com SAP. Mantido localmente.'));
        }

        this.saveData();
        this.updateProcessView();
        this.updateStats();
    }

    closePallet() {
        this.showConfirm(`${this._t('Encerrar Pallet')} #${this.currentPallet.id}?`, async () => {
            try {
                document.getElementById('bs-loading').classList.remove('is-hidden');

                // Sincronizar encerramento com o SAP
                const updatePayload = {
                    "DocEntry": this.currentPallet.docEntry,
                    "U_SPS_Tipo": "PALLET",
                    "U_SPS_OPCode": this.currentPallet.op,
                    "U_SPS_PalletCode": this.currentPallet.id,
                    "U_SPS_Status": "FINALIZADO",
                    "U_SPS_UpdateUser": "manager",
                    "U_SPS_Printed": "N"
                };

                console.log('Enviando fechamento para o SAP (JSON):', JSON.stringify(updatePayload, null, 2));

                const response = await fetch('http://192.168.30.14:9908/api/v1/updatePallet', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatePayload)
                });

                this.currentPallet.status = 'Finalizado';
                this.currentPallet.endTime = new Date().toISOString();
                this.saveData();
                this.lastClosedPallet = { ...this.currentPallet };
                this.currentPallet = null;
                this.renderDashboard();
                this.renderHistory();
                this.updateStats();

                document.getElementById('bs-loading').classList.add('is-hidden');
                document.getElementById('success-pallet-id').textContent = this.lastClosedPallet.id;
                this.el.successModal.style.display = 'block';

            } catch (err) {
                console.error('Erro ao encerrar pallet no SAP:', err);
                this.showToast(this._t('Erro ao encerrar no SAP. Verifique a conexão.'));
                document.getElementById('bs-loading').classList.add('is-hidden');
            }
        });
    }

    pauseProduction() {
        if (!this.currentPallet) return;

        this.showConfirm(this._t('Tem certeza que deseja pausar a pesagem?'), () => {
            document.getElementById('bs-loading').classList.remove('is-hidden');
            
            const palletCode = this.currentPallet.id;

            getData('postAux', 'postPesado', palletCode, (err, res) => {
                document.getElementById('bs-loading').classList.add('is-hidden');

                if (err) {
                    console.error('Erro ao pausar no Beas:', err);
                    this.showToast(this._t('Erro ao pausar: ') + err.message);
                    return;
                }

                this.showToast(this._t('Produção pausada com sucesso!'));

                // Lógica local de pausa
                this.saveData();
                this.currentPallet = null;
                this.switchView('dashboard');
            });
        });
    }

    renderDashboard() {
        const active = this.sapActivePallets || this.pallets.filter(p => p.status === 'Em processo');

        this.el.activePalletsList.innerHTML = active.map(p => {
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

    renderHistory() {
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

    async openActivePallet(id) {
        const p = (this.sapActivePallets || []).find(p => p.id === id) || this.pallets.find(p => p.id === id);
        if (!p) return;

        try {
            document.getElementById('bs-loading').classList.remove('is-hidden');

            // Buscar dados completos do pallet (incluindo linhas/caixas) da Nova API
            const response = await fetch('http://192.168.30.14:9908/api/v1/getPallet', {
                method: 'POST', // Conforme sua documentação, o GET usa POST com body
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ "U_SPS_PalletCode": p.id })
            });

            const sapData = await response.json();

            if (sapData) {
                // Sincronizar dados locais com o que está no SAP
                p.docEntry = sapData.DocEntry;
                p.expectedQty = sapData.U_SPS_ExpectedQty;

                // Buscar ItemCode caso não tenha (novo endpoint getItem)
                if (!p.itemCode) {
                    const opParts = p.op.split('/');
                    const opDados = `@${opParts[0]}@@${opParts[1]}@`;

                    await new Promise((resolve) => {
                        getData('getAux', 'getItem', opDados, (err, itemData) => {
                            if (!err && itemData) {
                                // Assume itemData.value[0][0] ou similar dependendo do retorno do Beas
                                const item = (itemData.value && itemData.value[0]) ? itemData.value[0][0] : (Array.isArray(itemData) ? itemData[0] : itemData);
                                p.itemCode = item;
                            }
                            resolve();
                        });
                    });
                }

                // Mapear linhas do SAP para o formato de caixas do portal
                if (sapData.SPS_PALLET_GROUP_LCollection) {
                    p.boxes = sapData.SPS_PALLET_GROUP_LCollection
                        .filter(l => l.U_SPS_Status !== 'REMOVIDO')
                        .map(l => ({
                            lineId: l.LineId,
                            weight: parseFloat(l.U_SPS_BoxWeight || 0),
                            time: l.U_SPS_CreateDate,
                            code: l.U_SPS_BoxCode
                        }));

                    // Recalcular peso total local
                    p.totalWeight = p.boxes.reduce((sum, box) => sum + box.weight, 0);
                }
            }

            document.getElementById('bs-loading').classList.add('is-hidden');
            this.startProcess(p);
        } catch (err) {
            console.error('Erro ao buscar detalhes do pallet:', err);
            document.getElementById('bs-loading').classList.add('is-hidden');
            // Mesmo com erro, tenta abrir com o que tem localmente
            this.startProcess(p);
        }
    }

    openPalletDetails(id) {
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

    reopenPallet() {
        if (!this.viewedPalletId) return;
        const p = this.pallets.find(p => p.id === this.viewedPalletId);
        if (p) {
            p.status = 'Em processo';
            this.saveData();
            this.el.palletModal.classList.remove('is-active');
            this.startProcess(p);
            this.showToast(this._t('Pallet reaberto'));
        }
    }

    updateStats() {
        const active = this.sapActivePallets || this.pallets.filter(p => p.status === 'Em processo');

        // Sum boxes and weight from active pallets
        const totalBoxes = active.reduce((acc, p) => acc + (p.boxes ? p.boxes.length : 0), 0);
        const totalWeight = active.reduce((acc, p) => acc + (p.totalWeight || 0), 0);

        if (this.el.activePalletsCount) this.el.activePalletsCount.textContent = active.length;
        if (this.el.todayBoxesCount) this.el.todayBoxesCount.textContent = totalBoxes;
        if (this.el.totalWeightCount) this.el.totalWeightCount.textContent = totalWeight.toFixed(2);
    }

    printCurrentViewedPallet() {
        const p = this.pallets.find(p => p.id === this.viewedPalletId);
        if (p) this.printPallet(p);
    }

    printPallet(p) {
        document.getElementById('print-id').textContent = p.id;
        document.getElementById('print-op').textContent = p.op;
        document.getElementById('print-material').textContent = p.material;
        document.getElementById('print-date').textContent = new Date(p.endTime || p.startTime).toLocaleString();
        document.getElementById('print-boxes').textContent = p.boxes.length;
        document.getElementById('print-weight').textContent = `${p.totalWeight.toFixed(2)} kg`;
        document.getElementById('print-items-list').innerHTML = p.boxes.map((b, i) => `<tr><td class="sancay-td">${i + 1}</td><td class="sancay-td">${new Date(b.timestamp).toLocaleTimeString()}</td><td class="sancay-td">${b.weight.toFixed(2)}</td></tr>`).join('');
        window.print();
    }

    showConfirm(msg, onConfirm) {
        this.el.confirmMsg.textContent = msg;
        this.confirmCallback = onConfirm;
        this.el.confirmModal.classList.add('is-active');
    }

    deleteBox(idx) {
        this.showConfirm(`${this._t('Excluir Caixa')} #${idx + 1}?`, () => {
            this.currentPallet.boxes.splice(idx, 1);
            this.currentPallet.totalWeight = this.currentPallet.boxes.reduce((s, b) => s + b.weight, 0);
            this.saveData(); this.updateProcessView(); this.updateStats(); this.showToast(this._t('Excluída.'));
        });
    }

    showToast(msg) {
        this.el.toast.textContent = msg; this.el.toast.style.display = 'block';
        setTimeout(() => this.el.toast.style.display = 'none', 3000);
    }
}
