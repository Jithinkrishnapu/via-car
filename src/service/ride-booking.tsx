import { API_URL } from "@/constants/constants";
import { RoutesRequest, SearchRideRequest, SearchRideResponse } from "@/types/ride-types";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { useState } from "react";

export const useCreateRide = async (postData: FormData) => {
    try {
        const response = await fetch(`${API_URL}/api/ride/create`, {
            body: postData,
            method: 'POST'
        });
        return response.json()
    } catch (error) {
        console.log("api error", error)
    }

}

export const searchRide = async (
    postData: SearchRideRequest,
    // token: string | undefined
  ): Promise<any> => {
    const userDetailsString = await useAsyncStorage("userDetails").getItem()
    const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null
    const token = userDetails ? userDetails?.token : ""
    console.log("token======",token)
    try {
      const response = await fetch(`${API_URL}/api/ride/search`, {
        body: JSON.stringify(postData),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
  
      console.log("API Response:", response);
  
      if (!response.ok) {
        const errorText = await response.text();
        console.log(errorText,"err")
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }
  
      return await response.json();
    } catch (error) {
      console.log("API error", error);
      throw error; // Re-throw so component can catch it
    }
  };
  
export const placeRoutes = async (
    postData: RoutesRequest,
    token: string | undefined
  ): Promise<any> => {
    try {
      const response = await fetch(`${API_URL}/api/places/routes`, {
        body: JSON.stringify(postData),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // ✅ Pass token explicitly
        },
      });
  
      console.log("API Response:", response);
  
      if (!response.ok) {
        const errorText = await response.text();
        console.log(errorText,"err")
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }
  
      return await response.json();
    } catch (error) {
      console.log("API error", error);
      throw error; // Re-throw so component can catch it
    }
  };

// export const useSearchRide = () => {
//     const [loading, setLoading] = useState<boolean>(false);
//     const [error, setError] = useState<string | null>(null);
//     const [data, setData] = useState<SearchRideResponse | null>(null);

//     const search = async (requestData: SearchRideRequest) => {
//         setLoading(true);
//         setError(null);
//         setData(null);
//         const userDetails = await useAsyncStorage('userDetails').getItem()
//         console.log("token------------------", userDetails)
//         try {
//             const response = await fetch(`${API_URL}/api/ride/search`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     Authorization: `Bearer ${userDetails?.token}`,
//                 },
//                 body: JSON.stringify(requestData),
//             });

//             // 👇 NEW: Check if response is HTML (not JSON)
//             const contentType = response.headers.get('content-type');
//             let result: SearchRideResponse | null = null;

//             if (contentType && contentType.includes('application/json')) {
//                 result = await response.json();
//             } else {
//                 // 👇 Read HTML error body for debugging
//                 const htmlError = await response.text();
//                 console.error('❌ Server returned HTML instead of JSON:', htmlError);
//                 throw new Error(
//                     `Server error (500): Backend returned HTML. Likely a PHP crash. Check server logs.\n\n${htmlError.slice(0, 500)}...`
//                 );
//             }

//             if (!response.ok) {
//                 throw new Error(result?.message || `HTTP ${response.status}`);
//             }

//             setData(result);
//             return result;
//         } catch (err: unknown) {
//             const message =
//                 err instanceof Error ? err.message : 'An unknown error occurred';
//             setError(message);
//             console.error('API error:', message);
//             throw new Error(message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return {
//         search,
//         loading,
//         error,
//         data,
//         rides: data?.data.rides || [],
//         message: data?.message || '',
//         success: data?.message?.includes('found') || false,
//     };
// };