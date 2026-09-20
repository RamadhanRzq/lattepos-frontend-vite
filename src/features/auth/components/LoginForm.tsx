import { SpinnerGap } from '@phosphor-icons/react'
import axios from 'axios'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { api } from '@/lib/api'

export function LoginForm() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!username.trim()) {
      setError('Username wajib diisi.')
      return
    }

    if (!password) {
      setError('Password wajib diisi.')
      return
    }

    setLoading(true)

    try {
      const response = await api.post('/login', {
        username: username.trim(),
        password,
      })

      const token = response.data.access_token

      localStorage.setItem('access_token', token)
      localStorage.setItem('refresh_token', response.data.refresh_token)
      navigate({ to: '/dashboard' })
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || 'Username atau password salah.',
        )
      } else {
        setError('Terjadi kesalahan saat login.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-error/20 bg-error/5 px-3 py-2.5 text-[13px] text-error"
        >
          {error}
        </div>
      )}

      <div className="mb-4">
        <label
          htmlFor="username"
          className="mb-1.5 block text-[13px] font-medium text-text-primary"
        >
          Username
        </label>
        <input
          id="username"
          type="text"
          autoComplete="username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-[14px] text-text-primary placeholder:text-text-secondary/50 focus:border-2 focus:border-primary focus:outline-none"
        />
      </div>

      <div className="mb-6">
        <div className="mb-1.5 flex items-center justify-between">
          <label
            htmlFor="password"
            className="text-[13px] font-medium text-text-primary"
          >
            Password
          </label>
          <button
            type="button"
            className="text-[13px] font-medium text-primary hover:text-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:rounded"
            onClick={() => alert('Fitur lupa password belum tersedia.')}
          >
            Lupa password?
          </button>
        </div>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Masukkan password"
          className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-[14px] text-text-primary placeholder:text-text-secondary/50 focus:border-2 focus:border-primary focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-[9999px] bg-primary text-[14px] font-bold text-white transition-colors hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:bg-border disabled:text-text-secondary disabled:cursor-not-allowed"
      >
        {loading && <SpinnerGap className="animate-spin" weight="bold" />}
        Masuk
      </button>
    </form>
  )
}