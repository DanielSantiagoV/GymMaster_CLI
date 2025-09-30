// ===== IMPORTS Y DEPENDENCIAS =====
// Importación de utilidades para manejo de fechas
// PATRÓN: Dependency Injection - Se inyectan las dependencias a través del constructor
// PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (dayjs) no de implementaciones concretas
const dayjs = require('dayjs'); // Utilidad para manejo de fechas y tiempo

/**
 * Servicio para análisis de progreso físico
 * Compara datos actuales con anteriores y proporciona retroalimentación
 * 
 * PATRÓN: Service Layer - Capa de servicio que proporciona análisis de progreso
 * PATRÓN: Strategy - Diferentes estrategias de análisis según el tipo de métrica
 * PATRÓN: Template Method - Define el flujo estándar de análisis de progreso
 * PATRÓN: Data Transfer Object (DTO) - Proporciona análisis estructurados
 * PRINCIPIO SOLID S: Responsabilidad Única - Se encarga únicamente del análisis de progreso físico
 * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas métricas sin modificar código existente
 * PRINCIPIO SOLID D: Inversión de Dependencias - No depende de implementaciones externas
 * 
 * NOTA: Este servicio NO maneja transacciones ya que solo realiza análisis de datos
 * BUENA PRÁCTICA: Servicio especializado en análisis de progreso físico
 */
class ProgresoService {
    /**
     * Constructor del servicio de análisis de progreso
     * 
     * PATRÓN: Registry - Inicializa el registro de mensajes motivacionales
     * PATRÓN: Data Transfer Object (DTO) - Estructura mensajes como objetos
     * PRINCIPIO SOLID S: Responsabilidad de inicializar mensajes motivacionales
     * PRINCIPIO SOLID O: Extensible para nuevos tipos de mensajes
     * BUENA PRÁCTICA: Inicialización de mensajes motivacionales en constructor
     */
    constructor() {
        // ===== REGISTRO DE MENSAJES MOTIVACIONALES =====
        // PATRÓN: Registry - Registra todos los mensajes motivacionales disponibles
        // PATRÓN: Data Transfer Object (DTO) - Estructura mensajes como objetos
        // PRINCIPIO SOLID S: Responsabilidad de almacenar mensajes motivacionales
        // PRINCIPIO SOLID O: Fácil agregar nuevos mensajes sin modificar código existente
        this.mensajesMotivacionales = {
            // ===== MENSAJES PARA ANÁLISIS DE PESO =====
            // PATRÓN: Strategy - Diferentes estrategias de mensajes según el estado del peso
            // PATRÓN: Data Transfer Object (DTO) - Estructura mensajes como objetos
            // PRINCIPIO SOLID S: Responsabilidad de proporcionar mensajes específicos para peso
            // PRINCIPIO SOLID O: Extensible para nuevos mensajes sin modificar código existente
            peso: {
                // Mensajes motivacionales para mejoras en el peso
                // PATRÓN: Strategy - Estrategia de mensajes positivos
                // PRINCIPIO SOLID S: Responsabilidad de proporcionar mensajes de mejora
                mejora: [
                    "🎉 ¡Excelente! Has perdido peso de manera saludable",
                    "💪 ¡Increíble progreso! Tu dedicación está dando resultados",
                    "🏆 ¡Fantástico! Cada gramo perdido es un paso hacia tu meta",
                    "⭐ ¡Súper! Tu constancia en el entrenamiento se refleja en tu peso"
                ],
                // Mensajes motivacionales para empeoramientos en el peso
                // PATRÓN: Strategy - Estrategia de mensajes de apoyo
                // PRINCIPIO SOLID S: Responsabilidad de proporcionar mensajes de apoyo
                empeora: [
                    "📈 No te preocupes, es normal tener fluctuaciones de peso",
                    "💪 Recuerda que el peso no es el único indicador de progreso",
                    "🔄 Mantén la constancia, los resultados llegarán",
                    "💡 Revisa tu alimentación y rutina de ejercicios"
                ]
            },
            // ===== MENSAJES PARA ANÁLISIS DE GRASA CORPORAL =====
            // PATRÓN: Strategy - Diferentes estrategias de mensajes según el estado de la grasa corporal
            // PATRÓN: Data Transfer Object (DTO) - Estructura mensajes como objetos
            // PRINCIPIO SOLID S: Responsabilidad de proporcionar mensajes específicos para grasa corporal
            // PRINCIPIO SOLID O: Extensible para nuevos mensajes sin modificar código existente
            grasaCorporal: {
                // Mensajes motivacionales para mejoras en la grasa corporal
                // PATRÓN: Strategy - Estrategia de mensajes positivos
                // PRINCIPIO SOLID S: Responsabilidad de proporcionar mensajes de mejora
                mejora: [
                    "🔥 ¡Increíble! Tu porcentaje de grasa corporal ha mejorado",
                    "💪 ¡Excelente trabajo! Tu composición corporal está mejorando",
                    "🏆 ¡Fantástico! Menos grasa, más músculo",
                    "⭐ ¡Súper progreso! Tu cuerpo se está transformando"
                ],
                // Mensajes motivacionales para empeoramientos en la grasa corporal
                // PATRÓN: Strategy - Estrategia de mensajes de apoyo
                // PRINCIPIO SOLID S: Responsabilidad de proporcionar mensajes de apoyo
                empeora: [
                    "📊 Es normal que la grasa corporal fluctúe",
                    "💪 Enfócate en la consistencia en tu entrenamiento",
                    "🔄 La grasa corporal puede variar por varios factores",
                    "💡 Mantén una alimentación balanceada y ejercicio regular"
                ]
            },
            // ===== MENSAJES PARA ANÁLISIS DE MEDIDAS CORPORALES =====
            // PATRÓN: Strategy - Diferentes estrategias de mensajes según el estado de las medidas
            // PATRÓN: Data Transfer Object (DTO) - Estructura mensajes como objetos
            // PRINCIPIO SOLID S: Responsabilidad de proporcionar mensajes específicos para medidas
            // PRINCIPIO SOLID O: Extensible para nuevos mensajes sin modificar código existente
            medidas: {
                // Mensajes motivacionales para mejoras en las medidas corporales
                // PATRÓN: Strategy - Estrategia de mensajes positivos
                // PRINCIPIO SOLID S: Responsabilidad de proporcionar mensajes de mejora
                mejora: [
                    "📏 ¡Excelente! Tus medidas han mejorado significativamente",
                    "💪 ¡Increíble progreso! Tu cuerpo se está moldeando",
                    "🏆 ¡Fantástico! Cada centímetro cuenta en tu transformación",
                    "⭐ ¡Súper! Tus medidas reflejan tu dedicación"
                ],
                // Mensajes motivacionales para empeoramientos en las medidas corporales
                // PATRÓN: Strategy - Estrategia de mensajes de apoyo
                // PRINCIPIO SOLID S: Responsabilidad de proporcionar mensajes de apoyo
                empeora: [
                    "📊 Las medidas pueden variar por varios factores",
                    "💪 No te desanimes, el progreso no siempre es lineal",
                    "🔄 Mantén la constancia, los resultados se verán",
                    "💡 Revisa tu rutina y alimentación"
                ]
            }
        };
    }

