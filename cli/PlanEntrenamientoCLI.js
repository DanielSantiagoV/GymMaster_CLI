const inquirer = require('inquirer');
const chalk = require('chalk');
const { PlanEntrenamientoService } = require('../services/index');
const { ObjectId } = require('mongodb');

/**
 * CLI para Gestión de Planes de Entrenamiento
 * Implementa interfaz interactiva para todas las operaciones de planes
 */
class PlanEntrenamientoCLI {
    constructor(db) {
        this.planService = new PlanEntrenamientoService(db);
    }

    /**
     * Muestra el menú principal de gestión de planes
     */
    async mostrarMenuPlanes() {
        console.log(chalk.blue('\n💪 GESTIÓN DE PLANES DE ENTRENAMIENTO'));
        console.log(chalk.gray('=====================================\n'));

        const opciones = [
            {
                type: 'list',
                name: 'opcion',
                message: chalk.yellow('¿Qué deseas hacer con los planes?'),
                choices: [
                    {
                        name: '➕ Crear Nuevo Plan',
                        value: 'crear'
                    },
                    {
                        name: '📋 Listar Planes',
                        value: 'listar'
                    },
                    {
                        name: '🔍 Buscar Plan',
                        value: 'buscar'
                    },
                    {
                        name: '✏️  Actualizar Plan',
                        value: 'actualizar'
                    },
                    {
                        name: '🗑️  Eliminar Plan',
                        value: 'eliminar'
                    },
                    {
                        name: '👥 Gestionar Clientes del Plan',
                        value: 'clientes'
                    },
                    {
                        name: '🔄 Cambiar Estado del Plan',
                        value: 'estado'
                    },
                    {
                        name: '📊 Ver Estadísticas de Planes',
                        value: 'estadisticas'
                    },
                    {
                        name: '⬅️  Volver al Menú Principal',
                        value: 'volver'
                    }
                ]
            }
        ];

        const respuesta = await inquirer.prompt(opciones);

        switch (respuesta.opcion) {
            case 'crear':
                await this.crearPlan();
                break;
            case 'listar':
                await this.listarPlanes();
                break;
            case 'buscar':
                await this.buscarPlan();
                break;
            case 'actualizar':
                await this.actualizarPlan();
                break;
            case 'eliminar':
                await this.eliminarPlan();
                break;
            case 'clientes':
                await this.gestionarClientesPlan();
                break;
            case 'estado':
                await this.cambiarEstadoPlan();
                break;
            case 'estadisticas':
                await this.mostrarEstadisticas();
                break;
            case 'volver':
                return;
        }

        // Solo volver al menú de planes si no se seleccionó "volver"
        if (respuesta.opcion !== 'volver') {
            await this.mostrarMenuPlanes();
        }
    }

