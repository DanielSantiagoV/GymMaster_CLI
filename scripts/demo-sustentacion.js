#!/usr/bin/env node

/**
 * DEMO FUNCIONAL PARA SUSTENTACIÓN - GYMMASTER CLI
 * 
 * Este script demuestra los principios SOLID y patrones de diseño
 * aplicados en el proyecto GymMaster CLI.
 * 
 * USO: node demo-sustentacion.js
 */

const chalk = require('chalk');
const inquirer = require('inquirer');
const { ConnectionManager } = require('./config/connection');
const { ClienteService } = require('./services');
const { BusquedaService } = require('./services');
const { ClienteIntegradoService } = require('./services');

class DemoSustentacion {
    constructor() {
        this.db = null;
        this.clienteService = null;
        this.busquedaService = null;
        this.clienteIntegradoService = null;
    }

    /**
     * Inicia la demostración
     */
    async iniciar() {
        try {
            console.log(chalk.blue.bold('\n🎤 DEMO SUSTENTACIÓN - GYMMASTER CLI'));
            console.log(chalk.gray('==========================================\n'));
            
            // Conectar a la base de datos
            await this.conectarBaseDatos();
            
            // Inicializar servicios
            this.inicializarServicios();
            
            // Mostrar menú de demostración
            await this.mostrarMenuDemo();
            
        } catch (error) {
            console.error(chalk.red('❌ Error en la demostración:'), error.message);
        }
    }

    /**
     * Conecta a la base de datos
     */
    async conectarBaseDatos() {
        console.log(chalk.yellow('🔌 Conectando a MongoDB...'));
        
        try {
            const connection = await ConnectionManager.initialize();
            this.db = connection.db;
            console.log(chalk.green('✅ Conexión exitosa a MongoDB\n'));
        } catch (error) {
            console.log(chalk.red('❌ Error de conexión:'), error.message);
            console.log(chalk.yellow('💡 Asegúrate de que MongoDB esté ejecutándose\n'));
            throw error;
        }
    }

    /**
     * Inicializa los servicios (Dependency Injection Pattern)
     */
    inicializarServicios() {
        console.log(chalk.yellow('⚙️  Inicializando servicios...'));
        
        // DIP: Depende de abstracciones, no de implementaciones concretas
        this.clienteService = new ClienteService(this.db);
        this.busquedaService = new BusquedaService(this.db);
        this.clienteIntegradoService = new ClienteIntegradoService(this.db);
        
        console.log(chalk.green('✅ Servicios inicializados\n'));
    }

    /**
     * Muestra el menú de demostración
     */
    async mostrarMenuDemo() {
        const opciones = [
            {
                type: 'list',
                name: 'demo',
                message: chalk.cyan('Selecciona una demostración:'),
                choices: [
                    {
                        name: '🔧 1. Principios SOLID - Crear Cliente (SRP)',
                        value: 'crear_cliente'
                    },
                    {
                        name: '🔍 2. Strategy Pattern - Búsqueda Inteligente',
                        value: 'buscar_cliente'
                    },
                    {
                        name: '🏗️ 3. Facade Pattern - Cliente Completo',
                        value: 'cliente_completo'
                    },
                    {
                        name: '📊 4. Service Layer - Estadísticas',
                        value: 'estadisticas'
                    },
                    {
                        name: '🎯 5. Demo Completa (Recomendada)',
                        value: 'demo_completa'
                    },
                    {
                        name: '❌ Salir',
                        value: 'salir'
                    }
                ]
            }
        ];

        const respuesta = await inquirer.prompt(opciones);
        await this.ejecutarDemo(respuesta.demo);
    }

    /**
     * Ejecuta la demostración seleccionada
     */
    async ejecutarDemo(demo) {
        switch (demo) {
            case 'crear_cliente':
                await this.demoCrearCliente();
                break;
            case 'buscar_cliente':
                await this.demoBuscarCliente();
                break;
            case 'cliente_completo':
                await this.demoClienteCompleto();
                break;
            case 'estadisticas':
                await this.demoEstadisticas();
                break;
            case 'demo_completa':
                await this.demoCompleta();
                break;
            case 'salir':
                await this.salir();
                break;
        }
    }

