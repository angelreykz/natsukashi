const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason 
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const config = require('./config/config');

// Interface para ler o número no terminal do Termux
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function iniciarBot() {
    const { state, saveCreds } = await useMultiFileAuthState(path.resolve(__dirname, 'auth_info'));
    
    const client = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false, // Forçado falso para usar Pairing Code
        auth: state,
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    // Sistema de pareamento por código
    if (!client.authState.creds.registered) {
        console.clear();
        console.log(`\x1b[36m[ ${config.botName} ]— SISTEMA DE PAREAMENTO\x1b[0m`);
        const numero = await question('\x1b[33mDigite o número do bot (ex: 5511999999999): \x1b[0m');
        const codigo = await client.requestPairingCode(numero.trim());
        console.log(`\n\x1b[32mSeu código de pareamento é: \x1b[1m${codigo}\x1b[0m`);
        console.log(`\x1b[35mAbra o WhatsApp > Aparelhos Conectados > Conectar com código de telefone.\x1b[0m\n`);
    }

    // Armazenamento global de comandos
    client.commands = new Map();
    carregarComandos(client);

    // Gerenciador de Conexão
    client.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const deveReconectar = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(`\x1b[31mConexão fechada. Reconectando: ${deveReconectar}\x1b[0m`);
            if (deveReconectar) iniciarBot();
        } else if (connection === 'open') {
            console.log(`\x1b[32m[${config.botName}] Conectado com sucesso!\x1b[0m`);
        }
    });

    // Ouvinte de mensagens recebidas
    client.ev.on('messages.upsert', async (m) => {
        if (m.type !== 'notify') return;
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        
        if (!text.startsWith(config.prefix)) return;

        const args = text.slice(config.prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = client.commands.get(commandName);
        if (!command) return;

        // Funções facilitadoras injetadas (Funções prontas)
        const responder = (texto) => client.sendMessage(from, { text: texto }, { quoted: msg });

        try {
            await command.executar(client, msg, args, responder);
        } catch (error) {
            console.error(error);
            responder(`${config.emojis.erro} Houve um erro ao executar este comando.`);
        }
    });

    client.ev.on('creds.update', saveCreds);
}

// Carregador dinâmico de comandos
function carregarComandos(client) {
    const pastaComandos = path.resolve(__dirname, 'comandos');
    if (!fs.existsSync(pastaComandos)) fs.mkdirSync(pastaComandos);

    const arquivos = fs.readdirSync(pastaComandos).filter(file => file.endsWith('.js'));
    for (const arquivo of arquivos) {
        const comando = require(path.join(pastaComandos, arquivo));
        client.commands.set(comando.nome, comando);
    }
    console.log(`\x1b[34m[LOG] ${client.commands.size} comandos carregados.\x1b[0m`);
}

iniciarBot();
  
