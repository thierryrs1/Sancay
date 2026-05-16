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
                    <div class="header-right">
                        <div id="toggle-scale-status" class="scale-status">
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
                            <div class="section-header">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                <h3>${t('Pallets Em Processo')}</h3>
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
                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th class="sancay-th">${t('ID')}</th>
                                        <th class="sancay-th">${t('Data/Hora')}</th>
                                        <th class="sancay-th">${t('OP')}</th>
                                        <th class="sancay-th">${t('Caixas')}</th>
                                        <th class="sancay-th">${t('Peso Total')}</th>
                                        <th class="sancay-th">${t('Status')}</th>
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
                                    <button id="pause-production-btn" class="btn outline">${t('Pausar Produção')}</button>
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
                                        <th class="sancay-th">${t('Hora')}</th>
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
                                <th class="sancay-th">${t('Hora')}</th>
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
