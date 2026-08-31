export const enviarAudioTelegram = async (audioUri) => {
  const TELEGRAM_BOT_TOKEN = 'SEU_TOKEN_AQUI';
  const TELEGRAM_CHAT_ID = 'SEU_CHAT_ID_AQUI';

  const formData = new FormData();
  formData.append('chat_id', TELEGRAM_CHAT_ID);
  formData.append('audio', {
    uri: audioUri,
    type: 'audio/m4a',
    name: 'gravacao_emergencia.m4a',
  });

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendAudio`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    const result = await response.json();
    console.log('✅ Áudio gravado enviado para o Telegram:', result);
  } catch (error) {
    console.error('❌ Erro ao enviar áudio para o Telegram:', error);
  }
};

