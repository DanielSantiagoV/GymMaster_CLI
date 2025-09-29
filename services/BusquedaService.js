/**
 * ========================================================================================
 * SERVICIO DE BÚSQUEDA - BUSQUEDASERVICE
 * ========================================================================================
 * 
 * DESCRIPCIÓN:
 * Este servicio facilita la búsqueda de clientes y contratos en el sistema GymMaster.
 * Implementa búsqueda por nombre, ID y otros criterios, proporcionando una interfaz
 * unificada para operaciones de búsqueda en diferentes entidades.
 * 
 * FUNCIONALIDADES PRINCIPALES:
 * - Búsqueda de clientes por nombre o ID
 * - Búsqueda de contratos por nombre o ID
 * - Generación de resúmenes para selección
 * - Validación de términos de búsqueda
 * - Manejo de errores robusto
 * 
 * IMPORTANTE - NO HAY TRANSACCIONES:
 * ========================================================================================
 * Este servicio NO maneja transacciones porque:
 * - Solo realiza operaciones de LECTURA (SELECT)
 * - No modifica, inserta o elimina datos
 * - Las operaciones son atómicas por naturaleza
 * - No requiere rollback ni commit
 * - Las transacciones están en los repositorios si es necesario
 * 
 * PATRONES DE DISEÑO APLICADOS:
 * ========================================================================================
 * 
 * 1. SERVICE LAYER PATTERN:
 *    - Encapsula la lógica de negocio de búsqueda
 *    - Actúa como intermediario entre la capa de presentación y los repositorios
 *    - Proporciona una interfaz unificada para operaciones de búsqueda
 * 
 * 2. FACADE PATTERN:
 *    - Simplifica la interfaz compleja de búsqueda
 *    - Oculta la complejidad de múltiples repositorios
 *    - Proporciona métodos simples para operaciones complejas
 * 
 * 3. STRATEGY PATTERN:
 *    - Diferentes estrategias de búsqueda (por ID, por nombre, por texto)
 *    - Permite intercambiar algoritmos de búsqueda
 *    - Facilita la extensión para nuevos tipos de búsqueda
 * 
 * 4. DEPENDENCY INJECTION PATTERN:
 *    - Inyección de dependencias a través del constructor
 *    - Facilita testing y mantenimiento
 *    - Permite intercambiar implementaciones
 * 
 * PRINCIPIOS SOLID APLICADOS:
 * ========================================================================================
 * 
 * 1. SINGLE RESPONSIBILITY PRINCIPLE (SRP):
 *    - Responsabilidad única de búsqueda de entidades
 *    - No maneja persistencia ni presentación
 *    - Solo se encarga de la lógica de búsqueda
 * 
 * 2. OPEN/CLOSED PRINCIPLE (OCP):
 *    - Abierta para extensión, cerrada para modificación
 *    - Se pueden agregar nuevos tipos de búsqueda
 *    - Se pueden agregar nuevas entidades sin modificar código existente
 * 
 * 3. LISKOV SUBSTITUTION PRINCIPLE (LSP):
 *    - Los repositorios pueden ser sustituidos por implementaciones alternativas
 *    - Mantiene el comportamiento esperado en todas las implementaciones
 * 
 * 4. INTERFACE SEGREGATION PRINCIPLE (ISP):
 *    - Los clientes no dependen de interfaces que no usan
 *    - Cada método expone solo la funcionalidad necesaria
 *    - No hay métodos "gordos" que hagan demasiadas cosas
 * 
 * 5. DEPENDENCY INVERSION PRINCIPLE (DIP):
 *    - Depende de abstracciones (repositorios), no de implementaciones concretas
 *    - Facilita testing y mantenimiento
 *    - Permite intercambiar implementaciones
 * 
 * ARQUITECTURA:
 * ========================================================================================
 * 
 * CAPA DE SERVICIO:
 * - Encapsula lógica de negocio de búsqueda
 * - Coordina múltiples repositorios
 * - Proporciona validación y transformación de datos
 * 
 * DEPENDENCIAS:
 * - ClienteRepository: Para operaciones de clientes
 * - ContratoRepository: Para operaciones de contratos
 * - Base de datos: Para acceso a datos
 * 
 * FLUJO DE BÚSQUEDA:
 * 1. Validar término de búsqueda
 * 2. Determinar tipo de búsqueda (ID vs texto)
 * 3. Ejecutar búsqueda en repositorio correspondiente
 * 4. Transformar resultados para presentación
 * 5. Manejar errores si ocurren
 * 
 * BENEFICIOS:
 * ========================================================================================
 * - Interfaz unificada para búsquedas
 * - Lógica de negocio centralizada
 * - Fácil testing y mantenimiento
 * - Extensible para nuevas entidades
 * - Manejo robusto de errores
 * - Separación clara de responsabilidades
 */

