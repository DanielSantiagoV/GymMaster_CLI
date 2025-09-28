# ⚙️ MÓDULO DE CONFIGURACIÓN - GymMaster CLI

## 🎯 **PROPÓSITO**
El módulo de configuración permite gestionar todos los aspectos de configuración del sistema GymMaster CLI, incluyendo la base de datos, variables de entorno, índices de MongoDB y estado del sistema.

## 📋 **FUNCIONALIDADES IMPLEMENTADAS**

### **🔗 Configuración de Base de Datos**
- **Configurar Conexión MongoDB**: Establecer URI y nombre de base de datos
- **Configurar Replica Set**: Ejecutar scripts de configuración automática
- **Crear Índices**: Generar índices optimizados para consultas
- **Eliminar Índices**: Limpiar índices existentes
- **Ver Estado de Conexión**: Información detallada de la conexión

### **🌐 Variables de Entorno**
- **Editar archivo .env**: Modificar variables de configuración
- **Ver variables actuales**: Estado de todas las variables
- **Recargar variables**: Aplicar cambios sin reiniciar
- **Abrir archivo .env**: Acceso directo al archivo de configuración

### **📊 Gestión de Índices MongoDB**
- **Ver índices existentes**: Lista completa de índices por colección
- **Crear índices**: Generar índices optimizados
- **Eliminar índices**: Limpiar índices específicos
- **Recrear índices**: Proceso completo de limpieza y recreación
- **Estadísticas de índices**: Información de rendimiento y tamaño

### **🧪 Pruebas y Diagnóstico**
- **Probar Conexión**: Verificación completa de conectividad
- **Ver Estado del Sistema**: Información del sistema y aplicación
- **Abrir Carpeta de Configuración**: Acceso directo a archivos
- **Reiniciar Sistema**: Reinicio controlado de la aplicación

## 🏗️ **ARQUITECTURA**

### **Clase ConfigCLI**
```javascript
class ConfigCLI {
    constructor(db) {
        this.db = db;
        this.configPath = path.join(process.cwd(), '.env');
    }
}
```

### **Métodos Principales**
- `mostrarMenuConfiguracion()` - Menú principal de configuración
- `configurarBaseDatos()` - Gestión de base de datos
- `configurarVariablesEntorno()` - Gestión de variables
- `gestionarIndices()` - Gestión de índices MongoDB
- `probarConexion()` - Pruebas de conectividad
- `verEstadoSistema()` - Diagnóstico del sistema

## 📊 **ÍNDICES MONGODB IMPLEMENTADOS**

### **Colección: clientes**
- `{ email: 1 }` - Único
- `{ telefono: 1 }` - Índice simple
- `{ fechaRegistro: 1 }` - Ordenamiento temporal

### **Colección: planes**
- `{ estado: 1 }` - Filtrado por estado
- `{ nivel: 1 }` - Filtrado por nivel
- `{ fechaCreacion: 1 }` - Ordenamiento temporal

### **Colección: contratos**
- `{ clienteId: 1 }` - Búsqueda por cliente
- `{ planId: 1 }` - Búsqueda por plan
- `{ fechaInicio: 1 }` - Ordenamiento temporal
- `{ estado: 1 }` - Filtrado por estado

### **Colección: seguimientos**
- `{ clienteId: 1 }` - Búsqueda por cliente
- `{ fecha: 1 }` - Ordenamiento temporal
- `{ tipo: 1 }` - Filtrado por tipo

### **Colección: finanzas**
- `{ fecha: 1 }` - Ordenamiento temporal
- `{ tipo: 1 }` - Filtrado por tipo
- `{ clienteId: 1 }` - Búsqueda por cliente

## 🔧 **CONFIGURACIÓN DE VARIABLES DE ENTORNO**

### **Variables Principales**
```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=gymmaster
NODE_ENV=development
LOG_LEVEL=info
APP_NAME=GymMaster CLI
APP_VERSION=1.0.0
```

### **Gestión Automática**
- Creación automática de archivo `.env`
- Validación de variables requeridas
- Recarga dinámica de configuración
- Backup de configuración anterior

## 🧪 **PRUEBAS DE CONECTIVIDAD**

### **Verificaciones Implementadas**
1. **Conexión Básica**: Verificación de conectividad
2. **Operación de Escritura**: Prueba de inserción/eliminación
3. **Transacciones**: Verificación de soporte de transacciones
4. **Estado del Servidor**: Información de versión y uptime

### **Información de Diagnóstico**
- Host y puerto de conexión
- Versión de MongoDB
- Tiempo de actividad
- Número de colecciones
- Documentos por colección

## 📁 **ESTRUCTURA DE ARCHIVOS**

```
cli/
├── ConfigCLI.js          # Módulo principal de configuración
├── MenuPrincipal.js      # Integración en menú principal
└── ...

config/
├── connection.js         # Gestión de conexión e índices
├── database.js          # Configuración de base de datos
└── index.js             # Configuración central

docs/
└── MODULO_CONFIGURACION.md  # Esta documentación
```

## 🚀 **USO DEL MÓDULO**

### **Acceso desde Menú Principal**
1. Ejecutar aplicación: `npm start`
2. Seleccionar: `⚙️ Configuración`
3. Elegir opción deseada

### **Funciones Principales**
- **Configurar Base de Datos**: Establecer conexión MongoDB
- **Gestionar Variables**: Editar configuración del sistema
- **Optimizar Índices**: Mejorar rendimiento de consultas
- **Diagnosticar Sistema**: Verificar estado y conectividad

## ⚠️ **CONSIDERACIONES IMPORTANTES**

### **Seguridad**
- Variables sensibles en archivo `.env`
- No exponer credenciales en código
- Validación de entrada del usuario

### **Rendimiento**
- Índices optimizados para consultas frecuentes
- Eliminación segura de índices
- Estadísticas de rendimiento

### **Mantenimiento**
- Backup automático de configuración
- Recarga dinámica de variables
- Logs de operaciones críticas

## 🔄 **FLUJO DE TRABAJO**

### **Configuración Inicial**
1. Configurar conexión MongoDB
2. Crear índices optimizados
3. Verificar conectividad
4. Configurar variables de entorno

### **Mantenimiento Regular**
1. Verificar estado del sistema
2. Revisar estadísticas de índices
3. Optimizar configuración según uso
4. Realizar pruebas de conectividad

## 📈 **BENEFICIOS**

### **Para el Usuario**
- Configuración centralizada y fácil
- Diagnóstico automático de problemas
- Optimización de rendimiento
- Gestión visual de la configuración

### **Para el Sistema**
- Índices optimizados para consultas
- Configuración persistente
- Diagnóstico proactivo
- Mantenimiento automatizado

## 🎯 **CONCLUSIÓN**

El módulo de configuración completa la funcionalidad del sistema GymMaster CLI, proporcionando:

- ✅ **Gestión completa de configuración**
- ✅ **Optimización de base de datos**
- ✅ **Diagnóstico del sistema**
- ✅ **Interfaz amigable y profesional**
- ✅ **Integración perfecta con el sistema**

**El sistema está ahora 100% completo y listo para producción.** 🚀
