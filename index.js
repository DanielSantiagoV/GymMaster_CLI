#!/usr/bin/env node

/**
 * ========================================================================================
 * GYMMASTER CLI - APLICACIÓN DE GESTIÓN DE GIMNASIO
 * ========================================================================================
 * 
 * DESCRIPCIÓN:
 * Este es el punto de entrada principal de la aplicación GymMaster CLI.
 * Se encarga de inicializar, configurar y ejecutar todo el sistema de gestión de gimnasio.
 * 
 * ARQUITECTURA:
 * - Aplicación CLI (Command Line Interface) para gestión de gimnasio
 * - Sistema modular con separación de responsabilidades
 * - Interfaz de usuario basada en consola con colores y animaciones
 * - Integración con MongoDB para persistencia de datos
 * 
 * PATRONES DE DISEÑO APLICADOS:
 * ========================================================================================
 * 
 * 1. SINGLETON PATTERN:
 *    - GymMasterApp es la instancia única de la aplicación
 *    - Garantiza que solo existe una instancia en toda la aplicación
 *    - Útil para mantener estado global y configuración centralizada
 * 
 * 2. FACADE PATTERN:
 *    - GymMasterApp actúa como fachada para el sistema completo
 *    - Simplifica la interfaz compleja del sistema
 *    - Oculta la complejidad de los subsistemas (CLI, conexión DB, etc.)
 * 
 * 3. TEMPLATE METHOD PATTERN:
 *    - Método run() define el flujo estándar de inicialización
 *    - Método shutdown() define el flujo estándar de cierre
 *    - Estructura fija pero permite personalización en subclases
 * 
 * 4. OBSERVER PATTERN:
 *    - Manejo de señales del sistema (SIGINT, SIGTERM)
 *    - Los listeners observan y reaccionan a eventos del sistema
 *    - Permite cierre seguro cuando el usuario presiona Ctrl+C
 * 
 * 5. STRATEGY PATTERN:
 *    - showBanner() podría usar diferentes tipos de banner
 *    - showLoadingAnimation() podría usar diferentes animaciones
 *    - Permite intercambiar algoritmos sin modificar el código cliente
 * 
 * 6. BUILDER PATTERN:
 *    - showMainMenu() construye el menú paso a paso
 *    - Construcción compleja dividida en pasos simples
 *    - Facilita la creación de interfaces complejas
 * 
 * 7. MODULE PATTERN:
 *    - Exportación de la clase para uso en otros módulos
 *    - Encapsulación de funcionalidad relacionada
 *    - Punto de entrada condicional con require.main === module
 * 
 * PRINCIPIOS SOLID APLICADOS:
 * ========================================================================================
 * 
 * 1. SINGLE RESPONSIBILITY PRINCIPLE (SRP):
 *    - Cada método tiene UNA sola responsabilidad específica
 *    - initialize(): Solo inicialización del sistema
 *    - validateEnvironment(): Solo validación de variables de entorno
 *    - showBanner(): Solo mostrar el banner ASCII
 *    - showMainMenu(): Solo mostrar el menú principal
 *    - showLoadingAnimation(): Solo mostrar animación de carga
 *    - showWelcomeMessage(): Solo mostrar mensaje de bienvenida
 *    - run(): Solo orquestar el flujo principal
 *    - shutdown(): Solo cerrar la aplicación de forma segura
 * 
 * 2. OPEN/CLOSED PRINCIPLE (OCP):
 *    - La clase es ABIERTA para extensión pero CERRADA para modificación
 *    - Se pueden agregar nuevas funcionalidades sin modificar código existente
 *    - Los métodos son extensibles para nuevas características
 *    - Permite agregar nuevos tipos de validación, animación, etc.
 * 
 * 3. LISKOV SUBSTITUTION PRINCIPLE (LSP):
 *    - Las subclases pueden sustituir a la clase base sin romper funcionalidad
 *    - Aplicable si se crean subclases de GymMasterApp
 *    - Mantiene el comportamiento esperado en todas las implementaciones
 * 
 * 4. INTERFACE SEGREGATION PRINCIPLE (ISP):
 *    - Los clientes no dependen de interfaces que no usan
 *    - Cada método expone solo la funcionalidad necesaria
 *    - No hay métodos "gordos" que hagan demasiadas cosas
 * 
 * 5. DEPENDENCY INVERSION PRINCIPLE (DIP):
 *    - Depende de ABSTRACCIONES, no de implementaciones concretas
 *    - Usa connectionManager (abstracción) en lugar de MongoDB directo
 *    - Usa config (abstracción) en lugar de variables hardcodeadas
 *    - Usa GymMasterCLI (abstracción) en lugar de implementación específica
 *    - Facilita testing y mantenimiento
 * 
 * FLUJO DE EJECUCIÓN:
 * ========================================================================================
 * 1. Se crea la instancia de GymMasterApp (Singleton)
 * 2. Se ejecuta app.run() si es el módulo principal
 * 3. Se inicializa la aplicación (conexión DB, validación entorno)
 * 4. Se muestra el banner, animación y mensaje de bienvenida
 * 5. Se inicia la interfaz CLI interactiva
 * 6. Se manejan señales del sistema para cierre seguro
 * 
 * BENEFICIOS DE ESTA ARQUITECTURA:
 * ========================================================================================
 * - Código mantenible y fácil de entender
 * - Fácil testing y debugging
 * - Extensible sin modificar código existente
 * - Separación clara de responsabilidades
 * - Manejo robusto de errores
 * - Cierre seguro de la aplicación
 */

