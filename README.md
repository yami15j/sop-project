# SOP Reviewer

**SOP Reviewer** es una plataforma web para la revisión automatizada de cartas de motivación y ensayos de postulación (*Statements of Purpose*) a becas internacionales. Fue construida para **La Comunidad del Intercambio**.

El sistema utiliza **Claude AI** (Anthropic) para analizar los ensayos con base en 10 criterios académicos y devolver puntajes detallados, sugerencias interlineales interactivas y reportes exportables en PDF.

---

## Inicio rápido

### 1. Instalar dependencias

```bash
cd app-ensayos
npm install
```

### 2. Configurar las variables de entorno

Crea el archivo `.env.local` en la raíz del proyecto con el siguiente contenido:

```env
NEXT_PUBLIC_SUPABASE_URL="tu_supabase_project_url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="tu_supabase_anon_key"
SUPABASE_SERVICE_ROLE_KEY="tu_supabase_service_role_key"
ANTHROPIC_API_KEY="tu_anthropic_api_key"
RESEND_API_KEY="tu_resend_api_key"

```

### 3. Levantar el servidor

```bash
npm run dev
```

Abre `http://localhost:3000` en el navegador.

### 4. Compilar para producción

```bash
npm run build
npm run start
```

---

## Comandos disponibles

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Servidor de desarrollo en `http://localhost:3000` |
| `npm run build` | Compilación optimizada para producción |
| `npm run start` | Servidor en producción (requiere `build` previo) |
| `npm run lint` | Análisis de código con ESLint |
| `node prueba.js` | Test de conexión con Claude API |
| `node test-status-values.js` | Validación de estados y RLS en Supabase |

---

## Stack principal

- Next.js 16.2.4 con App Router
- React 19.2.4 y Tailwind CSS v4
- Supabase (PostgreSQL, Auth, Storage)
- Anthropic SDK — Claude Opus 4.7 y Sonnet 4.6
- Resend para correos transaccionales
- Framer Motion v12

---

## Documentación del proyecto

| Archivo | Contenido |
| :--- | :--- |
| [DOCUMENTACION.md](./DOCUMENTACION.md) | Documentación técnica completa: módulos, base de datos, integración con IA, roles y troubleshooting |
| [PENDIENTES.md](./PENDIENTES.md) | Todo lo que falta implementar antes del lanzamiento |

---

## Estructura general

```text
app-ensayos/
├── src/
│   ├── app/
│   │   ├── admin/        # Panel de administración
│   │   ├── api/          # Endpoints: analyze, translate, auth
│   │   ├── dashboard/    # Panel del estudiante
│   │   └── ...           # Páginas de autenticación
│   ├── components/       # Componentes React reutilizables
│   └── utils/            # Clientes Supabase SSR
├── prompt_v1.md          # Rúbrica oficial del prompt de Claude
├── .env.local            # Variables de entorno (no subir al repositorio)
└── package.json
```

---

*SOP Reviewer — La Comunidad del Intercambio.*