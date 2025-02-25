import api from "../config/axios";

const blogCategoryApi = {
  getAll: () => {
    return api.get("BlogCategories");
  },

  getById: (id) => {
    return api.get(`BlogCategories/${id}`);
  },

  create: (data) => {
    const formattedData = {
      categoryName: data.categoryName,
      description: data.description || "",
      isActive: data.isActive === undefined ? true : data.isActive,
      parentCategoryId: data.parentCategoryId || null,
    };
    return api.post("BlogCategories", formattedData);
  },

  update: (id, data) => {
    const formattedData = {
      categoryId: id,
      categoryName: data.categoryName,
      description: data.description,
      isActive: data.isActive,
      parentCategoryId: data.parentCategoryId || null,
    };
    return api.put(`BlogCategories/${id}`, formattedData);
  },

  delete: (id) => {
    return api.delete(`BlogCategories/${id}`);
  },

  getParentCategories: (id) => {
    return api.get(`BlogCategories/parent-categories/${id}`);
  },
};

export default blogCategoryApi;
