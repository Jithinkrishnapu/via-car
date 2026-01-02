import { API_URL } from "@/constants/constants";
import { RideDetails, RideEditDetails, RoutesRequest, SearchRideRequest } from "@/types/ride-types";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
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
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(postData),
  });

  /* 1️⃣  ALWAYS read the body once as TEXT first --------------------- */
  const raw = await res.text();
  console.log('RAW RESPONSE >>>', raw);

  /* 2️⃣  Try to turn it into JSON; fall back to raw text ------------- */
  let data: any;
  try { data = JSON.parse(raw); }
  catch { data = { message: raw || 'Server returned non-JSON response' }; }

  /* 3️⃣  Return the response without showing Alert - let caller handle it */
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
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(postData),
  });

  /* 1️⃣  ALWAYS read the body once as TEXT first --------------------- */
  const raw = await res.text();
  // console.log('RAW RESPONSE >>>', raw);

  /* 2️⃣  Try to turn it into JSON; fall back to raw text ------------- */
  let data: any;
  try { data = JSON.parse(raw); }
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


export const useGetPopularPlaces = async (postData: any): Promise<any> => {
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
        Authorization: `Bearer ${token}`,
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error: any) {
    console.error("Get popular places API error:", error);
    throw error;
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
  console.log("postData================", postData)
  const res = await fetch(`${API_URL}/api/booking/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(postData),
  });

  console.log(res)

  const text = await res.text();          // ← read once as text first
  let data;
  try {
    data = JSON.parse(text);              // ← try to turn it into JSON
  } catch (err) {
    console.log("error================", err)
    // whatever came back is not JSON – treat it as a server crash
    throw { message: 'Already booked for the same ride' };
  }

  if (!res.ok) throw data;                // data already contains message/errors
  return data;
};

export const useGetExactLocation = async (postData: any): Promise<any> => {
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
        Authorization: `Bearer ${token}`,
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error: any) {
    console.error("Get exact location API error:", error);
    throw error;
  }
}

export const useUpdateRideStatus = async (postData: {
  "ride_id": number,
  "status": number
}): Promise<any> => {
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
        Authorization: `Bearer ${token}`,
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error: any) {
    console.error("Update ride status API error:", error);
    throw error;
  }
}

export const useUpdateBookingStatus = async (postData: {
  "booking_id": number,
  "status": number
}): Promise<any> => {
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
        Authorization: `Bearer ${token}`,
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error: any) {
    console.error("Update booking status API error:", error);
    throw error;
  }
}

export const useVerifyBooking = async (postData: {
  "ride_id": number,
  "pin": string
}): Promise<any> => {
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
        Authorization: `Bearer ${token}`,
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error: any) {
    console.error("Verify booking API error:", error);
    throw error;
  }
}

export const useBookingApproval = async (postData: {
  "booking_id": number,
  "type": number
}): Promise<any> => {
  console.log("request==========", postData)
  const userDetailsString = await useAsyncStorage("userDetails").getItem()
  const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null
  const token = userDetails ? userDetails?.token : ""

  try {
    const response = await fetch(`${API_URL}/api/booking/approval`, {
      body: JSON.stringify(postData),
      method: 'POST',
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
    console.error("Booking approval API error:", error);
    throw error;
  }
}

export const useGetAllBooking = async (booking_type: "booked" | "published", status_type: "pending" | "completed" | "cancelled" | "requested" | "ongoing"): Promise<any> => {
  console.log("request==========", booking_type, status_type)
  const userDetailsString = await useAsyncStorage("userDetails").getItem()
  const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null
  const token = userDetails ? userDetails?.token : ""

  try {
    const response = await fetch(`${API_URL}/api/booking/list?booking_type=${booking_type}&status_type=${status_type}&page=1`, {
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
    console.error("Get all booking API error:", error);
    throw error;
  }
}

export const useGetAlRides = async (status_type: "pending" | "completed" | "cancelled"): Promise<any> => {
  const status = status_type == 'pending' ? 2 : status_type == "completed" ? 4 : status_type == "cancelled" ? 5 : 3
  const userDetailsString = await useAsyncStorage("userDetails").getItem()
  const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null
  const token = userDetails ? userDetails?.token : ""

  try {
    const response = await fetch(`${API_URL}/api/ride/list?status=${status}&per_page=100`, {
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
    console.error("Get all rides API error:", error);
    throw error;
  }
}

export const searchRide = async (
  postData: SearchRideRequest,
): Promise<any> => {
  const userDetailsString = await useAsyncStorage("userDetails").getItem()
  const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null
  const token = userDetails ? userDetails?.token : ""
  console.log("token=================", token,postData)
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

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error: any) {
    console.error("Search ride API error:", error);
    throw error;
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
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error: any) {
    console.error("Place routes API error:", error);
    throw error;
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

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error: any) {
    console.error("Ride alert API error:", error);
    throw error;
  }
};

export const getRecommendedPrice = async (polyline: string): Promise<any> => {
  const userDetailsString = await useAsyncStorage("userDetails").getItem()
  const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null
  const token = userDetails ? userDetails?.token : ""

  try {
    const response = await fetch(`${API_URL}/api/places/recommended-price`, {
      body: JSON.stringify({ polyline }),
      method: 'POST',
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
    console.error("Get recommended price API error:", error);
    throw error;
  }
};
