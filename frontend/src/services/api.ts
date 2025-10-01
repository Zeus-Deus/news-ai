import axios from "axios";

// Gebruik relatieve URLs - React proxy stuurt dit door naar http://api:8000
// Dit betekent dat de API niet publiek toegankelijk hoeft te zijn
const API_URL = "";

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
