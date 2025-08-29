// Capacitor platform detection and utilities
import { Capacitor } from '@capacitor/core';

export const isNative = () => Capacitor.isNativePlatform();
export const isIOS = () => Capacitor.getPlatform() === 'ios';
export const isAndroid = () => Capacitor.getPlatform() === 'android';
export const isWeb = () => Capacitor.getPlatform() === 'web';

// Check if device has offline download capabilities
export const hasOfflineSupport = () => {
  return isNative(); // Only native platforms support offline downloads
};
