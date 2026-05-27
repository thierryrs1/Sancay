import { getData, serviceLayerPost, serviceLayerGet } from './api.js';
import { formatBoxDateTime } from './interface.js';

export function fetchPendingPallets() {
    const _this = this;
    getData('getAux', 'getPalletsPendentes&dg_limit=1000', '', (err, data) => {
        if (err) {
            console.error('Erro ao buscar pallets pendentes:', err);
            _this.sapActivePallets = _this.pallets.filter(p => p.status === 'Em processo');
            _this.renderDashboard();
            _this.updateStats();
            return;
        }

        const sapPallets = (data && data.value) ? data.value : (Array.isArray(data) ? data : [data]);

        // Buscar ordens de produção da Service Layer para ver quais estão abertas (Closed eq false)
        serviceLayerGet('/odata4/v1/WorkorderPos?$filter=Closed eq false', {}, (errWo, woData) => {
            let openOPs = new Set();
            if (!errWo && woData && Array.isArray(woData.value)) {
                woData.value.forEach(item => {
                    openOPs.add(`${item.DocEntry}/${item.LineNumber}`.replace(/\s+/g, ''));
                });
            } else if (errWo) {
                console.error('Erro ao buscar ordens de produção da Service Layer:', errWo);
            }

            // Mapear os pallets básicos do SAP
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
                    totalWeight: parseFloat(p[3] || p.Peso || 0),
                    itemCode: ''
                };
            });

            // Filtrar os que possuem OP aberta (se a lista falhar por erro de rede, mantém todos por segurança)
            const filteredPallets = mappedPallets.filter(pallet => {
                if (!pallet.op) return true;
                const cleanOP = pallet.op.toString().replace(/\s+/g, '');
                if (errWo) return true; // Falha segura: mostra tudo se a API de OPs cair
                return openOPs.has(cleanOP);
            });

            // Buscar o itemCode de forma dinâmica para cada pallet
            const promises = filteredPallets.map(pallet => {
                return new Promise((resolve) => {
                    // Tenta achar localmente na lista carregada
                    const localOP = _this.productionOrders && _this.productionOrders.find(o => {
                        const opA = `${o[0]}/${o[1]}`.replace(/\s+/g, '');
                        const opB = pallet.op.toString().replace(/\s+/g, '');
                        return opA === opB;
                    });

                    if (localOP) {
                        pallet.itemCode = localOP[2];
                        pallet.material = localOP[3] || '';
                        resolve();
                    } else {
                        // Busca direto no SAP/Beas se não encontrar local
                        const opParts = pallet.op.split('/');
                        if (opParts.length === 2) {
                            const opDados = `@${opParts[0]}@@${opParts[1]}@`;
                            getData('getAux', 'getItem', opDados, (err, itemData) => {
                                if (!err && itemData) {
                                    if (itemData.value && itemData.value[0]) {
                                        pallet.itemCode = itemData.value[0][0] || '';
                                        pallet.material = itemData.value[0][1] || ''; // a segunda coluna!
                                    } else {
                                        const item = Array.isArray(itemData) ? itemData[0] : itemData;
                                        pallet.itemCode = item || '';
                                        pallet.material = '';
                                    }
                                }
                                resolve();
                            });
                        } else {
                            resolve();
                        }
                    }
                });
            });

            // Espera todos os itemCodes serem resolvidos para renderizar a tela
            Promise.all(promises).then(() => {
                if (!window.app) window.app = {};
                if (!window.app.appData) window.app.appData = {};
                window.app.appData.pendingPallets = filteredPallets;

                _this.sapActivePallets = filteredPallets;
                _this.renderDashboard();
                _this.updateStats();
            });
        });
    });
}

export function fetchProductionOrders() {
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
        _this.renderDashboard();
    });
}