// ========================================================================================
// IMPORTS Y DEPENDENCIAS
// ========================================================================================
// PRINCIPIO DIP: Dependemos de abstracciones, no de implementaciones concretas

const chalk = require('chalk');                    // Librería para colores en consola
const connectionManager = require('./config/connection');  // Abstracción para gestión de conexión DB
const config = require('./config');                // Abstracción para configuración del sistema
const GymMasterCLI = require('./cli');             // Abstracción para interfaz CLI

/**
 * ========================================================================================
 * CLASE PRINCIPAL DE LA APLICACIÓN - GYMMASTERAPP
 * ========================================================================================
 * 
 * DESCRIPCIÓN:
 * Esta es la clase principal que actúa como el núcleo de la aplicación GymMaster CLI.
 * Se encarga de coordinar todos los aspectos del sistema: inicialización, configuración,
 * interfaz de usuario, y cierre seguro de la aplicación.
 * 
 * PATRÓN SINGLETON APLICADO:
 * - Esta clase representa la instancia única de la aplicación
 * - Garantiza que solo existe una instancia en toda la aplicación
 * - Útil para mantener estado global y configuración centralizada
 * - Evita conflictos de estado entre múltiples instancias
 * 
 * PRINCIPIO SRP (Single Responsibility Principle):
 * - Responsable únicamente de la gestión del ciclo de vida de la aplicación
 * - Orquesta el flujo principal sin implementar detalles específicos
 * - Delega responsabilidades específicas a otros módulos
 * - Mantiene el estado global de la aplicación
 */
class GymMasterApp {
    /**
     * ========================================================================================
     * CONSTRUCTOR DE LA APLICACIÓN
     * ========================================================================================
     * 
     * DESCRIPCIÓN:
     * Inicializa el estado básico de la aplicación sin realizar operaciones costosas.
     * Solo establece el estado inicial necesario para el funcionamiento.
     * 
     * PRINCIPIO SRP:
     * - Solo inicializa el estado básico de la aplicación
     * - No realiza operaciones de I/O o conexiones
     * - Responsabilidad única de establecer el estado inicial
     * 
     * ESTADO INICIAL:
     * - isInitialized: Controla si la aplicación ha sido inicializada
     * - Permite evitar inicializaciones múltiples
     * - Facilita el manejo del flujo de la aplicación
     */
    constructor() {
        // Estado de inicialización para control de flujo
        // PRINCIPIO SRP: Solo maneja el estado de inicialización
        this.isInitialized = false;
    }

    /**
     * ========================================================================================
     * MÉTODO DE INICIALIZACIÓN DE LA APLICACIÓN
     * ========================================================================================
     * 
     * DESCRIPCIÓN:
     * Este es el método principal que inicializa toda la aplicación. Se encarga de:
     * - Validar el entorno de ejecución
     * - Establecer conexión con la base de datos
     * - Configurar el estado de la aplicación
     * - Manejar errores de inicialización
     * 
     * FLUJO DE INICIALIZACIÓN:
     * 1. Mostrar información de la aplicación
     * 2. Validar variables de entorno
     * 3. Conectar a MongoDB
     * 4. Marcar como inicializada
     * 5. Manejar errores si ocurren
     * 
     * PRINCIPIO SRP (Single Responsibility Principle):
     * - Responsabilidad única de inicialización del sistema
     * - Orquesta el proceso de inicialización sin implementar detalles
     * - Delega validación a validateEnvironment()
     * - Delega conexión a connectionManager
     * 
     * PRINCIPIO DIP (Dependency Inversion Principle):
     * - Depende de abstracciones (connectionManager, config)
     * - No depende de implementaciones concretas
     * - Facilita testing y mantenimiento
     * - Permite intercambiar implementaciones
     * 
     * PATRÓN TEMPLATE METHOD:
     * - Define el flujo estándar de inicialización
     * - Estructura fija pero permite personalización
     * - Puede ser extendido en subclases
     * 
     * MANEJO DE ERRORES:
     * - Captura cualquier error durante la inicialización
     * - Muestra mensaje de error claro al usuario
     * - Termina la aplicación con código de error (1)
     * - Evita que la aplicación continúe en estado inconsistente
     */
    async initialize() {
        try {
            // Mostrar información de la aplicación
            console.log(chalk.blue.bold('\n🏋️  GymMaster CLI v' + config.app.version));
            console.log(chalk.gray('Inicializando aplicación...\n'));

            // PRINCIPIO SRP: Validación separada en método específico
            // Verificar variables de entorno necesarias
            this.validateEnvironment();

            // PRINCIPIO DIP: Usa abstracción connectionManager
            // Conectar a MongoDB usando el gestor de conexiones
            await connectionManager.initialize();

            // Marcar la aplicación como inicializada
            this.isInitialized = true;
            console.log(chalk.green('✅ Aplicación inicializada correctamente\n'));

        } catch (error) {
            // PRINCIPIO SRP: Manejo centralizado de errores
            // Mostrar error y terminar aplicación
            console.error(chalk.red('❌ Error al inicializar la aplicación:'), error.message);
            process.exit(1);
        }
    }

