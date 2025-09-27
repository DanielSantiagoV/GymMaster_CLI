const { ObjectId } = require('mongodb');
const dayjs = require('dayjs');
const config = require('../config');

/**
 * Clase PlanEntrenamiento - Modelo para planes de entrenamiento
 * Implementa validaciones robustas y principios SOLID
 */
class PlanEntrenamiento {
    constructor({ 
        planId = null, 
        nombre, 
        duracionSemanas, 
        metasFisicas, 
        nivel, 
        clientes = [], 
        estado = 'activo' 
    }) {
        this.planId = planId || new ObjectId();
        this.nombre = nombre;
        this.duracionSemanas = duracionSemanas;
        this.metasFisicas = metasFisicas;
        this.nivel = nivel;
        this.clientes = clientes;
        this.estado = estado;
        
        // Validar datos al crear instancia
        this.validate();
    }

    /**
     * Valida todos los campos del plan de entrenamiento
     * @throws {Error} Si algún campo no cumple con las validaciones
     */
    validate() {
        this.validateNombre();
        this.validateDuracionSemanas();
        this.validateMetasFisicas();
        this.validateNivel();
        this.validateEstado();
        this.validateClientes();
    }

    /**
     * Valida el nombre del plan
     */
    validateNombre() {
        if (!this.nombre || typeof this.nombre !== 'string') {
            throw new Error('Nombre del plan es obligatorio y debe ser string');
        }
        if (this.nombre.trim().length < 3) {
            throw new Error('Nombre del plan debe tener al menos 3 caracteres');
        }
        if (this.nombre.trim().length > 100) {
            throw new Error('Nombre del plan no puede exceder 100 caracteres');
        }
        // Actualizar con valor limpio
        this.nombre = this.nombre.trim();
    }

    /**
     * Valida la duración en semanas
     */
    validateDuracionSemanas() {
        if (typeof this.duracionSemanas !== 'number') {
            throw new Error('Duración en semanas debe ser un número');
        }
        if (!Number.isInteger(this.duracionSemanas)) {
            throw new Error('Duración en semanas debe ser un número entero');
        }
        if (this.duracionSemanas < 1) {
            throw new Error('Duración en semanas debe ser al menos 1');
        }
        if (this.duracionSemanas > 104) { // Máximo 2 años
            throw new Error('Duración en semanas no puede exceder 104 semanas (2 años)');
        }
    }

    /**
     * Valida las metas físicas
     */
    validateMetasFisicas() {
        if (!this.metasFisicas || typeof this.metasFisicas !== 'string') {
            throw new Error('Metas físicas son obligatorias y deben ser string');
        }
        if (this.metasFisicas.trim().length < 5) {
            throw new Error('Metas físicas deben tener al menos 5 caracteres');
        }
        if (this.metasFisicas.trim().length > 500) {
            throw new Error('Metas físicas no pueden exceder 500 caracteres');
        }
        // Actualizar con valor limpio
        this.metasFisicas = this.metasFisicas.trim();
    }

    /**
     * Valida el nivel del plan
     */
    validateNivel() {
        if (!this.nivel || typeof this.nivel !== 'string') {
            throw new Error('Nivel es obligatorio y debe ser string');
        }
        
        const nivelesValidos = config.validation.planLevels;
        if (!nivelesValidos.includes(this.nivel.toLowerCase())) {
            throw new Error(`Nivel debe ser uno de: ${nivelesValidos.join(', ')}`);
        }
        
        // Normalizar a minúsculas
        this.nivel = this.nivel.toLowerCase();
    }

    /**
     * Valida el estado del plan
     */
    validateEstado() {
        if (!this.estado || typeof this.estado !== 'string') {
            throw new Error('Estado es obligatorio y debe ser string');
        }
        
        const estadosValidos = config.validation.planStates;
        if (!estadosValidos.includes(this.estado.toLowerCase())) {
            throw new Error(`Estado debe ser uno de: ${estadosValidos.join(', ')}`);
        }
        
        // Normalizar a minúsculas
        this.estado = this.estado.toLowerCase();
    }

    /**
     * Valida el array de clientes
     */
    validateClientes() {
        if (!Array.isArray(this.clientes)) {
            throw new Error('Clientes debe ser un array');
        }
        
        // Validar que todos los elementos sean ObjectIds válidos
        for (const clienteId of this.clientes) {
            if (!ObjectId.isValid(clienteId)) {
                throw new Error('Todos los clientes deben ser ObjectIds válidos');
            }
        }
    }

    /**
     * Verifica si el plan está activo
     * @returns {boolean} True si está activo
     */
    estaActivo() {
        return this.estado === 'activo';
    }

