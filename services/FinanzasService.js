const { ObjectId } = require('mongodb');
const { Pago } = require('../models');
const PagoRepository = require('../repositories/PagoRepository');
const FinanzasRepository = require('../repositories/FinanzasRepository');
const ClienteRepository = require('../repositories/ClienteRepository');
const ContratoRepository = require('../repositories/ContratoRepository');

/**
 * Servicio de gestión financiera
 * Implementa la lógica de negocio para pagos y movimientos financieros
 * Aplica principios SOLID y maneja transacciones
 */
class FinanzasService {
    constructor(db) {
        this.pagoRepository = new PagoRepository(db);
        this.finanzasRepository = new FinanzasRepository(db);
        this.clienteRepository = new ClienteRepository(db);
        this.contratoRepository = new ContratoRepository(db);
        this.db = db;
    }

    /**
     * Registra un nuevo pago
     * @param {Object} pagoData - Datos del pago
     * @returns {Promise<ObjectId>} ID del pago creado
     * @throws {Error} Si hay error en la validación o creación
     */
    async registrarPago(pagoData) {
        try {
            // Validar que el cliente existe si se proporciona
            if (pagoData.clienteId) {
                const cliente = await this.clienteRepository.getById(pagoData.clienteId);
                if (!cliente) {
                    throw new Error('Cliente no encontrado');
                }
                if (!cliente.activo) {
                    throw new Error('Cliente inactivo');
                }
            }

            // Validar que el contrato existe si se proporciona
            if (pagoData.contratoId) {
                const contrato = await this.contratoRepository.getById(pagoData.contratoId);
                if (!contrato) {
                    throw new Error('Contrato no encontrado');
                }
                if (contrato.estaCancelado()) {
                    throw new Error('Contrato cancelado');
                }
            }

            // Crear instancia de Pago
            const pago = new Pago(pagoData);

            // Insertar en la base de datos
            const pagoId = await this.pagoRepository.create(pago);

            // Si es un ingreso, también crear movimiento financiero
            if (pago.esIngreso()) {
                const { Finanzas } = require('../models');
                const movimiento = new Finanzas({
                    tipo: 'ingreso',
                    descripcion: `Pago de ${pago.monto} - ${pago.metodoPago}`,
                    monto: pago.monto,
                    fecha: pago.fechaPago,
                    clienteId: pago.clienteId,
                    categoria: 'pago_cliente'
                });

                await this.finanzasRepository.create(movimiento);
            }

            return pagoId;
        } catch (error) {
            throw new Error(`Error al registrar pago: ${error.message}`);
        }
    }

    /**
     * Obtiene un pago por su ID
     * @param {string|ObjectId} pagoId - ID del pago
     * @returns {Promise<Pago|null>} Pago encontrado o null
     */
    async obtenerPago(pagoId) {
        try {
            return await this.pagoRepository.getById(pagoId);
        } catch (error) {
            throw new Error(`Error al obtener pago: ${error.message}`);
        }
    }

    /**
     * Obtiene todos los pagos con filtros opcionales
     * @param {Object} filtros - Filtros de búsqueda
     * @param {Object} opciones - Opciones de consulta
     * @returns {Promise<Pago[]>} Array de pagos
     */
    async obtenerPagos(filtros = {}, opciones = {}) {
        try {
            return await this.pagoRepository.getAll(filtros, opciones);
        } catch (error) {
            throw new Error(`Error al obtener pagos: ${error.message}`);
        }
    }

    /**
     * Obtiene pagos por cliente
     * @param {string|ObjectId} clienteId - ID del cliente
     * @param {Object} filtros - Filtros adicionales
     * @returns {Promise<Pago[]>} Array de pagos del cliente
     */
    async obtenerPagosPorCliente(clienteId, filtros = {}) {
        try {
            return await this.pagoRepository.getPagosByClient(clienteId, filtros);
        } catch (error) {
            throw new Error(`Error al obtener pagos del cliente: ${error.message}`);
        }
    }

