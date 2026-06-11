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
} from '@/types/models'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

async function request<T>(resource: string, init?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}/${resource}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  if (!response.ok) {
    throw new Error(`Falha ao processar ${resource}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

async function deleteMany(resource: string, ids: number[]) {
  await Promise.all(ids.map((id) => request<void>(`${resource}/${id}`, { method: 'DELETE' })))
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

export function deleteModule(moduleId: number) {
  return request<void>(`modules/${moduleId}`, { method: 'DELETE' })
}

export function createLesson(payload: LessonPayload) {
  return request<Lesson>('lessons', { method: 'POST', body: JSON.stringify(payload) })
}

export function updateLesson(lessonId: number, payload: LessonPayload) {
  return request<Lesson>(`lessons/${lessonId}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export function deleteLesson(lessonId: number) {
  return request<void>(`lessons/${lessonId}`, { method: 'DELETE' })
}

async function createTrackRelations(trackId: number, courseIds: number[]) {
  await Promise.all(
    courseIds.map((courseId, index) =>
      request<TrackCourse>('trackCourses', {
        method: 'POST',
        body: JSON.stringify({ trackId, courseId, order: index + 1 }),
      }),
    ),
  )
}

export async function removeTrackRelations(trackId: number) {
  const relations = await request<TrackCourse[]>(`trackCourses?trackId=${trackId}`)
  await deleteMany('trackCourses', relations.map((relation) => relation.id))
}

export async function createTrack(payload: TrackPayload) {
  const { courseIds, ...trackPayload } = payload
  const track = await request<Track>('tracks', { method: 'POST', body: JSON.stringify(trackPayload) })
  await createTrackRelations(track.id, courseIds)
  return track
}

export async function updateTrack(trackId: number, payload: TrackPayload) {
  const { courseIds, ...trackPayload } = payload
  const track = await request<Track>(`tracks/${trackId}`, {
    method: 'PUT',
    body: JSON.stringify(trackPayload),
  })

  await removeTrackRelations(trackId)
  await createTrackRelations(trackId, courseIds)
  return track
}

export async function deleteTrack(trackId: number) {
  await removeTrackRelations(trackId)
  await request<void>(`tracks/${trackId}`, { method: 'DELETE' })
}

export function createUser(payload: UserPayload) {
  return request<User>('users', { method: 'POST', body: JSON.stringify(payload) })
}

export function updateUser(userId: number, payload: UserPayload) {
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

export async function removeCourseRelations(courseId: number) {
  const [relations, enrollments, certificates] = await Promise.all([
    request<TrackCourse[]>(`trackCourses?courseId=${courseId}`),
    request<Enrollment[]>(`enrollments?courseId=${courseId}`),
    request<Certificate[]>(`certificates?courseId=${courseId}`),
  ])

  await Promise.all([
    deleteMany('trackCourses', relations.map((relation) => relation.id)),
    deleteMany('enrollments', enrollments.map((enrollment) => enrollment.id)),
    deleteMany('certificates', certificates.map((certificate) => certificate.id)),
  ])
}

export async function removeProgressByLesson(lessonId: number) {
  const progress = await request<LessonProgress[]>(`lessonProgress?lessonId=${lessonId}`)
  await deleteMany('lessonProgress', progress.map((item) => item.id))
}

export async function removeLessonsByModule(moduleId: number) {
  const lessons = await request<Lesson[]>(`lessons?moduleId=${moduleId}`)

  await Promise.all(
    lessons.map(async (lesson) => {
      await removeProgressByLesson(lesson.id)
      await request<void>(`lessons/${lesson.id}`, { method: 'DELETE' })
    }),
  )
}

export async function removeModulesByCourse(courseId: number) {
  const modules = await request<Module[]>(`modules?courseId=${courseId}`)

  await Promise.all(
    modules.map(async (module) => {
      await removeLessonsByModule(module.id)
      await request<void>(`modules/${module.id}`, { method: 'DELETE' })
    }),
  )
}

export async function removePaymentsBySubscription(subscriptionId: number) {
  const payments = await request<Payment[]>(`payments?subscriptionId=${subscriptionId}`)
  await deleteMany('payments', payments.map((payment) => payment.id))
}

export async function removeUserRelations(userId: number) {
  const [enrollments, progress, certificates, subscriptions] = await Promise.all([
    request<Enrollment[]>(`enrollments?userId=${userId}`),
    request<LessonProgress[]>(`lessonProgress?userId=${userId}`),
    request<Certificate[]>(`certificates?userId=${userId}`),
    request<Subscription[]>(`subscriptions?userId=${userId}`),
  ])

  await Promise.all([
    deleteMany('enrollments', enrollments.map((item) => item.id)),
    deleteMany('lessonProgress', progress.map((item) => item.id)),
    deleteMany('certificates', certificates.map((item) => item.id)),
    Promise.all(
      subscriptions.map(async (subscription) => {
        await removePaymentsBySubscription(subscription.id)
        await deleteSubscription(subscription.id)
      }),
    ),
  ])
}
