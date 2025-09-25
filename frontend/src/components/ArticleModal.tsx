import React from "react";
import { Article } from "../types/Article";

interface Props {
  article: Article;
  onClose: () => void;
}

const ArticleModal: React.FC<Props> = ({ article, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg max-w-2xl w-full mx-4">
        <button
          className="float-right text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4">{article.title}</h2>
        <p className="text-gray-600 mb-4">{article.summary}</p>
        <div className="text-sm text-gray-500 mb-2">
          Published: {new Date(article.published_at).toLocaleString()}
        </div>
        <div className="text-sm text-gray-500 mb-2">
          Source:{" "}
          <a
            href={article.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {article.source_url}
          </a>
        </div>
        {article.ai_model_used && (
          <div className="text-sm text-gray-500">
            Processed by: {article.ai_model_used}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleModal;
