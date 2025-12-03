import { API_URL } from "@/constants/constants";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";

export const getBrandList = async (search: string) => {
    const userDetailsString = await useAsyncStorage("userDetails").getItem()
    const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null
    const token = userDetails ? userDetails?.token : ""
    console.log("token=======",token)
    try {
        const response = await fetch(`${API_URL}/api/vehicle/brands?search=${encodeURIComponent(search)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json',
                Authorization: `Bearer ${token}`,
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("API error:", error);
        throw error; // Let the caller handle the error
    }
};

export const getModelList = async (brand_id: string, category_id: string) => {
    const userDetailsString = await useAsyncStorage("userDetails").getItem()
    const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null
    const token = userDetails ? userDetails?.token : ""
    try {
        const response = await fetch(`${API_URL}/api/vehicle/models?brand_id=${brand_id}&category_id=${category_id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json',
                Authorization: `Bearer ${token}`,
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("API error:", error);
        throw error; // Let the caller handle the error
    }
};

export const getVehicleList = async () => {
    const userDetailsString = await useAsyncStorage("userDetails").getItem()
    const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null
    const token = userDetails ? userDetails?.token : ""
    try {
        const response = await fetch(`${API_URL}/api/vehicle/list`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json',
                Authorization: `Bearer ${token}`,
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("API error:", error);
        throw error; // Let the caller handle the error
    }
};

export const getVehicleCategoryList = async () => {
    const userDetailsString = await useAsyncStorage("userDetails").getItem()
    const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null
    const token = userDetails ? userDetails?.token : ""
    try {
        const response = await fetch(`${API_URL}/api/vehicle/categories`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json',
                Authorization: `Bearer ${token}`,
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("API error:", error);
        throw error; // Let the caller handle the error
    }
};
// /api/vehicle/add

export const addVehicle = async (postData: FormData) => {
    const userDetailsString = await useAsyncStorage("userDetails").getItem()
    const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null
    const token = userDetails ? userDetails?.token : ""
    try {
        const response = await fetch(`${API_URL}/api/vehicle/add`, {
            body: postData,
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return response
    } catch (error) {
        console.log("api error", error)
    }

}