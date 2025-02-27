import api from "../config/axios";

const blogApi = {
  getAll: () => {
    const url = "/Blog";
    return api.get(url);
  },

  getById: (id) => {
    const url = `/Blog/${id}`;
    return api.get(url);
  },

  create: (data) => {
    const url = "/Blog";
    const blogData = {
      title: data.title,
      content: data.content,
      authorName: data.authorName || "Admin",
      categoryName: data.categoryName,
      imageBlog: data.imageBlog || "",
      tags: data.tags || "",
      referenceSources: data.referenceSources || "",
    };
    return api.post(url, blogData);
  },

  update: (id, data) => {
    const url = `/Blog/${id}`;
    const blogData = {
      title: data.title,
      content: data.content,
      authorName: data.authorName || "Admin",
      categoryName: data.categoryName,
      imageBlog: data.imageBlog || "",
      tags: data.tags || "",
      referenceSources: data.referenceSources || "",
    };
    return api.put(url, blogData);
  },

  delete: (id) => {
    const url = `/Blog/${id}`;
    return api.delete(url);
  },
};

export default blogApi;
