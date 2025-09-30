// ===== IMPORTS Y DEPENDENCIAS =====
// Importación de ObjectId de MongoDB para manejo de IDs
// PATRÓN: Dependency Injection - Se inyectan las dependencias a través del constructor
// PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (ObjectId) no de implementaciones concretas
const { ObjectId } = require('mongodb'); // Driver de MongoDB para operaciones con ObjectId
// Importación del modelo PlanEntrenamiento para validaciones y transformaciones
// PATRÓN: Dependency Injection - Se inyectan las dependencias a través del constructor
// PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (PlanEntrenamiento) no de implementaciones concretas
const { PlanEntrenamiento } = require('../models'); // Modelo de dominio PlanEntrenamiento

/**
 * Repositorio para gestión de planes de entrenamiento
 * Implementa el patrón Repository para abstraer el acceso a datos
 * Maneja operaciones CRUD y métodos específicos para planes
 * 
 * PATRÓN: Repository - Abstrae el acceso a datos de planes de entrenamiento
 * PATRÓN: Data Access Object (DAO) - Proporciona interfaz para operaciones de datos
 * PATRÓN: Facade - Proporciona una interfaz simplificada para operaciones de planes
 * PATRÓN: Data Transfer Object (DTO) - Proporciona datos estructurados
 * PATRÓN: Module Pattern - Encapsula la funcionalidad de repositorio
 * PRINCIPIO SOLID S: Responsabilidad Única - Se encarga únicamente de la gestión de datos de planes
 * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas operaciones sin modificar código existente
 * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente en todas las operaciones
 * PRINCIPIO SOLID I: Segregación de Interfaces - Métodos específicos para diferentes operaciones
 * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (db, PlanEntrenamiento) no de implementaciones concretas
 * 
 * NOTA: Este módulo NO maneja transacciones ya que solo proporciona operaciones de datos
 * BUENA PRÁCTICA: Repositorio centralizado para operaciones de planes
 */
class PlanEntrenamientoRepository {
    /**
     * Constructor del repositorio de planes de entrenamiento
     * @param {Object} db - Instancia de base de datos MongoDB
     * 
     * PATRÓN: Dependency Injection - Inyecta dependencia de base de datos
     * PATRÓN: Repository - Inicializa el repositorio con la colección
     * PRINCIPIO SOLID S: Responsabilidad de inicializar el repositorio
     * BUENA PRÁCTICA: Inicialización de repositorio en constructor
     */
    constructor(db) {
        // PATRÓN: Repository - Abstrae el acceso a la colección de planes
        // PRINCIPIO SOLID S: Responsabilidad de acceder a la colección de planes
        this.collection = db.collection('planes');
        // PATRÓN: Dependency Injection - Inyecta dependencia de base de datos
        // PRINCIPIO SOLID S: Responsabilidad de mantener referencia a la base de datos
        this.db = db;
    }

