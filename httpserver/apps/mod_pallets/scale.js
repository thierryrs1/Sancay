import { getData } from './api.js';

export function toggleScale() {
    const btn = document.getElementById('register-box-btn');

    if (this.isScaleConnected || (!this.isScaleConnected && !this.scaleManualMode)) {
        // Vai para Modo Manual Liberado (Senha foi inserida e validada)
        this.isScaleConnected = false;
        this.scaleManualMode = true;
        if (this.el.scaleStatusDot) this.el.scaleStatusDot.className = 'status-dot offline';
        if (this.el.scaleStatusText) this.el.scaleStatusText.textContent = this._t('Modo Manual (Liberado)');
        if (this.el.liveWeightDisplay) this.el.liveWeightDisplay.style.display = 'none';
        if (this.el.manualWeightInput) {
            this.el.manualWeightInput.style.display = 'inline-block';
            this.el.manualWeightInput.focus();
        }
        if (this.el.simulateWeightBtn) this.el.simulateWeightBtn.style.display = 'none';
        if (this.el.scaleLabel) this.el.scaleLabel.textContent = this._t('DIGITAR PESO (MANUAL)');
        if (this.el.weightValueContainer) this.el.weightValueContainer.classList.add('disconnected');
        
        if (btn) { btn.disabled = false; btn.style.opacity = '1'; btn.style.cursor = 'pointer'; }
    } else {
        // Volta para Balança Online Automática
        this.scaleManualMode = false;
        this.isScaleConnected = true;
        if (this.el.scaleStatusDot) this.el.scaleStatusDot.className = 'status-dot online';
        if (this.el.scaleStatusText) this.el.scaleStatusText.textContent = this._t('Balança Conectada');
        if (this.el.liveWeightDisplay) this.el.liveWeightDisplay.style.display = 'block';
        if (this.el.manualWeightInput) this.el.manualWeightInput.style.display = 'none';
        if (this.el.simulateWeightBtn) this.el.simulateWeightBtn.style.display = 'inline-block';
        if (this.el.scaleLabel) this.el.scaleLabel.textContent = this._t('PESO ATUAL');
        if (this.el.weightValueContainer) this.el.weightValueContainer.classList.remove('disconnected');
        
        if (btn) { btn.disabled = false; btn.style.opacity = '1'; btn.style.cursor = 'pointer'; }
        
        if (typeof this.readScaleWeight === 'function') {
            this.readScaleWeight();
        }
    }
}

export function simulateWeight() {
    this.scaleLocked = true;
    const weights = [24.9, 25.0, 25.1, 24.8, 25.2];
    const weight = weights[Math.floor(Math.random() * weights.length)];
    this.el.liveWeightDisplay.textContent = weight.toFixed(2);
    this.showToast(this._t('Peso estabilizado'));
    setTimeout(() => { this.scaleLocked = false; }, 3000);
}

export async function readScaleWeight() {
    if (this.isScaleConnected && this.currentView === 'process-view' && !this.scaleLocked) {
        
        if (!this.userSettings || !this.userSettings.scale) {
            console.warn("Balança não configurada no usuário.");
            return;
        }

        try {
            const response = await fetch('http://192.168.30.14:9908/api/v1/readWeightByID', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scaleId: this.userSettings.scale })
            });

            if (response.ok) {
                const data = await response.json();
                
                if (data.success && data.weightKilogram !== undefined && this.el.liveWeightDisplay) {
                    this.currentGrossWeight = parseFloat(data.weightKilogram);
                    const tare = this.scaleTare || 0;
                    const netWeight = Math.max(0, this.currentGrossWeight - tare);
                    
                    this.el.liveWeightDisplay.textContent = netWeight.toFixed(3);
                } else if (data.success === false) {
                    this.isScaleConnected = false;
                    this.scaleManualMode = false; // Força bloqueio total

                    if (this.el.scaleStatusDot) this.el.scaleStatusDot.className = 'status-dot offline';
                    if (this.el.scaleStatusText) this.el.scaleStatusText.textContent = this._t('Balança Offline (Bloqueada)');
                    if (this.el.liveWeightDisplay) this.el.liveWeightDisplay.style.display = 'none';
                    if (this.el.manualWeightInput) this.el.manualWeightInput.style.display = 'none'; // Esconde input manual
                    if (this.el.simulateWeightBtn) this.el.simulateWeightBtn.style.display = 'none';
                    if (this.el.scaleLabel) this.el.scaleLabel.textContent = this._t('INACESSÍVEL - REQUER SENHA');
                    if (this.el.weightValueContainer) this.el.weightValueContainer.classList.add('disconnected');
                    
                    const btn = document.getElementById('register-box-btn');
                    if (btn) { btn.disabled = true; btn.style.opacity = '0.5'; btn.style.cursor = 'not-allowed'; }
                    
                    this.showToast(this._t('Conexão perdida. Clique no status e autentique para digitar manual.'));
                }
            }
        } catch (err) {
            console.error("Erro ao ler peso da balança API:", err);
        }
    }
}

export function startScaleSimulation() {
    if (typeof this.readScaleWeight !== 'function') {
        this.readScaleWeight = readScaleWeight.bind(this);
    }

    // Executa a primeira vez imediatamente
    this.readScaleWeight();
    
    // E depois a cada 5 segundos
    setInterval(() => this.readScaleWeight(), 5000);
}

export function openScaleAuthModal() {
    if (this.el.scaleAuthModal) {
        this.el.scaleAuthModal.classList.add('active');
        this.el.scaleAuthModal.classList.add('is-active');
        if (this.el.scaleAuthUser) {
            this.el.scaleAuthUser.value = '';
            setTimeout(() => this.el.scaleAuthUser.focus(), 100);
        }
        if (this.el.scaleAuthPass) {
            this.el.scaleAuthPass.value = '';
        }
    }
}

export function closeScaleAuthModal() {
    if (this.el.scaleAuthModal) {
        this.el.scaleAuthModal.classList.remove('active');
        this.el.scaleAuthModal.classList.remove('is-active');
    }
}

export function submitScaleAuth() {
    const userVal = this.el.scaleAuthUser.value.trim();
    const passVal = this.el.scaleAuthPass.value;

    if (!userVal || !passVal) {
        this.showToast(this._t('Por favor, preencha usuário e senha.'));
        return;
    }

    const loader = document.getElementById('bs-loading');
    if (loader) loader.classList.remove('is-hidden');

    const payloadData = JSON.stringify([{"User": userVal, "Password": passVal}]);
    
    getData('getAux', 'liberaBalanca', payloadData, (err, res) => {
        if (loader) loader.classList.add('is-hidden');
        if (err) {
            this.showToast(this._t('Erro na comunicação com a API.'));
            return;
        }

        let errorVal = 1;
        if (res) {
            if (res.error !== undefined) {
                errorVal = Number(res.error);
            } else if (res.value && res.value[0] && res.value[0][0] !== undefined) {
                errorVal = Number(res.value[0][0]);
            } else if (Array.isArray(res)) {
                const first = res[0];
                if (first && first.error !== undefined) {
                    errorVal = Number(first.error);
                } else if (Array.isArray(first) && first[0] !== undefined) {
                    errorVal = Number(first[0]);
                }
            }
        }

        if (errorVal === 0) {
            this.closeScaleAuthModal();
            this.toggleScale();
            this.showToast(this._t('Balança liberada com sucesso!'));
        } else {
            this.showToast(this._t('Acesso negado: Credenciais inválidas ou sem permissão.'));
        }
    });
}
