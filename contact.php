<?php
/**
 * Traitement du formulaire de contact Hello Corp.
 *
 * ── À CONFIGURER ─────────────────────────────────────────────────────────────
 * RECIPIENT_EMAILS : adresse(s) qui reçoivent les demandes (séparées par une virgule).
 * FROM_EMAIL       : expéditeur technique. DOIT être une adresse du domaine du site
 *                    (sinon les mails partent en spam ou sont refusés par l'hébergeur).
 * ─────────────────────────────────────────────────────────────────────────────
 */

// Réglages locaux : si le fichier contact-config.local.php existe (non versionné,
// non déployé), ses valeurs sont prioritaires sur celles définies ci-dessous.
// Cela permet de tester en local sans jamais toucher à la config de production.
if (is_file(__DIR__ . '/contact-config.local.php')) {
    require __DIR__ . '/contact-config.local.php';
}

if (!defined('RECIPIENT_EMAILS')) define('RECIPIENT_EMAILS', 'contact@hellocorp.fr');
if (!defined('FROM_EMAIL'))       define('FROM_EMAIL', 'contact@hellocorp.fr');
if (!defined('FROM_NAME'))        define('FROM_NAME', 'Site Hello Corp');

/**
 * ── ENVOI SMTP ───────────────────────────────────────────────────────────────
 * OBLIGATOIRE pour tester en local : la fonction mail() de PHP n'envoie RIEN
 * depuis un PC Windows (aucun serveur d'envoi installé). Avec un SMTP renseigné
 * ici, l'envoi fonctionne aussi bien en local qu'en production.
 *
 * Exemple Gmail (nécessite un « mot de passe d'application », voir DEPLOIEMENT.md) :
 *   SMTP_HOST = 'smtp.gmail.com'   SMTP_PORT = 587   SMTP_SECURE = 'tls'
 *   SMTP_USER = 'votre.adresse@gmail.com'
 *   SMTP_PASS = 'xxxx xxxx xxxx xxxx'  (mot de passe d'application, PAS le mot de passe Gmail)
 *
 * Laisser SMTP_HOST vide = repli sur mail() (fonctionne sur un hébergement PHP,
 * jamais en local sous Windows).
 */
if (!defined('SMTP_HOST'))   define('SMTP_HOST', '');
if (!defined('SMTP_PORT'))   define('SMTP_PORT', 587);
if (!defined('SMTP_SECURE')) define('SMTP_SECURE', 'tls');   // 'tls' (587), 'ssl' (465) ou 'none'
if (!defined('SMTP_USER'))   define('SMTP_USER', '');
if (!defined('SMTP_PASS'))   define('SMTP_PASS', '');

// Sauvegarde locale des demandes : aucune demande n'est perdue même si l'envoi
// d'email échoue. Le fichier est bloqué en accès web par le .htaccess.
if (!defined('LOG_FILE')) define('LOG_FILE', __DIR__ . '/contact-messages.log');

// ─────────────────────────────────────────────────────────────────────────────

function server_value($name)
{
    return isset($_SERVER[$name]) ? $_SERVER[$name] : '';
}

function wants_json()
{
    $requestedWith = server_value('HTTP_X_REQUESTED_WITH');
    $accept = server_value('HTTP_ACCEPT');

    return $requestedWith === 'XMLHttpRequest' || strpos($accept, 'application/json') !== false;
}

function set_status_code($status)
{
    if (function_exists('http_response_code')) {
        http_response_code($status);
        return;
    }

    $labels = array(
        200 => 'OK',
        405 => 'Method Not Allowed',
        422 => 'Unprocessable Entity',
        429 => 'Too Many Requests',
        500 => 'Internal Server Error',
    );
    $label = isset($labels[$status]) ? $labels[$status] : 'Error';

    header('HTTP/1.1 ' . $status . ' ' . $label);
}

function respond($success, $message, $status)
{
    set_status_code($status);

    if (wants_json()) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(array(
            'success' => $success,
            'message' => $message,
        ));
        exit;
    }

    // Repli sans JavaScript : page HTML simple.
    header('Content-Type: text/html; charset=utf-8');
    $title = $success ? 'Demande envoyée' : 'Erreur d’envoi';
    $safeTitle = htmlspecialchars($title, ENT_QUOTES, 'UTF-8');
    $safeMessage = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');

    echo '<!DOCTYPE html>';
    echo '<html lang="fr">';
    echo '<head>';
    echo '<meta charset="UTF-8">';
    echo '<meta name="viewport" content="width=device-width, initial-scale=1.0">';
    echo '<title>' . $safeTitle . ' - Hello Corp</title>';
    echo '<link rel="stylesheet" href="style.css">';
    echo '</head>';
    echo '<body>';
    echo '<main class="container" style="padding:72px 24px;">';
    echo '<h1>' . $safeTitle . '</h1>';
    echo '<p>' . $safeMessage . '</p>';
    echo '<p><a class="btn btn-primary" href="index.html#contact">Retour au formulaire</a></p>';
    echo '</main>';
    echo '</body>';
    echo '</html>';
    exit;
}

