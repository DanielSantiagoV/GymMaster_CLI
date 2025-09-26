const { Cliente } = require('../models');
const { ClienteRepository } = require('../repositories');
const { ObjectId } = require('mongodb');

/**
 * Servicio de Clientes - Lógica de negocio para gestión de clientes
 * Implementa principios SOLID y maneja la lógica de negocio específica
 * Se comunica con ClienteRepository para acceso a datos
 */
class ClienteService {
    constructor(db) {
        this.clienteRepository = new ClienteRepository(db);
        this.db = db;
    }

    /**
     * Crea un nuevo cliente con validaciones de negocio
     * @param {Object} dataCliente - Datos del cliente a crear
     * @returns {Promise<Object>} Cliente creado con información adicional
     * @throws {Error} Si la validación de negocio falla
     */
    async crearCliente(dataCliente) {
        try {
            // Validaciones de negocio adicionales
            await this.validarDatosCliente(dataCliente);
            
            // Normalizar email para consistencia
            const emailNormalizado = dataCliente.email.toLowerCase().trim();
            
            // Verificar que no exista un cliente con el mismo email
            const clienteExistente = await this.clienteRepository.getByEmail(emailNormalizado);
            
            if (clienteExistente) {
                throw new Error('Ya existe un cliente registrado con este email');
            }

            // Crear instancia del modelo con validaciones
            const cliente = new Cliente(dataCliente);
            
            // Persistir en la base de datos
            const clienteId = await this.clienteRepository.create(cliente);
            
            // Obtener el cliente creado para retornar información completa
            const clienteCreado = await this.clienteRepository.getById(clienteId);
            
            return {
                success: true,
                message: 'Cliente creado exitosamente',
                data: clienteCreado.getResumen(),
                clienteId: clienteId
            };
        } catch (error) {
            throw new Error(`Error al crear cliente: ${error.message}`);
        }
    }

    /**
     * Lista clientes con filtros y paginación
     * @param {Object} filtro - Filtros de búsqueda
     * @param {Object} opciones - Opciones de paginación y ordenamiento
     * @returns {Promise<Object>} Lista de clientes con metadatos
     */
    async listarClientes(filtro = {}, opciones = {}) {
        try {
            const { 
                pagina = 1, 
                limite = 10, 
                ordenar = 'fechaRegistro', 
                direccion = 'desc' 
            } = opciones;

            // Validar parámetros de paginación
            if (pagina < 1 || limite < 1 || limite > 100) {
                throw new Error('Parámetros de paginación inválidos');
            }

            const skip = (pagina - 1) * limite;
            const sort = { [ordenar]: direccion === 'desc' ? -1 : 1 };

            // Obtener clientes con filtros
            const clientes = await this.clienteRepository.getAll(filtro, {
                limit: limite,
                skip: skip,
                sort: sort
            });

            // Obtener total de clientes para paginación (más eficiente)
            const totalClientes = await this.clienteRepository.countClientes(filtro);
            const totalPaginas = Math.ceil(totalClientes / limite);

            return {
                success: true,
                data: clientes.map(cliente => cliente.getResumen()),
                paginacion: {
                    paginaActual: pagina,
                    totalPaginas: totalPaginas,
                    totalClientes: totalClientes,
                    limite: limite,
                    tieneSiguiente: pagina < totalPaginas,
                    tieneAnterior: pagina > 1
                }
            };
        } catch (error) {
            throw new Error(`Error al listar clientes: ${error.message}`);
        }
    }

