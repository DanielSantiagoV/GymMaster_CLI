const { ObjectId } = require('mongodb');
const dayjs = require('dayjs');

/**
 * Clase Pago - Modelo para gestión de pagos del gimnasio
 * Implementa validaciones robustas y principios SOLID
 * Maneja pagos de clientes, mensualidades y otros ingresos/egresos
 */
class Pago {
    constructor({ 
        pagoId = null, 
        clienteId = null, 
        contratoId = null, 
        fechaPago = null, 
        monto, 
        metodoPago, 
        estado = 'pendiente', 
        referencia = null, 
        notas = null, 
        tipoMovimiento = 'ingreso'
    }) {
        this.pagoId = pagoId || new ObjectId();
        this.clienteId = clienteId;
        this.contratoId = contratoId;
        this.fechaPago = fechaPago || new Date();
        this.monto = monto;
        this.metodoPago = metodoPago;
        this.estado = estado;
        this.referencia = referencia;
        this.notas = notas;
        this.tipoMovimiento = tipoMovimiento;
        
        // Validar datos al crear instancia
        this.validate();
    }

    /**
     * Valida todos los campos del pago
     * @throws {Error} Si algún campo no cumple con las validaciones
     */
    validate() {
        this.validateClienteId();
        this.validateContratoId();
        this.validateFechaPago();
        this.validateMonto();
        this.validateMetodoPago();
        this.validateEstado();
        this.validateReferencia();
        this.validateNotas();
        this.validateTipoMovimiento();
    }

    /**
     * Valida el ID del cliente (opcional)
     */
    validateClienteId() {
        if (this.clienteId !== null && this.clienteId !== undefined) {
            if (!ObjectId.isValid(this.clienteId)) {
                throw new Error('ID del cliente debe ser un ObjectId válido');
            }
        }
    }

    /**
     * Valida el ID del contrato (opcional)
     */
    validateContratoId() {
        if (this.contratoId !== null && this.contratoId !== undefined) {
            if (!ObjectId.isValid(this.contratoId)) {
                throw new Error('ID del contrato debe ser un ObjectId válido');
            }
        }
    }

    /**
     * Valida la fecha del pago
     */
    validateFechaPago() {
        if (!(this.fechaPago instanceof Date)) {
            throw new Error('Fecha del pago debe ser un objeto Date');
        }
        
        // Verificar que no sea una fecha muy futura (más de 1 año)
        const unAnoFuturo = new Date();
        unAnoFuturo.setFullYear(unAnoFuturo.getFullYear() + 1);
        
        if (this.fechaPago > unAnoFuturo) {
            throw new Error('Fecha del pago no puede ser más de 1 año en el futuro');
        }
        
        // Verificar que no sea muy antigua (más de 5 años)
        const cincoAnosAtras = new Date();
        cincoAnosAtras.setFullYear(cincoAnosAtras.getFullYear() - 5);
        
        if (this.fechaPago < cincoAnosAtras) {
            throw new Error('Fecha del pago no puede ser anterior a 5 años');
        }
    }

    /**
     * Valida el monto del pago
     */
    validateMonto() {
        if (typeof this.monto !== 'number') {
            throw new Error('Monto debe ser un número');
        }
        if (this.monto <= 0) {
            throw new Error('Monto debe ser mayor a 0');
        }
        if (this.monto > 1000000) { // Máximo 1 millón
            throw new Error('Monto no puede exceder 1,000,000');
        }
        
        // Redondear a 2 decimales
        this.monto = Math.round(this.monto * 100) / 100;
    }

    /**
     * Valida el método de pago
     */
    validateMetodoPago() {
        if (!this.metodoPago || typeof this.metodoPago !== 'string') {
            throw new Error('Método de pago es obligatorio y debe ser string');
        }
        
        const metodosValidos = ['efectivo', 'transferencia', 'tarjeta', 'cheque', 'otro'];
        if (!metodosValidos.includes(this.metodoPago.toLowerCase())) {
            throw new Error(`Método de pago debe ser uno de: ${metodosValidos.join(', ')}`);
        }
        
        // Normalizar a minúsculas
        this.metodoPago = this.metodoPago.toLowerCase();
    }

    /**
     * Valida el estado del pago
     */
    validateEstado() {
        if (!this.estado || typeof this.estado !== 'string') {
            throw new Error('Estado es obligatorio y debe ser string');
        }
        
        const estadosValidos = ['pagado', 'pendiente', 'retrasado', 'cancelado'];
        if (!estadosValidos.includes(this.estado.toLowerCase())) {
            throw new Error(`Estado debe ser uno de: ${estadosValidos.join(', ')}`);
        }
        
        // Normalizar a minúsculas
        this.estado = this.estado.toLowerCase();
    }

