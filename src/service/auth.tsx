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
    const userDetailsString = await useAsyncStorage("userDetails").getItem()
    const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null
    const token = userDetails ? userDetails?.token : ""
    try {
        const response = await fetch(`${API_URL}/api/verify-id`, {
            body: postData,
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`, // ✅ Pass token explicitly
              }
        });
        return response
    } catch (error) {
        console.log("api error", error)
    }

}
