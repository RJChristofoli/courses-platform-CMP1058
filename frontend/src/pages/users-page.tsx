import { EmptyState } from '@/components/ui/empty-state'
import { UsersWorkspace } from '@/components/users/users-workspace'
import { usePlatformAdmin } from '@/hooks/use-platform-admin'

export function UsersPage() {
  const admin = usePlatformAdmin()

  if (admin.isLoading) {
    return <div className="text-sm text-slate-500">Carregando usuarios...</div>
  }

  if (admin.error || !admin.data) {
    return (
      <EmptyState
        title="Modulo de usuarios indisponivel"
        description={admin.error ?? 'Nao foi possivel carregar usuarios, matriculas e progresso.'}
      />
    )
  }

  return (
    <UsersWorkspace
      data={admin.data}
      isSaving={admin.isSaving}
      createUser={admin.createUser}
      updateUser={admin.updateUser}
      deleteUser={admin.deleteUser}
      createEnrollment={admin.createEnrollment}
      updateEnrollment={admin.updateEnrollment}
      deleteEnrollment={admin.deleteEnrollment}
      createLessonProgress={admin.createLessonProgress}
      updateLessonProgress={admin.updateLessonProgress}
      deleteLessonProgress={admin.deleteLessonProgress}
      createCertificate={admin.createCertificate}
      updateCertificate={admin.updateCertificate}
      deleteCertificate={admin.deleteCertificate}
    />
  )
}
