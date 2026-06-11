# Actividades Realizadas y Pendientes — SOP Reviewer

Este documento detalla el estado actual del proyecto, las funcionalidades ya completadas y todo lo que falta implementar antes del lanzamiento a producción.

---

## Lo que ya está completo

### Panel de administración

El panel de control está completamente funcional con todas sus vistas: métricas estadísticas, gestión de usuarios y créditos, seguimiento de leads de mentoría, redacción y envío de correos, y configuración del perfil del administrador.

El acceso está restringido correctamente a nivel de servidor en `src/app/admin/layout.tsx`, verificando que el usuario tenga el rol `admin` en la tabla `profiles` antes de renderizar cualquier contenido.

Los administradores pueden registrar alumnos y prospectos de forma manual directamente desde el panel, con creación simultánea en Supabase Auth y en la tabla `leads_mentoria`. Las vistas cuentan con filtros por estado, por asesor y búsqueda por texto en tiempo real.

### Sincronización en tiempo real

El layout principal del administrador escucha eventos de la base de datos en tiempo real a través de Supabase Realtime. Cualquier inserción, actualización o eliminación en las tablas `profiles`, `ensayos_enviados` y `leads_mentoria` se refleja automáticamente en pantalla sin necesidad de recargar la página. La barra superior incluye una campana de notificaciones con contador y previsualización de los eventos recientes.

### Autenticación y registro

El formulario de registro público y el modal de creación manual en el panel tienen el campo de teléfono/WhatsApp como obligatorio, tanto en validación de cliente como de servidor. Se implementó detección de correos duplicados para evitar conflictos al registrar leads que ya tienen una cuenta activa.

### Integración con Claude API

El análisis de ensayos funciona mediante el modelo `claude-opus-4-7` con Adaptive Thinking, y la traducción de textos usa `claude-sonnet-4-6`. Ambos endpoints están operativos.

### Envío de correos

La conexión con Resend está activa. Los mentores pueden redactar respuestas desde el panel y enviarlas directamente al correo del estudiante.

### Diseño y detalles visuales

Se removieron iconos no esenciales, se estandarizaron los tamaños de título en el panel, se ajustó el espaciado superior para evitar colisiones con la barra de navegación, y se integró un editor de recorte circular para el avatar del perfil del administrador.

---

## Lo que falta implementar

### 1. Sistema de créditos y pasarela de pago

**Estado actual:** Los créditos se asignan manualmente por el administrador. No existe ningún flujo de compra autónomo para el estudiante.

Lo que falta:

- Implementar la lógica de validación en el backend de `/api/analyze` para verificar si el usuario tiene créditos disponibles antes de llamar a la API de Claude. Si el usuario ya consumió sus 2 revisiones gratuitas y su saldo de `creditos_extra` es 0, el endpoint debe retornar un `403` sin incurrir en costos de API.
- Al completarse un análisis exitoso, descontar automáticamente 1 unidad del campo `creditos_extra` en la tabla `profiles`.
- Diseñar la vista de planes en el dashboard del estudiante (`/dashboard?vista=planes`) con opciones de créditos adicionales individuales y paquete de mentoría premium.
- Crear el endpoint `/api/checkout` para inicializar sesiones de pago seguras con Stripe.
- Implementar el webhook `/api/webhooks/pagos` para escuchar confirmaciones de pago, incrementar `creditos_extra` en el perfil del usuario y registrar la transacción en la tabla `compras`.

Archivos por crear:
- `src/app/pricing/page.tsx`
- `src/app/api/checkout/route.ts`
- `src/app/api/webhooks/stripe/route.ts`

---

### 2. Tabla `compras` en base de datos

Para registrar el historial de transacciones se debe crear la siguiente tabla en Supabase:

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | `uuid` PK | — |
| `user_id` | `uuid` FK → `profiles.user_id` | — |
| `monto` | `numeric` | Valor pagado (ej. 9.99) |
| `moneda` | `text` | Ej. `"USD"` |
| `proveedor_pago` | `text` | Ej. `"stripe"` |
| `id_transaccion` | `text` | Identificador único de la pasarela |
| `estado` | `text` | `"completado"`, `"pendiente"`, `"fallido"` |
| `creditos_otorgados` | `integer` | Créditos añadidos al usuario |
| `created_at` | `timestamp with time zone` | — |

---

### 3. Auditoría de políticas RLS en Supabase

**Estado actual:** Las políticas RLS existen pero no han sido verificadas exhaustivamente.

Lo que falta:

- Confirmar que un estudiante solo puede leer y modificar sus propios registros en `ensayos_enviados` y `feedback_generado`.
- Confirmar que `leads_mentoria` solo es accesible por el propio usuario y por el rol `admin`.
- Confirmar que la tabla `profiles` no expone `creditos_extra` ni `rol` a usuarios no autorizados.

