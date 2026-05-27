'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="uk">
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}>
          <div style={{
            textAlign: 'center',
            color: 'white',
            maxWidth: '600px',
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '3rem 2rem',
            borderRadius: '16px',
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💥</div>
            <h1 style={{ fontSize: '2rem', fontWeight: 600, margin: '0 0 1rem' }}>
              Критична помилка
            </h1>
            <p style={{ fontSize: '1.125rem', margin: '0 0 2rem', opacity: 0.95 }}>
              Виникла критична помилка додатку. Будь ласка, оновіть сторінку.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={reset}
                style={{
                  padding: '0.875rem 2rem',
                  borderRadius: '8px',
                  fontWeight: 500,
                  fontSize: '1rem',
                  border: 'none',
                  cursor: 'pointer',
                  background: 'white',
                  color: '#667eea',
                  transition: 'all 0.2s',
                }}
              >
                Спробувати знову
              </button>
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  padding: '0.875rem 2rem',
                  borderRadius: '8px',
                  fontWeight: 500,
                  fontSize: '1rem',
                  textDecoration: 'none',
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  border: '2px solid white',
                  display: 'inline-block',
                  cursor: 'pointer',
                }}
              >
                На головну
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
