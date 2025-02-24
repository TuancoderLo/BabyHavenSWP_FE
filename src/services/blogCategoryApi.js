import api from "../config/axios";

const blogCategoryApi = {
  getAll: () => {
    return api.get("/api/BlogCategories");
  },

  getById: (id) => {
    return api.get(`/api/BlogCategories/${id}`);
  },

  create: (data) => {
    const formattedData = {
      categoryName: data.categoryName,
      description: data.description,
      isActive: data.isActive || false,
      parentCategoryId: data.parentCategoryId || null,
    };
    return api.post("/api/BlogCategories", formattedData);
  },

  update: (id, data) => {
    const formattedData = {
      categoryName: data.categoryName,
      description: data.description,
      isActive: data.isActive || false,
      parentCategoryId: data.parentCategoryId || null,
    };
    return api.put(`/api/BlogCategories/${id}`, formattedData);
  },

  delete: (id) => {
    return api.delete(`/api/BlogCategories/${id}`);
  },

  getParentCategories: (id) => {
    return api.get(`/api/BlogCategories/parent-categories/${id}`);
  },
};

export default blogCategoryApi;