export async function startNewPallet() {
    if (!window.appInfo || !window.appInfo.sapUserCode) {
        this.showToast(this._t('Colaborador não possui usuário SAP cadastrado'));
        return;
    }

    if (!window.app.appData.selectedOrder) {
        this.showToast(this._t('Selecione uma OP primeiro.'));
        return;
    }

    const op = window.app.appData.selectedOrder;

    try {
        document.getElementById('bs-loading').classList.remove('is-hidden');

        let palletCode = `${op[9]}-${op[0]}/${op[1]}`; // Fallback original

        try {
            const nextPalletRes = await fetch('http://192.168.30.14:9908/api/v1/createWMSCode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: "PLP", quantity: 1 })
            });

            if (nextPalletRes.ok) {
                const data = await nextPalletRes.json();
                if (data.codes && Array.isArray(data.codes) && data.codes.length > 0) {
                    palletCode = data.codes[0];
                } else {
                    // Fallback para as chaves comuns caso a estrutura varie
                    palletCode = data.code || data.palletCode || data.nextPallet || data.nextCode || data.id || data.value || data.nextNumber || data;
                    if (typeof palletCode === 'object' && palletCode !== null) {
                        palletCode = Object.values(palletCode)[0];
                    }
                }
            }
        } catch (apiErr) {
            console.warn('Erro ao chamar API createWMSCode, usando código fallback.', apiErr);
        }

        const palletPayload = {
            "U_SPS_Tipo": "PALLET",
            "U_SPS_OPCode": `${op[0]}/${op[1]}`,
            "U_SPS_BELNR_ID": Number(op[0]),
            "U_SPS_BELPOS_ID": Number(op[1]),
            "U_SPS_PalletCode": palletCode.toString(),
            "U_SPS_Status": "ABERTO",
            "U_SPS_QRCode": palletCode.toString(),
            "U_SPS_ExpectedQty": parseFloat(op[13]) || (parseFloat(op[4] || 0) / parseFloat(op[6] || 1)),
            "U_SPS_WhsCode": op[10] ? op[10].toString() : "",
            "U_SPS_AbsEntry": op[11] ? op[11].toString() : "",
            "U_SPS_CreateUser": window.appInfo.sapUserCode || "manager",
            "U_SPS_Printed": "N"
        };

        try {
            const response = await fetch('http://192.168.30.14:9908/api/v1/genneratePallet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(palletPayload)
            });

            const res = await response.json();

            document.getElementById('bs-loading').classList.add('is-hidden');
            this.showToast(this._t('Pallet gerado com sucesso!'));

            const newPallet = {
                id: palletPayload.U_SPS_PalletCode,
                docEntry: res.DocEntry || res.AbsoluteEntry,
                op: `${op[0]}/${op[1]}`,
                itemCode: op[2],
                material: op[3],
                expectedQty: parseFloat(op[4] || 0) / parseFloat(op[6] || 1),
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

    } catch (error) {
        console.error('Erro geral ao iniciar pallet:', error);
        document.getElementById('bs-loading').classList.add('is-hidden');
    }
}

export function startProcess(pallet) {
    this.currentPallet = pallet;
    this.updateProcessView();
    this.switchView('process-view');
}

export function updateProcessView() {
    if (!this.currentPallet) return;
    document.getElementById('current-pallet-id').textContent = `${this._t('Pallet')} #${this.currentPallet.id}`;
    document.getElementById('current-pallet-op').textContent = `${this._t('OP')}: ${this.currentPallet.op} | ${this.currentPallet.material}`;

    const currentCount = this.currentPallet.boxes.length;
    const totalWeight = this.currentPallet.boxes.reduce((s, b) => s + (parseFloat(b.weight) || 0), 0);
    const expected = this.currentPallet.expectedQty || 0;
    const progressPercent = expected > 0 ? Math.min((totalWeight / expected) * 100, 100) : 0;

    document.getElementById('current-box-count').textContent = `${totalWeight.toFixed(2)} kg / ${expected.toFixed(2)} kg (${progressPercent.toFixed(1)}%)`;
    if (this.el.progressBar) {
        this.el.progressBar.style.width = `${progressPercent}%`;
    }

    const boxList = document.getElementById('current-boxes-list');
    boxList.innerHTML = [...this.currentPallet.boxes].reverse().map((box, index) => {
        const actualIndex = this.currentPallet.boxes.length - 1 - index;

        const statusValue = (box.status || 'EMPESAGEM').toUpperCase();
        let statusLabel = 'Em pesagem';
        let badgeStyle = 'background: rgba(245, 158, 11, 0.1) !important; color: #f59e0b !important; border: 1px solid rgba(245, 158, 11, 0.2) !important;';

        if (statusValue === 'PESADO') {
            statusLabel = 'Pesado';
            badgeStyle = 'background: rgba(59, 130, 246, 0.1) !important; color: #3b82f6 !important; border: 1px solid rgba(59, 130, 246, 0.2) !important;';
        } else if (statusValue === 'APONTADO') {
            statusLabel = 'Apontado';
            badgeStyle = 'background: rgba(34, 197, 94, 0.1) !important; color: #22c55e !important; border: 1px solid rgba(34, 197, 94, 0.2) !important;';
        }

        const actionHtml = statusValue === 'APONTADO'
            ? `<div style="width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; color: var(--text-muted) !important;" title="${this._t('Caixa já apontada (não pode ser excluída)')}">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted) !important;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
               </div>`
            : `<button class="delete-box-btn" onclick="deleteBox(${actualIndex})" style="background: none !important; border: none !important; color: #ef4444 !important; cursor: pointer !important; padding: 4px !important; display: flex !important; align-items: center !important; justify-content: center; transition: color 0.2s !important;" onmouseover="this.style.color='#b91c1c'" onmouseout="this.style.color='#ef4444'" title="${this._t('Excluir Caixa')}">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
               </button>`;

        return `<li style="display: flex !important; justify-content: space-between !important; align-items: center !important; padding: 12px 16px !important; background: #ffffff !important; border: 1px solid var(--border-color) !important; border-radius: 8px !important; margin-bottom: 8px !important; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02) !important;">
            <div style="display: flex !important; align-items: center !important; gap: 12px !important;">
                <span style="font-weight: 700 !important; color: var(--text-strong) !important; font-size: 0.95rem !important;">${this._t('Caixa')} #${actualIndex + 1}</span>
                <span class="badge" style="${badgeStyle} font-size: 0.7rem !important; padding: 2px 8px !important; border-radius: 12px !important; font-weight: 700 !important; text-transform: uppercase !important; letter-spacing: 0.03em !important;">${this._t(statusLabel)}</span>
            </div>
            <div style="display: flex !important; align-items: center !important; gap: 16px !important;">
                <span class="box-weight" style="font-family: 'JetBrains Mono', monospace !important; font-weight: 700 !important; color: var(--text-strong) !important; font-size: 0.95rem !important;">${box.weight.toFixed(2)} kg</span>
                ${actionHtml}
            </div>
        </li>`;
    }).join('');
    document.getElementById('current-total-weight').textContent = `${this.currentPallet.totalWeight.toFixed(2)} kg`;
}

