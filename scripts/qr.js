import QRCode from 'qrcode';

async function main() {
  const codespaceName = process.env.CODESPACE_NAME;
  const domain = process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN || 'app.github.dev';
  
  let targetUrl = process.argv[2];

  if (!targetUrl) {
    if (codespaceName) {
      targetUrl = `https://${codespaceName}-3000.${domain}`;
    } else {
      targetUrl = `http://localhost:3000`;
    }
  }

  console.log('\n==================================================');
  console.log('📱 ESCANEIE O QR CODE COM A CÂMERA DO SEU CELULAR:');
  console.log(`🔗 URL: ${targetUrl}`);
  console.log('==================================================\n');

  try {
    const stringQr = await QRCode.toString(targetUrl, { type: 'terminal', small: true });
    console.log(stringQr);
    console.log('\n👉 DICA: No Codespaces, na aba "PORTS", certifique-se de que a porta 3000 está como PUBLIC!\n');
  } catch (err) {
    console.error('Erro ao gerar QR Code:', err);
  }
}

main();
