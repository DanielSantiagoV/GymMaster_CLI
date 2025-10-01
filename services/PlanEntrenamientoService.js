// ===== IMPORTS Y DEPENDENCIAS =====
// Importación de utilidades y modelos de dominio
// PATRÓN: Dependency Injection - Se inyectan las dependencias a través del constructor
// PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (repositorios) no de implementaciones concretas
const { ObjectId } = require('mongodb'); // Utilidad para manejo de IDs de MongoDB
const { PlanEntrenamiento } = require('../models'); // Modelo de dominio para entidad PlanEntrenamiento
const PlanEntrenamientoRepository = require('../repositories/PlanEntrenamientoRepository'); // Repositorio para operaciones CRUD de planes de entrenamiento
const ClienteRepository = require('../repositories/ClienteRepository'); // Repositorio para operaciones CRUD de clientes
const ContratoRepository = require('../repositories/ContratoRepository'); // Repositorio para operaciones CRUD de contratos

/**
 * Servicio para gestión de planes de entrenamiento
 * Implementa lógica de negocio para planes siguiendo principios SOLID
 * Maneja validaciones, transacciones y coordinación con otros módulos
 * 
 * PATRÓN: Service Layer - Capa de servicio que orquesta la lógica de negocio de planes de entrenamiento
 * PATRÓN: Facade - Proporciona una interfaz simplificada para operaciones complejas de planes
 * PRINCIPIO SOLID S: Responsabilidad Única - Se encarga únicamente de la lógica de negocio de planes de entrenamiento
 * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (repositorios) no de implementaciones concretas
 */
class PlanEntrenamientoService {
    /**
     * Constructor del servicio de planes de entrenamiento
     * @param {Object} db - Instancia de la base de datos (MongoDB)
     * 
     * PATRÓN: Dependency Injection - Recibe las dependencias como parámetros
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones, no de implementaciones concretas
     * BUENA PRÁCTICA: Inicialización de repositorios en el constructor para reutilización
     */
    constructor(db) {
        // Almacena la conexión a la base de datos para uso interno
        this.db = db;
        // PATRÓN: Repository - Abstrae el acceso a datos de planes de entrenamiento
        // PRINCIPIO SOLID D: Depende de abstracción PlanEntrenamientoRepository
        this.planRepository = new PlanEntrenamientoRepository(db);
        // PATRÓN: Repository - Abstrae el acceso a datos de clientes
        // PRINCIPIO SOLID D: Depende de abstracción ClienteRepository
        this.clienteRepository = new ClienteRepository(db);
        // PATRÓN: Repository - Abstrae el acceso a datos de contratos
        // PRINCIPIO SOLID D: Depende de abstracción ContratoRepository
        this.contratoRepository = new ContratoRepository(db);
    }

