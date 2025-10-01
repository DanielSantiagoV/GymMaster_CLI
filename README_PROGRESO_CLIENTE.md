# 📊 Generación de Reportes de Progreso de Clientes

## Descripción

Este módulo implementa la funcionalidad para generar archivos JSON completos con el progreso físico y nutricional de los clientes del gimnasio. El sistema recopila datos de múltiples fuentes y los estructura en un formato JSON legible y consistente.

## 🚀 Funcionalidades Implementadas

### 1. Comando CLI Interactivo
- **Ubicación**: `cli/ProgresoCLI.js`
- **Acceso**: Menú Principal → "📊 Generar Reportes de Progreso"
- **Características**:
  - Interfaz interactiva con `inquirer`
  - Validación de entrada del usuario
  - Manejo de errores claro y descriptivo
  - Opciones para listar y limpiar archivos generados

### 2. Servicio de Progreso de Clientes
- **Ubicación**: `services/ClienteProgresoService.js`
- **Responsabilidades**:
  - Búsqueda de clientes por ID o nombre
  - Recopilación de datos de múltiples fuentes
  - Construcción de objeto JSON estructurado
  - Generación de archivos en directorio `/exports`

### 3. Estructura JSON del Reporte

El archivo generado sigue un esquema consistente y anidado:

```json
{
  "metadatos": {
    "fechaGeneracion": "2025-01-27 15:30:45",
    "version": "1.0",
    "tipo": "reporte_progreso_cliente"
  },
  "cliente": {
    "clienteId": "ObjectId",
    "nombre": "Nombre Completo",
    "email": "email@ejemplo.com",
    "telefono": "1234567890",
    "fechaRegistro": "2025-01-01",
    "activo": true,
    "nivel": "principiante"
  },
  "registrosAvance": {
    "seguimientos": [
      {
        "seguimientoId": "ObjectId",
        "fecha": "2025-01-27",
        "peso": 75.5,
        "grasaCorporal": 15.2,
        "medidas": {
          "cintura": 80,
          "brazo": 35,
          "pecho": 95
        },
        "fotos": ["ruta/foto1.jpg", "ruta/foto2.jpg"],
        "comentarios": "Comentarios del entrenador",
        "contratoId": "ObjectId"
      }
    ],
    "resumen": {
      "totalSeguimientos": 5,
      "ultimoSeguimiento": "2025-01-27",
      "tienePeso": true,
      "tieneGrasaCorporal": true,
      "tieneMedidas": true,
      "tieneFotos": true
    }
  },
  "planesAlimentacion": {
    "planesNutricionales": [
      {
        "nutricionId": "ObjectId",
        "tipoPlan": "perdida_peso",
        "detallePlan": "Plan detallado...",
        "evaluacionNutricional": "Evaluación completa...",
        "estado": "activo",
        "fechaCreacion": "2025-01-01",
        "fechaActualizacion": "2025-01-15",
        "notasAdicionales": "Notas adicionales",
        "contratoId": "ObjectId"
      }
    ],
    "planActivo": { /* Plan activo actual */ },
    "resumen": {
      "totalPlanes": 3,
      "planesActivos": 1,
      "planesFinalizados": 1,
      "planesCancelados": 1
    }
  },
  "planesEntrenamiento": {
    "planes": [
      {
        "planId": "ObjectId",
        "nombre": "Plan Principiante",
        "duracionSemanas": 12,
        "metasFisicas": "Ganar masa muscular",
        "nivel": "principiante",
        "estado": "activo",
        "fechaCreacion": "2025-01-01"
      }
    ],
    "resumen": {
      "totalPlanes": 2,
      "planesActivos": 1,
      "planesFinalizados": 0,
      "planesCancelados": 1
    }
  },
  "contratos": {
    "contratos": [
      {
        "contratoId": "ObjectId",
        "planId": "ObjectId",
        "estado": "vigente",
        "fechaInicio": "2025-01-01",
        "fechaFin": "2025-04-01",
        "precio": 150.00,
        "duracionMeses": 3,
        "condiciones": "Condiciones del contrato",
        "fechaCreacion": "2025-01-01"
      }
    ],
    "resumen": {
      "totalContratos": 2,
      "contratosVigentes": 1,
      "contratosVencidos": 0,
      "contratosCancelados": 1
    }
  },
  "estadisticas": {
    "fechaGeneracion": "2025-01-27 15:30:45",
    "totalRegistros": 12,
    "periodoAnalisis": {
      "fechaInicio": "2025-01-01",
      "fechaFin": "2025-01-27"
    }
  }
}
```

## 🛠️ Implementación Técnica

### Patrones de Diseño Utilizados

1. **Service Layer**: Orquesta la lógica de negocio para exportación
2. **Facade**: Proporciona interfaz simplificada para operaciones complejas
3. **Data Transfer Object (DTO)**: Estructura datos para transferencia
4. **Builder**: Construcción paso a paso del objeto de progreso
5. **Template Method**: Define flujo estándar de generación
6. **Guard Clause**: Validaciones tempranas
7. **Strategy**: Diferentes estrategias según tipo de identificador

### Principios SOLID Aplicados

- **S (Single Responsibility)**: Cada clase tiene una responsabilidad específica
- **O (Open/Closed)**: Extensible para nuevas fuentes de datos
- **D (Dependency Inversion)**: Depende de abstracciones, no implementaciones

