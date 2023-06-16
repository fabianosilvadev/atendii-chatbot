/*const exec = require('child_process').exec

exec('pm2 stop index.js', (err, stdout, stderr) => console.log(stdout))*/

const fs = require('fs');
const dir = 'imobiliaria';
fs.readdir(dir , (err, arquivos) => {
  arquivos.forEach(arquivo => {
    console.log(arquivo );
  });
});