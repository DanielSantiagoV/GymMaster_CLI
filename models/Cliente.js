const { ObjectId } = require('mongodb');
const dayjs = require('dayjs');

/**
 * Clase Cliente - Modelo para gestión de clientes del gimnasio
 * Implementa validaciones robustas y principios SOLID
 */
class Cliente {
    constructor({ 
        clienteId = null, 
        nombre, 
        apellido, 
        email, 
        telefono, 
        fechaRegistro = null, 
        activo = true, 
        planes = [] 
    }) {
        this.clienteId = clienteId || new ObjectId();
        this.nombre = nombre;
        this.apellido = apellido;
        this.email = email;
        this.telefono = telefono;
        this.fechaRegistro = fechaRegistro || new Date();
        this.activo = activo;
        this.planes = planes;
        
        // Validar datos al crear instancia
        this.validate();
    }

    /**
     * Valida todos los campos del cliente
     * @throws {Error} Si algún campo no cumple con las validaciones
     */
    validate() {
        this.validateNombre();
        this.validateApellido();
        this.validateEmail();
        this.validateTelefono();
        this.validateFechaRegistro();
        this.validateActivo();
        this.validatePlanes();
    }

    /**
     * Valida el nombre del cliente
     */
    validateNombre() {
        if (!this.nombre || typeof this.nombre !== 'string') {
            throw new Error('Nombre es obligatorio y debe ser string');
        }
        if (this.nombre.trim().length < 2) {
            throw new Error('Nombre debe tener al menos 2 caracteres');
        }
        if (this.nombre.trim().length > 50) {
            throw new Error('Nombre no puede exceder 50 caracteres');
        }
        // Actualizar con valor limpio
        this.nombre = this.nombre.trim();
    }

    /**
     * Valida el apellido del cliente
     */
    validateApellido() {
        if (!this.apellido || typeof this.apellido !== 'string') {
            throw new Error('Apellido es obligatorio y debe ser string');
        }
        if (this.apellido.trim().length < 2) {
            throw new Error('Apellido debe tener al menos 2 caracteres');
        }
        if (this.apellido.trim().length > 50) {
            throw new Error('Apellido no puede exceder 50 caracteres');
        }
        // Actualizar con valor limpio
        this.apellido = this.apellido.trim();
    }

    /**
     * Valida el email del cliente
     */
    validateEmail() {
        if (!this.email || typeof this.email !== 'string') {
            throw new Error('Email es obligatorio y debe ser string');
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.email)) {
            throw new Error('Email debe tener un formato válido');
        }
        
        if (this.email.length > 100) {
            throw new Error('Email no puede exceder 100 caracteres');
        }
        
        // Convertir a minúsculas para consistencia
        this.email = this.email.toLowerCase().trim();
    }

    /**
     * Valida el teléfono del cliente
     */
    validateTelefono() {
        if (!this.telefono || typeof this.telefono !== 'string') {
            throw new Error('Teléfono es obligatorio y debe ser string');
        }
        
        // Limpiar teléfono (remover espacios, guiones, paréntesis)
        const telefonoLimpio = this.telefono.replace(/[\s\-\(\)]/g, '');
        
        // Validar que solo contenga números
        if (!/^\d+$/.test(telefonoLimpio)) {
            throw new Error('Teléfono debe contener solo números');
        }
        
        // Validar longitud (entre 7 y 15 dígitos)
        if (telefonoLimpio.length < 7 || telefonoLimpio.length > 15) {
            throw new Error('Teléfono debe tener entre 7 y 15 dígitos');
        }
        
        this.telefono = telefonoLimpio;
    }

    /**
     * Valida la fecha de registro
     */
    validateFechaRegistro() {
        if (!(this.fechaRegistro instanceof Date)) {
            throw new Error('Fecha de registro debe ser un objeto Date');
        }
        
        // Verificar que no sea una fecha futura
        if (this.fechaRegistro > new Date()) {
            throw new Error('Fecha de registro no puede ser futura');
        }
        
        // Verificar que no sea muy antigua (más de 10 años)
        const diezAnosAtras = new Date();
        diezAnosAtras.setFullYear(diezAnosAtras.getFullYear() - 10);
        
        if (this.fechaRegistro < diezAnosAtras) {
            throw new Error('Fecha de registro no puede ser anterior a 10 años');
        }
    }

    /**
     * Valida el estado activo
     */
    validateActivo() {
        if (typeof this.activo !== 'boolean') {
            throw new Error('Activo debe ser un valor booleano');
        }
    }

    /**
     * Valida el array de planes
     */
    validatePlanes() {
        if (!Array.isArray(this.planes)) {
            throw new Error('Planes debe ser un array');
        }
        
        // Validar que todos los elementos sean ObjectIds válidos
        for (const planId of this.planes) {
            if (!ObjectId.isValid(planId)) {
                throw new Error('Todos los planes deben ser ObjectIds válidos');
            }
        }
    }

    /**
     * Obtiene el nombre completo del cliente
     * @returns {string} Nombre completo
     */
    getNombreCompleto() {
        return `${this.nombre} ${this.apellido}`;
    }

    /**
     * Verifica si el cliente tiene planes asignados
     * @returns {boolean} True si tiene planes
     */
    tienePlanes() {
        return this.planes.length > 0;
    }

    /**
     * Agrega un plan al cliente
     * @param {ObjectId} planId - ID del plan a agregar
     */
    agregarPlan(planId) {
        if (!ObjectId.isValid(planId)) {
            throw new Error('ID del plan debe ser un ObjectId válido');
        }
        
        if (!this.planes.includes(planId)) {
            this.planes.push(planId);
        }
    }

    /**
     * Remueve un plan del cliente
     * @param {ObjectId} planId - ID del plan a remover
     */
    removerPlan(planId) {
        if (!ObjectId.isValid(planId)) {
            throw new Error('ID del plan debe ser un ObjectId válido');
        }
        
        this.planes = this.planes.filter(id => !id.equals(planId));
    }

    /**
     * Convierte el cliente a objeto plano para MongoDB
     * @returns {Object} Objeto listo para insertar en MongoDB
     */
    toMongoObject() {
        return {
            _id: this.clienteId,
            nombre: this.nombre,
            apellido: this.apellido,
            email: this.email,
            telefono: this.telefono,
            fechaRegistro: this.fechaRegistro,
            activo: this.activo,
            planes: this.planes
        };
    }

    /**
     * Crea una instancia de Cliente desde un objeto de MongoDB
     * @param {Object} mongoDoc - Documento de MongoDB
     * @returns {Cliente} Instancia de Cliente
     */
    static fromMongoObject(mongoDoc) {
        return new Cliente({
            clienteId: mongoDoc._id,
            nombre: mongoDoc.nombre,
            apellido: mongoDoc.apellido,
            email: mongoDoc.email,
            telefono: mongoDoc.telefono,
            fechaRegistro: mongoDoc.fechaRegistro,
            activo: mongoDoc.activo,
            planes: mongoDoc.planes || []
        });
    }

    /**
     * Obtiene información resumida del cliente
     * @returns {Object} Información resumida
     */
    getResumen() {
        return {
            clienteId: this.clienteId,
            nombreCompleto: this.getNombreCompleto(),
            email: this.email,
            telefono: this.telefono,
            activo: this.activo,
            cantidadPlanes: this.planes.length,
            fechaRegistro: dayjs(this.fechaRegistro).format('DD/MM/YYYY')
        };
    }
}

module.exports = Cliente;
