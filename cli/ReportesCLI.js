const inquirer = require('inquirer');
const chalk = require('chalk');
const ReportesService = require('../services/ReportesService');
const dayjs = require('dayjs');

/**
 * CLI para Reportes y Estadísticas
 * Permite seleccionar reportes por categoría, definir filtros y mostrar resultados
 */
class ReportesCLI {
    constructor(db) {
        this.db = db;
        this.reportesService = new ReportesService(db);
    }

    /**
     * Limpia la pantalla y muestra un header
     */
    limpiarPantalla() {
        console.clear();
        console.log(chalk.blue.bold('\n🏋️  GYMMASTER CLI - Sistema de Gestión de Gimnasio'));
        console.log(chalk.gray('================================================\n'));
    }

    /**
     * Muestra el menú principal de reportes
     */
    async mostrarMenuReportes() {
        this.limpiarPantalla();
        console.log(chalk.blue('📈 REPORTES Y ESTADÍSTICAS'));
        console.log(chalk.gray('================================\n'));

        const opciones = [
            {
                type: 'list',
                name: 'opcion',
                message: chalk.yellow('¿Qué tipo de reporte deseas generar?'),
                choices: [
                    { name: '📊 Estadísticas Generales', value: 'estadisticas' },
                    { name: '👥 Reporte de Clientes', value: 'clientes' },
                    { name: '🏋️ Reporte de Planes', value: 'planes' },
                    { name: '📊 Reporte de Seguimiento', value: 'seguimiento' },
                    { name: '🍎 Reporte de Nutrición', value: 'nutricion' },
                    { name: '📄 Reporte de Contratos', value: 'contratos' },
                    { name: '💰 Reporte Financiero', value: 'financiero' },
                    { name: '📤 Exportar Datos', value: 'exportar' },
                    { name: '🔙 Volver al Menú Principal', value: 'volver' }
                ],
                pageSize: 10 // Asegurar que todas las opciones se muestren
            }
        ];

        const respuesta = await inquirer.prompt(opciones);

        switch (respuesta.opcion) {
            case 'estadisticas':
                await this.mostrarEstadisticasGenerales();
                break;
            case 'clientes':
                await this.mostrarReporteClientes();
                break;
            case 'planes':
                await this.mostrarReportePlanes();
                break;
            case 'seguimiento':
                await this.mostrarReporteSeguimiento();
                break;
            case 'nutricion':
                await this.mostrarReporteNutricion();
                break;
            case 'contratos':
                await this.mostrarReporteContratos();
                break;
            case 'financiero':
                await this.mostrarReporteFinanciero();
                break;
            case 'exportar':
                await this.mostrarMenuExportacion();
                break;
            case 'volver':
                this.limpiarPantalla();
                console.log(chalk.green('✅ Regresando al menú principal...\n'));
                return; // Salir del menú de reportes
        }

        // Volver al menú de reportes solo si no se seleccionó "volver"
        await this.mostrarMenuReportes();
    }

    /**
     * Muestra estadísticas generales del sistema
     */
    async mostrarEstadisticasGenerales() {
        try {
            console.log(chalk.blue('\n📊 ESTADÍSTICAS GENERALES'));
            console.log(chalk.gray('==========================\n'));

            const filtros = await this.solicitarFiltrosFecha();
            const estadisticas = await this.reportesService.obtenerEstadisticasGenerales(filtros);

            // Mostrar estadísticas de clientes
            console.log(chalk.cyan('👥 CLIENTES:'));
            console.log(`   Total: ${chalk.bold(estadisticas.clientes.total)}`);
            console.log(`   Activos: ${chalk.green(estadisticas.clientes.activos)} (${estadisticas.clientes.porcentajeActivos}%)`);
            console.log(`   Inactivos: ${chalk.red(estadisticas.clientes.inactivos)}`);

            // Mostrar estadísticas de planes
            console.log(chalk.cyan('\n🏋️ PLANES DE ENTRENAMIENTO:'));
            console.log(`   Total: ${chalk.bold(estadisticas.planes.total)}`);
            console.log(`   Activos: ${chalk.green(estadisticas.planes.activos)} (${estadisticas.planes.porcentajeActivos}%)`);
            console.log(`   Inactivos: ${chalk.red(estadisticas.planes.inactivos)}`);

            // Mostrar estadísticas de contratos
            console.log(chalk.cyan('\n📄 CONTRATOS:'));
            console.log(`   Total: ${chalk.bold(estadisticas.contratos.total)}`);
            console.log(`   Activos: ${chalk.green(estadisticas.contratos.activos)} (${estadisticas.contratos.porcentajeActivos}%)`);
            console.log(`   Inactivos: ${chalk.red(estadisticas.contratos.inactivos)}`);

            // Mostrar estadísticas de seguimiento
            console.log(chalk.cyan('\n📊 SEGUIMIENTO FÍSICO:'));
            console.log(`   Total de registros: ${chalk.bold(estadisticas.seguimiento.totalRegistros)}`);

            // Mostrar estadísticas de nutrición
            console.log(chalk.cyan('\n🍎 NUTRICIÓN:'));
            console.log(`   Total: ${chalk.bold(estadisticas.nutricion.total)}`);
            console.log(`   Activos: ${chalk.green(estadisticas.nutricion.activos)} (${estadisticas.nutricion.porcentajeActivos}%)`);
            console.log(`   Inactivos: ${chalk.red(estadisticas.nutricion.inactivos)}`);

            // Mostrar balance financiero
            console.log(chalk.cyan('\n💰 BALANCE FINANCIERO:'));
            console.log(`   Ingresos: ${chalk.green('€' + estadisticas.finanzas.ingresos.toLocaleString())}`);
            console.log(`   Egresos: ${chalk.red('€' + estadisticas.finanzas.egresos.toLocaleString())}`);
            console.log(`   Balance: ${chalk.bold('€' + estadisticas.finanzas.balance.toLocaleString())}`);
            console.log(`   Pagos recibidos: ${chalk.green('€' + estadisticas.finanzas.pagosRecibidos.toLocaleString())}`);

            await this.pausar();
        } catch (error) {
            console.log(chalk.red(`❌ Error al obtener estadísticas: ${error.message}`));
            await this.pausar();
        }
    }

