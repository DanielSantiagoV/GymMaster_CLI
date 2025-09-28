const inquirer = require('inquirer');
const chalk = require('chalk');
const dayjs = require('dayjs');
const FinanzasService = require('../services/FinanzasService');
const { Pago } = require('../models');

/**
 * CLI para gestión financiera
 * Interfaz de usuario para manejar pagos y movimientos financieros
 */
class FinanzasCLI {
    constructor(db) {
        this.finanzasService = new FinanzasService(db);
    }

    /**
     * Muestra el menú principal de finanzas
     */
    async mostrarMenu() {
        console.log(chalk.blue.bold('\n💰 === GESTIÓN FINANCIERA === 💰\n'));

        const opciones = [
            { name: '💳 Registrar nuevo pago', value: 'registrar' },
            { name: '⏳ Ver pagos pendientes', value: 'pendientes' },
            { name: '⚠️ Ver pagos retrasados', value: 'retrasados' },
            { name: '🚨 Ver pagos vencidos', value: 'vencidos' },
            { name: '✅ Marcar pago como pagado', value: 'marcar_pagado' },
            { name: '⏰ Marcar pago como retrasado', value: 'marcar_retrasado' },
            { name: '❌ Marcar pago como cancelado', value: 'marcar_cancelado' },
            { name: '📊 Ver balance por fechas', value: 'balance_fechas' },
            { name: '📈 Ver estadísticas financieras', value: 'estadisticas' },
            { name: '📅 Ver reporte mensual', value: 'reporte_mensual' },
            { name: '🔔 Ver alertas de pagos', value: 'alertas' },
            { name: '🔍 Buscar pagos', value: 'buscar' },
            { name: '🕒 Ver pagos recientes', value: 'recientes' },
            { name: '🔙 Volver al menú principal', value: 'volver' }
        ];

        const respuesta = await inquirer.prompt([{
            type: 'list',
            name: 'opcion',
            message: 'Seleccione una opción:',
            choices: opciones
        }]);

        await this.procesarOpcion(respuesta.opcion);
    }

    /**
     * Procesa la opción seleccionada
     * @param {string} opcion - Opción seleccionada
     */
    async procesarOpcion(opcion) {
        try {
            switch (opcion) {
                case 'registrar':
                    await this.registrarPago();
                    break;
                case 'pendientes':
                    await this.verPagosPendientes();
                    break;
                case 'retrasados':
                    await this.verPagosRetrasados();
                    break;
                case 'vencidos':
                    await this.verPagosVencidos();
                    break;
                case 'marcar_pagado':
                    await this.marcarPagoComoPagado();
                    break;
                case 'marcar_retrasado':
                    await this.marcarPagoComoRetrasado();
                    break;
                case 'marcar_cancelado':
                    await this.marcarPagoComoCancelado();
                    break;
                case 'balance_fechas':
                    await this.verBalancePorFechas();
                    break;
                case 'estadisticas':
                    await this.verEstadisticas();
                    break;
                case 'reporte_mensual':
                    await this.verReporteMensual();
                    break;
                case 'alertas':
                    await this.verAlertas();
                    break;
                case 'buscar':
                    await this.buscarPagos();
                    break;
                case 'recientes':
                    await this.verPagosRecientes();
                    break;
                case 'volver':
                    return;
                default:
                    console.log(chalk.red('Opción no válida'));
            }
        } catch (error) {
            console.log(chalk.red(`Error: ${error.message}`));
        }

        // Volver al menú después de cada operación
        if (opcion !== 'volver') {
            await this.mostrarMenu();
        }
    }