    /**
     * Verifica si el plan está cancelado
     * @returns {boolean} True si está cancelado
     */
    estaCancelado() {
        return this.estado === 'cancelado';
    }

    /**
     * Verifica si el plan está finalizado
     * @returns {boolean} True si está finalizado
     */
    estaFinalizado() {
        return this.estado === 'finalizado';
    }

    /**
     * Verifica si el plan tiene clientes asignados
     * @returns {boolean} True si tiene clientes
     */
    tieneClientes() {
        return this.clientes.length > 0;
    }

    /**
     * Agrega un cliente al plan
     * @param {ObjectId} clienteId - ID del cliente a agregar
     */
    agregarCliente(clienteId) {
        if (!ObjectId.isValid(clienteId)) {
            throw new Error('ID del cliente debe ser un ObjectId válido');
        }
        
        if (!this.clientes.includes(clienteId)) {
            this.clientes.push(clienteId);
        }
    }

    /**
     * Remueve un cliente del plan
     * @param {ObjectId} clienteId - ID del cliente a remover
     */
    removerCliente(clienteId) {
        if (!ObjectId.isValid(clienteId)) {
            throw new Error('ID del cliente debe ser un ObjectId válido');
        }
        
        this.clientes = this.clientes.filter(id => !id.equals(clienteId));
    }

    /**
     * Cambia el estado del plan
     * @param {string} nuevoEstado - Nuevo estado del plan
     */
    cambiarEstado(nuevoEstado) {
        const estadosValidos = config.validation.planStates;
        if (!estadosValidos.includes(nuevoEstado.toLowerCase())) {
            throw new Error(`Estado debe ser uno de: ${estadosValidos.join(', ')}`);
        }
        
        this.estado = nuevoEstado.toLowerCase();
    }

    /**
     * Calcula la duración en días
     * @returns {number} Duración en días
     */
    getDuracionEnDias() {
        return this.duracionSemanas * 7;
    }

    /**
     * Calcula la duración en meses (aproximada)
     * @returns {number} Duración en meses
     */
    getDuracionEnMeses() {
        return Math.round(this.duracionSemanas / 4.33); // 4.33 semanas por mes
    }

    /**
     * Convierte el plan a objeto plano para MongoDB
     * @returns {Object} Objeto listo para insertar en MongoDB
     */
    toMongoObject() {
        return {
            _id: this.planId,
            nombre: this.nombre,
            duracionSemanas: this.duracionSemanas,
            metasFisicas: this.metasFisicas,
            nivel: this.nivel,
            clientes: this.clientes,
            estado: this.estado
        };
    }

    /**
     * Crea una instancia de PlanEntrenamiento desde un objeto de MongoDB
     * @param {Object} mongoDoc - Documento de MongoDB
     * @returns {PlanEntrenamiento} Instancia de PlanEntrenamiento
     */
    static fromMongoObject(mongoDoc) {
        return new PlanEntrenamiento({
            planId: mongoDoc._id,
            nombre: mongoDoc.nombre,
            duracionSemanas: mongoDoc.duracionSemanas,
            metasFisicas: mongoDoc.metasFisicas,
            nivel: mongoDoc.nivel,
            clientes: mongoDoc.clientes || [],
            estado: mongoDoc.estado
        });
    }

    /**
     * Obtiene información resumida del plan
     * @returns {Object} Información resumida
     */
    getResumen() {
        return {
            planId: this.planId,
            nombre: this.nombre,
            duracionSemanas: this.duracionSemanas,
            duracionMeses: this.getDuracionEnMeses(),
            nivel: this.nivel,
            estado: this.estado,
            cantidadClientes: this.clientes.length,
            metasFisicas: this.metasFisicas.length > 50 
                ? this.metasFisicas.substring(0, 50) + '...' 
                : this.metasFisicas
        };
    }

    /**
     * Verifica si el plan es compatible con un nivel específico
     * @param {string} nivelCliente - Nivel del cliente
     * @returns {boolean} True si es compatible
     */
    esCompatibleConNivel(nivelCliente) {
        // Si no se proporciona nivel del cliente, asumir principiante
        if (!nivelCliente || typeof nivelCliente !== 'string') {
            nivelCliente = 'principiante';
        }
        
        const niveles = ['principiante', 'intermedio', 'avanzado'];
        const indicePlan = niveles.indexOf(this.nivel);
        const indiceCliente = niveles.indexOf(nivelCliente.toLowerCase());
        
        // Un cliente puede usar un plan de su nivel o superior
        // Un principiante puede usar planes principiante, intermedio y avanzado
        // Un intermedio puede usar planes intermedio y avanzado
        // Un avanzado solo puede usar planes avanzado
        return indiceCliente <= indicePlan;
    }
}

module.exports = PlanEntrenamiento;
