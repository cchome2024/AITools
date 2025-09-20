import { useCallback, useEffect, useMemo, useState } from 'react';
import NewsList from './NewsList.jsx';
import PaginationControls from './PaginationControls.jsx';
import RefreshButton from './RefreshButton.jsx';
import StatusBanner from './StatusBanner.jsx';
import '../components/dashboard.css';

const API_URL = import.meta.env.VITE_NEWS_API_URL || '/api/news';
const ITEMS_PER_PAGE = 5;

const SAMPLE_NEWS = [
  {
    id: 'sample-1',
    headline: 'Federal Reserve hints at slower pace of rate hikes',
    summary:
      'Federal Reserve officials signaled that future rate moves will depend on inflation data, boosting risk assets in afternoon trading.',
    tickers: ['SPY', 'QQQ', 'TLT'],
    actions: ['Review hedging plan', 'Increase tech exposure'],
    sentiment: 'Positive',
    source: 'Bloomberg',
    publishedAt: '2024-02-12T14:10:00Z',
    url: '#'
  },
  {
    id: 'sample-2',
    headline: 'Oil prices slide as OPEC+ output increases',
    summary:
      'Crude futures dropped more than 3% after OPEC+ flagged higher production guidance for the next quarter.',
    tickers: ['CL=F', 'XOM', 'CVX'],
    actions: ['Tighten stop losses', 'Monitor inventory report'],
    sentiment: 'Negative',
    source: 'Reuters',
    publishedAt: '2024-02-12T13:45:00Z',
    url: '#'
  },
  {
    id: 'sample-3',
    headline: 'Semiconductor demand outlook raised by major foundry',
    summary:
      'TSMC increased its full-year revenue forecast citing robust AI chip demand and easing supply bottlenecks.',
    tickers: ['TSM', 'NVDA', 'AMD'],
    actions: ['Evaluate supplier exposure', 'Add to AI basket'],
    sentiment: 'Positive',
    source: 'The Wall Street Journal',
    publishedAt: '2024-02-12T13:20:00Z',
    url: '#'
  },
  {
    id: 'sample-4',
    headline: 'Airline sector pressured by rising jet fuel costs',
    summary:
      'Major U.S. carriers warned that elevated fuel prices could compress margins during peak travel season.',
    tickers: ['DAL', 'UAL', 'LUV'],
    actions: ['Trim overweight positions', 'Revisit hedging coverage'],
    sentiment: 'Negative',
    source: 'CNBC',
    publishedAt: '2024-02-12T12:55:00Z',
    url: '#'
  },
  {
    id: 'sample-5',
    headline: 'Biotech ETF surges on FDA fast-track approvals',
    summary:
      'FDA accelerated multiple oncology therapies, lifting biotech names with active pipelines.',
    tickers: ['XBI', 'MRNA', 'VRTX'],
    actions: ['Screen high-sentiment names', 'Alert healthcare analyst'],
    sentiment: 'Positive',
    source: 'MarketWatch',
    publishedAt: '2024-02-12T12:35:00Z',
    url: '#'
  },
  {
    id: 'sample-6',
    headline: 'Cloud software cohort dips on cautious enterprise guidance',
    summary:
      'Enterprise CIO survey highlighted a modest slowdown in SaaS seat expansion for the next two quarters.',
    tickers: ['CRM', 'NOW', 'TEAM'],
    actions: ['Hold neutral allocation', 'Check renewals pipeline'],
    sentiment: 'Neutral',
    source: 'Gartner',
    publishedAt: '2024-02-12T12:10:00Z',
    url: '#'
  },
  {
    id: 'sample-7',
    headline: 'U.S. dollar retreats as inflation expectations cool',
    summary:
      'DXY softened after breakeven inflation expectations declined, supporting multinational earnings outlooks.',
    tickers: ['DXY', 'EEM', 'GLD'],
    actions: ['Assess FX hedges', 'Update macro dashboard'],
    sentiment: 'Positive',
    source: 'Financial Times',
    publishedAt: '2024-02-12T11:45:00Z',
    url: '#'
  },
  {
    id: 'sample-8',
    headline: 'Consumer staples outperform amid defensive rotation',
    summary:
      'Staples stocks gained as investors rotated into lower-volatility names ahead of earnings season.',
    tickers: ['XLP', 'PG', 'KO'],
    actions: ['Maintain defensive tilt', 'Rebalance sector ETF weights'],
    sentiment: 'Neutral',
    source: 'Bloomberg',
    publishedAt: '2024-02-12T11:15:00Z',
    url: '#'
  },
  {
    id: 'sample-9',
    headline: 'Auto makers rally on EV tax credit clarity',
    summary:
      'Treasury Department finalized EV tax credit rules, removing uncertainty for manufacturers with U.S. assembly.',
    tickers: ['TSLA', 'GM', 'F'],
    actions: ['Re-rate EV basket', 'Share client commentary'],
    sentiment: 'Positive',
    source: 'Associated Press',
    publishedAt: '2024-02-12T10:55:00Z',
    url: '#'
  },
  {
    id: 'sample-10',
    headline: 'European banks extend gains on capital return plans',
    summary:
      'Large European lenders announced share buybacks and dividend hikes following stress test results.',
    tickers: ['DB', 'HSBC', 'SAN'],
    actions: ['Monitor cross-border exposure', 'Update regional dashboard'],
    sentiment: 'Positive',
    source: 'Bloomberg Europe',
    publishedAt: '2024-02-12T10:35:00Z',
    url: '#'
  }
];

