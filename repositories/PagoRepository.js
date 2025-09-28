const { ObjectId } = require('mongodb');
const { Pago } = require('../models');

/**
 * Repositorio para gestión de pagos
 * Implementa el patrón Repository para abstraer el acceso a datos
 * Maneja operaciones CRUD y métodos específicos para pagos
 */
class PagoRepository {
    constructor(db) {
        this.collection = db.collection('pagos');
        this.db = db;
    }

    /**
     * Crea un nuevo pago
     * @param {Pago} pago - Instancia de Pago a crear
     * @returns {Promise<ObjectId>} ID del pago creado
     * @throws {Error} Si la validación falla o hay error en la inserción
     */
    async create(pago) {
        try {
            // Validar que sea una instancia de Pago
            if (!(pago instanceof Pago)) {
                throw new Error('El parámetro debe ser una instancia de Pago');
            }

            // Convertir a objeto MongoDB
            const pagoDoc = pago.toMongoObject();
            
            // Insertar en la base de datos
            const result = await this.collection.insertOne(pagoDoc);
            return result.insertedId;
        } catch (error) {
            throw new Error(`Error al crear pago: ${error.message}`);
        }
    }

    /**
     * Obtiene un pago por su ID
     * @param {string|ObjectId} id - ID del pago
     * @returns {Promise<Pago|null>} Pago encontrado o null
     * @throws {Error} Si el ID no es válido
     */
    async getById(id) {
        try {
            if (!ObjectId.isValid(id)) {
                throw new Error('ID del pago no es válido');
            }

            const pagoDoc = await this.collection.findOne({ _id: new ObjectId(id) });
            
            if (!pagoDoc) {
                return null;
            }

            return Pago.fromMongoObject(pagoDoc);
        } catch (error) {
            throw new Error(`Error al obtener pago: ${error.message}`);
        }
    }

    /**
     * Obtiene todos los pagos con filtro opcional
     * @param {Object} filter - Filtro de búsqueda
     * @param {Object} options - Opciones de consulta (limit, skip, sort)
     * @returns {Promise<Pago[]>} Array de pagos
     */
    async getAll(filter = {}, options = {}) {
        try {
            const { limit = 0, skip = 0, sort = { fechaPago: -1 } } = options;
            
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

            const pagosDocs = await query.toArray();
            return pagosDocs.map(doc => Pago.fromMongoObject(doc));
        } catch (error) {
            throw new Error(`Error al obtener pagos: ${error.message}`);
        }
    }

    /**
     * Actualiza un pago existente
     * @param {string|ObjectId} id - ID del pago a actualizar
     * @param {Object} updatedData - Datos actualizados
     * @returns {Promise<boolean>} True si se actualizó correctamente
     * @throws {Error} Si el ID no es válido o hay error en la actualización
     */
    async update(id, updatedData) {
        try {
            if (!ObjectId.isValid(id)) {
                throw new Error('ID del pago no es válido');
            }

            const result = await this.collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updatedData }
            );

