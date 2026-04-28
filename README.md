# Sociotech - App de Gestion de Salud

Aplicacion movil multiplataforma para gestion de salud, construida con **Expo** y **React Native**, con funciones de gestion de pacientes, programacion de citas, historias clinicas y mas.

## Stack Tecnologico

| Categoria | Tecnologia |
|-----------|------------|
| Framework | Expo SDK 54 + Expo Router |
| Lenguaje | TypeScript |
| Plataforma | iOS, Android, Web |
| Gestion de Estado | Zustand |
| Navegacion | React Navigation + File-based routing |
| Animaciones | React Native Reanimated |
| Iconos | Lucide React Native |
| Almacenamiento | AsyncStorage |

## Estructura del Proyecto

```
app-proyecto-sociotech/
├── app/                          # Expo Router (file-based routing)
│   ├── _layout.tsx              # Layout raiz
│   ├── index.tsx               # Punto de entrada (redirige a login)
│   ├── (auth)/                 # Grupo de rutas de autenticacion
│   │   ├── login.tsx          # Pantalla de inicio de sesion
│   │   └── register.tsx       # Pantalla de registro
│   └── (main)/                 # Grupo de rutas protegidas
│       └── home.tsx           # Dashboard principal
├── components/
│   ├── common/                # Componentes reutilizables
│   │   ├── CustomButton.tsx    # Boton con estado de carga
│   │   └── CustomInput.tsx     # Input con visibilidad de contrasena
│   └── dashboard/             # Componentes del dashboard
│       ├── Header/            # Encabezado de la app
│       ├── ModuleCard/        # Tarjeta de modulo
│       └── ModuleGrid/        # Cuadricula de modulos + hook
├── shared/                     # Utilidades compartidas
│   ├── entities/User.ts       # Tipos de usuario y roles
│   ├── http/http.client.ts    # Cliente HTTP con autenticacion
│   └── zustand/auth/          # Store de autenticacion
└── assets/                    # Imagenes y fuentes
```

## Features

### Authentication
- Login / Registro con email y contrasena
- Token-based auth (JWT) con access y refresh tokens
- Session persistence en AsyncStorage
- Token refresh automatico en 401
- Roles: OWNER, ADMIN, DOCTOR, SECRETARY, PATIENT

### Dashboard
- Saludo dinamico por hora del dia
- Grid de 2 columnas con 7 modulos de servicio
- Barra de busqueda y filtro
- Notificaciones con indicador rojo

### Modulos de Servicio
| Modulo | Descripcion |
|-------|-------------|
| Servicios | Informacion clinica |
| Pacientes | Gestion de admision de pacientes |
| Citas | Programacion de citas en linea |
| Historias | Base de datos de historias clinicas |
| Examenes | Resultados de pruebas medicas |
| Reportes | Generacion de documentos PDF |
| Auditoria | Control de procesos y auditoria |

### UI Components
- CustomButton (primary/secondary, estado de carga, disabled)
- CustomInput (etiqueta flotante, toggle de contrasena)
- Header (gradiente, iconos, cierre de sesion)
- ModuleCard (icono, titulo, sombra)
- ModuleGrid (layout de cuadricula + logica)

### Animaciones
- FadeInDown / FadeInUp para entrada de elementos
- Transiciones suaves con react-native-reanimated

## API Endpoints

Backend configurado en `http://192.168.0.110:5002`

| Metodo | Endpoint | Descripcion |
|-------|----------|-------------|
| POST | `/auth/login` | Iniciar sesion |
| POST | `/auth/register` | Registro |
| GET | `/auth/me` | Perfil del usuario |
| POST | `/auth/refresh` | Refrescar token |
| PUT | `/auth/user` | Actualizar perfil |

## User Roles

```typescript
enum UserRole {
    OWNER = 'OWNER',
    ADMIN = 'ADMIN',
    DOCTOR = 'DOCTOR',
    SECRETARY = 'SECRETARY',
    PATIENT = 'PATIENT'
}
```

## Scripts

```bash
npm start          # Iniciar servidor Expo
npm run android    # Ejecutar en Android
npm run ios        # Ejecutar en iOS
npm run web        # Ejecutar en Web
npm run lint       # ESLint
npm run reset-project  # Resetear proyecto
```

## Configuracion

- **app.json**: nombre, scheme, iconos, splash screen
- **tsconfig.json**: TypeScript config
- **eslint.config.js**: ESLint para Expo

## Colores

| Elemento | Color |
|---------|-------|
| Background | #F8FAFC |
| Primary text | #0F172A |
| Secondary text | #64748B |
| Accent | #4CB1B1 |
| Error | #EF4444 |
| Button primary | #0F172A |

## Como Empezar

1. Clonar el repositorio
2. `npm install`
3. `npm start`
4. Escanea el codigo QR con Expo Go (iOS/Android) o abre en el navegador

## Licencia

MIT