    /**
     * Crea un nuevo plan de entrenamiento
     * @param {Object} dataPlan - Datos del plan a crear
     * @returns {Promise<Object>} Resultado de la operación
     * 
     * PATRÓN: Template Method - Define el flujo estándar de creación de planes
     * PATRÓN: Factory - Crea instancias de PlanEntrenamiento
     * PATRÓN: Data Transfer Object (DTO) - Retorna objeto estructurado
     * PATRÓN: Guard Clause - Validaciones tempranas
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de crear planes de entrenamiento
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas validaciones
     * 
     * NOTA: No hay transacciones explícitas aquí, cada operación es independiente
     * POSIBLE MEJORA: Implementar transacciones para garantizar consistencia
     */
    async crearPlan(dataPlan) {
        try {
            // ===== VALIDACIÓN DE DATOS =====
            // PATRÓN: Template Method - Delegación de validaciones específicas
            // PRINCIPIO SOLID S: Separación de responsabilidades - validación delegada
            this.validarDatosPlan(dataPlan);

            // ===== CREACIÓN DE ENTIDAD DE DOMINIO =====
            // PATRÓN: Factory - Creación de instancia de PlanEntrenamiento
            // PATRÓN: Domain Model - Uso de entidad de dominio con validaciones
            // PRINCIPIO SOLID S: Delegación de responsabilidad de validación al modelo
            const plan = new PlanEntrenamiento({
                nombre: dataPlan.nombre, // Nombre del plan
                duracionSemanas: dataPlan.duracionSemanas, // Duración en semanas
                metasFisicas: dataPlan.metasFisicas, // Metas físicas del plan
                nivel: dataPlan.nivel, // Nivel del plan (principiante, intermedio, avanzado)
                clientes: dataPlan.clientes || [], // Lista de clientes (inicialmente vacía)
                estado: dataPlan.estado || 'activo' // Estado del plan (por defecto activo)
            });

            // ===== PERSISTENCIA =====
            // PATRÓN: Repository - Abstrae la operación de inserción
            // PRINCIPIO SOLID D: Depende de abstracción, no de implementación concreta
            const planId = await this.planRepository.create(plan);

            // ===== CONSTRUCCIÓN DE RESPUESTA =====
            // PATRÓN: Data Transfer Object (DTO) - Objeto estructurado para transferencia
            return {
                success: true, // Indicador de éxito de la operación
                planId, // ID del plan creado
                mensaje: 'Plan de entrenamiento creado exitosamente', // Mensaje descriptivo
                data: plan.getResumen() // Resumen del plan creado
            };

        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Wrapping - Envuelve errores con contexto específico
            // PRINCIPIO SOLID S: Responsabilidad de manejo de errores del método
            throw new Error(`Error al crear plan: ${error.message}`);
        }
    }

    /**
     * Lista planes con filtros y paginación
     * @param {Object} filtros - Filtros de búsqueda
     * @param {Object} opciones - Opciones de paginación y ordenamiento
     * @returns {Promise<Object>} Resultado con planes y paginación
     */
    async listarPlanes(filtros = {}, opciones = {}) {
        try {
            const { pagina = 1, limite = 10, ordenar = 'nombre', direccion = 'asc' } = opciones;
            
            // Calcular skip para paginación
            const skip = (pagina - 1) * limite;
            
            // Construir opciones de consulta
            const opcionesConsulta = {
                limit: limite,
                skip: skip,
                sort: { [ordenar]: direccion === 'asc' ? 1 : -1 }
            };

            // Obtener planes
            const planes = await this.planRepository.getAll(filtros, opcionesConsulta);
            
            // Contar total para paginación
            const totalPlanes = await this.planRepository.countPlanes(filtros);
            const totalPaginas = Math.ceil(totalPlanes / limite);

            return {
                success: true,
                data: planes.map(plan => plan.getResumen()),
                paginacion: {
                    paginaActual: pagina,
                    totalPaginas,
                    totalPlanes,
                    limite,
                    tieneSiguiente: pagina < totalPaginas,
                    tieneAnterior: pagina > 1
                }
            };

        } catch (error) {
            throw new Error(`Error al listar planes: ${error.message}`);
        }
    }

    /**
     * Actualiza un plan existente
     * @param {string|ObjectId} planId - ID del plan a actualizar
     * @param {Object} datosActualizados - Datos a actualizar
     * @returns {Promise<Object>} Resultado de la operación
     */
    async actualizarPlan(planId, datosActualizados) {
        try {
            // Verificar que el plan existe
            const planExistente = await this.planRepository.getById(planId);
            if (!planExistente) {
                throw new Error('Plan no encontrado');
            }

            // Validar datos si se están actualizando campos críticos
            if (datosActualizados.nombre || datosActualizados.duracionSemanas || 
                datosActualizados.metasFisicas || datosActualizados.nivel) {
                this.validarDatosPlan(datosActualizados, true);
            }

            // Si se está cambiando el estado a cancelado/finalizado, verificar clientes
            if (datosActualizados.estado && 
                (datosActualizados.estado === 'cancelado' || datosActualizados.estado === 'finalizado')) {
                await this.manejarCambioEstadoPlan(planId, datosActualizados.estado);
            }

            // Actualizar en la base de datos
            const actualizado = await this.planRepository.update(planId, datosActualizados);

            if (actualizado) {
                return {
                    success: true,
                    mensaje: 'Plan actualizado exitosamente'
                };
            } else {
                throw new Error('No se pudo actualizar el plan');
            }

        } catch (error) {
            throw new Error(`Error al actualizar plan: ${error.message}`);
        }
    }

