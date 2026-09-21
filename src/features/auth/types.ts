export interface User {
  id: string
  name: string
  username: string
  email: string
  role: string
  created_at: string
  updated_at: string
}

export interface Organization {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
  user: User
  organizations: Organization[]
}

export interface RefreshResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
}

export interface MeResponse {
  user_id: string
  username: string
  email: string
  name: string
}
