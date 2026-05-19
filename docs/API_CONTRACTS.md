# API Contracts - Estado de implementación

*Actualizado: Mayo 2026*

Base URL: variables `EXPO_PUBLIC_API_URL_DEV` / `EXPO_PUBLIC_API_URL_PROD` en `.env`.

## Resumen

| Endpoint | Estado | Ubicación |
|----------|--------|-----------|
| `POST /auth/login` | ✅ | `auth.service.ts` |
| `POST /auth/register` | ✅ | `auth.service.ts` |
| `POST /auth/refresh` | ✅ | `http.client.ts` (auto) |
| `GET /auth/me` | ✅ | `auth.service.ts` → `verifyToken` |
| `PUT /users/me/profile` | ✅ | `user.service.ts` |
| `GET /services` | ✅ | `service.service.ts` → `useServicesList` |
| `GET /services/:id` | ✅ | `service.service.ts` |
| `POST/PUT/DELETE /services` | ✅ | `services.tsx` + modal |
| `GET /patients/me` | ✅ | `patient.service.ts` |
| `POST/PUT /patients/me` | ✅ | `patient/edit.tsx` |
| `GET /appointments/me` | ✅ | `appointment.service.ts` → `appointments.tsx` |
| `GET /appointments` | ✅ | `appointment.service.ts` → `admin/appointments.tsx` |
| `GET /patients` | ✅ | `patient.service.ts` → `usePatientsList` → `patients.tsx` |

## Pendiente (UI con datos mock)
- Historias clínicas, exámenes, reportes, auditoría, doctores admin

## Headers

```
Authorization: Bearer <accessToken>
```

## Errores en frontend

- `shared/errors/apiError.ts` — mensajes en español
- `components/common/ListErrorState.tsx` — reintentar en listas