    /**
     * Muestra reporte de clientes
     */
    async mostrarReporteClientes() {
        try {
            console.log(chalk.blue('\n👥 REPORTE DE CLIENTES'));
            console.log(chalk.gray('======================\n'));

            const filtros = await this.solicitarFiltrosCliente();
            const reporte = await this.reportesService.obtenerReporteClientes(filtros);

            // Mostrar resumen
            console.log(chalk.cyan('📊 RESUMEN:'));
            console.log(`   Total: ${chalk.bold(reporte.total)}`);
            console.log(`   Activos: ${chalk.green(reporte.activos)}`);
            console.log(`   Inactivos: ${chalk.red(reporte.inactivos)}`);
            console.log(`   Con planes: ${chalk.blue(reporte.conPlanes)}`);
            console.log(`   Sin planes: ${chalk.yellow(reporte.sinPlanes)}`);

            // Mostrar estadísticas por plan
            if (Object.keys(reporte.estadisticasPorPlan).length > 0) {
                console.log(chalk.cyan('\n🏋️ CLIENTES POR PLAN:'));
                Object.entries(reporte.estadisticasPorPlan).forEach(([plan, cantidad]) => {
                    console.log(`   ${plan}: ${chalk.bold(cantidad)} clientes`);
                });
            }

            // Mostrar lista de clientes
            if (reporte.clientes.length > 0) {
                console.log(chalk.cyan('\n👥 LISTA DE CLIENTES:'));
                console.log(chalk.gray('┌─────────────────────────────┬─────────────────────────────────┬─────────────────────────────┬────────────┬────────┐'));
                console.log(
                    chalk.gray('│') + chalk.bold(' ID'.padEnd(25)) + chalk.gray('│') +
                    chalk.bold(' Nombre'.padEnd(31)) + chalk.gray('│') +
                    chalk.bold(' Email'.padEnd(25)) + chalk.gray('│') +
                    chalk.bold(' Estado'.padEnd(10)) + chalk.gray('│') +
                    chalk.bold(' Planes'.padEnd(6)) + chalk.gray('│')
                );
                console.log(chalk.gray('├─────────────────────────────┼─────────────────────────────────┼─────────────────────────────┼────────────┼────────┤'));

                reporte.clientes.forEach(cliente => {
                    const estado = cliente.activo ? chalk.green('Activo') : chalk.red('Inactivo');
                    const idCorto = cliente.clienteId.toString().substring(0, 8) + '...';
                    const nombreCorto = cliente.nombre.length > 30 ? cliente.nombre.substring(0, 27) + '...' : cliente.nombre;
                    const emailCorto = cliente.email.length > 24 ? cliente.email.substring(0, 21) + '...' : cliente.email;
                    
                    console.log(
                        chalk.gray('│') + idCorto.padEnd(25) + chalk.gray('│') +
                        nombreCorto.padEnd(31) + chalk.gray('│') +
                        emailCorto.padEnd(25) + chalk.gray('│') +
                        estado.padEnd(10) + chalk.gray('│') +
                        cliente.cantidadPlanes.toString().padEnd(6) + chalk.gray('│')
                    );
                });
                console.log(chalk.gray('└─────────────────────────────┴─────────────────────────────────┴─────────────────────────────┴────────────┴────────┘'));
            }

            await this.pausar();
        } catch (error) {
            console.log(chalk.red(`❌ Error al obtener reporte de clientes: ${error.message}`));
            await this.pausar();
        }
    }

