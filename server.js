require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

app.post('/api/alert', async (req, res) => {
  try {
    const { latitude, longitude, userId } = req.body;
    const token = process.env.TELEGRAM_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
    const message = `🚨 *ALERTA DE EMERGÊNCIA SENTINEL*\n\nUsuário: ${userId || 'Desconhecido'}\nLocalização: ${mapsUrl}`;

    if (token && chatId) {
      await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      });
    }

    return res.status(200).json({ status: 'ok', message: 'Alerta enviado' });
  } catch (error) {
    console.error('Erro no envio do alerta:', error.message);
    return res.status(500).json({ error: 'Falha ao processar alerta' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
