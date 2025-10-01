/**
 * Índice de servicios - Exporta todas las clases de servicios
 * Facilita la importación de servicios en otras partes de la aplicación
 * 
 * PATRÓN: Module Pattern - Agrupa y exporta múltiples módulos
 * PATRÓN: Facade - Proporciona una interfaz unificada para todos los servicios
 * PATRÓN: Registry - Registra y organiza todos los servicios disponibles
 * PRINCIPIO SOLID S: Responsabilidad Única - Se encarga únicamente de la exportación de servicios
 * PRINCIPIO SOLID D: Inversión de Dependencias - Facilita la inyección de dependencias
 */

// ===== IMPORTS DE SERVICIOS =====
// PATRÓN: Dependency Injection - Importa todas las dependencias necesarias
// PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (servicios) no de implementaciones concretas

// Servicio principal de gestión de clientes
// PATRÓN: Service Layer - Capa de servicio para lógica de negocio de clientes
const ClienteService = require('./ClienteService');

// Servicio para gestión de planes de clientes
// PATRÓN: Service Layer - Capa de servicio para lógica de negocio de planes de clientes
const PlanClienteService = require('./PlanClienteService');

// Servicio para gestión de planes de entrenamiento
// PATRÓN: Service Layer - Capa de servicio para lógica de negocio de planes de entrenamiento
const PlanEntrenamientoService = require('./PlanEntrenamientoService');

// Servicio para gestión de contratos
// PATRÓN: Service Layer - Capa de servicio para lógica de negocio de contratos
const ContratoService = require('./ContratoService');

// Servicio para gestión de seguimientos
// PATRÓN: Service Layer - Capa de servicio para lógica de negocio de seguimientos
const SeguimientoService = require('./SeguimientoService');

// Servicio para gestión de progreso
// PATRÓN: Service Layer - Capa de servicio para lógica de negocio de progreso
const ProgresoService = require('./ProgresoService');

// Servicio para gestión de nutrición
// PATRÓN: Service Layer - Capa de servicio para lógica de negocio de nutrición
const NutricionService = require('./NutricionService');

// Servicio para búsquedas avanzadas
// PATRÓN: Service Layer - Capa de servicio para lógica de negocio de búsquedas
const BusquedaService = require('./BusquedaService');

// Servicio para plantillas de nutrición
// PATRÓN: Service Layer - Capa de servicio para lógica de negocio de plantillas nutricionales
const PlantillasNutricionService = require('./PlantillasNutricionService');

// Servicio integrado de clientes
// PATRÓN: Service Layer - Capa de servicio para lógica de negocio integrada de clientes
// PATRÓN: Facade - Proporciona una interfaz simplificada para operaciones complejas
const ClienteIntegradoService = require('./ClienteIntegradoService');

// Servicio para gestión financiera
// PATRÓN: Service Layer - Capa de servicio para lógica de negocio financiera
const FinanzasService = require('./FinanzasService');

// Servicio para generación de reportes
// PATRÓN: Service Layer - Capa de servicio para lógica de negocio de reportes
const ReportesService = require('./ReportesService');

// Servicio para backup y restore
// PATRÓN: Service Layer - Capa de servicio para lógica de negocio de backup y restore
const BackupService = require('./BackupService');

// ===== EXPORTACIÓN DE SERVICIOS =====
// PATRÓN: Module Pattern - Exporta un objeto con todos los servicios
// PATRÓN: Registry - Registra todos los servicios disponibles
// PATRÓN: Facade - Proporciona una interfaz unificada para acceder a todos los servicios
// PRINCIPIO SOLID S: Responsabilidad de proporcionar acceso a todos los servicios
// PRINCIPIO SOLID D: Facilita la inyección de dependencias en otros módulos
module.exports = {
    // Servicio principal de clientes
    ClienteService,
    // Servicio de planes de clientes
    PlanClienteService,
    // Servicio de planes de entrenamiento
    PlanEntrenamientoService,
    // Servicio de contratos
    ContratoService,
    // Servicio de seguimientos
    SeguimientoService,
    // Servicio de progreso
    ProgresoService,
    // Servicio de nutrición
    NutricionService,
    // Servicio de búsquedas
    BusquedaService,
    // Servicio de plantillas nutricionales
    PlantillasNutricionService,
    // Servicio integrado de clientes
    ClienteIntegradoService,
    // Servicio financiero
    FinanzasService,
    // Servicio de reportes
    ReportesService,
    // Servicio de backup y restore
    BackupService
};
