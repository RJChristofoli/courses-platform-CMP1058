import type {
  AcademicCatalogData,
  Category,
  CategoryPayload,
  Course,
  CoursePayload,
  DashboardData,
  Lesson,
  LessonPayload,
  Module,
  ModulePayload,
  Track,
  TrackCourse,
  TrackPayload,
  User,
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

export async function getDashboardData(): Promise<DashboardData> {
  const [
    users,
    categories,
    courses,
    modules,
    lessons,
    tracks,
    plans,
    enrollments,
    subscriptions,
    payments,
    certificates,
  ] = await Promise.all([
    request<DashboardData['users']>('users'),
    request<DashboardData['categories']>('categories'),
    request<DashboardData['courses']>('courses'),
    request<DashboardData['modules']>('modules'),
    request<DashboardData['lessons']>('lessons'),
    request<DashboardData['tracks']>('tracks'),
    request<DashboardData['plans']>('plans'),
    request<DashboardData['enrollments']>('enrollments'),
    request<DashboardData['subscriptions']>('subscriptions'),
    request<DashboardData['payments']>('payments'),
    request<DashboardData['certificates']>('certificates'),
  ])

  return {
    users,
    categories,
    courses,
    modules,
    lessons,
    tracks,
    plans,
    enrollments,
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
  return request<Category>('categories', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateCategory(categoryId: number, payload: CategoryPayload) {
  return request<Category>(`categories/${categoryId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteCategory(categoryId: number) {
  return request<void>(`categories/${categoryId}`, {
    method: 'DELETE',
  })
}

export function createCourse(payload: CoursePayload) {
  return request<Course>('courses', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateCourse(courseId: number, payload: CoursePayload) {
  return request<Course>(`courses/${courseId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteCourse(courseId: number) {
  return request<void>(`courses/${courseId}`, {
    method: 'DELETE',
  })
}

export function createModule(payload: ModulePayload) {
  return request<Module>('modules', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateModule(moduleId: number, payload: ModulePayload) {
  return request<Module>(`modules/${moduleId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteModule(moduleId: number) {
  return request<void>(`modules/${moduleId}`, {
    method: 'DELETE',
  })
}

export function createLesson(payload: LessonPayload) {
  return request<Lesson>('lessons', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateLesson(lessonId: number, payload: LessonPayload) {
  return request<Lesson>(`lessons/${lessonId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteLesson(lessonId: number) {
  return request<void>(`lessons/${lessonId}`, {
    method: 'DELETE',
  })
}

async function createTrackRelations(trackId: number, courseIds: number[]) {
  await Promise.all(
    courseIds.map((courseId, index) =>
      request<TrackCourse>('trackCourses', {
        method: 'POST',
        body: JSON.stringify({
          trackId,
          courseId,
          order: index + 1,
        }),
      }),
    ),
  )
}

async function removeTrackRelations(trackId: number) {
  const relations = await request<TrackCourse[]>(`trackCourses?trackId=${trackId}`)

  await Promise.all(
    relations.map((relation) =>
      request<void>(`trackCourses/${relation.id}`, {
        method: 'DELETE',
      }),
    ),
  )
}

export async function createTrack(payload: TrackPayload) {
  const { courseIds, ...trackPayload } = payload
  const track = await request<Track>('tracks', {
    method: 'POST',
    body: JSON.stringify(trackPayload),
  })

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
  await request<void>(`tracks/${trackId}`, {
    method: 'DELETE',
  })
}

export async function removeCourseRelations(courseId: number) {
  const relations = await request<TrackCourse[]>(`trackCourses?courseId=${courseId}`)

  await Promise.all(
    relations.map((relation) =>
      request<void>(`trackCourses/${relation.id}`, {
        method: 'DELETE',
      }),
    ),
  )
}

export async function removeLessonsByModule(moduleId: number) {
  const lessons = await request<Lesson[]>(`lessons?moduleId=${moduleId}`)

  await Promise.all(
    lessons.map((lesson) =>
      request<void>(`lessons/${lesson.id}`, {
        method: 'DELETE',
      }),
    ),
  )
}

export async function removeModulesByCourse(courseId: number) {
  const modules = await request<Module[]>(`modules?courseId=${courseId}`)

  await Promise.all(
    modules.map(async (module) => {
      await removeLessonsByModule(module.id)
      await request<void>(`modules/${module.id}`, {
        method: 'DELETE',
      })
    }),
  )
}