    /**
     * Registra un nuevo pago
     */
    async registrarPago() {
        console.log(chalk.blue.bold('\n💳 === REGISTRAR NUEVO PAGO === 💳\n'));

        // Primero preguntar si quiere buscar cliente por nombre o usar ID
        const { buscarPorNombre } = await inquirer.prompt([{
            type: 'confirm',
            name: 'buscarPorNombre',
            message: '🔍 ¿Desea buscar el cliente por nombre?',
            default: false
        }]);

        let clienteId = null;
        if (buscarPorNombre) {
            clienteId = await this.buscarClientePorNombre();
        }

        const preguntas = [
            {
                type: 'list',
                name: 'tipoMovimiento',
                message: 'Tipo de movimiento:',
                choices: [
                    { name: '💰 Ingreso', value: 'ingreso' },
                    { name: '💸 Egreso', value: 'egreso' }
                ]
            },
            {
                type: 'number',
                name: 'monto',
                message: 'Monto del pago:',
                validate: (input) => {
                    if (isNaN(input) || input <= 0) {
                        return 'El monto debe ser un número positivo';
                    }
                    return true;
                }
            },
            {
                type: 'list',
                name: 'metodoPago',
                message: 'Método de pago:',
                choices: [
                    { name: '💵 Efectivo', value: 'efectivo' },
                    { name: '🏦 Transferencia', value: 'transferencia' },
                    { name: '💳 Tarjeta', value: 'tarjeta' },
                    { name: '📄 Cheque', value: 'cheque' },
                    { name: '🔧 Otro', value: 'otro' }
                ]
            },
            {
                type: 'list',
                name: 'estado',
                message: 'Estado del pago:',
                choices: [
                    { name: '✅ Pagado', value: 'pagado' },
                    { name: '⏳ Pendiente', value: 'pendiente' },
                    { name: '⚠️ Retrasado', value: 'retrasado' },
                    { name: '❌ Cancelado', value: 'cancelado' }
                ]
            },
            {
                type: 'input',
                name: 'clienteId',
                message: clienteId ? `👤 Cliente seleccionado: ${clienteId}` : '👤 ID del cliente (opcional, presione Enter para omitir):',
                default: clienteId || '',
                filter: (input) => input.trim() || null,
                validate: (input) => {
                    if (!input || input.trim() === '') {
                        return true; // Campo opcional
                    }
                    // Validar que sea un ObjectId válido
                    const ObjectId = require('mongodb').ObjectId;
                    if (!ObjectId.isValid(input.trim())) {
                        return '❌ ID del cliente debe ser un ObjectId válido (24 caracteres hexadecimales)';
                    }
                    return true;
                }
            },
            {
                type: 'input',
                name: 'contratoId',
                message: '📄 ID del contrato (opcional, presione Enter para omitir):',
                filter: (input) => input.trim() || null,
                validate: (input) => {
                    if (!input || input.trim() === '') {
                        return true; // Campo opcional
                    }
                    // Validar que sea un ObjectId válido
                    const ObjectId = require('mongodb').ObjectId;
                    if (!ObjectId.isValid(input.trim())) {
                        return '❌ ID del contrato debe ser un ObjectId válido (24 caracteres hexadecimales)';
                    }
                    return true;
                }
            },
            {
                type: 'input',
                name: 'referencia',
                message: '🔗 Referencia del pago (opcional, presione Enter para omitir):',
                filter: (input) => input.trim() || null
            },
            {
                type: 'input',
                name: 'notas',
                message: '📝 Notas del pago (opcional, presione Enter para omitir):',
                filter: (input) => input.trim() || null
            }
        ];

        const respuestas = await inquirer.prompt(preguntas);

        try {
            const pagoData = {
                monto: respuestas.monto,
                metodoPago: respuestas.metodoPago,
                estado: respuestas.estado,
                tipoMovimiento: respuestas.tipoMovimiento,
                clienteId: respuestas.clienteId,
                contratoId: respuestas.contratoId,
                referencia: respuestas.referencia,
                notas: respuestas.notas
            };

            const pagoId = await this.finanzasService.registrarPago(pagoData);
            console.log(chalk.green(`\n✅ 💳 Pago registrado exitosamente con ID: ${pagoId}`));
        } catch (error) {
            console.log(chalk.red(`\n❌ Error al registrar pago: ${error.message}`));
            console.log(chalk.yellow('\n💡 Consejos:'));
            console.log(chalk.yellow('• Los IDs de cliente y contrato deben ser ObjectIds válidos (24 caracteres hexadecimales)'));
            console.log(chalk.yellow('• Puedes omitir los campos opcionales presionando Enter'));
            console.log(chalk.yellow('• Verifica que el cliente y contrato existan en el sistema'));
        }
    }

    /**
     * Muestra pagos pendientes
     */
    async verPagosPendientes() {
        console.log(chalk.blue.bold('\n⏳ === PAGOS PENDIENTES === ⏳\n'));

        try {
            const pagos = await this.finanzasService.obtenerPagosPendientes({ limit: 20 });
            
            if (pagos.length === 0) {
                console.log(chalk.yellow('📭 No hay pagos pendientes'));
                return;
            }

            await this.mostrarTablaPagos(pagos);
        } catch (error) {
            console.log(chalk.red(`Error al obtener pagos pendientes: ${error.message}`));
        }
    }

    /**
     * Muestra pagos retrasados
     */
    async verPagosRetrasados() {
        console.log(chalk.blue.bold('\n⚠️ === PAGOS RETRASADOS === ⚠️\n'));

        try {
            const pagos = await this.finanzasService.obtenerPagosRetrasados({ limit: 20 });
            
            if (pagos.length === 0) {
                console.log(chalk.yellow('📭 No hay pagos retrasados'));
                return;
            }

            await this.mostrarTablaPagos(pagos);
        } catch (error) {
            console.log(chalk.red(`Error al obtener pagos retrasados: ${error.message}`));
        }
    }

    /**
     * Muestra pagos vencidos
     */
    async verPagosVencidos() {
        console.log(chalk.blue.bold('\n🚨 === PAGOS VENCIDOS === 🚨\n'));

        try {
            const pagos = await this.finanzasService.obtenerPagosVencidos(new Date(), { limit: 20 });
            
            if (pagos.length === 0) {
                console.log(chalk.yellow('📭 No hay pagos vencidos'));
                return;
            }

            await this.mostrarTablaPagos(pagos);
        } catch (error) {
            console.log(chalk.red(`Error al obtener pagos vencidos: ${error.message}`));
        }
    }

