import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export const triggerHaptic = (style: 'light' | 'medium' | 'heavy' | 'success' | 'error' = 'medium') => {
  if (Platform.OS === 'web') return;

  try {
    switch (style) {
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'error':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
    }
  } catch (e) {
    // Si no está soportado en la plataforma actual no romperá la ejecución
  }
};