function field($name)
{
    return isset($_POST[$name]) ? trim((string) $_POST[$name]) : '';
}

/** Encode un sujet d'email contenant des accents (RFC 2047). */
function encode_subject($subject)
{
    return '=?UTF-8?B?' . base64_encode($subject) . '?=';
}

/** Vrai si le site tourne en local (php -S, WAMP…) : on affiche alors les erreurs techniques. */
function is_local()
{
    $host = strtolower(server_value('HTTP_HOST'));
    return strpos($host, 'localhost') === 0
        || strpos($host, '127.0.0.1') === 0
        || strpos($host, '::1') === 0;
}

/** Lit la réponse du serveur SMTP et vérifie le code attendu. */
function smtp_expect($socket, $expectedCode, &$error)
{
    $response = '';
    while (($line = fgets($socket, 4096)) !== false) {
        $response .= $line;
        // Dernière ligne d'une réponse multi-lignes : "250 xxx" (espace, pas tiret).
        if (strlen($line) < 4 || $line[3] === ' ') {
            break;
        }
    }

    $code = (int) substr($response, 0, 3);
    if ($code !== $expectedCode) {
        $error = 'SMTP : réponse ' . trim($response) . ' (code ' . $expectedCode . ' attendu)';
        return false;
    }

    return true;
}

/** Envoie une commande SMTP et vérifie la réponse. */
function smtp_command($socket, $command, $expectedCode, &$error)
{
    fwrite($socket, $command . "\r\n");
    return smtp_expect($socket, $expectedCode, $error);
}

/**
 * Envoi via un serveur SMTP externe (sockets natifs, aucune librairie requise).
 * Retourne true, ou false avec le détail dans $error.
 */
function send_via_smtp($recipients, $subject, $body, $headers, &$error)
{
    if (!function_exists('stream_socket_client')) {
        $error = 'La fonction stream_socket_client est désactivée sur ce serveur.';
        return false;
    }

    $transport = SMTP_SECURE === 'ssl' ? 'ssl://' : 'tcp://';
    $context = stream_context_create(array(
        'ssl' => array('verify_peer' => true, 'verify_peer_name' => true),
    ));

    $socket = @stream_socket_client(
        $transport . SMTP_HOST . ':' . SMTP_PORT,
        $errno,
        $errstr,
        15,
        STREAM_CLIENT_CONNECT,
        $context
    );

    if (!$socket) {
        $error = 'Connexion impossible à ' . SMTP_HOST . ':' . SMTP_PORT . ' — ' . $errstr . ' (' . $errno . ')';
        return false;
    }

    stream_set_timeout($socket, 15);

    $hostname = server_value('SERVER_NAME');
    if ($hostname === '') {
        $hostname = 'localhost';
    }

    $ok = smtp_expect($socket, 220, $error)
        && smtp_command($socket, 'EHLO ' . $hostname, 250, $error);

    // STARTTLS : on chiffre la connexion avant d'envoyer les identifiants.
    if ($ok && SMTP_SECURE === 'tls') {
        $ok = smtp_command($socket, 'STARTTLS', 220, $error);
        if ($ok) {
            $crypto = @stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
            if (!$crypto) {
                $error = 'Le chiffrement TLS a échoué (extension openssl absente ou certificat refusé).';
                $ok = false;
            }
        }
        if ($ok) {
            $ok = smtp_command($socket, 'EHLO ' . $hostname, 250, $error);
        }
    }

    // Authentification (AUTH LOGIN, le mode accepté partout).
    if ($ok && SMTP_USER !== '') {
        $ok = smtp_command($socket, 'AUTH LOGIN', 334, $error)
            && smtp_command($socket, base64_encode(SMTP_USER), 334, $error)
            && smtp_command($socket, base64_encode(SMTP_PASS), 235, $error);

        if (!$ok && strpos($error, '535') !== false) {
            $error .= ' — identifiants refusés. Avec Gmail, utiliser un « mot de passe d’application » et non le mot de passe du compte.';
        }
    }

    if ($ok) {
        $ok = smtp_command($socket, 'MAIL FROM:<' . FROM_EMAIL . '>', 250, $error);
    }

    if ($ok) {
        foreach ($recipients as $recipient) {
            if (!smtp_command($socket, 'RCPT TO:<' . $recipient . '>', 250, $error)) {
                $ok = false;
                break;
            }
        }
    }

    if ($ok) {
        $ok = smtp_command($socket, 'DATA', 354, $error);
    }

    if ($ok) {
        // Un point seul en début de ligne termine le message : on l'échappe.
        $data = 'Subject: ' . $subject . "\r\n"
            . 'To: ' . implode(', ', $recipients) . "\r\n"
            . $headers . "\r\n\r\n"
            . preg_replace('/^\./m', '..', $body);

        $ok = smtp_command($socket, $data . "\r\n.", 250, $error);
    }

    @fwrite($socket, "QUIT\r\n");
    @fclose($socket);

    return $ok;
}

