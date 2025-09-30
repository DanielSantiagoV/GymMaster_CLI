// ===== IMPORTS Y DEPENDENCIAS =====
// Importación de utilidades y modelos de dominio
// PATRÓN: Dependency Injection - Se inyectan las dependencias a través del constructor
// PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (repositorios) no de implementaciones concretas
const { ObjectId } = require('mongodb'); // Utilidad para manejo de IDs de MongoDB
const { Pago } = require('../models'); // Modelo de dominio para entidad Pago
const PagoRepository = require('../repositories/PagoRepository'); // Repositorio para operaciones CRUD de pagos
const FinanzasRepository = require('../repositories/FinanzasRepository'); // Repositorio para operaciones financieras
const ClienteRepository = require('../repositories/ClienteRepository'); // Repositorio para operaciones de clientes
const ContratoRepository = require('../repositories/ContratoRepository'); // Repositorio para operaciones de contratos

/**
 * Servicio de gestión financiera
 * Implementa la lógica de negocio para pagos y movimientos financieros
 * Aplica principios SOLID y maneja transacciones
 * 
 * PATRÓN: Service Layer - Capa de servicio que orquesta la lógica de negocio financiera
 * PATRÓN: Facade - Proporciona una interfaz simplificada para operaciones complejas de finanzas
 * PRINCIPIO SOLID S: Responsabilidad Única - Se encarga únicamente de la lógica de negocio financiera
 * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (repositorios) no de implementaciones concretas
 */
class FinanzasService {
    /**
     * Constructor del servicio de finanzas
     * @param {Object} db - Instancia de la base de datos (MongoDB)
     * 
     * PATRÓN: Dependency Injection - Recibe las dependencias como parámetros
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones, no de implementaciones concretas
     * BUENA PRÁCTICA: Inicialización de repositorios en el constructor para reutilización
     */
    constructor(db) {
        // PATRÓN: Repository - Abstrae el acceso a datos de pagos
        // PRINCIPIO SOLID D: Depende de abstracción PagoRepository
        this.pagoRepository = new PagoRepository(db);
        // PATRÓN: Repository - Abstrae el acceso a datos financieros
        // PRINCIPIO SOLID D: Depende de abstracción FinanzasRepository
        this.finanzasRepository = new FinanzasRepository(db);
        // PATRÓN: Repository - Abstrae el acceso a datos de clientes
        // PRINCIPIO SOLID D: Depende de abstracción ClienteRepository
        this.clienteRepository = new ClienteRepository(db);
        // PATRÓN: Repository - Abstrae el acceso a datos de contratos
        // PRINCIPIO SOLID D: Depende de abstracción ContratoRepository
        this.contratoRepository = new ContratoRepository(db);
        // Almacena la conexión a la base de datos para uso interno
        this.db = db;
    }