    /**
     * Marca un pago como pagado
     */
    async marcarPagoComoPagado() {
        console.log(chalk.blue.bold('\n✅ === MARCAR PAGO COMO PAGADO === ✅\n'));

        try {
            // Primero mostrar pagos pendientes para que el usuario pueda elegir
            const { mostrarPagos } = await inquirer.prompt([{
                type: 'confirm',
                name: 'mostrarPagos',
                message: '📋 ¿Desea ver los pagos pendientes disponibles?',
                default: true
            }]);

            let pagoId = null;
            
            if (mostrarPagos) {
                pagoId = await this.seleccionarPagoPendiente();
            }

            if (!pagoId) {
                const { pagoIdInput } = await inquirer.prompt([{
                    type: 'input',
                    name: 'pagoIdInput',
                    message: 'ID del pago a marcar como pagado:',
                    validate: (input) => input.trim() ? true : 'ID del pago es obligatorio'
                }]);
                pagoId = pagoIdInput.trim();
            }

            const { referencia } = await inquirer.prompt([{
                type: 'input',
                name: 'referencia',
                message: '🔗 Referencia del pago (opcional):',
                filter: (input) => input.trim() || null
            }]);

            const { notas } = await inquirer.prompt([{
                type: 'input',
                name: 'notas',
                message: '📝 Notas adicionales (opcional):',
                filter: (input) => input.trim() || null
            }]);

            const actualizado = await this.finanzasService.marcarPagoComoPagado(pagoId, referencia, notas);
            
            if (actualizado) {
                console.log(chalk.green('\n✅ 💳 Pago marcado como pagado exitosamente'));
            } else {
                console.log(chalk.red('\n❌ No se pudo actualizar el pago'));
            }
        } catch (error) {
            console.log(chalk.red(`\n❌ Error al marcar pago como pagado: ${error.message}`));
            console.log(chalk.yellow('\n💡 Consejos:'));
            console.log(chalk.yellow('• Verifique que el ID del pago sea correcto'));
            console.log(chalk.yellow('• Use la opción "Ver pagos pendientes" para obtener IDs válidos'));
            console.log(chalk.yellow('• Asegúrese de que el pago no esté ya marcado como pagado'));
        }
    }

    /**
     * Marca un pago como retrasado
     */
    async marcarPagoComoRetrasado() {
        console.log(chalk.blue.bold('\n⏰ === MARCAR PAGO COMO RETRASADO === ⏰\n'));

        try {
            // Primero mostrar pagos pendientes para que el usuario pueda elegir
            const { mostrarPagos } = await inquirer.prompt([{
                type: 'confirm',
                name: 'mostrarPagos',
                message: '📋 ¿Desea ver los pagos pendientes disponibles?',
                default: true
            }]);

            let pagoId = null;
            
            if (mostrarPagos) {
                pagoId = await this.seleccionarPagoPendiente();
            }

            if (!pagoId) {
                const { pagoIdInput } = await inquirer.prompt([{
                    type: 'input',
                    name: 'pagoIdInput',
                    message: 'ID del pago a marcar como retrasado:',
                    validate: (input) => input.trim() ? true : 'ID del pago es obligatorio'
                }]);
                pagoId = pagoIdInput.trim();
            }

            const { notas } = await inquirer.prompt([{
                type: 'input',
                name: 'notas',
                message: '📝 Notas sobre el retraso (opcional):',
                filter: (input) => input.trim() || null
            }]);

            const actualizado = await this.finanzasService.marcarPagoComoRetrasado(pagoId, notas);
            
            if (actualizado) {
                console.log(chalk.green('\n⏰ ⚠️ Pago marcado como retrasado exitosamente'));
            } else {
                console.log(chalk.red('\n❌ No se pudo actualizar el pago'));
            }
        } catch (error) {
            console.log(chalk.red(`\n❌ Error al marcar pago como retrasado: ${error.message}`));
            console.log(chalk.yellow('\n💡 Consejos:'));
            console.log(chalk.yellow('• Verifique que el ID del pago sea correcto'));
            console.log(chalk.yellow('• Use la opción "Ver pagos pendientes" para obtener IDs válidos'));
        }
    }

    /**
     * Marca un pago como cancelado
     */
    async marcarPagoComoCancelado() {
        console.log(chalk.blue.bold('\n❌ === MARCAR PAGO COMO CANCELADO === ❌\n'));

        try {
            // Primero mostrar pagos pendientes para que el usuario pueda elegir
            const { mostrarPagos } = await inquirer.prompt([{
                type: 'confirm',
                name: 'mostrarPagos',
                message: '📋 ¿Desea ver los pagos pendientes disponibles?',
                default: true
            }]);

            let pagoId = null;
            
            if (mostrarPagos) {
                pagoId = await this.seleccionarPagoPendiente();
            }

            if (!pagoId) {
                const { pagoIdInput } = await inquirer.prompt([{
                    type: 'input',
                    name: 'pagoIdInput',
                    message: 'ID del pago a marcar como cancelado:',
                    validate: (input) => input.trim() ? true : 'ID del pago es obligatorio'
                }]);
                pagoId = pagoIdInput.trim();
            }

            const { motivo } = await inquirer.prompt([{
                type: 'input',
                name: 'motivo',
                message: '📝 Motivo de la cancelación:',
                validate: (input) => input.trim() ? true : 'Motivo es obligatorio'
            }]);

            const actualizado = await this.finanzasService.marcarPagoComoCancelado(pagoId, motivo);
            
            if (actualizado) {
                console.log(chalk.green('\n❌ 💳 Pago marcado como cancelado exitosamente'));
            } else {
                console.log(chalk.red('\n❌ No se pudo actualizar el pago'));
            }
        } catch (error) {
            console.log(chalk.red(`\n❌ Error al marcar pago como cancelado: ${error.message}`));
            console.log(chalk.yellow('\n💡 Consejos:'));
            console.log(chalk.yellow('• Verifique que el ID del pago sea correcto'));
            console.log(chalk.yellow('• Use la opción "Ver pagos pendientes" para obtener IDs válidos'));
        }
    }

