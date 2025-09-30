// ===== IMPORTS Y DEPENDENCIAS =====
// Importación de modelos de dominio
// PATRÓN: Dependency Injection - Se inyectan las dependencias a través del constructor
// PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (modelos) no de implementaciones concretas
const { Cliente } = require('../models'); // Modelo de dominio para entidad Cliente
const { ClienteRepository } = require('../repositories'); // Repositorio para operaciones CRUD de clientes
const { ObjectId } = require('mongodb'); // Utilidad para manejo de IDs de MongoDB

/**
 * Servicio de Clientes - Lógica de negocio para gestión de clientes
 * Implementa principios SOLID y maneja la lógica de negocio específica
 * Se comunica con ClienteRepository para acceso a datos
 * 
 * PATRÓN: Service Layer - Capa de servicio que orquesta la lógica de negocio
 * PATRÓN: Facade - Proporciona una interfaz simplificada para operaciones complejas de clientes
 * PRINCIPIO SOLID S: Responsabilidad Única - Se encarga únicamente de la lógica de negocio de clientes
 * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (repositorios) no de implementaciones concretas
 */
class ClienteService {
    /**
     * Constructor del servicio de clientes
     * @param {Object} db - Instancia de la base de datos (MongoDB)
     * 
     * PATRÓN: Dependency Injection - Recibe las dependencias como parámetros
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones, no de implementaciones concretas
     * BUENA PRÁCTICA: Inicialización de repositorios en el constructor para reutilización
     */
    constructor(db) {
        // PATRÓN: Repository - Abstrae el acceso a datos de clientes
        // PRINCIPIO SOLID D: Depende de abstracción ClienteRepository
        this.clienteRepository = new ClienteRepository(db);
        // Almacena la conexión a la base de datos para uso interno
        this.db = db;
    }

    /**
     * Crea un nuevo cliente con validaciones de negocio
     * @param {Object} dataCliente - Datos del cliente a crear
     * @returns {Promise<Object>} Cliente creado con información adicional
     * @throws {Error} Si la validación de negocio falla
     * 
     * PATRÓN: Template Method - Define el flujo estándar de creación de clientes
     * PATRÓN: Factory - Crea instancias de Cliente
     * PATRÓN: Data Transfer Object (DTO) - Retorna objeto estructurado
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de crear clientes
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas validaciones
     * 
     * NOTA: No hay transacciones explícitas aquí, cada operación es independiente
     * POSIBLE MEJORA: Implementar transacciones para garantizar consistencia
     */
    async crearCliente(dataCliente) {
        try {
            // ===== VALIDACIONES DE NEGOCIO =====
            // PATRÓN: Template Method - Delegación de validaciones específicas
            // PRINCIPIO SOLID S: Separación de responsabilidades - validación delegada
            await this.validarDatosCliente(dataCliente);
            
            // ===== NORMALIZACIÓN DE DATOS =====
            // BUENA PRÁCTICA: Normalización de email para consistencia
            // PATRÓN: Data Transformation - Transformación de datos de entrada
            const emailNormalizado = dataCliente.email.toLowerCase().trim();
            
            // ===== VERIFICACIÓN DE UNICIDAD =====
            // PATRÓN: Repository - Acceso a datos a través de abstracción
            // PRINCIPIO SOLID D: Depende de abstracción ClienteRepository
            const clienteExistente = await this.clienteRepository.getByEmail(emailNormalizado);
            
            // PATRÓN: Guard Clause - Validación temprana para evitar procesamiento innecesario
            if (clienteExistente) {
                throw new Error('Ya existe un cliente registrado con este email');
            }

            // ===== CREACIÓN DE ENTIDAD DE DOMINIO =====
            // PATRÓN: Factory - Creación de instancia de Cliente
            // PATRÓN: Domain Model - Uso de entidad de dominio con validaciones
            // PRINCIPIO SOLID S: Delegación de responsabilidad de validación al modelo
            const cliente = new Cliente(dataCliente);
            
            // ===== PERSISTENCIA =====
            // PATRÓN: Repository - Abstrae la operación de inserción
            // PRINCIPIO SOLID D: Depende de abstracción, no de implementación concreta
            const clienteId = await this.clienteRepository.create(cliente);
            
            // ===== OBTENCIÓN DE DATOS COMPLETOS =====
            // BUENA PRÁCTICA: Obtener datos completos después de inserción
            // PATRÓN: Repository - Consulta de datos recién insertados
            const clienteCreado = await this.clienteRepository.getById(clienteId);
            
            // ===== CONSTRUCCIÓN DE RESPUESTA =====
            // PATRÓN: Data Transfer Object (DTO) - Objeto estructurado para transferencia
            // PATRÓN: Builder - Construcción paso a paso del objeto de respuesta
            // PRINCIPIO SOLID S: Responsabilidad de estructurar respuesta
            return {
                success: true, // Indicador de éxito de la operación
                message: 'Cliente creado exitosamente', // Mensaje descriptivo
                data: clienteCreado.getResumen(), // Datos del cliente usando método del modelo
                clienteId: clienteId // ID del cliente creado para referencia
            };
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Wrapping - Envuelve errores con contexto específico
            // PRINCIPIO SOLID S: Responsabilidad de manejo de errores del método
            throw new Error(`Error al crear cliente: ${error.message}`);
        }
    }

