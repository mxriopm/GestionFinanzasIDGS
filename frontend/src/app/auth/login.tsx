import React, { useState, useContext, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator, 
  SafeAreaView,
  Animated,
  Platform
} from 'react-native';
import { Link } from 'expo-router';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { login } = useContext(AuthContext);

  // Valores para animación nativa
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const triggerAnimation = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0.3,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.96,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ])
    ]).start();
  };

  const handleLogin = async () => {
    const correoLimpio = email.trim();
    const passLimpia = password.trim();

    if (!correoLimpio || !passLimpia) {
      const msg = 'Por favor llena todos los campos';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Atención', msg);
      return;
    }

    if (!EMAIL_REGEX.test(correoLimpio)) {
      const msg = 'Por favor ingresa un correo electrónico válido';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Atención', msg);
      return;
    }

    try {
      setLoading(true);
      triggerAnimation();

      const res = await api.post('/auth/login', { 
        correo: correoLimpio, 
        password: passLimpia
      });

      if (res.data && res.data.token) {
        setSuccess(true);
        // Breve pausa para mostrar el indicador de éxito
        setTimeout(async () => {
          await login(res.data.token);
        }, 600);
      } else {
        const errorMsg = 'No se recibió un token válido';
        Platform.OS === 'web' ? alert(errorMsg) : Alert.alert('Error', errorMsg);
        fadeAnim.setValue(1);
      }
    } catch (error: any) {
      fadeAnim.setValue(1);
      const msg = error.response?.data?.message || error.response?.data?.error || 'Error al iniciar sesión';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Error de Autenticación', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.header}>
          <Text style={styles.title}>¡Bienvenido!</Text>
          <Text style={styles.subtitle}>Inicia sesión para gestionar tus finanzas</Text>
        </View>

        <View style={styles.form}>
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
              placeholder="••••••••"
              placeholderTextColor="#64748b"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
            />
          </View>

          <TouchableOpacity 
            style={[
              styles.button, 
              loading && { opacity: 0.8 },
              success && { backgroundColor: '#059669' }
            ]} 
            onPress={handleLogin}
            disabled={loading || success}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : success ? (
              <Text style={styles.buttonText}>✓ ¡Sesión Iniciada!</Text>
            ) : (
              <Text style={styles.buttonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>¿No tienes una cuenta? </Text>
          <Link href="/auth/registro" asChild>
            <TouchableOpacity>
              <Text style={styles.linkText}>Regístrate aquí</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </Animated.View>
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