            return result.modifiedCount > 0;
        } catch (error) {
            throw new Error(`Error al actualizar pago: ${error.message}`);
        }
    }

    /**
     * Elimina un pago por su ID
     * @param {string|ObjectId} id - ID del pago a eliminar
     * @returns {Promise<boolean>} True si se eliminó correctamente
     * @throws {Error} Si el ID no es válido
     */
    async delete(id) {
        try {
            if (!ObjectId.isValid(id)) {
                throw new Error('ID del pago no es válido');
            }

            const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
            return result.deletedCount > 0;
        } catch (error) {
            throw new Error(`Error al eliminar pago: ${error.message}`);
        }
    }

    /**
     * Obtiene pagos por cliente
     * @param {string|ObjectId} clienteId - ID del cliente
     * @param {Object} filter - Filtros adicionales
     * @returns {Promise<Pago[]>} Array de pagos del cliente
     */
    async getPagosByClient(clienteId, filter = {}) {
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
            throw new Error(`Error al obtener pagos del cliente: ${error.message}`);
        }
    }

    /**
     * Obtiene pagos por contrato
     * @param {string|ObjectId} contratoId - ID del contrato
     * @param {Object} filter - Filtros adicionales
     * @returns {Promise<Pago[]>} Array de pagos del contrato
     */
    async getPagosByContract(contratoId, filter = {}) {
        try {
            if (!ObjectId.isValid(contratoId)) {
                throw new Error('ID del contrato no es válido');
            }

            const combinedFilter = {
                contratoId: new ObjectId(contratoId),
                ...filter
            };

            return await this.getAll(combinedFilter);
        } catch (error) {
            throw new Error(`Error al obtener pagos del contrato: ${error.message}`);
        }
    }

    /**
     * Obtiene pagos por estado
     * @param {string} estado - Estado del pago
     * @param {Object} options - Opciones de consulta
     * @returns {Promise<Pago[]>} Array de pagos del estado especificado
     */
    async getPagosByStatus(estado, options = {}) {
        try {
            if (!estado || typeof estado !== 'string') {
                throw new Error('Estado debe ser una string válida');
            }

            const estadosValidos = ['pagado', 'pendiente', 'retrasado', 'cancelado'];
            if (!estadosValidos.includes(estado.toLowerCase())) {
                throw new Error(`Estado debe ser uno de: ${estadosValidos.join(', ')}`);
            }

            return await this.getAll({ estado: estado.toLowerCase() }, options);
        } catch (error) {
            throw new Error(`Error al obtener pagos por estado: ${error.message}`);
        }
    }

    /**
     * Obtiene pagos por método de pago
     * @param {string} metodoPago - Método de pago
     * @param {Object} options - Opciones de consulta
     * @returns {Promise<Pago[]>} Array de pagos del método especificado
     */
    async getPagosByPaymentMethod(metodoPago, options = {}) {
        try {
            if (!metodoPago || typeof metodoPago !== 'string') {
                throw new Error('Método de pago debe ser una string válida');
            }

            return await this.getAll({ metodoPago: metodoPago.toLowerCase() }, options);
        } catch (error) {
            throw new Error(`Error al obtener pagos por método: ${error.message}`);
        }
    }

    /**
     * Obtiene pagos por tipo de movimiento
     * @param {string} tipoMovimiento - Tipo de movimiento (ingreso, egreso)
     * @param {Object} options - Opciones de consulta
     * @returns {Promise<Pago[]>} Array de pagos del tipo especificado
     */
    async getPagosByMovementType(tipoMovimiento, options = {}) {
        try {
            if (!tipoMovimiento || typeof tipoMovimiento !== 'string') {
                throw new Error('Tipo de movimiento debe ser una string válida');
            }

            const tiposValidos = ['ingreso', 'egreso'];
            if (!tiposValidos.includes(tipoMovimiento.toLowerCase())) {
                throw new Error(`Tipo de movimiento debe ser uno de: ${tiposValidos.join(', ')}`);
            }

            return await this.getAll({ tipoMovimiento: tipoMovimiento.toLowerCase() }, options);
        } catch (error) {
            throw new Error(`Error al obtener pagos por tipo: ${error.message}`);
        }
    }

    /**
     * Obtiene pagos por rango de fechas
     * @param {Date} fechaInicio - Fecha de inicio
     * @param {Date} fechaFin - Fecha de fin
     * @param {Object} filter - Filtros adicionales
     * @returns {Promise<Pago[]>} Array de pagos en el rango
     */
    async getPagosByDateRange(fechaInicio, fechaFin, filter = {}) {
        try {
            if (!(fechaInicio instanceof Date) || !(fechaFin instanceof Date)) {
                throw new Error('Las fechas deben ser objetos Date válidos');
            }

            const combinedFilter = {
                fechaPago: {
                    $gte: fechaInicio,
                    $lte: fechaFin
                },
                ...filter
            };

            return await this.getAll(combinedFilter);
        } catch (error) {
            throw new Error(`Error al obtener pagos por rango de fechas: ${error.message}`);
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
                fechaPago: {
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
                                    { $eq: ["$tipoMovimiento", "ingreso"] },
                                    "$monto",
                                    0
                                ]
                            }
                        },
                        totalEgresos: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$tipoMovimiento", "egreso"] },
                                    "$monto",
                                    0
                                ]
                            }
                        },
                        cantidadPagos: { $sum: 1 },
                        cantidadIngresos: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$tipoMovimiento", "ingreso"] },
                                    1,
                                    0
                                ]
                            }
                        },
                        cantidadEgresos: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$tipoMovimiento", "egreso"] },
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
                    cantidadPagos: 0,
                    cantidadIngresos: 0,
                    cantidadEgresos: 0
                };
            }

            const data = result[0];
            return {
                totalIngresos: data.totalIngresos,
                totalEgresos: data.totalEgresos,
                balance: data.totalIngresos - data.totalEgresos,
                cantidadPagos: data.cantidadPagos,
                cantidadIngresos: data.cantidadIngresos,
                cantidadEgresos: data.cantidadEgresos
            };
        } catch (error) {
            throw new Error(`Error al obtener balance por rango de fechas: ${error.message}`);
        }
    }

    /**
     * Obtiene pagos pendientes
     * @param {Object} options - Opciones de consulta
     * @returns {Promise<Pago[]>} Array de pagos pendientes
     */
    async getPagosPendientes(options = {}) {
        try {
            return await this.getPagosByStatus('pendiente', options);
        } catch (error) {
            throw new Error(`Error al obtener pagos pendientes: ${error.message}`);
        }
    }

    /**
     * Obtiene pagos retrasados
     * @param {Object} options - Opciones de consulta
     * @returns {Promise<Pago[]>} Array de pagos retrasados
     */
    async getPagosRetrasados(options = {}) {
        try {
            return await this.getPagosByStatus('retrasado', options);
        } catch (error) {
            throw new Error(`Error al obtener pagos retrasados: ${error.message}`);
        }
    }

    /**
     * Obtiene pagos vencidos (fecha límite pasada y estado pendiente)
     * @param {Date} fechaLimite - Fecha límite para considerar vencidos
     * @param {Object} options - Opciones de consulta
     * @returns {Promise<Pago[]>} Array de pagos vencidos
     */
    async getPagosVencidos(fechaLimite = new Date(), options = {}) {
        try {
            const filter = {
                estado: { $in: ['pendiente', 'retrasado'] },
                fechaPago: { $lt: fechaLimite }
            };

            return await this.getAll(filter, options);
        } catch (error) {
            throw new Error(`Error al obtener pagos vencidos: ${error.message}`);
        }
    }

    /**
     * Obtiene estadísticas de pagos
     * @param {Date} fechaInicio - Fecha de inicio (opcional)
     * @param {Date} fechaFin - Fecha de fin (opcional)
     * @returns {Promise<Object>} Estadísticas de pagos
     */
    async getPagoStats(fechaInicio = null, fechaFin = null) {
        try {
            const filter = {};
            
            if (fechaInicio && fechaFin) {
                if (!(fechaInicio instanceof Date) || !(fechaFin instanceof Date)) {
                    throw new Error('Las fechas deben ser objetos Date válidos');
                }
                filter.fechaPago = { $gte: fechaInicio, $lte: fechaFin };
            }

            const pipeline = [
                { $match: filter },
                {
                    $group: {
                        _id: null,
                        totalIngresos: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$tipoMovimiento", "ingreso"] },
                                    "$monto",
                                    0
                                ]
                            }
                        },
                        totalEgresos: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$tipoMovimiento", "egreso"] },
                                    "$monto",
                                    0
                                ]
                            }
                        },
                        cantidadPagos: { $sum: 1 },
                        montoPromedio: { $avg: "$monto" },
                        montoMaximo: { $max: "$monto" },
                        montoMinimo: { $min: "$monto" },
                        pagosPagados: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$estado", "pagado"] },
                                    1,
                                    0
                                ]
                            }
                        },
                        pagosPendientes: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$estado", "pendiente"] },
                                    1,
                                    0
                                ]
                            }
                        },
                        pagosRetrasados: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$estado", "retrasado"] },
                                    1,
                                    0
                                ]
                            }
                        },
                        pagosCancelados: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$estado", "cancelado"] },
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
                    cantidadPagos: 0,
                    montoPromedio: 0,
                    montoMaximo: 0,
                    montoMinimo: 0,
                    pagosPagados: 0,
                    pagosPendientes: 0,
                    pagosRetrasados: 0,
                    pagosCancelados: 0
                };
            }

            const data = result[0];
            return {
                totalIngresos: data.totalIngresos,
                totalEgresos: data.totalEgresos,
                balance: data.totalIngresos - data.totalEgresos,
                cantidadPagos: data.cantidadPagos,
                montoPromedio: Math.round(data.montoPromedio * 100) / 100,
                montoMaximo: data.montoMaximo,
                montoMinimo: data.montoMinimo,
                pagosPagados: data.pagosPagados,
                pagosPendientes: data.pagosPendientes,
                pagosRetrasados: data.pagosRetrasados,
                pagosCancelados: data.pagosCancelados
            };
        } catch (error) {
            throw new Error(`Error al obtener estadísticas de pagos: ${error.message}`);
        }
    }

    /**
     * Obtiene pagos por mes
     * @param {number} year - Año
     * @param {number} month - Mes (1-12)
     * @returns {Promise<Pago[]>} Array de pagos del mes
     */
    async getPagosByMonth(year, month) {
        try {
            if (typeof year !== 'number' || typeof month !== 'number') {
                throw new Error('Año y mes deben ser números');
            }

            if (month < 1 || month > 12) {
                throw new Error('Mes debe estar entre 1 y 12');
            }

            const fechaInicio = new Date(year, month - 1, 1);
            const fechaFin = new Date(year, month, 0, 23, 59, 59, 999);

            return await this.getPagosByDateRange(fechaInicio, fechaFin);
        } catch (error) {
            throw new Error(`Error al obtener pagos por mes: ${error.message}`);
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
            const pagos = await this.getPagosByMonth(year, month);
            
            const balance = pagos.reduce((acc, pago) => {
                if (pago.esIngreso()) {
                    acc.ingresos += pago.monto;
                } else {
                    acc.egresos += pago.monto;
                }
                return acc;
            }, { ingresos: 0, egresos: 0 });

            return {
                year,
                month,
                ingresos: balance.ingresos,
                egresos: balance.egresos,
                balance: balance.ingresos - balance.egresos,
                cantidadPagos: pagos.length
            };
        } catch (error) {
            throw new Error(`Error al obtener balance mensual: ${error.message}`);
        }
    }

    /**
     * Obtiene los pagos más grandes
     * @param {number} limit - Límite de resultados
     * @param {string} tipoMovimiento - Tipo de movimiento (opcional)
     * @returns {Promise<Pago[]>} Array de pagos más grandes
     */
    async getLargestPagos(limit = 10, tipoMovimiento = null) {
        try {
            if (typeof limit !== 'number' || limit <= 0) {
                throw new Error('Límite debe ser un número positivo');
            }

            const filter = {};
            if (tipoMovimiento) {
                filter.tipoMovimiento = tipoMovimiento.toLowerCase();
            }

            return await this.getAll(filter, {
                limit,
                sort: { monto: -1 }
            });
        } catch (error) {
            throw new Error(`Error al obtener pagos más grandes: ${error.message}`);
        }
    }

    /**
     * Obtiene pagos por descripción
     * @param {string} descripcion - Descripción a buscar
     * @param {Object} options - Opciones de consulta
     * @returns {Promise<Pago[]>} Array de pagos que coinciden
     */
    async searchPagosByDescription(descripcion, options = {}) {
        try {
            if (!descripcion || typeof descripcion !== 'string') {
                throw new Error('Descripción debe ser una string válida');
            }

            const regex = new RegExp(descripcion, 'i');
            return await this.getAll({ notas: regex }, options);
        } catch (error) {
            throw new Error(`Error al buscar pagos por descripción: ${error.message}`);
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
                                    { $eq: ["$tipoMovimiento", "ingreso"] },
                                    "$monto",
                                    0
                                ]
                            }
                        },
                        totalEgresos: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$tipoMovimiento", "egreso"] },
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
     * Obtiene pagos recientes
     * @param {number} limit - Límite de resultados
     * @returns {Promise<Pago[]>} Array de pagos recientes
     */
    async getRecentPagos(limit = 10) {
        try {
            if (typeof limit !== 'number' || limit <= 0) {
                throw new Error('Límite debe ser un número positivo');
            }

            return await this.getAll({}, {
                limit,
                sort: { fechaPago: -1 }
            });
        } catch (error) {
            throw new Error(`Error al obtener pagos recientes: ${error.message}`);
        }
    }

    /**
     * Marca un pago como pagado
     * @param {string|ObjectId} id - ID del pago
     * @param {string} referencia - Referencia del pago (opcional)
     * @param {string} notas - Notas adicionales (opcional)
     * @returns {Promise<boolean>} True si se actualizó correctamente
     */
    async marcarComoPagado(id, referencia = null, notas = null) {
        try {
            const updateData = { estado: 'pagado' };
            
            if (referencia) {
                updateData.referencia = referencia;
            }
            
            if (notas) {
                updateData.notas = notas;
            }

            return await this.update(id, updateData);
        } catch (error) {
            throw new Error(`Error al marcar pago como pagado: ${error.message}`);
        }
    }

    /**
     * Marca un pago como retrasado
     * @param {string|ObjectId} id - ID del pago
     * @param {string} notas - Notas sobre el retraso (opcional)
     * @returns {Promise<boolean>} True si se actualizó correctamente
     */
    async marcarComoRetrasado(id, notas = null) {
        try {
            const updateData = { estado: 'retrasado' };
            
            if (notas) {
                updateData.notas = notas;
            }

            return await this.update(id, updateData);
        } catch (error) {
            throw new Error(`Error al marcar pago como retrasado: ${error.message}`);
        }
    }

    /**
     * Marca un pago como cancelado
     * @param {string|ObjectId} id - ID del pago
     * @param {string} motivo - Motivo de la cancelación
     * @returns {Promise<boolean>} True si se actualizó correctamente
     */
    async marcarComoCancelado(id, motivo) {
        try {
            if (!motivo || typeof motivo !== 'string') {
                throw new Error('Motivo de cancelación es obligatorio');
            }

            const updateData = { 
                estado: 'cancelado',
                notas: motivo
            };

            return await this.update(id, updateData);
        } catch (error) {
            throw new Error(`Error al marcar pago como cancelado: ${error.message}`);
        }
    }
}

module.exports = PagoRepository;