    /**
     * Obtiene pagos por contrato
     * @param {string|ObjectId} contratoId - ID del contrato
     * @param {Object} filtros - Filtros adicionales
     * @returns {Promise<Pago[]>} Array de pagos del contrato
     */
    async obtenerPagosPorContrato(contratoId, filtros = {}) {
        try {
            return await this.pagoRepository.getPagosByContract(contratoId, filtros);
        } catch (error) {
            throw new Error(`Error al obtener pagos del contrato: ${error.message}`);
        }
    }

    /**
     * Obtiene pagos pendientes
     * @param {Object} opciones - Opciones de consulta
     * @returns {Promise<Pago[]>} Array de pagos pendientes
     */
    async obtenerPagosPendientes(opciones = {}) {
        try {
            return await this.pagoRepository.getPagosPendientes(opciones);
        } catch (error) {
            throw new Error(`Error al obtener pagos pendientes: ${error.message}`);
        }
    }

    /**
     * Obtiene pagos retrasados
     * @param {Object} opciones - Opciones de consulta
     * @returns {Promise<Pago[]>} Array de pagos retrasados
     */
    async obtenerPagosRetrasados(opciones = {}) {
        try {
            return await this.pagoRepository.getPagosRetrasados(opciones);
        } catch (error) {
            throw new Error(`Error al obtener pagos retrasados: ${error.message}`);
        }
    }

    /**
     * Obtiene pagos vencidos
     * @param {Date} fechaLimite - Fecha límite para considerar vencidos
     * @param {Object} opciones - Opciones de consulta
     * @returns {Promise<Pago[]>} Array de pagos vencidos
     */
    async obtenerPagosVencidos(fechaLimite = new Date(), opciones = {}) {
        try {
            return await this.pagoRepository.getPagosVencidos(fechaLimite, opciones);
        } catch (error) {
            throw new Error(`Error al obtener pagos vencidos: ${error.message}`);
        }
    }

    /**
     * Marca un pago como pagado
     * @param {string|ObjectId} pagoId - ID del pago
     * @param {string} referencia - Referencia del pago (opcional)
     * @param {string} notas - Notas adicionales (opcional)
     * @returns {Promise<boolean>} True si se actualizó correctamente
     */
    async marcarPagoComoPagado(pagoId, referencia = null, notas = null) {
        try {
            const pago = await this.pagoRepository.getById(pagoId);
            if (!pago) {
                throw new Error('Pago no encontrado');
            }

            if (pago.estaPagado()) {
                throw new Error('El pago ya está marcado como pagado');
            }

            if (pago.estaCancelado()) {
                throw new Error('No se puede marcar como pagado un pago cancelado');
            }

            // Actualizar estado del pago
            const actualizado = await this.pagoRepository.marcarComoPagado(pagoId, referencia, notas);

            // Si es un ingreso, actualizar también el movimiento financiero
            if (pago.esIngreso()) {
                const movimientos = await this.finanzasRepository.getAll({
                    clienteId: pago.clienteId,
                    monto: pago.monto,
                    fecha: pago.fechaPago
                });

                if (movimientos.length > 0) {
                    const movimiento = movimientos[0];
                    await this.finanzasRepository.update(movimiento.movimientoId, {
                        descripcion: `Pago confirmado de ${pago.monto} - ${pago.metodoPago}${referencia ? ` (Ref: ${referencia})` : ''}`
                    });
                }
            }

            return actualizado;
        } catch (error) {
            throw new Error(`Error al marcar pago como pagado: ${error.message}`);
        }
    }

    /**
     * Marca un pago como retrasado
     * @param {string|ObjectId} pagoId - ID del pago
     * @param {string} notas - Notas sobre el retraso (opcional)
     * @returns {Promise<boolean>} True si se actualizó correctamente
     */
    async marcarPagoComoRetrasado(pagoId, notas = null) {
        try {
            const pago = await this.pagoRepository.getById(pagoId);
            if (!pago) {
                throw new Error('Pago no encontrado');
            }

            if (pago.estaPagado()) {
                throw new Error('No se puede marcar como retrasado un pago ya pagado');
            }

            if (pago.estaCancelado()) {
                throw new Error('No se puede marcar como retrasado un pago cancelado');
            }

            return await this.pagoRepository.marcarComoRetrasado(pagoId, notas);
        } catch (error) {
            throw new Error(`Error al marcar pago como retrasado: ${error.message}`);
        }
    }

