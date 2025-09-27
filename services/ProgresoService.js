const dayjs = require('dayjs');

/**
 * Servicio para análisis de progreso físico
 * Compara datos actuales con anteriores y proporciona retroalimentación
 */
class ProgresoService {
    constructor() {
        this.mensajesMotivacionales = {
            peso: {
                mejora: [
                    "🎉 ¡Excelente! Has perdido peso de manera saludable",
                    "💪 ¡Increíble progreso! Tu dedicación está dando resultados",
                    "🏆 ¡Fantástico! Cada gramo perdido es un paso hacia tu meta",
                    "⭐ ¡Súper! Tu constancia en el entrenamiento se refleja en tu peso"
                ],
                empeora: [
                    "📈 No te preocupes, es normal tener fluctuaciones de peso",
                    "💪 Recuerda que el peso no es el único indicador de progreso",
                    "🔄 Mantén la constancia, los resultados llegarán",
                    "💡 Revisa tu alimentación y rutina de ejercicios"
                ]
            },
            grasaCorporal: {
                mejora: [
                    "🔥 ¡Increíble! Tu porcentaje de grasa corporal ha mejorado",
                    "💪 ¡Excelente trabajo! Tu composición corporal está mejorando",
                    "🏆 ¡Fantástico! Menos grasa, más músculo",
                    "⭐ ¡Súper progreso! Tu cuerpo se está transformando"
                ],
                empeora: [
                    "📊 Es normal que la grasa corporal fluctúe",
                    "💪 Enfócate en la consistencia en tu entrenamiento",
                    "🔄 La grasa corporal puede variar por varios factores",
                    "💡 Mantén una alimentación balanceada y ejercicio regular"
                ]
            },
            medidas: {
                mejora: [
                    "📏 ¡Excelente! Tus medidas han mejorado significativamente",
                    "💪 ¡Increíble progreso! Tu cuerpo se está moldeando",
                    "🏆 ¡Fantástico! Cada centímetro cuenta en tu transformación",
                    "⭐ ¡Súper! Tus medidas reflejan tu dedicación"
                ],
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
     */
    analizarProgreso(seguimientoActual, seguimientoAnterior) {
        const analisis = {
            peso: this.analizarPeso(seguimientoActual.peso, seguimientoAnterior.peso),
            grasaCorporal: this.analizarGrasaCorporal(seguimientoActual.grasaCorporal, seguimientoAnterior.grasaCorporal),
            medidas: this.analizarMedidas(seguimientoActual.medidas, seguimientoAnterior.medidas),
            resumen: {
                mejoras: 0,
                empeoramientos: 0,
                sinCambios: 0
            }
        };

        // Calcular resumen
        const metricas = [analisis.peso, analisis.grasaCorporal, ...Object.values(analisis.medidas)];
        metricas.forEach(metrica => {
            if (metrica && metrica.estado) {
                if (metrica.estado === 'mejora') analisis.resumen.mejoras++;
                else if (metrica.estado === 'empeora') analisis.resumen.empeoramientos++;
                else analisis.resumen.sinCambios++;
            }
        });

        return analisis;
    }

    /**
     * Analiza el progreso del peso
     * @param {number} pesoActual - Peso actual
     * @param {number} pesoAnterior - Peso anterior
     * @returns {Object} Análisis del peso
     */
    analizarPeso(pesoActual, pesoAnterior) {
        if (!pesoActual || !pesoAnterior) return null;

        const diferencia = pesoActual - pesoAnterior;
        const porcentaje = Math.abs((diferencia / pesoAnterior) * 100);

        return {
            actual: pesoActual,
            anterior: pesoAnterior,
            diferencia: diferencia,
            porcentaje: porcentaje,
            estado: diferencia < 0 ? 'mejora' : diferencia > 0 ? 'empeora' : 'sinCambio',
            mensaje: this.obtenerMensaje('peso', diferencia < 0 ? 'mejora' : diferencia > 0 ? 'empeora' : 'sinCambio'),
            significativo: porcentaje >= 2 // Cambio significativo si es >= 2%
        };
    }

    /**
     * Analiza el progreso de la grasa corporal
     * @param {number} grasaActual - Grasa corporal actual
     * @param {number} grasaAnterior - Grasa corporal anterior
     * @returns {Object} Análisis de la grasa corporal
     */
    analizarGrasaCorporal(grasaActual, grasaAnterior) {
        if (!grasaActual || !grasaAnterior) return null;

        const diferencia = grasaActual - grasaAnterior;
        const porcentaje = Math.abs((diferencia / grasaAnterior) * 100);

        return {
            actual: grasaActual,
            anterior: grasaAnterior,
            diferencia: diferencia,
            porcentaje: porcentaje,
            estado: diferencia < 0 ? 'mejora' : diferencia > 0 ? 'empeora' : 'sinCambio',
            mensaje: this.obtenerMensaje('grasaCorporal', diferencia < 0 ? 'mejora' : diferencia > 0 ? 'empeora' : 'sinCambio'),
            significativo: porcentaje >= 5 // Cambio significativo si es >= 5%
        };
    }

    /**
     * Analiza el progreso de las medidas corporales
     * @param {Object} medidasActuales - Medidas actuales
     * @param {Object} medidasAnteriores - Medidas anteriores
     * @returns {Object} Análisis de las medidas
     */
    analizarMedidas(medidasActuales, medidasAnteriores) {
        const analisis = {};

        const tiposMedidas = ['cintura', 'brazo', 'pecho'];
        
        tiposMedidas.forEach(tipo => {
            const actual = medidasActuales?.[tipo];
            const anterior = medidasAnteriores?.[tipo];

            if (actual && anterior) {
                const diferencia = actual - anterior;
                const porcentaje = Math.abs((diferencia / anterior) * 100);

                analisis[tipo] = {
                    actual: actual,
                    anterior: anterior,
                    diferencia: diferencia,
                    porcentaje: porcentaje,
                    estado: this.determinarEstadoMedida(tipo, diferencia),
                    mensaje: this.obtenerMensajeMedida(tipo, diferencia),
                    significativo: porcentaje >= 3 // Cambio significativo si es >= 3%
                };
            }
        });

        return analisis;
    }

    /**
     * Determina el estado de una medida corporal
     * @param {string} tipo - Tipo de medida
     * @param {number} diferencia - Diferencia en la medida
     * @returns {string} Estado de la medida
     */
    determinarEstadoMedida(tipo, diferencia) {
        // Para cintura, menos es mejor
        if (tipo === 'cintura') {
            return diferencia < 0 ? 'mejora' : diferencia > 0 ? 'empeora' : 'sinCambio';
        }
        // Para brazo y pecho, más puede ser mejor (músculo)
        else if (tipo === 'brazo' || tipo === 'pecho') {
            return diferencia > 0 ? 'mejora' : diferencia < 0 ? 'empeora' : 'sinCambio';
        }
        
        return 'sinCambio';
    }

    /**
     * Obtiene mensaje motivacional para una métrica
     * @param {string} tipo - Tipo de métrica
     * @param {string} estado - Estado del progreso
     * @returns {string} Mensaje motivacional
     */
    obtenerMensaje(tipo, estado) {
        const mensajes = this.mensajesMotivacionales[tipo];
        if (!mensajes || !mensajes[estado]) return '';
        
        const mensajesDisponibles = mensajes[estado];
        return mensajesDisponibles[Math.floor(Math.random() * mensajesDisponibles.length)];
    }

    /**
     * Obtiene mensaje para medidas corporales
     * @param {string} tipo - Tipo de medida
     * @param {number} diferencia - Diferencia en la medida
     * @returns {string} Mensaje motivacional
     */
    obtenerMensajeMedida(tipo, diferencia) {
        const estado = this.determinarEstadoMedida(tipo, diferencia);
        const mensajes = this.mensajesMotivacionales.medidas;
        
        if (!mensajes || !mensajes[estado]) return '';
        
        const mensajesDisponibles = mensajes[estado];
        return mensajesDisponibles[Math.floor(Math.random() * mensajesDisponibles.length)];
    }

    /**
     * Genera un resumen motivacional del progreso
     * @param {Object} analisis - Análisis de progreso
     * @returns {string} Resumen motivacional
     */
    generarResumenMotivacional(analisis) {
        const { mejoras, empeoramientos, sinCambios } = analisis.resumen;
        
        if (mejoras > empeoramientos) {
            return "🎉 ¡Excelente progreso! Has mejorado en la mayoría de tus métricas. ¡Sigue así!";
        } else if (empeoramientos > mejoras) {
            return "💪 No te desanimes, el progreso no siempre es lineal. Mantén la constancia y los resultados llegarán.";
        } else if (mejoras === empeoramientos && mejoras > 0) {
            return "⚖️ Tienes un progreso mixto. Algunas métricas mejoraron y otras no. ¡Sigue trabajando!";
        } else {
            return "📊 Tus métricas se mantuvieron estables. La consistencia es clave para el progreso a largo plazo.";
        }
    }
}

module.exports = ProgresoService;
