import { API_URL } from "@/constants/constants";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";

export const useUpdateProfileDetails = async (postData: FormData): Promise<any> => {
  const userDetailsString = await useAsyncStorage('userDetails').getItem();
  const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null;
  const token = userDetails?.token ?? '';

  try {
    const response = await fetch(`${API_URL}/api/profile/update`, {
      method: 'POST',
      body: postData,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return data;
  } catch (error: any) {
    console.error('Update profile API error:', error);
    throw error;
  }
};

export const useGetBankDetails = async (): Promise<any> => {
  const userDetailsString = await useAsyncStorage("userDetails").getItem()
  const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null
  const token = userDetails ? userDetails?.token : ""
  
  try {
    const response = await fetch(`${API_URL}/api/bank/list`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return data;
  } catch (error: any) {
    console.error("Get bank details API error:", error);
    throw error;
  }
}

export const useGetTransactions = async (
  page: number = 1,
  perPage: number = 15
): Promise<any> => {
  const userDetailsString = await useAsyncStorage('userDetails').getItem();
  const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null;
  const token = userDetails?.token ?? '';

  const query = new URLSearchParams({ page: String(page), per_page: String(perPage) });
  const url = `${API_URL}/api/payment/transactions?${query}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return data;
  } catch (error: any) {
    console.error("Get transactions API error:", error);
    throw error;
  }
};