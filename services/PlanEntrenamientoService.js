const { ObjectId } = require('mongodb');
const { PlanEntrenamiento } = require('../models');
const PlanEntrenamientoRepository = require('../repositories/PlanEntrenamientoRepository');
const ClienteRepository = require('../repositories/ClienteRepository');
const ContratoRepository = require('../repositories/ContratoRepository');

/**
 * Servicio para gestión de planes de entrenamiento
 * Implementa lógica de negocio para planes siguiendo principios SOLID
 * Maneja validaciones, transacciones y coordinación con otros módulos
 */
class PlanEntrenamientoService {
    constructor(db) {
        this.db = db;
        this.planRepository = new PlanEntrenamientoRepository(db);
        this.clienteRepository = new ClienteRepository(db);
        this.contratoRepository = new ContratoRepository(db);
    }

    /**
     * Crea un nuevo plan de entrenamiento
     * @param {Object} dataPlan - Datos del plan a crear
     * @returns {Promise<Object>} Resultado de la operación
     */
    async crearPlan(dataPlan) {
        try {
            // Validar datos requeridos
            this.validarDatosPlan(dataPlan);

            // Crear instancia del plan
            const plan = new PlanEntrenamiento({
                nombre: dataPlan.nombre,
                duracionSemanas: dataPlan.duracionSemanas,
                metasFisicas: dataPlan.metasFisicas,
                nivel: dataPlan.nivel,
                clientes: dataPlan.clientes || [],
                estado: dataPlan.estado || 'activo'
            });

            // Crear en la base de datos
            const planId = await this.planRepository.create(plan);

            return {
                success: true,
                planId,
                mensaje: 'Plan de entrenamiento creado exitosamente',
                data: plan.getResumen()
            };

        } catch (error) {
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
            // Si tiene clientes, cancelar sus contratos
            const clientes = await this.planRepository.getAll({ _id: new ObjectId(planId) });
            for (const cliente of clientes) {
                const contratosActivos = await this.contratoRepository.getActiveContractsByClient(cliente.clienteId);
                const contratoDelPlan = contratosActivos.find(c => c.planId.toString() === planId.toString());
                
                if (contratoDelPlan) {
                    await this.contratoRepository.cancelContract(contratoDelPlan.contratoId);
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

module.exports = PlanEntrenamientoService;
