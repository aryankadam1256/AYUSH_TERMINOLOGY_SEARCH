import React, { useState } from 'react';
import { chatWithAI } from '../services/api';

const ChatInterface = () => {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setError(null);
        setResponse(null);

        try {
            const data = await chatWithAI(query);
            setResponse(data);
        } catch (err) {
            setError('Failed to get response. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            {/* Chat Header */}
            <div style={{
                backgroundColor: 'var(--primary-color)',
                padding: '1.5rem',
                color: 'white'
            }}>
                <h2 style={{ fontSize: '1.25rem', margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    Medical AI Companion
                </h2>
                <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9, fontSize: '0.9rem' }}>
                    Ask complex questions about symptoms, diseases, and Ayurvedic correlations.
                </p>
            </div>

            {/* Chat Body */}
            <div style={{ padding: '1.5rem', minHeight: '300px', backgroundColor: '#f8fafc' }}>

                {/* Input Area */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Ask a question (e.g., 'What is the Ayurvedic treatment for fever?')"
                        style={{
                            flex: 1,
                            padding: '12px 16px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid #cbd5e1',
                            fontSize: '1rem',
                            boxShadow: 'var(--shadow-sm)'
                        }}
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: 'var(--accent-color)',
                            color: 'white',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: 600,
                            opacity: isLoading ? 0.7 : 1
                        }}
                    >
                        {isLoading ? 'Thinking...' : 'Ask'}
                    </button>
                </form>

                {error && (
                    <div style={{ padding: '1rem', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                        {error}
                    </div>
                )}

                {/* Response Area */}
                {response && (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                        {/* AI Answer Bubble */}
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{
                                minWidth: '40px', height: '40px',
                                backgroundColor: 'var(--primary-light)',
                                borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', fontWeight: 'bold'
                            }}>
                                AI
                            </div>
                            <div style={{
                                backgroundColor: 'white',
                                padding: '1.5rem',
                                borderRadius: '0 var(--radius-lg) var(--radius-lg) var(--radius-lg)',
                                boxShadow: 'var(--shadow-sm)',
                                border: '1px solid #e2e8f0',
                                flex: 1
                            }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--primary-dark)' }}>Analysis</h3>
                                <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7', color: 'var(--text-primary)' }}>{response.answer}</p>
                            </div>
                        </div>

                        {/* Sources / Citations */}
                        {response.sources && response.sources.length > 0 && (
                            <div style={{ marginLeft: '3.5rem' }}>
                                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                                    Referenced Medical Codes
                                </h4>
                                <div style={{ display: 'grid', gap: '0.75rem' }}>
                                    {response.sources.map((source, index) => (
                                        <div key={index} style={{
                                            backgroundColor: 'var(--secondary-color)',
                                            padding: '1rem',
                                            borderRadius: 'var(--radius-md)',
                                            border: '1px solid #ccfbf1',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <div>
                                                <strong style={{ color: 'var(--primary-dark)' }}>{source.primary_term}</strong>
                                                <span style={{ margin: '0 0.5rem', color: '#94a3b8' }}>|</span>
                                                <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{source.code}</span>
                                            </div>
                                            <span className="badge" style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', color: 'var(--text-secondary)' }}>
                                                {source.source}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatInterface;
