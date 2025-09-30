import { API_URL } from "@/constants/constants";

export const usePlacesAutocomplete = async (postData: FormData) => {
    try {
        const response = await fetch(`${API_URL}/api/places/autocomplete`, {
            body: postData,
            method: 'POST'
        });
        return response.json()
    } catch (error) {
        console.log("api error", error)
    }

}