### Validaciones Implementadas

- ✅ Validación de existencia del cliente
- ✅ Validación de formato de identificador (ID vs nombre)
- ✅ Manejo de errores en recopilación de datos
- ✅ Validación de estructura de archivos JSON
- ✅ Creación automática del directorio `/exports`

## 📁 Estructura de Archivos

```
├── cli/
│   └── ProgresoCLI.js              # Interfaz CLI interactiva
├── services/
│   └── ClienteProgresoService.js   # Lógica de negocio
├── exports/                        # Directorio de archivos generados
│   └── cliente_[nombre]_progreso.json
└── README_PROGRESO_CLIENTE.md     # Esta documentación
```

## 🚀 Uso del Sistema

### 1. Acceso al Comando
```bash
# Ejecutar la aplicación
npm start

# Navegar al menú de progreso
Menú Principal → "📊 Generar Reportes de Progreso"
```

### 2. Generar Reporte
1. Seleccionar "📄 Generar Reporte de Progreso de Cliente"
2. Ingresar ID o nombre del cliente
3. Seleccionar tipo de búsqueda
4. El sistema generará automáticamente el archivo JSON

### 3. Gestión de Archivos
- **Listar archivos**: Ver todos los reportes generados
- **Ver contenido**: Previsualizar contenido de archivos
- **Limpiar archivos**: Eliminar todos los reportes generados
- **Abrir en explorador**: Abrir directorio de archivos

## 🔧 Configuración

### Variables de Entorno
```bash
# MongoDB connection
MONGODB_URI=mongodb://localhost:27017/gymmaster
```

### Dependencias Requeridas
```json
{
  "inquirer": "^8.2.6",
  "chalk": "^4.1.2",
  "dayjs": "^1.11.18",
  "mongodb": "^6.20.0"
}
```

## 🧪 Pruebas Manuales

### Casos de Prueba Recomendados

1. **Cliente Existente con Datos Completos**
   - Crear cliente con seguimientos, planes nutricionales y de entrenamiento
   - Generar reporte y verificar estructura JSON

2. **Cliente con Datos Mínimos**
   - Cliente sin seguimientos ni planes
   - Verificar que el reporte se genere correctamente

3. **Cliente No Encontrado**
   - Intentar generar reporte con ID/nombre inexistente
   - Verificar manejo de errores

4. **Validación de Archivos**
   - Verificar creación del directorio `/exports`
   - Comprobar formato JSON válido
   - Verificar metadatos del archivo

### Comandos de Prueba
```bash
# Probar con cliente existente
# 1. Ejecutar aplicación
npm start

# 2. Navegar a progreso
# 3. Seleccionar "Generar Reporte"
# 4. Ingresar ID o nombre del cliente
# 5. Verificar archivo generado en /exports
```

## 📊 Métricas y Estadísticas

El sistema proporciona estadísticas detalladas:

- **Total de seguimientos**: Cantidad de registros físicos
- **Planes nutricionales**: Historial completo de planes alimenticios
- **Planes de entrenamiento**: Referencias a planes activos y pasados
- **Contratos**: Información de contratos asociados
- **Período de análisis**: Rango de fechas de los datos

## 🔒 Consideraciones de Seguridad

- ✅ Validación de entrada del usuario
- ✅ Sanitización de nombres de archivos
- ✅ Manejo seguro de rutas de archivos
- ✅ Validación de permisos de escritura
- ✅ Manejo de errores sin exposición de información sensible

## 🚀 Mejoras Futuras

### Funcionalidades Adicionales Sugeridas

1. **Filtros de Fecha**: Permitir generar reportes por período específico
2. **Formatos de Exportación**: Soporte para CSV, PDF, Excel
3. **Plantillas Personalizables**: Permitir personalizar estructura del reporte
4. **Programación Automática**: Generar reportes automáticamente
5. **Compresión**: Comprimir archivos grandes
6. **Envío por Email**: Enviar reportes por correo electrónico

### Optimizaciones Técnicas

1. **Cache de Datos**: Implementar cache para consultas frecuentes
2. **Procesamiento Asíncrono**: Generar reportes en background
3. **Validación de Esquema**: Implementar validación JSON Schema
4. **Logging Detallado**: Mejorar sistema de logs
5. **Métricas de Rendimiento**: Monitorear tiempo de generación

## 📝 Notas de Desarrollo

### Decisiones de Diseño

1. **Estructura JSON Anidada**: Facilita navegación y comprensión
2. **Metadatos Incluidos**: Permite versionado y trazabilidad
3. **Resúmenes Estadísticos**: Proporciona información rápida
4. **Manejo de Errores Robusto**: Evita fallos silenciosos
5. **Interfaz Interactiva**: Mejora experiencia de usuario

### Compatibilidad

- ✅ Compatible con MongoDB 4.4+
- ✅ Compatible con Node.js 14+
- ✅ Funciona en Windows, macOS, Linux
- ✅ Soporta caracteres especiales en nombres de clientes

## 📞 Soporte

Para reportar problemas o solicitar mejoras:

1. Verificar que MongoDB esté ejecutándose
2. Comprobar permisos de escritura en directorio del proyecto
3. Revisar logs de la aplicación
4. Verificar estructura de datos en base de datos

---

**Desarrollado siguiendo principios SOLID y patrones de diseño establecidos en el proyecto GymMaster CLI.**