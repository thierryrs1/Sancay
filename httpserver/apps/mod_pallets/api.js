/**
 * Generic data fetcher for the Beas API
 * @param {string} call - The "get" parameter (e.g., 'getAux')
 * @param {string} acao - The "acao" parameter (e.g., 'getOrdens')
 * @param {string} dados - Any additional data
 * @param {function} callback - Function to handle the result
 */
export function getData(call = 'getAux', acao = 'getOrdens', dados = '', callback) {
    // Safety check for appInfo
    const gid = (window.appInfo && window.appInfo.gid) || 'terminal20';
    const appID = (window.appInfo && window.appInfo.appID) || 'mod_pallets';

    const url = `?program_id=${gid}&page=${appID}&get=${call}&acao=${acao}&dados=${dados}`;

    if (window.ux && typeof window.ux.aget === 'function') {
        window.ux.aget(url, function (err, result) {
            if (err) {
                console.error('API Error:', err);
                if (callback) callback(err, null);
                return;
            }

            try {
                // Parse result if it's a string
                const data = typeof result === 'string' ? JSON.parse(result) : result;
                if (callback) callback(null, data);
            } catch (e) {
                console.error('JSON Parse Error:', e, result);
                if (callback) callback(e, null);
            }
        });
    } else {
        console.warn('ux.aget not found');
        if (callback) callback(new Error('ux.aget not found'), null);
    }
}

/**
 * Service Layer Beas function using ux.saveAll
 */
export function serviceLayerPost(endpoint, payload, callback) {
    if (window.ux && typeof window.ux.saveAll === 'function') {
        window.ux.saveAll(endpoint, payload, function (err, result) {
            // ux.aError helps identify if the result contains a Beas/SAP error
            if (window.ux && window.ux.aError && window.ux.aError(result)) {
                if (callback) callback(new Error('Erro na Service Layer'), result);
            } else {
                if (callback) callback(err, result);
            }
        }, {
            method: 'POST',
            contentType: 'json',
            timeout: 180000
        });
    } else {
        console.warn('ux.saveAll not found');
        if (callback) callback(new Error('ux.saveAll not found'), null);
    }
}


export function serviceLayerGet(endpoint, payload, callback) {
    if (window.ux && typeof window.ux.saveAll === 'function') {
        window.ux.saveAll(endpoint, payload, function (err, result) {
            // ux.aError helps identify if the result contains a Beas/SAP error
            if (window.ux && window.ux.aError && window.ux.aError(result)) {
                if (callback) callback(new Error('Erro na Service Layer'), result);
            } else {
                if (callback) callback(err, result);
            }
        }, {
            method: 'GET',
            contentType: 'json',
            timeout: 180000
        });
    } else {
        console.warn('ux.saveAll not found');
        if (callback) callback(new Error('ux.saveAll not found'), null);
    }
}