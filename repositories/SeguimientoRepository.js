const { ObjectId } = require('mongodb');
const { Seguimiento } = require('../models');

/**
 * Repositorio para gestión de seguimientos físicos
 * Implementa el patrón Repository para abstraer el acceso a datos
 * Maneja operaciones CRUD y métodos específicos para seguimientos
 */
class SeguimientoRepository {
    constructor(db) {
        this.collection = db.collection('seguimientos');
        this.db = db;
    }

    /**
     * Crea un nuevo seguimiento
     * @param {Seguimiento} seguimiento - Instancia de Seguimiento a crear
     * @returns {Promise<ObjectId>} ID del seguimiento creado
     * @throws {Error} Si la validación falla o hay error en la inserción
     */
    async create(seguimiento) {
        try {
            // Validar que sea una instancia de Seguimiento
            if (!(seguimiento instanceof Seguimiento)) {
                throw new Error('El parámetro debe ser una instancia de Seguimiento');
            }

            // Verificar que no exista un seguimiento para el mismo cliente en la misma fecha
            const seguimientoExistente = await this.collection.findOne({
                clienteId: seguimiento.clienteId,
                fecha: {
                    $gte: new Date(seguimiento.fecha.getFullYear(), seguimiento.fecha.getMonth(), seguimiento.fecha.getDate()),
                    $lt: new Date(seguimiento.fecha.getFullYear(), seguimiento.fecha.getMonth(), seguimiento.fecha.getDate() + 1)
                }
            });

            if (seguimientoExistente) {
                throw new Error('Ya existe un seguimiento para este cliente en esta fecha');
            }

            // Convertir a objeto MongoDB
            const seguimientoDoc = seguimiento.toMongoObject();
            
            // Insertar en la base de datos
            const result = await this.collection.insertOne(seguimientoDoc);
            return result.insertedId;
        } catch (error) {
            throw new Error(`Error al crear seguimiento: ${error.message}`);
        }
    }

    /**
     * Obtiene un seguimiento por su ID
     * @param {string|ObjectId} id - ID del seguimiento
     * @returns {Promise<Seguimiento|null>} Seguimiento encontrado o null
     * @throws {Error} Si el ID no es válido
     */
    async getById(id) {
        try {
            if (!ObjectId.isValid(id)) {
                throw new Error('ID del seguimiento no es válido');
            }

            const seguimientoDoc = await this.collection.findOne({ _id: new ObjectId(id) });
            
            if (!seguimientoDoc) {
                return null;
            }

            return Seguimiento.fromMongoObject(seguimientoDoc);
        } catch (error) {
            throw new Error(`Error al obtener seguimiento: ${error.message}`);
        }
    }

    /**
     * Obtiene todos los seguimientos con filtro opcional
     * @param {Object} filter - Filtro de búsqueda
     * @param {Object} options - Opciones de consulta (limit, skip, sort)
     * @returns {Promise<Seguimiento[]>} Array de seguimientos
     */
    async getAll(filter = {}, options = {}) {
        try {
            const { limit = 0, skip = 0, sort = { fecha: -1 } } = options;
            
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

            const seguimientosDocs = await query.toArray();
            return seguimientosDocs.map(doc => Seguimiento.fromMongoObject(doc));
        } catch (error) {
            throw new Error(`Error al obtener seguimientos: ${error.message}`);
        }
    }

    /**
     * Actualiza un seguimiento existente
     * @param {string|ObjectId} id - ID del seguimiento a actualizar
     * @param {Object} updatedData - Datos actualizados
     * @returns {Promise<boolean>} True si se actualizó correctamente
     * @throws {Error} Si el ID no es válido o hay error en la actualización
     */
    async update(id, updatedData) {
        try {
            if (!ObjectId.isValid(id)) {
                throw new Error('ID del seguimiento no es válido');
            }

            const result = await this.collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updatedData }
            );

