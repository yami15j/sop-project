# Documentación Técnica — SOP Reviewer

Este documento contiene toda la información técnica necesaria para comprender, instalar, configurar y mantener **SOP Reviewer**, una plataforma web construida para **La Comunidad del Intercambio** que permite a estudiantes recibir análisis automatizado de sus cartas de motivación y ensayos de postulación a becas internacionales.

---

## Tabla de Contenidos

1. [Introducción y Propósito](#1-introducción-y-propósito)
2. [Requisitos Previos](#2-requisitos-previos)
3. [Instalación y Configuración](#3-instalación-y-configuración)
4. [Variables de Entorno](#4-variables-de-entorno)
5. [Comandos del Proyecto](#5-comandos-del-proyecto)
6. [Estructura del Proyecto](#6-estructura-del-proyecto)
7. [Módulos y Funcionalidades](#7-módulos-y-funcionalidades)
8. [Base de Datos — Supabase](#8-base-de-datos--supabase)
9. [Integración con IA — Claude API](#9-integración-con-ia--claude-api)
10. [Roles y Autenticación](#10-roles-y-autenticación)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Introducción y Propósito

**SOP Reviewer** es una herramienta web interactiva orientada a estudiantes que postulan a becas internacionales como Chevening, Fulbright, DAAD, Erasmus Mundus, Eiffel, Fundación Carolina, MEXT y OEA, entre otras. El sistema les permite subir sus *Statements of Purpose* o cartas de motivación y recibir, en segundos, un análisis detallado con las siguientes salidas:

- Un desglose de puntajes basado en 10 criterios de evaluación académica.
- Sugerencias interlineales resaltadas directamente sobre el texto original.
- La opción de exportar el reporte completo en PDF o traducir el ensayo en tiempo real.
- Un formulario para solicitar mentoría con un experto humano.

Adicionalmente, la plataforma cuenta con un panel de administración completo desde el cual los mentores pueden gestionar leads de mentoría, enviar correos directamente via Resend, revisar métricas de uso y administrar los créditos de análisis de cada estudiante.

---

## 2. Requisitos Previos

Para ejecutar el proyecto en un entorno local, se requiere lo siguiente:

| Requisito | Versión mínima | Notas |
| :--- | :--- | :--- |
| Node.js | v18 LTS o superior | Incluye NPM |
| Cuenta Supabase | — | Para base de datos, autenticación y storage |
| API Key Anthropic | — | Para el análisis con Claude |
| API Key Resend | — | Para correos transaccionales |

Son compatibles los gestores de paquetes NPM, Yarn, PNPM y Bun.

### Stack tecnológico

| Categoría | Tecnología | Versión |
| :--- | :--- | :--- |
| Framework | Next.js con App Router | 16.2.4 |
| UI | React | 19.2.4 |
| Estilos | Tailwind CSS (via `@tailwindcss/postcss`) | v4 |
| Base de datos y Auth | Supabase SSR + Supabase JS Client | v2 |
| Inteligencia Artificial | Anthropic SDK (Claude Opus 4.7 y Sonnet 4.6) | — |
| Animaciones | Framer Motion | v12 |
| Lectura de PDF | `pdfjs-dist` | — |
| Exportación de PDF | `jspdf`, `html2canvas`, `html2pdf.js` | — |
| Correos | Resend SDK | — |

---

## 3. Instalación y Configuración

### Paso 1 — Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd app-ensayos
```

### Paso 2 — Instalar dependencias

```bash
npm install
```

### Paso 3 — Configurar las variables de entorno

Crea el archivo `.env.local` en la raíz del proyecto con los valores descritos en la sección siguiente.

### Paso 4 — Levantar el servidor de desarrollo

```bash
npm run dev
```

La aplicación queda disponible en `http://localhost:3000`.

---

## 4. Variables de Entorno

Crea el archivo `.env.local` dentro del directorio `app-ensayos/` con el siguiente contenido:

```env
# Supabase — cliente público
NEXT_PUBLIC_SUPABASE_URL="tu_supabase_project_url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="tu_supabase_anon_key"

# Supabase — clave de servicio para operaciones administrativas
SUPABASE_SERVICE_ROLE_KEY="tu_supabase_service_role_key"

# Anthropic — análisis con Claude
ANTHROPIC_API_KEY="tu_anthropic_api_key"

# Resend — envío de correos transaccionales
RESEND_API_KEY="tu_resend_api_key"
```

**Importante:** el archivo `.env.local` nunca debe subirse al repositorio. Confirma que está incluido en el `.gitignore` antes de hacer cualquier commit.

La variable `SUPABASE_SERVICE_ROLE_KEY` es necesaria para las Server Actions del panel de administración, ya que esas operaciones requieren permisos que superan las políticas RLS del cliente público.

---

## 5. Comandos del Proyecto

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo en `http://localhost:3000` |
| `npm run build` | Compila la aplicación optimizada para producción |
| `npm run start` | Inicia el servidor en producción (requiere `build` previo) |
| `npm run lint` | Ejecuta ESLint para detectar errores de sintaxis y estilo |
| `node prueba.js` | Valida la conexión y respuesta de la Claude API |
| `node test-status-values.js` | Comprueba el RLS y las transiciones de estado de leads en Supabase |

---

## 6. Estructura del Proyecto

```text
app-ensayos/
├── .next/                        # Caché y archivos compilados por Next.js
├── node_modules/                 # Dependencias instaladas
├── public/                       # Archivos estáticos (imágenes, logos)
├── src/
│   ├── app/                      # App Router de Next.js
│   │   ├── admin/                # Panel de administración
│   │   │   ├── correos/          # Bandeja y respuesta de correos
│   │   │   ├── leads/            # Gestión de leads de mentoría
│   │   │   ├── metricas/         # Gráficos y estadísticas
│   │   │   ├── perfil/           # Configuración del administrador
│   │   │   ├── usuarios/         # Control de accesos y créditos
│   │   │   ├── actions.ts        # Server Actions administrativos
│   │   │   ├── layout.tsx        # Layout con protección de ruta admin
│   │   │   └── page.tsx          # Dashboard principal
│   │   ├── api/
│   │   │   ├── analyze/          # POST: validación y análisis con Claude Opus
│   │   │   ├── auth/             # Callbacks de redirección de Supabase Auth
│   │   │   └── translate/        # POST: traducción con Claude Sonnet
│   │   ├── dashboard/            # Panel del estudiante
│   │   │   ├── actions.ts        # Server Actions (mentoría, logout)
│   │   │   └── page.tsx          # Subida, historial y reporte
│   │   ├── forgot-password/      # Formulario de recuperación de clave
│   │   ├── login/                # Inicio de sesión
│   │   ├── reset-password/       # Cambio de contraseña
│   │   ├── signup/               # Registro de nuevos estudiantes
│   │   ├── welcome/              # Pantalla de onboarding inicial
│   │   ├── globals.css           # Estilos globales y Tailwind CSS v4
│   │   ├── layout.tsx            # Layout raíz (tipografía, HTML base)
│   │   └── page.tsx              # Landing Page
│   ├── components/
│   │   ├── admin/
│   │   │   ├── EmailsTab.tsx         # Bandeja y redacción de correos
│   │   │   ├── InicioDashboard.tsx   # Métricas y resúmenes del panel
│   │   │   ├── LeadsTab.tsx          # Tabla de gestión de leads
│   │   │   ├── MetricsTab.tsx        # Gráficos y analíticas
│   │   │   └── UsersTab.tsx          # Administración de usuarios y créditos
│   │   ├── AnalyzeForm.tsx           # Formulario de subida de ensayos
│   │   ├── CollapsibleStats.tsx      # Desglose interactivo de puntajes
│   │   ├── DashboardSidebar.tsx      # Menú lateral e historial
│   │   ├── ErrorBanner.tsx           # Alertas de error
│   │   ├── FeedbackCard.tsx          # Reporte de feedback y exportación PDF
│   │   ├── MentoriaForm.tsx          # Formulario de contacto para mentorías
│   │   └── VerificationBanner.tsx    # Alerta de correo no verificado
│   └── utils/
│       └── supabase/                 # Clientes Supabase SSR (client y server)
├── prompt_v1.md              # Rúbrica y prompt oficial para Claude
├── prueba.js                 # Script de prueba de integración con Claude API
├── test-status-values.js     # Script de validación de estados en Supabase
├── package.json              # Dependencias y scripts del proyecto
└── tsconfig.json             # Configuración de TypeScript
```

---

## 7. Módulos y Funcionalidades

### Módulo del Estudiante

**Landing Page**

Página promocional con mesh gradients y animaciones via Framer Motion. Incluye acceso directo al registro y al inicio de sesión.

**Onboarding (`/welcome`)**

Pantalla de bienvenida que introduce al estudiante a las funcionalidades principales antes de su primer análisis.

**Autenticación**

Flujo completo gestionado por Supabase Auth que cubre registro (`/signup`) con validación de correo obligatoria, inicio de sesión (`/login`), recuperación de clave (`/forgot-password`) y cambio de contraseña (`/reset-password`).

**Subida de ensayos**

El formulario permite seleccionar el país de destino y la beca objetivo. Incluye advertencias contextuales en tiempo real cuando se detecta una inconsistencia geográfica (por ejemplo, seleccionar la beca Chevening con España como país de destino). También permite subir un archivo PDF directamente, del cual se extrae el texto de forma automática en el navegador usando `pdfjs-dist`. Hay un botón de traducción integrado que convierte el texto entre español e inglés en un solo clic usando Claude Sonnet.

**Visualizador de feedback**

Muestra los puntajes de 0 a 10 para cada uno de los 10 criterios de evaluación, con barras de progreso animadas. El texto del ensayo se presenta con resaltado inline: al pasar el cursor sobre los fragmentos marcados por la IA se despliega un popover con la sugerencia correspondiente. El reporte completo se puede exportar en PDF.

**Solicitud de mentoría**

Formulario que captura datos de contacto adicionales (WhatsApp, beca, país, deadline) y notifica al equipo mentor.

---

### Módulo del Administrador

**Protección de rutas**

El archivo `layout.tsx` del panel admin verifica que el usuario autenticado tenga `rol = 'admin'` en la tabla `profiles`. Si no cumple la condición, lo redirige fuera del panel.

**Dashboard principal**

Resumen de ensayos evaluados, estudiantes registrados y leads activos en el período.

**Gestión de leads**

Vista en tabla filtrable por estado. Permite cambiar el estado de cada lead a través del flujo `nuevo → contactado → en_proceso → finalizado` o `rechazado`. También permite registrar manualmente alumnos captados fuera de la plataforma y eliminar registros de forma permanente.

**Administración de usuarios**

Permite asignar créditos de análisis adicionales a alumnos individuales y consultar el consumo histórico de cada uno.

**Estadísticas y métricas**

Gráficos interactivos de barra y dona que agrupan las becas más solicitadas, los países destino más elegidos y el volumen de leads por estado.

**Bandeja de correos**

Lista de ensayos con los datos de contacto del estudiante. Incluye un formulario para redactar y enviar respuestas directamente a través del backend de Resend.

---

## 8. Base de Datos — Supabase

El sistema utiliza PostgreSQL a través de Supabase. A continuación se describe el esquema de las cuatro tablas principales.

### Tabla `profiles`

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `user_id` | `uuid` PK | Vinculado con Supabase Auth |
| `email` | `text` | Correo del usuario |
| `nombre` | `text` | Nombre completo |
| `telefono` | `text` (opcional) | Teléfono de contacto |
| `rol` | `text` (default: `'estudiante'`) | Valores posibles: `'admin'` o `'estudiante'` |
| `creditos_extra` | `integer` (default: `0`) | Análisis adicionales habilitados por el admin |

### Tabla `ensayos_enviados`

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | `uuid` PK | — |
| `user_id` | `uuid` FK → `profiles.user_id` | Puede ser NULL |
| `contenido` | `text` | Cuerpo del ensayo |
| `pais_destino` | `text` | País asociado a la beca |
| `beca_objetivo` | `text` | Nombre de la beca |
| `nombre_usuario` | `text` | Nombre del postulante |
| `email_usuario` | `text` | Correo del postulante |
| `pdf_url` | `text` (opcional) | URL del PDF en Supabase Storage |
| `created_at` | `timestamp with time zone` | — |

### Tabla `leads_mentoria`

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | `uuid` PK | — |
| `user_id` | `uuid` FK → `profiles.user_id` | — |
| `email` | `text` | Correo de contacto |
| `nombre` | `text` | — |
| `telefono` | `text` | — |
| `beca_objetivo` | `text` | — |
| `deadline` | `text` | Fecha límite de postulación |
| `pais_destino` | `text` | — |
| `estado` | `text` (default: `'nuevo'`) | Check constraint: `nuevo`, `contactado`, `en_proceso`, `finalizado`, `rechazado` |
| `created_at` | `timestamp with time zone` | — |

### Tabla `feedback_generado`

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | `uuid` PK | — |
| `ensayo_id` | `uuid` FK → `ensayos_enviados.id` | Con borrado en cascada |
| `puntaje` | `integer` | Puntaje general de 0 a 10 |
| `raw_response` | `text` | Respuesta XML inline generada por Claude |
| `created_at` | `timestamp with time zone` | — |

### Almacenamiento (Supabase Storage)

Se utiliza un bucket llamado `Ensayos` con una carpeta `originales/` donde se almacenan los archivos PDF subidos por los estudiantes. Estos archivos se enlazan desde el panel de control del administrador.

---

## 9. Integración con IA — Claude API

### Endpoint de análisis — `POST /api/analyze`

**Modelo:** `claude-opus-4-7` con Adaptive Thinking.

El flujo de ejecución es el siguiente:

1. Se realiza una validación previa en Node.js para descartar contenido que no sea prosa: código fuente, JSON, listas con alta densidad de dos puntos, o textos con densidad numérica propia de presupuestos.
2. Se lee el archivo `prompt_v1.md`, que contiene la rúbrica oficial con instrucciones metodológicas y la escala de puntaje para cada criterio (Motivación, Logros, Introducción, Conexión Universitaria, Impacto a Futuro, Voz, entre otros).
3. Se ejecuta la llamada a la API de Anthropic en modo de análisis adaptativo.
4. Se valida si Claude retornó el tag `[ERROR: NO_ES_UN_ENSAYO]`, para los casos en que el texto evadió el filtro local pero no corresponde a un ensayo.
5. Se extrae el puntaje mediante expresión regular y se guarda en Supabase, asociando el ensayo con su reporte de feedback.

### Endpoint de traducción — `POST /api/translate`

**Modelo:** `claude-sonnet-4-6`.

Recibe el texto en prosa y el idioma destino. Devuelve la traducción del contenido académico sin añadir introducciones ni comentarios, conservando todos los saltos de línea originales.

---

## 10. Roles y Autenticación

El sistema maneja dos roles, definidos en la columna `rol` de la tabla `profiles`:

| Rol | Acceso |
| :--- | :--- |
| `estudiante` | Dashboard, análisis de ensayos, historial, solicitud de mentoría |
| `admin` | Todo lo anterior más el panel de administración completo |

El rol `admin` se asigna manualmente desde el panel de Supabase directamente en la tabla `profiles`. No existe un flujo de interfaz para hacerlo, lo cual es intencional.

El flujo de autenticación funciona de la siguiente manera: el usuario se registra en `/signup`, Supabase crea su entrada en `auth.users`, y un trigger de base de datos inserta automáticamente una fila en `profiles` con `rol = 'estudiante'`. Al acceder al panel admin, el `layout.tsx` consulta `profiles` para verificar el rol antes de renderizar cualquier contenido.

---

## 11. Troubleshooting

**El servidor no levanta tras `npm run dev`**

Verificar que el archivo `.env.local` existe y tiene todos los valores completos. Si las dependencias no están instaladas, ejecutar `npm install` primero.

**Error de permisos en Supabase (RLS)**

Las Server Actions del panel admin necesitan la `SUPABASE_SERVICE_ROLE_KEY` definida en `.env.local`. También conviene revisar que las políticas RLS de cada tabla permitan las operaciones que se están intentando realizar.

**Claude no responde o devuelve error**

Ejecutar `node prueba.js` para verificar que la `ANTHROPIC_API_KEY` es válida. Confirmar también que el archivo `prompt_v1.md` existe en la raíz del proyecto.

**Los correos no se envían**

Verificar que la `RESEND_API_KEY` es válida y que el dominio remitente está verificado en el panel de Resend.

**El PDF no se lee correctamente**

`pdfjs-dist` opera en el navegador y solo puede extraer texto de PDFs con texto seleccionable. Si el archivo está protegido contra copia o fue generado por escaneo sin OCR, la extracción no funcionará.

---

*Documentación técnica de SOP Reviewer — La Comunidad del Intercambio.*