    /**
     * Crea un nuevo plan de entrenamiento
     */
    async crearPlan() {
        console.log(chalk.blue('\n➕ CREAR NUEVO PLAN DE ENTRENAMIENTO'));
        console.log(chalk.gray('====================================\n'));

        try {
            const datosPlan = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'nombre',
                    message: 'Nombre del plan:',
                    validate: (input) => {
                        if (!input || input.trim().length < 3) {
                            return 'El nombre debe tener al menos 3 caracteres';
                        }
                        return true;
                    }
                },
                {
                    type: 'input',
                    name: 'duracionSemanas',
                    message: 'Duración en semanas:',
                    validate: (input) => {
                        const duracion = parseInt(input);
                        if (isNaN(duracion) || duracion < 1 || duracion > 104) {
                            return 'La duración debe ser un número entre 1 y 104 semanas';
                        }
                        return true;
                    }
                },
                {
                    type: 'list',
                    name: 'nivel',
                    message: 'Nivel del plan:',
                    choices: [
                        { name: 'Principiante', value: 'principiante' },
                        { name: 'Intermedio', value: 'intermedio' },
                        { name: 'Avanzado', value: 'avanzado' }
                    ]
                },
                {
                    type: 'input',
                    name: 'metasFisicas',
                    message: 'Metas físicas del plan:',
                    validate: (input) => {
                        if (!input || input.trim().length < 5) {
                            return 'Las metas deben tener al menos 5 caracteres';
                        }
                        return true;
                    }
                },
                {
                    type: 'list',
                    name: 'estado',
                    message: 'Estado inicial del plan:',
                    choices: [
                        { name: 'Activo', value: 'activo' },
                        { name: 'Cancelado', value: 'cancelado' },
                        { name: 'Finalizado', value: 'finalizado' }
                    ],
                    default: 'activo'
                }
            ]);

            console.log(chalk.yellow('\n⏳ Creando plan...'));

            const resultado = await this.planService.crearPlan({
                nombre: datosPlan.nombre.trim(),
                duracionSemanas: parseInt(datosPlan.duracionSemanas),
                nivel: datosPlan.nivel,
                metasFisicas: datosPlan.metasFisicas.trim(),
                estado: datosPlan.estado
            });

            if (resultado.success) {
                console.log(chalk.green('\n✅ ¡Plan creado exitosamente!'));
                console.log(chalk.gray('ID del plan: ') + chalk.cyan(resultado.planId));
                console.log(chalk.gray('Nombre: ') + chalk.white(resultado.data.nombre));
                console.log(chalk.gray('Duración: ') + chalk.white(`${resultado.data.duracionSemanas} semanas`));
                console.log(chalk.gray('Nivel: ') + chalk.white(resultado.data.nivel));
                console.log(chalk.gray('Estado: ') + chalk.white(resultado.data.estado));
            }

        } catch (error) {
            console.log(chalk.red('\n❌ Error al crear plan:'));
            console.log(chalk.red(error.message));
        }

        await this.pausar();
    }

    /**
     * Lista planes con filtros y paginación
     */
    async listarPlanes() {
        console.log(chalk.blue('\n📋 LISTAR PLANES DE ENTRENAMIENTO'));
        console.log(chalk.gray('==================================\n'));

        try {
            // Opciones de filtrado
            const opcionesFiltro = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'filtroEstado',
                    message: 'Filtrar por estado:',
                    choices: [
                        { name: 'Todos los planes', value: 'todos' },
                        { name: 'Solo planes activos', value: 'activos' },
                        { name: 'Solo planes cancelados', value: 'cancelados' },
                        { name: 'Solo planes finalizados', value: 'finalizados' }
                    ]
                },
                {
                    type: 'list',
                    name: 'filtroNivel',
                    message: 'Filtrar por nivel:',
                    choices: [
                        { name: 'Todos los niveles', value: 'todos' },
                        { name: 'Principiante', value: 'principiante' },
                        { name: 'Intermedio', value: 'intermedio' },
                        { name: 'Avanzado', value: 'avanzado' }
                    ]
                },
                {
                    type: 'input',
                    name: 'limite',
                    message: 'Número de planes por página (1-50):',
                    default: '10',
                    validate: (input) => {
                        const num = parseInt(input);
                        if (isNaN(num) || num < 1 || num > 50) {
                            return 'Debe ser un número entre 1 y 50';
                        }
                        return true;
                    }
                }
            ]);

            // Construir filtro
            let filtro = {};
            if (opcionesFiltro.filtroEstado !== 'todos') {
                filtro.estado = opcionesFiltro.filtroEstado.slice(0, -1); // Quitar 's' del final
            }
            if (opcionesFiltro.filtroNivel !== 'todos') {
                filtro.nivel = opcionesFiltro.filtroNivel;
            }

            const opciones = {
                pagina: 1,
                limite: parseInt(opcionesFiltro.limite),
                ordenar: 'nombre',
                direccion: 'asc'
            };

            console.log(chalk.yellow('\n⏳ Cargando planes...'));

            const resultado = await this.planService.listarPlanes(filtro, opciones);

            if (resultado.success) {
                console.log(chalk.green(`\n✅ Se encontraron ${resultado.paginacion.totalPlanes} planes`));
                console.log(chalk.gray(`Página ${resultado.paginacion.paginaActual} de ${resultado.paginacion.totalPaginas}\n`));

                if (resultado.data.length > 0) {
                    resultado.data.forEach((plan, index) => {
                        const estado = this.getEstadoColor(plan.estado);
                        console.log(chalk.cyan(`${index + 1}. ${plan.nombre}`));
                        console.log(chalk.gray(`   Duración: ${plan.duracionSemanas} semanas (${plan.duracionMeses} meses)`));
                        console.log(chalk.gray(`   Nivel: ${plan.nivel}`));
                        console.log(chalk.gray(`   Estado: ${estado}`));
                        console.log(chalk.gray(`   Clientes: ${plan.cantidadClientes}`));
                        console.log(chalk.gray(`   Metas: ${plan.metasFisicas}`));
                        console.log(chalk.gray(`   ID: ${plan.planId}\n`));
                    });
                } else {
                    console.log(chalk.yellow('No se encontraron planes con los filtros aplicados.'));
                }
            }

        } catch (error) {
            console.log(chalk.red('\n❌ Error al listar planes:'));
            console.log(chalk.red(error.message));
        }

        await this.pausar();
    }

    /**
     * Busca planes por término
     */
    async buscarPlan() {
        console.log(chalk.blue('\n🔍 BUSCAR PLAN DE ENTRENAMIENTO'));
        console.log(chalk.gray('================================\n'));

        try {
            const busqueda = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'termino',
                    message: 'Ingresa el término de búsqueda (nombre o metas):',
                    validate: (input) => {
                        if (!input || input.trim().length < 2) {
                            return 'El término de búsqueda debe tener al menos 2 caracteres';
                        }
                        return true;
                    }
                }
            ]);

            console.log(chalk.yellow('\n⏳ Buscando planes...'));

            const resultado = await this.planService.buscarPlanes(busqueda.termino);

            if (resultado.success) {
                console.log(chalk.green(`\n✅ Se encontraron ${resultado.total} planes`));

                if (resultado.data.length > 0) {
                    resultado.data.forEach((plan, index) => {
                        const estado = this.getEstadoColor(plan.estado);
                        console.log(chalk.cyan(`${index + 1}. ${plan.nombre}`));
                        console.log(chalk.gray(`   Duración: ${plan.duracionSemanas} semanas`));
                        console.log(chalk.gray(`   Nivel: ${plan.nivel}`));
                        console.log(chalk.gray(`   Estado: ${estado}`));
                        console.log(chalk.gray(`   Clientes: ${plan.cantidadClientes}`));
                        console.log(chalk.gray(`   ID: ${plan.planId}\n`));
                    });
                } else {
                    console.log(chalk.yellow('No se encontraron planes que coincidan con la búsqueda.'));
                }
            }

        } catch (error) {
            console.log(chalk.red('\n❌ Error al buscar planes:'));
            console.log(chalk.red(error.message));
        }

        await this.pausar();
    }

    /**
     * Actualiza un plan existente
     */
    async actualizarPlan() {
        console.log(chalk.blue('\n✏️  ACTUALIZAR PLAN DE ENTRENAMIENTO'));
        console.log(chalk.gray('====================================\n'));

        try {
            // Buscar plan
            const busqueda = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'termino',
                    message: 'Ingresa el nombre o ID del plan a actualizar:',
                    validate: (input) => {
                        if (!input || input.trim().length < 2) {
                            return 'El término de búsqueda debe tener al menos 2 caracteres';
                        }
                        return true;
                    }
                }
            ]);

            console.log(chalk.yellow('\n⏳ Buscando plan...'));

            const resultadoBusqueda = await this.planService.buscarPlanes(busqueda.termino);

            if (!resultadoBusqueda.success || resultadoBusqueda.data.length === 0) {
                console.log(chalk.red('No se encontró el plan.'));
                await this.pausar();
                return;
            }

            // Seleccionar plan
            let planSeleccionado;
            if (resultadoBusqueda.data.length === 1) {
                planSeleccionado = resultadoBusqueda.data[0];
            } else {
                const opciones = resultadoBusqueda.data.map((plan, index) => ({
                    name: `${plan.nombre} (${plan.nivel}, ${plan.estado})`,
                    value: plan.planId
                }));

                const seleccion = await inquirer.prompt([
                    {
                        type: 'list',
                        name: 'planId',
                        message: 'Selecciona el plan a actualizar:',
                        choices: opciones
                    }
                ]);

                planSeleccionado = resultadoBusqueda.data.find(p => p.planId === seleccion.planId);
            }

            // Mostrar datos actuales
            console.log(chalk.blue('\n📋 Datos actuales del plan:'));
            console.log(chalk.gray(`Nombre: ${planSeleccionado.nombre}`));
            console.log(chalk.gray(`Duración: ${planSeleccionado.duracionSemanas} semanas`));
            console.log(chalk.gray(`Nivel: ${planSeleccionado.nivel}`));
            console.log(chalk.gray(`Estado: ${planSeleccionado.estado}`));
            console.log(chalk.gray(`Metas: ${planSeleccionado.metasFisicas}\n`));

            // Campos a actualizar
            const camposActualizar = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'nombre',
                    message: 'Nuevo nombre (presiona Enter para mantener actual):',
                    default: planSeleccionado.nombre
                },
                {
                    type: 'input',
                    name: 'duracionSemanas',
                    message: 'Nueva duración en semanas (presiona Enter para mantener actual):',
                    default: planSeleccionado.duracionSemanas.toString(),
                    validate: (input) => {
                        if (input && (isNaN(parseInt(input)) || parseInt(input) < 1 || parseInt(input) > 104)) {
                            return 'La duración debe ser un número entre 1 y 104';
                        }
                        return true;
                    }
                },
                {
                    type: 'list',
                    name: 'nivel',
                    message: 'Nuevo nivel (presiona Enter para mantener actual):',
                    choices: [
                        { name: 'Principiante', value: 'principiante' },
                        { name: 'Intermedio', value: 'intermedio' },
                        { name: 'Avanzado', value: 'avanzado' }
                    ],
                    default: planSeleccionado.nivel
                },
                {
                    type: 'input',
                    name: 'metasFisicas',
                    message: 'Nuevas metas físicas (presiona Enter para mantener actual):',
                    default: planSeleccionado.metasFisicas
                },
                {
                    type: 'list',
                    name: 'estado',
                    message: 'Nuevo estado:',
                    choices: [
                        { name: 'Activo', value: 'activo' },
                        { name: 'Cancelado', value: 'cancelado' },
                        { name: 'Finalizado', value: 'finalizado' }
                    ],
                    default: planSeleccionado.estado
                }
            ]);

            // Filtrar campos que realmente cambiaron
            const datosActualizados = {};
            if (camposActualizar.nombre !== planSeleccionado.nombre) {
                datosActualizados.nombre = camposActualizar.nombre;
            }
            if (parseInt(camposActualizar.duracionSemanas) !== planSeleccionado.duracionSemanas) {
                datosActualizados.duracionSemanas = parseInt(camposActualizar.duracionSemanas);
            }
            if (camposActualizar.nivel !== planSeleccionado.nivel) {
                datosActualizados.nivel = camposActualizar.nivel;
            }
            if (camposActualizar.metasFisicas !== planSeleccionado.metasFisicas) {
                datosActualizados.metasFisicas = camposActualizar.metasFisicas;
            }
            if (camposActualizar.estado !== planSeleccionado.estado) {
                datosActualizados.estado = camposActualizar.estado;
            }

            if (Object.keys(datosActualizados).length === 0) {
                console.log(chalk.yellow('No hay cambios para aplicar.'));
                await this.pausar();
                return;
            }

            console.log(chalk.yellow('\n⏳ Actualizando plan...'));

            const resultado = await this.planService.actualizarPlan(planSeleccionado.planId, datosActualizados);

            if (resultado.success) {
                console.log(chalk.green('\n✅ ¡Plan actualizado exitosamente!'));
                console.log(chalk.gray('Datos actualizados:'));
                Object.keys(datosActualizados).forEach(campo => {
                    console.log(chalk.gray(`- ${campo}: ${datosActualizados[campo]}`));
                });
            }

        } catch (error) {
            console.log(chalk.red('\n❌ Error al actualizar plan:'));
            console.log(chalk.red(error.message));
        }

        await this.pausar();
    }

    /**
     * Elimina un plan
     */
    async eliminarPlan() {
        console.log(chalk.blue('\n🗑️  ELIMINAR PLAN DE ENTRENAMIENTO'));
        console.log(chalk.gray('====================================\n'));

        try {
            // Buscar plan
            const busqueda = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'termino',
                    message: 'Ingresa el nombre o ID del plan a eliminar:',
                    validate: (input) => {
                        if (!input || input.trim().length < 2) {
                            return 'El término de búsqueda debe tener al menos 2 caracteres';
                        }
                        return true;
                    }
                }
            ]);

            console.log(chalk.yellow('\n⏳ Buscando plan...'));

            const resultadoBusqueda = await this.planService.buscarPlanes(busqueda.termino);

            if (!resultadoBusqueda.success || resultadoBusqueda.data.length === 0) {
                console.log(chalk.red('No se encontró el plan.'));
                await this.pausar();
                return;
            }

            // Seleccionar plan
            let planSeleccionado;
            if (resultadoBusqueda.data.length === 1) {
                planSeleccionado = resultadoBusqueda.data[0];
            } else {
                const opciones = resultadoBusqueda.data.map((plan, index) => ({
                    name: `${plan.nombre} (${plan.nivel}, ${plan.estado})`,
                    value: plan.planId
                }));

                const seleccion = await inquirer.prompt([
                    {
                        type: 'list',
                        name: 'planId',
                        message: 'Selecciona el plan a eliminar:',
                        choices: opciones
                    }
                ]);

                planSeleccionado = resultadoBusqueda.data.find(p => p.planId === seleccion.planId);
            }

            // Mostrar información del plan
            console.log(chalk.red('\n⚠️  INFORMACIÓN DEL PLAN A ELIMINAR:'));
            console.log(chalk.gray(`Nombre: ${planSeleccionado.nombre}`));
            console.log(chalk.gray(`Duración: ${planSeleccionado.duracionSemanas} semanas`));
            console.log(chalk.gray(`Nivel: ${planSeleccionado.nivel}`));
            console.log(chalk.gray(`Estado: ${planSeleccionado.estado}`));
            console.log(chalk.gray(`Clientes asociados: ${planSeleccionado.cantidadClientes}`));

            // Confirmación
            const confirmacion = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'confirmar',
                    message: '¿Estás seguro de que deseas eliminar este plan?',
                    default: false
                }
            ]);

            if (!confirmacion.confirmar) {
                console.log(chalk.yellow('Operación cancelada.'));
                await this.pausar();
                return;
            }

            // Opción de eliminación forzada si tiene clientes
            let forzarEliminacion = false;
            if (planSeleccionado.cantidadClientes > 0) {
                const forzar = await inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'forzar',
                        message: 'El plan tiene clientes asociados. ¿Deseas forzar la eliminación?',
                        default: false
                    }
                ]);
                forzarEliminacion = forzar.forzar;
            }

            console.log(chalk.yellow('\n⏳ Eliminando plan...'));

            const resultado = await this.planService.eliminarPlan(planSeleccionado.planId, forzarEliminacion);

            if (resultado.success) {
                console.log(chalk.green('\n✅ ¡Plan eliminado exitosamente!'));
                if (forzarEliminacion) {
                    console.log(chalk.yellow('Se desasociaron todos los clientes del plan.'));
                }
            }

        } catch (error) {
            console.log(chalk.red('\n❌ Error al eliminar plan:'));
            console.log(chalk.red(error.message));
        }

        await this.pausar();
    }

    /**
     * Gestiona clientes de un plan
     */
    async gestionarClientesPlan() {
        console.log(chalk.blue('\n👥 GESTIONAR CLIENTES DEL PLAN'));
        console.log(chalk.gray('==============================\n'));

        try {
            // Buscar plan
            const busqueda = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'termino',
                    message: 'Ingresa el nombre o ID del plan:',
                    validate: (input) => {
                        if (!input || input.trim().length < 2) {
                            return 'El término de búsqueda debe tener al menos 2 caracteres';
                        }
                        return true;
                    }
                }
            ]);

            console.log(chalk.yellow('\n⏳ Buscando plan...'));

            const resultadoBusqueda = await this.planService.buscarPlanes(busqueda.termino);

            if (!resultadoBusqueda.success || resultadoBusqueda.data.length === 0) {
                console.log(chalk.red('No se encontró el plan.'));
                await this.pausar();
                return;
            }

            // Seleccionar plan
            let planSeleccionado;
            if (resultadoBusqueda.data.length === 1) {
                planSeleccionado = resultadoBusqueda.data[0];
            } else {
                const opciones = resultadoBusqueda.data.map((plan, index) => ({
                    name: `${plan.nombre} (${plan.nivel}, ${plan.estado})`,
                    value: plan.planId
                }));

                const seleccion = await inquirer.prompt([
                    {
                        type: 'list',
                        name: 'planId',
                        message: 'Selecciona el plan:',
                        choices: opciones
                    }
                ]);

                planSeleccionado = resultadoBusqueda.data.find(p => p.planId === seleccion.planId);
            }

            // Mostrar información del plan
            console.log(chalk.blue('\n📋 INFORMACIÓN DEL PLAN:'));
            console.log(chalk.gray(`Nombre: ${planSeleccionado.nombre}`));
            console.log(chalk.gray(`Duración: ${planSeleccionado.duracionSemanas} semanas`));
            console.log(chalk.gray(`Nivel: ${planSeleccionado.nivel}`));
            console.log(chalk.gray(`Estado: ${planSeleccionado.estado}`));
            console.log(chalk.gray(`Clientes actuales: ${planSeleccionado.cantidadClientes}\n`));

            // Menú de opciones para clientes
            const opcionesClientes = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'opcion',
                    message: chalk.yellow('¿Qué deseas hacer con los clientes del plan?'),
                    choices: [
                        {
                            name: '👥 Ver Clientes Asociados',
                            value: 'ver'
                        },
                        {
                            name: '➕ Asociar Cliente',
                            value: 'asociar'
                        },
                        {
                            name: '➖ Desasociar Cliente',
                            value: 'desasociar'
                        },
                        {
                            name: '⬅️  Volver al Menú de Planes',
                            value: 'volver'
                        }
                    ]
                }
            ]);

            switch (opcionesClientes.opcion) {
                case 'ver':
                    await this.verClientesPlan(planSeleccionado.planId);
                    break;
                case 'asociar':
                    await this.asociarClienteAPlan(planSeleccionado.planId);
                    break;
                case 'desasociar':
                    await this.desasociarClienteDePlan(planSeleccionado.planId);
                    break;
                case 'volver':
                    return;
            }

            // Volver al menú de gestión de clientes si no se seleccionó "volver"
            if (opcionesClientes.opcion !== 'volver') {
                await this.gestionarClientesPlan();
            }

        } catch (error) {
            console.log(chalk.red('\n❌ Error al gestionar clientes del plan:'));
            console.log(chalk.red(error.message));
            await this.pausar();
        }
    }

    /**
     * Cambia el estado de un plan
     */
    async cambiarEstadoPlan() {
        console.log(chalk.blue('\n🔄 CAMBIAR ESTADO DEL PLAN'));
        console.log(chalk.gray('==========================\n'));

        try {
            // Buscar plan
            const busqueda = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'termino',
                    message: 'Ingresa el nombre o ID del plan:',
                    validate: (input) => {
                        if (!input || input.trim().length < 2) {
                            return 'El término de búsqueda debe tener al menos 2 caracteres';
                        }
                        return true;
                    }
                }
            ]);

            console.log(chalk.yellow('\n⏳ Buscando plan...'));

            const resultadoBusqueda = await this.planService.buscarPlanes(busqueda.termino);

            if (!resultadoBusqueda.success || resultadoBusqueda.data.length === 0) {
                console.log(chalk.red('No se encontró el plan.'));
                await this.pausar();
                return;
            }

            // Seleccionar plan
            let planSeleccionado;
            if (resultadoBusqueda.data.length === 1) {
                planSeleccionado = resultadoBusqueda.data[0];
            } else {
                const opciones = resultadoBusqueda.data.map((plan, index) => ({
                    name: `${plan.nombre} (${plan.nivel}, ${plan.estado})`,
                    value: plan.planId
                }));

                const seleccion = await inquirer.prompt([
                    {
                        type: 'list',
                        name: 'planId',
                        message: 'Selecciona el plan:',
                        choices: opciones
                    }
                ]);

                planSeleccionado = resultadoBusqueda.data.find(p => p.planId === seleccion.planId);
            }

            // Mostrar estado actual
            console.log(chalk.blue('\n📋 ESTADO ACTUAL:'));
            console.log(chalk.gray(`Plan: ${planSeleccionado.nombre}`));
            console.log(chalk.gray(`Estado actual: ${this.getEstadoColor(planSeleccionado.estado)}`));
            console.log(chalk.gray(`Clientes asociados: ${planSeleccionado.cantidadClientes}\n`));

            // Seleccionar nuevo estado
            const nuevoEstado = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'estado',
                    message: 'Selecciona el nuevo estado:',
                    choices: [
                        { name: 'Activo', value: 'activo' },
                        { name: 'Cancelado', value: 'cancelado' },
                        { name: 'Finalizado', value: 'finalizado' }
                    ],
                    default: planSeleccionado.estado
                }
            ]);

            if (nuevoEstado.estado === planSeleccionado.estado) {
                console.log(chalk.yellow('El plan ya tiene ese estado.'));
                await this.pausar();
                return;
            }

            // Confirmación si se está cancelando o finalizando
            if (nuevoEstado.estado === 'cancelado' || nuevoEstado.estado === 'finalizado') {
                const confirmacion = await inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'confirmar',
                        message: `¿Estás seguro de cambiar el estado a ${nuevoEstado.estado}? Esto puede afectar a los clientes asociados.`,
                        default: false
                    }
                ]);

                if (!confirmacion.confirmar) {
                    console.log(chalk.yellow('Operación cancelada.'));
                    await this.pausar();
                    return;
                }
            }

            console.log(chalk.yellow('\n⏳ Cambiando estado del plan...'));

            const resultado = await this.planService.cambiarEstadoPlan(planSeleccionado.planId, nuevoEstado.estado);

            if (resultado.success) {
                console.log(chalk.green('\n✅ ¡Estado del plan cambiado exitosamente!'));
                console.log(chalk.gray(resultado.mensaje));
            }

        } catch (error) {
            console.log(chalk.red('\n❌ Error al cambiar estado del plan:'));
            console.log(chalk.red(error.message));
        }

        await this.pausar();
    }

    /**
     * Muestra estadísticas de planes
     */
    async mostrarEstadisticas() {
        console.log(chalk.blue('\n📊 ESTADÍSTICAS DE PLANES'));
        console.log(chalk.gray('=========================\n'));

        try {
            console.log(chalk.yellow('\n⏳ Cargando estadísticas...'));

            const estadisticas = await this.planService.obtenerEstadisticasPlanes();

            if (estadisticas.success) {
                const stats = estadisticas.data;
                
                console.log(chalk.green('\n📈 RESUMEN GENERAL:'));
                console.log(chalk.gray(`Total de planes: ${chalk.cyan(stats.totalPlanes)}`));
                console.log(chalk.gray(`Planes activos: ${chalk.green(stats.planesActivos)}`));
                console.log(chalk.gray(`Planes cancelados: ${chalk.red(stats.planesCancelados)}`));
                console.log(chalk.gray(`Planes finalizados: ${chalk.blue(stats.planesFinalizados)}`));

                if (stats.distribucionNivel && stats.distribucionNivel.length > 0) {
                    console.log(chalk.green('\n📊 DISTRIBUCIÓN POR NIVEL:'));
                    stats.distribucionNivel.forEach(distribucion => {
                        console.log(chalk.gray(`${distribucion._id}: ${chalk.cyan(distribucion.count)} planes`));
                    });
                }

                if (stats.distribucionDuracion && stats.distribucionDuracion.length > 0) {
                    console.log(chalk.green('\n📅 DISTRIBUCIÓN POR DURACIÓN:'));
                    stats.distribucionDuracion.forEach(distribucion => {
                        console.log(chalk.gray(`${distribucion._id} semanas: ${chalk.cyan(distribucion.count)} planes`));
                    });
                }
            }

        } catch (error) {
            console.log(chalk.red('\n❌ Error al obtener estadísticas:'));
            console.log(chalk.red(error.message));
        }

        await this.pausar();
    }

    /**
     * Muestra los clientes asociados a un plan
     */
    async verClientesPlan(planId) {
        console.log(chalk.blue('\n👥 CLIENTES ASOCIADOS AL PLAN'));
        console.log(chalk.gray('==============================\n'));

        try {
            console.log(chalk.yellow('\n⏳ Cargando clientes...'));

            // Obtener información del plan
            const plan = await this.planService.planRepository.getById(planId);
            if (!plan) {
                console.log(chalk.red('Plan no encontrado.'));
                await this.pausar();
                return;
            }

            console.log(chalk.blue('\n📋 INFORMACIÓN DEL PLAN:'));
            console.log(chalk.gray(`Nombre: ${plan.nombre}`));
            console.log(chalk.gray(`Duración: ${plan.duracionSemanas} semanas`));
            console.log(chalk.gray(`Nivel: ${plan.nivel}`));
            console.log(chalk.gray(`Estado: ${plan.estado}`));
            console.log(chalk.gray(`Clientes asociados: ${plan.clientes.length}\n`));

            if (plan.clientes.length > 0) {
                console.log(chalk.green('\n👥 CLIENTES ASOCIADOS:'));
                
                // Obtener información de los clientes
                const clientesCollection = this.planService.clienteRepository.collection;
                const clientes = await clientesCollection.find({
                    _id: { $in: plan.clientes }
                }).toArray();

                clientes.forEach((cliente, index) => {
                    const estado = cliente.activo ? chalk.green('Activo') : chalk.red('Inactivo');
                    console.log(chalk.cyan(`${index + 1}. ${cliente.nombre} ${cliente.apellido}`));
                    console.log(chalk.gray(`   Email: ${cliente.email}`));
                    console.log(chalk.gray(`   Teléfono: ${cliente.telefono}`));
                    console.log(chalk.gray(`   Nivel: ${cliente.nivel}`));
                    console.log(chalk.gray(`   Estado: ${estado}`));
                    console.log(chalk.gray(`   ID: ${cliente._id}\n`));
                });
            } else {
                console.log(chalk.yellow('El plan no tiene clientes asociados.'));
            }

        } catch (error) {
            console.log(chalk.red('\n❌ Error al obtener clientes del plan:'));
            console.log(chalk.red(error.message));
        }

        await this.pausar();
    }

    /**
     * Asocia un cliente a un plan
     */
    async asociarClienteAPlan(planId) {
        console.log(chalk.blue('\n➕ ASOCIAR CLIENTE AL PLAN'));
        console.log(chalk.gray('===========================\n'));

        try {
            // Buscar cliente
            const busqueda = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'termino',
                    message: 'Ingresa el nombre, email o ID del cliente a asociar:',
                    validate: (input) => {
                        if (!input || input.trim().length < 2) {
                            return 'El término de búsqueda debe tener al menos 2 caracteres';
                        }
                        return true;
                    }
                }
            ]);

            console.log(chalk.yellow('\n⏳ Buscando cliente...'));

            // Usar el servicio de clientes para buscar
            const { ClienteService } = require('../services/index');
            const clienteService = new ClienteService(this.planService.db);
            const resultadoBusqueda = await clienteService.buscarClientes(busqueda.termino);

            if (!resultadoBusqueda.success || resultadoBusqueda.data.length === 0) {
                console.log(chalk.red('No se encontró el cliente.'));
                await this.pausar();
                return;
            }

            // Seleccionar cliente
            let clienteSeleccionado;
            if (resultadoBusqueda.data.length === 1) {
                clienteSeleccionado = resultadoBusqueda.data[0];
            } else {
                const opciones = resultadoBusqueda.data.map((cliente, index) => ({
                    name: `${cliente.nombreCompleto} (${cliente.email})`,
                    value: cliente.clienteId
                }));

                const seleccion = await inquirer.prompt([
                    {
                        type: 'list',
                        name: 'clienteId',
                        message: 'Selecciona el cliente a asociar:',
                        choices: opciones
                    }
                ]);

                clienteSeleccionado = resultadoBusqueda.data.find(c => c.clienteId === seleccion.clienteId);
            }

            // Mostrar información del cliente
            console.log(chalk.blue('\n📋 INFORMACIÓN DEL CLIENTE:'));
            console.log(chalk.gray(`Nombre: ${clienteSeleccionado.nombreCompleto}`));
            console.log(chalk.gray(`Email: ${clienteSeleccionado.email}`));
            console.log(chalk.gray(`Nivel: ${clienteSeleccionado.nivel}`));
            console.log(chalk.gray(`Planes actuales: ${clienteSeleccionado.cantidadPlanes}\n`));

            // Confirmar asociación
            const confirmacion = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'confirmar',
                    message: '¿Deseas asociar este cliente al plan?',
                    default: true
                }
            ]);

            if (!confirmacion.confirmar) {
                console.log(chalk.yellow('Operación cancelada.'));
                await this.pausar();
                return;
            }

            console.log(chalk.yellow('\n⏳ Asociando cliente al plan...'));

            // Usar el servicio de planes para asociar
            const resultado = await this.planService.asociarClienteAPlan(planId, clienteSeleccionado.clienteId);

            if (resultado.success) {
                console.log(chalk.green('\n✅ ¡Cliente asociado al plan exitosamente!'));
                console.log(chalk.gray(resultado.mensaje));
            }

        } catch (error) {
            console.log(chalk.red('\n❌ Error al asociar cliente al plan:'));
            console.log(chalk.red(error.message));
        }

        await this.pausar();
    }

    /**
     * Desasocia un cliente de un plan
     */
    async desasociarClienteDePlan(planId) {
        console.log(chalk.blue('\n➖ DESASOCIAR CLIENTE DEL PLAN'));
        console.log(chalk.gray('==============================\n'));

        try {
            // Obtener información del plan
            const plan = await this.planService.planRepository.getById(planId);
            if (!plan) {
                console.log(chalk.red('Plan no encontrado.'));
                await this.pausar();
                return;
            }

            if (plan.clientes.length === 0) {
                console.log(chalk.yellow('El plan no tiene clientes asociados.'));
                await this.pausar();
                return;
            }

            // Obtener información de los clientes
            const clientesCollection = this.planService.clienteRepository.collection;
            const clientes = await clientesCollection.find({
                _id: { $in: plan.clientes }
            }).toArray();

            // Seleccionar cliente a desasociar
            const opciones = clientes.map((cliente, index) => ({
                name: `${cliente.nombre} ${cliente.apellido} (${cliente.email})`,
                value: cliente._id.toString()
            }));

            const seleccion = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'clienteId',
                    message: 'Selecciona el cliente a desasociar:',
                    choices: opciones
                }
            ]);

            const clienteSeleccionado = clientes.find(c => c._id.toString() === seleccion.clienteId);

            // Mostrar información del cliente
            console.log(chalk.blue('\n📋 INFORMACIÓN DEL CLIENTE:'));
            console.log(chalk.gray(`Nombre: ${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}`));
            console.log(chalk.gray(`Email: ${clienteSeleccionado.email}`));
            console.log(chalk.gray(`Nivel: ${clienteSeleccionado.nivel}`));

            // Confirmar desasociación
            const confirmacion = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'confirmar',
                    message: '¿Deseas desasociar este cliente del plan?',
                    default: false
                }
            ]);

            if (!confirmacion.confirmar) {
                console.log(chalk.yellow('Operación cancelada.'));
                await this.pausar();
                return;
            }

            console.log(chalk.yellow('\n⏳ Desasociando cliente del plan...'));

            // Usar el servicio de planes para desasociar
            const resultado = await this.planService.desasociarClienteDePlan(planId, seleccion.clienteId);

            if (resultado.success) {
                console.log(chalk.green('\n✅ ¡Cliente desasociado del plan exitosamente!'));
                console.log(chalk.gray(resultado.mensaje));
            }

        } catch (error) {
            console.log(chalk.red('\n❌ Error al desasociar cliente del plan:'));
            console.log(chalk.red(error.message));
        }

        await this.pausar();
    }

    /**
     * Obtiene el color para mostrar el estado
     */
    getEstadoColor(estado) {
        switch (estado) {
            case 'activo':
                return chalk.green('Activo');
            case 'cancelado':
                return chalk.red('Cancelado');
            case 'finalizado':
                return chalk.blue('Finalizado');
            default:
                return chalk.gray(estado);
        }
    }

    /**
     * Pausa la ejecución hasta que el usuario presione Enter
     */
    async pausar() {
        await inquirer.prompt([
            {
                type: 'input',
                name: 'continuar',
                message: 'Presiona Enter para continuar...'
            }
        ]);
    }
}

module.exports = PlanEntrenamientoCLI;