// ========================================================================================
// IMPORTS Y DEPENDENCIAS
// ========================================================================================
// PRINCIPIO DIP: Dependemos de abstracciones, no de implementaciones concretas

const ClienteRepository = require('../repositories/ClienteRepository');  // Abstracción para operaciones de clientes
const ContratoRepository = require('../repositories/ContratoRepository');  // Abstracción para operaciones de contratos

/**
 * ========================================================================================
 * CLASE PRINCIPAL DEL SERVICIO DE BÚSQUEDA
 * ========================================================================================
 * 
 * DESCRIPCIÓN:
 * Esta clase encapsula toda la lógica de búsqueda del sistema GymMaster.
 * Proporciona métodos para buscar clientes y contratos, así como para generar
 * resúmenes de los resultados encontrados.
 * 
 * PATRÓN SERVICE LAYER:
 * - Encapsula la lógica de negocio de búsqueda
 * - Actúa como intermediario entre la capa de presentación y los repositorios
 * - Proporciona una interfaz unificada para operaciones de búsqueda
 * 
 * PRINCIPIO SRP (Single Responsibility Principle):
 * - Responsabilidad única de búsqueda de entidades
 * - No maneja persistencia ni presentación
 * - Solo se encarga de la lógica de búsqueda
 * 
 * PRINCIPIO DIP (Dependency Inversion Principle):
 * - Depende de abstracciones (repositorios), no de implementaciones concretas
 * - Facilita testing y mantenimiento
 * - Permite intercambiar implementaciones
 */
class BusquedaService {
    /**
     * ========================================================================================
     * CONSTRUCTOR DEL SERVICIO DE BÚSQUEDA
     * ========================================================================================
     * 
     * DESCRIPCIÓN:
     * Inicializa el servicio de búsqueda con las dependencias necesarias.
     * Configura los repositorios para las diferentes entidades del sistema.
     * 
     * PATRÓN DEPENDENCY INJECTION:
     * - Inyección de dependencias a través del constructor
     * - Facilita testing y mantenimiento
     * - Permite intercambiar implementaciones
     * 
     * PRINCIPIO DIP (Dependency Inversion Principle):
     * - Depende de abstracciones (repositorios), no de implementaciones concretas
     * - Facilita testing y mantenimiento
     * - Permite intercambiar implementaciones
     * 
     * DEPENDENCIAS INYECTADAS:
     * - db: Conexión a la base de datos
     * - clienteRepository: Repositorio para operaciones de clientes
     * - contratoRepository: Repositorio para operaciones de contratos
     * 
     * ESTADO INICIAL:
     * - Configuración de repositorios
     * - Establecimiento de conexión a base de datos
     * - Preparación para operaciones de búsqueda
     */
    constructor(db) {
        // PRINCIPIO DIP: Almacenar abstracción de base de datos
        this.db = db;
        
        // PRINCIPIO DIP: Crear instancias de repositorios (abstracciones)
        this.clienteRepository = new ClienteRepository(db);
        this.contratoRepository = new ContratoRepository(db);
    }

