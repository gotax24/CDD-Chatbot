# CDD Chatbot - Plan de Mejora v2

## Resumen del Proyecto

Portal para el hospital CDD Maracaibo que permite gestionar pacientes, subir informes médicos (PDF) y enviarlos por WhatsApp. Actualmente el hospital envía ~2500 informes al mes por email.

**Stack**: React 19 + Vite | Supabase (Auth, DB, Storage, Edge Functions) | Deno Edge Runtime

**Objetivo**: dejar el proyecto en estado vendible (seguro, reproducible, mantenible).

**Cambios respecto a v1**:

- Se auditó la **base de datos real en producción** (advisors de Supabase + policies + funciones + storage). Se encontraron 10 hallazgos nuevos (B1–B10), algunos más graves que los del código.
- Se corrigió el fix incompleto del ítem 1.1 original (faltaban `first_name`/`last_name`).
- Fase 3 rediseñada: **capa de abstracción de proveedor WhatsApp** (Meta/Twilio intercambiables) en lugar de migración rígida a Twilio.
- Nuevas fases: **Fase 0 (Fundamentos)** y **Fase 7 (Tests)**.

---

## Fase 0 - Fundamentos (BLOQUEANTE para vender)

Sin esto el proyecto no es reproducible: el esquema de BD vive solo en la nube.

### 0.1 Versionar el esquema de BD

- **Problema**: No existe `supabase/migrations/`. Las tablas, vistas, RPCs, policies RLS, triggers y buckets no están en el repo. Nadie puede reproducir el proyecto.
- **Fix**: `supabase link --project-ref tthqbraidiykoairjeqk` → `supabase db pull` → commit de las migraciones generadas.
- **Después**: toda migración nueva (Fase 2) se crea con `supabase migration new`.

### 0.2 Variables de entorno documentadas

