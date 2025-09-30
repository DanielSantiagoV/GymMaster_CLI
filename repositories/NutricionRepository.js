// ===== IMPORTS Y DEPENDENCIAS =====
// Importación de ObjectId de MongoDB para manejo de IDs
// PATRÓN: Dependency Injection - Se inyectan las dependencias a través del constructor
// PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (ObjectId) no de implementaciones concretas
const { ObjectId } = require('mongodb'); // Driver de MongoDB para operaciones con ObjectId
// Importación del modelo Nutricion para validaciones y transformaciones
// PATRÓN: Dependency Injection - Se inyectan las dependencias a través del constructor
// PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (Nutricion) no de implementaciones concretas
const { Nutricion } = require('../models'); // Modelo de dominio Nutricion

/**
 * Repositorio Nutrición - Maneja operaciones CRUD para planes nutricionales
 * Implementa patrón Repository para abstraer acceso a datos
 * 
 * PATRÓN: Repository - Abstrae el acceso a datos de planes nutricionales
 * PATRÓN: Data Access Object (DAO) - Proporciona interfaz para operaciones de datos
 * PATRÓN: Facade - Proporciona una interfaz simplificada para operaciones de nutrición
 * PATRÓN: Data Transfer Object (DTO) - Proporciona datos estructurados
 * PATRÓN: Module Pattern - Encapsula la funcionalidad de repositorio
 * PRINCIPIO SOLID S: Responsabilidad Única - Se encarga únicamente de la gestión de datos de nutrición
 * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas operaciones sin modificar código existente
 * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente en todas las operaciones
 * PRINCIPIO SOLID I: Segregación de Interfaces - Métodos específicos para diferentes operaciones
 * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (db, Nutricion) no de implementaciones concretas
 * 
 * NOTA: Este módulo NO maneja transacciones ya que solo proporciona operaciones de datos
 * BUENA PRÁCTICA: Repositorio centralizado para operaciones de nutrición
 */
class NutricionRepository {
    /**
     * Constructor del repositorio de nutrición
     * @param {Object} db - Instancia de base de datos MongoDB
     * 
     * PATRÓN: Dependency Injection - Inyecta dependencia de base de datos
     * PATRÓN: Repository - Inicializa el repositorio con la colección
     * PRINCIPIO SOLID S: Responsabilidad de inicializar el repositorio
     * BUENA PRÁCTICA: Inicialización de repositorio en constructor
     */
    constructor(db) {
        // PATRÓN: Dependency Injection - Inyecta dependencia de base de datos
        // PRINCIPIO SOLID S: Responsabilidad de mantener referencia a la base de datos
        this.db = db;
        // PATRÓN: Repository - Abstrae el acceso a la colección de nutrición
        // PRINCIPIO SOLID S: Responsabilidad de acceder a la colección de nutrición
        this.collection = db.collection('nutricion');
    }

