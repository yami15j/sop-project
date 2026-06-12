# Reporte de Actividades Realizadas y Pendientes — SOP Reviewer

Este documento detalla el estado actual del desarrollo del proyecto **SOP Reviewer** para **La Comunidad del Intercambio**. Contiene el desglose de los módulos y funcionalidades ya completados y puestos en marcha, así como la lista detallada de tareas de integración, optimización y validación pendientes antes del lanzamiento final a producción.

---

## 1. Módulos y Funcionalidades Completadas (Actividades Realizadas)

### 1.1 Módulo del Estudiante
* **Landing Page de Alto Impacto:** Interfaz moderna estilada en tonos azul marca, tipografía *Plus Jakarta Sans* y animaciones dinámicas con *Framer Motion*. Acceso directo y responsive a flujos de autenticación.
* **Flujo de Onboarding (`/welcome`):** Pantalla de inducción que instruye a los usuarios nuevos en el uso de la IA antes de iniciar su primera evaluación.
* **Autenticación Compacta y Segura:** Formularios de inicio de sesión (`/login`), registro (`/signup`), recuperación (`/forgot-password`) y actualización de clave (`/reset-password`) optimizados para pantallas pequeñas (`max-w-[380px]`) con validación obligatoria de correo electrónico.
* **Formulario de Carga Dinámico (`AnalyzeForm`):** 
  - Selección de país y beca con llenado automático inteligente de geolocalización.
  - Advertencias contextuales en tiempo real ante inconsistencias geográficas (ej. beca Chevening hacia España).
  - Extracción automática de texto de archivos PDF mediante `pdfjs-dist` directamente en el navegador del cliente.
  - Área de redacción de ensayos optimizada a `340px` (15 filas) que evita el desbordamiento vertical y scroll de página en pantallas de portátiles estándar.
  - Botón integrado de traducción bidireccional inmediata (español ⇄ inglés) libre de comentarios adicionales de IA.
* **Visualizador de Reportes e Historial:**
  - Historial de ensayos previos en barra lateral izquierda, con visualización compacta y puntajes codificados por color (Verde: ≥8, Naranja: 5-7, Rojo: <5).
  - Desglose cuantitativo de 10 criterios de evaluación con barras de progreso.
  - Resaltado de texto original e interacciones flotantes (popovers) para visualizar las correcciones sugeridas por la IA al pasar el cursor.
  - Descarga de reportes evaluados en PDF con formato académico elegante.

### 1.2 Módulo de Administración
* **Protección de Ruta Nivel Servidor:** Middleware integrado en `src/app/admin/layout.tsx` que verifica en tiempo de ejecución que el usuario posea `rol = 'admin'` en la tabla `profiles` antes de renderizar la página.
* **Sincronización en Tiempo Real (Supabase Realtime):** Integración activa para escuchar inserciones y actualizaciones en `ensayos_enviados`, `leads_mentoria` y `profiles`. Los cambios se reflejan en pantalla en tiempo real sin recargar, acompañados de un sistema dinámico de notificaciones con contador visual y previsualizador.
* **Gestión de Leads y Prospectos:** Vista administrativa en tabla filtrable por estado y asesor. Permite actualizar el estado del lead (`nuevo ➔ contactado ➔ en_proceso ➔ finalizado / rechazado`), registrar prospectos manualmente (con creación de credenciales en Supabase Auth) y eliminar registros de forma permanente.
* **Administración de Créditos Extra:** Panel interactivo para asignar y auditar el saldo de créditos de análisis de ensayos por estudiante individualmente.
* **Bandeja de Correo y Respuestas (Resend):** Área para visualizar el ensayo original de cada estudiante y enviar correos de retroalimentación o notificaciones personalizadas de manera directa desde la interfaz administrativa.
* **Limpieza de UI y Estilo de Marca:** Remoción de elementos e iconos repetidos. La barra de perfil del administrador en la barra lateral contiene las opciones de "Mi Perfil" y "Cerrar sesión", habiendo removido accesos redundantes para un acabado minimalista.

---

## 2. Roadmap de Desarrollo (Actividades Pendientes)

### 2.1 Sistema de Créditos Autónomos y Pasarela de Stripe
* **Objetivo:** Automatizar la compra y asignación de créditos de análisis y mentorías premium, eliminando la intervención manual del administrador.
* **Tareas a realizar:**
  - Configurar las validaciones del lado del servidor en `/api/analyze` para rechazar (HTTP 403) peticiones de estudiantes con saldo de créditos igual a cero.
  - Descontar automáticamente un crédito (`creditos_extra`) tras cada análisis exitoso guardado.
  - Crear la ruta `/pricing` o vista de planes dentro de `/dashboard` con las tarifas.
  - Desarrollar la API de checkout de Stripe (`/api/checkout`) y el webhook de confirmación (`/api/webhooks/stripe`) para sumar créditos de forma inmediata tras el pago exitoso.

