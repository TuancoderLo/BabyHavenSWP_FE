import api from "../config/axios";

const transactionsApi = {
  // Lấy thông tin tất cả các giao dịch
  getAllTransactions: () => {
    return api.get("Transactions");
  },

  // Lấy thông tin giao dịch của 1 member
  getMemberTransactions: (Id) => {
    return api.get(`Transactions/transaction/${Id}`);
  },

    // Tạo memberMembership
    createMemberMembership: (data) => {
      return api.post("MemberMemberships", data);
    },
    
 // Lấy thông tin memberMembership
 getMemberMembershipId: async (membershipId) => {
  // Sử dụng OData filter để lấy record có memberMembershipId bằng giá trị membershipId
  const response = await api.get(`MemberMemberships/odata?$filter=memberMembershipId eq '${membershipId}'`);
  const list = response.data.data;
  if (Array.isArray(list) && list.length > 0) {
    return list[0].memberMembershipId;
  } else {
    throw new Error("MemberMembership not found for this id");
  }
},
  // Tạo transaction
  createTransaction: (transactionData) => {
    // POST /api/Transactions
    return api.post("Transactions", transactionData);
  },
  
  // Gọi API tạo Payment URL (VNPay)
createPayment: (gatewayTransactionId) => {
  return api.get(`vnpay/create-payment?gatewayTransactionId=${gatewayTransactionId}`);
},
};

export default transactionsApi;