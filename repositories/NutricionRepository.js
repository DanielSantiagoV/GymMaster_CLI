const { ObjectId } = require('mongodb');
const { Nutricion } = require('../models');

/**
 * Repositorio Nutrición - Maneja operaciones CRUD para planes nutricionales
 * Implementa patrón Repository para abstraer acceso a datos
 */
class NutricionRepository {
    constructor(db) {
        this.db = db;
        this.collection = db.collection('nutricion');
    }

    /**
     * Crea un nuevo plan nutricional
     * @param {Nutricion} nutricion - Plan nutricional a crear
     * @returns {Promise<string>} ID del plan creado
     */
    async create(nutricion) {
        try {
            const mongoObj = nutricion.toMongoObject();
            const result = await this.collection.insertOne(mongoObj);
            return result.insertedId.toString();
        } catch (error) {
            throw new Error(`Error al crear plan nutricional: ${error.message}`);
        }
    }

    /**
     * Obtiene un plan nutricional por ID
     * @param {string} id - ID del plan
     * @returns {Promise<Nutricion|null>} Plan nutricional o null
     */
    async getById(id) {
        try {
            if (!ObjectId.isValid(id)) {
                throw new Error('ID del plan nutricional no es válido');
            }
            
            const mongoObj = await this.collection.findOne({ _id: new ObjectId(id) });
            return Nutricion.fromMongoObject(mongoObj);
        } catch (error) {
            throw new Error(`Error al obtener plan nutricional: ${error.message}`);
        }
    }

    /**
     * Lista todos los planes nutricionales
     * @param {Object} filtros - Filtros opcionales
     * @returns {Promise<Array>} Lista de planes
     */
    async getAll(filtros = {}) {
        try {
            const query = this.construirQuery(filtros);
            const cursor = this.collection.find(query).sort({ fechaCreacion: -1 });
            const mongoObjs = await cursor.toArray();
            return mongoObjs.map(obj => Nutricion.fromMongoObject(obj));
        } catch (error) {
            throw new Error(`Error al listar planes nutricionales: ${error.message}`);
        }
    }

    /**
     * Actualiza un plan nutricional
     * @param {string} id - ID del plan
     * @param {Object} datos - Datos a actualizar
     * @returns {Promise<boolean>} True si se actualizó
     */
    async update(id, datos) {
        try {
            if (!ObjectId.isValid(id)) {
                throw new Error('ID del plan nutricional no es válido');
            }
            
            const updateData = {
                ...datos,
                fechaActualizacion: new Date()
            };
            
            const result = await this.collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updateData }
            );
            