    /**
     * Analiza el progreso de un seguimiento comparado con el anterior
     * @param {Object} seguimientoActual - Seguimiento actual
     * @param {Object} seguimientoAnterior - Seguimiento anterior
     * @returns {Object} Análisis de progreso
     * 
     * PATRÓN: Template Method - Define el flujo estándar de análisis de progreso
     * PATRÓN: Strategy - Diferentes estrategias de análisis según el tipo de métrica
     * PATRÓN: Data Transfer Object (DTO) - Retorna análisis estructurado
     * PATRÓN: Aggregator - Agrega resultados de múltiples análisis
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de analizar progreso
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas métricas
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para análisis
     * PRINCIPIO SOLID D: Inversión de Dependencias - No depende de implementaciones externas
     * 
     * NOTA: No hay transacciones ya que solo realiza análisis de datos
     * BUENA PRÁCTICA: Método principal que orquesta el análisis de progreso
     */
    analizarProgreso(seguimientoActual, seguimientoAnterior) {
        // ===== INICIALIZACIÓN DEL ANÁLISIS =====
        // PATRÓN: Template Method - Define el flujo estándar de análisis
        // PATRÓN: Data Transfer Object (DTO) - Estructura análisis como objeto
        // PRINCIPIO SOLID S: Responsabilidad de inicializar el análisis
        const analisis = {
            // ===== ANÁLISIS DE PESO =====
            // PATRÓN: Strategy - Delegación de análisis específico
            // PRINCIPIO SOLID S: Delegación de responsabilidad de análisis de peso
            peso: this.analizarPeso(seguimientoActual.peso, seguimientoAnterior.peso),
            
            // ===== ANÁLISIS DE GRASA CORPORAL =====
            // PATRÓN: Strategy - Delegación de análisis específico
            // PRINCIPIO SOLID S: Delegación de responsabilidad de análisis de grasa corporal
            grasaCorporal: this.analizarGrasaCorporal(seguimientoActual.grasaCorporal, seguimientoAnterior.grasaCorporal),
            
            // ===== ANÁLISIS DE MEDIDAS CORPORALES =====
            // PATRÓN: Strategy - Delegación de análisis específico
            // PRINCIPIO SOLID S: Delegación de responsabilidad de análisis de medidas
            medidas: this.analizarMedidas(seguimientoActual.medidas, seguimientoAnterior.medidas),
            
            // ===== RESUMEN INICIAL =====
            // PATRÓN: Data Transfer Object (DTO) - Estructura resumen como objeto
            // PRINCIPIO SOLID S: Responsabilidad de inicializar resumen
            resumen: {
                mejoras: 0, // Contador de mejoras
                empeoramientos: 0, // Contador de empeoramientos
                sinCambios: 0 // Contador de sin cambios
            }
        };

        // ===== CÁLCULO DEL RESUMEN =====
        // PATRÓN: Aggregator - Agrega resultados de múltiples análisis
        // PRINCIPIO SOLID S: Responsabilidad de calcular resumen
        const metricas = [analisis.peso, analisis.grasaCorporal, ...Object.values(analisis.medidas)];
        
        // PATRÓN: Iterator - Itera sobre todas las métricas
        // PRINCIPIO SOLID S: Responsabilidad de procesar cada métrica
        metricas.forEach(metrica => {
            if (metrica && metrica.estado) {
                // PATRÓN: Strategy - Diferentes estrategias según el estado
                if (metrica.estado === 'mejora') analisis.resumen.mejoras++;
                else if (metrica.estado === 'empeora') analisis.resumen.empeoramientos++;
                else analisis.resumen.sinCambios++;
            }
        });

        // ===== RETORNO DEL ANÁLISIS COMPLETO =====
        // PATRÓN: Data Transfer Object (DTO) - Retorna análisis estructurado
        // PRINCIPIO SOLID S: Responsabilidad de retornar análisis completo
        return analisis;
    }

