const inquirer = require('inquirer');
const chalk = require('chalk');
const { SeguimientoService, ClienteService, ContratoService } = require('../services/index');
const { ObjectId } = require('mongodb');
const dayjs = require('dayjs');

/**
 * CLI para Gestión de Seguimiento Físico
 * Implementa interfaz interactiva para todas las operaciones de seguimiento
 */
class SeguimientoCLI {
    constructor(db) {
        this.seguimientoService = new SeguimientoService(db);
        this.clienteService = new ClienteService(db);
        this.contratoService = new ContratoService(db);
    }

    /**
     * Muestra el menú principal de gestión de seguimientos
     */
    async mostrarMenuSeguimientos() {
        console.log(chalk.blue('\n📊 GESTIÓN DE SEGUIMIENTO FÍSICO'));
        console.log(chalk.gray('==================================\n'));

        const { opcion } = await inquirer.prompt([
            {
                type: 'list',
                name: 'opcion',
                message: 'Selecciona una opción:',
                choices: [
                    { name: '📝 Registrar Seguimiento', value: 'registrar' },
                    { name: '📋 Listar Seguimientos', value: 'listar' },
                    { name: '🔍 Buscar Seguimiento', value: 'buscar' },
                    { name: '✏️  Actualizar Seguimiento', value: 'actualizar' },
                    { name: '❌ Eliminar Seguimiento', value: 'eliminar' },
                    { name: '📈 Ver Progreso de Cliente', value: 'progreso' },
                    { name: '📊 Ver Estadísticas', value: 'estadisticas' },
                    { name: '🔙 Volver al Menú Principal', value: 'volver' }
                ]
            }
        ]);

        switch (opcion) {
            case 'registrar':
                await this.registrarSeguimiento();
                break;
            case 'listar':
                await this.listarSeguimientos();
                break;
            case 'buscar':
                await this.buscarSeguimiento();
                break;
            case 'actualizar':
                await this.actualizarSeguimiento();
                break;
            case 'eliminar':
                await this.eliminarSeguimiento();
                break;
            case 'progreso':
                await this.verProgresoCliente();
                break;
            case 'estadisticas':
                await this.verEstadisticas();
                break;
            case 'volver':
                return;
        }

        // Volver al menú de seguimientos
        await this.mostrarMenuSeguimientos();
    }

