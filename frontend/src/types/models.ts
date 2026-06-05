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

export interface Subscription {
  id: number
  userId: number
  planId: number
  startDate: string
  endDate: string
  status: string
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
  plans: Plan[]
  enrollments: Enrollment[]
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