    /**
     * Lista clientes con filtros y paginación
     * @param {Object} filtro - Filtros de búsqueda
     * @param {Object} opciones - Opciones de paginación y ordenamiento
     * @returns {Promise<Object>} Lista de clientes con metadatos
     * 
     * PATRÓN: Template Method - Define el flujo estándar de listado con paginación
     * PATRÓN: Data Transfer Object (DTO) - Retorna objeto estructurado con metadatos
     * PATRÓN: Mapper - Transforma entidades a DTOs
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de listar clientes
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevos filtros y opciones
     * 
     * NOTA: No hay transacciones aquí, solo operaciones de lectura
     */
    async listarClientes(filtro = {}, opciones = {}) {
        try {
            // ===== DESESTRUCTURACIÓN DE OPCIONES =====
            // PATRÓN: Default Parameters - Valores por defecto para parámetros opcionales
            // BUENA PRÁCTICA: Valores sensatos por defecto para paginación
            const { 
                pagina = 1, // Página por defecto
                limite = 10, // Límite por defecto
                ordenar = 'fechaRegistro', // Campo de ordenamiento por defecto
                direccion = 'desc' // Dirección de ordenamiento por defecto
            } = opciones;

            // ===== VALIDACIÓN DE PARÁMETROS =====
            // PATRÓN: Guard Clause - Validación temprana de parámetros
            // PRINCIPIO SOLID S: Responsabilidad de validación de entrada
            if (pagina < 1 || limite < 1 || limite > 100) {
                throw new Error('Parámetros de paginación inválidos');
            }

            // ===== CÁLCULO DE PAGINACIÓN =====
            // BUENA PRÁCTICA: Cálculo de offset para paginación
            const skip = (pagina - 1) * limite;
            // PATRÓN: Strategy - Diferentes estrategias de ordenamiento
            const sort = { [ordenar]: direccion === 'desc' ? -1 : 1 };

            // ===== OBTENCIÓN DE DATOS =====
            // PATRÓN: Repository - Acceso a datos a través de abstracción
            // PRINCIPIO SOLID D: Depende de abstracción ClienteRepository
            const clientes = await this.clienteRepository.getAll(filtro, {
                limit: limite, // Límite de resultados
                skip: skip, // Offset para paginación
                sort: sort // Ordenamiento
            });

            // ===== CÁLCULO DE METADATOS =====
            // BUENA PRÁCTICA: Consulta separada para total (más eficiente que contar resultados)
            // PATRÓN: Repository - Consulta de conteo a través de abstracción
            const totalClientes = await this.clienteRepository.countClientes(filtro);
            const totalPaginas = Math.ceil(totalClientes / limite);

            // ===== CONSTRUCCIÓN DE RESPUESTA =====
            // PATRÓN: Data Transfer Object (DTO) - Objeto estructurado para transferencia
            // PATRÓN: Mapper - Transforma entidades de dominio a DTOs
            // PATRÓN: Builder - Construcción paso a paso del objeto de respuesta
            return {
                success: true, // Indicador de éxito
                // PATRÓN: Mapper - Transformación de cada cliente a resumen
                data: clientes.map(cliente => cliente.getResumen()),
                // PATRÓN: Value Object - Objeto con metadatos de paginación
                paginacion: {
                    paginaActual: pagina, // Página actual
                    totalPaginas: totalPaginas, // Total de páginas
                    totalClientes: totalClientes, // Total de clientes
                    limite: limite, // Límite por página
                    tieneSiguiente: pagina < totalPaginas, // Indicador de página siguiente
                    tieneAnterior: pagina > 1 // Indicador de página anterior
                }
            };
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Wrapping - Envuelve errores con contexto específico
            // PRINCIPIO SOLID S: Responsabilidad de manejo de errores del método
            throw new Error(`Error al listar clientes: ${error.message}`);
        }
    }

