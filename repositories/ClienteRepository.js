// ===== IMPORTS Y DEPENDENCIAS =====
// Importación de ObjectId de MongoDB para manejo de IDs
// PATRÓN: Dependency Injection - Se inyectan las dependencias a través del constructor
// PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (ObjectId) no de implementaciones concretas
const { ObjectId } = require('mongodb'); // Driver de MongoDB para operaciones con ObjectId
// Importación del modelo Cliente para validaciones y transformaciones
// PATRÓN: Dependency Injection - Se inyectan las dependencias a través del constructor
// PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (Cliente) no de implementaciones concretas
const { Cliente } = require('../models'); // Modelo de dominio Cliente

/**
 * Repositorio para gestión de clientes
 * Implementa el patrón Repository para abstraer el acceso a datos
 * Maneja operaciones CRUD y métodos específicos para clientes
 * 
 * PATRÓN: Repository - Abstrae el acceso a datos de clientes
 * PATRÓN: Data Access Object (DAO) - Proporciona interfaz para operaciones de datos
 * PATRÓN: Facade - Proporciona una interfaz simplificada para operaciones de clientes
 * PATRÓN: Data Transfer Object (DTO) - Proporciona datos estructurados
 * PATRÓN: Module Pattern - Encapsula la funcionalidad de repositorio
 * PRINCIPIO SOLID S: Responsabilidad Única - Se encarga únicamente de la gestión de datos de clientes
 * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas operaciones sin modificar código existente
 * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente en todas las operaciones
 * PRINCIPIO SOLID I: Segregación de Interfaces - Métodos específicos para diferentes operaciones
 * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (db, Cliente) no de implementaciones concretas
 * 
 * NOTA: Este módulo NO maneja transacciones ya que solo proporciona operaciones de datos
 * BUENA PRÁCTICA: Repositorio centralizado para operaciones de clientes
 */
class ClienteRepository {
    /**
     * Constructor del repositorio de clientes
     * @param {Object} db - Instancia de base de datos MongoDB
     * 
     * PATRÓN: Dependency Injection - Inyecta dependencia de base de datos
     * PATRÓN: Repository - Inicializa el repositorio con la colección
     * PRINCIPIO SOLID S: Responsabilidad de inicializar el repositorio
     * BUENA PRÁCTICA: Inicialización de repositorio en constructor
     */
    constructor(db) {
        // PATRÓN: Repository - Abstrae el acceso a la colección de clientes
        // PRINCIPIO SOLID S: Responsabilidad de acceder a la colección de clientes
        this.collection = db.collection('clientes');
        // PATRÓN: Dependency Injection - Inyecta dependencia de base de datos
        // PRINCIPIO SOLID S: Responsabilidad de mantener referencia a la base de datos
        this.db = db;
    }

