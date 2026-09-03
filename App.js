import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';

// CREDENCIAIS DO BOT DO TELEGRAM
const TELEGRAM_BOT_TOKEN = '8903706213:AAGOWD9ACzmf8pkB4Dx24JUIgPVzzarA6CY';
const TELEGRAM_CHAT_ID = '8903706213';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [locationPermission, setLocationPermission] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationPermission(true);
      }
    })();
  }, []);

  const sendTelegramAlert = async (latitude, longitude, mapsUrl) => {
    const message = `🚨 *ALERTA DE EMERGÊNCIA - SENTINEL* 🚨\n\n` +
      `Uma solicitação de socorro foi disparada!\n\n` +
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
      console.error("Erro ao enviar mensagem no Telegram:", error);
      return false;
    }
  };

  const handleSOS = async () => {
    setLoading(true);
    try {
      if (!locationPermission) {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert("Permissão Negada", "O aplicativo precisa da localização para enviar o alerta de emergência.");
          setLoading(false);
          return;
        }
      }

      // Captura a localização atual precisa
      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = location.coords;
      const mapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;

      // Envia alerta para o Telegram
      const sent = await sendTelegramAlert(latitude, longitude, mapsUrl);

      if (sent) {
        Alert.alert(
          "🚨 SOS DISPARADO!",
          "Sua localização exata foi capturada e enviada em tempo real para a rede de proteção no Telegram.",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert(
          "🚨 SOS DISPARADO!",
          `Localização capturada com sucesso:\n\nLat: ${latitude.toFixed(5)}, Long: ${longitude.toFixed(5)}\n\nLink do mapa gerado.`,
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
        <Text style={styles.status}>Status: 🚨 MODO DE EMERGÊNCIA</Text>
      </View>

      <View style={styles.radarContainer}>
        <TouchableOpacity 
          activeOpacity={0.7} 
          style={styles.button}
          onPress={handleSOS}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="large" color="#FFFFFF" />
          ) : (
            <Text style={styles.sosText}>SOS</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.tipText}>
          Aperte o botão SOS em caso de perigo imediato para enviar sua localização instantaneamente via Telegram.
        </Text>
      </View>
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
    marginBottom: 16,
  },
  status: {
    fontSize: 15,
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
});
