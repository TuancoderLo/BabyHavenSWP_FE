import api from "../config/axios";

const blogCategoryApi = {
  getAll: () => {
    return api.get("BlogCategories");
  },

  getById: (id) => {
    return api.get(`BlogCategories/${id}`);
  },

  create: (data) => {
    console.log("Data before sending:", data);

    // Format data theo đúng yêu cầu của API
    const formattedData = {
      categoryName: data.categoryName?.trim(),
      description: data.description?.trim() || "",
      parentCategoryId: data.parentCategoryId || null,
      isActive: true,
    };

    console.log("Formatted data:", formattedData);

    return api.post("BlogCategories", formattedData);
  },

  update: (id, data) => {
    console.log("Update data:", { id, data });

    const formattedData = {
      categoryId: id,
      categoryName: data.categoryName?.trim(),
      description: data.description?.trim() || "",
      parentCategoryId: data.parentCategoryId || null,
      isActive: data.isActive === undefined ? true : data.isActive,
    };

    console.log("Formatted update data:", formattedData);
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
