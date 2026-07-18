const config = require('../config/config');

module.exports = {
    nome: "menu",
    descricao: "Exibe a lista de comandos disponíveis.",
    categoria: "info",
    aliases: ["help", "comandos"],
    async executar(client, msg, args, responder) {
        let textoMenu = `🤖 *${config.botName}* 🤖\n`;
        textoMenu += `Prefix: \`${config.prefix}\`\n`;
        textoMenu += `Total de comandos: ${client.commands.size}\n\n`;
        textoMenu += `*LISTA DE COMANDOS:*\n`;

        client.commands.forEach((cmd) => {
            textoMenu += `• *${config.prefix}${cmd.nome}* - ${cmd.descricao}\n`;
        });

        await responder(textoMenu);
    }
};
