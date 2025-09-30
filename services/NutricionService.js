// ===== IMPORTS Y DEPENDENCIAS =====
// Importación de utilidades y modelos de dominio
// PATRÓN: Dependency Injection - Se inyectan las dependencias a través del constructor
// PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (repositorios) no de implementaciones concretas
const { ObjectId } = require('mongodb'); // Utilidad para manejo de IDs de MongoDB
const { Nutricion } = require('../models'); // Modelo de dominio para entidad Nutricion
const NutricionRepository = require('../repositories/NutricionRepository'); // Repositorio para operaciones CRUD de planes nutricionales
const ClienteRepository = require('../repositories/ClienteRepository'); // Repositorio para operaciones de clientes
const ContratoRepository = require('../repositories/ContratoRepository'); // Repositorio para operaciones de contratos

/**
 * Servicio Nutrición - Lógica de negocio para planes nutricionales
 * Implementa principios SOLID y maneja validaciones de negocio
 * 
 * PATRÓN: Service Layer - Capa de servicio que orquesta la lógica de negocio nutricional
 * PATRÓN: Facade - Proporciona una interfaz simplificada para operaciones complejas de nutrición
 * PRINCIPIO SOLID S: Responsabilidad Única - Se encarga únicamente de la lógica de negocio nutricional
 * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (repositorios) no de implementaciones concretas
 */
class NutricionService {
    /**
     * Constructor del servicio de nutrición
     * @param {Object} db - Instancia de la base de datos (MongoDB)
     * 
     * PATRÓN: Dependency Injection - Recibe las dependencias como parámetros
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones, no de implementaciones concretas
     * BUENA PRÁCTICA: Inicialización de repositorios en el constructor para reutilización
     */
    constructor(db) {
        // Almacena la conexión a la base de datos para uso interno
        this.db = db;
        // PATRÓN: Repository - Abstrae el acceso a datos de planes nutricionales
        // PRINCIPIO SOLID D: Depende de abstracción NutricionRepository
        this.nutricionRepository = new NutricionRepository(db);
        // PATRÓN: Repository - Abstrae el acceso a datos de clientes
        // PRINCIPIO SOLID D: Depende de abstracción ClienteRepository
        this.clienteRepository = new ClienteRepository(db);
        // PATRÓN: Repository - Abstrae el acceso a datos de contratos
        // PRINCIPIO SOLID D: Depende de abstracción ContratoRepository
        this.contratoRepository = new ContratoRepository(db);
    }

    /**
     * Crea un nuevo plan nutricional
     * @param {Object} datosNutricion - Datos del plan nutricional
     * @returns {Promise<Object>} Resultado de la operación
     * 
     * PATRÓN: Template Method - Define el flujo estándar de creación de planes nutricionales
     * PATRÓN: Factory - Crea instancias de Nutricion
     * PATRÓN: Data Transfer Object (DTO) - Retorna objeto estructurado
     * PATRÓN: Guard Clause - Validaciones tempranas
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de crear planes nutricionales
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas validaciones
     * 
     * NOTA: No hay transacciones explícitas aquí, cada operación es independiente
     * POSIBLE MEJORA: Implementar transacciones para garantizar consistencia
     */
    async crearPlanNutricional(datosNutricion) {
        try {
            // ===== VALIDACIÓN DE DEPENDENCIAS =====
            // PATRÓN: Guard Clause - Validación temprana de dependencias
            // PRINCIPIO SOLID S: Responsabilidad de validación de dependencias
            const cliente = await this.clienteRepository.getById(datosNutricion.clienteId);
            // PATRÓN: Guard Clause - Validación de existencia del cliente
            if (!cliente) {
                throw new Error('Cliente no encontrado');
            }

            // PATRÓN: Guard Clause - Validación opcional de contrato
            // BUENA PRÁCTICA: Validación condicional de dependencias opcionales
            if (datosNutricion.contratoId) {
                // PATRÓN: Repository - Consulta de existencia a través de abstracción
                // PRINCIPIO SOLID D: Depende de abstracción ContratoRepository
                const contrato = await this.contratoRepository.getById(datosNutricion.contratoId);
                // PATRÓN: Guard Clause - Validación de existencia del contrato
                if (!contrato) {
                    throw new Error('Contrato no encontrado');
                }
            }

            // ===== VALIDACIÓN DE UNICIDAD =====
            // PATRÓN: Guard Clause - Validación de unicidad de plan activo
            // PRINCIPIO SOLID S: Responsabilidad de validación de reglas de negocio
            const planActivo = await this.nutricionRepository.getActiveByClient(datosNutricion.clienteId);
            if (planActivo && datosNutricion.estado === 'activo') {
                throw new Error('El cliente ya tiene un plan nutricional activo');
            }

            // ===== CREACIÓN DE ENTIDAD DE DOMINIO =====
            // PATRÓN: Factory - Creación de instancia de Nutricion
            // PATRÓN: Domain Model - Uso de entidad de dominio con validaciones
            // PRINCIPIO SOLID S: Delegación de responsabilidad de validación al modelo
            const nutricion = new Nutricion(datosNutricion);
            
            // ===== PERSISTENCIA =====
            // PATRÓN: Repository - Abstrae la operación de inserción
            // PRINCIPIO SOLID D: Depende de abstracción, no de implementación concreta
            const nutricionId = await this.nutricionRepository.create(nutricion);

            // ===== CONSTRUCCIÓN DE RESPUESTA =====
            // PATRÓN: Data Transfer Object (DTO) - Objeto estructurado para transferencia
            // PATRÓN: Builder - Construcción paso a paso del objeto de respuesta
            return {
                success: true, // Indicador de éxito de la operación
                nutricionId: nutricionId, // ID del plan creado
                mensaje: 'Plan nutricional creado exitosamente' // Mensaje descriptivo
            };
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Wrapping - Envuelve errores con contexto específico
            // PRINCIPIO SOLID S: Responsabilidad de manejo de errores del método
            throw new Error(`Error al crear plan nutricional: ${error.message}`);
        }
    }