            return result.modifiedCount > 0;
        } catch (error) {
            throw new Error(`Error al actualizar seguimiento: ${error.message}`);
        }
    }

    /**
     * Elimina un seguimiento por su ID
     * @param {string|ObjectId} id - ID del seguimiento a eliminar
     * @returns {Promise<boolean>} True si se eliminó correctamente
     * @throws {Error} Si el ID no es válido
     */
    async delete(id) {
        try {
            if (!ObjectId.isValid(id)) {
                throw new Error('ID del seguimiento no es válido');
            }

            const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
            return result.deletedCount > 0;
        } catch (error) {
            throw new Error(`Error al eliminar seguimiento: ${error.message}`);
        }
    }

    /**
     * Obtiene seguimientos por cliente
     * @param {string|ObjectId} clienteId - ID del cliente
     * @param {Object} options - Opciones de consulta
     * @returns {Promise<Seguimiento[]>} Array de seguimientos del cliente
     */
    async getFollowUpsByClient(clienteId, options = {}) {
        try {
            if (!ObjectId.isValid(clienteId)) {
                throw new Error('ID del cliente no es válido');
            }

            const { limit = 0, skip = 0, sort = { fecha: -1 } } = options;
            
            return await this.getAll(
                { clienteId: new ObjectId(clienteId) },
                { limit, skip, sort }
            );
        } catch (error) {
            throw new Error(`Error al obtener seguimientos del cliente: ${error.message}`);
        }
    }

    /**
     * Elimina un seguimiento con rollback si afecta el plan
     * @param {string|ObjectId} id - ID del seguimiento a eliminar
     * @returns {Promise<boolean>} True si se eliminó correctamente
     * @throws {Error} Si hay error en el rollback
     */
    async deleteFollowUpWithRollback(id) {
        try {
            if (!ObjectId.isValid(id)) {
                throw new Error('ID del seguimiento no es válido');
            }

            // Obtener el seguimiento antes de eliminarlo
            const seguimiento = await this.getById(id);
            if (!seguimiento) {
                throw new Error('Seguimiento no encontrado');
            }

            // Iniciar transacción para rollback si es necesario
            const session = this.db.client.startSession();
            
            try {
                await session.withTransaction(async () => {
                    // Eliminar el seguimiento
                    const result = await this.collection.deleteOne(
                        { _id: new ObjectId(id) },
                        { session }
                    );

                    if (result.deletedCount === 0) {
                        throw new Error('No se pudo eliminar el seguimiento');
                    }

                    // Verificar si el cliente tiene otros seguimientos
                    const otrosSeguimientos = await this.collection.countDocuments({
                        clienteId: seguimiento.clienteId,
                        _id: { $ne: new ObjectId(id) }
                    }, { session });

                    // Si no hay otros seguimientos, podríamos considerar actualizar el estado del plan
                    // Esto es un ejemplo de lógica de rollback específica del negocio
                    if (otrosSeguimientos === 0) {
                        console.log('⚠️ Cliente sin seguimientos - considerar actualizar estado del plan');
                    }
                });

                return true;
            } finally {
                await session.endSession();
            }
        } catch (error) {
            throw new Error(`Error al eliminar seguimiento con rollback: ${error.message}`);
        }
    }

    /**
     * Obtiene seguimientos por rango de fechas
     * @param {Date} fechaInicio - Fecha de inicio
     * @param {Date} fechaFin - Fecha de fin
     * @param {string|ObjectId} clienteId - ID del cliente (opcional)
     * @returns {Promise<Seguimiento[]>} Array de seguimientos en el rango
     */
    async getFollowUpsByDateRange(fechaInicio, fechaFin, clienteId = null) {
        try {
            if (!(fechaInicio instanceof Date) || !(fechaFin instanceof Date)) {
                throw new Error('Las fechas deben ser objetos Date válidos');
            }

            const filter = {
                fecha: {
                    $gte: fechaInicio,
                    $lte: fechaFin
                }
            };

            if (clienteId && ObjectId.isValid(clienteId)) {
                filter.clienteId = new ObjectId(clienteId);
            }

            return await this.getAll(filter);
        } catch (error) {
            throw new Error(`Error al obtener seguimientos por rango de fechas: ${error.message}`);
        }
    }

    /**
     * Obtiene el último seguimiento de un cliente
     * @param {string|ObjectId} clienteId - ID del cliente
     * @returns {Promise<Seguimiento|null>} Último seguimiento o null
     */
    async getLastFollowUpByClient(clienteId) {
        try {
            if (!ObjectId.isValid(clienteId)) {
                throw new Error('ID del cliente no es válido');
            }

            const seguimientos = await this.getAll(
                { clienteId: new ObjectId(clienteId) },
                { limit: 1, sort: { fecha: -1 } }
            );

            return seguimientos.length > 0 ? seguimientos[0] : null;
        } catch (error) {
            throw new Error(`Error al obtener último seguimiento: ${error.message}`);
        }
    }

    /**
     * Obtiene seguimientos con peso en un rango específico
     * @param {number} pesoMin - Peso mínimo
     * @param {number} pesoMax - Peso máximo
     * @returns {Promise<Seguimiento[]>} Array de seguimientos en el rango de peso
     */
    async getFollowUpsByWeightRange(pesoMin, pesoMax) {
        try {
            if (typeof pesoMin !== 'number' || typeof pesoMax !== 'number') {
                throw new Error('Los pesos deben ser números');
            }

            if (pesoMin < 0 || pesoMax < 0) {
                throw new Error('Los pesos no pueden ser negativos');
            }

            if (pesoMin > pesoMax) {
                throw new Error('Peso mínimo no puede ser mayor al máximo');
            }

            return await this.getAll({
                peso: {
                    $gte: pesoMin,
                    $lte: pesoMax
                }
            });
        } catch (error) {
            throw new Error(`Error al obtener seguimientos por rango de peso: ${error.message}`);
        }
    }

    /**
     * Obtiene seguimientos con grasa corporal en un rango específico
     * @param {number} grasaMin - Grasa corporal mínima
     * @param {number} grasaMax - Grasa corporal máxima
     * @returns {Promise<Seguimiento[]>} Array de seguimientos en el rango
     */
    async getFollowUpsByBodyFatRange(grasaMin, grasaMax) {
        try {
            if (typeof grasaMin !== 'number' || typeof grasaMax !== 'number') {
                throw new Error('Los valores de grasa corporal deben ser números');
            }

            if (grasaMin < 0 || grasaMax < 0) {
                throw new Error('Los valores de grasa corporal no pueden ser negativos');
            }

            if (grasaMin > grasaMax) {
                throw new Error('Grasa mínima no puede ser mayor a la máxima');
            }

            return await this.getAll({
                grasaCorporal: {
                    $gte: grasaMin,
                    $lte: grasaMax
                }
            });
        } catch (error) {
            throw new Error(`Error al obtener seguimientos por rango de grasa corporal: ${error.message}`);
        }
    }

    /**
     * Obtiene estadísticas de seguimientos por cliente
     * @param {string|ObjectId} clienteId - ID del cliente
     * @returns {Promise<Object>} Estadísticas del cliente
     */
    async getClientFollowUpStats(clienteId) {
        try {
            if (!ObjectId.isValid(clienteId)) {
                throw new Error('ID del cliente no es válido');
            }

            const pipeline = [
                { $match: { clienteId: new ObjectId(clienteId) } },
                {
                    $group: {
                        _id: null,
                        totalSeguimientos: { $sum: 1 },
                        pesoPromedio: { $avg: "$peso" },
                        pesoMinimo: { $min: "$peso" },
                        pesoMaximo: { $max: "$peso" },
                        grasaPromedio: { $avg: "$grasaCorporal" },
                        grasaMinima: { $min: "$grasaCorporal" },
                        grasaMaxima: { $max: "$grasaCorporal" },
                        conMedidas: {
                            $sum: {
                                $cond: [
                                    { $gt: [{ $size: { $objectToArray: "$medidas" } }, 0] },
                                    1,
                                    0
                                ]
                            }
                        },
                        conFotos: {
                            $sum: {
                                $cond: [
                                    { $gt: [{ $size: "$fotos" }, 0] },
                                    1,
                                    0
                                ]
                            }
                        }
                    }
                }
            ];

            const stats = await this.collection.aggregate(pipeline).toArray();
            return stats.length > 0 ? stats[0] : {
                totalSeguimientos: 0,
                pesoPromedio: null,
                pesoMinimo: null,
                pesoMaximo: null,
                grasaPromedio: null,
                grasaMinima: null,
                grasaMaxima: null,
                conMedidas: 0,
                conFotos: 0
            };
        } catch (error) {
            throw new Error(`Error al obtener estadísticas del cliente: ${error.message}`);
        }
    }

    /**
     * Obtiene el progreso de peso de un cliente
     * @param {string|ObjectId} clienteId - ID del cliente
     * @returns {Promise<Object>} Progreso de peso del cliente
     */
    async getWeightProgress(clienteId) {
        try {
            if (!ObjectId.isValid(clienteId)) {
                throw new Error('ID del cliente no es válido');
            }

            const seguimientos = await this.getAll(
                { 
                    clienteId: new ObjectId(clienteId),
                    peso: { $exists: true, $ne: null }
                },
                { sort: { fecha: 1 } }
            );

            if (seguimientos.length === 0) {
                return {
                    progreso: [],
                    pesoInicial: null,
                    pesoActual: null,
                    diferencia: 0,
                    tendencia: 'sin_datos'
                };
            }

            const progreso = seguimientos.map(seg => ({
                fecha: seg.fecha,
                peso: seg.peso
            }));

            const pesoInicial = seguimientos[0].peso;
            const pesoActual = seguimientos[seguimientos.length - 1].peso;
            const diferencia = pesoActual - pesoInicial;

            let tendencia = 'estable';
            if (diferencia > 1) {
                tendencia = 'aumento';
            } else if (diferencia < -1) {
                tendencia = 'disminucion';
            }

            return {
                progreso,
                pesoInicial,
                pesoActual,
                diferencia,
                tendencia
            };
        } catch (error) {
            throw new Error(`Error al obtener progreso de peso: ${error.message}`);
        }
    }

    /**
     * Obtiene seguimientos con fotos
     * @param {string|ObjectId} clienteId - ID del cliente (opcional)
     * @returns {Promise<Seguimiento[]>} Array de seguimientos con fotos
     */
    async getFollowUpsWithPhotos(clienteId = null) {
        try {
            const filter = {
                fotos: { $exists: true, $ne: [] }
            };

            if (clienteId && ObjectId.isValid(clienteId)) {
                filter.clienteId = new ObjectId(clienteId);
            }

            return await this.getAll(filter);
        } catch (error) {
            throw new Error(`Error al obtener seguimientos con fotos: ${error.message}`);
        }
    }

    /**
     * Obtiene seguimientos con medidas
     * @param {string|ObjectId} clienteId - ID del cliente (opcional)
     * @returns {Promise<Seguimiento[]>} Array de seguimientos con medidas
     */
    async getFollowUpsWithMeasurements(clienteId = null) {
        try {
            const filter = {
                medidas: { $exists: true, $ne: {} }
            };

            if (clienteId && ObjectId.isValid(clienteId)) {
                filter.clienteId = new ObjectId(clienteId);
            }

            return await this.getAll(filter);
        } catch (error) {
            throw new Error(`Error al obtener seguimientos con medidas: ${error.message}`);
        }
    }
}

module.exports = SeguimientoRepository;
