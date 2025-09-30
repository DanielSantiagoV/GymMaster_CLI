// ===== IMPORTS Y DEPENDENCIAS =====
// Importación de ObjectId de MongoDB para manejo de IDs
// PATRÓN: Dependency Injection - Se inyectan las dependencias a través del constructor
// PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (ObjectId) no de implementaciones concretas
const { ObjectId } = require('mongodb'); // Driver de MongoDB para operaciones con ObjectId
// Importación del modelo Pago para validaciones y transformaciones
// PATRÓN: Dependency Injection - Se inyectan las dependencias a través del constructor
// PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (Pago) no de implementaciones concretas
const { Pago } = require('../models'); // Modelo de dominio Pago

/**
 * Repositorio para gestión de pagos
 * Implementa el patrón Repository para abstraer el acceso a datos
 * Maneja operaciones CRUD y métodos específicos para pagos
 * 
 * PATRÓN: Repository - Abstrae el acceso a datos de pagos
 * PATRÓN: Data Access Object (DAO) - Proporciona interfaz para operaciones de datos
 * PATRÓN: Facade - Proporciona una interfaz simplificada para operaciones de pagos
 * PATRÓN: Data Transfer Object (DTO) - Proporciona datos estructurados
 * PATRÓN: Module Pattern - Encapsula la funcionalidad de repositorio
 * PRINCIPIO SOLID S: Responsabilidad Única - Se encarga únicamente de la gestión de datos de pagos
 * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas operaciones sin modificar código existente
 * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente en todas las operaciones
 * PRINCIPIO SOLID I: Segregación de Interfaces - Métodos específicos para diferentes operaciones
 * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (db, Pago) no de implementaciones concretas
 * 
 * NOTA: Este módulo NO maneja transacciones ya que solo proporciona operaciones de datos
 * BUENA PRÁCTICA: Repositorio centralizado para operaciones de pagos
 */
class PagoRepository {
    /**
     * Constructor del repositorio de pagos
     * @param {Object} db - Instancia de base de datos MongoDB
     * 
     * PATRÓN: Dependency Injection - Inyecta dependencia de base de datos
     * PATRÓN: Repository - Inicializa el repositorio con la colección
     * PRINCIPIO SOLID S: Responsabilidad de inicializar el repositorio
     * BUENA PRÁCTICA: Inicialización de repositorio en constructor
     */
    constructor(db) {
        // PATRÓN: Repository - Abstrae el acceso a la colección de pagos
        // PRINCIPIO SOLID S: Responsabilidad de acceder a la colección de pagos
        this.collection = db.collection('pagos');
        // PATRÓN: Dependency Injection - Inyecta dependencia de base de datos
        // PRINCIPIO SOLID S: Responsabilidad de mantener referencia a la base de datos
        this.db = db;
    }

