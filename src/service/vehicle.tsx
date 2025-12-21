import { API_URL } from "@/constants/constants";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";

export const getBrandList = async (search: string): Promise<any> => {
    const userDetailsString = await useAsyncStorage("userDetails").getItem()
    const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null
    const token = userDetails ? userDetails?.token : ""
    
    try {
        const response = await fetch(`${API_URL}/api/vehicle/brands?search=${encodeURIComponent(search)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json',
                Authorization: `Bearer ${token}`,
            }
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        return data;
    } catch (error: any) {
        console.error("Get brand list API error:", error);
        throw error;
    }
};

export const getModelList = async (brand_id: string, category_id: string): Promise<any> => {
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

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        return data;
    } catch (error: any) {
        console.error("Get model list API error:", error);
        throw error;
    }
};

export const getVehicleList = async (): Promise<any> => {
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

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        return data;
    } catch (error: any) {
        console.error("Get vehicle list API error:", error);
        throw error;
    }
};

export const getVehicleCategoryList = async (): Promise<any> => {
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

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        return data;
    } catch (error: any) {
        console.error("Get vehicle category list API error:", error);
        throw error;
    }
};

export const addVehicle = async (postData: FormData): Promise<Response> => {
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
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(errorData?.message || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response;
    } catch (error: any) {
        console.error("Add vehicle API error:", error);
        throw error;
    }
}

export const updateVehicle = async (payload: { vehicle_id: number; model_id: number; year: number; color: string }): Promise<{ res: Response; body: any }> => {
    const userDetailsString = await useAsyncStorage("userDetails").getItem()
    const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null
    const token = userDetails ? userDetails?.token : ""
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
        
        return { res: response, body }
}

export const deleteVehicle = async (vehicleId: number): Promise<{ res: Response; body: any }> => {
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
    } catch (error: any) {
        console.error("Delete vehicle API error:", error);
        throw error;
    }
}