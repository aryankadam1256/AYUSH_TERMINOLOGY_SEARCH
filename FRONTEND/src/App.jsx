import React, { useState, useCallback } from 'react';
import { searchTerms } from './services/api';
import SearchBar from './components/SearchBar';
import ResultsList from './components/ResultsList';
import ChatInterface from './components/ChatInterface';
import debounce from 'lodash.debounce';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchResults = async (query) => {
    if (!query) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const data = await searchTerms(query);
      setResults(data);
    } catch (error) {
      console.error("Failed to fetch search results:", error);
      setResults([]);
    }
    setIsLoading(false);
  };

  const debouncedFetchResults = useCallback(debounce(fetchResults, 300), []);

  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchTerm(query);
    debouncedFetchResults(query);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header style={{
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid #e2e8f0',
        padding: '1rem 0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div className="app-container" style={{ padding: '0 2rem', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: 'var(--primary-color)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.2rem'
            }}>
              A
            </div>
            <h1 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--text-primary)' }}>
              Ayush <span style={{ color: 'var(--primary-light)' }}>Terminology</span>
            </h1>
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Medical Intelligence System
          </div>
        </div>
      </header>

      <main className="app-container">
        {/* Hero / Search Section */}
        <section style={{ textAlign: 'center', margin: '2rem 0' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Find Ayurvedic & Modern Medical Terms
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Search across NAMASTE, ICD-11, and more with AI-powered precision.
          </p>

          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <SearchBar value={searchTerm} onChange={handleSearchChange} />
          </div>
        </section>

        {/* Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>

          {/* Search Results */}
          {(results.length > 0 || isLoading) && (
            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem' }}>Search Results</h3>
                {isLoading && <span style={{ color: 'var(--primary-color)' }}>Searching...</span>}
              </div>
              <ResultsList results={results} />
            </section>
          )}

          {/* AI Assistant Section */}
          <section style={{ marginTop: '2rem' }}>
            <ChatInterface />
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;