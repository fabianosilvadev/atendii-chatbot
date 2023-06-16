"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
    
    exports.pegar_first_name =
    exports.whatsapp_com_ddd_e_9_na_frente =
    exports.envia_mensagem_com_card_contato =
    exports.envia_mensagem_com_imagem = 
    exports.envia_mensagem_com_botoes = void 0;

// IMPORTANDO O BAILEYS E O DIALOGFLOW
const { delay } = require('@adiwajshing/baileys')

// PEGA O PRIMEIRO NOME DO CONTATO
async function pegar_first_name(nome_completo) {

    var separa_nome_completo = nome_completo.split(" ");
    var first_name = separa_nome_completo[0];
    return first_name;
}
exports.pegar_first_name = pegar_first_name;

//TRATAMENTO NÚMERO WHATSAPP COM DDD E 9 NA FRENTE
async function whatsapp_com_ddd_e_9_na_frente(jid) {
    const number = jid.replace(/\D/g, '');
    const ddIddD = number.substr(2, 2);
    const numero_sem_9 = number.substr(-8, 8);

    // PEGA O NÚMERO DO WHATSAPP COM DDD
    const numberWhats = ddIddD + " 9" + numero_sem_9;
    return numberWhats;
}
exports.whatsapp_com_ddd_e_9_na_frente = whatsapp_com_ddd_e_9_na_frente;

exports.chatBot = (sock) => {

// ENVIA MENSAGEM COM CARD DE CONTATO
async function envia_mensagem_com_card_contato(nome_contato, jid, numero_whatsapp_tratado, telefoneRecebeInformacoes) {

    const contact = {
        fullName: nome_contato,
        waid: jid,
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
exports.envia_mensagem_com_card_contato = envia_mensagem_com_card_contato;

async function envia_mensagem_com_imagem(url_imagem, jid) {

    const sendImage = {
        // optional
        //caption: '```IMAGE TITLE```',
        image: {
            url: url_imagem,
            // url: 'https://domain/image.jpeg'
        }
    }

    const sendImg = await sock.sendMessage(jid, sendImage)
}
exports.envia_mensagem_com_imagem = envia_mensagem_com_imagem;



async function envia_mensagem_com_botoes(
    qtde_botoes,
    display_texto_btn_01,
    display_texto_btn_02,
    display_texto_btn_03,
    texto_principal,
    footer,
    enviar_para_whatsapp) {


    if (qtde_botoes = 1) {

        const buttonsMD = [
            {
                index: 1,
                quickReplyButton: { id: 'id1', displayText: display_texto_btn_01 }
            }
        ]


    } else if (qtde_botoes = 2) {
        const buttonsMD = [
            {
                index: 1,
                quickReplyButton: { id: 'id1', displayText: display_texto_btn_01 }
            },
            {
                index: 2,
                quickReplyButton: { id: 'id2', displayText: display_texto_btn_02 }
            }
        ]


    } else if (qtde_botoes = 3) {
        const buttonsMD = [
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

    const sendButtons = await sock.sendMessage(enviar_para_whatsapp, templateButtons)
}
exports.envia_mensagem_com_botoes = envia_mensagem_com_botoes;

}
