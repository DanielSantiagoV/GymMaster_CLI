// ===== IMPORTS Y DEPENDENCIAS =====
// Importación de ObjectId de MongoDB para manejo de IDs
// PATRÓN: Dependency Injection - Se inyectan las dependencias a través del constructor
// PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (ObjectId) no de implementaciones concretas
const { ObjectId } = require('mongodb'); // Driver de MongoDB para operaciones con ObjectId
// Importación del modelo Contrato para validaciones y transformaciones
// PATRÓN: Dependency Injection - Se inyectan las dependencias a través del constructor
// PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (Contrato) no de implementaciones concretas
const { Contrato } = require('../models'); // Modelo de dominio Contrato

/**
 * Repositorio para gestión de contratos
 * Implementa el patrón Repository para abstraer el acceso a datos
 * Maneja operaciones CRUD y métodos específicos para contratos
 * 
 * PATRÓN: Repository - Abstrae el acceso a datos de contratos
 * PATRÓN: Data Access Object (DAO) - Proporciona interfaz para operaciones de datos
 * PATRÓN: Facade - Proporciona una interfaz simplificada para operaciones de contratos
 * PATRÓN: Data Transfer Object (DTO) - Proporciona datos estructurados
 * PATRÓN: Module Pattern - Encapsula la funcionalidad de repositorio
 * PRINCIPIO SOLID S: Responsabilidad Única - Se encarga únicamente de la gestión de datos de contratos
 * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas operaciones sin modificar código existente
 * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente en todas las operaciones
 * PRINCIPIO SOLID I: Segregación de Interfaces - Métodos específicos para diferentes operaciones
 * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (db, Contrato) no de implementaciones concretas
 * 
 * NOTA: Este módulo NO maneja transacciones ya que solo proporciona operaciones de datos
 * BUENA PRÁCTICA: Repositorio centralizado para operaciones de contratos
 */
class ContratoRepository {
    /**
     * Constructor del repositorio de contratos
     * @param {Object} db - Instancia de base de datos MongoDB
     * 
     * PATRÓN: Dependency Injection - Inyecta dependencia de base de datos
     * PATRÓN: Repository - Inicializa el repositorio con la colección
     * PRINCIPIO SOLID S: Responsabilidad de inicializar el repositorio
     * BUENA PRÁCTICA: Inicialización de repositorio en constructor
     */
    constructor(db) {
        // PATRÓN: Repository - Abstrae el acceso a la colección de contratos
        // PRINCIPIO SOLID S: Responsabilidad de acceder a la colección de contratos
        this.collection = db.collection('contratos');
        // PATRÓN: Dependency Injection - Inyecta dependencia de base de datos
        // PRINCIPIO SOLID S: Responsabilidad de mantener referencia a la base de datos
        this.db = db;
    }

