const { ObjectId } = require('mongodb');
const { Contrato } = require('../models');

/**
 * Repositorio para gestión de contratos
 * Implementa el patrón Repository para abstraer el acceso a datos
 * Maneja operaciones CRUD y métodos específicos para contratos
 */
class ContratoRepository {
    constructor(db) {
        this.collection = db.collection('contratos');
        this.db = db;
    }

    /**
     * Crea un nuevo contrato
     * @param {Contrato} contrato - Instancia de Contrato a crear
     * @returns {Promise<ObjectId>} ID del contrato creado
     * @throws {Error} Si la validación falla o hay error en la inserción
     */
    async create(contrato) {
        try {
            // Validar que sea una instancia de Contrato
            if (!(contrato instanceof Contrato)) {
                throw new Error('El parámetro debe ser una instancia de Contrato');
            }

            // Verificar que no exista un contrato activo para el mismo cliente y plan
            const contratoExistente = await this.collection.findOne({
                clienteId: contrato.clienteId,
                planId: contrato.planId,
                estado: 'vigente'
            });

            if (contratoExistente) {
                throw new Error('Ya existe un contrato activo para este cliente y plan');
            }

            // Convertir a objeto MongoDB
            const contratoDoc = contrato.toMongoObject();
            
            // Insertar en la base de datos
            const result = await this.collection.insertOne(contratoDoc);
            return result.insertedId;
        } catch (error) {
            throw new Error(`Error al crear contrato: ${error.message}`);
        }
    }

    /**
     * Obtiene un contrato por su ID
     * @param {string|ObjectId} id - ID del contrato
     * @returns {Promise<Contrato|null>} Contrato encontrado o null
     * @throws {Error} Si el ID no es válido
     */
    async getById(id) {
        try {
            if (!ObjectId.isValid(id)) {
                throw new Error('ID del contrato no es válido');
            }

            const contratoDoc = await this.collection.findOne({ _id: new ObjectId(id) });
            
            if (!contratoDoc) {
                return null;
            }

            return Contrato.fromMongoObject(contratoDoc);
        } catch (error) {
            throw new Error(`Error al obtener contrato: ${error.message}`);
        }
    }

    /**
     * Obtiene todos los contratos con filtro opcional
     * @param {Object} filter - Filtro de búsqueda
     * @param {Object} options - Opciones de consulta (limit, skip, sort)
     * @returns {Promise<Contrato[]>} Array de contratos
     */
    async getAll(filter = {}, options = {}) {
        try {
            const { limit = 0, skip = 0, sort = { fechaInicio: -1 } } = options;
            
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

            const contratosDocs = await query.toArray();
            return contratosDocs.map(doc => {
                // Crear instancia sin validaciones para contratos existentes
                return new Contrato({
                    contratoId: doc._id,
                    clienteId: doc.clienteId,
                    planId: doc.planId,
                    condiciones: doc.condiciones,
                    duracionMeses: doc.duracionMeses,
                    precio: doc.precio,
                    fechaInicio: doc.fechaInicio,
                    fechaFin: doc.fechaFin,
                    estado: doc.estado,
                    skipValidation: true
                });
            });
        } catch (error) {
            throw new Error(`Error al obtener contratos: ${error.message}`);
        }
    }

    /**
     * Obtiene contratos por cliente
     * @param {string} clienteId - ID del cliente
     * @returns {Promise<Array>} Lista de contratos del cliente
     * @throws {Error} Si el ID no es válido o hay error en la consulta
     */
    async getByClient(clienteId) {
        try {
            if (!ObjectId.isValid(clienteId)) {
                throw new Error('ID del cliente no es válido');
            }

            const contratosDocs = await this.collection.find({ 
                clienteId: new ObjectId(clienteId) 
            }).sort({ fechaInicio: -1 }).toArray();

            return contratosDocs.map(doc => {
                // Crear instancia sin validaciones para contratos existentes
                return new Contrato({
                    contratoId: doc._id,
                    clienteId: doc.clienteId,
                    planId: doc.planId,
                    condiciones: doc.condiciones,
                    duracionMeses: doc.duracionMeses,
                    precio: doc.precio,
                    fechaInicio: doc.fechaInicio,
                    fechaFin: doc.fechaFin,
                    estado: doc.estado,
                    skipValidation: true
                });
            });
        } catch (error) {
            throw new Error(`Error al obtener contratos del cliente: ${error.message}`);
        }
    }

    /**
     * Actualiza un contrato existente
     * @param {string|ObjectId} id - ID del contrato a actualizar
     * @param {Object} updatedData - Datos actualizados
     * @returns {Promise<boolean>} True si se actualizó correctamente
     * @throws {Error} Si el ID no es válido o hay error en la actualización
     */
    async update(id, updatedData) {
        try {
            if (!ObjectId.isValid(id)) {
                throw new Error('ID del contrato no es válido');
            }

            const result = await this.collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updatedData }
            );

