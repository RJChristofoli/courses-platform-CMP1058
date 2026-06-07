import { useCallback, useEffect, useState } from 'react'
import {
  createCertificate,
  createEnrollment,
  createLessonProgress,
  createPayment,
  createPlan,
  createSubscription,
  createUser,
  deleteCertificate,
  deleteEnrollment,
  deleteLessonProgress,
  deletePayment,
  deletePlan,
  deleteSubscription,
  deleteUser,
  getDashboardData,
  removePaymentsBySubscription,
  removeUserRelations,
  updateCertificate,
  updateEnrollment,
  updateLessonProgress,
  updatePayment,
  updatePlan,
  updateSubscription,
  updateUser,
} from '@/services/api'
import type {
  CertificatePayload,
  DashboardData,
  EnrollmentPayload,
  LessonProgressPayload,
  PaymentPayload,
  PlanPayload,
  SubscriptionPayload,
  UserPayload,
} from '@/types/models'

interface PlatformAdminState {
  data: DashboardData | null
  isLoading: boolean
  isSaving: boolean
  error: string | null
}

export function usePlatformAdmin() {
  const [state, setState] = useState<PlatformAdminState>({
    data: null,
    isLoading: true,
    isSaving: false,
    error: null,
  })

  const load = useCallback(async () => {
    setState((current) => ({ ...current, isLoading: true, error: null }))

    try {
      const data = await getDashboardData()
      setState({ data, isLoading: false, isSaving: false, error: null })
    } catch {
      setState({
        data: null,
        isLoading: false,
        isSaving: false,
        error: 'Nao foi possivel carregar os dados operacionais da plataforma.',
      })
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const execute = useCallback(async (operation: () => Promise<void | unknown>) => {
    setState((current) => ({ ...current, isSaving: true, error: null }))

    try {
      await operation()
      const data = await getDashboardData()
      setState({ data, isLoading: false, isSaving: false, error: null })
    } catch {
      setState((current) => ({
        ...current,
        isSaving: false,
        error: 'Nao foi possivel concluir a alteracao solicitada.',
      }))
      throw new Error('platform-admin-operation-failed')
    }
  }, [])

  return {
    ...state,
    reload: load,
    createUser: (payload: UserPayload) => execute(() => createUser(payload)),
    updateUser: (userId: number, payload: UserPayload) => execute(() => updateUser(userId, payload)),
    deleteUser: (userId: number) =>
      execute(async () => {
        await removeUserRelations(userId)
        await deleteUser(userId)
      }),
    createEnrollment: (payload: EnrollmentPayload) => execute(() => createEnrollment(payload)),
    updateEnrollment: (enrollmentId: number, payload: EnrollmentPayload) =>
      execute(() => updateEnrollment(enrollmentId, payload)),
    deleteEnrollment: (enrollmentId: number) => execute(() => deleteEnrollment(enrollmentId)),
    createLessonProgress: (payload: LessonProgressPayload) => execute(() => createLessonProgress(payload)),
    updateLessonProgress: (progressId: number, payload: LessonProgressPayload) =>
      execute(() => updateLessonProgress(progressId, payload)),
    deleteLessonProgress: (progressId: number) => execute(() => deleteLessonProgress(progressId)),
    createCertificate: (payload: CertificatePayload) => execute(() => createCertificate(payload)),
    updateCertificate: (certificateId: number, payload: CertificatePayload) =>
      execute(() => updateCertificate(certificateId, payload)),
    deleteCertificate: (certificateId: number) => execute(() => deleteCertificate(certificateId)),
    createPlan: (payload: PlanPayload) => execute(() => createPlan(payload)),
    updatePlan: (planId: number, payload: PlanPayload) => execute(() => updatePlan(planId, payload)),
    deletePlan: (planId: number) => execute(() => deletePlan(planId)),
    createSubscription: (payload: SubscriptionPayload) => execute(() => createSubscription(payload)),
    updateSubscription: (subscriptionId: number, payload: SubscriptionPayload) =>
      execute(() => updateSubscription(subscriptionId, payload)),
    deleteSubscription: (subscriptionId: number) =>
      execute(async () => {
        await removePaymentsBySubscription(subscriptionId)
        await deleteSubscription(subscriptionId)
      }),
    createPayment: (payload: PaymentPayload) => execute(() => createPayment(payload)),
    updatePayment: (paymentId: number, payload: PaymentPayload) =>
      execute(() => updatePayment(paymentId, payload)),
    deletePayment: (paymentId: number) => execute(() => deletePayment(paymentId)),
  }
}
