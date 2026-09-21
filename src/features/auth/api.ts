import { api } from '@/lib/api'
import type {
  LoginResponse,
  MeResponse,
  RefreshResponse,
} from './types'

const ACCESS_KEY = 'access_token'
const REFRESH_KEY = 'refresh_token'

export function setTokens(access: string, refresh: string) {
  localStorage.setItem(ACCESS_KEY, access)
  localStorage.setItem(REFRESH_KEY, refresh)
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

export async function login(username: string, password: string) {
  const { data } = await api.post<LoginResponse>('/login', {
    username,
    password,
  })
  setTokens(data.access_token, data.refresh_token)
  return data
}

export async function logout() {
  const refreshToken = localStorage.getItem(REFRESH_KEY)
  if (refreshToken) {
    await api.post('/auth/logout', { refresh_token: refreshToken })
  }
  clearTokens()
}

export async function logoutAll() {
  await api.post('/auth/logout-all')
  clearTokens()
}

export async function fetchMe() {
  const { data } = await api.get<MeResponse>('/me')
  return data
}

export type { LoginResponse, MeResponse, RefreshResponse }
