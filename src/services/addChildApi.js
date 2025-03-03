import api from "../config/axios";

const addChildApi = {
    //tạo mới tt trẻ
    createChild: (childData) => {
        return api.post("/Children", childData);
    },
    //tạo mới growth record
    createGrowthRecord: (growthData) => {
        return api.post("/GrowthRecord", growthData);
    }    
};
export default addChildApi;