    /**
     * Obtiene un plan nutricional por ID
     * @param {string} nutricionId - ID del plan
     * @returns {Promise<Object>} Plan nutricional
     * 
     * PATRÓN: Template Method - Define el flujo estándar de obtención de planes nutricionales
     * PATRÓN: Data Transfer Object (DTO) - Retorna objeto estructurado
     * PATRÓN: Mapper - Transforma entidades a DTOs
     * PATRÓN: Guard Clause - Validaciones tempranas
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener planes nutricionales
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas validaciones
     * 
     * NOTA: No hay transacciones explícitas aquí, cada operación es independiente
     * POSIBLE MEJORA: Implementar transacciones para garantizar consistencia
     */
    async obtenerPlanNutricional(nutricionId) {
        try {
            // ===== VALIDACIÓN DE EXISTENCIA =====
            // PATRÓN: Repository - Consulta de existencia a través de abstracción
            // PRINCIPIO SOLID D: Depende de abstracción NutricionRepository
            const nutricion = await this.nutricionRepository.getById(nutricionId);
            // PATRÓN: Guard Clause - Validación temprana de existencia
            if (!nutricion) {
                throw new Error('Plan nutricional no encontrado');
            }

            // ===== OBTENCIÓN DE INFORMACIÓN RELACIONADA =====
            // PATRÓN: Repository - Consulta de información del cliente
            // PRINCIPIO SOLID D: Depende de abstracción ClienteRepository
            const cliente = await this.clienteRepository.getById(nutricion.clienteId);
            
            // PATRÓN: Strategy - Diferentes estrategias según existencia de contrato
            // BUENA PRÁCTICA: Consulta condicional de información opcional
            let contrato = null;
            if (nutricion.contratoId) {
                // PATRÓN: Repository - Consulta de información del contrato
                // PRINCIPIO SOLID D: Depende de abstracción ContratoRepository
                contrato = await this.contratoRepository.getById(nutricion.contratoId);
            }

            // ===== CONSTRUCCIÓN DE RESPUESTA =====
            // PATRÓN: Data Transfer Object (DTO) - Objeto estructurado para transferencia
            // PATRÓN: Mapper - Transforma entidades a DTOs
            // PATRÓN: Builder - Construcción paso a paso del objeto de respuesta
            return {
                success: true, // Indicador de éxito de la operación
                data: {
                    nutricion: nutricion, // Plan nutricional completo
                    // PATRÓN: Mapper - Transformación del cliente a resumen
                    cliente: cliente ? cliente.getResumen() : null,
                    // PATRÓN: Mapper - Transformación del contrato a DTO
                    contrato: contrato ? {
                        contratoId: contrato.contratoId,
                        fechaInicio: contrato.fechaInicio,
                        fechaFin: contrato.fechaFin,
                        precio: contrato.precio
                    } : null
                }
            };
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Wrapping - Envuelve errores con contexto específico
            // PRINCIPIO SOLID S: Responsabilidad de manejo de errores del método
            throw new Error(`Error al obtener plan nutricional: ${error.message}`);
        }
    }

