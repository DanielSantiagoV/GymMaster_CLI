# 💾 Backup y Restore - GymMaster CLI

## Descripción General

El sistema de Backup y Restore permite realizar respaldos completos y selectivos de todas las colecciones de datos del gimnasio, así como restaurar datos desde archivos de respaldo con validaciones de seguridad.

## 🚀 Características Principales

### ✅ Backup Completo
- Exporta todas las colecciones relevantes (clientes, planes, avances, nutrición, contratos, ingresos, egresos, asistencias, etc.)
- Guarda en formato JSON con metadatos completos
- Timestamp estandarizado en nombres de archivo
- Ubicación automática en carpeta `/backups`

### ✅ Backup Seleccionado
- Permite seleccionar colecciones específicas para respaldo
- Ideal para respaldos parciales o de mantenimiento
- Misma estructura de metadatos que backup completo

### ✅ Restore Inteligente
- Validación automática de esquemas antes de restaurar
- Dos modos de restauración:
  - **Sobrescribir**: Reemplaza datos existentes (CRÍTICO)
  - **Prefijo**: Restaura con prefijo para evitar conflictos (SEGURO)
- Confirmaciones explícitas para operaciones críticas
- Manejo robusto de errores y rollback

### ✅ Validaciones de Seguridad
- Validación de estructura de archivos de backup
- Verificación de compatibilidad de esquemas
- Prevención de corrupción parcial de datos
- Mensajes claros de éxito, fallo o rollback

## 📁 Estructura de Archivos

```
GymMaster_CLI/
├── services/
│   └── BackupService.js          # Servicio principal de backup/restore
├── cli/
│   └── BackupCLI.js             # Interfaz CLI para backup/restore
├── backups/                      # Carpeta de respaldos (creada automáticamente)
│   ├── backup_2025-10-01T07-38-13.json
│   └── backup_2025-10-01T07-36-46.json
└── scripts/
    ├── test-backup.js           # Script de pruebas para backup
    └── test-restore.js          # Script de pruebas para restore
```

## 🎯 Colecciones Soportadas

El sistema respalda las siguientes colecciones de MongoDB:

- **clientes**: Información de clientes del gimnasio
- **contratos**: Contratos y acuerdos con clientes
- **finanzas**: Movimientos financieros (ingresos/egresos)
- **nutricion**: Planes y seguimiento nutricional
- **planesentrenamiento**: Planes de entrenamiento
- **seguimiento**: Seguimiento físico y progreso
- **pagos**: Registro de pagos y transacciones

## 📋 Formato de Archivos de Backup

### Estructura JSON
```json
{
  "metadata": {
    "timestamp": "2025-10-01T07-38-13",
    "tipo": "completo|seleccionado",
    "version": "1.0.0",
    "colecciones": ["clientes", "contratos", ...]
  },
  "datos": {
    "clientes": [
      {
        "_id": "68dd16588dc503984100c5cd",
        "nombre": "daniel",
        "apellido": "vinacso",
        "email": "vinasco@gmail.com",
        "telefono": "12345678901",
        "fechaRegistro": "2025-10-01T11:54:00.630Z",
        "activo": true,
        "planes": []
      }
    ],
    "contratos": [],
    ...
  }
}
```

### Convención de Nombres
- **Formato**: `backup_YYYY-MM-DDTHH-mm-ss.json`
- **Ejemplo**: `backup_2025-10-01T07-38-13.json`
- **Ubicación**: `/backups/` (creada automáticamente)

## 🖥️ Uso desde CLI

### Acceso al Menú
1. Ejecutar la aplicación: `npm start`
2. Seleccionar "💾 Backup y Restore" del menú principal
3. Elegir la operación deseada

### Opciones Disponibles

#### 📦 Crear Backup Completo
- Respaldar todas las colecciones
- Confirmación requerida
- Información detallada del resultado

#### 🎯 Crear Backup Seleccionado
- Seleccionar colecciones específicas
- Validación de selección
- Información detallada del resultado

#### 📋 Listar Backups Disponibles
- Muestra todos los archivos de backup
- Información de tamaño y fechas
- Ordenados por fecha de modificación

#### 🔍 Ver Información de Backup
- Información detallada de un backup específico
- Metadatos completos
- Detalles por colección

#### 🔄 Restaurar desde Backup
- Selección de archivo de backup
- Validación automática de esquema
- Selección de modo de restauración
- Confirmaciones de seguridad