    /**
     * Muestra balance por fechas
     */
    async verBalancePorFechas() {
        console.log(chalk.blue.bold('\n📊 === BALANCE POR FECHAS === 📊\n'));

        try {
            // Preguntar si quiere usar fechas predefinidas o personalizadas
            const { tipoFechas } = await inquirer.prompt([{
                type: 'list',
                name: 'tipoFechas',
                message: '📅 ¿Cómo desea seleccionar las fechas?',
                choices: [
                    { name: '📅 Usar fechas predefinidas (recomendado)', value: 'predefinidas' },
                    { name: '✏️ Ingresar fechas personalizadas', value: 'personalizadas' }
                ]
            }]);

            let fechaInicio, fechaFin;

            if (tipoFechas === 'predefinidas') {
                const fechas = await this.seleccionarFechasPredefinidas();
                fechaInicio = fechas.fechaInicio;
                fechaFin = fechas.fechaFin;
            } else {
                const fechas = await this.ingresarFechasPersonalizadas();
                fechaInicio = fechas.fechaInicio;
                fechaFin = fechas.fechaFin;
            }

            const { clienteId } = await inquirer.prompt([{
                type: 'input',
                name: 'clienteId',
                message: '👤 ID del cliente (opcional, presione Enter para omitir):',
                filter: (input) => input.trim() || null
            }]);

            const balance = await this.finanzasService.obtenerBalancePorFechas(fechaInicio, fechaFin, clienteId);

            console.log(chalk.green('\n📊 💰 BALANCE DEL PERÍODO:'));
            console.log(chalk.blue(`📅 📆 Período: ${dayjs(fechaInicio).format('DD/MM/YYYY')} - ${dayjs(fechaFin).format('DD/MM/YYYY')}`));
            console.log(chalk.green(`💰 💵 Total Ingresos: ${balance.totalIngresos.toFixed(2)} €`));
            console.log(chalk.red(`💸 💳 Total Egresos: ${balance.totalEgresos.toFixed(2)} €`));
            console.log(chalk.bold(`📈 📊 Balance: ${balance.balance.toFixed(2)} €`));
            console.log(chalk.blue(`📋 📄 Total Pagos: ${balance.cantidadPagos}`));
            console.log(chalk.green(`✅ 💰 Ingresos: ${balance.cantidadIngresos}`));
            console.log(chalk.red(`❌ 💸 Egresos: ${balance.cantidadEgresos}`));
        } catch (error) {
            console.log(chalk.red(`Error al obtener balance: ${error.message}`));
        }
    }

    /**
     * Muestra estadísticas financieras
     */
    async verEstadisticas() {
        console.log(chalk.blue.bold('\n📈 === ESTADÍSTICAS FINANCIERAS === 📈\n'));

        try {
            const { incluirFechas } = await inquirer.prompt([{
                type: 'confirm',
                name: 'incluirFechas',
                message: '📅 ¿Incluir filtro de fechas?',
                default: false
            }]);

            let fechaInicio = null;
            let fechaFin = null;

            if (incluirFechas) {
                // Preguntar si quiere usar fechas predefinidas o personalizadas
                const { tipoFechas } = await inquirer.prompt([{
                    type: 'list',
                    name: 'tipoFechas',
                    message: '📅 ¿Cómo desea seleccionar las fechas?',
                    choices: [
                        { name: '📅 Usar fechas predefinidas (recomendado)', value: 'predefinidas' },
                        { name: '✏️ Ingresar fechas personalizadas', value: 'personalizadas' }
                    ]
                }]);

                if (tipoFechas === 'predefinidas') {
                    const fechas = await this.seleccionarFechasPredefinidas();
                    fechaInicio = fechas.fechaInicio;
                    fechaFin = fechas.fechaFin;
                } else {
                    const fechas = await this.ingresarFechasPersonalizadas();
                    fechaInicio = fechas.fechaInicio;
                    fechaFin = fechas.fechaFin;
                }
            }

            const estadisticas = await this.finanzasService.obtenerEstadisticasFinancieras(fechaInicio, fechaFin);

            console.log(chalk.green('\n📊 💳 ESTADÍSTICAS DE PAGOS:'));
            console.log(chalk.green(`💰 💵 Total Ingresos: ${estadisticas.pagos.totalIngresos.toFixed(2)} €`));
            console.log(chalk.red(`💸 💳 Total Egresos: ${estadisticas.pagos.totalEgresos.toFixed(2)} €`));
            console.log(chalk.bold(`📈 📊 Balance: ${estadisticas.pagos.balance.toFixed(2)} €`));
            console.log(chalk.blue(`📋 📄 Total Pagos: ${estadisticas.pagos.cantidadPagos}`));
            console.log(chalk.green(`✅ 💳 Pagos Pagados: ${estadisticas.pagos.pagosPagados}`));
            console.log(chalk.yellow(`⏳ ⏰ Pagos Pendientes: ${estadisticas.pagos.pagosPendientes}`));
            console.log(chalk.red(`⚠️ 🚨 Pagos Retrasados: ${estadisticas.pagos.pagosRetrasados}`));
            console.log(chalk.gray(`❌ 🚫 Pagos Cancelados: ${estadisticas.pagos.pagosCancelados}`));
            console.log(chalk.blue(`📊 📈 Monto Promedio: ${estadisticas.pagos.montoPromedio.toFixed(2)} €`));
            console.log(chalk.green(`📈 ⬆️ Monto Máximo: ${estadisticas.pagos.montoMaximo.toFixed(2)} €`));
            console.log(chalk.red(`📉 ⬇️ Monto Mínimo: ${estadisticas.pagos.montoMinimo.toFixed(2)} €`));

            console.log(chalk.green('\n📊 💰 ESTADÍSTICAS DE MOVIMIENTOS:'));
            console.log(chalk.green(`💰 💵 Total Ingresos: ${estadisticas.movimientos.totalIngresos.toFixed(2)} €`));
            console.log(chalk.red(`💸 💳 Total Egresos: ${estadisticas.movimientos.totalEgresos.toFixed(2)} €`));
            console.log(chalk.bold(`📈 📊 Balance: ${estadisticas.movimientos.balance.toFixed(2)} €`));
            console.log(chalk.blue(`📋 📄 Total Movimientos: ${estadisticas.movimientos.cantidadMovimientos}`));

            console.log(chalk.bold('\n🎯 💰 BALANCE TOTAL:'));
            console.log(chalk.bold(`💰 💵 Balance General: ${estadisticas.balanceTotal.toFixed(2)} €`));
        } catch (error) {
            console.log(chalk.red(`Error al obtener estadísticas: ${error.message}`));
        }
    }

