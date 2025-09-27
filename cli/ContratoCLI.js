const inquirer = require('inquirer');
const chalk = require('chalk');
const { ContratoService, ClienteService, PlanEntrenamientoService } = require('../services/index');
const { ObjectId } = require('mongodb');
const dayjs = require('dayjs');

/**
 * CLI para Gestión de Contratos
 * Implementa interfaz interactiva para todas las operaciones de contratos
 */
class ContratoCLI {
    constructor(db) {
        this.contratoService = new ContratoService(db);
        this.clienteService = new ClienteService(db);
        this.planService = new PlanEntrenamientoService(db);
    }

    /**
     * Muestra el menú principal de gestión de contratos
     */
    async mostrarMenuContratos() {
        console.log(chalk.blue('\n📄 GESTIÓN DE CONTRATOS'));
        console.log(chalk.gray('========================\n'));

        const { opcion } = await inquirer.prompt([
            {
                type: 'list',
                name: 'opcion',
                message: 'Selecciona una opción:',
                choices: [
                    { name: '📝 Crear Contrato', value: 'crear' },
                    { name: '📋 Listar Contratos', value: 'listar' },
                    { name: '🔍 Buscar Contrato', value: 'buscar' },
                    { name: '✏️  Actualizar Contrato', value: 'actualizar' },
                    { name: '❌ Cancelar Contrato', value: 'cancelar' },
                    { name: '🔄 Renovar Contrato', value: 'renovar' },
                    { name: '📊 Ver Estadísticas', value: 'estadisticas' },
                    { name: '🔙 Volver al Menú Principal', value: 'volver' }
                ]
            }
        ]);

        switch (opcion) {
            case 'crear':
                await this.crearContrato();
                break;
            case 'listar':
                await this.listarContratos();
                break;
            case 'buscar':
                await this.buscarContrato();
                break;
            case 'actualizar':
                await this.actualizarContrato();
                break;
            case 'cancelar':
                await this.cancelarContrato();
                break;
            case 'renovar':
                await this.renovarContrato();
                break;
            case 'estadisticas':
                await this.verEstadisticas();
                break;
            case 'volver':
                return;
        }

        // Volver al menú de contratos
        await this.mostrarMenuContratos();
    }

