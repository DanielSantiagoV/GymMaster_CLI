const { ObjectId } = require('mongodb');
const dayjs = require('dayjs');

/**
 * Clase Contrato - Modelo para contratos entre clientes y planes
 * Implementa validaciones robustas y principios SOLID
 */
class Contrato {
    constructor({ 
        contratoId = null, 
        clienteId, 
        planId, 
        condiciones, 
        duracionMeses, 
        precio, 
        fechaInicio = null, 
        fechaFin = null, 
        estado = 'vigente' 
    }) {
        this.contratoId = contratoId || new ObjectId();
        this.clienteId = clienteId;
        this.planId = planId;
        this.condiciones = condiciones;
        this.duracionMeses = duracionMeses;
        this.precio = precio;
        this.fechaInicio = fechaInicio || new Date();
        this.fechaFin = fechaFin;
        this.estado = estado;
        
        // Calcular fecha de fin si no se proporciona
        if (!this.fechaFin) {
            this.calcularFechaFin();
        }
        
        // Validar datos al crear instancia
        this.validate();
    }

    /**
     * Valida todos los campos del contrato
     * @throws {Error} Si algún campo no cumple con las validaciones
     */
    validate() {
        this.validateClienteId();
        this.validatePlanId();
        this.validateCondiciones();
        this.validateDuracionMeses();
        this.validatePrecio();
        this.validateFechas();
        this.validateEstado();
    }

    /**
     * Valida el ID del cliente
     */
    validateClienteId() {
        if (!this.clienteId) {
            throw new Error('ID del cliente es obligatorio');
        }
        if (!ObjectId.isValid(this.clienteId)) {
            throw new Error('ID del cliente debe ser un ObjectId válido');
        }
    }

    /**
     * Valida el ID del plan
     */
    validatePlanId() {
        if (!this.planId) {
            throw new Error('ID del plan es obligatorio');
        }
        if (!ObjectId.isValid(this.planId)) {
            throw new Error('ID del plan debe ser un ObjectId válido');
        }
    }

    /**
     * Valida las condiciones del contrato
     */
    validateCondiciones() {
        if (!this.condiciones || typeof this.condiciones !== 'string') {
            throw new Error('Condiciones son obligatorias y deben ser string');
        }
        if (this.condiciones.trim().length < 10) {
            throw new Error('Condiciones deben tener al menos 10 caracteres');
        }
        if (this.condiciones.trim().length > 2000) {
            throw new Error('Condiciones no pueden exceder 2000 caracteres');
        }
        // Actualizar con valor limpio
        this.condiciones = this.condiciones.trim();
    }

    /**
     * Valida la duración en meses
     */
    validateDuracionMeses() {
        if (typeof this.duracionMeses !== 'number') {
            throw new Error('Duración en meses debe ser un número');
        }
        if (!Number.isInteger(this.duracionMeses)) {
            throw new Error('Duración en meses debe ser un número entero');
        }
        if (this.duracionMeses < 1) {
            throw new Error('Duración en meses debe ser al menos 1');
        }
        if (this.duracionMeses > 60) { // Máximo 5 años
            throw new Error('Duración en meses no puede exceder 60 meses (5 años)');
        }
    }

    /**
     * Valida el precio del contrato
     */
    validatePrecio() {
        if (typeof this.precio !== 'number') {
            throw new Error('Precio debe ser un número');
        }
        if (this.precio < 0) {
            throw new Error('Precio no puede ser negativo');
        }
        if (this.precio > 1000000) { // Máximo 1 millón
            throw new Error('Precio no puede exceder 1,000,000');
        }
        
        // Redondear a 2 decimales
        this.precio = Math.round(this.precio * 100) / 100;
    }