    /**
     * Crea un nuevo plan de entrenamiento
     * @param {PlanEntrenamiento} plan - Instancia de PlanEntrenamiento a crear
     * @returns {Promise<ObjectId>} ID del plan creado
     * @throws {Error} Si la validación falla o hay error en la inserción
     * 
     * PATRÓN: Template Method - Define el flujo estándar de creación
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Validation Pattern - Valida datos antes de inserción
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de crear planes
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas validaciones
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para creación
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (PlanEntrenamiento)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de inserción
     * BUENA PRÁCTICA: Validación de datos antes de inserción
     */
    async create(plan) {
        try {
            // ===== VALIDACIÓN DE INSTANCIA =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que sea instancia de PlanEntrenamiento
            // PRINCIPIO SOLID S: Responsabilidad de validar el tipo de dato
            if (!(plan instanceof PlanEntrenamiento)) {
                throw new Error('El parámetro debe ser una instancia de PlanEntrenamiento');
            }

            // ===== CONVERSIÓN A OBJETO MONGODB =====
            // PATRÓN: Data Transfer Object (DTO) - Convierte a formato MongoDB
            // PATRÓN: Mapper - Mapea entre modelo de dominio y formato de base de datos
            // PRINCIPIO SOLID S: Responsabilidad de convertir a formato de base de datos
            const planDoc = plan.toMongoObject();
            
            // ===== VERIFICACIÓN DE UNICIDAD =====
            // PATRÓN: Guard Clause - Validación temprana para evitar duplicados
            // PATRÓN: Validation Pattern - Valida unicidad de nombre
            // PRINCIPIO SOLID S: Responsabilidad de verificar unicidad
            const planExistente = await this.collection.findOne({ nombre: planDoc.nombre });
            if (planExistente) {
                throw new Error('Ya existe un plan con este nombre');
            }

            // ===== INSERCIÓN EN BASE DE DATOS =====
            // PATRÓN: Repository - Abstrae la operación de inserción
            // PATRÓN: Data Transfer Object (DTO) - Retorna resultado estructurado
            // PRINCIPIO SOLID S: Responsabilidad de insertar en base de datos
            const result = await this.collection.insertOne(planDoc);
            return result.insertedId;
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al crear plan: ${error.message}`);
        }
    }

    /**
     * Obtiene un plan por su ID
     * @param {string|ObjectId} id - ID del plan
     * @returns {Promise<PlanEntrenamiento|null>} Plan encontrado o null
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
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (PlanEntrenamiento)
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
                throw new Error('ID del plan no es válido');
            }

            // ===== BÚSQUEDA EN BASE DE DATOS =====
            // PATRÓN: Repository - Abstrae la operación de búsqueda
            // PATRÓN: Data Transfer Object (DTO) - Retorna resultado estructurado
            // PRINCIPIO SOLID S: Responsabilidad de buscar en base de datos
            const planDoc = await this.collection.findOne({ _id: new ObjectId(id) });
            
            // ===== VERIFICACIÓN DE EXISTENCIA =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PRINCIPIO SOLID S: Responsabilidad de verificar existencia
            if (!planDoc) {
                return null;
            }

            // ===== CONVERSIÓN A MODELO DE DOMINIO =====
            // PATRÓN: Mapper - Mapea entre formato de base de datos y modelo de dominio
            // PATRÓN: Data Transfer Object (DTO) - Convierte a modelo de dominio
            // PRINCIPIO SOLID S: Responsabilidad de convertir a modelo de dominio
            return PlanEntrenamiento.fromMongoObject(planDoc);
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener plan: ${error.message}`);
        }
    }

    /**
     * Obtiene todos los planes con filtro opcional
     * @param {Object} filter - Filtro de búsqueda
     * @param {Object} options - Opciones de consulta (limit, skip, sort)
     * @returns {Promise<PlanEntrenamiento[]>} Array de planes
     * 
     * PATRÓN: Template Method - Define el flujo estándar de obtención de todos los planes
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Query Object - Proporciona filtros y opciones de búsqueda
     * PATRÓN: Builder - Construye consulta paso a paso
     * PATRÓN: Mapper - Mapea entre formato de base de datos y modelo de dominio
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener todos los planes
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas opciones
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para obtener todos
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (PlanEntrenamiento)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Consulta eficiente con filtros y opciones
     */
    async getAll(filter = {}, options = {}) {
        try {
            // ===== DESESTRUCTURACIÓN DE OPCIONES =====
            // PATRÓN: Strategy - Estrategia de opciones de consulta
            // PRINCIPIO SOLID S: Responsabilidad de configurar opciones
            const { limit = 0, skip = 0, sort = { fechaCreacion: -1 } } = options;
            
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
            const planesDocs = await query.toArray();
            
            // ===== CONVERSIÓN A MODELOS DE DOMINIO =====
            // PATRÓN: Mapper - Mapea entre formato de base de datos y modelo de dominio
            // PATRÓN: Data Transfer Object (DTO) - Convierte a modelos de dominio
            // PRINCIPIO SOLID S: Responsabilidad de convertir a modelos de dominio
            return planesDocs.map(doc => PlanEntrenamiento.fromMongoObject(doc));
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener planes: ${error.message}`);
        }
    }

    /**
     * Actualiza un plan existente
     * @param {string|ObjectId} id - ID del plan a actualizar
     * @param {Object} updatedData - Datos actualizados
     * @returns {Promise<boolean>} True si se actualizó correctamente
     * @throws {Error} Si el ID no es válido o hay error en la actualización
     * 
     * PATRÓN: Template Method - Define el flujo estándar de actualización
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Validation Pattern - Valida datos antes de actualización
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de actualizar planes
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
                throw new Error('ID del plan no es válido');
            }

            // ===== VERIFICACIÓN DE UNICIDAD DE NOMBRE =====
            // PATRÓN: Guard Clause - Validación temprana para evitar duplicados
            // PATRÓN: Validation Pattern - Valida unicidad de nombre
            // PRINCIPIO SOLID S: Responsabilidad de verificar unicidad
            if (updatedData.nombre) {
                const planExistente = await this.collection.findOne({ 
                    nombre: updatedData.nombre, 
                    _id: { $ne: new ObjectId(id) } 
                });
                if (planExistente) {
                    throw new Error('Ya existe otro plan con este nombre');
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
            throw new Error(`Error al actualizar plan: ${error.message}`);
        }
    }

    /**
     * Elimina un plan por su ID
     * @param {string|ObjectId} id - ID del plan a eliminar
     * @returns {Promise<boolean>} True si se eliminó correctamente
     * @throws {Error} Si el ID no es válido o hay dependencias
     * 
     * PATRÓN: Template Method - Define el flujo estándar de eliminación
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Validation Pattern - Valida dependencias antes de eliminación
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de eliminar planes
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
                throw new Error('ID del plan no es válido');
            }

            // ===== VERIFICACIÓN DE DEPENDENCIAS - CLIENTES =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida dependencias de clientes
            // PRINCIPIO SOLID S: Responsabilidad de verificar dependencias
            const plan = await this.getById(id);
            if (plan && plan.tieneClientes()) {
                throw new Error('No se puede eliminar un plan que tiene clientes asignados');
            }

            // ===== VERIFICACIÓN DE DEPENDENCIAS - CONTRATOS =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida dependencias de contratos
            // PRINCIPIO SOLID S: Responsabilidad de verificar dependencias
            const contratosCollection = this.db.collection('contratos');
            const contratosActivos = await contratosCollection.countDocuments({
                planId: new ObjectId(id),
                estado: 'vigente'
            });

            if (contratosActivos > 0) {
                throw new Error('No se puede eliminar un plan con contratos activos');
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
            throw new Error(`Error al eliminar plan: ${error.message}`);
        }
    }

    /**
     * Obtiene planes por nivel
     * @param {string} nivel - Nivel del plan (principiante, intermedio, avanzado)
     * @returns {Promise<PlanEntrenamiento[]>} Array de planes del nivel especificado
     * 
     * PATRÓN: Template Method - Define el flujo estándar de obtención por nivel
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Query Object - Proporciona filtros de búsqueda
     * PATRÓN: Validation Pattern - Valida nivel antes de operación
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener por nivel
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para nivel
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (getAll)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Validación de nivel antes de operación
     */
    async getPlansByLevel(nivel) {
        try {
            // ===== VALIDACIÓN DE NIVEL =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que el nivel sea válido
            // PRINCIPIO SOLID S: Responsabilidad de validar el nivel
            if (!nivel || typeof nivel !== 'string') {
                throw new Error('Nivel debe ser una string válida');
            }

            // ===== DELEGACIÓN A MÉTODO GENERAL =====
            // PATRÓN: Template Method - Delega a método general con filtro específico
            // PATRÓN: Query Object - Proporciona filtro de nivel
            // PRINCIPIO SOLID S: Responsabilidad de obtener planes por nivel
            return await this.getAll({ nivel: nivel.toLowerCase() });
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener planes por nivel: ${error.message}`);
        }
    }

    /**
     * Obtiene todos los planes activos
     * @returns {Promise<PlanEntrenamiento[]>} Array de planes activos
     * 
     * PATRÓN: Template Method - Define el flujo estándar de obtención de planes activos
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Query Object - Proporciona filtros de búsqueda
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener planes activos
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para planes activos
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (getAll)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Filtrado eficiente de planes activos
     */
    async getActivePlans() {
        try {
            // ===== DELEGACIÓN A MÉTODO GENERAL =====
            // PATRÓN: Template Method - Delega a método general con filtro específico
            // PATRÓN: Query Object - Proporciona filtro de planes activos
            // PRINCIPIO SOLID S: Responsabilidad de obtener planes activos
            return await this.getAll({ estado: 'activo' });
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener planes activos: ${error.message}`);
        }
    }

    /**
     * Obtiene planes por duración
     * @param {number} duracionMin - Duración mínima en semanas
     * @param {number} duracionMax - Duración máxima en semanas
     * @returns {Promise<PlanEntrenamiento[]>} Array de planes en el rango
     * 
     * PATRÓN: Template Method - Define el flujo estándar de obtención por duración
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Query Object - Proporciona filtros de búsqueda
     * PATRÓN: Validation Pattern - Valida duraciones antes de operación
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener por duración
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para duración
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (getAll)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Validación de duraciones antes de operación
     */
    async getPlansByDuration(duracionMin, duracionMax) {
        try {
            // ===== VALIDACIÓN DE TIPOS =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que las duraciones sean números
            // PRINCIPIO SOLID S: Responsabilidad de validar los tipos
            if (typeof duracionMin !== 'number' || typeof duracionMax !== 'number') {
                throw new Error('Las duraciones deben ser números');
            }

            // ===== VALIDACIÓN DE VALORES NEGATIVOS =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que las duraciones no sean negativas
            // PRINCIPIO SOLID S: Responsabilidad de validar valores negativos
            if (duracionMin < 0 || duracionMax < 0) {
                throw new Error('Las duraciones no pueden ser negativas');
            }

            // ===== VALIDACIÓN DE RANGO =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que el rango sea válido
            // PRINCIPIO SOLID S: Responsabilidad de validar el rango
            if (duracionMin > duracionMax) {
                throw new Error('Duración mínima no puede ser mayor a la máxima');
            }

            // ===== DELEGACIÓN A MÉTODO GENERAL =====
            // PATRÓN: Template Method - Delega a método general con filtro específico
            // PATRÓN: Query Object - Proporciona filtro de rango de duración
            // PRINCIPIO SOLID S: Responsabilidad de obtener planes por duración
            return await this.getAll({
                duracionSemanas: {
                    $gte: duracionMin,
                    $lte: duracionMax
                }
            });
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener planes por duración: ${error.message}`);
        }
    }

    /**
     * Busca planes por nombre o metas
     * @param {string} searchTerm - Término de búsqueda
     * @returns {Promise<PlanEntrenamiento[]>} Array de planes que coinciden
     * 
     * PATRÓN: Template Method - Define el flujo estándar de búsqueda
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Query Object - Proporciona filtros de búsqueda
     * PATRÓN: Validation Pattern - Valida término de búsqueda
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de buscar planes
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para búsqueda
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (getAll)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Búsqueda eficiente con expresiones regulares
     */
    async searchPlans(searchTerm) {
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
            // PRINCIPIO SOLID S: Responsabilidad de buscar planes
            return await this.getAll({
                $or: [
                    { nombre: regex },
                    { metasFisicas: regex }
                ]
            });
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al buscar planes: ${error.message}`);
        }
    }

    /**
     * Obtiene planes que no tienen clientes asignados
     * @returns {Promise<PlanEntrenamiento[]>} Array de planes sin clientes
     * 
     * PATRÓN: Template Method - Define el flujo estándar de obtención de planes sin clientes
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Query Object - Proporciona filtros de búsqueda
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener planes sin clientes
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para planes sin clientes
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (getAll)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de lectura
     * BUENA PRÁCTICA: Filtrado eficiente de planes sin clientes
     */
    async getPlansWithoutClients() {
        try {
            // ===== DELEGACIÓN A MÉTODO GENERAL =====
            // PATRÓN: Template Method - Delega a método general con filtro específico
            // PATRÓN: Query Object - Proporciona filtro de planes sin clientes
            // PRINCIPIO SOLID S: Responsabilidad de obtener planes sin clientes
            return await this.getAll({
                clientes: { $exists: true, $size: 0 }
            });
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener planes sin clientes: ${error.message}`);
        }
    }

    /**
     * Obtiene planes con más clientes asignados
     * @param {number} limit - Límite de resultados
     * @returns {Promise<PlanEntrenamiento[]>} Array de planes más populares
     * 
     * PATRÓN: Template Method - Define el flujo estándar de obtención de planes populares
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Aggregator - Agrega datos de múltiples fuentes
     * PATRÓN: Query Object - Proporciona pipeline de agregación
     * PATRÓN: Mapper - Mapea entre formatos de datos
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener planes populares
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para planes populares
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (collection)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de agregación
     * BUENA PRÁCTICA: Agregación eficiente de datos
     */
    async getMostPopularPlans(limit = 5) {
        try {
            // ===== CONSTRUCCIÓN DE PIPELINE =====
            // PATRÓN: Aggregator - Agrega datos de múltiples fuentes
            // PATRÓN: Query Object - Proporciona pipeline de agregación
            // PRINCIPIO SOLID S: Responsabilidad de construir pipeline
            const pipeline = [
                {
                    $addFields: {
                        clientCount: { $size: { $ifNull: ["$clientes", []] } }
                    }
                },
                { $sort: { clientCount: -1 } },
                { $limit: limit }
            ];

            // ===== EJECUCIÓN DE PIPELINE =====
            // PATRÓN: Repository - Abstrae la operación de agregación
            // PRINCIPIO SOLID S: Responsabilidad de ejecutar pipeline
            const planesDocs = await this.collection.aggregate(pipeline).toArray();
            
            // ===== CONVERSIÓN A MODELOS DE DOMINIO =====
            // PATRÓN: Mapper - Mapea entre formato de base de datos y modelo de dominio
            // PATRÓN: Data Transfer Object (DTO) - Convierte a modelos de dominio
            // PRINCIPIO SOLID S: Responsabilidad de convertir a modelos de dominio
            return planesDocs.map(doc => PlanEntrenamiento.fromMongoObject(doc));
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener planes más populares: ${error.message}`);
        }
    }

    /**
     * Obtiene estadísticas de planes
     * @returns {Promise<Object>} Estadísticas de planes
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
    async getPlanStats() {
        try {
            // ===== CONTEO DE PLANES TOTALES =====
            // PATRÓN: Repository - Abstrae la operación de conteo
            // PATRÓN: Query Object - Proporciona filtros de búsqueda
            // PRINCIPIO SOLID S: Responsabilidad de contar planes totales
            const totalPlanes = await this.collection.countDocuments();
            
            // ===== CONTEO DE PLANES ACTIVOS =====
            // PATRÓN: Repository - Abstrae la operación de conteo
            // PATRÓN: Query Object - Proporciona filtro de planes activos
            // PRINCIPIO SOLID S: Responsabilidad de contar planes activos
            const planesActivos = await this.collection.countDocuments({ estado: 'activo' });
            
            // ===== CONTEO DE PLANES CANCELADOS =====
            // PATRÓN: Repository - Abstrae la operación de conteo
            // PATRÓN: Query Object - Proporciona filtro de planes cancelados
            // PRINCIPIO SOLID S: Responsabilidad de contar planes cancelados
            const planesCancelados = await this.collection.countDocuments({ estado: 'cancelado' });
            
            // ===== CONTEO DE PLANES FINALIZADOS =====
            // PATRÓN: Repository - Abstrae la operación de conteo
            // PATRÓN: Query Object - Proporciona filtro de planes finalizados
            // PRINCIPIO SOLID S: Responsabilidad de contar planes finalizados
            const planesFinalizados = await this.collection.countDocuments({ estado: 'finalizado' });

            // ===== DISTRIBUCIÓN POR NIVEL =====
            // PATRÓN: Aggregator - Agrega datos de múltiples fuentes
            // PATRÓN: Query Object - Proporciona pipeline de agregación
            // PRINCIPIO SOLID S: Responsabilidad de crear distribución por nivel
            const distribucionNivel = await this.collection.aggregate([
                { $group: { _id: "$nivel", count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]).toArray();

            // ===== DISTRIBUCIÓN POR DURACIÓN =====
            // PATRÓN: Aggregator - Agrega datos de múltiples fuentes
            // PATRÓN: Query Object - Proporciona pipeline de agregación
            // PRINCIPIO SOLID S: Responsabilidad de crear distribución por duración
            const distribucionDuracion = await this.collection.aggregate([
                {
                    $bucket: {
                        groupBy: "$duracionSemanas",
                        boundaries: [0, 4, 8, 12, 16, 20, 24, 52],
                        default: "52+",
                        output: { count: { $sum: 1 } }
                    }
                }
            ]).toArray();

            // ===== CONSTRUCCIÓN DE ESTADÍSTICAS =====
            // PATRÓN: Data Transfer Object (DTO) - Proporciona estadísticas estructuradas
            // PATRÓN: Aggregator - Agrega datos de múltiples fuentes
            // PRINCIPIO SOLID S: Responsabilidad de construir estadísticas
            return {
                totalPlanes,
                planesActivos,
                planesCancelados,
                planesFinalizados,
                distribucionNivel,
                distribucionDuracion
            };
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener estadísticas: ${error.message}`);
        }
    }

    /**
     * Agrega un cliente a un plan
     * @param {string|ObjectId} planId - ID del plan
     * @param {string|ObjectId} clienteId - ID del cliente
     * @returns {Promise<boolean>} True si se agregó correctamente
     * 
     * PATRÓN: Template Method - Define el flujo estándar de agregación de cliente
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Validation Pattern - Valida IDs antes de operación
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de agregar cliente
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas validaciones
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para agregar cliente
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (collection)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de actualización
     * BUENA PRÁCTICA: Validación de IDs antes de operación
     */
    async addClientToPlan(planId, clienteId) {
        try {
            // ===== VALIDACIÓN DE IDs =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que los IDs sean válidos
            // PRINCIPIO SOLID S: Responsabilidad de validar los IDs
            if (!ObjectId.isValid(planId) || !ObjectId.isValid(clienteId)) {
                throw new Error('IDs deben ser ObjectIds válidos');
            }

            // ===== ACTUALIZACIÓN EN BASE DE DATOS =====
            // PATRÓN: Repository - Abstrae la operación de actualización
            // PATRÓN: Data Transfer Object (DTO) - Retorna resultado estructurado
            // PRINCIPIO SOLID S: Responsabilidad de actualizar en base de datos
            const result = await this.collection.updateOne(
                { _id: new ObjectId(planId) },
                { $addToSet: { clientes: new ObjectId(clienteId) } }
            );

            // ===== RETORNO DE RESULTADO =====
            // PATRÓN: Data Transfer Object (DTO) - Retorna resultado estructurado
            // PRINCIPIO SOLID S: Responsabilidad de retornar resultado
            return result.modifiedCount > 0;
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al agregar cliente al plan: ${error.message}`);
        }
    }

    /**
     * Remueve un cliente de un plan
     * @param {string|ObjectId} planId - ID del plan
     * @param {string|ObjectId} clienteId - ID del cliente
     * @returns {Promise<boolean>} True si se removió correctamente
     * 
     * PATRÓN: Template Method - Define el flujo estándar de remoción de cliente
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Validation Pattern - Valida IDs antes de operación
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de remover cliente
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas validaciones
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para remover cliente
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (collection)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de actualización
     * BUENA PRÁCTICA: Validación de IDs antes de operación
     */
    async removeClientFromPlan(planId, clienteId) {
        try {
            // ===== VALIDACIÓN DE IDs =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que los IDs sean válidos
            // PRINCIPIO SOLID S: Responsabilidad de validar los IDs
            if (!ObjectId.isValid(planId) || !ObjectId.isValid(clienteId)) {
                throw new Error('IDs deben ser ObjectIds válidos');
            }

            // ===== ACTUALIZACIÓN EN BASE DE DATOS =====
            // PATRÓN: Repository - Abstrae la operación de actualización
            // PATRÓN: Data Transfer Object (DTO) - Retorna resultado estructurado
            // PRINCIPIO SOLID S: Responsabilidad de actualizar en base de datos
            const result = await this.collection.updateOne(
                { _id: new ObjectId(planId) },
                { $pull: { clientes: new ObjectId(clienteId) } }
            );

            // ===== RETORNO DE RESULTADO =====
            // PATRÓN: Data Transfer Object (DTO) - Retorna resultado estructurado
            // PRINCIPIO SOLID S: Responsabilidad de retornar resultado
            return result.modifiedCount > 0;
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al remover cliente del plan: ${error.message}`);
        }
    }

    /**
     * Cambia el estado de un plan
     * @param {string|ObjectId} planId - ID del plan
     * @param {string} nuevoEstado - Nuevo estado del plan
     * @returns {Promise<boolean>} True si se cambió correctamente
     * 
     * PATRÓN: Template Method - Define el flujo estándar de cambio de estado
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PATRÓN: Validation Pattern - Valida estado antes de operación
     * PATRÓN: Guard Clause - Validaciones tempranas para evitar errores
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de cambiar estado
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas validaciones
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para cambio de estado
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (collection)
     * 
     * NOTA: No hay transacciones ya que es una operación simple de actualización
     * BUENA PRÁCTICA: Validación de estado antes de operación
     */
    async changePlanState(planId, nuevoEstado) {
        try {
            // ===== VALIDACIÓN DE ID =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que el ID sea válido
            // PRINCIPIO SOLID S: Responsabilidad de validar el ID
            if (!ObjectId.isValid(planId)) {
                throw new Error('ID del plan no es válido');
            }

            // ===== VALIDACIÓN DE ESTADO =====
            // PATRÓN: Guard Clause - Validación temprana para evitar errores
            // PATRÓN: Validation Pattern - Valida que el estado sea válido
            // PRINCIPIO SOLID S: Responsabilidad de validar el estado
            const estadosValidos = ['activo', 'cancelado', 'finalizado'];
            if (!estadosValidos.includes(nuevoEstado.toLowerCase())) {
                throw new Error(`Estado debe ser uno de: ${estadosValidos.join(', ')}`);
            }

            // ===== ACTUALIZACIÓN EN BASE DE DATOS =====
            // PATRÓN: Repository - Abstrae la operación de actualización
            // PATRÓN: Data Transfer Object (DTO) - Retorna resultado estructurado
            // PRINCIPIO SOLID S: Responsabilidad de actualizar en base de datos
            const result = await this.collection.updateOne(
                { _id: new ObjectId(planId) },
                { $set: { estado: nuevoEstado.toLowerCase() } }
            );

            // ===== RETORNO DE RESULTADO =====
            // PATRÓN: Data Transfer Object (DTO) - Retorna resultado estructurado
            // PRINCIPIO SOLID S: Responsabilidad de retornar resultado
            return result.modifiedCount > 0;
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al cambiar estado del plan: ${error.message}`);
        }
    }

    /**
     * Obtiene planes creados en un rango de fechas
     * @param {Date} fechaInicio - Fecha de inicio
     * @param {Date} fechaFin - Fecha de fin
     * @returns {Promise<PlanEntrenamiento[]>} Array de planes en el rango
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
    async getPlansByDateRange(fechaInicio, fechaFin) {
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
            // PRINCIPIO SOLID S: Responsabilidad de obtener planes por rango
            return await this.getAll({
                fechaCreacion: {
                    $gte: fechaInicio,
                    $lte: fechaFin
                }
            });
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al obtener planes por rango de fechas: ${error.message}`);
        }
    }

    /**
     * Cuenta el número de planes que coinciden con el filtro
     * @param {Object} filter - Filtro de búsqueda
     * @returns {Promise<number>} Número de planes que coinciden
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
    async countPlanes(filter = {}) {
        try {
            // ===== EJECUCIÓN DE CONTEO =====
            // PATRÓN: Repository - Abstrae la operación de conteo
            // PATRÓN: Query Object - Proporciona filtros de búsqueda
            // PRINCIPIO SOLID S: Responsabilidad de ejecutar conteo
            return await this.collection.countDocuments(filter);
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Handling - Manejo centralizado de errores
            // PRINCIPIO SOLID S: Responsabilidad de manejar errores
            throw new Error(`Error al contar planes: ${error.message}`);
        }
    }
}

module.exports = PlanEntrenamientoRepository;
