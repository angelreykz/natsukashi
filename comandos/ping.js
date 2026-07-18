module.exports = {
    nome: "ping",
    descricao: "Verifica se o bot está online e respondendo.",
    categoria: "utilidade",
    aliases: ["p"],
    async executar(client, msg, args, responder) {
        const inicio = Date.now();
        await responder("🏓 Pong!");
    }
};
