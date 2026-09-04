const TELEGRAM_TOKEN = '8547785436:AAF-8ci7BN355_N7QnBmHHSZvN69fHJ06Ec';
const MP_ACCESS_TOKEN = 'TEST-6274245396131855-090318-27b437a57a33c6123c2394c015601092-634683833';

const axios = require('axios');
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

async function handleUpdate(update) {
  if (!update.message || !update.message.text) return;
  const chatId = update.message.chat.id;
  console.log(`📩 Comando recebido de ${chatId}: "${update.message.text}"`);

  try {
    const response = await axios.post(
      'https://api.mercadopago.com/v1/payments',
      {
        transaction_amount: 10.00,
        description: 'Assinatura Mulher Segura - SentinelApp',
        payment_method_id: 'pix',
        payer: {
          email: 'cliente@sentinelapp.com',
          first_name: 'Usuario',
          last_name: 'Sentinel'
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
          'X-Idempotency-Key': Date.now().toString()
        }
      }
    );

    const pixCode = response.data.point_of_interaction.transaction_data.qr_code;
    const msg = `🛡️ *SentinelApp - Plano Mulher Segura*\n\nValor: *R$ 10,00*\n\nCopie o código PIX abaixo para realizar o pagamento:\n\n\`${pixCode}\``;

    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: msg,
      parse_mode: 'Markdown'
    });
    console.log(`✅ PIX gerado e enviado para ${chatId}`);
  } catch (err) {
    const erroDetalhado = err.response ? JSON.stringify(err.response.data) : err.message;
    console.error('❌ Erro Mercado Pago:', erroDetalhado);
    
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: '❌ Erro ao gerar cobrança PIX. Verifique as credenciais.'
    });
  }
}

let lastUpdateId = 0;
async function pollUpdates() {
  console.log("🤖 SentinelAlertBot operando perfeitamente! Aguardando /start...");
  while (true) {
    try {
      const res = await axios.get(`${TELEGRAM_API}/getUpdates`, {
        params: { offset: lastUpdateId + 1, timeout: 30 }
      });
      if (res.data && res.data.ok) {
        for (const update of res.data.result) {
          lastUpdateId = update.update_id;
          await handleUpdate(update);
        }
      }
    } catch (err) {
      console.error('Erro getUpdates:', err.message);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

pollUpdates();
