import { API_URL } from "@/constants/constants";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";

export const useUpdateProfileDetails = async (postData: FormData) => {
  const userDetailsString = await useAsyncStorage('userDetails').getItem();
  const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null;
  const token = userDetails?.token ?? '';

  try {
    const response = await fetch(`${API_URL}/api/profile/update`, {
      method: 'POST',
      body: postData,                           // 1️⃣ send as-is
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,       // 2️⃣ keep token
        // ❌ DO NOT set Content-Type manually – fetch adds boundary
      },
    });
    return await response.json();
  } catch (error) {
    console.log('api error', error);
  }
};



export const useGetBankDetails = async () => {
  const userDetailsString = await useAsyncStorage("userDetails").getItem()
  const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null
  const token = userDetails ? userDetails?.token : ""
    try {
        const response = await fetch(`${API_URL}/api/bank/list`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`, // ✅ Pass token explicitly
            }
        });
        return response.json()
    } catch (error) {
        console.log("api error", error)
    }

}

export const useGetTransactions = async (
  page: number = 1,
  perPage: number = 15
) => {
  const userDetailsString = await useAsyncStorage('userDetails').getItem();
  const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null;
  const token = userDetails?.token ?? '';

  const query = new URLSearchParams({ page: String(page), per_page: String(perPage) });
  const url = `${API_URL}/api/payment/transactions?${query}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    // optional: throw so you can catch in the screen
    throw new Error(`Request failed ${res.status}`);
  }

  return res.json(); // ← { commonData:null, data:[…], message:'Success' }
};