            return result.modifiedCount > 0;
        } catch (error) {
            throw new Error(`Error al actualizar contrato: ${error.message}`);
        }
    }

    /**
     * Elimina un contrato por su ID
     * @param {string|ObjectId} id - ID del contrato a eliminar
     * @returns {Promise<boolean>} True si se eliminó correctamente
     * @throws {Error} Si el ID no es válido o hay dependencias
     */
    async delete(id) {
        try {
            if (!ObjectId.isValid(id)) {
                throw new Error('ID del contrato no es válido');
            }

            // Verificar si el contrato está vigente
            const contrato = await this.getById(id);
            if (contrato && contrato.estaVigente()) {
                throw new Error('No se puede eliminar un contrato vigente');
            }

            const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
            return result.deletedCount > 0;
        } catch (error) {
            throw new Error(`Error al eliminar contrato: ${error.message}`);
        }
    }

    /**
     * Obtiene contratos activos por cliente
     * @param {string|ObjectId} clienteId - ID del cliente
     * @returns {Promise<Contrato[]>} Array de contratos activos del cliente
     */
    async getActiveContractsByClient(clienteId) {
        try {
            if (!ObjectId.isValid(clienteId)) {
                throw new Error('ID del cliente no es válido');
            }

            return await this.getAll({
                clienteId: new ObjectId(clienteId),
                estado: 'vigente'
            });
        } catch (error) {
            throw new Error(`Error al obtener contratos activos del cliente: ${error.message}`);
        }
    }

    /**
     * Cancela un contrato y maneja rollback si aplica
     * @param {string|ObjectId} id - ID del contrato a cancelar
     * @returns {Promise<boolean>} True si se canceló correctamente
     * @throws {Error} Si hay error en el rollback
     */
    async cancelContract(id) {
        try {
            if (!ObjectId.isValid(id)) {
                throw new Error('ID del contrato no es válido');
            }

            // Obtener el contrato antes de cancelarlo
            const contrato = await this.getById(id);
            if (!contrato) {
                throw new Error('Contrato no encontrado');
            }

            if (contrato.estaCancelado()) {
                throw new Error('El contrato ya está cancelado');
            }

            // Cambiar estado del contrato a cancelado
            const result = await this.collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: { estado: 'cancelado' } }
            );

            if (result.modifiedCount === 0) {
                throw new Error('No se pudo cancelar el contrato');
            }

            return true;
        } catch (error) {
            throw new Error(`Error al cancelar contrato: ${error.message}`);
        }
    }

    /**
     * Obtiene contratos por rango de fechas
     * @param {Date} fechaInicio - Fecha de inicio
     * @param {Date} fechaFin - Fecha de fin
     * @param {string} estado - Estado del contrato (opcional)
     * @returns {Promise<Contrato[]>} Array de contratos en el rango
     */
    async getContractsByDateRange(fechaInicio, fechaFin, estado = null) {
        try {
            if (!(fechaInicio instanceof Date) || !(fechaFin instanceof Date)) {
                throw new Error('Las fechas deben ser objetos Date válidos');
            }

            const filter = {
                fechaInicio: {
                    $gte: fechaInicio,
                    $lte: fechaFin
                }
            };

            if (estado) {
                filter.estado = estado;
            }

            return await this.getAll(filter);
        } catch (error) {
            throw new Error(`Error al obtener contratos por rango de fechas: ${error.message}`);
        }
    }

    /**
     * Obtiene contratos próximos a vencer
     * @param {number} dias - Días hacia adelante para verificar
     * @returns {Promise<Contrato[]>} Array de contratos próximos a vencer
     */
    async getContractsNearExpiration(dias = 30) {
        try {
            if (typeof dias !== 'number' || dias < 0) {
                throw new Error('Días debe ser un número positivo');
            }

            const fechaLimite = new Date();
            fechaLimite.setDate(fechaLimite.getDate() + dias);

            return await this.getAll({
                estado: 'vigente',
                fechaFin: {
                    $lte: fechaLimite,
                    $gte: new Date()
                }
            });
        } catch (error) {
            throw new Error(`Error al obtener contratos próximos a vencer: ${error.message}`);
        }
    }

    /**
     * Obtiene contratos vencidos
     * @returns {Promise<Contrato[]>} Array de contratos vencidos
     */
    async getExpiredContracts() {
        try {
            return await this.getAll({
                estado: 'vigente',
                fechaFin: { $lt: new Date() }
            });
        } catch (error) {
            throw new Error(`Error al obtener contratos vencidos: ${error.message}`);
        }
    }

    /**
     * Obtiene contratos por estado
     * @param {string} estado - Estado del contrato
     * @returns {Promise<Contrato[]>} Array de contratos del estado especificado
     */
    async getContractsByState(estado) {
        try {
            if (!estado || typeof estado !== 'string') {
                throw new Error('Estado debe ser una string válida');
            }

            const estadosValidos = ['vigente', 'cancelado', 'finalizado'];
            if (!estadosValidos.includes(estado.toLowerCase())) {
                throw new Error(`Estado debe ser uno de: ${estadosValidos.join(', ')}`);
            }

            return await this.getAll({ estado: estado.toLowerCase() });
        } catch (error) {
            throw new Error(`Error al obtener contratos por estado: ${error.message}`);
        }
    }

    /**
     * Obtiene contratos por rango de precios
     * @param {number} precioMin - Precio mínimo
     * @param {number} precioMax - Precio máximo
     * @returns {Promise<Contrato[]>} Array de contratos en el rango de precios
     */
    async getContractsByPriceRange(precioMin, precioMax) {
        try {
            if (typeof precioMin !== 'number' || typeof precioMax !== 'number') {
                throw new Error('Los precios deben ser números');
            }

            if (precioMin < 0 || precioMax < 0) {
                throw new Error('Los precios no pueden ser negativos');
            }

            if (precioMin > precioMax) {
                throw new Error('Precio mínimo no puede ser mayor al máximo');
            }

            return await this.getAll({
                precio: {
                    $gte: precioMin,
                    $lte: precioMax
                }
            });
        } catch (error) {
            throw new Error(`Error al obtener contratos por rango de precios: ${error.message}`);
        }
    }

    /**
     * Obtiene estadísticas de contratos
     * @returns {Promise<Object>} Estadísticas de contratos
     */
    async getContractStats() {
        try {
            const totalContratos = await this.collection.countDocuments();
            const contratosVigentes = await this.collection.countDocuments({ estado: 'vigente' });
            const contratosCancelados = await this.collection.countDocuments({ estado: 'cancelado' });
            const contratosFinalizados = await this.collection.countDocuments({ estado: 'finalizado' });

            // Ingresos totales por estado
            const ingresosPorEstado = await this.collection.aggregate([
                {
                    $group: {
                        _id: "$estado",
                        totalIngresos: { $sum: "$precio" },
                        cantidad: { $sum: 1 }
                    }
                }
            ]).toArray();

            // Contratos por mes
            const contratosPorMes = await this.collection.aggregate([
                {
                    $group: {
                        _id: {
                            year: { $year: "$fechaInicio" },
                            month: { $month: "$fechaInicio" }
                        },
                        count: { $sum: 1 },
                        ingresos: { $sum: "$precio" }
                    }
                },
                { $sort: { "_id.year": -1, "_id.month": -1 } },
                { $limit: 12 }
            ]).toArray();

            // Promedio de duración y precio
            const promedios = await this.collection.aggregate([
                {
                    $group: {
                        _id: null,
                        duracionPromedio: { $avg: "$duracionMeses" },
                        precioPromedio: { $avg: "$precio" }
                    }
                }
            ]).toArray();

            return {
                totalContratos,
                contratosVigentes,
                contratosCancelados,
                contratosFinalizados,
                ingresosPorEstado,
                contratosPorMes,
                promedios: promedios.length > 0 ? promedios[0] : {
                    duracionPromedio: 0,
                    precioPromedio: 0
                }
            };
        } catch (error) {
            throw new Error(`Error al obtener estadísticas de contratos: ${error.message}`);
        }
    }

    /**
     * Extiende un contrato existente
     * @param {string|ObjectId} id - ID del contrato
     * @param {number} mesesAdicionales - Meses a agregar
     * @returns {Promise<boolean>} True si se extendió correctamente
     */
    async extendContract(id, mesesAdicionales) {
        try {
            if (!ObjectId.isValid(id)) {
                throw new Error('ID del contrato no es válido');
            }

            if (typeof mesesAdicionales !== 'number' || mesesAdicionales <= 0) {
                throw new Error('Meses adicionales debe ser un número positivo');
            }

            const contrato = await this.getById(id);
            if (!contrato) {
                throw new Error('Contrato no encontrado');
            }

            if (!contrato.estaVigente()) {
                throw new Error('Solo se pueden extender contratos vigentes');
            }

            // Calcular nueva fecha de fin
            const nuevaFechaFin = new Date(contrato.fechaFin);
            nuevaFechaFin.setMonth(nuevaFechaFin.getMonth() + mesesAdicionales);

            const result = await this.collection.updateOne(
                { _id: new ObjectId(id) },
                {
                    $set: {
                        duracionMeses: contrato.duracionMeses + mesesAdicionales,
                        fechaFin: nuevaFechaFin
                    }
                }
            );

            return result.modifiedCount > 0;
        } catch (error) {
            throw new Error(`Error al extender contrato: ${error.message}`);
        }
    }

    /**
     * Finaliza un contrato
     * @param {string|ObjectId} id - ID del contrato
     * @returns {Promise<boolean>} True si se finalizó correctamente
     */
    async finalizeContract(id) {
        try {
            if (!ObjectId.isValid(id)) {
                throw new Error('ID del contrato no es válido');
            }

            const contrato = await this.getById(id);
            if (!contrato) {
                throw new Error('Contrato no encontrado');
            }

            if (!contrato.estaVigente()) {
                throw new Error('Solo se pueden finalizar contratos vigentes');
            }

            const result = await this.collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: { estado: 'finalizado' } }
            );

            return result.modifiedCount > 0;
        } catch (error) {
            throw new Error(`Error al finalizar contrato: ${error.message}`);
        }
    }

    /**
     * Obtiene contratos por cliente y plan
     * @param {string|ObjectId} clienteId - ID del cliente
     * @param {string|ObjectId} planId - ID del plan
     * @returns {Promise<Contrato[]>} Array de contratos del cliente y plan
     */
    async getContractsByClientAndPlan(clienteId, planId) {
        try {
            if (!ObjectId.isValid(clienteId) || !ObjectId.isValid(planId)) {
                throw new Error('IDs deben ser ObjectIds válidos');
            }

            return await this.getAll({
                clienteId: new ObjectId(clienteId),
                planId: new ObjectId(planId)
            });
        } catch (error) {
            throw new Error(`Error al obtener contratos por cliente y plan: ${error.message}`);
        }
    }

    /**
     * Obtiene contratos con filtros opcionales
     * @param {Object} filtros - Filtros de búsqueda
     * @param {Object} opciones - Opciones de paginación
     * @returns {Promise<Object[]>} Array de contratos
     */
    async getContracts(filtros = {}, opciones = {}) {
        try {
            let query = {};
            
            // Aplicar filtros
            if (filtros.estado) {
                query.estado = filtros.estado;
            }
            if (filtros.clienteId) {
                query.clienteId = new ObjectId(filtros.clienteId);
            }
            if (filtros.planId) {
                query.planId = new ObjectId(filtros.planId);
            }
            if (filtros.fechaInicio || filtros.fechaFin) {
                query.fechaInicio = {};
                if (filtros.fechaInicio) {
                    query.fechaInicio.$gte = new Date(filtros.fechaInicio);
                }
                if (filtros.fechaFin) {
                    query.fechaInicio.$lte = new Date(filtros.fechaFin);
                }
            }

            // Aplicar opciones
            let cursor = this.collection.find(query);
            
            if (opciones.limit) {
                cursor = cursor.limit(opciones.limit);
            }
            if (opciones.skip) {
                cursor = cursor.skip(opciones.skip);
            }
            if (opciones.sort) {
                cursor = cursor.sort(opciones.sort);
            }

            return await cursor.toArray();
        } catch (error) {
            throw new Error(`Error al obtener contratos: ${error.message}`);
        }
    }

    /**
     * Cuenta contratos con filtros opcionales
     * @param {Object} filtros - Filtros de búsqueda
     * @returns {Promise<number>} Número de contratos
     */
    async countContracts(filtros = {}) {
        try {
            let query = {};
            
            // Aplicar filtros
            if (filtros.estado) {
                query.estado = filtros.estado;
            }
            if (filtros.clienteId) {
                query.clienteId = new ObjectId(filtros.clienteId);
            }
            if (filtros.planId) {
                query.planId = new ObjectId(filtros.planId);
            }
            if (filtros.fechaInicio || filtros.fechaFin) {
                query.fechaInicio = {};
                if (filtros.fechaInicio) {
                    query.fechaInicio.$gte = new Date(filtros.fechaInicio);
                }
                if (filtros.fechaFin) {
                    query.fechaInicio.$lte = new Date(filtros.fechaFin);
                }
            }

            return await this.collection.countDocuments(query);
        } catch (error) {
            throw new Error(`Error al contar contratos: ${error.message}`);
        }
    }

    /**
     * Busca contratos por término de búsqueda
     * @param {string} searchTerm - Término de búsqueda
     * @returns {Promise<Array>} Lista de contratos encontrados
     */
    async search(searchTerm) {
        try {
            if (!searchTerm || typeof searchTerm !== 'string') {
                throw new Error('Término de búsqueda es requerido');
            }

            const regex = new RegExp(searchTerm, 'i');
            const cursor = this.collection.find({
                $or: [
                    { condicionesEspeciales: { $regex: regex } }
                ]
            }).sort({ fechaInicio: -1 });

            const mongoObjs = await cursor.toArray();
            return mongoObjs.map(obj => Contrato.fromMongoObject(obj));
        } catch (error) {
            throw new Error(`Error al buscar contratos: ${error.message}`);
        }
    }
}

module.exports = ContratoRepository;
