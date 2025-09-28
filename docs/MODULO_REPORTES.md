# 📈 Módulo de Reportes y Estadísticas - GymMaster CLI

## 🎯 Funcionalidad Implementada

Sistema completo de reportes y estadísticas que integra todos los módulos del sistema, proporcionando análisis integral y soporte para la toma de decisiones.

## ✨ Características Principales

### **📊 Estadísticas Generales:**
- ✅ **Dashboard completo** con métricas consolidadas
- ✅ **Estadísticas de clientes** (activos, inactivos, porcentajes)
- ✅ **Estadísticas de planes** (activos, cancelados, finalizados)
- ✅ **Estadísticas de contratos** (vigentes, cancelados, vencidos)
- ✅ **Estadísticas de seguimiento** (total de registros)
- ✅ **Estadísticas de nutrición** (planes activos, finalizados)
- ✅ **Balance financiero** (ingresos, egresos, pagos)

### **👥 Reporte de Clientes:**
- ✅ **Resumen estadístico** (total, activos, inactivos)
- ✅ **Distribución por planes** de entrenamiento
- ✅ **Lista detallada** con información completa
- ✅ **Filtros por estado** y fechas
- ✅ **Análisis de asociación** con planes

### **🏋️ Reporte de Planes:**
- ✅ **Estadísticas por estado** (activos, cancelados, finalizados)
- ✅ **Clientes asociados** por plan
- ✅ **Duración promedio** de contratos
- ✅ **Análisis de rendimiento** de planes
- ✅ **Filtros por estado** y fechas

### **📊 Reporte de Seguimiento:**
- ✅ **Evolución cronológica** de métricas físicas
- ✅ **Análisis de progreso** por cliente
- ✅ **Clientes sin seguimiento reciente** (alertas)
- ✅ **Evolución de peso, grasa y medidas**
- ✅ **Tendencias de mejora** o empeoramiento
- ✅ **Filtros por cliente** y fechas

### **🍎 Reporte de Nutrición:**
- ✅ **Estadísticas por tipo** de plan nutricional
- ✅ **Planes activos, finalizados y cancelados**
- ✅ **Distribución por categorías** nutricionales
- ✅ **Información detallada** de cada plan
- ✅ **Filtros por estado** y tipo

### **📄 Reporte de Contratos:**
- ✅ **Estado de contratos** (vigentes, cancelados, vencidos)
- ✅ **Duración promedio** y días restantes
- ✅ **Análisis de cumplimiento** contractual
- ✅ **Contratos con rollback** asociado
- ✅ **Filtros por fechas** y estado

### **💰 Reporte Financiero:**
- ✅ **Balance completo** (ingresos, egresos, balance)
- ✅ **Pagos por método** y estado
- ✅ **Movimientos por categoría**
- ✅ **Análisis de flujo de caja**
- ✅ **Filtros por fechas** y tipo

### **📤 Exportación de Datos:**
- ✅ **Exportación CSV** de todos los reportes
- ✅ **Formato estándar** para análisis externos
- ✅ **Campos seleccionables** para exportación
- ✅ **Nombres de archivo** con timestamp

## 🏗️ Arquitectura Implementada

### **1. ReportesService (`services/ReportesService.js`)**
```javascript
// Servicio principal que orquesta la extracción de datos
class ReportesService {
    // Métodos principales
    async obtenerEstadisticasGenerales(filtros)
    async obtenerReporteClientes(filtros)
    async obtenerReportePlanes(filtros)
    async obtenerReporteSeguimiento(filtros)
    async obtenerReporteNutricion(filtros)
    async obtenerReporteContratos(filtros)
    async obtenerReporteFinanciero(filtros)
    async obtenerBalanceFinanciero(filtros)
    
    // Métodos auxiliares
    calcularEvolucion(seguimientos, metrica)
    calcularEvolucionMedidas(seguimientos)
    exportarCSV(datos, campos)
}
```

### **2. ReportesCLI (`cli/ReportesCLI.js`)**
```javascript
// Interfaz CLI para reportes
class ReportesCLI {
    // Menús principales
    async mostrarMenuReportes()
    async mostrarEstadisticasGenerales()
    async mostrarReporteClientes()
    async mostrarReportePlanes()
    async mostrarReporteSeguimiento()
    async mostrarReporteNutricion()
    async mostrarReporteContratos()
    async mostrarReporteFinanciero()
    async mostrarMenuExportacion()
    
    // Métodos auxiliares
    async solicitarFiltrosFecha()
    async solicitarFiltrosCliente()
    async solicitarFiltrosPlan()
    async exportarDatos(tipo)
}
```

## 🔧 Funcionalidades Técnicas

### **1. Integración Completa**
- ✅ **Acceso a todos los repositorios** (Cliente, Plan, Seguimiento, Nutrición, Contrato, Finanzas, Pago)
- ✅ **Agregación de datos** de múltiples fuentes
- ✅ **Cálculos estadísticos** complejos
- ✅ **Análisis de tendencias** y evolución

