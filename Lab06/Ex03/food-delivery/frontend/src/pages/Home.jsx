import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { restaurantAPI } from '../services/api';
import './Home.css';

const CUISINES = ['Tất cả', 'Vietnamese', 'Italian', 'Japanese', 'Korean', 'Thai'];

function formatCurrency(n) {
  return new Intl.NumberFormat('vi-VN').format(n) + '₫';
}

export default function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cuisine, setCuisine] = useState('Tất cả');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = {};
        if (search) params.search = search;
        if (cuisine !== 'Tất cả') params.cuisine = cuisine;
        const res = await restaurantAPI.getAll(params);
        setRestaurants(res.data);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, [search, cuisine]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  return (
    <div className="home page-enter">
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-tag badge badge-orange">Giao hàng trong 30 phút ⚡</div>
            <h1 className="hero-title">
              Đói bụng?<br />
              <span className="highlight">Chúng tôi lo.</span>
            </h1>
            <p className="hero-sub">Hàng trăm nhà hàng ngon, giao tận nơi trong tích tắc.</p>
            <form onSubmit={handleSearch} className="search-bar">
              <span className="search-icon">🔍</span>
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Tìm món ăn hoặc nhà hàng..."
                className="search-input"
              />
              <button type="submit" className="btn btn-primary search-btn">Tìm</button>
            </form>
          </div>
          <div className="hero-visual">
            <div className="food-blob">🍜</div>
          </div>
        </div>
      </section>

      {/* Cuisine Filter */}
      <section className="filter-section">
        <div className="container">
          <div className="filter-chips">
            {CUISINES.map(c => (
              <button
                key={c}
                onClick={() => setCuisine(c)}
                className={`chip ${cuisine === c ? 'active' : ''}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Restaurants */}
      <section className="restaurants-section">
        <div className="container">
          <div className="section-header">
            <h2>{search ? `Kết quả cho "${search}"` : 'Nhà hàng nổi bật'}</h2>
            {restaurants.length > 0 && <span className="count">{restaurants.length} nhà hàng</span>}
          </div>

          {loading ? (
            <div className="loading-grid">
              {[1,2,3,4].map(i => <div key={i} className="skeleton-card" />)}
            </div>
          ) : restaurants.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <p>Không tìm thấy nhà hàng phù hợp</p>
            </div>
          ) : (
            <div className="restaurants-grid">
              {restaurants.map(r => (
                <Link to={`/restaurant/${r.id}`} key={r.id} className="restaurant-card">
                  <div className="card-img-wrap">
                    <img
                      src={r.image_url || `https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400`}
                      alt={r.name}
                      className="card-img"
                      onError={e => e.target.src = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400'}
                    />
                    <div className="card-badge">{r.cuisine_type}</div>
                    {!r.is_open && <div className="closed-overlay">Đóng cửa</div>}
                  </div>
                  <div className="card-body">
                    <h3 className="card-title">{r.name}</h3>
                    <p className="card-desc">{r.description}</p>
                    <div className="card-meta">
                      <span className="meta-item">
                        <span>⭐</span> {r.rating}
                      </span>
                      <span className="meta-sep">·</span>
                      <span className="meta-item">🕐 {r.delivery_time} phút</span>
                      <span className="meta-sep">·</span>
                      <span className="meta-item">Tối thiểu {formatCurrency(r.min_order)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
