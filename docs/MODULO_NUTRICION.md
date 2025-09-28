# 🍎 Módulo Nutrición - GymMaster CLI

## 🎯 Funcionalidad Implementada

Sistema completo de gestión de planes nutricionales personalizados para cada cliente, siguiendo las especificaciones del REGLAS.TXT.

## ✨ Características Principales

### **📋 Gestión de Planes Nutricionales:**
- ✅ **Crear planes personalizados** con diferentes tipos (pérdida de peso, ganancia de masa, mantenimiento, etc.)
- ✅ **Evaluaciones nutricionales** detalladas y recomendaciones
- ✅ **Control de estados** (activo, pausado, finalizado, cancelado)
- ✅ **Notas adicionales** para nutricionistas y clientes
- ✅ **Vinculación con contratos** opcional

### **🔍 Búsqueda y Filtrado:**
- ✅ **Búsqueda por texto** en detalles, evaluaciones y notas
- ✅ **Filtros por estado** (activos, pausados, finalizados, cancelados)
- ✅ **Filtros por tipo** de plan nutricional
- ✅ **Planes por cliente** específico

### **📊 Estadísticas y Reportes:**
- ✅ **Estadísticas generales** de planes nutricionales
- ✅ **Distribución por estado** con porcentajes
- ✅ **Resumen de actividad** del sistema

## 🏗️ Arquitectura Implementada

### **1. Modelo Nutrición (`models/Nutricion.js`)**
```javascript
// Campos principales
nutricionId: ObjectId          // Identificador único
clienteId: ObjectId            // Referencia al cliente
contratoId: ObjectId?          // Referencia al contrato (opcional)
fechaCreacion: Date           // Fecha de creación
tipoPlan: string              // Tipo de plan nutricional
detallePlan: string           // Descripción completa del plan
evaluacionNutricional: string // Evaluación y recomendaciones
estado: string                // Estado del plan
notasAdicionales: string      // Notas adicionales
fechaActualizacion: Date      // Fecha de última actualización
```

**Tipos de Planes Soportados:**
- `perdida_peso` - Pérdida de Peso
- `ganancia_masa` - Ganancia de Masa Muscular
- `mantenimiento` - Mantenimiento
- `deportivo` - Deportivo
- `medico` - Médico
- `personalizado` - Personalizado

**Estados Soportados:**
- `activo` - Plan en uso
- `pausado` - Plan temporalmente suspendido
- `finalizado` - Plan completado
- `cancelado` - Plan cancelado

### **2. Repositorio Nutrición (`repositories/NutricionRepository.js`)**
**Operaciones CRUD:**
- ✅ `create()` - Crear plan nutricional
- ✅ `getById()` - Obtener por ID
- ✅ `getAll()` - Listar con filtros
- ✅ `update()` - Actualizar plan
- ✅ `delete()` - Eliminar plan

**Consultas Específicas:**
- ✅ `getByClient()` - Planes por cliente
- ✅ `getByContract()` - Planes por contrato
- ✅ `getByStatus()` - Planes por estado
- ✅ `getByType()` - Planes por tipo
- ✅ `getActiveByClient()` - Plan activo del cliente
- ✅ `search()` - Búsqueda por texto
- ✅ `getStats()` - Estadísticas

### **3. Servicio Nutrición (`services/NutricionService.js`)**
**Lógica de Negocio:**
- ✅ **Validaciones de integridad** (cliente existe, contrato válido)
- ✅ **Control de plan activo** (un solo plan activo por cliente)
- ✅ **Validaciones de estado** y tipo de plan
- ✅ **Manejo de errores** robusto
- ✅ **Integración con otros módulos**

**Métodos Principales:**
- `crearPlanNutricional()` - Crear con validaciones
- `obtenerPlanNutricional()` - Obtener con información relacionada
- `listarPlanesNutricionales()` - Listar con filtros
- `actualizarPlanNutricional()` - Actualizar con validaciones
- `eliminarPlanNutricional()` - Eliminar con restricciones
- `obtenerPlanesPorCliente()` - Planes específicos del cliente
- `obtenerPlanActivo()` - Plan activo del cliente
- `buscarPlanes()` - Búsqueda inteligente
- `obtenerEstadisticas()` - Estadísticas del sistema

