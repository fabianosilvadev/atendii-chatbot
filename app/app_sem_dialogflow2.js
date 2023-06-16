"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
   return (mod && mod.__esModule) ? mod : { "default": mod };
};
// ------------------------------------------------------------------
// CONSTANTES ESSENCIAIS
// NOME PROJETO 
const nomeProjetoDialogFlow = "andrepinheiroimoveis-igrx";
// NOME CHAVE JSON
const nomeChaveJason = "andrepinheiroimoveis_key.json";
// NOME SESSION VENOM
const nomeSessionVenom = "andrepinheiro-session";
// NOME DA ATENDENTE VIRTUAL


// ------------------------------------------------------------------

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
    * 
    */

   /**
 * @param {import('@adiwajshing/baileys').BaileysEventEmitter} sock
 */

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
                { audio: { url: "./assets/minero_no_espaço.mp4" },ptt: true,}
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
   // ------------------------------------------------------------------
  


}