    /**
     * Actualiza un cliente existente con validaciones de negocio
     * @param {string} id - ID del cliente a actualizar
     * @param {Object} datosActualizados - Datos a actualizar
     * @returns {Promise<Object>} Cliente actualizado
     * @throws {Error} Si la validación de negocio falla
     */
    async actualizarCliente(id, datosActualizados) {
        try {
            // Validar ID
            if (!ObjectId.isValid(id)) {
                throw new Error('ID del cliente no es válido');
            }

            // Verificar que el cliente existe
            const clienteExistente = await this.clienteRepository.getById(id);
            if (!clienteExistente) {
                throw new Error('Cliente no encontrado');
            }

            // Validaciones de negocio para actualización
            await this.validarActualizacionCliente(datosActualizados, clienteExistente);

            // Si se está actualizando el email, verificar que no exista otro cliente con el mismo email
            if (datosActualizados.email) {
                const emailNormalizado = datosActualizados.email.toLowerCase().trim();
                
                if (emailNormalizado !== clienteExistente.email) {
                    const clienteConEmail = await this.clienteRepository.getByEmail(emailNormalizado);
                    
                    if (clienteConEmail && !clienteConEmail.clienteId.equals(new ObjectId(id))) {
                        throw new Error('Ya existe otro cliente con este email');
                    }
                }
            }

            // Actualizar en la base de datos
            const actualizado = await this.clienteRepository.update(id, datosActualizados);
            
            if (!actualizado) {
                throw new Error('No se pudo actualizar el cliente');
            }

            // Obtener el cliente actualizado
            const clienteActualizado = await this.clienteRepository.getById(id);

            return {
                success: true,
                message: 'Cliente actualizado exitosamente',
                data: clienteActualizado.getResumen()
            };
        } catch (error) {
            throw new Error(`Error al actualizar cliente: ${error.message}`);
        }
    }

    /**
     * Elimina un cliente con validaciones de seguridad
     * @param {string} id - ID del cliente a eliminar
     * @param {boolean} forzarEliminacion - Si debe forzar la eliminación
     * @returns {Promise<Object>} Resultado de la eliminación
     * @throws {Error} Si hay dependencias activas
     */
    async eliminarCliente(id, forzarEliminacion = false) {
        try {
            // Validar ID
            if (!ObjectId.isValid(id)) {
                throw new Error('ID del cliente no es válido');
            }

            // Verificar que el cliente existe
            const cliente = await this.clienteRepository.getById(id);
            if (!cliente) {
                throw new Error('Cliente no encontrado');
            }

            // Validaciones de seguridad antes de eliminar
            await this.validarEliminacionCliente(cliente, forzarEliminacion);

            // Eliminar el cliente
            const eliminado = await this.clienteRepository.delete(id);
            
            if (!eliminado) {
                throw new Error('No se pudo eliminar el cliente');
            }

            return {
                success: true,
                message: 'Cliente eliminado exitosamente',
                clienteEliminado: cliente.getResumen()
            };
        } catch (error) {
            throw new Error(`Error al eliminar cliente: ${error.message}`);
        }
    }

    /**
     * Asocia un plan a un cliente
     * @param {string} clienteId - ID del cliente
     * @param {string} planId - ID del plan
     * @returns {Promise<Object>} Resultado de la asociación
     * @throws {Error} Si la asociación falla
     */
    async asociarPlanACliente(clienteId, planId) {
        try {
            // Validar IDs
            if (!ObjectId.isValid(clienteId) || !ObjectId.isValid(planId)) {
                throw new Error('IDs deben ser ObjectIds válidos');
            }

            // Verificar que el cliente existe
            const cliente = await this.clienteRepository.getById(clienteId);
            if (!cliente) {
                throw new Error('Cliente no encontrado');
            }

            // Verificar que el plan existe (usando el repositorio de planes)
            const { PlanEntrenamientoRepository } = require('../repositories');
            const planRepository = new PlanEntrenamientoRepository(this.db);
            const plan = await planRepository.getById(planId);
            if (!plan) {
                throw new Error('Plan no encontrado');
            }

            // Verificar que el plan esté activo
            if (!plan.estaActivo()) {
                throw new Error('No se puede asociar un plan inactivo');
            }

            // Verificar que el cliente no tenga ya este plan
            if (cliente.planes.some(planIdExistente => planIdExistente.equals(planId))) {
                throw new Error('El cliente ya tiene este plan asignado');
            }

            // Asociar el plan al cliente
            const asociado = await this.clienteRepository.addPlanToClient(clienteId, planId);
            
            if (!asociado) {
                throw new Error('No se pudo asociar el plan al cliente');
            }

            // También agregar el cliente al plan
            await planRepository.addClientToPlan(planId, clienteId);

            return {
                success: true,
                message: 'Plan asociado al cliente exitosamente',
                clienteId: clienteId,
                planId: planId
            };
        } catch (error) {
            throw new Error(`Error al asociar plan al cliente: ${error.message}`);
        }
    }

