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
          return response.json()
      } catch (error) {
          console.log("api error", error)
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
  