function normalizeNews(payload) {
  if (!payload) {
    return [];
  }

  const items = Array.isArray(payload)
    ? payload
    : payload.items || payload.data || payload.results || [];

  return items
    .filter(Boolean)
    .map((item, index) => {
      const tickers = item.tickers || item.impactedTickers || item.symbols || [];
      const actions = item.actions || item.recommendedActions || item.playbook || [];

      return {
        id: item.id ?? item.uuid ?? `${item.headline ?? item.title ?? 'story'}-${index}`,
        headline: item.headline || item.title || 'Untitled story',
        summary: item.summary || item.description || '',
        tickers: Array.isArray(tickers) ? tickers : String(tickers).split(/[,\s]+/),
        actions: Array.isArray(actions) ? actions : String(actions).split(/[,\s]+/),
        sentiment: item.sentiment || item.sentimentScore || 'Neutral',
        source: item.source || item.publisher || 'Unknown source',
        publishedAt: item.publishedAt || item.time || item.timestamp || new Date().toISOString(),
        url: item.url || item.link || '#'
      };
    });
}

function formatUpdatedAt(date) {
  if (!date) {
    return '—';
  }

  const relativeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const now = new Date();
  const deltaSeconds = Math.round((date.getTime() - now.getTime()) / 1000);
  const deltaMinutes = Math.round(deltaSeconds / 60);

  if (Math.abs(deltaSeconds) < 60) {
    return 'just now';
  }

  if (Math.abs(deltaMinutes) < 60) {
    return relativeFormatter.format(deltaMinutes, 'minute');
  }

  const deltaHours = Math.round(deltaMinutes / 60);
  if (Math.abs(deltaHours) < 24) {
    return relativeFormatter.format(deltaHours, 'hour');
  }

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}

function NewsDashboard() {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [usingSampleData, setUsingSampleData] = useState(false);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(API_URL, {
        headers: {
          Accept: 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const payload = await response.json();
      const normalized = normalizeNews(payload).slice(0, 10);

      if (normalized.length === 0) {
        throw new Error('Empty response body');
      }

      setNewsItems(normalized);
      setUsingSampleData(false);
      setLastUpdated(new Date());
      setCurrentPage(0);
    } catch (err) {
      console.error('Failed to load news feed:', err);
      setError('Live data unavailable — displaying sample headlines.');
      setNewsItems(SAMPLE_NEWS);
      setUsingSampleData(true);
      setLastUpdated(new Date());
      setCurrentPage(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(newsItems.length / ITEMS_PER_PAGE));
  }, [newsItems.length]);

  const paginatedItems = useMemo(() => {
    const start = currentPage * ITEMS_PER_PAGE;
    return newsItems.slice(start, start + ITEMS_PER_PAGE);
  }, [newsItems, currentPage]);

  const handlePageChange = useCallback(
    (direction) => {
      setCurrentPage((prev) => {
        if (direction === 'next') {
          return Math.min(prev + 1, totalPages - 1);
        }
        if (direction === 'prev') {
          return Math.max(prev - 1, 0);
        }
        return prev;
      });
    },
    [totalPages]
  );

  return (
    <section className="dashboard">
      <div className="dashboard__toolbar">
        <div>
          <h2>Top 10 Intraday Headlines</h2>
          <p className="dashboard__subtitle">
            Ranked by estimated market impact across monitored tickers.
          </p>
        </div>
        <div className="dashboard__toolbar-actions">
          <RefreshButton onClick={fetchNews} loading={loading} />
        </div>
      </div>

      <div className="dashboard__meta">
        <span>
          Last updated <strong>{formatUpdatedAt(lastUpdated)}</strong>
        </span>
        {usingSampleData && <span className="dashboard__badge">Sample data</span>}
      </div>

      <StatusBanner loading={loading} error={error} />

      <NewsList items={paginatedItems} loading={loading && newsItems.length === 0} />

      <PaginationControls
        page={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </section>
  );
}

export default NewsDashboard;
