import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator, Modal } from 'react-native';
import * as Location from 'expo-location';
import { Accelerometer } from 'expo-sensors';
import { Audio } from 'expo-av';

const TELEGRAM_BOT_TOKEN = '8903706213:AAGOWD9ACzmf8pkB4Dx24JUIgPVzzarA6CY';
const TELEGRAM_CHAT_ID = '7370681538';
const SHAKE_THRESHOLD = 2.5;

export default function App() {
  const [loading, setLoading] = useState(false);
  const [locationPermission, setLocationPermission] = useState(false);
  const [audioPermission, setAudioPermission] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  
  // Estado do Plano Mulher Segura
  const [isPlanActive, setIsPlanActive] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    (async () => {
      let locStatus = await Location.requestForegroundPermissionsAsync();
      if (locStatus.status === 'granted') {
        setLocationPermission(true);
      }

      let audioStatus = await Audio.requestPermissionsAsync();
      if (audioStatus.status === 'granted') {
        setAudioPermission(true);
      }
    })();

    _subscribeAccelerometer();

    return () => {
      _unsubscribeAccelerometer();
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, []);

  const _subscribeAccelerometer = () => {
    Accelerometer.setUpdateInterval(100);
    const sub = Accelerometer.addListener(accelerometerData => {
      const { x, y, z } = accelerometerData;
      const gForce = Math.sqrt(x * x + y * y + z * z);

      if (gForce > SHAKE_THRESHOLD && !loading && !isRecording) {
        handleSOS("Alerta ativado por movimento (Chacoalho)");
      }
    });
    setSubscription(sub);
  };

  const _unsubscribeAccelerometer = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  const startSilentAudioRecording = async () => {
    try {
      if (!audioPermission) {
        const status = await Audio.requestPermissionsAsync();
        if (status.status !== 'granted') return null;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
      return recording;
    } catch (err) {
      console.error('Falha ao iniciar gravação:', err);
      return null;
    }
  };

  const sendTelegramAlert = async (latitude, longitude, mapsUrl, triggerType) => {
    const message = `🚨 *ALERTA DE EMERGÊNCIA - SENTINEL* 🚨\n\n` +
      `*Gatilho:* ${triggerType}\n` +
      `🎙️ *Gravação de Áudio:* Ativada em segundo plano\n` +
      `🛡️ *Plano:* Mulher Segura (Ativo)\n\n` +
      `📍 *Localização:* \nLatitude: \`${latitude}\`\nLongitude: \`${longitude}\`\n\n` +
      `🔗 *Google Maps:* ${mapsUrl}`;

    try {
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'Markdown',
        }),
      });

      const data = await response.json();
      return data.ok;
    } catch (error) {
      console.error("Erro no envio do Telegram:", error);
      return false;
    }
  };

  const handleSOS = async (triggerSource = "Botão SOS Pressionado") => {
    if (!isPlanActive) {
      Alert.alert("Plano Inativo", "Ative o Plano Mulher Segura para liberar a proteção contínua de emergência.");
      setModalVisible(true);
      return;
    }

    setLoading(true);
    try {
      if (!locationPermission) {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert("Permissão Negada", "O aplicativo precisa da localização para enviar o alerta.");
          setLoading(false);
          return;
        }
      }

      await startSilentAudioRecording();

      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = location.coords;
      const mapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;

      const sent = await sendTelegramAlert(latitude, longitude, mapsUrl, triggerSource);

      if (sent) {
        Alert.alert(
          "🚨 SOS DISPARADO!",
          `Localização enviada via Telegram e gravação de áudio de emergência iniciada.`,
          [{ text: "OK" }]
        );
      } else {
        Alert.alert(
          "🚨 SOS DISPARADO!",
          `Localização capturada:\nLat: ${latitude.toFixed(5)}, Long: ${longitude.toFixed(5)}\nGravação ativada.`,
          [{ text: "OK" }]
        );
      }

    } catch (error) {
      Alert.alert("Erro de Sinal", "Não foi possível obter a localização. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>SENTINEL</Text>
        <Text style={styles.subtitle}>Proteção à Mulher & Patrulha</Text>
        
        <TouchableOpacity style={styles.planBadge} onPress={() => setModalVisible(true)}>
          <Text style={styles.planBadgeText}>
            🛡️ PLANO MULHER SEGURA: {isPlanActive ? 'ATIVO (R$ 10/mês)' : 'INATIVO'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.status}>
          {isRecording ? "🔴 GRAVANDO ÁUDIO DE EMERGÊNCIA" : "Status: 🚨 MODO DE EMERGÊNCIA"}
        </Text>
      </View>

      <View style={styles.radarContainer}>
        <TouchableOpacity 
          activeOpacity={0.7} 
          style={[styles.button, isRecording && styles.buttonRecording]}
          onPress={() => handleSOS("Botão SOS Pressionado")}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="large" color="#FFFFFF" />
          ) : (
            <Text style={styles.sosText}>{isRecording ? "REC" : "SOS"}</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.tipText}>
          Aperte o botão SOS ou chacoalhe o celular com força para acionar a rede de emergência.
        </Text>
      </View>

      {/* MODAL DO PLANO MULHER SEGURA */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🛡️ PLANO MULHER SEGURA</Text>
            <Text style={styles.modalPrice}>R$ 10,00 / mês</Text>
            <Text style={styles.modalDescription}>
              • Monitoramento e localização GPS precisa em tempo real{"\n"}
              • Alerta automático para a Central/Telegram{"\n"}
              • Acionamento por movimento (Chacoalho){"\n"}
              • Gravação discreta de áudio para evidências
            </Text>

            <TouchableOpacity 
              style={styles.subscribeBtn}
              onPress={() => {
                setIsPlanActive(true);
                setModalVisible(false);
                Alert.alert("Sucesso", "Plano Mulher Segura ativado com sucesso!");
              }}
            >
              <Text style={styles.subscribeBtnText}>ASSINAR OU RENOVAR</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeBtnText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
    justifyContent: 'space-between',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#D4AF37',
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#A0A0A0',
    marginTop: 4,
    marginBottom: 10,
  },
  planBadge: {
    backgroundColor: '#1A1A1A',
    borderColor: '#D4AF37',
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 12,
  },
  planBadgeText: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  radarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
  },
  button: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: '#FF3B30',
    backgroundColor: '#8B0000',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  buttonRecording: {
    borderColor: '#FF0000',
    backgroundColor: '#330000',
  },
  sosText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  tipText: {
    fontSize: 13,
    color: '#A0A0A0',
    textAlign: 'center',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#121212',
    borderColor: '#D4AF37',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 6,
  },
  modalPrice: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalDescription: {
    color: '#CCCCCC',
    fontSize: 13,
    lineHeight: 22,
    marginBottom: 24,
    textAlign: 'left',
    width: '100%',
  },
  subscribeBtn: {
    backgroundColor: '#D4AF37',
    paddingVertical: 14,
    width: '100%',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  subscribeBtnText: {
    color: '#000000',
    fontWeight: '900',
    fontSize: 14,
  },
  closeBtn: {
    paddingVertical: 10,
  },
  closeBtnText: {
    color: '#888888',
    fontSize: 13,
  },
});
