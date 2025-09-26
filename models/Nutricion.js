const { ObjectId } = require('mongodb');
const dayjs = require('dayjs');

/**
 * Clase Nutricion - Modelo para planes nutricionales y registro de alimentos
 * Implementa validaciones robustas y principios SOLID
 */
class Nutricion {
    constructor({ 
        nutricionId = null, 
        clienteId, 
        planId, 
        fecha = null, 
        alimentos = [] 
    }) {
        this.nutricionId = nutricionId || new ObjectId();
        this.clienteId = clienteId;
        this.planId = planId;
        this.fecha = fecha || new Date();
        this.alimentos = alimentos;
        
        // Validar datos al crear instancia
        this.validate();
    }

    /**
     * Valida todos los campos de la nutrición
     * @throws {Error} Si algún campo no cumple con las validaciones
     */
    validate() {
        this.validateClienteId();
        this.validatePlanId();
        this.validateFecha();
        this.validateAlimentos();
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
     * Valida la fecha del registro nutricional
     */
    validateFecha() {
        if (!(this.fecha instanceof Date)) {
            throw new Error('Fecha debe ser un objeto Date');
        }
        
        // Verificar que no sea una fecha futura
        if (this.fecha > new Date()) {
            throw new Error('Fecha del registro nutricional no puede ser futura');
        }
        
        // Verificar que no sea muy antigua (más de 1 año)
        const unAnoAtras = new Date();
        unAnoAtras.setFullYear(unAnoAtras.getFullYear() - 1);
        
        if (this.fecha < unAnoAtras) {
            throw new Error('Fecha del registro nutricional no puede ser anterior a 1 año');
        }
    }

    /**
     * Valida el array de alimentos
     */
    validateAlimentos() {
        if (!Array.isArray(this.alimentos)) {
            throw new Error('Alimentos debe ser un array');
        }
        
        // Validar cada alimento
        for (let i = 0; i < this.alimentos.length; i++) {
            const alimento = this.alimentos[i];
            this.validateAlimento(alimento, i);
        }
    }

    /**
     * Valida un alimento individual
     * @param {Object} alimento - Objeto alimento a validar
     * @param {number} index - Índice del alimento en el array
     */
    validateAlimento(alimento, index) {
        if (!alimento || typeof alimento !== 'object') {
            throw new Error(`Alimento en posición ${index} debe ser un objeto`);
        }
        
        // Validar nombre
        if (!alimento.nombre || typeof alimento.nombre !== 'string') {
            throw new Error(`Nombre del alimento en posición ${index} es obligatorio y debe ser string`);
        }
        if (alimento.nombre.trim().length < 2) {
            throw new Error(`Nombre del alimento en posición ${index} debe tener al menos 2 caracteres`);
        }
        if (alimento.nombre.trim().length > 100) {
            throw new Error(`Nombre del alimento en posición ${index} no puede exceder 100 caracteres`);
        }
        
        // Validar calorías
        if (alimento.calorias === undefined || alimento.calorias === null) {
            throw new Error(`Calorías del alimento en posición ${index} son obligatorias`);
        }
        if (typeof alimento.calorias !== 'number') {
            throw new Error(`Calorías del alimento en posición ${index} deben ser un número`);
        }
        if (alimento.calorias < 0) {
            throw new Error(`Calorías del alimento en posición ${index} no pueden ser negativas`);
        }
        if (alimento.calorias > 10000) { // Máximo razonable por alimento
            throw new Error(`Calorías del alimento en posición ${index} no pueden exceder 10000`);
        }
        
        // Validar cantidad
        if (!alimento.cantidad || typeof alimento.cantidad !== 'string') {
            throw new Error(`Cantidad del alimento en posición ${index} es obligatoria y debe ser string`);
        }
        if (alimento.cantidad.trim().length < 1) {
            throw new Error(`Cantidad del alimento en posición ${index} no puede estar vacía`);
        }
        if (alimento.cantidad.trim().length > 50) {
            throw new Error(`Cantidad del alimento en posición ${index} no puede exceder 50 caracteres`);
        }
        
        // Limpiar datos
        alimento.nombre = alimento.nombre.trim();
        alimento.cantidad = alimento.cantidad.trim();
    }

    /**
     * Agrega un alimento al registro nutricional
     * @param {string} nombre - Nombre del alimento
     * @param {number} calorias - Calorías del alimento
     * @param {string} cantidad - Cantidad del alimento
     */
    agregarAlimento(nombre, calorias, cantidad) {
        const alimento = {
            nombre: nombre,
            calorias: calorias,
            cantidad: cantidad
        };
        
        // Validar el alimento antes de agregarlo
        this.validateAlimento(alimento, this.alimentos.length);
        
        this.alimentos.push(alimento);
    }

    /**
     * Remueve un alimento del registro
     * @param {number} index - Índice del alimento a remover
     */
    removerAlimento(index) {
        if (index < 0 || index >= this.alimentos.length) {
            throw new Error('Índice del alimento fuera de rango');
        }
        
        this.alimentos.splice(index, 1);
    }

    /**
     * Calcula el total de calorías del día
     * @returns {number} Total de calorías
     */
    getTotalCalorias() {
        return this.alimentos.reduce((total, alimento) => total + alimento.calorias, 0);
    }

    /**
     * Calcula el promedio de calorías por alimento
     * @returns {number} Promedio de calorías
     */
    getPromedioCaloriasPorAlimento() {
        if (this.alimentos.length === 0) {
            return 0;
        }
        return this.getTotalCalorias() / this.alimentos.length;
    }

    /**
     * Obtiene el alimento con más calorías
     * @returns {Object|null} Alimento con más calorías o null si no hay alimentos
     */
    getAlimentoMasCalorico() {
        if (this.alimentos.length === 0) {
            return null;
        }
        
        return this.alimentos.reduce((max, alimento) => 
            alimento.calorias > max.calorias ? alimento : max
        );
    }

    /**
     * Obtiene el alimento con menos calorías
     * @returns {Object|null} Alimento con menos calorías o null si no hay alimentos
     */
    getAlimentoMenosCalorico() {
        if (this.alimentos.length === 0) {
            return null;
        }
        
        return this.alimentos.reduce((min, alimento) => 
            alimento.calorias < min.calorias ? alimento : min
        );
    }

    /**
     * Busca alimentos por nombre
     * @param {string} nombre - Nombre a buscar
     * @returns {Array} Array de alimentos que coinciden
     */
    buscarAlimentosPorNombre(nombre) {
        if (typeof nombre !== 'string') {
            throw new Error('Nombre de búsqueda debe ser string');
        }
        
        const nombreBusqueda = nombre.toLowerCase().trim();
        return this.alimentos.filter(alimento => 
            alimento.nombre.toLowerCase().includes(nombreBusqueda)
        );
    }

    /**
     * Obtiene alimentos con calorías en un rango específico
     * @param {number} caloriasMin - Calorías mínimas
     * @param {number} caloriasMax - Calorías máximas
     * @returns {Array} Array de alimentos en el rango
     */
    getAlimentosPorRangoCalorias(caloriasMin, caloriasMax) {
        if (typeof caloriasMin !== 'number' || typeof caloriasMax !== 'number') {
            throw new Error('Los rangos de calorías deben ser números');
        }
        
        if (caloriasMin < 0 || caloriasMax < 0) {
            throw new Error('Los rangos de calorías no pueden ser negativos');
        }
        
        if (caloriasMin > caloriasMax) {
            throw new Error('Calorías mínimas no pueden ser mayores a las máximas');
        }
        
        return this.alimentos.filter(alimento => 
            alimento.calorias >= caloriasMin && alimento.calorias <= caloriasMax
        );
    }

    /**
     * Verifica si el registro tiene alimentos
     * @returns {boolean} True si tiene alimentos
     */
    tieneAlimentos() {
        return this.alimentos.length > 0;
    }

    /**
     * Obtiene el número de alimentos registrados
     * @returns {number} Cantidad de alimentos
     */
    getCantidadAlimentos() {
        return this.alimentos.length;
    }

    /**
     * Convierte la nutrición a objeto plano para MongoDB
     * @returns {Object} Objeto listo para insertar en MongoDB
     */
    toMongoObject() {
        return {
            _id: this.nutricionId,
            clienteId: this.clienteId,
            planId: this.planId,
            fecha: this.fecha,
            alimentos: this.alimentos
        };
    }

    /**
     * Crea una instancia de Nutricion desde un objeto de MongoDB
     * @param {Object} mongoDoc - Documento de MongoDB
     * @returns {Nutricion} Instancia de Nutricion
     */
    static fromMongoObject(mongoDoc) {
        return new Nutricion({
            nutricionId: mongoDoc._id,
            clienteId: mongoDoc.clienteId,
            planId: mongoDoc.planId,
            fecha: mongoDoc.fecha,
            alimentos: mongoDoc.alimentos || []
        });
    }

    /**
     * Obtiene información resumida de la nutrición
     * @returns {Object} Información resumida
     */
    getResumen() {
        return {
            nutricionId: this.nutricionId,
            clienteId: this.clienteId,
            planId: this.planId,
            fecha: dayjs(this.fecha).format('DD/MM/YYYY'),
            cantidadAlimentos: this.alimentos.length,
            totalCalorias: this.getTotalCalorias(),
            promedioCalorias: this.getPromedioCaloriasPorAlimento(),
            alimentoMasCalorico: this.getAlimentoMasCalorico()?.nombre || 'N/A',
            alimentoMenosCalorico: this.getAlimentoMenosCalorico()?.nombre || 'N/A'
        };
    }

    /**
     * Obtiene estadísticas detalladas de la nutrición
     * @returns {Object} Estadísticas detalladas
     */
    getEstadisticas() {
        if (this.alimentos.length === 0) {
            return {
                totalCalorias: 0,
                promedioCalorias: 0,
                cantidadAlimentos: 0,
                rangoCalorias: { min: 0, max: 0 },
                distribucionCalorias: []
            };
        }

        const calorias = this.alimentos.map(a => a.calorias);
        const totalCalorias = this.getTotalCalorias();
        const promedioCalorias = this.getPromedioCaloriasPorAlimento();
        
        return {
            totalCalorias,
            promedioCalorias,
            cantidadAlimentos: this.alimentos.length,
            rangoCalorias: {
                min: Math.min(...calorias),
                max: Math.max(...calorias)
            },
            distribucionCalorias: this.alimentos.map(alimento => ({
                nombre: alimento.nombre,
                calorias: alimento.calorias,
                porcentaje: ((alimento.calorias / totalCalorias) * 100).toFixed(2)
            }))
        };
    }
}

module.exports = Nutricion;