    /**
     * Desasocia un plan de un cliente
     * @param {string} clienteId - ID del cliente
     * @param {string} planId - ID del plan
     * @returns {Promise<Object>} Resultado de la desasociación
     * @throws {Error} Si la desasociación falla
     */
    async desasociarPlanDeCliente(clienteId, planId) {
        try {
            // Validar IDs
            if (!ObjectId.isValid(clienteId) || !ObjectId.isValid(planId)) {
                throw new Error('IDs deben ser ObjectIds válidos');
            }

            // Verificar que el cliente existe
            const cliente = await this.clienteRepository.getById(clienteId);
            if (!cliente) {
                throw new Error('Cliente no encontrado');
            }

            // Verificar que el cliente tenga este plan
            if (!cliente.planes.some(planIdExistente => planIdExistente.equals(planId))) {
                throw new Error('El cliente no tiene este plan asignado');
            }

            // Desasociar el plan del cliente
            const desasociado = await this.clienteRepository.removePlanFromClient(clienteId, planId);
            
            if (!desasociado) {
                throw new Error('No se pudo desasociar el plan del cliente');
            }

            // También remover el cliente del plan
            const { PlanEntrenamientoRepository } = require('../repositories');
            const planRepository = new PlanEntrenamientoRepository(this.db);
            await planRepository.removeClientFromPlan(planId, clienteId);

            return {
                success: true,
                message: 'Plan desasociado del cliente exitosamente',
                clienteId: clienteId,
                planId: planId
            };
        } catch (error) {
            throw new Error(`Error al desasociar plan del cliente: ${error.message}`);
        }
    }

    /**
     * Obtiene clientes activos
     * @returns {Promise<Object>} Lista de clientes activos
     */
    async obtenerClientesActivos() {
        try {
            const clientes = await this.clienteRepository.getActiveClients();
            
            return {
                success: true,
                data: clientes.map(cliente => cliente.getResumen()),
                total: clientes.length
            };
        } catch (error) {
            throw new Error(`Error al obtener clientes activos: ${error.message}`);
        }
    }

    /**
     * Obtiene clientes con planes asignados
     * @returns {Promise<Object>} Lista de clientes con planes
     */
    async obtenerClientesConPlanes() {
        try {
            const clientes = await this.clienteRepository.getClientsWithActivePlans();
            
            return {
                success: true,
                data: clientes.map(cliente => cliente.getResumen()),
                total: clientes.length
            };
        } catch (error) {
            throw new Error(`Error al obtener clientes con planes: ${error.message}`);
        }
    }

    /**
     * Busca clientes por término de búsqueda
     * @param {string} termino - Término de búsqueda
     * @returns {Promise<Object>} Lista de clientes que coinciden
     */
    async buscarClientes(termino) {
        try {
            if (!termino || typeof termino !== 'string') {
                throw new Error('Término de búsqueda debe ser una string válida');
            }

            const clientes = await this.clienteRepository.searchClients(termino);
            
            return {
                success: true,
                data: clientes.map(cliente => cliente.getResumen()),
                total: clientes.length,
                termino: termino
            };
        } catch (error) {
            throw new Error(`Error al buscar clientes: ${error.message}`);
        }
    }

    /**
     * Obtiene estadísticas de clientes
     * @returns {Promise<Object>} Estadísticas de clientes
     */
    async obtenerEstadisticasClientes() {
        try {
            const estadisticas = await this.clienteRepository.getClientStats();
            
            return {
                success: true,
                data: estadisticas
            };
        } catch (error) {
            throw new Error(`Error al obtener estadísticas de clientes: ${error.message}`);
        }
    }

    /**
     * Obtiene un cliente por ID con información completa
     * @param {string} id - ID del cliente
     * @returns {Promise<Object>} Cliente con información completa
     */
    async obtenerClientePorId(id) {
        try {
            if (!ObjectId.isValid(id)) {
                throw new Error('ID del cliente no es válido');
            }

            const cliente = await this.clienteRepository.getById(id);
            if (!cliente) {
                throw new Error('Cliente no encontrado');
            }

            return {
                success: true,
                data: cliente.getResumen()
            };
        } catch (error) {
            throw new Error(`Error al obtener cliente: ${error.message}`);
        }
    }

