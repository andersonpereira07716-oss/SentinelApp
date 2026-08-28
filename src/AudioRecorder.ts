import { Audio } from 'expo-av';

let recordingInstance: Audio.Recording | null = null;

/**
 * Inicia gravação de áudio discreta e contínua em background
 */
export async function startStealthAudioRecording(): Promise<void> {
  try {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      console.warn('[AUDIO] Permissão de gravação de áudio negada.');
      return;
    }

    // Configura o áudio para continuar gravando mesmo com tela bloqueada ou app em background
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
    });

    if (recordingInstance) {
      console.warn("[AUDIO] Gravação já em andamento, ignorando novo gatilho.");
      return;
    }
    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await recording.startAsync();
    recordingInstance = recording;

    console.log('🎙️ [AUDIO] Gravação stealth de emergência iniciada em segundo plano.');
  } catch (error) {
    console.error('[AUDIO] Erro ao iniciar gravação de emergência:', error);
  }
}

/**
 * Interrompe a gravação e retorna a URI local do arquivo para upload na nuvem
 */
export async function stopAndUploadAudio(): Promise<string | null> {
  if (!recordingInstance) return null;

  try {
    await recordingInstance.stopAndUnloadAsync();
    const uri = recordingInstance.getURI();
    recordingInstance = null;
    console.log('🎙️ [AUDIO] Gravação finalizada. Arquivo salvo localmente em:', uri);
    return uri;
  } catch (error) {
    console.error('[AUDIO] Erro ao finalizar áudio:', error);
    return null;
  }
}
