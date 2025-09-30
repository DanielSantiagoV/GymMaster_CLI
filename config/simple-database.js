/**
 * Base de datos simple en memoria para desarrollo
 * Permite probar la aplicación sin instalar MongoDB
 * 
 * PATRÓN: In-Memory Database - Base de datos en memoria para desarrollo
 * PATRÓN: Facade - Proporciona una interfaz similar a MongoDB
 * PATRÓN: Registry - Registra todas las colecciones disponibles
 * PATRÓN: Data Transfer Object (DTO) - Proporciona datos estructurados
 * PATRÓN: Module Pattern - Encapsula la funcionalidad de base de datos
 * PRINCIPIO SOLID S: Responsabilidad Única - Se encarga únicamente de simular MongoDB
 * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas colecciones
 * PRINCIPIO SOLID D: Inversión de Dependencias - No depende de implementaciones externas
 * 
 * NOTA: Este módulo NO maneja transacciones ya que es una simulación en memoria
 * BUENA PRÁCTICA: Base de datos en memoria para desarrollo y testing
 */
class SimpleDatabase {
    /**
     * Constructor de la base de datos simple
     * 
     * PATRÓN: Registry - Inicializa el registro de colecciones
     * PATRÓN: State - Mantiene el estado de las colecciones
     * PRINCIPIO SOLID S: Responsabilidad de inicializar la base de datos
     * BUENA PRÁCTICA: Inicialización de colecciones y contadores en constructor
     */
    constructor() {
        // ===== INICIALIZACIÓN DE COLECCIONES =====
        // PATRÓN: Registry - Registra todas las colecciones disponibles
        // PATRÓN: Data Transfer Object (DTO) - Estructura colecciones como objeto
        // PRINCIPIO SOLID S: Responsabilidad de inicializar colecciones
        this.collections = {
            clientes: [],      // Colección de clientes
            planes: [],        // Colección de planes de entrenamiento
            contratos: [],     // Colección de contratos
            seguimientos: [],  // Colección de seguimientos
            finanzas: [],      // Colección de finanzas
            nutricion: []      // Colección de planes nutricionales
        };
        
        // ===== INICIALIZACIÓN DE CONTADORES =====
        // PATRÓN: Registry - Registra contadores para IDs únicos
        // PATRÓN: State - Mantiene el estado de los contadores
        // PRINCIPIO SOLID S: Responsabilidad de inicializar contadores
        this.counters = {
            clientes: 0,       // Contador para IDs de clientes
            planes: 0,         // Contador para IDs de planes
            contratos: 0,      // Contador para IDs de contratos
            seguimientos: 0,   // Contador para IDs de seguimientos
            finanzas: 0,       // Contador para IDs de finanzas
            nutricion: 0       // Contador para IDs de nutrición
        };
    }

    /**
     * Simula conexión
     * 
     * PATRÓN: Template Method - Define el flujo estándar de conexión
     * PATRÓN: Facade - Proporciona interfaz similar a MongoDB
     * PATRÓN: Data Transfer Object (DTO) - Retorna conexión estructurada
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de simular conexión
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para conexión
     * PRINCIPIO SOLID D: Inversión de Dependencias - No depende de implementaciones externas
     * 
     * NOTA: No hay transacciones ya que es una simulación en memoria
     * BUENA PRÁCTICA: Método para simular conexión a base de datos
     */
    async connect() {
        // ===== NOTIFICACIÓN DE CONEXIÓN =====
        // PATRÓN: Observer - Notifica el estado de conexión
        // PRINCIPIO SOLID S: Responsabilidad de informar sobre la conexión
        console.log('🔌 Conectado a base de datos en memoria (MongoDB no instalado)');
        console.log('⚠️ Los datos se perderán al cerrar la aplicación');
        
        // ===== RETORNO DE CONEXIÓN =====
        // PATRÓN: Data Transfer Object (DTO) - Retorna conexión estructurada
        // PATRÓN: Facade - Proporciona interfaz similar a MongoDB
        // PRINCIPIO SOLID S: Responsabilidad de retornar conexión simulada
        return { client: this, db: this };
    }

