import { API_URL } from "@/constants/constants";
import { RideDetails, RideEditDetails, RoutesRequest, SearchRideRequest, SearchRideResponse } from "@/types/ride-types";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { useState } from "react";
import { Alert } from "react-native";

export const useCreateRide = async (postData: RideDetails) => {
  const userDetailsString = await useAsyncStorage('userDetails').getItem();
  const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null;
  const token = userDetails?.token ?? '';

  /* ---- optional: log what we are about to send ------------------- */
  console.log('TOKEN >>>', token);
  console.log('POST-BODY >>>', JSON.stringify(postData, null, 2));
  /* ---------------------------------------------------------------- */

  const res = await fetch(`${API_URL}/api/ride/create`, {
    method : 'POST',
    headers: {
      'Content-Type' : 'application/json',
      Authorization  : `Bearer ${token}`,
    },
    body: JSON.stringify(postData),
  });

  /* 1️⃣  ALWAYS read the body once as TEXT first --------------------- */
  const raw = await res.text();
  console.log('RAW RESPONSE >>>', raw);

  /* 2️⃣  Try to turn it into JSON; fall back to raw text ------------- */
  let data: any;
  try   { data = JSON.parse(raw); }
  catch { data = { message: raw || 'Server returned non-JSON response' }; }

  /* 3️⃣  Surface the error to the caller & UI ----------------------- */
  if (!res.ok) {
    Alert.alert(
      `Ride creation failed (${res.status})`,
      data.message || data.error || data.msg || 'Unknown server error'
    );
  }

  return { ok: res.ok, status: res.status, data };
};

export const useEditRide = async (postData: RideEditDetails) => {
  const userDetailsString = await useAsyncStorage('userDetails').getItem();
  const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null;
  const token = userDetails?.token ?? '';

  /* ---- optional: log what we are about to send ------------------- */
  console.log('TOKEN >>>', token);
  console.log('POST-BODY >>>', JSON.stringify(postData, null, 2));
  /* ---------------------------------------------------------------- */

  const res = await fetch(`${API_URL}/api/ride/edit`, {
    method : 'PUT',
    headers: {
      'Content-Type' : 'application/json',
      Authorization  : `Bearer ${token}`,
    },
    body: JSON.stringify(postData),
  });

  /* 1️⃣  ALWAYS read the body once as TEXT first --------------------- */
  const raw = await res.text();
  // console.log('RAW RESPONSE >>>', raw);

  /* 2️⃣  Try to turn it into JSON; fall back to raw text ------------- */
  let data: any;
  try   { data = JSON.parse(raw); }
  catch { data = { message: raw || 'Server returned non-JSON response' }; }

  /* 3️⃣  Surface the error to the caller & UI ----------------------- */
  if (!res.ok) {
    Alert.alert(
      `Ride creation failed (${res.status})`,
      data.message || data.error || data.msg || 'Unknown server error'
    );
  }

  return { ok: res.ok, status: res.status, data };
};