    /**
     * Elimina un plan
     * @param {string|ObjectId} planId - ID del plan a eliminar
     * @param {boolean} forzar - Si debe forzar la eliminación
     * @returns {Promise<Object>} Resultado de la operación
     */
    async eliminarPlan(planId, forzar = false) {
        try {
            // Verificar que el plan existe
            const plan = await this.planRepository.getById(planId);
            if (!plan) {
                throw new Error('Plan no encontrado');
            }

            // Verificar si tiene clientes asociados
            if (plan.tieneClientes() && !forzar) {
                throw new Error('No se puede eliminar un plan que tiene clientes asociados. Use la opción de forzar para eliminar.');
            }

            // Si se fuerza la eliminación, desasociar todos los clientes
            if (forzar && plan.tieneClientes()) {
                await this.desasociarTodosLosClientes(planId);
            }

            // Eliminar el plan
            const eliminado = await this.planRepository.delete(planId);

            if (eliminado) {
                return {
                    success: true,
                    mensaje: 'Plan eliminado exitosamente'
                };
            } else {
                throw new Error('No se pudo eliminar el plan');
            }

        } catch (error) {
            throw new Error(`Error al eliminar plan: ${error.message}`);
        }
    }

    /**
     * Asocia un cliente a un plan
     * @param {string|ObjectId} planId - ID del plan
     * @param {string|ObjectId} clienteId - ID del cliente
     * @returns {Promise<Object>} Resultado de la operación
     */
    async asociarClienteAPlan(planId, clienteId) {
        try {
            // Verificar que el plan existe y está activo
            const plan = await this.planRepository.getById(planId);
            if (!plan) {
                throw new Error('Plan no encontrado');
            }

            if (!plan.estaActivo()) {
                throw new Error('Solo se pueden asociar clientes a planes activos');
            }

            // Verificar que el cliente existe
            const cliente = await this.clienteRepository.getById(clienteId);
            if (!cliente) {
                throw new Error('Cliente no encontrado');
            }

            // Verificar compatibilidad de nivel
            if (!plan.esCompatibleConNivel(cliente.nivel)) {
                throw new Error(`El plan no es compatible con el nivel del cliente (${cliente.nivel})`);
            }

            // Verificar que no esté ya asociado
            const yaAsociado = await this.clienteRepository.clientHasPlan(clienteId, planId);
            if (yaAsociado) {
                throw new Error('El cliente ya está asociado a este plan');
            }

            // Iniciar transacción para operaciones críticas
            const session = this.db.client.startSession();
            
            try {
                let resultado;
                
                await session.withTransaction(async () => {
                    // Asociar cliente al plan
                    await this.planRepository.addClientToPlan(planId, clienteId);
                    
                    // Asociar plan al cliente
                    await this.clienteRepository.addPlanToClient(clienteId, planId);

                    resultado = {
                        success: true,
                        mensaje: 'Cliente asociado al plan exitosamente'
                    };
                });

                return resultado;
            } finally {
                await session.endSession();
            }

        } catch (error) {
            throw new Error(`Error al asociar cliente al plan: ${error.message}`);
        }
    }

