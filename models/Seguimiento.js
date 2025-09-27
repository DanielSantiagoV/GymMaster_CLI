const { ObjectId } = require('mongodb');
const dayjs = require('dayjs');

/**
 * Clase Seguimiento - Modelo para seguimiento físico de clientes
 * Implementa validaciones robustas y principios SOLID
 */
class Seguimiento {
    constructor({ 
        seguimientoId = null, 
        clienteId, 
        contratoId, 
        fecha = null, 
        peso = null, 
        grasaCorporal = null, 
        medidas = {}, 
        fotos = [], 
        comentarios = '' 
    }) {
        this.seguimientoId = seguimientoId || new ObjectId();
        this.clienteId = clienteId;
        this.contratoId = contratoId;
        this.fecha = fecha || new Date();
        this.peso = peso;
        this.grasaCorporal = grasaCorporal;
        this.medidas = medidas || {};
        this.fotos = fotos || [];
        this.comentarios = comentarios || '';
        
        // Validar datos al crear instancia
        this.validate();
    }

    /**
     * Valida todos los campos del seguimiento
     * @throws {Error} Si algún campo no cumple con las validaciones
     */
    validate() {
        this.validateClienteId();
        this.validateContratoId();
        this.validateFecha();
        this.validatePeso();
        this.validateGrasaCorporal();
        this.validateMedidas();
        this.validateFotos();
        this.validateComentarios();
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
     * Valida el ID del contrato
     */
    validateContratoId() {
        if (!this.contratoId) {
            throw new Error('ID del contrato es obligatorio');
        }
        if (!ObjectId.isValid(this.contratoId)) {
            throw new Error('ID del contrato debe ser un ObjectId válido');
        }
    }

    /**
     * Valida la fecha del seguimiento
     */
    validateFecha() {
        if (!(this.fecha instanceof Date)) {
            throw new Error('Fecha debe ser un objeto Date');
        }
        
        // Verificar que no sea una fecha muy futura (más de 1 día)
        const mañana = new Date();
        mañana.setDate(mañana.getDate() + 1);
        
        if (this.fecha > mañana) {
            throw new Error('Fecha del seguimiento no puede ser más de 1 día en el futuro');
        }
        
        // Verificar que no sea muy antigua (más de 1 año)
        const unAnoAtras = new Date();
        unAnoAtras.setFullYear(unAnoAtras.getFullYear() - 1);
        
        if (this.fecha < unAnoAtras) {
            throw new Error('Fecha del seguimiento no puede ser anterior a 1 año');
        }
    }

    /**
     * Valida el peso
     */
    validatePeso() {
        if (this.peso !== null && this.peso !== undefined) {
            if (typeof this.peso !== 'number') {
                throw new Error('Peso debe ser un número');
            }
            if (this.peso <= 0) {
                throw new Error('Peso debe ser mayor a 0');
            }
            if (this.peso > 500) { // Peso máximo razonable
                throw new Error('Peso no puede exceder 500 kg');
            }
        }
    }

    /**
     * Valida el porcentaje de grasa corporal
     */
    validateGrasaCorporal() {
        if (this.grasaCorporal !== null && this.grasaCorporal !== undefined) {
            if (typeof this.grasaCorporal !== 'number') {
                throw new Error('Grasa corporal debe ser un número');
            }
            if (this.grasaCorporal < 0) {
                throw new Error('Grasa corporal no puede ser negativa');
            }
            if (this.grasaCorporal > 100) {
                throw new Error('Grasa corporal no puede exceder 100%');
            }
        }
    }

    /**
     * Valida las medidas corporales
     */
    validateMedidas() {
        if (!this.medidas || typeof this.medidas !== 'object') {
            this.medidas = {};
            return;
        }

        const medidasValidas = ['cintura', 'brazo', 'pierna', 'pecho', 'cadera'];
        
        for (const [medida, valor] of Object.entries(this.medidas)) {
            if (!medidasValidas.includes(medida)) {
                throw new Error(`Medida '${medida}' no es válida. Medidas permitidas: ${medidasValidas.join(', ')}`);
            }
            
            if (typeof valor !== 'number') {
                throw new Error(`Valor de ${medida} debe ser un número`);
            }
            
            if (valor <= 0) {
                throw new Error(`Valor de ${medida} debe ser mayor a 0`);
            }
            
            if (valor > 200) { // Medida máxima razonable en cm
                throw new Error(`Valor de ${medida} no puede exceder 200 cm`);
            }
        }
    }

    /**
     * Valida el array de fotos
     */
    validateFotos() {
        if (!Array.isArray(this.fotos)) {
            throw new Error('Fotos debe ser un array');
        }
        
        // Validar que cada foto sea una string (URL o ruta)
        for (const foto of this.fotos) {
            if (typeof foto !== 'string') {
                throw new Error('Cada foto debe ser una string (URL o ruta)');
            }
            if (!foto || foto.trim().length === 0) {
                throw new Error('Las fotos no pueden estar vacías');
            }
        }
    }

    /**
     * Valida los comentarios
     */
    validateComentarios() {
        if (typeof this.comentarios !== 'string') {
            this.comentarios = '';
        }
        
        if (this.comentarios.length > 1000) {
            throw new Error('Comentarios no pueden exceder 1000 caracteres');
        }
        
        // Limpiar comentarios
        this.comentarios = this.comentarios ? this.comentarios.trim() : '';
    }

    /**
     * Verifica si el seguimiento tiene datos de peso
     * @returns {boolean} True si tiene peso
     */
    tienePeso() {
        return this.peso !== null && this.peso !== undefined;
    }

    /**
     * Verifica si el seguimiento tiene datos de grasa corporal
     * @returns {boolean} True si tiene grasa corporal
     */
    tieneGrasaCorporal() {
        return this.grasaCorporal !== null && this.grasaCorporal !== undefined;
    }

    /**
     * Verifica si el seguimiento tiene medidas
     * @returns {boolean} True si tiene medidas
     */
    tieneMedidas() {
        return Object.keys(this.medidas).length > 0;
    }

    /**
     * Verifica si el seguimiento tiene fotos
     * @returns {boolean} True si tiene fotos
     */
    tieneFotos() {
        return this.fotos.length > 0;
    }

    /**
     * Agrega una medida al seguimiento
     * @param {string} tipo - Tipo de medida (cintura, brazo, etc.)
     * @param {number} valor - Valor de la medida
     */
    agregarMedida(tipo, valor) {
        const medidasValidas = ['cintura', 'brazo', 'pierna', 'pecho', 'cadera'];
        
        if (!medidasValidas.includes(tipo)) {
            throw new Error(`Tipo de medida '${tipo}' no es válido`);
        }
        
        if (typeof valor !== 'number' || valor <= 0 || valor > 200) {
            throw new Error('Valor de medida debe ser un número entre 0 y 200');
        }
        
        this.medidas[tipo] = valor;
    }

    /**
     * Agrega una foto al seguimiento
     * @param {string} foto - URL o ruta de la foto
     */
    agregarFoto(foto) {
        if (typeof foto !== 'string' || !foto || foto.trim().length === 0) {
            throw new Error('Foto debe ser una string válida');
        }
        
        this.fotos.push(foto.trim());
    }

    /**
     * Calcula el IMC si tiene peso y altura
     * @param {number} altura - Altura en metros
     * @returns {number|null} IMC calculado o null si no hay datos
     */
    calcularIMC(altura) {
        if (!this.tienePeso() || !altura || altura <= 0) {
            return null;
        }
        
        return this.peso / (altura * altura);
    }

    /**
     * Convierte el seguimiento a objeto plano para MongoDB
     * @returns {Object} Objeto listo para insertar en MongoDB
     */
    toMongoObject() {
        return {
            _id: this.seguimientoId,
            clienteId: this.clienteId,
            contratoId: this.contratoId,
            fecha: this.fecha,
            peso: this.peso,
            grasaCorporal: this.grasaCorporal,
            medidas: this.medidas,
            fotos: this.fotos,
            comentarios: this.comentarios
        };
    }

    /**
     * Crea una instancia de Seguimiento desde un objeto de MongoDB
     * @param {Object} mongoDoc - Documento de MongoDB
     * @returns {Seguimiento} Instancia de Seguimiento
     */
    static fromMongoObject(mongoDoc) {
        return new Seguimiento({
            seguimientoId: mongoDoc._id,
            clienteId: mongoDoc.clienteId,
            contratoId: mongoDoc.contratoId,
            fecha: mongoDoc.fecha,
            peso: mongoDoc.peso,
            grasaCorporal: mongoDoc.grasaCorporal,
            medidas: mongoDoc.medidas || {},
            fotos: mongoDoc.fotos || [],
            comentarios: mongoDoc.comentarios || ''
        });
    }

    /**
     * Obtiene información resumida del seguimiento
     * @returns {Object} Información resumida
     */
    getResumen() {
        return {
            seguimientoId: this.seguimientoId,
            clienteId: this.clienteId,
            contratoId: this.contratoId,
            fecha: dayjs(this.fecha).format('DD/MM/YYYY'),
            peso: this.peso,
            grasaCorporal: this.grasaCorporal,
            cantidadMedidas: Object.keys(this.medidas).length,
            cantidadFotos: this.fotos.length,
            tieneComentarios: this.comentarios.length > 0
        };
    }

    /**
     * Obtiene las medidas como array de objetos
     * @returns {Array} Array de medidas
     */
    getMedidasArray() {
        return Object.entries(this.medidas).map(([tipo, valor]) => ({
            tipo,
            valor,
            unidad: 'cm'
        }));
    }
}

module.exports = Seguimiento;