    /**
     * Simula desconexión
     * 
     * PATRÓN: Template Method - Define el flujo estándar de desconexión
     * PATRÓN: Observer - Notifica el estado de desconexión
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de simular desconexión
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para desconexión
     * PRINCIPIO SOLID D: Inversión de Dependencias - No depende de implementaciones externas
     * 
     * NOTA: No hay transacciones ya que es una simulación en memoria
     * BUENA PRÁCTICA: Método para simular desconexión de base de datos
     */
    async disconnect() {
        // ===== NOTIFICACIÓN DE DESCONEXIÓN =====
        // PATRÓN: Observer - Notifica el estado de desconexión
        // PRINCIPIO SOLID S: Responsabilidad de informar sobre la desconexión
        console.log('🔌 Conexión cerrada');
    }

    /**
     * Obtiene una colección
     * @param {string} name - Nombre de la colección
     * @returns {SimpleCollection} Instancia de la colección
     * 
     * PATRÓN: Factory - Crea instancias de colecciones
     * PATRÓN: Facade - Proporciona acceso a colecciones
     * PATRÓN: Data Transfer Object (DTO) - Retorna colección estructurada
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener colecciones
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas colecciones
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para obtener colecciones
     * PRINCIPIO SOLID D: Inversión de Dependencias - No depende de implementaciones externas
     * 
     * NOTA: No hay transacciones ya que es una simulación en memoria
     * BUENA PRÁCTICA: Método para obtener colecciones de forma segura
     */
    collection(name) {
        // ===== CREACIÓN DE COLECCIÓN =====
        // PATRÓN: Factory - Crea instancia de SimpleCollection
        // PATRÓN: Facade - Proporciona acceso a colecciones
        // PRINCIPIO SOLID S: Responsabilidad de crear colecciones
        return new SimpleCollection(this.collections[name], this.counters[name]);
    }

    /**
     * Getter para el cliente
     * @returns {SimpleDatabase} Instancia de la base de datos
     * 
     * PATRÓN: Facade - Proporciona acceso al cliente
     * PRINCIPIO SOLID S: Responsabilidad de proporcionar acceso al cliente
     * BUENA PRÁCTICA: Getter para compatibilidad con MongoDB
     */
    get client() { return this; }
    
    /**
     * Getter para la base de datos
     * @returns {SimpleDatabase} Instancia de la base de datos
     * 
     * PATRÓN: Facade - Proporciona acceso a la base de datos
     * PRINCIPIO SOLID S: Responsabilidad de proporcionar acceso a la base de datos
     * BUENA PRÁCTICA: Getter para compatibilidad con MongoDB
     */
    get db() { return this; }
}

/**
 * Colección simple
 * 
 * PATRÓN: In-Memory Collection - Colección en memoria para desarrollo
 * PATRÓN: Facade - Proporciona una interfaz similar a MongoDB Collection
 * PATRÓN: Data Transfer Object (DTO) - Proporciona datos estructurados
 * PATRÓN: Module Pattern - Encapsula la funcionalidad de colección
 * PRINCIPIO SOLID S: Responsabilidad Única - Se encarga únicamente de simular operaciones de colección
 * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas operaciones
 * PRINCIPIO SOLID D: Inversión de Dependencias - No depende de implementaciones externas
 * 
 * NOTA: Este módulo NO maneja transacciones ya que es una simulación en memoria
 * BUENA PRÁCTICA: Colección en memoria para desarrollo y testing
 */
class SimpleCollection {
    /**
     * Constructor de la colección simple
     * @param {Array} data - Array de datos de la colección
     * @param {number} counter - Contador para IDs únicos
     * 
     * PATRÓN: Dependency Injection - Inyecta dependencias en constructor
     * PATRÓN: State - Mantiene el estado de la colección
     * PRINCIPIO SOLID S: Responsabilidad de inicializar la colección
     * BUENA PRÁCTICA: Inicialización de datos y contador en constructor
     */
    constructor(data, counter) {
        // PATRÓN: State - Mantiene el estado de los datos
        // PRINCIPIO SOLID S: Responsabilidad de almacenar datos
        this.data = data;
        // PATRÓN: State - Mantiene el estado del contador
        // PRINCIPIO SOLID S: Responsabilidad de rastrear contador
        this.counter = counter;
    }

