import api from "../config/axios";

const transactionApi = {
  getAllTransactions: () => {
    const url = "/Transactions";
    return api.get(url);
  },
};

export default transactionApi;
