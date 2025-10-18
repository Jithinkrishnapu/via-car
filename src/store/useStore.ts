import { create } from "zustand";

interface Store {
 isPublish:boolean
 setIsPublish:((isPublish:boolean)=>void)
 path:string
 setPath:(path:string)=>void
 vehicle:{brand_id:string,category_id:string},
 setVehicle:((brand_id:string,category_id:string)=>void)
 vehicle_colors:[],
 setVehicleColors:((colors:[])=>void)
 vehicle_model_id:string
 setVehicleModelId:((model_id:string)=>void)
}

export const useStore = create<Store>((set) => ({
isPublish:false,
path:'',
setIsPublish: (value) => set({ isPublish: value }),
vehicle: { brand_id: "", category_id: "" },
setVehicle: (brand_id, category_id) => set({ vehicle: { brand_id, category_id } }),
vehicle_colors:[],
setVehicleColors: (value) => set({ vehicle_colors: value }),
vehicle_model_id:"",
setVehicleModelId: (value) => set({ vehicle_model_id: value }),
setPath:((value)=>set({path:value}))
}));
