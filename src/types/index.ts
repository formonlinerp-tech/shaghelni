export interface UserSession {
  user: {
    id: string
    email: string
    name: string
    role: string
    avatar?: string
    phone?: string
    phoneVerified: boolean
  }
  session: {
    userId: string
    email: string
    role: string
  }
}