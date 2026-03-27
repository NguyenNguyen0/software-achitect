import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handle = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(form.email, form.password);
    if (result.ok) navigate('/');
    else setError(result.message);
  };

  return (
    <div className="auth-page page-enter">
      <div className="auth-card">
        <div className="auth-logo">🍜</div>
        <h1 className="auth-title">Chào mừng trở lại</h1>
        <p className="auth-sub">Đăng nhập để đặt món ngon</p>

        <form onSubmit={handle} className="auth-form">
          <div className="input-group">
            <label>Email</label>
            <input type="email" placeholder="example@email.com" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="input-group">
            <label>Mật khẩu</label>
            <input type="password" placeholder="••••••••" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            {loading ? <><div className="spinner" />Đang đăng nhập...</> : 'Đăng nhập'}
          </button>
        </form>

        <p className="auth-switch">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
}

export function Register() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', address: '' });
  const [error, setError] = useState('');

  const handle = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Mật khẩu phải ít nhất 6 ký tự'); return; }
    const result = await register(form);
    if (result.ok) navigate('/');
    else setError(result.message);
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div className="auth-page page-enter">
      <div className="auth-card">
        <div className="auth-logo">🍜</div>
        <h1 className="auth-title">Tạo tài khoản</h1>
        <p className="auth-sub">Tham gia FoodDash để đặt món ngay</p>

        <form onSubmit={handle} className="auth-form">
          <div className="input-group">
            <label>Họ và tên *</label>
            <input placeholder="Nguyễn Văn A" value={form.name} onChange={set('name')} required />
          </div>
          <div className="input-group">
            <label>Email *</label>
            <input type="email" placeholder="example@email.com" value={form.email} onChange={set('email')} required />
          </div>
          <div className="input-group">
            <label>Mật khẩu *</label>
            <input type="password" placeholder="Ít nhất 6 ký tự" value={form.password} onChange={set('password')} required />
          </div>
          <div className="input-row">
            <div className="input-group">
              <label>Số điện thoại</label>
              <input placeholder="0901234567" value={form.phone} onChange={set('phone')} />
            </div>
          </div>
          <div className="input-group">
            <label>Địa chỉ mặc định</label>
            <input placeholder="Số nhà, đường, quận..." value={form.address} onChange={set('address')} />
          </div>
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            {loading ? <><div className="spinner" />Đang đăng ký...</> : 'Tạo tài khoản'}
          </button>
        </form>

        <p className="auth-switch">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