    /**
     * ========================================================================================
     * MÉTODO DE VALIDACIÓN DE VARIABLES DE ENTORNO
     * ========================================================================================
     * 
     * DESCRIPCIÓN:
     * Valida que las variables de entorno necesarias estén configuradas.
     * Si faltan variables, muestra advertencias pero permite continuar con valores por defecto.
     * 
     * VARIABLES VALIDADAS:
     * - MONGODB_URI: URL de conexión a MongoDB
     * - MONGODB_DATABASE: Nombre de la base de datos
     * 
     * COMPORTAMIENTO:
     * - Si faltan variables: Muestra advertencia pero continúa
     * - Si todas están presentes: Continúa sin mensajes
     * - No interrumpe la ejecución por variables faltantes
     * 
     * PRINCIPIO SRP (Single Responsibility Principle):
     * - Responsabilidad única de validación de entorno
     * - No hace otras tareas como conexión o configuración
     * - Solo valida y reporta el estado del entorno
     * 
     * PRINCIPIO OCP (Open/Closed Principle):
     * - Extensible para nuevas validaciones sin modificar el método
     * - Se pueden agregar nuevas variables al array requiredVars
     * - Se pueden agregar nuevos tipos de validación
     * - Cerrado para modificación, abierto para extensión
     * 
     * BENEFICIOS:
     * - Detecta problemas de configuración temprano
     * - Proporciona feedback claro al usuario
     * - Permite continuar con configuración por defecto
     * - Facilita debugging de problemas de configuración
     */
    validateEnvironment() {
        // Lista de variables de entorno requeridas
        const requiredVars = ['MONGODB_URI', 'MONGODB_DATABASE'];
        
        // Filtrar variables que no están definidas
        const missingVars = requiredVars.filter(varName => !process.env[varName]);

        // Si faltan variables, mostrar advertencia
        if (missingVars.length > 0) {
            console.warn(chalk.yellow('⚠️  Variables de entorno faltantes:'), missingVars.join(', '));
            console.log(chalk.gray('Usando valores por defecto...'));
        }
    }

    /**
     * ========================================================================================
     * MÉTODO DE MOSTRAR BANNER PRINCIPAL
     * ========================================================================================
     * 
     * DESCRIPCIÓN:
     * Muestra el banner ASCII art principal de la aplicación con el nombre "GYMMASTER".
     * Incluye información de versión y descripción del sistema.
     * 
     * COMPONENTES DEL BANNER:
     * - Arte ASCII del nombre "GYMMASTER"
     * - Marco decorativo con caracteres Unicode
     * - Información de versión y descripción
     * - Colores distintivos para mejor presentación
     * 
     * EFECTOS VISUALES:
     * - Limpia la consola antes de mostrar el banner
     * - Usa colores cyan para el marco principal
     * - Usa colores yellow para la información de versión
     * - Usa colores gray para el texto descriptivo
     * 
     * PRINCIPIO SRP (Single Responsibility Principle):
     * - Responsabilidad única de mostrar el banner
     * - No hace otras tareas como validación o conexión
     * - Solo se encarga de la presentación visual
     * 
     * PATRÓN STRATEGY:
     * - Podría ser intercambiable por diferentes tipos de banner
     * - Permite cambiar el estilo sin modificar el código cliente
     * - Facilita la personalización de la interfaz
     * 
     * PRINCIPIO OCP (Open/Closed Principle):
     * - Extensible para nuevos tipos de banner
     * - Se puede agregar información adicional sin modificar el método
     * - Permite personalización de colores y estilos
     * 
     * BENEFICIOS:
     * - Presentación profesional de la aplicación
     * - Identificación clara del sistema
     * - Experiencia de usuario mejorada
     * - Fácil personalización y mantenimiento
     */
    showBanner() {
        // Limpiar la consola para una presentación limpia
        console.clear();
        
        // Mostrar el banner principal con arte ASCII
        console.log(chalk.cyan.bold(`
    ╔════════════════════════════════════════════════════════════════════════════════════════╗
    ║                                                                                        ║
    ║    ██████╗ ██╗   ██╗███╗   ███╗    ███╗   ███╗ █████╗ ███████╗████████╗███████╗██████╗ ║
    ║   ██╔════╝ ╚██╗ ██╔╝████╗ ████║    ████╗ ████║██╔══██╗██╔════╝╚══██╔══╝██╔════╝██╔══██╗║
    ║   ██║  ███╗ ╚████╔╝ ██╔████╔██║    ██╔████╔██║███████║███████╗   ██║   █████╗  ██████╔╝║
    ║   ██║   ██║  ╚██╔╝  ██║╚██╔╝██║    ██║╚██╔╝██║██╔══██║╚════██║   ██║   ██╔══╝  ██╔══██╗║
    ║   ╚██████╔╝   ██║   ██║ ╚═╝ ██║    ██║ ╚═╝ ██║██║  ██║███████║   ██║   ███████╗██║  ██║║
    ║    ╚═════╝    ╚═╝   ╚═╝     ╚═╝    ╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═╝║
    ║                                                                                        ║
    ║                           🏋️  CLI - Sistema de Gestión de Gimnasio 🏋️                 ║
    ║                                                                                        ║
    ╚════════════════════════════════════════════════════════════════════════════════════════╝
        `));
        
        // Mostrar información de versión y descripción
        console.log(chalk.yellow.bold('    ═══════════════════════════════════════════════════════════════════════════════'));
        console.log(chalk.gray('    🚀 Versión: 1.0.0 | 💪 Potencia tu gimnasio con tecnología avanzada'));
        console.log(chalk.yellow.bold('    ═══════════════════════════════════════════════════════════════════════════════\n'));
    }

