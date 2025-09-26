const inquirer = require('inquirer');
const chalk = require('chalk');
const { ClienteService } = require('../services');
const { ObjectId } = require('mongodb');

/**
 * CLI para Gestión de Clientes
 * Implementa interfaz interactiva para todas las operaciones de clientes
 */
class ClienteCLI {
    constructor(db) {
        this.clienteService = new ClienteService(db);
    }

    /**
     * Muestra el menú principal de gestión de clientes
     */
    async mostrarMenuClientes() {
        console.log(chalk.blue.bold('\n👥 GESTIÓN DE CLIENTES'));
        console.log(chalk.gray('================================\n'));

        const opciones = [
            {
                type: 'list',
                name: 'opcion',
                message: chalk.yellow('¿Qué deseas hacer con los clientes?'),
                choices: [
                    {
                        name: '➕ Crear Nuevo Cliente',
                        value: 'crear'
                    },
                    {
                        name: '📋 Listar Clientes',
                        value: 'listar'
                    },
                    {
                        name: '🔍 Buscar Cliente',
                        value: 'buscar'
                    },
                    {
                        name: '✏️  Actualizar Cliente',
                        value: 'actualizar'
                    },
                    {
                        name: '🗑️  Eliminar Cliente',
                        value: 'eliminar'
                    },
                    {
                        name: '📊 Ver Estadísticas de Clientes',
                        value: 'estadisticas'
                    },
                    {
                        name: '🔗 Gestionar Planes del Cliente',
                        value: 'planes'
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
                await this.crearCliente();
                break;
            case 'listar':
                await this.listarClientes();
                break;
            case 'buscar':
                await this.buscarCliente();
                break;
            case 'actualizar':
                await this.actualizarCliente();
                break;
            case 'eliminar':
                await this.eliminarCliente();
                break;
            case 'estadisticas':
                await this.mostrarEstadisticas();
                break;
            case 'planes':
                await this.gestionarPlanesCliente();
                break;
            case 'volver':
                return;
        }

        // Solo volver al menú de clientes si no se seleccionó "volver"
        if (respuesta.opcion !== 'volver') {
            await this.mostrarMenuClientes();
        }
    }

    /**
     * Crea un nuevo cliente con formulario interactivo
     */
    async crearCliente() {
        console.log(chalk.blue('\n➕ CREAR NUEVO CLIENTE'));
        console.log(chalk.gray('========================\n'));

        try {
            const datosCliente = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'nombre',
                    message: 'Nombre del cliente:',
                    validate: (input) => {
                        if (!input || input.trim().length < 2) {
                            return 'El nombre debe tener al menos 2 caracteres';
                        }
                        return true;
                    }
                },
                {
                    type: 'input',
                    name: 'apellido',
                    message: 'Apellido del cliente:',
                    validate: (input) => {
                        if (!input || input.trim().length < 2) {
                            return 'El apellido debe tener al menos 2 caracteres';
                        }
                        return true;
                    }
                },
                {
                    type: 'input',
                    name: 'email',
                    message: 'Email del cliente:',
                    validate: (input) => {
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(input)) {
                            return 'Ingresa un email válido';
                        }
                        return true;
                    }
                },
                {
                    type: 'input',
                    name: 'telefono',
                    message: 'Teléfono del cliente:',
                    validate: (input) => {
                        const telefonoLimpio = input.replace(/[\s\-\(\)]/g, '');
                        if (!/^\d+$/.test(telefonoLimpio) || telefonoLimpio.length < 7) {
                            return 'El teléfono debe contener solo números y tener al menos 7 dígitos';
                        }
                        return true;
                    }
                }
            ]);

            console.log(chalk.yellow('\n⏳ Creando cliente...'));

            const resultado = await this.clienteService.crearCliente(datosCliente);

            if (resultado.success) {
                console.log(chalk.green('\n✅ ¡Cliente creado exitosamente!'));
                console.log(chalk.gray('ID del cliente: ') + chalk.cyan(resultado.clienteId));
                console.log(chalk.gray('Nombre: ') + chalk.white(resultado.data.nombreCompleto));
                console.log(chalk.gray('Email: ') + chalk.white(resultado.data.email));
            }

        } catch (error) {
            console.log(chalk.red('\n❌ Error al crear cliente:'));
            console.log(chalk.red(error.message));
        }

