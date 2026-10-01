import type {
  AcademicCatalogData,
  Category,
  CategoryPayload,
  Certificate,
  CertificatePayload,
  Course,
  CoursePayload,
  PlatformData,
  Enrollment,
  EnrollmentPayload,
  Lesson,
  LessonPayload,
  LessonProgress,
  LessonProgressPayload,
  Module,
  ModulePayload,
  Payment,
  PaymentPayload,
  Plan,
  PlanPayload,
  Subscription,
  SubscriptionPayload,
  Track,
  TrackCourse,
  TrackPayload,
  User,
  UserPayload,
  UserUpdatePayload,
} from '@/types/models'
import { API_BASE_URL, clearSession, getSessionToken } from '@/services/session'

async function request<T>(resource: string, init?: RequestInit) {
  const token = getSessionToken()
  const headers = new Headers(init?.headers)
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`)
  const response = await fetch(`${API_BASE_URL}/${resource}`, {
    ...init,
    headers,
  })

  if (!response.ok) {
    const problem = await response.json().catch(() => null) as {
      message?: string | string[]
      details?: Array<{ message?: string }>
    } | null
    if (response.status === 401 && resource !== 'auth/login' && getSessionToken() === token) clearSession()
    const detailMessages = problem?.details?.map((detail) => detail.message).filter((message): message is string => Boolean(message))
    const message = detailMessages?.length
      ? detailMessages.join('; ')
      : Array.isArray(problem?.message)
      ? problem.message.join('; ')
      : problem?.message
    throw new Error(message ?? `Falha ao processar ${resource}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export async function getPlatformData(): Promise<PlatformData> {
  const [
    users,
    categories,
    courses,
    modules,
    lessons,
    tracks,
    trackCourses,
    plans,
    enrollments,
    lessonProgress,
    subscriptions,
    payments,
    certificates,
  ] = await Promise.all([
    request<PlatformData['users']>('users'),
    request<PlatformData['categories']>('categories'),
    request<PlatformData['courses']>('courses'),
    request<PlatformData['modules']>('modules'),
    request<PlatformData['lessons']>('lessons'),
    request<PlatformData['tracks']>('tracks'),
    request<PlatformData['trackCourses']>('trackCourses'),
    request<PlatformData['plans']>('plans'),
    request<PlatformData['enrollments']>('enrollments'),
    request<PlatformData['lessonProgress']>('lessonProgress'),
    request<PlatformData['subscriptions']>('subscriptions'),
    request<PlatformData['payments']>('payments'),
    request<PlatformData['certificates']>('certificates'),
  ])

  return {
    users,
    categories,
    courses,
    modules,
    lessons,
    tracks,
    trackCourses,
    plans,
    enrollments,
    lessonProgress,
    subscriptions,
    payments,
    certificates,
  }
}

export async function getAcademicCatalogData(): Promise<AcademicCatalogData> {
  const [categories, courses, modules, lessons, tracks, trackCourses, users] = await Promise.all([
    request<Category[]>('categories'),
    request<Course[]>('courses'),
    request<Module[]>('modules'),
    request<Lesson[]>('lessons'),
    request<Track[]>('tracks'),
    request<TrackCourse[]>('trackCourses'),
    request<User[]>('users'),
  ])

  return {
    categories,
    courses,
    modules,
    lessons,
    tracks,
    trackCourses,
    users,
  }
}

export function createCategory(payload: CategoryPayload) {
  return request<Category>('categories', { method: 'POST', body: JSON.stringify(payload) })
}

export function updateCategory(categoryId: number, payload: CategoryPayload) {
  return request<Category>(`categories/${categoryId}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export function deleteCategory(categoryId: number) {
  return request<void>(`categories/${categoryId}`, { method: 'DELETE' })
}

export function createCourse(payload: CoursePayload) {
  return request<Course>('courses', { method: 'POST', body: JSON.stringify(payload) })
}

export function updateCourse(courseId: number, payload: CoursePayload) {
  return request<Course>(`courses/${courseId}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export function deleteCourse(courseId: number) {
  return request<void>(`courses/${courseId}`, { method: 'DELETE' })
}

export function createModule(payload: ModulePayload) {
  return request<Module>('modules', { method: 'POST', body: JSON.stringify(payload) })
}

export function updateModule(moduleId: number, payload: ModulePayload) {
  return request<Module>(`modules/${moduleId}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export function reorderModules(courseId: number, moduleIds: number[]) {
  return request<Module[]>(`courses/${courseId}/modules/order`, {
    method: 'PUT',
    body: JSON.stringify({ moduleIds }),
  })
}

export function deleteModule(moduleId: number) {
  return request<void>(`modules/${moduleId}`, { method: 'DELETE' })
}

export function createLesson(payload: LessonPayload) {
  return request<Lesson>('lessons', { method: 'POST', body: JSON.stringify(payload) })
}

export function updateLesson(lessonId: number, payload: LessonPayload) {
  return request<Lesson>(`lessons/${lessonId}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export function reorderLessons(courseId: number, lessons: Array<{ id: number; moduleId: number; order: number }>) {
  return request<Lesson[]>(`courses/${courseId}/lessons/order`, {
    method: 'PUT',
    body: JSON.stringify({ lessons }),
  })
}

export function deleteLesson(lessonId: number) {
  return request<void>(`lessons/${lessonId}`, { method: 'DELETE' })
}

export function createTrack(payload: TrackPayload) {
  return request<Track>('tracks', { method: 'POST', body: JSON.stringify(payload) })
}

export function updateTrack(trackId: number, payload: TrackPayload) {
  return request<Track>(`tracks/${trackId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteTrack(trackId: number) {
  return request<void>(`tracks/${trackId}`, { method: 'DELETE' })
}

export function createUser(payload: UserPayload) {
  return request<User>('users', { method: 'POST', body: JSON.stringify(payload) })
}

export function updateUser(userId: number, payload: UserUpdatePayload) {
  return request<User>(`users/${userId}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export function deleteUser(userId: number) {
  return request<void>(`users/${userId}`, { method: 'DELETE' })
}

export function createEnrollment(payload: EnrollmentPayload) {
  return request<Enrollment>('enrollments', { method: 'POST', body: JSON.stringify(payload) })
}

export function updateEnrollment(enrollmentId: number, payload: EnrollmentPayload) {
  return request<Enrollment>(`enrollments/${enrollmentId}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export function deleteEnrollment(enrollmentId: number) {
  return request<void>(`enrollments/${enrollmentId}`, { method: 'DELETE' })
}

export function createLessonProgress(payload: LessonProgressPayload) {
  return request<LessonProgress>('lessonProgress', { method: 'POST', body: JSON.stringify(payload) })
}

export function updateLessonProgress(progressId: number, payload: LessonProgressPayload) {
  return request<LessonProgress>(`lessonProgress/${progressId}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export function deleteLessonProgress(progressId: number) {
  return request<void>(`lessonProgress/${progressId}`, { method: 'DELETE' })
}

export function createCertificate(payload: CertificatePayload) {
  return request<Certificate>('certificates', { method: 'POST', body: JSON.stringify(payload) })
}

export function updateCertificate(certificateId: number, payload: CertificatePayload) {
  return request<Certificate>(`certificates/${certificateId}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export function deleteCertificate(certificateId: number) {
  return request<void>(`certificates/${certificateId}`, { method: 'DELETE' })
}

export function createPlan(payload: PlanPayload) {
  return request<Plan>('plans', { method: 'POST', body: JSON.stringify(payload) })
}

export function updatePlan(planId: number, payload: PlanPayload) {
  return request<Plan>(`plans/${planId}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export function deletePlan(planId: number) {
  return request<void>(`plans/${planId}`, { method: 'DELETE' })
}

export function createSubscription(payload: SubscriptionPayload) {
  return request<Subscription>('subscriptions', { method: 'POST', body: JSON.stringify(payload) })
}

export function updateSubscription(subscriptionId: number, payload: SubscriptionPayload) {
  return request<Subscription>(`subscriptions/${subscriptionId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteSubscription(subscriptionId: number) {
  return request<void>(`subscriptions/${subscriptionId}`, { method: 'DELETE' })
}

export function createPayment(payload: PaymentPayload) {
  return request<Payment>('payments', { method: 'POST', body: JSON.stringify(payload) })
}

export function updatePayment(paymentId: number, payload: PaymentPayload) {
  return request<Payment>(`payments/${paymentId}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export function deletePayment(paymentId: number) {
  return request<void>(`payments/${paymentId}`, { method: 'DELETE' })
}