    /**
     * Muestra reporte mensual
     */
    async verReporteMensual() {
        console.log(chalk.blue.bold('\n📅 === REPORTE MENSUAL === 📅\n'));

        try {
            // Preguntar si quiere usar fechas predefinidas o personalizadas
            const { tipoSeleccion } = await inquirer.prompt([{
                type: 'list',
                name: 'tipoSeleccion',
                message: '📅 ¿Cómo desea seleccionar el mes?',
                choices: [
                    { name: '📅 Usar meses predefinidos (recomendado)', value: 'predefinidos' },
                    { name: '✏️ Ingresar año y mes manualmente', value: 'manual' }
                ]
            }]);

            let año, mes;

            if (tipoSeleccion === 'predefinidos') {
                const fechaSeleccionada = await this.seleccionarMesPredefinido();
                año = fechaSeleccionada.año;
                mes = fechaSeleccionada.mes;
            } else {
                const { añoInput } = await inquirer.prompt([{
                    type: 'number',
                    name: 'añoInput',
                    message: '📅 Año:',
                    default: new Date().getFullYear(),
                    validate: (input) => {
                        if (isNaN(input) || input < 2000 || input > 2100) {
                            return 'Año debe estar entre 2000 y 2100';
                        }
                        return true;
                    }
                }]);

                const { mesInput } = await inquirer.prompt([{
                    type: 'number',
                    name: 'mesInput',
                    message: '📅 Mes (1-12):',
                    default: new Date().getMonth() + 1,
                    validate: (input) => {
                        if (isNaN(input) || input < 1 || input > 12) {
                            return 'Mes debe estar entre 1 y 12';
                        }
                        return true;
                    }
                }]);

                año = añoInput;
                mes = mesInput;
            }

            const reporte = await this.finanzasService.obtenerReporteMensual(año, mes);

            console.log(chalk.green(`\n📊 📅 REPORTE MENSUAL - ${mes}/${año}`));
            console.log(chalk.green(`💰 💵 Total Ingresos: ${reporte.ingresos.toFixed(2)} €`));
            console.log(chalk.red(`💸 💳 Total Egresos: ${reporte.egresos.toFixed(2)} €`));
            console.log(chalk.bold(`📈 📊 Balance: ${reporte.balance.toFixed(2)} €`));
            console.log(chalk.blue(`📋 📄 Total Pagos: ${reporte.cantidadPagos}`));

            if (reporte.pagos.length > 0) {
                console.log(chalk.blue('\n📋 💳 PAGOS DEL MES:'));
                this.mostrarTablaPagos(reporte.pagos);
            }
        } catch (error) {
            console.log(chalk.red(`Error al obtener reporte mensual: ${error.message}`));
        }
    }

    /**
     * Muestra alertas de pagos
     */
    async verAlertas() {
        console.log(chalk.blue.bold('\n🔔 === ALERTAS DE PAGOS === 🔔\n'));

        try {
            const alertas = await this.finanzasService.obtenerAlertasPagos();

            console.log(chalk.yellow(`⏳ ⏰ Pagos Pendientes: ${alertas.totalPendientes}`));
            console.log(chalk.red(`⚠️ 🚨 Pagos Retrasados: ${alertas.totalRetrasados}`));
            console.log(chalk.red(`🚨 ⚠️ Pagos Vencidos: ${alertas.totalVencidos}`));

            if (alertas.pagosPendientes.length > 0) {
                console.log(chalk.yellow('\n⏳ ⏰ PAGOS PENDIENTES:'));
                this.mostrarTablaPagos(alertas.pagosPendientes);
            }

            if (alertas.pagosRetrasados.length > 0) {
                console.log(chalk.red('\n⚠️ 🚨 PAGOS RETRASADOS:'));
                this.mostrarTablaPagos(alertas.pagosRetrasados);
            }

            if (alertas.pagosVencidos.length > 0) {
                console.log(chalk.red('\n🚨 ⚠️ PAGOS VENCIDOS:'));
                this.mostrarTablaPagos(alertas.pagosVencidos);
            }
        } catch (error) {
            console.log(chalk.red(`Error al obtener alertas: ${error.message}`));
        }
    }