    /**
     * Muestra reporte de planes
     */
    async mostrarReportePlanes() {
        try {
            console.log(chalk.blue('\n🏋️ REPORTE DE PLANES DE ENTRENAMIENTO'));
            console.log(chalk.gray('=====================================\n'));

            const filtros = await this.solicitarFiltrosPlan();
            const reporte = await this.reportesService.obtenerReportePlanes(filtros);

            // Mostrar resumen
            console.log(chalk.cyan('📊 RESUMEN:'));
            console.log(`   Total: ${chalk.bold(reporte.total)}`);
            console.log(`   Activos: ${chalk.green(reporte.activos)}`);
            console.log(`   Cancelados: ${chalk.red(reporte.cancelados)}`);
            console.log(`   Finalizados: ${chalk.blue(reporte.finalizados)}`);

            // Mostrar lista de planes
            if (reporte.planes.length > 0) {
                console.log(chalk.cyan('\n🏋️ LISTA DE PLANES:'));
                console.log(chalk.gray('┌─────────────────────────────┬─────────────────────────────┬───────────────┬────────────┬──────────┬──────────┬─────────────────┐'));
                console.log(
                    chalk.gray('│') + chalk.bold(' ID'.padEnd(25)) + chalk.gray('│') +
                    chalk.bold(' Nombre'.padEnd(25)) + chalk.gray('│') +
                    chalk.bold(' Nivel'.padEnd(13)) + chalk.gray('│') +
                    chalk.bold(' Estado'.padEnd(10)) + chalk.gray('│') +
                    chalk.bold(' Clientes'.padEnd(8)) + chalk.gray('│') +
                    chalk.bold(' Contratos'.padEnd(8)) + chalk.gray('│') +
                    chalk.bold(' Duración (días)'.padEnd(15)) + chalk.gray('│')
                );
                console.log(chalk.gray('├─────────────────────────────┼─────────────────────────────┼───────────────┼────────────┼──────────┼──────────┼─────────────────┤'));

                reporte.planes.forEach(plan => {
                    const estado = plan.estado === 'activo' ? chalk.green('Activo') : 
                                 plan.estado === 'cancelado' ? chalk.red('Cancelado') : 
                                 chalk.blue('Finalizado');
                    
                    const idCorto = plan.planId.toString().substring(0, 8) + '...';
                    const nombreCorto = plan.nombre.length > 24 ? plan.nombre.substring(0, 21) + '...' : plan.nombre;
                    const duracion = plan.duracionPromedio > 0 ? plan.duracionPromedio.toString() : 'N/A';
                    
                    console.log(
                        chalk.gray('│') + idCorto.padEnd(25) + chalk.gray('│') +
                        nombreCorto.padEnd(25) + chalk.gray('│') +
                        plan.nivel.padEnd(13) + chalk.gray('│') +
                        estado.padEnd(10) + chalk.gray('│') +
                        plan.clientesAsociados.toString().padEnd(8) + chalk.gray('│') +
                        plan.contratosTotal.toString().padEnd(8) + chalk.gray('│') +
                        duracion.padEnd(15) + chalk.gray('│')
                    );
                });
                console.log(chalk.gray('└─────────────────────────────┴─────────────────────────────┴───────────────┴────────────┴──────────┴──────────┴─────────────────┘'));
            }

            await this.pausar();
        } catch (error) {
            console.log(chalk.red(`❌ Error al obtener reporte de planes: ${error.message}`));
            await this.pausar();
        }
    }

    /**
     * Muestra reporte de seguimiento
     */
    async mostrarReporteSeguimiento() {
        try {
            console.log(chalk.blue('\n📊 REPORTE DE SEGUIMIENTO FÍSICO'));
            console.log(chalk.gray('==================================\n'));

            const filtros = await this.solicitarFiltrosSeguimiento();
            const reporte = await this.reportesService.obtenerReporteSeguimiento(filtros);

            // Mostrar resumen
            console.log(chalk.cyan('📊 RESUMEN:'));
            console.log(`   Total de registros: ${chalk.bold(reporte.totalRegistros)}`);
            console.log(`   Clientes con seguimiento: ${chalk.green(reporte.clientesConSeguimiento)}`);

            // Mostrar clientes sin seguimiento reciente
            if (reporte.clientesSinSeguimiento.length > 0) {
                console.log(chalk.yellow('\n⚠️ CLIENTES SIN SEGUIMIENTO RECIENTE:'));
                console.log(chalk.gray('┌─────────────────────────────────┬──────────────────────┬─────────────────────┐'));
                console.log(
                    chalk.gray('│') + chalk.bold(' Cliente'.padEnd(29)) + chalk.gray('│') +
                    chalk.bold(' Último Seguimiento'.padEnd(18)) + chalk.gray('│') +
                    chalk.bold(' Días Sin Seguimiento'.padEnd(19)) + chalk.gray('│')
                );
                console.log(chalk.gray('├─────────────────────────────────┼──────────────────────┼─────────────────────┤'));

                reporte.clientesSinSeguimiento.slice(0, 10).forEach(cliente => {
                    const dias = typeof cliente.diasSinSeguimiento === 'number' 
                        ? cliente.diasSinSeguimiento.toString()
                        : cliente.diasSinSeguimiento;
                    
                    const nombreCorto = cliente.nombre.length > 28 ? cliente.nombre.substring(0, 25) + '...' : cliente.nombre;
                    const fechaCorta = cliente.ultimoSeguimiento.toString().substring(0, 16);
                    
                    console.log(
                        chalk.gray('│') + nombreCorto.padEnd(29) + chalk.gray('│') +
                        fechaCorta.padEnd(18) + chalk.gray('│') +
                        dias.padEnd(19) + chalk.gray('│')
                    );
                });
                console.log(chalk.gray('└─────────────────────────────────┴──────────────────────┴─────────────────────┘'));
            }

            // Mostrar evolución por cliente
            if (Object.keys(reporte.evolucionPorCliente).length > 0) {
                console.log(chalk.cyan('\n📈 EVOLUCIÓN POR CLIENTE:'));
                Object.values(reporte.evolucionPorCliente).slice(0, 5).forEach(evolucion => {
                    console.log(chalk.cyan(`\n👤 ${evolucion.cliente}:`));
                    console.log(`   Registros: ${evolucion.totalRegistros}`);
                    console.log(`   Período: ${dayjs(evolucion.primerRegistro).format('DD/MM/YYYY')} - ${dayjs(evolucion.ultimoRegistro).format('DD/MM/YYYY')}`);
                    
                    // Evolución de peso
                    if (evolucion.evolucionPeso.tendencia !== 'insuficiente_datos') {
                        const peso = evolucion.evolucionPeso;
                        const tendenciaPeso = peso.tendencia === 'aumento' ? chalk.red('↗️ Aumento') :
                                            peso.tendencia === 'disminucion' ? chalk.green('↘️ Disminución') :
                                            chalk.yellow('➡️ Sin cambio');
                        console.log(`   Peso: ${peso.primerValor}kg → ${peso.ultimoValor}kg (${peso.cambio > 0 ? '+' : ''}${peso.cambio}kg) ${tendenciaPeso}`);
                    }
                });
            }

            await this.pausar();
        } catch (error) {
            console.log(chalk.red(`❌ Error al obtener reporte de seguimiento: ${error.message}`));
            await this.pausar();
        }
    }