    /**
     * Analiza el progreso del peso
     * @param {number} pesoActual - Peso actual
     * @param {number} pesoAnterior - Peso anterior
     * @returns {Object} Análisis del peso
     * 
     * PATRÓN: Strategy - Estrategia específica para análisis de peso
     * PATRÓN: Data Transfer Object (DTO) - Retorna análisis estructurado
     * PATRÓN: Guard Clause - Validaciones tempranas
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de analizar peso
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas métricas de peso
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para peso
     * PRINCIPIO SOLID D: Inversión de Dependencias - No depende de implementaciones externas
     * 
     * NOTA: No hay transacciones ya que solo realiza análisis de datos
     * BUENA PRÁCTICA: Método especializado en análisis de peso
     */
    analizarPeso(pesoActual, pesoAnterior) {
        // ===== VALIDACIÓN DE DATOS =====
        // PATRÓN: Guard Clause - Validación temprana de datos
        // PRINCIPIO SOLID S: Responsabilidad de validar datos de entrada
        if (!pesoActual || !pesoAnterior) return null;

        // ===== CÁLCULO DE DIFERENCIAS =====
        // PATRÓN: Strategy - Cálculo específico para peso
        // PRINCIPIO SOLID S: Responsabilidad de calcular diferencias
        const diferencia = pesoActual - pesoAnterior; // Diferencia en peso
        const porcentaje = Math.abs((diferencia / pesoAnterior) * 100); // Porcentaje de cambio

        // ===== CONSTRUCCIÓN DEL ANÁLISIS =====
        // PATRÓN: Data Transfer Object (DTO) - Estructura análisis como objeto
        // PATRÓN: Strategy - Diferentes estrategias según el estado
        // PRINCIPIO SOLID S: Responsabilidad de construir análisis completo
        return {
            actual: pesoActual, // Peso actual
            anterior: pesoAnterior, // Peso anterior
            diferencia: diferencia, // Diferencia en peso
            porcentaje: porcentaje, // Porcentaje de cambio
            // PATRÓN: Strategy - Diferentes estrategias según el estado
            // PRINCIPIO SOLID S: Responsabilidad de determinar estado
            estado: diferencia < 0 ? 'mejora' : diferencia > 0 ? 'empeora' : 'sinCambio',
            // PATRÓN: Strategy - Delegación de mensaje según estado
            // PRINCIPIO SOLID S: Delegación de responsabilidad de mensaje
            mensaje: this.obtenerMensaje('peso', diferencia < 0 ? 'mejora' : diferencia > 0 ? 'empeora' : 'sinCambio'),
            // PATRÓN: Strategy - Diferentes umbrales según la métrica
            // PRINCIPIO SOLID S: Responsabilidad de determinar significancia
            significativo: porcentaje >= 2 // Cambio significativo si es >= 2%
        };
    }