export async function registerBox() {
    if (!this.currentPallet) return;
    let weight = this.isScaleConnected ? parseFloat(this.el.liveWeightDisplay.textContent) : parseFloat(this.el.manualWeightInput.value);
    if (isNaN(weight) || weight <= 0) return this.showToast(this._t('Peso inválido!'));

    const newBox = {
        weight,
        timestamp: new Date().toISOString()
    };

    this.currentPallet.boxes.push(newBox);
    this.currentPallet.totalWeight = this.currentPallet.boxes.reduce((sum, b) => sum + b.weight, 0);

    if (!this.isScaleConnected) {
        this.el.manualWeightInput.value = '';
        this.el.manualWeightInput.focus();
    }

    try {
        document.getElementById('bs-loading').classList.remove('is-hidden');

        const now = new Date();
        const createTime = now.getHours() * 100 + now.getMinutes();

        let boxCode = `CX-${Date.now()}`; // Fallback original

        try {
            const nextBoxRes = await fetch('http://192.168.30.14:9908/api/v1/createWMSCode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: "CX", quantity: 1 })
            });

            if (nextBoxRes.ok) {
                const data = await nextBoxRes.json();
                let extractedCode = null;
                if (data.codes && Array.isArray(data.codes) && data.codes.length > 0) {
                    extractedCode = data.codes[0];
                } else {
                    extractedCode = data.code || data.palletCode || data.nextPallet || data.nextCode || data.id || data.value || data.nextNumber || data;
                    if (typeof extractedCode === 'object' && extractedCode !== null) {
                        extractedCode = Object.values(extractedCode)[0];
                    }
                }

                if (extractedCode) {
                    boxCode = extractedCode.toString();
                }
            }
        } catch (apiErr) {
            console.warn('Erro ao chamar API createWMSCode (CX), usando código fallback.', apiErr);
        }

        const boxNum = this.currentPallet.boxes.length;

        let tare = this.scaleTare || 0;
        if (!this.isScaleConnected && !this.scaleManualMode) {
            tare = 0; // Se não tiver nada conectado, nem manual
        }

        let distNumber = this.currentPallet.op;
        try {
            const opBelnr = Number(this.currentPallet.op.split('/')[0]);
            const batchRes = await fetch('http://192.168.30.14:9908/api/v1/getOrderBatch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ U_SPS_BELNR_ID: opBelnr })
            });
            if (batchRes.ok) {
                const batchData = await batchRes.json();
                if (batchData && batchData.DistNumber) {
                    distNumber = batchData.DistNumber;
                }
            }
        } catch (e) {
            console.warn('Erro ao buscar DistNumber da OP:', e);
        }

        const updatePayload = {
            "DocEntry": this.currentPallet.docEntry,
            "U_SPS_Tipo": "PALLET",
            "U_SPS_OPCode": this.currentPallet.op,
            "U_SPS_BELNR_ID": Number(this.currentPallet.op.split('/')[0]),
            "U_SPS_BELPOS_ID": Number(this.currentPallet.op.split('/')[1]),
            "U_SPS_PalletCode": this.currentPallet.id,
            "U_SPS_Status": "EM PROCESSO",
            "U_SPS_Origem": "PRODUCTION",
            "SPS_PALLET_GROUP_LCollection": [
                {
                    "U_SPS_OPCode": this.currentPallet.op,
                    "U_SPS_BELNR_ID": Number(this.currentPallet.op.split('/')[0]),
                    "U_SPS_BELPOS_ID": Number(this.currentPallet.op.split('/')[1]),
                    "U_SPS_ItemCode": this.currentPallet.itemCode || "",
                    "U_SPS_DistNumber": distNumber,
                    "U_SPS_BoxCode": boxCode,
                    "U_SPS_BoxWeight": weight,
                    "U_SPS_Tare": tare,
                    "U_SPS_BoxQRCode": boxCode,
                    "U_SPS_Status": "EMPESAGEM",
                    "U_SPS_CreateDate": now.toISOString().split('T')[0],
                    "U_SPS_CreateTime": createTime,
                    "U_SPS_CreateUser": window.appInfo.sapUserCode || "manager",
                    "U_SPS_Printed": "Y"
                }
            ]
        };

        console.log('📦 Payload Registrar Caixa:', JSON.stringify(updatePayload, null, 2));

        const response = await fetch('http://192.168.30.14:9908/api/v1/updatePallet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatePayload)
        });

        const res = await response.json();
        if (!response.ok || (res.error)) {
            console.error('Erro na API updatePallet:', res);
            throw new Error(res.error ? res.error.message.value : 'Erro ao atualizar pallet no SAP');
        }

        document.getElementById('bs-loading').classList.add('is-hidden');
        this.showToast(this._t('Caixa registrada'));

        // Pega o LineId retornado (tenta achar no retorno da API ou usa o tamanho atual do array como aproximação)
        let lineId = '';
        if (res && res.SPS_PALLET_GROUP_LCollection && res.SPS_PALLET_GROUP_LCollection.length > 0) {
            const l = res.SPS_PALLET_GROUP_LCollection;
            lineId = l[l.length - 1].LineId;
        } else if (res && res.data && res.data.SPS_PALLET_GROUP_LCollection && res.data.SPS_PALLET_GROUP_LCollection.length > 0) {
            const l = res.data.SPS_PALLET_GROUP_LCollection;
            lineId = l[l.length - 1].LineId;
        } else {
            // Tentativa de fallback, caso a API não devolva as linhas. Geralmente LineId é o tamanho atual ou índice (zero-based).
            lineId = this.currentPallet.boxes.length;
        }

        // Aciona impressão da caixa
        this.printBoxLabel(this.currentPallet.docEntry, lineId);
    } catch (err) {
        console.error('Erro ao sincronizar caixa com SAP:', err);
        document.getElementById('bs-loading').classList.add('is-hidden');
        this.showToast(this._t('Erro ao sincronizar com SAP. Mantido localmente.'));
    }

    this.saveData();
    this.updateProcessView();
    this.updateStats();
}