    /**
     * Valida los datos del cliente antes de crear
     * @param {Object} dataCliente - Datos del cliente
     * @private
     */
    async validarDatosCliente(dataCliente) {
        const camposRequeridos = ['nombre', 'apellido', 'email', 'telefono'];
        
        for (const campo of camposRequeridos) {
            if (!dataCliente[campo]) {
                throw new Error(`Campo ${campo} es obligatorio`);
            }
        }

        // Validaciones adicionales de negocio
        if (dataCliente.nombre.length < 2) {
            throw new Error('El nombre debe tener al menos 2 caracteres');
        }

        if (dataCliente.apellido.length < 2) {
            throw new Error('El apellido debe tener al menos 2 caracteres');
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(dataCliente.email)) {
            throw new Error('El email debe tener un formato válido');
        }

        // Normalizar email para consistencia
        dataCliente.email = dataCliente.email.toLowerCase().trim();

        // Validar formato de teléfono
        const telefonoLimpio = dataCliente.telefono.replace(/[\s\-\(\)]/g, '');
        if (!/^\d+$/.test(telefonoLimpio) || telefonoLimpio.length < 7) {
            throw new Error('El teléfono debe contener solo números y tener al menos 7 dígitos');
        }
    }

    /**
     * Valida la actualización del cliente
     * @param {Object} datosActualizados - Datos a actualizar
     * @param {Cliente} clienteExistente - Cliente existente
     * @private
     */
    async validarActualizacionCliente(datosActualizados, clienteExistente) {
        // Validar que no se esté intentando desactivar un cliente con planes activos
        if (datosActualizados.activo === false && clienteExistente.tienePlanes()) {
            throw new Error('No se puede desactivar un cliente que tiene planes asignados');
        }

        // Validar campos si se están actualizando
        if (datosActualizados.nombre && datosActualizados.nombre.length < 2) {
            throw new Error('El nombre debe tener al menos 2 caracteres');
        }

        if (datosActualizados.apellido && datosActualizados.apellido.length < 2) {
            throw new Error('El apellido debe tener al menos 2 caracteres');
        }

        if (datosActualizados.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(datosActualizados.email)) {
                throw new Error('El email debe tener un formato válido');
            }
            
            // Normalizar email para consistencia
            datosActualizados.email = datosActualizados.email.toLowerCase().trim();
        }

        if (datosActualizados.telefono) {
            const telefonoLimpio = datosActualizados.telefono.replace(/[\s\-\(\)]/g, '');
            if (!/^\d+$/.test(telefonoLimpio) || telefonoLimpio.length < 7) {
                throw new Error('El teléfono debe contener solo números y tener al menos 7 dígitos');
            }
        }
    }

    /**
     * Valida la eliminación del cliente
     * @param {Cliente} cliente - Cliente a eliminar
     * @param {boolean} forzarEliminacion - Si debe forzar la eliminación
     * @private
     */
    async validarEliminacionCliente(cliente, forzarEliminacion) {
        // Verificar si el cliente tiene planes asignados
        if (cliente.tienePlanes()) {
            if (!forzarEliminacion) {
                throw new Error('No se puede eliminar un cliente que tiene planes asignados. Use forzarEliminacion=true para forzar la eliminación');
            }
            
            // Si se fuerza la eliminación, desasociar todos los planes (optimizado con Promise.all)
            const desasociaciones = cliente.planes.map(planId => 
                this.desasociarPlanDeCliente(cliente.clienteId.toString(), planId.toString())
            );
            await Promise.all(desasociaciones);
        }

        // Verificar si el cliente tiene contratos activos
        const { ContratoRepository } = require('../repositories');
        const contratoRepository = new ContratoRepository(this.db);
        const contratosActivos = await contratoRepository.getActiveContractsByClient(cliente.clienteId);
        
        if (contratosActivos.length > 0) {
            if (!forzarEliminacion) {
                throw new Error('No se puede eliminar un cliente con contratos activos. Use forzarEliminacion=true para forzar la eliminación');
            }
            
            // Si se fuerza la eliminación, cancelar todos los contratos (optimizado con Promise.all)
            const cancelaciones = contratosActivos.map(contrato => 
                contratoRepository.cancelContract(contrato.contratoId.toString())
            );
            await Promise.all(cancelaciones);
        }
    }
}

module.exports = ClienteService;
