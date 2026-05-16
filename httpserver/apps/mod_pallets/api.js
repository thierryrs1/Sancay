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