    /**
     * Crea un nuevo plan nutricional
     * @param {Nutricion} nutricion - Plan nutricional a crear
     * @returns {Promise<string>} ID del plan creado
     * 
     * PATRÓN: Template Method - Define el flujo estándar de creación
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Validation Pattern - Valida datos antes de inserción
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de crear planes nutricionales
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas validaciones
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para creación
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (Nutricion)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de inserción
     * BUENA PRÁCTICA: Validación de datos antes de inserción
     */
    async create(nutricion) {
        try {
            // ===== CONVERSIÓN A OBJETO MONGODB =====
            // PATRÓN: Data Transfer Object (DTO) - Convierte a formato MongoDB
            // PATRÓN: Mapper - Mapea entre modelo de dominio y formato de base de datos
            // PRINCIPIO SOLID S: Responsabilidad de convertir a formato de base de datos
            const mongoObj = nutricion.toMongoObject();
            
            // ===== INSERCIÓN EN BASE DE DATOS =====
            // PATRÓN: Repository - Abstrae la operación de inserción
            // PATRÓN: Data Transfer Object (DTO) - Retorna resultado estructurado
            // PRINCIPIO SOLID S: Responsabilidad de insertar en base de datos
            const result = await this.collection.insertOne(mongoObj);
            
            // ===== CONVERSIÓN DE ID A STRING =====
            // PATRÓN: Data Transfer Object (DTO) - Convierte ID a formato string
            // PRINCIPIO SOLID S: Responsabilidad de retornar ID en formato string
            return result.insertedId.toString();
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al crear plan nutricional: ${error.message}`);
        }
    }

    /**
     * Obtiene un plan nutricional por ID
     * @param {string} id - ID del plan
     * @returns {Promise<Nutricion|null>} Plan nutricional o null
     * 
     * PATRÓN: Template Method - Define el flujo estándar de búsqueda por ID
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Validation Pattern - Valida ID antes de búsqueda
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de buscar por ID
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas validaciones
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para búsqueda por ID
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (Nutricion)
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
                throw new Error('ID del plan nutricional no es válido');
            }
            
            // ===== BÚSQUEDA EN BASE DE DATOS =====
            // PATRÓN: Repository - Abstrae la operación de búsqueda
            // PATRÓN: Data Transfer Object (DTO) - Retorna resultado estructurado
            // PRINCIPIO SOLID S: Responsabilidad de buscar en base de datos
            const mongoObj = await this.collection.findOne({ _id: new ObjectId(id) });
            
            // ===== CONVERSIÓN A MODELO DE DOMINIO =====
            // PATRÓN: Mapper - Mapea entre formato de base de datos y modelo de dominio
            // PATRÓN: Data Transfer Object (DTO) - Convierte a modelo de dominio
            // PRINCIPIO SOLID S: Responsabilidad de convertir a modelo de dominio
            return Nutricion.fromMongoObject(mongoObj);
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener plan nutricional: ${error.message}`);
        }
    }

    /**
     * Lista todos los planes nutricionales
     * @param {Object} filtros - Filtros opcionales
     * @returns {Promise<Array>} Lista de planes
     * 
     * PATRÓN: Template Method - Define el flujo estándar de obtención de todos los planes
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Query Object - Proporciona filtros de búsqueda
     * PATRÓN: Builder - Construye consulta paso a paso
     * PATRÓN: Mapper - Mapea entre formato de base de datos y modelo de dominio
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener todos los planes
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas opciones
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para obtener todos
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (Nutricion)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Consulta eficiente con filtros y opciones
     */
    async getAll(filtros = {}) {
        try {
            // ===== CONSTRUCCIÓN DE CONSULTA =====
            // PATRÓN: Builder - Construye consulta paso a paso
            // PATRÓN: Query Object - Proporciona filtros de búsqueda
            // PRINCIPIO SOLID S: Responsabilidad de construir consulta
            const query = this.construirQuery(filtros);
            
            // ===== EJECUCIÓN DE CONSULTA =====
            // PATRÓN: Repository - Abstrae la operación de búsqueda
            // PATRÓN: Strategy - Estrategia de ordenamiento
            // PRINCIPIO SOLID S: Responsabilidad de ejecutar consulta
            const cursor = this.collection.find(query).sort({ fechaCreacion: -1 });
            
            // ===== OBTENCIÓN DE RESULTADOS =====
            // PATRÓN: Repository - Abstrae la operación de consulta
            // PRINCIPIO SOLID S: Responsabilidad de obtener resultados
            const mongoObjs = await cursor.toArray();
            
            // ===== CONVERSIÓN A MODELOS DE DOMINIO =====
            // PATRÓN: Mapper - Mapea entre formato de base de datos y modelo de dominio
            // PATRÓN: Data Transfer Object (DTO) - Convierte a modelos de dominio
            // PRINCIPIO SOLID S: Responsabilidad de convertir a modelos de dominio
            return mongoObjs.map(obj => Nutricion.fromMongoObject(obj));
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al listar planes nutricionales: ${error.message}`);
        }
    }

    /**
     * Actualiza un plan nutricional
     * @param {string} id - ID del plan
     * @param {Object} datos - Datos a actualizar
     * @returns {Promise<boolean>} True si se actualizó
     * 
     * PATRÓN: Template Method - Define el flujo estándar de actualización
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Validation Pattern - Valida datos antes de actualización
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de actualizar planes nutricionales
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas validaciones
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para actualización
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (collection)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de actualización
     * BUENA PRÁCTICA: Validación de datos antes de actualización
     */
    async update(id, datos) {
        try {
            // ===== VALIDACIÓN DE ID =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que el ID sea válido
            // PRINCIPIO SOLID S: Responsabilidad de validar el ID
            if (!ObjectId.isValid(id)) {
                throw new Error('ID del plan nutricional no es válido');
            }
            
            // ===== CONSTRUCCIÓN DE DATOS DE ACTUALIZACIÓN =====
            // PATRÓN: Data Transfer Object (DTO) - Convierte a formato de actualización
            // PATRÓN: Builder - Construye objeto de actualización
            // PRINCIPIO SOLID S: Responsabilidad de construir datos de actualización
            const updateData = {
                ...datos,
                fechaActualizacion: new Date()
            };
            
            // ===== ACTUALIZACIÓN EN BASE DE DATOS =====
            // PATRÓN: Repository - Abstrae la operación de actualización
            // PATRÓN: Data Transfer Object (DTO) - Retorna resultado estructurado
            // PRINCIPIO SOLID S: Responsabilidad de actualizar en base de datos
            const result = await this.collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updateData }
            );
            
            // ===== RETORNO DE RESULTADO =====
            // PATRÓN: Data Transfer Object (DTO) - Retorna resultado estructurado
            // PRINCIPIO SOLID S: Responsabilidad de retornar resultado
            return result.modifiedCount > 0;
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al actualizar plan nutricional: ${error.message}`);
        }
    }

    /**
     * Elimina un plan nutricional
     * @param {string} id - ID del plan
     * @returns {Promise<boolean>} True si se eliminó
     * 
     * PATRÓN: Template Method - Define el flujo estándar de eliminación
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Validation Pattern - Valida ID antes de eliminación
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de eliminar planes nutricionales
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
                throw new Error('ID del plan nutricional no es válido');
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
            throw new Error(`Error al eliminar plan nutricional: ${error.message}`);
        }
    }

    /**
     * Obtiene planes nutricionales por cliente
     * @param {string} clienteId - ID del cliente
     * @returns {Promise<Array>} Lista de planes del cliente
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
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (Nutricion)
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
            // PATRÓN: Strategy - Estrategia de ordenamiento
            // PRINCIPIO SOLID S: Responsabilidad de buscar en base de datos
            const cursor = this.collection.find({ clienteId: new ObjectId(clienteId) })
                .sort({ fechaCreacion: -1 });
            
            // ===== OBTENCIÓN DE RESULTADOS =====
            // PATRÓN: Repository - Abstrae la operación de consulta
            // PRINCIPIO SOLID S: Responsabilidad de obtener resultados
            const mongoObjs = await cursor.toArray();
            
            // ===== CONVERSIÓN A MODELOS DE DOMINIO =====
            // PATRÓN: Mapper - Mapea entre formato de base de datos y modelo de dominio
            // PATRÓN: Data Transfer Object (DTO) - Convierte a modelos de dominio
            // PRINCIPIO SOLID S: Responsabilidad de convertir a modelos de dominio
            return mongoObjs.map(obj => Nutricion.fromMongoObject(obj));
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener planes del cliente: ${error.message}`);
        }
    }

    /**
     * Obtiene planes nutricionales por contrato
     * @param {string} contratoId - ID del contrato
     * @returns {Promise<Array>} Lista de planes del contrato
     * 
     * PATRÓN: Template Method - Define el flujo estándar de obtención por contrato
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Query Object - Proporciona filtros de búsqueda
     * PATRÓN: Validation Pattern - Valida ID antes de operación
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener por contrato
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para obtener por contrato
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (Nutricion)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Validación de ID antes de operación
     */
    async getByContract(contratoId) {
        try {
            // ===== VALIDACIÓN DE ID =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que el ID sea válido
            // PRINCIPIO SOLID S: Responsabilidad de validar el ID
            if (!ObjectId.isValid(contratoId)) {
                throw new Error('ID del contrato no es válido');
            }
            
            // ===== BÚSQUEDA EN BASE DE DATOS =====
            // PATRÓN: Repository - Abstrae la operación de búsqueda
            // PATRÓN: Query Object - Proporciona filtro de contrato
            // PATRÓN: Strategy - Estrategia de ordenamiento
            // PRINCIPIO SOLID S: Responsabilidad de buscar en base de datos
            const cursor = this.collection.find({ contratoId: new ObjectId(contratoId) })
                .sort({ fechaCreacion: -1 });
            
            // ===== OBTENCIÓN DE RESULTADOS =====
            // PATRÓN: Repository - Abstrae la operación de consulta
            // PRINCIPIO SOLID S: Responsabilidad de obtener resultados
            const mongoObjs = await cursor.toArray();
            
            // ===== CONVERSIÓN A MODELOS DE DOMINIO =====
            // PATRÓN: Mapper - Mapea entre formato de base de datos y modelo de dominio
            // PATRÓN: Data Transfer Object (DTO) - Convierte a modelos de dominio
            // PRINCIPIO SOLID S: Responsabilidad de convertir a modelos de dominio
            return mongoObjs.map(obj => Nutricion.fromMongoObject(obj));
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener planes del contrato: ${error.message}`);
        }
    }

    /**
     * Obtiene planes nutricionales por estado
     * @param {string} estado - Estado del plan
     * @returns {Promise<Array>} Lista de planes por estado
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
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (Nutricion)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Validación de estado antes de operación
     */
    async getByStatus(estado) {
        try {
            // ===== VALIDACIÓN DE ESTADO =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que el estado sea válido
            // PRINCIPIO SOLID S: Responsabilidad de validar el estado
            const estadosValidos = ['activo', 'pausado', 'finalizado', 'cancelado'];
            if (!estadosValidos.includes(estado)) {
                throw new Error(`Estado debe ser uno de: ${estadosValidos.join(', ')}`);
            }
            
            // ===== BÚSQUEDA EN BASE DE DATOS =====
            // PATRÓN: Repository - Abstrae la operación de búsqueda
            // PATRÓN: Query Object - Proporciona filtro de estado
            // PATRÓN: Strategy - Estrategia de ordenamiento
            // PRINCIPIO SOLID S: Responsabilidad de buscar en base de datos
            const cursor = this.collection.find({ estado: estado })
                .sort({ fechaCreacion: -1 });
            
            // ===== OBTENCIÓN DE RESULTADOS =====
            // PATRÓN: Repository - Abstrae la operación de consulta
            // PRINCIPIO SOLID S: Responsabilidad de obtener resultados
            const mongoObjs = await cursor.toArray();
            
            // ===== CONVERSIÓN A MODELOS DE DOMINIO =====
            // PATRÓN: Mapper - Mapea entre formato de base de datos y modelo de dominio
            // PATRÓN: Data Transfer Object (DTO) - Convierte a modelos de dominio
            // PRINCIPIO SOLID S: Responsabilidad de convertir a modelos de dominio
            return mongoObjs.map(obj => Nutricion.fromMongoObject(obj));
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener planes por estado: ${error.message}`);
        }
    }

    /**
     * Obtiene planes nutricionales por tipo
     * @param {string} tipoPlan - Tipo de plan
     * @returns {Promise<Array>} Lista de planes por tipo
     * 
     * PATRÓN: Template Method - Define el flujo estándar de obtención por tipo
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Query Object - Proporciona filtros de búsqueda
     * PATRÓN: Validation Pattern - Valida tipo antes de operación
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener por tipo
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para tipo
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (Nutricion)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Validación de tipo antes de operación
     */
    async getByType(tipoPlan) {
        try {
            // ===== VALIDACIÓN DE TIPO =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que el tipo sea válido
            // PRINCIPIO SOLID S: Responsabilidad de validar el tipo
            const tiposValidos = [
                'perdida_peso',
                'ganancia_masa',
                'mantenimiento',
                'deportivo',
                'medico',
                'personalizado'
            ];
            
            if (!tiposValidos.includes(tipoPlan)) {
                throw new Error(`Tipo de plan debe ser uno de: ${tiposValidos.join(', ')}`);
            }
            
            // ===== BÚSQUEDA EN BASE DE DATOS =====
            // PATRÓN: Repository - Abstrae la operación de búsqueda
            // PATRÓN: Query Object - Proporciona filtro de tipo
            // PATRÓN: Strategy - Estrategia de ordenamiento
            // PRINCIPIO SOLID S: Responsabilidad de buscar en base de datos
            const cursor = this.collection.find({ tipoPlan: tipoPlan })
                .sort({ fechaCreacion: -1 });
            
            // ===== OBTENCIÓN DE RESULTADOS =====
            // PATRÓN: Repository - Abstrae la operación de consulta
            // PRINCIPIO SOLID S: Responsabilidad de obtener resultados
            const mongoObjs = await cursor.toArray();
            
            // ===== CONVERSIÓN A MODELOS DE DOMINIO =====
            // PATRÓN: Mapper - Mapea entre formato de base de datos y modelo de dominio
            // PATRÓN: Data Transfer Object (DTO) - Convierte a modelos de dominio
            // PRINCIPIO SOLID S: Responsabilidad de convertir a modelos de dominio
            return mongoObjs.map(obj => Nutricion.fromMongoObject(obj));
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener planes por tipo: ${error.message}`);
        }
    }

    /**
     * Obtiene el plan activo de un cliente
     * @param {string} clienteId - ID del cliente
     * @returns {Promise<Nutricion|null>} Plan activo o null
     * 
     * PATRÓN: Template Method - Define el flujo estándar de obtención de plan activo
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Query Object - Proporciona filtros de búsqueda
     * PATRÓN: Validation Pattern - Valida ID antes de operación
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener plan activo
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para plan activo
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (Nutricion)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Validación de ID antes de operación
     */
    async getActiveByClient(clienteId) {
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
            // PATRÓN: Query Object - Proporciona filtro de cliente y estado
            // PRINCIPIO SOLID S: Responsabilidad de buscar en base de datos
            const mongoObj = await this.collection.findOne({
                clienteId: new ObjectId(clienteId),
                estado: 'activo'
            });
            
            // ===== CONVERSIÓN A MODELO DE DOMINIO =====
            // PATRÓN: Mapper - Mapea entre formato de base de datos y modelo de dominio
            // PATRÓN: Data Transfer Object (DTO) - Convierte a modelo de dominio
            // PRINCIPIO SOLID S: Responsabilidad de convertir a modelo de dominio
            return Nutricion.fromMongoObject(mongoObj);
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener plan activo: ${error.message}`);
        }
    }

    /**
     * Busca planes nutricionales por texto
     * @param {string} termino - Término de búsqueda
     * @returns {Promise<Array>} Lista de planes encontrados
     * 
     * PATRÓN: Template Method - Define el flujo estándar de búsqueda
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Query Object - Proporciona filtros de búsqueda
     * PATRÓN: Validation Pattern - Valida término de búsqueda
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PATRÓN: Strategy - Estrategia de búsqueda (ID vs texto)
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de buscar planes
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para búsqueda
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (Nutricion)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Búsqueda eficiente con expresiones regulares
     */
    async search(termino) {
        try {
            // ===== VALIDACIÓN DE TÉRMINO DE BÚSQUEDA =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que el término sea válido
            // PRINCIPIO SOLID S: Responsabilidad de validar el término
            if (!termino || typeof termino !== 'string') {
                throw new Error('Término de búsqueda es requerido');
            }
            
            // ===== BÚSQUEDA POR ID =====
            // PATRÓN: Strategy - Estrategia de búsqueda por ID
            // PRINCIPIO SOLID S: Responsabilidad de buscar por ID
            if (ObjectId.isValid(termino)) {
                const mongoObj = await this.collection.findOne({ _id: new ObjectId(termino) });
                if (mongoObj) {
                    return [Nutricion.fromMongoObject(mongoObj)];
                }
            }
            
            // ===== BÚSQUEDA POR TEXTO =====
            // PATRÓN: Strategy - Estrategia de búsqueda por texto
            // PATRÓN: Query Object - Proporciona filtro de búsqueda
            // PRINCIPIO SOLID S: Responsabilidad de buscar por texto
            const query = {
                $or: [
                    { detallePlan: { $regex: termino, $options: 'i' } },
                    { evaluacionNutricional: { $regex: termino, $options: 'i' } },
                    { notasAdicionales: { $regex: termino, $options: 'i' } }
                ]
            };
            
            // ===== EJECUCIÓN DE CONSULTA =====
            // PATRÓN: Repository - Abstrae la operación de búsqueda
            // PATRÓN: Strategy - Estrategia de ordenamiento
            // PRINCIPIO SOLID S: Responsabilidad de ejecutar consulta
            const cursor = this.collection.find(query).sort({ fechaCreacion: -1 });
            
            // ===== OBTENCIÓN DE RESULTADOS =====
            // PATRÓN: Repository - Abstrae la operación de consulta
            // PRINCIPIO SOLID S: Responsabilidad de obtener resultados
            const mongoObjs = await cursor.toArray();
            
            // ===== CONVERSIÓN A MODELOS DE DOMINIO =====
            // PATRÓN: Mapper - Mapea entre formato de base de datos y modelo de dominio
            // PATRÓN: Data Transfer Object (DTO) - Convierte a modelos de dominio
            // PRINCIPIO SOLID S: Responsabilidad de convertir a modelos de dominio
            return mongoObjs.map(obj => Nutricion.fromMongoObject(obj));
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al buscar planes: ${error.message}`);
        }
    }

    /**
     * Obtiene estadísticas de planes nutricionales
     * @returns {Promise<Object>} Estadísticas
     * 
     * PATRÓN: Template Method - Define el flujo estándar de obtención de estadísticas
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Aggregator - Agrega datos de diferentes fuentes
     * PATRÓN: Query Object - Proporciona filtros de búsqueda
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener estadísticas
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas métricas
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para estadísticas
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (collection)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Consulta eficiente con múltiples conteos
     */
    async getStats() {
        try {
            // ===== OBTENCIÓN DE ESTADÍSTICAS =====
            // PATRÓN: Aggregator - Agrega datos de diferentes fuentes
            // PATRÓN: Query Object - Proporciona filtros de búsqueda
            // PRINCIPIO SOLID S: Responsabilidad de obtener estadísticas
            const total = await this.collection.countDocuments();
            const activos = await this.collection.countDocuments({ estado: 'activo' });
            const pausados = await this.collection.countDocuments({ estado: 'pausado' });
            const finalizados = await this.collection.countDocuments({ estado: 'finalizado' });
            const cancelados = await this.collection.countDocuments({ estado: 'cancelado' });
            
            // ===== CONSTRUCCIÓN DE RESULTADO =====
            // PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
            // PRINCIPIO SOLID S: Responsabilidad de construir resultado
            return {
                total,
                activos,
                pausados,
                finalizados,
                cancelados
            };
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener estadísticas: ${error.message}`);
        }
    }

    /**
     * Construye query de filtros
     * @param {Object} filtros - Filtros a aplicar
     * @returns {Object} Query de MongoDB
     * 
     * PATRÓN: Builder - Construye consulta paso a paso
     * PATRÓN: Query Object - Proporciona filtros de búsqueda
     * PATRÓN: Template Method - Define el flujo estándar de construcción de consulta
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de construir consulta
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas opciones
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para construcción
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (ObjectId)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de construcción
     * BUENA PRÁCTICA: Construcción eficiente de consulta con filtros
     */
    construirQuery(filtros) {
        // ===== INICIALIZACIÓN DE CONSULTA =====
        // PATRÓN: Builder - Inicializa construcción de consulta
        // PRINCIPIO SOLID S: Responsabilidad de inicializar consulta
        const query = {};
        
        // ===== FILTRO POR CLIENTE =====
        // PATRÓN: Builder - Agrega filtro de cliente
        // PATRÓN: Guard Clause - Validación temprana para evitar errores
        // PRINCIPIO SOLID S: Responsabilidad de agregar filtro de cliente
        if (filtros.clienteId) {
            query.clienteId = new ObjectId(filtros.clienteId);
        }
        
        // ===== FILTRO POR CONTRATO =====
        // PATRÓN: Builder - Agrega filtro de contrato
        // PATRÓN: Guard Clause - Validación temprana para evitar errores
        // PRINCIPIO SOLID S: Responsabilidad de agregar filtro de contrato
        if (filtros.contratoId) {
            query.contratoId = new ObjectId(filtros.contratoId);
        }
        
        // ===== FILTRO POR ESTADO =====
        // PATRÓN: Builder - Agrega filtro de estado
        // PATRÓN: Guard Clause - Validación temprana para evitar errores
        // PRINCIPIO SOLID S: Responsabilidad de agregar filtro de estado
        if (filtros.estado) {
            query.estado = filtros.estado;
        }
        
        // ===== FILTRO POR TIPO DE PLAN =====
        // PATRÓN: Builder - Agrega filtro de tipo de plan
        // PATRÓN: Guard Clause - Validación temprana para evitar errores
        // PRINCIPIO SOLID S: Responsabilidad de agregar filtro de tipo
        if (filtros.tipoPlan) {
            query.tipoPlan = filtros.tipoPlan;
        }
        
        // ===== FILTRO POR FECHA DESDE =====
        // PATRÓN: Builder - Agrega filtro de fecha desde
        // PATRÓN: Guard Clause - Validación temprana para evitar errores
        // PRINCIPIO SOLID S: Responsabilidad de agregar filtro de fecha desde
        if (filtros.fechaDesde) {
            query.fechaCreacion = { $gte: new Date(filtros.fechaDesde) };
        }
        
        // ===== FILTRO POR FECHA HASTA =====
        // PATRÓN: Builder - Agrega filtro de fecha hasta
        // PATRÓN: Guard Clause - Validación temprana para evitar errores
        // PRINCIPIO SOLID S: Responsabilidad de agregar filtro de fecha hasta
        if (filtros.fechaHasta) {
            if (query.fechaCreacion) {
                query.fechaCreacion.$lte = new Date(filtros.fechaHasta);
            } else {
                query.fechaCreacion = { $lte: new Date(filtros.fechaHasta) };
            }
        }
        
        // ===== RETORNO DE CONSULTA =====
        // PATRÓN: Data Transfer Object (DTO) - Retorna consulta estructurada
        // PRINCIPIO SOLID S: Responsabilidad de retornar consulta
        return query;
    }
}

module.exports = NutricionRepository;