## 🔧 Uso Programático

### BackupService

```javascript
const BackupService = require('./services/BackupService');
const backupService = new BackupService(database);

// Backup completo
const resultado = await backupService.backupCompleto();

// Backup seleccionado
const resultado = await backupService.backupSeleccionado(['clientes', 'contratos']);

// Listar backups
const backups = backupService.listarBackups();

// Validar esquema
const validacion = await backupService.validarEsquemaBackup(filePath);

// Restaurar backup
const resultado = await backupService.restaurarBackup(filePath, 'prefijo', 'test');
```

### BackupCLI

```javascript
const BackupCLI = require('./cli/BackupCLI');
const backupCLI = new BackupCLI(database);

// Mostrar menú interactivo
await backupCLI.mostrarMenu();
```

## 🧪 Pruebas

### Scripts de Prueba Disponibles

#### test-backup.js
```bash
node scripts/test-backup.js
```
- Prueba backup completo
- Prueba backup seleccionado
- Validación de esquemas
- Información de backups

#### test-restore.js
```bash
node scripts/test-restore.js
```
- Prueba restauración con prefijo
- Verificación de datos restaurados
- Limpieza automática de pruebas

## ⚠️ Consideraciones de Seguridad

### Operaciones Críticas
- **Sobrescribir datos**: Requiere confirmación explícita
- **Validación de esquemas**: Obligatoria antes de restaurar
- **Mensajes claros**: Información detallada de operaciones

### Modo Seguro (Prefijo)
- Restauración sin afectar datos existentes
- Colecciones con prefijo para evitar conflictos
- Ideal para pruebas y migraciones

### Validaciones Implementadas
- Estructura de archivos de backup
- Compatibilidad de esquemas
- Existencia de colecciones
- Integridad de datos

## 🚨 Manejo de Errores

### Tipos de Errores Manejados
- Archivos de backup corruptos o inexistentes
- Esquemas incompatibles
- Errores de conexión a MongoDB
- Operaciones parcialmente fallidas

### Respuestas del Sistema
- Mensajes claros de error
- Información detallada de fallos
- Rollback automático en caso de errores críticos
- Logs detallados para debugging

## 📊 Métricas y Monitoreo

### Información de Backup
- Tamaño de archivos
- Número de documentos por colección
- Timestamp de creación
- Tipo de backup (completo/seleccionado)

### Información de Restore
- Documentos restaurados por colección
- Errores parciales (si los hay)
- Tiempo de ejecución
- Modo de restauración utilizado

## 🔄 Flujo de Trabajo Recomendado

### Backup Regular
1. Ejecutar backup completo semanalmente
2. Backup seleccionado antes de cambios importantes
3. Verificar integridad de archivos generados

### Restore de Emergencia
1. Validar esquema del backup
2. Usar modo prefijo para pruebas
3. Confirmar datos antes de sobrescribir
4. Ejecutar restore definitivo

### Mantenimiento
1. Limpiar backups antiguos periódicamente
2. Verificar espacio en disco
3. Documentar cambios importantes

## 🎯 Requisitos Técnicos Cumplidos

- ✅ Uso del driver MongoDB para exportar/importar datos
- ✅ Guardar backups en `/backups` con timestamps
- ✅ Manejo de errores y confirmaciones CLI
- ✅ Comandos de backup y restore funcionando desde consola
- ✅ Archivos de respaldo con nombres estandarizados
- ✅ Mensajes claros sobre éxito, fallo o rollback
- ✅ Validaciones para evitar corrupción parcial
- ✅ Confirmaciones explícitas para operaciones críticas

## 📝 Notas de Implementación

### Patrones de Diseño Utilizados
- **Service Layer**: Lógica de negocio encapsulada
- **Command Pattern**: Operaciones como comandos
- **Template Method**: Flujos estándar definidos
- **Strategy Pattern**: Diferentes estrategias de backup

### Principios SOLID Aplicados
- **Single Responsibility**: Cada clase tiene una responsabilidad específica
- **Open/Closed**: Extensible para nuevos tipos de backup
- **Dependency Inversion**: Depende de abstracciones

### Buenas Prácticas Implementadas
- Validación de esquemas antes de operaciones críticas
- Manejo robusto de errores
- Confirmaciones explícitas para operaciones destructivas
- Timestamps estandarizados
- Estructura de datos consistente