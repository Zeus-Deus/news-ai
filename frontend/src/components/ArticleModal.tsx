import React from "react";
import { Article } from "../types/Article";

interface Props {
  article: Article;
  onClose: () => void;
}

const ArticleModal: React.FC<Props> = ({ article, onClose }) => {
  return (
    <div className="fixed inset-0 bg-[#020617] bg-opacity-95 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900/90 rounded-3xl shadow-premium max-w-4xl w-full max-h-[90vh] overflow-hidden animate-slide-up border border-secondary-100 dark:border-slate-800/60">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 dark:from-slate-800 dark:to-slate-700 text-white relative">
          {/* Hero Image */}
          {article.image_url && (
            <div className="h-48 md:h-64 overflow-hidden">
              <img
                src={article.image_url}
                alt={article.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            </div>
          )}

          <div
            className={`${
              article.image_url ? "absolute bottom-0 left-0 right-0 p-6" : "p-6"
            }`}
          >
            <button
              className={`absolute ${
                article.image_url ? "top-4" : "top-4"
              } right-4 w-10 h-10 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 hover:scale-105 transition-all duration-200 shadow-lg border-2 border-white border-opacity-50 z-10`}
              onClick={onClose}
            >
              <svg
                className="w-5 h-5 text-secondary-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="flex flex-wrap items-center gap-2 mb-4">
              <div className="bg-accent-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                AI Summarized
              </div>

              {article.categories && article.categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {article.categories.slice(0, 5).map((category) => (
                    <span
                      key={category}
                      className="px-3 py-1 text-xs font-semibold rounded-full bg-white/10 text-white border border-white/25"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <h2 className="text-2xl md:text-3xl font-display font-bold leading-tight pr-12">
              {article.title}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Summary */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-slate-100 mb-3 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                  clipRule="evenodd"
                />
              </svg>
              AI Summary
            </h3>
            <div className="bg-secondary-50 dark:bg-slate-800/60 rounded-xl p-6 border-l-4 border-primary-500/80 dark:border-primary-400/70 shadow-inner">
              <p className="text-secondary-700 dark:text-slate-200 leading-relaxed text-lg">
                {article.summary}
              </p>
            </div>
          </div>

          {/* Metadata */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-secondary-50 dark:bg-slate-900/70 rounded-xl p-5 border border-secondary-200 dark:border-slate-800">
              <h4 className="font-semibold text-secondary-900 dark:text-slate-100 mb-3 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
                Publication Details
              </h4>
              <div className="space-y-2 text-sm text-secondary-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span className="font-medium">Published:</span>
                  <span>
                    {new Date(article.published_at).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Time:</span>
                  <span>
                    {new Date(article.published_at).toLocaleTimeString(
                      "en-US",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Processed:</span>
                  <span>
                    {article.processed_at
                      ? new Date(article.processed_at).toLocaleDateString()
                      : "Not available"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-secondary-50 dark:bg-slate-900/70 rounded-xl p-5 border border-secondary-200 dark:border-slate-800">
              <h4 className="font-semibold text-secondary-900 dark:text-slate-100 mb-3 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                AI Processing
              </h4>
              <div className="space-y-2 text-sm text-secondary-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span className="font-medium">Model:</span>
                  <span className="text-xs bg-primary-100 dark:bg-primary-500/20 text-primary-800 dark:text-primary-200 px-2 py-1 rounded">
                    {article.ai_model_used || "Unknown"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Article ID:</span>
                  <span className="font-mono text-xs">{article.id}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Source Link */}
          <div className="bg-gradient-to-r from-secondary-50 to-secondary-100 dark:from-slate-900 dark:to-slate-800 rounded-xl p-5 border border-secondary-200 dark:border-slate-800">
            <h4 className="font-semibold text-secondary-900 dark:text-slate-100 mb-2 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0113.971 9h1.946zm-2.003-2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z"
                  clipRule="evenodd"
                />
              </svg>
              Original Source
            </h4>
            <a
              href={article.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-primary-600 dark:text-primary-300 hover:text-primary-700 dark:hover:text-primary-200 font-medium transition-colors"
            >
              <span className="truncate mr-2 text-sm md:text-base">
                {article.source_url}
              </span>
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleModal;
