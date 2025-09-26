const { ObjectId } = require('mongodb');
const dayjs = require('dayjs');
const config = require('../config');

/**
 * Clase Finanzas - Modelo para gestión financiera del gimnasio
 * Implementa validaciones robustas y principios SOLID
 */
class Finanzas {
    constructor({ 
        movimientoId = null, 
        tipo, 
        descripcion, 
        monto, 
        fecha = null, 
        clienteId = null, 
        categoria 
    }) {
        this.movimientoId = movimientoId || new ObjectId();
        this.tipo = tipo;
        this.descripcion = descripcion;
        this.monto = monto;
        this.fecha = fecha || new Date();
        this.clienteId = clienteId;
        this.categoria = categoria;
        
        // Validar datos al crear instancia
        this.validate();
    }

    /**
     * Valida todos los campos del movimiento financiero
     * @throws {Error} Si algún campo no cumple con las validaciones
     */
    validate() {
        this.validateTipo();
        this.validateDescripcion();
        this.validateMonto();
        this.validateFecha();
        this.validateClienteId();
        this.validateCategoria();
    }

    /**
     * Valida el tipo de movimiento
     */
    validateTipo() {
        if (!this.tipo || typeof this.tipo !== 'string') {
            throw new Error('Tipo es obligatorio y debe ser string');
        }
        
        const tiposValidos = config.validation.transactionTypes;
        if (!tiposValidos.includes(this.tipo.toLowerCase())) {
            throw new Error(`Tipo debe ser uno de: ${tiposValidos.join(', ')}`);
        }
        
        // Normalizar a minúsculas
        this.tipo = this.tipo.toLowerCase();
    }

    /**
     * Valida la descripción del movimiento
     */
    validateDescripcion() {
        if (!this.descripcion || typeof this.descripcion !== 'string') {
            throw new Error('Descripción es obligatoria y debe ser string');
        }
        if (this.descripcion.trim().length < 3) {
            throw new Error('Descripción debe tener al menos 3 caracteres');
        }
        if (this.descripcion.trim().length > 200) {
            throw new Error('Descripción no puede exceder 200 caracteres');
        }
        // Actualizar con valor limpio
        this.descripcion = this.descripcion.trim();
    }

