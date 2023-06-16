"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
   return (mod && mod.__esModule) ? mod : { "default": mod };
};
// ------------------------------------------------------------------
// CONSTANTES ESSENCIAIS
// NOME PROJETO 
const nomeProjetoDialogFlow = "andrepinheiroimoveis-igrx";
// NOME CHAVE JSON
const nomeChaveJason = "imobiliaria_key.json";
// NOME SESSION VENOM
const nomeSessionVenom = "andrepinheiro-session";4
// NOME DA ATENDENTE VIRTUAL

const nome_pasta_projeto = "";
const arquivo_de_audio_atendimento = "";


// ------------------------------------------------------------------

// IMPORTANDO O BAILEYS E O DIALOGFLOW
const { delay } = require('@adiwajshing/baileys')
//const { readFileSync } = require('fs')
//const dialogflow = require("@google-cloud/dialogflow");

const dados = require('./helpers/dados');
const db = require('./helpers/imobiliaria_sheets');
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
  // ------------------------------------------------------------------
   const sendMessageWTyping = async (jid, msg) => {
      await sock.presenceSubscribe(jid)
      await delay(500)

      await sock.sendPresenceUpdate('composing', jid)
      await delay(1000)

      await sock.sendPresenceUpdate('paused', jid)

      return await sock.sendMessage(jid, msg)
   }


   const sendMessageAudio = async(jid, msg) => {

      await sock.presenceSubscribe(jid)
      await delay(500)

      await sock.sendPresenceUpdate('composing', jid)
      await delay(6000)

      await sock.sendPresenceUpdate('paused', jid)

      return await sock.sendMessage(jid,msg) 
             //{ url: "Media/audio.mp3" }, // can send mp3, mp4, & ogg
   }
   // ------------------------------------------------------------------

   // PEGA O PRIMEIRO NOME DO CONTATO
   async function pegar_first_name(nome_completo) {
     
      let separa_nome_completo = nome_completo.split(" ");
      let first_name = separa_nome_completo[0];
      console.log(separa_nome_completo[0])
      return first_name;
   }
   // ------------------------------------------------------------------


   //TRATAMENTO NÚMERO WHATSAPP COM DDD
   async function whatsapp_com_ddd(jid) {
      let number = jid.replace(/\D/g, '');
      let numberDDI = number.substr(0, 2);
      let numberDDD = number.substr(2, 2);
      let number_sem_9 = number.substr(-8, 8);
      let numberWhats;

      // PEGA O NÚMERO DO WHATSAPP COM DDD
      if(numberDDD <= 30){
          numberWhats = numberDDI + numberDDD + " 9" + number_sem_9;
      }else{
          numberWhats = numberDDI + numberDDD + number_sem_9;
      }
      return numberWhats;
      //return console.log(numberWhats + " viu");
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


      let number = whatsapp_lead.replace(/\D/g, '');
      let numberDDI = number.substr(0, 2);
      let numberDDD = number.substr(2, 2);
      let number_sem_9 = number.substr(-8, 8);
      let jid;

      // PEGA O NÚMERO DO WHATSAPP COM DDD
      if(numberDDD <= 30){
          jid = numberDDI + numberDDD + "9" + number_sem_9;
      }else{
          jid = numberDDI + numberDDD + number_sem_9;
      }
      
      jid = jid + "@s.whatsapp.net";
      
      console.log(jid);

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

      const primeiro_nome_lead = await pegar_first_name(nome_lead);

      sendMessageWTyping(jid, { text: `Olá ${primeiro_nome_lead}, tudo bem?` })
               .then(result => console.log('RESULT: ', result))
               .catch(err => console.log('ERROR: ', err))


        /*sock.sendMessage(
                jid, 
                { audio: { url: "./imobiliaria/audio/teste-audio-fabiano.mp3" },ptt: true,}
                    //{ url: "Media/audio.mp3" }, // can send mp3, mp4, & ogg
            )*/
            sendMessageAudio(jid,{ audio: { url: "./imobiliaria/audio/audio_atendimento_leardi_analia_franco.ogg" },ptt: true,})
     

     

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

   async function connectToWhatsApp () {
   
      sock.ev.on('connection.update', (update) => {
          const { connection, lastDisconnect } = update
          if(connection === 'close') {
              console.log('connection closed due to ')
             
          } else if(connection === 'open') {
            cron.schedule('* * * * *', () => {
               buscaLeadsFacebook();
               console.log('running a task every minute');
            });
          }
      })
      
   }
   connectToWhatsApp()


   /*sock.ev.on('messages.upsert', ({ messages, type }) => {
      const msg = messages[0]
      const jid = msg.key.remoteJid

      //if (!isGroup(jid) && !msg.key.fromMe && jid !== 'status@broadcast') {
      if (msg.key.fromMe === false && jid !== 'status@broadcast') {
         console.log("MESSAGE: ", msg)

         sock.sendReadReceipt(jid, msg.key.participant, [msg.key.id])

         // plain text sending
         if (msg.message.conversation.toLowerCase() === 'text') {
            sendMessageWTyping(jid, { text: 'Text example.' })
               .then(result => console.log('RESULT: ', result))
               .catch(err => console.log('ERROR: ', err))
         }

      }
   })*/

   // ------------------------------------------------------------------
  


}