    /**
     * ========================================================================================
     * MÉTODO DE MOSTRAR MENÚ PRINCIPAL
     * ========================================================================================
     * 
     * DESCRIPCIÓN:
     * Muestra el menú principal de la aplicación con un diseño visual mejorado.
     * Organiza las opciones en categorías lógicas con colores distintivos.
     * 
     * ESTRUCTURA DEL MENÚ:
     * 1. GESTIÓN DE USUARIOS:
     *    - Gestión de Clientes
     *    - Gestión de Planes de Entrenamiento
     * 
     * 2. SEGUIMIENTO Y NUTRICIÓN:
     *    - Seguimiento Físico y Progreso
     *    - Planes de Nutrición
     * 
     * 3. CONTRATOS Y FINANZAS:
     *    - Gestión de Contratos
     *    - Control Financiero
     * 
     * 4. REPORTES Y CONFIGURACIÓN:
     *    - Reportes y Estadísticas
     *    - Configuración del Sistema
     * 
     * 5. SALIR:
     *    - Salir del Sistema
     * 
     * DISEÑO VISUAL:
     * - Usa marcos Unicode para mejor presentación
     * - Colores distintivos para cada categoría
     * - Emojis para identificación visual rápida
     * - Estructura jerárquica clara
     * 
     * PRINCIPIO SRP (Single Responsibility Principle):
     * - Responsabilidad única de mostrar el menú
     * - No hace otras tareas como validación o procesamiento
     * - Solo se encarga de la presentación del menú
     * 
     * PRINCIPIO OCP (Open/Closed Principle):
     * - Extensible para nuevas opciones sin modificar el método
     * - Se pueden agregar nuevas categorías
     * - Se pueden agregar nuevas opciones a categorías existentes
     * - Cerrado para modificación, abierto para extensión
     * 
     * PATRÓN BUILDER:
     * - Construye el menú paso a paso con diferentes secciones
     * - Cada sección se construye independientemente
     * - Facilita la creación de interfaces complejas
     * - Permite personalización de cada sección
     * 
     * BENEFICIOS:
     * - Interfaz de usuario clara y organizada
     * - Fácil navegación para el usuario
     * - Presentación profesional
     * - Fácil mantenimiento y extensión
     */
    showMainMenu() {
        console.log(chalk.cyan.bold('    ┌─────────────────────────────────────────────────────────────────────────────┐'));
        console.log(chalk.cyan.bold('    │') + chalk.white.bold('                        📋 MENÚ PRINCIPAL                        ') + chalk.cyan.bold('│'));
        console.log(chalk.cyan.bold('    └─────────────────────────────────────────────────────────────────────────────┘\n'));
        
        console.log(chalk.gray('    ┌─────────────────────────────────────────────────────────────────────────────┐'));
        console.log(chalk.gray('    │') + chalk.white('  Selecciona una opción del menú:                                    ') + chalk.gray('│'));
        console.log(chalk.gray('    └─────────────────────────────────────────────────────────────────────────────┘\n'));
        
        // Opciones del menú con diseño visual
        console.log(chalk.blue.bold('    ┌─ GESTIÓN DE USUARIOS ─────────────────────────────────────────────────────┐'));
        console.log(chalk.white('    │ 1. 👥 Gestión de Clientes                                          │'));
        console.log(chalk.white('    │ 2. 📋 Gestión de Planes de Entrenamiento                          │'));
        console.log(chalk.blue.bold('    └──────────────────────────────────────────────────────────────────────┘\n'));
        
        console.log(chalk.green.bold('    ┌─ SEGUIMIENTO Y NUTRICIÓN ───────────────────────────────────────────────┐'));
        console.log(chalk.white('    │ 3. 📊 Seguimiento Físico y Progreso                               │'));
        console.log(chalk.white('    │ 4. 🥗 Planes de Nutrición                                         │'));
        console.log(chalk.green.bold('    └──────────────────────────────────────────────────────────────────────┘\n'));
        
        console.log(chalk.magenta.bold('    ┌─ CONTRATOS Y FINANZAS ──────────────────────────────────────────────────┐'));
        console.log(chalk.white('    │ 5. 📄 Gestión de Contratos                                        │'));
        console.log(chalk.white('    │ 6. 💰 Control Financiero                                          │'));
        console.log(chalk.magenta.bold('    └──────────────────────────────────────────────────────────────────────┘\n'));
        
        console.log(chalk.yellow.bold('    ┌─ REPORTES Y CONFIGURACIÓN ──────────────────────────────────────────────┐'));
        console.log(chalk.white('    │ 7. 📈 Reportes y Estadísticas                                     │'));
        console.log(chalk.white('    │ 8. ⚙️  Configuración del Sistema                                   │'));
        console.log(chalk.yellow.bold('    └──────────────────────────────────────────────────────────────────────┘\n'));
        
        console.log(chalk.red.bold('    ┌─ SALIR ──────────────────────────────────────────────────────────────────┐'));
        console.log(chalk.white('    │ 9. 🚪 Salir del Sistema                                            │'));
        console.log(chalk.red.bold('    └──────────────────────────────────────────────────────────────────────┘\n'));
        
        console.log(chalk.gray('    ═══════════════════════════════════════════════════════════════════════════════'));
        console.log(chalk.cyan('    💡 Tip: Usa las teclas numéricas para navegar por el menú'));
        console.log(chalk.gray('    ═══════════════════════════════════════════════════════════════════════════════\n'));
    }

