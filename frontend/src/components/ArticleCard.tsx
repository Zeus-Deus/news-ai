import React from "react";
import { Article } from "../types/Article";

interface Props {
  article: Article;
  onClick: () => void;
}

const ArticleCard: React.FC<Props> = ({ article, onClick }) => {
  return (
    <div
      className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <h2 className="text-xl font-semibold mb-2">{article.title}</h2>
      <p className="text-gray-600 mb-4">
        {article.summary.substring(0, 150)}...
      </p>
      <div className="text-sm text-gray-500">
        {new Date(article.published_at).toLocaleDateString()}
      </div>
    </div>
  );
};

export default ArticleCard;
