const { ObjectId } = require('mongodb');
const dayjs = require('dayjs');

/**
 * Modelo Nutrición - Gestiona planes alimenticios personalizados
 * Implementa validaciones robustas y principios SOLID
 */
class Nutricion {
    constructor(datos) {
        this.nutricionId = datos.nutricionId || new ObjectId();
        this.clienteId = datos.clienteId;
        this.contratoId = datos.contratoId || null;
        this.fechaCreacion = datos.fechaCreacion || new Date();
        this.tipoPlan = datos.tipoPlan;
        this.detallePlan = datos.detallePlan || '';
        this.evaluacionNutricional = datos.evaluacionNutricional || '';
        this.estado = datos.estado || 'activo';
        this.notasAdicionales = datos.notasAdicionales || '';
        this.fechaActualizacion = datos.fechaActualizacion || new Date();
        
        // Validar datos al crear
        this.validar();
    }

    /**
     * Valida todos los campos del modelo
     * @throws {Error} Si algún campo no es válido
     */
    validar() {
        this.validarClienteId();
        this.validarContratoId();
        this.validarFechaCreacion();
        this.validarTipoPlan();
        this.validarDetallePlan();
        this.validarEvaluacionNutricional();
        this.validarEstado();
        this.validarNotasAdicionales();
    }

    /**
     * Valida el ID del cliente
     */
    validarClienteId() {
        if (!this.clienteId) {
            throw new Error('ID del cliente es requerido');
        }
        if (!ObjectId.isValid(this.clienteId)) {
            throw new Error('ID del cliente no es válido');
        }
    }

    /**
     * Valida el ID del contrato (opcional)
     */
    validarContratoId() {
        if (this.contratoId && !ObjectId.isValid(this.contratoId)) {
            throw new Error('ID del contrato no es válido');
        }
    }

    /**
     * Valida la fecha de creación
     */
    validarFechaCreacion() {
        if (!(this.fechaCreacion instanceof Date)) {
            throw new Error('Fecha de creación debe ser un objeto Date');
        }
        
        const hoy = new Date();
        if (this.fechaCreacion > hoy) {
            throw new Error('Fecha de creación no puede ser futura');
        }
        
        const unAnoAtras = new Date();
        unAnoAtras.setFullYear(unAnoAtras.getFullYear() - 1);
        if (this.fechaCreacion < unAnoAtras) {
            throw new Error('Fecha de creación no puede ser anterior a 1 año');
        }
    }

    /**
     * Valida el tipo de plan nutricional
     */
    validarTipoPlan() {
        if (!this.tipoPlan) {
            throw new Error('Tipo de plan nutricional es requerido');
        }
        
        const tiposValidos = [
            'perdida_peso',
            'ganancia_masa',
            'mantenimiento',
            'deportivo',
            'medico',
            'personalizado'
        ];
        
        if (!tiposValidos.includes(this.tipoPlan)) {
            throw new Error(`Tipo de plan debe ser uno de: ${tiposValidos.join(', ')}`);
        }
    }

    /**
     * Valida el detalle del plan
     */
    validarDetallePlan() {
        if (typeof this.detallePlan !== 'string') {
            throw new Error('Detalle del plan debe ser texto');
        }
        
        if (this.detallePlan.length > 5000) {
            throw new Error('Detalle del plan no puede exceder 5000 caracteres');
        }
    }

    /**
     * Valida la evaluación nutricional
     */
    validarEvaluacionNutricional() {
        if (typeof this.evaluacionNutricional !== 'string') {
            throw new Error('Evaluación nutricional debe ser texto');
        }
        
        if (this.evaluacionNutricional.length > 2000) {
            throw new Error('Evaluación nutricional no puede exceder 2000 caracteres');
        }
    }

    /**
     * Valida el estado del plan
     */
    validarEstado() {
        const estadosValidos = ['activo', 'pausado', 'finalizado', 'cancelado'];
        
        if (!estadosValidos.includes(this.estado)) {
            throw new Error(`Estado debe ser uno de: ${estadosValidos.join(', ')}`);
        }
    }

    /**
     * Valida las notas adicionales
     */
    validarNotasAdicionales() {
        if (typeof this.notasAdicionales !== 'string') {
            throw new Error('Notas adicionales deben ser texto');
        }
        
        if (this.notasAdicionales.length > 1000) {
            throw new Error('Notas adicionales no pueden exceder 1000 caracteres');
        }
    }

    /**
     * Convierte el objeto a formato MongoDB
     * @returns {Object} Objeto para MongoDB
     */
    toMongoObject() {
        return {
            _id: this.nutricionId,
            clienteId: new ObjectId(this.clienteId),
            contratoId: this.contratoId ? new ObjectId(this.contratoId) : null,
            fechaCreacion: this.fechaCreacion,
            tipoPlan: this.tipoPlan,
            detallePlan: this.detallePlan,
            evaluacionNutricional: this.evaluacionNutricional,
            estado: this.estado,
            notasAdicionales: this.notasAdicionales,
            fechaActualizacion: this.fechaActualizacion
        };
    }

