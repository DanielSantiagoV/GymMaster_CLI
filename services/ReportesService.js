const { ClienteRepository } = require('../repositories');
const { PlanEntrenamientoRepository } = require('../repositories');
const { SeguimientoRepository } = require('../repositories');
const { NutricionRepository } = require('../repositories');
const { ContratoRepository } = require('../repositories');
const { FinanzasRepository } = require('../repositories');
const { PagoRepository } = require('../repositories');
const dayjs = require('dayjs');

/**
 * Servicio de Reportes y Estadísticas
 * Orquesta la extracción y agregación de datos de todos los módulos
 * Aplica filtros, agrupaciones y cálculos estadísticos
 */
class ReportesService {
    constructor(db) {
        this.db = db;
        this.clienteRepository = new ClienteRepository(db);
        this.planRepository = new PlanEntrenamientoRepository(db);
        this.seguimientoRepository = new SeguimientoRepository(db);
        this.nutricionRepository = new NutricionRepository(db);
        this.contratoRepository = new ContratoRepository(db);
        this.finanzasRepository = new FinanzasRepository(db);
        this.pagoRepository = new PagoRepository(db);
    }

    /**
     * Obtiene estadísticas generales del sistema
     * @param {Object} filtros - Filtros opcionales
     * @returns {Promise<Object>} Estadísticas consolidadas
     */
    async obtenerEstadisticasGenerales(filtros = {}) {
        try {
            const [
                totalClientes,
                clientesActivos,
                totalPlanes,
                planesActivos,
                totalContratos,
                contratosActivos,
                totalSeguimientos,
                totalPlanesNutricion,
                planesNutricionActivos,
                balanceFinanciero
            ] = await Promise.all([
                this.clienteRepository.countClientes(),
                this.clienteRepository.countClientes({ activo: true }),
                this.planRepository.countPlanes(),
                this.planRepository.countPlanes({ estado: 'activo' }),
                this.contratoRepository.countContracts(),
                this.contratoRepository.countContracts({ estado: 'vigente' }),
                this.seguimientoRepository.collection.countDocuments(),
                this.nutricionRepository.collection.countDocuments(),
                this.nutricionRepository.collection.countDocuments({ estado: 'activo' }),
                this.obtenerBalanceFinanciero(filtros)
            ]);

            return {
                clientes: {
                    total: totalClientes,
                    activos: clientesActivos,
                    inactivos: totalClientes - clientesActivos,
                    porcentajeActivos: totalClientes > 0 ? Math.round((clientesActivos / totalClientes) * 100) : 0
                },
                planes: {
                    total: totalPlanes,
                    activos: planesActivos,
                    inactivos: totalPlanes - planesActivos,
                    porcentajeActivos: totalPlanes > 0 ? Math.round((planesActivos / totalPlanes) * 100) : 0
                },
                contratos: {
                    total: totalContratos,
                    activos: contratosActivos,
                    inactivos: totalContratos - contratosActivos,
                    porcentajeActivos: totalContratos > 0 ? Math.round((contratosActivos / totalContratos) * 100) : 0
                },
                seguimiento: {
                    totalRegistros: totalSeguimientos
                },
                nutricion: {
                    total: totalPlanesNutricion,
                    activos: planesNutricionActivos,
                    inactivos: totalPlanesNutricion - planesNutricionActivos,
                    porcentajeActivos: totalPlanesNutricion > 0 ? Math.round((planesNutricionActivos / totalPlanesNutricion) * 100) : 0
                },
                finanzas: balanceFinanciero
            };
        } catch (error) {
            throw new Error(`Error al obtener estadísticas generales: ${error.message}`);
        }
    }

