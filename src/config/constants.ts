// src/config/constants.ts
import Constants from 'expo-constants';

export const API_KEYS = {
  WEATHERAPI: Constants.expoConfig?.extra?.weatherApiKey || '',
} as const;