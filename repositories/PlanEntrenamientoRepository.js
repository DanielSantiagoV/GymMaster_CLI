const { ObjectId } = require('mongodb');
const { PlanEntrenamiento } = require('../models');

/**
 * Repositorio para gestión de planes de entrenamiento
 * Implementa el patrón Repository para abstraer el acceso a datos
 * Maneja operaciones CRUD y métodos específicos para planes
 */
class PlanEntrenamientoRepository {
    constructor(db) {
        this.collection = db.collection('planes');
        this.db = db;
    }

    /**
     * Crea un nuevo plan de entrenamiento
     * @param {PlanEntrenamiento} plan - Instancia de PlanEntrenamiento a crear
     * @returns {Promise<ObjectId>} ID del plan creado
     * @throws {Error} Si la validación falla o hay error en la inserción
     */
    async create(plan) {
        try {
            // Validar que sea una instancia de PlanEntrenamiento
            if (!(plan instanceof PlanEntrenamiento)) {
                throw new Error('El parámetro debe ser una instancia de PlanEntrenamiento');
            }

            // Convertir a objeto MongoDB
            const planDoc = plan.toMongoObject();
            
            // Verificar que no exista un plan con el mismo nombre
            const planExistente = await this.collection.findOne({ nombre: planDoc.nombre });
            if (planExistente) {
                throw new Error('Ya existe un plan con este nombre');
            }

            // Insertar en la base de datos
            const result = await this.collection.insertOne(planDoc);
            return result.insertedId;
        } catch (error) {
            throw new Error(`Error al crear plan: ${error.message}`);
        }
    }

    /**
     * Obtiene un plan por su ID
     * @param {string|ObjectId} id - ID del plan
     * @returns {Promise<PlanEntrenamiento|null>} Plan encontrado o null
     * @throws {Error} Si el ID no es válido
     */
    async getById(id) {
        try {
            if (!ObjectId.isValid(id)) {
                throw new Error('ID del plan no es válido');
            }

            const planDoc = await this.collection.findOne({ _id: new ObjectId(id) });
            
            if (!planDoc) {
                return null;
            }

            return PlanEntrenamiento.fromMongoObject(planDoc);
        } catch (error) {
            throw new Error(`Error al obtener plan: ${error.message}`);
        }
    }

    /**
     * Obtiene todos los planes con filtro opcional
     * @param {Object} filter - Filtro de búsqueda
     * @param {Object} options - Opciones de consulta (limit, skip, sort)
     * @returns {Promise<PlanEntrenamiento[]>} Array de planes
     */
    async getAll(filter = {}, options = {}) {
        try {
            const { limit = 0, skip = 0, sort = { fechaCreacion: -1 } } = options;
            
            let query = this.collection.find(filter);
            
            if (sort) {
                query = query.sort(sort);
            }
            
            if (skip > 0) {
                query = query.skip(skip);
            }
            
            if (limit > 0) {
                query = query.limit(limit);
            }

            const planesDocs = await query.toArray();
            return planesDocs.map(doc => PlanEntrenamiento.fromMongoObject(doc));
        } catch (error) {
            throw new Error(`Error al obtener planes: ${error.message}`);
        }
    }

    /**
     * Actualiza un plan existente
     * @param {string|ObjectId} id - ID del plan a actualizar
     * @param {Object} updatedData - Datos actualizados
     * @returns {Promise<boolean>} True si se actualizó correctamente
     * @throws {Error} Si el ID no es válido o hay error en la actualización
     */
    async update(id, updatedData) {
        try {
            if (!ObjectId.isValid(id)) {
                throw new Error('ID del plan no es válido');
            }

            // Si se está actualizando el nombre, verificar que no exista otro plan con el mismo nombre
            if (updatedData.nombre) {
                const planExistente = await this.collection.findOne({ 
                    nombre: updatedData.nombre, 
                    _id: { $ne: new ObjectId(id) } 
                });
                if (planExistente) {
                    throw new Error('Ya existe otro plan con este nombre');
                }
            }

            const result = await this.collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updatedData }
            );

