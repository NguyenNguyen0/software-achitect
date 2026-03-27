import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { restaurantAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Restaurant.css';

function formatCurrency(n) {
  return new Intl.NumberFormat('vi-VN').format(n) + '₫';
}

export default function Restaurant() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items: cartItems, addItem, removeItem, total, count, restaurantId } = useCart();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    restaurantAPI.getById(id)
      .then(res => {
        setRestaurant(res.data);
        if (res.data.categories?.length) setActiveCategory(res.data.categories[0].id);
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id]);

  const getQty = (itemId) => cartItems.find(i => i.id === itemId)?.qty || 0;

  const handleAdd = (item) => {
    if (!user) return navigate('/login');
    addItem(item, { id: restaurant.id, name: restaurant.name });
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  );
  if (!restaurant) return null;

  const categories = restaurant.categories || [];
  const activeItems = categories.find(c => c.id === activeCategory)?.items || [];

  return (
    <div className="restaurant-page page-enter">
      {/* Cover */}
      <div className="restaurant-cover">
        <img
          src={restaurant.image_url || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200'}
          alt={restaurant.name}
          onError={e => e.target.src = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200'}
        />
        <div className="cover-overlay" />
        <div className="cover-content container">
          <button onClick={() => navigate(-1)} className="back-btn">← Quay lại</button>
          <div className="restaurant-info">
            <span className="cuisine-tag">{restaurant.cuisine_type}</span>
            <h1>{restaurant.name}</h1>
            <p className="r-desc">{restaurant.description}</p>
            <div className="r-meta">
              <span>⭐ {restaurant.rating}</span>
              <span>🕐 {restaurant.delivery_time} phút</span>
              <span>📦 Tối thiểu {formatCurrency(restaurant.min_order)}</span>
              {!restaurant.is_open && <span className="closed-tag">Đóng cửa</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="container menu-layout">
        {/* Menu */}
        <div className="menu-main">
          {/* Category tabs */}
          <div className="category-tabs">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`cat-tab ${activeCategory === cat.id ? 'active' : ''}`}
              >
                {cat.name}
                <span className="cat-count">{cat.items?.length || 0}</span>
              </button>
            ))}
          </div>

          {/* Items */}
          <div className="menu-items">
            {activeItems.map(item => {
              const qty = getQty(item.id);
              return (
                <div key={item.id} className={`menu-item-card ${!item.is_available ? 'unavailable' : ''}`}>
                  {item.image_url && (
                    <img
                      src={item.image_url} alt={item.name} className="item-img"
                      onError={e => e.target.style.display = 'none'}
                    />
                  )}
                  <div className="item-info">
                    <h3 className="item-name">{item.name}</h3>
                    {item.description && <p className="item-desc">{item.description}</p>}
                    <div className="item-footer">
                      <span className="item-price">{formatCurrency(item.price)}</span>
                      {item.is_available ? (
                        qty === 0 ? (
                          <button onClick={() => handleAdd(item)} className="add-btn">+ Thêm</button>
                        ) : (
                          <div className="qty-ctrl">
                            <button onClick={() => removeItem(item.id)} className="qty-btn minus">−</button>
                            <span className="qty-num">{qty}</span>
                            <button onClick={() => handleAdd(item)} className="qty-btn plus">+</button>
                          </div>
                        )
                      ) : (
                        <span className="unavail-tag">Hết hàng</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cart sidebar */}
        {count > 0 && restaurantId === restaurant.id && (
          <div className="cart-sidebar">
            <div className="cart-sidebar-inner">
              <h3 className="cart-title">🛒 Giỏ hàng</h3>
              <div className="cart-items">
                {cartItems.map(item => (
                  <div key={item.id} className="cart-line">
                    <div className="cart-line-info">
                      <span className="cart-line-name">{item.name}</span>
                      <span className="cart-line-price">{formatCurrency(item.price)}</span>
                    </div>
                    <div className="qty-ctrl small">
                      <button onClick={() => removeItem(item.id)} className="qty-btn minus">−</button>
                      <span className="qty-num">{item.qty}</span>
                      <button onClick={() => addItem(item, { id: restaurant.id, name: restaurant.name })} className="qty-btn plus">+</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="cart-total-row">
                <span>Tạm tính</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="cart-total-row secondary">
                <span>Phí ship</span>
                <span>{total >= 200000 ? 'Miễn phí' : formatCurrency(25000)}</span>
              </div>
              <div className="cart-total-row grand">
                <span>Tổng cộng</span>
                <span className="grand-total">{formatCurrency(total + (total >= 200000 ? 0 : 25000))}</span>
              </div>
              <button onClick={() => navigate('/cart')} className="btn btn-primary checkout-btn">
                Đặt hàng ngay →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