    /**
     * Muestra reporte de nutrición
     */
    async mostrarReporteNutricion() {
        try {
            console.log(chalk.blue('\n🍎 REPORTE DE NUTRICIÓN'));
            console.log(chalk.gray('========================\n'));

            const filtros = await this.solicitarFiltrosNutricion();
            const reporte = await this.reportesService.obtenerReporteNutricion(filtros);

            // Mostrar resumen
            console.log(chalk.cyan('📊 RESUMEN:'));
            console.log(`   Total: ${chalk.bold(reporte.total)}`);
            console.log(`   Activos: ${chalk.green(reporte.activos)}`);
            console.log(`   Finalizados: ${chalk.blue(reporte.finalizados)}`);
            console.log(`   Cancelados: ${chalk.red(reporte.cancelados)}`);

            // Mostrar estadísticas por tipo
            if (Object.keys(reporte.estadisticasPorTipo).length > 0) {
                console.log(chalk.cyan('\n🍎 PLANES POR TIPO:'));
                Object.entries(reporte.estadisticasPorTipo).forEach(([tipo, stats]) => {
                    console.log(`   ${tipo}:`);
                    console.log(`     Total: ${stats.total}`);
                    console.log(`     Activos: ${chalk.green(stats.activos)}`);
                    console.log(`     Finalizados: ${chalk.blue(stats.finalizados)}`);
                    console.log(`     Cancelados: ${chalk.red(stats.cancelados)}`);
                });
            }

            // Mostrar lista de planes
            if (reporte.planes.length > 0) {
                console.log(chalk.cyan('\n🍎 LISTA DE PLANES NUTRICIONALES:'));
                console.log(chalk.gray('┌─────────────────────────────┬─────────────────────────────┬──────────────────────┬────────────┬─────────────────┐'));
                console.log(
                    chalk.gray('│') + chalk.bold(' ID'.padEnd(25)) + chalk.gray('│') +
                    chalk.bold(' Cliente'.padEnd(25)) + chalk.gray('│') +
                    chalk.bold(' Tipo'.padEnd(18)) + chalk.gray('│') +
                    chalk.bold(' Estado'.padEnd(10)) + chalk.gray('│') +
                    chalk.bold(' Fecha Creación'.padEnd(15)) + chalk.gray('│')
                );
                console.log(chalk.gray('├─────────────────────────────┼─────────────────────────────┼──────────────────────┼────────────┼─────────────────┤'));

                reporte.planes.forEach(plan => {
                    const estado = plan.estado === 'activo' ? chalk.green('Activo') : 
                                 plan.estado === 'finalizado' ? chalk.blue('Finalizado') : 
                                 chalk.red('Cancelado');
                    
                    const idCorto = plan.nutricionId.toString().substring(0, 8) + '...';
                    const clienteCorto = plan.cliente.length > 24 ? plan.cliente.substring(0, 21) + '...' : plan.cliente;
                    const tipoCorto = plan.tipoPlan.length > 18 ? plan.tipoPlan.substring(0, 15) + '...' : plan.tipoPlan;
                    
                    console.log(
                        chalk.gray('│') + idCorto.padEnd(25) + chalk.gray('│') +
                        clienteCorto.padEnd(25) + chalk.gray('│') +
                        tipoCorto.padEnd(18) + chalk.gray('│') +
                        estado.padEnd(10) + chalk.gray('│') +
                        dayjs(plan.fechaCreacion).format('DD/MM/YYYY').padEnd(15) + chalk.gray('│')
                    );
                });
                console.log(chalk.gray('└─────────────────────────────┴─────────────────────────────┴──────────────────────┴────────────┴─────────────────┘'));
            }

            await this.pausar();
        } catch (error) {
            console.log(chalk.red(`❌ Error al obtener reporte de nutrición: ${error.message}`));
            await this.pausar();
        }
    }