    /**
     * Inserta un documento en la colección
     * @param {Object} doc - Documento a insertar
     * @returns {Object} Resultado de la inserción
     * 
     * PATRÓN: Template Method - Define el flujo estándar de inserción
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de insertar documentos
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para inserción
     * PRINCIPIO SOLID D: Inversión de Dependencias - No depende de implementaciones externas
     * 
     * NOTA: No hay transacciones ya que es una simulación en memoria
     * BUENA PRÁCTICA: Método para insertar documentos de forma segura
     */
    async insertOne(doc) {
        // ===== GENERACIÓN DE ID ÚNICO =====
        // PATRÓN: Strategy - Estrategia de generación de ID
        // PRINCIPIO SOLID S: Responsabilidad de generar ID único
        const id = ++this.counter;
        
        // ===== CREACIÓN DE DOCUMENTO =====
        // PATRÓN: Factory - Crea documento con ID
        // PATRÓN: Data Transfer Object (DTO) - Estructura documento como objeto
        // PRINCIPIO SOLID S: Responsabilidad de crear documento
        const document = { _id: id, ...doc };
        
        // ===== INSERCIÓN EN COLECCIÓN =====
        // PATRÓN: State - Actualiza el estado de la colección
        // PRINCIPIO SOLID S: Responsabilidad de insertar documento
        this.data.push(document);
        
        // ===== RETORNO DE RESULTADO =====
        // PATRÓN: Data Transfer Object (DTO) - Retorna resultado estructurado
        // PRINCIPIO SOLID S: Responsabilidad de retornar resultado
        return { insertedId: id };
    }

    /**
     * Busca documentos en la colección
     * @param {Object} query - Consulta de búsqueda
     * @returns {Object} Cursor con método toArray
     * 
     * PATRÓN: Template Method - Define el flujo estándar de búsqueda
     * PATRÓN: Iterator - Proporciona iteración sobre resultados
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultados estructurados
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de buscar documentos
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para búsqueda
     * PRINCIPIO SOLID D: Inversión de Dependencias - No depende de implementaciones externas
     * 
     * NOTA: No hay transacciones ya que es una simulación en memoria
     * BUENA PRÁCTICA: Método para buscar documentos de forma segura
     */
    async find(query = {}) {
        // ===== RETORNO DE CURSOR =====
        // PATRÓN: Iterator - Proporciona iteración sobre resultados
        // PATRÓN: Data Transfer Object (DTO) - Retorna cursor estructurado
        // PRINCIPIO SOLID S: Responsabilidad de retornar cursor
        return {
            toArray: () => {
                // ===== BÚSQUEDA SIN FILTROS =====
                // PATRÓN: Strategy - Estrategia de búsqueda sin filtros
                // PRINCIPIO SOLID S: Responsabilidad de retornar todos los datos
                if (Object.keys(query).length === 0) return this.data;
                
                // ===== BÚSQUEDA CON FILTROS =====
                // PATRÓN: Strategy - Estrategia de búsqueda con filtros
                // PATRÓN: Iterator - Filtra resultados
                // PRINCIPIO SOLID S: Responsabilidad de filtrar datos
                return this.data.filter(doc => this.matches(doc, query));
            }
        };
    }

