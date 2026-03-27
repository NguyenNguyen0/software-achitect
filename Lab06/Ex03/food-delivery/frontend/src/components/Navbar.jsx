import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🍜</span>
          <span className="logo-text">FoodDash</span>
        </Link>

        <div className="navbar-actions">
          {user ? (
            <>
              <Link to="/orders" className={`nav-link ${location.pathname === '/orders' ? 'active' : ''}`}>
                Đơn hàng
              </Link>
              <Link to="/cart" className="cart-btn">
                <span className="cart-icon">🛒</span>
                {count > 0 && <span className="cart-badge">{count}</span>}
              </Link>
              <div className="user-menu">
                <span className="user-name">{user.name.split(' ').pop()}</span>
                <button onClick={handleLogout} className="btn btn-secondary logout-btn">Đăng xuất</button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary">Đăng nhập</Link>
              <Link to="/register" className="btn btn-primary">Đăng ký</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