            return result.modifiedCount > 0;
        } catch (error) {
            throw new Error(`Error al actualizar plan: ${error.message}`);
        }
    }

    /**
     * Elimina un plan por su ID
     * @param {string|ObjectId} id - ID del plan a eliminar
     * @returns {Promise<boolean>} True si se eliminó correctamente
     * @throws {Error} Si el ID no es válido o hay dependencias
     */
    async delete(id) {
        try {
            if (!ObjectId.isValid(id)) {
                throw new Error('ID del plan no es válido');
            }

            // Verificar si el plan tiene clientes asignados
            const plan = await this.getById(id);
            if (plan && plan.tieneClientes()) {
                throw new Error('No se puede eliminar un plan que tiene clientes asignados');
            }

            // Verificar si tiene contratos activos
            const contratosCollection = this.db.collection('contratos');
            const contratosActivos = await contratosCollection.countDocuments({
                planId: new ObjectId(id),
                estado: 'vigente'
            });

            if (contratosActivos > 0) {
                throw new Error('No se puede eliminar un plan con contratos activos');
            }

            const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
            return result.deletedCount > 0;
        } catch (error) {
            throw new Error(`Error al eliminar plan: ${error.message}`);
        }
    }

    /**
     * Obtiene planes por nivel
     * @param {string} nivel - Nivel del plan (principiante, intermedio, avanzado)
     * @returns {Promise<PlanEntrenamiento[]>} Array de planes del nivel especificado
     */
    async getPlansByLevel(nivel) {
        try {
            if (!nivel || typeof nivel !== 'string') {
                throw new Error('Nivel debe ser una string válida');
            }

            return await this.getAll({ nivel: nivel.toLowerCase() });
        } catch (error) {
            throw new Error(`Error al obtener planes por nivel: ${error.message}`);
        }
    }

    /**
     * Obtiene todos los planes activos
     * @returns {Promise<PlanEntrenamiento[]>} Array de planes activos
     */
    async getActivePlans() {
        try {
            return await this.getAll({ estado: 'activo' });
        } catch (error) {
            throw new Error(`Error al obtener planes activos: ${error.message}`);
        }
    }

    /**
     * Obtiene planes por duración
     * @param {number} duracionMin - Duración mínima en semanas
     * @param {number} duracionMax - Duración máxima en semanas
     * @returns {Promise<PlanEntrenamiento[]>} Array de planes en el rango
     */
    async getPlansByDuration(duracionMin, duracionMax) {
        try {
            if (typeof duracionMin !== 'number' || typeof duracionMax !== 'number') {
                throw new Error('Las duraciones deben ser números');
            }

            if (duracionMin < 0 || duracionMax < 0) {
                throw new Error('Las duraciones no pueden ser negativas');
            }

            if (duracionMin > duracionMax) {
                throw new Error('Duración mínima no puede ser mayor a la máxima');
            }

            return await this.getAll({
                duracionSemanas: {
                    $gte: duracionMin,
                    $lte: duracionMax
                }
            });
        } catch (error) {
            throw new Error(`Error al obtener planes por duración: ${error.message}`);
        }
    }

    /**
     * Busca planes por nombre o metas
     * @param {string} searchTerm - Término de búsqueda
     * @returns {Promise<PlanEntrenamiento[]>} Array de planes que coinciden
     */
    async searchPlans(searchTerm) {
        try {
            if (!searchTerm || typeof searchTerm !== 'string') {
                throw new Error('Término de búsqueda debe ser una string válida');
            }

            const regex = new RegExp(searchTerm, 'i');
            return await this.getAll({
                $or: [
                    { nombre: regex },
                    { metasFisicas: regex }
                ]
            });
        } catch (error) {
            throw new Error(`Error al buscar planes: ${error.message}`);
        }
    }

    /**
     * Obtiene planes que no tienen clientes asignados
     * @returns {Promise<PlanEntrenamiento[]>} Array de planes sin clientes
     */
    async getPlansWithoutClients() {
        try {
            return await this.getAll({
                clientes: { $exists: true, $size: 0 }
            });
        } catch (error) {
            throw new Error(`Error al obtener planes sin clientes: ${error.message}`);
        }
    }

    /**
     * Obtiene planes con más clientes asignados
     * @param {number} limit - Límite de resultados
     * @returns {Promise<PlanEntrenamiento[]>} Array de planes más populares
     */
    async getMostPopularPlans(limit = 5) {
        try {
            const pipeline = [
                {
                    $addFields: {
                        clientCount: { $size: { $ifNull: ["$clientes", []] } }
                    }
                },
                { $sort: { clientCount: -1 } },
                { $limit: limit }
            ];

            const planesDocs = await this.collection.aggregate(pipeline).toArray();
            return planesDocs.map(doc => PlanEntrenamiento.fromMongoObject(doc));
        } catch (error) {
            throw new Error(`Error al obtener planes más populares: ${error.message}`);
        }
    }

    /**
     * Obtiene estadísticas de planes
     * @returns {Promise<Object>} Estadísticas de planes
     */
    async getPlanStats() {
        try {
            const totalPlanes = await this.collection.countDocuments();
            const planesActivos = await this.collection.countDocuments({ estado: 'activo' });
            const planesCancelados = await this.collection.countDocuments({ estado: 'cancelado' });
            const planesFinalizados = await this.collection.countDocuments({ estado: 'finalizado' });

            // Distribución por nivel
            const distribucionNivel = await this.collection.aggregate([
                { $group: { _id: "$nivel", count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]).toArray();

            // Distribución por duración
            const distribucionDuracion = await this.collection.aggregate([
                {
                    $bucket: {
                        groupBy: "$duracionSemanas",
                        boundaries: [0, 4, 8, 12, 16, 20, 24, 52],
                        default: "52+",
                        output: { count: { $sum: 1 } }
                    }
                }
            ]).toArray();

            return {
                totalPlanes,
                planesActivos,
                planesCancelados,
                planesFinalizados,
                distribucionNivel,
                distribucionDuracion
            };
        } catch (error) {
            throw new Error(`Error al obtener estadísticas: ${error.message}`);
        }
    }

    /**
     * Agrega un cliente a un plan
     * @param {string|ObjectId} planId - ID del plan
     * @param {string|ObjectId} clienteId - ID del cliente
     * @returns {Promise<boolean>} True si se agregó correctamente
     */
    async addClientToPlan(planId, clienteId) {
        try {
            if (!ObjectId.isValid(planId) || !ObjectId.isValid(clienteId)) {
                throw new Error('IDs deben ser ObjectIds válidos');
            }

            const result = await this.collection.updateOne(
                { _id: new ObjectId(planId) },
                { $addToSet: { clientes: new ObjectId(clienteId) } }
            );

            return result.modifiedCount > 0;
        } catch (error) {
            throw new Error(`Error al agregar cliente al plan: ${error.message}`);
        }
    }

    /**
     * Remueve un cliente de un plan
     * @param {string|ObjectId} planId - ID del plan
     * @param {string|ObjectId} clienteId - ID del cliente
     * @returns {Promise<boolean>} True si se removió correctamente
     */
    async removeClientFromPlan(planId, clienteId) {
        try {
            if (!ObjectId.isValid(planId) || !ObjectId.isValid(clienteId)) {
                throw new Error('IDs deben ser ObjectIds válidos');
            }

            const result = await this.collection.updateOne(
                { _id: new ObjectId(planId) },
                { $pull: { clientes: new ObjectId(clienteId) } }
            );

            return result.modifiedCount > 0;
        } catch (error) {
            throw new Error(`Error al remover cliente del plan: ${error.message}`);
        }
    }

    /**
     * Cambia el estado de un plan
     * @param {string|ObjectId} planId - ID del plan
     * @param {string} nuevoEstado - Nuevo estado del plan
     * @returns {Promise<boolean>} True si se cambió correctamente
     */
    async changePlanState(planId, nuevoEstado) {
        try {
            if (!ObjectId.isValid(planId)) {
                throw new Error('ID del plan no es válido');
            }

            const estadosValidos = ['activo', 'cancelado', 'finalizado'];
            if (!estadosValidos.includes(nuevoEstado.toLowerCase())) {
                throw new Error(`Estado debe ser uno de: ${estadosValidos.join(', ')}`);
            }

            const result = await this.collection.updateOne(
                { _id: new ObjectId(planId) },
                { $set: { estado: nuevoEstado.toLowerCase() } }
            );

            return result.modifiedCount > 0;
        } catch (error) {
            throw new Error(`Error al cambiar estado del plan: ${error.message}`);
        }
    }

    /**
     * Obtiene planes creados en un rango de fechas
     * @param {Date} fechaInicio - Fecha de inicio
     * @param {Date} fechaFin - Fecha de fin
     * @returns {Promise<PlanEntrenamiento[]>} Array de planes en el rango
     */
    async getPlansByDateRange(fechaInicio, fechaFin) {
        try {
            if (!(fechaInicio instanceof Date) || !(fechaFin instanceof Date)) {
                throw new Error('Las fechas deben ser objetos Date válidos');
            }

            return await this.getAll({
                fechaCreacion: {
                    $gte: fechaInicio,
                    $lte: fechaFin
                }
            });
        } catch (error) {
            throw new Error(`Error al obtener planes por rango de fechas: ${error.message}`);
        }
    }

    /**
     * Cuenta el número de planes que coinciden con el filtro
     * @param {Object} filter - Filtro de búsqueda
     * @returns {Promise<number>} Número de planes que coinciden
     */
    async countPlanes(filter = {}) {
        try {
            return await this.collection.countDocuments(filter);
        } catch (error) {
            throw new Error(`Error al contar planes: ${error.message}`);
        }
    }
}

module.exports = PlanEntrenamientoRepository;
