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
