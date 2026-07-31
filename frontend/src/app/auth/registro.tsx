import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator, 
  SafeAreaView 
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import api from '../../services/api';

export default function RegisterScreen() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!nombre || !email || !password) {
      Alert.alert('Atención', 'Por favor llena todos los campos');
      return;
    }

    try {
      setLoading(true);
      // Petición al endpoint real de registro
      await api.post('/auth/registro', {
        nombre,
        correo: email,
        password,
      });

      Alert.alert('¡Éxito!', 'Cuenta creada correctamente. Inicia sesión para continuar.', [
        { text: 'OK', onPress: () => router.replace('/auth/login') }
      ]);
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Error al crear la cuenta';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Crear Cuenta</Text>
          <Text style={styles.subtitle}>Empieza a registrar y controlar tus gastos</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre Completo</Text>
            <TextInput
              placeholder="Juan Pérez"
              placeholderTextColor="#64748b"
              value={nombre}
              onChangeText={setNombre}
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Correo Electrónico</Text>
            <TextInput
              placeholder="tu@correo.com"
              placeholderTextColor="#64748b"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor="#64748b"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
            />
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && { opacity: 0.7 }]} 
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Registrarse</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>¿Ya tienes una cuenta? </Text>
          <Link href="/auth/login" asChild>
            <TouchableOpacity>
              <Text style={styles.linkText}>Inicia Sesión</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 6,
  },
  form: {
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#090d16',
    color: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  button: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#64748b',
    fontSize: 14,
  },
  linkText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '700',
  },
});