export function closePallet() {
    if (!this.currentPallet) return;

    this.showConfirm(`${this._t('Encerrar Pallet')} #${this.currentPallet.id}?`, async () => {
        // Pré-construir e exibir o JSON que será enviado para a API no Patch/Post (útil para Postman)
        const patchTestPayload = {
            "DocEntry": this.currentPallet.docEntry,
            "U_SPS_Tipo": "PALLET",
            "U_SPS_OPCode": this.currentPallet.op,
            "U_SPS_BELNR_ID": Number(this.currentPallet.op.split('/')[0]),
            "U_SPS_BELPOS_ID": Number(this.currentPallet.op.split('/')[1]),
            "U_SPS_PalletCode": this.currentPallet.id,
            "U_SPS_Status": "FINALIZADO",
            "U_SPS_UpdateUser": "manager",
            "U_SPS_Printed": "Y",
            "SPS_PALLET_GROUP_LCollection": []
        };
        document.getElementById('bs-loading').classList.remove('is-hidden');

        const palletCode = this.currentPallet.id;

        try {
            // ETAPA 1: Mudar de EMPESAGEM para PESADO
            await new Promise((resolve, reject) => {
                getData('postAux', 'postPesado', palletCode, (err, res) => {
                    if (err) reject(new Error('Erro ao marcar como PESADO: ' + err.message));
                    else resolve(res);
                });
            });

            // ETAPA 2: Gerar o Receipt na Service Layer
            const apontamentoOk = await this.apontarProducao();
            if (!apontamentoOk) throw new Error('Falha ao gerar Receipt na Service Layer.');

            // ETAPA 3: Mudar de PESADO para APONTADO
            await new Promise((resolve, reject) => {
                getData('postAux', 'postApontado', palletCode, (err, res) => {
                    if (err) reject(new Error('Erro ao marcar como APONTADO: ' + err.message));
                    else resolve(res);
                });
            });

            // ETAPA 4: Atualizar o cabeçalho do Pallet para FINALIZADO no SAP
            const updatePayload = {
                "DocEntry": this.currentPallet.docEntry,
                "U_SPS_Tipo": "PALLET",
                "U_SPS_OPCode": this.currentPallet.op,
                "U_SPS_BELNR_ID": Number(this.currentPallet.op.split('/')[0]),
                "U_SPS_BELPOS_ID": Number(this.currentPallet.op.split('/')[1]),
                "U_SPS_PalletCode": this.currentPallet.id,
                "U_SPS_Status": "FINALIZADO",
                "U_SPS_UpdateUser": "manager",
                "U_SPS_Printed": "Y",
                "SPS_PALLET_GROUP_LCollection": []
            };

            const response = await fetch('http://192.168.30.14:9908/api/v1/updatePallet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatePayload)
            });

            if (!response.ok) {
                throw new Error('Erro ao atualizar status do pallet para FINALIZADO no SAP.');
            }

            // Lógica local de finalização
            this.currentPallet.status = 'Finalizado';
            this.currentPallet.endTime = new Date().toISOString();
            this.saveData();
            this.lastClosedPallet = { ...this.currentPallet };
            this.currentPallet = null;
            this.fetchPendingPallets(); // Atualiza a tela automaticamente trazendo os dados novos do SAP!
            this.renderHistory();
            this.switchView('dashboard'); // Volta para a tela inicial (Painel) no background!

            this.showToast(this._t('Pallet encerrado e apontado com sucesso!'));

            document.getElementById('success-pallet-id').textContent = this.lastClosedPallet.id;
            this.el.successModal.classList.add('active');

        } catch (err) {
            console.error('Falha no encerramento/apontamento do pallet:', err);
            this.showToast(err.message);
        } finally {
            document.getElementById('bs-loading').classList.add('is-hidden');
        }
    });
}

