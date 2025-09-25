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
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const data = await getArticles(20, 0);
        setArticles(data);
        setFilteredArticles(data);
        setHasMore(data.length === 20); // If we got exactly 20, there might be more
      } catch (err) {
        setError("Failed to load articles");
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const loadMoreArticles = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const data = await getArticles(20, articles.length);
      if (data.length === 0) {
        setHasMore(false);
      } else {
        const newArticles = [...articles, ...data];
        setArticles(newArticles);
        setFilteredArticles(newArticles);
        setHasMore(data.length === 20);
      }
    } catch (err) {
      setError("Failed to load more articles");
    } finally {
      setLoadingMore(false);
    }
  };

  // Combined filtering logic for search and category
  useEffect(() => {
    let filtered = articles;

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter((article) =>
        article.categories?.includes(selectedCategory)
      );
    }

    // Apply search filter
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.summary.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredArticles(filtered);
  }, [searchQuery, articles, selectedCategory]);

  const handleCategoryFilter = (category: string | null) => {
    setSelectedCategory(category);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-[#020617] font-sans animate-fade-in transition-colors duration-300">
      <Header
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        onCategoryFilter={handleCategoryFilter}
        selectedCategory={selectedCategory}
      />
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-display font-semibold text-secondary-900 dark:text-slate-100 mb-2">
              {searchQuery
                ? `Search Results for "${searchQuery}"`
                : selectedCategory
                ? `${selectedCategory} News`
                : "Latest Articles"}
            </h2>
            <p className="text-secondary-600 dark:text-slate-400 text-sm">
              {searchQuery
                ? `Found ${filteredArticles.length} article${
                    filteredArticles.length !== 1 ? "s" : ""
                  } matching your search`
                : selectedCategory
                ? `Showing ${
                    filteredArticles.length
                  } ${selectedCategory.toLowerCase()} article${
                    filteredArticles.length !== 1 ? "s" : ""
                  }`
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

          {/* Load More Button - Only show when not filtering by category */}
          {!searchQuery && !selectedCategory && hasMore && !loading && (
            <div className="flex justify-center mt-12">
              <button
                onClick={loadMoreArticles}
                disabled={loadingMore}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                {loadingMore ? (
                  <>
                    <LoadingSpinner />
                    Loading...
                  </>
                ) : (
                  "Load More Articles"
                )}
              </button>
            </div>
          )}

          {!searchQuery && !hasMore && articles.length > 0 && (
            <div className="text-center mt-12 text-secondary-600 dark:text-slate-400">
              You've reached the end of the articles
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
