const config = require("./config/config");
const donos = require("./config/donos");
const mensagens = require("./config/mensagens");
const menu = require("./config/menu");
const respostas = require("./config/respostas");

console.clear();

console.log("================================");
console.log(`🤖 ${config.nomeBot}`);
console.log(`📦 Versão: ${config.versao}`);
console.log(`🔑 Prefixo: ${config.prefixo}`);
console.log("================================");
console.log("✅ Configurações carregadas!");
console.log("🚀 Iniciando o bot...");