/** Écrit la demande dans le fichier local, pour ne jamais perdre un lead. */
function log_submission($lines, $delivered, $error = '')
{
    $entry = '===== ' . date('Y-m-d H:i:s') . ' | email ' . ($delivered ? 'ENVOYE' : 'NON ENVOYE')
        . ' | IP ' . server_value('REMOTE_ADDR') . " =====\n"
        . implode("\n", $lines) . "\n";

    if (!$delivered && $error !== '') {
        $entry .= 'Erreur technique : ' . $error . "\n";
    }

    $entry .= "\n";

    @file_put_contents(LOG_FILE, $entry, FILE_APPEND | LOCK_EX);
}

// ── 1. Méthode ───────────────────────────────────────────────────────────────

if (server_value('REQUEST_METHOD') !== 'POST') {
    respond(false, 'Méthode non autorisée.', 405);
}

// ── 2. Anti-spam : champ piège (invisible pour un humain) ────────────────────

if (field('website') !== '') {
    // On répond « succès » au robot sans rien envoyer.
    respond(true, 'Votre demande a bien été envoyée.', 200);
}

// ── 3. Récupération et validation ────────────────────────────────────────────

$firstName = field('prenom');
$lastName  = field('nom');
$company   = field('entreprise');
$email     = field('email');
$phone     = field('telephone');
$service   = field('service');
$message   = field('message');
$consent   = isset($_POST['consentement']);

if (!$firstName || !$lastName || !$company || !$email || !$phone || !$service || !$message || !$consent) {
    respond(false, 'Merci de compléter tous les champs obligatoires.', 422);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, 'Merci de renseigner une adresse email valide.', 422);
}

// Injection d'en-têtes : aucun retour à la ligne dans les champs courts.
foreach (array($firstName, $lastName, $company, $email, $phone, $service) as $value) {
    if (preg_match('/[\r\n]/', $value)) {
        respond(false, 'Les données du formulaire sont invalides.', 422);
    }
}

$messageLength = function_exists('mb_strlen') ? mb_strlen($message, 'UTF-8') : strlen($message);
if ($messageLength > 5000) {
    respond(false, 'Votre message est trop long (5000 caractères maximum).', 422);
}

// ── 4. Composition de l'email ────────────────────────────────────────────────

$lines = array(
    'Nouvelle demande reçue depuis le site Hello Corp',
    '',
    'Prénom : ' . $firstName,
    'Nom : ' . $lastName,
    'Entreprise : ' . $company,
    'Email : ' . $email,
    'Téléphone : ' . $phone,
    'Service souhaité : ' . $service,
    '',
    'Message :',
    $message,
    '',
    'Consentement RGPD : oui',
    'Page d’origine : ' . server_value('HTTP_REFERER'),
);

$subject = encode_subject('Nouvelle demande de contact - ' . $company);
$body    = implode("\r\n", $lines);

$headers = array(
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'From: ' . encode_subject(FROM_NAME) . ' <' . FROM_EMAIL . '>',
    'Reply-To: ' . encode_subject($firstName . ' ' . $lastName) . ' <' . $email . '>',
    'X-Mailer: PHP/' . phpversion(),
);

// ── 5. Envoi ─────────────────────────────────────────────────────────────────

$sent = false;
$sendError = '';

if (SMTP_HOST !== '') {
    // Mode SMTP : fonctionne partout, y compris en local sous Windows.
    $recipients = array_filter(array_map('trim', explode(',', RECIPIENT_EMAILS)));
    $sent = send_via_smtp($recipients, $subject, $body, implode("\r\n", $headers), $sendError);
} elseif (function_exists('mail')) {
    // Mode mail() : dépend du serveur d'envoi de l'hébergeur.
    // Le 5e paramètre (-f) fixe l'expéditeur d'enveloppe : indispensable chez
    // beaucoup d'hébergeurs mutualisés pour que le mail ne soit pas rejeté.
    $sent = @mail(
        RECIPIENT_EMAILS,
        $subject,
        $body,
        implode("\r\n", $headers),
        '-f' . FROM_EMAIL
    );
    if (!$sent) {
        $sendError = "La fonction mail() a échoué. C'est normal en local sous Windows : "
            . 'aucun serveur d’envoi n’est installé. Renseignez les constantes SMTP_* '
            . 'en haut de contact.php pour envoyer réellement des emails.';
    }
} else {
    $sendError = 'La fonction mail() est désactivée et aucun SMTP n’est configuré.';
}

log_submission($lines, $sent, $sendError);

if (!$sent) {
    // En local, on affiche l'erreur technique pour pouvoir la corriger.
    // En production, le visiteur ne voit qu'un message clair.
    $publicMessage = "L'envoi automatique a échoué. Merci de nous écrire directement à contact@hellocorp.fr ou de nous appeler au 01 87 66 66 57.";

    if (is_local() && $sendError !== '') {
        $publicMessage = '[LOCAL] ' . $sendError;
    }

    respond(false, $publicMessage, 500);
}

respond(true, 'Votre demande a bien été envoyée. Nous vous répondrons rapidement.', 200);