    /**
     * Actualiza un cliente existente con validaciones de negocio
     * @param {string} id - ID del cliente a actualizar
     * @param {Object} datosActualizados - Datos a actualizar
     * @returns {Promise<Object>} Cliente actualizado
     * @throws {Error} Si la validación de negocio falla
     * 
     * PATRÓN: Template Method - Define el flujo estándar de actualización
     * PATRÓN: Data Transfer Object (DTO) - Retorna objeto estructurado
     * PATRÓN: Guard Clause - Validaciones tempranas
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de actualizar clientes
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas validaciones
     * 
     * NOTA: No hay transacciones explícitas aquí, cada operación es independiente
     * POSIBLE MEJORA: Implementar transacciones para garantizar consistencia
     */
    async actualizarCliente(id, datosActualizados) {
        try {
            // ===== VALIDACIÓN DE ID =====
            // PATRÓN: Guard Clause - Validación temprana de ID
            // PRINCIPIO SOLID S: Responsabilidad de validación de entrada
            if (!ObjectId.isValid(id)) {
                throw new Error('ID del cliente no es válido');
            }

            // ===== VERIFICACIÓN DE EXISTENCIA =====
            // PATRÓN: Repository - Consulta de existencia a través de abstracción
            // PRINCIPIO SOLID D: Depende de abstracción ClienteRepository
            const clienteExistente = await this.clienteRepository.getById(id);
            // PATRÓN: Guard Clause - Validación temprana de existencia
            if (!clienteExistente) {
                throw new Error('Cliente no encontrado');
            }

            // ===== VALIDACIONES DE NEGOCIO =====
            // PATRÓN: Template Method - Delegación de validaciones específicas
            // PRINCIPIO SOLID S: Separación de responsabilidades - validación delegada
            await this.validarActualizacionCliente(datosActualizados, clienteExistente);

            // ===== VALIDACIÓN DE UNICIDAD DE EMAIL =====
            // PATRÓN: Strategy - Diferentes estrategias según el campo a actualizar
            // BUENA PRÁCTICA: Validación específica para campos únicos
            if (datosActualizados.email) {
                const emailNormalizado = datosActualizados.email.toLowerCase().trim();
                
                // Solo validar si el email ha cambiado
                if (emailNormalizado !== clienteExistente.email) {
                    // PATRÓN: Repository - Consulta de unicidad
                    const clienteConEmail = await this.clienteRepository.getByEmail(emailNormalizado);
                    
                    // PATRÓN: Guard Clause - Validación de unicidad
                    if (clienteConEmail && !clienteConEmail.clienteId.equals(new ObjectId(id))) {
                        throw new Error('Ya existe otro cliente con este email');
                    }
                }
            }

            // ===== ACTUALIZACIÓN EN BASE DE DATOS =====
            // PATRÓN: Repository - Abstrae la operación de actualización
            // PRINCIPIO SOLID D: Depende de abstracción, no de implementación concreta
            const actualizado = await this.clienteRepository.update(id, datosActualizados);
            
            // PATRÓN: Guard Clause - Validación de resultado de actualización
            if (!actualizado) {
                throw new Error('No se pudo actualizar el cliente');
            }

            // ===== OBTENCIÓN DE DATOS ACTUALIZADOS =====
            // BUENA PRÁCTICA: Obtener datos actualizados después de modificación
            // PATRÓN: Repository - Consulta de datos recién actualizados
            const clienteActualizado = await this.clienteRepository.getById(id);

            // ===== CONSTRUCCIÓN DE RESPUESTA =====
            // PATRÓN: Data Transfer Object (DTO) - Objeto estructurado para transferencia
            // PATRÓN: Builder - Construcción paso a paso del objeto de respuesta
            return {
                success: true, // Indicador de éxito de la operación
                message: 'Cliente actualizado exitosamente', // Mensaje descriptivo
                data: clienteActualizado.getResumen() // Datos del cliente usando método del modelo
            };
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Wrapping - Envuelve errores con contexto específico
            // PRINCIPIO SOLID S: Responsabilidad de manejo de errores del método
            throw new Error(`Error al actualizar cliente: ${error.message}`);
        }
    }

