// ===== IMPORTS Y DEPENDENCIAS =====
// Importación de ObjectId de MongoDB para manejo de IDs
// PATRÓN: Dependency Injection - Se inyectan las dependencias a través del constructor
// PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (ObjectId) no de implementaciones concretas
const { ObjectId } = require('mongodb'); // Driver de MongoDB para operaciones con ObjectId
// Importación del modelo Seguimiento para validaciones y transformaciones
// PATRÓN: Dependency Injection - Se inyectan las dependencias a través del constructor
// PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (Seguimiento) no de implementaciones concretas
const { Seguimiento } = require('../models'); // Modelo de dominio Seguimiento


/**
 * Repositorio para gestión de seguimientos físicos
 * Implementa el patrón Repository para abstraer el acceso a datos
 * Maneja operaciones CRUD y métodos específicos para seguimientos
 * 
 * PATRÓN: Repository - Abstrae el acceso a datos de seguimientos físicos
 * PATRÓN: Data Access Object (DAO) - Proporciona interfaz para operaciones de datos
 * PATRÓN: Facade - Proporciona una interfaz simplificada para operaciones de seguimientos
 * PATRÓN: Data Transfer Object (DTO) - Proporciona datos estructurados
 * PATRÓN: Module Pattern - Encapsula la funcionalidad de repositorio
 * PRINCIPIO SOLID S: Responsabilidad Única - Se encarga únicamente de la gestión de datos de seguimientos
 * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas operaciones sin modificar código existente
 * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente en todas las operaciones
 * PRINCIPIO SOLID I: Segregación de Interfaces - Métodos específicos para diferentes operaciones
 * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (db, Seguimiento) no de implementaciones concretas
 * 
 * NOTA: Este módulo SÍ maneja transacciones para operaciones complejas
 * BUENA PRÁCTICA: Repositorio centralizado para operaciones de seguimientos
 */
class SeguimientoRepository {
    /**
     * Constructor del repositorio de seguimientos físicos
     * @param {Object} db - Instancia de base de datos MongoDB
     * 
     * PATRÓN: Dependency Injection - Inyecta dependencia de base de datos
     * PATRÓN: Repository - Inicializa el repositorio con la colección
     * PRINCIPIO SOLID S: Responsabilidad de inicializar el repositorio
     * BUENA PRÁCTICA: Inicialización de repositorio en constructor
     */
    constructor(db) {
        // PATRÓN: Repository - Abstrae el acceso a la colección de seguimientos
        // PRINCIPIO SOLID S: Responsabilidad de acceder a la colección de seguimientos
        this.collection = db.collection('seguimientos');
        // PATRÓN: Dependency Injection - Inyecta dependencia de base de datos
        // PRINCIPIO SOLID S: Responsabilidad de mantener referencia a la base de datos
        this.db = db;
    }

