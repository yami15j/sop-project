# Manual de Documentación Técnica Integral — SOP Reviewer
**Plataforma de Evaluación Automatizada y Gestión de Ensayos Académicos**  
*Desarrollado para La Comunidad del Intercambio*

---

## Índice General

1. [Resumen del Proyecto e Introducción](#1-resumen-del-proyecto-e-introducción)
2. [Guía de Instalación, Configuración y Comandos](#2-guía-de-instalación-configuración-y-comandos)
3. [Estructura del Proyecto y Código Fuente](#3-estructura-del-proyecto-y-código-fuente)
4. [Especificación de Módulos y Funcionalidades](#4-especificación-de-módulos-y-funcionalidades)
5. [Modelo y Esquema de Base de Datos (PostgreSQL - Supabase)](#5-modelo-y-esquema-de-base-de-datos-postgresql---supabase)
6. [Integraciones con APIs de Terceros (IA, DB, Storage y Correos)](#6-integraciones-con-apis-de-terceros-ia-db-storage-y-correos)
7. [Control de Accesos, Seguridad y Roles](#7-control-de-accesos-seguridad-y-roles)
8. [Reporte de Actividades Realizadas (Completas)](#8-reporte-de-actividades-realizadas-completas)
9. [Roadmap de Actividades Pendientes (Antes de Producción)](#9-roadmap-de-actividades-pendientes-antes-de-producción)
10. [Guía de Mantenimiento y Solución de Problemas (Troubleshooting)](#10-guía-de-mantenimiento-y-solución-de-problemas-troubleshooting)

---

## 1. Resumen del Proyecto e Introducción

**SOP Reviewer** es una aplicación web de última generación concebida y diseñada para **La Comunidad del Intercambio**. Su propósito es asistir a estudiantes en su postulación a prestigiosas becas de posgrado internacionales (tales como Chevening, Fulbright, Erasmus Mundus, DAAD, Eiffel, Fundación Carolina, MEXT, OEA, entre otras) mediante la revisión automática y detallada de sus cartas de motivación y declaraciones de propósito (*Statements of Purpose*).

El sistema utiliza modelos de lenguaje avanzados proporcionados por **Anthropic (Claude AI)** para analizar la prosa basándose en rúbricas oficiales estructuradas, proporcionando calificaciones cuantitativas de 0 a 10 para cada uno de los 10 criterios clave de evaluación académica, destacando fortalezas y áreas de mejora, y señalando sugerencias interlineales interactivas directamente sobre el texto del estudiante. Además, facilita la comunicación con mentores de forma directa y la exportación de reportes premium descargables en PDF.

---

## 2. Guía de Instalación, Configuración y Comandos

### 2.1 Requisitos Mínimos
* **Node.js:** Versión 18 LTS o superior.
* **Supabase:** Base de datos relacional PostgreSQL, Auth y Storage bucket.
* **Anthropic API Key:** Para el procesamiento del lenguaje y generación de rúbricas.
* **Resend API Key:** Para el envío de correspondencia electrónica desde el servidor.

### 2.2 Pasos de Instalación Local
1. **Clonar el proyecto e instalar dependencias:**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd app-ensayos
   npm install
   ```
2. **Crear archivo de configuración local:**
   Crea un archivo llamado `.env.local` en la raíz del directorio `app-ensayos/` con el siguiente contenido:
   ```env
   NEXT_PUBLIC_SUPABASE_URL="https://tu-proyecto.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="tu-anon-key-publica"
   SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key-de-servicio-admin"
   ANTHROPIC_API_KEY="sk-ant-api-clave-de-claude"
   RESEND_API_KEY="re_clave-de-resend"
   ```
3. **Iniciar el servidor web de desarrollo:**
   ```bash
   npm run dev
   ```
   La aplicación estará disponible localmente en [http://localhost:3000](http://localhost:3000).

### 2.3 Scripts de Ejecución Disponibles
* `npm run dev`: Servidor local con recarga instantánea.
* `npm run build`: Compila y optimiza la aplicación para producción.
* `npm run start`: Inicia el servidor de producción (requiere previa ejecución de `build`).
* `npm run lint`: Realiza el análisis estático del código fuente usando ESLint.
* `node prueba.js`: Ejecuta una llamada de prueba independiente a Claude API para validar la conexión.
* `node test-status-values.js`: Valida políticas RLS y estados de leads en Supabase de forma rápida.

---

## 3. Estructura del Proyecto y Código Fuente

El proyecto está organizado bajo el App Router de Next.js, distribuyendo de forma limpia el backend y el frontend:

```text
app-ensayos/
├── public/                       # Recursos estáticos públicos (imágenes, logos)
├── src/
│   ├── app/                      # Enrutamiento de la aplicación (App Router)
│   │   ├── admin/                # Módulo administrativo y vistas de mentores
│   │   │   ├── correos/          # Bandeja para visualización y envío de correos
│   │   │   ├── leads/            # Tabla de prospectos y gestión de estados
│   │   │   ├── metricas/         # Gráficos de barra y dona de países/becas
│   │   │   ├── perfil/           # Ajustes del administrador
│   │   │   ├── usuarios/         # Control de créditos de estudiantes
│   │   │   ├── actions.ts        # Acciones de servidor del panel admin
│   │   │   └── page.tsx          # Vista principal del panel
│   │   ├── api/                  # Endpoints de API en servidor
│   │   │   ├── analyze/          # POST: Análisis de rúbricas con Claude Opus
│   │   │   ├── auth/             # Callback de redirección de correo de Supabase
│   │   │   └── translate/        # POST: Traducción instantánea con Claude Sonnet
│   │   ├── dashboard/            # Módulo para estudiantes registrados
│   │   ├── welcome/              # Pantalla de onboarding inicial
│   │   ├── login/                # Inicio de sesión
│   │   ├── signup/               # Registro de usuarios
│   │   ├── globals.css           # Estilos globales y Tailwind CSS v4
│   │   └── page.tsx              # Landing page principal del producto
│   ├── components/               # Componentes UI reutilizables
│   │   ├── AnalyzeForm.tsx       # Caja de redacción y carga de PDF
│   │   ├── DashboardSidebar.tsx  # Historial y créditos en barra lateral
│   │   ├── FeedbackCard.tsx      # Renderizador del reporte y popovers de corrección
│   │   ├── MentoriaForm.tsx      # Solicitud de mentoría personalizada
│   │   └── admin/                # Componentes específicos del panel de control
│   └── utils/
│       └── supabase/             # Clientes Supabase SSR (client/server)
├── prompt_v1.md                  # Rúbrica y directrices del prompt de Claude
├── prueba.js                     # Test rápido de conexión a Claude
└── package.json                  # Definición de dependencias
```

---

## 4. Especificación de Módulos y Funcionalidades

### 4.1 Módulo del Estudiante
1. **Acceso y Registro:** Autenticación a través de formularios simplificados y adaptados con validación obligatoria de correo electrónico y número de WhatsApp.
2. **Subida de Documentos:** Formulario de postulación con llenado automático geográfico. Permite ingresar el ensayo por texto plano o cargar un archivo PDF (extrayendo el texto de forma automática con `pdfjs-dist`). Cuenta con un botón para traducir el ensayo al inglés o español al instante.
3. **Visualización de Calificaciones:** Muestra el reporte detallado estructurado por criterios y una versión del ensayo con subrayado en color donde, al pasar el cursor (hover), emergen popovers con la sugerencia de corrección específica de la IA.
4. **Solicitud de Mentorías:** Formulario integrado que captura datos críticos del alumno y los envía al panel de leads.

### 4.2 Módulo del Administrador (Mentores)
1. **Resumen Estadístico:** Tarjetas con indicadores del número de ensayos corregidos, cuentas activas y leads del mes.
2. **Gestión Comercial de Leads:** Flujo de cambio de estados para solicitudes de mentorías (`nuevo ➔ contactado ➔ en_proceso ➔ finalizado / rechazado`).
3. **Asignación de Créditos:** Asignación manual de saldo de créditos adicionales a cuentas seleccionadas para habilitar análisis extras.
4. **Bandeja de Correo Integrada:** Visualizador del ensayo del estudiante con editor de texto para redactar y enviar respuestas usando Resend de forma directa.

---

## 5. Modelo y Esquema de Base de Datos (PostgreSQL - Supabase)

### 5.1 Tabla: `profiles`
Define el rol de cada usuario y controla los créditos extra del alumno.
* `user_id` (`uuid`, PK): Referencia a la tabla `auth.users` de Supabase.
* `email` (`text`): Correo del usuario.
* `nombre` (`text`): Nombre completo.
* `rol` (`text`, default: `'estudiante'`): Roles posibles: `'admin'` o `'estudiante'`.
* `creditos_extra` (`integer`, default: `0`): Créditos extra asignados por el administrador.

### 5.2 Tabla: `ensayos_enviados`
Almacena el contenido del ensayo e información contextual de la postulación.
* `id` (`uuid`, PK): Identificador único del ensayo.
* `user_id` (`uuid`, FK ➔ `profiles.user_id`): Estudiante que lo envió.
* `contenido` (`text`): Texto del ensayo.
* `pais_destino` (`text`): País asociado.
* `beca_objetivo` (`text`): Beca a la que aplica.
* `nombre_usuario` (`text`): Nombre de contacto del alumno.
* `email_usuario` (`text`): Correo electrónico.
* `pdf_url` (`text`): URL del PDF del ensayo guardado en Supabase Storage.
* `created_at` (`timestamp with time zone`): Fecha de creación.

### 5.3 Tabla: `feedback_generado`
Resguarda la evaluación y puntajes finales entregados por la inteligencia artificial.
* `id` (`uuid`, PK): Identificador de la evaluación.
* `ensayo_id` (`uuid`, FK ➔ `ensayos_enviados.id` con borrado en cascada).
* `puntaje` (`integer`): Calificación cuantitativa general obtenida (de 0 a 10).
* `raw_response` (`text`): Respuesta estructurada de Claude con anotaciones XML.
* `created_at` (`timestamp with time zone`).

### 5.4 Tabla: `leads_mentoria`
Captura las peticiones de contacto para asesorías personalizadas.
* `id` (`uuid`, PK): Identificador de la mentoría.
* `user_id` (`uuid`, FK ➔ `profiles.user_id`).
* `nombre` / `email` / `telefono` (`text`).
* `beca_objetivo` / `pais_destino` / `deadline` (`text`).
* `estado` (`text`, default: `'nuevo'`): Estados: `nuevo`, `contactado`, `en_proceso`, `finalizado`, `rechazado`.

### 5.5 Almacenamiento (Supabase Storage)
Se utiliza un bucket privado llamado `Ensayos` con una estructura de carpetas `/originales` para almacenar de forma segura los archivos subidos.

---

## 6. Integraciones con APIs de Terceros

### 6.1 Anthropic Claude API
* **Endpoint de Análisis (`POST /api/analyze`):** Emplea `claude-opus-4-7` con *Adaptive Thinking* para calificar la estructura narrada según rúbricas inyectadas de `prompt_v1.md`.
* **Endpoint de Traducción (`POST /api/translate`):** Emplea `claude-sonnet-4-6` para traducir textos sin añadir comentarios externos, conservando párrafos e idioma objetivo.

### 6.2 Supabase Client & Server
* Utiliza el SDK `@supabase/ssr` para sincronizar la sesión mediante cookies y tokens JWT cifrados del lado del servidor (SSR) y del cliente.
* La base de datos relacional se conecta directamente desde Next.js a través de Server Actions.

### 6.3 Resend Correo Transaccional
* Envía correspondencia HTML desde el backend hacia el estudiante.
* Conectado a través del SDK oficial de `resend` importando la API Key.

---

## 7. Control de Accesos, Seguridad y Roles

El sistema cuenta con dos roles diferenciados que regulan los permisos en la aplicación:
1. **Rol `estudiante`:** Accede de forma exclusiva a `/dashboard`. Sus peticiones de lectura en la base de datos están reguladas por políticas de seguridad RLS en Supabase que validan que el `user_id` de la tabla coincida con `auth.uid()`.
2. **Rol `admin`:** Accede al panel de control en `/admin`. El acceso se protege mediante un layout de servidor middleware que verifica el rol en la base de datos antes de pintar los elementos HTML. Las acciones de administración omiten la política RLS del cliente haciendo uso de la clave privada `SUPABASE_SERVICE_ROLE_KEY` del lado del servidor.

---

## 8. Reporte de Actividades Realizadas (Completadas)

1. **Compactación y Pulido de Formularios:** Rediseño de los formularios de registro y acceso con anchos compactos de `380px` para prevenir scroll vertical en pantallas chicas.
2. **Ajuste del Área del Ensayo:** Se dimensionó el cuadro de texto del ensayo a una altura mínima de `340px` (15 filas) que optimiza el viewport de portátiles.
3. **Mantenimiento del Encabezado:** Se redujo el tamaño de los elementos superiores (pill de créditos, tarjeta de perfil con imagen circular) para lograr un panel estilizado y discreto.
4. **Soporte de Traducción Bidireccional:** Habilitación de traducción de prosa entre español e inglés de forma nativa e integrada en el formulario.
5. **Corrección de Sintaxis de Anotaciones:** Se depuró la sintaxis en la renderización de sugerencias de `FeedbackCard.tsx`, solucionando el error de compilación por falta de etiquetas condicionadas en el XML de Claude.
6. **Optimización del Menú de Perfil:** Remoción de la opción redundante "Vista Estudiante" de la tarjeta emergente de perfil del administrador, manteniéndola visible únicamente en el menú de navegación principal del panel sidebar.

---

## 9. Roadmap de Actividades Pendientes (Antes de Producción)

1. **Integración de Pasarela de Pagos (Stripe):**
   - Implementar control HTTP 403 en `/api/analyze` cuando el estudiante se quede sin créditos gratuitos.
   - Descontar 1 crédito de `profiles.creditos_extra` tras cada revisión exitosa.
   - Desarrollar la vista `/pricing` y conectar la creación de órdenes en Stripe (`/api/checkout`).
   - Configurar webhook de recepción de cobros (`/api/webhooks/pagos`) para activar créditos adquiridos.
2. **Crear Tabla `compras` en Supabase:** Ejecutar la migración SQL para habilitar la tabla de transacciones de Stripe.
3. **Auditoría RLS Completa:** Evaluar e inspeccionar las políticas de seguridad RLS en Supabase para las tablas `ensayos_enviados`, `leads_mentoria` y `feedback_generado`.
4. **Rate Limiting:** Implementar limitador de peticiones con `@upstash/ratelimit` y Redis para resguardar la API de Claude contra abusos.
5. **Monitoreo de Excepciones:** Integración del SDK de Sentry en el entorno de producción.
6. **Políticas de Privacidad y Legales:** Crear las rutas públicas `/terminos` y `/privacidad` con la cláusula de aceptación del estudiante en el formulario de signup.
7. **Notificaciones por Correo Automáticas:** Programar en Resend los correos automáticos de bienvenida, confirmación de análisis de ensayos y recibos de cobros.
8. **Seguridad en Cargas PDF:** Validar tipo MIME de archivos en backend, restringir cargas a 5MB y advertir si el documento subido carece de texto seleccionable (imagen sin OCR).
9. **Caché Inteligente de Respuestas:** Crear sistema de hash de texto para evitar reevaluar el mismo ensayo de un alumno y evitar consumos duplicados a Claude Opus.
10. **Exportación a CSV:** Crear botón en el panel admin de descarga de leads en formato `.csv`.

---

## 10. Guía de Mantenimiento y Solución de Problemas (Troubleshooting)

* **El servidor local no arranca:**
  - Verifica la correcta instalación de paquetes ejecutando `npm install`.
  - Asegura que el archivo `.env.local` exista y no contenga saltos de línea incorrectos o valores sin comillas.
* **Error de permisos en acciones del Administrador (RLS de Supabase):**
  - Confirma que la variable `SUPABASE_SERVICE_ROLE_KEY` del backend coincida con la provista por tu consola de Supabase.
* **Claude API no procesa el ensayo:**
  - Ejecuta `node prueba.js` en consola. Si falla, valida el saldo de tu API Key de Anthropic.
* **El PDF cargado no muestra el texto en la caja:**
  - Ocurre cuando el documento es una imagen escaneada sin OCR. Se debe aconsejar al usuario que copie y pegue el texto de su ensayo de forma manual en el formulario.

---
*Fin del Manual de Documentación Técnica Integral.*
