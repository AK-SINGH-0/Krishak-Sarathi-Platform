import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { BsArrowUpRight, BsArrowDownRight, BsFilter, BsSearch } from 'react-icons/bs';
import './MarketPrices.css';

const MarketPrices = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const initialMarketData = [
    { id: 1, state: t('marketPrices.data.maharashtra'), market: t('marketPrices.data.pune'), commodity: t('marketPrices.data.wheat'), min: 2100, max: 2400, modal: 2250, trend: 'up' },
    { id: 2, state: t('marketPrices.data.maharashtra'), market: t('marketPrices.data.nashik'), commodity: t('marketPrices.data.onion'), min: 1200, max: 1800, modal: 1550, trend: 'down' },
    { id: 3, state: t('marketPrices.data.gujarat'), market: t('marketPrices.data.ahmedabad'), commodity: t('marketPrices.data.cotton'), min: 6500, max: 7200, modal: 6800, trend: 'up' },
    { id: 4, state: t('marketPrices.data.punjab'), market: t('marketPrices.data.ludhiana'), commodity: t('marketPrices.data.rice'), min: 3000, max: 3400, modal: 3200, trend: 'up' },
    { id: 5, state: t('marketPrices.data.karnataka'), market: t('marketPrices.data.bengaluru'), commodity: t('marketPrices.data.tomato'), min: 800, max: 1200, modal: 1000, trend: 'down' },
  ];

  const [prices, setPrices] = useState(initialMarketData);
  const [filterState, setFilterState] = useState(t('marketPrices.filters.all'));
  const [filterCommodity, setFilterCommodity] = useState(t('marketPrices.filters.all'));
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q) {
      setSearchTerm(q);
    }
  }, [location]);

  // Simulated Live Ticker & Price Fluctuations
  useEffect(() => {
    const timer = setInterval(() => {
      setPrices(prevPrices => prevPrices.map(item => {
        const change = Math.floor(Math.random() * 21) - 10;
        const newModal = item.modal + change;
        let newTrend = item.trend;
        if (change > 0) newTrend = 'up';
        if (change < 0) newTrend = 'down';

        return {
          ...item,
          modal: newModal,
          trend: newTrend
        };
      }));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const filteredPrices = prices.filter(item => {
    const matchesState = (filterState === t('marketPrices.filters.all') || item.state === filterState);
    const matchesComm = (filterCommodity === t('marketPrices.filters.all') || item.commodity === filterCommodity);
    const matchesSearch = !searchTerm || 
      item.commodity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.market.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.state.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesState && matchesComm && matchesSearch;
  });

  const uniqueStates = [t('marketPrices.filters.all'), ...new Set(initialMarketData.map(i => i.state))];
  const uniqueCommodities = [t('marketPrices.filters.all'), ...new Set(initialMarketData.map(i => i.commodity))];

  return (
    <div className="market-page">
      {/* Live Ticker */}
      <div className="ticker-container">
        <div className="ticker-title">{t('marketPrices.tickerTitle')}</div>
        <div className="ticker-wrap">
          <div className="ticker-move">
            {prices.map(item => (
              <div className="ticker-item" key={item.id}>
                <span className="ticker-commodity">{item.commodity} ({item.market}):</span> 
                <span className={`ticker-price ${item.trend === 'up' ? 'text-green' : 'text-red'}`}>
                  ₹{item.modal} {item.trend === 'up' ? '▲' : '▼'}
                </span>
              </div>
            ))}
            {/* Duplicate for seamless scrolling */}
            {prices.map(item => (
              <div className="ticker-item" key={item.id + '_dup'}>
                <span className="ticker-commodity">{item.commodity} ({item.market}):</span> 
                <span className={`ticker-price ${item.trend === 'up' ? 'text-green' : 'text-red'}`}>
                  ₹{item.modal} {item.trend === 'up' ? '▲' : '▼'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: '40px' }}>
        <div className="section-header">
          <h2>{t('marketPrices.title')}</h2>
          <p className="text-muted">{t('marketPrices.subtitle')}</p>
        </div>

        {/* Filters */}
        <div className="filters-container glass-panel">
          <div className="search-group" style={{ flex: '1', minWidth: '220px' }}>
            <label><BsSearch /> {t('marketPrices.searchLabel')}</label>
            <input 
              type="text" 
              placeholder={t('marketPrices.searchPlaceholder')} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-input"
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)' }}
            />
          </div>
          <div className="filter-group">
            <label><BsFilter /> {t('marketPrices.filters.state')}</label>
            <select value={filterState} onChange={(e) => setFilterState(e.target.value)}>
              {uniqueStates.map(state => <option key={state} value={state}>{state}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label><BsFilter /> {t('marketPrices.filters.commodity')}</label>
            <select value={filterCommodity} onChange={(e) => setFilterCommodity(e.target.value)}>
              {uniqueCommodities.map(comm => <option key={comm} value={comm}>{comm}</option>)}
            </select>
          </div>
        </div>

        {/* Prices Table */}
        <div className="table-container glass-panel mt-4">
          <table className="market-table">
            <thead>
              <tr>
                <th>{t('marketPrices.table.commodity')}</th>
                <th>{t('marketPrices.table.stateMarket')}</th>
                <th>{t('marketPrices.table.minPrice')}</th>
                <th>{t('marketPrices.table.maxPrice')}</th>
                <th>{t('marketPrices.table.liveModal')}</th>
                <th>{t('marketPrices.table.trend')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredPrices.length > 0 ? (
                filteredPrices.map((item) => (
                  <tr key={item.id}>
                    <td className="font-bold">{item.commodity}</td>
                    <td>{item.market}, {item.state}</td>
                    <td className="text-muted">{item.min}</td>
                    <td className="text-muted">{item.max}</td>
                    <td className="live-price-cell">
                      <span className="live-pulse"></span>
                      ₹{item.modal}
                    </td>
                    <td>
                      <span className={`trend-badge ${item.trend}`}>
                        {item.trend === 'up' ? <BsArrowUpRight /> : <BsArrowDownRight />}
                        {item.trend === 'up' ? t('marketPrices.table.rising') : t('marketPrices.table.falling')}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4">{t('marketPrices.table.noData')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MarketPrices;