    /**
     * Registra un nuevo pago
     * @param {Object} pagoData - Datos del pago
     * @returns {Promise<ObjectId>} ID del pago creado
     * @throws {Error} Si hay error en la validación o creación
     * 
     * PATRÓN: Template Method - Define el flujo estándar de registro de pagos
     * PATRÓN: Factory - Crea instancias de Pago y Finanzas
     * PATRÓN: Strategy - Diferentes estrategias según tipo de pago
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de registrar pagos
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas validaciones
     * 
     * NOTA: No hay transacciones explícitas aquí, cada operación es independiente
     * POSIBLE MEJORA: Implementar transacciones para garantizar consistencia
     */
    async registrarPago(pagoData) {
        try {
            // ===== VALIDACIONES DE DEPENDENCIAS =====
            // PATRÓN: Guard Clause - Validación temprana de dependencias
            // PRINCIPIO SOLID S: Responsabilidad de validación de dependencias
            if (pagoData.clienteId) {
                // PATRÓN: Repository - Consulta de existencia a través de abstracción
                // PRINCIPIO SOLID D: Depende de abstracción ClienteRepository
                const cliente = await this.clienteRepository.getById(pagoData.clienteId);
                // PATRÓN: Guard Clause - Validación de existencia
                if (!cliente) {
                    throw new Error('Cliente no encontrado');
                }
                // PATRÓN: Guard Clause - Validación de estado del cliente
                if (!cliente.activo) {
                    throw new Error('Cliente inactivo');
                }
            }

            // PATRÓN: Guard Clause - Validación de dependencias de contrato
            if (pagoData.contratoId) {
                // PATRÓN: Repository - Consulta de existencia a través de abstracción
                // PRINCIPIO SOLID D: Depende de abstracción ContratoRepository
                const contrato = await this.contratoRepository.getById(pagoData.contratoId);
                // PATRÓN: Guard Clause - Validación de existencia
                if (!contrato) {
                    throw new Error('Contrato no encontrado');
                }
                // PATRÓN: Guard Clause - Validación de estado del contrato
                if (contrato.estaCancelado()) {
                    throw new Error('Contrato cancelado');
                }
            }

            // ===== CREACIÓN DE ENTIDAD DE DOMINIO =====
            // PATRÓN: Factory - Creación de instancia de Pago
            // PATRÓN: Domain Model - Uso de entidad de dominio con validaciones
            // PRINCIPIO SOLID S: Delegación de responsabilidad de validación al modelo
            const pago = new Pago(pagoData);

            // ===== PERSISTENCIA DEL PAGO =====
            // PATRÓN: Repository - Abstrae la operación de inserción
            // PRINCIPIO SOLID D: Depende de abstracción, no de implementación concreta
            const pagoId = await this.pagoRepository.create(pago);

            // ===== CREACIÓN DE MOVIMIENTO FINANCIERO OPCIONAL =====
            // PATRÓN: Strategy - Diferentes estrategias según tipo de pago
            // PATRÓN: Factory - Creación de instancia de Finanzas
            // BUENA PRÁCTICA: Solo crear movimiento financiero para ingresos
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

                // PATRÓN: Repository - Abstrae la operación de inserción
                // PRINCIPIO SOLID D: Depende de abstracción, no de implementación concreta
                await this.finanzasRepository.create(movimiento);
            }

            return pagoId;
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Wrapping - Envuelve errores con contexto específico
            // PRINCIPIO SOLID S: Responsabilidad de manejo de errores del método
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
     * 
     * PATRÓN: Template Method - Define el flujo estándar de marcado de pago
     * PATRÓN: Guard Clause - Validaciones tempranas
     * PATRÓN: Strategy - Diferentes estrategias según tipo de pago
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de marcar pagos como pagados
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas validaciones
     * 
     * NOTA: No hay transacciones explícitas aquí, cada operación es independiente
     * POSIBLE MEJORA: Implementar transacciones para garantizar consistencia
     */
    async marcarPagoComoPagado(pagoId, referencia = null, notas = null) {
        try {
            // ===== VALIDACIÓN DE EXISTENCIA =====
            // PATRÓN: Repository - Consulta de existencia a través de abstracción
            // PRINCIPIO SOLID D: Depende de abstracción PagoRepository
            const pago = await this.pagoRepository.getById(pagoId);
            // PATRÓN: Guard Clause - Validación temprana de existencia
            if (!pago) {
                throw new Error('Pago no encontrado');
            }

            // ===== VALIDACIONES DE ESTADO =====
            // PATRÓN: Guard Clause - Validación de estado del pago
            // PRINCIPIO SOLID S: Responsabilidad de validación de estado
            if (pago.estaPagado()) {
                throw new Error('El pago ya está marcado como pagado');
            }

            if (pago.estaCancelado()) {
                throw new Error('No se puede marcar como pagado un pago cancelado');
            }

            // ===== ACTUALIZACIÓN DEL PAGO =====
            // PATRÓN: Repository - Abstrae la operación de actualización
            // PRINCIPIO SOLID D: Depende de abstracción, no de implementación concreta
            const actualizado = await this.pagoRepository.marcarComoPagado(pagoId, referencia, notas);

            // ===== ACTUALIZACIÓN DE MOVIMIENTO FINANCIERO OPCIONAL =====
            // PATRÓN: Strategy - Diferentes estrategias según tipo de pago
            // BUENA PRÁCTICA: Solo actualizar movimiento financiero para ingresos
            if (pago.esIngreso()) {
                // PATRÓN: Repository - Consulta de movimientos relacionados
                // PRINCIPIO SOLID D: Depende de abstracción FinanzasRepository
                const movimientos = await this.finanzasRepository.getAll({
                    clienteId: pago.clienteId,
                    monto: pago.monto,
                    fecha: pago.fechaPago
                });

                // PATRÓN: Guard Clause - Validación de existencia de movimientos
                if (movimientos.length > 0) {
                    const movimiento = movimientos[0];
                    // PATRÓN: Repository - Abstrae la operación de actualización
                    // PRINCIPIO SOLID D: Depende de abstracción, no de implementación concreta
                    await this.finanzasRepository.update(movimiento.movimientoId, {
                        descripcion: `Pago confirmado de ${pago.monto} - ${pago.metodoPago}${referencia ? ` (Ref: ${referencia})` : ''}`
                    });
                }
            }

            return actualizado;
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Wrapping - Envuelve errores con contexto específico
            // PRINCIPIO SOLID S: Responsabilidad de manejo de errores del método
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
     * 
     * PATRÓN: Template Method - Define el flujo estándar de eliminación de pagos
     * PATRÓN: Guard Clause - Validaciones tempranas
     * PATRÓN: Strategy - Diferentes estrategias según estado del pago
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de eliminar pagos
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas validaciones
     * 
     * NOTA: No hay transacciones explícitas aquí, cada operación es independiente
     * POSIBLE MEJORA: Implementar transacciones para garantizar consistencia
     */
    async eliminarPago(pagoId) {
        try {
            // ===== VALIDACIÓN DE EXISTENCIA =====
            // PATRÓN: Repository - Consulta de existencia a través de abstracción
            // PRINCIPIO SOLID D: Depende de abstracción PagoRepository
            const pago = await this.pagoRepository.getById(pagoId);
            // PATRÓN: Guard Clause - Validación temprana de existencia
            if (!pago) {
                throw new Error('Pago no encontrado');
            }

            // ===== VALIDACIÓN DE DEPENDENCIAS =====
            // PATRÓN: Guard Clause - Validación de dependencias de contrato
            // PRINCIPIO SOLID S: Responsabilidad de validación de dependencias
            if (pago.tieneContrato()) {
                // PATRÓN: Repository - Consulta de estado del contrato
                // PRINCIPIO SOLID D: Depende de abstracción ContratoRepository
                const contrato = await this.contratoRepository.getById(pago.contratoId);
                // PATRÓN: Guard Clause - Validación de estado del contrato
                if (contrato && contrato.estaVigente()) {
                    throw new Error('No se puede eliminar un pago asociado a un contrato vigente');
                }
            }

            // ===== VALIDACIÓN DE ESTADO =====
            // PATRÓN: Guard Clause - Validación de estado del pago
            // PRINCIPIO SOLID S: Responsabilidad de validación de estado
            if (pago.estaPagado()) {
                throw new Error('No se puede eliminar un pago ya confirmado');
            }

            // ===== ELIMINACIÓN DEL PAGO =====
            // PATRÓN: Repository - Abstrae la operación de eliminación
            // PRINCIPIO SOLID D: Depende de abstracción, no de implementación concreta
            return await this.pagoRepository.delete(pagoId);
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Wrapping - Envuelve errores con contexto específico
            // PRINCIPIO SOLID S: Responsabilidad de manejo de errores del método
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

// ===== EXPORTACIÓN DEL MÓDULO =====
// PATRÓN: Module Pattern - Exporta la clase como módulo
// PRINCIPIO SOLID S: Responsabilidad de proporcionar la interfaz pública del servicio
module.exports = FinanzasService;