    /**
     * ========================================================================================
     * MÉTODO DE BÚSQUEDA DE CLIENTES
     * ========================================================================================
     * 
     * DESCRIPCIÓN:
     * Busca clientes en el sistema por nombre o ID. Implementa una estrategia de búsqueda
     * inteligente que primero intenta buscar por ID exacto y luego por nombre.
     * 
     * ESTRATEGIA DE BÚSQUEDA:
     * 1. Validar término de búsqueda
     * 2. Limpiar y normalizar el término
     * 3. Intentar búsqueda por ID exacto (si es un ObjectId válido)
     * 4. Si no encuentra por ID, buscar por nombre
     * 5. Retornar resultados encontrados
     * 
     * TIPOS DE BÚSQUEDA:
     * - Búsqueda por ID: Usa regex para detectar ObjectId de MongoDB
     * - Búsqueda por nombre: Usa búsqueda de texto en repositorio
     * 
     * VALIDACIONES:
     * - Término de búsqueda no puede estar vacío
     * - Término de búsqueda debe ser una cadena válida
     * - Normalización automática del término
     * 
     * PATRÓN STRATEGY:
     * - Diferentes estrategias de búsqueda (por ID, por nombre)
     * - Selección automática de la estrategia más apropiada
     * - Permite extensión para nuevos tipos de búsqueda
     * 
     * PRINCIPIO SRP (Single Responsibility Principle):
     * - Responsabilidad única de búsqueda de clientes
     * - No maneja persistencia ni presentación
     * - Solo se encarga de la lógica de búsqueda de clientes
     * 
     * PRINCIPIO DIP (Dependency Inversion Principle):
     * - Depende de abstracción clienteRepository
     * - No depende de implementación concreta
     * - Facilita testing y mantenimiento
     * 
     * MANEJO DE ERRORES:
     * - Captura errores de validación y búsqueda
     * - Proporciona mensajes de error claros
     * - Mantiene la integridad del sistema
     * 
     * BENEFICIOS:
     * - Búsqueda inteligente y eficiente
     * - Manejo robusto de errores
     * - Interfaz simple y clara
     * - Fácil testing y mantenimiento
     * 
     * @param {string} termino - Término de búsqueda (nombre o ID)
     * @returns {Promise<Array>} Lista de clientes encontrados
     * @throws {Error} Si el término de búsqueda es inválido o hay error en la búsqueda
     */
    async buscarClientes(termino) {
        try {
            // PRINCIPIO SRP: Validación de entrada
            // Validar que el término de búsqueda no esté vacío
            if (!termino || termino.trim() === '') {
                throw new Error('Término de búsqueda es requerido');
            }

            // PRINCIPIO SRP: Normalización de datos
            // Limpiar y normalizar el término de búsqueda
            const terminoLimpio = termino.trim().toLowerCase();
            
            // PATRÓN STRATEGY: Estrategia de búsqueda por ID
            // Verificar si el término es un ObjectId válido de MongoDB
            if (terminoLimpio.match(/^[0-9a-fA-F]{24}$/)) {
                // PRINCIPIO DIP: Usar abstracción del repositorio
                // NO ES TRANSACCIÓN: Solo operación de LECTURA (SELECT) por ID
                const cliente = await this.clienteRepository.getById(terminoLimpio);
                if (cliente) {
                    return [cliente];
                }
            }

            // PATRÓN STRATEGY: Estrategia de búsqueda por nombre
            // NO ES TRANSACCIÓN: Solo operación de LECTURA (SELECT) por nombre
            const clientes = await this.clienteRepository.searchClients(terminoLimpio);
            return clientes;
        } catch (error) {
            // PRINCIPIO SRP: Manejo centralizado de errores
            throw new Error(`Error al buscar clientes: ${error.message}`);
        }
    }

    /**
     * ========================================================================================
     * MÉTODO DE BÚSQUEDA DE CONTRATOS
     * ========================================================================================
     * 
     * DESCRIPCIÓN:
     * Busca contratos en el sistema por nombre o ID. Implementa la misma estrategia de búsqueda
     * inteligente que el método de clientes, adaptada para la entidad de contratos.
     * 
     * ESTRATEGIA DE BÚSQUEDA:
     * 1. Validar término de búsqueda
     * 2. Limpiar y normalizar el término
     * 3. Intentar búsqueda por ID exacto (si es un ObjectId válido)
     * 4. Si no encuentra por ID, buscar por texto
     * 5. Retornar resultados encontrados
     * 
     * TIPOS DE BÚSQUEDA:
     * - Búsqueda por ID: Usa regex para detectar ObjectId de MongoDB
     * - Búsqueda por texto: Usa búsqueda de texto en repositorio
     * 
     * VALIDACIONES:
     * - Término de búsqueda no puede estar vacío
     * - Término de búsqueda debe ser una cadena válida
     * - Normalización automática del término
     * 
     * PATRÓN STRATEGY:
     * - Diferentes estrategias de búsqueda (por ID, por texto)
     * - Selección automática de la estrategia más apropiada
     * - Permite extensión para nuevos tipos de búsqueda
     * 
     * PRINCIPIO SRP (Single Responsibility Principle):
     * - Responsabilidad única de búsqueda de contratos
     * - No maneja persistencia ni presentación
     * - Solo se encarga de la lógica de búsqueda de contratos
     * 
     * PRINCIPIO DIP (Dependency Inversion Principle):
     * - Depende de abstracción contratoRepository
     * - No depende de implementación concreta
     * - Facilita testing y mantenimiento
     * 
     * MANEJO DE ERRORES:
     * - Captura errores de validación y búsqueda
     * - Proporciona mensajes de error claros
     * - Mantiene la integridad del sistema
     * 
     * BENEFICIOS:
     * - Búsqueda inteligente y eficiente
     * - Manejo robusto de errores
     * - Interfaz simple y clara
     * - Fácil testing y mantenimiento
     * - Consistencia con el método de búsqueda de clientes
     * 
     * @param {string} termino - Término de búsqueda (nombre o ID)
     * @returns {Promise<Array>} Lista de contratos encontrados
     * @throws {Error} Si el término de búsqueda es inválido o hay error en la búsqueda
     */
    async buscarContratos(termino) {
        try {
            // PRINCIPIO SRP: Validación de entrada
            // Validar que el término de búsqueda no esté vacío
            if (!termino || termino.trim() === '') {
                throw new Error('Término de búsqueda es requerido');
            }

            // PRINCIPIO SRP: Normalización de datos
            // Limpiar y normalizar el término de búsqueda
            const terminoLimpio = termino.trim().toLowerCase();
            
            // PATRÓN STRATEGY: Estrategia de búsqueda por ID
            // Verificar si el término es un ObjectId válido de MongoDB
            if (terminoLimpio.match(/^[0-9a-fA-F]{24}$/)) {
                // PRINCIPIO DIP: Usar abstracción del repositorio
                // NO ES TRANSACCIÓN: Solo operación de LECTURA (SELECT) por ID
                const contrato = await this.contratoRepository.getById(terminoLimpio);
                if (contrato) {
                    return [contrato];
                }
            }

            // PATRÓN STRATEGY: Estrategia de búsqueda por texto
            // NO ES TRANSACCIÓN: Solo operación de LECTURA (SELECT) por texto
            const contratos = await this.contratoRepository.search(terminoLimpio);
            return contratos;
        } catch (error) {
            // PRINCIPIO SRP: Manejo centralizado de errores
            throw new Error(`Error al buscar contratos: ${error.message}`);
        }
    }

