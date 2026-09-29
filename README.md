# Pedidos360 — Frontend

Frontend React de Pedidos360. Consume exclusivamente [backend-pedidos360](../backend-pedidos360) y usa Microsoft Entra ID para iniciar sesión.

## Requisitos

- Node.js 20.19 o superior, o 22.12 o superior.
- Acceso a la API y un registro de aplicación SPA en Microsoft Entra ID.


## Comandos

| Comando | Uso |
|---|---|
| `npm run dev` | Servidor Vite de desarrollo. |
| `npm run build` | Revisión de tipos y build de producción. |
| `npm run lint` | ESLint. |
| `npm test` | Pruebas con Vitest. |

## Organización

- `src/auth/`: Microsoft Entra ID, roles y protección de rutas.
- `src/shared/api/`: cliente Axios y URL base.
- `src/features/catalog/`: catálogo y adaptación de respuestas del backend.
- `src/features/orders/`: pedidos, estados y adaptación de respuestas del backend.
- `src/app/theme.ts`: paleta amarilla y azul de la interfaz.
- `public/images/`: imágenes decorativas y fotos locales de productos.
