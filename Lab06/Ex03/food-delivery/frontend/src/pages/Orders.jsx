import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { orderAPI } from '../services/api';
import './Orders.css';

function formatCurrency(n) {
  return new Intl.NumberFormat('vi-VN').format(n) + '₫';
}

function formatDate(d) {
  return new Date(d).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const STATUS_MAP = {
  pending:    { label: 'Chờ xác nhận', color: 'badge-yellow', icon: '⏳', step: 0 },
  confirmed:  { label: 'Đã xác nhận',  color: 'badge-green',  icon: '✅', step: 1 },
  preparing:  { label: 'Đang chuẩn bị',color: 'badge-orange', icon: '👨‍🍳', step: 2 },
  ready:      { label: 'Sẵn sàng',      color: 'badge-green',  icon: '📦', step: 3 },
  delivering: { label: 'Đang giao',     color: 'badge-orange', icon: '🛵', step: 4 },
  delivered:  { label: 'Đã giao',       color: 'badge-green',  icon: '🎉', step: 5 },
  cancelled:  { label: 'Đã huỷ',        color: 'badge-red',    icon: '❌', step: -1 },
};

const STEPS = ['Đặt hàng', 'Xác nhận', 'Chuẩn bị', 'Sẵn sàng', 'Đang giao', 'Hoàn thành'];

export function OrdersList() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getAll()
      .then(r => setOrders(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:'80px' }}><div className="spinner" style={{ width:40, height:40 }} /></div>;

  if (!orders.length) return (
    <div className="empty-orders page-enter">
      <div className="container">
        <div className="empty-box">
          <div className="empty-icon">📋</div>
          <h2>Chưa có đơn hàng</h2>
          <p>Đặt món ngon đầu tiên của bạn ngay!</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">Đặt ngay</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="orders-page page-enter">
      <div className="container">
        <h1 className="page-title">Lịch sử đơn hàng</h1>
        <div className="orders-list">
          {orders.map(order => {
            const s = STATUS_MAP[order.status] || STATUS_MAP.pending;
            return (
              <div key={order.id} className="order-card" onClick={() => navigate(`/orders/${order.id}`)}>
                <div className="oc-header">
                  <div className="oc-restaurant">
                    <img
                      src={order.restaurant_image || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=100'}
                      alt="" className="oc-img"
                      onError={e => e.target.src = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=100'}
                    />
                    <div>
                      <div className="oc-rname">{order.restaurant_name}</div>
                      <div className="oc-date">{formatDate(order.created_at)}</div>
                    </div>
                  </div>
                  <span className={`badge ${s.color}`}>{s.icon} {s.label}</span>
                </div>
                <div className="oc-items">
                  {order.items?.slice(0, 3).map((item, i) => (
                    <span key={i} className="oc-item-chip">{item.name} ×{item.quantity}</span>
                  ))}
                  {order.items?.length > 3 && <span className="oc-item-chip more">+{order.items.length - 3}</span>}
                </div>
                <div className="oc-footer">
                  <span className="oc-total">{formatCurrency(order.total_amount)}</span>
                  <span className="oc-detail">Xem chi tiết →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const isNew = searchParams.get('success') === '1';

  useEffect(() => {
    orderAPI.getById(id)
      .then(r => setOrder(r.data))
      .catch(() => navigate('/orders'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:'80px' }}><div className="spinner" style={{ width:40, height:40 }} /></div>;
  if (!order) return null;

  const s = STATUS_MAP[order.status] || STATUS_MAP.pending;
  const stepIdx = s.step;

  return (
    <div className="order-detail-page page-enter">
      <div className="container">
        {isNew && (
          <div className="success-banner">
            🎉 Đặt hàng thành công! Nhà hàng sẽ sớm xác nhận đơn của bạn.
          </div>
        )}

        <div className="detail-header">
          <button onClick={() => navigate('/orders')} className="back-link">← Tất cả đơn hàng</button>
          <h1>Chi tiết đơn hàng</h1>
          <span className="order-id">#{order.id.slice(0, 8).toUpperCase()}</span>
        </div>

        <div className="detail-layout">
          <div className="detail-main">
            {/* Status tracker */}
            {order.status !== 'cancelled' && (
              <div className="section-card">
                <h2 className="sec-title">Trạng thái đơn hàng</h2>
                <div className="status-current">
                  <span className={`badge ${s.color}`} style={{ fontSize: 15, padding: '8px 18px' }}>
                    {s.icon} {s.label}
                  </span>
                </div>
                <div className="progress-track">
                  {STEPS.map((step, i) => (
                    <div key={i} className={`track-step ${i <= stepIdx ? 'done' : ''} ${i === stepIdx ? 'current' : ''}`}>
                      <div className="track-dot" />
                      {i < STEPS.length - 1 && <div className="track-line" />}
                      <span className="track-label">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Items */}
            <div className="section-card">
              <h2 className="sec-title">🍽 Món đã đặt</h2>
              <div className="detail-items">
                {order.items?.map((item, i) => (
                  <div key={i} className="detail-item">
                    <span className="di-qty">×{item.quantity}</span>
                    <span className="di-name">{item.name}</span>
                    <span className="di-price">{formatCurrency(item.subtotal || item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery info */}
            <div className="section-card">
              <h2 className="sec-title">📍 Thông tin giao hàng</h2>
              <div className="info-row"><span>Địa chỉ</span><span>{order.delivery_address}</span></div>
              {order.note && <div className="info-row"><span>Ghi chú</span><span>{order.note}</span></div>}
              <div className="info-row"><span>Thời gian đặt</span><span>{formatDate(order.created_at)}</span></div>
            </div>
          </div>

          {/* Summary */}
          <div className="detail-summary">
            <div className="section-card">
              <h2 className="sec-title">💰 Thanh toán</h2>
              <div className="sum-row"><span>Tiền hàng</span><span>{formatCurrency(order.total_amount - order.delivery_fee)}</span></div>
              <div className="sum-row"><span>Phí ship</span><span>{order.delivery_fee === 0 ? 'Miễn phí' : formatCurrency(order.delivery_fee)}</span></div>
              <div className="sum-row grand" style={{ borderTop: '2px solid var(--border)', paddingTop: 14, marginTop: 6 }}>
                <span>Tổng cộng</span>
                <span style={{ color: 'var(--orange)', fontSize: 22, fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                  {formatCurrency(order.total_amount)}
                </span>
              </div>
              <div style={{ marginTop: 16, padding: '10px 14px', background: 'var(--gray-light)', borderRadius: 10, fontSize: 13, color: 'var(--gray)' }}>
                💳 Thanh toán khi nhận hàng (COD)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