    /**
     * Busca pagos
     */
    async buscarPagos() {
        console.log(chalk.blue.bold('\n🔍 === BUSCAR PAGOS === 🔍\n'));

        try {
            const { descripcion } = await inquirer.prompt([{
                type: 'input',
                name: 'descripcion',
                message: '🔍 Descripción a buscar:',
                validate: (input) => {
                    if (!input || !input.trim()) {
                        return '❌ Descripción es obligatoria';
                    }
                    if (input.trim().length < 2) {
                        return '❌ La descripción debe tener al menos 2 caracteres';
                    }
                    return true;
                }
            }]);

            console.log(chalk.blue('🔍 Buscando pagos...'));
            const pagos = await this.finanzasService.buscarPagosPorDescripcion(descripcion.trim(), { limit: 20 });

            if (pagos.length === 0) {
                console.log(chalk.yellow('\n📭 No se encontraron pagos con esa descripción'));
                console.log(chalk.gray('💡 Intenta con palabras clave más generales'));
                return;
            }

            console.log(chalk.green(`\n🔍 💳 Se encontraron ${pagos.length} pagos:`));
            await this.mostrarTablaPagos(pagos);
        } catch (error) {
            console.log(chalk.red(`\n❌ Error al buscar pagos: ${error.message}`));
            console.log(chalk.gray('💡 Verifica que la descripción sea válida'));
        }
    }

    /**
     * Muestra pagos recientes
     */
    async verPagosRecientes() {
        console.log(chalk.blue.bold('\n🕒 === PAGOS RECIENTES === 🕒\n'));

        try {
            const { limite } = await inquirer.prompt([{
                type: 'number',
                name: 'limite',
                message: 'Número de pagos a mostrar:',
                default: 10,
                validate: (input) => {
                    if (isNaN(input) || input <= 0) {
                        return 'El límite debe ser un número positivo';
                    }
                    return true;
                }
            }]);

            const pagos = await this.finanzasService.obtenerPagosRecientes(limite);

            if (pagos.length === 0) {
                console.log(chalk.yellow('📭 No hay pagos recientes'));
                return;
            }

            await this.mostrarTablaPagos(pagos);
        } catch (error) {
            console.log(chalk.red(`Error al obtener pagos recientes: ${error.message}`));
        }
    }

    /**
     * Muestra una tabla de pagos
     * @param {Pago[]} pagos - Array de pagos a mostrar
     */
    async mostrarTablaPagos(pagos) {
        if (pagos.length === 0) {
            console.log(chalk.yellow('📭 No hay pagos para mostrar'));
            return;
        }

        console.log(chalk.blue('\n📋 💳 PAGOS:'));
        console.log(chalk.gray('─'.repeat(140)));
        console.log(chalk.bold('ID'.padEnd(24) + 'Fecha'.padEnd(12) + 'Monto'.padEnd(12) + 'Método'.padEnd(12) + 'Estado'.padEnd(12) + 'Tipo'.padEnd(10) + 'Cliente'.padEnd(25) + 'Descripción'));
        console.log(chalk.gray('─'.repeat(140)));

        for (const pago of pagos) {
            const resumen = pago.getResumen();
            const id = resumen.pagoId.toString().substring(0, 8) + '...';
            const fecha = resumen.fechaPago;
            const monto = resumen.montoFormateado;
            const metodo = resumen.metodoPago;
            const estado = resumen.estado;
            const tipo = resumen.tipoMovimiento;
            
            // Obtener nombre del cliente usando el servicio
            let nombreCliente = 'Sin cliente';
            
            if (resumen.clienteId && resumen.clienteId !== null && resumen.clienteId !== '' && resumen.clienteId !== 'null') {
                try {
                    // Verificar que sea un ObjectId válido
                    const ObjectId = require('mongodb').ObjectId;
                    if (ObjectId.isValid(resumen.clienteId)) {
                        const cliente = await this.finanzasService.obtenerClientePorId(resumen.clienteId);
                        if (cliente) {
                            nombreCliente = `${cliente.nombre} ${cliente.apellido}`.substring(0, 24);
                        } else {
                            nombreCliente = 'Cliente no encontrado';
                        }
                    } else {
                        nombreCliente = 'ID de cliente inválido';
                    }
                } catch (error) {
                    nombreCliente = 'Cliente no encontrado';
                }
            }

            // Obtener descripción del pago
            const descripcion = resumen.notas ? resumen.notas.substring(0, 30) + (resumen.notas.length > 30 ? '...' : '') : 'Sin descripción';

            let estadoColor = chalk.white;
            switch (estado) {
                case 'pagado':
                    estadoColor = chalk.green;
                    break;
                case 'pendiente':
                    estadoColor = chalk.yellow;
                    break;
                case 'retrasado':
                    estadoColor = chalk.red;
                    break;
                case 'cancelado':
                    estadoColor = chalk.gray;
                    break;
            }

            let tipoColor = chalk.white;
            switch (tipo) {
                case 'ingreso':
                    tipoColor = chalk.green;
                    break;
                case 'egreso':
                    tipoColor = chalk.red;
                    break;
            }

            console.log(
                id.padEnd(24) +
                fecha.padEnd(12) +
                monto.padEnd(12) +
                metodo.padEnd(12) +
                estadoColor(estado.padEnd(12)) +
                tipoColor(tipo.padEnd(10)) +
                nombreCliente.padEnd(25) +
                descripcion
            );
        }

        console.log(chalk.gray('─'.repeat(140)));
        console.log(chalk.blue(`📊 Total: ${pagos.length} pagos`));
    }