### 2.2 Tabla de Transacciones `compras`
Es necesario aprovisionar la siguiente tabla en PostgreSQL (Supabase) para almacenar el historial de ventas:
```sql
CREATE TABLE public.compras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  monto numeric(10,2) NOT NULL,
  moneda text DEFAULT 'USD',
  proveedor_pago text DEFAULT 'stripe',
  id_transaccion text UNIQUE NOT NULL,
  estado text DEFAULT 'pendiente', -- completado, pendiente, fallido
  creditos_otorgados integer NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### 2.3 Auditoría de Seguridad y Row Level Security (RLS)
* **Objetivo:** Proteger la base de datos contra accesos no autorizados mediante políticas estrictas a nivel de fila.
* **Tareas a realizar:**
  - Confirmar que un estudiante autenticado solo pueda leer y escribir registros que posean su propio `user_id` en las tablas `ensayos_enviados` y `feedback_generado`.
  - Asegurar que `leads_mentoria` sea privada para el creador del lead y para usuarios administradores.
  - Bloquear el acceso de modificación de campos sensibles (`rol` y `creditos_extra` en `profiles`) por parte de usuarios externos.

### 2.4 Control de Tráfico y Rate Limiting
* **Objetivo:** Evitar sobrecostos y denegación de servicio por peticiones repetitivas abusivas.
* **Tareas a realizar:**
  - Integrar un middleware de rate limiting por IP y por `user_id` utilizando `@upstash/ratelimit` con base de datos Redis en los endpoints `/api/analyze` y `/api/translate`.

### 2.5 Monitoreo e Monitoreo de Excepciones (Sentry)
* **Objetivo:** Identificar incidencias en producción antes de que afecten a la experiencia del usuario.
* **Tareas a realizar:**
  - Implementar el SDK de Sentry para capturar y clasificar errores de API (Anthropic Claude, base de datos y pasarela de pago).

### 2.6 Páginas Legales y de Privacidad
* **Objetivo:** Cumplir con requerimientos obligatorios de pasarelas de pago y regulaciones de tratamiento de datos.
* **Tareas a realizar:**
  - Crear la vista `/terminos` (Términos de Servicio).
  - Crear la vista `/privacidad` (Tratamiento y resguardo confidencial de ensayos subidos).
  - Incluir checkbox de aceptación obligatoria durante el registro del estudiante.

### 2.7 Verificación de Trigger de Registro en Base de Datos
* **Objetivo:** Garantizar la consistencia de los datos del perfil al momento del registro.
* **Tareas a realizar:**
  - Asegurar la presencia del trigger PostgreSQL que crea de forma automática una fila en `profiles` por cada registro nuevo en `auth.users`:
  ```sql
  CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger AS $$
  BEGIN
    INSERT INTO public.profiles (user_id, email, nombre, rol, creditos_extra)
    VALUES (NEW.id, NEW.email, '', 'estudiante', 0);
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  ```

### 2.8 Automatización de Notificaciones por Correo Electrónico
* **Objetivo:** Mantener una comunicación fluida y reactiva con el alumno.
* **Tareas a realizar:**
  - Programar llamadas automáticas en Resend al concretarse:
    - Registro de cuenta (bienvenida).
    - Reporte de análisis de ensayo completado.
    - Confirmación de compra y recibo de Stripe.
    - Alerta al equipo de mentores ante un nuevo prospecto de mentoría.

### 2.9 Seguridad y Validación de Archivos Subidos (PDF)
* **Objetivo:** Controlar y verificar las cargas del estudiante.
* **Tareas a realizar:**
  - Validar tipo MIME y extensión de archivo directamente en el backend.
  - Limitar el peso del archivo a 5 MB.
  - Implementar detector que identifique si el PDF subido carece de capa de texto seleccionable (imagen sin OCR) y solicite al estudiante copiar y pegar el texto a mano.

### 2.10 Mejoras Operativas del Administrador
* **Tareas a realizar:**
  - Agregar botón de descarga directa de archivos PDF desde la vista de leads.
  - Crear la tabla `correos_enviados` para almacenar de forma persistente el historial de respuestas redactadas por los mentores, sirviendo como registro de comunicación.

### 2.11 Pruebas de Software Unitarias y de Integración
* **Tareas a realizar:**
  - Implementar cobertura de pruebas automatizadas sobre la lógica de análisis del backend y los endpoints de traducción utilizando Vitest o Jest.

### 2.12 Caché Inteligente de Respuestas de Inteligencia Artificial
* **Tareas a realizar:**
  - Implementar validación mediante hash (huella digital) de los ensayos. Si un alumno reenvía el mismo ensayo sin alteraciones, retornar el resultado ya almacenado en `feedback_generado` en lugar de realizar una nueva llamada pagada a Claude Opus.

### 2.13 Exportación de Reportes del Administrador a CSV
* **Tareas a realizar:**
  - Diseñar botón en el panel admin para exportar la tabla de leads filtrada directamente a un archivo `.csv` descargable para control y seguimiento comercial externo.

### 2.14 Versionado de Prompts y Rúbricas
* **Tareas a realizar:**
  - Establecer un sistema estructurado de control de versiones de prompts (ej. `prompt_v2.md`) para auditar la evolución de la precisión de Claude en sus evaluaciones.

---
*Reporte oficial de actividades de SOP Reviewer — La Comunidad del Intercambio.*