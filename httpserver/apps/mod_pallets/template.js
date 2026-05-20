export function getPortalTemplate(t) {
    return `
        <div id="main-app-container" class="app-container">
            <!-- Sidebar -->
            <aside class="sidebar">
                <nav>
                    <ul class="nav-links">
                        <li class="active" data-view="dashboard" title="${t('Painel de Controle')}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                            <span>${t('Painel')}</span>
                        </li>
                        <li data-view="new-pallet" title="${t('Novo Pallet')}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"></path></svg>
                            <span>${t('Novo Pallet')}</span>
                        </li>
                        <li data-view="history" title="${t('Histórico')}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <span>${t('Histórico')}</span>
                        </li>
                    </ul>
                </nav>
            </aside>

            <!-- Main Content -->
            <main class="content">
                <header class="top-header">
                    <div class="header-left">
                        <button id="toggle-sidebar" class="icon-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                        </button>
                        <h2 id="view-title">
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                            ${t('Painel de Controle')}
                        </h2>
                    </div>
                    <div class="header-right" style="display: flex !important; align-items: center !important; gap: 12px !important;">
                        <button id="open-filter-btn" class="btn outline" style="display: flex !important; align-items: center !important; gap: 8px !important; padding: 6px 14px !important; border-radius: 8px !important; font-size: 0.85rem !important; cursor: pointer !important; background: var(--bg-card) !important; color: var(--text-normal) !important; border: 1px solid var(--border-color) !important; margin: 0 !important;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 !important; padding: 0 !important;"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                            <span>${t('Filtros')}</span>
                        </button>
                        <div id="toggle-scale-status" class="scale-status" style="cursor: pointer !important; margin: 0 !important; display: flex !important; align-items: center !important;">
                            <div id="scale-status-dot" class="status-dot online"></div>
                            <span id="scale-status-text">${t('Balança Conectada')}</span>
                        </div>
                    </div>
                </header>

                <!-- Views Container -->
                <div id="views-container">
                    <!-- Dashboard View -->
                    <div id="dashboard" class="view active">
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg></div>
                                <div class="stat-info"><span>${t('Pallets Ativos')}</span><strong id="active-pallets-count">0</strong></div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg></div>
                                <div class="stat-info"><span>${t('Caixas em Processo')}</span><strong id="today-boxes-count">0</strong></div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg></div>
                                <div class="stat-info"><span>${t('Em Processo (kg)')}</span><strong id="total-weight-count">0.00</strong></div>
                            </div>
                        </div>
                        <div class="dashboard-content">
                            <div class="section-header" style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                                <div style="display: flex; align-items: center; gap: 0.5rem;">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                    <h3>${t('Pallets Em Processo')}</h3>
                                    <div id="active-filters-indicator-dashboard" style="display: none; align-items: center !important; gap: 6px !important; background: rgba(37, 99, 235, 0.1) !important; border: 1px solid rgba(37, 99, 235, 0.2) !important; padding: 4px 10px !important; border-radius: 20px !important; margin-left: 12px !important; height: fit-content !important;">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 !important; padding: 0 !important;"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                                        <span style="font-size: 0.75rem !important; font-weight: 600 !important; color: var(--primary) !important; white-space: nowrap !important; margin: 0 !important; padding: 0 !important; line-height: 1 !important;">${t('Filtrado')}</span>
                                        <button class="clear-all-filters-btn" style="background: none !important; border: none !important; color: var(--primary) !important; cursor: pointer !important; padding: 0 !important; margin: 0 !important; display: flex !important; align-items: center !important; font-size: 1rem !important; font-weight: bold !important; line-height: 1 !important;" title="${t('Limpar Filtros')}">&times;</button>
                                    </div>
                                </div>
                                <button id="refresh-pallets-btn" class="icon-btn" title="${t('Recarregar Pallets')}" style="background: none; border: none; cursor: pointer; color: var(--text-secondary); padding: 5px; border-radius: 4px; display: flex; align-items: center; justify-content: center; transition: background 0.2s, color 0.2s;">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                                </button>
                            </div>
                            <div id="active-pallets-list" class="active-pallets-grid"></div>
                        </div>
                    </div>

                    <!-- New Pallet View -->
                    <div id="new-pallet" class="view">
                        <div class="form-container">
                            <div class="form-header">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"></path></svg>
                                <h2>${t('Iniciar Nova Produção')}</h2>
                                <p>${t('Selecione a Ordem de Produção para começar')}</p>
                            </div>
                            <div class="form-group">
                                <label for="op-select">${t('Ordem de Produção (OP)')}</label>
                                <select id="op-select">
                                    <option value="">${t('Selecione a OP...')}</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="material-type">${t('Tipo de Caixa')}</label>
                                <input type="text" id="material-type" readonly placeholder="${t('Automático pela OP')}">
                            </div>
                            <button id="start-pallet-btn" class="btn primary large">${t('Iniciar Pallet')}</button>
                        </div>
                    </div>

                    <!-- History View -->
                    <div id="history" class="view">
                        <div class="section-header" style="display: flex; align-items: center; justify-content: space-between; width: 100%; margin-bottom: 1.5rem !important;">
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                <h3 style="margin: 0 !important; font-size: 1.25rem !important; font-weight: 600 !important; color: var(--text-strong) !important;">${t('Histórico de Pallets Encerrados')}</h3>
                                <div id="active-filters-indicator-history" style="display: none; align-items: center !important; gap: 6px !important; background: rgba(37, 99, 235, 0.1) !important; border: 1px solid rgba(37, 99, 235, 0.2) !important; padding: 4px 10px !important; border-radius: 20px !important; margin-left: 12px !important; height: fit-content !important;">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 !important; padding: 0 !important;"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                                    <span style="font-size: 0.75rem !important; font-weight: 600 !important; color: var(--primary) !important; white-space: nowrap !important; margin: 0 !important; padding: 0 !important; line-height: 1 !important;">${t('Filtrado')}</span>
                                    <button class="clear-all-filters-btn" style="background: none !important; border: none !important; color: var(--primary) !important; cursor: pointer !important; padding: 0 !important; margin: 0 !important; display: flex !important; align-items: center !important; font-size: 1rem !important; font-weight: bold !important; line-height: 1 !important;" title="${t('Limpar Filtros')}">&times;</button>
                                </div>
                            </div>
                        </div>
                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th class="sancay-th" ondblclick="handleHeaderDblClick('id')" style="position: relative !important; cursor: pointer !important; user-select: none !important;">
                                            <div style="display: flex !important; align-items: center !important; justify-content: space-between !important; gap: 6px !important;">
                                                <span>${t('ID')}</span>
                                                <div style="display: flex !important; align-items: center !important; gap: 4px !important;">
                                                    <span class="sort-indicator-id" style="font-size: 0.75rem !important;"></span>
                                                    <button class="filter-trigger-btn" onclick="toggleFilterDropdown(event, 'id')" style="background: none !important; border: none !important; cursor: pointer !important; color: var(--text-muted) !important; padding: 2px !important;">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </th>
                                        <th class="sancay-th" ondblclick="handleHeaderDblClick('date')" style="position: relative !important; cursor: pointer !important; user-select: none !important;">
                                            <div style="display: flex !important; align-items: center !important; justify-content: space-between !important; gap: 6px !important;">
                                                <span>${t('Data/Hora')}</span>
                                                <div style="display: flex !important; align-items: center !important; gap: 4px !important;">
                                                    <span class="sort-indicator-date" style="font-size: 0.75rem !important;"></span>
                                                    <button class="filter-trigger-btn" onclick="toggleFilterDropdown(event, 'date')" style="background: none !important; border: none !important; cursor: pointer !important; color: var(--text-muted) !important; padding: 2px !important;">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </th>
                                        <th class="sancay-th" ondblclick="handleHeaderDblClick('op')" style="position: relative !important; cursor: pointer !important; user-select: none !important;">
                                            <div style="display: flex !important; align-items: center !important; justify-content: space-between !important; gap: 6px !important;">
                                                <span>${t('OP')}</span>
                                                <div style="display: flex !important; align-items: center !important; gap: 4px !important;">
                                                    <span class="sort-indicator-op" style="font-size: 0.75rem !important;"></span>
                                                    <button class="filter-trigger-btn" onclick="toggleFilterDropdown(event, 'op')" style="background: none !important; border: none !important; cursor: pointer !important; color: var(--text-muted) !important; padding: 2px !important;">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </th>
                                        <th class="sancay-th" ondblclick="handleHeaderDblClick('boxes')" style="position: relative !important; cursor: pointer !important; user-select: none !important;">
                                            <div style="display: flex !important; align-items: center !important; justify-content: space-between !important; gap: 6px !important;">
                                                <span>${t('Caixas')}</span>
                                                <div style="display: flex !important; align-items: center !important; gap: 4px !important;">
                                                    <span class="sort-indicator-boxes" style="font-size: 0.75rem !important;"></span>
                                                    <button class="filter-trigger-btn" onclick="toggleFilterDropdown(event, 'boxes')" style="background: none !important; border: none !important; cursor: pointer !important; color: var(--text-muted) !important; padding: 2px !important;">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </th>
                                        <th class="sancay-th" ondblclick="handleHeaderDblClick('weight')" style="position: relative !important; cursor: pointer !important; user-select: none !important;">
                                            <div style="display: flex !important; align-items: center !important; justify-content: space-between !important; gap: 6px !important;">
                                                <span>${t('Peso Total')}</span>
                                                <div style="display: flex !important; align-items: center !important; gap: 4px !important;">
                                                    <span class="sort-indicator-weight" style="font-size: 0.75rem !important;"></span>
                                                    <button class="filter-trigger-btn" onclick="toggleFilterDropdown(event, 'weight')" style="background: none !important; border: none !important; cursor: pointer !important; color: var(--text-muted) !important; padding: 2px !important;">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </th>
                                        <th class="sancay-th" ondblclick="handleHeaderDblClick('status')" style="position: relative !important; cursor: pointer !important; user-select: none !important;">
                                            <div style="display: flex !important; align-items: center !important; justify-content: space-between !important; gap: 6px !important;">
                                                <span>${t('Status')}</span>
                                                <div style="display: flex !important; align-items: center !important; gap: 4px !important;">
                                                    <span class="sort-indicator-status" style="font-size: 0.75rem !important;"></span>
                                                    <button class="filter-trigger-btn" onclick="toggleFilterDropdown(event, 'status')" style="background: none !important; border: none !important; cursor: pointer !important; color: var(--text-muted) !important; padding: 2px !important;">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody id="history-list"></tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Process View -->
                    <div id="process-view" class="view">
                        <div class="process-layout">
                            <div class="scale-section">
                                <div class="scale-display">
                                    <span id="scale-label" class="scale-label">${t('PESO ATUAL')}</span>
                                    <div class="weight-value">
                                        <span id="live-weight">0.00</span>
                                        <input type="number" id="manual-weight-input" class="manual-input" style="display: none;" placeholder="0.00">
                                        <small>kg</small>
                                    </div>
                                    <div class="scale-actions">
                                        <button id="register-box-btn" class="btn primary large">${t('REGISTRAR CAIXA')}</button>
                                    </div>
                                </div>
                                <div class="production-summary">
                                    <div class="progress-container">
                                        <div class="progress-info">
                                            <span>${t('Progresso do Pallet')}</span>
                                            <span id="current-box-count">0</span>
                                        </div>
                                        <div class="progress-bar-bg"><div class="progress-bar"></div></div>
                                    </div>
                                    <div class="total-summary">
                                        <span>${t('Total Acumulado')}</span>
                                        <strong id="current-total-weight">0.00 kg</strong>
                                    </div>
                                </div>
                            </div>
                            <div class="control-section">
                                <div class="current-info-card">
                                    <h3 id="current-pallet-id">Pallet #---</h3>
                                    <p id="current-pallet-op">OP: ---</p>
                                </div>
                                <div class="boxes-list-container">
                                    <div class="section-header">
                                        <h4>${t('Últimas Caixas')}</h4>
                                    </div>
                                    <ul id="current-boxes-list"></ul>
                                </div>
                                <div class="action-buttons">
                                    <button id="close-pallet-btn" class="btn success large">${t('Encerrar Pallet')}</button>
                                    <button id="pause-production-btn" class="btn warning large">${t('Pausar Produção')}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <!-- Modals -->
            <div id="toast" class="toast"></div>

            <!-- Pallet Details Modal -->
            <div id="pallet-modal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>${t('Detalhes do Pallet')}</h2>
                        <button id="close-modal" class="close-btn">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="pallet-summary-mini">
                            <div><span class="sancay-label">${t('OP')}:</span> <strong id="modal-op" class="sancay-value"></strong></div>
                            <div><span class="sancay-label">${t('Material')}:</span> <strong id="modal-material" class="sancay-value"></strong></div>
                            <div><span class="sancay-label">${t('Data/Hora')}:</span> <strong id="modal-date" class="sancay-value"></strong></div>
                            <div class="mini-stats">
                                <div class="mini-stat"><span>${t('Caixas')}</span><strong id="modal-boxes" class="sancay-value"></strong></div>
                                <div class="mini-stat"><span>Peso Total</span><strong id="modal-weight" class="sancay-value"></strong></div>
                            </div>
                        </div>
                        <div class="boxes-table-container">
                            <h4>${t('Lista de Caixas')}</h4>
                            <table>
                                <thead>
                                    <tr>
                                        <th class="sancay-th">#</th>
                                        <th class="sancay-th">${t('Data/Hora')}</th>
                                        <th class="sancay-th">${t('Peso')}</th>
                                    </tr>
                                </thead>
                                <tbody id="modal-boxes-list"></tbody>
                            </table>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button id="edit-pallet-btn" class="btn primary">${t('Continuar Pallet')}</button>
                        <button id="print-pallet-btn" class="btn outline">${t('Imprimir Relatório')}</button>
                    </div>
                </div>
            </div>

            <!-- Modal for Filters -->
            <div id="filter-modal" class="modal">
                <div class="modal-content" style="max-width: 500px !important;">
                    <div class="modal-header">
                        <h2 style="display: flex !important; align-items: center !important; gap: 8px !important; margin: 0 !important;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 !important; padding: 0 !important;"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                            <span>${t('Filtros de Pesquisa')}</span>
                        </h2>
                        <button id="close-filter-modal" class="close-btn" style="background: none !important; border: none !important; font-size: 1.5rem !important; cursor: pointer !important;">×</button>
                    </div>
                    <div class="modal-body" style="padding: 1.5rem !important; display: block !important;">
                        <div class="form-group" style="margin-bottom: 1.25rem !important; display: block !important;">
                            <label for="filter-pallet-id" style="display: block !important; font-size: 0.8rem !important; font-weight: 700 !important; text-transform: uppercase !important; color: var(--text-muted) !important; margin-bottom: 6px !important; padding: 0 !important; text-align: left !important;">${t('ID do Pallet')}</label>
                            <input type="text" id="filter-pallet-id" placeholder="${t('Ex: 1-5/10')}" style="width: 100% !important; padding: 10px !important; border-radius: 8px !important; border: 1px solid var(--border-color) !important; background: #f8fafc !important; font-family: 'JetBrains Mono', monospace !important; font-size: 0.95rem !important; box-sizing: border-box !important;">
                        </div>
                        <div class="form-group" style="margin-bottom: 1.25rem !important; display: block !important;">
                            <label for="filter-op" style="display: block !important; font-size: 0.8rem !important; font-weight: 700 !important; text-transform: uppercase !important; color: var(--text-muted) !important; margin-bottom: 6px !important; padding: 0 !important; text-align: left !important;">${t('Ordem de Produção (OP)')}</label>
                            <input type="text" id="filter-op" placeholder="${t('Ex: 5/10')}" style="width: 100% !important; padding: 10px !important; border-radius: 8px !important; border: 1px solid var(--border-color) !important; background: #f8fafc !important; font-family: 'JetBrains Mono', monospace !important; font-size: 0.95rem !important; box-sizing: border-box !important;">
                        </div>
                        <div class="form-group" style="margin-bottom: 1.25rem !important; display: block !important;">
                            <label for="filter-item" style="display: block !important; font-size: 0.8rem !important; font-weight: 700 !important; text-transform: uppercase !important; color: var(--text-muted) !important; margin-bottom: 6px !important; padding: 0 !important; text-align: left !important;">${t('Código ou Descrição do Item')}</label>
                            <input type="text" id="filter-item" placeholder="${t('Ex: TST-PA01 ou Ração')}" style="width: 100% !important; padding: 10px !important; border-radius: 8px !important; border: 1px solid var(--border-color) !important; background: #f8fafc !important; font-size: 0.95rem !important; box-sizing: border-box !important;">
                        </div>
                        <div style="margin-bottom: 1.5rem !important; display: block !important;">
                            <label style="display: block !important; font-size: 0.8rem !important; font-weight: 700 !important; text-transform: uppercase !important; color: var(--text-muted) !important; margin-bottom: 6px !important; padding: 0 !important; text-align: left !important;">${t('Data de Criação (Período)')}</label>
                            <div style="display: flex !important; gap: 12px !important; align-items: center !important;">
                                <input type="date" id="filter-date-start" style="flex: 1 !important; padding: 10px !important; border-radius: 8px !important; border: 1px solid var(--border-color) !important; background: #f8fafc !important; font-size: 0.95rem !important; box-sizing: border-box !important;">
                                <span style="color: var(--text-muted) !important; font-weight: 600 !important; margin: 0 !important;">${t('até')}</span>
                                <input type="date" id="filter-date-end" style="flex: 1 !important; padding: 10px !important; border-radius: 8px !important; border: 1px solid var(--border-color) !important; background: #f8fafc !important; font-size: 0.95rem !important; box-sizing: border-box !important;">
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer" style="display: flex !important; justify-content: flex-end !important; gap: 12px !important; padding: 1rem 1.5rem !important; border-top: 1px solid var(--border-color) !important;">
                        <button id="clear-filter-btn" class="btn outline" style="padding: 10px 20px !important; border-radius: 8px !important; cursor: pointer !important;">${t('Limpar Filtros')}</button>
                        <button id="apply-filter-btn" class="btn primary" style="padding: 10px 20px !important; border-radius: 8px !important; cursor: pointer !important;">${t('Aplicar Filtros')}</button>
                    </div>
                </div>
            </div>

            <!-- Confirm Action Modal -->
            <div id="confirm-modal" class="modal">
                <div class="modal-content" style="max-width: 450px;">
                    <div class="modal-header">
                        <h2 style="display: flex; align-items: center; gap: 10px; color: var(--primary);">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                            ${t('Confirmação')}
                        </h2>
                    </div>
                    <div class="modal-body" style="padding: 2rem 0; text-align: center;">
                        <p id="confirm-msg" style="font-size: 1.1rem; color: var(--text-normal); font-weight: 500;"></p>
                    </div>
                    <div class="modal-footer" style="display: flex; gap: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
                        <button id="modal-cancel-action" class="btn outline" style="flex: 1;">${t('Cancelar')}</button>
                        <button id="modal-confirm-action" class="btn primary" style="flex: 1;">${t('Confirmar')}</button>
                    </div>
                </div>
            </div>

            <!-- Success/Finalization Modal -->
            <div id="success-modal" class="modal">
                <div class="modal-content success-content">
                    <div class="modal-header">
                        <h2>${t('Pallet Finalizado!')}</h2>
                    </div>
                    <div class="modal-body">
                        <p class="sancay-label">Pallet #<strong id="success-pallet-id" class="sancay-value"></strong>.</p>
                    </div>
                    <div class="modal-footer centered">
                        <button id="confirm-print-btn" class="btn primary">${t('Imprimir')}</button>
                        <button id="skip-print-btn" class="btn outline">${t('Voltar ao Painel')}</button>
                    </div>
                </div>
            </div>

            <!-- Modal para Autorização da Balança -->
            <div id="scale-auth-modal" class="modal">
                <div class="modal-content" style="max-width: 400px !important;">
                    <div class="modal-header">
                        <h2 style="display: flex !important; align-items: center !important; gap: 10px !important; margin: 0 !important; color: var(--primary) !important;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 !important;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                            <span>${t('Autorização de Gestor')}</span>
                        </h2>
                        <button id="close-scale-auth-modal" class="close-btn" style="background: none !important; border: none !important; font-size: 1.5rem !important; cursor: pointer !important;">×</button>
                    </div>
                    <div class="modal-body" style="padding: 1.5rem !important; display: block !important;">
                        <p style="margin-bottom: 1.25rem !important; font-size: 0.9rem !important; color: var(--text-secondary) !important;">${t('Insira as credenciais de gestor para alterar o status da balança.')}</p>
                        <div class="form-group" style="margin-bottom: 1rem !important; display: block !important;">
                            <label for="scale-auth-user" style="display: block !important; font-size: 0.8rem !important; font-weight: 700 !important; text-transform: uppercase !important; color: var(--text-muted) !important; margin-bottom: 6px !important; text-align: left !important;">${t('Usuário')}</label>
                            <input type="text" id="scale-auth-user" placeholder="${t('Digite o usuário')}" style="width: 100% !important; padding: 10px !important; border-radius: 8px !important; border: 1px solid var(--border-color) !important; background: #f8fafc !important; font-size: 0.95rem !important; box-sizing: border-box !important;">
                        </div>
                        <div class="form-group" style="margin-bottom: 1rem !important; display: block !important;">
                            <label for="scale-auth-pass" style="display: block !important; font-size: 0.8rem !important; font-weight: 700 !important; text-transform: uppercase !important; color: var(--text-muted) !important; margin-bottom: 6px !important; text-align: left !important;">${t('Senha')}</label>
                            <input type="password" id="scale-auth-pass" placeholder="${t('Digite a senha')}" style="width: 100% !important; padding: 10px !important; border-radius: 8px !important; border: 1px solid var(--border-color) !important; background: #f8fafc !important; font-size: 0.95rem !important; box-sizing: border-box !important;">
                        </div>
                    </div>
                    <div class="modal-footer" style="display: flex !important; gap: 12px !important; padding: 1rem 1.5rem !important; border-top: 1px solid var(--border-color) !important;">
                        <button id="cancel-scale-auth-btn" class="btn outline" style="flex: 1 !important; padding: 10px !important; border-radius: 8px !important; cursor: pointer !important;">${t('Cancelar')}</button>
                        <button id="confirm-scale-auth-btn" class="btn primary" style="flex: 1 !important; padding: 10px !important; border-radius: 8px !important; cursor: pointer !important;">${t('Autorizar')}</button>
                    </div>
                </div>
            </div>

            <!-- Excel-like Dynamic Dropdown positioned at the body level -->
            <div id="excel-filter-dropdown" class="excel-filter-dropdown is-hidden" onclick="event.stopPropagation()"></div>
        </div>

        <div id="print-area" class="print-only">
            <div class="print-card">
                <div class="print-header">
                    <h2>${t('Relatório de Fechamento')}</h2>
                </div>
                <div class="print-info">
                    <div class="info-row"><span class="sancay-label">${t('ID Pallet')}:</span> <strong id="print-id" class="sancay-value"></strong></div>
                    <div class="info-row"><span class="sancay-label">${t('OP')}:</span> <strong id="print-op" class="sancay-value"></strong></div>
                    <div class="info-row"><span class="sancay-label">${t('Material')}:</span> <strong id="print-material" class="sancay-value"></strong></div>
                    <div class="info-row"><span class="sancay-label">${t('Data/Hora')}:</span> <strong id="print-date" class="sancay-value"></strong></div>
                </div>
                <div class="print-stats">
                    <div class="stat-box"><span>${t('Caixas')}</span><h3 id="print-boxes" class="sancay-value"></h3></div>
                    <div class="stat-box"><span>${t('Peso Total')}</span><h3 id="print-weight" class="sancay-value"></h3></div>
                </div>
                <div class="print-table">
                    <table>
                        <thead>
                            <tr>
                                <th class="sancay-th">${t('SEQ')}</th>
                                <th class="sancay-th">${t('Data/Hora')}</th>
                                <th class="sancay-th">${t('Peso')}</th>
                            </tr>
                        </thead>
                        <tbody id="print-items-list"></tbody>
                    </table>
                </div>
                <div class="signatures">
                    <div class="sig">${t('Assinatura Operador')}</div>
                    <div class="sig">${t('Conferência / Supervisor')}</div>
                </div>
            </div>
        </div>
    `;
}
