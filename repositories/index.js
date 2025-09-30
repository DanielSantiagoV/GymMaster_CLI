// ===== IMPORTS Y DEPENDENCIAS =====
// Importación de repositorio de clientes
// PATRÓN: Dependency Injection - Se inyectan las dependencias a través del constructor
// PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (ClienteRepository) no de implementaciones concretas
const ClienteRepository = require('./ClienteRepository'); // Repositorio para gestión de clientes
// Importación de repositorio de planes de entrenamiento
// PATRÓN: Dependency Injection - Se inyectan las dependencias a través del constructor
// PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (PlanEntrenamientoRepository) no de implementaciones concretas
const PlanEntrenamientoRepository = require('./PlanEntrenamientoRepository'); // Repositorio para gestión de planes de entrenamiento
// Importación de repositorio de seguimientos
// PATRÓN: Dependency Injection - Se inyectan las dependencias a través del constructor
// PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (SeguimientoRepository) no de implementaciones concretas
const SeguimientoRepository = require('./SeguimientoRepository'); // Repositorio para gestión de seguimientos
// Importación de repositorio de nutrición
// PATRÓN: Dependency Injection - Se inyectan las dependencias a través del constructor
// PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (NutricionRepository) no de implementaciones concretas
const NutricionRepository = require('./NutricionRepository'); // Repositorio para gestión de nutrición
// Importación de repositorio de contratos
// PATRÓN: Dependency Injection - Se inyectan las dependencias a través del constructor
// PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (ContratoRepository) no de implementaciones concretas
const ContratoRepository = require('./ContratoRepository'); // Repositorio para gestión de contratos
// Importación de repositorio de finanzas
// PATRÓN: Dependency Injection - Se inyectan las dependencias a través del constructor
// PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (FinanzasRepository) no de implementaciones concretas
const FinanzasRepository = require('./FinanzasRepository'); // Repositorio para gestión de finanzas
// Importación de repositorio de pagos
// PATRÓN: Dependency Injection - Se inyectan las dependencias a través del constructor
// PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (PagoRepository) no de implementaciones concretas
const PagoRepository = require('./PagoRepository'); // Repositorio para gestión de pagos

/**
 * Índice de repositorios - Exporta todas las clases de repositorios
 * Facilita la importación de repositorios en otras partes de la aplicación
 * 
 * PATRÓN: Module Pattern - Encapsula la funcionalidad de exportación de repositorios
 * PATRÓN: Facade - Proporciona una interfaz simplificada para acceso a repositorios
 * PATRÓN: Registry - Registra y proporciona acceso a todos los repositorios
 * PATRÓN: Dependency Injection - Inyecta dependencias de repositorios
 * PRINCIPIO SOLID S: Responsabilidad Única - Se encarga únicamente de exportar repositorios
 * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevos repositorios sin modificar código existente
 * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente en todas las exportaciones
 * PRINCIPIO SOLID I: Segregación de Interfaces - Proporciona acceso específico a cada repositorio
 * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (repositorios) no de implementaciones concretas
 * 
 * NOTA: Este módulo NO maneja transacciones ya que solo proporciona exportaciones
 * BUENA PRÁCTICA: Punto central de acceso a todos los repositorios
 */
module.exports = {
    // ===== EXPORTACIÓN DE REPOSITORIOS =====
    // PATRÓN: Registry - Registra todos los repositorios disponibles
    // PRINCIPIO SOLID S: Responsabilidad de exportar repositorios
    ClienteRepository, // Repositorio para gestión de clientes
    PlanEntrenamientoRepository, // Repositorio para gestión de planes de entrenamiento
    SeguimientoRepository, // Repositorio para gestión de seguimientos
    NutricionRepository, // Repositorio para gestión de nutrición
    ContratoRepository, // Repositorio para gestión de contratos
    FinanzasRepository, // Repositorio para gestión de finanzas
    PagoRepository // Repositorio para gestión de pagos
};
