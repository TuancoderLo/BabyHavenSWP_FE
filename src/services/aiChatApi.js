import api from "../config/axios";

const aiChatApi = {
  // Gửi tin nhắn đến AI
  postMessage: async (name, age, userMessage, growthData = null) => {
    // Chuẩn bị initialRecord (có thể là null)
    let initialRecord = null;
    if (growthData) {
      initialRecord = {
        age: age || 0, // Sử dụng age được truyền vào
        weight: growthData.weight || 0,
        height: growthData.height || 0,
        chestCircumference: growthData.chestCircumference || 0,
        muscleMass: growthData.muscleMass || 0,
        bloodSugarLevel: growthData.bloodSugarLevel || 0,
        triglycerides: growthData.triglycerides || 0,
        nutritionalStatus: growthData.nutritionalStatus?.trim() || "Unknown",
      };
    }

    // Chuẩn bị dữ liệu gửi đi
    const chatData = {
      sessionId: name?.trim() || "",
      userMessage: userMessage?.trim() || "",
      initialRecord: initialRecord, // Có thể là null
    };

    return api.post("GrowthRecordAnalysis/chat", chatData, {
      validateStatus: (status) => status >= 200 && status < 300,
    });
  },

  // Xóa lịch sử trò chuyện
  clearChat: async (sessionId) => {
    const requestData = {
      sessionId: sessionId?.trim() || "",
    };

    return api.post("GrowthRecordAnalysis/clear-chat", requestData, {
      validateStatus: (status) => status >= 200 && status < 300,
    });
  },
};

export default aiChatApi;