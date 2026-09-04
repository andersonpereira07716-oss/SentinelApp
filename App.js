import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';

const API_URL = 'https://refined-blond-seek-axis.trycloudflare.com';

export default function App() {
  const [chatId, setChatId] = useState('');
  const [isLogged, setIsLogged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingPanic, setSendingPanic] = useState(false);

  useEffect(() => {
    if (isLogged) {
      (async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permissão Negada',
            'O app precisa da sua localização para enviar alertas de emergência.'
          );
        }
      })();
    }
  }, [isLogged]);

  const handleLogin = async () => {
    if (!chatId.trim()) {
      return Alert.alert('Atenção', 'Informe o seu Chat ID do Telegram.');
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/status/${chatId.trim()}`);
      const data = await response.json();

      if (data.ativo) {
        setIsLogged(true);
      } else {
        Alert.alert(
          'Acesso Negado',
          'Sua assinatura está inativa ou o Chat ID não foi encontrado.'
        );
      }
    } catch (error) {
      Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handlePanic = async () => {
    setSendingPanic(true);
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const payload = {
        chatId: chatId.trim(),
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      const response = await fetch(`${API_URL}/api/panico`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert(
          '🚨 ALERTA ENVIADO',
          'Sua localização de emergência foi registrada e enviada no Telegram!'
        );
      } else {
        Alert.alert('Falha', data.error || 'Erro ao processar o pânico.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível obter a localização ou conectar ao servidor.');
    } finally {
      setSendingPanic(false);
    }
  };

  if (!isLogged) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>SENTINEL APP</Text>
        <Text style={styles.subtitle}>Digite o Chat ID do Telegram para acessar:</Text>

        <TextInput
          style={styles.input}
          placeholder="Ex: 177247539498"
          placeholderTextColor="#888"
          keyboardType="numeric"
          value={chatId}
          onChangeText={setChatId}
        />

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>ENTRAR</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.activeTitle}>SISTEMA SENTINEL ATIVO</Text>
      <Text style={styles.userStatus}>Conectado como: ID {chatId}</Text>

      <TouchableOpacity
        style={[styles.panicButton, sendingPanic && styles.panicButtonDisabled]}
        onPress={handlePanic}
        disabled={sendingPanic}
      >
        {sendingPanic ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          <Text style={styles.panicButtonText}>PÂNICO</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={() => setIsLogged(false)}>
        <Text style={styles.logoutText}>Sair / Trocar ID</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00E676',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#AAA',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: '#1E1E1E',
    color: '#FFF',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#00E676',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00E676',
    marginBottom: 5,
  },
  userStatus: {
    fontSize: 14,
    color: '#888',
    marginBottom: 50,
  },
  panicButton: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#D50000',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  panicButtonDisabled: {
    backgroundColor: '#550000',
  },
  panicButtonText: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  logoutButton: {
    marginTop: 50,
  },
  logoutText: {
    color: '#888',
    textDecorationLine: 'underline',
  },
});

