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
    
  // Lấy memberMembershipId (đầu tiên) theo memberId
  getMemberMembershipId: async (memberId) => {
    const response = await api.get(`MemberMemberships/odata?$filter=MemberId eq ${memberId}`);
    const list = response.data;
    if (Array.isArray(list) && list.length > 0) {
      return list[0].memberMembershipId;
    } else {
      throw new Error("No memberMembership found for this memberId");
    }
  },
  // Tạo transaction
  createTransaction: (transactionData) => {
    // POST /api/Transactions
    return api.post("Transactions", transactionData);
  },
  //Lấy Tracsaction theo id
  getTransactionById: (id) => {
    return api.get(`Transactions/${id}`);
  },

  
  // Gọi API tạo Payment URL (VNPay)
  createPayment: (memberMembershipId, returnUrl) => {
    // GET /api/vnpay/create-payment?memberMembershipId=...&returnUrl=...
    return api.get(
      `vnpay/create-payment?memberMembershipId=${memberMembershipId}&returnUrl=${encodeURIComponent(returnUrl)}`
    );
  },
};

export default transactionsApi;