- **Problema**: No hay `.env.example` y `frontend/.gitignore` **no ignora `.env`** (riesgo de commitear claves).
- **Fix**:
  - Crear `frontend/.env.example` con `VITE_SUPABASE_URL` y `VITE_ANON_KEY`.
  - Crear `supabase/functions/.env.example` con `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `WHATSAPP_PROVIDER`, credenciales Meta/Twilio, `ALLOWED_ORIGIN`.
  - Agregar `.env` y `.env.*` a `frontend/.gitignore`.
- **Nota**: verificado que NO hay secretos commiteados actualmente en git.

### 0.3 config.toml consistente

- **Archivo**: `supabase/config.toml:336`
- **Problema**: Declara `create-user` (no existe) pero no declara `delete-user` ni `send-report`.
- **Fix**: Remover `create-user`, agregar `delete-user` y `send-report` con `verify_jwt = true`.

---

## Fase 1 - Bugs Críticos

Estos bugs rompen la aplicación o muestran datos falsos en producción. **Prioridad máxima.**

### 1.1 Tabla y columnas inconsistentes en send-report (FIX v1 INCOMPLETO)

- **Archivo**: `supabase/functions/send-report/index.ts:34-35`
- **Problema**: Usa `.from("patient")` (la tabla real es `patients`) y selecciona `name, lastName, numberPhone` (las columnas reales son `first_name, last_name, phone_number`).
- **El plan v1 solo corregía tabla y teléfono**: con ese fix la función **seguiría fallando** por los nombres.
- **Fix**: `.from("patients").select("id, first_name, last_name, phone_number")` y actualizar todos los usos (`patient.first_name`, `patient.last_name`, `patient.phone_number`).

### 1.2 Bucket de almacenamiento inconsistente

- **Archivo**: `supabase/functions/send-report/index.ts:56`
- **Problema**: Usa bucket `"reports"` pero el frontend sube archivos a `"medical-reports"`.
- **Impacto**: Los URLs firmados para WhatsApp fallan, los PDFs nunca se envían.
- **Fix**: Cambiar `"reports"` → `"medical-reports"`.

### 1.3 ProtectedRoute no verifica sesión correctamente

- **Archivo**: `frontend/src/components/ProtectedRoute.jsx:7`
- **Problema**: `if (!user)` siempre es `false` porque `user` es `{session: null, profile: null}`, truthy incluso sin sesión.
- **Impacto**: Cualquier persona sin autenticarse puede acceder a rutas protegidas.
- **Fix**: `if (!user?.session)`.

### 1.4 Prop faltante en FormReportSend (impacto peor del estimado)

- **Archivo**: `frontend/src/pages/Report.jsx:79`
- **Problema**: `<FormReportSend />` se renderiza sin `closeModal`, pero el componente lo espera como `closeModalFather`.
- **Impacto real**: tras un envío **exitoso**, `closeModalFather(...)` es `undefined` → TypeError → el catch muestra "❌ error" al usuario **aunque el WhatsApp sí se envió** → el usuario reintenta → envíos duplicados que cuestan dinero.
- **Fix**: Pasar `closeModal={() => closeModal("reportSend")}` como prop.

### 1.5 Error ignorado en deletePatient + ID equivocado en el filtro

- **Archivo**: `frontend/src/pages/PatientsManagement.jsx:44-52`
- **Problema**: No verifica `error` antes de actualizar estado local y cerrar modal. Además el filtro usa `idPatient` (estado) en vez del parámetro `id`.
- **Impacto**: UI muestra paciente eliminado aunque la operación haya fallado.
- **Fix**: Verificar `error` primero; usar `prev.filter((u) => u.id !== id)`; mostrar error al usuario.

### 1.6 Dependencia user en useEffect causa re-ejecuciones

- **Archivo**: `frontend/src/Home.jsx:77`
- **Problema**: `[user]` re-ejecuta en cada cambio de referencia del objeto.
- **Fix**: `[user?.session?.user?.id]` o `[]`.

### 1.7 Columna deliveryId NO EXISTE en medical_reports (B2 - nuevo, de auditoría BD)

- **Archivo**: `supabase/functions/send-report/index.ts:133-137`
- **Problema**: Hace `update({ state: "sent", deliveryId: delivery.id })` pero la tabla `medical_reports` **no tiene columna `deliveryId`** (verificado en BD real). La relación es al revés: `deliveries.report_id` apunta a `medical_reports`.
- **Impacto**: La función retorna 500 **siempre**, aunque el WhatsApp ya se envió. Combinado con 1.4: caos total (falso error + reintentos + gasto duplicado).
- **Fix**: Rediseñar: insertar un delivery **por cada reporte** (con `report_id`) o crear tabla pivote `delivery_reports`. Actualizar `state` sin `deliveryId`.

### 1.8 Tabla deliveries SIN policies RLS (B1 - nuevo, de auditoría BD)

- **Problema**: `deliveries` tiene RLS habilitado pero **cero policies** → el frontend nunca puede leerla.
- **Impacto**: `Report.jsx` (lista de envíos) y contadores de `Home` **siempre vacíos/0** en producción. Bug silencioso.
- **Fix**: Migración con policies SELECT (admin/sender/doctor) e INSERT vía service role.

### 1.9 Crash de React en FormReportUpload (nuevo)

- **Archivo**: `frontend/src/components/FormReportUpload.jsx:218`
- **Problema**: `{errors.patientNotFound}` renderiza el **objeto** de error → "Objects are not valid as a React child" → **pantalla blanca** cuando el paciente no existe.
- **Fix**: `{errors.patientNotFound.message}`.

### 1.10 Marketing crashea la app (nuevo)

- **Archivo**: `frontend/src/pages/Marketing.jsx`
- **Problema**: El componente retorna `undefined` → React 19 lanza "Nothing was returned from render" → pantalla blanca al entrar a `/app/marketing` (link visible para sender/admin en el menú).
- **Fix**: Implementar la página o eliminar ruta + link del menú.

### 1.11 FormReportSend muestra campos inexistentes (nuevo)

- **Archivo**: `frontend/src/components/FormReportSend.jsx:142`
- **Problema**: Muestra `{patient.name} {patient.lastName}` pero las columnas son `first_name`/`last_name` → el paciente encontrado se muestra como "undefined undefined".
- **Fix**: Usar `patient.first_name` / `patient.last_name`.

### 1.12 Report.jsx muestra report.title inexistente (nuevo)

- **Archivo**: `frontend/src/pages/Report.jsx:62`
- **Problema**: Lista `deliveries` mostrando `report.title`, pero esa tabla no tiene `title` (tiene `patient_id`, `status`, `created_at`).
- **Fix**: Hacer select con join: `select("id, status, created_at, patients(first_name, last_name)")` y mostrar datos reales.

### 1.13 SignIn navega durante render (nuevo)

- **Archivo**: `frontend/src/pages/SignIn.jsx:23-25`
- **Problema**: `navigate("/app/home")` se ejecuta en el cuerpo del componente (side-effect en render, warning de React).
- **Fix**: Mover a `useEffect(() => { if (user.session) navigate(...) }, [user.session])`.

### 1.14 Crash si el perfil es null (nuevo)

- **Archivos**: `frontend/src/pages/PanelAdmin.jsx:11`, `frontend/src/pages/UserManagement.jsx:71`
- **Problema**: `user.profile.role` sin optional chaining → TypeError si el fetch del perfil falló (profile = null).
- **Fix**: `user?.profile?.role !== "admin"`.

### 1.15 updateList(null) crea fila fantasma (nuevo)

- **Archivo**: `frontend/src/components/FormReportUpload.jsx:70-85`
- **Problema**: `insert` sin `.select()` → `dbData` es `null` → `updateList(null)` agrega una fila vacía con key `undefined`.
- **Fix**: `.insert([data]).select().single()`.

### 1.16 Botón Editar sin onClick + FormEditUser roto (nuevo)

- **Archivos**: `frontend/src/pages/UserManagement.jsx:107`, `frontend/src/components/FormEditUser.jsx`
- **Problemas**: El botón "Editar" no tiene `onClick` (no hace nada). `FormEditUser` es un stub: `setTimeout` en el cuerpo del render y espera prop `closemodal` pero el padre pasa `closeModal` → TypeError si se abriera.
- **Fix**: Implementar edición real o eliminar botón/modal/stub. Decisión: **implementar** (necesario para producto vendible).

### 1.17 deliveryError verificado después de usarlo (nuevo)

- **Archivo**: `supabase/functions/send-report/index.ts:122-141`
- **Problema**: Usa `delivery.id` en el update **antes** de verificar `deliveryError`.
- **Fix**: Verificar `deliveryError` inmediatamente tras el insert.

### 1.18 Columna "Acción" desalineada en ReportsManagement (nuevo)

- **Archivo**: `frontend/src/pages/ReportsManagement.jsx:117,134-149`
- **Problema**: `<th>Acción</th>` es incondicional pero el `<td>` solo se renderiza para admin → tabla desalineada para no-admins.
- **Fix**: Envolver el `<th>` en la misma condición de rol.

---

## Fase 2 - Seguridad

Incluye los hallazgos de la **auditoría de la BD real** (advisors de Supabase ejecutados el 24/07/2026).

### 2.1 RPC y triggers SECURITY DEFINER ejecutables por anon (B3/B5)

- **Problema**: `get_user_profiles()`, `handle_new_user()`, `handle_deleted_user()`, `handle_new_user_by_admin()` son `SECURITY DEFINER` y ejecutables vía API por el rol `anon` (advisor: `anon_security_definer_function_executable`).
- **Fix**: `REVOKE EXECUTE ON FUNCTION ... FROM anon, authenticated;` (los triggers no deben ser llamables por API; `get_user_profiles` ya valida admin internamente, pero debe exigir sesión).

### 2.2 Vista medical_reports_view es SECURITY DEFINER (B4 - FUGA DE DATOS)

- **Problema**: La vista bypasea RLS (advisor: `security_definer_view`, nivel ERROR). Cualquier usuario autenticado (viewer, doctor) ve **todos los informes de todos los pacientes** incluyendo teléfonos.
- **Fix**: Recrear con `WITH (security_invoker = true)` o aplicar policies equivalentes a las de `medical_reports`.

### 2.3 get_user_role() frágil y search_path mutable (B6)

- **Problema**: Es `SECURITY INVOKER` y consulta `profiles` dentro de policies de `profiles` → riesgo de recursión infinita. Además `search_path` mutable (advisor WARN en 3 funciones).
- **Fix**: Recrear como `SECURITY DEFINER` + `SET search_path = public` + `STABLE`.

### 2.4 Policies duplicadas y mal dirigidas (B7)

- **Problema**: `allow_delete_medical_reports` y `allow_delete_medical_reports2` idénticas; `profiles` tiene 6 policies solapadas; policies de `patients` usan rol `{public}` en vez de `{authenticated}`.
- **Fix**: Migración de limpieza: eliminar duplicadas, consolidar, cambiar `TO public` → `TO authenticated`.

### 2.5 Policies de storage incompletas (B8)

- **Estado actual**: bucket `medical-reports` privado ✅, mime PDF ✅. Pero **sin policy SELECT** → `createSignedUrl` desde el frontend falla (ViewPdfButton roto silenciosamente). El INSERT no tiene `WITH CHECK` restrictivo → cualquier autenticado puede sobrescribir archivos ajenos.
- **Fix**: Agregar policy SELECT (mismo criterio que medical_reports) y `WITH CHECK (bucket_id = 'medical-reports' AND (get_user_role() IN ('admin','sender','doctor')))` en INSERT.

### 2.6 Sin autorización por rol en Edge Functions (N2 - ESCALACIÓN DE PRIVILEGIOS)

- **Archivos**: `invite-user/index.ts`, `delete-user/index.ts`, `send-report/index.ts`
- **Problema**: Ninguna verifica el rol del llamador. Cualquier usuario autenticado (viewer, doctor) puede invitar nuevos **admins** o borrar usuarios. La seguridad por roles existe **solo en el frontend** (bypasseable con curl).
- **Fix**: En cada función: leer JWT del header `Authorization`, obtener `auth.getUser(token)`, consultar `profiles.role` y exigir `admin` (invite/delete) o `admin|sender` (send-report).

### 2.7 invite-user actualiza la metadata del USUARIO EQUIVOCADO (N1)

- **Archivo**: `supabase/functions/invite-user/index.ts:20-41`
- **Problemas**: (a) nunca verifica `inviteError`; (b) `listUsers({ email })` **no filtra por email** (la API solo acepta `page`/`perPage`) → `users[0]` es el primer usuario del proyecto (probablemente el admin) → `updateUserById` le sobrescribe username, nombre y **ROL** con los datos del invitado.
- **Impacto**: El admin puede perder su rol al invitar a alguien.
- **Fix**: Usar `data.user.id` del retorno de `inviteUserByEmail` directamente; verificar `inviteError`; eliminar `listUsers`.

### 2.8 CORS wildcard y delete-user sin CORS

- **Archivos**: `invite-user/index.ts`, `send-report/index.ts` (wildcard `*`); `delete-user/index.ts` (no define headers CORS ni maneja OPTIONS → preflight falla).
- **Fix**: `Access-Control-Allow-Origin` desde env `ALLOWED_ORIGIN`; agregar manejo de OPTIONS + headers en delete-user.

### 2.9 select("\*") expone datos innecesarios

- **9 ocurrencias** en frontend (Home x3, Report, ReportsManagement, PatientsManagement, FormReportSend x2, AuthContext).
- **Fix**: Seleccionar solo columnas necesarias en cada query.

### 2.10 ID de admin hardcodeado en frontend

- **Archivo**: `frontend/src/pages/UserManagement.jsx:41`
- **Problema**: `idUser.includes("aa27a4f5-")` es seguridad por oscuridad, visible en el bundle JS.
- **Fix**: Flag `is_protected` en tabla `profiles` (migración) validado server-side en delete-user.

### 2.11 Validación de pertenencia reportIds ↔ patientId

- **Archivo**: `send-report/index.ts`
- **Problema**: No verifica que los `reportIds` pertenezcan al `patientId` → se pueden enviar informes de un paciente al teléfono de otro (fuga de datos médicos).
- **Fix**: Filtrar/validar `card_id` de cada reporte contra el paciente antes de enviar.

### 2.12 phone_number es numeric (B9) + prefijo 58 hardcodeado

- **Problema**: `patients.phone_number` es `numeric` en BD → pierde el cero inicial (`parseInt("0414...")` en FormAddPatient:22 lo confirma). Además `send-report:77,107` concatena `58` siempre → se duplica si el número ya tiene código de país.
- **Fix**:
  - Migración: `ALTER TABLE patients ALTER COLUMN phone_number TYPE text;`
  - Frontend: guardar como string, input `type="tel"`.
  - send-report: normalizar (quitar no-dígitos, quitar 0 inicial, anteponer 58 solo si no empieza con código de país).

### 2.13 Errores internos expuestos al cliente

- **Archivos**: Las 3 Edge Functions retornan `err.message` crudo (puede filtrar detalles de BD/infraestructura).
- **Fix**: Log interno del error real; respuesta genérica al cliente.

### 2.14 Hardening de plataforma (B10)

- Activar **Leaked Password Protection** (advisor WARN) en Auth.
- Programar **upgrade de Postgres** (17.4.1.057 tiene parches de seguridad pendientes).
- Subir `minimum_password_length` a 8 y `password_requirements = "lower_upper_letters_digits"` en config.toml (hoy: 6 y vacío).

---

## Fase 3 - WhatsApp con Capa de Abstracción

**Decisión**: en lugar de acoplar el producto a un proveedor, crear una interfaz intercambiable. Cada hospital cliente elige su proveedor vía variable de entorno. **Más vendible.**

### 3.1 Diseño

```carpetas
supabase/functions/send-report/
├── index.ts              → orquestador (auth, validación, BD)
├── providers/
│   ├── whatsapp.ts       → interfaz WhatsAppProvider { sendTemplate, sendDocument }
│   ├── meta.ts           → implementación Meta Graph API
│   └── twilio.ts         → implementación Twilio
```

- Selector: `WHATSAPP_PROVIDER=meta|twilio` (env var).
- Misma firma de métodos en ambos providers → cambiar de proveedor no toca la lógica de negocio.

### 3.2 Variables de entorno

| Variable                                                            | Proveedor |
| ------------------------------------------------------------------- | --------- |
| `WHATSAPP_PROVIDER`                                                 | ambos     |
| `PHONE_NUMBER_ID`, `WHATSAPP_TOKEN`                                 | Meta      |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER` | Twilio    |

