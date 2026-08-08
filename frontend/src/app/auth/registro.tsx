import React, { useState, useRef } from 'react';
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
  Platform,
  KeyboardAvoidingView,
  ScrollView
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import api from '../../services/api';
import { COLORS, globalStyles } from '../../constants/theme';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterScreen() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true })
    ]).start();
  };

  const handleRegister = async () => {
    animateButton();

    const nombreLimpio = nombre.trim();
    const correoLimpio = email.trim();
    const passLimpia = password.trim();

    if (!nombreLimpio || !correoLimpio || !passLimpia) {
      const msg = 'Por favor llena todos los campos obligatorios';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Atención', msg);
      return;
    }

    if (!EMAIL_REGEX.test(correoLimpio)) {
      const msg = 'Ingresa un formato de correo válido (ej. usuario@dominio.com)';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Correo Inválido', msg);
      return;
    }

    if (passLimpia.length < 6) {
      const msg = 'La contraseña debe tener un mínimo de 6 caracteres';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Contraseña Inválida', msg);
      return;
    }

    try {
      setLoading(true);

      await api.post('/auth/registro', {
        nombre: nombreLimpio,
        correo: correoLimpio,
        password: passLimpia,
      });

      setIsSuccess(true);

      setTimeout(() => {
        const msg = 'Cuenta creada correctamente. Procede a iniciar sesión.';
        if (Platform.OS === 'web') {
          alert(msg);
          router.replace('/auth/login');
        } else {
          Alert.alert('¡Registro Exitoso!', msg, [
            { text: 'Ir al Login', onPress: () => router.replace('/auth/login') }
          ]);
        }
      }, 500);

    } catch (error: any) {
      const msg = error.response?.data?.error || error.response?.data?.message || 'Error al crear la cuenta';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Error de Registro', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={globalStyles.titleGold}>Crear Cuenta</Text>
            <Text style={globalStyles.label}>Gestión Patrimonial Exclusiva</Text>
          </View>

          {/* Tarjeta Glassmorphism */}
          <View style={globalStyles.cardGlass}>
            <View style={styles.inputGroup}>
              <Text style={globalStyles.label}>Nombre Completo</Text>
              <TextInput
                placeholder="Juan Pérez"
                placeholderTextColor={COLORS.textMuted}
                value={nombre}
                onChangeText={setNombre}
                style={globalStyles.inputGlass}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={globalStyles.label}>Correo Electrónico</Text>
              <TextInput
                placeholder="tu@correo.com"
                placeholderTextColor={COLORS.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={globalStyles.inputGlass}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={globalStyles.label}>Contraseña</Text>
              <TextInput
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={globalStyles.inputGlass}
              />
            </View>

            <Animated.View style={{ transform: [{ scale: scaleAnim }], marginTop: 10 }}>
              <TouchableOpacity 
                style={[
                  globalStyles.btnGold, 
                  loading && { opacity: 0.7 },
                  isSuccess && { backgroundColor: COLORS.success }
                ]} 
                onPress={handleRegister}
                disabled={loading || isSuccess}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#05070e" />
                ) : isSuccess ? (
                  <Text style={[globalStyles.btnGoldText, { color: '#ffffff' }]}>✓ ¡Registrado!</Text>
                ) : (
                  <Text style={globalStyles.btnGoldText}>REGISTRARSE</Text>
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Ya tienes una cuenta? </Text>
            <Link href="/auth/login" asChild>
              <TouchableOpacity>
                <Text style={styles.linkText}>Inicia Sesión</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
    paddingVertical: 30,
  },
  header: {
    marginBottom: 28,
  },
  inputGroup: {
    marginBottom: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  linkText: {
    color: COLORS.gold,
    fontSize: 14,
    fontWeight: '700',
  },
});