    /**
     * Lista planes nutricionales con filtros
     * @param {Object} filtros - Filtros opcionales
     * @returns {Promise<Object>} Lista de planes
     */
    async listarPlanesNutricionales(filtros = {}) {
        try {
            const planes = await this.nutricionRepository.getAll(filtros);
            
            return {
                success: true,
                data: planes.map(plan => plan.getResumen()),
                total: planes.length
            };
        } catch (error) {
            throw new Error(`Error al listar planes nutricionales: ${error.message}`);
        }
    }

    /**
     * Actualiza un plan nutricional
     * @param {string} nutricionId - ID del plan
     * @param {Object} datosActualizados - Datos a actualizar
     * @returns {Promise<Object>} Resultado de la operación
     * 
     * PATRÓN: Template Method - Define el flujo estándar de actualización de planes nutricionales
     * PATRÓN: Data Transfer Object (DTO) - Retorna objeto estructurado
     * PATRÓN: Guard Clause - Validaciones tempranas
     * PATRÓN: Strategy - Diferentes estrategias según campos a actualizar
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de actualizar planes nutricionales
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas validaciones
     * 
     * NOTA: No hay transacciones explícitas aquí, cada operación es independiente
     * POSIBLE MEJORA: Implementar transacciones para garantizar consistencia
     */
    async actualizarPlanNutricional(nutricionId, datosActualizados) {
        try {
            // ===== VALIDACIÓN DE EXISTENCIA =====
            // PATRÓN: Repository - Consulta de existencia a través de abstracción
            // PRINCIPIO SOLID D: Depende de abstracción NutricionRepository
            const nutricion = await this.nutricionRepository.getById(nutricionId);
            // PATRÓN: Guard Clause - Validación temprana de existencia
            if (!nutricion) {
                throw new Error('Plan nutricional no encontrado');
            }

            // ===== VALIDACIONES DE NEGOCIO =====
            // PATRÓN: Template Method - Delegación de validaciones específicas
            // PRINCIPIO SOLID S: Separación de responsabilidades - validación delegada
            if (datosActualizados.tipoPlan) {
                this.validarTipoPlan(datosActualizados.tipoPlan);
            }

            if (datosActualizados.estado) {
                this.validarEstado(datosActualizados.estado);
            }

            // ===== VALIDACIÓN DE UNICIDAD =====
            // PATRÓN: Guard Clause - Validación de unicidad de plan activo
            // PRINCIPIO SOLID S: Responsabilidad de validación de reglas de negocio
            if (datosActualizados.estado === 'activo') {
                // PATRÓN: Repository - Consulta de unicidad a través de abstracción
                // PRINCIPIO SOLID D: Depende de abstracción NutricionRepository
                const planActivo = await this.nutricionRepository.getActiveByClient(nutricion.clienteId);
                // PATRÓN: Guard Clause - Validación de unicidad
                if (planActivo && planActivo.nutricionId.toString() !== nutricionId) {
                    throw new Error('El cliente ya tiene un plan nutricional activo');
                }
            }

            // ===== ACTUALIZACIÓN =====
            // PATRÓN: Repository - Abstrae la operación de actualización
            // PRINCIPIO SOLID D: Depende de abstracción, no de implementación concreta
            const resultado = await this.nutricionRepository.update(nutricionId, datosActualizados);
            
            // PATRÓN: Guard Clause - Validación de resultado de actualización
            if (resultado) {
                // ===== CONSTRUCCIÓN DE RESPUESTA =====
                // PATRÓN: Data Transfer Object (DTO) - Objeto estructurado para transferencia
                return {
                    success: true, // Indicador de éxito de la operación
                    mensaje: 'Plan nutricional actualizado exitosamente' // Mensaje descriptivo
                };
            } else {
                throw new Error('No se pudo actualizar el plan nutricional');
            }
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Wrapping - Envuelve errores con contexto específico
            // PRINCIPIO SOLID S: Responsabilidad de manejo de errores del método
            throw new Error(`Error al actualizar plan nutricional: ${error.message}`);
        }
    }

    /**
     * Elimina un plan nutricional
     * @param {string} nutricionId - ID del plan
     * @returns {Promise<Object>} Resultado de la operación
     */
    async eliminarPlanNutricional(nutricionId) {
        try {
            const nutricion = await this.nutricionRepository.getById(nutricionId);
            if (!nutricion) {
                throw new Error('Plan nutricional no encontrado');
            }

            // Verificar si el plan está activo
            if (nutricion.estaActivo()) {
                throw new Error('No se puede eliminar un plan nutricional activo. Primero debe pausarlo o finalizarlo');
            }

            const resultado = await this.nutricionRepository.delete(nutricionId);
            
            if (resultado) {
                return {
                    success: true,
                    mensaje: 'Plan nutricional eliminado exitosamente'
                };
            } else {
                throw new Error('No se pudo eliminar el plan nutricional');
            }
        } catch (error) {
            throw new Error(`Error al eliminar plan nutricional: ${error.message}`);
        }
    }

