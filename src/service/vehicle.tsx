import { API_URL } from "@/constants/constants";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { handleApiError } from "@/utils/api-error-handler";

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
            const error: any = new Error(data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`);
            error.response = { status: response.status, data };
            throw error;
        }

        return data;
    } catch (error: any) {
        console.error("Get vehicle list API error:", error);
        handleApiError(error, () => getVehicleList());
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
            
            // Create an axios-like error structure for consistent error handling
            const error: any = new Error(errorData?.message || `HTTP ${response.status}: ${response.statusText}`);
            error.response = {
                status: response.status,
                statusText: response.statusText,
                data: errorData
            };
            error.status = response.status;
            throw error;
        }
        
        return response;
    } catch (error: any) {
        console.error("Add vehicle API error:", error);
        
        // If it's already our custom error, just re-throw it
        if (error.response) {
            throw error;
        }
        
        // For network errors or other issues, create a consistent structure
        const networkError: any = new Error(error.message || 'Network error occurred');
        networkError.response = {
            status: 0,
            statusText: 'Network Error',
            data: {
                message: error.message || 'Failed to connect to server',
                error: 'NETWORK_ERROR'
            }
        };
        throw networkError;
    }
}

export const updateVehicle = async (payload: { vehicle_id: number; model_id: number; year: number; color: string }): Promise<{ res: Response; body: any }> => {
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
            // Create an axios-like error structure for consistent error handling
            const error: any = new Error(body.message || response.statusText);
            error.response = {
                status: response.status,
                statusText: response.statusText,
                data: body
            };
            error.status = response.status;
            error.body = body; // Keep for backward compatibility
            throw error;
        }
        
        return { res: response, body };
    } catch (error: any) {
        console.error("Update vehicle API error:", error);
        
        // If it's already our custom error, just re-throw it
        if (error.response) {
            throw error;
        }
        
        // For network errors or other issues, create a consistent structure
        const networkError: any = new Error(error.message || 'Network error occurred');
        networkError.response = {
            status: 0,
            statusText: 'Network Error',
            data: {
                message: error.message || 'Failed to connect to server',
                error: 'NETWORK_ERROR'
            }
        };
        throw networkError;
    }
}

export const deleteVehicle = async (vehicleId: number): Promise<{ res: Response; body: any }> => {
    const userDetailsString = await useAsyncStorage("userDetails").getItem()
    const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null
    const token = userDetails ? userDetails?.token : ""

    console.log(token)
    
    try {
        const response = await fetch(`${API_URL}/api/vehicle/delete`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ vehicle_id: vehicleId })
        });
        
        const body = await response.json().catch(() => ({}));
        
        if (!response.ok) {
            // Create an axios-like error structure for consistent error handling
            const error: any = new Error(body.message || response.statusText);
            error.response = {
                status: response.status,
                statusText: response.statusText,
                data: body
            };
            error.status = response.status;
            error.body = body; // Keep for backward compatibility
            throw error;
        }
        
        return { res: response, body };
    } catch (error: any) {
        console.error("Delete vehicle API error:", error);
        
        // If it's already our custom error, just re-throw it
        if (error.response) {
            throw error;
        }
        
        // For network errors or other issues, create a consistent structure
        const networkError: any = new Error(error.message || 'Network error occurred');
        networkError.response = {
            status: 0,
            statusText: 'Network Error',
            data: {
                message: error.message || 'Failed to connect to server',
                error: 'NETWORK_ERROR'
            }
        };
        throw networkError;
    }
}