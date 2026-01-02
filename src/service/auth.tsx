import { API_URL } from "@/constants/constants";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { handleApiError } from "@/utils/api-error-handler";

export const handleSendOtp = async (postData: FormData): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/api/send-auth-otp`, {
      body: postData,
      method: 'POST'
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return data;
  } catch (error: any) {
    console.error("Send OTP API error:", error);
    throw error;
  }
}

export const handleVerifyOtp = async (postData: FormData): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/api/verify-auth-otp`, {
      body: postData,
      method: 'POST'
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return data;
  } catch (error: any) {
    console.error("Verify OTP API error:", error);
    throw error;
  }
}

export const handleRegister = async (postData: FormData): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/api/register`, {
      body: postData,
      method: 'POST'
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return data;
  } catch (error: any) {
    console.error("Register API error:", error);
    throw error;
  }
}

// export const handleBankSave = async (payload: Record<string, unknown>) => {
//   const userDetailsString = await useAsyncStorage('userDetails').getItem();
//   const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null;
//   const token = userDetails?.token ?? '';
//   console.log("token==============", payload)

//   try {
//     const res = await fetch(`${API_URL}/api/bank/add`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify(payload),
//     });

//     if (!res.ok) throw new Error(res.statusText);
//     return res;
//   } catch (error) {
//     console.log('api error', error);
//     throw error; // propagate so caller can catch it
//   }
// };

export const handleBankSave = async (payload: Record<string, unknown>) => {
  const userDetailsString = await useAsyncStorage('userDetails').getItem();
  const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null;
  const token = userDetails?.token ?? '';

  const res = await fetch(`${API_URL}/api/bank/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  // --- always read the body ---
  const body = await res.json().catch(() => ({})); // ignore parse errors

  if (!res.ok) {
    // create an error that carries the server message
    const err: any = new Error(body.message || res.statusText);
    err.status = res.status;
    err.body = body;               // full payload available if you need it
    throw err;
  }

  return { res, body };            // return both so caller can use them
};

export const handleBankUpdate = async (payload: Record<string, unknown>) => {
  console.log("calling bank update============>", payload)
  const userDetailsString = await useAsyncStorage('userDetails').getItem();
  const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null;
  const token = userDetails?.token ?? '';

  const res = await fetch(`${API_URL}/api/bank/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  // --- always read the body ---
  const body = await res.json().catch(() => ({})); // ignore parse errors

  if (!res.ok) {
    // create an error that carries the server message
    const err: any = new Error(body.message || res.statusText);
    err.status = res.status;
    err.body = body;               // full payload available if you need it
    throw err;
  }

  return { res, body };            // return both so caller can use them
};

export const handleBankDelete = async (payload: Record<string, unknown>) => {
  console.log("calling bank update============>", payload)
  const userDetailsString = await useAsyncStorage('userDetails').getItem();
  const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null;
  const token = userDetails?.token ?? '';

  try {
    const res = await fetch(`${API_URL}/api/bank/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(res.statusText);
    return res;
  } catch (error) {
    console.log('api error', error);
    throw error; // propagate so caller can catch it
  }
};

export const handleLogOut = async (): Promise<any> => {
  const userDetailsString = await useAsyncStorage("userDetails").getItem()
  const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null
  const token = userDetails ? userDetails?.token : ""
  
  try {
    const response = await fetch(`${API_URL}/api/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return data;
  } catch (error: any) {
    console.error("Logout API error:", error);
    throw error;
  }
}

export const handleVerifyId = async (postData: FormData): Promise<Response> => {
  const userDetailsString = await useAsyncStorage("userDetails").getItem();
  const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null;
  const token = userDetails?.token || "";

  console.log('API URL:', `${API_URL}/api/verify-id`);
  console.log('Auth Token:', token);

  for (const [key, value] of postData.entries()) {
    if (typeof value === 'string') {
      console.log(`Form field: ${key} = ${value}`);
    } else if (value instanceof Blob || (value && typeof value === 'object' && 'uri' in value)) {
      console.log(`File field: ${key} = [File object]`, value);
    }
  }

  try {
    const response = await fetch(`${API_URL}/api/verify-id`, {
      method: 'POST',
      body: postData,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  } catch (error: any) {
    console.error("Verify ID API error:", error);
    throw error;
  }
};

export const useGetProfileDetails = async (): Promise<any> => {
  const userDetailsString = await useAsyncStorage("userDetails").getItem()
  const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null
  const token = userDetails ? userDetails?.token : ""
  
  try {
    const response = await fetch(`${API_URL}/api/profile`, {
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
    console.error("Get profile API error:", error);
    throw error;
  }
}

export async function getUserStatus(): Promise<any> {
  const userDetailsString = await useAsyncStorage('userDetails').getItem();
  const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null;
  const token = userDetails?.token ?? '';

  try {
    const response = await fetch(`${API_URL}/api/user/status`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      const error: any = new Error(data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`);
      error.response = { status: response.status, data };
      throw error;
    }
    
    return data;
  } catch (error: any) {
    console.error("Get user status API error:", error);
    handleApiError(error, () => getUserStatus());
    throw error;
  }
}