### **2. Filtros Avanzados**
- ✅ **Filtros por fechas** (rango personalizable)
- ✅ **Filtros por estado** (activo, inactivo, etc.)
- ✅ **Filtros por cliente** específico
- ✅ **Filtros por tipo** de plan o movimiento
- ✅ **Límites de resultados** configurables

### **3. Análisis de Evolución**
- ✅ **Comparación cronológica** de métricas
- ✅ **Cálculo de tendencias** (aumento, disminución, sin cambio)
- ✅ **Porcentajes de cambio** significativos
- ✅ **Análisis de progreso** individual y grupal

### **4. Exportación de Datos**
- ✅ **Formato CSV** estándar
- ✅ **Campos seleccionables** para exportación
- ✅ **Nombres de archivo** con timestamp
- ✅ **Escape de caracteres** especiales
- ✅ **Manejo de datos nulos** y vacíos

## 📊 Tipos de Reportes Disponibles

### **1. Estadísticas Generales**
- Dashboard con métricas consolidadas
- Porcentajes de actividad
- Balance financiero
- Resumen de todos los módulos

### **2. Reportes por Módulo**
- **Clientes**: Distribución, estado, asociaciones
- **Planes**: Rendimiento, duración, clientes
- **Seguimiento**: Evolución, alertas, progreso
- **Nutrición**: Tipos de planes, cumplimiento
- **Contratos**: Estado, duración, cumplimiento
- **Finanzas**: Balance, movimientos, pagos

### **3. Análisis Especializados**
- **Evolución física**: Peso, grasa, medidas
- **Tendencias de progreso**: Mejora, empeoramiento
- **Alertas**: Clientes sin seguimiento
- **Análisis financiero**: Flujo de caja, categorías

## 🎯 Beneficios Implementados

### **1. Toma de Decisiones**
- ✅ **Datos consolidados** de todos los módulos
- ✅ **Métricas clave** para gestión
- ✅ **Análisis de tendencias** y patrones
- ✅ **Alertas proactivas** para seguimiento

### **2. Gestión Operativa**
- ✅ **Control de clientes** activos e inactivos
- ✅ **Seguimiento de planes** y contratos
- ✅ **Monitoreo financiero** en tiempo real
- ✅ **Identificación de problemas** operativos

### **3. Análisis de Progreso**
- ✅ **Evolución individual** de clientes
- ✅ **Tendencias grupales** de progreso
- ✅ **Identificación de clientes** en riesgo
- ✅ **Métricas de rendimiento** del gimnasio

### **4. Exportación y Análisis**
- ✅ **Datos exportables** para análisis externos
- ✅ **Formato estándar** CSV
- ✅ **Flexibilidad** en selección de campos
- ✅ **Integración** con herramientas externas

## 🚀 Casos de Uso Cubiertos

### **1. Gestión Diaria**
- Verificar estado general del gimnasio
- Identificar clientes sin seguimiento reciente
- Revisar balance financiero
- Monitorear planes activos

### **2. Análisis Mensual**
- Generar reportes de progreso
- Analizar tendencias financieras
- Evaluar rendimiento de planes
- Identificar oportunidades de mejora

### **3. Seguimiento Individual**
- Analizar progreso de clientes específicos
- Identificar clientes en riesgo
- Generar reportes personalizados
- Exportar datos para análisis

### **4. Gestión Financiera**
- Controlar ingresos y egresos
- Analizar pagos por método
- Identificar categorías de gastos
- Monitorear flujo de caja

## 📝 Cumplimiento de Reglas

### **✅ Requisitos Especiales Implementados:**
- **Transacciones reales**: Los reportes reflejan las transacciones y rollbacks implementados
- **Consistencia**: Se evidencia la atomicidad de operaciones críticas
- **Filtros flexibles**: Por fecha, estado, cliente, plan, tipo de movimiento
- **Información resumida y detallada**: Adaptable a necesidades del usuario
- **Optimización**: Manejo eficiente de grandes volúmenes de datos

### **✅ Integración con Módulos:**
- **Contratos**: Reportes de asignación automática y rollback
- **Seguimiento**: Indicadores de progreso y alertas
- **Nutrición**: Reportes de planificación y cumplimiento
- **Finanzas**: Movimientos con control mediante transacciones

## 🎉 Resultado Final

**✅ MÓDULO COMPLETAMENTE IMPLEMENTADO**

El sistema de reportes ahora proporciona:
- ✅ **Análisis integral** de todos los módulos
- ✅ **Reportes especializados** por categoría
- ✅ **Filtros avanzados** y flexibles
- ✅ **Exportación de datos** en formato CSV
- ✅ **Interfaz intuitiva** y fácil de usar
- ✅ **Integración completa** con el sistema existente

**¡El módulo de Reportes y Estadísticas está listo para producción!** 🚀