    /**
     * Crea un nuevo seguimiento
     * @param {Seguimiento} seguimiento - Instancia de Seguimiento a crear
     * @returns {Promise<ObjectId>} ID del seguimiento creado
     * @throws {Error} Si la validación falla o hay error en la inserción
     * 
     * PATRÓN: Template Method - Define el flujo estándar de creación
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Validation Pattern - Valida datos antes de inserción
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de crear seguimientos
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas validaciones
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para creación
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (Seguimiento)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de inserción
     * BUENA PRÁCTICA: Validación de datos antes de inserción
     */
    async create(seguimiento) {
        try {
            // ===== VALIDACIÓN DE INSTANCIA =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que sea instancia de Seguimiento
            // PRINCIPIO SOLID S: Responsabilidad de validar el tipo de dato
            if (!(seguimiento instanceof Seguimiento)) {
                throw new Error('El parámetro debe ser una instancia de Seguimiento');
            }

            // ===== VERIFICACIÓN DE UNICIDAD POR CLIENTE Y FECHA =====
            // PATRÓN: Guard Clause - Validación temprana para evitar duplicados
            // PATRÓN: Validation Pattern - Valida unicidad de seguimiento por cliente y fecha
            // PRINCIPIO SOLID S: Responsabilidad de verificar unicidad
            const seguimientoExistente = await this.collection.findOne({
                clienteId: seguimiento.clienteId,
                fecha: {
                    $gte: new Date(seguimiento.fecha.getFullYear(), seguimiento.fecha.getMonth(), seguimiento.fecha.getDate()),
                    $lt: new Date(seguimiento.fecha.getFullYear(), seguimiento.fecha.getMonth(), seguimiento.fecha.getDate() + 1)
                }
            });

            // ===== VALIDACIÓN DE DUPLICADO =====
            // PATRÓN: Guard Clause - Validación temprana para evitar duplicados
            // PATRÓN: Validation Pattern - Valida que no exista seguimiento duplicado
            // PRINCIPIO SOLID S: Responsabilidad de validar duplicados
            if (seguimientoExistente) {
                throw new Error('Ya existe un seguimiento para este cliente en esta fecha');
            }

            // ===== CONVERSIÓN A OBJETO MONGODB =====
            // PATRÓN: Data Transfer Object (DTO) - Convierte a formato MongoDB
            // PATRÓN: Mapper - Mapea entre modelo de dominio y formato de base de datos
            // PRINCIPIO SOLID S: Responsabilidad de convertir a formato de base de datos
            const seguimientoDoc = seguimiento.toMongoObject();
            
            // ===== INSERCIÓN EN BASE DE DATOS =====
            // PATRÓN: Repository - Abstrae la operación de inserción
            // PATRÓN: Data Transfer Object (DTO) - Retorna resultado estructurado
            // PRINCIPIO SOLID S: Responsabilidad de insertar en base de datos
            const result = await this.collection.insertOne(seguimientoDoc);
            return result.insertedId;
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al crear seguimiento: ${error.message}`);
        }
    }

    /**
     * Obtiene un seguimiento por su ID
     * @param {string|ObjectId} id - ID del seguimiento
     * @returns {Promise<Seguimiento|null>} Seguimiento encontrado o null
     * @throws {Error} Si el ID no es válido
     * 
     * PATRÓN: Template Method - Define el flujo estándar de búsqueda por ID
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Validation Pattern - Valida ID antes de búsqueda
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de buscar por ID
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas validaciones
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para búsqueda por ID
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (Seguimiento)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Validación de ID antes de búsqueda
     */
    async getById(id) {
        try {
            // ===== VALIDACIÓN DE ID =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que el ID sea válido
            // PRINCIPIO SOLID S: Responsabilidad de validar el ID
            if (!ObjectId.isValid(id)) {
                throw new Error('ID del seguimiento no es válido');
            }

            // ===== BÚSQUEDA EN BASE DE DATOS =====
            // PATRÓN: Repository - Abstrae la operación de búsqueda
            // PATRÓN: Data Transfer Object (DTO) - Retorna resultado estructurado
            // PRINCIPIO SOLID S: Responsabilidad de buscar en base de datos
            const seguimientoDoc = await this.collection.findOne({ _id: new ObjectId(id) });
            
            // ===== VERIFICACIÓN DE EXISTENCIA =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PRINCIPIO SOLID S: Responsabilidad de verificar existencia
            if (!seguimientoDoc) {
                return null;
            }

            // ===== CONVERSIÓN A MODELO DE DOMINIO =====
            // PATRÓN: Mapper - Mapea entre formato de base de datos y modelo de dominio
            // PATRÓN: Data Transfer Object (DTO) - Convierte a modelo de dominio
            // PRINCIPIO SOLID S: Responsabilidad de convertir a modelo de dominio
            return Seguimiento.fromMongoObject(seguimientoDoc);
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener seguimiento: ${error.message}`);
        }
    }

    /**
     * Obtiene todos los seguimientos con filtro opcional
     * @param {Object} filter - Filtro de búsqueda
     * @param {Object} options - Opciones de consulta (limit, skip, sort)
     * @returns {Promise<Seguimiento[]>} Array de seguimientos
     * 
     * PATRÓN: Template Method - Define el flujo estándar de obtención de todos los seguimientos
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Query Object - Proporciona filtros y opciones de búsqueda
     * PATRÓN: Builder - Construye consulta paso a paso
     * PATRÓN: Mapper - Mapea entre formato de base de datos y modelo de dominio
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener todos los seguimientos
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas opciones
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para obtener todos
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (Seguimiento)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Consulta eficiente con filtros y opciones
     */
    async getAll(filter = {}, options = {}) {
        try {
            // ===== DESESTRUCTURACIÓN DE OPCIONES =====
            // PATRÓN: Strategy - Estrategia de opciones de consulta
            // PRINCIPIO SOLID S: Responsabilidad de configurar opciones
            const { limit = 0, skip = 0, sort = { fecha: -1 } } = options;
            
            // ===== CONSTRUCCIÓN DE CONSULTA =====
            // PATRÓN: Builder - Construye consulta paso a paso
            // PATRÓN: Query Object - Proporciona filtros de búsqueda
            // PRINCIPIO SOLID S: Responsabilidad de construir consulta
            let query = this.collection.find(filter);
            
            // ===== APLICACIÓN DE ORDENAMIENTO =====
            // PATRÓN: Strategy - Estrategia de ordenamiento
            // PRINCIPIO SOLID S: Responsabilidad de aplicar ordenamiento
            if (sort) {
                query = query.sort(sort);
            }
            
            // ===== APLICACIÓN DE PAGINACIÓN =====
            // PATRÓN: Strategy - Estrategia de paginación
            // PRINCIPIO SOLID S: Responsabilidad de aplicar paginación
            if (skip > 0) {
                query = query.skip(skip);
            }
            
            if (limit > 0) {
                query = query.limit(limit);
            }

            // ===== EJECUCIÓN DE CONSULTA =====
            // PATRÓN: Repository - Abstrae la operación de búsqueda
            // PRINCIPIO SOLID S: Responsabilidad de ejecutar consulta
            const seguimientosDocs = await query.toArray();
            
            // ===== CONVERSIÓN A MODELOS DE DOMINIO =====
            // PATRÓN: Mapper - Mapea entre formato de base de datos y modelo de dominio
            // PATRÓN: Data Transfer Object (DTO) - Convierte a modelos de dominio
            // PRINCIPIO SOLID S: Responsabilidad de convertir a modelos de dominio
            return seguimientosDocs.map(doc => Seguimiento.fromMongoObject(doc));
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener seguimientos: ${error.message}`);
        }
    }

    /**
     * Obtiene seguimientos por cliente
     * @param {string} clienteId - ID del cliente
     * @returns {Promise<Array>} Lista de seguimientos del cliente
     * @throws {Error} Si el ID no es válido o hay error en la consulta
     */
    async getByClient(clienteId) {
        try {
            if (!ObjectId.isValid(clienteId)) {
                throw new Error('ID del cliente no es válido');
            }

            const seguimientosDocs = await this.collection.find({ 
                clienteId: new ObjectId(clienteId) 
            }).sort({ fecha: -1 }).toArray();

            return seguimientosDocs.map(doc => Seguimiento.fromMongoObject(doc));
        } catch (error) {
            throw new Error(`Error al obtener seguimientos del cliente: ${error.message}`);
        }
    }

    /**
     * Actualiza un seguimiento existente
     * @param {string|ObjectId} id - ID del seguimiento a actualizar
     * @param {Object} updatedData - Datos actualizados
     * @returns {Promise<boolean>} True si se actualizó correctamente
     * @throws {Error} Si el ID no es válido o hay error en la actualización
     */
    async update(id, updatedData) {
        try {
            if (!ObjectId.isValid(id)) {
                throw new Error('ID del seguimiento no es válido');
            }

            const result = await this.collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updatedData }
            );

            return result.modifiedCount > 0;
        } catch (error) {
            throw new Error(`Error al actualizar seguimiento: ${error.message}`);
        }
    }

    /**
     * Elimina un seguimiento por su ID
     * @param {string|ObjectId} id - ID del seguimiento a eliminar
     * @returns {Promise<boolean>} True si se eliminó correctamente
     * @throws {Error} Si el ID no es válido
     */
    async delete(id) {
        try {
            if (!ObjectId.isValid(id)) {
                throw new Error('ID del seguimiento no es válido');
            }

            const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
            return result.deletedCount > 0;
        } catch (error) {
            throw new Error(`Error al eliminar seguimiento: ${error.message}`);
        }
    }

    /**
     * Obtiene seguimientos por cliente
     * @param {string|ObjectId} clienteId - ID del cliente
     * @param {Object} options - Opciones de consulta
     * @returns {Promise<Seguimiento[]>} Array de seguimientos del cliente
     */
    async getFollowUpsByClient(clienteId, options = {}) {
        try {
            if (!ObjectId.isValid(clienteId)) {
                throw new Error('ID del cliente no es válido');
            }

            const { limit = 0, skip = 0, sort = { fecha: -1 } } = options;
            
            return await this.getAll(
                { clienteId: new ObjectId(clienteId) },
                { limit, skip, sort }
            );
        } catch (error) {
            throw new Error(`Error al obtener seguimientos del cliente: ${error.message}`);
        }
    }

    /**
     * Elimina seguimientos masivamente por cliente con rollback
     * @param {string|ObjectId} clienteId - ID del cliente
     * @param {string} motivo - Motivo de la eliminación
     * @returns {Promise<Object>} Resultado de la operación
     * @throws {Error} Si hay error en el rollback
     * 
     * PATRÓN: Template Method - Define el flujo estándar de eliminación masiva
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Transaction Pattern - Maneja transacciones con rollback automático
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de eliminar seguimientos por cliente
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas validaciones
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para eliminación masiva
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (collection)
     * 
     * NOTA: SÍ maneja transacciones para operaciones complejas
     * BUENA PRÁCTICA: Transacciones con rollback automático
     */
    async deleteFollowUpsByClientWithRollback(clienteId, motivo = 'Cancelación de plan/contrato') {
        try {
            // ===== VALIDACIÓN DE ID =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que el ID sea válido
            // PRINCIPIO SOLID S: Responsabilidad de validar el ID
            if (!ObjectId.isValid(clienteId)) {
                throw new Error('ID del cliente no es válido');
            }

            // ===== VERIFICACIÓN DE SEGUIMIENTOS EXISTENTES =====
            // PATRÓN: Guard Clause - Validación temprana para evitar operaciones innecesarias
            // PATRÓN: Validation Pattern - Valida que existan seguimientos para eliminar
            // PRINCIPIO SOLID S: Responsabilidad de verificar existencia
            const seguimientos = await this.getByClient(clienteId);
            if (seguimientos.length === 0) {
                return {
                    success: true,
                    eliminados: 0,
                    mensaje: 'No hay seguimientos para eliminar'
                };
            }

            // ===== INICIO DE TRANSACCIÓN =====
            // PATRÓN: Transaction Pattern - Inicia sesión transaccional
            // PRINCIPIO SOLID S: Responsabilidad de manejar transacciones
            const session = this.db.client.startSession();
            
            try {
                let resultado;
                
                // ===== EJECUCIÓN DE TRANSACCIÓN =====
                // PATRÓN: Transaction Pattern - Ejecuta operaciones dentro de transacción
                // PRINCIPIO SOLID S: Responsabilidad de ejecutar operaciones transaccionales
                await session.withTransaction(async () => {
                    // ===== ELIMINACIÓN MASIVA =====
                    // PATRÓN: Repository - Abstrae la operación de eliminación masiva
                    // PATRÓN: Data Transfer Object (DTO) - Retorna resultado estructurado
                    // PRINCIPIO SOLID S: Responsabilidad de eliminar seguimientos
                    const deleteResult = await this.collection.deleteMany(
                        { clienteId: new ObjectId(clienteId) },
                        { session }  // ← Usa la sesión transaccional
                    );

                    // ===== VALIDACIÓN DE RESULTADO =====
                    // PATRÓN: Guard Clause - Validación temprana para evitar errores
                    // PATRÓN: Validation Pattern - Valida que la eliminación fue exitosa
                    // PRINCIPIO SOLID S: Responsabilidad de validar resultado
                    if (deleteResult.deletedCount === 0) {
                        throw new Error('No se pudieron eliminar los seguimientos');
                    }

                    // ===== REGISTRO DE AUDITORÍA =====
                    // PATRÓN: Observer - Registra eventos para auditoría
                    // PRINCIPIO SOLID S: Responsabilidad de registrar operaciones
                    console.log(`🗑️ Eliminados ${deleteResult.deletedCount} seguimientos del cliente ${clienteId} - Motivo: ${motivo}`);

                    // ===== CONSTRUCCIÓN DE RESULTADO =====
                    // PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
                    // PRINCIPIO SOLID S: Responsabilidad de construir resultado
                    resultado = {
                        success: true,
                        eliminados: deleteResult.deletedCount,
                        mensaje: `Se eliminaron ${deleteResult.deletedCount} seguimientos del cliente`
                    };
                });

                // ===== COMMIT AUTOMÁTICO =====
                // PATRÓN: Transaction Pattern - Commit automático si no hay errores
                // PRINCIPIO SOLID S: Responsabilidad de confirmar transacción
                return resultado;
            } finally {
                // ===== CIERRE DE SESIÓN =====
                // PATRÓN: Transaction Pattern - Cierra sesión transaccional
                // PATRÓN: Resource Management - Manejo de recursos
                // PRINCIPIO SOLID S: Responsabilidad de liberar recursos
                await session.endSession();
            }
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PATRÓN: Transaction Pattern - Rollback automático si hay errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al eliminar seguimientos del cliente: ${error.message}`);
        }
    }

    /**
     * Elimina seguimientos masivamente por contrato con rollback
     * @param {string|ObjectId} contratoId - ID del contrato
     * @param {string} motivo - Motivo de la eliminación
     * @returns {Promise<Object>} Resultado de la operación
     * @throws {Error} Si hay error en el rollback
     */
    async deleteFollowUpsByContractWithRollback(contratoId, motivo = 'Cancelación de contrato') {
        try {
            if (!ObjectId.isValid(contratoId)) {
                throw new Error('ID del contrato no es válido');
            }

            // Obtener seguimientos del contrato antes de eliminarlos
            const seguimientos = await this.collection.find({ 
                contratoId: new ObjectId(contratoId) 
            }).toArray();

            if (seguimientos.length === 0) {
                return {
                    success: true,
                    eliminados: 0,
                    mensaje: 'No hay seguimientos para eliminar'
                };
            }

            // Iniciar transacción para rollback
            const session = this.db.client.startSession();
            
            try {
                let resultado;
                
                await session.withTransaction(async () => {
                    // Eliminar todos los seguimientos del contrato
                    const deleteResult = await this.collection.deleteMany(
                        { contratoId: new ObjectId(contratoId) },
                        { session }
                    );

                    if (deleteResult.deletedCount === 0) {
                        throw new Error('No se pudieron eliminar los seguimientos');
                    }

                    // Registrar la eliminación masiva para auditoría
                    console.log(`🗑️ Eliminados ${deleteResult.deletedCount} seguimientos del contrato ${contratoId} - Motivo: ${motivo}`);

                    resultado = {
                        success: true,
                        eliminados: deleteResult.deletedCount,
                        mensaje: `Se eliminaron ${deleteResult.deletedCount} seguimientos del contrato`
                    };
                });

                return resultado;
            } finally {
                await session.endSession();
            }
        } catch (error) {
            throw new Error(`Error al eliminar seguimientos del contrato: ${error.message}`);
        }
    }

    /**
     * Elimina un seguimiento con rollback si afecta el plan
     * @param {string|ObjectId} id - ID del seguimiento a eliminar
     * @returns {Promise<boolean>} True si se eliminó correctamente
     * @throws {Error} Si hay error en el rollback
     */
    async deleteFollowUpWithRollback(id) {
        try {
            if (!ObjectId.isValid(id)) {
                throw new Error('ID del seguimiento no es válido');
            }

            // Obtener el seguimiento antes de eliminarlo
            const seguimiento = await this.getById(id);
            if (!seguimiento) {
                throw new Error('Seguimiento no encontrado');
            }

            // Iniciar transacción para rollback
            const session = this.db.client.startSession();
            
            try {
                await session.withTransaction(async () => {
                    // Eliminar el seguimiento
                    const result = await this.collection.deleteOne(
                        { _id: new ObjectId(id) },
                        { session }
                    );

                    if (result.deletedCount === 0) {
                        throw new Error('No se pudo eliminar el seguimiento');
                    }

                    // Verificar si el cliente tiene otros seguimientos
                    const otrosSeguimientos = await this.collection.countDocuments({
                        clienteId: seguimiento.clienteId,
                        _id: { $ne: new ObjectId(id) }
                    }, { session });

                    // Si no hay otros seguimientos, podríamos considerar actualizar el estado del plan
                    if (otrosSeguimientos === 0) {
                        console.log('⚠️ Cliente sin seguimientos - considerar actualizar estado del plan');
                    }
                });

                return true;
            } finally {
                await session.endSession();
            }
        } catch (error) {
            throw new Error(`Error al eliminar seguimiento con rollback: ${error.message}`);
        }
    }

    /**
     * Obtiene seguimientos por rango de fechas
     * @param {Date} fechaInicio - Fecha de inicio
     * @param {Date} fechaFin - Fecha de fin
     * @param {string|ObjectId} clienteId - ID del cliente (opcional)
     * @returns {Promise<Seguimiento[]>} Array de seguimientos en el rango
     */
    async getFollowUpsByDateRange(fechaInicio, fechaFin, clienteId = null) {
        try {
            if (!(fechaInicio instanceof Date) || !(fechaFin instanceof Date)) {
                throw new Error('Las fechas deben ser objetos Date válidos');
            }

            const filter = {
                fecha: {
                    $gte: fechaInicio,
                    $lte: fechaFin
                }
            };

            if (clienteId && ObjectId.isValid(clienteId)) {
                filter.clienteId = new ObjectId(clienteId);
            }

            return await this.getAll(filter);
        } catch (error) {
            throw new Error(`Error al obtener seguimientos por rango de fechas: ${error.message}`);
        }
    }

    /**
     * Obtiene el último seguimiento de un cliente
     * @param {string|ObjectId} clienteId - ID del cliente
     * @returns {Promise<Seguimiento|null>} Último seguimiento o null
     */
    async getLastFollowUpByClient(clienteId) {
        try {
            if (!ObjectId.isValid(clienteId)) {
                throw new Error('ID del cliente no es válido');
            }

            const seguimientos = await this.getAll(
                { clienteId: new ObjectId(clienteId) },
                { limit: 1, sort: { fecha: -1 } }
            );

            return seguimientos.length > 0 ? seguimientos[0] : null;
        } catch (error) {
            throw new Error(`Error al obtener último seguimiento: ${error.message}`);
        }
    }

    /**
     * Obtiene seguimientos con peso en un rango específico
     * @param {number} pesoMin - Peso mínimo
     * @param {number} pesoMax - Peso máximo
     * @returns {Promise<Seguimiento[]>} Array de seguimientos en el rango de peso
     */
    async getFollowUpsByWeightRange(pesoMin, pesoMax) {
        try {
            if (typeof pesoMin !== 'number' || typeof pesoMax !== 'number') {
                throw new Error('Los pesos deben ser números');
            }

            if (pesoMin < 0 || pesoMax < 0) {
                throw new Error('Los pesos no pueden ser negativos');
            }

            if (pesoMin > pesoMax) {
                throw new Error('Peso mínimo no puede ser mayor al máximo');
            }

            return await this.getAll({
                peso: {
                    $gte: pesoMin,
                    $lte: pesoMax
                }
            });
        } catch (error) {
            throw new Error(`Error al obtener seguimientos por rango de peso: ${error.message}`);
        }
    }

    /**
     * Obtiene seguimientos con grasa corporal en un rango específico
     * @param {number} grasaMin - Grasa corporal mínima
     * @param {number} grasaMax - Grasa corporal máxima
     * @returns {Promise<Seguimiento[]>} Array de seguimientos en el rango
     */
    async getFollowUpsByBodyFatRange(grasaMin, grasaMax) {
        try {
            if (typeof grasaMin !== 'number' || typeof grasaMax !== 'number') {
                throw new Error('Los valores de grasa corporal deben ser números');
            }

            if (grasaMin < 0 || grasaMax < 0) {
                throw new Error('Los valores de grasa corporal no pueden ser negativos');
            }

            if (grasaMin > grasaMax) {
                throw new Error('Grasa mínima no puede ser mayor a la máxima');
            }

            return await this.getAll({
                grasaCorporal: {
                    $gte: grasaMin,
                    $lte: grasaMax
                }
            });
        } catch (error) {
            throw new Error(`Error al obtener seguimientos por rango de grasa corporal: ${error.message}`);
        }
    }

    /**
     * Obtiene estadísticas de seguimientos por cliente
     * @param {string|ObjectId} clienteId - ID del cliente
     * @returns {Promise<Object>} Estadísticas del cliente
     * 
     * PATRÓN: Template Method - Define el flujo estándar de obtención de estadísticas
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Aggregator - Agrega datos de múltiples fuentes
     * PATRÓN: Query Object - Proporciona pipeline de agregación
     * PATRÓN: Facade - Simplifica operaciones complejas de agregación
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener estadísticas
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas estadísticas
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para estadísticas
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (collection)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Agregación eficiente de estadísticas
     */
    async getClientFollowUpStats(clienteId) {
        try {
            // ===== VALIDACIÓN DE ID =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que el ID sea válido
            // PRINCIPIO SOLID S: Responsabilidad de validar el ID
            if (!ObjectId.isValid(clienteId)) {
                throw new Error('ID del cliente no es válido');
            }

            // ===== CONSTRUCCIÓN DE PIPELINE DE AGREGACIÓN =====
            // PATRÓN: Aggregator - Agrega datos de múltiples fuentes
            // PATRÓN: Query Object - Proporciona pipeline de agregación
            // PRINCIPIO SOLID S: Responsabilidad de construir pipeline
            const pipeline = [
                // ===== FILTRO POR CLIENTE =====
                // PATRÓN: Query Object - Filtra documentos por cliente
                // PRINCIPIO SOLID S: Responsabilidad de filtrar por cliente
                { $match: { clienteId: new ObjectId(clienteId) } },
                
                // ===== AGRUPACIÓN Y CÁLCULOS =====
                // PATRÓN: Aggregator - Agrupa y calcula estadísticas
                // PATRÓN: Facade - Simplifica cálculos complejos
                // PRINCIPIO SOLID S: Responsabilidad de calcular estadísticas
                {
                    $group: {
                        _id: null,
                        // ===== CONTEO TOTAL =====
                        // PATRÓN: Aggregator - Cuenta total de seguimientos
                        // PRINCIPIO SOLID S: Responsabilidad de contar seguimientos
                        totalSeguimientos: { $sum: 1 },
                        
                        // ===== ESTADÍSTICAS DE PESO =====
                        // PATRÓN: Aggregator - Calcula estadísticas de peso
                        // PRINCIPIO SOLID S: Responsabilidad de calcular estadísticas de peso
                        pesoPromedio: { $avg: "$peso" },
                        pesoMinimo: { $min: "$peso" },
                        pesoMaximo: { $max: "$peso" },
                        
                        // ===== ESTADÍSTICAS DE GRASA CORPORAL =====
                        // PATRÓN: Aggregator - Calcula estadísticas de grasa corporal
                        // PRINCIPIO SOLID S: Responsabilidad de calcular estadísticas de grasa
                        grasaPromedio: { $avg: "$grasaCorporal" },
                        grasaMinima: { $min: "$grasaCorporal" },
                        grasaMaxima: { $max: "$grasaCorporal" },
                        
                        // ===== CONTEO DE SEGUIMIENTOS CON MEDIDAS =====
                        // PATRÓN: Aggregator - Cuenta seguimientos con medidas
                        // PATRÓN: Conditional Logic - Lógica condicional para conteo
                        // PRINCIPIO SOLID S: Responsabilidad de contar seguimientos con medidas
                        conMedidas: {
                            $sum: {
                                $cond: [
                                    { $gt: [{ $size: { $objectToArray: "$medidas" } }, 0] },
                                    1,
                                    0
                                ]
                            }
                        },
                        
                        // ===== CONTEO DE SEGUIMIENTOS CON FOTOS =====
                        // PATRÓN: Aggregator - Cuenta seguimientos con fotos
                        // PATRÓN: Conditional Logic - Lógica condicional para conteo
                        // PRINCIPIO SOLID S: Responsabilidad de contar seguimientos con fotos
                        conFotos: {
                            $sum: {
                                $cond: [
                                    { $gt: [{ $size: "$fotos" }, 0] },
                                    1,
                                    0
                                ]
                            }
                        }
                    }
                }
            ];

            // ===== EJECUCIÓN DE PIPELINE =====
            // PATRÓN: Repository - Abstrae la operación de agregación
            // PRINCIPIO SOLID S: Responsabilidad de ejecutar pipeline
            const stats = await this.collection.aggregate(pipeline).toArray();
            
            // ===== CONSTRUCCIÓN DE RESULTADO =====
            // PATRÓN: Data Transfer Object (DTO) - Proporciona estadísticas estructuradas
            // PATRÓN: Aggregator - Agrega datos de múltiples fuentes
            // PRINCIPIO SOLID S: Responsabilidad de construir estadísticas
            return stats.length > 0 ? stats[0] : {
                totalSeguimientos: 0,
                pesoPromedio: null,
                pesoMinimo: null,
                pesoMaximo: null,
                grasaPromedio: null,
                grasaMinima: null,
                grasaMaxima: null,
                conMedidas: 0,
                conFotos: 0
            };
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener estadísticas del cliente: ${error.message}`);
        }
    }

    /**
     * Obtiene el progreso de peso de un cliente
     * @param {string|ObjectId} clienteId - ID del cliente
     * @returns {Promise<Object>} Progreso de peso del cliente
     */
    async getWeightProgress(clienteId) {
        try {
            if (!ObjectId.isValid(clienteId)) {
                throw new Error('ID del cliente no es válido');
            }

            const seguimientos = await this.getAll(
                { 
                    clienteId: new ObjectId(clienteId),
                    peso: { $exists: true, $ne: null }
                },
                { sort: { fecha: 1 } }
            );

            if (seguimientos.length === 0) {
                return {
                    progreso: [],
                    pesoInicial: null,
                    pesoActual: null,
                    diferencia: 0,
                    tendencia: 'sin_datos'
                };
            }

            const progreso = seguimientos.map(seg => ({
                fecha: seg.fecha,
                peso: seg.peso
            }));

            const pesoInicial = seguimientos[0].peso;
            const pesoActual = seguimientos[seguimientos.length - 1].peso;
            const diferencia = pesoActual - pesoInicial;

            let tendencia = 'estable';
            if (diferencia > 1) {
                tendencia = 'aumento';
            } else if (diferencia < -1) {
                tendencia = 'disminucion';
            }

            return {
                progreso,
                pesoInicial,
                pesoActual,
                diferencia,
                tendencia
            };
        } catch (error) {
            throw new Error(`Error al obtener progreso de peso: ${error.message}`);
        }
    }

    /**
     * Obtiene seguimientos con fotos
     * @param {string|ObjectId} clienteId - ID del cliente (opcional)
     * @returns {Promise<Seguimiento[]>} Array de seguimientos con fotos
     */
    async getFollowUpsWithPhotos(clienteId = null) {
        try {
            const filter = {
                fotos: { $exists: true, $ne: [] }
            };

            if (clienteId && ObjectId.isValid(clienteId)) {
                filter.clienteId = new ObjectId(clienteId);
            }

            return await this.getAll(filter);
        } catch (error) {
            throw new Error(`Error al obtener seguimientos con fotos: ${error.message}`);
        }
    }

    /**
     * Obtiene seguimientos con medidas
     * @param {string|ObjectId} clienteId - ID del cliente (opcional)
     * @returns {Promise<Seguimiento[]>} Array de seguimientos con medidas
     */
    async getFollowUpsWithMeasurements(clienteId = null) {
        try {
            const filter = {
                medidas: { $exists: true, $ne: {} }
            };

            if (clienteId && ObjectId.isValid(clienteId)) {
                filter.clienteId = new ObjectId(clienteId);
            }

            return await this.getAll(filter);
        } catch (error) {
            throw new Error(`Error al obtener seguimientos con medidas: ${error.message}`);
        }
    }
}

module.exports = SeguimientoRepository;
