import { OP_MAPPING } from './constants.js';
import { getPortalTemplate } from './template.js';
import { getData } from './api.js';

// Import scale functions
import {
    toggleScale,
    simulateWeight,
    startScaleSimulation
} from './scale.js';

// Import UI functions
import {
    mapElements,
    bindEvents,
    toggleSidebar,
    switchView,
    updateTitle,
    populateOPDropdown,
    renderDashboard,
    renderHistory,
    openPalletDetails,
    updateStats,
    showToast,
    showConfirm
} from './interface.js';

// Import Pallet functions
import {
    fetchPendingPallets,
    fetchProductionOrders,
    startNewPallet,
    startProcess,
    updateProcessView,
    registerBox,
    closePallet,
    apontarProducao,
    pauseProduction,
    openActivePallet,
    printCurrentViewedPallet,
    printPallet,
    deleteBox,
    reopenPallet,
    fetchClosedPallets
} from './pallets.js';

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
        this.filters = {
            palletId: '',
            op: '',
            item: '',
            dateStart: '',
            dateEnd: ''
        };

        // Initialize appData structure
        window.app = window.app || {};
        window.app.appData = window.app.appData || {};
        window.app.appData.selectedOrder = [];

        console.log('Sancay Portal Modernized Initialized (Modularized)');

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
        this.fetchClosedPallets();
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
}

// Dynamically assign imported functions to class prototype
Object.assign(SancayPortal.prototype, {
    // Scale Integration
    toggleScale,
    simulateWeight,
    startScaleSimulation,

    // UI/UX Operations
    mapElements,
    bindEvents,
    toggleSidebar,
    switchView,
    updateTitle,
    populateOPDropdown,
    renderDashboard,
    renderHistory,
    openPalletDetails,
    updateStats,
    showToast,
    showConfirm,

    // Pallet Core Operations
    fetchPendingPallets,
    fetchProductionOrders,
    startNewPallet,
    startProcess,
    updateProcessView,
    registerBox,
    closePallet,
    apontarProducao,
    pauseProduction,
    openActivePallet,
    printCurrentViewedPallet,
    printPallet,
    deleteBox,
    reopenPallet,
    fetchClosedPallets
});
