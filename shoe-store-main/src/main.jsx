import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error('[VibeFlow ErrorBoundary]', error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh', background: '#09090b', color: '#fff',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '2rem', fontFamily: 'monospace'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ color: '#c6f500', marginBottom: '0.5rem' }}>Lỗi Render</h2>
          <pre style={{
            background: '#1a1a1a', border: '1px solid #333', borderRadius: '12px',
            padding: '1rem', maxWidth: '600px', width: '100%',
            overflowX: 'auto', color: '#f87171', fontSize: '12px'
          }}>
            {this.state.error?.message}
            {'\n'}
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => this.setState({ error: null })}
            style={{
              marginTop: '1rem', padding: '0.5rem 1.5rem',
              background: '#c6f500', color: '#000', fontWeight: 'bold',
              border: 'none', borderRadius: '8px', cursor: 'pointer'
            }}
          >
            Thử lại
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
