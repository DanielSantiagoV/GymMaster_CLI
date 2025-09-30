// ===== IMPORTS Y DEPENDENCIAS =====
// Importación de todos los repositorios necesarios para el servicio integrado
// PATRÓN: Dependency Injection - Se inyectan las dependencias a través del constructor
// PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (repositorios) no de implementaciones concretas
const ClienteRepository = require('../repositories/ClienteRepository'); // Repositorio para operaciones CRUD de clientes
const PlanEntrenamientoRepository = require('../repositories/PlanEntrenamientoRepository'); // Repositorio para planes de entrenamiento
const ContratoRepository = require('../repositories/ContratoRepository'); // Repositorio para gestión de contratos
const SeguimientoRepository = require('../repositories/SeguimientoRepository'); // Repositorio para seguimientos físicos
const NutricionRepository = require('../repositories/NutricionRepository'); // Repositorio para planes nutricionales

/**
 * Servicio Cliente Integrado - Obtiene información completa del cliente
 * Incluye planes de entrenamiento, contratos, seguimientos y planes nutricionales
 * 
 * PATRÓN: Service Layer - Capa de servicio que orquesta múltiples repositorios
 * PATRÓN: Facade - Proporciona una interfaz simplificada para operaciones complejas
 * PRINCIPIO SOLID S: Responsabilidad Única - Se encarga únicamente de la integración de datos del cliente
 */
class ClienteIntegradoService {
    /**
     * Constructor del servicio integrado
     * @param {Object} db - Instancia de la base de datos (MongoDB)
     * 
     * PATRÓN: Dependency Injection - Recibe las dependencias como parámetros
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones, no de implementaciones concretas
     * BUENA PRÁCTICA: Inicialización de repositorios en el constructor para reutilización
     */
    constructor(db) {
        this.db = db; // Almacena la conexión a la base de datos
        // Inicialización de todos los repositorios necesarios
        // Cada repositorio maneja una entidad específica (Single Responsibility)
        this.clienteRepository = new ClienteRepository(db); // Repositorio para operaciones de clientes
        this.planEntrenamientoRepository = new PlanEntrenamientoRepository(db); // Repositorio para planes de entrenamiento
        this.contratoRepository = new ContratoRepository(db); // Repositorio para contratos
        this.seguimientoRepository = new SeguimientoRepository(db); // Repositorio para seguimientos
        this.nutricionRepository = new NutricionRepository(db); // Repositorio para planes nutricionales
    }

