import React from "react";
import { Article } from "../types/Article";

interface Props {
  article: Article;
  onClick: () => void;
}

const ArticleCard: React.FC<Props> = ({ article, onClick }) => {
  return (
    <div
      className="bg-white dark:bg-slate-900/80 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer transform hover:-translate-y-1 animate-slide-up border border-secondary-200 dark:border-slate-800/60 overflow-hidden backdrop-blur-sm"
      onClick={onClick}
    >
      {/* Image placeholder */}
      <div className="h-40 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
        <div className="text-primary-500 dark:text-slate-200 text-4xl opacity-60">
          📰
        </div>
      </div>

      <div className="p-6">
        <h2 className="text-xl font-semibold mb-3 text-secondary-900 dark:text-slate-100 line-clamp-2 hover:text-primary-600 dark:hover:text-primary-300 transition-colors">
          {article.title}
        </h2>

        <p className="text-secondary-600 dark:text-slate-400 mb-4 line-clamp-3 leading-relaxed">
          {article.summary.substring(0, 150)}...
        </p>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-secondary-500 dark:text-slate-500">
            <svg
              className="w-4 h-4 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                clipRule="evenodd"
              />
            </svg>
            {new Date(article.published_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>

          <div className="flex items-center text-primary-600 dark:text-primary-300 text-xs font-medium">
            <svg
              className="w-3 h-3 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            AI Summarized
          </div>
        </div>

        {/* Read more indicator */}
        <div className="mt-4 pt-4 border-t border-secondary-100 dark:border-slate-700">
          <div className="flex items-center text-primary-600 dark:text-primary-300 text-sm font-medium">
            <span>Read full article</span>
            <svg
              className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
