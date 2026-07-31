import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  StyleSheet, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import api from '../../services/api';

export default function RegisterScreen() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  const handleRegister = async () => {
    if (!nombre || !email || !password) {
      Alert.alert('Atención', 'Todos los campos son obligatorios.');
      return;
    }

    try {
      setLoading(true);
      await api.post('/auth/register', { nombre, email, password });
      Alert.alert('¡Cuenta Creada!', 'Registro completado con éxito. Inicia sesión.');
      router.replace('/(auth)/login');
    } catch (error: any) {
      Alert.alert('Error de Registro', error.response?.data?.message || 'No se pudo completar el registro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          
          <View style={styles.brandContainer}>
            <View style={styles.logoRing}>
              <Text style={styles.logoIcon}>✨</Text>
            </View>
            <Text style={styles.brandTitle}>NUEVA CUENTA</Text>
            <Text style={styles.brandSubtitle}>Comienza tu camino a la libertad financiera</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Nombre Completo</Text>
              <TextInput
                placeholder="Juan Pablo Ruiz"
                placeholderTextColor="#475569"
                value={nombre}
                onChangeText={setNombre}
                style={styles.input}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Correo Electrónico</Text>
              <TextInput
                placeholder="tu@correo.com"
                placeholderTextColor="#475569"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Contraseña</Text>
              <TextInput
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor="#475569"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
              />
            </View>

            <TouchableOpacity 
              onPress={handleRegister}
              disabled={loading}
              style={[styles.button, loading && styles.buttonDisabled]}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#0f172a" />
              ) : (
                <Text style={styles.buttonText}>Crear Mi Cuenta</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Ya tienes una cuenta activa? </Text>
            <Link href="/(auth)/login" style={styles.linkText}>
              Inicia sesión
            </Link>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#111827',
    borderRadius: 28,
    paddingHorizontal: 32,
    paddingVertical: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 12,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoRing: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoIcon: {
    fontSize: 28,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: 2,
    marginBottom: 4,
  },
  brandSubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
  },
  form: {
    gap: 18,
  },
  inputWrapper: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#090d16',
    color: '#f8fafc',
    paddingHorizontal: 18,
    paddingVertical: 15,
    borderRadius: 16,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  footerText: {
    color: '#64748b',
    fontSize: 14,
  },
  linkText: {
    color: '#60a5fa',
    fontWeight: '700',
    fontSize: 14,
  },
});