    /**
     * Obtiene información completa de un cliente
     * @param {string} clienteId - ID del cliente
     * @returns {Promise<Object>} Información completa del cliente
     * 
     * PATRÓN: Facade - Simplifica la obtención de datos complejos del cliente
     * PATRÓN: Data Transfer Object (DTO) - Retorna un objeto estructurado con toda la información
     * PRINCIPIO SOLID S: Responsabilidad Única - Se encarga únicamente de obtener datos completos del cliente
     * 
     * NOTA: No hay transacciones explícitas aquí, cada operación es independiente
     * POSIBLE MEJORA: Implementar transacciones para garantizar consistencia de datos
     */
    async obtenerClienteCompleto(clienteId) {
        try {
            // ===== OBTENCIÓN DE DATOS BÁSICOS DEL CLIENTE =====
            // Operación 1: Obtener información básica del cliente
            // PRINCIPIO SOLID S: Cada repositorio tiene una responsabilidad específica
            const cliente = await this.clienteRepository.getById(clienteId);
            if (!cliente) {
                // Validación temprana - Fail Fast Pattern
                throw new Error('Cliente no encontrado');
            }

            // ===== OBTENCIÓN DE DATOS RELACIONADOS =====
            // Operación 2: Obtener contratos del cliente
            // PATRÓN: Repository - Abstrae el acceso a datos de contratos
            const contratos = await this.contratoRepository.getByClient(clienteId);
            
            // Operación 3: Obtener planes de entrenamiento asignados
            // PATRÓN: Delegation - Delega la lógica compleja a un método especializado
            // PRINCIPIO SOLID S: Separación de responsabilidades - método dedicado para planes
            const planesAsignados = await this.obtenerPlanesAsignados(contratos);
            
            // Operación 4: Obtener seguimientos físicos del cliente
            // PATRÓN: Repository - Acceso a datos de seguimientos
            const seguimientos = await this.seguimientoRepository.getByClient(clienteId);
            
            // Operación 5: Obtener planes nutricionales del cliente
            // PATRÓN: Repository - Acceso a datos nutricionales
            const planesNutricionales = await this.nutricionRepository.getByClient(clienteId);
            
            // Operación 6: Obtener plan nutricional activo
            // PATRÓN: Repository - Acceso específico a plan activo
            // BUENA PRÁCTICA: Consulta específica para datos que se usan frecuentemente
            const planNutricionalActivo = await this.nutricionRepository.getActiveByClient(clienteId);

            // ===== CONSTRUCCIÓN DEL OBJETO DE RESPUESTA =====
            // PATRÓN: Data Transfer Object (DTO) - Objeto estructurado para transferencia de datos
            // PATRÓN: Builder - Construcción paso a paso del objeto complejo
            // PRINCIPIO SOLID S: Responsabilidad de transformar y estructurar datos
            return {
                // Información básica del cliente usando método del modelo
                // PATRÓN: Encapsulation - Usa métodos del modelo para obtener resumen
                cliente: cliente.getResumen(),
                
                // Transformación de contratos a formato de respuesta
                // PATRÓN: Mapper - Transforma entidades de dominio a DTOs
                // PRINCIPIO SOLID S: Responsabilidad de transformación de datos
                contratos: contratos.map(contrato => ({
                    contratoId: contrato.contratoId.toString(), // Conversión a string para serialización
                    planId: contrato.planId.toString(), // ID del plan asociado
                    fechaInicio: contrato.fechaInicio, // Fecha de inicio del contrato
                    fechaFin: contrato.fechaFin, // Fecha de finalización
                    precio: contrato.precio, // Precio del contrato
                    estado: contrato.estado, // Estado actual del contrato
                    duracionMeses: contrato.duracionMeses // Duración en meses
                })),
                
                // Planes de entrenamiento ya procesados por método especializado
                // PATRÓN: Delegation - Datos procesados por método dedicado
                planesAsignados: planesAsignados,
                
                // Transformación de seguimientos a formato de respuesta
                // PATRÓN: Mapper - Transforma entidades de seguimiento a DTOs
                seguimientos: seguimientos.map(seguimiento => ({
                    seguimientoId: seguimiento.seguimientoId.toString(), // ID único del seguimiento
                    fecha: seguimiento.fecha, // Fecha del seguimiento
                    peso: seguimiento.peso, // Peso registrado
                    grasaCorporal: seguimiento.grasaCorporal, // Porcentaje de grasa corporal
                    medidas: seguimiento.medidas, // Medidas corporales
                    comentarios: seguimiento.comentarios // Comentarios adicionales
                })),
                
                // Transformación de planes nutricionales a formato de respuesta
                // PATRÓN: Mapper - Transforma entidades nutricionales a DTOs
                // BUENA PRÁCTICA: Truncamiento de texto largo para optimizar respuesta
                planesNutricionales: planesNutricionales.map(plan => ({
                    nutricionId: plan.nutricionId.toString(), // ID del plan nutricional
                    tipoPlan: plan.getTipoPlanDescripcion(), // Descripción del tipo de plan
                    estado: plan.estado, // Estado del plan
                    fechaCreacion: plan.fechaCreacion, // Fecha de creación
                    // Truncamiento inteligente del detalle del plan
                    detallePlan: plan.detallePlan.substring(0, 100) + (plan.detallePlan.length > 100 ? '...' : '')
                })),
                
                // Plan nutricional activo (puede ser null)
                // PATRÓN: Null Object - Manejo explícito de valores nulos
                // PRINCIPIO SOLID S: Responsabilidad de presentar datos de forma consistente
                planNutricionalActivo: planNutricionalActivo ? {
                    nutricionId: planNutricionalActivo.nutricionId.toString(),
                    tipoPlan: planNutricionalActivo.getTipoPlanDescripcion(),
                    fechaCreacion: planNutricionalActivo.fechaCreacion
                } : null,
                
                // Estadísticas calculadas dinámicamente
                // PATRÓN: Aggregator - Agrega información estadística
                // PRINCIPIO SOLID S: Responsabilidad de proporcionar métricas
                estadisticas: {
                    totalContratos: contratos.length, // Total de contratos
                    contratosActivos: contratos.filter(c => c.estado === 'vigente').length, // Contratos vigentes
                    totalSeguimientos: seguimientos.length, // Total de seguimientos
                    totalPlanesNutricionales: planesNutricionales.length, // Total de planes nutricionales
                    planesNutricionalesActivos: planesNutricionales.filter(p => p.estado === 'activo').length // Planes activos
                }
            };
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Wrapping - Envuelve errores con contexto específico
            // PRINCIPIO SOLID S: Responsabilidad de manejo de errores del servicio
            // BUENA PRÁCTICA: Proporciona contexto específico del error
            throw new Error(`Error al obtener cliente completo: ${error.message}`);
        }
    }

