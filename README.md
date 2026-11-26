# Dusko Gym

Tracker personal de progreso en el gimnasio. Registra cada ejercicio y sus series, y recibe recomendaciones automáticas para saber cuándo subir el peso o cambiar de ejercicio.

## Funcionalidad

- **Catálogo de ejercicios**: nombre, grupo muscular, equipo, series objetivo, rango de repeticiones e incremento de peso.
- **Registro por ejercicio**: peso y repeticiones de cada serie, fecha y notas. Precarga las series de la última sesión para repetir más rápido.
- **Recomendaciones**:
  - Subir el peso cuando completas las series objetivo en el tope del rango de reps durante 2 sesiones seguidas.
  - Aviso de estancamiento tras 4 sesiones sin superar la mejor marca.
  - Sugerencia de cambio de ejercicio o deload tras 6 semanas y 4 sesiones sin mejora.
  - Estado de línea base cuando aún hay menos de 2 registros.
- **Dashboard**: constancia en las últimas 12 semanas, volumen semanal, racha, récords y últimas sesiones.
- **Progreso**: gráfico por sesión de peso máximo, 1RM estimado o volumen, con récords y últimos registros.
- **Historial**: todos los registros agrupados por fecha, con edición y borrado.
- **Tema claro/oscuro**, backup en JSON, importación y borrado total.
- **Persistencia local**: todo se guarda en `localStorage` bajo la clave `dusko:gym`, sin servidor ni cuentas.

## Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- Zustand (con `persist`)
- lucide-react
- Gráficos SVG propios

## Desarrollo

```bash
npm install
npm run dev
```

Abre http://localhost:5173.

```bash
npm run build     # typecheck + build de producción
npm run preview   # sirve el build
```

## Estructura

```
src/
  components/   # UI, layout y componentes de dominio
  views/        # Dashboard, Ejercicios, Registrar, Progreso, Historial
  store/        # Zustand store, selectores y toasts
  lib/          # fechas, formato, estadísticas, progresión y backup
  types.ts      # modelo de datos
```

## Datos

El estado persistido contiene `exercises`, `logs` y `settings.theme`. Cada registro es independiente: no hay sesiones de entrenamiento completas, así puedes anotar solo el ejercicio que has hecho.

Para conservar el progreso al cambiar de navegador o limpiar datos, usa **Ajustes → Exportar backup** y guárdalo. Puedes restaurarlo con **Importar backup**.