    /**
     * Muestra reporte de contratos
     */
    async mostrarReporteContratos() {
        try {
            console.log(chalk.blue('\n📄 REPORTE DE CONTRATOS'));
            console.log(chalk.gray('=======================\n'));

            const filtros = await this.solicitarFiltrosContrato();
            const reporte = await this.reportesService.obtenerReporteContratos(filtros);

            // Mostrar resumen
            console.log(chalk.cyan('📊 RESUMEN:'));
            console.log(`   Total: ${chalk.bold(reporte.total)}`);
            console.log(`   Duración promedio: ${chalk.blue(reporte.duracionPromedio)} días`);

            // Mostrar estadísticas por estado
            if (Object.keys(reporte.estadisticasPorEstado).length > 0) {
                console.log(chalk.cyan('\n📄 CONTRATOS POR ESTADO:'));
                Object.entries(reporte.estadisticasPorEstado).forEach(([estado, cantidad]) => {
                    const color = estado === 'vigente' ? chalk.green : 
                                estado === 'cancelado' ? chalk.red : 
                                chalk.blue;
                    console.log(`   ${estado}: ${color(cantidad)}`);
                });
            }

            // Mostrar lista de contratos
            if (reporte.contratos.length > 0) {
                console.log(chalk.cyan('\n📄 LISTA DE CONTRATOS:'));
                console.log(chalk.gray('┌─────────────────────────────┬─────────────────────────────┬─────────────────────────────┬────────────┬──────────┬─────────────────┐'));
                console.log(
                    chalk.gray('│') + chalk.bold(' ID'.padEnd(25)) + chalk.gray('│') +
                    chalk.bold(' Cliente'.padEnd(25)) + chalk.gray('│') +
                    chalk.bold(' Plan'.padEnd(25)) + chalk.gray('│') +
                    chalk.bold(' Estado'.padEnd(10)) + chalk.gray('│') +
                    chalk.bold(' Duración'.padEnd(8)) + chalk.gray('│') +
                    chalk.bold(' Días Restantes'.padEnd(15)) + chalk.gray('│')
                );
                console.log(chalk.gray('├─────────────────────────────┼─────────────────────────────┼─────────────────────────────┼────────────┼──────────┼─────────────────┤'));

                reporte.contratos.forEach(contrato => {
                    const estado = contrato.estado === 'vigente' ? chalk.green('Vigente') : 
                                 contrato.estado === 'cancelado' ? chalk.red('Cancelado') : 
                                 chalk.blue('Vencido');
                    
                    const diasRestantes = contrato.diasRestantes !== null ? contrato.diasRestantes.toString() : 'N/A';
                    const idCorto = contrato.contratoId.toString().substring(0, 8) + '...';
                    const clienteCorto = contrato.cliente.length > 24 ? contrato.cliente.substring(0, 21) + '...' : contrato.cliente;
                    const planCorto = contrato.plan.length > 24 ? contrato.plan.substring(0, 21) + '...' : contrato.plan;
                    
                    console.log(
                        chalk.gray('│') + idCorto.padEnd(25) + chalk.gray('│') +
                        clienteCorto.padEnd(25) + chalk.gray('│') +
                        planCorto.padEnd(25) + chalk.gray('│') +
                        estado.padEnd(10) + chalk.gray('│') +
                        contrato.duracionDias.toString().padEnd(8) + chalk.gray('│') +
                        diasRestantes.padEnd(15) + chalk.gray('│')
                    );
                });
                console.log(chalk.gray('└─────────────────────────────┴─────────────────────────────┴─────────────────────────────┴────────────┴──────────┴─────────────────┘'));
            }

            await this.pausar();
        } catch (error) {
            console.log(chalk.red(`❌ Error al obtener reporte de contratos: ${error.message}`));
            await this.pausar();
        }
    }