    /**
     * Obtiene los planes de entrenamiento asignados a un cliente
     * @param {Array} contratos - Contratos del cliente
     * @returns {Promise<Array>} Planes de entrenamiento asignados
     * 
     * PATRÓN: Strategy - Estrategia específica para obtener planes asignados
     * PATRÓN: Mapper - Transforma datos de contratos y planes a DTOs
     * PRINCIPIO SOLID S: Responsabilidad Única - Se encarga únicamente de mapear planes asignados
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevos tipos de planes
     * 
     * NOTA: No hay transacciones aquí, cada consulta es independiente
     * POSIBLE MEJORA: Implementar caché para planes consultados frecuentemente
     */
    async obtenerPlanesAsignados(contratos) {
        try {
            // ===== INICIALIZACIÓN =====
            // Array para almacenar los planes asignados procesados
            // PATRÓN: Accumulator - Acumula resultados de procesamiento
            const planesAsignados = [];
            
            // ===== PROCESAMIENTO DE CONTRATOS =====
            // PATRÓN: Iterator - Itera sobre cada contrato
            // PRINCIPIO SOLID S: Responsabilidad de procesar contratos individualmente
            for (const contrato of contratos) {
                // Consulta del plan de entrenamiento asociado al contrato
                // PATRÓN: Repository - Acceso a datos de planes de entrenamiento
                // PRINCIPIO SOLID D: Inversión de Dependencias - Usa abstracción del repositorio
                const plan = await this.planEntrenamientoRepository.getById(contrato.planId);
                
                // Validación de existencia del plan
                // PATRÓN: Guard Clause - Validación temprana para continuar procesamiento
                if (plan) {
                    // Construcción del DTO del plan asignado
                    // PATRÓN: Builder - Construcción del objeto de respuesta
                    // PATRÓN: Mapper - Transforma entidades a DTOs
                    planesAsignados.push({
                        // Datos del plan de entrenamiento
                        planId: plan.planId.toString(), // ID del plan
                        nombre: plan.nombre, // Nombre del plan
                        descripcion: plan.descripcion, // Descripción del plan
                        nivel: plan.nivel, // Nivel de dificultad
                        duracion: plan.duracion, // Duración del plan
                        estado: plan.estado, // Estado del plan
                        
                        // Datos del contrato asociado
                        contratoId: contrato.contratoId.toString(), // ID del contrato
                        fechaInicio: contrato.fechaInicio, // Fecha de inicio del contrato
                        fechaFin: contrato.fechaFin, // Fecha de fin del contrato
                        estadoContrato: contrato.estado // Estado del contrato
                    });
                }
            }
            
            // ===== RETORNO DE RESULTADOS =====
            // PATRÓN: Return - Retorna el array procesado
            return planesAsignados;
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Wrapping - Envuelve errores con contexto específico
            // PRINCIPIO SOLID S: Responsabilidad de manejo de errores del método
            throw new Error(`Error al obtener planes asignados: ${error.message}`);
        }
    }

