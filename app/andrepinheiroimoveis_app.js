"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
   return (mod && mod.__esModule) ? mod : { "default": mod };
};

// CONSTANTES ESSENCIAIS
// NOME PROJETO 
const nomeProjetoDialogFlow = "andrepinheiroimoveis-igrx";
// NOME CHAVE JSON
const nomeChaveJason = "andrepinheiroimoveis_key.json";
// NOME SESSION VENOM
const nomeSessionVenom = "andrepinheiro-session";
// NOME DA ATENDENTE VIRTUAL
const nomeAtendente = "Elis";
// NOME DA IMOBILIÁRIA                
const nomeImobiliaria = "André Pinheiro Imóveis";
// VALORES DE INVESTIMENTO DE COMPRA DO CLIENTE
var investimentoCompra01 = "Até 250 mil";
var investimentoCompra02 = "De 251 mil até 600 mil";
var investimentoCompra03 = "Acima de 600 mil";
// VALORES DE INVESTIMENTO DE LOCAÇÃO DO CLIENTE
var investimentoLocacao01 = "Até 1.000 mil";
var investimentoLocacao02 = "De 1.001 mil até 2.000 mil";
var investimentoLocacao03 = "Acima de 2.000";
// NOME DA IMAGEM DO IMOVEL
var nomeImagemImovel = "imovel01.jpeg";
// CÓDIGO DO IMÓVEL
var codigoImovel = "Colina123";
// TEMPO DE ESPERA DO ATENDIMENTO
var tempoEsperaAtendimento = "10 minutos";
// TELEFONE QUE RECEBERÁ AS INFORMAÇÕES DO LEAD
const telefoneRecebeInformacoes = "553186438612@s.whatsapp.net";
const enviarInformarcoesLead = "sim";


const imovel_01_Titulo = "";
const imovel_01_Codigo = "Código Imovel 01";
const imovel_02_Codigo = "Código Imóvel 02";
const imovel_03_Codigo = "Código Imóvel 03";
const imovel_04_Codigo = "Código Imóvel 04";
const imovel_01_descricao = "";

// ------------------------------------------------------------------

// IMPORTANDO O BAILEYS E O DIALOGFLOW
const { delay } = require('@adiwajshing/baileys')
//const { readFileSync } = require('fs')
const dialogflow = require("@google-cloud/dialogflow");

const dados = require('./helpers/dados');
const db = require('./helpers/andrepinheiroimoveis_sheets');

// ------------------------------------------------------------------

//const dialogflow = require('@google-cloud/dialogflow').v2;
const fs = require('fs');
const moment = require('moment');
const axios = require('axios');
const sheet = require('google-spreadsheet');
const { text } = require('express');
var cron = require('node-cron');

// ------------------------------------------------------------------



// INICIANDO O DIALOGFLOW E CONFIGURANDO COM O USO DA KEY GERADA EM JSON,
// DEVE SE ENCONTRAR NA RAIZ DO PROJETO
const sessionClient = new dialogflow.SessionsClient({ keyFilename: nomeChaveJason, });

// FUNCOES USADAS DA DOCUMENTACAO NORMAL 
async function detectIntent(
   projectId,
   sessionId,
   query,
   contexts,
   languageCode
) {
   // The path to identify the agent that owns the created intent.
   const sessionPath = sessionClient.projectAgentSessionPath(
      projectId,
      sessionId
   );

   // The text query request.
   const request = {
      session: sessionPath,
      queryInput: {
         text: {
            text: query,
            languageCode: languageCode,
         },
      },
   };

   if (contexts && contexts.length > 0) {
      request.queryParams = {
         contexts: contexts,
      };
   }

   const responses = await sessionClient.detectIntent(request);
   return responses[0];
}
async function executeQueries(projectId, sessionId, queries, languageCode) {
   let context;
   let intentResponse;
   for (const query of queries) {
      try {
         console.log(`Sending Query: ${query}`);
         intentResponse = await detectIntent(
            projectId,
            sessionId,
            query,
            context,
            languageCode
         );
         console.log("Detected intent");
         console.log(intentResponse.queryResult.fulfillmentText);
         return `${intentResponse.queryResult.fulfillmentText}`;
      } catch (error) {
         console.log(error);
      }
   }
} // FIM DA CONFIGURACAO E FUNCOES DO DIALOGFLOW

// FUNÇÃO TRATAMENTO NÚMERO WHATSAPP COM DDD E 9
async function tratamento_numero_whatsapp(numero_whatsapp) {

   const number = numero_whatsapp.replace(/\D/g, '');
   const ddIddD = number.substr(2, 2);
   const user = number.substr(-8, 8);

   // PEGA O NÚMERO DO WHATSAPP COM DDD
   const numero_whatsapp_tratado = ddIddD + " 9" + user;
   console.log(numero_whatsapp_tratado);
   return numero_whatsapp_tratado;

}

//PEGA DATA E HORA
const now = moment().format('DD/MM/YYYY  *H:m:ss*');



/**
 * @param {string} jid 
 * @returns {boolean}
 */
const isGroup = (jid) => {
   const regexp = new RegExp(/^\d{18}@g.us$/)
   return regexp.test(jid)
}

