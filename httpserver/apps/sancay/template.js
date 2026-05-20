export const PORTAL_HTML = `
    <div class="app-container">
        <div class="bg-overlay"></div>
        <nav class="sidebar">
            <div class="logo">
                <div class="logo-icon"></div>
                <span>Sancay<span>Prod</span></span>
            </div>
            <ul class="nav-links">
                <li class="active" data-view="dashboard">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                    Painel
                </li>
                <li data-view="new-pallet">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"></path></svg>
                    Novo Pallet
                </li>
                <li data-view="history">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Histórico
                </li>
            </ul>
            <div class="user-profile">
                <div class="avatar">OP</div>
                <div class="user-info">
                    <p class="name">Operador 01</p>
                    <p class="role">Fábrica</p>
                </div>
            </div>
        </nav>

        <main class="content">
            <header class="top-header">
                <h1 id="view-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                    Painel de Controle
                </h1>
                <div class="system-status" id="toggle-scale-status" style="cursor: pointer;">
                    <span class="status-dot online" id="scale-status-dot"></span>
                    <span id="scale-status-text">Balança Conectada</span>
                </div>
            </header>

            <section id="dashboard" class="view active">
                <div class="stats-grid">
                    <div class="stat-card">
                        <p class="label"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 12 12 17 22 12"></polyline><polyline points="2 17 12 22 22 17"></polyline></svg> Pallets Ativos</p>
                        <p class="value" id="active-pallets-count">0</p>
                    </div>
                    <div class="stat-card">
                        <p class="label"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg> Caixas Hoje</p>
                        <p class="value" id="today-boxes-count">0</p>
                    </div>
                    <div class="stat-card">
                        <p class="label"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg> Produção Total (kg)</p>
                        <p class="value" id="total-weight-count">0.00</p>
                    </div>
                </div>
                <div class="section-header">
                    <h2 style="display: flex; align-items: center; gap: 0.75rem;"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> Pallets Em Processo</h2>
                </div>
                <div class="pallets-grid" id="active-pallets-list"></div>
            </section>

            <section id="new-pallet" class="view">
                <div class="form-container">
                    <h2>Configurar Novo Pallet</h2>
                    <div class="form-group">
                        <label for="op-select">Ordem de Produção (OP)</label>
                        <select id="op-select">
                            <option value="">Selecione a OP...</option>
                            <option value="OP-2024-001">OP-2024-001 - Ração Frango Starter</option>
                            <option value="OP-2024-002">OP-2024-002 - Ração Bovino Elite</option>
                            <option value="OP-2024-003">OP-2024-003 - Ração Suíno Crescimento</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="material-type">Tipo de Embalagem</label>
                        <input type="text" id="material-type" readonly placeholder="Aguardando OP...">
                    </div>
                    <button id="start-pallet-btn" class="btn primary">Iniciar Pallet</button>
                </div>
            </section>

            <section id="process-view" class="view">
                <div class="process-layout">
                    <div class="left-panel">
                        <div class="pallet-info-card">
                            <div class="badge">EM PROCESSO</div>
                            <h3 id="current-pallet-id">Pallet #---</h3>
                            <p id="current-pallet-op">OP: ---</p>
                            <div class="progress-container"><div class="progress-bar" style="width: 0%"></div></div>
                            <div class="pallet-stats">
                                <div><span>Caixas</span><strong id="current-box-count">0</strong></div>
                                <div><span>Peso Total</span><strong id="current-total-weight">0.0 kg</strong></div>
                            </div>
                        </div>
                        <div class="box-list-container">
                            <h4>Últimas Caixas</h4>
                            <ul id="current-boxes-list"></ul>
                        </div>
                    </div>
                    <div class="right-panel">
                        <div class="scale-display">
                            <p class="scale-label" id="scale-label">PESO ATUAL</p>
                            <div class="weight-value">
                                <span id="live-weight">0.00</span>
                                <input type="number" id="manual-weight-input" class="manual-input" placeholder="0.00" step="0.01" style="display: none;">
                                <small>kg</small>
                            </div>
                            <div class="scale-controls">
                                <button id="simulate-weight" class="btn outline">Simular Balança</button>
                            </div>
                        </div>
                        <div class="action-buttons">
                            <button id="register-box-btn" class="btn primary large">REGISTRAR CAIXA</button>
                            <div class="secondary-actions">
                                <button id="pause-production-btn" class="btn warning">PAUSAR PRODUÇÃO</button>
                                <button id="close-pallet-btn" class="btn danger">ENCERRAR PALLET</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="history" class="view">
                <div class="section-header"><h2>Histórico de Pallets Encerrados</h2></div>
                <div class="table-container">
                    <table>
                        <thead><tr><th>ID Pallet</th><th>Data/Hora</th><th>OP</th><th>Caixas</th><th>Peso Total</th><th>Status</th></tr></thead>
                        <tbody id="history-list"></tbody>
                    </table>
                </div>
            </section>
        </main>
    </div>

    <!-- Modals -->
    <div id="pallet-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header"><h2>Detalhes</h2><button id="close-modal" class="close-btn">&times;</button></div>
            <div class="modal-body">
                <div class="pallet-summary-mini">
                    <p><strong>OP:</strong> <span id="modal-op">---</span></p>
                    <p><strong>Material:</strong> <span id="modal-material">---</span></p>
                    <p><strong>Data/Hora:</strong> <span id="modal-date">---</span></p>
                    <div class="mini-stats">
                        <div class="mini-stat"><span>Caixas</span><strong id="modal-boxes">0</strong></div>
                        <div class="mini-stat"><span>Peso Total</span><strong id="modal-weight">0.00 kg</strong></div>
                    </div>
                </div>
                <div class="boxes-table-container"><h4>Lista de Caixas</h4><table><thead><tr><th>#</th><th>Hora</th><th>Peso</th></tr></thead><tbody id="modal-boxes-list"></tbody></table></div>
            </div>
            <div class="modal-footer">
                <button id="edit-pallet-btn" class="btn primary">Continuar</button>
                <button id="print-pallet-btn" class="btn outline">Imprimir</button>
            </div>
        </div>
    </div>

    <div id="confirm-modal" class="modal">
        <div class="modal-content confirm-content">
            <div class="modal-header"><h2>Confirmação</h2></div>
            <div class="modal-body"><p id="confirm-msg"></p></div>
            <div class="modal-footer">
                <button id="modal-confirm-action" class="btn danger">Confirmar</button>
                <button id="modal-cancel-action" class="btn outline">Cancelar</button>
            </div>
        </div>
    </div>

    <div id="toast" class="toast"></div>

    <div id="success-modal" class="modal">
        <div class="modal-content success-content">
            <div class="success-header"><h2>Pallet Finalizado!</h2></div>
            <div class="success-body"><p>Pallet #<strong id="success-pallet-id"></strong> encerrado.</p></div>
            <div class="modal-footer centered">
                <button id="confirm-print-btn" class="btn primary">Imprimir</button>
                <button id="skip-print-btn" class="btn outline">Voltar</button>
            </div>
        </div>
    </div>

    <div id="print-area" class="print-only">
        <div class="print-card">
            <div class="print-header"><h2>Relatório de Fechamento</h2></div>
            <div class="print-info">
                <div class="info-row"><span>ID:</span> <strong id="print-id"></strong></div>
                <div class="info-row"><span>OP:</span> <strong id="print-op"></strong></div>
                <div class="info-row"><span>MATERIAL:</span> <strong id="print-material"></strong></div>
                <div class="info-row"><span>DATA:</span> <strong id="print-date"></strong></div>
            </div>
            <div class="print-stats">
                <div class="stat-box"><span>CAIXAS</span> <h3 id="print-boxes"></h3></div>
                <div class="stat-box"><span>PESO</span> <h3 id="print-weight"></h3></div>
            </div>
            <div class="print-table"><table><thead><tr><th>SEQ</th><th>HORA</th><th>PESO</th></tr></thead><tbody id="print-items-list"></tbody></table></div>
        </div>
    </div>
`;
