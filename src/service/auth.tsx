const baseUrl = "https://viacar.conceptiqs.com"

export const handleSendOtp = async(postData:FormData)=>{
    try {
        const response = await fetch(`${baseUrl}/api/send-auth-otp`,{
            body:postData,
            method:'POST'
        });
    return response.json()
    } catch (error) {
        console.log("api error",error)
    }

}

export const handleVerifyOtp = async(postData:FormData)=>{
    try {
        const response = await fetch(`${baseUrl}/api/verify-auth-otp`,{
            body:postData,
            method:'POST'
        });
    return response.json()
    } catch (error) {
        console.log("api error",error)
    }

}

export const handleRegister = async(postData:FormData)=>{
    try {
        const response = await fetch(`${baseUrl}/api/register`,{
            body:postData,
            method:'POST'
        });
    return response.json()
    } catch (error) {
        console.log("api error",error)
    }

}