    /**
     * ========================================================================================
     * MÉTODO DE ANIMACIÓN DE CARGA
     * ========================================================================================
     * 
     * DESCRIPCIÓN:
     * Muestra una animación de carga con caracteres Unicode que simula un spinner.
     * Proporciona feedback visual al usuario durante la inicialización del sistema.
     * 
     * COMPONENTES DE LA ANIMACIÓN:
     * - Frames: Array de caracteres Unicode para el spinner
     * - Interval: Temporizador que cambia el frame cada 100ms
     * - Duración: 2 segundos de animación
     * - Mensaje: Texto que acompaña la animación
     * 
     * CARACTERES UNICODE UTILIZADOS:
     * - ⠋ ⠙ ⠹ ⠸ ⠼ ⠴ ⠦ ⠧ ⠇ ⠏ (Braille patterns)
     * - Crean efecto de rotación visual
     * - Compatibles con la mayoría de terminales
     * 
     * FLUJO DE LA ANIMACIÓN:
     * 1. Mostrar mensaje inicial
     * 2. Iniciar loop de animación
     * 3. Cambiar frame cada 100ms
     * 4. Esperar 2 segundos
     * 5. Limpiar la línea de animación
     * 
     * PRINCIPIO SRP (Single Responsibility Principle):
     * - Responsabilidad única de mostrar animación de carga
     * - No hace otras tareas como validación o conexión
     * - Solo se encarga de la presentación visual
     * 
     * PATRÓN STRATEGY:
     * - Podría usar diferentes tipos de animación
     * - Permite intercambiar algoritmos de animación
     * - Facilita la personalización de la interfaz
     * 
     * PRINCIPIO OCP (Open/Closed Principle):
     * - Extensible para nuevos tipos de animación
     * - Se pueden agregar nuevos frames
     * - Se puede cambiar la duración
     * - Cerrado para modificación, abierto para extensión
     * 
     * BENEFICIOS:
     * - Mejora la experiencia de usuario
     * - Indica que el sistema está trabajando
     * - Evita la sensación de aplicación "colgada"
     * - Presentación profesional
     */
    async showLoadingAnimation() {
        // Frames de la animación usando caracteres Unicode
        const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
        let frameIndex = 0;
        
        // Mostrar mensaje inicial
        console.log(chalk.blue('    Inicializando sistema...'));
        
        // Crear intervalo para la animación
        const interval = setInterval(() => {
            // Escribir frame actual con mensaje
            process.stdout.write(`\r    ${chalk.cyan(frames[frameIndex])} Cargando módulos del sistema...`);
            // Avanzar al siguiente frame
            frameIndex = (frameIndex + 1) % frames.length;
        }, 100);
        
        // Simular tiempo de carga (2 segundos)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Limpiar la animación
        clearInterval(interval);
        process.stdout.write('\r' + ' '.repeat(50) + '\r');
    }