    /**
     * Busca un cliente por nombre
     * @returns {Promise<string|null>} ID del cliente seleccionado o null
     */
    async buscarClientePorNombre() {
        try {
            const { termino } = await inquirer.prompt([{
                type: 'input',
                name: 'termino',
                message: '🔍 Ingrese el nombre, apellido o email del cliente:',
                validate: (input) => {
                    if (!input || input.trim().length < 2) {
                        return 'El término de búsqueda debe tener al menos 2 caracteres';
                    }
                    return true;
                }
            }]);

            console.log(chalk.yellow('\n⏳ Buscando clientes...'));

            // Usar el servicio de búsqueda que ya funciona en otros módulos
            const ClienteService = require('../services/ClienteService');
            const clienteService = new ClienteService(this.finanzasService.db);
            
            const resultado = await clienteService.buscarClientes(termino.trim());

            if (!resultado.success || resultado.data.length === 0) {
                console.log(chalk.yellow('📭 No se encontraron clientes con ese término'));
                console.log(chalk.gray('💡 Intenta con:'));
                console.log(chalk.gray('• Nombre completo: "Daniel Vinasco"'));
                console.log(chalk.gray('• Solo nombre: "Daniel"'));
                console.log(chalk.gray('• Solo apellido: "Vinasco"'));
                console.log(chalk.gray('• Email: "daniel@email.com"'));
                return null;
            }

            if (resultado.data.length === 1) {
                const cliente = resultado.data[0];
                console.log(chalk.green(`✅ Cliente encontrado: ${cliente.nombreCompleto} (${cliente.clienteId})`));
                return cliente.clienteId.toString();
            }

            // Mostrar lista de clientes encontrados
            const opciones = resultado.data.map(cliente => ({
                name: `${cliente.nombreCompleto} - ${cliente.email} (${cliente.activo ? 'Activo' : 'Inactivo'})`,
                value: cliente.clienteId.toString()
            }));

            const { clienteSeleccionado } = await inquirer.prompt([{
                type: 'list',
                name: 'clienteSeleccionado',
                message: '👥 Seleccione el cliente:',
                choices: opciones
            }]);

            return clienteSeleccionado;
        } catch (error) {
            console.log(chalk.red(`❌ Error al buscar cliente: ${error.message}`));
            return null;
        }
    }

    /**
     * Permite seleccionar un pago pendiente de una lista
     * @returns {Promise<string|null>} ID del pago seleccionado o null
     */
    async seleccionarPagoPendiente() {
        try {
            const pagos = await this.finanzasService.obtenerPagosPendientes({ limit: 20 });
            
            if (pagos.length === 0) {
                console.log(chalk.yellow('📭 No hay pagos pendientes disponibles'));
                return null;
            }

            console.log(chalk.blue('\n📋 💳 PAGOS PENDIENTES DISPONIBLES:'));
            await this.mostrarTablaPagos(pagos);

            const opciones = pagos.map(pago => {
                const resumen = pago.getResumen();
                return {
                    name: `${resumen.fechaPago} - ${resumen.montoFormateado} - ${resumen.metodoPago} - ${resumen.tipoMovimiento}`,
                    value: pago.pagoId.toString()
                };
            });

            const { pagoSeleccionado } = await inquirer.prompt([{
                type: 'list',
                name: 'pagoSeleccionado',
                message: '💳 Seleccione el pago a marcar como pagado:',
                choices: opciones
            }]);

            return pagoSeleccionado;
        } catch (error) {
            console.log(chalk.red(`Error al seleccionar pago: ${error.message}`));
            return null;
        }
    }

    /**
     * Permite seleccionar fechas predefinidas
     * @returns {Promise<Object>} Objeto con fechaInicio y fechaFin
     */
    async seleccionarFechasPredefinidas() {
        const hoy = dayjs();
        
        const opciones = [
            { 
                name: `📅 Hoy (${hoy.format('DD/MM/YYYY')})`, 
                value: 'hoy',
                fechaInicio: hoy.startOf('day').toDate(),
                fechaFin: hoy.endOf('day').toDate()
            },
            { 
                name: `📅 Ayer (${hoy.subtract(1, 'day').format('DD/MM/YYYY')})`, 
                value: 'ayer',
                fechaInicio: hoy.subtract(1, 'day').startOf('day').toDate(),
                fechaFin: hoy.subtract(1, 'day').endOf('day').toDate()
            },
            { 
                name: `📅 Esta semana (${hoy.startOf('week').format('DD/MM')} - ${hoy.endOf('week').format('DD/MM')})`, 
                value: 'esta_semana',
                fechaInicio: hoy.startOf('week').toDate(),
                fechaFin: hoy.endOf('week').toDate()
            },
            { 
                name: `📅 Semana pasada (${hoy.subtract(1, 'week').startOf('week').format('DD/MM')} - ${hoy.subtract(1, 'week').endOf('week').format('DD/MM')})`, 
                value: 'semana_pasada',
                fechaInicio: hoy.subtract(1, 'week').startOf('week').toDate(),
                fechaFin: hoy.subtract(1, 'week').endOf('week').toDate()
            },
            { 
                name: `📅 Este mes (${hoy.startOf('month').format('MM/YYYY')})`, 
                value: 'este_mes',
                fechaInicio: hoy.startOf('month').toDate(),
                fechaFin: hoy.endOf('month').toDate()
            },
            { 
                name: `📅 Mes pasado (${hoy.subtract(1, 'month').startOf('month').format('MM/YYYY')})`, 
                value: 'mes_pasado',
                fechaInicio: hoy.subtract(1, 'month').startOf('month').toDate(),
                fechaFin: hoy.subtract(1, 'month').endOf('month').toDate()
            },
            { 
                name: `📅 Últimos 7 días (${hoy.subtract(7, 'day').format('DD/MM')} - ${hoy.format('DD/MM')})`, 
                value: 'ultimos_7_dias',
                fechaInicio: hoy.subtract(7, 'day').startOf('day').toDate(),
                fechaFin: hoy.endOf('day').toDate()
            },
            { 
                name: `📅 Últimos 30 días (${hoy.subtract(30, 'day').format('DD/MM')} - ${hoy.format('DD/MM')})`, 
                value: 'ultimos_30_dias',
                fechaInicio: hoy.subtract(30, 'day').startOf('day').toDate(),
                fechaFin: hoy.endOf('day').toDate()
            },
            { 
                name: `📅 Últimos 90 días (${hoy.subtract(90, 'day').format('DD/MM')} - ${hoy.format('DD/MM')})`, 
                value: 'ultimos_90_dias',
                fechaInicio: hoy.subtract(90, 'day').startOf('day').toDate(),
                fechaFin: hoy.endOf('day').toDate()
            },
            { 
                name: `📅 Este año (${hoy.startOf('year').format('YYYY')})`, 
                value: 'este_ano',
                fechaInicio: hoy.startOf('year').toDate(),
                fechaFin: hoy.endOf('year').toDate()
            }
        ];

        const { periodoSeleccionado } = await inquirer.prompt([{
            type: 'list',
            name: 'periodoSeleccionado',
            message: '📅 Seleccione el período:',
            choices: opciones
        }]);

        const opcionSeleccionada = opciones.find(opcion => opcion.value === periodoSeleccionado);
        
        return {
            fechaInicio: opcionSeleccionada.fechaInicio,
            fechaFin: opcionSeleccionada.fechaFin
        };
    }

