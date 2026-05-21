import { getData } from './api.js';

export function loadUserSettings() {
    const uid = window.appInfo && window.appInfo.uid ? window.appInfo.uid.toString() : '1';
    
    // Configuração padrão fallback
    this.userSettings = {
        scale: '',
        printer: '',
        label: ''
    };

    getData('getAux', 'getPrefColab&dg_limit=1000', uid, (err, res) => {
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
            const row = data[0];
            const isArr = Array.isArray(row);
            
            this.userSettings = {
                // Tenta pegar pelo nome exato, ou minúsculo, ou pelo array/ordem do objeto
                scale: isArr ? row[0] : (row.U_SPS_Default_Scale || row.u_sps_default_scale || Object.values(row)[0] || ''),
                printer: isArr ? row[1] : (row.U_SPS_Default_Printer || row.u_sps_default_printer || Object.values(row)[1] || ''),
                label: isArr ? row[2] : (row.U_SPS_Default_Label || row.u_sps_default_label || Object.values(row)[2] || '')
            };

        }
        
        this.updateSettingsUI();
    });
}

export function loadEquipList() {
    getData('getAux', 'getListaEquip&dg_limit=1000', '', (err, res) => {
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
            let tipo = isArray ? item[0] : (item.Tipo || item.tipo || item.TIPO || Object.values(item)[0]);
            let desc = isArray ? item[1] : (item.Descricao || item.descricao || item.DESCRICAO || Object.values(item)[1]);
            
            if (!tipo || !desc) return;
            
            const option = `<option value="${desc}">${desc}</option>`;
            const t = tipo.toString().toUpperCase().trim();
            
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
        
        this.updateSettingsUI();
    });
}

export function updateSettingsUI() {
    if (!this.userSettings) return;
    
    const ensureOption = (selectEl, val) => {
        if (!selectEl || !val) return;
        
        let exists = false;
        for (let i = 0; i < selectEl.options.length; i++) {
            if (selectEl.options[i].value === val) {
                exists = true;
                break;
            }
        }
        
        // Se a opção salva no banco não estiver na lista de equipamentos, adiciona ela dinamicamente
        if (!exists) {
            const opt = document.createElement('option');
            opt.value = val;
            opt.text = val;
            selectEl.appendChild(opt);
        }
        
        selectEl.value = val;
    };

    ensureOption(this.el.settingScale, this.userSettings.scale);
    ensureOption(this.el.settingPrinter, this.userSettings.printer);
    ensureOption(this.el.settingLabel, this.userSettings.label);
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
