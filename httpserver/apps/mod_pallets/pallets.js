import { getData, serviceLayerPost } from './api.js';

export function fetchPendingPallets() {
    const _this = this;
    getData('getAux', 'getPalletsPendentes&dg_limit=1000', '', (err, data) => {
        if (err) {
            console.error('Erro ao buscar pallets pendentes:', err);
            return;
        }

        const sapPallets = (data && data.value) ? data.value : (Array.isArray(data) ? data : [data]);

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
            window.app.appData.pendingPallets = mappedPallets;

            _this.sapActivePallets = mappedPallets;
            _this.renderDashboard();
            _this.updateStats();
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
    if (!window.app.appData.selectedOrder) {
        this.showToast(this._t('Selecione uma OP primeiro.'));
        return;
    }

    const op = window.app.appData.selectedOrder;

    try {
        document.getElementById('bs-loading').classList.remove('is-hidden');

        const palletPayload = {
            "U_SPS_Tipo": "PALLET",
            "U_SPS_OPCode": `${op[0]}/${op[1]}`,
            "U_SPS_PalletCode": `${op[9]}-${op[0]}/${op[1]}`,
            "U_SPS_Status": "ABERTO",
            "U_SPS_QRCode": `${op[9]}-${op[0]}/${op[1]}`,
            "U_SPS_ExpectedQty": parseFloat(op[4] || 0) / parseFloat(op[6] || 1),
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
                    "U_SPS_BoxCode": `CX-${Date.now()}`,
                    "U_SPS_BoxWeight": weight,
                    "U_SPS_BoxQRCode": `CX-${Date.now()}`,
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

export function closePallet() {
    if (!this.currentPallet) return;

    this.showConfirm(`${this._t('Encerrar Pallet')} #${this.currentPallet.id}?`, async () => {
        // Pré-construir e exibir o JSON que será enviado para a API no Patch/Post (útil para Postman)
        const patchTestPayload = {
            "DocEntry": this.currentPallet.docEntry,
            "U_SPS_Tipo": "PALLET",
            "U_SPS_OPCode": this.currentPallet.op,
            "U_SPS_PalletCode": this.currentPallet.id,
            "U_SPS_Status": "FINALIZADO",
            "U_SPS_UpdateUser": "manager",
            "U_SPS_Printed": "N",
            "SPS_PALLET_GROUP_LCollection": []
        };
        console.log('JSON pré-configurado de fechamento (FINALIZADO) para testar no Postman:', JSON.stringify(patchTestPayload, null, 2));

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
            console.log('Etapa 1 (Encerrar): Caixas marcadas como PESADO.');

            // ETAPA 2: Gerar o Receipt na Service Layer
            const apontamentoOk = await this.apontarProducao();
            if (!apontamentoOk) throw new Error('Falha ao gerar Receipt na Service Layer.');
            console.log('Etapa 2 (Encerrar): Receipt gerado na Service Layer.');

            // ETAPA 3: Mudar de PESADO para APONTADO
            await new Promise((resolve, reject) => {
                getData('postAux', 'postApontado', palletCode, (err, res) => {
                    if (err) reject(new Error('Erro ao marcar como APONTADO: ' + err.message));
                    else resolve(res);
                });
            });
            console.log('Etapa 3 (Encerrar): Caixas marcadas como APONTADO.');

            // ETAPA 4: Atualizar o cabeçalho do Pallet para FINALIZADO no SAP
            const updatePayload = {
                "DocEntry": this.currentPallet.docEntry,
                "U_SPS_Tipo": "PALLET",
                "U_SPS_OPCode": this.currentPallet.op,
                "U_SPS_PalletCode": this.currentPallet.id,
                "U_SPS_Status": "FINALIZADO",
                "U_SPS_UpdateUser": "manager",
                "U_SPS_Printed": "N",
                "SPS_PALLET_GROUP_LCollection": []
            };

            console.log('Enviando fechamento (FINALIZADO) para o SAP:', JSON.stringify(updatePayload, null, 2));

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

        console.log('Buscando JSON de apontamento para o PalletCode:', dados);

        getData('postAux', 'apontaPesados', dados, (err, payload) => {
            if (err || !payload) {
                console.error('Erro ao buscar JSON de apontamento:', err);
                this.showToast(this._t('Erro ao gerar apontamento.'));
                return resolve(false);
            }

            console.log('Payload bruto recebido de apontaPesados:');
            console.log(JSON.stringify(payload, null, 2));

            let receiptPayload;
            try {
                const rawString = (payload && payload.value && payload.value[0]) ? payload.value[0][0] : null;
                console.log('Conteúdo extraído para parse (string crua):', rawString);
                
                if (!rawString || rawString.trim() === "" || rawString === "{}") {
                    console.log('Nenhum dado de apontamento pendente no SAP para este pallet. Pulando geração de Receipt.');
                    this.showToast(this._t('Nenhum apontamento pendente.'));
                    return resolve(true);
                }
                
                receiptPayload = JSON.parse(rawString);
            } catch (parseErr) {
                console.error('Erro ao extrair o JSON do Receipt:', parseErr);
                console.error('Dados completos recebidos:', payload);
                this.showToast(this._t('Erro na estrutura do apontamento.'));
                return resolve(false);
            }

            console.log('JSON pronto para enviar à Service Layer (/odata4/v1/Receipt):');
            console.log(JSON.stringify(receiptPayload, null, 2));

            serviceLayerPost('/odata4/v1/Receipt', receiptPayload, (sErr, result) => {
                if (sErr) {
                    console.error('Erro no apontamento Service Layer:', sErr, result);
                    this.showToast(this._t('Erro no apontamento da Service Layer.'));
                    resolve(false);
                } else {
                    console.log('Apontamento realizado com sucesso:', result);
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
            console.log('Etapa 1: Caixas marcadas como PESADO.');

            const apontamentoOk = await this.apontarProducao();
            if (!apontamentoOk) throw new Error('Falha ao gerar Receipt na Service Layer.');
            console.log('Etapa 2: Receipt gerado na Service Layer.');

            await new Promise((resolve, reject) => {
                getData('postAux', 'postApontado', palletCode, (err, res) => {
                    if (err) reject(new Error('Erro ao marcar como APONTADO: ' + err.message));
                    else resolve(res);
                });
            });
            console.log('Etapa 3: Caixas marcadas como APONTADO.');

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
                        code: l.U_SPS_BoxCode
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
    const p = this.pallets.find(p => p.id === this.viewedPalletId);
    if (p) this.printPallet(p);
}

export function printPallet(p) {
    document.getElementById('print-id').textContent = p.id;
    document.getElementById('print-op').textContent = p.op;
    document.getElementById('print-material').textContent = p.material;
    document.getElementById('print-date').textContent = new Date(p.endTime || p.startTime).toLocaleString();
    document.getElementById('print-boxes').textContent = p.boxes.length;
    document.getElementById('print-weight').textContent = `${p.totalWeight.toFixed(2)} kg`;
    document.getElementById('print-items-list').innerHTML = p.boxes.map((b, i) => `<tr><td class="sancay-td">${i + 1}</td><td class="sancay-td">${new Date(b.timestamp).toLocaleTimeString()}</td><td class="sancay-td">${b.weight.toFixed(2)}</td></tr>`).join('');
    window.print();
}

export function deleteBox(idx) {
    this.showConfirm(`${this._t('Excluir Caixa')} #${idx + 1}?`, () => {
        this.currentPallet.boxes.splice(idx, 1);
        this.currentPallet.totalWeight = this.currentPallet.boxes.reduce((s, b) => s + b.weight, 0);
        this.saveData(); this.updateProcessView(); this.updateStats(); this.showToast(this._t('Excluída.'));
    });
}

export function reopenPallet() {
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