    /**
     * Permite ingresar fechas personalizadas
     * @returns {Promise<Object>} Objeto con fechaInicio y fechaFin
     */
    async ingresarFechasPersonalizadas() {
        const { fechaInicio } = await inquirer.prompt([{
            type: 'input',
            name: 'fechaInicio',
            message: '📅 Fecha de inicio (DD/MM/YYYY):',
            validate: (input) => {
                const fecha = dayjs(input, 'DD/MM/YYYY', true);
                return fecha.isValid() ? true : 'Formato de fecha inválido (DD/MM/YYYY)';
            }
        }]);

        const { fechaFin } = await inquirer.prompt([{
            type: 'input',
            name: 'fechaFin',
            message: '📅 Fecha de fin (DD/MM/YYYY):',
            validate: (input) => {
                const fecha = dayjs(input, 'DD/MM/YYYY', true);
                return fecha.isValid() ? true : 'Formato de fecha inválido (DD/MM/YYYY)';
            }
        }]);

        return {
            fechaInicio: dayjs(fechaInicio, 'DD/MM/YYYY').toDate(),
            fechaFin: dayjs(fechaFin, 'DD/MM/YYYY').toDate()
        };
    }

    /**
     * Permite seleccionar un mes predefinido
     * @returns {Promise<Object>} Objeto con año y mes
     */
    async seleccionarMesPredefinido() {
        const hoy = dayjs();
        const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        
        const opciones = [
            { 
                name: `📅 Este mes (${meses[hoy.month()]} ${hoy.year()})`, 
                value: 'este_mes',
                año: hoy.year(),
                mes: hoy.month() + 1
            },
            { 
                name: `📅 Mes pasado (${meses[hoy.subtract(1, 'month').month()]} ${hoy.subtract(1, 'month').year()})`, 
                value: 'mes_pasado',
                año: hoy.subtract(1, 'month').year(),
                mes: hoy.subtract(1, 'month').month() + 1
            },
            { 
                name: `📅 Hace 2 meses (${meses[hoy.subtract(2, 'month').month()]} ${hoy.subtract(2, 'month').year()})`, 
                value: 'hace_2_meses',
                año: hoy.subtract(2, 'month').year(),
                mes: hoy.subtract(2, 'month').month() + 1
            },
            { 
                name: `📅 Hace 3 meses (${meses[hoy.subtract(3, 'month').month()]} ${hoy.subtract(3, 'month').year()})`, 
                value: 'hace_3_meses',
                año: hoy.subtract(3, 'month').year(),
                mes: hoy.subtract(3, 'month').month() + 1
            },
            { 
                name: `📅 Hace 6 meses (${meses[hoy.subtract(6, 'month').month()]} ${hoy.subtract(6, 'month').year()})`, 
                value: 'hace_6_meses',
                año: hoy.subtract(6, 'month').year(),
                mes: hoy.subtract(6, 'month').month() + 1
            },
            { 
                name: `📅 Hace 1 año (${meses[hoy.subtract(1, 'year').month()]} ${hoy.subtract(1, 'year').year()})`, 
                value: 'hace_1_ano',
                año: hoy.subtract(1, 'year').year(),
                mes: hoy.subtract(1, 'year').month() + 1
            }
        ];

        // Agregar opciones para los últimos 12 meses
        for (let i = 1; i <= 12; i++) {
            const fecha = hoy.subtract(i, 'month');
            opciones.push({
                name: `📅 ${meses[fecha.month()]} ${fecha.year()}`,
                value: `mes_${i}`,
                año: fecha.year(),
                mes: fecha.month() + 1
            });
        }

        const { mesSeleccionado } = await inquirer.prompt([{
            type: 'list',
            name: 'mesSeleccionado',
            message: '📅 Seleccione el mes:',
            choices: opciones
        }]);

        const opcionSeleccionada = opciones.find(opcion => opcion.value === mesSeleccionado);
        
        return {
            año: opcionSeleccionada.año,
            mes: opcionSeleccionada.mes
        };
    }
}

module.exports = FinanzasCLI;