    /**
     * Demo 1: Principios SOLID - Crear Cliente (SRP)
     */
    async demoCrearCliente() {
        console.log(chalk.blue.bold('\n🔧 DEMO 1: PRINCIPIOS SOLID - CREAR CLIENTE'));
        console.log(chalk.gray('===============================================\n'));
        
        console.log(chalk.yellow('📋 Aplicando Single Responsibility Principle (SRP)'));
        console.log(chalk.gray('   - ClienteService: Responsabilidad única de gestionar clientes'));
        console.log(chalk.gray('   - Cliente Model: Responsabilidad única de validar datos'));
        console.log(chalk.gray('   - ClienteRepository: Responsabilidad única de persistencia\n'));

        const datosCliente = {
            nombre: 'Juan',
            apellido: 'Pérez',
            email: 'juan.perez@demo.com',
            telefono: '3001234567'
        };

        console.log(chalk.cyan('📝 Datos del cliente:'));
        console.log(chalk.white(`   Nombre: ${datosCliente.nombre}`));
        console.log(chalk.white(`   Apellido: ${datosCliente.apellido}`));
        console.log(chalk.white(`   Email: ${datosCliente.email}`));
        console.log(chalk.white(`   Teléfono: ${datosCliente.telefono}\n`));

        try {
            console.log(chalk.yellow('⚙️  Ejecutando ClienteService.crearCliente()...'));
            const resultado = await this.clienteService.crearCliente(datosCliente);
            
            console.log(chalk.green('✅ Cliente creado exitosamente:'));
            console.log(chalk.white(`   ID: ${resultado.clienteId}`));
            console.log(chalk.white(`   Mensaje: ${resultado.message}`));
            console.log(chalk.white(`   Datos: ${JSON.stringify(resultado.data, null, 2)}\n`));
            
            console.log(chalk.green('🎯 Principios aplicados:'));
            console.log(chalk.gray('   ✅ SRP: Cada clase tiene una responsabilidad única'));
            console.log(chalk.gray('   ✅ DIP: Depende de abstracciones (repositorios)'));
            console.log(chalk.gray('   ✅ OCP: Extensible sin modificación\n'));
            
        } catch (error) {
            console.log(chalk.red('❌ Error al crear cliente:'), error.message);
        }

        await this.continuar();
    }

    /**
     * Demo 2: Strategy Pattern - Búsqueda Inteligente
     */
    async demoBuscarCliente() {
        console.log(chalk.blue.bold('\n🔍 DEMO 2: STRATEGY PATTERN - BÚSQUEDA INTELIGENTE'));
        console.log(chalk.gray('====================================================\n'));
        
        console.log(chalk.yellow('📋 Aplicando Strategy Pattern'));
        console.log(chalk.gray('   - Estrategia 1: Búsqueda por ID (ObjectId)'));
        console.log(chalk.gray('   - Estrategia 2: Búsqueda por nombre/texto'));
        console.log(chalk.gray('   - Selección automática de la mejor estrategia\n'));

        const terminos = ['Juan', 'Pérez', 'juan.perez@demo.com'];
        
        for (const termino of terminos) {
            console.log(chalk.cyan(`🔍 Buscando: "${termino}"`));
            
            try {
                const clientes = await this.busquedaService.buscarClientes(termino);
                
                if (clientes.length > 0) {
                    console.log(chalk.green(`✅ Encontrados ${clientes.length} cliente(s):`));
                    clientes.forEach((cliente, index) => {
                        const resumen = this.busquedaService.getResumenCliente(cliente);
                        console.log(chalk.white(`   ${index + 1}. ${resumen.nombre} - ${resumen.email}`));
                    });
                } else {
                    console.log(chalk.yellow('⚠️  No se encontraron clientes'));
                }
                
            } catch (error) {
                console.log(chalk.red('❌ Error en búsqueda:'), error.message);
            }
            
            console.log('');
        }

        console.log(chalk.green('🎯 Patrones aplicados:'));
        console.log(chalk.gray('   ✅ Strategy Pattern: Diferentes estrategias de búsqueda'));
        console.log(chalk.gray('   ✅ SRP: Responsabilidad única de búsqueda'));
        console.log(chalk.gray('   ✅ DIP: Depende de abstracciones\n'));

        await this.continuar();
    }

