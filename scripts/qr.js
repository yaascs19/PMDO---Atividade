import os from 'os';

const codespaceName = process.env.CODESPACE_NAME;
const domain = process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN || 'app.github.dev';
const port = process.env.PORT || 3000;

let targetUrl = process.argv[2];

if (!targetUrl) {
  if (codespaceName) {
    targetUrl = `https://${codespaceName}-${port}.${domain}`;
  } else {
    // Detecta IP local automaticamente
    const nets = os.networkInterfaces();
    let localIp = 'localhost';
    for (const iface of Object.values(nets)) {
      for (const net of iface || []) {
        if (net.family === 'IPv4' && !net.internal) {
          localIp = net.address;
          break;
        }
      }
      if (localIp !== 'localhost') break;
    }
    targetUrl = `http://${localIp}:${port}`;
  }
}

console.log('\n==================================================');
console.log('📱 ESCANEIE O QR CODE COM A CÂMERA DO SEU CELULAR:');
console.log(`🔗 URL: ${targetUrl}`);
console.log('==================================================\n');

try {
  const { default: QRCode } = await import('qrcode');
  const stringQr = await QRCode.toString(targetUrl, { type: 'terminal', small: true });
  console.log(stringQr);
  if (codespaceName) {
    console.log('👉 DICA: Na aba "PORTS" do Codespaces, certifique-se de que a porta está como PUBLIC!\n');
  } else {
    console.log('👉 DICA: Celular e computador precisam estar na mesma rede Wi-Fi!\n');
  }
} catch (err) {
  console.error('Erro ao gerar QR Code:', err.message);
  console.log(`\nAcesse manualmente: ${targetUrl}\n`);
}