    /**
     * Muestra reporte financiero
     */
    async mostrarReporteFinanciero() {
        try {
            console.log(chalk.blue('\n💰 REPORTE FINANCIERO'));
            console.log(chalk.gray('====================\n'));

            const filtros = await this.solicitarFiltrosFinanciero();
            const reporte = await this.reportesService.obtenerReporteFinanciero(filtros);

            // Mostrar balance
            console.log(chalk.cyan('💰 BALANCE:'));
            console.log(`   Ingresos: ${chalk.green('€' + reporte.balance.ingresos.toLocaleString())}`);
            console.log(`   Egresos: ${chalk.red('€' + reporte.balance.egresos.toLocaleString())}`);
            console.log(`   Balance: ${chalk.bold('€' + reporte.balance.balance.toLocaleString())}`);
            console.log(`   Pagos recibidos: ${chalk.green('€' + reporte.balance.pagosRecibidos.toLocaleString())}`);
            console.log(`   Pagos pendientes: ${chalk.yellow('€' + reporte.balance.pagosPendientes.toLocaleString())}`);

            // Mostrar estadísticas de movimientos
            console.log(chalk.cyan('\n📊 MOVIMIENTOS:'));
            console.log(`   Total: ${chalk.bold(reporte.movimientos.total)}`);
            console.log(`   Ingresos: ${chalk.green(reporte.movimientos.ingresos)}`);
            console.log(`   Egresos: ${chalk.red(reporte.movimientos.egresos)}`);

            // Mostrar estadísticas de pagos
            console.log(chalk.cyan('\n💳 PAGOS:'));
            console.log(`   Total: ${chalk.bold(reporte.pagos.total)}`);
            console.log(`   Pagados: ${chalk.green(reporte.pagos.pagados)}`);
            console.log(`   Pendientes: ${chalk.yellow(reporte.pagos.pendientes)}`);
            console.log(`   Retrasados: ${chalk.red(reporte.pagos.retrasados)}`);
            console.log(`   Cancelados: ${chalk.gray(reporte.pagos.cancelados)}`);

            // Mostrar ingresos por categoría
            if (Object.keys(reporte.ingresosPorCategoria).length > 0) {
                console.log(chalk.cyan('\n💰 INGRESOS POR CATEGORÍA:'));
                Object.entries(reporte.ingresosPorCategoria).forEach(([categoria, monto]) => {
                    console.log(`   ${categoria}: ${chalk.green('€' + monto.toLocaleString())}`);
                });
            }

            // Mostrar egresos por categoría
            if (Object.keys(reporte.egresosPorCategoria).length > 0) {
                console.log(chalk.cyan('\n💸 EGRESOS POR CATEGORÍA:'));
                Object.entries(reporte.egresosPorCategoria).forEach(([categoria, monto]) => {
                    console.log(`   ${categoria}: ${chalk.red('€' + monto.toLocaleString())}`);
                });
            }

            // Mostrar pagos por método
            if (Object.keys(reporte.pagosPorMetodo).length > 0) {
                console.log(chalk.cyan('\n💳 PAGOS POR MÉTODO:'));
                Object.entries(reporte.pagosPorMetodo).forEach(([metodo, stats]) => {
                    console.log(`   ${metodo}:`);
                    console.log(`     Total: €${stats.total.toLocaleString()}`);
                    console.log(`     Pagados: ${chalk.green('€' + stats.pagados.toLocaleString())}`);
                    console.log(`     Pendientes: ${chalk.yellow('€' + stats.pendientes.toLocaleString())}`);
                });
            }

            await this.pausar();
        } catch (error) {
            console.log(chalk.red(`❌ Error al obtener reporte financiero: ${error.message}`));
            await this.pausar();
        }
    }

    /**
     * Muestra menú de exportación
     */
    async mostrarMenuExportacion() {
        console.log(chalk.blue('\n📤 EXPORTAR DATOS'));
        console.log(chalk.gray('=================\n'));

        const opciones = [
            {
                type: 'list',
                name: 'tipo',
                message: chalk.yellow('¿Qué datos deseas exportar?'),
                choices: [
                    { name: '👥 Clientes', value: 'clientes' },
                    { name: '🏋️ Planes', value: 'planes' },
                    { name: '📊 Seguimiento', value: 'seguimiento' },
                    { name: '🍎 Nutrición', value: 'nutricion' },
                    { name: '📄 Contratos', value: 'contratos' },
                    { name: '💰 Finanzas', value: 'financiero' },
                    { name: '🔙 Volver', value: 'volver' }
                ]
            }
        ];

        const respuesta = await inquirer.prompt(opciones);

        if (respuesta.tipo === 'volver') {
            return;
        }

        await this.exportarDatos(respuesta.tipo);
    }