    /**
     * Analiza el progreso de la grasa corporal
     * @param {number} grasaActual - Grasa corporal actual
     * @param {number} grasaAnterior - Grasa corporal anterior
     * @returns {Object} Análisis de la grasa corporal
     * 
     * PATRÓN: Strategy - Estrategia específica para análisis de grasa corporal
     * PATRÓN: Data Transfer Object (DTO) - Retorna análisis estructurado
     * PATRÓN: Guard Clause - Validaciones tempranas
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de analizar grasa corporal
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas métricas de grasa corporal
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para grasa corporal
     * PRINCIPIO SOLID D: Inversión de Dependencias - No depende de implementaciones externas
     * 
     * NOTA: No hay transacciones ya que solo realiza análisis de datos
     * BUENA PRÁCTICA: Método especializado en análisis de grasa corporal
     */
    analizarGrasaCorporal(grasaActual, grasaAnterior) {
        // ===== VALIDACIÓN DE DATOS =====
        // PATRÓN: Guard Clause - Validación temprana de datos
        // PRINCIPIO SOLID S: Responsabilidad de validar datos de entrada
        if (!grasaActual || !grasaAnterior) return null;

        // ===== CÁLCULO DE DIFERENCIAS =====
        // PATRÓN: Strategy - Cálculo específico para grasa corporal
        // PRINCIPIO SOLID S: Responsabilidad de calcular diferencias
        const diferencia = grasaActual - grasaAnterior; // Diferencia en grasa corporal
        const porcentaje = Math.abs((diferencia / grasaAnterior) * 100); // Porcentaje de cambio

        // ===== CONSTRUCCIÓN DEL ANÁLISIS =====
        // PATRÓN: Data Transfer Object (DTO) - Estructura análisis como objeto
        // PATRÓN: Strategy - Diferentes estrategias según el estado
        // PRINCIPIO SOLID S: Responsabilidad de construir análisis completo
        return {
            actual: grasaActual, // Grasa corporal actual
            anterior: grasaAnterior, // Grasa corporal anterior
            diferencia: diferencia, // Diferencia en grasa corporal
            porcentaje: porcentaje, // Porcentaje de cambio
            // PATRÓN: Strategy - Diferentes estrategias según el estado
            // PRINCIPIO SOLID S: Responsabilidad de determinar estado
            estado: diferencia < 0 ? 'mejora' : diferencia > 0 ? 'empeora' : 'sinCambio',
            // PATRÓN: Strategy - Delegación de mensaje según estado
            // PRINCIPIO SOLID S: Delegación de responsabilidad de mensaje
            mensaje: this.obtenerMensaje('grasaCorporal', diferencia < 0 ? 'mejora' : diferencia > 0 ? 'empeora' : 'sinCambio'),
            // PATRÓN: Strategy - Diferentes umbrales según la métrica
            // PRINCIPIO SOLID S: Responsabilidad de determinar significancia
            significativo: porcentaje >= 5 // Cambio significativo si es >= 5%
        };
    }