### 3.3 Mejoras funcionales junto a la abstracción

- Filename real del informe (`original_filename`) en vez de `"Informe_Medico.pdf"` hardcodeado (`send-report:109`).
- Envío de documentos en paralelo con `Promise.all` (hoy secuencial: N × tiempo_por_documento).
- Filtrar informes ya enviados (`state = 'pending'`) en FormReportSend para evitar reenvíos duplicados (gasto).
- Registrar estado real por documento en `deliveries` (éxito/fallo parcial).

### 3.4 Comparativa de proveedores (referencia)

| Aspecto                          | Meta Graph API           | Twilio WhatsApp                     |
| -------------------------------- | ------------------------ | ----------------------------------- |
| Verificación empresarial         | Obligatoria y estricta   | No requerida (Twilio ya verificado) |
| Aprobación de templates          | Manual, puede tomar días | No requiere aprobación previa       |
| Costo por mensaje                | ~$0.03-0.08 USD          | Similar                             |
| Sandbox de pruebas               | No                       | Sí, gratuito                        |
| Tarjeta de crédito               | Requerida                | Requerida                           |
| Costo estimado 2500 informes/mes | ~$75-200 USD             | ~$12-50 USD (varía por país)        |

---

## Fase 4 - Rendimiento

### 4.1 Lazy loading de rutas