    /**
     * Marca un pago como cancelado
     * @param {string|ObjectId} pagoId - ID del pago
     * @param {string} motivo - Motivo de la cancelación
     * @returns {Promise<boolean>} True si se actualizó correctamente
     */
    async marcarPagoComoCancelado(pagoId, motivo) {
        try {
            const pago = await this.pagoRepository.getById(pagoId);
            if (!pago) {
                throw new Error('Pago no encontrado');
            }

            if (pago.estaPagado()) {
                throw new Error('No se puede cancelar un pago ya pagado');
            }

            return await this.pagoRepository.marcarComoCancelado(pagoId, motivo);
        } catch (error) {
            throw new Error(`Error al marcar pago como cancelado: ${error.message}`);
        }
    }

    /**
     * Obtiene el balance por rango de fechas
     * @param {Date} fechaInicio - Fecha de inicio
     * @param {Date} fechaFin - Fecha de fin
     * @param {string|ObjectId} clienteId - ID del cliente (opcional)
     * @returns {Promise<Object>} Balance en el rango de fechas
     */
    async obtenerBalancePorFechas(fechaInicio, fechaFin, clienteId = null) {
        try {
            return await this.pagoRepository.getBalanceByDateRange(fechaInicio, fechaFin, clienteId);
        } catch (error) {
            throw new Error(`Error al obtener balance por fechas: ${error.message}`);
        }
    }

    /**
     * Obtiene estadísticas financieras
     * @param {Date} fechaInicio - Fecha de inicio (opcional)
     * @param {Date} fechaFin - Fecha de fin (opcional)
     * @returns {Promise<Object>} Estadísticas financieras
     */
    async obtenerEstadisticasFinancieras(fechaInicio = null, fechaFin = null) {
        try {
            const statsPagos = await this.pagoRepository.getPagoStats(fechaInicio, fechaFin);
            const statsFinanzas = await this.finanzasRepository.getFinancialStats(fechaInicio, fechaFin);

            return {
                pagos: statsPagos,
                movimientos: statsFinanzas,
                balanceTotal: statsPagos.balance + statsFinanzas.balance
            };
        } catch (error) {
            throw new Error(`Error al obtener estadísticas financieras: ${error.message}`);
        }
    }

    /**
     * Obtiene reporte de pagos por mes
     * @param {number} año - Año
     * @param {number} mes - Mes (1-12)
     * @returns {Promise<Object>} Reporte del mes
     */
    async obtenerReporteMensual(año, mes) {
        try {
            const balanceMensual = await this.pagoRepository.getMonthlyBalance(año, mes);
            const pagosDelMes = await this.pagoRepository.getPagosByMonth(año, mes);

            return {
                ...balanceMensual,
                pagos: pagosDelMes
            };
        } catch (error) {
            throw new Error(`Error al obtener reporte mensual: ${error.message}`);
        }
    }

    /**
     * Obtiene alertas de pagos pendientes y retrasados
     * @returns {Promise<Object>} Alertas de pagos
     */
    async obtenerAlertasPagos() {
        try {
            const pagosPendientes = await this.pagoRepository.getPagosPendientes({ limit: 10 });
            const pagosRetrasados = await this.pagoRepository.getPagosRetrasados({ limit: 10 });
            const pagosVencidos = await this.pagoRepository.getPagosVencidos(new Date(), { limit: 10 });

            return {
                pagosPendientes: pagosPendientes,
                pagosRetrasados: pagosRetrasados,
                pagosVencidos: pagosVencidos,
                totalPendientes: pagosPendientes.length,
                totalRetrasados: pagosRetrasados.length,
                totalVencidos: pagosVencidos.length
            };
        } catch (error) {
            throw new Error(`Error al obtener alertas de pagos: ${error.message}`);
        }
    }

