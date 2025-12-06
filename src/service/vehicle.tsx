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

export const updateVehicle = async (payload: { vehicle_id: number; model_id: number; year: number; color: string }) => {
    const userDetailsString = await useAsyncStorage("userDetails").getItem()
    const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null
    const token = userDetails ? userDetails?.token : ""
    try {
        const response = await fetch(`${API_URL}/api/vehicle/update`, {
            body: JSON.stringify(payload),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            }
        });
        
        const body = await response.json().catch(() => ({}));
        
        if (!response.ok) {
            const err: any = new Error(body.message || response.statusText);
            err.status = response.status;
            err.body = body;
            throw err;
        }
        
        return { res: response, body };
    } catch (error) {
        console.log("api error", error)
        throw error;
    }
}

export const deleteVehicle = async (vehicleId: number) => {
    const userDetailsString = await useAsyncStorage("userDetails").getItem()
    const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null
    const token = userDetails ? userDetails?.token : ""
    try {
        const response = await fetch(`${API_URL}/api/vehicle/delete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ id: vehicleId })
        });
        
        const body = await response.json().catch(() => ({}));
        
        if (!response.ok) {
            const err: any = new Error(body.message || response.statusText);
            err.status = response.status;
            err.body = body;
            throw err;
        }
        
        return { res: response, body };
    } catch (error) {
        console.log("api error", error)
        throw error;
    }
}