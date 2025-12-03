import React from 'react';

const SearchBar = ({ value, onChange }) => {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{
        position: 'absolute',
        left: '16px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: 'var(--text-secondary)',
        pointerEvents: 'none'
      }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder="Search for 'Fever', 'Jvara', 'Diabetes'..."
        style={{
          width: '100%',
          padding: '16px 16px 16px 48px',
          fontSize: '1.1rem',
          borderRadius: 'var(--radius-xl)',
          border: '2px solid #e2e8f0',
          backgroundColor: 'white',
          boxShadow: 'var(--shadow-md)',
          transition: 'all 0.2s ease',
          color: 'var(--text-primary)'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--primary-color)';
          e.target.style.boxShadow = 'var(--shadow-lg)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#e2e8f0';
          e.target.style.boxShadow = 'var(--shadow-md)';
        }}
      />
    </div>
  );
};

export default SearchBar;