export async function apontarProducao() {
    return new Promise((resolve) => {
        const dados = this.currentPallet.id;

        getData('postAux', 'apontaPesados', dados, (err, payload) => {
            if (err || !payload) {
                console.error('Erro ao buscar JSON de apontamento:', err);
                this.showToast(this._t('Erro ao gerar apontamento.'));
                return resolve(false);
            }

            let receiptPayload;
            try {
                const rawString = (payload && payload.value && payload.value[0]) ? payload.value[0][0] : null;

                if (!rawString || rawString.trim() === "" || rawString === "{}") {
                    this.showToast(this._t('Nenhum apontamento pendente.'));
                    return resolve(true);
                }

                receiptPayload = JSON.parse(rawString);
            } catch (parseErr) {
                console.error('Erro ao extrair o JSON do Receipt:', parseErr);
                this.showToast(this._t('Erro na estrutura do apontamento.'));
                return resolve(false);
            }

            serviceLayerPost('/odata4/v1/Receipt', receiptPayload, (sErr, result) => {
                if (sErr) {
                    console.error('Erro no apontamento Service Layer:', sErr, result);
                    this.showToast(this._t('Erro no apontamento da Service Layer.'));
                    resolve(false);
                } else {
                    this.showToast(this._t('Produção apontada com sucesso!'));
                    resolve(true);
                }
            });
        });
    });
}

export function pauseProduction() {
    if (!this.currentPallet) return;

    this.showConfirm(this._t('Tem certeza que deseja pausar e apontar a produção?'), async () => {
        document.getElementById('bs-loading').classList.remove('is-hidden');

        const palletCode = this.currentPallet.id;

        try {
            await new Promise((resolve, reject) => {
                getData('postAux', 'postPesado', palletCode, (err, res) => {
                    if (err) reject(new Error('Erro ao marcar como PESADO: ' + err.message));
                    else resolve(res);
                });
            });

            const apontamentoOk = await this.apontarProducao();
            if (!apontamentoOk) throw new Error('Falha ao gerar Receipt na Service Layer.');

            await new Promise((resolve, reject) => {
                getData('postAux', 'postApontado', palletCode, (err, res) => {
                    if (err) reject(new Error('Erro ao marcar como APONTADO: ' + err.message));
                    else resolve(res);
                });
            });

            this.showToast(this._t('Produção pausada e apontada com sucesso!'));

            this.saveData();
            this.currentPallet = null;
            this.switchView('dashboard');

        } catch (err) {
            console.error('Falha no fluxo de pausa/apontamento:', err);
            this.showToast(err.message);
        } finally {
            document.getElementById('bs-loading').classList.add('is-hidden');
        }
    });
}

