import net from 'net';

class WeightScaleController {
    /**
     * @param {import('./service').default} weightScaleService
     */
    async listScales(req, res, weightScaleService) {
        const weightScalesConfig = await weightScaleService.listIPs({
            userId: req.userId,
            companyId: req.companyId,
        });

        const scaleIps = weightScalesConfig?.scales;

        if (!scaleIps || !Array.isArray(scaleIps)) {
            return res.status(400).json({ error: req.t('error.ScaleInvalid') });
        }

        const checkScaleStatus = (ip, port, { ...rest }) => {
            const isDefault = ip === rest.isDefault ? 'Y' : 'N';

            return new Promise(resolve => {
                const client = new net.Socket();

                client.setTimeout(5000);

                client.connect(port, ip, () => {
                    // console.log(`Conectado à balança ${ip}:${port}`);
                    resolve({
                        ip,
                        port,
                        status: 'online',
                        isDefault,
                        ...rest,
                    });
                    client.destroy();
                });

                client.on('error', () => {
                    // console.log(`Erro ao conectar-se à balança ${ip}:${port}`);
                    resolve({
                        ip,
                        port,
                        status: 'offline',
                        isDefault,
                        ...rest,
                    });
                    client.destroy();
                });

                client.on('timeout', () => {
                    // console.log(`Timeout ao tentar conectar-se à balança ${ip}:${port}`);
                    resolve({
                        ip,
                        port,
                        status: 'offline',
                        isDefault,
                        ...rest,
                    });
                    client.destroy();
                });
            });
        };

        const scaleStatusPromises = scaleIps.map(({ ip, port, ...rest }) =>
            checkScaleStatus(ip, port, { ...rest })
        );
        try {
            const scalesStatus = await Promise.all(scaleStatusPromises);

            res.json({
                scalesStatus,
            });
        } catch (error) {
            res.status(500).json({ error: req.t('error.StatusError') });
        }
    }

    /**
     * @param {import('./service').default} weightScaleService
     */
    async listScalesByQuery(req, res, weightScaleService) {
        const { sql } = req.body;
        const weightScalesConfig = await weightScaleService.listScalesBy({
            sql,
        });

        const listOfScales = {
            scales: weightScalesConfig,
        };

        const scaleIps = listOfScales?.scales;

        if (!scaleIps || !Array.isArray(scaleIps)) {
            return res.status(400).json({ error: req.t('error.ScaleInvalid') });
        }

        const checkScaleStatus = (ip, port, { ...rest }) => {
            const isDefault = ip === rest.isDefault ? 'Y' : 'N';

            return new Promise(resolve => {
                const client = new net.Socket();

                client.setTimeout(2000);

                client.connect(port, ip, () => {
                    // console.log(`Conectado à balança ${ip}:${port}`);
                    resolve({
                        ip,
                        port,
                        status: 'online',
                        isDefault,
                        ...rest,
                    });
                    client.destroy();
                });

                client.on('error', () => {
                    // console.log(`Erro ao conectar-se à balança ${ip}:${port}`);
                    resolve({
                        ip,
                        port,
                        status: 'offline',
                        isDefault,
                        ...rest,
                    });
                    client.destroy();
                });

                client.on('timeout', () => {
                    // console.log(`Timeout ao tentar conectar-se à balança ${ip}:${port}`);
                    resolve({
                        ip,
                        port,
                        status: 'offline',
                        isDefault,
                        ...rest,
                    });
                    client.destroy();
                });
            });
        };

        const scaleStatusPromises = scaleIps.map(({ ip, port, ...rest }) =>
            checkScaleStatus(ip, port, { ...rest })
        );
        try {
            const scalesStatus = await Promise.all(scaleStatusPromises);

            res.json({
                scalesStatus,
            });
        } catch (error) {
            res.status(500).json({ error: req.t('error.StatusError') });
        }
    }