    /**
     * Valida las fechas del contrato
     */
    validateFechas() {
        if (!(this.fechaInicio instanceof Date)) {
            throw new Error('Fecha de inicio debe ser un objeto Date');
        }
        
        if (!(this.fechaFin instanceof Date)) {
            throw new Error('Fecha de fin debe ser un objeto Date');
        }
        
        // Verificar que la fecha de inicio no sea futura (más de 1 día)
        const mañana = new Date();
        mañana.setDate(mañana.getDate() + 1);
        
        if (this.fechaInicio > mañana) {
            throw new Error('Fecha de inicio no puede ser más de 1 día en el futuro');
        }
        
        // Verificar que la fecha de fin sea posterior a la fecha de inicio
        if (this.fechaFin <= this.fechaInicio) {
            throw new Error('Fecha de fin debe ser posterior a la fecha de inicio');
        }
        
        // Verificar que la duración coincida con las fechas
        const duracionCalculada = this.calcularDuracionEnMeses();
        if (Math.abs(duracionCalculada - this.duracionMeses) > 1) {
            throw new Error('La duración en meses no coincide con las fechas del contrato');
        }
    }

    /**
     * Valida el estado del contrato
     */
    validateEstado() {
        if (!this.estado || typeof this.estado !== 'string') {
            throw new Error('Estado es obligatorio y debe ser string');
        }
        
        const estadosValidos = ['vigente', 'cancelado', 'finalizado'];
        if (!estadosValidos.includes(this.estado.toLowerCase())) {
            throw new Error(`Estado debe ser uno de: ${estadosValidos.join(', ')}`);
        }
        
        // Normalizar a minúsculas
        this.estado = this.estado.toLowerCase();
    }

    /**
     * Calcula la fecha de fin basada en la duración
     */
    calcularFechaFin() {
        if (!this.fechaInicio) {
            throw new Error('Fecha de inicio es requerida para calcular fecha de fin');
        }
        
        this.fechaFin = new Date(this.fechaInicio);
        this.fechaFin.setMonth(this.fechaFin.getMonth() + this.duracionMeses);
    }

    /**
     * Calcula la duración en meses entre fecha de inicio y fin
     * @returns {number} Duración en meses
     */
    calcularDuracionEnMeses() {
        if (!this.fechaInicio || !this.fechaFin) {
            return 0;
        }
        
        const diffTime = this.fechaFin.getTime() - this.fechaInicio.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.round(diffDays / 30.44); // Promedio de días por mes
    }