export const useGetPopularPlaces = async (postData: any) => {
  console.log("request==========", postData)
  const userDetailsString = await useAsyncStorage("userDetails").getItem()
  const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null
  const token = userDetails ? userDetails?.token : ""
  try {
    const response = await fetch(`${API_URL}/api/places/popular-places`, {
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

export const useGetRideDetails = async (postData: {
  ride_id: number;
  ride_amount_id: number;
}) => {
  console.log('request==========', postData);

  const userDetailsString = await useAsyncStorage('userDetails').getItem();
  const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null;
  const token = userDetails?.token ?? '';
  console.log(token)
  try {
    const res = await fetch(`${API_URL}/api/ride/detail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(postData),
    });

    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }

    const data = await res.json();   // ← read once
    console.log('response ==========', data);
    return data;                     // ← return it
  } catch (error) {
    console.error('api details error', error);
    throw error;                     // re-throw so the component can catch it
  }
};

export const useGetPublishedRideDetails = async (postData: {
  ride_id: number;
}) => {
  console.log('request==========', postData);

  const userDetailsString = await useAsyncStorage('userDetails').getItem();
  const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null;
  const token = userDetails?.token ?? '';
  console.log(token)
  try {
    const res = await fetch(`${API_URL}/api/ride/driver-detail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(postData),
    });

    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }

    const data = await res.json();   // ← read once
    console.log('response ==========', data);
    return data;                     // ← return it
  } catch (error) {
    console.error('api details error', error);
    throw error;                     // re-throw so the component can catch it
  }
};

export const useCreateBooking = async (postData: any) => {
  const userDetailsString = await useAsyncStorage('userDetails').getItem();
  const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null;
  const token = userDetails?.token ?? '';
console.log("postData================",postData)
  const res = await fetch(`${API_URL}/api/booking/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(postData),
  });
  const err = res.body

  console.log(res)

  const text = await res.text();          // ← read once as text first
  let data;
  try {
    data = JSON.parse(text);              // ← try to turn it into JSON
  } catch(err) {
    console.log("error================",err)
    // whatever came back is not JSON – treat it as a server crash
    throw { message: 'Already booked for the same ride' };
  }

  if (!res.ok) throw data;                // data already contains message/errors
  return data;
};

export const useGetExactLocation = async (postData: any) => {
  console.log("request==========", postData)
  const userDetailsString = await useAsyncStorage("userDetails").getItem()
  const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null
  const token = userDetails ? userDetails?.token : ""
  try {
    const response = await fetch(`${API_URL}/api/places/popular-places-nearby`, {
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

export const useUpdateRideStatus = async (postData: {
  "ride_id": number,
  "status": number
}) => {
  console.log("request==========", postData)
  const userDetailsString = await useAsyncStorage("userDetails").getItem()
  const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null
  const token = userDetails ? userDetails?.token : ""
  try {
    const response = await fetch(`${API_URL}/api/ride/status`, {
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

export const useUpdateBookingStatus = async (postData: {
  "booking_id": number,
  "status": number
}) => {
  console.log("request==========", postData)
  const userDetailsString = await useAsyncStorage("userDetails").getItem()
  const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null
  const token = userDetails ? userDetails?.token : ""
  try {
    const response = await fetch(`${API_URL}/api/booking/status`, {
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

export const useVerifyBooking = async (postData: {
  "ride_id": number,
  "pin": string
}) => {
  console.log("request==========", postData)
  const userDetailsString = await useAsyncStorage("userDetails").getItem()
  const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null
  const token = userDetails ? userDetails?.token : ""
  try {
    const response = await fetch(`${API_URL}/api/booking/verify-pin`, {
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

export const useBookingApproval = async (postData: {
  "booking_id": number,
  "type": number
}) => {
  console.log("request==========", postData)
  const userDetailsString = await useAsyncStorage("userDetails").getItem()
  const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null
  const token = userDetails ? userDetails?.token : ""
  console.log("token==================", token)
  try {
    const response = await fetch(`${API_URL}/api/booking/approval`, {
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

export const useGetAllBooking = async (booking_type: "booked" | "published", status_type: "pending" | "completed" | "cancelled" |  "requested") => {
  console.log("request==========", booking_type, status_type)
  const userDetailsString = await useAsyncStorage("userDetails").getItem()
  const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null
  const token = userDetails ? userDetails?.token : ""
  console.log(token)
  try {
    const response = await fetch(`${API_URL}/api/booking/list?booking_type=${booking_type}&status_type=${status_type}&page=1`, {
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

export const useGetAlRides = async (status_type: "pending" | "completed" | "cancelled") => {
  const status = status_type == 'pending' ? 1 : status_type == "completed" ? 4 : status_type == "cancelled" ? 5 : 2
  const userDetailsString = await useAsyncStorage("userDetails").getItem()
  const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null
  const token = userDetails ? userDetails?.token : ""
  console.log("token==================", token,status)
  try {
    const response = await fetch(`${API_URL}/api/ride/list?status=${status}&per_page=100`, {
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

export const searchRide = async (
  postData: SearchRideRequest,
  // token: string | undefined
): Promise<any> => {
  const userDetailsString = await useAsyncStorage("userDetails").getItem()
  const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null
  const token = userDetails ? userDetails?.token : ""
  console.log("token======", token)
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
      console.log(errorText, "err")
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.log("API error", error);
    throw error; // Re-throw so component can catch it
  }
};

export const placeRoutes = async (
  postData: RoutesRequest
): Promise<any> => {
  const userDetailsString = await useAsyncStorage("userDetails").getItem()
  const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null
  const token = userDetails ? userDetails?.token : ""
  try {
    const response = await fetch(`${API_URL}/api/places/routes`, {
      body: JSON.stringify(postData),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // ✅ Pass token explicitly
      },
    });

    // console.log("API Response:", response);

    if (!response.ok) {
      const errorText = await response.text();
      console.log(errorText, "err")
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.log("API error", error);
    throw error; // Re-throw so component can catch it
  }
};

export const rideAlert = async (
  postData: { email: string, ride_id: number }
): Promise<any> => {
  const userDetailsString = await useAsyncStorage("userDetails").getItem()
  const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null
  const token = userDetails ? userDetails?.token : ""
  try {
    const response = await fetch(`${API_URL}/api/ride-alert/create`, {
      body: JSON.stringify(postData),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    // console.log("API Response:", response);

    if (!response.ok) {
      const errorText = await response.text();
      console.log(errorText, "err")
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