            return result.modifiedCount > 0;
        } catch (error) {
            throw new Error(`Error al actualizar plan nutricional: ${error.message}`);
        }
    }

    /**
     * Elimina un plan nutricional
     * @param {string} id - ID del plan
     * @returns {Promise<boolean>} True si se eliminó
     */
    async delete(id) {
        try {
            if (!ObjectId.isValid(id)) {
                throw new Error('ID del plan nutricional no es válido');
            }
            
            const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
            return result.deletedCount > 0;
        } catch (error) {
            throw new Error(`Error al eliminar plan nutricional: ${error.message}`);
        }
    }

    /**
     * Obtiene planes nutricionales por cliente
     * @param {string} clienteId - ID del cliente
     * @returns {Promise<Array>} Lista de planes del cliente
     */
    async getByClient(clienteId) {
        try {
            if (!ObjectId.isValid(clienteId)) {
                throw new Error('ID del cliente no es válido');
            }
            
            const cursor = this.collection.find({ clienteId: new ObjectId(clienteId) })
                .sort({ fechaCreacion: -1 });
            const mongoObjs = await cursor.toArray();
            return mongoObjs.map(obj => Nutricion.fromMongoObject(obj));
        } catch (error) {
            throw new Error(`Error al obtener planes del cliente: ${error.message}`);
        }
    }

    /**
     * Obtiene planes nutricionales por contrato
     * @param {string} contratoId - ID del contrato
     * @returns {Promise<Array>} Lista de planes del contrato
     */
    async getByContract(contratoId) {
        try {
            if (!ObjectId.isValid(contratoId)) {
                throw new Error('ID del contrato no es válido');
            }
            
            const cursor = this.collection.find({ contratoId: new ObjectId(contratoId) })
                .sort({ fechaCreacion: -1 });
            const mongoObjs = await cursor.toArray();
            return mongoObjs.map(obj => Nutricion.fromMongoObject(obj));
        } catch (error) {
            throw new Error(`Error al obtener planes del contrato: ${error.message}`);
        }
    }

    /**
     * Obtiene planes nutricionales por estado
     * @param {string} estado - Estado del plan
     * @returns {Promise<Array>} Lista de planes por estado
     */
    async getByStatus(estado) {
        try {
            const estadosValidos = ['activo', 'pausado', 'finalizado', 'cancelado'];
            if (!estadosValidos.includes(estado)) {
                throw new Error(`Estado debe ser uno de: ${estadosValidos.join(', ')}`);
            }
            
            const cursor = this.collection.find({ estado: estado })
                .sort({ fechaCreacion: -1 });
            const mongoObjs = await cursor.toArray();
            return mongoObjs.map(obj => Nutricion.fromMongoObject(obj));
        } catch (error) {
            throw new Error(`Error al obtener planes por estado: ${error.message}`);
        }
    }

    /**
     * Obtiene planes nutricionales por tipo
     * @param {string} tipoPlan - Tipo de plan
     * @returns {Promise<Array>} Lista de planes por tipo
     */
    async getByType(tipoPlan) {
        try {
            const tiposValidos = [
                'perdida_peso',
                'ganancia_masa',
                'mantenimiento',
                'deportivo',
                'medico',
                'personalizado'
            ];
            
            if (!tiposValidos.includes(tipoPlan)) {
                throw new Error(`Tipo de plan debe ser uno de: ${tiposValidos.join(', ')}`);
            }
            
            const cursor = this.collection.find({ tipoPlan: tipoPlan })
                .sort({ fechaCreacion: -1 });
            const mongoObjs = await cursor.toArray();
            return mongoObjs.map(obj => Nutricion.fromMongoObject(obj));
        } catch (error) {
            throw new Error(`Error al obtener planes por tipo: ${error.message}`);
        }
    }

    /**
     * Obtiene el plan activo de un cliente
     * @param {string} clienteId - ID del cliente
     * @returns {Promise<Nutricion|null>} Plan activo o null
     */
    async getActiveByClient(clienteId) {
        try {
            if (!ObjectId.isValid(clienteId)) {
                throw new Error('ID del cliente no es válido');
            }
            
            const mongoObj = await this.collection.findOne({
                clienteId: new ObjectId(clienteId),
                estado: 'activo'
            });
            
            return Nutricion.fromMongoObject(mongoObj);
        } catch (error) {
            throw new Error(`Error al obtener plan activo: ${error.message}`);
        }
    }

    /**
     * Busca planes nutricionales por texto
     * @param {string} termino - Término de búsqueda
     * @returns {Promise<Array>} Lista de planes encontrados
     */
    async search(termino) {
        try {
            if (!termino || typeof termino !== 'string') {
                throw new Error('Término de búsqueda es requerido');
            }
            
            // Si es un ID válido, buscar por ID
            if (ObjectId.isValid(termino)) {
                const mongoObj = await this.collection.findOne({ _id: new ObjectId(termino) });
                if (mongoObj) {
                    return [Nutricion.fromMongoObject(mongoObj)];
                }
            }
            
            // Buscar por texto en los campos
            const query = {
                $or: [
                    { detallePlan: { $regex: termino, $options: 'i' } },
                    { evaluacionNutricional: { $regex: termino, $options: 'i' } },
                    { notasAdicionales: { $regex: termino, $options: 'i' } }
                ]
            };
            
            const cursor = this.collection.find(query).sort({ fechaCreacion: -1 });
            const mongoObjs = await cursor.toArray();
            return mongoObjs.map(obj => Nutricion.fromMongoObject(obj));
        } catch (error) {
            throw new Error(`Error al buscar planes: ${error.message}`);
        }
    }

    /**
     * Obtiene estadísticas de planes nutricionales
     * @returns {Promise<Object>} Estadísticas
     */
    async getStats() {
        try {
            const total = await this.collection.countDocuments();
            const activos = await this.collection.countDocuments({ estado: 'activo' });
            const pausados = await this.collection.countDocuments({ estado: 'pausado' });
            const finalizados = await this.collection.countDocuments({ estado: 'finalizado' });
            const cancelados = await this.collection.countDocuments({ estado: 'cancelado' });
            
            return {
                total,
                activos,
                pausados,
                finalizados,
                cancelados
            };
        } catch (error) {
            throw new Error(`Error al obtener estadísticas: ${error.message}`);
        }
    }

    /**
     * Construye query de filtros
     * @param {Object} filtros - Filtros a aplicar
     * @returns {Object} Query de MongoDB
     */
    construirQuery(filtros) {
        const query = {};
        
        if (filtros.clienteId) {
            query.clienteId = new ObjectId(filtros.clienteId);
        }
        
        if (filtros.contratoId) {
            query.contratoId = new ObjectId(filtros.contratoId);
        }
        
        if (filtros.estado) {
            query.estado = filtros.estado;
        }
        
        if (filtros.tipoPlan) {
            query.tipoPlan = filtros.tipoPlan;
        }
        
        if (filtros.fechaDesde) {
            query.fechaCreacion = { $gte: new Date(filtros.fechaDesde) };
        }
        
        if (filtros.fechaHasta) {
            if (query.fechaCreacion) {
                query.fechaCreacion.$lte = new Date(filtros.fechaHasta);
            } else {
                query.fechaCreacion = { $lte: new Date(filtros.fechaHasta) };
            }
        }
        
        return query;
    }
}

module.exports = NutricionRepository;