const makeWaSocket = require('@adiwajshing/baileys').default
const { useSingleFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@adiwajshing/baileys')
const { checkPath } = require('../utils/check.js')
const P = require('pino')
const { unlink } = require('fs')
//const { chatBot } = require('./examples/examples.js')
//const { chatBot } = require('./andrepinheiroimoveis_app.js')
const { chatBot } = require('./app.js')
const { chatStorage } = require('../store/storeChat.js')

/* folders where the authentication files will be saved */
const pathMD = './imobiliaria/sessionsMD/'

/* authentication file name */
const fileAuth = 'auth_info.json'

// IMPORTANDO O BAILEYS E O DIALOGFLOW
const { delay } = require('@adiwajshing/baileys')
//const { readFileSync } = require('fs')
//const dialogflow = require("@google-cloud/dialogflow");

const dados = require('./helpers/dados');
const db = require('./helpers/andrepinheiroimoveis_sheets');
const Path = './sessionsMD/';
const Auth = 'auth_info.json';

const fs = require('fs');
const moment = require('moment');
const axios = require('axios');
const sheet = require('google-spreadsheet');
const { text } = require('express');
var cron = require('node-cron');

// ------------------------------------------------------------------



// ------------------------------------------------------------------
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
// ------------------------------------------------------------------
//PEGA DATA E HORA
const now = moment().format('DD/MM/YYYY  *H:m:ss*');
// ------------------------------------------------------------------

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

      if (connection === 'open') 

      if (connection === 'close') {
        console.log('nao conectado')
     }

      // EXECUTA A FUNÇÃO BUSCAR buscarLeadsFacebook() A CADA MINUTO PARA ATUALIZAR A PLANILHA GOOGLE SHEETS
    /*cron.schedule('* * * * *', () => {
       buscaLeadsFacebook();
       console.log('running a task every minute');
    });*/
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

   // start the bot
   chatBot(sock)

   // chat history
   //chatStorage(sock)
}


/**
 * @param {import("../library/library").IWASock} sock 
 */
 exports.chatBot = (sock) => {

    /** 
     * @param {string} jid 
     * @param {import("@adiwajshing/baileys").AnyMessageContent} msg 
     * @returns {import("@adiwajshing/baileys").proto.WebMessageInfo}
     * 
     */
 
    /*sock.on('connection.update', ({ connection, lastDisconnect, qr }) => {
       
       if (sock.connection === 'close') {
          console.log('nao contectadoD')
       } 
    })*/
 
 
 
   // ------------------------------------------------------------------
    async function sendMessageWTyping(jid, msg) {
       await sock.presenceSubscribe(jid);
       await delay(500);
 
       await sock.sendPresenceUpdate('composing', jid);
       await delay(1000);
 
       await sock.sendPresenceUpdate('paused', jid);
 
       return await sock.sendMessage(jid, msg);
    }
    // ------------------------------------------------------------------
 
    // PEGA O PRIMEIRO NOME DO CONTATO
    async function pegar_first_name(nome_completo) {
 
       var separa_nome_completo = nome_completo.split(" ");
       var first_name = separa_nome_completo[0];
       return first_name;
    }
    // ------------------------------------------------------------------
 
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
    // ------------------------------------------------------------------
    async function whatsapp_com_ddi_ddd_sem_9_na_frente(jid) {
       let number = jid.replace(/\D/g, '');
       let ddIddD = number.substr(2, 2);
       let numero_sem_9 = number.substr(-8, 8);
 
       // PEGA O NÚMERO DO WHATSAPP COM DDD
       let numberWhats = "55" + ddIddD + numero_sem_9;
       return numberWhats;
       //return console.log(numberWhats + " viu");
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
 
       sendMessageWTyping(jid, { text: 'Text example.' })
                .then(result => console.log('RESULT: ', result))
                .catch(err => console.log('ERROR: ', err))
       
 
                 sock.sendMessage(
                 jid, 
                 { audio: { url: "./assets/minero_no_espaco.mp4" },ptt: true,}
                     //{ url: "Media/audio.mp3" }, // can send mp3, mp4, & ogg
             )
      
 
      
 
    } // FIM mensagem_Lead_Ads_boasVindas(nome_lead, whatsapp_lead) 
    // ------------------------------------------------------------------
 
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
    // ------------------------------------------------------------------
    // EXECUTA A FUNÇÃO BUSCAR buscarLeadsFacebook() A CADA MINUTO PARA ATUALIZAR A PLANILHA GOOGLE SHEETS
    /*cron.schedule('* * * * *', () => {
       buscaLeadsFacebook();
       console.log('running a task every minute');
    });*/
 
    
    // ------------------------------------------------------------------
   
 }

// init
connectOnWhatsapp()