    /**
     * Busca un documento en la colección
     * @param {Object} query - Consulta de búsqueda
     * @returns {Object|null} Documento encontrado o null
     * 
     * PATRÓN: Template Method - Define el flujo estándar de búsqueda única
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de buscar un documento
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para búsqueda única
     * PRINCIPIO SOLID D: Inversión de Dependencias - No depende de implementaciones externas
     * 
     * NOTA: No hay transacciones ya que es una simulación en memoria
     * BUENA PRÁCTICA: Método para buscar un documento de forma segura
     */
    async findOne(query) {
        // ===== BÚSQUEDA CON FILTROS =====
        // PATRÓN: Strategy - Estrategia de búsqueda con filtros
        // PATRÓN: Iterator - Filtra resultados
        // PRINCIPIO SOLID S: Responsabilidad de filtrar datos
        const results = this.data.filter(doc => this.matches(doc, query));
        
        // ===== RETORNO DE RESULTADO =====
        // PATRÓN: Data Transfer Object (DTO) - Retorna resultado estructurado
        // PRINCIPIO SOLID S: Responsabilidad de retornar primer resultado o null
        return results.length > 0 ? results[0] : null;
    }

    /**
     * Actualiza un documento en la colección
     * @param {Object} query - Consulta de búsqueda
     * @param {Object} update - Datos de actualización
     * @returns {Object} Resultado de la actualización
     * 
     * PATRÓN: Template Method - Define el flujo estándar de actualización
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de actualizar documentos
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para actualización
     * PRINCIPIO SOLID D: Inversión de Dependencias - No depende de implementaciones externas
     * 
     * NOTA: No hay transacciones ya que es una simulación en memoria
     * BUENA PRÁCTICA: Método para actualizar documentos de forma segura
     */
    async updateOne(query, update) {
        // ===== BÚSQUEDA DE DOCUMENTO =====
        // PATRÓN: Strategy - Estrategia de búsqueda de documento
        // PRINCIPIO SOLID S: Responsabilidad de buscar documento a actualizar
        const index = this.data.findIndex(doc => this.matches(doc, query));
        
        // ===== ACTUALIZACIÓN DE DOCUMENTO =====
        // PATRÓN: State - Actualiza el estado del documento
        // PRINCIPIO SOLID S: Responsabilidad de actualizar documento
        if (index !== -1) {
            // ===== APLICACIÓN DE ACTUALIZACIÓN =====
            // PATRÓN: Strategy - Estrategia de aplicación de actualización
            // PRINCIPIO SOLID S: Responsabilidad de aplicar actualización
            if (update.$set) {
                this.data[index] = { ...this.data[index], ...update.$set };
            }
            return { modifiedCount: 1 };
        }
        
        // ===== RETORNO DE RESULTADO =====
        // PATRÓN: Data Transfer Object (DTO) - Retorna resultado estructurado
        // PRINCIPIO SOLID S: Responsabilidad de retornar resultado
        return { modifiedCount: 0 };
    }

    /**
     * Elimina un documento de la colección
     * @param {Object} query - Consulta de búsqueda
     * @returns {Object} Resultado de la eliminación
     * 
     * PATRÓN: Template Method - Define el flujo estándar de eliminación
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultado estructurado
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de eliminar documentos
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para eliminación
     * PRINCIPIO SOLID D: Inversión de Dependencias - No depende de implementaciones externas
     * 
     * NOTA: No hay transacciones ya que es una simulación en memoria
     * BUENA PRÁCTICA: Método para eliminar documentos de forma segura
     */
    async deleteOne(query) {
        // ===== BÚSQUEDA DE DOCUMENTO =====
        // PATRÓN: Strategy - Estrategia de búsqueda de documento
        // PRINCIPIO SOLID S: Responsabilidad de buscar documento a eliminar
        const index = this.data.findIndex(doc => this.matches(doc, query));
        
        // ===== ELIMINACIÓN DE DOCUMENTO =====
        // PATRÓN: State - Actualiza el estado de la colección
        // PRINCIPIO SOLID S: Responsabilidad de eliminar documento
        if (index !== -1) {
            this.data.splice(index, 1);
            return { deletedCount: 1 };
        }
        
        // ===== RETORNO DE RESULTADO =====
        // PATRÓN: Data Transfer Object (DTO) - Retorna resultado estructurado
        // PRINCIPIO SOLID S: Responsabilidad de retornar resultado
        return { deletedCount: 0 };
    }