export async function openActivePallet(id) {
    if (!window.appInfo || !window.appInfo.sapUserCode) {
        this.showToast(this._t('Colaborador não possui usuário SAP cadastrado'));
        return;
    }

    const p = (this.sapActivePallets || []).find(p => p.id === id) || this.pallets.find(p => p.id === id);
    if (!p) return;

    try {
        document.getElementById('bs-loading').classList.remove('is-hidden');

        const response = await fetch('http://192.168.30.14:9908/api/v1/getPallet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "U_SPS_PalletCode": p.id })
        });

        const sapData = await response.json();

        if (sapData) {
            p.docEntry = sapData.DocEntry;
            p.expectedQty = sapData.U_SPS_ExpectedQty;

            if (!p.itemCode) {
                const opParts = p.op.split('/');
                const opDados = `@${opParts[0]}@@${opParts[1]}@`;

                await new Promise((resolve) => {
                    getData('getAux', 'getItem', opDados, (err, itemData) => {
                        if (!err && itemData) {
                            if (itemData.value && itemData.value[0]) {
                                p.itemCode = itemData.value[0][0] || '';
                                p.material = itemData.value[0][1] || ''; // A descrição do item!
                            } else {
                                const item = Array.isArray(itemData) ? itemData[0] : itemData;
                                p.itemCode = item || '';
                                p.material = '';
                            }
                        }
                        resolve();
                    });
                });
            }

            if (sapData.SPS_PALLET_GROUP_LCollection) {
                p.boxes = sapData.SPS_PALLET_GROUP_LCollection
                    .filter(l => l.U_SPS_Status !== 'REMOVIDO')
                    .map(l => ({
                        lineId: l.LineId,
                        weight: parseFloat(l.U_SPS_BoxWeight || 0),
                        time: l.U_SPS_CreateDate,
                        code: l.U_SPS_BoxCode,
                        status: l.U_SPS_Status || 'EMPESAGEM',
                        timestamp: l.U_SPS_CreateDate || new Date().toISOString(),
                        createTime: l.U_SPS_CreateTime
                    }));

                p.totalWeight = p.boxes.reduce((sum, box) => sum + box.weight, 0);
            }
        }

        document.getElementById('bs-loading').classList.add('is-hidden');
        this.startProcess(p);
    } catch (err) {
        console.error('Erro ao buscar detalhes do pallet:', err);
        document.getElementById('bs-loading').classList.add('is-hidden');
        this.startProcess(p);
    }
}

export function printCurrentViewedPallet() {
    const p = (this.sapClosedPallets && this.sapClosedPallets.find(x => x.id === this.viewedPalletId)) || this.pallets.find(p => p.id === this.viewedPalletId);
    if (p) this.printPallet(p);
}

export async function printPallet(p) {
    if (!this.userSettings || !this.userSettings.printer || !this.userSettings.label) {
        this.showToast(this._t('Atenção: Configure a impressora e modelo de etiqueta na aba Configurações primeiro!'));
        return;
    }

    const langSelect = document.getElementById('print-language');
    const lang = langSelect ? langSelect.value : 'PTB';
    const params = `@${p.id}@@${lang}@`;

    document.getElementById('bs-loading').classList.remove('is-hidden');

    // Busca os dados da etiqueta chamando a procedure no Beas
    getData('getAux', 'getEtiquetaPallet', params, async (err, res) => {
        if (err) {
            document.getElementById('bs-loading').classList.add('is-hidden');
            console.error('Erro ao buscar dados da etiqueta no SAP:', err);
            this.showToast(this._t('Erro ao buscar dados da etiqueta no banco.'));
            return;
        }

        if (!res || !res.value || !res.value[0]) {
            console.error('Retorno inválido do SAP:', res);
            this.showToast(this._t('Erro: Dados da etiqueta em branco ou inválidos.'));
            document.getElementById('bs-loading').classList.add('is-hidden');
            return;
        }

        const rawRow = res.value[0];
        const formattedLabel = {
            PalletCode: rawRow[0] || '',
            Tipo: rawRow[1] || '',
            TotalAmount: rawRow[2] || '',
            NetWeight: rawRow[3] || '',
            PackingList: rawRow[4] || '',
            QrCode: rawRow[5] || '',
            Resume: rawRow[6] || ''
        };

        const printPayload = {
            printerCode: this.userSettings.printer,
            labelCode: this.userSettings.label,
            labelData: [formattedLabel]
        };


        try {
            const token = "U2FsdGVkX19Gz7grIE7ieIrDDcycyVrv4q6BdEq2Ep4hKfnb5WQ6haI+KNVo4l8KX9YRrkDHUgkMRbJhirVYMA==";
            const response = await fetch('http://190.128.212.242:9906/print/labels', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(printPayload)
            });

            if (!response.ok) {
                throw new Error(`Erro API: ${response.status}`);
            }

            this.showToast(this._t('Etiqueta enviada para impressão com sucesso!'));
        } catch (printErr) {
            console.error('Erro ao imprimir etiqueta:', printErr);
            this.showToast(this._t('Erro ao conectar com servidor de impressão.'));
        } finally {
            document.getElementById('bs-loading').classList.add('is-hidden');
        }
    });
}