    /**
     * Obtiene pagos por método de pago
     * @param {string} metodoPago - Método de pago
     * @param {Object} opciones - Opciones de consulta
     * @returns {Promise<Pago[]>} Array de pagos del método
     */
    async obtenerPagosPorMetodo(metodoPago, opciones = {}) {
        try {
            return await this.pagoRepository.getPagosByPaymentMethod(metodoPago, opciones);
        } catch (error) {
            throw new Error(`Error al obtener pagos por método: ${error.message}`);
        }
    }

    /**
     * Obtiene pagos por tipo de movimiento
     * @param {string} tipoMovimiento - Tipo de movimiento (ingreso, egreso)
     * @param {Object} opciones - Opciones de consulta
     * @returns {Promise<Pago[]>} Array de pagos del tipo
     */
    async obtenerPagosPorTipo(tipoMovimiento, opciones = {}) {
        try {
            return await this.pagoRepository.getPagosByMovementType(tipoMovimiento, opciones);
        } catch (error) {
            throw new Error(`Error al obtener pagos por tipo: ${error.message}`);
        }
    }

    /**
     * Obtiene pagos por rango de fechas
     * @param {Date} fechaInicio - Fecha de inicio
     * @param {Date} fechaFin - Fecha de fin
     * @param {Object} filtros - Filtros adicionales
     * @returns {Promise<Pago[]>} Array de pagos en el rango
     */
    async obtenerPagosPorFechas(fechaInicio, fechaFin, filtros = {}) {
        try {
            return await this.pagoRepository.getPagosByDateRange(fechaInicio, fechaFin, filtros);
        } catch (error) {
            throw new Error(`Error al obtener pagos por fechas: ${error.message}`);
        }
    }

    /**
     * Obtiene los pagos más grandes
     * @param {number} limite - Límite de resultados
     * @param {string} tipoMovimiento - Tipo de movimiento (opcional)
     * @returns {Promise<Pago[]>} Array de pagos más grandes
     */
    async obtenerPagosMasGrandes(limite = 10, tipoMovimiento = null) {
        try {
            return await this.pagoRepository.getLargestPagos(limite, tipoMovimiento);
        } catch (error) {
            throw new Error(`Error al obtener pagos más grandes: ${error.message}`);
        }
    }

    /**
     * Obtiene pagos recientes
     * @param {number} limite - Límite de resultados
     * @returns {Promise<Pago[]>} Array de pagos recientes
     */
    async obtenerPagosRecientes(limite = 10) {
        try {
            return await this.pagoRepository.getRecentPagos(limite);
        } catch (error) {
            throw new Error(`Error al obtener pagos recientes: ${error.message}`);
        }
    }

    /**
     * Busca pagos por descripción
     * @param {string} descripcion - Descripción a buscar
     * @param {Object} opciones - Opciones de consulta
     * @returns {Promise<Pago[]>} Array de pagos que coinciden
     */
    async buscarPagosPorDescripcion(descripcion, opciones = {}) {
        try {
            return await this.pagoRepository.searchPagosByDescription(descripcion, opciones);
        } catch (error) {
            throw new Error(`Error al buscar pagos por descripción: ${error.message}`);
        }
    }

    /**
     * Obtiene el balance total
     * @returns {Promise<number>} Balance total
     */
    async obtenerBalanceTotal() {
        try {
            return await this.pagoRepository.getTotalBalance();
        } catch (error) {
            throw new Error(`Error al obtener balance total: ${error.message}`);
        }
    }