    /**
     * Cuenta documentos en la colección
     * @param {Object} query - Consulta de búsqueda
     * @returns {number} Número de documentos
     * 
     * PATRÓN: Template Method - Define el flujo estándar de conteo
     * PATRÓN: Strategy - Diferentes estrategias de conteo según consulta
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de contar documentos
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para conteo
     * PRINCIPIO SOLID D: Inversión de Dependencias - No depende de implementaciones externas
     * 
     * NOTA: No hay transacciones ya que es una simulación en memoria
     * BUENA PRÁCTICA: Método para contar documentos de forma segura
     */
    async countDocuments(query = {}) {
        // ===== CONTEO SIN FILTROS =====
        // PATRÓN: Strategy - Estrategia de conteo sin filtros
        // PRINCIPIO SOLID S: Responsabilidad de retornar total de documentos
        if (Object.keys(query).length === 0) return this.data.length;
        
        // ===== CONTEO CON FILTROS =====
        // PATRÓN: Strategy - Estrategia de conteo con filtros
        // PATRÓN: Iterator - Filtra y cuenta resultados
        // PRINCIPIO SOLID S: Responsabilidad de contar documentos filtrados
        return this.data.filter(doc => this.matches(doc, query)).length;
    }

    /**
     * Verifica si un documento coincide con una consulta
     * @param {Object} doc - Documento a verificar
     * @param {Object} query - Consulta de búsqueda
     * @returns {boolean} True si coincide
     * 
     * PATRÓN: Template Method - Define el flujo estándar de coincidencia
     * PATRÓN: Strategy - Diferentes estrategias de coincidencia según el tipo de consulta
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de verificar coincidencias
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para coincidencias
     * PRINCIPIO SOLID D: Inversión de Dependencias - No depende de implementaciones externas
     * 
     * NOTA: No hay transacciones ya que es una simulación en memoria
     * BUENA PRÁCTICA: Método para verificar coincidencias de forma segura
     */
    matches(doc, query) {
        // ===== ITERACIÓN SOBRE CONSULTA =====
        // PATRÓN: Iterator - Itera sobre todas las condiciones de la consulta
        // PRINCIPIO SOLID S: Responsabilidad de procesar cada condición
        for (const [key, value] of Object.entries(query)) {
            // ===== COINCIDENCIA POR ID =====
            // PATRÓN: Strategy - Estrategia de coincidencia por ID
            // PRINCIPIO SOLID S: Responsabilidad de verificar coincidencia por ID
            if (key === '_id') {
                if (doc._id !== value) return false;
            } else if (typeof value === 'object' && value.$ne) {
                // ===== COINCIDENCIA POR DESIGUALDAD =====
                // PATRÓN: Strategy - Estrategia de coincidencia por desigualdad
                // PRINCIPIO SOLID S: Responsabilidad de verificar desigualdad
                if (doc[key] === value.$ne) return false;
            } else if (typeof value === 'object' && value.$exists) {
                // ===== COINCIDENCIA POR EXISTENCIA =====
                // PATRÓN: Strategy - Estrategia de coincidencia por existencia
                // PRINCIPIO SOLID S: Responsabilidad de verificar existencia
                if (value.$exists && !(key in doc)) return false;
                if (!value.$exists && (key in doc)) return false;
            } else {
                // ===== COINCIDENCIA POR IGUALDAD =====
                // PATRÓN: Strategy - Estrategia de coincidencia por igualdad
                // PRINCIPIO SOLID S: Responsabilidad de verificar igualdad
                if (doc[key] !== value) return false;
            }
        }
        
        // ===== RETORNO DE RESULTADO =====
        // PATRÓN: Data Transfer Object (DTO) - Retorna resultado booleano
        // PRINCIPIO SOLID S: Responsabilidad de retornar resultado de coincidencia
        return true;
    }
}

// ===== EXPORTACIÓN DEL MÓDULO =====
// PATRÓN: Module Pattern - Exporta la clase como módulo
// PRINCIPIO SOLID S: Responsabilidad de proporcionar la interfaz pública de base de datos
module.exports = SimpleDatabase;