/**
 * @param {import("../library/library").IWASock} sock 
 */
exports.chatBot = (sock) => {

   /** 
    * @param {string} jid 
    * @param {import("@adiwajshing/baileys").AnyMessageContent} msg 
    * @returns {import("@adiwajshing/baileys").proto.WebMessageInfo}
    */
   const sendMessageWTyping = async (jid, msg) => {
      await sock.presenceSubscribe(jid)
      await delay(500)

      await sock.sendPresenceUpdate('composing', jid)
      await delay(1000)

      await sock.sendPresenceUpdate('paused', jid)

      return await sock.sendMessage(jid, msg)
   }

    // ENVIA A PRIMEIRA MENSAGEM QUANDO O LEAD SE CADASTRA VIA ANÚNCIO FACEBOOK
    async function mensagem_Lead_Ads_boasVindas(nome_lead, whatsapp_lead) {

      const numero_whatsapp = whatsapp_lead.replace(/\D/g, '');
      const ddIddD = numero_whatsapp.substr(2, 2);
      const numero_sem_9 = numero_whatsapp.substr(-8, 8);

      // PEGA O NÚMERO DO WHATSAPP COM DDD
      const numero_whatsapp_tratado = ddIddD + " 9" + numero_sem_9;
      //console.log(numero_whatsapp_tratado)

      let verificaWhatsapp = await db.fncFindDados('Contatos', 'Whatsapp', numero_whatsapp_tratado, 'Whatsapp');
      if (verificaWhatsapp != numero_whatsapp_tratado) {
         let dataAdd = {
            Data: now,
            Lead: "ok",
            Nome: nome_lead,
            Whatsapp: numero_whatsapp_tratado,
            Etapa: "Início",
         }
         db.fncAddDados('Contatos', dataAdd);
      }

      // ENVIA O CARD DO LEAD PARA QUEM IRÁ DAR CONTINUIDADE AO ATENDIMENTO
      if (enviarInformarcoesLead === "sim") {

         const contact = {
            fullName: nome_lead,
            waid: "55" + ddIddD + "9" + numero_sem_9,
            phoneNumber: numero_whatsapp_tratado
         }
         const vcard =
            'BEGIN:VCARD\n' +
            'VERSION:3.0\n' +
            'FN:' +
            contact.fullName +
            '\n' +
            'item1.TEL;waid=' +
            contact.waid +
            ':' +
            contact.phoneNumber +
            '\n' +
            'item1.X-ABLabel:Celular\n' +
            'END:VCARD'

         const result = await sock.sendMessage(telefoneRecebeInformacoes, {
            contacts: {
               displayName: contact.fullName,
               contacts: [{ vcard, displayName: contact.fullName }]
            }
         })
      }

      const sendImage = {
         // optional
         //caption: '```IMAGE TITLE```',
         image: {
            url: './img/' + nomeImagemImovel,
            // url: 'https://domain/image.jpeg'
         }
      }
      whatsapp_lead = `55${ddIddD}${numero_sem_9}@s.whatsapp.net`;
      
      const sendImg = await sock.sendMessage(whatsapp_lead , sendImage)

      const buttonsMD = [
         {
            index: 1,
            quickReplyButton: { id: 'id1', displayText: '✅  Continuar' }
         }
      ]

      const templateButtons = {
         text: `Olá ${nome_lead}! Sou a *${nomeAtendente}*! 🙋‍♀️ Assistente virtual aqui da *${nomeImobiliaria}* :)\n\n🧭 Vi que você clicou no anúncio pra saber mais detalhes deste imóvel.\n\nClique no botão *👇 Continuar* :). `,
         footer: "Estou de acordo com as políticas de privacidade",
         templateButtons: buttonsMD
      }

      const sendButtons = await sock.sendMessage(whatsapp_lead, templateButtons)


   } // FIM mensagem_Lead_Ads_boasVindas(nome_lead, whatsapp_lead) 

   // BUSCA OS LEADS GERADOS PELO FORM DO FACEBOOK E ENVIA A PRIMEIRA MENSAGEM
   async function buscaLeadsFacebook() {

      var dados_leads_facebook = ["Nome", "Whatsapp", "Email", "Enviado"];

      var leads_facebook = await db.fncListDados('Facebook', dados_leads_facebook, 'Enviado', 'nao');

      for (let i in leads_facebook) {
         // console.log(i); // key
         //console.log(leads_facebook[i][0]); // value against the key
         //console.log(leads_facebook[i][1]);

         var campo_enviado = leads_facebook[i][3];
         console.log(campo_enviado);
         if (campo_enviado === "nao") {

            var nome_lead = leads_facebook[i][0];
            var whatsapp_lead = leads_facebook[i][1];
            mensagem_Lead_Ads_boasVindas(nome_lead, whatsapp_lead);

            let atualiza_enviado = {
               Enviado: "sim",
            }
            db.fncEditDados('Facebook', 'Whatsapp', whatsapp_lead, atualiza_enviado);

         }
      }
   }

   // EXECUTA A FUNÇÃO BUSCAR buscarLeadsFacebook() A CADA MINUTO PARA ATUALIZAR A PLANILHA GOOGLE SHEETS
   cron.schedule('* * * * *', () => {
      buscaLeadsFacebook();
      console.log('running a task every minute');
   });


   sock.ev.on('messages.upsert', async ({ messages, type }) => {

      const msg = messages[0]
      const jid = msg.key.remoteJid
      const nomeUsuario = msg.pushName

      // SOMENTE EXECUTA SE A MENSAGEM FOR DO USUÁRIO
      if (msg.key.fromMe === false && jid !== 'status@broadcast') {

         // EXECUTA QUERY DIALOGFLOW E RETORNA A RESPOSTA NO TEXTRESPONSE 
         let textResponse = "";  
         if(msg.message.conversation != ""){
            textResponse = await executeQueries("andrepinheiroimoveis-igrx", [JSON.stringify(jid)], [JSON.stringify(msg.message.conversation)], 'pt-BR')
         }   
          else if (msg.message.conversation === "" && typeof msg.message.templateButtonReplyMessage.selectedDisplayText != "undefined") {
            textResponse = await executeQueries("andrepinheiroimoveis-igrx", [JSON.stringify(jid)], [JSON.stringify(msg.message.templateButtonReplyMessage.selectedDisplayText)], 'pt-BR')
         }
         
         // PEGA O PRIMEIRO NOME DO CONTATO
         var separaNomeContato = nomeUsuario.split(" ");
         var nomeContato = separaNomeContato[0];

         //TRATAMENTO NÚMERO WHATSAPP COM DDD E 9

         const number = jid.replace(/\D/g, '');
         const ddIddD = number.substr(2, 2);
         const user = number.substr(-8, 8);

         // PEGA O NÚMERO DO WHATSAPP COM DDD
         const numberWhats = ddIddD + " 9" + user;

          //TRATA A MENSAGEM DE ERRO. QUANDO NÃO CONRRESPONDER COM AS INTENTS
   if (`${textResponse}` === "*Siga a orientação abaixo* para dar continuidade ao atendimento 👇") {

      let _Etapa = await db.fncFindDados('Contatos', 'Whatsapp', numberWhats, 'Etapa');

      if(_Etapa === false || _Etapa === "Início"){
      const sendResponse = await sock.sendMessage(jid, { text: `${textResponse}` })
        boasVindas();
        //console.log("funcionou a mensagem de erro");
      }
      else if(_Etapa === "Whatsapp"){
         const sendResponse = await sock.sendMessage(jid, { text: `${textResponse}` })
        confirmaDadosUsuario();
      }
      else if(_Etapa === "Objetivo"){
         const sendResponse = await sock.sendMessage(jid, { text: `${textResponse}` })
        confirmaObjetivoUsuario();
      }
      else if(_Etapa === "Tipo"){
         const sendResponse = await sock.sendMessage(jid, { text: `${textResponse}` })
        //confirmaTipoImovel();
        confirmaTipoImovel();
      }
      else if(_Etapa === "Quartos"){
         const sendResponse = await sock.sendMessage(jid, { text: `${textResponse}` })
        confirmaQuantidadeQuartos();
      }
      else if(_Etapa === "Investimento"){
         const sendResponse = await sock.sendMessage(jid, { text: `${textResponse}` })
        confirmaInvestimento();
      }
      else if(_Etapa === "Finalizar Atendimento"){
         const sendResponse = await sock.sendMessage(jid, { text: `${textResponse}` })
        confirmaFinalizarAtendimento();
      }
      else if(_Etapa === "Ver Imóveis"){
        
        //confirmaVerImoveis();
      }
      else if(_Etapa === "Ver Imóvel Venda 01"){
        
        //confirmaVerImovelVendas01();
      }
      else if(_Etapa === "Ver Imóvel Venda 02"){
        
        //confirmaVerImovelVendas02();
      }
      else if(_Etapa === "Ver Imóvel Venda 03"){
        
        //confirmaVerImovelVendas03();
      }
      else if(_Etapa === "Ver Imóvel Venda 04"){
        
       // confirmaVerImovelVendas04();
      }
      else if(_Etapa === "Dia Visita"){
        
       // confirmaDiaVisita();
      }
      else if(_Etapa === "Período Visita"){
        
       // confirmaPeriodoVisita();
      }
      else if(_Etapa === "Agendamento Visita"){
        
        //confirmaAgendamentoVisita();
      }
       
  }



         // PRIMEIRA MENSAGEM QUANDO O USUÁRIO DIGITA UMA PALAVRA PARA INICIAR A CONVERSA
         async function boasVindas() {

            const numero_whatsapp = jid.replace(/\D/g, '');
            const ddIddD = numero_whatsapp.substr(2, 2);
            const numero_sem_9 = numero_whatsapp.substr(-8, 8);
            console.log('estou aqui agora')

            // PEGA O NÚMERO DO WHATSAPP COM DDD
            const numero_whatsapp_tratado = ddIddD + " 9" + numero_sem_9;

            let verificaWhatsapp = await db.fncFindDados('Contatos', 'Whatsapp', numero_whatsapp_tratado, 'Whatsapp');
            if (verificaWhatsapp != numero_whatsapp_tratado) {
               let dataAdd = {
                  Data: now,
                  Lead: "ok",
                  Nome: nomeUsuario,
                  Whatsapp: numero_whatsapp_tratado,
                  Etapa: "Início",
               }
               db.fncAddDados('Contatos', dataAdd);
            }

            // ENVIA CARD DO LEAD PARA O NÚMERO DEFINIDO PARA RECEBER
            if (enviarInformarcoesLead === "sim") {

               const contact = {
                  fullName: nomeUsuario,
                  waid: "55" + ddIddD + "9" + numero_sem_9,
                  phoneNumber: numero_whatsapp_tratado
               }
               const vcard =
                  'BEGIN:VCARD\n' +
                  'VERSION:3.0\n' +
                  'FN:' +
                  contact.fullName +
                  '\n' +
                  'item1.TEL;waid=' +
                  contact.waid +
                  ':' +
                  contact.phoneNumber +
                  '\n' +
                  'item1.X-ABLabel:Celular\n' +
                  'END:VCARD'

               const result = await sock.sendMessage(jid, {
                  contacts: {
                     displayName: contact.fullName,
                     contacts: [{ vcard, displayName: contact.fullName }]
                  }
               })
            }
            // ENVIAR A IMAGEM DO IMOVEL DO ANÚNCIO
            const sendImage = {
               // optional
               //caption: '```IMAGE TITLE```',
               image: {
                  url: './img/' + nomeImagemImovel,
                  // url: 'https://domain/image.jpeg'
               }
            }
            const sendImg = await sock.sendMessage(jid, sendImage)
            // ENVIA O BOTÃO 
            const buttonsMD = [
               {
                  index: 1,
                  quickReplyButton: { id: 'id1', displayText: '✅  Continuar' }
               }
            ]

            const templateButtons = {
               text: `Olá ${nomeUsuario}! Sou a *${nomeAtendente}*! 🙋‍♀️ Assistente virtual aqui da *${nomeImobiliaria}* :)\n\n🧭 Vi que você clicou no anúncio pra saber mais detalhes deste imóvel.\n\nClique no botão *👇 Continuar* :). `,
               footer: "Estou de acordo com as políticas de privacidade",
               templateButtons: buttonsMD
            }

            const sendButtons = await sock.sendMessage(jid, templateButtons)

         } // FIM boasvindas()

         //enviando texto boas vindas(Welcome Intent OBS: COLOCAR NO WELCOME DEFAULT (DIALOGFLOW) O NOME DA ASSISTENTE E O NOME DA IMOBILIARIA)
         if (`${textResponse}` === "Certo! *Siga a orientação abaixo* para dar continuidade ao atendimento 👇") {
            sendMessageWTyping(jid, { text: `${textResponse}` })
            boasVindas();
         }

         // CONFIRMA DADOS DO USUÁRIO
         async function confirmaDadosUsuario() {
            let dataAdd = {
               Etapa: "Whatsapp",
            }
            db.fncEditDados('Contatos', 'Whatsapp', numberWhats, dataAdd);

            // ENVIA O BOTÃO 
            const buttonsMD = [
               {
                  index: 1,
                  quickReplyButton: { id: 'id1', displayText: 'Comprar um imóvel.' }
               },
               {
                  index: 2,
                  quickReplyButton: { id: 'id2', displayText: 'Alugar um imóvel.' }
               }
            ]

            const templateButtons = {
               text: `É muito bom falar com você *${nomeUsuario}*!\n\nMe diga uma coisa: o que você tem *como plano neste momento* 📝 ? \n\n*Clique* no botão abaixo *pra continuarmos*. 👇`,
               footer: 'Clique abaixo para continuar!',
               templateButtons: buttonsMD
            }

            const sendButtons = await sock.sendMessage(jid, templateButtons)
         }

         //CONFIRMANDO O NOME DO USUÁRIO
         if (`${textResponse}` === "Muito prazer!") {
            const sendResponse = await sock.sendMessage(jid, { text: `${textResponse}` })
            confirmaDadosUsuario();
         }

         // FUNÇÃO QUE CONFIRMA O TIPO DE IMOVEL
         async function confirmaTipoImovel() {
            let confirmaObjetivo = "";
            if (msg.message.conversation === "" && msg.message.templateButtonReplyMessage.selectedDisplayText != "") {
                 confirmaObjetivo = msg.message.templateButtonReplyMessage.selectedDisplayText;
            }
            
            if (confirmaObjetivo === "Comprar um imóvel." || confirmaObjetivo === "Alugar um imóvel.") {
               let dataAdd = {
                  Atendimento: "ok",
                  Objetivo: confirmaObjetivo,
                  Etapa: "Tipo",
               }
               
               db.fncEditDados('Contatos', 'Whatsapp', numberWhats, dataAdd);
            }

            if (enviarInformarcoesLead === "sim" && msg.message.conversation === "" && msg.message.templateButtonReplyMessage.selectedDisplayText != "") {
               // ENVIA O OBJETIVO DO LEAD PARA QUEM IRÁ DAR CONTINUIDADE AO ATENDIMENTO
               const sendResponse = await sock.sendMessage(telefoneRecebeInformacoes, { text: `${msg.message.templateButtonReplyMessage.selectedDisplayText}` })
            }

            const buttonsMD = [
               {
                  index: 1,
                  quickReplyButton: { id: 'id1', displayText: 'Procuro uma Casa/Sobrado' }
               },
               {
                  index: 2,
                  quickReplyButton: { id: 'id2', displayText: 'Procuro um Apartamento' }
               },
               {
                  index: 3,
                  quickReplyButton: { id: 'id2', displayText: 'Outros Imóveis' }
               }
            ]

            const templateButtons = {
               text: `E qual *tipo de imóvel* você está procurando? 🎯 \n\n*Escolha uma opção* abaixo 👇`,
               footer: 'Clique abaixo para confirmar!',
               templateButtons: buttonsMD
            }

            const sendButtons = await sock.sendMessage(jid, templateButtons)

         }
         //CONFIRMANDO O TIPO DE IMÓVEL
         if (`${textResponse}` === "Joia! Entendi!") {
            const sendResponse = await sock.sendMessage(jid, { text: `${textResponse}` })
            confirmaTipoImovel();
         }


         // FUNÇÃO CONFIRMA QUANTIDADE DE QUARTOS
         async function confirmaQuantidadeQuartos() {
            let confirmaTipoImovel = "";
            if (msg.message.conversation === "" && msg.message.templateButtonReplyMessage.selectedDisplayText != "") {
                 confirmaTipoImovel = msg.message.templateButtonReplyMessage.selectedDisplayText;
            }
            console.log(confirmaTipoImovel)
            if (confirmaTipoImovel === "Procuro uma Casa/Sobrado" || confirmaTipoImovel === "Procuro um Apartamento" || confirmaTipoImovel === "Outros Imóveis") {
               let dataAdd = {
                  Tipo: confirmaTipoImovel,
                  Etapa: "Quartos",
               }
               db.fncEditDados('Contatos', 'Whatsapp', numberWhats, dataAdd);
            }
            // ENVIA O TIPO DE IMOVEL DO LEAD PARA QUEM IRÁ DAR CONTINUIDADE AO ATENDIMENTO
            if (enviarInformarcoesLead === "sim" && msg.message.conversation === "" && msg.message.templateButtonReplyMessage.selectedDisplayText != "") {
               // ENVIA O OBJETIVO DO LEAD PARA QUEM IRÁ DAR CONTINUIDADE AO ATENDIMENTO
               const sendResponse = await sock.sendMessage(telefoneRecebeInformacoes, { text: `${msg.message.templateButtonReplyMessage.selectedDisplayText}` })
            }

            const buttonsMD = [
               {
                  index: 1,
                  quickReplyButton: { id: 'id1', displayText: '2 Quartos' }
               },
               {
                  index: 2,
                  quickReplyButton: { id: 'id2', displayText: '3 Quartos' }
               },
               {
                  index: 3,
                  quickReplyButton: { id: 'id2', displayText: '4 Quartos ou mais' }
               }
            ]

            const templateButtons = {
               text: `👍 Joia *${nomeContato}*! E quantos *quartos* este imóvel precisa ter para atender a *sua necessidade*? \n\n*Escolha abaixo* por favor 👇`,
               footer: 'Clique abaixo para confirmar!',
               templateButtons: buttonsMD
            }

            const sendButtons = await sock.sendMessage(jid, templateButtons)

         }
         //CONFIRMANDO QUANTIDADE DE QUARTOS
         if (`${textResponse}` === "Estamos quase lá!") {
            const sendResponse = await sock.sendMessage(jid, { text: `${textResponse}` })
            confirmaQuantidadeQuartos();
         }

         //CONFIRMANDO INVESTIMENTO
         async function confirmaInvestimento() {
            let confirmaQtdQuartos = "";
            if (msg.message.conversation === "" && msg.message.templateButtonReplyMessage.selectedDisplayText != "") {
               confirmaQtdQuartos = msg.message.templateButtonReplyMessage.selectedDisplayText;
            }

            if (confirmaQtdQuartos === "2 Quartos" || confirmaQtdQuartos === "3 Quartos" || confirmaQtdQuartos === "4 Quartos ou mais") {
               let dataAdd = {

                  Quartos: confirmaQtdQuartos,
                  Etapa: "Investimento",
               }
               db.fncEditDados('Contatos', 'Whatsapp', numberWhats, dataAdd);
            }

            let objetivoAtual = await db.fncFindDados('Contatos', 'Whatsapp', numberWhats, 'Objetivo');

            // ENVIA O QUANTIDADE DE QUARTOS DO LEAD PARA QUEM IRÁ DAR CONTINUIDADE AO ATENDIMENTO
            if (enviarInformarcoesLead === "sim" && msg.message.conversation === "" && msg.message.templateButtonReplyMessage.selectedDisplayText != "") {
               const sendResponse = await sock.sendMessage(telefoneRecebeInformacoes, { text: `${msg.message.templateButtonReplyMessage.selectedDisplayText}` })
            }

            const buttonsMD = [
               {
                  index: 1,
                  quickReplyButton: { id: 'id1', displayText: (objetivoAtual === "Comprar um imóvel." ? investimentoCompra01 : investimentoLocacao01) }
               },
               {
                  index: 2,
                  quickReplyButton: { id: 'id2', displayText: (objetivoAtual === "Comprar um imóvel." ? investimentoCompra02 : investimentoLocacao02) }
               },
               {
                  index: 3,
                  quickReplyButton: { id: 'id2', displayText: (objetivoAtual === "Comprar um imóvel." ? investimentoCompra03 : investimentoLocacao03) }
               }
            ]
            let textoInvestimentoCompra = "Quanto está pensando em investir no seu novo imóvel *" + nomeContato + "* 💵 ? *Selecione abaixo* por gentileza 👇";
            let textoInvestimentoLocacao = "Quanto está pensando no valor do aluguel *" + nomeContato + "* 💵 ? *Selecione abaixo* por gentileza 👇";
            const templateButtons = {
               text: (objetivoAtual === "Comprar um imóvel." ? textoInvestimentoCompra : textoInvestimentoLocacao),
               footer: 'Clique abaixo para confirmar!',
               templateButtons: buttonsMD
            }

            const sendButtons = await sock.sendMessage(jid, templateButtons)

         }
         // CHAMA A FUNÇÃO CONFIRMA INVESTIMENTO
         if (`${textResponse}` === "Agora preciso saber o seguinte.") {
            const sendResponse = await sock.sendMessage(jid, { text: `${textResponse}` })
            confirmaInvestimento();
         }

         async function confirmaFinalizarAtendimento() {
           let confirmaQtdInvestimento = "";
            if (msg.message.conversation === "" && msg.message.templateButtonReplyMessage.selectedDisplayText != "") {
                 confirmaQtdInvestimento = msg.message.templateButtonReplyMessage.selectedDisplayText;
            }
            
            if (
               confirmaQtdInvestimento === investimentoCompra01 ||
               confirmaQtdInvestimento === investimentoCompra02 ||
               confirmaQtdInvestimento === investimentoCompra03 ||
               confirmaQtdInvestimento === investimentoLocacao01 ||
               confirmaQtdInvestimento === investimentoLocacao02 ||
               confirmaQtdInvestimento === investimentoLocacao03) {
               let dataAdd = {
                  Codigo: codigoImovel,
                  Investimento: confirmaQtdInvestimento,
                  Etapa: "Finalizar Atendimento",
               }
               db.fncEditDados('Contatos', 'Whatsapp', numberWhats, dataAdd);
            }

            // ENVIA O INVESTIMENTO DO LEAD PARA QUEM IRÁ DAR CONTINUIDADE AO ATENDIMENTO
            if (enviarInformarcoesLead === "sim" && msg.message.conversation === "" && msg.message.templateButtonReplyMessage.selectedDisplayText != "") {
               const sendResponse = await sock.sendMessage(telefoneRecebeInformacoes, { text: `${msg.message.templateButtonReplyMessage.selectedDisplayText}` })
            }


            // Send basic text
            const sendResponse = await sock.sendMessage(jid, { text: `${textResponse}` })
            const sendResponse2 = await sock.sendMessage(jid, { text: `*${nomeContato}*, um de nossos especialistas verá as melhores alternativas pra você e continuará o atendimento. *Deixa comigo :)*` })
            const sendResponse3 = await sock.sendMessage(jid, { text: `Tempo de espera (horário comercial): *` + tempoEsperaAtendimento + `*` })



         }
         //CONFIRMANDO VER IMÓVEIS
         if (`${textResponse}` === "Pronto. Consegui registrar as informações!") {


            confirmaFinalizarAtendimento();

         }


         if (!isGroup(jid) && !msg.key.fromMe) {
            console.log("MESSAGE: ", msg)

            sock.sendReadReceipt(jid, msg.key.participant, [msg.key.id])

            // plain text sending
            if (msg.message.conversation.toLowerCase() === 'text') {
               sendMessageWTyping(jid, { text: 'Text example.' })
                  .then(result => console.log('RESULT: ', result))
                  .catch(err => console.log('ERROR: ', err))
            }

            // sending the common buttons
            if (msg.message.conversation.toLowerCase() === 'btn') {
               const buttonsMessage = {
                  text: '*BUTTON TITLE*\n\nButton Description',
                  footer: 'footer-btn',
                  buttons: buttons,
                  headerType: 1
               }
               sendMessageWTyping(jid, buttonsMessage)
                  .then(result => console.log('RESULT: ', result))
                  .catch(err => console.log('ERROR: ', err))
            }

            // sending md buttons
            if (msg.message.conversation.toLowerCase() === 'btn md') {
               const template = {
                  text: '*BUTTON TITLE*\n\nButton Description',
                  footer: 'footer-btn-md',
                  templateButtons: buttonsMD
               }
               sendMessageWTyping(jid, template)
                  .then(result => console.log('RESULT: ', result))
                  .catch(err => console.log('ERROR: ', err))
            }

            // sending image
            if (msg.message.conversation.toLowerCase() === 'img') {
               const sendImage = {
                  // optional
                  caption: '```IMAGE TITLE```',
                  image: {
                     url: './assets/github.jpg',
                     // url: 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg'
                  }
               }
               sendMessageWTyping(jid, sendImage)
                  .then(result => console.log('RESULT: ', result))
                  .catch(err => console.log('ERROR: ', err))
            }

            // sending image with buttons
            if (msg.message.conversation.toLowerCase() === 'img btn') {
               const templateImage = {
                  // optional
                  caption: '```IMAGE TITLE```\n\nDescrption',
                  // optional
                  footer: 'subtitle',
                  image: {
                     url: './assets/github.jpg',
                     // url: 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg'
                  },
                  buttons: buttons
               }
               sendMessageWTyping(jid, templateImage)
                  .then(result => console.log('RESULT: ', result))
                  .catch(err => console.log('ERROR: ', err))
            }

            // sending image with MD buttons
            if (msg.message.conversation.toLowerCase() === 'img btn md') {
               const templateImage = {
                  // optional
                  caption: '```IMAGE TITLE```\n\nDescrption',
                  // optional
                  footer: 'subtitle',
                  image: {
                     url: './assets/github.jpg',
                     // url: 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg'
                  },
                  templateButtons: buttonsMD
               }
               sendMessageWTyping(jid, templateImage)
                  .then(result => console.log('RESULT: ', result))
                  .catch(err => console.log('ERROR: ', err))
            }

            // sending video
            if (msg.message.conversation.toLowerCase() === 'video') {
               const sendVideo = {
                  // optional
                  caption: '```VIDEO TITLE```',
                  video: {
                     url: './assets/minero_no_espaço.mp4',
                  },
                  mimetype: 'video/mp4',
                  gifPlayback: true
               }
               sendMessageWTyping(jid, sendVideo)
                  .then(result => console.log('RESULT: ', result))
                  .catch(err => console.log('ERROR: ', err))
            }

            // sending video with buttons
            if (msg.message.conversation.toLowerCase() === 'video btn') {
               const templateVideo = {
                  // optional
                  caption: '```VIDEO TITLE```\n\nDescrption',
                  // optional
                  footer: 'subtitle',
                  video: {
                     url: './assets/minero_no_espaço.mp4',
                  },
                  mimetype: 'video/mp4',
                  gifPlayback: true,
                  buttons: buttons
               }
               sendMessageWTyping(jid, templateVideo)
                  .then(result => console.log('RESULT: ', result))
                  .catch(err => console.log('ERROR: ', err))
            }

            // sending video with MD buttons
            if (msg.message.conversation.toLowerCase() === 'video btn md') {
               const templateVideo = {
                  // optional
                  caption: '```VIDEO TITLE```\n\nDescrption',
                  // optional
                  footer: 'subtitle',
                  video: {
                     url: './assets/minero_no_espaço.mp4',
                  },
                  mimetype: 'video/mp4',
                  gifPlayback: true,
                  templateButtons: buttonsMD
               }
               sendMessageWTyping(jid, templateVideo)
                  .then(result => console.log('RESULT: ', result))
                  .catch(err => console.log('ERROR: ', err))
            }

            // sending pdf document
            if (msg.message.conversation.toLowerCase() === 'pdf') {
               const sendDoc = {
                  fileName: 'github.pdf',
                  mimetype: 'application/pdf',
                  document: {
                     url: './assets/github.pdf'
                     // url: 'https://www2.senado.leg.br/bdsf/bitstream/handle/id/518231/CF88_Livro_EC91_2016.pdf' //  this url may take a while
                  }
               }
               sendMessageWTyping(jid, sendDoc)
                  .then(result => console.log('RESULT: ', result))
                  .catch(err => console.log('ERROR: ', err))
            }

            // sending pdf document with buttons
            if (msg.message.conversation.toLowerCase() === 'pdf btn') {
               const templateDoc = {
                  // optional
                  caption: '*DOCUMENT TITLE*\n\nDescrption',
                  // optional
                  footer: 'subtitle',
                  fileName: 'github.pdf',
                  mimetype: 'application/pdf',
                  document: {
                     url: './assets/github.pdf'
                     // url: 'https://www2.senado.leg.br/bdsf/bitstream/handle/id/518231/CF88_Livro_EC91_2016.pdf' //  this url may take a while
                  },
                  buttons: buttons
               }
               sendMessageWTyping(jid, templateDoc)
                  .then(result => console.log('RESULT: ', result))
                  .catch(err => console.log('ERROR: ', err))
            }

            // sending pdf document with MD buttons
            if (msg.message.conversation.toLowerCase() === 'pdf btn md') {
               const templateDoc = {
                  // optional
                  caption: '```DOCUMENT TITLE```\n\nDescrption',
                  // optional
                  footer: 'subtitle',
                  fileName: 'github.pdf',
                  mimetype: 'application/pdf',
                  document: {
                     url: './assets/github.pdf'
                     // url: 'https://www2.senado.leg.br/bdsf/bitstream/handle/id/518231/CF88_Livro_EC91_2016.pdf' //  this url may take a while
                  },
                  templateButtons: buttonsMD
               }
               sendMessageWTyping(jid, templateDoc)
                  .then(result => console.log('RESULT: ', result))
                  .catch(err => console.log('ERROR: ', err))
            }

            // sending link with preview
            if (msg.message.conversation.toLowerCase() === 'link') {
               sendMessageWTyping(jid, {
                  forward: {
                     key: { fromMe: true },
                     message: {
                        extendedTextMessage: {
                           text: 'https://github.com/code-chat-br/exemples-baileys',
                           matchedText: 'https://github.com/code-chat-br/exemples-baileys',
                           canonicalUrl: 'https://github.com/code-chat-br/exemples-baileys',
                           title: 'GitHub - jrCleber/exemples-baileys',
                           description: 'Contribute to jrCleber/exemples-baileys development by creating an account on GitHub.',
                           // optional
                           jpegThumbnail: readFileSync('./assets/github.jpg')
                        }
                     }
                  }
               })
                  .then(result => console.log('RESULT: ', result))
                  .catch(err => console.log('ERROR: ', err))
            }

            // sending list
            if (msg.message.conversation.toLowerCase() === 'list') {
               const sections = [
                  {
                     title: 'CATEGORY 01',
                     rows: [
                        { title: 'Row 01', description: 'Description 01', rowId: 'rid1' },
                        { title: 'Row 02', description: 'Description 02', rowId: 'rid2' },
                        { title: 'Row 03', description: 'Description 03', rowId: 'rid3' },
                     ],
                  },
                  {
                     title: 'CATEGORY 02',
                     rows: [
                        { title: 'Row 01', description: 'Description 01', rowId: 'rid4' },
                        { title: 'Row 02', description: 'Description 02', rowId: 'rid5' },
                        { title: 'Row 03', description: 'Description 03', rowId: 'rid6' },
                        { title: 'Row 04', description: 'Description 04', rowId: 'rid7' },
                     ],
                  },
                  {
                     title: 'CATEGORY 03',
                     rows: [
                        { title: 'Row 01', description: 'Description 01', rowId: 'rid8' },
                        { title: 'Row 02', description: 'Description 02', rowId: 'rid9' },
                     ],
                  },
               ]

               const sendList = {
                  title: '🌎 *LIST TITLE* 🌎\n',
                  text: 'Click the *button* and see the list items\n',
                  buttonText: 'Clique here',
                  footer: 'footet-list\nlink: https://github.com/jrCleber/exemples-baileys',
                  sections: sections
               }

               sendMessageWTyping(jid, sendList)
                  .then(result => console.log('RESULT: ', result))
                  .catch(err => console.log('ERROR: ', err))
            }

            // sending contact
            if (msg.message.conversation.toLowerCase() === 'contact') {
               const contact = {
                  fullName: 'Name contact',
                  waid: '553100000000',
                  phoneNumber: '+55 31 9 0000-0000'
               }
               const vcard =
                  'BEGIN:VCARD\n' +
                  'VERSION:3.0\n' +
                  'FN:' +
                  contact.fullName +
                  '\n' +
                  'item1.TEL;waid=' +
                  contact.waid +
                  ':' +
                  contact.phoneNumber +
                  '\n' +
                  'item1.X-ABLabel:Celular\n' +
                  'END:VCARD'

               sendMessageWTyping(jid, {
                  contacts: {
                     displayName: contact.fullName,
                     contacts: [{ vcard, displayName: contact.fullName }]
                  }
               })
                  .then(result => console.log('RESULT: ', result))
                  .catch(err => console.log('ERROR: ', err))
            }

            // sending contact list
            if (msg.message.conversation.toLowerCase() === 'contact list') {
               const contactList = [
                  {
                     fullName: 'Name contact 01',
                     waid: '553100000001',
                     phoneNumber: '+55 31 9 0000-0001',
                  },
                  {
                     fullName: 'Name contact 02',
                     waid: '553100000002',
                     phoneNumber: '+55 31 9 0000-0002',
                  },
                  {
                     fullName: 'Name contact 03',
                     waid: '553100000003',
                     phoneNumber: '+55 31 9 0000-0003',
                  },
                  {
                     fullName: 'Name contact 04',
                     waid: '553100000004',
                     phoneNumber: '+55 31 9 0000-0004',
                  },
               ]

               const contacts = Array.from(contactList, c => {
                  return {
                     displayName: c.fullName,
                     vcard:
                        'BEGIN:VCARD\n' +
                        'VERSION:3.0\n' +
                        'FN:' +
                        c.fullName +
                        '\n' +
                        'item1.TEL;waid=' +
                        c.waid +
                        ':' +
                        c.phoneNumber +
                        '\n' +
                        'item1.X-ABLabel:Celular\n' +
                        'END:VCARD',
                  }
               })

               sendMessageWTyping(jid, {
                  contacts: {
                     displayName: `${contacts.length} contacts`,
                     contacts: contacts
                  }
               })
                  .then(result => console.log('RESULT: ', result))
                  .catch(err => console.log('ERROR: ', err))
            }
         }

         //const result = sock.sendMessage(jid, textResponse)
         //const sentMsg = sock.sendMessage(jid, {text: '*Siga a orientação abaixo* para dar continuidade ao atendimento 👇'});

         //let textResponse = await executeQueries("crypiabot-xilean", message.key.remoteJid, [JSON.stringify(message.message.conversation)], 'pt-BR');
         //const sentMsg  = await conn.sendMessage (message.key.remoteJid, textResponse, MessageType.text);

      } // FIM if(!msg.key.fromMe && m.type === 'notify') {
   }) // FIM message.upsert

}