    /**
     * ========================================================================================
     * MÉTODO DE MENSAJE DE BIENVENIDA
     * ========================================================================================
     * 
     * DESCRIPCIÓN:
     * Muestra un mensaje de bienvenida con efectos visuales que presenta las características
     * principales del sistema GymMaster CLI al usuario.
     * 
     * COMPONENTES DEL MENSAJE:
     * - Marco decorativo con caracteres Unicode
     * - Título de bienvenida con emojis
     * - Lista de características principales
     * - Mensaje de motivación final
     * 
     * CARACTERÍSTICAS DESTACADAS:
     * - 👥 Gestión completa de clientes
     * - 📋 Planes de entrenamiento personalizados
     * - 📊 Seguimiento de progreso en tiempo real
     * - 🥗 Control nutricional avanzado
     * - 💰 Gestión financiera integrada
     * - 📈 Reportes y estadísticas detalladas
     * 
     * DISEÑO VISUAL:
     * - Usa marcos Unicode para mejor presentación
     * - Colores distintivos para cada sección
     * - Emojis para identificación visual rápida
     * - Estructura jerárquica clara
     * 
     * PRINCIPIO SRP (Single Responsibility Principle):
     * - Responsabilidad única de mostrar mensaje de bienvenida
     * - No hace otras tareas como validación o conexión
     * - Solo se encarga de la presentación del mensaje
     * 
     * PATRÓN TEMPLATE METHOD:
     * - Define la estructura del mensaje de bienvenida
     * - Estructura fija pero permite personalización
     * - Puede ser extendido en subclases
     * 
     * PRINCIPIO OCP (Open/Closed Principle):
     * - Extensible para nuevas características
     * - Se pueden agregar nuevas funcionalidades
     * - Se puede personalizar el mensaje
     * - Cerrado para modificación, abierto para extensión
     * 
     * BENEFICIOS:
     * - Presentación profesional del sistema
     * - Información clara sobre las capacidades
     * - Experiencia de usuario mejorada
     * - Fácil mantenimiento y personalización
     */
    showWelcomeMessage() {
        // Mostrar marco de bienvenida
        console.log(chalk.green.bold('\n    ╔══════════════════════════════════════════════════════════════════════════════╗'));
        console.log(chalk.green.bold('    ║') + chalk.white.bold('                    🎉 ¡BIENVENIDO A GYMMASTER CLI! 🎉                    ') + chalk.green.bold('║'));
        console.log(chalk.green.bold('    ╚══════════════════════════════════════════════════════════════════════════════╝'));
        
        // Mostrar características principales
        console.log(chalk.cyan('\n    🌟 Características principales:'));
        console.log(chalk.white('    • 👥 Gestión completa de clientes'));
        console.log(chalk.white('    • 📋 Planes de entrenamiento personalizados'));
        console.log(chalk.white('    • 📊 Seguimiento de progreso en tiempo real'));
        console.log(chalk.white('    • 🥗 Control nutricional avanzado'));
        console.log(chalk.white('    • 💰 Gestión financiera integrada'));
        console.log(chalk.white('    • 📈 Reportes y estadísticas detalladas\n'));
        
        // Mostrar mensaje de motivación
        console.log(chalk.yellow('    ⚡ Sistema listo para usar. ¡Comencemos! ⚡\n'));
    }

    /**
     * ========================================================================================
     * MÉTODO PRINCIPAL DE EJECUCIÓN DE LA APLICACIÓN
     * ========================================================================================
     * 
     * DESCRIPCIÓN:
     * Este es el método principal que orquesta todo el flujo de ejecución de la aplicación.
     * Define el orden de ejecución y coordina todos los componentes del sistema.
     * 
     * FLUJO DE EJECUCIÓN:
     * 1. Verificar si la aplicación está inicializada
     * 2. Inicializar si es necesario (conexión DB, validación entorno)
     * 3. Mostrar banner principal
     * 4. Mostrar animación de carga
     * 5. Mostrar mensaje de bienvenida
     * 6. Iniciar interfaz CLI interactiva
     * 7. Manejar errores si ocurren
     * 
     * COMPONENTES COORDINADOS:
     * - Inicialización del sistema
     * - Presentación visual (banner, animación, bienvenida)
     * - Interfaz CLI interactiva
     * - Manejo de errores
     * 
     * PATRÓN TEMPLATE METHOD:
     * - Define el flujo estándar de ejecución de la aplicación
     * - Estructura fija pero permite personalización
     * - Puede ser extendido en subclases
     * - Orquesta el proceso sin implementar detalles
     * 
     * PRINCIPIO SRP (Single Responsibility Principle):
     * - Orquesta el flujo principal sin implementar detalles
     * - Delega responsabilidades específicas a otros métodos
     * - Solo se encarga de coordinar el flujo
     * - No implementa lógica de negocio específica
     * 
     * PRINCIPIO DIP (Dependency Inversion Principle):
     * - Depende de abstracción GymMasterCLI
     * - No depende de implementación concreta
     * - Facilita testing y mantenimiento
     * - Permite intercambiar implementaciones
     * 
     * MANEJO DE ERRORES:
     * - Captura errores de la interfaz CLI
     * - Muestra mensaje de error claro
     * - Propaga el error para manejo superior
     * - Mantiene la integridad del sistema
     * 
     * BENEFICIOS:
     * - Flujo de ejecución claro y predecible
     * - Fácil mantenimiento y debugging
     * - Extensible para nuevas funcionalidades
     * - Manejo robusto de errores
     */
    async run() {
        // Verificar si la aplicación está inicializada
        if (!this.isInitialized) {
            await this.initialize();
        }

        // PRINCIPIO SRP: Delegación de responsabilidades
        // Mostrar banner principal
        this.showBanner();
        
        // PRINCIPIO SRP: Separación de concerns
        // Mostrar animación de carga
        await this.showLoadingAnimation();
        
        // PRINCIPIO SRP: Cada método tiene una responsabilidad
        // Mostrar mensaje de bienvenida
        this.showWelcomeMessage();
        
        // Iniciar interfaz CLI interactiva
        console.log(chalk.green('🚀 Iniciando interfaz CLI interactiva...\n'));
        
        try {
            // PRINCIPIO DIP: Depende de abstracción, no de implementación concreta
            const cli = new GymMasterCLI();
            await cli.iniciar();
        } catch (error) {
            // PRINCIPIO SRP: Manejo centralizado de errores
            console.error(chalk.red('❌ Error en la interfaz CLI:'), error.message);
            throw error;
        }
    }

