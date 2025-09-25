import React, { useState, useEffect } from "react";
import "./App.css";
import Header from "./components/Header";
import ArticleCard from "./components/ArticleCard";
import ArticleModal from "./components/ArticleModal";
import LoadingSpinner from "./components/LoadingSpinner";
import { getArticles } from "./services/api";
import { Article } from "./types/Article";

const App: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const data = await getArticles(20, 0);
        setArticles(data);
        setFilteredArticles(data);
      } catch (err) {
        setError("Failed to load articles");
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredArticles(articles);
    } else {
      const filtered = articles.filter((article) =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredArticles(filtered);
    }
  }, [searchQuery, articles]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-[#020617] font-sans animate-fade-in transition-colors duration-300">
      <Header onSearch={setSearchQuery} searchQuery={searchQuery} />
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-display font-semibold text-secondary-900 dark:text-slate-100 mb-2">
              {searchQuery
                ? `Search Results for "${searchQuery}"`
                : "Latest Articles"}
            </h2>
            <p className="text-secondary-600 dark:text-slate-400 text-sm">
              {searchQuery
                ? `Found ${filteredArticles.length} article${
                    filteredArticles.length !== 1 ? "s" : ""
                  } matching your search`
                : "Discover AI-summarized news from trusted sources around the world"}
            </p>
          </div>

          {filteredArticles.length === 0 && searchQuery ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-secondary-900 dark:text-slate-100 mb-2">
                No articles found
              </h3>
              <p className="text-secondary-600 dark:text-slate-400">
                Try adjusting your search terms
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map((article, index) => (
                <div
                  key={article.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ArticleCard
                    article={article}
                    onClick={() => setSelectedArticle(article)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      {selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </div>
  );
};

export default App;
