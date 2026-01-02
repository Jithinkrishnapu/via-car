// secureVault.ts  (Expo flavour)
import * as SecureStore from 'expo-secure-store';
import { BookingPaymentData } from '@/types/ride-types';

const VAULT_PREFIX = 'card_';

export async function saveSecure(
  key: string,
  data: BookingPaymentData
): Promise<void> {
  await SecureStore.setItemAsync(VAULT_PREFIX + key, JSON.stringify(data));
}

export async function getSecure(key: string): Promise<BookingPaymentData | null> {
  try {
    const raw = await SecureStore.getItemAsync(VAULT_PREFIX + key);
    return raw ? (JSON.parse(raw) as BookingPaymentData) : null;
  } catch {
    return null;
  }
}

export async function removeSecure(key: string): Promise<void> {
  await SecureStore.deleteItemAsync(VAULT_PREFIX + key);
}