    /**
     * Elimina un cliente con validaciones de seguridad
     * @param {string} id - ID del cliente a eliminar
     * @param {boolean} forzarEliminacion - Si debe forzar la eliminación
     * @returns {Promise<Object>} Resultado de la eliminación
     * @throws {Error} Si hay dependencias activas
     * 
     * PATRÓN: Template Method - Define el flujo estándar de eliminación
     * PATRÓN: Data Transfer Object (DTO) - Retorna objeto estructurado
     * PATRÓN: Guard Clause - Validaciones tempranas
     * PATRÓN: Strategy - Diferentes estrategias según forzarEliminacion
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de eliminar clientes
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas validaciones
     * 
     * NOTA: No hay transacciones explícitas aquí, cada operación es independiente
     * POSIBLE MEJORA: Implementar transacciones para garantizar consistencia
     */
    async eliminarCliente(id, forzarEliminacion = false) {
        try {
            // ===== VALIDACIÓN DE ID =====
            // PATRÓN: Guard Clause - Validación temprana de ID
            // PRINCIPIO SOLID S: Responsabilidad de validación de entrada
            if (!ObjectId.isValid(id)) {
                throw new Error('ID del cliente no es válido');
            }

            // ===== VERIFICACIÓN DE EXISTENCIA =====
            // PATRÓN: Repository - Consulta de existencia a través de abstracción
            // PRINCIPIO SOLID D: Depende de abstracción ClienteRepository
            const cliente = await this.clienteRepository.getById(id);
            // PATRÓN: Guard Clause - Validación temprana de existencia
            if (!cliente) {
                throw new Error('Cliente no encontrado');
            }

            // ===== VALIDACIONES DE SEGURIDAD =====
            // PATRÓN: Template Method - Delegación de validaciones específicas
            // PATRÓN: Strategy - Diferentes estrategias según forzarEliminacion
            // PRINCIPIO SOLID S: Separación de responsabilidades - validación delegada
            await this.validarEliminacionCliente(cliente, forzarEliminacion);

            // ===== ELIMINACIÓN EN BASE DE DATOS =====
            // PATRÓN: Repository - Abstrae la operación de eliminación
            // PRINCIPIO SOLID D: Depende de abstracción, no de implementación concreta
            const eliminado = await this.clienteRepository.delete(id);
            
            // PATRÓN: Guard Clause - Validación de resultado de eliminación
            if (!eliminado) {
                throw new Error('No se pudo eliminar el cliente');
            }

            // ===== CONSTRUCCIÓN DE RESPUESTA =====
            // PATRÓN: Data Transfer Object (DTO) - Objeto estructurado para transferencia
            // PATRÓN: Builder - Construcción paso a paso del objeto de respuesta
            return {
                success: true, // Indicador de éxito de la operación
                message: 'Cliente eliminado exitosamente', // Mensaje descriptivo
                clienteEliminado: cliente.getResumen() // Datos del cliente eliminado
            };
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Wrapping - Envuelve errores con contexto específico
            // PRINCIPIO SOLID S: Responsabilidad de manejo de errores del método
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
     * Obtiene un cliente por ID
     * @param {string} id - ID del cliente
     * @returns {Promise<Object>} Cliente encontrado
     */
    async getClienteById(id) {
        try {
            if (!ObjectId.isValid(id)) {
                throw new Error('ID del cliente no es válido');
            }

            const cliente = await this.clienteRepository.getById(id);
            if (!cliente) {
                return null;
            }

            return cliente.getResumen();
        } catch (error) {
            throw new Error(`Error al obtener cliente: ${error.message}`);
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
     * 
     * PATRÓN: Template Method - Define el flujo estándar de validación de eliminación
     * PATRÓN: Strategy - Diferentes estrategias según forzarEliminacion
     * PATRÓN: Rollback - Manejo de rollback en caso de eliminación forzada
     * PATRÓN: Circuit Breaker - Manejo de errores en rollback
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de validar eliminación
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas validaciones
     * 
     * TRANSACCIONES: Este método maneja operaciones de rollback pero NO transacciones explícitas
     * POSIBLE MEJORA: Implementar transacciones reales para garantizar consistencia
     */
    async validarEliminacionCliente(cliente, forzarEliminacion) {
        // ===== VALIDACIÓN DE PLANES ASIGNADOS =====
        // PATRÓN: Guard Clause - Validación temprana de dependencias
        // PRINCIPIO SOLID S: Responsabilidad de validar dependencias de planes
        if (cliente.tienePlanes()) {
            if (!forzarEliminacion) {
                throw new Error('No se puede eliminar un cliente que tiene planes asignados. Use forzarEliminacion=true para forzar la eliminación');
            }
            
            // ===== ROLLBACK DE PLANES =====
            // PATRÓN: Rollback - Eliminación de dependencias antes de eliminar cliente
            // PATRÓN: Parallel Processing - Optimización con Promise.all
            // BUENA PRÁCTICA: Desasociar todos los planes antes de eliminar cliente
            const desasociaciones = cliente.planes.map(planId => 
                this.desasociarPlanDeCliente(cliente.clienteId.toString(), planId.toString())
            );
            await Promise.all(desasociaciones);
        }

        // ===== VALIDACIÓN DE CONTRATOS ACTIVOS =====
        // PATRÓN: Repository - Acceso a datos a través de abstracción
        // PRINCIPIO SOLID D: Depende de abstracción ContratoRepository
        const { ContratoRepository } = require('../repositories');
        const contratoRepository = new ContratoRepository(this.db);
        const contratosActivos = await contratoRepository.getActiveContractsByClient(cliente.clienteId);
        
        if (contratosActivos.length > 0) {
            if (!forzarEliminacion) {
                throw new Error('No se puede eliminar un cliente con contratos activos. Use forzarEliminacion=true para forzar la eliminación');
            }
            
            // ===== ROLLBACK DE CONTRATOS =====
            // PATRÓN: Rollback - Cancelación de contratos antes de eliminar cliente
            // PATRÓN: Parallel Processing - Optimización con Promise.all
            // BUENA PRÁCTICA: Cancelar todos los contratos antes de eliminar cliente
            const cancelaciones = contratosActivos.map(contrato => 
                contratoRepository.cancelContract(contrato.contratoId.toString())
            );
            await Promise.all(cancelaciones);

            // ===== ROLLBACK DE SEGUIMIENTOS =====
            // PATRÓN: Rollback - Eliminación de seguimientos con rollback
            // PATRÓN: Circuit Breaker - Manejo de errores en rollback
            // PATRÓN: Repository - Acceso a datos a través de abstracción
            const { SeguimientoRepository } = require('../repositories');
            const seguimientoRepository = new SeguimientoRepository(this.db);
            
            try {
                // PATRÓN: Rollback - Eliminación con registro de rollback
                const rollbackSeguimientos = await seguimientoRepository.deleteFollowUpsByClientWithRollback(
                    cliente.clienteId, 
                    `Eliminación de cliente: ${cliente.nombreCompleto}`
                );
                
                // PATRÓN: Guard Clause - Validación de resultado de rollback
                if (rollbackSeguimientos.success && rollbackSeguimientos.eliminados > 0) {
                    console.log(`✅ Rollback completado: ${rollbackSeguimientos.eliminados} seguimientos eliminados del cliente`);
                }
            } catch (rollbackError) {
                // ===== MANEJO DE ERRORES EN ROLLBACK =====
                // PATRÓN: Circuit Breaker - Continúa ejecución aunque falle rollback
                // PATRÓN: Error Logging - Registro de errores para debugging
                // BUENA PRÁCTICA: No fallar la eliminación por errores en rollback
                console.log(`⚠️ Error en rollback de seguimientos: ${rollbackError.message}`);
            }
        }
    }
}

// ===== EXPORTACIÓN DEL MÓDULO =====
// PATRÓN: Module Pattern - Exporta la clase como módulo
// PRINCIPIO SOLID S: Responsabilidad de proporcionar la interfaz pública del servicio
module.exports = ClienteService;
