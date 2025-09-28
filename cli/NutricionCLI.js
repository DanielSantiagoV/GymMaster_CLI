const inquirer = require('inquirer');
const chalk = require('chalk');
const { NutricionService } = require('../services');
const BusquedaService = require('../services/BusquedaService');
const PlantillasNutricionService = require('../services/PlantillasNutricionService');

/**
 * CLI Nutrición - Interfaz de usuario para gestión de planes nutricionales
 * Implementa menús interactivos y validaciones de entrada
 */
class NutricionCLI {
    constructor(db) {
        this.db = db;
        this.nutricionService = new NutricionService(db);
        this.busquedaService = new BusquedaService(db);
        this.plantillasService = new PlantillasNutricionService();
    }

    /**
     * Muestra el menú principal de nutrición
     */
    async mostrarMenuNutricion() {
        try {
            const { opcion } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'opcion',
                    message: '🍎 GESTIÓN DE NUTRICIÓN',
                    choices: [
                        { name: '📝 Crear Plan Nutricional', value: 'crear' },
                        { name: '📋 Listar Planes Nutricionales', value: 'listar' },
                        { name: '🔍 Buscar Plan Nutricional', value: 'buscar' },
                        { name: '✏️ Actualizar Plan Nutricional', value: 'actualizar' },
                        { name: '❌ Eliminar Plan Nutricional', value: 'eliminar' },
                        { name: '👤 Ver Planes por Cliente', value: 'por_cliente' },
                        { name: '📊 Ver Estadísticas', value: 'estadisticas' },
                        { name: '🔙 Volver al Menú Principal', value: 'volver' }
                    ]
                }
            ]);

            switch (opcion) {
                case 'crear':
                    await this.crearPlanNutricional();
                    break;
                case 'listar':
                    await this.listarPlanesNutricionales();
                    break;
                case 'buscar':
                    await this.buscarPlanNutricional();
                    break;
                case 'actualizar':
                    await this.actualizarPlanNutricional();
                    break;
                case 'eliminar':
                    await this.eliminarPlanNutricional();
                    break;
                case 'por_cliente':
                    await this.verPlanesPorCliente();
                    break;
                case 'estadisticas':
                    await this.verEstadisticas();
                    break;
                case 'volver':
                    return;
            }

            // Volver al menú después de completar la acción
            await this.mostrarMenuNutricion();
        } catch (error) {
            console.log(chalk.red(`❌ Error: ${error.message}`));
            await this.mostrarMenuNutricion();
        }
    }

    /**
     * Crea un nuevo plan nutricional
     */
    async crearPlanNutricional() {
        try {
            console.log(chalk.blue('\n📝 CREAR PLAN NUTRICIONAL'));
            console.log(chalk.gray('============================\n'));

            // Paso 1: Buscar cliente
            const cliente = await this.buscarCliente();
            if (!cliente) return;

            // Paso 2: Buscar contrato (opcional)
            const contrato = await this.buscarContrato();
            if (contrato === false) return; // Usuario canceló

            // Paso 3: Seleccionar tipo de plan
            const tipoPlan = await this.seleccionarTipoPlan();
            if (!tipoPlan) return;

            // Paso 4: Obtener plantilla y personalizar
            const plantilla = this.plantillasService.getPlantilla(tipoPlan);
            const datosPlan = await this.personalizarPlan(plantilla, tipoPlan);

            // Paso 5: Estado del plan
            const estado = await this.seleccionarEstado();

            // Paso 6: Notas adicionales
            const notasAdicionales = await this.obtenerNotasAdicionales();

            // Crear el plan
            const datos = {
                clienteId: cliente.id,
                contratoId: contrato ? contrato.id : null,
                tipoPlan: tipoPlan,
                detallePlan: datosPlan.detallePlan,
                evaluacionNutricional: datosPlan.evaluacionNutricional,
                estado: estado,
                notasAdicionales: notasAdicionales
            };

            console.log(chalk.yellow('\n⏳ Creando plan nutricional...'));

            const resultado = await this.nutricionService.crearPlanNutricional(datos);

            if (resultado.success) {
                console.log(chalk.green('✅ Plan nutricional creado exitosamente'));
                console.log(chalk.blue(`📋 ID del plan: ${resultado.nutricionId}`));
                console.log(chalk.blue(`👤 Cliente: ${cliente.nombre}`));
                console.log(chalk.blue(`📋 Tipo: ${plantilla.nombre}`));
            }
        } catch (error) {
            console.log(chalk.red(`❌ Error al crear plan nutricional: ${error.message}`));
        }
    }

    /**
     * Busca y selecciona un cliente
     * @returns {Object|null} Cliente seleccionado
     */
    async buscarCliente() {
        try {
            const { termino } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'termino',
                    message: 'Buscar cliente (nombre o ID):',
                    validate: input => {
                        if (!input || input.trim() === '') return 'Término de búsqueda es requerido';
                        return true;
                    }
                }
            ]);

            console.log(chalk.yellow('\n⏳ Buscando clientes...'));

            const clientes = await this.busquedaService.buscarClientes(termino.trim());

            if (clientes.length === 0) {
                console.log(chalk.red('❌ No se encontraron clientes'));
                return null;
            }

            if (clientes.length === 1) {
                const cliente = clientes[0];
                const resumen = this.busquedaService.getResumenCliente(cliente);
                console.log(chalk.green(`✅ Cliente encontrado: ${resumen.nombre}`));
                return resumen;
            }

            // Múltiples clientes encontrados
            const opciones = clientes.map((cliente, index) => {
                const resumen = this.busquedaService.getResumenCliente(cliente);
                return {
                    name: `${resumen.nombre} (${resumen.email}) - ${resumen.activo ? 'Activo' : 'Inactivo'}`,
                    value: resumen
                };
            });

            const { cliente } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'cliente',
                    message: 'Selecciona el cliente:',
                    choices: opciones
                }
            ]);

            return cliente;
        } catch (error) {
            console.log(chalk.red(`❌ Error al buscar cliente: ${error.message}`));
            return null;
        }
    }

    /**
     * Busca y selecciona un contrato (opcional)
     * @returns {Object|null|false} Contrato seleccionado, null si no se busca, false si se cancela
     */
    async buscarContrato() {
        try {
            const { buscarContrato } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'buscarContrato',
                    message: '¿Deseas vincular un contrato?',
                    default: false
                }
            ]);

            if (!buscarContrato) {
                return null;
            }

            const { termino } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'termino',
                    message: 'Buscar contrato (ID o información):',
                    validate: input => {
                        if (!input || input.trim() === '') return 'Término de búsqueda es requerido';
                        return true;
                    }
                }
            ]);

            console.log(chalk.yellow('\n⏳ Buscando contratos...'));

            const contratos = await this.busquedaService.buscarContratos(termino.trim());

            if (contratos.length === 0) {
                console.log(chalk.red('❌ No se encontraron contratos'));
                return false;
            }

            if (contratos.length === 1) {
                const contrato = contratos[0];
                const resumen = this.busquedaService.getResumenContrato(contrato);
                console.log(chalk.green(`✅ Contrato encontrado: ${resumen.id}`));
                return resumen;
            }

            // Múltiples contratos encontrados
            const opciones = contratos.map((contrato, index) => {
                const resumen = this.busquedaService.getResumenContrato(contrato);
                return {
                    name: `Contrato ${resumen.id} - Cliente: ${resumen.cliente} - Estado: ${resumen.estado}`,
                    value: resumen
                };
            });

            const { contrato } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'contrato',
                    message: 'Selecciona el contrato:',
                    choices: opciones
                }
            ]);

            return contrato;
        } catch (error) {
            console.log(chalk.red(`❌ Error al buscar contrato: ${error.message}`));
            return false;
        }
    }

    /**
     * Selecciona el tipo de plan nutricional
     * @returns {string|null} Tipo de plan seleccionado
     */
    async seleccionarTipoPlan() {
        try {
            const tiposPlanes = this.plantillasService.getTiposPlanes();

            const { tipoPlan } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'tipoPlan',
                    message: 'Tipo de plan nutricional:',
                    choices: tiposPlanes
                }
            ]);

            return tipoPlan;
        } catch (error) {
            console.log(chalk.red(`❌ Error al seleccionar tipo de plan: ${error.message}`));
            return null;
        }
    }

    /**
     * Personaliza el plan basado en la plantilla
     * @param {Object} plantilla - Plantilla del plan
     * @param {string} tipoPlan - Tipo de plan
     * @returns {Object} Datos del plan personalizado
     */
    async personalizarPlan(plantilla, tipoPlan) {
        try {
            console.log(chalk.blue('\n📋 PLANTILLA DEL PLAN'));
            console.log(chalk.gray('====================\n'));
            console.log(chalk.cyan(`Tipo: ${plantilla.nombre}`));
            console.log(chalk.gray('\nDetalle del plan:'));
            console.log(chalk.white(plantilla.detallePlan));
            console.log(chalk.gray('\nEvaluación nutricional:'));
            console.log(chalk.white(plantilla.evaluacionNutricional));

            const { personalizar } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'personalizar',
                    message: '¿Deseas personalizar el plan?',
                    default: false
                }
            ]);

            if (!personalizar) {
                return {
                    detallePlan: plantilla.detallePlan,
                    evaluacionNutricional: plantilla.evaluacionNutricional
                };
            }

            const { detallePlan, evaluacionNutricional } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'detallePlan',
                    message: 'Personalizar detalle del plan:',
                    default: plantilla.detallePlan.substring(0, 200) + '...',
                    validate: input => {
                        if (!input || input.trim() === '') return 'Detalle del plan es requerido';
                        return true;
                    }
                },
                {
                    type: 'input',
                    name: 'evaluacionNutricional',
                    message: 'Personalizar evaluación nutricional:',
                    default: plantilla.evaluacionNutricional.substring(0, 200) + '...',
                    validate: input => {
                        if (!input || input.trim() === '') return 'Evaluación nutricional es requerida';
                        return true;
                    }
                }
            ]);

            return {
                detallePlan: detallePlan,
                evaluacionNutricional: evaluacionNutricional
            };
        } catch (error) {
            console.log(chalk.red(`❌ Error al personalizar plan: ${error.message}`));
            return {
                detallePlan: plantilla.detallePlan,
                evaluacionNutricional: plantilla.evaluacionNutricional
            };
        }
    }

    /**
     * Selecciona el estado del plan
     * @returns {string} Estado seleccionado
     */
    async seleccionarEstado() {
        try {
            const { estado } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'estado',
                    message: 'Estado del plan:',
                    choices: [
                        { name: 'Activo', value: 'activo' },
                        { name: 'Pausado', value: 'pausado' },
                        { name: 'Finalizado', value: 'finalizado' },
                        { name: 'Cancelado', value: 'cancelado' }
                    ],
                    default: 'activo'
                }
            ]);

            return estado;
        } catch (error) {
            console.log(chalk.red(`❌ Error al seleccionar estado: ${error.message}`));
            return 'activo';
        }
    }

    /**
     * Obtiene notas adicionales
     * @returns {string} Notas adicionales
     */
    async obtenerNotasAdicionales() {
        try {
            const { notasAdicionales } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'notasAdicionales',
                    message: 'Notas adicionales (opcional):',
                    filter: input => input.trim() === '' ? '' : input.trim()
                }
            ]);

            return notasAdicionales;
        } catch (error) {
            console.log(chalk.red(`❌ Error al obtener notas: ${error.message}`));
            return '';
        }
    }

    /**
     * Lista todos los planes nutricionales
     */
    async listarPlanesNutricionales() {
        try {
            console.log(chalk.blue('\n📋 PLANES NUTRICIONALES'));
            console.log(chalk.gray('========================\n'));

            const { filtros } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'filtros',
                    message: '¿Cómo deseas filtrar los planes?',
                    choices: [
                        { name: 'Todos los planes', value: 'todos' },
                        { name: 'Solo planes activos', value: 'activos' },
                        { name: 'Solo planes pausados', value: 'pausados' },
                        { name: 'Solo planes finalizados', value: 'finalizados' },
                        { name: 'Solo planes cancelados', value: 'cancelados' }
                    ]
                }
            ]);

            const filtrosQuery = {};
            if (filtros !== 'todos') {
                filtrosQuery.estado = filtros.slice(0, -1); // Remover 's' del final
            }

            const resultado = await this.nutricionService.listarPlanesNutricionales(filtrosQuery);

            if (resultado.success && resultado.data.length > 0) {
                console.log(chalk.green(`✅ Se encontraron ${resultado.total} planes nutricionales\n`));
                
                resultado.data.forEach((plan, index) => {
                    console.log(chalk.cyan(`${index + 1}. Plan Nutricional`));
                    console.log(`   ID: ${plan.nutricionId}`);
                    console.log(`   Cliente: ${plan.clienteId}`);
                    console.log(`   Tipo: ${plan.tipoPlan}`);
                    console.log(`   Estado: ${plan.estado}`);
                    console.log(`   Fecha: ${plan.fechaCreacion}`);
                    console.log(`   Detalle: ${plan.detallePlan}`);
                    console.log(`   Evaluación: ${plan.evaluacionNutricional}`);
                    if (plan.notasAdicionales) {
                        console.log(`   Notas: ${plan.notasAdicionales}`);
                    }
                    console.log('');
                });
            } else {
                console.log(chalk.yellow('📋 No se encontraron planes nutricionales'));
            }
        } catch (error) {
            console.log(chalk.red(`❌ Error al listar planes: ${error.message}`));
        }
    }

    /**
     * Busca un plan nutricional
     */
    async buscarPlanNutricional() {
        try {
            console.log(chalk.blue('\n🔍 BUSCAR PLAN NUTRICIONAL'));
            console.log(chalk.gray('===========================\n'));

            const { termino } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'termino',
                    message: 'Buscar por ID del plan, texto del plan, evaluación o notas:',
                    validate: input => {
                        if (!input || input.trim() === '') return 'Término de búsqueda es requerido';
                        return true;
                    }
                }
            ]);

            console.log(chalk.yellow('\n⏳ Buscando planes...'));

            const resultado = await this.nutricionService.buscarPlanes(termino.trim());

            if (resultado.success && resultado.data.length > 0) {
                console.log(chalk.green(`✅ Se encontraron ${resultado.total} planes\n`));
                
                resultado.data.forEach((plan, index) => {
                    console.log(chalk.cyan(`${index + 1}. Plan Nutricional`));
                    console.log(`   ID: ${plan.nutricionId}`);
                    console.log(`   Cliente: ${plan.clienteId}`);
                    console.log(`   Tipo: ${plan.tipoPlan}`);
                    console.log(`   Estado: ${plan.estado}`);
                    console.log(`   Fecha: ${plan.fechaCreacion}`);
                    console.log(`   Detalle: ${plan.detallePlan}`);
                    console.log(`   Evaluación: ${plan.evaluacionNutricional}`);
                    console.log('');
                });
            } else {
                console.log(chalk.yellow('📋 No se encontraron planes que coincidan con la búsqueda'));
            }
        } catch (error) {
            console.log(chalk.red(`❌ Error al buscar planes: ${error.message}`));
        }
    }

    /**
     * Actualiza un plan nutricional
     */
    async actualizarPlanNutricional() {
        try {
            console.log(chalk.blue('\n✏️ ACTUALIZAR PLAN NUTRICIONAL'));
            console.log(chalk.gray('===============================\n'));

            const { nutricionId } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'nutricionId',
                    message: 'ID del plan nutricional a actualizar:',
                    validate: input => {
                        if (!input || input.trim() === '') return 'ID del plan es requerido';
                        return true;
                    }
                }
            ]);

            // Obtener el plan actual
            const planActual = await this.nutricionService.obtenerPlanNutricional(nutricionId.trim());
            
            if (!planActual.success) {
                console.log(chalk.red('❌ Plan nutricional no encontrado'));
                return;
            }

            console.log(chalk.blue('\n📋 Plan actual:'));
            console.log(`   Tipo: ${planActual.data.nutricion.tipoPlan}`);
            console.log(`   Estado: ${planActual.data.nutricion.estado}`);
            console.log(`   Detalle: ${planActual.data.nutricion.detallePlan.substring(0, 100)}...`);
            console.log(`   Evaluación: ${planActual.data.nutricion.evaluacionNutricional.substring(0, 100)}...`);

            const cambios = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'tipoPlan',
                    message: 'Nuevo tipo de plan:',
                    choices: [
                        { name: 'Pérdida de Peso', value: 'perdida_peso' },
                        { name: 'Ganancia de Masa Muscular', value: 'ganancia_masa' },
                        { name: 'Mantenimiento', value: 'mantenimiento' },
                        { name: 'Deportivo', value: 'deportivo' },
                        { name: 'Médico', value: 'medico' },
                        { name: 'Personalizado', value: 'personalizado' }
                    ],
                    default: planActual.data.nutricion.tipoPlan
                },
                {
                    type: 'list',
                    name: 'estado',
                    message: 'Nuevo estado:',
                    choices: [
                        { name: 'Activo', value: 'activo' },
                        { name: 'Pausado', value: 'pausado' },
                        { name: 'Finalizado', value: 'finalizado' },
                        { name: 'Cancelado', value: 'cancelado' }
                    ],
                    default: planActual.data.nutricion.estado
                },
                {
                    type: 'editor',
                    name: 'detallePlan',
                    message: 'Nuevo detalle del plan:',
                    default: planActual.data.nutricion.detallePlan
                },
                {
                    type: 'editor',
                    name: 'evaluacionNutricional',
                    message: 'Nueva evaluación nutricional:',
                    default: planActual.data.nutricion.evaluacionNutricional
                },
                {
                    type: 'input',
                    name: 'notasAdicionales',
                    message: 'Nuevas notas adicionales:',
                    default: planActual.data.nutricion.notasAdicionales
                }
            ]);

            console.log(chalk.yellow('\n⏳ Actualizando plan nutricional...'));

            const resultado = await this.nutricionService.actualizarPlanNutricional(nutricionId.trim(), cambios);

            if (resultado.success) {
                console.log(chalk.green('✅ Plan nutricional actualizado exitosamente'));
            }
        } catch (error) {
            console.log(chalk.red(`❌ Error al actualizar plan: ${error.message}`));
        }
    }

    /**
     * Elimina un plan nutricional
     */
    async eliminarPlanNutricional() {
        try {
            console.log(chalk.blue('\n❌ ELIMINAR PLAN NUTRICIONAL'));
            console.log(chalk.gray('============================\n'));

            const { nutricionId } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'nutricionId',
                    message: 'ID del plan nutricional a eliminar:',
                    validate: input => {
                        if (!input || input.trim() === '') return 'ID del plan es requerido';
                        return true;
                    }
                }
            ]);

            // Obtener el plan actual
            const planActual = await this.nutricionService.obtenerPlanNutricional(nutricionId.trim());
            
            if (!planActual.success) {
                console.log(chalk.red('❌ Plan nutricional no encontrado'));
                return;
            }

            console.log(chalk.blue('\n📋 Plan a eliminar:'));
            console.log(`   Tipo: ${planActual.data.nutricion.tipoPlan}`);
            console.log(`   Estado: ${planActual.data.nutricion.estado}`);
            console.log(`   Cliente: ${planActual.data.cliente ? planActual.data.cliente.nombreCompleto : 'N/A'}`);

            const { confirmar } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'confirmar',
                    message: '¿Estás seguro de que deseas eliminar este plan nutricional?',
                    default: false
                }
            ]);

            if (confirmar) {
                console.log(chalk.yellow('\n⏳ Eliminando plan nutricional...'));

                const resultado = await this.nutricionService.eliminarPlanNutricional(nutricionId.trim());

                if (resultado.success) {
                    console.log(chalk.green('✅ Plan nutricional eliminado exitosamente'));
                }
            } else {
                console.log(chalk.yellow('❌ Operación cancelada'));
            }
        } catch (error) {
            console.log(chalk.red(`❌ Error al eliminar plan: ${error.message}`));
        }
    }

    /**
     * Ver planes nutricionales por cliente
     */
    async verPlanesPorCliente() {
        try {
            console.log(chalk.blue('\n👤 PLANES POR CLIENTE'));
            console.log(chalk.gray('=====================\n'));

            const { clienteId } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'clienteId',
                    message: 'ID del cliente:',
                    validate: input => {
                        if (!input || input.trim() === '') return 'ID del cliente es requerido';
                        return true;
                    }
                }
            ]);

            console.log(chalk.yellow('\n⏳ Obteniendo planes del cliente...'));

            const resultado = await this.nutricionService.obtenerPlanesPorCliente(clienteId.trim());

            if (resultado.success && resultado.data.length > 0) {
                console.log(chalk.green(`✅ Se encontraron ${resultado.total} planes para el cliente\n`));
                
                resultado.data.forEach((plan, index) => {
                    console.log(chalk.cyan(`${index + 1}. Plan Nutricional`));
                    console.log(`   ID: ${plan.nutricionId}`);
                    console.log(`   Tipo: ${plan.tipoPlan}`);
                    console.log(`   Estado: ${plan.estado}`);
                    console.log(`   Fecha: ${plan.fechaCreacion}`);
                    console.log(`   Detalle: ${plan.detallePlan}`);
                    console.log(`   Evaluación: ${plan.evaluacionNutricional}`);
                    console.log('');
                });
            } else {
                console.log(chalk.yellow('📋 El cliente no tiene planes nutricionales'));
            }
        } catch (error) {
            console.log(chalk.red(`❌ Error al obtener planes del cliente: ${error.message}`));
        }
    }

    /**
     * Muestra estadísticas de planes nutricionales
     */
    async verEstadisticas() {
        try {
            console.log(chalk.blue('\n📊 ESTADÍSTICAS DE NUTRICIÓN'));
            console.log(chalk.gray('============================\n'));

            console.log(chalk.yellow('⏳ Obteniendo estadísticas...'));

            const resultado = await this.nutricionService.obtenerEstadisticas();

            if (resultado.success) {
                const stats = resultado.data;
                console.log(chalk.green('✅ Estadísticas obtenidas\n'));
                
                console.log(chalk.cyan('📈 RESUMEN GENERAL:'));
                console.log(`   Total de planes: ${stats.total}`);
                console.log(`   Planes activos: ${stats.activos}`);
                console.log(`   Planes pausados: ${stats.pausados}`);
                console.log(`   Planes finalizados: ${stats.finalizados}`);
                console.log(`   Planes cancelados: ${stats.cancelados}`);
                
                console.log(chalk.cyan('\n📊 DISTRIBUCIÓN POR ESTADO:'));
                const porcentajeActivos = stats.total > 0 ? ((stats.activos / stats.total) * 100).toFixed(1) : 0;
                const porcentajePausados = stats.total > 0 ? ((stats.pausados / stats.total) * 100).toFixed(1) : 0;
                const porcentajeFinalizados = stats.total > 0 ? ((stats.finalizados / stats.total) * 100).toFixed(1) : 0;
                const porcentajeCancelados = stats.total > 0 ? ((stats.cancelados / stats.total) * 100).toFixed(1) : 0;
                
                console.log(`   Activos: ${porcentajeActivos}%`);
                console.log(`   Pausados: ${porcentajePausados}%`);
                console.log(`   Finalizados: ${porcentajeFinalizados}%`);
                console.log(`   Cancelados: ${porcentajeCancelados}%`);
            }
        } catch (error) {
            console.log(chalk.red(`❌ Error al obtener estadísticas: ${error.message}`));
        }
    }
}

module.exports = NutricionCLI;