    /**
     * Calcula la duración en días
     * @returns {number} Duración en días
     */
    calcularDuracionEnDias() {
        if (!this.fechaInicio || !this.fechaFin) {
            return 0;
        }
        
        const diffTime = this.fechaFin.getTime() - this.fechaInicio.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    /**
     * Verifica si el contrato está vigente
     * @returns {boolean} True si está vigente
     */
    estaVigente() {
        return this.estado === 'vigente' && 
               this.fechaInicio <= new Date() && 
               this.fechaFin >= new Date();
    }

    /**
     * Verifica si el contrato está cancelado
     * @returns {boolean} True si está cancelado
     */
    estaCancelado() {
        return this.estado === 'cancelado';
    }

    /**
     * Verifica si el contrato está finalizado
     * @returns {boolean} True si está finalizado
     */
    estaFinalizado() {
        return this.estado === 'finalizado' || this.fechaFin < new Date();
    }

    /**
     * Verifica si el contrato está próximo a vencer (30 días)
     * @returns {boolean} True si está próximo a vencer
     */
    estaProximoAVencer() {
        if (!this.estaVigente()) {
            return false;
        }
        
        const treintaDias = new Date();
        treintaDias.setDate(treintaDias.getDate() + 30);
        
        return this.fechaFin <= treintaDias;
    }

    /**
     * Calcula el precio mensual
     * @returns {number} Precio mensual
     */
    getPrecioMensual() {
        return this.precio / this.duracionMeses;
    }

    /**
     * Calcula el precio diario
     * @returns {number} Precio diario
     */
    getPrecioDiario() {
        const diasTotales = this.calcularDuracionEnDias();
        return diasTotales > 0 ? this.precio / diasTotales : 0;
    }

    /**
     * Cambia el estado del contrato
     * @param {string} nuevoEstado - Nuevo estado del contrato
     */
    cambiarEstado(nuevoEstado) {
        const estadosValidos = ['vigente', 'cancelado', 'finalizado'];
        if (!estadosValidos.includes(nuevoEstado.toLowerCase())) {
            throw new Error(`Estado debe ser uno de: ${estadosValidos.join(', ')}`);
        }
        
        this.estado = nuevoEstado.toLowerCase();
    }

    /**
     * Extiende la duración del contrato
     * @param {number} mesesAdicionales - Meses a agregar
     */
    extenderContrato(mesesAdicionales) {
        if (typeof mesesAdicionales !== 'number' || mesesAdicionales <= 0) {
            throw new Error('Meses adicionales debe ser un número positivo');
        }
        
        if (!this.estaVigente()) {
            throw new Error('Solo se pueden extender contratos vigentes');
        }
        
        this.duracionMeses += mesesAdicionales;
        this.calcularFechaFin();
    }

    /**
     * Convierte el contrato a objeto plano para MongoDB
     * @returns {Object} Objeto listo para insertar en MongoDB
     */
    toMongoObject() {
        return {
            _id: this.contratoId,
            clienteId: this.clienteId,
            planId: this.planId,
            condiciones: this.condiciones,
            duracionMeses: this.duracionMeses,
            precio: this.precio,
            fechaInicio: this.fechaInicio,
            fechaFin: this.fechaFin,
            estado: this.estado
        };
    }

    /**
     * Crea una instancia de Contrato desde un objeto de MongoDB
     * @param {Object} mongoDoc - Documento de MongoDB
     * @returns {Contrato} Instancia de Contrato
     */
    static fromMongoObject(mongoDoc) {
        return new Contrato({
            contratoId: mongoDoc._id,
            clienteId: mongoDoc.clienteId,
            planId: mongoDoc.planId,
            condiciones: mongoDoc.condiciones,
            duracionMeses: mongoDoc.duracionMeses,
            precio: mongoDoc.precio,
            fechaInicio: mongoDoc.fechaInicio,
            fechaFin: mongoDoc.fechaFin,
            estado: mongoDoc.estado
        });
    }

    /**
     * Obtiene información resumida del contrato
     * @returns {Object} Información resumida
     */
    getResumen() {
        return {
            contratoId: this.contratoId,
            clienteId: this.clienteId,
            planId: this.planId,
            duracionMeses: this.duracionMeses,
            precio: this.precio,
            precioMensual: this.getPrecioMensual(),
            fechaInicio: dayjs(this.fechaInicio).format('DD/MM/YYYY'),
            fechaFin: dayjs(this.fechaFin).format('DD/MM/YYYY'),
            estado: this.estado,
            estaVigente: this.estaVigente(),
            proximoAVencer: this.estaProximoAVencer()
        };
    }

    /**
     * Obtiene estadísticas del contrato
     * @returns {Object} Estadísticas del contrato
     */
    getEstadisticas() {
        const diasTranscurridos = this.calcularDiasTranscurridos();
        const diasTotales = this.calcularDuracionEnDias();
        const porcentajeCompletado = diasTotales > 0 ? (diasTranscurridos / diasTotales) * 100 : 0;
        
        return {
            duracionMeses: this.duracionMeses,
            duracionDias: diasTotales,
            diasTranscurridos,
            porcentajeCompletado: Math.round(porcentajeCompletado * 100) / 100,
            precioTotal: this.precio,
            precioMensual: this.getPrecioMensual(),
            precioDiario: this.getPrecioDiario(),
            estado: this.estado,
            fechaInicio: this.fechaInicio,
            fechaFin: this.fechaFin
        };
    }

    /**
     * Calcula los días transcurridos desde el inicio del contrato
     * @returns {number} Días transcurridos
     */
    calcularDiasTranscurridos() {
        if (!this.fechaInicio) {
            return 0;
        }
        
        const hoy = new Date();
        const fechaFinCalculada = this.fechaFin < hoy ? this.fechaFin : hoy;
        
        const diffTime = fechaFinCalculada.getTime() - this.fechaInicio.getTime();
        return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }
}

module.exports = Contrato;

