import React from 'react';

const ResultsList = ({ results }) => {
  if (!results || results.length === 0) {
    return null;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
      {results.map((result, index) => (
        <div key={index} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <h4 style={{ fontSize: '1.1rem', color: 'var(--primary-dark)', margin: 0 }}>
              {result.primary_term || result.name || 'Unknown Term'}
            </h4>
            <span className="badge badge-primary">
              {result.code}
            </span>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Source: <span style={{ fontWeight: 600 }}>{result.source || 'Unknown'}</span>
          </div>

          {result.definition && (
            <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: '1.6' }}>
              {result.definition.length > 150
                ? result.definition.substring(0, 150) + '...'
                : result.definition}
            </p>
          )}

          {result.synonyms && (
            <div style={{ marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Synonyms:
              </span>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontStyle: 'italic' }}>
                {result.synonyms}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ResultsList;