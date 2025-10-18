import AsyncStorage from "@react-native-async-storage/async-storage";

export const KEY = 'saved_cards';

export interface SavedCardMeta {
    alias: string;               // random id you create once
    last4: string;               // "1234"
    brand: string;               // "VISA"
    expMonth: number;            // 1-12
    expYear: number;             // 2025
    holder: string;              // "A Alhazmi"
    billingCountry: string;      // "SA"
    billingCity: string;         // "Riyadh"
    billingState: string;        // "Riyadh Province"
    billingPostCode: string;     // "12345"
    addedAt: string;             // ISO date
    cardHolderName:string
    billingStreet:string
    email:string
  }


export const saveCards =async(cardData:SavedCardMeta[])=>{
await AsyncStorage.setItem(KEY,JSON.stringify(cardData))
}

export const getCards = async (): Promise<SavedCardMeta[]> => {
  const cardData = await AsyncStorage.getItem(KEY);
  if (!cardData) return [];
  try {
    return JSON.parse(cardData) as SavedCardMeta[];
  } catch {
    return [];
  }
};