    /**
     * Crea un nuevo pago
     * @param {Pago} pago - Instancia de Pago a crear
     * @returns {Promise<ObjectId>} ID del pago creado
     * @throws {Error} Si la validación falla o hay error en la inserción
     * 
     * PATRÓN: Template Method - Define el flujo estándar de creación
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Validation Pattern - Valida datos antes de inserción
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de crear pagos
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas validaciones
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para creación
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (Pago)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de inserción
     * BUENA PRÁCTICA: Validación de datos antes de inserción
     */
    async create(pago) {
        try {
            // ===== VALIDACIÓN DE INSTANCIA =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que sea instancia de Pago
            // PRINCIPIO SOLID S: Responsabilidad de validar la instancia
            if (!(pago instanceof Pago)) {
                throw new Error('El parámetro debe ser una instancia de Pago');
            }

            // ===== CONVERSIÓN A OBJETO MONGODB =====
            // PATRÓN: Data Transfer Object (DTO) - Convierte a formato MongoDB
            // PATRÓN: Mapper - Mapea entre modelo de dominio y formato de base de datos
            // PRINCIPIO SOLID S: Responsabilidad de convertir a formato de base de datos
            const pagoDoc = pago.toMongoObject();
            
            // ===== INSERCIÓN EN BASE DE DATOS =====
            // PATRÓN: Repository - Abstrae la operación de inserción
            // PATRÓN: Data Transfer Object (DTO) - Retorna resultado estructurado
            // PRINCIPIO SOLID S: Responsabilidad de insertar en base de datos
            const result = await this.collection.insertOne(pagoDoc);
            
            // ===== RETORNO DE ID =====
            // PATRÓN: Data Transfer Object (DTO) - Retorna ID del pago creado
            // PRINCIPIO SOLID S: Responsabilidad de retornar ID
            return result.insertedId;
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al crear pago: ${error.message}`);
        }
    }

    /**
     * Obtiene un pago por su ID
     * @param {string|ObjectId} id - ID del pago
     * @returns {Promise<Pago|null>} Pago encontrado o null
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
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (Pago)
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
                throw new Error('ID del pago no es válido');
            }

            // ===== BÚSQUEDA EN BASE DE DATOS =====
            // PATRÓN: Repository - Abstrae la operación de búsqueda
            // PATRÓN: Data Transfer Object (DTO) - Retorna resultado estructurado
            // PRINCIPIO SOLID S: Responsabilidad de buscar en base de datos
            const pagoDoc = await this.collection.findOne({ _id: new ObjectId(id) });
            
            // ===== VALIDACIÓN DE RESULTADO =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PRINCIPIO SOLID S: Responsabilidad de validar resultado
            if (!pagoDoc) {
                return null;
            }

            // ===== CONVERSIÓN A MODELO DE DOMINIO =====
            // PATRÓN: Mapper - Mapea entre formato de base de datos y modelo de dominio
            // PATRÓN: Data Transfer Object (DTO) - Convierte a modelo de dominio
            // PRINCIPIO SOLID S: Responsabilidad de convertir a modelo de dominio
            return Pago.fromMongoObject(pagoDoc);
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener pago: ${error.message}`);
        }
    }

    /**
     * Obtiene todos los pagos con filtro opcional
     * @param {Object} filter - Filtro de búsqueda
     * @param {Object} options - Opciones de consulta (limit, skip, sort)
     * @returns {Promise<Pago[]>} Array de pagos
     * 
     * PATRÓN: Template Method - Define el flujo estándar de obtención de todos los pagos
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Query Object - Proporciona filtros de búsqueda
     * PATRÓN: Builder - Construye consulta paso a paso
     * PATRÓN: Mapper - Mapea entre formato de base de datos y modelo de dominio
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener todos los pagos
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas opciones
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para obtener todos
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (Pago)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Consulta eficiente con filtros y opciones
     */
    async getAll(filter = {}, options = {}) {
        try {
            // ===== DESTRUCTURACIÓN DE OPCIONES =====
            // PATRÓN: Configuration Object - Proporciona configuración estructurada
            // PRINCIPIO SOLID S: Responsabilidad de configurar opciones
            const { limit = 0, skip = 0, sort = { fechaPago: -1 } } = options;
            
            // ===== CONSTRUCCIÓN DE CONSULTA =====
            // PATRÓN: Builder - Construye consulta paso a paso
            // PATRÓN: Query Object - Proporciona filtros de búsqueda
            // PRINCIPIO SOLID S: Responsabilidad de construir consulta
            let query = this.collection.find(filter);
            
            // ===== APLICACIÓN DE ORDENAMIENTO =====
            // PATRÓN: Builder - Agrega ordenamiento a la consulta
            // PATRÓN: Strategy - Estrategia de ordenamiento
            // PRINCIPIO SOLID S: Responsabilidad de aplicar ordenamiento
            if (sort) {
                query = query.sort(sort);
            }
            
            // ===== APLICACIÓN DE PAGINACIÓN =====
            // PATRÓN: Builder - Agrega paginación a la consulta
            // PRINCIPIO SOLID S: Responsabilidad de aplicar paginación
            if (skip > 0) {
                query = query.skip(skip);
            }
            
            if (limit > 0) {
                query = query.limit(limit);
            }

            // ===== EJECUCIÓN DE CONSULTA =====
            // PATRÓN: Repository - Abstrae la operación de consulta
            // PRINCIPIO SOLID S: Responsabilidad de ejecutar consulta
            const pagosDocs = await query.toArray();
            
            // ===== CONVERSIÓN A MODELOS DE DOMINIO =====
            // PATRÓN: Mapper - Mapea entre formato de base de datos y modelo de dominio
            // PATRÓN: Data Transfer Object (DTO) - Convierte a modelos de dominio
            // PRINCIPIO SOLID S: Responsabilidad de convertir a modelos de dominio
            return pagosDocs.map(doc => Pago.fromMongoObject(doc));
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener pagos: ${error.message}`);
        }
    }

    /**
     * Actualiza un pago existente
     * @param {string|ObjectId} id - ID del pago a actualizar
     * @param {Object} updatedData - Datos actualizados
     * @returns {Promise<boolean>} True si se actualizó correctamente
     * @throws {Error} Si el ID no es válido o hay error en la actualización
     * 
     * PATRÓN: Template Method - Define el flujo estándar de actualización
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Validation Pattern - Valida ID antes de actualización
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de actualizar pagos
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas validaciones
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para actualización
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (collection)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de actualización
     * BUENA PRÁCTICA: Validación de ID antes de actualización
     */
    async update(id, updatedData) {
        try {
            // ===== VALIDACIÓN DE ID =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que el ID sea válido
            // PRINCIPIO SOLID S: Responsabilidad de validar el ID
            if (!ObjectId.isValid(id)) {
                throw new Error('ID del pago no es válido');
            }

            // ===== ACTUALIZACIÓN EN BASE DE DATOS =====
            // PATRÓN: Repository - Abstrae la operación de actualización
            // PATRÓN: Data Transfer Object (DTO) - Retorna resultado estructurado
            // PRINCIPIO SOLID S: Responsabilidad de actualizar en base de datos
            const result = await this.collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updatedData }
            );

            // ===== RETORNO DE RESULTADO =====
            // PATRÓN: Data Transfer Object (DTO) - Retorna resultado estructurado
            // PRINCIPIO SOLID S: Responsabilidad de retornar resultado
            return result.modifiedCount > 0;
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al actualizar pago: ${error.message}`);
        }
    }

    /**
     * Elimina un pago por su ID
     * @param {string|ObjectId} id - ID del pago a eliminar
     * @returns {Promise<boolean>} True si se eliminó correctamente
     * @throws {Error} Si el ID no es válido
     * 
     * PATRÓN: Template Method - Define el flujo estándar de eliminación
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Validation Pattern - Valida ID antes de eliminación
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de eliminar pagos
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas validaciones
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para eliminación
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (collection)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de eliminación
     * BUENA PRÁCTICA: Validación de ID antes de eliminación
     */
    async delete(id) {
        try {
            // ===== VALIDACIÓN DE ID =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que el ID sea válido
            // PRINCIPIO SOLID S: Responsabilidad de validar el ID
            if (!ObjectId.isValid(id)) {
                throw new Error('ID del pago no es válido');
            }

            // ===== ELIMINACIÓN EN BASE DE DATOS =====
            // PATRÓN: Repository - Abstrae la operación de eliminación
            // PATRÓN: Data Transfer Object (DTO) - Retorna resultado estructurado
            // PRINCIPIO SOLID S: Responsabilidad de eliminar en base de datos
            const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
            
            // ===== RETORNO DE RESULTADO =====
            // PATRÓN: Data Transfer Object (DTO) - Retorna resultado estructurado
            // PRINCIPIO SOLID S: Responsabilidad de retornar resultado
            return result.deletedCount > 0;
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al eliminar pago: ${error.message}`);
        }
    }

    /**
     * Obtiene pagos por cliente
     * @param {string|ObjectId} clienteId - ID del cliente
     * @param {Object} filter - Filtros adicionales
     * @returns {Promise<Pago[]>} Array de pagos del cliente
     * 
     * PATRÓN: Template Method - Define el flujo estándar de obtención por cliente
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Query Object - Proporciona filtros de búsqueda
     * PATRÓN: Validation Pattern - Valida ID antes de operación
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PATRÓN: Facade - Delega a método getAll para reutilización
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener por cliente
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para obtener por cliente
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (Pago)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Validación de ID antes de operación
     */
    async getPagosByClient(clienteId, filter = {}) {
        try {
            // ===== VALIDACIÓN DE ID =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que el ID sea válido
            // PRINCIPIO SOLID S: Responsabilidad de validar el ID
            if (!ObjectId.isValid(clienteId)) {
                throw new Error('ID del cliente no es válido');
            }

            // ===== CONSTRUCCIÓN DE FILTRO COMBINADO =====
            // PATRÓN: Builder - Construye filtro paso a paso
            // PATRÓN: Query Object - Proporciona filtro de cliente
            // PRINCIPIO SOLID S: Responsabilidad de construir filtro
            const combinedFilter = {
                clienteId: new ObjectId(clienteId),
                ...filter
            };

            // ===== DELEGACIÓN A MÉTODO GETALL =====
            // PATRÓN: Facade - Delega a método getAll para reutilización
            // PATRÓN: Template Method - Reutiliza flujo estándar
            // PRINCIPIO SOLID S: Responsabilidad de delegar a método getAll
            return await this.getAll(combinedFilter);
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener pagos del cliente: ${error.message}`);
        }
    }

    /**
     * Obtiene pagos por contrato
     * @param {string|ObjectId} contratoId - ID del contrato
     * @param {Object} filter - Filtros adicionales
     * @returns {Promise<Pago[]>} Array de pagos del contrato
     * 
     * PATRÓN: Template Method - Define el flujo estándar de obtención por contrato
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Query Object - Proporciona filtros de búsqueda
     * PATRÓN: Validation Pattern - Valida ID antes de operación
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PATRÓN: Facade - Delega a método getAll para reutilización
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener por contrato
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para obtener por contrato
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (Pago)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Validación de ID antes de operación
     */
    async getPagosByContract(contratoId, filter = {}) {
        try {
            // ===== VALIDACIÓN DE ID =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que el ID sea válido
            // PRINCIPIO SOLID S: Responsabilidad de validar el ID
            if (!ObjectId.isValid(contratoId)) {
                throw new Error('ID del contrato no es válido');
            }

            // ===== CONSTRUCCIÓN DE FILTRO COMBINADO =====
            // PATRÓN: Builder - Construye filtro paso a paso
            // PATRÓN: Query Object - Proporciona filtro de contrato
            // PRINCIPIO SOLID S: Responsabilidad de construir filtro
            const combinedFilter = {
                contratoId: new ObjectId(contratoId),
                ...filter
            };

            // ===== DELEGACIÓN A MÉTODO GETALL =====
            // PATRÓN: Facade - Delega a método getAll para reutilización
            // PATRÓN: Template Method - Reutiliza flujo estándar
            // PRINCIPIO SOLID S: Responsabilidad de delegar a método getAll
            return await this.getAll(combinedFilter);
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener pagos del contrato: ${error.message}`);
        }
    }

    /**
     * Obtiene pagos por estado
     * @param {string} estado - Estado del pago
     * @param {Object} options - Opciones de consulta
     * @returns {Promise<Pago[]>} Array de pagos del estado especificado
     * 
     * PATRÓN: Template Method - Define el flujo estándar de obtención por estado
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Query Object - Proporciona filtros de búsqueda
     * PATRÓN: Validation Pattern - Valida estado antes de operación
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PATRÓN: Facade - Delega a método getAll para reutilización
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener por estado
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para estado
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (Pago)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Validación de estado antes de operación
     */
    async getPagosByStatus(estado, options = {}) {
        try {
            // ===== VALIDACIÓN DE ESTADO =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que el estado sea válido
            // PRINCIPIO SOLID S: Responsabilidad de validar el estado
            if (!estado || typeof estado !== 'string') {
                throw new Error('Estado debe ser una string válida');
            }

            // ===== VALIDACIÓN DE ESTADOS VÁLIDOS =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que el estado sea válido
            // PRINCIPIO SOLID S: Responsabilidad de validar estados válidos
            const estadosValidos = ['pagado', 'pendiente', 'retrasado', 'cancelado'];
            if (!estadosValidos.includes(estado.toLowerCase())) {
                throw new Error(`Estado debe ser uno de: ${estadosValidos.join(', ')}`);
            }

            // ===== DELEGACIÓN A MÉTODO GETALL =====
            // PATRÓN: Facade - Delega a método getAll para reutilización
            // PATRÓN: Template Method - Reutiliza flujo estándar
            // PRINCIPIO SOLID S: Responsabilidad de delegar a método getAll
            return await this.getAll({ estado: estado.toLowerCase() }, options);
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener pagos por estado: ${error.message}`);
        }
    }

    /**
     * Obtiene pagos por método de pago
     * @param {string} metodoPago - Método de pago
     * @param {Object} options - Opciones de consulta
     * @returns {Promise<Pago[]>} Array de pagos del método especificado
     * 
     * PATRÓN: Template Method - Define el flujo estándar de obtención por método
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Query Object - Proporciona filtros de búsqueda
     * PATRÓN: Validation Pattern - Valida método antes de operación
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PATRÓN: Facade - Delega a método getAll para reutilización
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener por método
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para método
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (Pago)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Validación de método antes de operación
     */
    async getPagosByPaymentMethod(metodoPago, options = {}) {
        try {
            // ===== VALIDACIÓN DE MÉTODO =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que el método sea válido
            // PRINCIPIO SOLID S: Responsabilidad de validar el método
            if (!metodoPago || typeof metodoPago !== 'string') {
                throw new Error('Método de pago debe ser una string válida');
            }

            // ===== DELEGACIÓN A MÉTODO GETALL =====
            // PATRÓN: Facade - Delega a método getAll para reutilización
            // PATRÓN: Template Method - Reutiliza flujo estándar
            // PRINCIPIO SOLID S: Responsabilidad de delegar a método getAll
            return await this.getAll({ metodoPago: metodoPago.toLowerCase() }, options);
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener pagos por método: ${error.message}`);
        }
    }

    /**
     * Obtiene pagos por tipo de movimiento
     * @param {string} tipoMovimiento - Tipo de movimiento (ingreso, egreso)
     * @param {Object} options - Opciones de consulta
     * @returns {Promise<Pago[]>} Array de pagos del tipo especificado
     * 
     * PATRÓN: Template Method - Define el flujo estándar de obtención por tipo
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Query Object - Proporciona filtros de búsqueda
     * PATRÓN: Validation Pattern - Valida tipo antes de operación
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PATRÓN: Facade - Delega a método getAll para reutilización
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener por tipo
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para tipo
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (Pago)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Validación de tipo antes de operación
     */
    async getPagosByMovementType(tipoMovimiento, options = {}) {
        try {
            // ===== VALIDACIÓN DE TIPO =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que el tipo sea válido
            // PRINCIPIO SOLID S: Responsabilidad de validar el tipo
            if (!tipoMovimiento || typeof tipoMovimiento !== 'string') {
                throw new Error('Tipo de movimiento debe ser una string válida');
            }

            // ===== VALIDACIÓN DE TIPOS VÁLIDOS =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que el tipo sea válido
            // PRINCIPIO SOLID S: Responsabilidad de validar tipos válidos
            const tiposValidos = ['ingreso', 'egreso'];
            if (!tiposValidos.includes(tipoMovimiento.toLowerCase())) {
                throw new Error(`Tipo de movimiento debe ser uno de: ${tiposValidos.join(', ')}`);
            }

            // ===== DELEGACIÓN A MÉTODO GETALL =====
            // PATRÓN: Facade - Delega a método getAll para reutilización
            // PATRÓN: Template Method - Reutiliza flujo estándar
            // PRINCIPIO SOLID S: Responsabilidad de delegar a método getAll
            return await this.getAll({ tipoMovimiento: tipoMovimiento.toLowerCase() }, options);
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener pagos por tipo: ${error.message}`);
        }
    }

    /**
     * Obtiene pagos por rango de fechas
     * @param {Date} fechaInicio - Fecha de inicio
     * @param {Date} fechaFin - Fecha de fin
     * @param {Object} filter - Filtros adicionales
     * @returns {Promise<Pago[]>} Array de pagos en el rango
     * 
     * PATRÓN: Template Method - Define el flujo estándar de obtención por rango
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Query Object - Proporciona filtros de búsqueda
     * PATRÓN: Validation Pattern - Valida fechas antes de operación
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PATRÓN: Facade - Delega a método getAll para reutilización
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener por rango
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para rango
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (Pago)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Validación de fechas antes de operación
     */
    async getPagosByDateRange(fechaInicio, fechaFin, filter = {}) {
        try {
            // ===== VALIDACIÓN DE FECHAS =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que las fechas sean válidas
            // PRINCIPIO SOLID S: Responsabilidad de validar las fechas
            if (!(fechaInicio instanceof Date) || !(fechaFin instanceof Date)) {
                throw new Error('Las fechas deben ser objetos Date válidos');
            }

            // ===== CONSTRUCCIÓN DE FILTRO COMBINADO =====
            // PATRÓN: Builder - Construye filtro paso a paso
            // PATRÓN: Query Object - Proporciona filtro de rango de fechas
            // PRINCIPIO SOLID S: Responsabilidad de construir filtro
            const combinedFilter = {
                fechaPago: {
                    $gte: fechaInicio,
                    $lte: fechaFin
                },
                ...filter
            };

            // ===== DELEGACIÓN A MÉTODO GETALL =====
            // PATRÓN: Facade - Delega a método getAll para reutilización
            // PATRÓN: Template Method - Reutiliza flujo estándar
            // PRINCIPIO SOLID S: Responsabilidad de delegar a método getAll
            return await this.getAll(combinedFilter);
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener pagos por rango de fechas: ${error.message}`);
        }
    }

    /**
     * Obtiene el balance por rango de fechas
     * @param {Date} startDate - Fecha de inicio
     * @param {Date} endDate - Fecha de fin
     * @param {string|ObjectId} clienteId - ID del cliente (opcional)
     * @returns {Promise<Object>} Balance en el rango de fechas
     * 
     * PATRÓN: Template Method - Define el flujo estándar de obtención de balance
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Query Object - Proporciona filtros de búsqueda
     * PATRÓN: Validation Pattern - Valida fechas antes de operación
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PATRÓN: Aggregator - Agrega datos de diferentes fuentes
     * PATRÓN: Strategy - Estrategia de agregación
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener balance
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para balance
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (collection)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Agregación eficiente con pipeline de MongoDB
     */
    async getBalanceByDateRange(startDate, endDate, clienteId = null) {
        try {
            // ===== VALIDACIÓN DE FECHAS =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que las fechas sean válidas
            // PRINCIPIO SOLID S: Responsabilidad de validar las fechas
            if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
                throw new Error('Las fechas deben ser objetos Date válidos');
            }

            // ===== CONSTRUCCIÓN DE FILTRO =====
            // PATRÓN: Builder - Construye filtro paso a paso
            // PATRÓN: Query Object - Proporciona filtro de rango de fechas
            // PRINCIPIO SOLID S: Responsabilidad de construir filtro
            const filter = {
                fechaPago: {
                    $gte: startDate,
                    $lte: endDate
                }
            };

            // ===== FILTRO OPCIONAL POR CLIENTE =====
            // PATRÓN: Builder - Agrega filtro opcional de cliente
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PRINCIPIO SOLID S: Responsabilidad de agregar filtro opcional
            if (clienteId && ObjectId.isValid(clienteId)) {
                filter.clienteId = new ObjectId(clienteId);
            }

            // ===== CONSTRUCCIÓN DE PIPELINE DE AGREGACIÓN =====
            // PATRÓN: Builder - Construye pipeline paso a paso
            // PATRÓN: Strategy - Estrategia de agregación
            // PRINCIPIO SOLID S: Responsabilidad de construir pipeline
            const pipeline = [
                { $match: filter },
                {
                    $group: {
                        _id: null,
                        totalIngresos: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$tipoMovimiento", "ingreso"] },
                                    "$monto",
                                    0
                                ]
                            }
                        },
                        totalEgresos: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$tipoMovimiento", "egreso"] },
                                    "$monto",
                                    0
                                ]
                            }
                        },
                        cantidadPagos: { $sum: 1 },
                        cantidadIngresos: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$tipoMovimiento", "ingreso"] },
                                    1,
                                    0
                                ]
                            }
                        },
                        cantidadEgresos: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$tipoMovimiento", "egreso"] },
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
            const result = await this.collection.aggregate(pipeline).toArray();
            
            // ===== VALIDACIÓN DE RESULTADO =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PRINCIPIO SOLID S: Responsabilidad de validar resultado
            if (result.length === 0) {
                return {
                    totalIngresos: 0,
                    totalEgresos: 0,
                    balance: 0,
                    cantidadPagos: 0,
                    cantidadIngresos: 0,
                    cantidadEgresos: 0
                };
            }

            // ===== CONSTRUCCIÓN DE RESULTADO =====
            // PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
            // PATRÓN: Aggregator - Agrega datos de diferentes fuentes
            // PRINCIPIO SOLID S: Responsabilidad de construir resultado
            const data = result[0];
            return {
                totalIngresos: data.totalIngresos,
                totalEgresos: data.totalEgresos,
                balance: data.totalIngresos - data.totalEgresos,
                cantidadPagos: data.cantidadPagos,
                cantidadIngresos: data.cantidadIngresos,
                cantidadEgresos: data.cantidadEgresos
            };
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener balance por rango de fechas: ${error.message}`);
        }
    }

    /**
     * Obtiene pagos pendientes
     * @param {Object} options - Opciones de consulta
     * @returns {Promise<Pago[]>} Array de pagos pendientes
     * 
     * PATRÓN: Template Method - Define el flujo estándar de obtención de pendientes
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Facade - Delega a método getPagosByStatus para reutilización
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener pendientes
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para pendientes
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (Pago)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Reutilización de método existente
     */
    async getPagosPendientes(options = {}) {
        try {
            // ===== DELEGACIÓN A MÉTODO GETPAGOSBYSTATUS =====
            // PATRÓN: Facade - Delega a método getPagosByStatus para reutilización
            // PATRÓN: Template Method - Reutiliza flujo estándar
            // PRINCIPIO SOLID S: Responsabilidad de delegar a método getPagosByStatus
            return await this.getPagosByStatus('pendiente', options);
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener pagos pendientes: ${error.message}`);
        }
    }

    /**
     * Obtiene pagos retrasados
     * @param {Object} options - Opciones de consulta
     * @returns {Promise<Pago[]>} Array de pagos retrasados
     * 
     * PATRÓN: Template Method - Define el flujo estándar de obtención de retrasados
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Facade - Delega a método getPagosByStatus para reutilización
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener retrasados
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para retrasados
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (Pago)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Reutilización de método existente
     */
    async getPagosRetrasados(options = {}) {
        try {
            // ===== DELEGACIÓN A MÉTODO GETPAGOSBYSTATUS =====
            // PATRÓN: Facade - Delega a método getPagosByStatus para reutilización
            // PATRÓN: Template Method - Reutiliza flujo estándar
            // PRINCIPIO SOLID S: Responsabilidad de delegar a método getPagosByStatus
            return await this.getPagosByStatus('retrasado', options);
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener pagos retrasados: ${error.message}`);
        }
    }

    /**
     * Obtiene pagos vencidos (fecha límite pasada y estado pendiente)
     * @param {Date} fechaLimite - Fecha límite para considerar vencidos
     * @param {Object} options - Opciones de consulta
     * @returns {Promise<Pago[]>} Array de pagos vencidos
     * 
     * PATRÓN: Template Method - Define el flujo estándar de obtención de vencidos
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Query Object - Proporciona filtros de búsqueda
     * PATRÓN: Builder - Construye filtro paso a paso
     * PATRÓN: Facade - Delega a método getAll para reutilización
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener vencidos
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para vencidos
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (Pago)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Filtro eficiente con múltiples condiciones
     */
    async getPagosVencidos(fechaLimite = new Date(), options = {}) {
        try {
            // ===== CONSTRUCCIÓN DE FILTRO =====
            // PATRÓN: Builder - Construye filtro paso a paso
            // PATRÓN: Query Object - Proporciona filtro de vencidos
            // PRINCIPIO SOLID S: Responsabilidad de construir filtro
            const filter = {
                estado: { $in: ['pendiente', 'retrasado'] },
                fechaPago: { $lt: fechaLimite }
            };

            // ===== DELEGACIÓN A MÉTODO GETALL =====
            // PATRÓN: Facade - Delega a método getAll para reutilización
            // PATRÓN: Template Method - Reutiliza flujo estándar
            // PRINCIPIO SOLID S: Responsabilidad de delegar a método getAll
            return await this.getAll(filter, options);
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener pagos vencidos: ${error.message}`);
        }
    }

    /**
     * Obtiene estadísticas de pagos
     * @param {Date} fechaInicio - Fecha de inicio (opcional)
     * @param {Date} fechaFin - Fecha de fin (opcional)
     * @returns {Promise<Object>} Estadísticas de pagos
     * 
     * PATRÓN: Template Method - Define el flujo estándar de obtención de estadísticas
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Query Object - Proporciona filtros de búsqueda
     * PATRÓN: Validation Pattern - Valida fechas antes de operación
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PATRÓN: Aggregator - Agrega datos de diferentes fuentes
     * PATRÓN: Strategy - Estrategia de agregación
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener estadísticas
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas métricas
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para estadísticas
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (collection)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Agregación eficiente con pipeline de MongoDB
     */
    async getPagoStats(fechaInicio = null, fechaFin = null) {
        try {
            // ===== CONSTRUCCIÓN DE FILTRO =====
            // PATRÓN: Builder - Construye filtro paso a paso
            // PATRÓN: Query Object - Proporciona filtros de búsqueda
            // PRINCIPIO SOLID S: Responsabilidad de construir filtro
            const filter = {};
            
            // ===== FILTRO OPCIONAL POR FECHAS =====
            // PATRÓN: Builder - Agrega filtro opcional de fechas
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PRINCIPIO SOLID S: Responsabilidad de agregar filtro opcional
            if (fechaInicio && fechaFin) {
                if (!(fechaInicio instanceof Date) || !(fechaFin instanceof Date)) {
                    throw new Error('Las fechas deben ser objetos Date válidos');
                }
                filter.fechaPago = { $gte: fechaInicio, $lte: fechaFin };
            }

            // ===== CONSTRUCCIÓN DE PIPELINE DE AGREGACIÓN =====
            // PATRÓN: Builder - Construye pipeline paso a paso
            // PATRÓN: Strategy - Estrategia de agregación
            // PRINCIPIO SOLID S: Responsabilidad de construir pipeline
            const pipeline = [
                { $match: filter },
                {
                    $group: {
                        _id: null,
                        totalIngresos: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$tipoMovimiento", "ingreso"] },
                                    "$monto",
                                    0
                                ]
                            }
                        },
                        totalEgresos: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$tipoMovimiento", "egreso"] },
                                    "$monto",
                                    0
                                ]
                            }
                        },
                        cantidadPagos: { $sum: 1 },
                        montoPromedio: { $avg: "$monto" },
                        montoMaximo: { $max: "$monto" },
                        montoMinimo: { $min: "$monto" },
                        pagosPagados: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$estado", "pagado"] },
                                    1,
                                    0
                                ]
                            }
                        },
                        pagosPendientes: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$estado", "pendiente"] },
                                    1,
                                    0
                                ]
                            }
                        },
                        pagosRetrasados: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$estado", "retrasado"] },
                                    1,
                                    0
                                ]
                            }
                        },
                        pagosCancelados: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$estado", "cancelado"] },
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
            const result = await this.collection.aggregate(pipeline).toArray();
            
            // ===== VALIDACIÓN DE RESULTADO =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PRINCIPIO SOLID S: Responsabilidad de validar resultado
            if (result.length === 0) {
                return {
                    totalIngresos: 0,
                    totalEgresos: 0,
                    balance: 0,
                    cantidadPagos: 0,
                    montoPromedio: 0,
                    montoMaximo: 0,
                    montoMinimo: 0,
                    pagosPagados: 0,
                    pagosPendientes: 0,
                    pagosRetrasados: 0,
                    pagosCancelados: 0
                };
            }

            // ===== CONSTRUCCIÓN DE RESULTADO =====
            // PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
            // PATRÓN: Aggregator - Agrega datos de diferentes fuentes
            // PRINCIPIO SOLID S: Responsabilidad de construir resultado
            const data = result[0];
            return {
                totalIngresos: data.totalIngresos,
                totalEgresos: data.totalEgresos,
                balance: data.totalIngresos - data.totalEgresos,
                cantidadPagos: data.cantidadPagos,
                montoPromedio: Math.round(data.montoPromedio * 100) / 100,
                montoMaximo: data.montoMaximo,
                montoMinimo: data.montoMinimo,
                pagosPagados: data.pagosPagados,
                pagosPendientes: data.pagosPendientes,
                pagosRetrasados: data.pagosRetrasados,
                pagosCancelados: data.pagosCancelados
            };
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener estadísticas de pagos: ${error.message}`);
        }
    }

    /**
     * Obtiene pagos por mes
     * @param {number} year - Año
     * @param {number} month - Mes (1-12)
     * @returns {Promise<Pago[]>} Array de pagos del mes
     * 
     * PATRÓN: Template Method - Define el flujo estándar de obtención por mes
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Validation Pattern - Valida año y mes antes de operación
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PATRÓN: Facade - Delega a método getPagosByDateRange para reutilización
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener por mes
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para mes
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (Pago)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Validación de año y mes antes de operación
     */
    async getPagosByMonth(year, month) {
        try {
            // ===== VALIDACIÓN DE AÑO Y MES =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que año y mes sean números
            // PRINCIPIO SOLID S: Responsabilidad de validar año y mes
            if (typeof year !== 'number' || typeof month !== 'number') {
                throw new Error('Año y mes deben ser números');
            }

            // ===== VALIDACIÓN DE RANGO DE MES =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que el mes esté en rango válido
            // PRINCIPIO SOLID S: Responsabilidad de validar rango de mes
            if (month < 1 || month > 12) {
                throw new Error('Mes debe estar entre 1 y 12');
            }

            // ===== CONSTRUCCIÓN DE FECHAS =====
            // PATRÓN: Builder - Construye fechas paso a paso
            // PRINCIPIO SOLID S: Responsabilidad de construir fechas
            const fechaInicio = new Date(year, month - 1, 1);
            const fechaFin = new Date(year, month, 0, 23, 59, 59, 999);

            // ===== DELEGACIÓN A MÉTODO GETPAGOSBYDATERANGE =====
            // PATRÓN: Facade - Delega a método getPagosByDateRange para reutilización
            // PATRÓN: Template Method - Reutiliza flujo estándar
            // PRINCIPIO SOLID S: Responsabilidad de delegar a método getPagosByDateRange
            return await this.getPagosByDateRange(fechaInicio, fechaFin);
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener pagos por mes: ${error.message}`);
        }
    }

    /**
     * Obtiene el balance mensual
     * @param {number} year - Año
     * @param {number} month - Mes (1-12)
     * @returns {Promise<Object>} Balance del mes
     * 
     * PATRÓN: Template Method - Define el flujo estándar de obtención de balance mensual
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Facade - Delega a método getPagosByMonth para reutilización
     * PATRÓN: Aggregator - Agrega datos de diferentes fuentes
     * PATRÓN: Strategy - Estrategia de agregación
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener balance mensual
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para balance mensual
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (Pago)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Agregación eficiente con reduce
     */
    async getMonthlyBalance(year, month) {
        try {
            // ===== OBTENCIÓN DE PAGOS DEL MES =====
            // PATRÓN: Facade - Delega a método getPagosByMonth para reutilización
            // PATRÓN: Template Method - Reutiliza flujo estándar
            // PRINCIPIO SOLID S: Responsabilidad de obtener pagos del mes
            const pagos = await this.getPagosByMonth(year, month);
            
            // ===== CÁLCULO DE BALANCE =====
            // PATRÓN: Aggregator - Agrega datos de diferentes fuentes
            // PATRÓN: Strategy - Estrategia de agregación
            // PRINCIPIO SOLID S: Responsabilidad de calcular balance
            const balance = pagos.reduce((acc, pago) => {
                if (pago.esIngreso()) {
                    acc.ingresos += pago.monto;
                } else {
                    acc.egresos += pago.monto;
                }
                return acc;
            }, { ingresos: 0, egresos: 0 });

            // ===== CONSTRUCCIÓN DE RESULTADO =====
            // PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
            // PRINCIPIO SOLID S: Responsabilidad de construir resultado
            return {
                year,
                month,
                ingresos: balance.ingresos,
                egresos: balance.egresos,
                balance: balance.ingresos - balance.egresos,
                cantidadPagos: pagos.length
            };
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener balance mensual: ${error.message}`);
        }
    }

    /**
     * Obtiene los pagos más grandes
     * @param {number} limit - Límite de resultados
     * @param {string} tipoMovimiento - Tipo de movimiento (opcional)
     * @returns {Promise<Pago[]>} Array de pagos más grandes
     * 
     * PATRÓN: Template Method - Define el flujo estándar de obtención de pagos más grandes
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Query Object - Proporciona filtros de búsqueda
     * PATRÓN: Validation Pattern - Valida límite antes de operación
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PATRÓN: Facade - Delega a método getAll para reutilización
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener pagos más grandes
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para pagos más grandes
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (Pago)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Validación de límite antes de operación
     */
    async getLargestPagos(limit = 10, tipoMovimiento = null) {
        try {
            // ===== VALIDACIÓN DE LÍMITE =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que el límite sea válido
            // PRINCIPIO SOLID S: Responsabilidad de validar el límite
            if (typeof limit !== 'number' || limit <= 0) {
                throw new Error('Límite debe ser un número positivo');
            }

            // ===== CONSTRUCCIÓN DE FILTRO =====
            // PATRÓN: Builder - Construye filtro paso a paso
            // PATRÓN: Query Object - Proporciona filtros de búsqueda
            // PRINCIPIO SOLID S: Responsabilidad de construir filtro
            const filter = {};
            if (tipoMovimiento) {
                filter.tipoMovimiento = tipoMovimiento.toLowerCase();
            }

            // ===== DELEGACIÓN A MÉTODO GETALL =====
            // PATRÓN: Facade - Delega a método getAll para reutilización
            // PATRÓN: Template Method - Reutiliza flujo estándar
            // PRINCIPIO SOLID S: Responsabilidad de delegar a método getAll
            return await this.getAll(filter, {
                limit,
                sort: { monto: -1 }
            });
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener pagos más grandes: ${error.message}`);
        }
    }

    /**
     * Obtiene pagos por descripción
     * @param {string} descripcion - Descripción a buscar
     * @param {Object} options - Opciones de consulta
     * @returns {Promise<Pago[]>} Array de pagos que coinciden
     * 
     * PATRÓN: Template Method - Define el flujo estándar de búsqueda por descripción
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Query Object - Proporciona filtros de búsqueda
     * PATRÓN: Validation Pattern - Valida descripción antes de operación
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PATRÓN: Facade - Delega a método getAll para reutilización
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de buscar por descripción
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para búsqueda
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (Pago)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Búsqueda eficiente con expresiones regulares
     */
    async searchPagosByDescription(descripcion, options = {}) {
        try {
            // ===== VALIDACIÓN DE DESCRIPCIÓN =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que la descripción sea válida
            // PRINCIPIO SOLID S: Responsabilidad de validar la descripción
            if (!descripcion || typeof descripcion !== 'string') {
                throw new Error('Descripción debe ser una string válida');
            }

            // ===== CONSTRUCCIÓN DE EXPRESIÓN REGULAR =====
            // PATRÓN: Builder - Construye expresión regular paso a paso
            // PATRÓN: Query Object - Proporciona filtro de búsqueda
            // PRINCIPIO SOLID S: Responsabilidad de construir expresión regular
            const regex = new RegExp(descripcion, 'i');

            // ===== DELEGACIÓN A MÉTODO GETALL =====
            // PATRÓN: Facade - Delega a método getAll para reutilización
            // PATRÓN: Template Method - Reutiliza flujo estándar
            // PRINCIPIO SOLID S: Responsabilidad de delegar a método getAll
            return await this.getAll({ notas: regex }, options);
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al buscar pagos por descripción: ${error.message}`);
        }
    }

    /**
     * Obtiene el balance total
     * @returns {Promise<number>} Balance total
     * 
     * PATRÓN: Template Method - Define el flujo estándar de obtención de balance total
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Aggregator - Agrega datos de diferentes fuentes
     * PATRÓN: Strategy - Estrategia de agregación
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener balance total
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para balance total
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (collection)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Agregación eficiente con pipeline de MongoDB
     */
    async getTotalBalance() {
        try {
            // ===== CONSTRUCCIÓN DE PIPELINE DE AGREGACIÓN =====
            // PATRÓN: Builder - Construye pipeline paso a paso
            // PATRÓN: Strategy - Estrategia de agregación
            // PRINCIPIO SOLID S: Responsabilidad de construir pipeline
            const pipeline = [
                {
                    $group: {
                        _id: null,
                        totalIngresos: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$tipoMovimiento", "ingreso"] },
                                    "$monto",
                                    0
                                ]
                            }
                        },
                        totalEgresos: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$tipoMovimiento", "egreso"] },
                                    "$monto",
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
            const result = await this.collection.aggregate(pipeline).toArray();
            
            // ===== VALIDACIÓN DE RESULTADO =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PRINCIPIO SOLID S: Responsabilidad de validar resultado
            if (result.length === 0) {
                return 0;
            }

            // ===== CÁLCULO DE BALANCE =====
            // PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
            // PATRÓN: Aggregator - Agrega datos de diferentes fuentes
            // PRINCIPIO SOLID S: Responsabilidad de calcular balance
            const data = result[0];
            return data.totalIngresos - data.totalEgresos;
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener balance total: ${error.message}`);
        }
    }

    /**
     * Obtiene pagos recientes
     * @param {number} limit - Límite de resultados
     * @returns {Promise<Pago[]>} Array de pagos recientes
     * 
     * PATRÓN: Template Method - Define el flujo estándar de obtención de pagos recientes
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Validation Pattern - Valida límite antes de operación
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PATRÓN: Facade - Delega a método getAll para reutilización
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener pagos recientes
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para pagos recientes
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (Pago)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Validación de límite antes de operación
     */
    async getRecentPagos(limit = 10) {
        try {
            // ===== VALIDACIÓN DE LÍMITE =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que el límite sea válido
            // PRINCIPIO SOLID S: Responsabilidad de validar el límite
            if (typeof limit !== 'number' || limit <= 0) {
                throw new Error('Límite debe ser un número positivo');
            }

            // ===== DELEGACIÓN A MÉTODO GETALL =====
            // PATRÓN: Facade - Delega a método getAll para reutilización
            // PATRÓN: Template Method - Reutiliza flujo estándar
            // PRINCIPIO SOLID S: Responsabilidad de delegar a método getAll
            return await this.getAll({}, {
                limit,
                sort: { fechaPago: -1 }
            });
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener pagos recientes: ${error.message}`);
        }
    }

    /**
     * Marca un pago como pagado
     * @param {string|ObjectId} id - ID del pago
     * @param {string} referencia - Referencia del pago (opcional)
     * @param {string} notas - Notas adicionales (opcional)
     * @returns {Promise<boolean>} True si se actualizó correctamente
     * 
     * PATRÓN: Template Method - Define el flujo estándar de marcado como pagado
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Builder - Construye datos de actualización paso a paso
     * PATRÓN: Facade - Delega a método update para reutilización
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de marcar como pagado
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para marcado
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (collection)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de actualización
     * BUENA PRÁCTICA: Construcción eficiente de datos de actualización
     */
    async marcarComoPagado(id, referencia = null, notas = null) {
        try {
            // ===== CONSTRUCCIÓN DE DATOS DE ACTUALIZACIÓN =====
            // PATRÓN: Builder - Construye datos paso a paso
            // PATRÓN: Data Transfer Object (DTO) - Proporciona datos estructurados
            // PRINCIPIO SOLID S: Responsabilidad de construir datos de actualización
            const updateData = { estado: 'pagado' };
            
            // ===== AGREGACIÓN DE REFERENCIA =====
            // PATRÓN: Builder - Agrega referencia opcional
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PRINCIPIO SOLID S: Responsabilidad de agregar referencia
            if (referencia) {
                updateData.referencia = referencia;
            }
            
            // ===== AGREGACIÓN DE NOTAS =====
            // PATRÓN: Builder - Agrega notas opcionales
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PRINCIPIO SOLID S: Responsabilidad de agregar notas
            if (notas) {
                updateData.notas = notas;
            }

            // ===== DELEGACIÓN A MÉTODO UPDATE =====
            // PATRÓN: Facade - Delega a método update para reutilización
            // PATRÓN: Template Method - Reutiliza flujo estándar
            // PRINCIPIO SOLID S: Responsabilidad de delegar a método update
            return await this.update(id, updateData);
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al marcar pago como pagado: ${error.message}`);
        }
    }

    /**
     * Marca un pago como retrasado
     * @param {string|ObjectId} id - ID del pago
     * @param {string} notas - Notas sobre el retraso (opcional)
     * @returns {Promise<boolean>} True si se actualizó correctamente
     * 
     * PATRÓN: Template Method - Define el flujo estándar de marcado como retrasado
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Builder - Construye datos de actualización paso a paso
     * PATRÓN: Facade - Delega a método update para reutilización
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de marcar como retrasado
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para marcado
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (collection)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de actualización
     * BUENA PRÁCTICA: Construcción eficiente de datos de actualización
     */
    async marcarComoRetrasado(id, notas = null) {
        try {
            // ===== CONSTRUCCIÓN DE DATOS DE ACTUALIZACIÓN =====
            // PATRÓN: Builder - Construye datos paso a paso
            // PATRÓN: Data Transfer Object (DTO) - Proporciona datos estructurados
            // PRINCIPIO SOLID S: Responsabilidad de construir datos de actualización
            const updateData = { estado: 'retrasado' };
            
            // ===== AGREGACIÓN DE NOTAS =====
            // PATRÓN: Builder - Agrega notas opcionales
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PRINCIPIO SOLID S: Responsabilidad de agregar notas
            if (notas) {
                updateData.notas = notas;
            }

            // ===== DELEGACIÓN A MÉTODO UPDATE =====
            // PATRÓN: Facade - Delega a método update para reutilización
            // PATRÓN: Template Method - Reutiliza flujo estándar
            // PRINCIPIO SOLID S: Responsabilidad de delegar a método update
            return await this.update(id, updateData);
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al marcar pago como retrasado: ${error.message}`);
        }
    }

    /**
     * Marca un pago como cancelado
     * @param {string|ObjectId} id - ID del pago
     * @param {string} motivo - Motivo de la cancelación
     * @returns {Promise<boolean>} True si se actualizó correctamente
     * 
     * PATRÓN: Template Method - Define el flujo estándar de marcado como cancelado
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Validation Pattern - Valida motivo antes de operación
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PATRÓN: Builder - Construye datos de actualización paso a paso
     * PATRÓN: Facade - Delega a método update para reutilización
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de marcar como cancelado
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para marcado
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (collection)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de actualización
     * BUENA PRÁCTICA: Validación de motivo antes de operación
     */
    async marcarComoCancelado(id, motivo) {
        try {
            // ===== VALIDACIÓN DE MOTIVO =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que el motivo sea válido
            // PRINCIPIO SOLID S: Responsabilidad de validar el motivo
            if (!motivo || typeof motivo !== 'string') {
                throw new Error('Motivo de cancelación es obligatorio');
            }

            // ===== CONSTRUCCIÓN DE DATOS DE ACTUALIZACIÓN =====
            // PATRÓN: Builder - Construye datos paso a paso
            // PATRÓN: Data Transfer Object (DTO) - Proporciona datos estructurados
            // PRINCIPIO SOLID S: Responsabilidad de construir datos de actualización
            const updateData = { 
                estado: 'cancelado',
                notas: motivo
            };

            // ===== DELEGACIÓN A MÉTODO UPDATE =====
            // PATRÓN: Facade - Delega a método update para reutilización
            // PATRÓN: Template Method - Reutiliza flujo estándar
            // PRINCIPIO SOLID S: Responsabilidad de delegar a método update
            return await this.update(id, updateData);
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al marcar pago como cancelado: ${error.message}`);
        }
    }
}

module.exports = PagoRepository;