- **Archivo**: `frontend/src/main.jsx`
- **Fix**: `React.lazy()` + `Suspense` para páginas (especialmente admin).

### 4.2 Paginación en tablas

- **Archivos**: `PatientsManagement`, `ReportsManagement`, `Report`, `UserManagement`
- **Problema**: Cargan todos los registros; con 2500 informes/mes la tabla crece sin límite.
- **Fix**: `range(inicio, fin)` + controles de paginación (20-50 por página).

### 4.3 Home: queries paralelas + conteos reales

- **Archivo**: `frontend/src/Home.jsx`
- **Problemas**: 4 queries secuenciales; conteos con `select("*")` (con `max_rows = 1000` los contadores **se congelan en 1000**).
- **Fix**: `Promise.all` + `select("*", { count: "exact", head: true })` para contadores.

### 4.4 Documentos WhatsApp en paralelo

- Ver 3.3 (se resuelve en la Fase 3).

### 4.5 Memoización

- `React.memo` en filas de tablas; evitar re-render de listas grandes al abrir/cerrar modales.

---

## Fase 5 - Accesibilidad

### 5.1 Modales accesibles

- **Archivo**: `frontend/src/components/Modal.jsx`
- **Fix**: `role="dialog"`, `aria-modal="true"`, trampa de foco (Tab/Shift+Tab cicla dentro), cerrar con Escape, enfocar primer elemento al abrir, devolver foco al elemento que lo abrió.

