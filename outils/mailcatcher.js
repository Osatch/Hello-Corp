/**
 * Boîte mail locale pour tester le formulaire de contact.
 *
 * Lancement :   node outils/mailcatcher.js
 *
 * Ce petit serveur SMTP tourne sur 127.0.0.1:2525 et n'envoie rien sur Internet :
 * il affiche dans le terminal les emails que contact.php lui transmet, et les
 * enregistre dans outils/mails-recus/. Cela permet de vérifier que le formulaire
 * fonctionne de bout en bout sans avoir besoin d'identifiants d'un vrai
 * fournisseur d'email.
 *
 * À utiliser avec contact-config.local.php :
 *   define('SMTP_HOST', '127.0.0.1');
 *   define('SMTP_PORT', 2525);
 *   define('SMTP_SECURE', 'none');
 */

const net = require('net');
const fs = require('fs');
const path = require('path');

const PORT = 2525;
const HOST = '127.0.0.1';
const OUT_DIR = path.join(__dirname, 'mails-recus');

fs.mkdirSync(OUT_DIR, { recursive: true });

/** Décode les en-têtes encodés en base64 (=?UTF-8?B?...?=) pour l'affichage. */
function decodeHeaders(text) {
  return text.replace(/=\?UTF-8\?B\?([^?]+)\?=/gi, (_, b64) =>
    Buffer.from(b64, 'base64').toString('utf8')
  );
}

let count = 0;

const server = net.createServer(socket => {
  socket.setEncoding('utf8');

  let buffer = '';
  let inData = false;
  let mail = '';

  socket.write('220 mailcatcher.local ESMTP\r\n');

  socket.on('error', () => {}); // déconnexion brutale du client : sans importance

  socket.on('data', chunk => {
    if (inData) {
      mail += chunk;
      if (mail.endsWith('\r\n.\r\n')) {
        inData = false;
        count += 1;

        const content = decodeHeaders(mail.slice(0, -5));
        const file = path.join(OUT_DIR, `mail-${String(count).padStart(3, '0')}.txt`);
        fs.writeFileSync(file, content, 'utf8');

        console.log(`\n┌─ EMAIL #${count} reçu ────────────────────────────────`);
        console.log(content.split('\n').map(l => '│ ' + l).join('\n'));
        console.log(`└─ enregistré dans ${path.relative(process.cwd(), file)}\n`);

        mail = '';
        socket.write('250 2.0.0 Ok: message accepte\r\n');
      }
      return;
    }

    buffer += chunk;
    let index;
    while ((index = buffer.indexOf('\r\n')) !== -1) {
      const line = buffer.slice(0, index);
      buffer = buffer.slice(index + 2);
      const command = line.toUpperCase();

      if (command.startsWith('EHLO') || command.startsWith('HELO')) {
        socket.write('250-mailcatcher.local\r\n250 AUTH LOGIN PLAIN\r\n');
      } else if (command.startsWith('AUTH')) {
        socket.write('235 2.7.0 Authentification acceptee\r\n');
      } else if (command.startsWith('MAIL FROM') || command.startsWith('RCPT TO')) {
        socket.write('250 2.1.0 Ok\r\n');
      } else if (command === 'DATA') {
        inData = true;
        socket.write('354 Envoyez le message, terminez par <CRLF>.<CRLF>\r\n');
      } else if (command === 'QUIT') {
        socket.write('221 2.0.0 Au revoir\r\n');
        socket.end();
      } else if (command === 'RSET' || command === 'NOOP') {
        socket.write('250 2.0.0 Ok\r\n');
      } else {
        socket.write('250 2.0.0 Ok\r\n');
      }
    }
  });
});

server.listen(PORT, HOST, () => {
  console.log('Boîte mail locale démarrée sur ' + HOST + ':' + PORT);
  console.log('Les emails envoyés par le formulaire s’afficheront ici.');
  console.log('(Ctrl+C pour arrêter)');
});