    /**
     * Lista todos los clientes con información completa
     * @param {Object} filtros - Filtros opcionales
     * @returns {Promise<Object>} Lista de clientes con información completa
     * 
     * PATRÓN: Facade - Simplifica la obtención de múltiples clientes completos
     * PATRÓN: Circuit Breaker - Maneja errores individuales sin afectar el proceso completo
     * PATRÓN: Fallback - Proporciona datos básicos cuando falla la obtención completa
     * PRINCIPIO SOLID S: Responsabilidad Única - Se encarga de listar clientes completos
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevos filtros
     * 
     * NOTA: No hay transacciones aquí, cada cliente se procesa independientemente
     * BUENA PRÁCTICA: Tolerancia a fallos - Continúa procesando aunque algunos clientes fallen
     */
    async listarClientesCompletos(filtros = {}) {
        try {
            // ===== OBTENCIÓN DE CLIENTES BÁSICOS =====
            // PATRÓN: Repository - Acceso a datos de clientes con filtros
            // PRINCIPIO SOLID D: Inversión de Dependencias - Usa abstracción del repositorio
            const clientes = await this.clienteRepository.getAll(filtros);
            
            // ===== INICIALIZACIÓN DE RESULTADOS =====
            // Array para almacenar clientes completos procesados
            // PATRÓN: Accumulator - Acumula resultados de procesamiento
            const clientesCompletos = [];

            // ===== PROCESAMIENTO DE CADA CLIENTE =====
            // PATRÓN: Iterator - Itera sobre cada cliente
            // PATRÓN: Circuit Breaker - Maneja errores individuales
            for (const cliente of clientes) {
                try {
                    // ===== OBTENCIÓN COMPLETA DEL CLIENTE =====
                    // PATRÓN: Delegation - Delega al método especializado
                    // PRINCIPIO SOLID S: Reutilización de funcionalidad existente
                    const clienteCompleto = await this.obtenerClienteCompleto(cliente.clienteId);
                    clientesCompletos.push(clienteCompleto);
                } catch (error) {
                    // ===== MANEJO DE ERRORES INDIVIDUALES =====
                    // PATRÓN: Circuit Breaker - Continúa procesamiento aunque falle un cliente
                    // PATRÓN: Fallback - Proporciona datos básicos como alternativa
                    // BUENA PRÁCTICA: Logging de errores para debugging
                    console.log(`⚠️ Error al obtener información completa del cliente ${cliente.clienteId}: ${error.message}`);
                    
                    // ===== FALLBACK: CLIENTE BÁSICO =====
                    // PATRÓN: Null Object - Proporciona objeto válido aunque incompleto
                    // PRINCIPIO SOLID S: Responsabilidad de proporcionar datos consistentes
                    clientesCompletos.push({
                        cliente: cliente.getResumen(), // Información básica del cliente
                        contratos: [], // Arrays vacíos para datos no disponibles
                        planesAsignados: [],
                        seguimientos: [],
                        planesNutricionales: [],
                        planNutricionalActivo: null, // Null para plan activo no disponible
                        estadisticas: { // Estadísticas en cero para datos no disponibles
                            totalContratos: 0,
                            contratosActivos: 0,
                            totalSeguimientos: 0,
                            totalPlanesNutricionales: 0,
                            planesNutricionalesActivos: 0
                        }
                    });
                }
            }

            // ===== CONSTRUCCIÓN DE RESPUESTA =====
            // PATRÓN: Response Object - Objeto estructurado de respuesta
            // PRINCIPIO SOLID S: Responsabilidad de estructurar respuesta
            return {
                success: true, // Indicador de éxito de la operación
                data: clientesCompletos, // Array de clientes completos
                total: clientesCompletos.length // Total de clientes procesados
            };
        } catch (error) {
            // ===== MANEJO DE ERRORES GLOBALES =====
            // PATRÓN: Error Wrapping - Envuelve errores con contexto específico
            // PRINCIPIO SOLID S: Responsabilidad de manejo de errores del método
            throw new Error(`Error al listar clientes completos: ${error.message}`);
        }
    }

