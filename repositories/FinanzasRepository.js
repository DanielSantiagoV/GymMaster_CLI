const { ObjectId } = require('mongodb');
const { Finanzas } = require('../models');

/**
 * Repositorio para gestión financiera
 * Implementa el patrón Repository para abstraer el acceso a datos
 * Maneja operaciones CRUD y métodos específicos para finanzas
 */
class FinanzasRepository {
    constructor(db) {
        this.collection = db.collection('finanzas');
        this.db = db;
    }

    /**
     * Crea un nuevo movimiento financiero
     * @param {Finanzas} movimiento - Instancia de Finanzas a crear
     * @returns {Promise<ObjectId>} ID del movimiento financiero creado
     * @throws {Error} Si la validación falla o hay error en la inserción
     */
    async create(movimiento) {
        try {
            // Validar que sea una instancia de Finanzas
            if (!(movimiento instanceof Finanzas)) {
                throw new Error('El parámetro debe ser una instancia de Finanzas');
            }

            // Convertir a objeto MongoDB
            const movimientoDoc = movimiento.toMongoObject();
            
            // Insertar en la base de datos
            const result = await this.collection.insertOne(movimientoDoc);
            return result.insertedId;
        } catch (error) {
            throw new Error(`Error al crear movimiento financiero: ${error.message}`);
        }
    }

    /**
     * Obtiene un movimiento financiero por su ID
     * @param {string|ObjectId} id - ID del movimiento financiero
     * @returns {Promise<Finanzas|null>} Movimiento financiero encontrado o null
     * @throws {Error} Si el ID no es válido
     */
    async getById(id) {
        try {
            if (!ObjectId.isValid(id)) {
                throw new Error('ID del movimiento financiero no es válido');
            }

            const movimientoDoc = await this.collection.findOne({ _id: new ObjectId(id) });
            
            if (!movimientoDoc) {
                return null;
            }

            return Finanzas.fromMongoObject(movimientoDoc);
        } catch (error) {
            throw new Error(`Error al obtener movimiento financiero: ${error.message}`);
        }
    }

    /**
     * Obtiene todos los movimientos financieros con filtro opcional
     * @param {Object} filter - Filtro de búsqueda
     * @param {Object} options - Opciones de consulta (limit, skip, sort)
     * @returns {Promise<Finanzas[]>} Array de movimientos financieros
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

            const movimientosDocs = await query.toArray();
            return movimientosDocs.map(doc => Finanzas.fromMongoObject(doc));
        } catch (error) {
            throw new Error(`Error al obtener movimientos financieros: ${error.message}`);
        }
    }

    /**
     * Actualiza un movimiento financiero existente
     * @param {string|ObjectId} id - ID del movimiento financiero a actualizar
     * @param {Object} updatedData - Datos actualizados
     * @returns {Promise<boolean>} True si se actualizó correctamente
     * @throws {Error} Si el ID no es válido o hay error en la actualización
     */
    async update(id, updatedData) {
        try {
            if (!ObjectId.isValid(id)) {
                throw new Error('ID del movimiento financiero no es válido');
            }

            const result = await this.collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updatedData }
            );