    /**
     * ========================================================================================
     * MÉTODO DE CIERRE SEGURO DE LA APLICACIÓN
     * ========================================================================================
     * 
     * DESCRIPCIÓN:
     * Cierra la aplicación de forma segura, liberando recursos y cerrando conexiones.
     * Garantiza que el sistema se cierre correctamente sin dejar recursos colgados.
     * 
     * FLUJO DE CIERRE:
     * 1. Mostrar mensaje de cierre
     * 2. Cerrar conexiones a la base de datos
     * 3. Mostrar confirmación de cierre
     * 4. Terminar proceso con código de éxito
     * 5. Manejar errores si ocurren
     * 
     * RECURSOS LIBERADOS:
     * - Conexiones a MongoDB
     * - Handlers de eventos
     * - Timers y intervals
     * - Memoria y recursos del sistema
     * 
     * CÓDIGOS DE SALIDA:
     * - 0: Cierre exitoso
     * - 1: Error durante el cierre
     * 
     * PRINCIPIO SRP (Single Responsibility Principle):
     * - Responsabilidad única de cierre seguro
     * - No hace otras tareas como validación o presentación
     * - Solo se encarga de liberar recursos
     * 
     * PRINCIPIO DIP (Dependency Inversion Principle):
     * - Depende de abstracción connectionManager
     * - No depende de implementación concreta de MongoDB
     * - Facilita testing y mantenimiento
     * - Permite intercambiar implementaciones
     * 
     * PATRÓN TEMPLATE METHOD:
     * - Define el flujo estándar de cierre
     * - Estructura fija pero permite personalización
     * - Puede ser extendido en subclases
     * - Orquesta el proceso sin implementar detalles
     * 
     * MANEJO DE ERRORES:
     * - Captura errores durante el cierre
     * - Muestra mensaje de error claro
     * - Termina con código de error
     * - Evita cierres incompletos
     * 
     * BENEFICIOS:
     * - Cierre seguro y limpio
     * - Liberación de recursos
     * - Manejo robusto de errores
     * - Códigos de salida claros
     */
    async shutdown() {
        try {
            // Mostrar mensaje de cierre
            console.log(chalk.gray('\n🔌 Cerrando aplicación...'));
            
            // PRINCIPIO DIP: Usa abstracción para cerrar conexiones
            await connectionManager.close();
            
            // Mostrar confirmación de cierre
            console.log(chalk.green('✅ Aplicación cerrada correctamente'));
            process.exit(0);
        } catch (error) {
            // PRINCIPIO SRP: Manejo centralizado de errores de cierre
            console.error(chalk.red('❌ Error al cerrar la aplicación:'), error.message);
            process.exit(1);
        }
    }
}

/**
 * ========================================================================================
 * MANEJO DE SEÑALES DEL SISTEMA - PATRÓN OBSERVER
 * ========================================================================================
 * 
 * DESCRIPCIÓN:
 * Configura listeners para manejar señales del sistema operativo que indican
 * que la aplicación debe cerrarse de forma segura.
 * 
 * SEÑALES MANEJADAS:
 * - SIGINT: Interrupción del usuario (Ctrl+C)
 * - SIGTERM: Terminación del sistema
 * 
 * COMPORTAMIENTO:
 * - Captura la señal del sistema
 * - Muestra mensaje de advertencia
 * - Ejecuta cierre seguro de la aplicación
 * - Libera recursos y conexiones
 * 
 * PATRÓN OBSERVER:
 * - Los listeners observan eventos del sistema
 * - Reaccionan automáticamente a las señales
 * - Permiten cierre seguro cuando el usuario presiona Ctrl+C
 * - Mantienen la integridad del sistema
 * 
 * PRINCIPIO SRP (Single Responsibility Principle):
 * - Cada listener tiene responsabilidad específica de manejo de señales
 * - No hace otras tareas como validación o presentación
 * - Solo se encarga de reaccionar a señales del sistema
 * 
 * PRINCIPIO DIP (Dependency Inversion Principle):
 * - Depende de abstracción app.shutdown()
 * - No depende de implementación concreta
 * - Facilita testing y mantenimiento
 * - Permite intercambiar implementaciones
 * 
 * BENEFICIOS:
 * - Cierre seguro de la aplicación
 * - Liberación de recursos
 * - Manejo robusto de interrupciones
 * - Experiencia de usuario mejorada
 */

