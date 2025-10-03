import { API_URL } from "@/constants/constants";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";

export const handleSendOtp = async (postData: FormData) => {
    try {
        const response = await fetch(`${API_URL}/api/send-auth-otp`, {
            body: postData,
            method: 'POST'
        });
        return response.json()
    } catch (error) {
        console.log("api error", error)
    }

}

export const handleVerifyOtp = async (postData: FormData) => {
    try {
        const response = await fetch(`${API_URL}/api/verify-auth-otp`, {
            body: postData,
            method: 'POST'
        });
        return response.json()
    } catch (error) {
        console.log("api error", error)
    }

}

export const handleRegister = async (postData: FormData) => {
    try {
        const response = await fetch(`${API_URL}/api/register`, {
            body: postData,
            method: 'POST'
        });
        return response.json()
    } catch (error) {
        console.log("api error", error)
    }

}

export const handleBankSave = async (postData: FormData,token:string) => {
    try {
        const response = await fetch(`${API_URL}/api/bank/add`, {
            body: postData,
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`, // ✅ Pass token explicitly
              }
        });
        return response.json()
    } catch (error) {
        console.log("api error", error)
    }

}

export const handleVerifyId = async (postData: FormData) => {
    const userDetailsString = await useAsyncStorage("userDetails").getItem();
    const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null;
    const token = userDetails?.token || "";
  
    // 🔍 DEBUG: Log request info to build curl
    console.log('API URL:', `${API_URL}/api/verify-id`);
    console.log('Auth Token:', token);
    
    // Log FormData keys (you can't log full FormData easily, but you can list keys)
    for (const [key, value] of postData.entries()) {
      if (typeof value === 'string') {
        console.log(`Form field: ${key} = ${value}`);
      } else if (value instanceof Blob || (value && typeof value === 'object' && 'uri' in value)) {
        console.log(`File field: ${key} = [File object]`, value);
      }
    }
  
    const response = await fetch(`${API_URL}/api/verify-id`, {
      method: 'POST',
      body: postData,
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
  
    return response;
  };