            return result.modifiedCount > 0;
        } catch (error) {
            throw new Error(`Error al actualizar movimiento financiero: ${error.message}`);
        }
    }

    /**
     * Elimina un movimiento financiero por su ID
     * @param {string|ObjectId} id - ID del movimiento financiero a eliminar
     * @returns {Promise<boolean>} True si se eliminó correctamente
     * @throws {Error} Si el ID no es válido
     */
    async delete(id) {
        try {
            if (!ObjectId.isValid(id)) {
                throw new Error('ID del movimiento financiero no es válido');
            }

            const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
            return result.deletedCount > 0;
        } catch (error) {
            throw new Error(`Error al eliminar movimiento financiero: ${error.message}`);
        }
    }

    /**
     * Obtiene movimientos financieros por cliente
     * @param {string|ObjectId} clienteId - ID del cliente
     * @param {Object} filter - Filtros adicionales
     * @returns {Promise<Finanzas[]>} Array de movimientos del cliente
     */
    async getFinancialRecordsByClient(clienteId, filter = {}) {
        try {
            if (!ObjectId.isValid(clienteId)) {
                throw new Error('ID del cliente no es válido');
            }

            const combinedFilter = {
                clienteId: new ObjectId(clienteId),
                ...filter
            };

            return await this.getAll(combinedFilter);
        } catch (error) {
            throw new Error(`Error al obtener movimientos del cliente: ${error.message}`);
        }
    }

    /**
     * Obtiene el balance por rango de fechas
     * @param {Date} startDate - Fecha de inicio
     * @param {Date} endDate - Fecha de fin
     * @param {string|ObjectId} clienteId - ID del cliente (opcional)
     * @returns {Promise<Object>} Balance en el rango de fechas
     */
    async getBalanceByDateRange(startDate, endDate, clienteId = null) {
        try {
            if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
                throw new Error('Las fechas deben ser objetos Date válidos');
            }

            const filter = {
                fecha: {
                    $gte: startDate,
                    $lte: endDate
                }
            };

            if (clienteId && ObjectId.isValid(clienteId)) {
                filter.clienteId = new ObjectId(clienteId);
            }

            const pipeline = [
                { $match: filter },
                {
                    $group: {
                        _id: null,
                        totalIngresos: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$tipo", "ingreso"] },
                                    "$monto",
                                    0
                                ]
                            }
                        },
                        totalEgresos: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$tipo", "egreso"] },
                                    "$monto",
                                    0
                                ]
                            }
                        },
                        cantidadMovimientos: { $sum: 1 },
                        cantidadIngresos: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$tipo", "ingreso"] },
                                    1,
                                    0
                                ]
                            }
                        },
                        cantidadEgresos: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$tipo", "egreso"] },
                                    1,
                                    0
                                ]
                            }
                        }
                    }
                }
            ];

            const result = await this.collection.aggregate(pipeline).toArray();
            
            if (result.length === 0) {
                return {
                    totalIngresos: 0,
                    totalEgresos: 0,
                    balance: 0,
                    cantidadMovimientos: 0,
                    cantidadIngresos: 0,
                    cantidadEgresos: 0
                };
            }

            const data = result[0];
            return {
                totalIngresos: data.totalIngresos,
                totalEgresos: data.totalEgresos,
                balance: data.totalIngresos - data.totalEgresos,
                cantidadMovimientos: data.cantidadMovimientos,
                cantidadIngresos: data.cantidadIngresos,
                cantidadEgresos: data.cantidadEgresos
            };
        } catch (error) {
            throw new Error(`Error al obtener balance por rango de fechas: ${error.message}`);
        }
    }

    /**
     * Obtiene movimientos por tipo
     * @param {string} tipo - Tipo de movimiento (ingreso, egreso)
     * @param {Object} options - Opciones de consulta
     * @returns {Promise<Finanzas[]>} Array de movimientos del tipo especificado
     */
    async getMovementsByType(tipo, options = {}) {
        try {
            if (!tipo || typeof tipo !== 'string') {
                throw new Error('Tipo debe ser una string válida');
            }

            const tiposValidos = ['ingreso', 'egreso'];
            if (!tiposValidos.includes(tipo.toLowerCase())) {
                throw new Error(`Tipo debe ser uno de: ${tiposValidos.join(', ')}`);
            }

            return await this.getAll({ tipo: tipo.toLowerCase() }, options);
        } catch (error) {
            throw new Error(`Error al obtener movimientos por tipo: ${error.message}`);
        }
    }

    /**
     * Obtiene movimientos por categoría
     * @param {string} categoria - Categoría del movimiento
     * @param {Object} options - Opciones de consulta
     * @returns {Promise<Finanzas[]>} Array de movimientos de la categoría
     */
    async getMovementsByCategory(categoria, options = {}) {
        try {
            if (!categoria || typeof categoria !== 'string') {
                throw new Error('Categoría debe ser una string válida');
            }

            return await this.getAll({ categoria }, options);
        } catch (error) {
            throw new Error(`Error al obtener movimientos por categoría: ${error.message}`);
        }
    }

    /**
     * Obtiene movimientos por rango de montos
     * @param {number} montoMin - Monto mínimo
     * @param {number} montoMax - Monto máximo
     * @param {Object} options - Opciones de consulta
     * @returns {Promise<Finanzas[]>} Array de movimientos en el rango
     */
    async getMovementsByAmountRange(montoMin, montoMax, options = {}) {
        try {
            if (typeof montoMin !== 'number' || typeof montoMax !== 'number') {
                throw new Error('Los montos deben ser números');
            }

            if (montoMin < 0 || montoMax < 0) {
                throw new Error('Los montos no pueden ser negativos');
            }

            if (montoMin > montoMax) {
                throw new Error('Monto mínimo no puede ser mayor al máximo');
            }

            return await this.getAll({
                monto: {
                    $gte: montoMin,
                    $lte: montoMax
                }
            }, options);
        } catch (error) {
            throw new Error(`Error al obtener movimientos por rango de montos: ${error.message}`);
        }
    }

    /**
     * Obtiene estadísticas financieras
     * @param {Date} fechaInicio - Fecha de inicio (opcional)
     * @param {Date} fechaFin - Fecha de fin (opcional)
     * @returns {Promise<Object>} Estadísticas financieras
     */
    async getFinancialStats(fechaInicio = null, fechaFin = null) {
        try {
            const filter = {};
            
            if (fechaInicio && fechaFin) {
                if (!(fechaInicio instanceof Date) || !(fechaFin instanceof Date)) {
                    throw new Error('Las fechas deben ser objetos Date válidos');
                }
                filter.fecha = { $gte: fechaInicio, $lte: fechaFin };
            }

            const pipeline = [
                { $match: filter },
                {
                    $group: {
                        _id: null,
                        totalIngresos: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$tipo", "ingreso"] },
                                    "$monto",
                                    0
                                ]
                            }
                        },
                        totalEgresos: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$tipo", "egreso"] },
                                    "$monto",
                                    0
                                ]
                            }
                        },
                        cantidadMovimientos: { $sum: 1 },
                        montoPromedio: { $avg: "$monto" },
                        montoMaximo: { $max: "$monto" },
                        montoMinimo: { $min: "$monto" }
                    }
                }
            ];

            const result = await this.collection.aggregate(pipeline).toArray();
            
            if (result.length === 0) {
                return {
                    totalIngresos: 0,
                    totalEgresos: 0,
                    balance: 0,
                    cantidadMovimientos: 0,
                    montoPromedio: 0,
                    montoMaximo: 0,
                    montoMinimo: 0
                };
            }

            const data = result[0];
            return {
                totalIngresos: data.totalIngresos,
                totalEgresos: data.totalEgresos,
                balance: data.totalIngresos - data.totalEgresos,
                cantidadMovimientos: data.cantidadMovimientos,
                montoPromedio: Math.round(data.montoPromedio * 100) / 100,
                montoMaximo: data.montoMaximo,
                montoMinimo: data.montoMinimo
            };
        } catch (error) {
            throw new Error(`Error al obtener estadísticas financieras: ${error.message}`);
        }
    }

    /**
     * Obtiene movimientos por mes
     * @param {number} year - Año
     * @param {number} month - Mes (1-12)
     * @returns {Promise<Finanzas[]>} Array de movimientos del mes
     */
    async getMovementsByMonth(year, month) {
        try {
            if (typeof year !== 'number' || typeof month !== 'number') {
                throw new Error('Año y mes deben ser números');
            }

            if (month < 1 || month > 12) {
                throw new Error('Mes debe estar entre 1 y 12');
            }

            const fechaInicio = new Date(year, month - 1, 1);
            const fechaFin = new Date(year, month, 0, 23, 59, 59, 999);

            return await this.getAll({
                fecha: {
                    $gte: fechaInicio,
                    $lte: fechaFin
                }
            });
        } catch (error) {
            throw new Error(`Error al obtener movimientos por mes: ${error.message}`);
        }
    }

    /**
     * Obtiene el balance mensual
     * @param {number} year - Año
     * @param {number} month - Mes (1-12)
     * @returns {Promise<Object>} Balance del mes
     */
    async getMonthlyBalance(year, month) {
        try {
            const movimientos = await this.getMovementsByMonth(year, month);
            
            const balance = movimientos.reduce((acc, movimiento) => {
                if (movimiento.esIngreso()) {
                    acc.ingresos += movimiento.monto;
                } else {
                    acc.egresos += movimiento.monto;
                }
                return acc;
            }, { ingresos: 0, egresos: 0 });

            return {
                year,
                month,
                ingresos: balance.ingresos,
                egresos: balance.egresos,
                balance: balance.ingresos - balance.egresos,
                cantidadMovimientos: movimientos.length
            };
        } catch (error) {
            throw new Error(`Error al obtener balance mensual: ${error.message}`);
        }
    }

    /**
     * Obtiene los movimientos más grandes
     * @param {number} limit - Límite de resultados
     * @param {string} tipo - Tipo de movimiento (opcional)
     * @returns {Promise<Finanzas[]>} Array de movimientos más grandes
     */
    async getLargestMovements(limit = 10, tipo = null) {
        try {
            if (typeof limit !== 'number' || limit <= 0) {
                throw new Error('Límite debe ser un número positivo');
            }

            const filter = {};
            if (tipo) {
                filter.tipo = tipo.toLowerCase();
            }

            return await this.getAll(filter, {
                limit,
                sort: { monto: -1 }
            });
        } catch (error) {
            throw new Error(`Error al obtener movimientos más grandes: ${error.message}`);
        }
    }

    /**
     * Obtiene movimientos por descripción
     * @param {string} descripcion - Descripción a buscar
     * @param {Object} options - Opciones de consulta
     * @returns {Promise<Finanzas[]>} Array de movimientos que coinciden
     */
    async searchMovementsByDescription(descripcion, options = {}) {
        try {
            if (!descripcion || typeof descripcion !== 'string') {
                throw new Error('Descripción debe ser una string válida');
            }

            const regex = new RegExp(descripcion, 'i');
            return await this.getAll({ descripcion: regex }, options);
        } catch (error) {
            throw new Error(`Error al buscar movimientos por descripción: ${error.message}`);
        }
    }

    /**
     * Obtiene el balance total
     * @returns {Promise<number>} Balance total
     */
    async getTotalBalance() {
        try {
            const pipeline = [
                {
                    $group: {
                        _id: null,
                        totalIngresos: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$tipo", "ingreso"] },
                                    "$monto",
                                    0
                                ]
                            }
                        },
                        totalEgresos: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$tipo", "egreso"] },
                                    "$monto",
                                    0
                                ]
                            }
                        }
                    }
                }
            ];

            const result = await this.collection.aggregate(pipeline).toArray();
            
            if (result.length === 0) {
                return 0;
            }

            const data = result[0];
            return data.totalIngresos - data.totalEgresos;
        } catch (error) {
            throw new Error(`Error al obtener balance total: ${error.message}`);
        }
    }

    /**
     * Obtiene movimientos recientes
     * @param {number} limit - Límite de resultados
     * @returns {Promise<Finanzas[]>} Array de movimientos recientes
     */
    async getRecentMovements(limit = 10) {
        try {
            if (typeof limit !== 'number' || limit <= 0) {
                throw new Error('Límite debe ser un número positivo');
            }

            return await this.getAll({}, {
                limit,
                sort: { fecha: -1 }
            });
        } catch (error) {
            throw new Error(`Error al obtener movimientos recientes: ${error.message}`);
        }
    }
}

module.exports = FinanzasRepository;