    /**
     * Desasocia un cliente de un plan
     * @param {string|ObjectId} planId - ID del plan
     * @param {string|ObjectId} clienteId - ID del cliente
     * @returns {Promise<Object>} Resultado de la operación
     */
    async desasociarClienteDePlan(planId, clienteId) {
        try {
            // Verificar que el plan existe
            const plan = await this.planRepository.getById(planId);
            if (!plan) {
                throw new Error('Plan no encontrado');
            }

            // Verificar que el cliente existe
            const cliente = await this.clienteRepository.getById(clienteId);
            if (!cliente) {
                throw new Error('Cliente no encontrado');
            }

            // Verificar que esté asociado
            const estaAsociado = await this.clienteRepository.clientHasPlan(clienteId, planId);
            if (!estaAsociado) {
                throw new Error('El cliente no está asociado a este plan');
            }

            // Verificar si tiene contratos activos
            const contratosActivos = await this.contratoRepository.getActiveContractsByClient(clienteId);
            const contratoDelPlan = contratosActivos.find(c => c.planId.toString() === planId.toString());

            if (contratoDelPlan) {
                throw new Error('El cliente tiene un contrato activo con este plan. Debe cancelar el contrato primero.');
            }

            // Iniciar transacción para operaciones críticas
            const session = this.db.client.startSession();
            
            try {
                let resultado;
                
                await session.withTransaction(async () => {
                    // Desasociar cliente del plan
                    await this.planRepository.removeClientFromPlan(planId, clienteId);
                    
                    // Desasociar plan del cliente
                    await this.clienteRepository.removePlanFromClient(clienteId, planId);

                    resultado = {
                        success: true,
                        mensaje: 'Cliente desasociado del plan exitosamente'
                    };
                });

                return resultado;
            } finally {
                await session.endSession();
            }

        } catch (error) {
            throw new Error(`Error al desasociar cliente del plan: ${error.message}`);
        }
    }

    /**
     * Cambia el estado de un plan
     * @param {string|ObjectId} planId - ID del plan
     * @param {string} nuevoEstado - Nuevo estado del plan
     * @returns {Promise<Object>} Resultado de la operación
     */
    async cambiarEstadoPlan(planId, nuevoEstado) {
        try {
            // Verificar que el plan existe
            const plan = await this.planRepository.getById(planId);
            if (!plan) {
                throw new Error('Plan no encontrado');
            }

            // Validar transición de estado
            this.validarTransicionEstado(plan.estado, nuevoEstado);

            // Si se está cancelando o finalizando, manejar clientes asociados
            if (nuevoEstado === 'cancelado' || nuevoEstado === 'finalizado') {
                await this.manejarCambioEstadoPlan(planId, nuevoEstado);
            }

            // Cambiar estado
            const cambiado = await this.planRepository.changePlanState(planId, nuevoEstado);

            if (cambiado) {
                return {
                    success: true,
                    mensaje: `Estado del plan cambiado a ${nuevoEstado} exitosamente`
                };
            } else {
                throw new Error('No se pudo cambiar el estado del plan');
            }

        } catch (error) {
            throw new Error(`Error al cambiar estado del plan: ${error.message}`);
        }
    }

    /**
     * Obtiene planes activos
     * @returns {Promise<Object>} Planes activos
     */
    async obtenerPlanesActivos() {
        try {
            const planes = await this.planRepository.getActivePlans();
            return {
                success: true,
                data: planes.map(plan => plan.getResumen()),
                total: planes.length
            };
        } catch (error) {
            throw new Error(`Error al obtener planes activos: ${error.message}`);
        }
    }

    /**
     * Obtiene planes por nivel
     * @param {string} nivel - Nivel del plan
     * @returns {Promise<Object>} Planes del nivel especificado
     */
    async obtenerPlanesPorNivel(nivel) {
        try {
            const planes = await this.planRepository.getPlansByLevel(nivel);
            return {
                success: true,
                data: planes.map(plan => plan.getResumen()),
                total: planes.length
            };
        } catch (error) {
            throw new Error(`Error al obtener planes por nivel: ${error.message}`);
        }
    }

    /**
     * Obtiene planes por duración
     * @param {number} duracionMin - Duración mínima en semanas
     * @param {number} duracionMax - Duración máxima en semanas
     * @returns {Promise<Object>} Planes en el rango de duración
     */
    async obtenerPlanesPorDuracion(duracionMin, duracionMax) {
        try {
            const planes = await this.planRepository.getPlansByDuration(duracionMin, duracionMax);
            return {
                success: true,
                data: planes.map(plan => plan.getResumen()),
                total: planes.length
            };
        } catch (error) {
            throw new Error(`Error al obtener planes por duración: ${error.message}`);
        }
    }