    /**
     * Exporta datos a CSV
     */
    async exportarDatos(tipo) {
        try {
            console.log(chalk.yellow(`\n⏳ Exportando datos de ${tipo}...`));

            let datos = [];
            let campos = [];

            switch (tipo) {
                case 'clientes':
                    const reporteClientes = await this.reportesService.obtenerReporteClientes();
                    datos = reporteClientes.clientes;
                    campos = ['clienteId', 'nombre', 'email', 'activo', 'fechaRegistro', 'cantidadPlanes'];
                    break;
                case 'planes':
                    const reportePlanes = await this.reportesService.obtenerReportePlanes();
                    datos = reportePlanes.planes;
                    campos = ['planId', 'nombre', 'nivel', 'estado', 'fechaCreacion', 'clientesAsociados', 'contratosTotal', 'duracionPromedio'];
                    break;
                case 'seguimiento':
                    const reporteSeguimiento = await this.reportesService.obtenerReporteSeguimiento();
                    datos = Object.values(reporteSeguimiento.evolucionPorCliente);
                    campos = ['cliente', 'totalRegistros', 'primerRegistro', 'ultimoRegistro', 'evolucionPeso', 'evolucionGrasa'];
                    break;
                case 'nutricion':
                    const reporteNutricion = await this.reportesService.obtenerReporteNutricion();
                    datos = reporteNutricion.planes;
                    campos = ['nutricionId', 'cliente', 'tipoPlan', 'estado', 'fechaCreacion', 'fechaActualizacion'];
                    break;
                case 'contratos':
                    const reporteContratos = await this.reportesService.obtenerReporteContratos();
                    datos = reporteContratos.contratos;
                    campos = ['contratoId', 'cliente', 'plan', 'estado', 'fechaInicio', 'fechaFin', 'duracionDias', 'diasRestantes'];
                    break;
                case 'financiero':
                    const reporteFinanciero = await this.reportesService.obtenerReporteFinanciero();
                    datos = reporteFinanciero.movimientosDetallados;
                    campos = ['finanzasId', 'tipo', 'descripcion', 'monto', 'fecha', 'categoria', 'clienteId'];
                    break;
                default:
                    console.log(chalk.red('❌ Tipo de exportación no soportado'));
                    return;
            }

            const csv = this.reportesService.exportarCSV(datos, campos);
            const filename = `${tipo}_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.csv`;
            
            // Crear carpeta de exportaciones si no existe
            const fs = require('fs');
            const path = require('path');
            const exportDir = path.join(process.cwd(), 'exports');
            
            if (!fs.existsSync(exportDir)) {
                fs.mkdirSync(exportDir, { recursive: true });
                console.log(chalk.blue(`📁 Carpeta de exportaciones creada: ${exportDir}`));
            }
            
            // Guardar archivo CSV
            const filePath = path.join(exportDir, filename);
            fs.writeFileSync(filePath, csv, 'utf8');
            
            console.log(chalk.green(`✅ Datos exportados exitosamente!`));
            console.log(chalk.blue(`📁 Ubicación: ${filePath}`));
            console.log(chalk.gray(`📊 Total de registros: ${datos.length}`));
            console.log(chalk.gray(`📁 Campos: ${campos.join(', ')}`));
            console.log(chalk.gray(`💾 Tamaño del archivo: ${(csv.length / 1024).toFixed(2)} KB`));
            
            // Mostrar opciones adicionales
            const { abrirCarpeta } = await inquirer.prompt([{
                type: 'confirm',
                name: 'abrirCarpeta',
                message: '📂 ¿Desea abrir la carpeta de exportaciones?',
                default: false
            }]);
            
            if (abrirCarpeta) {
                const { exec } = require('child_process');
                const os = require('os');
                
                let comando;
                if (os.platform() === 'win32') {
                    comando = `explorer "${exportDir}"`;
                } else if (os.platform() === 'darwin') {
                    comando = `open "${exportDir}"`;
                } else {
                    comando = `xdg-open "${exportDir}"`;
                }
                
                exec(comando, (error) => {
                    if (error) {
                        console.log(chalk.yellow(`⚠️ No se pudo abrir la carpeta automáticamente. Ruta: ${exportDir}`));
                    } else {
                        console.log(chalk.green(`📂 Carpeta abierta: ${exportDir}`));
                    }
                });
            }

            await this.pausar();
        } catch (error) {
            console.log(chalk.red(`❌ Error al exportar datos: ${error.message}`));
            await this.pausar();
        }
    }

    // Métodos auxiliares para solicitar filtros
    async solicitarFiltrosFecha() {
        const { incluirFechas } = await inquirer.prompt([{
            type: 'confirm',
            name: 'incluirFechas',
            message: '📅 ¿Desea filtrar por fechas?',
            default: false
        }]);

        if (!incluirFechas) return {};

        const { tipoFechas } = await inquirer.prompt([{
            type: 'list',
            name: 'tipoFechas',
            message: '🗓️ ¿Cómo desea seleccionar las fechas?',
            choices: [
                { name: '📅 Opciones predefinidas (recomendado)', value: 'predefinidas' },
                { name: '✏️ Ingresar fechas manualmente', value: 'manual' }
            ]
        }]);

        if (tipoFechas === 'predefinidas') {
            return await this.seleccionarFechasPredefinidas();
        } else {
            return await this.ingresarFechasPersonalizadas();
        }
    }