### **4. CLI Nutrición (`cli/NutricionCLI.js`)**
**Interfaz de Usuario:**
- ✅ **Menú interactivo** con inquirer
- ✅ **Formularios de entrada** con validaciones
- ✅ **Editor de texto** para detalles y evaluaciones
- ✅ **Confirmaciones** para operaciones críticas
- ✅ **Mensajes coloridos** con chalk
- ✅ **Navegación intuitiva**

**Funcionalidades CLI:**
- 📝 **Crear Plan Nutricional** - Formulario completo
- 📋 **Listar Planes** - Con filtros por estado
- 🔍 **Buscar Planes** - Búsqueda por texto
- ✏️ **Actualizar Plan** - Edición completa
- ❌ **Eliminar Plan** - Con confirmación
- 👤 **Ver Planes por Cliente** - Planes específicos
- 📊 **Ver Estadísticas** - Resumen del sistema

## 🎯 Casos de Uso

### **1. Crear Plan Nutricional:**
```
1. Seleccionar "🍎 Nutrición" en menú principal
2. Elegir "📝 Crear Plan Nutricional"
3. Ingresar ID del cliente
4. Seleccionar tipo de plan
5. Escribir detalle del plan (editor)
6. Escribir evaluación nutricional
7. Seleccionar estado inicial
8. Agregar notas adicionales (opcional)
```

### **2. Gestionar Planes Existentes:**
```
1. Listar planes con filtros
2. Buscar por texto específico
3. Actualizar información
4. Cambiar estados
5. Eliminar planes obsoletos
```

### **3. Seguimiento por Cliente:**
```
1. Ver planes específicos del cliente
2. Identificar plan activo
3. Revisar historial nutricional
4. Actualizar evaluaciones
```

## 🔧 Validaciones Implementadas

### **Validaciones de Modelo:**
- ✅ **Cliente ID** requerido y válido
- ✅ **Contrato ID** opcional pero válido si se proporciona
- ✅ **Fecha de creación** no futura, no anterior a 1 año
- ✅ **Tipo de plan** debe ser uno de los valores válidos
- ✅ **Detalle del plan** máximo 5000 caracteres
- ✅ **Evaluación nutricional** máximo 2000 caracteres
- ✅ **Estado** debe ser válido
- ✅ **Notas adicionales** máximo 1000 caracteres

### **Validaciones de Negocio:**
- ✅ **Cliente debe existir** antes de crear plan
- ✅ **Contrato debe existir** si se vincula
- ✅ **Solo un plan activo** por cliente
- ✅ **No eliminar planes activos** sin cambiar estado
- ✅ **Validación de estados** en transiciones

## 📊 Integración con el Sistema

### **Vinculación con Clientes:**
- ✅ **Referencia obligatoria** a cliente existente
- ✅ **Información del cliente** en consultas
- ✅ **Validación de existencia** del cliente

### **Vinculación con Contratos:**
- ✅ **Referencia opcional** a contrato
- ✅ **Información del contrato** en consultas
- ✅ **Validación de existencia** del contrato

### **Menú Principal:**
- ✅ **Opción "🍎 Nutrición"** integrada
- ✅ **Navegación fluida** entre módulos
- ✅ **Consistencia visual** con otros módulos

## 🎉 Beneficios del Módulo

### **Para Nutricionistas:**
- ✅ **Gestión centralizada** de planes nutricionales
- ✅ **Evaluaciones detalladas** y seguimiento
- ✅ **Historial completo** por cliente
- ✅ **Estados claros** para organización

### **Para el Sistema:**
- ✅ **Integración completa** con clientes y contratos
- ✅ **Validaciones robustas** de datos
- ✅ **Búsqueda eficiente** y filtros
- ✅ **Estadísticas útiles** para reportes

### **Para los Usuarios:**
- ✅ **Interfaz intuitiva** y fácil de usar
- ✅ **Formularios guiados** con validaciones
- ✅ **Mensajes claros** de error y éxito
- ✅ **Navegación consistente** con el resto del sistema

---

**¡El módulo de Nutrición está completamente implementado y listo para usar!** 🎉

**Características implementadas según REGLAS.TXT:**
- ✅ Modelo Nutrición con validaciones robustas
- ✅ Repositorio con operaciones CRUD completas
- ✅ Servicio con lógica de negocio
- ✅ CLI interactivo y amigable
- ✅ Integración con el sistema principal
- ✅ Principios SOLID aplicados
- ✅ Patrón Repository implementado
- ✅ Validaciones de integridad referencial