    /**
     * Crea un nuevo cliente en la base de datos
     * @param {Cliente} cliente - Instancia de Cliente a crear
     * @returns {Promise<ObjectId>} ID del cliente creado
     * @throws {Error} Si la validación falla o hay error en la inserción
     * 
     * PATRÓN: Template Method - Define el flujo estándar de creación
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Validation Pattern - Valida datos antes de inserción
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de crear clientes
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas validaciones
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para creación
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (Cliente)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de inserción
     * BUENA PRÁCTICA: Validación de datos antes de inserción
     */
    async create(cliente) {
        try {
            // ===== VALIDACIÓN DE INSTANCIA =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que sea instancia de Cliente
            // PRINCIPIO SOLID S: Responsabilidad de validar el tipo de dato
            if (!(cliente instanceof Cliente)) {
                throw new Error('El parámetro debe ser una instancia de Cliente');
            }

            // ===== CONVERSIÓN A OBJETO MONGODB =====
            // PATRÓN: Data Transfer Object (DTO) - Convierte a formato MongoDB
            // PATRÓN: Mapper - Mapea entre modelo de dominio y formato de base de datos
            // PRINCIPIO SOLID S: Responsabilidad de convertir a formato de base de datos
            const clienteDoc = cliente.toMongoObject();
            
            // ===== VERIFICACIÓN DE UNICIDAD =====
            // PATRÓN: Guard Clause - Validación temprana para evitar duplicados
            // PATRÓN: Validation Pattern - Valida unicidad de email
            // PRINCIPIO SOLID S: Responsabilidad de verificar unicidad
            const clienteExistente = await this.collection.findOne({ email: clienteDoc.email });
            if (clienteExistente) {
                throw new Error('Ya existe un cliente con este email');
            }

            // ===== INSERCIÓN EN BASE DE DATOS =====
            // PATRÓN: Repository - Abstrae la operación de inserción
            // PATRÓN: Data Transfer Object (DTO) - Retorna resultado estructurado
            // PRINCIPIO SOLID S: Responsabilidad de insertar en base de datos
            const result = await this.collection.insertOne(clienteDoc);
            return result.insertedId;
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al crear cliente: ${error.message}`);
        }
    }

    /**
     * Obtiene un cliente por su ID
     * @param {string|ObjectId} id - ID del cliente
     * @returns {Promise<Cliente|null>} Cliente encontrado o null
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
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (Cliente)
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
                throw new Error('ID del cliente no es válido');
            }

            // ===== BÚSQUEDA EN BASE DE DATOS =====
            // PATRÓN: Repository - Abstrae la operación de búsqueda
            // PATRÓN: Data Transfer Object (DTO) - Retorna resultado estructurado
            // PRINCIPIO SOLID S: Responsabilidad de buscar en base de datos
            const clienteDoc = await this.collection.findOne({ _id: new ObjectId(id) });
            
            // ===== VERIFICACIÓN DE EXISTENCIA =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PRINCIPIO SOLID S: Responsabilidad de verificar existencia
            if (!clienteDoc) {
                return null;
            }

            // ===== CONVERSIÓN A MODELO DE DOMINIO =====
            // PATRÓN: Mapper - Mapea entre formato de base de datos y modelo de dominio
            // PATRÓN: Data Transfer Object (DTO) - Convierte a modelo de dominio
            // PRINCIPIO SOLID S: Responsabilidad de convertir a modelo de dominio
            return Cliente.fromMongoObject(clienteDoc);
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener cliente: ${error.message}`);
        }
    }

    /**
     * Obtiene un cliente por su email
     * @param {string} email - Email del cliente
     * @returns {Promise<Cliente|null>} Cliente encontrado o null
     * @throws {Error} Si el email no es válido
     * 
     * PATRÓN: Template Method - Define el flujo estándar de búsqueda por email
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Validation Pattern - Valida email antes de búsqueda
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de buscar por email
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas validaciones
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para búsqueda por email
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (Cliente)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Validación de email antes de búsqueda
     */
    async getByEmail(email) {
        try {
            // ===== VALIDACIÓN DE EMAIL =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que el email sea válido
            // PRINCIPIO SOLID S: Responsabilidad de validar el email
            if (!email || typeof email !== 'string') {
                throw new Error('Email debe ser una string válida');
            }

            // ===== BÚSQUEDA EN BASE DE DATOS =====
            // PATRÓN: Repository - Abstrae la operación de búsqueda
            // PATRÓN: Data Transfer Object (DTO) - Retorna resultado estructurado
            // PRINCIPIO SOLID S: Responsabilidad de buscar en base de datos
            const clienteDoc = await this.collection.findOne({ email: email.toLowerCase().trim() });
            
            // ===== VERIFICACIÓN DE EXISTENCIA =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PRINCIPIO SOLID S: Responsabilidad de verificar existencia
            if (!clienteDoc) {
                return null;
            }

            // ===== CONVERSIÓN A MODELO DE DOMINIO =====
            // PATRÓN: Mapper - Mapea entre formato de base de datos y modelo de dominio
            // PATRÓN: Data Transfer Object (DTO) - Convierte a modelo de dominio
            // PRINCIPIO SOLID S: Responsabilidad de convertir a modelo de dominio
            return Cliente.fromMongoObject(clienteDoc);
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener cliente por email: ${error.message}`);
        }
    }

    /**
     * Cuenta el número de clientes que coinciden con el filtro
     * @param {Object} filter - Filtro de búsqueda
     * @returns {Promise<number>} Número de clientes que coinciden
     * 
     * PATRÓN: Template Method - Define el flujo estándar de conteo
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Query Object - Proporciona filtros de búsqueda
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de contar clientes
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevos filtros
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para conteo
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (collection)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de conteo
     * BUENA PRÁCTICA: Conteo eficiente con filtros
     */
    async countClientes(filter = {}) {
        try {
            // ===== CONTEO EN BASE DE DATOS =====
            // PATRÓN: Repository - Abstrae la operación de conteo
            // PATRÓN: Query Object - Proporciona filtros de búsqueda
            // PRINCIPIO SOLID S: Responsabilidad de contar en base de datos
            return await this.collection.countDocuments(filter);
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al contar clientes: ${error.message}`);
        }
    }

    /**
     * Obtiene todos los clientes con filtro opcional
     * @param {Object} filter - Filtro de búsqueda
     * @param {Object} options - Opciones de consulta (limit, skip, sort)
     * @returns {Promise<Cliente[]>} Array de clientes
     * 
     * PATRÓN: Template Method - Define el flujo estándar de obtención de todos los clientes
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Query Object - Proporciona filtros y opciones de búsqueda
     * PATRÓN: Builder - Construye consulta paso a paso
     * PATRÓN: Mapper - Mapea entre formato de base de datos y modelo de dominio
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener todos los clientes
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas opciones
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para obtener todos
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (Cliente)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Consulta eficiente con filtros y opciones
     */
    async getAll(filter = {}, options = {}) {
        try {
            // ===== DESESTRUCTURACIÓN DE OPCIONES =====
            // PATRÓN: Strategy - Estrategia de opciones de consulta
            // PRINCIPIO SOLID S: Responsabilidad de configurar opciones
            const { limit = 0, skip = 0, sort = { fechaRegistro: -1 } } = options;
            
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
            const clientesDocs = await query.toArray();
            
            // ===== CONVERSIÓN A MODELOS DE DOMINIO =====
            // PATRÓN: Mapper - Mapea entre formato de base de datos y modelo de dominio
            // PATRÓN: Data Transfer Object (DTO) - Convierte a modelos de dominio
            // PRINCIPIO SOLID S: Responsabilidad de convertir a modelos de dominio
            return clientesDocs.map(doc => Cliente.fromMongoObject(doc));
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener clientes: ${error.message}`);
        }
    }

    /**
     * Actualiza un cliente existente
     * @param {string|ObjectId} id - ID del cliente a actualizar
     * @param {Object} updatedData - Datos actualizados
     * @returns {Promise<boolean>} True si se actualizó correctamente
     * @throws {Error} Si el ID no es válido o hay error en la actualización
     * 
     * PATRÓN: Template Method - Define el flujo estándar de actualización
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Validation Pattern - Valida datos antes de actualización
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de actualizar clientes
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas validaciones
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para actualización
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (collection)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de actualización
     * BUENA PRÁCTICA: Validación de datos antes de actualización
     */
    async update(id, updatedData) {
        try {
            // ===== VALIDACIÓN DE ID =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que el ID sea válido
            // PRINCIPIO SOLID S: Responsabilidad de validar el ID
            if (!ObjectId.isValid(id)) {
                throw new Error('ID del cliente no es válido');
            }

            // ===== VERIFICACIÓN DE UNICIDAD DE EMAIL =====
            // PATRÓN: Guard Clause - Validación temprana para evitar duplicados
            // PATRÓN: Validation Pattern - Valida unicidad de email
            // PRINCIPIO SOLID S: Responsabilidad de verificar unicidad
            if (updatedData.email) {
                const clienteExistente = await this.collection.findOne({ 
                    email: updatedData.email, 
                    _id: { $ne: new ObjectId(id) } 
                });
                if (clienteExistente) {
                    throw new Error('Ya existe otro cliente con este email');
                }
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
            throw new Error(`Error al actualizar cliente: ${error.message}`);
        }
    }

    /**
     * Elimina un cliente por su ID
     * @param {string|ObjectId} id - ID del cliente a eliminar
     * @returns {Promise<boolean>} True si se eliminó correctamente
     * @throws {Error} Si el ID no es válido o hay dependencias
     * 
     * PATRÓN: Template Method - Define el flujo estándar de eliminación
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Validation Pattern - Valida dependencias antes de eliminación
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de eliminar clientes
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas validaciones
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para eliminación
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (collection)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de eliminación
     * BUENA PRÁCTICA: Validación de dependencias antes de eliminación
     */
    async delete(id) {
        try {
            // ===== VALIDACIÓN DE ID =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que el ID sea válido
            // PRINCIPIO SOLID S: Responsabilidad de validar el ID
            if (!ObjectId.isValid(id)) {
                throw new Error('ID del cliente no es válido');
            }

            // ===== VERIFICACIÓN DE DEPENDENCIAS - PLANES =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida dependencias de planes
            // PRINCIPIO SOLID S: Responsabilidad de verificar dependencias
            const cliente = await this.getById(id);
            if (cliente && cliente.tienePlanes()) {
                throw new Error('No se puede eliminar un cliente que tiene planes asignados');
            }

            // ===== VERIFICACIÓN DE DEPENDENCIAS - CONTRATOS =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida dependencias de contratos
            // PRINCIPIO SOLID S: Responsabilidad de verificar dependencias
            const contratosCollection = this.db.collection('contratos');
            const contratosActivos = await contratosCollection.countDocuments({
                clienteId: new ObjectId(id),
                estado: 'vigente'
            });

            if (contratosActivos > 0) {
                throw new Error('No se puede eliminar un cliente con contratos activos');
            }

            // ===== ELIMINACIÓN EN BASE DE DATOS =====
            // PATRÓN: Repository - Abstrae la operación de eliminación
            // PATRÓN: Data Transfer Object (DTO) - Retorna resultado estructurado
            // PRINCIPIO SOLID S: Responsabilidad de eliminar en base de datos
            const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
            return result.deletedCount > 0;
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al eliminar cliente: ${error.message}`);
        }
    }

    /**
     * Obtiene todos los clientes activos
     * @returns {Promise<Cliente[]>} Array de clientes activos
     * 
     * PATRÓN: Template Method - Define el flujo estándar de obtención de clientes activos
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Query Object - Proporciona filtros de búsqueda
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener clientes activos
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para clientes activos
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (getAll)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Filtrado eficiente de clientes activos
     */
    async getActiveClients() {
        try {
            // ===== DELEGACIÓN A MÉTODO GENERAL =====
            // PATRÓN: Template Method - Delega a método general con filtro específico
            // PATRÓN: Query Object - Proporciona filtro de clientes activos
            // PRINCIPIO SOLID S: Responsabilidad de obtener clientes activos
            return await this.getAll({ activo: true });
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener clientes activos: ${error.message}`);
        }
    }

    /**
     * Obtiene clientes que tienen planes asignados
     * @returns {Promise<Cliente[]>} Array de clientes con planes
     * 
     * PATRÓN: Template Method - Define el flujo estándar de obtención de clientes con planes
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Query Object - Proporciona filtros de búsqueda
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener clientes con planes
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para clientes con planes
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (getAll)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Filtrado eficiente de clientes con planes
     */
    async getClientsWithActivePlans() {
        try {
            // ===== DELEGACIÓN A MÉTODO GENERAL =====
            // PATRÓN: Template Method - Delega a método general con filtro específico
            // PATRÓN: Query Object - Proporciona filtro de clientes con planes
            // PRINCIPIO SOLID S: Responsabilidad de obtener clientes con planes
            return await this.getAll({ 
                activo: true, 
                planes: { $exists: true, $ne: [] } 
            });
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener clientes con planes: ${error.message}`);
        }
    }

    /**
     * Obtiene clientes por nivel de plan
     * @param {string} nivel - Nivel del plan (principiante, intermedio, avanzado)
     * @returns {Promise<Cliente[]>} Array de clientes con planes del nivel especificado
     * 
     * PATRÓN: Template Method - Define el flujo estándar de obtención por nivel
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Query Object - Proporciona filtros de búsqueda
     * PATRÓN: Mapper - Mapea entre formatos de datos
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener por nivel
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para nivel
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (getAll)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Filtrado eficiente por nivel de plan
     */
    async getClientsByPlanLevel(nivel) {
        try {
            // ===== BÚSQUEDA DE PLANES POR NIVEL =====
            // PATRÓN: Repository - Abstrae la operación de búsqueda de planes
            // PATRÓN: Query Object - Proporciona filtro de nivel
            // PRINCIPIO SOLID S: Responsabilidad de buscar planes por nivel
            const planesCollection = this.db.collection('planes');
            const planes = await planesCollection.find({ nivel }).toArray();
            
            // ===== MAPEO DE IDs DE PLANES =====
            // PATRÓN: Mapper - Mapea entre formatos de datos
            // PATRÓN: Data Transfer Object (DTO) - Convierte a formato de consulta
            // PRINCIPIO SOLID S: Responsabilidad de mapear IDs de planes
            const planIds = planes.map(plan => plan._id);

            // ===== DELEGACIÓN A MÉTODO GENERAL =====
            // PATRÓN: Template Method - Delega a método general con filtro específico
            // PATRÓN: Query Object - Proporciona filtro de clientes con planes del nivel
            // PRINCIPIO SOLID S: Responsabilidad de obtener clientes por nivel
            return await this.getAll({ 
                activo: true, 
                planes: { $in: planIds } 
            });
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener clientes por nivel: ${error.message}`);
        }
    }

    /**
     * Busca clientes por nombre o email
     * @param {string} searchTerm - Término de búsqueda
     * @returns {Promise<Cliente[]>} Array de clientes que coinciden
     * 
     * PATRÓN: Template Method - Define el flujo estándar de búsqueda
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Query Object - Proporciona filtros de búsqueda
     * PATRÓN: Validation Pattern - Valida término de búsqueda
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de buscar clientes
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para búsqueda
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (getAll)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Búsqueda eficiente con expresiones regulares
     */
    async searchClients(searchTerm) {
        try {
            // ===== VALIDACIÓN DE TÉRMINO DE BÚSQUEDA =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que el término sea válido
            // PRINCIPIO SOLID S: Responsabilidad de validar el término
            if (!searchTerm || typeof searchTerm !== 'string') {
                throw new Error('Término de búsqueda debe ser una string válida');
            }

            // ===== CREACIÓN DE EXPRESIÓN REGULAR =====
            // PATRÓN: Strategy - Estrategia de búsqueda con regex
            // PRINCIPIO SOLID S: Responsabilidad de crear expresión regular
            const regex = new RegExp(searchTerm, 'i');
            
            // ===== DELEGACIÓN A MÉTODO GENERAL =====
            // PATRÓN: Template Method - Delega a método general con filtro específico
            // PATRÓN: Query Object - Proporciona filtro de búsqueda
            // PRINCIPIO SOLID S: Responsabilidad de buscar clientes
            return await this.getAll({
                $or: [
                    { nombre: regex },
                    { apellido: regex },
                    { email: regex }
                ]
            });
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al buscar clientes: ${error.message}`);
        }
    }

    /**
     * Obtiene estadísticas de clientes
     * @returns {Promise<Object>} Estadísticas de clientes
     * 
     * PATRÓN: Template Method - Define el flujo estándar de obtención de estadísticas
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Aggregator - Agrega datos de múltiples fuentes
     * PATRÓN: Query Object - Proporciona filtros de búsqueda
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener estadísticas
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas estadísticas
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para estadísticas
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (collection)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Agregación eficiente de estadísticas
     */
    async getClientStats() {
        try {
            // ===== CONTEO DE CLIENTES TOTALES =====
            // PATRÓN: Repository - Abstrae la operación de conteo
            // PATRÓN: Query Object - Proporciona filtros de búsqueda
            // PRINCIPIO SOLID S: Responsabilidad de contar clientes totales
            const totalClientes = await this.collection.countDocuments();
            
            // ===== CONTEO DE CLIENTES ACTIVOS =====
            // PATRÓN: Repository - Abstrae la operación de conteo
            // PATRÓN: Query Object - Proporciona filtro de clientes activos
            // PRINCIPIO SOLID S: Responsabilidad de contar clientes activos
            const clientesActivos = await this.collection.countDocuments({ activo: true });
            
            // ===== CONTEO DE CLIENTES CON PLANES =====
            // PATRÓN: Repository - Abstrae la operación de conteo
            // PATRÓN: Query Object - Proporciona filtro de clientes con planes
            // PRINCIPIO SOLID S: Responsabilidad de contar clientes con planes
            const clientesConPlanes = await this.collection.countDocuments({ 
                planes: { $exists: true, $ne: [] } 
            });

            // ===== PIPELINE DE AGREGACIÓN =====
            // PATRÓN: Aggregator - Agrega datos de múltiples fuentes
            // PATRÓN: Query Object - Proporciona pipeline de agregación
            // PRINCIPIO SOLID S: Responsabilidad de crear pipeline de agregación
            const pipeline = [
                {
                    $group: {
                        _id: {
                            year: { $year: "$fechaRegistro" },
                            month: { $month: "$fechaRegistro" }
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { "_id.year": -1, "_id.month": -1 } },
                { $limit: 12 }
            ];

            // ===== EJECUCIÓN DE PIPELINE =====
            // PATRÓN: Repository - Abstrae la operación de agregación
            // PRINCIPIO SOLID S: Responsabilidad de ejecutar pipeline
            const registrosPorMes = await this.collection.aggregate(pipeline).toArray();

            // ===== CONSTRUCCIÓN DE ESTADÍSTICAS =====
            // PATRÓN: Data Transfer Object (DTO) - Proporciona estadísticas estructuradas
            // PATRÓN: Aggregator - Agrega datos de múltiples fuentes
            // PRINCIPIO SOLID S: Responsabilidad de construir estadísticas
            return {
                totalClientes,
                clientesActivos,
                clientesInactivos: totalClientes - clientesActivos,
                clientesConPlanes,
                clientesSinPlanes: clientesActivos - clientesConPlanes,
                registrosPorMes
            };
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener estadísticas: ${error.message}`);
        }
    }

    /**
     * Agrega un plan a un cliente
     * @param {string|ObjectId} clienteId - ID del cliente
     * @param {string|ObjectId} planId - ID del plan
     * @returns {Promise<boolean>} True si se agregó correctamente
     * 
     * PATRÓN: Template Method - Define el flujo estándar de agregación de plan
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Validation Pattern - Valida IDs antes de operación
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de agregar plan
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas validaciones
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para agregar plan
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (collection)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de actualización
     * BUENA PRÁCTICA: Validación de IDs antes de operación
     */
    async addPlanToClient(clienteId, planId) {
        try {
            // ===== VALIDACIÓN DE IDs =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que los IDs sean válidos
            // PRINCIPIO SOLID S: Responsabilidad de validar los IDs
            if (!ObjectId.isValid(clienteId) || !ObjectId.isValid(planId)) {
                throw new Error('IDs deben ser ObjectIds válidos');
            }

            // ===== ACTUALIZACIÓN EN BASE DE DATOS =====
            // PATRÓN: Repository - Abstrae la operación de actualización
            // PATRÓN: Data Transfer Object (DTO) - Retorna resultado estructurado
            // PRINCIPIO SOLID S: Responsabilidad de actualizar en base de datos
            const result = await this.collection.updateOne(
                { _id: new ObjectId(clienteId) },
                { $addToSet: { planes: new ObjectId(planId) } }
            );

            // ===== RETORNO DE RESULTADO =====
            // PATRÓN: Data Transfer Object (DTO) - Retorna resultado estructurado
            // PRINCIPIO SOLID S: Responsabilidad de retornar resultado
            return result.modifiedCount > 0;
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al agregar plan al cliente: ${error.message}`);
        }
    }

    /**
     * Remueve un plan de un cliente
     * @param {string|ObjectId} clienteId - ID del cliente
     * @param {string|ObjectId} planId - ID del plan
     * @returns {Promise<boolean>} True si se removió correctamente
     * 
     * PATRÓN: Template Method - Define el flujo estándar de remoción de plan
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Validation Pattern - Valida IDs antes de operación
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de remover plan
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas validaciones
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para remover plan
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (collection)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de actualización
     * BUENA PRÁCTICA: Validación de IDs antes de operación
     */
    async removePlanFromClient(clienteId, planId) {
        try {
            // ===== VALIDACIÓN DE IDs =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que los IDs sean válidos
            // PRINCIPIO SOLID S: Responsabilidad de validar los IDs
            if (!ObjectId.isValid(clienteId) || !ObjectId.isValid(planId)) {
                throw new Error('IDs deben ser ObjectIds válidos');
            }

            // ===== ACTUALIZACIÓN EN BASE DE DATOS =====
            // PATRÓN: Repository - Abstrae la operación de actualización
            // PATRÓN: Data Transfer Object (DTO) - Retorna resultado estructurado
            // PRINCIPIO SOLID S: Responsabilidad de actualizar en base de datos
            const result = await this.collection.updateOne(
                { _id: new ObjectId(clienteId) },
                { $pull: { planes: new ObjectId(planId) } }
            );

            // ===== RETORNO DE RESULTADO =====
            // PATRÓN: Data Transfer Object (DTO) - Retorna resultado estructurado
            // PRINCIPIO SOLID S: Responsabilidad de retornar resultado
            return result.modifiedCount > 0;
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al remover plan del cliente: ${error.message}`);
        }
    }

    /**
     * Obtiene clientes registrados en un rango de fechas
     * @param {Date} fechaInicio - Fecha de inicio
     * @param {Date} fechaFin - Fecha de fin
     * @returns {Promise<Cliente[]>} Array de clientes en el rango
     * 
     * PATRÓN: Template Method - Define el flujo estándar de obtención por rango de fechas
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Query Object - Proporciona filtros de búsqueda
     * PATRÓN: Validation Pattern - Valida fechas antes de operación
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener por rango
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para rango de fechas
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (getAll)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Validación de fechas antes de operación
     */
    async getClientsByDateRange(fechaInicio, fechaFin) {
        try {
            // ===== VALIDACIÓN DE FECHAS =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que las fechas sean válidas
            // PRINCIPIO SOLID S: Responsabilidad de validar las fechas
            if (!(fechaInicio instanceof Date) || !(fechaFin instanceof Date)) {
                throw new Error('Las fechas deben ser objetos Date válidos');
            }

            // ===== DELEGACIÓN A MÉTODO GENERAL =====
            // PATRÓN: Template Method - Delega a método general con filtro específico
            // PATRÓN: Query Object - Proporciona filtro de rango de fechas
            // PRINCIPIO SOLID S: Responsabilidad de obtener clientes por rango
            return await this.getAll({
                fechaRegistro: {
                    $gte: fechaInicio,
                    $lte: fechaFin
                }
            });
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener clientes por rango de fechas: ${error.message}`);
        }
    }

    /**
     * Verifica si un cliente tiene un plan específico
     * @param {string|ObjectId} clienteId - ID del cliente
     * @param {string|ObjectId} planId - ID del plan
     * @returns {Promise<boolean>} True si el cliente tiene el plan
     * 
     * PATRÓN: Template Method - Define el flujo estándar de verificación de plan
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Validation Pattern - Valida IDs antes de operación
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de verificar plan
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas validaciones
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para verificar plan
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (collection)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Validación de IDs antes de operación
     */
    async clientHasPlan(clienteId, planId) {
        try {
            // ===== VALIDACIÓN DE IDs =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que los IDs sean válidos
            // PRINCIPIO SOLID S: Responsabilidad de validar los IDs
            if (!ObjectId.isValid(clienteId) || !ObjectId.isValid(planId)) {
                throw new Error('IDs deben ser ObjectIds válidos');
            }

            // ===== BÚSQUEDA EN BASE DE DATOS =====
            // PATRÓN: Repository - Abstrae la operación de búsqueda
            // PATRÓN: Query Object - Proporciona filtro de búsqueda
            // PRINCIPIO SOLID S: Responsabilidad de buscar en base de datos
            const cliente = await this.collection.findOne({
                _id: new ObjectId(clienteId),
                planes: new ObjectId(planId)
            });

            // ===== RETORNO DE RESULTADO =====
            // PATRÓN: Data Transfer Object (DTO) - Retorna resultado booleano
            // PRINCIPIO SOLID S: Responsabilidad de retornar resultado
            return !!cliente;
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al verificar plan del cliente: ${error.message}`);
        }
    }

    /**
     * Obtiene los planes de un cliente
     * @param {string|ObjectId} clienteId - ID del cliente
     * @returns {Promise<Object[]>} Array de planes del cliente
     * 
     * PATRÓN: Template Method - Define el flujo estándar de obtención de planes
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Validation Pattern - Valida ID antes de operación
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PATRÓN: Mapper - Mapea entre formatos de datos
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener planes
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para obtener planes
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (collection)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Validación de ID antes de operación
     */
    async getClientPlans(clienteId) {
        try {
            // ===== VALIDACIÓN DE ID =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que el ID sea válido
            // PRINCIPIO SOLID S: Responsabilidad de validar el ID
            if (!ObjectId.isValid(clienteId)) {
                throw new Error('ID del cliente no es válido');
            }

            // ===== BÚSQUEDA DE CLIENTE =====
            // PATRÓN: Repository - Abstrae la operación de búsqueda
            // PRINCIPIO SOLID S: Responsabilidad de buscar cliente
            const cliente = await this.collection.findOne({ _id: new ObjectId(clienteId) });
            if (!cliente) {
                throw new Error('Cliente no encontrado');
            }

            // ===== VERIFICACIÓN DE PLANES =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PRINCIPIO SOLID S: Responsabilidad de verificar planes
            if (!cliente.planes || cliente.planes.length === 0) {
                return [];
            }

            // ===== BÚSQUEDA DE INFORMACIÓN COMPLETA DE PLANES =====
            // PATRÓN: Repository - Abstrae la operación de búsqueda de planes
            // PATRÓN: Query Object - Proporciona filtro de planes
            // PRINCIPIO SOLID S: Responsabilidad de buscar planes
            const planesCollection = this.db.collection('planes');
            const planes = await planesCollection.find({
                _id: { $in: cliente.planes }
            }).toArray();

            // ===== MAPEO DE PLANES =====
            // PATRÓN: Mapper - Mapea entre formatos de datos
            // PATRÓN: Data Transfer Object (DTO) - Convierte a formato de respuesta
            // PRINCIPIO SOLID S: Responsabilidad de mapear planes
            return planes.map(plan => ({
                planId: plan._id,
                nombre: plan.nombre,
                duracionSemanas: plan.duracionSemanas,
                nivel: plan.nivel,
                estado: plan.estado,
                metasFisicas: plan.metasFisicas
            }));
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener planes del cliente: ${error.message}`);
        }
    }
}

// ===== EXPORTACIÓN DEL MÓDULO =====
// PATRÓN: Module Pattern - Exporta la clase como módulo
// PRINCIPIO SOLID S: Responsabilidad de proporcionar la interfaz pública del repositorio
module.exports = ClienteRepository;