    /**
     * Valida la referencia del pago (opcional)
     */
    validateReferencia() {
        if (this.referencia !== null && this.referencia !== undefined) {
            if (typeof this.referencia !== 'string') {
                throw new Error('Referencia debe ser string');
            }
            if (this.referencia.trim().length > 100) {
                throw new Error('Referencia no puede exceder 100 caracteres');
            }
            // Actualizar con valor limpio
            this.referencia = this.referencia.trim();
        }
    }

    /**
     * Valida las notas del pago (opcional)
     */
    validateNotas() {
        if (this.notas !== null && this.notas !== undefined) {
            if (typeof this.notas !== 'string') {
                throw new Error('Notas deben ser string');
            }
            if (this.notas.trim().length > 500) {
                throw new Error('Notas no pueden exceder 500 caracteres');
            }
            // Actualizar con valor limpio
            this.notas = this.notas.trim();
        }
    }

    /**
     * Valida el tipo de movimiento
     */
    validateTipoMovimiento() {
        if (!this.tipoMovimiento || typeof this.tipoMovimiento !== 'string') {
            throw new Error('Tipo de movimiento es obligatorio y debe ser string');
        }
        
        const tiposValidos = ['ingreso', 'egreso'];
        if (!tiposValidos.includes(this.tipoMovimiento.toLowerCase())) {
            throw new Error(`Tipo de movimiento debe ser uno de: ${tiposValidos.join(', ')}`);
        }
        
        // Normalizar a minúsculas
        this.tipoMovimiento = this.tipoMovimiento.toLowerCase();
    }

    /**
     * Verifica si el pago está pagado
     * @returns {boolean} True si está pagado
     */
    estaPagado() {
        return this.estado === 'pagado';
    }

    /**
     * Verifica si el pago está pendiente
     * @returns {boolean} True si está pendiente
     */
    estaPendiente() {
        return this.estado === 'pendiente';
    }

    /**
     * Verifica si el pago está retrasado
     * @returns {boolean} True si está retrasado
     */
    estaRetrasado() {
        return this.estado === 'retrasado';
    }

    /**
     * Verifica si el pago está cancelado
     * @returns {boolean} True si está cancelado
     */
    estaCancelado() {
        return this.estado === 'cancelado';
    }

    /**
     * Verifica si es un ingreso
     * @returns {boolean} True si es ingreso
     */
    esIngreso() {
        return this.tipoMovimiento === 'ingreso';
    }

    /**
     * Verifica si es un egreso
     * @returns {boolean} True si es egreso
     */
    esEgreso() {
        return this.tipoMovimiento === 'egreso';
    }

    /**
     * Obtiene el monto con signo según el tipo de movimiento
     * @returns {number} Monto con signo
     */
    getMontoConSigno() {
        return this.esIngreso() ? this.monto : -this.monto;
    }

    /**
     * Obtiene el monto absoluto
     * @returns {number} Monto absoluto
     */
    getMontoAbsoluto() {
        return Math.abs(this.monto);
    }

    /**
     * Verifica si el pago está asociado a un cliente
     * @returns {boolean} True si está asociado a un cliente
     */
    tieneCliente() {
        return this.clienteId !== null && this.clienteId !== undefined;
    }

    /**
     * Verifica si el pago está asociado a un contrato
     * @returns {boolean} True si está asociado a un contrato
     */
    tieneContrato() {
        return this.contratoId !== null && this.contratoId !== undefined;
    }

    /**
     * Obtiene el monto formateado como moneda
     * @returns {string} Monto formateado
     */
    getMontoFormateado() {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(this.monto);
    }

