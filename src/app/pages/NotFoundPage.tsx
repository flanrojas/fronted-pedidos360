import { MessagePage } from '@/shared/components/MessagePage'

export function NotFoundPage() {
  return (
    <MessagePage
      code="404"
      title="Página no encontrada"
      description="La dirección que buscas no existe."
    />
  )
}