        await this.pausar();
    }

    /**
     * Lista clientes con opciones de filtrado y paginación
     */
    async listarClientes() {
        console.log(chalk.blue('\n📋 LISTAR CLIENTES'));
        console.log(chalk.gray('==================\n'));

        try {
            // Opciones de filtrado
            const opcionesFiltro = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'filtroActivo',
                    message: 'Filtrar por estado:',
                    choices: [
                        { name: 'Todos los clientes', value: 'todos' },
                        { name: 'Solo clientes activos', value: 'activos' },
                        { name: 'Solo clientes inactivos', value: 'inactivos' }
                    ]
                },
                {
                    type: 'input',
                    name: 'limite',
                    message: 'Número de clientes por página (1-50):',
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
            if (opcionesFiltro.filtroActivo === 'activos') {
                filtro.activo = true;
            } else if (opcionesFiltro.filtroActivo === 'inactivos') {
                filtro.activo = false;
            }

            const opciones = {
                pagina: 1,
                limite: parseInt(opcionesFiltro.limite),
                ordenar: 'fechaRegistro',
                direccion: 'desc'
            };

            console.log(chalk.yellow('\n⏳ Cargando clientes...'));

            const resultado = await this.clienteService.listarClientes(filtro, opciones);

            if (resultado.success) {
                console.log(chalk.green(`\n✅ Se encontraron ${resultado.paginacion.totalClientes} clientes`));
                console.log(chalk.gray(`Página ${resultado.paginacion.paginaActual} de ${resultado.paginacion.totalPaginas}\n`));

                if (resultado.data.length > 0) {
                    resultado.data.forEach((cliente, index) => {
                        const estado = cliente.activo ? chalk.green('Activo') : chalk.red('Inactivo');
                        console.log(chalk.cyan(`${index + 1}. ${cliente.nombreCompleto}`));
                        console.log(chalk.gray(`   Email: ${cliente.email}`));
                        console.log(chalk.gray(`   Teléfono: ${cliente.telefono}`));
                        console.log(chalk.gray(`   Estado: ${estado}`));
                        console.log(chalk.gray(`   Planes: ${cliente.cantidadPlanes}`));
                        console.log(chalk.gray(`   Registro: ${cliente.fechaRegistro}`));
                        console.log(chalk.gray(`   ID: ${cliente.clienteId}\n`));
                    });
                } else {
                    console.log(chalk.yellow('No se encontraron clientes con los filtros aplicados.'));
                }
            }

        } catch (error) {
            console.log(chalk.red('\n❌ Error al listar clientes:'));
            console.log(chalk.red(error.message));
        }

        await this.pausar();
    }

    /**
     * Busca clientes por término de búsqueda
     */
    async buscarCliente() {
        console.log(chalk.blue('\n🔍 BUSCAR CLIENTE'));
        console.log(chalk.gray('==================\n'));

        try {
            const busqueda = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'termino',
                    message: 'Ingresa el término de búsqueda (nombre, apellido o email):',
                    validate: (input) => {
                        if (!input || input.trim().length < 2) {
                            return 'El término de búsqueda debe tener al menos 2 caracteres';
                        }
                        return true;
                    }
                }
            ]);

            console.log(chalk.yellow('\n⏳ Buscando clientes...'));

            const resultado = await this.clienteService.buscarClientes(busqueda.termino);

            if (resultado.success) {
                console.log(chalk.green(`\n✅ Se encontraron ${resultado.total} clientes`));

                if (resultado.data.length > 0) {
                    resultado.data.forEach((cliente, index) => {
                        const estado = cliente.activo ? chalk.green('Activo') : chalk.red('Inactivo');
                        console.log(chalk.cyan(`${index + 1}. ${cliente.nombreCompleto}`));
                        console.log(chalk.gray(`   Email: ${cliente.email}`));
                        console.log(chalk.gray(`   Teléfono: ${cliente.telefono}`));
                        console.log(chalk.gray(`   Estado: ${estado}`));
                        console.log(chalk.gray(`   ID: ${cliente.clienteId}\n`));
                    });
                } else {
                    console.log(chalk.yellow('No se encontraron clientes que coincidan con la búsqueda.'));
                }
            }

        } catch (error) {
            console.log(chalk.red('\n❌ Error al buscar clientes:'));
            console.log(chalk.red(error.message));
        }

        await this.pausar();
    }

    /**
     * Actualiza un cliente existente
     */
    async actualizarCliente() {
        console.log(chalk.blue('\n✏️  ACTUALIZAR CLIENTE'));
        console.log(chalk.gray('=====================\n'));

        try {
            // Primero buscar el cliente
            const busqueda = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'termino',
                    message: 'Ingresa el nombre, email o ID del cliente a actualizar:',
                    validate: (input) => {
                        if (!input || input.trim().length < 2) {
                            return 'El término de búsqueda debe tener al menos 2 caracteres';
                        }
                        return true;
                    }
                }
            ]);

            console.log(chalk.yellow('\n⏳ Buscando cliente...'));

            const resultadoBusqueda = await this.clienteService.buscarClientes(busqueda.termino);

            if (!resultadoBusqueda.success || resultadoBusqueda.data.length === 0) {
                console.log(chalk.red('No se encontró el cliente.'));
                await this.pausar();
                return;
            }

            // Seleccionar cliente si hay múltiples resultados
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
                        message: 'Selecciona el cliente a actualizar:',
                        choices: opciones
                    }
                ]);

                clienteSeleccionado = resultadoBusqueda.data.find(c => c.clienteId === seleccion.clienteId);
            }

            // Mostrar datos actuales
            console.log(chalk.blue('\n📋 Datos actuales del cliente:'));
            console.log(chalk.gray(`Nombre: ${clienteSeleccionado.nombreCompleto}`));
            console.log(chalk.gray(`Email: ${clienteSeleccionado.email}`));
            console.log(chalk.gray(`Teléfono: ${clienteSeleccionado.telefono}`));
            console.log(chalk.gray(`Estado: ${clienteSeleccionado.activo ? 'Activo' : 'Inactivo'}\n`));

            // Campos a actualizar
            const camposActualizar = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'nombre',
                    message: 'Nuevo nombre (presiona Enter para mantener actual):',
                    default: clienteSeleccionado.nombreCompleto.split(' ')[0]
                },
                {
                    type: 'input',
                    name: 'apellido',
                    message: 'Nuevo apellido (presiona Enter para mantener actual):',
                    default: clienteSeleccionado.nombreCompleto.split(' ')[1] || ''
                },
                {
                    type: 'input',
                    name: 'email',
                    message: 'Nuevo email (presiona Enter para mantener actual):',
                    default: clienteSeleccionado.email
                },
                {
                    type: 'input',
                    name: 'telefono',
                    message: 'Nuevo teléfono (presiona Enter para mantener actual):',
                    default: clienteSeleccionado.telefono
                },
                {
                    type: 'list',
                    name: 'activo',
                    message: 'Estado del cliente:',
                    choices: [
                        { name: 'Activo', value: true },
                        { name: 'Inactivo', value: false }
                    ],
                    default: clienteSeleccionado.activo ? 0 : 1
                }
            ]);

            // Filtrar campos que realmente cambiaron
            const datosActualizados = {};
            if (camposActualizar.nombre !== clienteSeleccionado.nombreCompleto.split(' ')[0]) {
                datosActualizados.nombre = camposActualizar.nombre;
            }
            if (camposActualizar.apellido !== (clienteSeleccionado.nombreCompleto.split(' ')[1] || '')) {
                datosActualizados.apellido = camposActualizar.apellido;
            }
            if (camposActualizar.email !== clienteSeleccionado.email) {
                datosActualizados.email = camposActualizar.email;
            }
            if (camposActualizar.telefono !== clienteSeleccionado.telefono) {
                datosActualizados.telefono = camposActualizar.telefono;
            }
            if (camposActualizar.activo !== clienteSeleccionado.activo) {
                datosActualizados.activo = camposActualizar.activo;
            }

            if (Object.keys(datosActualizados).length === 0) {
                console.log(chalk.yellow('No hay cambios para aplicar.'));
                await this.pausar();
                return;
            }

            console.log(chalk.yellow('\n⏳ Actualizando cliente...'));

            const resultado = await this.clienteService.actualizarCliente(clienteSeleccionado.clienteId, datosActualizados);

            if (resultado.success) {
                console.log(chalk.green('\n✅ ¡Cliente actualizado exitosamente!'));
                console.log(chalk.gray('Datos actualizados:'));
                Object.keys(datosActualizados).forEach(campo => {
                    console.log(chalk.gray(`- ${campo}: ${datosActualizados[campo]}`));
                });
            }

        } catch (error) {
            console.log(chalk.red('\n❌ Error al actualizar cliente:'));
            console.log(chalk.red(error.message));
        }

        await this.pausar();
    }

    /**
     * Elimina un cliente
     */
    async eliminarCliente() {
        console.log(chalk.blue('\n🗑️  ELIMINAR CLIENTE'));
        console.log(chalk.gray('====================\n'));

        try {
            // Buscar cliente
            const busqueda = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'termino',
                    message: 'Ingresa el nombre, email o ID del cliente a eliminar:',
                    validate: (input) => {
                        if (!input || input.trim().length < 2) {
                            return 'El término de búsqueda debe tener al menos 2 caracteres';
                        }
                        return true;
                    }
                }
            ]);

            console.log(chalk.yellow('\n⏳ Buscando cliente...'));

            const resultadoBusqueda = await this.clienteService.buscarClientes(busqueda.termino);

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
                        message: 'Selecciona el cliente a eliminar:',
                        choices: opciones
                    }
                ]);

                clienteSeleccionado = resultadoBusqueda.data.find(c => c.clienteId === seleccion.clienteId);
            }

            // Mostrar información del cliente
            console.log(chalk.red('\n⚠️  INFORMACIÓN DEL CLIENTE A ELIMINAR:'));
            console.log(chalk.gray(`Nombre: ${clienteSeleccionado.nombreCompleto}`));
            console.log(chalk.gray(`Email: ${clienteSeleccionado.email}`));
            console.log(chalk.gray(`Teléfono: ${clienteSeleccionado.telefono}`));
            console.log(chalk.gray(`Planes asignados: ${clienteSeleccionado.cantidadPlanes}`));

            // Confirmación
            const confirmacion = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'confirmar',
                    message: '¿Estás seguro de que deseas eliminar este cliente?',
                    default: false
                }
            ]);

            if (!confirmacion.confirmar) {
                console.log(chalk.yellow('Operación cancelada.'));
                await this.pausar();
                return;
            }

            // Opción de eliminación forzada si tiene planes
            let forzarEliminacion = false;
            if (clienteSeleccionado.cantidadPlanes > 0) {
                const forzar = await inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'forzar',
                        message: 'El cliente tiene planes asignados. ¿Deseas forzar la eliminación?',
                        default: false
                    }
                ]);
                forzarEliminacion = forzar.forzar;
            }

            console.log(chalk.yellow('\n⏳ Eliminando cliente...'));

            const resultado = await this.clienteService.eliminarCliente(clienteSeleccionado.clienteId, forzarEliminacion);

            if (resultado.success) {
                console.log(chalk.green('\n✅ ¡Cliente eliminado exitosamente!'));
                if (forzarEliminacion) {
                    console.log(chalk.yellow('Se desasociaron todos los planes del cliente.'));
                }
            }

        } catch (error) {
            console.log(chalk.red('\n❌ Error al eliminar cliente:'));
            console.log(chalk.red(error.message));
        }

        await this.pausar();
    }

    /**
     * Muestra estadísticas de clientes
     */
    async mostrarEstadisticas() {
        console.log(chalk.blue('\n📊 ESTADÍSTICAS DE CLIENTES'));
        console.log(chalk.gray('===========================\n'));

        try {
            console.log(chalk.yellow('\n⏳ Cargando estadísticas...'));

            const estadisticas = await this.clienteService.obtenerEstadisticasClientes();

            if (estadisticas.success) {
                const stats = estadisticas.data;
                
                console.log(chalk.green('\n📈 RESUMEN GENERAL:'));
                console.log(chalk.gray(`Total de clientes: ${chalk.cyan(stats.totalClientes)}`));
                console.log(chalk.gray(`Clientes activos: ${chalk.green(stats.clientesActivos)}`));
                console.log(chalk.gray(`Clientes inactivos: ${chalk.red(stats.clientesInactivos)}`));
                console.log(chalk.gray(`Clientes con planes: ${chalk.blue(stats.clientesConPlanes)}`));
                console.log(chalk.gray(`Clientes sin planes: ${chalk.yellow(stats.clientesSinPlanes)}`));

                if (stats.registrosPorMes && stats.registrosPorMes.length > 0) {
                    console.log(chalk.green('\n📅 REGISTROS POR MES (Últimos 12 meses):'));
                    stats.registrosPorMes.forEach(registro => {
                        const fecha = `${registro._id.year}/${registro._id.month.toString().padStart(2, '0')}`;
                        console.log(chalk.gray(`${fecha}: ${chalk.cyan(registro.count)} clientes`));
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
     * Gestiona planes de un cliente (placeholder)
     */
    async gestionarPlanesCliente() {
        console.log(chalk.blue('\n🔗 GESTIONAR PLANES DEL CLIENTE'));
        console.log(chalk.gray('================================\n'));
        console.log(chalk.yellow('Esta funcionalidad estará disponible próximamente...'));
        console.log(chalk.gray('Aquí podrás asociar y desasociar planes de entrenamiento a los clientes.\n'));

        await this.pausar();
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

module.exports = ClienteCLI;
