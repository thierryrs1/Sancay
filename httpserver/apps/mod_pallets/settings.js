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
    const uid = window.appInfo && window.appInfo.uid ? window.appInfo.uid.toString() : '1';
    
    const payload = [{
        "U_SPS_Default_Label": label,
        "U_SPS_Default_Printer": printer,
        "U_SPS_Default_Scale": scale,
        "U_SPS_Pers_ID": uid
    }];
    
    const payloadData = JSON.stringify(payload);
    
    // Mostra loading
    const loader = document.getElementById('bs-loading');
    if (loader) loader.classList.remove('is-hidden');
    
    getData('postAux', 'postPrefColab', payloadData, (err, res) => {
        if (loader) loader.classList.add('is-hidden');
        if (err) {
            console.error('Erro ao salvar configurações do colaborador:', err);
            this.showToast(this._t('Erro ao salvar as configurações.'));
            return;
        }

        this.userSettings = { scale, printer, label };
        this.showToast(this._t('Configurações salvas com sucesso!'));
    });
}
