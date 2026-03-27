// hooks/useDebounce.js
// Debounce: chỉ cập nhật giá trị sau khi user dừng gõ `delay` ms
import { useState, useEffect } from 'react'

export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer) // cleanup khi value thay đổi trước khi hết delay
  }, [value, delay])

  return debounced
}
