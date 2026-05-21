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

export function loadEquipList() {
    getData('getAux', 'getListaEquip', '', (err, res) => {
        if (err) {
            console.error('Erro ao carregar lista de equipamentos:', err);
            return;
        }

        let data = [];
        if (res && res.value && Array.isArray(res.value)) {
            data = res.value;
        } else if (Array.isArray(res)) {
            data = res;
        }
        
        let scalesHtml = `<option value="">${this._t('Selecione a Balança...')}</option>`;
        let printersHtml = `<option value="">${this._t('Selecione a Impressora...')}</option>`;
        let labelsHtml = `<option value="">${this._t('Selecione o Modelo...')}</option>`;
        
        data.forEach(item => {
            const isArray = Array.isArray(item);
            // Pega pelo nome da coluna ou pela posição para ser à prova de falhas
            let tipo = isArray ? item[0] : (item.Tipo || item.tipo || item.TIPO || Object.values(item)[0]);
            let desc = isArray ? item[1] : (item.Descricao || item.descricao || item.DESCRICAO || Object.values(item)[1]);
            
            if (!tipo || !desc) return;
            
            const option = `<option value="${desc}">${desc}</option>`;
            const t = tipo.toString().toUpperCase();
            
            if (t === 'SCALE') {
                scalesHtml += option;
            } else if (t === 'PRINTER') {
                printersHtml += option;
            } else if (t === 'LABEL') {
                labelsHtml += option;
            }
        });
        
        if (this.el.settingScale) this.el.settingScale.innerHTML = scalesHtml;
        if (this.el.settingPrinter) this.el.settingPrinter.innerHTML = printersHtml;
        if (this.el.settingLabel) this.el.settingLabel.innerHTML = labelsHtml;
        
        // Como o carregamento da lista e das configurações do usuário são assíncronos,
        // garantimos que, se o userSettings já carregou, aplicamos ele agora.
        this.updateSettingsUI();
    });
}

export function updateSettingsUI() {
    if (!this.userSettings) return;
    
    // Agora só setamos o "value", pois as options () já foram (ou serão) carregadas pelo loadEquipList
    if (this.el.settingScale && this.userSettings.scale) {
        this.el.settingScale.value = this.userSettings.scale;
    }
    
    if (this.el.settingPrinter && this.userSettings.printer) {
        this.el.settingPrinter.value = this.userSettings.printer;
    }
    
    if (this.el.settingLabel && this.userSettings.label) {
        this.el.settingLabel.value = this.userSettings.label;
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
