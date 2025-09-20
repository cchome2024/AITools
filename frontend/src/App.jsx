import NewsDashboard from './components/NewsDashboard.jsx';

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__content">
          <h1>Market News Pulse</h1>
          <p className="app-subtitle">
            Track market-moving headlines, impacted tickers, and actionable insights
            throughout the trading day.
          </p>
        </div>
      </header>
      <main className="app-main">
        <NewsDashboard />
      </main>
      <footer className="app-footer">
        <p>
          Configure <code>VITE_NEWS_API_URL</code> to point at your analytics backend or
          rely on the built-in sample data while prototyping.
        </p>
      </footer>
    </div>
  );
}

export default App;
