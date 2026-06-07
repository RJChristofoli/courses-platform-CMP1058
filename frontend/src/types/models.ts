export interface User {
  id: number
  fullName: string
  email: string
  passwordHash: string
  createdAt: string
  role: 'student' | 'instructor'
}

export interface Category {
  id: number
  name: string
  description: string
}

export interface Course {
  id: number
  title: string
  description: string
  instructorId: number
  categoryId: number
  level: string
  publishedAt: string
  totalLessons: number
  totalHours: number
}

export interface Module {
  id: number
  courseId: number
  title: string
  order: number
}

export interface Lesson {
  id: number
  moduleId: number
  title: string
  contentType: string
  contentUrl: string
  durationMinutes: number
  order: number
}

export interface Track {
  id: number
  title: string
  description: string
  categoryId: number
}

export interface TrackCourse {
  id: number
  trackId: number
  courseId: number
  order: number
}

export interface Plan {
  id: number
  name: string
  description: string
  price: number
  durationMonths: number
}

export interface Enrollment {
  id: number
  userId: number
  courseId: number
  enrolledAt: string
  completedAt: string | null
}

export interface LessonProgress {
  id: number
  userId: number
  lessonId: number
  completedAt: string | null
  status: 'Concluido' | 'Em andamento'
}

export interface Subscription {
  id: number
  userId: number
  planId: number
  startDate: string
  endDate: string
  status: 'active' | 'paused' | 'cancelled' | 'expired'
}

export interface Payment {
  id: number
  subscriptionId: number
  amountPaid: number
  paymentDate: string
  paymentMethod: string
  gatewayTransactionId: string
}

export interface Certificate {
  id: number
  userId: number
  courseId: number
  trackId?: number
  verificationCode: string
  issuedAt: string
}

export interface DashboardData {
  users: User[]
  categories: Category[]
  courses: Course[]
  modules: Module[]
  lessons: Lesson[]
  tracks: Track[]
  trackCourses: TrackCourse[]
  plans: Plan[]
  enrollments: Enrollment[]
  lessonProgress: LessonProgress[]
  subscriptions: Subscription[]
  payments: Payment[]
  certificates: Certificate[]
}

export interface AcademicCatalogData {
  categories: Category[]
  courses: Course[]
  modules: Module[]
  lessons: Lesson[]
  tracks: Track[]
  trackCourses: TrackCourse[]
  users: User[]
}

export interface CategoryPayload {
  name: string
  description: string
}

export interface CoursePayload {
  title: string
  description: string
  instructorId: number
  categoryId: number
  level: string
  publishedAt: string
  totalLessons: number
  totalHours: number
}

export interface ModulePayload {
  courseId: number
  title: string
  order: number
}

export interface LessonPayload {
  moduleId: number
  title: string
  contentType: string
  contentUrl: string
  durationMinutes: number
  order: number
}

export interface TrackPayload {
  title: string
  description: string
  categoryId: number
  courseIds: number[]
}

export interface UserPayload {
  fullName: string
  email: string
  passwordHash: string
  createdAt: string
  role: 'student' | 'instructor'
}

export interface EnrollmentPayload {
  userId: number
  courseId: number
  enrolledAt: string
  completedAt: string | null
}

export interface LessonProgressPayload {
  userId: number
  lessonId: number
  completedAt: string | null
  status: 'Concluido' | 'Em andamento'
}

export interface CertificatePayload {
  userId: number
  courseId: number
  trackId?: number
  verificationCode: string
  issuedAt: string
}

export interface PlanPayload {
  name: string
  description: string
  price: number
  durationMonths: number
}

export interface SubscriptionPayload {
  userId: number
  planId: number
  startDate: string
  endDate: string
  status: 'active' | 'paused' | 'cancelled' | 'expired'
}

export interface PaymentPayload {
  subscriptionId: number
  amountPaid: number
  paymentDate: string
  paymentMethod: string
  gatewayTransactionId: string
}