    /**
     * Registra un nuevo seguimiento
     */
    async registrarSeguimiento() {
        try {
            console.log(chalk.blue('\n📝 REGISTRAR NUEVO SEGUIMIENTO'));
            console.log(chalk.gray('================================\n'));

            // Buscar cliente
            const { busqueda } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'busqueda',
                    message: 'Ingresa el nombre, email o ID del cliente:',
                    validate: input => (input && input.trim()) ? true : 'Debe ingresar un término de búsqueda'
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

            // Buscar contratos activos del cliente
            console.log(chalk.yellow('\n⏳ Buscando contratos activos...'));
            const contratosResultado = await this.contratoService.listarContratos({ 
                clienteId: cliente.clienteId,
                estado: 'vigente'
            });

            if (!contratosResultado.success || contratosResultado.data.length === 0) {
                console.log(chalk.red('El cliente no tiene contratos activos.'));
                return;
            }

            const contrato = contratosResultado.data[0];
            console.log(chalk.green('\n📋 CONTRATO ACTIVO:'));
            console.log(`ID: ${contrato._id}`);
            console.log(`Plan: ${contrato.plan?.nombre}`);
            console.log(`Estado: ${contrato.estado}`);
            console.log(`Inicio: ${dayjs(contrato.fechaInicio).format('DD/MM/YYYY')}`);
            console.log(`Fin: ${dayjs(contrato.fechaFin).format('DD/MM/YYYY')}`);

            // Datos del seguimiento
            const datosSeguimiento = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'fecha',
                    message: 'Fecha del seguimiento (YYYY-MM-DD):',
                    default: dayjs().format('YYYY-MM-DD'),
                    validate: input => {
                        const fecha = dayjs(input);
                        return fecha.isValid() ? true : 'Formato de fecha inválido';
                    }
                },
                {
                    type: 'input',
                    name: 'peso',
                    message: 'Peso (kg) - opcional:',
                    validate: input => {
                        if (!input || input === '') return true; // Campo opcional
                        const peso = parseFloat(input);
                        if (isNaN(peso)) return 'Debe ser un número válido (ej: 75.5)';
                        if (peso <= 0) return 'El peso debe ser mayor a 0';
                        if (peso > 500) return 'El peso no puede ser mayor a 500 kg';
                        return true;
                    },
                    filter: input => {
                        if (!input || input === '') return null;
                        const peso = parseFloat(input);
                        return !isNaN(peso) ? peso : null;
                    }
                },
                {
                    type: 'input',
                    name: 'grasaCorporal',
                    message: 'Grasa corporal (%) - opcional:',
                    validate: input => {
                        if (!input || input === '') return true; // Campo opcional
                        const grasa = parseFloat(input);
                        if (isNaN(grasa)) return 'Debe ser un número válido (ej: 15.5)';
                        if (grasa < 0) return 'La grasa corporal no puede ser negativa';
                        if (grasa > 100) return 'La grasa corporal no puede ser mayor a 100%';
                        return true;
                    },
                    filter: input => {
                        if (!input || input === '') return null;
                        const grasa = parseFloat(input);
                        return !isNaN(grasa) ? grasa : null;
                    }
                },
                {
                    type: 'input',
                    name: 'cintura',
                    message: 'Circunferencia de cintura (cm) - opcional:',
                    validate: input => {
                        if (!input || input === '') return true;
                        const medida = parseFloat(input);
                        if (isNaN(medida)) return 'Debe ser un número válido (ej: 85.5)';
                        if (medida <= 0) return 'La medida debe ser mayor a 0';
                        if (medida > 200) return 'La medida no puede ser mayor a 200 cm';
                        return true;
                    },
                    filter: input => {
                        if (!input || input === '') return null;
                        const medida = parseFloat(input);
                        return !isNaN(medida) ? medida : null;
                    }
                },
                {
                    type: 'input',
                    name: 'brazo',
                    message: 'Circunferencia de brazo (cm) - opcional:',
                    validate: input => {
                        if (!input || input === '') return true;
                        const medida = parseFloat(input);
                        if (isNaN(medida)) return 'Debe ser un número válido (ej: 85.5)';
                        if (medida <= 0) return 'La medida debe ser mayor a 0';
                        if (medida > 200) return 'La medida no puede ser mayor a 200 cm';
                        return true;
                    },
                    filter: input => {
                        if (!input || input === '') return null;
                        const medida = parseFloat(input);
                        return !isNaN(medida) ? medida : null;
                    }
                },
                {
                    type: 'input',
                    name: 'pecho',
                    message: 'Circunferencia de pecho (cm) - opcional:',
                    validate: input => {
                        if (!input || input === '') return true;
                        const medida = parseFloat(input);
                        if (isNaN(medida)) return 'Debe ser un número válido (ej: 85.5)';
                        if (medida <= 0) return 'La medida debe ser mayor a 0';
                        if (medida > 200) return 'La medida no puede ser mayor a 200 cm';
                        return true;
                    },
                    filter: input => {
                        if (!input || input === '') return null;
                        const medida = parseFloat(input);
                        return !isNaN(medida) ? medida : null;
                    }
                },
                {
                    type: 'input',
                    name: 'comentarios',
                    message: 'Comentarios y observaciones:',
                    validate: input => {
                        if (input.length > 1000) {
                            return 'Los comentarios no pueden exceder 1000 caracteres';
                        }
                        return true;
                    }
                }
            ]);

            // Construir objeto de medidas
            const medidas = {};
            if (datosSeguimiento.cintura) medidas.cintura = datosSeguimiento.cintura;
            if (datosSeguimiento.brazo) medidas.brazo = datosSeguimiento.brazo;
            if (datosSeguimiento.pecho) medidas.pecho = datosSeguimiento.pecho;

            console.log(chalk.yellow('\n⏳ Registrando seguimiento...'));

            const resultado = await this.seguimientoService.crearSeguimiento({
                clienteId: cliente.clienteId,
                contratoId: contrato._id,
                fecha: new Date(datosSeguimiento.fecha),
                peso: datosSeguimiento.peso,
                grasaCorporal: datosSeguimiento.grasaCorporal,
                medidas: medidas,
                comentarios: datosSeguimiento.comentarios
            });

            if (resultado.success) {
                console.log(chalk.green('✅ Seguimiento registrado exitosamente'));
                console.log(chalk.gray(`ID del seguimiento: ${resultado.seguimientoId}`));
            }

        } catch (error) {
            console.log(chalk.red(`❌ Error al registrar seguimiento: ${error.message}`));
        }
    }

    /**
     * Lista seguimientos con filtros
     */
    async listarSeguimientos() {
        try {
            console.log(chalk.blue('\n📋 LISTAR SEGUIMIENTOS'));
            console.log(chalk.gray('======================\n'));

            const { filtro } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'filtro',
                    message: 'Selecciona el tipo de filtro:',
                    choices: [
                        { name: 'Todos los seguimientos', value: 'todos' },
                        { name: 'Por cliente', value: 'cliente' },
                        { name: 'Por rango de fechas', value: 'fechas' },
                        { name: 'Con medidas', value: 'medidas' },
                        { name: 'Con fotos', value: 'fotos' }
                    ]
                }
            ]);

            let filtros = {};
            let opciones = { limit: 20, sort: { fecha: -1 } };

            if (filtro === 'cliente') {
                const { busqueda } = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'busqueda',
                        message: 'Ingresa el nombre, email o ID del cliente:',
                        validate: input => (input && input.trim()) ? true : 'Debe ingresar un término de búsqueda'
                    }
                ]);

                const resultadoBusqueda = await this.clienteService.buscarClientes(busqueda);
                if (!resultadoBusqueda.success || resultadoBusqueda.data.length === 0) {
                    console.log(chalk.red('No se encontró el cliente.'));
                    return;
                }

                filtros.clienteId = resultadoBusqueda.data[0].clienteId;
            } else if (filtro === 'fechas') {
                const { fechaInicio, fechaFin } = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'fechaInicio',
                        message: 'Fecha de inicio (YYYY-MM-DD):',
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
                    }
                ]);

                filtros.fecha = {
                    $gte: new Date(fechaInicio),
                    $lte: new Date(fechaFin)
                };
            } else if (filtro === 'medidas') {
                filtros.medidas = { $exists: true, $ne: {} };
            } else if (filtro === 'fotos') {
                filtros.fotos = { $exists: true, $ne: [] };
            }

            console.log(chalk.yellow('\n⏳ Cargando seguimientos...'));

            const resultado = await this.seguimientoService.listarSeguimientos(filtros, opciones);

            if (resultado.success && resultado.data.length > 0) {
                console.log(chalk.green(`\n📋 Se encontraron ${resultado.data.length} seguimientos:\n`));
                
                resultado.data.forEach((seguimiento, index) => {
                    console.log(chalk.cyan(`${index + 1}. SEGUIMIENTO #${seguimiento.seguimientoId}`));
                    console.log(`   Cliente: ${seguimiento.cliente?.nombre} ${seguimiento.cliente?.apellido}`);
                    console.log(`   Fecha: ${dayjs(seguimiento.fecha).format('DD/MM/YYYY')}`);
                    if (seguimiento.peso) console.log(`   Peso: ${seguimiento.peso} kg`);
                    if (seguimiento.grasaCorporal) console.log(`   Grasa: ${seguimiento.grasaCorporal}%`);
                    if (Object.keys(seguimiento.medidas).length > 0) {
                        console.log(`   Medidas: ${Object.keys(seguimiento.medidas).join(', ')}`);
                    }
                    console.log(chalk.gray('   ──────────────────────────────────────'));
                });
            } else {
                console.log(chalk.yellow('No se encontraron seguimientos con los filtros especificados.'));
            }

        } catch (error) {
            console.log(chalk.red(`❌ Error al listar seguimientos: ${error.message}`));
        }
    }

    /**
     * Busca un seguimiento específico
     */
    async buscarSeguimiento() {
        try {
            console.log(chalk.blue('\n🔍 BUSCAR SEGUIMIENTO'));
            console.log(chalk.gray('====================\n'));

            // Obtener todos los seguimientos para mostrar opciones
            const resultado = await this.seguimientoService.listarSeguimientos({}, { limit: 50 });
            
            if (!resultado.success || resultado.data.length === 0) {
                console.log(chalk.yellow('No hay seguimientos disponibles.'));
                return;
            }

            // Crear opciones para seleccionar
            const opciones = resultado.data.map((seguimiento, index) => ({
                name: `${index + 1}. ${seguimiento.cliente?.nombre} ${seguimiento.cliente?.apellido} - ${dayjs(seguimiento.fecha).format('DD/MM/YYYY')}`,
                value: seguimiento.seguimientoId
            }));

            const { seguimientoId } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'seguimientoId',
                    message: 'Selecciona el seguimiento a ver:',
                    choices: opciones
                }
            ]);

            console.log(chalk.yellow('\n⏳ Obteniendo información del seguimiento...'));

            const seguimientoResultado = await this.seguimientoService.obtenerSeguimiento(seguimientoId);

            if (seguimientoResultado.success) {
                const seguimiento = seguimientoResultado.data;
                console.log(chalk.green('\n📋 INFORMACIÓN DEL SEGUIMIENTO:'));
                console.log(`ID: ${seguimiento.seguimientoId}`);
                console.log(`Cliente: ${seguimiento.cliente?.nombre} ${seguimiento.cliente?.apellido}`);
                console.log(`Email: ${seguimiento.cliente?.email}`);
                console.log(`Fecha: ${dayjs(seguimiento.fecha).format('DD/MM/YYYY')}`);
                if (seguimiento.peso) console.log(`Peso: ${seguimiento.peso} kg`);
                if (seguimiento.grasaCorporal) console.log(`Grasa corporal: ${seguimiento.grasaCorporal}%`);
                if (Object.keys(seguimiento.medidas).length > 0) {
                    console.log('\n📏 MEDIDAS:');
                    Object.entries(seguimiento.medidas).forEach(([tipo, valor]) => {
                        console.log(`   ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}: ${valor} cm`);
                    });
                }
                if (seguimiento.comentarios) {
                    console.log(`\n💬 Comentarios: ${seguimiento.comentarios}`);
                }
            }

        } catch (error) {
            console.log(chalk.red(`❌ Error al buscar seguimiento: ${error.message}`));
        }
    }

    /**
     * Actualiza un seguimiento
     */
    async actualizarSeguimiento() {
        try {
            console.log(chalk.blue('\n✏️  ACTUALIZAR SEGUIMIENTO'));
            console.log(chalk.gray('==========================\n'));

            // Obtener todos los seguimientos para mostrar opciones
            const resultado = await this.seguimientoService.listarSeguimientos({}, { limit: 50 });
            
            if (!resultado.success || resultado.data.length === 0) {
                console.log(chalk.yellow('No hay seguimientos disponibles.'));
                return;
            }

            // Crear opciones para seleccionar
            const opciones = resultado.data.map((seguimiento, index) => ({
                name: `${index + 1}. ${seguimiento.cliente?.nombre} ${seguimiento.cliente?.apellido} - ${dayjs(seguimiento.fecha).format('DD/MM/YYYY')}`,
                value: seguimiento.seguimientoId
            }));

            const { seguimientoId } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'seguimientoId',
                    message: 'Selecciona el seguimiento a actualizar:',
                    choices: opciones
                }
            ]);

            // Obtener seguimiento actual
            const seguimientoActual = await this.seguimientoService.obtenerSeguimiento(seguimientoId);
            if (!seguimientoActual.success) {
                console.log(chalk.red('Seguimiento no encontrado.'));
                return;
            }

            const seguimiento = seguimientoActual.data;
            console.log(chalk.green('\n📋 SEGUIMIENTO ACTUAL:'));
            console.log(`Cliente: ${seguimiento.cliente?.nombre} ${seguimiento.cliente?.apellido}`);
            console.log(`Fecha: ${dayjs(seguimiento.fecha).format('DD/MM/YYYY')}`);
            if (seguimiento.peso) console.log(`Peso: ${seguimiento.peso} kg`);
            if (seguimiento.grasaCorporal) console.log(`Grasa: ${seguimiento.grasaCorporal}%`);

            // Mostrar información completa del seguimiento actual
            console.log(chalk.cyan('\n📊 DATOS ACTUALES:'));
            console.log(`Fecha: ${dayjs(seguimiento.fecha).format('DD/MM/YYYY')}`);
            if (seguimiento.peso) console.log(`Peso: ${seguimiento.peso} kg`);
            if (seguimiento.grasaCorporal) console.log(`Grasa corporal: ${seguimiento.grasaCorporal}%`);
            
            if (Object.keys(seguimiento.medidas).length > 0) {
                console.log('\n📏 Medidas actuales:');
                Object.entries(seguimiento.medidas).forEach(([tipo, valor]) => {
                    console.log(`   ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}: ${valor} cm`);
                });
            }
            
            if (seguimiento.fotos.length > 0) {
                console.log(`\n📸 Fotos: ${seguimiento.fotos.length} registradas`);
            }
            
            if (seguimiento.comentarios) {
                console.log(`\n💬 Comentarios: ${seguimiento.comentarios}`);
            }

            const datosActualizados = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'fecha',
                    message: `Nueva fecha (actual: ${dayjs(seguimiento.fecha).format('DD/MM/YYYY')}) [YYYY-MM-DD]:`,
                    default: dayjs(seguimiento.fecha).format('YYYY-MM-DD'),
                    validate: input => {
                        if (!input || input === '') return true;
                        const fecha = dayjs(input);
                        if (!fecha.isValid()) return 'Formato de fecha inválido';
                        
                        // Verificar que no sea muy futura (más de 1 día)
                        const mañana = dayjs().add(1, 'day');
                        if (fecha.isAfter(mañana)) return 'Fecha no puede ser más de 1 día en el futuro';
                        
                        // Verificar que no sea muy antigua (más de 1 año)
                        const unAnoAtras = dayjs().subtract(1, 'year');
                        if (fecha.isBefore(unAnoAtras)) return 'Fecha no puede ser anterior a 1 año';
                        
                        return true;
                    },
                    filter: input => {
                        if (!input || input === '') return null;
                        const fecha = dayjs(input);
                        return fecha.isValid() ? fecha.toDate() : null;
                    }
                },
                {
                    type: 'input',
                    name: 'peso',
                    message: `Nuevo peso (actual: ${seguimiento.peso || 'No registrado'}) kg:`,
                    validate: input => {
                        if (!input || input === '') return true;
                        const peso = parseFloat(input);
                        return !isNaN(peso) && peso > 0 && peso <= 500 ? true : 'Peso debe ser un número entre 0 y 500 kg';
                    },
                    filter: input => {
                        if (!input || input === '') return null;
                        const peso = parseFloat(input);
                        return !isNaN(peso) ? peso : null;
                    }
                },
                {
                    type: 'input',
                    name: 'grasaCorporal',
                    message: `Nueva grasa corporal (actual: ${seguimiento.grasaCorporal || 'No registrado'}) %:`,
                    validate: input => {
                        if (!input || input === '') return true;
                        const grasa = parseFloat(input);
                        return !isNaN(grasa) && grasa >= 0 && grasa <= 100 ? true : 'Grasa corporal debe ser un número entre 0 y 100%';
                    },
                    filter: input => {
                        if (!input || input === '') return null;
                        const grasa = parseFloat(input);
                        return !isNaN(grasa) ? grasa : null;
                    }
                },
                {
                    type: 'input',
                    name: 'cintura',
                    message: `Nueva medida de cintura (actual: ${seguimiento.medidas?.cintura || 'No registrada'}) cm:`,
                    validate: input => {
                        if (!input || input === '') return true;
                        const medida = parseFloat(input);
                        if (isNaN(medida)) return 'Debe ser un número válido (ej: 85.5)';
                        if (medida <= 0) return 'La medida debe ser mayor a 0';
                        if (medida > 200) return 'La medida no puede ser mayor a 200 cm';
                        return true;
                    },
                    filter: input => {
                        if (!input || input === '') return null;
                        const medida = parseFloat(input);
                        return !isNaN(medida) && medida > 0 && medida <= 200 ? medida : null;
                    }
                },
                {
                    type: 'input',
                    name: 'brazo',
                    message: `Nueva medida de brazo (actual: ${seguimiento.medidas?.brazo || 'No registrada'}) cm:`,
                    validate: input => {
                        if (!input || input === '') return true;
                        const medida = parseFloat(input);
                        if (isNaN(medida)) return 'Debe ser un número válido (ej: 35.2)';
                        if (medida <= 0) return 'La medida debe ser mayor a 0';
                        if (medida > 200) return 'La medida no puede ser mayor a 200 cm';
                        return true;
                    },
                    filter: input => {
                        if (!input || input === '') return null;
                        const medida = parseFloat(input);
                        return !isNaN(medida) && medida > 0 && medida <= 200 ? medida : null;
                    }
                },
                {
                    type: 'input',
                    name: 'pecho',
                    message: `Nueva medida de pecho (actual: ${seguimiento.medidas?.pecho || 'No registrada'}) cm:`,
                    validate: input => {
                        if (!input || input === '') return true;
                        const medida = parseFloat(input);
                        if (isNaN(medida)) return 'Debe ser un número válido (ej: 95.8)';
                        if (medida <= 0) return 'La medida debe ser mayor a 0';
                        if (medida > 200) return 'La medida no puede ser mayor a 200 cm';
                        return true;
                    },
                    filter: input => {
                        if (!input || input === '') return null;
                        const medida = parseFloat(input);
                        return !isNaN(medida) && medida > 0 && medida <= 200 ? medida : null;
                    }
                },
                {
                    type: 'input',
                    name: 'comentarios',
                    message: `Nuevos comentarios (actual: ${seguimiento.comentarios || 'Ninguno'}):`,
                    default: seguimiento.comentarios || '',
                    validate: input => {
                        if (input && input.length > 1000) {
                            return 'Los comentarios no pueden exceder 1000 caracteres';
                        }
                        return true;
                    }
                },
                {
                    type: 'confirm',
                    name: 'gestionarFotos',
                    message: '¿Deseas gestionar las fotos del seguimiento?',
                    default: false
                }
            ]);

            // Gestionar fotos si se solicita
            let fotosActualizadas = seguimiento.fotos;
            if (datosActualizados.gestionarFotos) {
                const gestionFotos = await this.gestionarFotosSeguimiento(seguimiento.fotos);
                if (gestionFotos !== null) {
                    fotosActualizadas = gestionFotos;
                }
            }

            // Procesar cambios y construir objeto de actualización
            const cambios = {};
            
            // Campos directos
            if (datosActualizados.fecha !== null) cambios.fecha = datosActualizados.fecha;
            if (datosActualizados.peso !== null) cambios.peso = datosActualizados.peso;
            if (datosActualizados.grasaCorporal !== null) cambios.grasaCorporal = datosActualizados.grasaCorporal;
            if (datosActualizados.comentarios !== null && datosActualizados.comentarios !== '') {
                cambios.comentarios = datosActualizados.comentarios;
            }
            
            // Procesar medidas
            const medidasActualizadas = { ...seguimiento.medidas };
            if (datosActualizados.cintura !== null) medidasActualizadas.cintura = datosActualizados.cintura;
            if (datosActualizados.brazo !== null) medidasActualizadas.brazo = datosActualizados.brazo;
            if (datosActualizados.pecho !== null) medidasActualizadas.pecho = datosActualizados.pecho;
            
            // Solo agregar medidas si hay cambios
            const medidasCambiadas = Object.keys(medidasActualizadas).some(key => 
                medidasActualizadas[key] !== seguimiento.medidas?.[key]
            );
            
            if (medidasCambiadas) {
                cambios.medidas = medidasActualizadas;
            }
            
            // Agregar fotos si cambiaron
            if (fotosActualizadas !== seguimiento.fotos) {
                cambios.fotos = fotosActualizadas;
            }

            if (Object.keys(cambios).length === 0) {
                console.log(chalk.yellow('No se realizaron cambios.'));
                return;
            }

            // Mostrar resumen de cambios
            console.log(chalk.cyan('\n📝 CAMBIOS A REALIZAR:'));
            if (cambios.fecha) console.log(`   Fecha: ${dayjs(cambios.fecha).format('DD/MM/YYYY')}`);
            if (cambios.peso) console.log(`   Peso: ${cambios.peso} kg`);
            if (cambios.grasaCorporal) console.log(`   Grasa corporal: ${cambios.grasaCorporal}%`);
            if (cambios.medidas) {
                console.log('   Medidas:');
                Object.entries(cambios.medidas).forEach(([tipo, valor]) => {
                    if (valor !== seguimiento.medidas?.[tipo]) {
                        console.log(`     ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}: ${valor} cm`);
                    }
                });
            }
            if (cambios.comentarios) console.log(`   Comentarios: ${cambios.comentarios}`);
            if (cambios.fotos) {
                console.log(`   Fotos: ${cambios.fotos.length} fotos registradas`);
            }

            console.log(chalk.yellow('\n⏳ Actualizando seguimiento...'));

            const resultadoActualizacion = await this.seguimientoService.actualizarSeguimiento(seguimientoId, cambios);

            if (resultadoActualizacion.success) {
                console.log(chalk.green('✅ Seguimiento actualizado exitosamente'));
                
                // Mostrar análisis de progreso si está disponible
                if (resultadoActualizacion.analisisProgreso) {
                    this.mostrarAnalisisProgreso(resultadoActualizacion.analisisProgreso);
                }
            }

        } catch (error) {
            console.log(chalk.red(`❌ Error al actualizar seguimiento: ${error.message}`));
        }
    }

    /**
     * Elimina un seguimiento
     */
    async eliminarSeguimiento() {
        try {
            console.log(chalk.blue('\n❌ ELIMINAR SEGUIMIENTO'));
            console.log(chalk.gray('======================\n'));

            // Obtener todos los seguimientos para mostrar opciones
            const resultado = await this.seguimientoService.listarSeguimientos({}, { limit: 50 });
            
            if (!resultado.success || resultado.data.length === 0) {
                console.log(chalk.yellow('No hay seguimientos disponibles.'));
                return;
            }

            // Crear opciones para seleccionar
            const opciones = resultado.data.map((seguimiento, index) => ({
                name: `${index + 1}. ${seguimiento.cliente?.nombre} ${seguimiento.cliente?.apellido} - ${dayjs(seguimiento.fecha).format('DD/MM/YYYY')}`,
                value: seguimiento.seguimientoId
            }));

            const { seguimientoId } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'seguimientoId',
                    message: 'Selecciona el seguimiento a eliminar:',
                    choices: opciones
                }
            ]);

            // Obtener seguimiento actual
            const seguimientoActual = await this.seguimientoService.obtenerSeguimiento(seguimientoId);
            if (!seguimientoActual.success) {
                console.log(chalk.red('Seguimiento no encontrado.'));
                return;
            }

            const seguimiento = seguimientoActual.data;
            console.log(chalk.green('\n📋 INFORMACIÓN DEL SEGUIMIENTO:'));
            console.log(`Cliente: ${seguimiento.cliente?.nombre} ${seguimiento.cliente?.apellido}`);
            console.log(`Fecha: ${dayjs(seguimiento.fecha).format('DD/MM/YYYY')}`);
            if (seguimiento.peso) console.log(`Peso: ${seguimiento.peso} kg`);

            const { confirmar } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'confirmar',
                    message: '¿Estás seguro de eliminar este seguimiento?',
                    default: false
                }
            ]);

            if (!confirmar) {
                console.log(chalk.yellow('Operación cancelada.'));
                return;
            }

            console.log(chalk.yellow('\n⏳ Eliminando seguimiento...'));

            const resultadoEliminacion = await this.seguimientoService.eliminarSeguimiento(seguimientoId);

            if (resultadoEliminacion.success) {
                console.log(chalk.green('✅ Seguimiento eliminado exitosamente'));
            }

        } catch (error) {
            console.log(chalk.red(`❌ Error al eliminar seguimiento: ${error.message}`));
        }
    }

    /**
     * Gestiona las fotos de un seguimiento
     * @param {Array} fotosActuales - Fotos actuales del seguimiento
     * @returns {Promise<Array|null>} Nuevas fotos o null si se cancela
     */
    async gestionarFotosSeguimiento(fotosActuales = []) {
        try {
            console.log(chalk.blue('\n📸 GESTIÓN DE FOTOS'));
            console.log(chalk.gray('===================\n'));

            if (fotosActuales.length > 0) {
                console.log(chalk.cyan('📸 Fotos actuales:'));
                fotosActuales.forEach((foto, index) => {
                    console.log(`   ${index + 1}. ${foto.nombre || 'Sin nombre'} - ${foto.fecha || 'Sin fecha'}`);
                });
            } else {
                console.log(chalk.yellow('No hay fotos registradas.'));
            }

            const { accion } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'accion',
                    message: '¿Qué deseas hacer con las fotos?',
                    choices: [
                        { name: 'Agregar nueva foto', value: 'agregar' },
                        { name: 'Eliminar foto existente', value: 'eliminar' },
                        { name: 'Ver fotos actuales', value: 'ver' },
                        { name: 'Cancelar', value: 'cancelar' }
                    ]
                }
            ]);

            switch (accion) {
                case 'agregar':
                    return await this.agregarFotoSeguimiento(fotosActuales);
                case 'eliminar':
                    return await this.eliminarFotoSeguimiento(fotosActuales);
                case 'ver':
                    this.mostrarFotosSeguimiento(fotosActuales);
                    return fotosActuales;
                case 'cancelar':
                    return null;
            }
        } catch (error) {
            console.log(chalk.red(`❌ Error al gestionar fotos: ${error.message}`));
            return null;
        }
    }

    /**
     * Agrega una nueva foto al seguimiento
     * @param {Array} fotosActuales - Fotos actuales
     * @returns {Promise<Array>} Fotos actualizadas
     */
    async agregarFotoSeguimiento(fotosActuales) {
        const nuevaFoto = await inquirer.prompt([
            {
                type: 'input',
                name: 'nombre',
                message: 'Nombre de la foto:',
                validate: input => {
                    if (!input || input.trim() === '') {
                        return 'El nombre de la foto es requerido';
                    }
                    if (input.length > 100) {
                        return 'El nombre no puede exceder 100 caracteres';
                    }
                    return true;
                }
            },
            {
                type: 'input',
                name: 'descripcion',
                message: 'Descripción de la foto (opcional):',
                validate: input => {
                    if (input && input.length > 500) {
                        return 'La descripción no puede exceder 500 caracteres';
                    }
                    return true;
                }
            },
            {
                type: 'input',
                name: 'fecha',
                message: 'Fecha de la foto [YYYY-MM-DD] (opcional, por defecto hoy):',
                default: dayjs().format('YYYY-MM-DD'),
                validate: input => {
                    if (!input || input === '') return true;
                    const fecha = dayjs(input);
                    return fecha.isValid() ? true : 'Formato de fecha inválido';
                },
                filter: input => {
                    if (!input || input === '') return dayjs().format('YYYY-MM-DD');
                    const fecha = dayjs(input);
                    return fecha.isValid() ? fecha.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');
                }
            }
        ]);

        const foto = {
            fotoId: `foto_${Date.now()}`,
            nombre: nuevaFoto.nombre.trim(),
            descripcion: nuevaFoto.descripcion?.trim() || '',
            fecha: nuevaFoto.fecha,
            fechaRegistro: dayjs().format('YYYY-MM-DD HH:mm:ss')
        };

        const fotosActualizadas = [...fotosActuales, foto];
        console.log(chalk.green(`✅ Foto "${foto.nombre}" agregada exitosamente`));
        
        return fotosActualizadas;
    }

    /**
     * Elimina una foto del seguimiento
     * @param {Array} fotosActuales - Fotos actuales
     * @returns {Promise<Array>} Fotos actualizadas
     */
    async eliminarFotoSeguimiento(fotosActuales) {
        if (fotosActuales.length === 0) {
            console.log(chalk.yellow('No hay fotos para eliminar.'));
            return fotosActuales;
        }

        const opciones = fotosActuales.map((foto, index) => ({
            name: `${index + 1}. ${foto.nombre} - ${foto.fecha}`,
            value: index
        }));

        const { indiceFoto } = await inquirer.prompt([
            {
                type: 'list',
                name: 'indiceFoto',
                message: 'Selecciona la foto a eliminar:',
                choices: opciones
            }
        ]);

        const fotoEliminada = fotosActuales[indiceFoto];
        const fotosActualizadas = fotosActuales.filter((_, index) => index !== indiceFoto);
        
        console.log(chalk.green(`✅ Foto "${fotoEliminada.nombre}" eliminada exitosamente`));
        
        return fotosActualizadas;
    }

    /**
     * Muestra las fotos del seguimiento
     * @param {Array} fotos - Fotos a mostrar
     */
    mostrarFotosSeguimiento(fotos) {
        if (fotos.length === 0) {
            console.log(chalk.yellow('No hay fotos registradas.'));
            return;
        }

        console.log(chalk.cyan('\n📸 FOTOS DEL SEGUIMIENTO:'));
        fotos.forEach((foto, index) => {
            console.log(`\n${index + 1}. ${foto.nombre}`);
            console.log(`   Fecha: ${foto.fecha}`);
            if (foto.descripcion) {
                console.log(`   Descripción: ${foto.descripcion}`);
            }
            console.log(`   Registrada: ${foto.fechaRegistro}`);
        });
    }

    /**
     * Muestra el análisis de progreso después de actualizar un seguimiento
     * @param {Object} analisisProgreso - Análisis de progreso
     */
    mostrarAnalisisProgreso(analisisProgreso) {
        console.log(chalk.cyan('\n📊 ANÁLISIS DE PROGRESO'));
        console.log(chalk.gray('========================\n'));

        if (analisisProgreso.tipo === 'primera_actualizacion') {
            console.log(chalk.yellow(analisisProgreso.mensaje));
            return;
        }

        if (analisisProgreso.tipo === 'sin_comparacion') {
            console.log(chalk.yellow(analisisProgreso.mensaje));
            return;
        }

        if (analisisProgreso.tipo === 'error_analisis') {
            console.log(chalk.red(analisisProgreso.mensaje));
            return;
        }

        if (analisisProgreso.tipo === 'analisis_completo') {
            const { analisis, resumen } = analisisProgreso;
            
            // Mostrar resumen general
            console.log(chalk.blue(resumen));
            console.log('');

            // Mostrar análisis detallado
            this.mostrarAnalisisDetallado(analisis);
        }
    }

    /**
     * Muestra el análisis detallado del progreso
     * @param {Object} analisis - Análisis detallado
     */
    mostrarAnalisisDetallado(analisis) {
        // Análisis de peso
        if (analisis.peso && analisis.peso.estado !== 'sinCambio') {
            console.log(chalk.cyan('⚖️ PESO:'));
            console.log(`   Anterior: ${analisis.peso.anterior} kg`);
            console.log(`   Actual: ${analisis.peso.actual} kg`);
            console.log(`   Diferencia: ${analisis.peso.diferencia > 0 ? '+' : ''}${analisis.peso.diferencia.toFixed(1)} kg (${analisis.peso.porcentaje.toFixed(1)}%)`);
            
            const colorPeso = analisis.peso.estado === 'mejora' ? chalk.green : chalk.red;
            console.log(colorPeso(`   ${analisis.peso.mensaje}`));
            console.log('');
        }

        // Análisis de grasa corporal
        if (analisis.grasaCorporal && analisis.grasaCorporal.estado !== 'sinCambio') {
            console.log(chalk.cyan('🔥 GRASA CORPORAL:'));
            console.log(`   Anterior: ${analisis.grasaCorporal.anterior}%`);
            console.log(`   Actual: ${analisis.grasaCorporal.actual}%`);
            console.log(`   Diferencia: ${analisis.grasaCorporal.diferencia > 0 ? '+' : ''}${analisis.grasaCorporal.diferencia.toFixed(1)}% (${analisis.grasaCorporal.porcentaje.toFixed(1)}%)`);
            
            const colorGrasa = analisis.grasaCorporal.estado === 'mejora' ? chalk.green : chalk.red;
            console.log(colorGrasa(`   ${analisis.grasaCorporal.mensaje}`));
            console.log('');
        }

        // Análisis de medidas
        const medidas = ['cintura', 'brazo', 'pecho'];
        medidas.forEach(medida => {
            if (analisis.medidas[medida] && analisis.medidas[medida].estado !== 'sinCambio') {
                const nombreMedida = medida.charAt(0).toUpperCase() + medida.slice(1);
                console.log(chalk.cyan(`📏 ${nombreMedida.toUpperCase()}:`));
                console.log(`   Anterior: ${analisis.medidas[medida].anterior} cm`);
                console.log(`   Actual: ${analisis.medidas[medida].actual} cm`);
                console.log(`   Diferencia: ${analisis.medidas[medida].diferencia > 0 ? '+' : ''}${analisis.medidas[medida].diferencia.toFixed(1)} cm (${analisis.medidas[medida].porcentaje.toFixed(1)}%)`);
                
                const colorMedida = analisis.medidas[medida].estado === 'mejora' ? chalk.green : chalk.red;
                console.log(colorMedida(`   ${analisis.medidas[medida].mensaje}`));
                console.log('');
            }
        });

        // Resumen estadístico
        console.log(chalk.blue('📈 RESUMEN ESTADÍSTICO:'));
        console.log(`   Mejoras: ${analisis.resumen.mejoras}`);
        console.log(`   Empeoramientos: ${analisis.resumen.empeoramientos}`);
        console.log(`   Sin cambios: ${analisis.resumen.sinCambios}`);
    }

    /**
     * Muestra el progreso de un cliente
     */
    async verProgresoCliente() {
        try {
            console.log(chalk.blue('\n📈 PROGRESO DE CLIENTE'));
            console.log(chalk.gray('======================\n'));

            // Buscar cliente
            const { busqueda } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'busqueda',
                    message: 'Ingresa el nombre, email o ID del cliente:',
                    validate: input => (input && input.trim()) ? true : 'Debe ingresar un término de búsqueda'
                }
            ]);

            console.log(chalk.yellow('\n⏳ Buscando cliente...'));

            const resultadoBusqueda = await this.clienteService.buscarClientes(busqueda);
            if (!resultadoBusqueda.success || resultadoBusqueda.data.length === 0) {
                console.log(chalk.red('No se encontró el cliente.'));
                return;
            }

            const cliente = resultadoBusqueda.data[0];
            console.log(chalk.green('\n📋 CLIENTE:'));
            console.log(`Nombre: ${cliente.nombreCompleto}`);
            console.log(`Email: ${cliente.email}`);

            console.log(chalk.yellow('\n⏳ Cargando progreso...'));

            const resultado = await this.seguimientoService.obtenerProgresoPeso(cliente.clienteId);

            if (resultado.success) {
                const progreso = resultado.data;
                console.log(chalk.green('\n📈 PROGRESO DE PESO:'));
                
                if (progreso.progreso.length === 0) {
                    console.log(chalk.yellow('No hay datos de peso registrados.'));
                } else {
                    console.log(`Peso inicial: ${progreso.pesoInicial} kg`);
                    console.log(`Peso actual: ${progreso.pesoActual} kg`);
                    console.log(`Diferencia: ${progreso.diferencia > 0 ? '+' : ''}${progreso.diferencia} kg`);
                    console.log(`Tendencia: ${this.getTendenciaText(progreso.tendencia)}`);
                    
                    console.log('\n📊 HISTORIAL:');
                    progreso.progreso.forEach((registro, index) => {
                        console.log(`   ${index + 1}. ${dayjs(registro.fecha).format('DD/MM/YYYY')}: ${registro.peso} kg`);
                    });
                }
            }

        } catch (error) {
            console.log(chalk.red(`❌ Error al obtener progreso: ${error.message}`));
        }
    }

    /**
     * Muestra estadísticas de seguimientos
     */
    async verEstadisticas() {
        try {
            console.log(chalk.blue('\n📊 ESTADÍSTICAS DE SEGUIMIENTOS'));
            console.log(chalk.gray('==============================\n'));

            // Buscar cliente para estadísticas específicas
            const { tipoEstadisticas } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'tipoEstadisticas',
                    message: 'Selecciona el tipo de estadísticas:',
                    choices: [
                        { name: 'Estadísticas generales', value: 'generales' },
                        { name: 'Estadísticas de cliente específico', value: 'cliente' }
                    ]
                }
            ]);

            if (tipoEstadisticas === 'cliente') {
                const { busqueda } = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'busqueda',
                        message: 'Ingresa el nombre, email o ID del cliente:',
                        validate: input => (input && input.trim()) ? true : 'Debe ingresar un término de búsqueda'
                    }
                ]);

                console.log(chalk.yellow('\n⏳ Buscando cliente...'));

                const resultadoBusqueda = await this.clienteService.buscarClientes(busqueda);
                if (!resultadoBusqueda.success || resultadoBusqueda.data.length === 0) {
                    console.log(chalk.red('No se encontró el cliente.'));
                    return;
                }

                const cliente = resultadoBusqueda.data[0];
                console.log(chalk.green('\n📋 CLIENTE:'));
                console.log(`Nombre: ${cliente.nombreCompleto}`);

                console.log(chalk.yellow('\n⏳ Cargando estadísticas...'));

                const resultado = await this.seguimientoService.obtenerEstadisticasCliente(cliente.clienteId);

                if (resultado.success) {
                    const stats = resultado.data;
                    console.log(chalk.green('\n📊 ESTADÍSTICAS DEL CLIENTE:'));
                    console.log(`Total de seguimientos: ${stats.totalSeguimientos}`);
                    if (stats.pesoPromedio) {
                        console.log(`Peso promedio: ${stats.pesoPromedio.toFixed(1)} kg`);
                        console.log(`Peso mínimo: ${stats.pesoMinimo} kg`);
                        console.log(`Peso máximo: ${stats.pesoMaximo} kg`);
                    }
                    if (stats.grasaPromedio) {
                        console.log(`Grasa promedio: ${stats.grasaPromedio.toFixed(1)}%`);
                        console.log(`Grasa mínima: ${stats.grasaMinima}%`);
                        console.log(`Grasa máxima: ${stats.grasaMaxima}%`);
                    }
                    console.log(`Seguimientos con medidas: ${stats.conMedidas}`);
                    console.log(`Seguimientos con fotos: ${stats.conFotos}`);
                }
            } else {
                console.log(chalk.yellow('\n⏳ Cargando estadísticas generales...'));
                
                // Obtener estadísticas generales
                const resultado = await this.seguimientoService.listarSeguimientos();
                
                if (resultado.success) {
                    const seguimientos = resultado.data;
                    console.log(chalk.green('\n📊 ESTADÍSTICAS GENERALES:'));
                    console.log(`Total de seguimientos: ${seguimientos.length}`);
                    
                    const conPeso = seguimientos.filter(s => s.peso).length;
                    const conGrasa = seguimientos.filter(s => s.grasaCorporal).length;
                    const conMedidas = seguimientos.filter(s => Object.keys(s.medidas).length > 0).length;
                    
                    console.log(`Seguimientos con peso: ${conPeso}`);
                    console.log(`Seguimientos con grasa corporal: ${conGrasa}`);
                    console.log(`Seguimientos con medidas: ${conMedidas}`);
                }
            }

        } catch (error) {
            console.log(chalk.red(`❌ Error al obtener estadísticas: ${error.message}`));
        }
    }

    /**
     * Obtiene el texto de tendencia
     * @param {string} tendencia - Tendencia del progreso
     * @returns {string} Texto descriptivo
     */
    getTendenciaText(tendencia) {
        const tendencias = {
            'aumento': '📈 Aumento de peso',
            'disminucion': '📉 Disminución de peso',
            'estable': '➡️ Peso estable',
            'sin_datos': '❓ Sin datos suficientes'
        };
        return tendencias[tendencia] || '❓ Desconocida';
    }
}

module.exports = SeguimientoCLI;
