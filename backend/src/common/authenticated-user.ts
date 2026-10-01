export type UserRole = 'admin' | 'instructor' | 'student'

export interface AuthenticatedUser {
  id: number
  fullName: string
  email: string
  role: UserRole
  createdAt: Date
}