    /**
     * Obtiene planes nutricionales de un cliente
     * @param {string} clienteId - ID del cliente
     * @returns {Promise<Object>} Lista de planes del cliente
     */
    async obtenerPlanesPorCliente(clienteId) {
        try {
            const planes = await this.nutricionRepository.getByClient(clienteId);
            
            return {
                success: true,
                data: planes.map(plan => plan.getResumen()),
                total: planes.length
            };
        } catch (error) {
            throw new Error(`Error al obtener planes del cliente: ${error.message}`);
        }
    }

    /**
     * Obtiene el plan activo de un cliente
     * @param {string} clienteId - ID del cliente
     * @returns {Promise<Object>} Plan activo
     */
    async obtenerPlanActivo(clienteId) {
        try {
            const planActivo = await this.nutricionRepository.getActiveByClient(clienteId);
            
            if (!planActivo) {
                return {
                    success: true,
                    data: null,
                    mensaje: 'El cliente no tiene un plan nutricional activo'
                };
            }

            return {
                success: true,
                data: planActivo.getResumen()
            };
        } catch (error) {
            throw new Error(`Error al obtener plan activo: ${error.message}`);
        }
    }

    /**
     * Busca planes nutricionales
     * @param {string} termino - Término de búsqueda
     * @returns {Promise<Object>} Resultados de búsqueda
     */
    async buscarPlanes(termino) {
        try {
            const planes = await this.nutricionRepository.search(termino);
            
            return {
                success: true,
                data: planes.map(plan => plan.getResumen()),
                total: planes.length
            };
        } catch (error) {
            throw new Error(`Error al buscar planes: ${error.message}`);
        }
    }

    /**
     * Obtiene estadísticas de planes nutricionales
     * @returns {Promise<Object>} Estadísticas
     */
    async obtenerEstadisticas() {
        try {
            const stats = await this.nutricionRepository.getStats();
            
            return {
                success: true,
                data: stats
            };
        } catch (error) {
            throw new Error(`Error al obtener estadísticas: ${error.message}`);
        }
    }

    /**
     * Valida el tipo de plan
     * @param {string} tipoPlan - Tipo de plan
     * 
     * PATRÓN: Template Method - Define el flujo estándar de validación de tipo de plan
     * PATRÓN: Guard Clause - Validaciones tempranas
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de validar tipos de plan
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevos tipos de plan
     */
    validarTipoPlan(tipoPlan) {
        // ===== DEFINICIÓN DE TIPOS VÁLIDOS =====
        // BUENA PRÁCTICA: Lista centralizada de tipos válidos
        const tiposValidos = [
            'perdida_peso', // Plan para pérdida de peso
            'ganancia_masa', // Plan para ganancia de masa muscular
            'mantenimiento', // Plan para mantenimiento
            'deportivo', // Plan para deportistas
            'medico', // Plan médico especializado
            'personalizado' // Plan personalizado
        ];
        
        // ===== VALIDACIÓN DE TIPO =====
        // PATRÓN: Guard Clause - Validación temprana de tipo
        // PRINCIPIO SOLID S: Responsabilidad de validación de tipo
        if (!tiposValidos.includes(tipoPlan)) {
            throw new Error(`Tipo de plan debe ser uno de: ${tiposValidos.join(', ')}`);
        }
    }

    /**
     * Valida el estado del plan
     * @param {string} estado - Estado del plan
     * 
     * PATRÓN: Template Method - Define el flujo estándar de validación de estado
     * PATRÓN: Guard Clause - Validaciones tempranas
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de validar estados
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevos estados
     */
    validarEstado(estado) {
        // ===== DEFINICIÓN DE ESTADOS VÁLIDOS =====
        // BUENA PRÁCTICA: Lista centralizada de estados válidos
        const estadosValidos = [
            'activo', // Plan activo y en uso
            'pausado', // Plan pausado temporalmente
            'finalizado', // Plan completado
            'cancelado' // Plan cancelado
        ];
        
        // ===== VALIDACIÓN DE ESTADO =====
        // PATRÓN: Guard Clause - Validación temprana de estado
        // PRINCIPIO SOLID S: Responsabilidad de validación de estado
        if (!estadosValidos.includes(estado)) {
            throw new Error(`Estado debe ser uno de: ${estadosValidos.join(', ')}`);
        }
    }
}

// ===== EXPORTACIÓN DEL MÓDULO =====
// PATRÓN: Module Pattern - Exporta la clase como módulo
// PRINCIPIO SOLID S: Responsabilidad de proporcionar la interfaz pública del servicio
module.exports = NutricionService;
