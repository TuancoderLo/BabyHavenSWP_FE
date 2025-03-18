import api from "../config/axios";

const vnpayApi = {
  createPaymentUrl: async (params) => {
    const response = await api.post("/create_payment_url", params);
    return response.data;
  },
  paymentConfirm: async (queryParams) => {
    const response = await api.get("vnpay/payment-confirm", {
      params: queryParams,
    });
    return response.data;
  },
};

export default vnpayApi;