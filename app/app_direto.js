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
//const dialogflow = require("@google-cloud/dialogflow");

const dados = require('./helpers/dados');
const db = require('./helpers/andrepinheiroimoveis_sheets');

const makeWaSocket = require('@adiwajshing/baileys').default
const { useSingleFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@adiwajshing/baileys')
const { checkPath } = require('./utils/check.js')
const P = require('pino')
//const { unlink } = require('fs')
const { unlink, existsSync, mkdirSync, readFileSync } = require('fs');

/* folders where the authentication files will be saved */
const pathMD = './sessionsMD/'

/* authentication file name */
const fileAuth = 'auth_info.json'

// ------------------------------------------------------------------

//const dialogflow = require('@google-cloud/dialogflow').v2;
const fs = require('fs');
const moment = require('moment');
const axios = require('axios');
const sheet = require('google-spreadsheet');
const { text } = require('express');
var cron = require('node-cron');

// ------------------------------------------------------------------
 // PEGA O PRIMEIRO NOME DO CONTATO
 async function pegar_first_name(nome_completo) {

   var separa_nome_completo = nome_completo.split(" ");
   var first_name = separa_nome_completo[0];
   return first_name;
}


/**
 * @param {import('@adiwajshing/baileys').BaileysEventEmitter} sock
 */
 const connectionUpdate = (sock) => {
   sock.on('connection.update', ({ connection, lastDisconnect, qr }) => {
      if (qr) console.log('qrcode: ', qr);

      if (connection === 'close') {
         const shouldRecnnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut

         if (shouldRecnnect) connectOnWhatsapp()

         if (shouldRecnnect === false) {
            const removeAuth = pathMD + fileAuth
            unlink(removeAuth, err => {
               if (err) throw err
            })
         }
      }

      if (connection === 'open') console.log('CONNECTED WHATSAPP MD')
   })
}
const connectOnWhatsapp = async () => {

   const { version, isLatest } = await fetchLatestBaileysVersion()

   checkPath(pathMD)

   const { saveState, state } = useSingleFileAuthState(pathMD + fileAuth)

   const config = {
      printQRInTerminal: true,
      connectTimeoutMs: 60_000,
      auth: state,
      logger: P({ level: 'error' }),
      // version: [2, 2204, 13],
      version,
      async getMessage(key) {
         return { conversation: 'oi' };
      },
   }

   const sock = makeWaSocket(config)

   connectionUpdate(sock.ev)

   sock.ev.on('creds.update', saveState)

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

   // PEGA O PRIMEIRO NOME DO CONTATO
   async function pegar_first_name(nome_completo) {

      var separa_nome_completo = nome_completo.split(" ");
      var first_name = separa_nome_completo[0];
      return first_name;
   }


   //TRATAMENTO NÚMERO WHATSAPP COM DDD E 9 NA FRENTE
   async function whatsapp_com_ddd_e_9_na_frente(jid) {
      let number = jid.replace(/\D/g, '');
      let ddIddD = number.substr(2, 2);
      let numero_sem_9 = number.substr(-8, 8);

      // PEGA O NÚMERO DO WHATSAPP COM DDD
      let numberWhats = ddIddD + " 9" + numero_sem_9;
      return numberWhats;
      //return console.log(numberWhats + " viu");
   }
   async function whatsapp_com_ddi_ddd_sem_9_na_frente(jid) {
      let number = jid.replace(/\D/g, '');
      let ddIddD = number.substr(2, 2);
      let numero_sem_9 = number.substr(-8, 8);

      // PEGA O NÚMERO DO WHATSAPP COM DDD
      let numberWhats = "55" + ddIddD + numero_sem_9;
      return numberWhats;
      //return console.log(numberWhats + " viu");
   }
   // FUNCAO ENVIA MENSAGEM COM BOTOES
   async function envia_mensagem_com_botoes(
      qtde_botoes,
      display_texto_btn_01,
      display_texto_btn_02,
      display_texto_btn_03,
      texto_principal,
      footer,
      enviar_para_whatsapp) {

      let buttonsMD = "";
      if (qtde_botoes === "1") {

         buttonsMD = [
            {
               index: 1,
               quickReplyButton: { id: 'id1', displayText: display_texto_btn_01 }
            }
         ]


      } else if (qtde_botoes === "2") {
         buttonsMD = [
            {
               index: 1,
               quickReplyButton: { id: 'id1', displayText: display_texto_btn_01 }
            },
            {
               index: 2,
               quickReplyButton: { id: 'id2', displayText: display_texto_btn_02 }
            }
         ]


      } else if (qtde_botoes === "3") {
         buttonsMD = [
            {
               index: 1,
               quickReplyButton: { id: 'id1', displayText: display_texto_btn_01 }
            },
            {
               index: 2,
               quickReplyButton: { id: 'id2', displayText: display_texto_btn_02 }
            },
            {
               index: 3,
               quickReplyButton: { id: 'id3', displayText: display_texto_btn_03 }
            }
         ]
      }

      const templateButtons = {
         text: texto_principal,
         footer: footer,
         templateButtons: buttonsMD
      }

      await sock.presenceSubscribe(enviar_para_whatsapp)
      await delay(500)

      await sock.sendPresenceUpdate('composing', enviar_para_whatsapp)
      await delay(1000)

      await sock.sendPresenceUpdate('paused', enviar_para_whatsapp)

      const sendButtons = await sock.sendMessage(enviar_para_whatsapp, templateButtons)
   }

   // ENVIA MENSAGEM COM CARD DE CONTATO
   async function envia_mensagem_com_card_contato(nome_contato, jid, numero_whatsapp_tratado, telefoneRecebeInformacoes) {
      const numero_whatsapp = jid.replace(/\D/g, '');
      const ddIddD = numero_whatsapp.substr(2, 2);
      const numero_sem_9 = numero_whatsapp.substr(-8, 8);

      const contact = {
         fullName: nome_contato,
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

   // FUNÇÃO ENVIA MENSAGEM COM IMAGEM
   async function envia_mensagem_com_imagem(url_imagem, jid) {

      const sendImage = {
         // optional
         //caption: '```IMAGE TITLE```',
         image: {
            url: url_imagem,
            // url: 'https://domain/image.jpeg'
         }
      }

      await sock.presenceSubscribe(jid)
      await delay(500)

      await sock.sendPresenceUpdate('composing', jid)
      await delay(1000)

      await sock.sendPresenceUpdate('paused', jid)

      const sendImg = await sock.sendMessage(jid, sendImage)
   }


   // ENVIA A PRIMEIRA MENSAGEM QUANDO O LEAD SE CADASTRA VIA ANÚNCIO FACEBOOK
   async function mensagem_Lead_Ads_boasVindas(nome_lead, whatsapp_lead) {

      const whatsapp_lead_sem_o_9_na_frente = await whatsapp_com_ddi_ddd_sem_9_na_frente(whatsapp_lead);
      const numero_whatsapp_com_ddd_e_9_na_frente = await whatsapp_com_ddd_e_9_na_frente(whatsapp_lead);
      let jid = whatsapp_lead_sem_o_9_na_frente + "@s.whatsapp.net";

      let verificaWhatsapp = await db.fncFindDados('Contatos', 'Whatsapp', `${numero_whatsapp_com_ddd_e_9_na_frente}`, 'Whatsapp');
      if (verificaWhatsapp != numero_whatsapp_com_ddd_e_9_na_frente) {
         let dataAdd = {
            Data: now,
            Lead: "ok",
            Nome: nome_lead,
            Whatsapp: numero_whatsapp_com_ddd_e_9_na_frente,
            Etapa: "Início",
         }
         db.fncAddDados('Contatos', dataAdd);
      }

      // ENVIA O CARD DO LEAD PARA QUEM IRÁ DAR CONTINUIDADE AO ATENDIMENTO
      if (enviarInformarcoesLead === "sim") {
         const envia_card_lead = await envia_mensagem_com_card_contato(nome_lead, jid, `${numero_whatsapp_com_ddd_e_9_na_frente}`, telefoneRecebeInformacoes);
      }
      
      // ENVIAR A IMAGEM DO IMOVEL DO ANÚNCIO
      const envia_msg_com_imagem_lead = await envia_mensagem_com_imagem('./img/' + nomeImagemImovel, jid);

      // ENVIA O BOTÃO 
      const envia_msg_com_botoes_lead= await envia_mensagem_com_botoes(
         "1",
         '✅  Continuar',
         "",
         "",
         `Olá ${nome_lead}! Sou a *${nomeAtendente}*! 🙋‍♀️ Assistente virtual aqui da *${nomeImobiliaria}* :)\n\n🧭 Vi que você clicou no anúncio pra saber mais detalhes deste imóvel.\n\nClique no botão *👇 Continuar* :). `,
         "Estou de acordo com as políticas de privacidade",
         jid
      );

   } // FIM mensagem_Lead_Ads_boasVindas(nome_lead, whatsapp_lead) 

   // BUSCA OS LEADS GERADOS PELO FORM DO FACEBOOK E ENVIA A PRIMEIRA MENSAGEM
   async function buscaLeadsFacebook() {

      var dados_leads_facebook = ["Nome", "Whatsapp", "Email", "Enviado"];

      var leads_facebook = await db.fncListDados('Facebook', dados_leads_facebook, 'Enviado', 'nao');
      console.log('buscar dados na planilha')
      console.log(leads_facebook)
      for (let i in leads_facebook) {
         //console.log(i); // key
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

         let nomeContato = await pegar_first_name(nomeUsuario);
         const numero_whatsapp_com_ddd_e_9_na_frente = await whatsapp_com_ddd_e_9_na_frente(jid);
                  
         console.log(msg)
         console.log(Object.keys(msg.message))
         console.log()
         const messageTypes = Object.keys(msg.message);
         const messageType = messageTypes.find((t) => ['conversation', 'extendedTextMessage', 'templateButtonReplyMessage'].includes(t));
   
         console.log("parsed message type:" + messageType);

         let respostaChat = "";

         if (messageType === "extendedTextMessage") {
            respostaChat = msg.message.extendedTextMessage.text;
            console.log("pegou extendedTextMessage:" + respostaChat)
         } else if (messageType === "conversation") {
            respostaChat = msg.message.conversation;
            console.log("pegou conversation:" + respostaChat)
         }else if (messageType === "templateButtonReplyMessage") {
            respostaChat = msg.message.templateButtonReplyMessage.selectedDisplayText;
            console.log("pegou templateButtonReplayMessage:" + respostaChat)
         }
         
         if(
            respostaChat != "começar" &&
            respostaChat != "Certo! *Siga a orientação abaixo* para dar continuidade ao atendimento 👇" &&
            respostaChat != '✅  Continuar' &&
            respostaChat != "Comprar um imóvel." &&
            respostaChat != "Alugar um imóvel." &&
            respostaChat != "Procuro uma Casa/Sobrado" &&
            respostaChat != "Procuro um Apartamento" &&
            respostaChat != "Outros Imóveis" &&
            respostaChat != "2 Quartos" &&
            respostaChat != "3 Quartos" &&
            respostaChat != "4 Quartos ou mais" &&
            respostaChat != investimentoCompra01 &&
            respostaChat != investimentoCompra02 &&
            respostaChat != investimentoCompra03 &&
            respostaChat != investimentoLocacao01 &&
            respostaChat != investimentoLocacao02 &&
            respostaChat != investimentoLocacao03 
         ){
            respostaChat = "*Siga a orientação abaixo* para dar continuidade ao atendimento 👇";
         }

         if(`${respostaChat}` === "*Siga a orientação abaixo* para dar continuidade ao atendimento 👇")
         {
            let _Etapa = await db.fncFindDados('Contatos', 'Whatsapp', `${numero_whatsapp_com_ddd_e_9_na_frente}`, 'Etapa');

            if (_Etapa === false || _Etapa === "Início") {
               const sendResponse = await sock.sendMessage(jid, { text: "*Siga a orientação abaixo* para dar continuidade ao atendimento 👇" })
               boasVindas();
               //console.log("funcionou a mensagem de erro");
            }
            else if (_Etapa === "Whatsapp") {
               const sendResponse = await sock.sendMessage(jid, { text: "*Siga a orientação abaixo* para dar continuidade ao atendimento 👇" })
               confirmaDadosUsuario();
            }
            else if (_Etapa === "Objetivo") {
               const sendResponse = await sock.sendMessage(jid, { text: "*Siga a orientação abaixo* para dar continuidade ao atendimento 👇" })
               confirmaObjetivoUsuario();
            }
            else if (_Etapa === "Tipo") {
               const sendResponse = await sock.sendMessage(jid, { text: "*Siga a orientação abaixo* para dar continuidade ao atendimento 👇" })
               //confirmaTipoImovel();
               confirmaTipoImovel();
            }
            else if (_Etapa === "Quartos") {
               const sendResponse = await sock.sendMessage(jid, { text: "*Siga a orientação abaixo* para dar continuidade ao atendimento 👇" })
               confirmaQuantidadeQuartos();
            }
            else if (_Etapa === "Investimento") {
               const sendResponse = await sock.sendMessage(jid, { text: "*Siga a orientação abaixo* para dar continuidade ao atendimento 👇" })
               confirmaInvestimento();
            }
            else if (_Etapa === "Finalizar Atendimento") {
               const sendResponse = await sock.sendMessage(jid, { text: "*Siga a orientação abaixo* para dar continuidade ao atendimento 👇" })
               confirmaFinalizarAtendimento();
            }
            else if (_Etapa === "Ver Imóveis") {

               //confirmaVerImoveis();
            }
            else if (_Etapa === "Ver Imóvel Venda 01") {

               //confirmaVerImovelVendas01();
            }
            else if (_Etapa === "Ver Imóvel Venda 02") {

               //confirmaVerImovelVendas02();
            }
            else if (_Etapa === "Ver Imóvel Venda 03") {

               //confirmaVerImovelVendas03();
            }
            else if (_Etapa === "Ver Imóvel Venda 04") {

               // confirmaVerImovelVendas04();
            }
            else if (_Etapa === "Dia Visita") {

               // confirmaDiaVisita();
            }
            else if (_Etapa === "Período Visita") {

               // confirmaPeriodoVisita();
            }
            else if (_Etapa === "Agendamento Visita") {

               //confirmaAgendamentoVisita();
            }

         }

         if (respostaChat === "começar") {
            sendMessageWTyping(jid, { text: "Certo! *Siga a orientação abaixo* para dar continuidade ao atendimento 👇" });
            boasVindas();
         }

         async function boasVindas() {

            let verificaWhatsapp = await db.fncFindDados('Contatos', 'Whatsapp', `${numero_whatsapp_com_ddd_e_9_na_frente}`, 'Whatsapp');
            if (verificaWhatsapp != numero_whatsapp_com_ddd_e_9_na_frente) {
               
               let dataAdd = {
                  Data: now,
                  Lead: "ok",
                  Nome: nomeUsuario,
                  Whatsapp: numero_whatsapp_com_ddd_e_9_na_frente,
                  Etapa: "Início",
               }
               
               db.fncAddDados('Contatos', dataAdd);
            }
            
            // ENVIA CARD DO LEAD PARA O NÚMERO DEFINIDO PARA RECEBER
            if (enviarInformarcoesLead === "sim") {
               const envia_card_contato = await envia_mensagem_com_card_contato(nomeUsuario, jid, `${numero_whatsapp_com_ddd_e_9_na_frente}`, telefoneRecebeInformacoes);
            }
            // ENVIAR A IMAGEM DO IMOVEL DO ANÚNCIO
            const envia_msg_com_imagem = await envia_mensagem_com_imagem('./img/' + nomeImagemImovel, jid);

            // ENVIA O BOTÃO 
            const envia_msg_com_botoes = await envia_mensagem_com_botoes(
               "1",
               '✅  Continuar',
               "",
               "",
               `Olá ${nomeUsuario}! Sou a *${nomeAtendente}*! 🙋‍♀️ Assistente virtual aqui da *${nomeImobiliaria}* :)\n\n🧭 Vi que você clicou no anúncio pra saber mais detalhes deste imóvel.\n\nClique no botão *👇 Continuar* :). `,
               "Estou de acordo com as políticas de privacidade",
               jid
            );
         } // FIM boasvindas2()

         // CONFIRMA DADOS DO USUÁRIO
         if (respostaChat === '✅  Continuar') {
            const sendResponse = sendMessageWTyping(jid, { text: "Muito prazer!" })
            confirmaDadosUsuario();
         }

         // FUNÇÃO CONFIRMA DADOS USUARIO
         async function confirmaDadosUsuario() {
            let dataAdd = {
               Etapa: "Whatsapp",
            }
            db.fncEditDados('Contatos', 'Whatsapp', `${numero_whatsapp_com_ddd_e_9_na_frente}`, dataAdd);
            console.log(`${numero_whatsapp_com_ddd_e_9_na_frente}`)
            // ENVIA O BOTÃO 
            const envia_msg_com_botoes = await envia_mensagem_com_botoes(
               "2",
               'Comprar um imóvel.',
               'Alugar um imóvel.',
               "",
               `É muito bom falar com você *${nomeUsuario}*!\n\nMe diga uma coisa: o que você tem *como plano neste momento* 📝 ? \n\n*Clique* no botão abaixo *pra continuarmos*. 👇`,
               'Clique abaixo para continuar!',
               jid
            );

         }

         if (respostaChat === "Comprar um imóvel." || respostaChat === "Alugar um imóvel.") {
            const sendResponse = sendMessageWTyping(jid, { text: "Joia! Entendi!" })
            confirmaTipoImovel(respostaChat);
            //console.log('deu certo template buttom reply');
         }

         async function confirmaTipoImovel(respostaChat) {

            let dataAdd = {
               Atendimento: "ok",
               Objetivo: respostaChat,
               Etapa: "Tipo",
            }
            console.log(dataAdd.Objetivo)
            console.log(`${numero_whatsapp_com_ddd_e_9_na_frente}`)

            db.fncEditDados('Contatos', 'Whatsapp', `${numero_whatsapp_com_ddd_e_9_na_frente}`, dataAdd);
            console.log(numero_whatsapp_com_ddd_e_9_na_frente)

            if (enviarInformarcoesLead === "sim") {
               // ENVIA O OBJETIVO DO LEAD PARA QUEM IRÁ DAR CONTINUIDADE AO ATENDIMENTO
               if (messageType === "templateButtonReplyMessage") {
                  const sendResponse = await sock.sendMessage(telefoneRecebeInformacoes, { text: `${msg.message.templateButtonReplyMessage.selectedDisplayText}` })
               }
            }

            // ENVIA O BOTÃO 
            const envia_msg_com_botoes = await envia_mensagem_com_botoes(
               "3",
               'Procuro uma Casa/Sobrado',
               'Procuro um Apartamento',
               'Outros Imóveis',
               `E qual *tipo de imóvel* você está procurando? 🎯 \n\n*Escolha uma opção* abaixo 👇`,
               'Clique abaixo para continuar!',
               jid
            );

         }

         // FUNÇÃO CONFIRMA QUANTIDADE DE QUARTOS
         if (respostaChat === "Procuro uma Casa/Sobrado" || respostaChat === "Procuro um Apartamento" || respostaChat == "Outros Imóveis") {
            const sendResponse = sendMessageWTyping(jid, { text: "Estamos quase lá!" })
            confirmaQuantidadeQuartos(respostaChat);
            //console.log('deu certo template buttom reply');
         }

         async function confirmaQuantidadeQuartos(respostaChat) {

            let dataAdd = {
               Tipo: respostaChat,
               Etapa: "Quartos",
            }
            db.fncEditDados('Contatos', 'Whatsapp', `${numero_whatsapp_com_ddd_e_9_na_frente}`, dataAdd);

            // ENVIA O TIPO DE IMOVEL DO LEAD PARA QUEM IRÁ DAR CONTINUIDADE AO ATENDIMENTO
            if (enviarInformarcoesLead === "sim") {
               if (messageType === "templateButtonReplyMessage") {
                  const sendResponse = await sock.sendMessage(telefoneRecebeInformacoes, { text: `${msg.message.templateButtonReplyMessage.selectedDisplayText}` })
               }            
            }
            // ENVIA O BOTÃO 
            const envia_msg_com_botoes = await envia_mensagem_com_botoes(
               "3",
               '2 Quartos',
               '3 Quartos',
               '4 Quartos ou mais',
               '👍 Joia *'+`${nomeContato}`+'*! E quantos *quartos* este imóvel precisa ter para atender a *sua necessidade*? \n\n*Escolha abaixo* por favor 👇',
               'Clique abaixo para confirmar!',
               jid
            );

         }

         //CONFIRMANDO INVESTIMENTO
         if (respostaChat === "2 Quartos" || respostaChat === "3 Quartos" || respostaChat === "4 Quartos ou mais") {
            const sendResponse = sendMessageWTyping(jid, { text: "Agora preciso saber o seguinte." })
            confirmaInvestimento(respostaChat);
            //console.log('deu certo template buttom reply');
         }

         async function confirmaInvestimento(respostaChat) {

            let dataAdd = {

               Quartos: respostaChat,
               Etapa: "Investimento",
            }
            db.fncEditDados('Contatos', 'Whatsapp', `${numero_whatsapp_com_ddd_e_9_na_frente}`, dataAdd);

            let objetivoAtual = await db.fncFindDados('Contatos', 'Whatsapp', `${numero_whatsapp_com_ddd_e_9_na_frente}`, 'Objetivo');

            // ENVIA O QUANTIDADE DE QUARTOS DO LEAD PARA QUEM IRÁ DAR CONTINUIDADE AO ATENDIMENTO
            if (enviarInformarcoesLead === "sim") {
               if (messageType === "templateButtonReplyMessage") {
                  const sendResponse = await sock.sendMessage(telefoneRecebeInformacoes, { text: `${msg.message.templateButtonReplyMessage.selectedDisplayText}` })
               }            
            }

            // ENVIA O BOTÃO 
            let textoInvestimentoCompra = 'Quanto está pensando em investir no seu novo imóvel *' + `${nomeContato}` + '* 💵 ? *Selecione abaixo* por gentileza 👇';
            let textoInvestimentoLocacao = 'Quanto está pensando no valor do aluguel *' + `${nomeContato}` + '* 💵 ? *Selecione abaixo* por gentileza 👇';
            const envia_msg_com_botoes = await envia_mensagem_com_botoes(
               "3",
               (objetivoAtual === "Comprar um imóvel." ? investimentoCompra01 : investimentoLocacao01),
               (objetivoAtual === "Comprar um imóvel." ? investimentoCompra02 : investimentoLocacao02),
               (objetivoAtual === "Comprar um imóvel." ? investimentoCompra03 : investimentoLocacao03),
               (objetivoAtual === "Comprar um imóvel." ? textoInvestimentoCompra : textoInvestimentoLocacao),
               'Clique abaixo para confirmar!',
               jid
            );

         }

         // CHAMA A FUNÇÃO CONFIRMA INVESTIMENTO
         if (respostaChat === investimentoCompra01 || respostaChat === investimentoCompra02 || respostaChat === investimentoCompra03 || respostaChat === investimentoLocacao01 || respostaChat === investimentoLocacao02 || respostaChat === investimentoLocacao03 ) {
            const sendResponse = sendMessageWTyping(jid, { text: "Pronto. Consegui registrar as informações!" })
            confirmaFinalizarAtendimento(respostaChat);
         }

         async function confirmaFinalizarAtendimento(respostaChat) {

            if (
               respostaChat === investimentoCompra01 ||
               respostaChat === investimentoCompra02 ||
               respostaChat === investimentoCompra03 ||
               respostaChat === investimentoLocacao01 ||
               respostaChat === investimentoLocacao02 ||
               respostaChat === investimentoLocacao03) {
               let dataAdd = {
                  Codigo: codigoImovel,
                  Investimento: respostaChat,
                  Etapa: "Finalizar Atendimento",
               }
               db.fncEditDados('Contatos', 'Whatsapp', `${numero_whatsapp_com_ddd_e_9_na_frente}`, dataAdd);
            }

            // ENVIA O INVESTIMENTO DO LEAD PARA QUEM IRÁ DAR CONTINUIDADE AO ATENDIMENTO
            if (enviarInformarcoesLead === "sim") {
               if (messageType === "templateButtonReplyMessage") {
                  const sendResponse = await sock.sendMessage(telefoneRecebeInformacoes, { text: `${msg.message.templateButtonReplyMessage.selectedDisplayText}` })
               }            
            }

            // Send basic text
            const sendResponse = sendMessageWTyping(jid, { text: "Pronto. Consegui registrar as informações!" })
            const sendResponse2 = sendMessageWTyping(jid, { text: "*" + `${nomeContato}` + "*, um de nossos especialistas verá as melhores alternativas pra você e continuará o atendimento. *Deixa comigo :)*" })
            const sendResponse3 = sendMessageWTyping(jid, { text: `Tempo de espera (horário comercial): *` + tempoEsperaAtendimento + `*` })

         }

      } // FIM if(!msg.key.fromMe && m.type === 'notify') {
   }) // FIM message.upsert //FIM UPSERT
}
}

// init
connectOnWhatsapp()