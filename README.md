# Pedidos360 — Frontend (Fase 1)

Frontend en React del sistema de gestión de pedidos **Pedidos360**, proyecto semestral de Cloud Native (Duoc UC).

Esta fase incluye dos módulos:

- **Gestión de Pedidos:** listado con filtros, creación, detalle, cambios de estado y control de stock.
- **Catálogo de productos:** búsqueda, alta y edición con foto, ajuste de stock y activación o desactivación.

El backend todavía no existe; se simula con [json-server](https://github.com/typicode/json-server) `0.17.4`.

## Stack

- React 19 + Vite + TypeScript (modo estricto)
- React Router (`createBrowserRouter`)
- Axios + TanStack Query
- React Hook Form + Zod
- MUI (Material UI)
- json-server (backend simulado)
- Vitest + React Testing Library + jsdom

## Requisitos

- **Node.js 20.19 o superior**, o 22.12 o superior (lo exige Vite). Revísalo con `node -v`.
- npm (viene con Node).

## Cómo levantar el proyecto desde cero

```bash
# 1. Instalar dependencias
npm install

# 2. Crear el archivo de entorno (URL del backend simulado)
cp .env.example .env

# 3. Crear o restaurar la base de datos simulada desde los datos semilla
npm run mock:reset

# 4. Levantar el backend simulado en http://localhost:3001 (deja esta terminal abierta)
npm run mock

# 5. En otra terminal, levantar la app
npm run dev
```

Abre la URL que muestra Vite (por defecto http://localhost:5173) y entra con uno de los usuarios de prueba.

> En Windows con PowerShell, reemplaza el paso 2 por `Copy-Item .env.example .env`.

### Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo de Vite |
| `npm run mock` | json-server en el puerto 3001, sobre `mock/db.json` |
| `npm run mock:reset` | Restaura `mock/db.json` desde `mock/db.seed.json` |
| `npm run build` | Revisión de tipos y build de producción |
| `npm run lint` | ESLint |
| `npm test` | Tests con Vitest (una sola ejecución) |
| `npm run format` | Formatea `src/` con Prettier |

`mock/db.json` está en `.gitignore`: json-server lo modifica mientras usas la app. Si quieres volver a los datos iniciales, ejecuta `npm run mock:reset`.

## Usuarios de prueba

El login es simulado: eliges un usuario de la lista y la sesión se guarda en `sessionStorage`.

| Usuario | Rol | Qué puede hacer |
|---|---|---|
| Andrea Soto | Administrador (`ADMIN`) | Ver y gestionar el catálogo; ver todos los pedidos y cambiar su estado |
| Carlos Muñoz | Operador (`OPERATOR`) | Ver el catálogo (solo lectura); ver todos los pedidos, crear pedidos para un cliente y cambiar su estado |
| Valentina Rojas | Cliente (`CUSTOMER`) | Ver solo sus pedidos y crear pedidos para sí misma |
| Diego Fuentes | Cliente (`CUSTOMER`) | Igual que el cliente anterior |

Los datos semilla traen 8 productos, todos con ilustración (uno sin stock y uno inactivo), y 6 pedidos, uno en cada estado.

## Reglas de negocio implementadas

### Estados del pedido

| Código | Etiqueta |
|---|---|
| `CREATED` | Creado |
| `ACCEPTED` | Aceptado |
| `PREPARING` | En preparación |
| `DISPATCHED` | Despachado |
| `DELIVERED` | Entregado |
| `CANCELLED` | Cancelado |

Transiciones permitidas (`src/features/orders/utils/orderStateMachine.ts`):

```
CREATED   → ACCEPTED | CANCELLED
ACCEPTED  → PREPARING | CANCELLED
PREPARING → DISPATCHED
DISPATCHED → DELIVERED
DELIVERED, CANCELLED → estados finales
```

No se puede despachar un pedido que no ha sido aceptado. La interfaz solo muestra botones para las transiciones permitidas, y el servicio rechaza cualquier otra.

### Stock

- Crear un pedido **no** descuenta stock. Si la cantidad supera el stock actual, el formulario solo muestra un aviso.
- Al **aceptar** un pedido se revisa el stock actual de cada ítem:
  - Si alcanza para todos, se descuenta.
  - Si falta en alguno, no se cambia nada: el pedido sigue en `CREATED` y se listan los productos que no alcanzan.
- Al **cancelar** un pedido que estaba `ACCEPTED`, se devuelve el stock.
- Cada cambio de estado actualiza `updatedAt` y agrega una entrada a `history` (`status`, `at`, `by`).
- Antes de cambiar el estado se vuelve a leer el pedido. Si otra persona lo modificó entretanto, la operación se rechaza.
- Los productos nunca se borran: se desactivan. El stock no puede quedar negativo.

### Permisos

| Acción | ADMIN | OPERATOR | CUSTOMER |
|---|---|---|---|
| Ver catálogo | sí | sí | no |
| Crear, editar o desactivar productos y ajustar stock | sí | no | no |
| Ver pedidos | todos | todos | solo los propios |
| Crear pedido | no | sí (para un cliente) | sí (para sí mismo) |
| Cambiar estado de un pedido | sí | sí | no |

Los permisos están en una función pura (`src/auth/permissions.ts`). Las rutas se protegen con `RoleGuard`: sin sesión redirige a `/login` y sin permiso a `/403`.

### Fotos de productos

- La foto es opcional. El administrador puede **subirla desde su computador** o **pegar la URL** de una imagen.
- Al subirla se reduce en el navegador (lado mayor de 600 px, JPEG de unos 50 a 100 KB) y se guarda en el mismo producto como *data URL*. Por eso funciona sin backend.
- Formatos aceptados: JPG, PNG y WebP, de hasta 5 MB antes de reducir.
- Si el producto no tiene foto o el link no carga, se muestra un ícono genérico.
- La foto aparece en el catálogo, en el formulario de pedidos y en el detalle del pedido. En el detalle se muestra la foto **actual** del producto: el pedido guarda una copia del nombre y el precio, pero no de la foto.
- Las ilustraciones de los datos semilla están en `public/images/products/` (JPEG de 800×600).

> No crees la carpeta `public/products/`: json-server sirve `./public` como archivos estáticos y esa carpeta taparía la ruta `/products` de la API.

### Tema visual

La paleta cálida de panadería está definida en `src/app/theme.ts`:

| Rol | Color |
|---|---|
| Principal (barra, botones) | café `#8A5222` |
| Secundario | dorado `#E3A21A` (con texto oscuro) |
| Fondo / tarjetas | crema `#F6EBDD` / `#FFFCF7` |
| Texto | café oscuro `#3B2410` / `#6E4F35` |

Tipografía (cargada desde Google Fonts en `index.html`):

- **Fredoka** en títulos, botones y el nombre de la app. Es redondeada y gruesa, parecida al logo de referencia.
- **Nunito** en el texto general, más legible en tablas y formularios.
- Sin conexión a internet se usa la fuente del sistema. La app sigue funcionando; solo cambia la apariencia.

Los colores de estado (éxito, advertencia, error, info) mantienen su significado en tonos cálidos. `theme.test.ts` verifica que todas las combinaciones de texto y fondo cumplan contraste WCAG AA (4,5:1).

### Formatos

- Precios en pesos chilenos (enteros), con `Intl.NumberFormat('es-CL', { currency: 'CLP' })`.
- Fechas guardadas en ISO 8601 y mostradas en formato `es-CL`.

## Estructura de carpetas

```
frontend-pedidos360/
├── mock/
│   └── db.seed.json          # Datos semilla (db.json se genera con mock:reset)
├── public/
│   └── images/products/      # Ilustraciones de los productos semilla
└── src/
    ├── app/                  # Router, providers, tema, layout y páginas 403/404
    ├── auth/                 # AuthContext, useAuth, RoleGuard, LoginPage, permissions.ts
    ├── features/
    │   ├── catalog/
    │   │   ├── components/   # ProductCard, ProductTable, ProductImage, diálogos, formulario…
    │   │   ├── hooks/        # useProducts, useCreateProduct, … (TanStack Query)
    │   │   ├── pages/        # CatalogPage, ProductFormPage
    │   │   ├── schemas/      # productSchema, adjustStockSchema (Zod)
    │   │   ├── services/     # catalogService (llamadas HTTP)
    │   │   ├── types/        # Product
    │   │   └── utils/        # filterProducts, stockAdjustment, productImage
    │   ├── orders/
    │   │   ├── components/   # OrderStatusBadge, OrdersTable, OrderForm, historial…
    │   │   ├── hooks/        # useOrders, useOrder, useCreateOrder, useChangeOrderStatus
    │   │   ├── pages/        # OrderListPage, OrderFormPage, OrderDetailPage
    │   │   ├── schemas/      # orderFormSchema (Zod)
    │   │   ├── services/     # ordersService (incluye changeStatus y reglas de stock)
    │   │   ├── types/        # Order, OrderStatus, STATUS_LABELS
    │   │   ├── utils/        # orderStateMachine, orderTotals, filterOrders, buildNewOrder
    │   │   └── errors.ts     # Errores de dominio (transición inválida, stock insuficiente…)
    │   └── users/            # usersService, useUsers, useCustomers
    ├── shared/
    │   ├── api/              # apiClient (Axios)
    │   ├── components/       # EmptyState, QueryErrorAlert, MessagePage
    │   ├── notifications/    # NotificationProvider + useNotify (Snackbar)
    │   └── utils/            # formatCLP, formatDateTime, getErrorMessage, resizeImage
    └── test/                 # setup de Vitest, helpers y fixtures
```

Convenciones:

- Las llamadas HTTP van solo en `features/*/services/`, a través de `shared/api/apiClient.ts`.
- El estado del servidor se maneja con hooks de TanStack Query.
- Las reglas de negocio son funciones puras con tests.

## Tests

```bash
npm test
```

Cubren, entre otras cosas:

- La tabla de permisos completa.
- Todas las transiciones de estado, válidas e inválidas.
- Las reglas de stock de `changeStatus`, con `apiClient` mockeado sobre una base en memoria.
- Los esquemas Zod y los cálculos de totales.
- Los flujos principales de cada página con React Testing Library.

## Fuera de alcance en esta fase

Estas piezas quedan para la fase 2. En el código están marcadas con `TODO(fase2)`:

- Login real con **Azure AD / MSAL**. Hoy la sesión es simulada y `apiClient` tiene el lugar reservado para el header `Authorization: Bearer <token>`.
- **API Gateway, BFF y microservicios.** Por ejemplo, `ms-pedidos360-orders` hará en una sola llamada transaccional lo que hoy coordina `ordersService.changeStatus`: validar stock, descontarlo y actualizar el pedido.
- Aplicar los permisos en el backend. Hoy solo se aplican en la interfaz.
- Reportería, auditoría, notificaciones externas y dashboard de KPIs.
- Guardar las fotos en un almacenamiento de objetos y dejar en el producto solo su URL. Hoy van incrustadas en `db.json`.
- Kafka, RabbitMQ, Docker, AWS y Oracle.