    /**
     * Obtiene estadísticas generales del sistema
     * @returns {Promise<Object>} Estadísticas del sistema
     * 
     * PATRÓN: Aggregator - Agrega información estadística de múltiples fuentes
     * PATRÓN: Facade - Simplifica la obtención de estadísticas complejas
     * PRINCIPIO SOLID S: Responsabilidad Única - Se encarga únicamente de generar estadísticas
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas métricas
     * 
     * NOTA: No hay transacciones aquí, cada consulta es independiente
     * POSIBLE MEJORA: Implementar caché para estadísticas que no cambian frecuentemente
     */
    async obtenerEstadisticasGenerales() {
        try {
            // ===== OBTENCIÓN DE DATOS DE TODAS LAS ENTIDADES =====
            // PATRÓN: Parallel Processing - Consultas paralelas para optimizar rendimiento
            // PRINCIPIO SOLID D: Inversión de Dependencias - Usa abstracciones de repositorios
            const clientes = await this.clienteRepository.getAll(); // Todos los clientes
            const planes = await this.planEntrenamientoRepository.getAll(); // Todos los planes
            const contratos = await this.contratoRepository.getAll(); // Todos los contratos
            const seguimientos = await this.seguimientoRepository.getAll(); // Todos los seguimientos
            const planesNutricionales = await this.nutricionRepository.getAll(); // Todos los planes nutricionales

            // ===== CONSTRUCCIÓN DE ESTADÍSTICAS =====
            // PATRÓN: Builder - Construcción paso a paso del objeto de estadísticas
            // PATRÓN: Aggregator - Agrega métricas de diferentes entidades
            return {
                // ===== ESTADÍSTICAS DE CLIENTES =====
                // PATRÓN: Filter - Filtra clientes por estado
                // PRINCIPIO SOLID S: Responsabilidad de calcular métricas de clientes
                clientes: {
                    total: clientes.length, // Total de clientes
                    activos: clientes.filter(c => c.activo).length, // Clientes activos
                    inactivos: clientes.filter(c => !c.activo).length // Clientes inactivos
                },
                
                // ===== ESTADÍSTICAS DE PLANES DE ENTRENAMIENTO =====
                // PATRÓN: Filter - Filtra planes por estado
                // PRINCIPIO SOLID S: Responsabilidad de calcular métricas de planes
                planes: {
                    total: planes.length, // Total de planes
                    activos: planes.filter(p => p.estado === 'activo').length, // Planes activos
                    inactivos: planes.filter(p => p.estado === 'inactivo').length // Planes inactivos
                },
                
                // ===== ESTADÍSTICAS DE CONTRATOS =====
                // PATRÓN: Filter - Filtra contratos por estado
                // PRINCIPIO SOLID S: Responsabilidad de calcular métricas de contratos
                contratos: {
                    total: contratos.length, // Total de contratos
                    vigentes: contratos.filter(c => c.estado === 'vigente').length, // Contratos vigentes
                    vencidos: contratos.filter(c => c.estado === 'vencido').length, // Contratos vencidos
                    cancelados: contratos.filter(c => c.estado === 'cancelado').length // Contratos cancelados
                },
                
                // ===== ESTADÍSTICAS DE SEGUIMIENTOS =====
                // PATRÓN: Filter - Filtra seguimientos por fecha
                // PRINCIPIO SOLID S: Responsabilidad de calcular métricas de seguimientos
                seguimientos: {
                    total: seguimientos.length, // Total de seguimientos
                    // Seguimientos del mes actual
                    esteMes: seguimientos.filter(s => {
                        const fecha = new Date(s.fecha); // Fecha del seguimiento
                        const ahora = new Date(); // Fecha actual
                        // Comparación de mes y año
                        return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear();
                    }).length
                },
                
                // ===== ESTADÍSTICAS DE PLANES NUTRICIONALES =====
                // PATRÓN: Filter - Filtra planes nutricionales por estado
                // PRINCIPIO SOLID S: Responsabilidad de calcular métricas nutricionales
                planesNutricionales: {
                    total: planesNutricionales.length, // Total de planes nutricionales
                    activos: planesNutricionales.filter(p => p.estado === 'activo').length, // Planes activos
                    pausados: planesNutricionales.filter(p => p.estado === 'pausado').length, // Planes pausados
                    finalizados: planesNutricionales.filter(p => p.estado === 'finalizado').length // Planes finalizados
                }
            };
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Wrapping - Envuelve errores con contexto específico
            // PRINCIPIO SOLID S: Responsabilidad de manejo de errores del método
            throw new Error(`Error al obtener estadísticas generales: ${error.message}`);
        }
    }
}

// ===== EXPORTACIÓN DEL MÓDULO =====
// PATRÓN: Module Pattern - Exporta la clase como módulo
// PRINCIPIO SOLID S: Responsabilidad de proporcionar la interfaz pública del servicio
module.exports = ClienteIntegradoService;
