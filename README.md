# Pedidos360 — Frontend

Frontend React de Pedidos360, conectado a `backend-pedidos360` y autenticado con Microsoft Entra ID.

## Requisitos

- Node.js 20.19 o superior, o 22.12 o superior.
- Acceso a la API y un registro de aplicación SPA en Microsoft Entra ID.

## Inicio rápido

```bash
npm install
```

Copia `.env.example` a `.env` (en PowerShell: `Copy-Item .env.example .env`) y completa las variables de Entra:

| Variable | Descripción |
|---|---|
| `VITE_ENTRA_TENANT_ID` | ID del directorio de Azure. |
| `VITE_ENTRA_CLIENT_ID` | ID de cliente de la aplicación SPA del frontend. |
| `VITE_ENTRA_API_SCOPES` | Permisos delegados de la API, separados por comas. |
| `VITE_ENTRA_REDIRECT_URI` | URL registrada como redirección SPA; debe coincidir exactamente con la URL local. |
| `VITE_BACKEND_URL` | URL base del backend, sin agregar `/api`. |
| `VITE_BACKEND_PROXY` | `true` para usar el proxy de Vite en desarrollo; `false` para llamar directo al backend. |

Luego ejecuta `npm run dev` y abre la URL que indique Vite. Reinicia Vite después de modificar `.env`. Para publicar el frontend como sitio estático, usa `VITE_BACKEND_PROXY=false` y configura CORS del backend para aceptar `Authorization`.

## Funcionalidad

- **Pedidos:** consulta, creación, detalle y cambios de estado según el rol.
- **Catálogo:** consulta, creación, edición y ajuste de stock según el rol.
- **Acceso:** cliente ve sus pedidos; operador y administrador pueden ver todos. El operador ingresa el ID del cliente al crear un pedido porque la API no ofrece un listado de usuarios.
- Las fotos asociadas a ciertos productos se guardan localmente en `public/images/products/`; el backend aún no almacena imágenes.

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