    /**
     * Analiza el progreso de las medidas corporales
     * @param {Object} medidasActuales - Medidas actuales
     * @param {Object} medidasAnteriores - Medidas anteriores
     * @returns {Object} Análisis de las medidas
     * 
     * PATRÓN: Strategy - Estrategia específica para análisis de medidas corporales
     * PATRÓN: Data Transfer Object (DTO) - Retorna análisis estructurado
     * PATRÓN: Iterator - Itera sobre tipos de medidas
     * PATRÓN: Guard Clause - Validaciones tempranas
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de analizar medidas corporales
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas medidas
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para medidas
     * PRINCIPIO SOLID D: Inversión de Dependencias - No depende de implementaciones externas
     * 
     * NOTA: No hay transacciones ya que solo realiza análisis de datos
     * BUENA PRÁCTICA: Método especializado en análisis de medidas corporales
     */
    analizarMedidas(medidasActuales, medidasAnteriores) {
        // ===== INICIALIZACIÓN DEL ANÁLISIS =====
        // PATRÓN: Data Transfer Object (DTO) - Estructura análisis como objeto
        // PRINCIPIO SOLID S: Responsabilidad de inicializar análisis
        const analisis = {};

        // ===== DEFINICIÓN DE TIPOS DE MEDIDAS =====
        // PATRÓN: Strategy - Diferentes estrategias según el tipo de medida
        // PRINCIPIO SOLID S: Responsabilidad de definir tipos de medidas
        const tiposMedidas = ['cintura', 'brazo', 'pecho'];
        
        // ===== ANÁLISIS DE CADA TIPO DE MEDIDA =====
        // PATRÓN: Iterator - Itera sobre todos los tipos de medidas
        // PRINCIPIO SOLID S: Responsabilidad de procesar cada tipo de medida
        tiposMedidas.forEach(tipo => {
            // ===== EXTRACCIÓN DE DATOS =====
            // PATRÓN: Guard Clause - Validación temprana de datos
            // PRINCIPIO SOLID S: Responsabilidad de extraer datos específicos
            const actual = medidasActuales?.[tipo];
            const anterior = medidasAnteriores?.[tipo];

            // ===== VALIDACIÓN Y ANÁLISIS =====
            // PATRÓN: Guard Clause - Validación de existencia de datos
            // PRINCIPIO SOLID S: Responsabilidad de validar datos
            if (actual && anterior) {
                // ===== CÁLCULO DE DIFERENCIAS =====
                // PATRÓN: Strategy - Cálculo específico para cada medida
                // PRINCIPIO SOLID S: Responsabilidad de calcular diferencias
                const diferencia = actual - anterior; // Diferencia en la medida
                const porcentaje = Math.abs((diferencia / anterior) * 100); // Porcentaje de cambio

                // ===== CONSTRUCCIÓN DEL ANÁLISIS =====
                // PATRÓN: Data Transfer Object (DTO) - Estructura análisis como objeto
                // PATRÓN: Strategy - Diferentes estrategias según el tipo
                // PRINCIPIO SOLID S: Responsabilidad de construir análisis completo
                analisis[tipo] = {
                    actual: actual, // Medida actual
                    anterior: anterior, // Medida anterior
                    diferencia: diferencia, // Diferencia en la medida
                    porcentaje: porcentaje, // Porcentaje de cambio
                    // PATRÓN: Strategy - Delegación de determinación de estado
                    // PRINCIPIO SOLID S: Delegación de responsabilidad de estado
                    estado: this.determinarEstadoMedida(tipo, diferencia),
                    // PATRÓN: Strategy - Delegación de mensaje según tipo
                    // PRINCIPIO SOLID S: Delegación de responsabilidad de mensaje
                    mensaje: this.obtenerMensajeMedida(tipo, diferencia),
                    // PATRÓN: Strategy - Diferentes umbrales según la métrica
                    // PRINCIPIO SOLID S: Responsabilidad de determinar significancia
                    significativo: porcentaje >= 3 // Cambio significativo si es >= 3%
                };
            }
        });

        // ===== RETORNO DEL ANÁLISIS =====
        // PATRÓN: Data Transfer Object (DTO) - Retorna análisis estructurado
        // PRINCIPIO SOLID S: Responsabilidad de retornar análisis completo
        return analisis;
    }