    /**
     * Reporte de clientes con filtros
     * @param {Object} filtros - Filtros de búsqueda
     * @returns {Promise<Object>} Reporte de clientes
     */
    async obtenerReporteClientes(filtros = {}) {
        try {
            const query = {};
            
            // Aplicar filtros
            if (filtros.activo !== undefined) {
                query.activo = filtros.activo;
            }
            if (filtros.fechaInicio && filtros.fechaFin) {
                query.fechaRegistro = {
                    $gte: new Date(filtros.fechaInicio),
                    $lte: new Date(filtros.fechaFin)
                };
            }

            const clientes = await this.clienteRepository.getAll(query, { 
                sort: { fechaRegistro: -1 },
                limit: filtros.limit || 100
            });

            // Estadísticas por plan
            const estadisticasPorPlan = {};
            const clientesConPlanes = clientes.filter(c => c.planes && c.planes.length > 0);
            
            for (const cliente of clientesConPlanes) {
                for (const planId of cliente.planes) {
                    const plan = await this.planRepository.getById(planId);
                    if (plan) {
                        if (!estadisticasPorPlan[plan.nombre]) {
                            estadisticasPorPlan[plan.nombre] = 0;
                        }
                        estadisticasPorPlan[plan.nombre]++;
                    }
                }
            }

            return {
                total: clientes.length,
                activos: clientes.filter(c => c.activo).length,
                inactivos: clientes.filter(c => !c.activo).length,
                conPlanes: clientesConPlanes.length,
                sinPlanes: clientes.length - clientesConPlanes.length,
                estadisticasPorPlan,
                clientes: clientes.map(cliente => ({
                    clienteId: cliente.clienteId.toString(),
                    nombre: cliente.getNombreCompleto(),
                    email: cliente.email,
                    activo: cliente.activo,
                    fechaRegistro: cliente.fechaRegistro,
                    cantidadPlanes: cliente.planes ? cliente.planes.length : 0
                }))
            };
        } catch (error) {
            throw new Error(`Error al obtener reporte de clientes: ${error.message}`);
        }
    }

    /**
     * Reporte de planes de entrenamiento
     * @param {Object} filtros - Filtros de búsqueda
     * @returns {Promise<Object>} Reporte de planes
     */
    async obtenerReportePlanes(filtros = {}) {
        try {
            const query = {};
            
            if (filtros.estado) {
                query.estado = filtros.estado;
            }

            const planes = await this.planRepository.getAll(query, { 
                sort: { fechaCreacion: -1 },
                limit: filtros.limit || 100
            });

            const planesConEstadisticas = await Promise.all(planes.map(async (plan) => {
                const clientesAsociados = await this.clienteRepository.getAll({
                    planes: { $in: [plan.planId] }
                });

                const contratos = await this.contratoRepository.getAll({
                    planId: plan.planId
                });

                const duracionPromedio = contratos.length > 0 
                    ? contratos.reduce((acc, contrato) => {
                        const inicio = new Date(contrato.fechaInicio);
                        const fin = contrato.fechaFin ? new Date(contrato.fechaFin) : new Date();
                        const duracion = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24));
                        return acc + duracion;
                    }, 0) / contratos.length
                    : 0;

                return {
                    planId: plan.planId,
                    nombre: plan.nombre,
                    nivel: plan.nivel,
                    estado: plan.estado,
                    fechaCreacion: plan.fechaCreacion,
                    clientesAsociados: clientesAsociados.length,
                    contratosTotal: contratos.length,
                    contratosActivos: contratos.filter(c => c.estado === 'vigente').length,
                    duracionPromedio: Math.round(duracionPromedio)
                };
            }));