    /**
     * Crea un nuevo contrato
     */
    async crearContrato() {
        try {
            console.log(chalk.blue('\n📝 CREAR NUEVO CONTRATO'));
            console.log(chalk.gray('========================\n'));

            // Buscar cliente
            const { busqueda } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'busqueda',
                    message: 'Ingresa el nombre, email o ID del cliente:',
                    validate: input => input.trim() ? true : 'Debe ingresar un término de búsqueda'
                }
            ]);

            console.log(chalk.yellow('\n⏳ Buscando cliente...'));

            const resultadoBusqueda = await this.clienteService.buscarClientes(busqueda);
            if (!resultadoBusqueda.success || resultadoBusqueda.data.length === 0) {
                console.log(chalk.red('No se encontró el cliente.'));
                return;
            }

            const cliente = resultadoBusqueda.data[0];
            console.log(chalk.green('\n📋 INFORMACIÓN DEL CLIENTE:'));
            console.log(`ID: ${cliente.clienteId}`);
            console.log(`Nombre: ${cliente.nombreCompleto}`);
            console.log(`Email: ${cliente.email}`);
            console.log(`Teléfono: ${cliente.telefono || 'No registrado'}`);
            console.log(`Fecha de registro: ${cliente.fechaRegistro}`);
            console.log(`Estado: ${cliente.activo ? 'Activo' : 'Inactivo'}`);
            console.log(`Planes asignados: ${cliente.cantidadPlanes}`);

            // Buscar plan
            const { busquedaPlan } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'busquedaPlan',
                    message: 'Ingresa el nombre o ID del plan:',
                    validate: input => input.trim() ? true : 'Debe ingresar un término de búsqueda'
                }
            ]);

            console.log(chalk.yellow('\n⏳ Buscando plan...'));

            const resultadoBusquedaPlan = await this.planService.listarPlanes({ nombre: { $regex: busquedaPlan, $options: 'i' } });
            if (!resultadoBusquedaPlan.success || resultadoBusquedaPlan.data.length === 0) {
                console.log(chalk.red('No se encontró el plan.'));
                return;
            }

            const plan = resultadoBusquedaPlan.data[0];
            console.log(chalk.green('\n📋 INFORMACIÓN DEL PLAN:'));
            console.log(`Nombre: ${plan.nombre}`);
            console.log(`Nivel: ${plan.nivel}`);
            console.log(`Duración: ${plan.duracionSemanas} semanas`);
            console.log(`Estado: ${plan.estado}`);

            // Verificar compatibilidad - crear instancia del modelo para usar el método
            const { PlanEntrenamiento } = require('../models/index');
            const planModel = new PlanEntrenamiento(plan);
            
            if (!planModel.esCompatibleConNivel(cliente.nivel)) {
                console.log(chalk.red(`❌ El plan no es compatible con el nivel del cliente (${cliente.nivel})`));
                return;
            }

            // Datos del contrato
            const datosContrato = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'duracionMeses',
                    message: 'Duración en meses:',
                    validate: input => {
                        const meses = parseInt(input);
                        return meses > 0 ? true : 'La duración debe ser mayor a 0';
                    },
                    filter: input => parseInt(input)
                },
                {
                    type: 'input',
                    name: 'precio',
                    message: 'Precio del contrato:',
                    validate: input => {
                        const precio = parseFloat(input);
                        return precio > 0 ? true : 'El precio debe ser mayor a 0';
                    },
                    filter: input => parseFloat(input)
                },
                {
                    type: 'input',
                    name: 'fechaInicio',
                    message: 'Fecha de inicio (YYYY-MM-DD):',
                    default: dayjs().format('YYYY-MM-DD'),
                    validate: input => {
                        const fecha = dayjs(input);
                        return fecha.isValid() ? true : 'Formato de fecha inválido';
                    }
                },
                {
                    type: 'input',
                    name: 'fechaFin',
                    message: 'Fecha de fin (YYYY-MM-DD):',
                    validate: input => {
                        const fecha = dayjs(input);
                        return fecha.isValid() ? true : 'Formato de fecha inválido';
                    }
                },
                {
                    type: 'input',
                    name: 'condiciones',
                    message: 'Condiciones especiales (mínimo 10 caracteres):',
                    validate: input => {
                        if (!input.trim()) {
                            return 'Las condiciones son obligatorias';
                        }
                        if (input.trim().length < 10) {
                            return 'Las condiciones deben tener al menos 10 caracteres';
                        }
                        if (input.trim().length > 2000) {
                            return 'Las condiciones no pueden exceder 2000 caracteres';
                        }
                        return true;
                    }
                },
                {
                    type: 'confirm',
                    name: 'registrarPago',
                    message: '¿Registrar pago automáticamente?',
                    default: false
                }
            ]);

            console.log(chalk.yellow('\n⏳ Creando contrato...'));

            const resultado = await this.contratoService.crearContrato({
                clienteId: cliente.clienteId,
                planId: plan.planId,
                duracionMeses: datosContrato.duracionMeses,
                precio: datosContrato.precio,
                fechaInicio: new Date(datosContrato.fechaInicio),
                fechaFin: new Date(datosContrato.fechaFin),
                condiciones: datosContrato.condiciones,
                registrarPago: datosContrato.registrarPago
            });

            if (resultado.success) {
                console.log(chalk.green('✅ Contrato creado exitosamente'));
                console.log(chalk.gray(`ID del contrato: ${resultado.contratoId}`));
            }

        } catch (error) {
            console.log(chalk.red(`❌ Error al crear contrato: ${error.message}`));
        }
    }

    /**
     * Lista contratos con filtros
     */
    async listarContratos() {
        try {
            console.log(chalk.blue('\n📋 LISTAR CONTRATOS'));
            console.log(chalk.gray('==================\n'));

            const { filtro } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'filtro',
                    message: 'Selecciona el tipo de filtro:',
                    choices: [
                        { name: 'Todos los contratos', value: 'todos' },
                        { name: 'Contratos vigentes', value: 'vigentes' },
                        { name: 'Contratos vencidos', value: 'vencidos' },
                        { name: 'Contratos cancelados', value: 'cancelados' },
                        { name: 'Contratos renovados', value: 'renovados' }
                    ]
                }
            ]);

            let filtros = {};
            if (filtro !== 'todos') {
                filtros.estado = filtro.slice(0, -1); // Remover 's' del final
            }

            console.log(chalk.yellow('\n⏳ Cargando contratos...'));

            const resultado = await this.contratoService.listarContratos(filtros);

            if (resultado.success && resultado.data.length > 0) {
                console.log(chalk.green(`\n📋 Se encontraron ${resultado.data.length} contratos:\n`));
                
                resultado.data.forEach((contrato, index) => {
                    console.log(chalk.cyan(`${index + 1}. CONTRATO #${contrato._id}`));
                    console.log(`   Cliente: ${contrato.cliente?.nombre} ${contrato.cliente?.apellido}`);
                    console.log(`   Plan: ${contrato.plan?.nombre}`);
                    console.log(`   Estado: ${contrato.estado}`);
                    console.log(`   Precio: $${contrato.precio}`);
                    console.log(`   Inicio: ${dayjs(contrato.fechaInicio).format('DD/MM/YYYY')}`);
                    console.log(`   Fin: ${dayjs(contrato.fechaFin).format('DD/MM/YYYY')}`);
                    console.log(chalk.gray('   ──────────────────────────────────────'));
                });
            } else {
                console.log(chalk.yellow('No se encontraron contratos con los filtros especificados.'));
            }

        } catch (error) {
            console.log(chalk.red(`❌ Error al listar contratos: ${error.message}`));
        }
    }

    /**
     * Busca un contrato específico
     */
    async buscarContrato() {
        try {
            console.log(chalk.blue('\n🔍 BUSCAR CONTRATO'));
            console.log(chalk.gray('==================\n'));

            // Obtener todos los contratos para mostrar opciones
            const resultado = await this.contratoService.listarContratos();
            
            if (!resultado.success || resultado.data.length === 0) {
                console.log(chalk.yellow('No hay contratos disponibles.'));
                return;
            }

            // Crear opciones para seleccionar
            const opciones = resultado.data.map((contrato, index) => ({
                name: `${index + 1}. ${contrato.cliente?.nombre} ${contrato.cliente?.apellido} - ${contrato.plan?.nombre} - ${contrato.estado}`,
                value: contrato._id
            }));

            const { contratoId } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'contratoId',
                    message: 'Selecciona el contrato a ver:',
                    choices: opciones
                }
            ]);

            console.log(chalk.yellow('\n⏳ Obteniendo información del contrato...'));

            const contratoResultado = await this.contratoService.obtenerContrato(contratoId);

            if (contratoResultado.success) {
                const contrato = contratoResultado.data;
                console.log(chalk.green('\n📋 INFORMACIÓN DEL CONTRATO:'));
                console.log(`ID: ${contrato._id}`);
                console.log(`Cliente: ${contrato.cliente?.nombre} ${contrato.cliente?.apellido}`);
                console.log(`Email: ${contrato.cliente?.email}`);
                console.log(`Plan: ${contrato.plan?.nombre} (${contrato.plan?.nivel})`);
                console.log(`Estado: ${contrato.estado}`);
                console.log(`Precio: $${contrato.precio}`);
                console.log(`Duración: ${contrato.duracionMeses} meses`);
                console.log(`Inicio: ${dayjs(contrato.fechaInicio).format('DD/MM/YYYY')}`);
                console.log(`Fin: ${dayjs(contrato.fechaFin).format('DD/MM/YYYY')}`);
                if (contrato.condiciones) {
                    console.log(`Condiciones: ${contrato.condiciones}`);
                }
            }

        } catch (error) {
            console.log(chalk.red(`❌ Error al buscar contrato: ${error.message}`));
        }
    }

    /**
     * Actualiza un contrato
     */
    async actualizarContrato() {
        try {
            console.log(chalk.blue('\n✏️  ACTUALIZAR CONTRATO'));
            console.log(chalk.gray('======================\n'));

            // Obtener todos los contratos para mostrar opciones
            const resultado = await this.contratoService.listarContratos();
            
            if (!resultado.success || resultado.data.length === 0) {
                console.log(chalk.yellow('No hay contratos disponibles.'));
                return;
            }

            // Crear opciones para seleccionar
            const opciones = resultado.data.map((contrato, index) => ({
                name: `${index + 1}. ${contrato.cliente?.nombre} ${contrato.cliente?.apellido} - ${contrato.plan?.nombre} - ${contrato.estado}`,
                value: contrato._id
            }));

            const { contratoId } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'contratoId',
                    message: 'Selecciona el contrato a actualizar:',
                    choices: opciones
                }
            ]);

            // Obtener contrato actual
            const contratoActual = await this.contratoService.obtenerContrato(contratoId);
            if (!contratoActual.success) {
                console.log(chalk.red('Contrato no encontrado.'));
                return;
            }

            const contrato = contratoActual.data;
            console.log(chalk.green('\n📋 CONTRATO ACTUAL:'));
            console.log(`Cliente: ${contrato.cliente?.nombre} ${contrato.cliente?.apellido}`);
            console.log(`Plan: ${contrato.plan?.nombre}`);
            console.log(`Estado: ${contrato.estado}`);
            console.log(`Precio: $${contrato.precio}`);

            const datosActualizados = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'precio',
                    message: `Nuevo precio (actual: $${contrato.precio}):`,
                    validate: input => {
                        if (!input.trim()) return true; // Campo opcional
                        const precio = parseFloat(input);
                        return precio > 0 ? true : 'El precio debe ser mayor a 0';
                    },
                    filter: input => input.trim() ? parseFloat(input) : null
                },
                {
                    type: 'input',
                    name: 'fechaInicio',
                    message: `Nueva fecha de inicio (actual: ${dayjs(contrato.fechaInicio).format('YYYY-MM-DD')}):`,
                    validate: input => {
                        if (!input.trim()) return true;
                        const fecha = dayjs(input);
                        return fecha.isValid() ? true : 'Formato de fecha inválido';
                    }
                },
                {
                    type: 'input',
                    name: 'fechaFin',
                    message: `Nueva fecha de fin (actual: ${dayjs(contrato.fechaFin).format('YYYY-MM-DD')}):`,
                    validate: input => {
                        if (!input.trim()) return true;
                        const fecha = dayjs(input);
                        return fecha.isValid() ? true : 'Formato de fecha inválido';
                    }
                },
                {
                    type: 'input',
                    name: 'condiciones',
                    message: `Nuevas condiciones (actual: ${contrato.condiciones || 'Ninguna'}):`,
                    default: contrato.condiciones || '',
                    validate: input => {
                        if (!input.trim()) return true; // Campo opcional en actualización
                        if (input.trim().length < 10) {
                            return 'Las condiciones deben tener al menos 10 caracteres';
                        }
                        if (input.trim().length > 2000) {
                            return 'Las condiciones no pueden exceder 2000 caracteres';
                        }
                        return true;
                    }
                }
            ]);

            // Filtrar campos vacíos
            const cambios = Object.fromEntries(
                Object.entries(datosActualizados).filter(([_, value]) => value !== null && value !== '')
            );

            if (Object.keys(cambios).length === 0) {
                console.log(chalk.yellow('No se realizaron cambios.'));
                return;
            }

            console.log(chalk.yellow('\n⏳ Actualizando contrato...'));

            const resultadoActualizacion = await this.contratoService.actualizarContrato(contratoId, cambios);

            if (resultadoActualizacion.success) {
                console.log(chalk.green('✅ Contrato actualizado exitosamente'));
            }

        } catch (error) {
            console.log(chalk.red(`❌ Error al actualizar contrato: ${error.message}`));
        }
    }

    /**
     * Cancela un contrato
     */
    async cancelarContrato() {
        try {
            console.log(chalk.blue('\n❌ CANCELAR CONTRATO'));
            console.log(chalk.gray('===================\n'));

            // Obtener todos los contratos para mostrar opciones
            const resultado = await this.contratoService.listarContratos();
            
            if (!resultado.success || resultado.data.length === 0) {
                console.log(chalk.yellow('No hay contratos disponibles.'));
                return;
            }

            // Crear opciones para seleccionar
            const opciones = resultado.data.map((contrato, index) => ({
                name: `${index + 1}. ${contrato.cliente?.nombre} ${contrato.cliente?.apellido} - ${contrato.plan?.nombre} - ${contrato.estado}`,
                value: contrato._id
            }));

            const { contratoId } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'contratoId',
                    message: 'Selecciona el contrato a cancelar:',
                    choices: opciones
                }
            ]);

            // Obtener contrato actual
            const contratoActual = await this.contratoService.obtenerContrato(contratoId);
            if (!contratoActual.success) {
                console.log(chalk.red('Contrato no encontrado.'));
                return;
            }

            const contrato = contratoActual.data;
            console.log(chalk.green('\n📋 INFORMACIÓN DEL CONTRATO:'));
            console.log(`Cliente: ${contrato.cliente?.nombre} ${contrato.cliente?.apellido}`);
            console.log(`Plan: ${contrato.plan?.nombre}`);
            console.log(`Estado: ${contrato.estado}`);
            console.log(`Precio: $${contrato.precio}`);

            if (contrato.estado === 'cancelado') {
                console.log(chalk.yellow('El contrato ya está cancelado.'));
                return;
            }

            const { confirmar, motivo } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'confirmar',
                    message: '¿Estás seguro de cancelar este contrato?',
                    default: false
                },
                {
                    type: 'input',
                    name: 'motivo',
                    message: 'Motivo de la cancelación (opcional):',
                    when: answers => answers.confirmar
                }
            ]);

            if (!confirmar) {
                console.log(chalk.yellow('Operación cancelada.'));
                return;
            }

            console.log(chalk.yellow('\n⏳ Cancelando contrato...'));

            const resultadoCancelacion = await this.contratoService.cancelarContrato(contratoId, motivo);

            if (resultadoCancelacion.success) {
                console.log(chalk.green('✅ Contrato cancelado exitosamente'));
            }

        } catch (error) {
            console.log(chalk.red(`❌ Error al cancelar contrato: ${error.message}`));
        }
    }

    /**
     * Renueva un contrato
     */
    async renovarContrato() {
        try {
            console.log(chalk.blue('\n🔄 RENOVAR CONTRATO'));
            console.log(chalk.gray('===================\n'));

            // Obtener todos los contratos para mostrar opciones
            const resultado = await this.contratoService.listarContratos();
            
            if (!resultado.success || resultado.data.length === 0) {
                console.log(chalk.yellow('No hay contratos disponibles.'));
                return;
            }

            // Crear opciones para seleccionar
            const opciones = resultado.data.map((contrato, index) => ({
                name: `${index + 1}. ${contrato.cliente?.nombre} ${contrato.cliente?.apellido} - ${contrato.plan?.nombre} - ${contrato.estado}`,
                value: contrato._id
            }));

            const { contratoId } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'contratoId',
                    message: 'Selecciona el contrato a renovar:',
                    choices: opciones
                }
            ]);

            // Obtener contrato actual
            const contratoActual = await this.contratoService.obtenerContrato(contratoId);
            if (!contratoActual.success) {
                console.log(chalk.red('Contrato no encontrado.'));
                return;
            }

            const contrato = contratoActual.data;
            console.log(chalk.green('\n📋 CONTRATO ACTUAL:'));
            console.log(`Cliente: ${contrato.cliente?.nombre} ${contrato.cliente?.apellido}`);
            console.log(`Plan: ${contrato.plan?.nombre}`);
            console.log(`Estado: ${contrato.estado}`);
            console.log(`Precio: $${contrato.precio}`);

            if (contrato.estado !== 'vigente' && contrato.estado !== 'vencido') {
                console.log(chalk.red('Solo se pueden renovar contratos vigentes o vencidos.'));
                return;
            }

            const datosRenovacion = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'duracionMeses',
                    message: 'Nueva duración en meses:',
                    validate: input => {
                        const meses = parseInt(input);
                        return meses > 0 ? true : 'La duración debe ser mayor a 0';
                    },
                    filter: input => parseInt(input)
                },
                {
                    type: 'input',
                    name: 'precio',
                    message: 'Nuevo precio:',
                    validate: input => {
                        const precio = parseFloat(input);
                        return precio > 0 ? true : 'El precio debe ser mayor a 0';
                    },
                    filter: input => parseFloat(input)
                },
                {
                    type: 'input',
                    name: 'fechaInicio',
                    message: 'Nueva fecha de inicio (YYYY-MM-DD):',
                    default: dayjs().format('YYYY-MM-DD'),
                    validate: input => {
                        const fecha = dayjs(input);
                        return fecha.isValid() ? true : 'Formato de fecha inválido';
                    }
                },
                {
                    type: 'input',
                    name: 'fechaFin',
                    message: 'Nueva fecha de fin (YYYY-MM-DD):',
                    validate: input => {
                        const fecha = dayjs(input);
                        return fecha.isValid() ? true : 'Formato de fecha inválido';
                    }
                },
                {
                    type: 'input',
                    name: 'condiciones',
                    message: 'Nuevas condiciones (mínimo 10 caracteres):',
                    default: contrato.condiciones || '',
                    validate: input => {
                        if (!input.trim()) {
                            return 'Las condiciones son obligatorias para la renovación';
                        }
                        if (input.trim().length < 10) {
                            return 'Las condiciones deben tener al menos 10 caracteres';
                        }
                        if (input.trim().length > 2000) {
                            return 'Las condiciones no pueden exceder 2000 caracteres';
                        }
                        return true;
                    }
                }
            ]);

            console.log(chalk.yellow('\n⏳ Renovando contrato...'));

            const resultadoRenovacion = await this.contratoService.renovarContrato(contratoId, {
                duracionMeses: datosRenovacion.duracionMeses,
                precio: datosRenovacion.precio,
                fechaInicio: new Date(datosRenovacion.fechaInicio),
                fechaFin: new Date(datosRenovacion.fechaFin),
                condiciones: datosRenovacion.condiciones
            });

            if (resultadoRenovacion.success) {
                console.log(chalk.green('✅ Contrato renovado exitosamente'));
                console.log(chalk.gray(`Nuevo contrato ID: ${resultadoRenovacion.contratoId}`));
            }

        } catch (error) {
            console.log(chalk.red(`❌ Error al renovar contrato: ${error.message}`));
        }
    }

    /**
     * Muestra estadísticas de contratos
     */
    async verEstadisticas() {
        try {
            console.log(chalk.blue('\n📊 ESTADÍSTICAS DE CONTRATOS'));
            console.log(chalk.gray('============================\n'));

            console.log(chalk.yellow('⏳ Cargando estadísticas...'));

            const resultado = await this.contratoService.obtenerEstadisticasContratos();

            if (resultado.success) {
                const stats = resultado.data;
                console.log(chalk.green('\n📊 ESTADÍSTICAS GENERALES:'));
                console.log(`Total de contratos: ${stats.total}`);
                console.log(`Contratos vigentes: ${stats.vigentes}`);
                console.log(`Contratos vencidos: ${stats.vencidos}`);
                console.log(`Contratos cancelados: ${stats.cancelados}`);
                console.log(`Contratos renovados: ${stats.renovados}`);
                console.log(`Ingresos totales: $${stats.ingresosTotales.toLocaleString()}`);
            }

        } catch (error) {
            console.log(chalk.red(`❌ Error al obtener estadísticas: ${error.message}`));
        }
    }
}

module.exports = ContratoCLI;
