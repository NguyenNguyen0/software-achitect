import { useState, useEffect } from 'react'
import { useDebounce } from './hooks/useDebounce'
import './App.css'

export default function App() {
  const [query, setQuery]       = useState('')
  const [results, setResults]   = useState([])
  const [loading, setLoading]   = useState(false)
  const [apiCount, setApiCount] = useState(0) // đếm số lần gọi API thực tế

  // ✅ Debounce: chỉ gọi API sau 400ms dừng gõ
  const debouncedQuery = useDebounce(query, 400)

  useEffect(() => {
    if (!debouncedQuery.trim()) { setResults([]); return }

    setLoading(true)
    setApiCount(c => c + 1)

    fetch(`http://localhost:8080/api/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then(r => r.json())
      .then(data => setResults(data))
      .catch(() => setResults([]))
      .finally(() => setLoading(false))
  }, [debouncedQuery]) // chỉ chạy khi debouncedQuery thay đổi

  return (
    <div className="app">
      <h1>🔍 Realtime Search</h1>
      <p className="subtitle">Demo: Debounce + Stored Procedure</p>

      <div className="search-box">
        <input
          autoFocus
          placeholder="Gõ để tìm sản phẩm... (vd: apple, sony)"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {loading && <span className="spinner" />}
      </div>

      {/* Debug panel */}
      <div className="debug">
        <span>Keystroke: <b>{query.length}</b> ký tự</span>
        <span>Debounced: <b>"{debouncedQuery}"</b></span>
        <span>API calls: <b className="api-count">{apiCount}</b></span>
      </div>

      {/* Kết quả */}
      {results.length > 0 && (
        <ul className="results">
          {results.map(p => (
            <li key={p.id}>
              <span className="name">{p.name}</span>
              <span className="tag">{p.category}</span>
            </li>
          ))}
        </ul>
      )}

      {!loading && debouncedQuery && results.length === 0 && (
        <p className="empty">Không tìm thấy kết quả</p>
      )}
    </div>
  )
}