            return {
                total: planes.length,
                activos: planes.filter(p => p.estado === 'activo').length,
                cancelados: planes.filter(p => p.estado === 'cancelado').length,
                finalizados: planes.filter(p => p.estado === 'finalizado').length,
                planes: planesConEstadisticas
            };
        } catch (error) {
            throw new Error(`Error al obtener reporte de planes: ${error.message}`);
        }
    }

    /**
     * Reporte de seguimiento físico con evolución
     * @param {Object} filtros - Filtros de búsqueda
     * @returns {Promise<Object>} Reporte de seguimiento
     */
    async obtenerReporteSeguimiento(filtros = {}) {
        try {
            const query = {};
            
            if (filtros.clienteId) {
                query.clienteId = filtros.clienteId;
            }
            if (filtros.fechaInicio && filtros.fechaFin) {
                query.fecha = {
                    $gte: new Date(filtros.fechaInicio),
                    $lte: new Date(filtros.fechaFin)
                };
            }

            const seguimientos = await this.seguimientoRepository.getAll(query, { 
                sort: { fecha: -1 },
                limit: filtros.limit || 200
            });

            // Agrupar por cliente para análisis
            const seguimientosPorCliente = {};
            seguimientos.forEach(seguimiento => {
                const clienteId = seguimiento.clienteId.toString();
                if (!seguimientosPorCliente[clienteId]) {
                    seguimientosPorCliente[clienteId] = [];
                }
                seguimientosPorCliente[clienteId].push(seguimiento);
            });

            // Análisis de evolución por cliente
            const evolucionPorCliente = {};
            for (const [clienteId, segs] of Object.entries(seguimientosPorCliente)) {
                const cliente = await this.clienteRepository.getById(clienteId);
                if (cliente) {
                    // Ordenar por fecha para análisis cronológico
                    const segsOrdenados = segs.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
                    
                    const evolucion = {
                        cliente: cliente.getNombreCompleto(),
                        totalRegistros: segsOrdenados.length,
                        primerRegistro: segsOrdenados[0]?.fecha,
                        ultimoRegistro: segsOrdenados[segsOrdenados.length - 1]?.fecha,
                        evolucionPeso: this.calcularEvolucion(segsOrdenados, 'peso'),
                        evolucionGrasa: this.calcularEvolucion(segsOrdenados, 'grasaCorporal'),
                        evolucionMedidas: this.calcularEvolucionMedidas(segsOrdenados)
                    };
                    
                    evolucionPorCliente[clienteId] = evolucion;
                }
            }

            // Clientes sin seguimiento reciente (últimos 30 días)
            const clientesSinSeguimiento = [];
            const clientes = await this.clienteRepository.getAll({ activo: true });
            const fechaLimite = new Date();
            fechaLimite.setDate(fechaLimite.getDate() - 30);

            for (const cliente of clientes) {
                const ultimoSeguimiento = await this.seguimientoRepository.getAll({
                    clienteId: cliente.clienteId
                }, { 
                    sort: { fecha: -1 },
                    limit: 1
                });

                if (ultimoSeguimiento.length === 0 || new Date(ultimoSeguimiento[0].fecha) < fechaLimite) {
                    clientesSinSeguimiento.push({
                        clienteId: cliente.clienteId,
                        nombre: cliente.getNombreCompleto(),
                        ultimoSeguimiento: ultimoSeguimiento[0]?.fecha || 'Nunca',
                        diasSinSeguimiento: ultimoSeguimiento[0] 
                            ? Math.ceil((new Date() - new Date(ultimoSeguimiento[0].fecha)) / (1000 * 60 * 60 * 24))
                            : 'N/A'
                    });
                }
            }

            return {
                totalRegistros: seguimientos.length,
                clientesConSeguimiento: Object.keys(seguimientosPorCliente).length,
                evolucionPorCliente,
                clientesSinSeguimiento: clientesSinSeguimiento.sort((a, b) => 
                    typeof a.diasSinSeguimiento === 'number' && typeof b.diasSinSeguimiento === 'number'
                        ? b.diasSinSeguimiento - a.diasSinSeguimiento
                        : 0
                )
            };
        } catch (error) {
            throw new Error(`Error al obtener reporte de seguimiento: ${error.message}`);
        }
    }

    /**
     * Reporte de nutrición
     * @param {Object} filtros - Filtros de búsqueda
     * @returns {Promise<Object>} Reporte de nutrición
     */
    async obtenerReporteNutricion(filtros = {}) {
        try {
            const query = {};
            
            if (filtros.clienteId) {
                query.clienteId = filtros.clienteId;
            }
            if (filtros.estado) {
                query.estado = filtros.estado;
            }
            if (filtros.tipoPlan) {
                query.tipoPlan = filtros.tipoPlan;
            }

            const planesNutricion = await this.nutricionRepository.getAll(query, { 
                sort: { fechaCreacion: -1 },
                limit: filtros.limit || 100
            });

            // Estadísticas por tipo de plan
            const estadisticasPorTipo = {};
            planesNutricion.forEach(plan => {
                if (!estadisticasPorTipo[plan.tipoPlan]) {
                    estadisticasPorTipo[plan.tipoPlan] = {
                        total: 0,
                        activos: 0,
                        finalizados: 0,
                        cancelados: 0
                    };
                }
                estadisticasPorTipo[plan.tipoPlan].total++;
                estadisticasPorTipo[plan.tipoPlan][plan.estado + 's']++;
            });

            // Planes con información del cliente
            const planesConCliente = await Promise.all(planesNutricion.map(async (plan) => {
                const cliente = await this.clienteRepository.getById(plan.clienteId);
                return {
                    nutricionId: plan.nutricionId,
                    cliente: cliente ? cliente.getNombreCompleto() : 'Cliente no encontrado',
                    tipoPlan: plan.tipoPlan,
                    estado: plan.estado,
                    fechaCreacion: plan.fechaCreacion,
                    fechaActualizacion: plan.fechaActualizacion,
                    evaluacionNutricional: plan.evaluacionNutricional?.substring(0, 100) + '...'
                };
            }));

            return {
                total: planesNutricion.length,
                activos: planesNutricion.filter(p => p.estado === 'activo').length,
                finalizados: planesNutricion.filter(p => p.estado === 'finalizado').length,
                cancelados: planesNutricion.filter(p => p.estado === 'cancelado').length,
                estadisticasPorTipo,
                planes: planesConCliente
            };
        } catch (error) {
            throw new Error(`Error al obtener reporte de nutrición: ${error.message}`);
        }
    }

    /**
     * Reporte de contratos
     * @param {Object} filtros - Filtros de búsqueda
     * @returns {Promise<Object>} Reporte de contratos
     */
    async obtenerReporteContratos(filtros = {}) {
        try {
            const query = {};
            
            if (filtros.estado) {
                query.estado = filtros.estado;
            }
            if (filtros.fechaInicio && filtros.fechaFin) {
                query.fechaInicio = {
                    $gte: new Date(filtros.fechaInicio),
                    $lte: new Date(filtros.fechaFin)
                };
            }

            const contratos = await this.contratoRepository.getAll(query, { 
                sort: { fechaInicio: -1 },
                limit: filtros.limit || 100
            });

            // Contratos con información detallada
            const contratosDetallados = await Promise.all(contratos.map(async (contrato) => {
                const cliente = await this.clienteRepository.getById(contrato.clienteId);
                const plan = await this.planRepository.getById(contrato.planId);
                
                const duracionDias = contrato.fechaFin 
                    ? Math.ceil((new Date(contrato.fechaFin) - new Date(contrato.fechaInicio)) / (1000 * 60 * 60 * 24))
                    : Math.ceil((new Date() - new Date(contrato.fechaInicio)) / (1000 * 60 * 60 * 24));

                const diasRestantes = contrato.fechaFin 
                    ? Math.ceil((new Date(contrato.fechaFin) - new Date()) / (1000 * 60 * 60 * 24))
                    : null;

                return {
                    contratoId: contrato.contratoId,
                    cliente: cliente ? cliente.getNombreCompleto() : 'Cliente no encontrado',
                    plan: plan ? plan.nombre : 'Plan no encontrado',
                    estado: contrato.estado,
                    fechaInicio: contrato.fechaInicio,
                    fechaFin: contrato.fechaFin,
                    duracionDias,
                    diasRestantes,
                    precio: contrato.precio,
                    motivoCancelacion: contrato.motivoCancelacion
                };
            }));

            // Estadísticas por estado
            const estadisticasPorEstado = {};
            contratos.forEach(contrato => {
                if (!estadisticasPorEstado[contrato.estado]) {
                    estadisticasPorEstado[contrato.estado] = 0;
                }
                estadisticasPorEstado[contrato.estado]++;
            });

            // Duración promedio por estado
            const duracionPromedio = contratos.length > 0 
                ? contratos.reduce((acc, contrato) => {
                    const inicio = new Date(contrato.fechaInicio);
                    const fin = contrato.fechaFin ? new Date(contrato.fechaFin) : new Date();
                    const duracion = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24));
                    return acc + duracion;
                }, 0) / contratos.length
                : 0;

            return {
                total: contratos.length,
                estadisticasPorEstado,
                duracionPromedio: Math.round(duracionPromedio),
                contratos: contratosDetallados
            };
        } catch (error) {
            throw new Error(`Error al obtener reporte de contratos: ${error.message}`);
        }
    }

    /**
     * Reporte financiero completo
     * @param {Object} filtros - Filtros de búsqueda
     * @returns {Promise<Object>} Reporte financiero
     */
    async obtenerReporteFinanciero(filtros = {}) {
        try {
            const query = {};
            
            if (filtros.fechaInicio && filtros.fechaFin) {
                query.fecha = {
                    $gte: new Date(filtros.fechaInicio),
                    $lte: new Date(filtros.fechaFin)
                };
            }
            if (filtros.tipo) {
                query.tipo = filtros.tipo;
            }

            // Obtener movimientos financieros
            const movimientos = await this.finanzasRepository.getAll(query, { 
                sort: { fecha: -1 },
                limit: filtros.limit || 200
            });

            // Obtener pagos
            const pagos = await this.pagoRepository.getAll(query, { 
                sort: { fechaPago: -1 },
                limit: filtros.limit || 200
            });

            // Calcular totales
            const ingresos = movimientos
                .filter(m => m.tipo === 'ingreso')
                .reduce((acc, m) => acc + m.monto, 0);

            const egresos = movimientos
                .filter(m => m.tipo === 'egreso')
                .reduce((acc, m) => acc + m.monto, 0);

            const pagosRecibidos = pagos
                .filter(p => p.estado === 'pagado')
                .reduce((acc, p) => acc + p.monto, 0);

            const pagosPendientes = pagos
                .filter(p => p.estado === 'pendiente')
                .reduce((acc, p) => acc + p.monto, 0);

            // Agrupar por categoría
            const ingresosPorCategoria = {};
            const egresosPorCategoria = {};

            movimientos.forEach(movimiento => {
                const categoria = movimiento.categoria || 'Sin categoría';
                if (movimiento.tipo === 'ingreso') {
                    ingresosPorCategoria[categoria] = (ingresosPorCategoria[categoria] || 0) + movimiento.monto;
                } else {
                    egresosPorCategoria[categoria] = (egresosPorCategoria[categoria] || 0) + movimiento.monto;
                }
            });

            // Pagos por método
            const pagosPorMetodo = {};
            pagos.forEach(pago => {
                const metodo = pago.metodoPago;
                if (!pagosPorMetodo[metodo]) {
                    pagosPorMetodo[metodo] = {
                        total: 0,
                        pagados: 0,
                        pendientes: 0
                    };
                }
                pagosPorMetodo[metodo].total += pago.monto;
                if (pago.estado === 'pagado') {
                    pagosPorMetodo[metodo].pagados += pago.monto;
                } else {
                    pagosPorMetodo[metodo].pendientes += pago.monto;
                }
            });

            return {
                balance: {
                    ingresos,
                    egresos,
                    balance: ingresos - egresos,
                    pagosRecibidos,
                    pagosPendientes
                },
                movimientos: {
                    total: movimientos.length,
                    ingresos: movimientos.filter(m => m.tipo === 'ingreso').length,
                    egresos: movimientos.filter(m => m.tipo === 'egreso').length
                },
                pagos: {
                    total: pagos.length,
                    pagados: pagos.filter(p => p.estado === 'pagado').length,
                    pendientes: pagos.filter(p => p.estado === 'pendiente').length,
                    retrasados: pagos.filter(p => p.estado === 'retrasado').length,
                    cancelados: pagos.filter(p => p.estado === 'cancelado').length
                },
                ingresosPorCategoria,
                egresosPorCategoria,
                pagosPorMetodo,
                movimientosDetallados: movimientos.map(m => ({
                    finanzasId: m.finanzasId,
                    tipo: m.tipo,
                    descripcion: m.descripcion,
                    monto: m.monto,
                    fecha: m.fecha,
                    categoria: m.categoria,
                    clienteId: m.clienteId
                })),
                pagosDetallados: pagos.map(p => ({
                    pagoId: p.pagoId,
                    clienteId: p.clienteId,
                    monto: p.monto,
                    metodoPago: p.metodoPago,
                    estado: p.estado,
                    fechaPago: p.fechaPago,
                    notas: p.notas
                }))
            };
        } catch (error) {
            throw new Error(`Error al obtener reporte financiero: ${error.message}`);
        }
    }

    /**
     * Obtiene el balance financiero
     * @param {Object} filtros - Filtros opcionales
     * @returns {Promise<Object>} Balance financiero
     */
    async obtenerBalanceFinanciero(filtros = {}) {
        try {
            const query = {};
            
            if (filtros.fechaInicio && filtros.fechaFin) {
                query.fecha = {
                    $gte: new Date(filtros.fechaInicio),
                    $lte: new Date(filtros.fechaFin)
                };
            }

            const movimientos = await this.finanzasRepository.getAll(query);
            const pagos = await this.pagoRepository.getAll(query);

            const ingresos = movimientos
                .filter(m => m.tipo === 'ingreso')
                .reduce((acc, m) => acc + m.monto, 0);

            const egresos = movimientos
                .filter(m => m.tipo === 'egreso')
                .reduce((acc, m) => acc + m.monto, 0);

            const pagosRecibidos = pagos
                .filter(p => p.estado === 'pagado')
                .reduce((acc, p) => acc + p.monto, 0);

            return {
                ingresos,
                egresos,
                balance: ingresos - egresos,
                pagosRecibidos,
                totalMovimientos: movimientos.length,
                totalPagos: pagos.length
            };
        } catch (error) {
            throw new Error(`Error al obtener balance financiero: ${error.message}`);
        }
    }

    /**
     * Calcula la evolución de una métrica específica
     * @param {Array} seguimientos - Array de seguimientos ordenados por fecha
     * @param {string} metrica - Nombre de la métrica (peso, grasaCorporal)
     * @returns {Object} Análisis de evolución
     */
    calcularEvolucion(seguimientos, metrica) {
        if (seguimientos.length < 2) {
            return {
                cambio: 0,
                porcentaje: 0,
                tendencia: 'insuficiente_datos',
                primerValor: seguimientos[0]?.[metrica] || 0,
                ultimoValor: seguimientos[seguimientos.length - 1]?.[metrica] || 0
            };
        }

        const primerValor = seguimientos[0][metrica] || 0;
        const ultimoValor = seguimientos[seguimientos.length - 1][metrica] || 0;
        const cambio = ultimoValor - primerValor;
        const porcentaje = primerValor > 0 ? (cambio / primerValor) * 100 : 0;

        let tendencia = 'sin_cambio';
        if (Math.abs(porcentaje) > 5) {
            tendencia = porcentaje > 0 ? 'aumento' : 'disminucion';
        }

        return {
            cambio,
            porcentaje: Math.round(porcentaje * 100) / 100,
            tendencia,
            primerValor,
            ultimoValor
        };
    }

    /**
     * Calcula la evolución de medidas corporales
     * @param {Array} seguimientos - Array de seguimientos ordenados por fecha
     * @returns {Object} Análisis de evolución de medidas
     */
    calcularEvolucionMedidas(seguimientos) {
        if (seguimientos.length < 2) {
            return {
                cintura: { cambio: 0, porcentaje: 0, tendencia: 'insuficiente_datos' },
                brazo: { cambio: 0, porcentaje: 0, tendencia: 'insuficiente_datos' },
                pecho: { cambio: 0, porcentaje: 0, tendencia: 'insuficiente_datos' }
            };
        }

        return {
            cintura: this.calcularEvolucion(seguimientos, 'cintura'),
            brazo: this.calcularEvolucion(seguimientos, 'brazo'),
            pecho: this.calcularEvolucion(seguimientos, 'pecho')
        };
    }

    /**
     * Exporta datos a formato CSV
     * @param {Array} datos - Datos a exportar
     * @param {Array} campos - Campos a incluir
     * @returns {string} CSV formateado
     */
    exportarCSV(datos, campos) {
        if (datos.length === 0) return '';

        const headers = campos.join(',');
        const rows = datos.map(item => 
            campos.map(campo => {
                let valor = item[campo];
                
                // Manejar diferentes tipos de datos
                if (valor === null || valor === undefined) {
                    valor = '';
                } else if (valor instanceof Date) {
                    valor = dayjs(valor).format('YYYY-MM-DD HH:mm:ss');
                } else if (typeof valor === 'boolean') {
                    valor = valor ? 'Sí' : 'No';
                } else if (typeof valor === 'object') {
                    valor = JSON.stringify(valor);
                } else {
                    valor = valor.toString();
                }
                
                // Escapar comillas y envolver en comillas si contiene comas, comillas o saltos de línea
                if (typeof valor === 'string' && (valor.includes(',') || valor.includes('"') || valor.includes('\n') || valor.includes('\r'))) {
                    return `"${valor.replace(/"/g, '""')}"`;
                }
                
                return valor;
            }).join(',')
        );

        return [headers, ...rows].join('\n');
    }
}

module.exports = ReportesService;