    /**
     * ========================================================================================
     * MÉTODO DE GENERACIÓN DE RESUMEN DE CLIENTE
     * ========================================================================================
     * 
     * DESCRIPCIÓN:
     * Genera un resumen estructurado de un cliente para facilitar la selección y presentación.
     * Transforma los datos del cliente en un formato consistente y fácil de usar.
     * 
     * FUNCIONALIDADES:
     * - Construcción inteligente del nombre completo
     * - Normalización de datos para presentación
     * - Manejo de campos opcionales
     * - Formateo consistente de información
     * 
     * ESTRATEGIA DE NOMBRE:
     * 1. Usar nombreCompleto si está disponible
     * 2. Construir desde nombre + apellido
     * 3. Usar solo nombre si no hay apellido
     * 4. Extraer nombre del email como último recurso
     * 5. Mostrar "Nombre no disponible" si nada está disponible
     * 
     * CAMPOS INCLUIDOS:
     * - id: Identificador único del cliente
     * - nombre: Nombre completo construido
     * - email: Email del cliente o "No registrado"
     * - telefono: Teléfono del cliente o "No registrado"
     * - activo: Estado de actividad ("Sí" o "No")
     * 
     * PATRÓN STRATEGY:
     * - Diferentes estrategias para construir el nombre
     * - Selección automática de la mejor estrategia disponible
     * - Permite extensión para nuevos tipos de nombre
     * 
     * PRINCIPIO SRP (Single Responsibility Principle):
     * - Responsabilidad única de generar resumen de cliente
     * - No maneja persistencia ni búsqueda
     * - Solo se encarga de la transformación de datos
     * 
     * PRINCIPIO OCP (Open/Closed Principle):
     * - Extensible para nuevos campos sin modificar el método
     * - Se pueden agregar nuevas estrategias de nombre
     * - Cerrado para modificación, abierto para extensión
     * 
     * MANEJO DE DATOS:
     * - Manejo robusto de campos opcionales
     * - Valores por defecto para campos faltantes
     * - Normalización de tipos de datos
     * - Formateo consistente de información
     * 
     * BENEFICIOS:
     * - Presentación consistente de datos
     * - Manejo robusto de datos incompletos
     * - Fácil uso en interfaces de usuario
     * - Mantenimiento simple y claro
     * 
     * @param {Object} cliente - Cliente encontrado en la búsqueda
     * @returns {Object} Resumen estructurado del cliente
     */
    getResumenCliente(cliente) {
        // PATRÓN STRATEGY: Estrategia de construcción de nombre
        // Construir nombre completo usando diferentes estrategias
        let nombreCompleto = 'Nombre no disponible';
        
        // Estrategia 1: Usar nombreCompleto si está disponible
        if (cliente.nombreCompleto) {
            nombreCompleto = cliente.nombreCompleto;
        } 
        // Estrategia 2: Construir desde nombre + apellido
        else if (cliente.nombre && cliente.apellido) {
            nombreCompleto = `${cliente.nombre} ${cliente.apellido}`;
        } 
        // Estrategia 3: Usar solo nombre
        else if (cliente.nombre) {
            nombreCompleto = cliente.nombre;
        } 
        // Estrategia 4: Extraer nombre del email
        else if (cliente.email) {
            nombreCompleto = cliente.email.split('@')[0];
        }
        
        // PRINCIPIO SRP: Transformación de datos
        // Retornar resumen estructurado del cliente
        return {
            id: cliente.clienteId ? cliente.clienteId.toString() : cliente._id.toString(),
            nombre: nombreCompleto,
            email: cliente.email || 'No registrado',
            telefono: cliente.telefono || 'No registrado',
            activo: cliente.activo ? 'Sí' : 'No'
        };
    }