export function deleteBox(idx) {
    if (!this.currentPallet || !this.currentPallet.boxes[idx]) return;
    const box = this.currentPallet.boxes[idx];

    if (box.status && box.status.toUpperCase() === 'APONTADO') {
        this.showToast(this._t('Caixas já apontadas no SAP não podem ser excluídas!'));
        return;
    }

    this.showConfirm(`${this._t('Excluir Caixa')} #${idx + 1}?`, () => {
        document.getElementById('bs-loading').classList.remove('is-hidden');

        const docEntry = this.currentPallet.docEntry;
        const lineNum = box.lineId;
        const dadosExclusao = `@${docEntry}@@${lineNum}@`;

        getData('postAux', 'deletaCaixa', dadosExclusao, (err, res) => {
            document.getElementById('bs-loading').classList.add('is-hidden');
            if (err) {
                console.error('Erro ao deletar caixa no SAP:', err);
                this.showToast(this._t('Erro ao excluir caixa no SAP.'));
                return;
            }

            this.currentPallet.boxes.splice(idx, 1);
            this.currentPallet.totalWeight = this.currentPallet.boxes.reduce((s, b) => s + b.weight, 0);
            this.saveData();
            this.updateProcessView();
            this.updateStats();
            this.showToast(this._t('Excluída com sucesso!'));
        });
    });
}

export function reopenPallet() {
    if (!window.appInfo || !window.appInfo.sapUserCode) {
        this.showToast(this._t('Colaborador não possui usuário SAP cadastrado'));
        return;
    }

    if (!this.viewedPalletId) return;
    const p = (this.sapClosedPallets && this.sapClosedPallets.find(x => x.id === this.viewedPalletId)) || this.pallets.find(p => p.id === this.viewedPalletId);
    if (p) {
        p.status = 'Em processo';
        this.saveData();
        this.el.palletModal.classList.remove('is-active');
        this.startProcess(p);
        this.showToast(this._t('Pallet reaberto'));
    }
}

export function fetchClosedPallets() {
    const _this = this;
    getData('getAux', 'getPalletsFinalizados&dg_limit=1000', '', (err, data) => {
        if (err) {
            console.error('Erro ao buscar pallets finalizados:', err);
            _this.sapClosedPallets = _this.pallets.filter(p => p.status === 'Finalizado');
            _this.renderHistory();
            return;
        }

        const sapPallets = (data && data.value) ? data.value : (Array.isArray(data) ? data : [data]);

        // Mapear os pallets básicos do SAP
        const mappedPallets = sapPallets.map(p => {
            let p_status = 'FINALIZADO';
            let endTime = '';
            let opCode = '';
            let caixasCount = 0;
            let pesoTotal = 0;
            let palletId = '';

            if (Array.isArray(p)) {
                palletId = p[0] || '';
                endTime = p[1] || '';
                opCode = p[2] || '';
                caixasCount = parseInt(p[3]) || 0;
                pesoTotal = parseFloat(p[4]) || 0;
                if (p[5]) p_status = p[5].toString().toUpperCase();
            } else {
                // Fallback caso venha como objeto (segurança)
                palletId = p.U_SPS_PalletCode || p.id || '';
                opCode = p.U_SPS_OPCode || p.op || '';
                endTime = p.U_SPS_CreateDate || p.CreateDate || '';
                caixasCount = parseInt(p.Caixas || 0);
                pesoTotal = parseFloat(p.Peso || 0);
                p_status = p.U_SPS_Status || p.Status || 'FINALIZADO';
            }

            let formattedTime = '---';
            if (endTime) {
                const endStr = endTime.toString().trim();
                // Verifica formato YYYY-MM-DD HH:MM:SS
                if (endStr.includes('-') && endStr.includes(':')) {
                    const [dPart, tPart] = endStr.split(' ');
                    const [y, m, d] = dPart.split('-');
                    const [h, min] = tPart ? tPart.split(':') : ['00', '00'];
                    formattedTime = `${d}/${m}/${y} ${h}:${min}`;
                } else if (endStr.includes('/')) {
                    // Tenta formatar se já vier com /
                    formattedTime = endStr;
                } else {
                    formattedTime = endStr;
                }
            }

            return {
                id: palletId,
                op: opCode,
                material: '',
                status: p_status,
                displayTime: formattedTime,
                endTime: endTime,
                boxes: Array(caixasCount).fill({}),
                totalWeight: pesoTotal,
                itemCode: ''
            };
        });

        // Buscar o itemCode de forma dinâmica para cada pallet
        const promises = mappedPallets.map(pallet => {
            return new Promise((resolve) => {
                // Tenta achar localmente na lista carregada
                const localOP = _this.productionOrders && _this.productionOrders.find(o => {
                    const opA = `${o[0]}/${o[1]}`.replace(/\s+/g, '');
                    const opB = pallet.op.toString().replace(/\s+/g, '');
                    return opA === opB;
                });

                if (localOP) {
                    pallet.itemCode = localOP[2];
                    pallet.material = localOP[3] || '';
                    resolve();
                } else {
                    // Busca direto no SAP/Beas se não encontrar local
                    const opParts = pallet.op.split('/');
                    if (opParts.length === 2) {
                        const opDados = `@${opParts[0]}@@${opParts[1]}@`;
                        getData('getAux', 'getItem', opDados, (err, itemData) => {
                            if (!err && itemData) {
                                if (itemData.value && itemData.value[0]) {
                                    pallet.itemCode = itemData.value[0][0] || '';
                                    pallet.material = itemData.value[0][1] || ''; // a segunda coluna!
                                } else {
                                    const item = Array.isArray(itemData) ? itemData[0] : itemData;
                                    pallet.itemCode = item || '';
                                    pallet.material = '';
                                }
                            }
                            resolve();
                        });
                    } else {
                        resolve();
                    }
                }
            });
        });

        // Espera todos os itemCodes serem resolvidos para renderizar a tela
        Promise.all(promises).then(() => {
            if (!window.app) window.app = {};
            if (!window.app.appData) window.app.appData = {};
            window.app.appData.closedPallets = mappedPallets;

            _this.sapClosedPallets = mappedPallets;
            _this.renderHistory();
        });
    });
}

