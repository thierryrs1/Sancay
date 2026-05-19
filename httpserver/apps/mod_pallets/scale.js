import { getData } from './api.js';

export function toggleScale() {
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

export function simulateWeight() {
    this.scaleLocked = true;
    const weights = [24.9, 25.0, 25.1, 24.8, 25.2];
    const weight = weights[Math.floor(Math.random() * weights.length)];
    this.el.liveWeightDisplay.textContent = weight.toFixed(2);
    this.showToast(this._t('Peso estabilizado'));
    setTimeout(() => { this.scaleLocked = false; }, 3000);
}

export function startScaleSimulation() {
    setInterval(() => {
        if (this.isScaleConnected && this.currentView === 'process-view' && !this.scaleLocked) {
            const base = 24.5 + (Math.random() * 1.5);
            if (this.el.liveWeightDisplay) this.el.liveWeightDisplay.textContent = base.toFixed(2);
        }
    }, 2000);
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