    /**
     * Determina el estado de una medida corporal
     * @param {string} tipo - Tipo de medida
     * @param {number} diferencia - Diferencia en la medida
     * @returns {string} Estado de la medida
     * 
     * PATRÓN: Strategy - Diferentes estrategias según el tipo de medida
     * PATRÓN: Guard Clause - Validaciones tempranas
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de determinar estado de medidas
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevos tipos de medidas
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para determinación de estado
     * PRINCIPIO SOLID D: Inversión de Dependencias - No depende de implementaciones externas
     * 
     * NOTA: No hay transacciones ya que solo realiza lógica de negocio
     * BUENA PRÁCTICA: Método especializado en determinación de estado de medidas
     */
    determinarEstadoMedida(tipo, diferencia) {
        // ===== ESTRATEGIA PARA CINTURA =====
        // PATRÓN: Strategy - Estrategia específica para cintura
        // PRINCIPIO SOLID S: Responsabilidad de determinar estado de cintura
        // Para cintura, menos es mejor (reducción de cintura es positiva)
        if (tipo === 'cintura') {
            return diferencia < 0 ? 'mejora' : diferencia > 0 ? 'empeora' : 'sinCambio';
        }
        // ===== ESTRATEGIA PARA BRAZO Y PECHO =====
        // PATRÓN: Strategy - Estrategia específica para brazo y pecho
        // PRINCIPIO SOLID S: Responsabilidad de determinar estado de brazo y pecho
        // Para brazo y pecho, más puede ser mejor (aumento de músculo es positivo)
        else if (tipo === 'brazo' || tipo === 'pecho') {
            return diferencia > 0 ? 'mejora' : diferencia < 0 ? 'empeora' : 'sinCambio';
        }
        
        // ===== ESTADO POR DEFECTO =====
        // PATRÓN: Strategy - Estrategia por defecto
        // PRINCIPIO SOLID S: Responsabilidad de proporcionar estado por defecto
        return 'sinCambio';
    }

    /**
     * Obtiene mensaje motivacional para una métrica
     * @param {string} tipo - Tipo de métrica
     * @param {string} estado - Estado del progreso
     * @returns {string} Mensaje motivacional
     * 
     * PATRÓN: Strategy - Diferentes estrategias de mensajes según el tipo y estado
     * PATRÓN: Registry - Busca mensajes en el registro
     * PATRÓN: Random - Selección aleatoria de mensajes
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener mensajes
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevos tipos de mensajes
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para mensajes
     * PRINCIPIO SOLID D: Inversión de Dependencias - No depende de implementaciones externas
     * 
     * NOTA: No hay transacciones ya que solo accede a datos estáticos
     * BUENA PRÁCTICA: Método especializado en obtención de mensajes motivacionales
     */
    obtenerMensaje(tipo, estado) {
        // ===== BÚSQUEDA DE MENSAJES =====
        // PATRÓN: Registry - Busca mensajes en el registro
        // PRINCIPIO SOLID S: Responsabilidad de buscar mensajes específicos
        const mensajes = this.mensajesMotivacionales[tipo];
        
        // ===== VALIDACIÓN DE EXISTENCIA =====
        // PATRÓN: Guard Clause - Validación temprana de existencia
        // PRINCIPIO SOLID S: Responsabilidad de validar existencia de mensajes
        if (!mensajes || !mensajes[estado]) return '';
        
        // ===== SELECCIÓN ALEATORIA =====
        // PATRÓN: Random - Selección aleatoria de mensajes
        // PATRÓN: Strategy - Diferentes estrategias según el estado
        // PRINCIPIO SOLID S: Responsabilidad de seleccionar mensaje aleatorio
        const mensajesDisponibles = mensajes[estado];
        return mensajesDisponibles[Math.floor(Math.random() * mensajesDisponibles.length)];
    }