Ejemplo del tipo de política que debe existir en cada tabla:

```sql
CREATE POLICY "Usuarios pueden ver sus propios ensayos"
ON ensayos_enviados
FOR SELECT
USING (auth.uid() = user_id);
```

---

### 4. Rate limiting en `/api/analyze`

**Estado actual:** No hay protección a nivel de servidor contra abuso o llamadas excesivas.

Implementar rate limiting por IP y por `user_id` usando `@upstash/ratelimit` con Redis. El endpoint debe retornar `429 Too Many Requests` con un mensaje claro cuando se supere el límite permitido.

---

### 5. Monitoreo de errores en producción

**Estado actual:** Los errores se manejan localmente pero no hay visibilidad en producción.

Integrar Sentry para capturar excepciones no controladas en el frontend y en el backend (Server Actions y API Routes). Configurar alertas automáticas ante fallos críticos de Claude API, Supabase o Resend.

---

### 6. Páginas de Términos y Condiciones y Política de Privacidad

**Estado actual:** No existen estas páginas.

Lo que falta:

- Crear `/terminos` con los Términos y Condiciones del servicio.
- Crear `/privacidad` con la Política de Privacidad, especificando cómo se almacenan y procesan los ensayos de los estudiantes.
- Añadir un checkbox de aceptación obligatorio en el formulario de registro.
- Incluir los enlaces en el footer de la landing page y del dashboard.

Este punto es también un requisito legal para operar con cobros en la mayoría de países.

---

### 7. Configuración del despliegue en producción

**Estado actual:** El proyecto corre únicamente en entorno local.

Lo que falta:

- Conectar el repositorio a Vercel y configurar el proyecto.
- Definir todas las variables de entorno en el panel de Vercel.
- Verificar que el dominio remitente de Resend esté configurado para el dominio de producción.
- Ejecutar `npm run build` localmente antes del primer deploy para detectar errores de TypeScript con anticipación.

---

### 8. Verificación del trigger de creación de perfil

**Estado actual:** Se asume que existe un trigger que inserta una fila en `profiles` al crearse un usuario, pero no ha sido verificado formalmente.

Confirmar que el trigger existe y funciona. Si no existe, crearlo:

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

---

### 9. Notificaciones automáticas por correo

**Estado actual:** Los correos solo se envían manualmente desde el panel del administrador.

Flujos que faltan por implementar:

- Correo de bienvenida al registrarse un nuevo estudiante.
- Correo de confirmación al completar un análisis de ensayo.
- Correo de confirmación de compra tras adquirir créditos (depende del ítem 1).
- Correo de notificación al administrador cuando llega un nuevo lead de mentoría.

---

### 10. Validación de archivos PDF

**Estado actual:** Se aceptan PDFs sin validaciones exhaustivas del lado del servidor.

Lo que falta:

- Validar el tipo MIME del archivo en el servidor, no solo en el cliente.
- Limitar el tamaño máximo del archivo a 5 MB con un mensaje de error claro.
- Detectar cuando el PDF no tiene texto seleccionable (escaneado sin OCR o protegido contra copia) y mostrar un mensaje amigable que le pida al usuario pegar el texto manualmente.

---

### 11. Mejoras para el administrador

- Agregar un botón para descargar el PDF original de cada postulación desde la vista de leads o usuarios, accediendo directamente al archivo en Supabase Storage.
- Crear la tabla `correos_enviados` para persistir el historial de correos redactados desde el panel, permitiendo ver el hilo de conversación completo con cada estudiante.

---

### 12. Tests automatizados

**Estado actual:** Solo existen los scripts manuales `prueba.js` y `test-status-values.js`.

Implementar tests unitarios para las funciones de validación de ensayos y tests de integración para los endpoints `/api/analyze` y `/api/translate`. Se recomienda Vitest o Jest con React Testing Library para el frontend.

---

### 13. Caché de respuestas de IA

Cada análisis genera una llamada nueva a Claude Opus independientemente de si el ensayo ya fue procesado antes. Si un usuario reanaliza el mismo texto sin cambios, sería más eficiente retornar el resultado ya almacenado en `feedback_generado`. Esto reduciría costos operativos y mejoraría los tiempos de respuesta.

---

### 14. Exportación de datos desde el panel de administración

Agregar la opción de exportar la tabla de leads en formato `.csv` desde el panel del administrador, para facilitar el seguimiento externo del equipo mentor.

---

### 15. Versionado del prompt de Claude

El archivo `prompt_v1.md` no tiene un proceso formal de versionado. Se recomienda crear `prompt_v2.md` cuando se realicen cambios significativos, sin eliminar la versión anterior, y mantener un registro de los cambios entre versiones.

---

*Actividades completadas, y actividades que faltan por implementar.*