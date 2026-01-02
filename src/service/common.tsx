import { API_URL } from "@/constants/constants";

export const usePlacesAutocomplete = async (postData: FormData): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}/api/places/autocomplete`, {
            body: postData,
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        return data;
    } catch (error: any) {
        console.error("Places autocomplete API error:", error);
        throw error;
    }
}