    /**
     * Crea un nuevo contrato
     * @param {Contrato} contrato - Instancia de Contrato a crear
     * @returns {Promise<ObjectId>} ID del contrato creado
     * @throws {Error} Si la validación falla o hay error en la inserción
     * 
     * PATRÓN: Template Method - Define el flujo estándar de creación
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Validation Pattern - Valida datos antes de inserción
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de crear contratos
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas validaciones
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para creación
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (Contrato)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de inserción
     * BUENA PRÁCTICA: Validación de datos antes de inserción
     */
    async create(contrato) {
        try {
            // ===== VALIDACIÓN DE INSTANCIA =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que sea instancia de Contrato
            // PRINCIPIO SOLID S: Responsabilidad de validar el tipo de dato
            if (!(contrato instanceof Contrato)) {
                throw new Error('El parámetro debe ser una instancia de Contrato');
            }

            // ===== VERIFICACIÓN DE UNICIDAD =====
            // PATRÓN: Guard Clause - Validación temprana para evitar duplicados
            // PATRÓN: Validation Pattern - Valida unicidad de contrato activo
            // PRINCIPIO SOLID S: Responsabilidad de verificar unicidad
            const contratoExistente = await this.collection.findOne({
                clienteId: contrato.clienteId,
                planId: contrato.planId,
                estado: 'vigente'
            });

            if (contratoExistente) {
                throw new Error('Ya existe un contrato activo para este cliente y plan');
            }

            // ===== CONVERSIÓN A OBJETO MONGODB =====
            // PATRÓN: Data Transfer Object (DTO) - Convierte a formato MongoDB
            // PATRÓN: Mapper - Mapea entre modelo de dominio y formato de base de datos
            // PRINCIPIO SOLID S: Responsabilidad de convertir a formato de base de datos
            const contratoDoc = contrato.toMongoObject();
            
            // ===== INSERCIÓN EN BASE DE DATOS =====
            // PATRÓN: Repository - Abstrae la operación de inserción
            // PATRÓN: Data Transfer Object (DTO) - Retorna resultado estructurado
            // PRINCIPIO SOLID S: Responsabilidad de insertar en base de datos
            const result = await this.collection.insertOne(contratoDoc);
            return result.insertedId;
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al crear contrato: ${error.message}`);
        }
    }

    /**
     * Obtiene un contrato por su ID
     * @param {string|ObjectId} id - ID del contrato
     * @returns {Promise<Contrato|null>} Contrato encontrado o null
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
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (Contrato)
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
                throw new Error('ID del contrato no es válido');
            }

            // ===== BÚSQUEDA EN BASE DE DATOS =====
            // PATRÓN: Repository - Abstrae la operación de búsqueda
            // PATRÓN: Data Transfer Object (DTO) - Retorna resultado estructurado
            // PRINCIPIO SOLID S: Responsabilidad de buscar en base de datos
            const contratoDoc = await this.collection.findOne({ _id: new ObjectId(id) });
            
            // ===== VERIFICACIÓN DE EXISTENCIA =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PRINCIPIO SOLID S: Responsabilidad de verificar existencia
            if (!contratoDoc) {
                return null;
            }

            // ===== CONVERSIÓN A MODELO DE DOMINIO =====
            // PATRÓN: Mapper - Mapea entre formato de base de datos y modelo de dominio
            // PATRÓN: Data Transfer Object (DTO) - Convierte a modelo de dominio
            // PRINCIPIO SOLID S: Responsabilidad de convertir a modelo de dominio
            return Contrato.fromMongoObject(contratoDoc);
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener contrato: ${error.message}`);
        }
    }

    /**
     * Obtiene todos los contratos con filtro opcional
     * @param {Object} filter - Filtro de búsqueda
     * @param {Object} options - Opciones de consulta (limit, skip, sort)
     * @returns {Promise<Contrato[]>} Array de contratos
     * 
     * PATRÓN: Template Method - Define el flujo estándar de obtención de todos los contratos
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Query Object - Proporciona filtros y opciones de búsqueda
     * PATRÓN: Builder - Construye consulta paso a paso
     * PATRÓN: Mapper - Mapea entre formato de base de datos y modelo de dominio
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener todos los contratos
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas opciones
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para obtener todos
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (Contrato)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Consulta eficiente con filtros y opciones
     */
    async getAll(filter = {}, options = {}) {
        try {
            // ===== DESESTRUCTURACIÓN DE OPCIONES =====
            // PATRÓN: Strategy - Estrategia de opciones de consulta
            // PRINCIPIO SOLID S: Responsabilidad de configurar opciones
            const { limit = 0, skip = 0, sort = { fechaInicio: -1 } } = options;
            
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
            const contratosDocs = await query.toArray();
            
            // ===== CONVERSIÓN A MODELOS DE DOMINIO =====
            // PATRÓN: Mapper - Mapea entre formato de base de datos y modelo de dominio
            // PATRÓN: Data Transfer Object (DTO) - Convierte a modelos de dominio
            // PRINCIPIO SOLID S: Responsabilidad de convertir a modelos de dominio
            return contratosDocs.map(doc => {
                // ===== CREACIÓN DE INSTANCIA SIN VALIDACIONES =====
                // PATRÓN: Factory - Crea instancia de Contrato sin validaciones
                // PATRÓN: Data Transfer Object (DTO) - Convierte a modelo de dominio
                // PRINCIPIO SOLID S: Responsabilidad de crear instancia sin validaciones
                return new Contrato({
                    contratoId: doc._id,
                    clienteId: doc.clienteId,
                    planId: doc.planId,
                    condiciones: doc.condiciones,
                    duracionMeses: doc.duracionMeses,
                    precio: doc.precio,
                    fechaInicio: doc.fechaInicio,
                    fechaFin: doc.fechaFin,
                    estado: doc.estado,
                    skipValidation: true
                });
            });
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener contratos: ${error.message}`);
        }
    }

    /**
     * Obtiene contratos por cliente
     * @param {string} clienteId - ID del cliente
     * @returns {Promise<Array>} Lista de contratos del cliente
     * @throws {Error} Si el ID no es válido o hay error en la consulta
     * 
     * PATRÓN: Template Method - Define el flujo estándar de obtención por cliente
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Query Object - Proporciona filtros de búsqueda
     * PATRÓN: Validation Pattern - Valida ID antes de operación
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener por cliente
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para obtener por cliente
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (Contrato)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Validación de ID antes de operación
     */
    async getByClient(clienteId) {
        try {
            // ===== VALIDACIÓN DE ID =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que el ID sea válido
            // PRINCIPIO SOLID S: Responsabilidad de validar el ID
            if (!ObjectId.isValid(clienteId)) {
                throw new Error('ID del cliente no es válido');
            }

            // ===== BÚSQUEDA EN BASE DE DATOS =====
            // PATRÓN: Repository - Abstrae la operación de búsqueda
            // PATRÓN: Query Object - Proporciona filtro de cliente
            // PRINCIPIO SOLID S: Responsabilidad de buscar en base de datos
            const contratosDocs = await this.collection.find({ 
                clienteId: new ObjectId(clienteId) 
            }).sort({ fechaInicio: -1 }).toArray();

            // ===== CONVERSIÓN A MODELOS DE DOMINIO =====
            // PATRÓN: Mapper - Mapea entre formato de base de datos y modelo de dominio
            // PATRÓN: Data Transfer Object (DTO) - Convierte a modelos de dominio
            // PRINCIPIO SOLID S: Responsabilidad de convertir a modelos de dominio
            return contratosDocs.map(doc => {
                // ===== CREACIÓN DE INSTANCIA SIN VALIDACIONES =====
                // PATRÓN: Factory - Crea instancia de Contrato sin validaciones
                // PATRÓN: Data Transfer Object (DTO) - Convierte a modelo de dominio
                // PRINCIPIO SOLID S: Responsabilidad de crear instancia sin validaciones
                return new Contrato({
                    contratoId: doc._id,
                    clienteId: doc.clienteId,
                    planId: doc.planId,
                    condiciones: doc.condiciones,
                    duracionMeses: doc.duracionMeses,
                    precio: doc.precio,
                    fechaInicio: doc.fechaInicio,
                    fechaFin: doc.fechaFin,
                    estado: doc.estado,
                    skipValidation: true
                });
            });
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener contratos del cliente: ${error.message}`);
        }
    }

    /**
     * Actualiza un contrato existente
     * @param {string|ObjectId} id - ID del contrato a actualizar
     * @param {Object} updatedData - Datos actualizados
     * @returns {Promise<boolean>} True si se actualizó correctamente
     * @throws {Error} Si el ID no es válido o hay error en la actualización
     * 
     * PATRÓN: Template Method - Define el flujo estándar de actualización
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Validation Pattern - Valida ID antes de actualización
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de actualizar contratos
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
                throw new Error('ID del contrato no es válido');
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
            throw new Error(`Error al actualizar contrato: ${error.message}`);
        }
    }

    /**
     * Elimina un contrato por su ID
     * @param {string|ObjectId} id - ID del contrato a eliminar
     * @returns {Promise<boolean>} True si se eliminó correctamente
     * @throws {Error} Si el ID no es válido o hay dependencias
     * 
     * PATRÓN: Template Method - Define el flujo estándar de eliminación
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Validation Pattern - Valida estado antes de eliminación
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de eliminar contratos
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas validaciones
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para eliminación
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (collection)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de eliminación
     * BUENA PRÁCTICA: Validación de estado antes de eliminación
     */
    async delete(id) {
        try {
            // ===== VALIDACIÓN DE ID =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que el ID sea válido
            // PRINCIPIO SOLID S: Responsabilidad de validar el ID
            if (!ObjectId.isValid(id)) {
                throw new Error('ID del contrato no es válido');
            }

            // ===== VERIFICACIÓN DE ESTADO =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida estado del contrato
            // PRINCIPIO SOLID S: Responsabilidad de verificar estado
            const contrato = await this.getById(id);
            if (contrato && contrato.estaVigente()) {
                throw new Error('No se puede eliminar un contrato vigente');
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
            throw new Error(`Error al eliminar contrato: ${error.message}`);
        }
    }

    /**
     * Obtiene contratos activos por cliente
     * @param {string|ObjectId} clienteId - ID del cliente
     * @returns {Promise<Contrato[]>} Array de contratos activos del cliente
     * 
     * PATRÓN: Template Method - Define el flujo estándar de obtención de contratos activos
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Query Object - Proporciona filtros de búsqueda
     * PATRÓN: Validation Pattern - Valida ID antes de operación
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener contratos activos
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para contratos activos
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (getAll)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Validación de ID antes de operación
     */
    async getActiveContractsByClient(clienteId) {
        try {
            // ===== VALIDACIÓN DE ID =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que el ID sea válido
            // PRINCIPIO SOLID S: Responsabilidad de validar el ID
            if (!ObjectId.isValid(clienteId)) {
                throw new Error('ID del cliente no es válido');
            }

            // ===== DELEGACIÓN A MÉTODO GENERAL =====
            // PATRÓN: Template Method - Delega a método general con filtro específico
            // PATRÓN: Query Object - Proporciona filtro de contratos activos
            // PRINCIPIO SOLID S: Responsabilidad de obtener contratos activos
            return await this.getAll({
                clienteId: new ObjectId(clienteId),
                estado: 'vigente'
            });
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener contratos activos del cliente: ${error.message}`);
        }
    }

    /**
     * Cancela un contrato y maneja rollback si aplica
     * @param {string|ObjectId} id - ID del contrato a cancelar
     * @returns {Promise<boolean>} True si se canceló correctamente
     * @throws {Error} Si hay error en el rollback
     * 
     * PATRÓN: Template Method - Define el flujo estándar de cancelación
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Validation Pattern - Valida estado antes de cancelación
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de cancelar contratos
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas validaciones
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para cancelación
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (collection)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de actualización
     * BUENA PRÁCTICA: Validación de estado antes de cancelación
     */
    async cancelContract(id) {
        try {
            // ===== VALIDACIÓN DE ID =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que el ID sea válido
            // PRINCIPIO SOLID S: Responsabilidad de validar el ID
            if (!ObjectId.isValid(id)) {
                throw new Error('ID del contrato no es válido');
            }

            // ===== OBTENCIÓN DEL CONTRATO =====
            // PATRÓN: Repository - Abstrae la operación de búsqueda
            // PRINCIPIO SOLID S: Responsabilidad de obtener contrato
            const contrato = await this.getById(id);
            if (!contrato) {
                throw new Error('Contrato no encontrado');
            }

            // ===== VERIFICACIÓN DE ESTADO =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida estado del contrato
            // PRINCIPIO SOLID S: Responsabilidad de verificar estado
            if (contrato.estaCancelado()) {
                throw new Error('El contrato ya está cancelado');
            }

            // ===== ACTUALIZACIÓN DE ESTADO =====
            // PATRÓN: Repository - Abstrae la operación de actualización
            // PATRÓN: Data Transfer Object (DTO) - Retorna resultado estructurado
            // PRINCIPIO SOLID S: Responsabilidad de actualizar estado
            const result = await this.collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: { estado: 'cancelado' } }
            );

            // ===== VERIFICACIÓN DE RESULTADO =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PRINCIPIO SOLID S: Responsabilidad de verificar resultado
            if (result.modifiedCount === 0) {
                throw new Error('No se pudo cancelar el contrato');
            }

            // ===== RETORNO DE RESULTADO =====
            // PATRÓN: Data Transfer Object (DTO) - Retorna resultado estructurado
            // PRINCIPIO SOLID S: Responsabilidad de retornar resultado
            return true;
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al cancelar contrato: ${error.message}`);
        }
    }

    /**
     * Obtiene contratos por rango de fechas
     * @param {Date} fechaInicio - Fecha de inicio
     * @param {Date} fechaFin - Fecha de fin
     * @param {string} estado - Estado del contrato (opcional)
     * @returns {Promise<Contrato[]>} Array de contratos en el rango
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
    async getContractsByDateRange(fechaInicio, fechaFin, estado = null) {
        try {
            // ===== VALIDACIÓN DE FECHAS =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que las fechas sean válidas
            // PRINCIPIO SOLID S: Responsabilidad de validar las fechas
            if (!(fechaInicio instanceof Date) || !(fechaFin instanceof Date)) {
                throw new Error('Las fechas deben ser objetos Date válidos');
            }

            // ===== CONSTRUCCIÓN DE FILTRO =====
            // PATRÓN: Query Object - Proporciona filtro de rango de fechas
            // PRINCIPIO SOLID S: Responsabilidad de construir filtro
            const filter = {
                fechaInicio: {
                    $gte: fechaInicio,
                    $lte: fechaFin
                }
            };

            // ===== APLICACIÓN DE FILTRO DE ESTADO =====
            // PATRÓN: Strategy - Estrategia de filtro de estado
            // PRINCIPIO SOLID S: Responsabilidad de aplicar filtro de estado
            if (estado) {
                filter.estado = estado;
            }

            // ===== DELEGACIÓN A MÉTODO GENERAL =====
            // PATRÓN: Template Method - Delega a método general con filtro específico
            // PRINCIPIO SOLID S: Responsabilidad de obtener contratos por rango
            return await this.getAll(filter);
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener contratos por rango de fechas: ${error.message}`);
        }
    }

    /**
     * Obtiene contratos próximos a vencer
     * @param {number} dias - Días hacia adelante para verificar
     * @returns {Promise<Contrato[]>} Array de contratos próximos a vencer
     * 
     * PATRÓN: Template Method - Define el flujo estándar de obtención de contratos próximos a vencer
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Query Object - Proporciona filtros de búsqueda
     * PATRÓN: Validation Pattern - Valida días antes de operación
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener contratos próximos a vencer
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para contratos próximos a vencer
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (getAll)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Validación de días antes de operación
     */
    async getContractsNearExpiration(dias = 30) {
        try {
            // ===== VALIDACIÓN DE DÍAS =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que los días sean válidos
            // PRINCIPIO SOLID S: Responsabilidad de validar los días
            if (typeof dias !== 'number' || dias < 0) {
                throw new Error('Días debe ser un número positivo');
            }

            // ===== CÁLCULO DE FECHA LÍMITE =====
            // PATRÓN: Strategy - Estrategia de cálculo de fecha
            // PRINCIPIO SOLID S: Responsabilidad de calcular fecha límite
            const fechaLimite = new Date();
            fechaLimite.setDate(fechaLimite.getDate() + dias);

            // ===== DELEGACIÓN A MÉTODO GENERAL =====
            // PATRÓN: Template Method - Delega a método general con filtro específico
            // PATRÓN: Query Object - Proporciona filtro de contratos próximos a vencer
            // PRINCIPIO SOLID S: Responsabilidad de obtener contratos próximos a vencer
            return await this.getAll({
                estado: 'vigente',
                fechaFin: {
                    $lte: fechaLimite,
                    $gte: new Date()
                }
            });
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener contratos próximos a vencer: ${error.message}`);
        }
    }

    /**
     * Obtiene contratos vencidos
     * @returns {Promise<Contrato[]>} Array de contratos vencidos
     * 
     * PATRÓN: Template Method - Define el flujo estándar de obtención de contratos vencidos
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Query Object - Proporciona filtros de búsqueda
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener contratos vencidos
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para contratos vencidos
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (getAll)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Filtrado eficiente de contratos vencidos
     */
    async getExpiredContracts() {
        try {
            // ===== DELEGACIÓN A MÉTODO GENERAL =====
            // PATRÓN: Template Method - Delega a método general con filtro específico
            // PATRÓN: Query Object - Proporciona filtro de contratos vencidos
            // PRINCIPIO SOLID S: Responsabilidad de obtener contratos vencidos
            return await this.getAll({
                estado: 'vigente',
                fechaFin: { $lt: new Date() }
            });
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener contratos vencidos: ${error.message}`);
        }
    }

    /**
     * Obtiene contratos por estado
     * @param {string} estado - Estado del contrato
     * @returns {Promise<Contrato[]>} Array de contratos del estado especificado
     * 
     * PATRÓN: Template Method - Define el flujo estándar de obtención por estado
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Query Object - Proporciona filtros de búsqueda
     * PATRÓN: Validation Pattern - Valida estado antes de operación
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener por estado
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para estado
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (getAll)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Validación de estado antes de operación
     */
    async getContractsByState(estado) {
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
            // PATRÓN: Validation Pattern - Valida que el estado sea uno de los permitidos
            // PRINCIPIO SOLID S: Responsabilidad de validar estados válidos
            const estadosValidos = ['vigente', 'cancelado', 'finalizado'];
            if (!estadosValidos.includes(estado.toLowerCase())) {
                throw new Error(`Estado debe ser uno de: ${estadosValidos.join(', ')}`);
            }

            // ===== DELEGACIÓN A MÉTODO GENERAL =====
            // PATRÓN: Template Method - Delega a método general con filtro específico
            // PATRÓN: Query Object - Proporciona filtro de estado
            // PRINCIPIO SOLID S: Responsabilidad de obtener contratos por estado
            return await this.getAll({ estado: estado.toLowerCase() });
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener contratos por estado: ${error.message}`);
        }
    }

    /**
     * Obtiene contratos por rango de precios
     * @param {number} precioMin - Precio mínimo
     * @param {number} precioMax - Precio máximo
     * @returns {Promise<Contrato[]>} Array de contratos en el rango de precios
     * 
     * PATRÓN: Template Method - Define el flujo estándar de obtención por rango de precios
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Query Object - Proporciona filtros de búsqueda
     * PATRÓN: Validation Pattern - Valida precios antes de operación
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener por rango de precios
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para rango de precios
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (getAll)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Validación de precios antes de operación
     */
    async getContractsByPriceRange(precioMin, precioMax) {
        try {
            // ===== VALIDACIÓN DE TIPOS =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que los precios sean números
            // PRINCIPIO SOLID S: Responsabilidad de validar los tipos
            if (typeof precioMin !== 'number' || typeof precioMax !== 'number') {
                throw new Error('Los precios deben ser números');
            }

            // ===== VALIDACIÓN DE VALORES NEGATIVOS =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que los precios no sean negativos
            // PRINCIPIO SOLID S: Responsabilidad de validar valores negativos
            if (precioMin < 0 || precioMax < 0) {
                throw new Error('Los precios no pueden ser negativos');
            }

            // ===== VALIDACIÓN DE RANGO =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que el rango sea válido
            // PRINCIPIO SOLID S: Responsabilidad de validar el rango
            if (precioMin > precioMax) {
                throw new Error('Precio mínimo no puede ser mayor al máximo');
            }

            // ===== DELEGACIÓN A MÉTODO GENERAL =====
            // PATRÓN: Template Method - Delega a método general con filtro específico
            // PATRÓN: Query Object - Proporciona filtro de rango de precios
            // PRINCIPIO SOLID S: Responsabilidad de obtener contratos por rango de precios
            return await this.getAll({
                precio: {
                    $gte: precioMin,
                    $lte: precioMax
                }
            });
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener contratos por rango de precios: ${error.message}`);
        }
    }

    /**
     * Obtiene estadísticas de contratos
     * @returns {Promise<Object>} Estadísticas de contratos
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
    async getContractStats() {
        try {
            // ===== CONTEO DE CONTRATOS TOTALES =====
            // PATRÓN: Repository - Abstrae la operación de conteo
            // PATRÓN: Query Object - Proporciona filtros de búsqueda
            // PRINCIPIO SOLID S: Responsabilidad de contar contratos totales
            const totalContratos = await this.collection.countDocuments();
            
            // ===== CONTEO DE CONTRATOS VIGENTES =====
            // PATRÓN: Repository - Abstrae la operación de conteo
            // PATRÓN: Query Object - Proporciona filtro de contratos vigentes
            // PRINCIPIO SOLID S: Responsabilidad de contar contratos vigentes
            const contratosVigentes = await this.collection.countDocuments({ estado: 'vigente' });
            
            // ===== CONTEO DE CONTRATOS CANCELADOS =====
            // PATRÓN: Repository - Abstrae la operación de conteo
            // PATRÓN: Query Object - Proporciona filtro de contratos cancelados
            // PRINCIPIO SOLID S: Responsabilidad de contar contratos cancelados
            const contratosCancelados = await this.collection.countDocuments({ estado: 'cancelado' });
            
            // ===== CONTEO DE CONTRATOS FINALIZADOS =====
            // PATRÓN: Repository - Abstrae la operación de conteo
            // PATRÓN: Query Object - Proporciona filtro de contratos finalizados
            // PRINCIPIO SOLID S: Responsabilidad de contar contratos finalizados
            const contratosFinalizados = await this.collection.countDocuments({ estado: 'finalizado' });

            // ===== PIPELINE DE AGREGACIÓN - INGRESOS POR ESTADO =====
            // PATRÓN: Aggregator - Agrega datos de múltiples fuentes
            // PATRÓN: Query Object - Proporciona pipeline de agregación
            // PRINCIPIO SOLID S: Responsabilidad de crear pipeline de ingresos por estado
            const ingresosPorEstado = await this.collection.aggregate([
                {
                    $group: {
                        _id: "$estado",
                        totalIngresos: { $sum: "$precio" },
                        cantidad: { $sum: 1 }
                    }
                }
            ]).toArray();

            // ===== PIPELINE DE AGREGACIÓN - CONTRATOS POR MES =====
            // PATRÓN: Aggregator - Agrega datos de múltiples fuentes
            // PATRÓN: Query Object - Proporciona pipeline de agregación
            // PRINCIPIO SOLID S: Responsabilidad de crear pipeline de contratos por mes
            const contratosPorMes = await this.collection.aggregate([
                {
                    $group: {
                        _id: {
                            year: { $year: "$fechaInicio" },
                            month: { $month: "$fechaInicio" }
                        },
                        count: { $sum: 1 },
                        ingresos: { $sum: "$precio" }
                    }
                },
                { $sort: { "_id.year": -1, "_id.month": -1 } },
                { $limit: 12 }
            ]).toArray();

            // ===== PIPELINE DE AGREGACIÓN - PROMEDIOS =====
            // PATRÓN: Aggregator - Agrega datos de múltiples fuentes
            // PATRÓN: Query Object - Proporciona pipeline de agregación
            // PRINCIPIO SOLID S: Responsabilidad de crear pipeline de promedios
            const promedios = await this.collection.aggregate([
                {
                    $group: {
                        _id: null,
                        duracionPromedio: { $avg: "$duracionMeses" },
                        precioPromedio: { $avg: "$precio" }
                    }
                }
            ]).toArray();

            // ===== CONSTRUCCIÓN DE ESTADÍSTICAS =====
            // PATRÓN: Data Transfer Object (DTO) - Proporciona estadísticas estructuradas
            // PATRÓN: Aggregator - Agrega datos de múltiples fuentes
            // PRINCIPIO SOLID S: Responsabilidad de construir estadísticas
            return {
                totalContratos,
                contratosVigentes,
                contratosCancelados,
                contratosFinalizados,
                ingresosPorEstado,
                contratosPorMes,
                promedios: promedios.length > 0 ? promedios[0] : {
                    duracionPromedio: 0,
                    precioPromedio: 0
                }
            };
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener estadísticas de contratos: ${error.message}`);
        }
    }

    /**
     * Extiende un contrato existente
     * @param {string|ObjectId} id - ID del contrato
     * @param {number} mesesAdicionales - Meses a agregar
     * @returns {Promise<boolean>} True si se extendió correctamente
     * 
     * PATRÓN: Template Method - Define el flujo estándar de extensión
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Validation Pattern - Valida datos antes de extensión
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de extender contratos
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas validaciones
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para extensión
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (collection)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de actualización
     * BUENA PRÁCTICA: Validación de datos antes de extensión
     */
    async extendContract(id, mesesAdicionales) {
        try {
            // ===== VALIDACIÓN DE ID =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que el ID sea válido
            // PRINCIPIO SOLID S: Responsabilidad de validar el ID
            if (!ObjectId.isValid(id)) {
                throw new Error('ID del contrato no es válido');
            }

            // ===== VALIDACIÓN DE MESES ADICIONALES =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que los meses sean válidos
            // PRINCIPIO SOLID S: Responsabilidad de validar los meses
            if (typeof mesesAdicionales !== 'number' || mesesAdicionales <= 0) {
                throw new Error('Meses adicionales debe ser un número positivo');
            }

            // ===== OBTENCIÓN DEL CONTRATO =====
            // PATRÓN: Repository - Abstrae la operación de búsqueda
            // PRINCIPIO SOLID S: Responsabilidad de obtener contrato
            const contrato = await this.getById(id);
            if (!contrato) {
                throw new Error('Contrato no encontrado');
            }

            // ===== VERIFICACIÓN DE ESTADO =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida estado del contrato
            // PRINCIPIO SOLID S: Responsabilidad de verificar estado
            if (!contrato.estaVigente()) {
                throw new Error('Solo se pueden extender contratos vigentes');
            }

            // ===== CÁLCULO DE NUEVA FECHA DE FIN =====
            // PATRÓN: Strategy - Estrategia de cálculo de fecha
            // PRINCIPIO SOLID S: Responsabilidad de calcular nueva fecha
            const nuevaFechaFin = new Date(contrato.fechaFin);
            nuevaFechaFin.setMonth(nuevaFechaFin.getMonth() + mesesAdicionales);

            // ===== ACTUALIZACIÓN EN BASE DE DATOS =====
            // PATRÓN: Repository - Abstrae la operación de actualización
            // PATRÓN: Data Transfer Object (DTO) - Retorna resultado estructurado
            // PRINCIPIO SOLID S: Responsabilidad de actualizar en base de datos
            const result = await this.collection.updateOne(
                { _id: new ObjectId(id) },
                {
                    $set: {
                        duracionMeses: contrato.duracionMeses + mesesAdicionales,
                        fechaFin: nuevaFechaFin
                    }
                }
            );

            // ===== RETORNO DE RESULTADO =====
            // PATRÓN: Data Transfer Object (DTO) - Retorna resultado estructurado
            // PRINCIPIO SOLID S: Responsabilidad de retornar resultado
            return result.modifiedCount > 0;
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al extender contrato: ${error.message}`);
        }
    }

    /**
     * Finaliza un contrato
     * @param {string|ObjectId} id - ID del contrato
     * @returns {Promise<boolean>} True si se finalizó correctamente
     * 
     * PATRÓN: Template Method - Define el flujo estándar de finalización
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Validation Pattern - Valida estado antes de finalización
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de finalizar contratos
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas validaciones
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para finalización
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (collection)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de actualización
     * BUENA PRÁCTICA: Validación de estado antes de finalización
     */
    async finalizeContract(id) {
        try {
            // ===== VALIDACIÓN DE ID =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que el ID sea válido
            // PRINCIPIO SOLID S: Responsabilidad de validar el ID
            if (!ObjectId.isValid(id)) {
                throw new Error('ID del contrato no es válido');
            }

            // ===== OBTENCIÓN DEL CONTRATO =====
            // PATRÓN: Repository - Abstrae la operación de búsqueda
            // PRINCIPIO SOLID S: Responsabilidad de obtener contrato
            const contrato = await this.getById(id);
            if (!contrato) {
                throw new Error('Contrato no encontrado');
            }

            // ===== VERIFICACIÓN DE ESTADO =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida estado del contrato
            // PRINCIPIO SOLID S: Responsabilidad de verificar estado
            if (!contrato.estaVigente()) {
                throw new Error('Solo se pueden finalizar contratos vigentes');
            }

            // ===== ACTUALIZACIÓN DE ESTADO =====
            // PATRÓN: Repository - Abstrae la operación de actualización
            // PATRÓN: Data Transfer Object (DTO) - Retorna resultado estructurado
            // PRINCIPIO SOLID S: Responsabilidad de actualizar estado
            const result = await this.collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: { estado: 'finalizado' } }
            );

            // ===== RETORNO DE RESULTADO =====
            // PATRÓN: Data Transfer Object (DTO) - Retorna resultado estructurado
            // PRINCIPIO SOLID S: Responsabilidad de retornar resultado
            return result.modifiedCount > 0;
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al finalizar contrato: ${error.message}`);
        }
    }

    /**
     * Obtiene contratos por cliente y plan
     * @param {string|ObjectId} clienteId - ID del cliente
     * @param {string|ObjectId} planId - ID del plan
     * @returns {Promise<Contrato[]>} Array de contratos del cliente y plan
     * 
     * PATRÓN: Template Method - Define el flujo estándar de obtención por cliente y plan
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Query Object - Proporciona filtros de búsqueda
     * PATRÓN: Validation Pattern - Valida IDs antes de operación
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener por cliente y plan
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para cliente y plan
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (getAll)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Validación de IDs antes de operación
     */
    async getContractsByClientAndPlan(clienteId, planId) {
        try {
            // ===== VALIDACIÓN DE IDs =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que los IDs sean válidos
            // PRINCIPIO SOLID S: Responsabilidad de validar los IDs
            if (!ObjectId.isValid(clienteId) || !ObjectId.isValid(planId)) {
                throw new Error('IDs deben ser ObjectIds válidos');
            }

            // ===== DELEGACIÓN A MÉTODO GENERAL =====
            // PATRÓN: Template Method - Delega a método general con filtro específico
            // PATRÓN: Query Object - Proporciona filtro de cliente y plan
            // PRINCIPIO SOLID S: Responsabilidad de obtener contratos por cliente y plan
            return await this.getAll({
                clienteId: new ObjectId(clienteId),
                planId: new ObjectId(planId)
            });
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener contratos por cliente y plan: ${error.message}`);
        }
    }

    /**
     * Obtiene contratos con filtros opcionales
     * @param {Object} filtros - Filtros de búsqueda
     * @param {Object} opciones - Opciones de paginación
     * @returns {Promise<Object[]>} Array de contratos
     * 
     * PATRÓN: Template Method - Define el flujo estándar de obtención con filtros
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Query Object - Proporciona filtros de búsqueda
     * PATRÓN: Builder - Construye consulta paso a paso
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener con filtros
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para filtros
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (collection)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Consulta eficiente con filtros y opciones
     */
    async getContracts(filtros = {}, opciones = {}) {
        try {
            // ===== CONSTRUCCIÓN DE FILTROS =====
            // PATRÓN: Query Object - Proporciona filtros de búsqueda
            // PRINCIPIO SOLID S: Responsabilidad de construir filtros
            let query = {};
            
            // ===== APLICACIÓN DE FILTROS =====
            // PATRÓN: Strategy - Estrategia de filtros
            // PRINCIPIO SOLID S: Responsabilidad de aplicar filtros
            if (filtros.estado) {
                query.estado = filtros.estado;
            }
            if (filtros.clienteId) {
                query.clienteId = new ObjectId(filtros.clienteId);
            }
            if (filtros.planId) {
                query.planId = new ObjectId(filtros.planId);
            }
            if (filtros.fechaInicio || filtros.fechaFin) {
                query.fechaInicio = {};
                if (filtros.fechaInicio) {
                    query.fechaInicio.$gte = new Date(filtros.fechaInicio);
                }
                if (filtros.fechaFin) {
                    query.fechaInicio.$lte = new Date(filtros.fechaFin);
                }
            }

            // ===== CONSTRUCCIÓN DE CONSULTA =====
            // PATRÓN: Builder - Construye consulta paso a paso
            // PRINCIPIO SOLID S: Responsabilidad de construir consulta
            let cursor = this.collection.find(query);
            
            // ===== APLICACIÓN DE OPCIONES =====
            // PATRÓN: Strategy - Estrategia de opciones
            // PRINCIPIO SOLID S: Responsabilidad de aplicar opciones
            if (opciones.limit) {
                cursor = cursor.limit(opciones.limit);
            }
            if (opciones.skip) {
                cursor = cursor.skip(opciones.skip);
            }
            if (opciones.sort) {
                cursor = cursor.sort(opciones.sort);
            }

            // ===== EJECUCIÓN DE CONSULTA =====
            // PATRÓN: Repository - Abstrae la operación de búsqueda
            // PRINCIPIO SOLID S: Responsabilidad de ejecutar consulta
            return await cursor.toArray();
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener contratos: ${error.message}`);
        }
    }

    /**
     * Cuenta contratos con filtros opcionales
     * @param {Object} filtros - Filtros de búsqueda
     * @returns {Promise<number>} Número de contratos
     * 
     * PATRÓN: Template Method - Define el flujo estándar de conteo con filtros
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Query Object - Proporciona filtros de búsqueda
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de contar con filtros
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para conteo
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (collection)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de conteo
     * BUENA PRÁCTICA: Conteo eficiente con filtros
     */
    async countContracts(filtros = {}) {
        try {
            // ===== CONSTRUCCIÓN DE FILTROS =====
            // PATRÓN: Query Object - Proporciona filtros de búsqueda
            // PRINCIPIO SOLID S: Responsabilidad de construir filtros
            let query = {};
            
            // ===== APLICACIÓN DE FILTROS =====
            // PATRÓN: Strategy - Estrategia de filtros
            // PRINCIPIO SOLID S: Responsabilidad de aplicar filtros
            if (filtros.estado) {
                query.estado = filtros.estado;
            }
            if (filtros.clienteId) {
                query.clienteId = new ObjectId(filtros.clienteId);
            }
            if (filtros.planId) {
                query.planId = new ObjectId(filtros.planId);
            }
            if (filtros.fechaInicio || filtros.fechaFin) {
                query.fechaInicio = {};
                if (filtros.fechaInicio) {
                    query.fechaInicio.$gte = new Date(filtros.fechaInicio);
                }
                if (filtros.fechaFin) {
                    query.fechaInicio.$lte = new Date(filtros.fechaFin);
                }
            }

            // ===== EJECUCIÓN DE CONTEO =====
            // PATRÓN: Repository - Abstrae la operación de conteo
            // PRINCIPIO SOLID S: Responsabilidad de ejecutar conteo
            return await this.collection.countDocuments(query);
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al contar contratos: ${error.message}`);
        }
    }

    /**
     * Busca contratos por término de búsqueda
     * @param {string} searchTerm - Término de búsqueda
     * @returns {Promise<Array>} Lista de contratos encontrados
     * 
     * PATRÓN: Template Method - Define el flujo estándar de búsqueda
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Query Object - Proporciona filtros de búsqueda
     * PATRÓN: Validation Pattern - Valida término de búsqueda
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PATRÓN: Mapper - Mapea entre formatos de datos
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de buscar contratos
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para búsqueda
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (collection)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Búsqueda eficiente con expresiones regulares
     */
    async search(searchTerm) {
        try {
            // ===== VALIDACIÓN DE TÉRMINO DE BÚSQUEDA =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que el término sea válido
            // PRINCIPIO SOLID S: Responsabilidad de validar el término
            if (!searchTerm || typeof searchTerm !== 'string') {
                throw new Error('Término de búsqueda es requerido');
            }

            // ===== CREACIÓN DE EXPRESIÓN REGULAR =====
            // PATRÓN: Strategy - Estrategia de búsqueda con regex
            // PRINCIPIO SOLID S: Responsabilidad de crear expresión regular
            const regex = new RegExp(searchTerm, 'i');
            
            // ===== BÚSQUEDA EN BASE DE DATOS =====
            // PATRÓN: Repository - Abstrae la operación de búsqueda
            // PATRÓN: Query Object - Proporciona filtro de búsqueda
            // PRINCIPIO SOLID S: Responsabilidad de buscar en base de datos
            const cursor = this.collection.find({
                $or: [
                    { condicionesEspeciales: { $regex: regex } }
                ]
            }).sort({ fechaInicio: -1 });

            // ===== EJECUCIÓN DE CONSULTA =====
            // PATRÓN: Repository - Abstrae la operación de consulta
            // PRINCIPIO SOLID S: Responsabilidad de ejecutar consulta
            const mongoObjs = await cursor.toArray();
            
            // ===== CONVERSIÓN A MODELOS DE DOMINIO =====
            // PATRÓN: Mapper - Mapea entre formato de base de datos y modelo de dominio
            // PATRÓN: Data Transfer Object (DTO) - Convierte a modelos de dominio
            // PRINCIPIO SOLID S: Responsabilidad de convertir a modelos de dominio
            return mongoObjs.map(obj => Contrato.fromMongoObject(obj));
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al buscar contratos: ${error.message}`);
        }
    }
}

module.exports = ContratoRepository;