    /**
     * Crea un pago de ingreso
     * @param {number} monto - Monto del pago
     * @param {string} metodoPago - Método de pago
     * @param {ObjectId} clienteId - ID del cliente (opcional)
     * @param {ObjectId} contratoId - ID del contrato (opcional)
     * @param {string} referencia - Referencia del pago (opcional)
     * @param {string} notas - Notas del pago (opcional)
     * @returns {Promise<ObjectId>} ID del pago creado
     */
    async crearPagoIngreso(monto, metodoPago, clienteId = null, contratoId = null, referencia = null, notas = null) {
        try {
            const pagoData = {
                monto,
                metodoPago,
                clienteId,
                contratoId,
                referencia,
                notas,
                tipoMovimiento: 'ingreso',
                estado: 'pagado'
            };

            return await this.registrarPago(pagoData);
        } catch (error) {
            throw new Error(`Error al crear pago de ingreso: ${error.message}`);
        }
    }

    /**
     * Crea un pago de egreso
     * @param {number} monto - Monto del pago
     * @param {string} metodoPago - Método de pago
     * @param {ObjectId} clienteId - ID del cliente (opcional)
     * @param {ObjectId} contratoId - ID del contrato (opcional)
     * @param {string} referencia - Referencia del pago (opcional)
     * @param {string} notas - Notas del pago (opcional)
     * @returns {Promise<ObjectId>} ID del pago creado
     */
    async crearPagoEgreso(monto, metodoPago, clienteId = null, contratoId = null, referencia = null, notas = null) {
        try {
            const pagoData = {
                monto,
                metodoPago,
                clienteId,
                contratoId,
                referencia,
                notas,
                tipoMovimiento: 'egreso',
                estado: 'pagado'
            };

            return await this.registrarPago(pagoData);
        } catch (error) {
            throw new Error(`Error al crear pago de egreso: ${error.message}`);
        }
    }

    /**
     * Crea un pago pendiente
     * @param {number} monto - Monto del pago
     * @param {string} metodoPago - Método de pago
     * @param {ObjectId} clienteId - ID del cliente (opcional)
     * @param {ObjectId} contratoId - ID del contrato (opcional)
     * @param {string} referencia - Referencia del pago (opcional)
     * @param {string} notas - Notas del pago (opcional)
     * @returns {Promise<ObjectId>} ID del pago creado
     */
    async crearPagoPendiente(monto, metodoPago, clienteId = null, contratoId = null, referencia = null, notas = null) {
        try {
            const pagoData = {
                monto,
                metodoPago,
                clienteId,
                contratoId,
                referencia,
                notas,
                tipoMovimiento: 'ingreso',
                estado: 'pendiente'
            };

            return await this.registrarPago(pagoData);
        } catch (error) {
            throw new Error(`Error al crear pago pendiente: ${error.message}`);
        }
    }

    /**
     * Elimina un pago (solo si no está asociado a contratos vigentes)
     * @param {string|ObjectId} pagoId - ID del pago a eliminar
     * @returns {Promise<boolean>} True si se eliminó correctamente
     */
    async eliminarPago(pagoId) {
        try {
            const pago = await this.pagoRepository.getById(pagoId);
            if (!pago) {
                throw new Error('Pago no encontrado');
            }

            // Verificar si el pago está asociado a un contrato vigente
            if (pago.tieneContrato()) {
                const contrato = await this.contratoRepository.getById(pago.contratoId);
                if (contrato && contrato.estaVigente()) {
                    throw new Error('No se puede eliminar un pago asociado a un contrato vigente');
                }
            }

            // Verificar si el pago ya está pagado
            if (pago.estaPagado()) {
                throw new Error('No se puede eliminar un pago ya confirmado');
            }

            return await this.pagoRepository.delete(pagoId);
        } catch (error) {
            throw new Error(`Error al eliminar pago: ${error.message}`);
        }
    }

    /**
     * Obtiene un cliente por su ID
     * @param {string|ObjectId} clienteId - ID del cliente
     * @returns {Promise<Cliente|null>} Cliente encontrado o null
     */
    async obtenerClientePorId(clienteId) {
        try {
            return await this.clienteRepository.getById(clienteId);
        } catch (error) {
            throw new Error(`Error al obtener cliente: ${error.message}`);
        }
    }
}

module.exports = FinanzasService;
