import axios from "axios";

const BASE_URL = "https://localhost:7279/api";

const packageApi = {
  getAllPackages: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/MembershipPackages`);
      return {
        status: response.data.status,
        message: response.data.message,
        data: response.data.data,
      };
    } catch (error) {
      throw error;
    }
  },

  createPackage: async (data) => {
    try {
      const packageData = {
        ...data,
        packageName: String(data.packageName),
        description: String(data.description),
        price: Number(data.price),
        currency: "VND",
        durationMonths: Number(data.durationMonths),
        trialPeriodDays: Number(data.trialPeriodDays),
        maxChildrenAllowed: Number(data.maxChildrenAllowed),
        supportLevel: String(data.supportLevel),
        status: Number(data.status),
      };

      const response = await axios.post(
        `${BASE_URL}/MembershipPackages`,
        packageData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updatePackage: async (id, data) => {
    try {
      if (!id) {
        throw new Error("PackageId is required for update");
      }

      console.log("ID nhận được trong updatePackage:", id);

      const packageData = {
        membershipPackageUpdateDto: {
          packageId: Number(id),
          packageName: String(data.packageName),
          description: String(data.description),
          price: Number(data.price),
          currency: "VND",
          durationMonths: Number(data.durationMonths),
          trialPeriodDays: Number(data.trialPeriodDays || 0),
          maxChildrenAllowed: Number(data.maxChildrenAllowed),
          supportLevel: String(data.supportLevel || ""),
          status: String(data.status || ""),
        },
      };

      console.log("Dữ liệu được gửi đến API:", packageData);

      const response = await axios.put(
        `${BASE_URL}/MembershipPackages/${id}`,
        packageData
      );
      console.log("Phản hồi từ API:", response.data);
      return response.data;
    } catch (error) {
      console.error("Lỗi từ API:", error.response?.data);
      console.error("Status code:", error.response?.status);
      throw error;
    }
  },

  deletePackage: async (id) => {
    try {
      const response = await axios.delete(
        `${BASE_URL}/MembershipPackages/${id}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default packageApi;