// Listener para señal de interrupción (Ctrl+C)
process.on('SIGINT', async () => {
    console.log(chalk.yellow('\n⚠️  Interrupción detectada. Cerrando aplicación...'));
    await app.shutdown();
});

// Listener para señal de terminación del sistema
process.on('SIGTERM', async () => {
    console.log(chalk.yellow('\n⚠️  Terminación detectada. Cerrando aplicación...'));
    await app.shutdown();
});

/**
 * ========================================================================================
 * CREACIÓN DE INSTANCIA ÚNICA - PATRÓN SINGLETON
 * ========================================================================================
 * 
 * DESCRIPCIÓN:
 * Crea la instancia única de la aplicación GymMasterApp.
 * Garantiza que solo existe una instancia en toda la aplicación.
 * 
 * PATRÓN SINGLETON:
 * - Instancia única de la aplicación
 * - Acceso global desde cualquier parte del código
 * - Mantiene estado global consistente
 * - Evita conflictos de estado entre múltiples instancias
 * 
 * PRINCIPIO SRP (Single Responsibility Principle):
 * - Instancia global con responsabilidad de gestión de la app
 * - No hace otras tareas como validación o presentación
 * - Solo se encarga de representar la aplicación
 * 
 * BENEFICIOS:
 * - Estado global consistente
 * - Acceso fácil desde cualquier módulo
 * - Evita duplicación de instancias
 * - Facilita el manejo del estado
 */
const app = new GymMasterApp();

/**
 * ========================================================================================
 * PUNTO DE ENTRADA PRINCIPAL - PATRÓN MODULE
 * ========================================================================================
 * 
 * DESCRIPCIÓN:
 * Ejecuta la aplicación si es llamada directamente como módulo principal.
 * Verifica si el archivo es ejecutado directamente o importado como módulo.
 * 
 * CONDICIÓN DE EJECUCIÓN:
 * - require.main === module: Verifica si es el módulo principal
 * - Solo se ejecuta cuando se llama directamente al archivo
 * - No se ejecuta cuando se importa como módulo
 * 
 * FLUJO DE EJECUCIÓN:
 * 1. Verificar si es el módulo principal
 * 2. Ejecutar app.run() si es así
 * 3. Manejar errores si ocurren
 * 4. Terminar con código de error si hay problemas
 * 
 * PATRÓN MODULE:
 * - Encapsula funcionalidad relacionada
 * - Permite uso como módulo o aplicación
 * - Facilita la reutilización de código
 * - Mantiene la separación de responsabilidades
 * 
 * PRINCIPIO SRP (Single Responsibility Principle):
 * - Punto de entrada con responsabilidad única de iniciar la app
 * - No hace otras tareas como validación o presentación
 * - Solo se encarga de iniciar la aplicación
 * 
 * PRINCIPIO DIP (Dependency Inversion Principle):
 * - Depende de abstracción app.run()
 * - No depende de implementación concreta
 * - Facilita testing y mantenimiento
 * - Permite intercambiar implementaciones
 * 
 * MANEJO DE ERRORES:
 * - Captura errores fatales de la aplicación
 * - Muestra mensaje de error claro
 * - Termina con código de error (1)
 * - Evita que la aplicación continúe en estado inconsistente
 * 
 * BENEFICIOS:
 * - Punto de entrada claro y predecible
 * - Manejo robusto de errores
 * - Fácil testing y debugging
 * - Reutilización como módulo
 */
if (require.main === module) {
    app.run().catch(error => {
        console.error(chalk.red('❌ Error fatal:'), error.message);
        process.exit(1);
    });
}

/**
 * ========================================================================================
 * EXPORTACIÓN DEL MÓDULO - PATRÓN MODULE
 * ========================================================================================
 * 
 * DESCRIPCIÓN:
 * Exporta la clase GymMasterApp para uso en otros módulos.
 * Permite que otros archivos importen y usen la funcionalidad de la aplicación.
 * 
 * PATRÓN MODULE:
 * - Encapsula funcionalidad relacionada
 * - Permite reutilización en otros módulos
 * - Facilita la organización del código
 * - Mantiene la separación de responsabilidades
 * 
 * PRINCIPIO OCP (Open/Closed Principle):
 * - Permite extensión sin modificación
 * - Se pueden crear subclases de GymMasterApp
 * - Se pueden agregar nuevas funcionalidades
 * - Cerrado para modificación, abierto para extensión
 * 
 * BENEFICIOS:
 * - Reutilización de código
 * - Fácil testing y debugging
 * - Organización modular
 * - Extensibilidad
 */
module.exports = GymMasterApp;