### 5.2 Botón cerrar modal

- **Fix**: `aria-label="Cerrar"` (hoy solo emoji ❌).

### 5.3 Tablas responsivas

- **Archivos**: `Management.css`, `Page.css`
- **Fix**: Contenedor con `overflow-x: auto` o layout de tarjetas en móvil.

### 5.4 Labels asociados a inputs

- **Archivos**: `FormAddUser`, `FormAddPatient`, `FormReportUpload`, `FormReportSend`, `SignIn`
- **Fix**: `id` en inputs + `htmlFor` en labels (además del wrapping actual).

### 5.5 Live regions para feedback

- **Fix**: `aria-live="polite"` en contenedores de mensajes de éxito/error.

### 5.6 Alt text (corrección al plan v1)

- El `alt=""` de `UserManagement.jsx:80` es **correcto** (imagen decorativa junto a un `<h1>`). No cambiar.
- Los que **sobran**: `alt="Icono de..."` redundantes en `Menu.jsx` y `PanelAdmin.jsx` (el texto visible ya describe el destino) → cambiar a `alt=""`.

### 5.7 Skip navigation link

- **Fix**: Link "Saltar al contenido" visible al recibir foco (usuarios de teclado no deben tabear todo el menú).

---

## Fase 6 - Limpieza de Código