    /**
     * Demo 3: Facade Pattern - Cliente Completo
     */
    async demoClienteCompleto() {
        console.log(chalk.blue.bold('\n🏗️  DEMO 3: FACADE PATTERN - CLIENTE COMPLETO'));
        console.log(chalk.gray('===============================================\n'));
        
        console.log(chalk.yellow('📋 Aplicando Facade Pattern'));
        console.log(chalk.gray('   - ClienteIntegradoService: Interfaz simplificada'));
        console.log(chalk.gray('   - Coordina múltiples repositorios'));
        console.log(chalk.gray('   - Oculta la complejidad del sistema\n'));

        try {
            // Buscar un cliente existente
            const clientes = await this.busquedaService.buscarClientes('Juan');
            
            if (clientes.length > 0) {
                const cliente = clientes[0];
                console.log(chalk.cyan(`👤 Obteniendo información completa de: ${cliente.nombre} ${cliente.apellido}`));
                
                const clienteCompleto = await this.clienteIntegradoService.obtenerClienteCompleto(cliente.clienteId);
                
                console.log(chalk.green('✅ Información completa obtenida:'));
                console.log(chalk.white(`   Cliente: ${clienteCompleto.cliente.nombreCompleto}`));
                console.log(chalk.white(`   Contratos: ${clienteCompleto.contratos.length}`));
                console.log(chalk.white(`   Planes asignados: ${clienteCompleto.planesAsignados.length}`));
                console.log(chalk.white(`   Seguimientos: ${clienteCompleto.seguimientos.length}`));
                console.log(chalk.white(`   Planes nutricionales: ${clienteCompleto.planesNutricionales.length}`));
                
                console.log(chalk.white(`   Estadísticas:`));
                console.log(chalk.white(`     - Total contratos: ${clienteCompleto.estadisticas.totalContratos}`));
                console.log(chalk.white(`     - Contratos activos: ${clienteCompleto.estadisticas.contratosActivos}`));
                console.log(chalk.white(`     - Total seguimientos: ${clienteCompleto.estadisticas.totalSeguimientos}`));
                
            } else {
                console.log(chalk.yellow('⚠️  No se encontraron clientes para mostrar información completa'));
            }
            
        } catch (error) {
            console.log(chalk.red('❌ Error al obtener cliente completo:'), error.message);
        }

        console.log(chalk.green('🎯 Patrones aplicados:'));
        console.log(chalk.gray('   ✅ Facade Pattern: Interfaz simplificada'));
        console.log(chalk.gray('   ✅ Service Layer: Coordinación de servicios'));
        console.log(chalk.gray('   ✅ Repository Pattern: Abstracción de datos\n'));

        await this.continuar();
    }

    /**
     * Demo 4: Service Layer - Estadísticas
     */
    async demoEstadisticas() {
        console.log(chalk.blue.bold('\n📊 DEMO 4: SERVICE LAYER - ESTADÍSTICAS'));
        console.log(chalk.gray('==========================================\n'));
        
        console.log(chalk.yellow('📋 Aplicando Service Layer Pattern'));
        console.log(chalk.gray('   - ClienteIntegradoService: Lógica de negocio'));
        console.log(chalk.gray('   - Coordina múltiples repositorios'));
        console.log(chalk.gray('   - Genera estadísticas del sistema\n'));

        try {
            const estadisticas = await this.clienteIntegradoService.obtenerEstadisticasGenerales();
            
            console.log(chalk.green('📊 ESTADÍSTICAS GENERALES DEL SISTEMA:'));
            console.log(chalk.gray('=====================================\n'));
            
            console.log(chalk.cyan('👥 Clientes:'));
            console.log(chalk.white(`   Total: ${estadisticas.clientes.total}`));
            console.log(chalk.white(`   Activos: ${estadisticas.clientes.activos}`));
            console.log(chalk.white(`   Inactivos: ${estadisticas.clientes.inactivos}\n`));
            
            console.log(chalk.cyan('📋 Planes:'));
            console.log(chalk.white(`   Total: ${estadisticas.planes.total}`));
            console.log(chalk.white(`   Activos: ${estadisticas.planes.activos}`));
            console.log(chalk.white(`   Inactivos: ${estadisticas.planes.inactivos}\n`));
            
            console.log(chalk.cyan('📄 Contratos:'));
            console.log(chalk.white(`   Total: ${estadisticas.contratos.total}`));
            console.log(chalk.white(`   Vigentes: ${estadisticas.contratos.vigentes}`));
            console.log(chalk.white(`   Vencidos: ${estadisticas.contratos.vencidos}`));
            console.log(chalk.white(`   Cancelados: ${estadisticas.contratos.cancelados}\n`));
            
            console.log(chalk.cyan('📊 Seguimientos:'));
            console.log(chalk.white(`   Total: ${estadisticas.seguimientos.total}`));
            console.log(chalk.white(`   Este mes: ${estadisticas.seguimientos.esteMes}\n`));
            
            console.log(chalk.cyan('🍎 Planes Nutricionales:'));
            console.log(chalk.white(`   Total: ${estadisticas.planesNutricionales.total}`));
            console.log(chalk.white(`   Activos: ${estadisticas.planesNutricionales.activos}`));
            console.log(chalk.white(`   Pausados: ${estadisticas.planesNutricionales.pausados}`));
            console.log(chalk.white(`   Finalizados: ${estadisticas.planesNutricionales.finalizados}\n`));
            
        } catch (error) {
            console.log(chalk.red('❌ Error al obtener estadísticas:'), error.message);
        }

        console.log(chalk.green('🎯 Patrones aplicados:'));
        console.log(chalk.gray('   ✅ Service Layer: Lógica de negocio encapsulada'));
        console.log(chalk.gray('   ✅ Repository Pattern: Abstracción de datos'));
        console.log(chalk.gray('   ✅ Facade Pattern: Interfaz simplificada\n'));

        await this.continuar();
    }

