import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../services/api';
import './Cart.css';

function formatCurrency(n) {
  return new Intl.NumberFormat('vi-VN').format(n) + '₫';
}

export default function Cart() {
  const navigate = useNavigate();
  const { items, restaurantId, restaurantName, addItem, removeItem, clearCart, total, count } = useCart();
  const { user } = useAuth();
  const [address, setAddress] = useState(user?.address || '');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const deliveryFee = total >= 200000 ? 0 : 25000;
  const grandTotal = total + deliveryFee;

  const handleCheckout = async () => {
    if (!address.trim()) { setError('Vui lòng nhập địa chỉ giao hàng'); return; }
    setLoading(true); setError('');
    try {
      const payload = {
        restaurant_id: restaurantId,
        delivery_address: address,
        note,
        items: items.map(i => ({ menu_item_id: i.id, quantity: i.qty }))
      };
      const res = await orderAPI.create(payload);
      clearCart();
      navigate(`/orders/${res.data.id}?success=1`);
    } catch (err) {
      setError(err.response?.data?.message || 'Đặt hàng thất bại, vui lòng thử lại');
    } finally { setLoading(false); }
  };

  if (!count) return (
    <div className="empty-cart page-enter">
      <div className="container">
        <div className="empty-box">
          <div className="empty-icon">🛒</div>
          <h2>Giỏ hàng trống</h2>
          <p>Hãy thêm món ăn ngon vào giỏ nhé!</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">Khám phá nhà hàng</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="cart-page page-enter">
      <div className="container">
        <div className="cart-header">
          <h1>Giỏ hàng của bạn</h1>
          <span className="from-restaurant">từ <strong>{restaurantName}</strong></span>
        </div>

        <div className="cart-layout">
          {/* Items */}
          <div className="cart-items-section">
            <div className="section-card">
              <h2 className="sec-title">🍽 Món đã chọn</h2>
              <div className="order-items">
                {items.map(item => (
                  <div key={item.id} className="order-item">
                    <div className="oi-info">
                      <span className="oi-name">{item.name}</span>
                      <span className="oi-unit">{formatCurrency(item.price)} / món</span>
                    </div>
                    <div className="oi-right">
                      <div className="qty-ctrl">
                        <button onClick={() => removeItem(item.id)} className="qty-btn minus">−</button>
                        <span className="qty-num">{item.qty}</span>
                        <button onClick={() => addItem(item, { id: restaurantId, name: restaurantName })} className="qty-btn plus">+</button>
                      </div>
                      <span className="oi-total">{formatCurrency(item.price * item.qty)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery info */}
            <div className="section-card">
              <h2 className="sec-title">📍 Thông tin giao hàng</h2>
              <div className="input-group">
                <label>Địa chỉ giao hàng *</label>
                <input
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Số nhà, tên đường, quận, thành phố..."
                />
              </div>
              <div className="input-group" style={{ marginTop: 16 }}>
                <label>Ghi chú cho nhà hàng</label>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  rows={3}
                  placeholder="Ví dụ: ít cay, không hành..."
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="order-summary">
            <div className="section-card">
              <h2 className="sec-title">📋 Tóm tắt đơn hàng</h2>
              <div className="summary-rows">
                <div className="sum-row">
                  <span>Tạm tính ({count} món)</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <div className="sum-row">
                  <span>Phí giao hàng</span>
                  <span className={deliveryFee === 0 ? 'free' : ''}>
                    {deliveryFee === 0 ? '🎉 Miễn phí' : formatCurrency(deliveryFee)}
                  </span>
                </div>
                {deliveryFee > 0 && (
                  <div className="free-tip">
                    Thêm {formatCurrency(200000 - total)} để được miễn phí ship
                  </div>
                )}
                <div className="sum-row grand">
                  <span>Tổng thanh toán</span>
                  <span className="grand-val">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              {error && <div className="error-banner">{error}</div>}

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="btn btn-primary checkout-main-btn"
              >
                {loading ? <><div className="spinner" />Đang đặt...</> : `Đặt hàng • ${formatCurrency(grandTotal)}`}
              </button>

              <p className="payment-note">💳 Thanh toán khi nhận hàng (COD)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