    /**
     * Crea un objeto Nutrición desde un objeto MongoDB
     * @param {Object} mongoObj - Objeto de MongoDB
     * @returns {Nutricion} Instancia de Nutrición
     */
    static fromMongoObject(mongoObj) {
        if (!mongoObj) return null;
        
        return new Nutricion({
            nutricionId: mongoObj._id,
            clienteId: mongoObj.clienteId,
            contratoId: mongoObj.contratoId,
            fechaCreacion: mongoObj.fechaCreacion,
            tipoPlan: mongoObj.tipoPlan,
            detallePlan: mongoObj.detallePlan,
            evaluacionNutricional: mongoObj.evaluacionNutricional,
            estado: mongoObj.estado,
            notasAdicionales: mongoObj.notasAdicionales,
            fechaActualizacion: mongoObj.fechaActualizacion
        });
    }

    /**
     * Obtiene un resumen del plan nutricional
     * @returns {Object} Resumen del plan
     */
    getResumen() {
        return {
            nutricionId: this.nutricionId.toString(),
            clienteId: this.clienteId.toString(),
            contratoId: this.contratoId ? this.contratoId.toString() : null,
            fechaCreacion: dayjs(this.fechaCreacion).format('DD/MM/YYYY'),
            tipoPlan: this.getTipoPlanDescripcion(),
            detallePlan: this.detallePlan.substring(0, 100) + (this.detallePlan.length > 100 ? '...' : ''),
            evaluacionNutricional: this.evaluacionNutricional.substring(0, 100) + (this.evaluacionNutricional.length > 100 ? '...' : ''),
            estado: this.estado,
            notasAdicionales: this.notasAdicionales.substring(0, 50) + (this.notasAdicionales.length > 50 ? '...' : ''),
            fechaActualizacion: dayjs(this.fechaActualizacion).format('DD/MM/YYYY HH:mm')
        };
    }

    /**
     * Obtiene la descripción del tipo de plan
     * @returns {string} Descripción del tipo
     */
    getTipoPlanDescripcion() {
        const descripciones = {
            'perdida_peso': 'Pérdida de Peso',
            'ganancia_masa': 'Ganancia de Masa Muscular',
            'mantenimiento': 'Mantenimiento',
            'deportivo': 'Deportivo',
            'medico': 'Médico',
            'personalizado': 'Personalizado'
        };
        
        return descripciones[this.tipoPlan] || this.tipoPlan;
    }

    /**
     * Verifica si el plan está activo
     * @returns {boolean} True si está activo
     */
    estaActivo() {
        return this.estado === 'activo';
    }

    /**
     * Verifica si el plan está pausado
     * @returns {boolean} True si está pausado
     */
    estaPausado() {
        return this.estado === 'pausado';
    }

    /**
     * Verifica si el plan está finalizado
     * @returns {boolean} True si está finalizado
     */
    estaFinalizado() {
        return this.estado === 'finalizado';
    }

    /**
     * Verifica si el plan está cancelado
     * @returns {boolean} True si está cancelado
     */
    estaCancelado() {
        return this.estado === 'cancelado';
    }

    /**
     * Actualiza el estado del plan
     * @param {string} nuevoEstado - Nuevo estado
     */
    actualizarEstado(nuevoEstado) {
        const estadosValidos = ['activo', 'pausado', 'finalizado', 'cancelado'];
        
        if (!estadosValidos.includes(nuevoEstado)) {
            throw new Error(`Estado debe ser uno de: ${estadosValidos.join(', ')}`);
        }
        
        this.estado = nuevoEstado;
        this.fechaActualizacion = new Date();
    }

    /**
     * Actualiza las notas adicionales
     * @param {string} notas - Nuevas notas
     */
    actualizarNotas(notas) {
        if (typeof notas !== 'string') {
            throw new Error('Las notas deben ser texto');
        }
        
        if (notas.length > 1000) {
            throw new Error('Las notas no pueden exceder 1000 caracteres');
        }
        
        this.notasAdicionales = notas;
        this.fechaActualizacion = new Date();
    }

    /**
     * Actualiza la evaluación nutricional
     * @param {string} evaluacion - Nueva evaluación
     */
    actualizarEvaluacion(evaluacion) {
        if (typeof evaluacion !== 'string') {
            throw new Error('La evaluación debe ser texto');
        }
        
        if (evaluacion.length > 2000) {
            throw new Error('La evaluación no puede exceder 2000 caracteres');
        }
        
        this.evaluacionNutricional = evaluacion;
        this.fechaActualizacion = new Date();
    }
}

module.exports = Nutricion;