### 6.1 Console logs en producción

- **42 ocurrencias** verificadas (incluye datos sensibles: `console.log(patientData)`, `console.log(medicalReportData)`).
- **Fix**: Eliminar logs de debug; mantener `console.error` solo para errores reales.

### 6.2 Dependencia sin usar

- `axios` en `package.json`, nunca importado. **Fix**: `yarn remove axios`.

### 6.3 Error Boundaries

- **Fix**: Crear `ErrorBoundary.jsx` envolviendo las rutas (evita pantalla blanca total ante errores como los de 1.9/1.10/1.14).

### 6.4 Feedback de errores al usuario en deletes (nuevo)

- **Archivos**: `UserManagement.deleteUser` (catch solo hace console.error), `ReportsManagement.deleteReport`, `PatientsManagement.deletePatient`.
- **Problema**: Si falla, el usuario no ve nada (modal abierto, silencio).
- **Fix**: Estado `error` visible en el modal (como ya hace parcialmente UserManagement).

### 6.5 Stubs y código muerto

- `FormEditUser.jsx` → implementar (ver 1.16).
- `Marketing.jsx` → implementar o eliminar ruta (ver 1.10).
- `svc` exportado en `invite-user/index.ts:3` y `delete-user/index.ts:3` → no exportar.
- `plan.html` → regenerado con este plan (checklist interactivo).

### 6.6 Typo en className

- `frontend/src/pages/ReportsManagement.jsx:120`: `tbody-mangement` → `tbody-management` (el CSS no aplica).

### 6.7 Coma operador en UserManagement

- `UserManagement.jsx:111`: `{ setIdUser(user.id), openModal("deleteUser"); }` → separar con `;` (funciona por coma operador, pero es frágil y confuso).

### 6.8 Validación de env vars en supabaseClient

- **Archivo**: `frontend/src/supabaseClient.js`
- **Fix**: Lanzar error claro si `VITE_SUPABASE_URL` o `VITE_ANON_KEY` no están definidas.

---

## Fase 7 - Tests Mínimos Críticos

**Stack**: Vitest + React Testing Library + jsdom.

