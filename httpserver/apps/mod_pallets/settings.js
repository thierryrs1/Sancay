import { getData } from './api.js';

export function loadUserSettings() {
    const uid = window.appInfo && window.appInfo.uid ? window.appInfo.uid.toString() : '1';
    
    // Configuração padrão fallback
    this.userSettings = {
        scale: '',
        printer: '',
        label: ''
    };

    getData('getAux', 'getPrefColab', uid, (err, res) => {
        if (err) {
            console.error('Erro ao carregar configurações do colaborador:', err);
            return;
        }

        let data = [];
        if (res && res.value && Array.isArray(res.value)) {
            data = res.value;
        } else if (Array.isArray(res)) {
            data = res;
        }
        
        if (data.length > 0) {
            // Verifica formato: row pode ser array [scale, printer, label] ou objeto
            const row = Array.isArray(data[0]) ? data[0] : Object.values(data[0]);
            this.userSettings = {
                scale: row[0] || '',
                printer: row[1] || '',
                label: row[2] || ''
            };
        }
        
        this.updateSettingsUI();
    });
}

export function updateSettingsUI() {
    if (!this.userSettings) return;
    
    // Aqui assumimos que as opções do dropdown ainda vão vir por outra API (conforme o user informou).
    // Por enquanto, apenas inserimos a opção padrão carregada para que apareça selecionada.
    
    if (this.el.settingScale) {
        if (this.userSettings.scale) {
            this.el.settingScale.innerHTML = `<option value="${this.userSettings.scale}">${this.userSettings.scale}</option>`;
        }
    }
    
    if (this.el.settingPrinter) {
        if (this.userSettings.printer) {
            this.el.settingPrinter.innerHTML = `<option value="${this.userSettings.printer}">${this.userSettings.printer}</option>`;
        }
    }
    
    if (this.el.settingLabel) {
        if (this.userSettings.label) {
            this.el.settingLabel.innerHTML = `<option value="${this.userSettings.label}">${this.userSettings.label}</option>`;
        }
    }
}

export function saveUserSettings() {
    const scale = this.el.settingScale ? this.el.settingScale.value : '';
    const printer = this.el.settingPrinter ? this.el.settingPrinter.value : '';
    const label = this.el.settingLabel ? this.el.settingLabel.value : '';
    
    // TODO: A lógica de salvar os dados na @SPS_PREF_COLAB será feita assim que o endpoint de update estiver pronto
    this.userSettings = { scale, printer, label };
    this.showToast(this._t('Configurações salvas (visualmente por enquanto)!'));
}