    /**
     * Permite seleccionar fechas predefinidas
     * @returns {Promise<Object>} Filtros de fecha
     */
    async seleccionarFechasPredefinidas() {
        const opciones = [
            { name: '📅 Este mes', value: 'este_mes' },
            { name: '📅 Mes pasado', value: 'mes_pasado' },
            { name: '📅 Últimos 30 días', value: 'ultimos_30' },
            { name: '📅 Últimos 90 días', value: 'ultimos_90' },
            { name: '📅 Últimos 6 meses', value: 'ultimos_6_meses' },
            { name: '📅 Este año', value: 'este_año' },
            { name: '📅 Año pasado', value: 'año_pasado' }
        ];

        const { periodo } = await inquirer.prompt([{
            type: 'list',
            name: 'periodo',
            message: '📅 Seleccione el período:',
            choices: opciones
        }]);

        const hoy = dayjs();
        let fechaInicio, fechaFin;

        switch (periodo) {
            case 'este_mes':
                fechaInicio = hoy.startOf('month').format('YYYY-MM-DD');
                fechaFin = hoy.endOf('month').format('YYYY-MM-DD');
                break;
            case 'mes_pasado':
                fechaInicio = hoy.subtract(1, 'month').startOf('month').format('YYYY-MM-DD');
                fechaFin = hoy.subtract(1, 'month').endOf('month').format('YYYY-MM-DD');
                break;
            case 'ultimos_30':
                fechaInicio = hoy.subtract(30, 'day').format('YYYY-MM-DD');
                fechaFin = hoy.format('YYYY-MM-DD');
                break;
            case 'ultimos_90':
                fechaInicio = hoy.subtract(90, 'day').format('YYYY-MM-DD');
                fechaFin = hoy.format('YYYY-MM-DD');
                break;
            case 'ultimos_6_meses':
                fechaInicio = hoy.subtract(6, 'month').format('YYYY-MM-DD');
                fechaFin = hoy.format('YYYY-MM-DD');
                break;
            case 'este_año':
                fechaInicio = hoy.startOf('year').format('YYYY-MM-DD');
                fechaFin = hoy.endOf('year').format('YYYY-MM-DD');
                break;
            case 'año_pasado':
                fechaInicio = hoy.subtract(1, 'year').startOf('year').format('YYYY-MM-DD');
                fechaFin = hoy.subtract(1, 'year').endOf('year').format('YYYY-MM-DD');
                break;
        }

        console.log(chalk.blue(`📅 Período seleccionado: ${fechaInicio} a ${fechaFin}`));
        return { fechaInicio, fechaFin };
    }

    /**
     * Permite ingresar fechas personalizadas
     * @returns {Promise<Object>} Filtros de fecha
     */
    async ingresarFechasPersonalizadas() {
        const { fechaInicio, fechaFin } = await inquirer.prompt([
            {
                type: 'input',
                name: 'fechaInicio',
                message: '📅 Fecha de inicio (YYYY-MM-DD):',
                validate: (input) => {
                    if (!input) return 'Fecha de inicio es obligatoria';
                    if (!dayjs(input).isValid()) return 'Formato de fecha inválido';
                    return true;
                }
            },
            {
                type: 'input',
                name: 'fechaFin',
                message: '📅 Fecha de fin (YYYY-MM-DD):',
                validate: (input) => {
                    if (!input) return 'Fecha de fin es obligatoria';
                    if (!dayjs(input).isValid()) return 'Formato de fecha inválido';
                    return true;
                }
            }
        ]);

        return { fechaInicio, fechaFin };
    }

    async solicitarFiltrosCliente() {
        const { incluirFiltros } = await inquirer.prompt([{
            type: 'confirm',
            name: 'incluirFiltros',
            message: '¿Desea aplicar filtros adicionales?',
            default: false
        }]);

        if (!incluirFiltros) return {};

        const filtros = {};
        
        const { activo } = await inquirer.prompt([{
            type: 'list',
            name: 'activo',
            message: 'Estado del cliente:',
            choices: [
                { name: 'Todos', value: undefined },
                { name: 'Solo activos', value: true },
                { name: 'Solo inactivos', value: false }
            ]
        }]);

        if (activo !== undefined) {
            filtros.activo = activo;
        }

        return filtros;
    }

    async solicitarFiltrosPlan() {
        const { incluirFiltros } = await inquirer.prompt([{
            type: 'confirm',
            name: 'incluirFiltros',
            message: '¿Desea aplicar filtros adicionales?',
            default: false
        }]);

        if (!incluirFiltros) return {};

        const { estado } = await inquirer.prompt([{
            type: 'list',
            name: 'estado',
            message: 'Estado del plan:',
            choices: [
                { name: 'Todos', value: undefined },
                { name: 'Activos', value: 'activo' },
                { name: 'Cancelados', value: 'cancelado' },
                { name: 'Finalizados', value: 'finalizado' }
            ]
        }]);

        return estado ? { estado } : {};
    }

    async solicitarFiltrosSeguimiento() {
        return await this.solicitarFiltrosFecha();
    }

    async solicitarFiltrosNutricion() {
        const { incluirFiltros } = await inquirer.prompt([{
            type: 'confirm',
            name: 'incluirFiltros',
            message: '¿Desea aplicar filtros adicionales?',
            default: false
        }]);

        if (!incluirFiltros) return {};

        const filtros = {};

        const { estado } = await inquirer.prompt([{
            type: 'list',
            name: 'estado',
            message: 'Estado del plan nutricional:',
            choices: [
                { name: 'Todos', value: undefined },
                { name: 'Activos', value: 'activo' },
                { name: 'Finalizados', value: 'finalizado' },
                { name: 'Cancelados', value: 'cancelado' }
            ]
        }]);

        if (estado) filtros.estado = estado;

        return filtros;
    }

    async solicitarFiltrosContrato() {
        return await this.solicitarFiltrosFecha();
    }

    async solicitarFiltrosFinanciero() {
        return await this.solicitarFiltrosFecha();
    }

    /**
     * Pausa la ejecución hasta que el usuario presione Enter
     */
    async pausar() {
        console.log(chalk.gray('\n' + '─'.repeat(50)));
        await inquirer.prompt([{
            type: 'input',
            name: 'continuar',
            message: chalk.cyan('Presiona Enter para continuar...')
        }]);
    }
}

module.exports = ReportesCLI;