### 7.1 Setup

- `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom` como devDependencies.
- Script `test` en package.json; mock de `supabaseClient`.

### 7.2 Tests prioritarios (~6-8 tests)

| Test                                                   | Cubre        |
| ------------------------------------------------------ | ------------ |
| ProtectedRoute redirige sin sesión                     | Bug 1.3      |
| ProtectedRoute renderiza con sesión                    | Bug 1.3      |
| SignIn: login exitoso navega a /app/home               | Bug 1.13     |
| SignIn: credenciales inválidas muestran error          | flujo auth   |
| Modal: cierra con Escape y click en overlay            | A11y 5.1     |
| FormAddPatient: valida cédula y teléfono               | Validaciones |
| FormReportSend: muestra nombre del paciente encontrado | Bug 1.11     |
| ErrorBoundary captura errores de render                | 6.3          |

---

## Resumen de Tiempo Estimado (actualizado)

| Fase                              | Tiempo estimado |
| --------------------------------- | --------------- |
| Fase 0 - Fundamentos              | 1-2 horas       |
| Fase 1 - Bugs críticos (18 ítems) | 3-4 horas       |
| Fase 2 - Seguridad (código + BD)  | 4-5 horas       |
| Fase 3 - Abstracción WhatsApp     | 3-4 horas       |
| Fase 4 - Rendimiento              | 3-4 horas       |
| Fase 5 - Accesibilidad            | 3-4 horas       |
| Fase 6 - Limpieza                 | 1-2 horas       |
| Fase 7 - Tests                    | 2-3 horas       |
| **Total**                         | **18-28 horas** |

---

## Anexo A - Estado real de la BD (auditoría 24/07/2026)

### Esquema verificado

- `profiles`: id, username, first_name, last_name, role (RLS ✅)
- `patients`: id, first_name, last_name, email, **phone_number numeric** ⚠️, personal_id, created_at (RLS ✅)
- `medical_reports`: id, route, card_id, file_size, original_filename, created_by, created_at, state (RLS ✅) — **sin columna deliveryId** ⚠️
- `deliveries`: id, report_id, patient_id, sender_id, status, sent_at, created_at (RLS ✅ **sin policies** 🔴)
- Funciones: `get_user_profiles` (SECURITY DEFINER), `get_user_role` (SECURITY INVOKER ⚠️), `handle_new_user`, `handle_deleted_user`, `handle_new_user_by_admin` (triggers SECURITY DEFINER)
- Vistas: `medical_reports_view` (SECURITY DEFINER 🔴), `user_profiles_view`
- Storage: bucket `medical-reports` privado ✅, solo PDF ✅, policies INSERT/DELETE (falta SELECT 🔴)

### Advisors activos

| Lint                                                    | Nivel   | Ítem del plan                  |
| ------------------------------------------------------- | ------- | ------------------------------ |
| `rls_enabled_no_policy` (deliveries)                    | INFO→🔴 | 1.8                            |
| `security_definer_view` (medical_reports_view)          | ERROR   | 2.2                            |
| `function_search_path_mutable` x3                       | WARN    | 2.3                            |
| `anon_security_definer_function_executable` x4          | WARN    | 2.1                            |
| `authenticated_security_definer_function_executable` x4 | WARN    | 2.1                            |
| `pg_graphql_anon_table_exposed` x6                      | WARN    | 2.1 (revocar GraphQL o grants) |
| `auth_leaked_password_protection`                       | WARN    | 2.14                           |
| `vulnerable_postgres_version`                           | WARN    | 2.14                           |

---

## Notas sobre Twilio WhatsApp

- Twilio provee un **Sandbox gratuito** para desarrollo/pruebas.
- El sandbox permite enviar/recibir mensajes con un número limitado de destinatarios (debes unirte al sandbox).
- Para producción, necesitas aprobar tu número de WhatsApp Business con Twilio (más simple que Meta directo).
- Costo estimado para 2500 informes/mes con Twilio: ~$12-50 USD (varía por país).
- Twilio factura en USD, requiere tarjeta de crédito internacional.
- Con la capa de abstracción (Fase 3), esta decisión es reversible sin tocar código de negocio.
