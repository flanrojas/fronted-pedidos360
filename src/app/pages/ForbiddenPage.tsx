import { MessagePage } from '@/shared/components/MessagePage'

export function ForbiddenPage() {
  return (
    <MessagePage
      code="403"
      title="Acceso denegado"
      description="Tu rol no tiene permiso para ver esta página."
    />
  )
}