    /**
     * Valida el monto del movimiento
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
     * Valida la fecha del movimiento
     */
    validateFecha() {
        if (!(this.fecha instanceof Date)) {
            throw new Error('Fecha debe ser un objeto Date');
        }
        
        // Verificar que no sea una fecha futura (más de 1 día)
        const mañana = new Date();
        mañana.setDate(mañana.getDate() + 1);
        
        if (this.fecha > mañana) {
            throw new Error('Fecha del movimiento no puede ser más de 1 día en el futuro');
        }
        
        // Verificar que no sea muy antigua (más de 5 años)
        const cincoAnosAtras = new Date();
        cincoAnosAtras.setFullYear(cincoAnosAtras.getFullYear() - 5);
        
        if (this.fecha < cincoAnosAtras) {
            throw new Error('Fecha del movimiento no puede ser anterior a 5 años');
        }
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
     * Valida la categoría del movimiento
     */
    validateCategoria() {
        if (!this.categoria || typeof this.categoria !== 'string') {
            throw new Error('Categoría es obligatoria y debe ser string');
        }
        if (this.categoria.trim().length < 2) {
            throw new Error('Categoría debe tener al menos 2 caracteres');
        }
        if (this.categoria.trim().length > 50) {
            throw new Error('Categoría no puede exceder 50 caracteres');
        }
        // Actualizar con valor limpio
        this.categoria = this.categoria.trim();
    }

    /**
     * Verifica si es un ingreso
     * @returns {boolean} True si es ingreso
     */
    esIngreso() {
        return this.tipo === 'ingreso';
    }

    /**
     * Verifica si es un egreso
     * @returns {boolean} True si es egreso
     */
    esEgreso() {
        return this.tipo === 'egreso';
    }

    /**
     * Obtiene el monto con signo según el tipo
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
     * Verifica si el movimiento está asociado a un cliente
     * @returns {boolean} True si está asociado a un cliente
     */
    tieneCliente() {
        return this.clienteId !== null && this.clienteId !== undefined;
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
     * Verifica si el movimiento es de una categoría específica
     * @param {string} categoria - Categoría a verificar
     * @returns {boolean} True si coincide con la categoría
     */
    esDeCategoria(categoria) {
        return this.categoria.toLowerCase() === categoria.toLowerCase();
    }

    /**
     * Verifica si el movimiento es de un tipo específico
     * @param {string} tipo - Tipo a verificar
     * @returns {boolean} True si coincide con el tipo
     */
    esDeTipo(tipo) {
        return this.tipo.toLowerCase() === tipo.toLowerCase();
    }

    /**
     * Verifica si el movimiento es de un cliente específico
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
     * Verifica si el movimiento es de una fecha específica
     * @param {Date} fecha - Fecha a verificar
     * @returns {boolean} True si coincide con la fecha
     */
    esDeFecha(fecha) {
        return dayjs(this.fecha).isSame(dayjs(fecha), 'day');
    }

    /**
     * Verifica si el movimiento es de un rango de fechas
     * @param {Date} fechaInicio - Fecha de inicio
     * @param {Date} fechaFin - Fecha de fin
     * @returns {boolean} True si está en el rango
     */
    esDeRangoFechas(fechaInicio, fechaFin) {
        const fechaMovimiento = dayjs(this.fecha);
        return fechaMovimiento.isAfter(dayjs(fechaInicio).subtract(1, 'day')) && 
               fechaMovimiento.isBefore(dayjs(fechaFin).add(1, 'day'));
    }

    /**
     * Obtiene la descripción completa del movimiento
     * @returns {string} Descripción completa
     */
    getDescripcionCompleta() {
        let descripcion = `${this.descripcion} - ${this.getMontoConSignoFormateado()}`;
        
        if (this.tieneCliente()) {
            descripcion += ` (Cliente: ${this.clienteId})`;
        }
        
        descripcion += ` [${this.categoria}]`;
        
        return descripcion;
    }

    /**
     * Convierte el movimiento financiero a objeto plano para MongoDB
     * @returns {Object} Objeto listo para insertar en MongoDB
     */
    toMongoObject() {
        return {
            _id: this.movimientoId,
            tipo: this.tipo,
            descripcion: this.descripcion,
            monto: this.monto,
            fecha: this.fecha,
            clienteId: this.clienteId,
            categoria: this.categoria
        };
    }

    /**
     * Crea una instancia de Finanzas desde un objeto de MongoDB
     * @param {Object} mongoDoc - Documento de MongoDB
     * @returns {Finanzas} Instancia de Finanzas
     */
    static fromMongoObject(mongoDoc) {
        return new Finanzas({
            movimientoId: mongoDoc._id,
            tipo: mongoDoc.tipo,
            descripcion: mongoDoc.descripcion,
            monto: mongoDoc.monto,
            fecha: mongoDoc.fecha,
            clienteId: mongoDoc.clienteId,
            categoria: mongoDoc.categoria
        });
    }

    /**
     * Obtiene información resumida del movimiento
     * @returns {Object} Información resumida
     */
    getResumen() {
        return {
            movimientoId: this.movimientoId,
            tipo: this.tipo,
            descripcion: this.descripcion,
            monto: this.monto,
            montoFormateado: this.getMontoFormateado(),
            montoConSigno: this.getMontoConSigno(),
            fecha: dayjs(this.fecha).format('DD/MM/YYYY'),
            categoria: this.categoria,
            tieneCliente: this.tieneCliente(),
            clienteId: this.clienteId
        };
    }

    /**
     * Obtiene estadísticas del movimiento
     * @returns {Object} Estadísticas del movimiento
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
            fecha: this.fecha,
            categoria: this.categoria,
            tieneCliente: this.tieneCliente()
        };
    }

    /**
     * Crea un movimiento de ingreso
     * @param {string} descripcion - Descripción del ingreso
     * @param {number} monto - Monto del ingreso
     * @param {string} categoria - Categoría del ingreso
     * @param {ObjectId} clienteId - ID del cliente (opcional)
     * @returns {Finanzas} Instancia de movimiento de ingreso
     */
    static crearIngreso(descripcion, monto, categoria, clienteId = null) {
        return new Finanzas({
            tipo: 'ingreso',
            descripcion,
            monto,
            categoria,
            clienteId
        });
    }

    /**
     * Crea un movimiento de egreso
     * @param {string} descripcion - Descripción del egreso
     * @param {number} monto - Monto del egreso
     * @param {string} categoria - Categoría del egreso
     * @param {ObjectId} clienteId - ID del cliente (opcional)
     * @returns {Finanzas} Instancia de movimiento de egreso
     */
    static crearEgreso(descripcion, monto, categoria, clienteId = null) {
        return new Finanzas({
            tipo: 'egreso',
            descripcion,
            monto,
            categoria,
            clienteId
        });
    }
}

module.exports = Finanzas;