    /**
     * Busca planes por término
     * @param {string} termino - Término de búsqueda
     * @returns {Promise<Object>} Planes que coinciden
     */
    async buscarPlanes(termino) {
        try {
            const planes = await this.planRepository.searchPlans(termino);
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
     * Obtiene estadísticas de planes
     * @returns {Promise<Object>} Estadísticas de planes
     */
    async obtenerEstadisticasPlanes() {
        try {
            const estadisticas = await this.planRepository.getPlanStats();
            return {
                success: true,
                data: estadisticas
            };
        } catch (error) {
            throw new Error(`Error al obtener estadísticas: ${error.message}`);
        }
    }

    /**
     * Obtiene un plan por ID
     * @param {string|ObjectId} planId - ID del plan
     * @returns {Promise<Object>} Plan encontrado
     */
    async obtenerPlanPorId(planId) {
        try {
            const plan = await this.planRepository.getById(planId);
            
            if (!plan) {
                return {
                    success: false,
                    mensaje: 'Plan no encontrado'
                };
            }

            return {
                success: true,
                data: {
                    planId: plan.planId,
                    nombre: plan.nombre,
                    duracionSemanas: plan.duracionSemanas,
                    metasFisicas: plan.metasFisicas,
                    nivel: plan.nivel,
                    estado: plan.estado,
                    fechaCreacion: plan.fechaCreacion
                }
            };
        } catch (error) {
            throw new Error(`Error al obtener plan: ${error.message}`);
        }
    }

    /**
     * Valida los datos de un plan
     * @param {Object} dataPlan - Datos del plan
     * @param {boolean} esActualizacion - Si es una actualización
     */
    validarDatosPlan(dataPlan, esActualizacion = false) {
        if (!esActualizacion) {
            if (!dataPlan.nombre || typeof dataPlan.nombre !== 'string') {
                throw new Error('Nombre del plan es obligatorio');
            }
            if (!dataPlan.duracionSemanas || typeof dataPlan.duracionSemanas !== 'number') {
                throw new Error('Duración en semanas es obligatoria');
            }
            if (!dataPlan.metasFisicas || typeof dataPlan.metasFisicas !== 'string') {
                throw new Error('Metas físicas son obligatorias');
            }
            if (!dataPlan.nivel || typeof dataPlan.nivel !== 'string') {
                throw new Error('Nivel es obligatorio');
            }
        }

        // Validar nivel
        if (dataPlan.nivel) {
            const nivelesValidos = ['principiante', 'intermedio', 'avanzado'];
            if (!nivelesValidos.includes(dataPlan.nivel.toLowerCase())) {
                throw new Error(`Nivel debe ser uno de: ${nivelesValidos.join(', ')}`);
            }
        }

        // Validar duración
        if (dataPlan.duracionSemanas !== undefined) {
            if (dataPlan.duracionSemanas < 1 || dataPlan.duracionSemanas > 104) {
                throw new Error('Duración debe estar entre 1 y 104 semanas');
            }
        }

        // Validar estado
        if (dataPlan.estado) {
            const estadosValidos = ['activo', 'cancelado', 'finalizado'];
            if (!estadosValidos.includes(dataPlan.estado.toLowerCase())) {
                throw new Error(`Estado debe ser uno de: ${estadosValidos.join(', ')}`);
            }
        }
    }

    /**
     * Valida la transición de estado de un plan
     * @param {string} estadoActual - Estado actual
     * @param {string} nuevoEstado - Nuevo estado
     */
    validarTransicionEstado(estadoActual, nuevoEstado) {
        const transicionesValidas = {
            'activo': ['cancelado', 'finalizado'],
            'cancelado': ['activo'],
            'finalizado': [] // No se puede cambiar desde finalizado
        };

        if (!transicionesValidas[estadoActual]?.includes(nuevoEstado)) {
            throw new Error(`No se puede cambiar de ${estadoActual} a ${nuevoEstado}`);
        }
    }

    /**
     * Maneja el cambio de estado de un plan
     * @param {string|ObjectId} planId - ID del plan
     * @param {string} nuevoEstado - Nuevo estado
     */
    async manejarCambioEstadoPlan(planId, nuevoEstado) {
        const plan = await this.planRepository.getById(planId);
        
        if (plan.tieneClientes()) {
            // Si tiene clientes, cancelar sus contratos y hacer rollback de seguimientos
            const clientes = await this.planRepository.getAll({ _id: new ObjectId(planId) });
            
            for (const cliente of clientes) {
                const contratosActivos = await this.contratoRepository.getActiveContractsByClient(cliente.clienteId);
                const contratoDelPlan = contratosActivos.find(c => c.planId.toString() === planId.toString());
                
                if (contratoDelPlan) {
                    // Cancelar el contrato
                    await this.contratoRepository.cancelContract(contratoDelPlan.contratoId);
                    
                    // ROLLBACK: Eliminar seguimientos del cliente
                    const { SeguimientoRepository } = require('../repositories');
                    const seguimientoRepository = new SeguimientoRepository(this.db);
                    
                    try {
                        const rollbackSeguimientos = await seguimientoRepository.deleteFollowUpsByClientWithRollback(
                            cliente.clienteId, 
                            `Cancelación de plan: ${plan.nombre}`
                        );
                        
                        if (rollbackSeguimientos.success && rollbackSeguimientos.eliminados > 0) {
                            console.log(`✅ Rollback completado para cliente ${cliente.clienteId}: ${rollbackSeguimientos.eliminados} seguimientos eliminados`);
                        }
                    } catch (rollbackError) {
                        // Si falla el rollback de seguimientos, registrar pero continuar
                        console.log(`⚠️ Error en rollback de seguimientos para cliente ${cliente.clienteId}: ${rollbackError.message}`);
                    }
                }
            }
        }
    }

    /**
     * Desasocia todos los clientes de un plan
     * @param {string|ObjectId} planId - ID del plan
     */
    async desasociarTodosLosClientes(planId) {
        const plan = await this.planRepository.getById(planId);
        
        if (plan.tieneClientes()) {
            for (const clienteId of plan.clientes) {
                await this.desasociarClienteDePlan(planId, clienteId);
            }
        }
    }

    /**
     * Asocia un cliente a un plan
     * @param {string|ObjectId} planId - ID del plan
     * @param {string|ObjectId} clienteId - ID del cliente
     * @returns {Promise<Object>} Resultado de la operación
     */
    async asociarClienteAPlan(planId, clienteId) {
        try {
            // Verificar que el plan existe y está activo
            const plan = await this.planRepository.getById(planId);
            if (!plan) {
                throw new Error('Plan no encontrado');
            }

            if (!plan.estaActivo()) {
                throw new Error('Solo se pueden asociar clientes a planes activos');
            }

            // Verificar que el cliente existe
            const cliente = await this.clienteRepository.getById(clienteId);
            if (!cliente) {
                throw new Error('Cliente no encontrado');
            }

            // Verificar compatibilidad de nivel
            if (!plan.esCompatibleConNivel(cliente.nivel)) {
                throw new Error(`El plan no es compatible con el nivel del cliente (${cliente.nivel})`);
            }

            // Verificar que no esté ya asociado
            const yaAsociado = await this.clienteRepository.clientHasPlan(clienteId, planId);
            if (yaAsociado) {
                throw new Error('El cliente ya está asociado a este plan');
            }

            // Iniciar transacción para operaciones críticas
            const session = this.db.client.startSession();
            
            try {
                let resultado;
                
                await session.withTransaction(async () => {
                    // Asociar cliente al plan
                    await this.planRepository.addClientToPlan(planId, clienteId);
                    
                    // Asociar plan al cliente
                    await this.clienteRepository.addPlanToClient(clienteId, planId);

                    resultado = {
                        success: true,
                        mensaje: 'Cliente asociado al plan exitosamente'
                    };
                });

                return resultado;
            } finally {
                await session.endSession();
            }

        } catch (error) {
            throw new Error(`Error al asociar cliente al plan: ${error.message}`);
        }
    }
}

// ===== EXPORTACIÓN DEL MÓDULO =====
// PATRÓN: Module Pattern - Exporta la clase como módulo
// PRINCIPIO SOLID S: Responsabilidad de proporcionar la interfaz pública del servicio
module.exports = PlanEntrenamientoService;