    /**
     * Obtiene el monto con signo formateado
     * @returns {string} Monto con signo formateado
     */
    getMontoConSignoFormateado() {
        const montoConSigno = this.getMontoConSigno();
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
            signDisplay: 'always'
        }).format(montoConSigno);
    }

    /**
     * Verifica si el pago es de un método específico
     * @param {string} metodo - Método a verificar
     * @returns {boolean} True si coincide con el método
     */
    esDeMetodo(metodo) {
        return this.metodoPago.toLowerCase() === metodo.toLowerCase();
    }

    /**
     * Verifica si el pago es de un estado específico
     * @param {string} estado - Estado a verificar
     * @returns {boolean} True si coincide con el estado
     */
    esDeEstado(estado) {
        return this.estado.toLowerCase() === estado.toLowerCase();
    }

    /**
     * Verifica si el pago es de un cliente específico
     * @param {ObjectId} clienteId - ID del cliente a verificar
     * @returns {boolean} True si coincide con el cliente
     */
    esDeCliente(clienteId) {
        if (!this.tieneCliente()) {
            return false;
        }
        return this.clienteId.equals(clienteId);
    }

    /**
     * Verifica si el pago es de un contrato específico
     * @param {ObjectId} contratoId - ID del contrato a verificar
     * @returns {boolean} True si coincide con el contrato
     */
    esDeContrato(contratoId) {
        if (!this.tieneContrato()) {
            return false;
        }
        return this.contratoId.equals(contratoId);
    }

    /**
     * Verifica si el pago es de una fecha específica
     * @param {Date} fecha - Fecha a verificar
     * @returns {boolean} True si coincide con la fecha
     */
    esDeFecha(fecha) {
        return dayjs(this.fechaPago).isSame(dayjs(fecha), 'day');
    }

    /**
     * Verifica si el pago es de un rango de fechas
     * @param {Date} fechaInicio - Fecha de inicio
     * @param {Date} fechaFin - Fecha de fin
     * @returns {boolean} True si está en el rango
     */
    esDeRangoFechas(fechaInicio, fechaFin) {
        const fechaPago = dayjs(this.fechaPago);
        return fechaPago.isAfter(dayjs(fechaInicio).subtract(1, 'day')) && 
               fechaPago.isBefore(dayjs(fechaFin).add(1, 'day'));
    }

    /**
     * Verifica si el pago está vencido (fecha límite pasada y estado pendiente)
     * @param {Date} fechaLimite - Fecha límite del pago
     * @returns {boolean} True si está vencido
     */
    estaVencido(fechaLimite = null) {
        if (this.estaPagado() || this.estaCancelado()) {
            return false;
        }
        
        const fechaLimitePago = fechaLimite || this.fechaPago;
        return dayjs().isAfter(dayjs(fechaLimitePago));
    }

    /**
     * Marca el pago como pagado
     * @param {string} referencia - Referencia del pago (opcional)
     * @param {string} notas - Notas adicionales (opcional)
     */
    marcarComoPagado(referencia = null, notas = null) {
        this.estado = 'pagado';
        if (referencia) {
            this.referencia = referencia;
        }
        if (notas) {
            this.notas = notas;
        }
    }

    /**
     * Marca el pago como retrasado
     * @param {string} notas - Notas sobre el retraso (opcional)
     */
    marcarComoRetrasado(notas = null) {
        if (this.estaPagado()) {
            throw new Error('No se puede marcar como retrasado un pago ya pagado');
        }
        this.estado = 'retrasado';
        if (notas) {
            this.notas = notas;
        }
    }

    /**
     * Marca el pago como cancelado
     * @param {string} motivo - Motivo de la cancelación
     */
    marcarComoCancelado(motivo) {
        if (!motivo || typeof motivo !== 'string') {
            throw new Error('Motivo de cancelación es obligatorio');
        }
        this.estado = 'cancelado';
        this.notas = motivo;
    }

    /**
     * Obtiene la descripción completa del pago
     * @returns {string} Descripción completa
     */
    getDescripcionCompleta() {
        let descripcion = `Pago ${this.estado} - ${this.getMontoConSignoFormateado()} (${this.metodoPago})`;
        
        if (this.tieneCliente()) {
            descripcion += ` - Cliente: ${this.clienteId}`;
        }
        
        if (this.tieneContrato()) {
            descripcion += ` - Contrato: ${this.contratoId}`;
        }
        
        if (this.referencia) {
            descripcion += ` - Ref: ${this.referencia}`;
        }
        
        return descripcion;
    }

    /**
     * Convierte el pago a objeto plano para MongoDB
     * @returns {Object} Objeto listo para insertar en MongoDB
     */
    toMongoObject() {
        return {
            _id: this.pagoId,
            clienteId: this.clienteId,
            contratoId: this.contratoId,
            fechaPago: this.fechaPago,
            monto: this.monto,
            metodoPago: this.metodoPago,
            estado: this.estado,
            referencia: this.referencia,
            notas: this.notas,
            tipoMovimiento: this.tipoMovimiento
        };
    }

    /**
     * Crea una instancia de Pago desde un objeto de MongoDB
     * @param {Object} mongoDoc - Documento de MongoDB
     * @returns {Pago} Instancia de Pago
     */
    static fromMongoObject(mongoDoc) {
        return new Pago({
            pagoId: mongoDoc._id,
            clienteId: mongoDoc.clienteId,
            contratoId: mongoDoc.contratoId,
            fechaPago: mongoDoc.fechaPago,
            monto: mongoDoc.monto,
            metodoPago: mongoDoc.metodoPago,
            estado: mongoDoc.estado,
            referencia: mongoDoc.referencia,
            notas: mongoDoc.notas,
            tipoMovimiento: mongoDoc.tipoMovimiento
        });
    }

    /**
     * Obtiene información resumida del pago
     * @returns {Object} Información resumida
     */
    getResumen() {
        return {
            pagoId: this.pagoId,
            clienteId: this.clienteId,
            contratoId: this.contratoId,
            fechaPago: dayjs(this.fechaPago).format('DD/MM/YYYY'),
            monto: this.monto,
            montoFormateado: this.getMontoFormateado(),
            montoConSigno: this.getMontoConSigno(),
            metodoPago: this.metodoPago,
            estado: this.estado,
            tipoMovimiento: this.tipoMovimiento,
            tieneCliente: this.tieneCliente(),
            tieneContrato: this.tieneContrato(),
            referencia: this.referencia,
            notas: this.notas
        };
    }

    /**
     * Obtiene estadísticas del pago
     * @returns {Object} Estadísticas del pago
     */
    getEstadisticas() {
        return {
            esIngreso: this.esIngreso(),
            esEgreso: this.esEgreso(),
            montoAbsoluto: this.getMontoAbsoluto(),
            montoConSigno: this.getMontoConSigno(),
            montoFormateado: this.getMontoFormateado(),
            montoConSignoFormateado: this.getMontoConSignoFormateado(),
            descripcionCompleta: this.getDescripcionCompleta(),
            fechaPago: this.fechaPago,
            metodoPago: this.metodoPago,
            estado: this.estado,
            tieneCliente: this.tieneCliente(),
            tieneContrato: this.tieneContrato(),
            referencia: this.referencia,
            notas: this.notas
        };
    }

    /**
     * Crea un pago de ingreso
     * @param {number} monto - Monto del pago
     * @param {string} metodoPago - Método de pago
     * @param {ObjectId} clienteId - ID del cliente (opcional)
     * @param {ObjectId} contratoId - ID del contrato (opcional)
     * @param {string} referencia - Referencia del pago (opcional)
     * @param {string} notas - Notas del pago (opcional)
     * @returns {Pago} Instancia de pago de ingreso
     */
    static crearIngreso(monto, metodoPago, clienteId = null, contratoId = null, referencia = null, notas = null) {
        return new Pago({
            monto,
            metodoPago,
            clienteId,
            contratoId,
            referencia,
            notas,
            tipoMovimiento: 'ingreso',
            estado: 'pagado'
        });
    }

    /**
     * Crea un pago de egreso
     * @param {number} monto - Monto del pago
     * @param {string} metodoPago - Método de pago
     * @param {ObjectId} clienteId - ID del cliente (opcional)
     * @param {ObjectId} contratoId - ID del contrato (opcional)
     * @param {string} referencia - Referencia del pago (opcional)
     * @param {string} notas - Notas del pago (opcional)
     * @returns {Pago} Instancia de pago de egreso
     */
    static crearEgreso(monto, metodoPago, clienteId = null, contratoId = null, referencia = null, notas = null) {
        return new Pago({
            monto,
            metodoPago,
            clienteId,
            contratoId,
            referencia,
            notas,
            tipoMovimiento: 'egreso',
            estado: 'pagado'
        });
    }

    /**
     * Crea un pago pendiente
     * @param {number} monto - Monto del pago
     * @param {string} metodoPago - Método de pago
     * @param {ObjectId} clienteId - ID del cliente (opcional)
     * @param {ObjectId} contratoId - ID del contrato (opcional)
     * @param {string} referencia - Referencia del pago (opcional)
     * @param {string} notas - Notas del pago (opcional)
     * @returns {Pago} Instancia de pago pendiente
     */
    static crearPendiente(monto, metodoPago, clienteId = null, contratoId = null, referencia = null, notas = null) {
        return new Pago({
            monto,
            metodoPago,
            clienteId,
            contratoId,
            referencia,
            notas,
            tipoMovimiento: 'ingreso',
            estado: 'pendiente'
        });
    }
}

module.exports = Pago;