    /**
     * Demo 5: Demo Completa
     */
    async demoCompleta() {
        console.log(chalk.blue.bold('\n🎯 DEMO COMPLETA - TODOS LOS PRINCIPIOS Y PATRONES'));
        console.log(chalk.gray('=====================================================\n'));
        
        console.log(chalk.yellow('🚀 Ejecutando demostración completa...\n'));
        
        // 1. Crear cliente
        await this.demoCrearCliente();
        
        // 2. Buscar cliente
        await this.demoBuscarCliente();
        
        // 3. Cliente completo
        await this.demoClienteCompleto();
        
        // 4. Estadísticas
        await this.demoEstadisticas();
        
        console.log(chalk.green.bold('\n🎉 DEMOSTRACIÓN COMPLETA FINALIZADA'));
        console.log(chalk.gray('=====================================\n'));
        
        console.log(chalk.cyan('📋 RESUMEN DE PRINCIPIOS Y PATRONES DEMOSTRADOS:'));
        console.log(chalk.gray('   ✅ Single Responsibility Principle (SRP)'));
        console.log(chalk.gray('   ✅ Open/Closed Principle (OCP)'));
        console.log(chalk.gray('   ✅ Liskov Substitution Principle (LSP)'));
        console.log(chalk.gray('   ✅ Interface Segregation Principle (ISP)'));
        console.log(chalk.gray('   ✅ Dependency Inversion Principle (DIP)'));
        console.log(chalk.gray('   ✅ Repository Pattern'));
        console.log(chalk.gray('   ✅ Service Layer Pattern'));
        console.log(chalk.gray('   ✅ Singleton Pattern'));
        console.log(chalk.gray('   ✅ Facade Pattern'));
        console.log(chalk.gray('   ✅ Strategy Pattern'));
        console.log(chalk.gray('   ✅ Dependency Injection Pattern'));
        console.log(chalk.gray('   ✅ Module Pattern\n'));
        
        console.log(chalk.green('🎯 BENEFICIOS OBTENIDOS:'));
        console.log(chalk.gray('   🔧 Mantenibilidad: Código fácil de mantener'));
        console.log(chalk.gray('   🧪 Testabilidad: Componentes fáciles de probar'));
        console.log(chalk.gray('   📈 Escalabilidad: Fácil agregar funcionalidades'));
        console.log(chalk.gray('   🔄 Reutilización: Componentes reutilizables'));
        console.log(chalk.gray('   🏗️  Arquitectura: Estructura clara y organizada\n'));
    }

    /**
     * Pregunta si continuar
     */
    async continuar() {
        const continuar = await inquirer.prompt([{
            type: 'confirm',
            name: 'continuar',
            message: '¿Deseas continuar con otra demostración?',
            default: true
        }]);

        if (continuar.continuar) {
            await this.mostrarMenuDemo();
        } else {
            await this.salir();
        }
    }

    /**
     * Sale del programa
     */
    async salir() {
        console.log(chalk.green('\n✅ ¡Gracias por ver la demostración!'));
        console.log(chalk.gray('GymMaster CLI - Principios SOLID y Patrones de Diseño\n'));
        
        try {
            await ConnectionManager.close();
            console.log(chalk.yellow('🔌 Conexión a MongoDB cerrada'));
        } catch (error) {
            console.log(chalk.red('⚠️  Error al cerrar conexión:'), error.message);
        }
        
        process.exit(0);
    }
}

// Ejecutar la demostración si se llama directamente
if (require.main === module) {
    const demo = new DemoSustentacion();
    demo.iniciar().catch(error => {
        console.error(chalk.red('❌ Error fatal:'), error.message);
        process.exit(1);
    });
}

module.exports = DemoSustentacion;