    /**
     * ========================================================================================
     * MÉTODO DE GENERACIÓN DE RESUMEN DE CONTRATO
     * ========================================================================================
     * 
     * DESCRIPCIÓN:
     * Genera un resumen estructurado de un contrato para facilitar la selección y presentación.
     * Transforma los datos del contrato en un formato consistente y fácil de usar.
     * 
     * FUNCIONALIDADES:
     * - Normalización de datos para presentación
     * - Formateo consistente de información
     * - Manejo de campos obligatorios
     * - Transformación de tipos de datos
     * 
     * CAMPOS INCLUIDOS:
     * - id: Identificador único del contrato
     * - cliente: ID del cliente asociado
     * - plan: ID del plan de entrenamiento
     * - fechaInicio: Fecha de inicio del contrato
     * - fechaFin: Fecha de fin del contrato
     * - precio: Precio del contrato
     * - estado: Estado actual del contrato
     * 
     * TRANSFORMACIONES:
     * - Conversión de IDs a string para consistencia
     * - Preservación de fechas y precios
     * - Mantenimiento del estado original
     * 
     * PRINCIPIO SRP (Single Responsibility Principle):
     * - Responsabilidad única de generar resumen de contrato
     * - No maneja persistencia ni búsqueda
     * - Solo se encarga de la transformación de datos
     * 
     * PRINCIPIO OCP (Open/Closed Principle):
     * - Extensible para nuevos campos sin modificar el método
     * - Se pueden agregar nuevas transformaciones
     * - Cerrado para modificación, abierto para extensión
     * 
     * MANEJO DE DATOS:
     * - Transformación de tipos de datos
     * - Preservación de información original
     * - Formateo consistente de información
     * - Manejo de campos obligatorios
     * 
     * BENEFICIOS:
     * - Presentación consistente de datos
     * - Fácil uso en interfaces de usuario
     * - Mantenimiento simple y claro
     * - Transformación eficiente de datos
     * 
     * @param {Object} contrato - Contrato encontrado en la búsqueda
     * @returns {Object} Resumen estructurado del contrato
     */
    getResumenContrato(contrato) {
        // PRINCIPIO SRP: Transformación de datos
        // Retornar resumen estructurado del contrato
        return {
            id: contrato.contratoId.toString(),
            cliente: contrato.clienteId.toString(),
            plan: contrato.planId.toString(),
            fechaInicio: contrato.fechaInicio,
            fechaFin: contrato.fechaFin,
            precio: contrato.precio,
            estado: contrato.estado
        };
    }
}

/**
 * ========================================================================================
 * EXPORTACIÓN DEL MÓDULO - PATRÓN MODULE
 * ========================================================================================
 * 
 * DESCRIPCIÓN:
 * Exporta la clase BusquedaService para uso en otros módulos del sistema.
 * Permite que otros archivos importen y usen la funcionalidad de búsqueda.
 * 
 * PATRÓN MODULE:
 * - Encapsula funcionalidad relacionada de búsqueda
 * - Permite reutilización en otros módulos
 * - Facilita la organización del código
 * - Mantiene la separación de responsabilidades
 * 
 * PRINCIPIO OCP (Open/Closed Principle):
 * - Permite extensión sin modificación
 * - Se pueden crear subclases de BusquedaService
 * - Se pueden agregar nuevas funcionalidades
 * - Cerrado para modificación, abierto para extensión
 * 
 * USO EN OTROS MÓDULOS:
 * - Importación: const BusquedaService = require('./services/BusquedaService');
 * - Instanciación: const busquedaService = new BusquedaService(db);
 * - Uso: const clientes = await busquedaService.buscarClientes(termino);
 * 
 * BENEFICIOS:
 * - Reutilización de código
 * - Fácil testing y debugging
 * - Organización modular
 * - Extensibilidad
 * - Separación clara de responsabilidades
 */
module.exports = BusquedaService;