export function printBoxLabel(docEntry, lineId) {
    if (!this.userSettings || !this.userSettings.printer) {
        this.showToast(this._t('Atenção: Configure a impressora na aba Configurações primeiro!'));
        return;
    }

    const lang = this.userSettings.language || 'PTB';
    const params = `@${docEntry}@@${lineId}@@${lang}@`;

    getData('getAux', 'getEtiquetaCaixa', params, async (err, res) => {
        if (err) {
            console.error('Erro ao buscar dados da etiqueta da caixa no SAP:', err);
            return;
        }

        if (!res || !res.value || !res.value[0]) {
            console.error('Retorno inválido do SAP para caixa:', res);
            return;
        }

        const rawRow = res.value[0];

        const formattedLabel = {
            ItemCode: rawRow[0] || '',
            ItemName: rawRow[1] || '',
            BarCode: rawRow[2] || '',
            BatchValue: rawRow[3] || '',
            BPLName: rawRow[4] || '',
            BPLAdress1: rawRow[5] || '',
            BPLAdress2: rawRow[6] || '',
            BPLInfo: rawRow[7] || '',
            LogoZPL: rawRow[8] || '',
            QuantityValue: rawRow[9] || '',
            TraceabilityValue: rawRow[10] || '',
            QrCode: rawRow[11] || '',
            MnfDateValue: rawRow[12] || '',
            ExpDateValue: rawRow[13] || '',
            GrossWeightValue: rawRow[14] || '',
            NetWeightValue: rawRow[15] || '',
            GrossWeightText: rawRow[16] || '',
            NetWeightText: rawRow[17] || '',
            QuantityText: rawRow[18] || '',
            MnfDateText: rawRow[19] || '',
            ExpDateText: rawRow[20] || '',
            TraceabilityText: rawRow[21] || '',
            BatchText: rawRow[22] || '',
            InternalControl1: rawRow[23] || '',
            InternalControl2: rawRow[24] || '',
            ProducedBy: rawRow[25] || ''
        };

        const printPayload = {
            printerCode: this.userSettings.printer,
            labelCode: "caixaProducao",
            labelData: [formattedLabel]
        };

        try {
            const token = "U2FsdGVkX19Gz7grIE7ieIrDDcycyVrv4q6BdEq2Ep4hKfnb5WQ6haI+KNVo4l8KX9YRrkDHUgkMRbJhirVYMA==";
            const response = await fetch('http://190.128.212.242:9906/print/labels', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(printPayload)
            });

            if (!response.ok) {
                throw new Error(`Erro API: ${response.status}`);
            }

            this.showToast(this._t('Etiqueta de caixa enviada para impressão!'));
        } catch (printErr) {
            console.error('Erro ao imprimir etiqueta de caixa:', printErr);
            this.showToast(this._t('Erro ao conectar com servidor de impressão.'));
        }
    });
}
