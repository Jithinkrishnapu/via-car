// api/payment/authorize

import { API_URL } from "@/constants/constants"
import { BookingPaymentData } from "@/types/ride-types"
import { useAsyncStorage } from "@react-native-async-storage/async-storage"


export const useAuthorizePayment = async (postData: BookingPaymentData) => {
    console.log("request==========",postData)
    const userDetailsString = await useAsyncStorage("userDetails").getItem()
    const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null
    const token = userDetails ? userDetails?.token : ""
      try {
          const response = await fetch(`${API_URL}/api/payment/authorize`, {
              body: JSON.stringify(postData),
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`, // ✅ Pass token explicitly
              }
          });
          // console.log("#########################",await response.text())
          const data = await response.json();
          
          // If response is not ok, throw an error with the response data
          if (!response.ok) {
              throw new Error(data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`);
          }
          
          return data;
      } catch (error: any) {
          console.log("api error", error)
          // Re-throw the error so it can be handled by the calling component
          throw error;
      }
  
  }


//   api/booking/payment-status?booking_id=

export async function getPaymentStatus(booking_id:number) {
    const userDetailsString = await useAsyncStorage('userDetails').getItem();
    const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null;
    const token = userDetails?.token ?? '';
  
    const res = await fetch(`${API_URL}/api/booking/payment-status?booking_id=${booking_id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  
    if (!res.ok) throw new Error(res.statusText);
    return res.json(); // typed below
  }
  