    async get(req, res) {
        const { url } = req.params;

        const [ip, port] = url.split(':');

        if (!ip || !port) {
            return res.status(400).json({ error: req.t('error.IncorrectIP') });
        }

        let responded = false;

        const client = new net.Socket();

        client.connect(port, ip, () => {
            // console.log(`Conectado à balança ${ip}:${port}`);
            // Enviar comando conforme o protocolo P15
            const tara = 'TA\r\n';
            const scale = 'S\r\n';
            client.write(tara);
            client.write(scale);
        });

        client.on('data', data => {
            if (responded) return; // Evitar múltiplas respostas

            const parsedData = WeightScaleController.parseScaleData(data);

            if (parsedData) {
                responded = true;
                client.destroy();

                return res.json(parsedData);
            } else {
                responded = true;
                client.destroy();
                return res.status(500).json({
                    error: req.t('error.WeightImpossible'),
                });
            }
        });

        // Tratamento de erros
        client.on('error', err => {
            console.error(`Erro ao se conectar à balança: ${err.message}`);
            if (responded) return;
            client.destroy();
            return res.status(500).json({ error: req.t('error.ScaleConnectError') });
        });

        client.on('close', () => {
            //console.log('Conexão com a balança encerrada');
        });
    }

    async getBy(req, res) {
        const { ip, port, scaleType } = req.body;

        if (!ip || !port) {
            return res.status(400).json({ error: req.t('error.IncorrectIP') });
        }

        let responded = false;

        const client = new net.Socket();


        client.connect(port, ip, () => {
            // Enviar comando conforme o protocolo P15
            const tara = 'TA\r\n';
            const scale = 'S\r\n';
            if (scaleType === 'TA') {
                client.write(tara);
            } else {
                client.write(scale);
            }
        });

        client.on('data', data => {

            if (responded) return;

            const parsedData = WeightScaleController.parseScaleData(data);

            if (parsedData) {
                responded = true;
                client.destroy();
                return res.json(parsedData);
            } else {
                responded = true;
                client.destroy();

                return res.status(500).json({
                    error: req.t('error.WeightImpossible'),
                });
            }
        });

        // Tratamento de erros
        client.on('error', err => {
            console.error(`Erro ao se conectar à balança: ${err.message}`);
            if (responded) return;
            client.destroy();

            return res.status(500).json({ error: req.t('error.ScaleConnectError') });
        });

        client.on('close', () => {
            //console.log('Conexão com a balança encerrada');
        });
    }

    /**
     *
     * @param {string} str
     * @returns null | { weight: string, unit: string }
     */
    static weightAndUnit(str) {

        const regex = /(ST,)?GS,\+0*(\d+)(kg|g|dg)\b/gi;
        const matches = [...str.matchAll(regex)];

        if (matches.length === 0) return null;

        const lastMatch = matches[matches.length - 1];

        return {
            weight: lastMatch[2],
            unit: lastMatch[3].toLowerCase()
        };
    }

    /**
     *
     * @param {Buffer} data
     */
    static parseScaleData(data) {
        // Converter Buffer para string e remover caracteres extras
        const str = data.toString().trim().split('\r\n')[0];

        // Verificar se a string começa com 'S' (Peso) ou 'T' (Tara)
        const type = str.startsWith('S')
            ? 'Scale'
            : str.startsWith('T') || str.startsWith('TA')
                ? 'Tara' : str.includes('+') ? 'TELNET'
                    : null;
        if (!type) return null;

        let weight = 0, unit = 'kg';

        // Primeiro formato: S
        let match = str.match(/([STA]+)\s+[A]?\s*([\d,.]+)\s*(kg|g|dg)/i);
        if (match) {
            weight = parseFloat(match[2].replace(',', '.'));
            unit = match[3].toUpperCase();
        } else {
            // Segundo formato: ST,GS...
            const weightAndUnit = WeightScaleController.weightAndUnit(str);
            if (weightAndUnit) {
                weight = parseFloat(weightAndUnit.weight.replace(',', '.'));
                unit = weightAndUnit.unit.toUpperCase();
            } else {
                // Terceiro formato: ST,@,+014980kg ou ST,F,+014980kg ou ST,D,+014980kg
                match = str.match(/^ST,([A-Z#@\-]),\+?0*([\d,.]+)(kg|g|dg),?/i);
                if (match) {
                    weight = parseFloat(match[2].replace(',', '.'));
                    unit = match[3].toUpperCase();
                }
            }
        }

        let weightKilogram, weightGram, weightDecigram;

        if (unit === 'KG') {
            weightKilogram = weight;
            weightGram = weight * 1000;
            weightDecigram = weight * 10000;
        } else if (unit === 'G') {
            weightKilogram = weight / 1000;
            weightGram = weight;
            weightDecigram = weight * 10;
        } else if (unit === 'DG') {
            weightKilogram = weight / 10000;
            weightGram = weight / 10;
            weightDecigram = weight;
        }

        return {
            type,
            weightKilogram,
            weightGram,
            weightDecigram,
        };
    }
}

export default new WeightScaleController();