import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

export const getArticles = async (limit: number = 20, offset: number = 0) => {
  const response = await axios.get(`${API_URL}/articles`, {
    params: { limit, offset },
  });
  return response.data;
};

export const getArticle = async (id: number) => {
  const response = await axios.get(`${API_URL}/articles/${id}`);
  return response.data;
};
