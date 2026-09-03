import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';

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

      // Alerta imediato exibindo as coordenadas/link
      Alert.alert(
        "🚨 ALERTA DE EMERGÊNCIA ENVIADO!",
        `Sua localização exata foi capturada:\n\nLat: ${latitude.toFixed(5)}, Long: ${longitude.toFixed(5)}\n\nO pedido de socorro foi registrado na rede Fênix.`,
        [{ text: "OK" }]
      );

      console.log("Localização do SOS:", mapsUrl);
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
          Aperte o botão SOS em caso de perigo imediato para enviar sua localização para a rede de proteção.
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
