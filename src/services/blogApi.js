import api from "../config/axios";

const blogApi = {
  getAll: () => {
    return api.get("Blog");
  },

  getById: (id) => {
    return api.get(`Blog/${id}`);
  },

  create: (data) => {
    console.log("Creating blog with data:", data);
    const blogData = {
      title: data.title?.trim(),
      content: data.content?.trim(),
      categoryId: data.categoryId,
      categoryName: data.categoryName?.trim(),
      authorName: data.authorName || "Admin",
      imageBlog: data.imageBlog?.trim() || "",
      tags: data.tags?.trim() || "",
      referenceSources: data.referenceSources?.trim() || "",
      status: data.status || "Draft",
    };
    console.log("Formatted create blog data:", blogData);
    return api.post("Blog", blogData);
  },

  update: (id, data) => {
    console.log("Updating blog with data:", { id, data });
    const blogData = {
      blogId: id,
      title: data.title?.trim(),
      content: data.content?.trim(),
      categoryId: data.categoryId,
      categoryName: data.categoryName?.trim(),
      authorName: data.authorName || "Admin",
      imageBlog: data.imageBlog?.trim() || "",
      tags: data.tags?.trim() || "",
      referenceSources: data.referenceSources?.trim() || "",
      status: data.status || "Draft",
    };
    console.log("Formatted update blog data:", blogData);
    return api.put(`Blog/${id}`, blogData);
  },

  delete: (id) => {
    return api.delete(`Blog/${id}`);
  },

  getByCategoryId: (categoryId) => {
    return api.get(`Blog/blogs/${categoryId}`);
  },
};

export default blogApi;