    /**
     * Obtiene mensaje para medidas corporales
     * @param {string} tipo - Tipo de medida
     * @param {number} diferencia - Diferencia en la medida
     * @returns {string} Mensaje motivacional
     * 
     * PATRÓN: Strategy - Diferentes estrategias de mensajes según el tipo de medida
     * PATRÓN: Registry - Busca mensajes en el registro
     * PATRÓN: Random - Selección aleatoria de mensajes
     * PATRÓN: Template Method - Define el flujo estándar de obtención de mensajes
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener mensajes para medidas
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevos tipos de medidas
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para medidas
     * PRINCIPIO SOLID D: Inversión de Dependencias - No depende de implementaciones externas
     * 
     * NOTA: No hay transacciones ya que solo accede a datos estáticos
     * BUENA PRÁCTICA: Método especializado en obtención de mensajes para medidas
     */
    obtenerMensajeMedida(tipo, diferencia) {
        // ===== DETERMINACIÓN DE ESTADO =====
        // PATRÓN: Strategy - Delegación de determinación de estado
        // PRINCIPIO SOLID S: Delegación de responsabilidad de estado
        const estado = this.determinarEstadoMedida(tipo, diferencia);
        
        // ===== BÚSQUEDA DE MENSAJES =====
        // PATRÓN: Registry - Busca mensajes en el registro
        // PRINCIPIO SOLID S: Responsabilidad de buscar mensajes específicos
        const mensajes = this.mensajesMotivacionales.medidas;
        
        // ===== VALIDACIÓN DE EXISTENCIA =====
        // PATRÓN: Guard Clause - Validación temprana de existencia
        // PRINCIPIO SOLID S: Responsabilidad de validar existencia de mensajes
        if (!mensajes || !mensajes[estado]) return '';
        
        // ===== SELECCIÓN ALEATORIA =====
        // PATRÓN: Random - Selección aleatoria de mensajes
        // PATRÓN: Strategy - Diferentes estrategias según el estado
        // PRINCIPIO SOLID S: Responsabilidad de seleccionar mensaje aleatorio
        const mensajesDisponibles = mensajes[estado];
        return mensajesDisponibles[Math.floor(Math.random() * mensajesDisponibles.length)];
    }

    /**
     * Genera un resumen motivacional del progreso
     * @param {Object} analisis - Análisis de progreso
     * @returns {string} Resumen motivacional
     * 
     * PATRÓN: Strategy - Diferentes estrategias de resumen según el estado del progreso
     * PATRÓN: Template Method - Define el flujo estándar de generación de resumen
     * PATRÓN: Data Transfer Object (DTO) - Procesa análisis estructurado
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de generar resumen motivacional
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevos tipos de resumen
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para resumen
     * PRINCIPIO SOLID D: Inversión de Dependencias - No depende de implementaciones externas
     * 
     * NOTA: No hay transacciones ya que solo genera resumen de datos
     * BUENA PRÁCTICA: Método especializado en generación de resumen motivacional
     */
    generarResumenMotivacional(analisis) {
        // ===== EXTRACCIÓN DE DATOS DEL RESUMEN =====
        // PATRÓN: Data Transfer Object (DTO) - Extrae datos del análisis
        // PRINCIPIO SOLID S: Responsabilidad de extraer datos del resumen
        const { mejoras, empeoramientos, sinCambios } = analisis.resumen;
        
        // ===== ESTRATEGIA PARA MEJORAS MAYORITARIAS =====
        // PATRÓN: Strategy - Estrategia para mejoras mayoritarias
        // PRINCIPIO SOLID S: Responsabilidad de generar mensaje para mejoras
        if (mejoras > empeoramientos) {
            return "🎉 ¡Excelente progreso! Has mejorado en la mayoría de tus métricas. ¡Sigue así!";
        }
        // ===== ESTRATEGIA PARA EMPEORAMIENTOS MAYORITARIOS =====
        // PATRÓN: Strategy - Estrategia para empeoramientos mayoritarios
        // PRINCIPIO SOLID S: Responsabilidad de generar mensaje de apoyo
        else if (empeoramientos > mejoras) {
            return "💪 No te desanimes, el progreso no siempre es lineal. Mantén la constancia y los resultados llegarán.";
        }
        // ===== ESTRATEGIA PARA PROGRESO MIXTO =====
        // PATRÓN: Strategy - Estrategia para progreso mixto
        // PRINCIPIO SOLID S: Responsabilidad de generar mensaje para progreso mixto
        else if (mejoras === empeoramientos && mejoras > 0) {
            return "⚖️ Tienes un progreso mixto. Algunas métricas mejoraron y otras no. ¡Sigue trabajando!";
        }
        // ===== ESTRATEGIA PARA ESTABILIDAD =====
        // PATRÓN: Strategy - Estrategia para estabilidad
        // PRINCIPIO SOLID S: Responsabilidad de generar mensaje para estabilidad
        else {
            return "📊 Tus métricas se mantuvieron estables. La consistencia es clave para el progreso a largo plazo.";
        }
    }
}

// ===== EXPORTACIÓN DEL MÓDULO =====
// PATRÓN: Module Pattern - Exporta la clase como módulo
// PRINCIPIO SOLID S: Responsabilidad de proporcionar la interfaz pública del servicio
module.exports = ProgresoService;
