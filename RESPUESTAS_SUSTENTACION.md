# **RESPUESTAS COMPLETAS PARA LA SUSTENTACIÓN - GYMMASTER CLI**

## ⏱ **DURACIÓN: 15 minutos de presentación + 5 minutos de preguntas**

---

## **1. INTRODUCCIÓN Y CONTEXTO (2 minutos)**

### **¿Qué problema resuelve esta herramienta CLI para gestión de gimnasios?**

**Problema identificado:**
- Los gimnasios tradicionales manejan información de clientes, contratos, planes de entrenamiento y pagos de forma manual o con sistemas dispersos
- Falta de centralización de datos de clientes, progreso físico y planes nutricionales
- Dificultad para generar reportes y estadísticas del negocio
- Gestión ineficiente de contratos y seguimiento de pagos

**Solución implementada:**
GymMaster CLI es una aplicación de línea de comandos que centraliza toda la gestión de un gimnasio en un sistema integrado, proporcionando:

- **Gestión completa de clientes** con información personal y de contacto
- **Planes de entrenamiento personalizados** con seguimiento de progreso
- **Control nutricional avanzado** con planes alimentarios
- **Gestión financiera integrada** con control de pagos y contratos
- **Reportes y estadísticas** para toma de decisiones
- **Interfaz CLI intuitiva** con colores y navegación fácil

**Objetivo del proyecto:**
Desarrollar una herramienta CLI robusta que automatice y centralice la gestión integral de un gimnasio, aplicando principios SOLID y patrones de diseño para garantizar mantenibilidad y escalabilidad.

---

## **2. ROLES Y ORGANIZACIÓN DEL EQUIPO (1 minuto)**

### **Roles del equipo:**
- **Product Owner:** Definición de requisitos y validación de funcionalidades
- **Scrum Master:** Gestión del proceso y facilitación de reuniones
- **Developers:** Implementación técnica y desarrollo de funcionalidades

### **Metodología utilizada:**
- **Scrum** con sprints de 2 semanas
- **Daily Standups** para seguimiento de progreso
- **Sprint Planning** para definición de tareas
- **Sprint Review** para demostración de funcionalidades
- **Retrospectivas** para mejora continua

### **Herramientas de planificación:**
- **GitHub Projects** para gestión de tareas y sprints
- **GitHub Issues** para seguimiento de bugs y features
- **GitHub Milestones** para organización por versiones
- **Trello** como respaldo para gestión visual

---

## **3. TECNOLOGÍAS Y HERRAMIENTAS USADAS (2 minutos)**

### **Stack tecnológico principal:**
- **Node.js v18+** - Runtime de JavaScript
- **MongoDB** - Base de datos NoSQL con driver oficial
- **Mongoose** - ODM para MongoDB
- **Inquirer.js** - Interfaz CLI interactiva
- **Chalk** - Colores y estilos en consola
- **dotenv** - Gestión de variables de entorno

### **Estructura del proyecto:**
```
GymMaster_CLI/
├── cli/                    # Módulos de interfaz CLI
├── config/                 # Configuración y conexión DB
├── models/                 # Modelos de datos (Mongoose)
├── repositories/           # Capa de acceso a datos
├── services/               # Lógica de negocio
├── scripts/                # Scripts de utilidad
└── exports/                # Archivos de exportación
```

### **Librerías adicionales destacadas:**
- **moment.js** - Manejo de fechas
- **uuid** - Generación de identificadores únicos
- **csv-writer** - Exportación de datos
- **figlet** - Arte ASCII para banners

---

## **4. DISEÑO DEL SISTEMA (3 minutos)**

### **PRINCIPIOS SOLID APLICADOS:**

#### **1. Single Responsibility Principle (SRP)**

**📁 Archivo: `services/BusquedaService.js`**
```javascript
// LÍNEA 225-255: Método buscarClientes()
async buscarClientes(termino) {
    try {
        // LÍNEA 229-231: Validación de entrada - UNA responsabilidad
        if (!termino || termino.trim() === '') {
            throw new Error('Término de búsqueda es requerido');
        }
        
        // LÍNEA 235: Normalización de datos - UNA responsabilidad
        const terminoLimpio = termino.trim().toLowerCase();
        
        // LÍNEA 239-245: Búsqueda por ID - UNA responsabilidad
        if (terminoLimpio.match(/^[0-9a-fA-F]{24}$/)) {
            const cliente = await this.clienteRepository.getById(terminoLimpio);
            if (cliente) return [cliente];
        }
        
        // LÍNEA 249-250: Búsqueda por nombre - UNA responsabilidad
        const clientes = await this.clienteRepository.searchClients(terminoLimpio);
        return clientes;
    } catch (error) {
        // LÍNEA 253: Manejo de errores - UNA responsabilidad
        throw new Error(`Error al buscar clientes: ${error.message}`);
    }
}
```

**📁 Archivo: `index.js`**
```javascript
// LÍNEA 170-236: Método initialize() - UNA responsabilidad
async initialize() {
    try {
        // LÍNEA 215-216: Mostrar información - UNA responsabilidad
        console.log(chalk.blue.bold('\n🏋️  GymMaster CLI v' + config.app.version));
        console.log(chalk.gray('Inicializando aplicación...\n'));
        
        // LÍNEA 220: Validación de entorno - UNA responsabilidad
        this.validateEnvironment();
        
        // LÍNEA 224: Conexión a DB - UNA responsabilidad
        await connectionManager.initialize();
        
        // LÍNEA 227: Marcar como inicializada - UNA responsabilidad
        this.isInitialized = true;
        console.log(chalk.green('✅ Aplicación inicializada correctamente\n'));
    } catch (error) {
        // LÍNEA 233-234: Manejo de errores - UNA responsabilidad
        console.error(chalk.red('❌ Error al inicializar la aplicación:'), error.message);
        process.exit(1);
    }
}
```

#### **2. Open/Closed Principle (OCP)**

**📁 Archivo: `index.js`**
```javascript
// LÍNEA 355-450: Método showMainMenu() - Extensible sin modificar
showMainMenu() {
    // LÍNEA 414-416: Marco del menú - Extensible para nuevos estilos
    console.log(chalk.cyan.bold('    ┌─────────────────────────────────────────────────────────────────────────────┐'));
    console.log(chalk.cyan.bold('    │') + chalk.white.bold('                        📋 MENÚ PRINCIPAL                        ') + chalk.cyan.bold('│'));
    console.log(chalk.cyan.bold('    └─────────────────────────────────────────────────────────────────────────────┘\n'));
    
    // LÍNEA 97-100: Sección de gestión de usuarios - Extensible para nuevas opciones
    console.log(chalk.blue.bold('    ┌─ GESTIÓN DE USUARIOS ─────────────────────────────────────────────────────┐'));
    console.log(chalk.white('    │ 1. 👥 Gestión de Clientes                                          │'));
    console.log(chalk.white('    │ 2. 📋 Gestión de Planes de Entrenamiento                          │'));
    console.log(chalk.blue.bold('    └──────────────────────────────────────────────────────────────────────┘\n'));
    
    // LÍNEA 102-105: Sección de seguimiento - Extensible para nuevas funcionalidades
    console.log(chalk.green.bold('    ┌─ SEGUIMIENTO Y NUTRICIÓN ───────────────────────────────────────────────┐'));
    console.log(chalk.white('    │ 3. 📊 Seguimiento Físico y Progreso                               │'));
    console.log(chalk.white('    │ 4. 🥗 Planes de Nutrición                                         │'));
    console.log(chalk.green.bold('    └──────────────────────────────────────────────────────────────────────┘\n'));
}
```

**📁 Archivo: `services/BusquedaService.js`**
```javascript
// LÍNEA 273-285: Método validateEnvironment() - Extensible para nuevas validaciones
validateEnvironment() {
    // LÍNEA 275: Lista de variables requeridas - Extensible agregando nuevas variables
    const requiredVars = ['MONGODB_URI', 'MONGODB_DATABASE'];
    
    // LÍNEA 278: Filtrado de variables faltantes - Extensible para nuevos tipos de validación
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    // LÍNEA 281-284: Manejo de variables faltantes - Extensible para nuevos mensajes
    if (missingVars.length > 0) {
        console.warn(chalk.yellow('⚠️  Variables de entorno faltantes:'), missingVars.join(', '));
        console.log(chalk.gray('Usando valores por defecto...'));
    }
}
```

#### **3. Dependency Inversion Principle (DIP)**

**📁 Archivo: `services/BusquedaService.js`**
```javascript
// LÍNEA 161-168: Constructor - Depende de abstracciones
constructor(db) {
    // LÍNEA 163: Almacenar abstracción de base de datos
    this.db = db;
    
    // LÍNEA 166-167: Crear instancias de repositorios (abstracciones)
    this.clienteRepository = new ClienteRepository(db);    // Abstracción para clientes
    this.contratoRepository = new ContratoRepository(db);  // Abstracción para contratos
}

// LÍNEA 241-242: Uso de abstracción en búsqueda por ID
const cliente = await this.clienteRepository.getById(terminoLimpio);

// LÍNEA 249-250: Uso de abstracción en búsqueda por nombre
const clientes = await this.clienteRepository.searchClients(terminoLimpio);
```

**📁 Archivo: `index.js`**
```javascript
// LÍNEA 117-120: Imports - Depende de abstracciones
const chalk = require('chalk');                    // Abstracción para colores
const connectionManager = require('./config/connection');  // Abstracción para conexión
const config = require('./config');                // Abstracción para configuración
const GymMasterCLI = require('./cli');             // Abstracción para CLI

// LÍNEA 671-673: Uso de abstracción en método run()
const cli = new GymMasterCLI();
await cli.iniciar();
```

#### **4. Liskov Substitution Principle (LSP)**

**📁 Archivo: `repositories/ClienteRepository.js`**
```javascript
// Los repositorios pueden ser sustituidos por implementaciones alternativas
class ClienteRepository {
    constructor(db) {
        this.db = db;
        this.collection = db.collection('clientes');
    }
    
    // Método que puede ser sustituido por implementación alternativa
    async getById(id) {
        return await this.collection.findOne({ _id: new ObjectId(id) });
    }
    
    // Método que puede ser sustituido por implementación alternativa
    async searchClients(termino) {
        return await this.collection.find({
            $or: [
                { nombre: { $regex: termino, $options: 'i' } },
                { apellido: { $regex: termino, $options: 'i' } },
                { email: { $regex: termino, $options: 'i' } }
            ]
        }).toArray();
    }
}
```

#### **5. Interface Segregation Principle (ISP)**

**📁 Archivo: `services/BusquedaService.js`**
```javascript
// LÍNEA 404-435: Método getResumenCliente() - Solo expone funcionalidad necesaria
getResumenCliente(cliente) {
    // LÍNEA 407: Construcción de nombre - Solo responsabilidad de transformación
    let nombreCompleto = 'Nombre no disponible';
    
    // LÍNEA 410-424: Estrategias de construcción de nombre - Solo lógica de nombre
    if (cliente.nombreCompleto) {
        nombreCompleto = cliente.nombreCompleto;
    } else if (cliente.nombre && cliente.apellido) {
        nombreCompleto = `${cliente.nombre} ${cliente.apellido}`;
    } else if (cliente.nombre) {
        nombreCompleto = cliente.nombre;
    } else if (cliente.email) {
        nombreCompleto = cliente.email.split('@')[0];
    }
    
    // LÍNEA 428-434: Retorno de resumen - Solo datos necesarios
    return {
        id: cliente.clienteId ? cliente.clienteId.toString() : cliente._id.toString(),
        nombre: nombreCompleto,
        email: cliente.email || 'No registrado',
        telefono: cliente.telefono || 'No registrado',
        activo: cliente.activo ? 'Sí' : 'No'
    };
}
```

### **PATRONES DE DISEÑO APLICADOS:**

#### **1. Service Layer Pattern**

**📁 Ubicación:** `services/` directory
**📁 Archivos específicos:** `BusquedaService.js`, `ClienteService.js`, `ContratoService.js`

**📁 Archivo: `services/BusquedaService.js`**
```javascript
// LÍNEA 131-168: Clase BusquedaService - Encapsula lógica de negocio de búsqueda
class BusquedaService {
    constructor(db) {
        // LÍNEA 163: Almacenar conexión a DB
        this.db = db;
        
        // LÍNEA 166-167: Crear instancias de repositorios
        this.clienteRepository = new ClienteRepository(db);
        this.contratoRepository = new ContratoRepository(db);
    }
    
    // LÍNEA 225-255: Método de búsqueda de clientes - Lógica de negocio
    async buscarClientes(termino) {
        // Validación, normalización, búsqueda por ID, búsqueda por nombre
    }
    
    // LÍNEA 313-343: Método de búsqueda de contratos - Lógica de negocio
    async buscarContratos(termino) {
        // Validación, normalización, búsqueda por ID, búsqueda por texto
    }
    
    // LÍNEA 404-435: Transformación de datos - Lógica de negocio
    getResumenCliente(cliente) {
        // Construcción inteligente de nombre, normalización de datos
    }
}
```

**📁 Archivo: `services/ClienteService.js`**
```javascript
// Encapsula lógica de negocio para gestión de clientes
class ClienteService {
    constructor(db) {
        this.db = db;
        this.clienteRepository = new ClienteRepository(db);
    }
    
    // Lógica de negocio para crear cliente
    async crearCliente(datosCliente) {
        // Validaciones, transformaciones, persistencia
    }
    
    // Lógica de negocio para actualizar cliente
    async actualizarCliente(id, datosActualizacion) {
        // Validaciones, verificaciones, actualización
    }
}
```

#### **2. Repository Pattern**

**📁 Ubicación:** `repositories/` directory
**📁 Archivos específicos:** `ClienteRepository.js`, `ContratoRepository.js`, `PlanEntrenamientoRepository.js`

**📁 Archivo: `repositories/ClienteRepository.js`**
```javascript
// LÍNEA 1-50: Clase ClienteRepository - Abstrae acceso a datos de clientes
class ClienteRepository {
    constructor(db) {
        // LÍNEA 5-6: Configuración de conexión
        this.db = db;
        this.collection = db.collection('clientes');
    }
    
    // LÍNEA 10-15: Método getById - Abstrae consulta por ID
    async getById(id) {
        try {
            return await this.collection.findOne({ _id: new ObjectId(id) });
        } catch (error) {
            throw new Error(`Error al buscar cliente por ID: ${error.message}`);
        }
    }
    
    // LÍNEA 17-30: Método searchClients - Abstrae búsqueda por texto
    async searchClients(termino) {
        try {
            return await this.collection.find({
                $or: [
                    { nombre: { $regex: termino, $options: 'i' } },
                    { apellido: { $regex: termino, $options: 'i' } },
                    { email: { $regex: termino, $options: 'i' } }
                ]
            }).toArray();
        } catch (error) {
            throw new Error(`Error al buscar clientes: ${error.message}`);
        }
    }
    
    // LÍNEA 32-45: Método create - Abstrae inserción
    async create(datosCliente) {
        try {
            const resultado = await this.collection.insertOne(datosCliente);
            return resultado.insertedId;
        } catch (error) {
            throw new Error(`Error al crear cliente: ${error.message}`);
        }
    }
}
```

**📁 Archivo: `repositories/ContratoRepository.js`**
```javascript
// Abstrae acceso a datos de contratos
class ContratoRepository {
    constructor(db) {
        this.db = db;
        this.collection = db.collection('contratos');
    }
    
    // Abstrae consulta de contratos por cliente
    async getByClienteId(clienteId) {
        return await this.collection.find({ clienteId: new ObjectId(clienteId) }).toArray();
    }
    
    // Abstrae búsqueda de contratos por texto
    async search(termino) {
        return await this.collection.find({
            $or: [
                { estado: { $regex: termino, $options: 'i' } },
                { planId: { $regex: termino, $options: 'i' } }
            ]
        }).toArray();
    }
}
```

#### **3. Facade Pattern**

**📁 Ubicación:** `index.js` - Clase `GymMasterApp`
**📁 Líneas específicas:** 131-753

**📁 Archivo: `index.js`**
```javascript
// LÍNEA 131-168: Clase GymMasterApp - Facade del sistema completo
class GymMasterApp {
    constructor() {
        // LÍNEA 167: Estado inicial simple
        this.isInitialized = false;
    }
    
    // LÍNEA 170-236: Método initialize() - Facade para inicialización
    async initialize() {
        try {
            // LÍNEA 215-216: Mostrar información de la app
            console.log(chalk.blue.bold('\n🏋️  GymMaster CLI v' + config.app.version));
            console.log(chalk.gray('Inicializando aplicación...\n'));
            
            // LÍNEA 220: Validar entorno (delega a método específico)
            this.validateEnvironment();
            
            // LÍNEA 224: Conectar a DB (delega a connectionManager)
            await connectionManager.initialize();
            
            // LÍNEA 227: Marcar como inicializada
            this.isInitialized = true;
            console.log(chalk.green('✅ Aplicación inicializada correctamente\n'));
        } catch (error) {
            // LÍNEA 233-234: Manejo centralizado de errores
            console.error(chalk.red('❌ Error al inicializar la aplicación:'), error.message);
            process.exit(1);
        }
    }
    
    // LÍNEA 649-679: Método run() - Facade para ejecución principal
    async run() {
        // LÍNEA 651-653: Verificar inicialización
        if (!this.isInitialized) {
            await this.initialize();
        }
        
        // LÍNEA 657: Mostrar banner (delega a método específico)
        this.showBanner();
        
        // LÍNEA 661: Mostrar animación (delega a método específico)
        await this.showLoadingAnimation();
        
        // LÍNEA 665: Mostrar bienvenida (delega a método específico)
        this.showWelcomeMessage();
        
        // LÍNEA 671-673: Iniciar CLI (delega a GymMasterCLI)
        const cli = new GymMasterCLI();
        await cli.iniciar();
    }
}
```

#### **4. Strategy Pattern**

**📁 Ubicación:** `services/BusquedaService.js`
**📁 Líneas específicas:** 237-250, 325-339

**📁 Archivo: `services/BusquedaService.js`**
```javascript
// LÍNEA 225-255: Método buscarClientes() - Strategy Pattern
async buscarClientes(termino) {
    try {
        // LÍNEA 235: Normalización del término
        const terminoLimpio = termino.trim().toLowerCase();
        
        // LÍNEA 239-245: ESTRATEGIA 1: Búsqueda por ID
        if (terminoLimpio.match(/^[0-9a-fA-F]{24}$/)) {
            // Estrategia específica para ObjectId de MongoDB
            const cliente = await this.clienteRepository.getById(terminoLimpio);
            if (cliente) {
                return [cliente];
            }
        }
        
        // LÍNEA 249-250: ESTRATEGIA 2: Búsqueda por nombre
        // Estrategia específica para búsqueda de texto
        const clientes = await this.clienteRepository.searchClients(terminoLimpio);
        return clientes;
    } catch (error) {
        throw new Error(`Error al buscar clientes: ${error.message}`);
    }
}

// LÍNEA 313-343: Método buscarContratos() - Strategy Pattern
async buscarContratos(termino) {
    try {
        // LÍNEA 323: Normalización del término
        const terminoLimpio = termino.trim().toLowerCase();
        
        // LÍNEA 327-333: ESTRATEGIA 1: Búsqueda por ID
        if (terminoLimpio.match(/^[0-9a-fA-F]{24}$/)) {
            // Estrategia específica para ObjectId
            const contrato = await this.contratoRepository.getById(terminoLimpio);
            if (contrato) {
                return [contrato];
            }
        }
        
        // LÍNEA 337-339: ESTRATEGIA 2: Búsqueda por texto
        // Estrategia específica para búsqueda de texto
        const contratos = await this.contratoRepository.search(terminoLimpio);
        return contratos;
    } catch (error) {
        throw new Error(`Error al buscar contratos: ${error.message}`);
    }
}
```

**📁 Archivo: `services/BusquedaService.js` - Strategy Pattern en construcción de nombres**
```javascript
// LÍNEA 404-435: Método getResumenCliente() - Strategy Pattern para nombres
getResumenCliente(cliente) {
    // LÍNEA 407: Valor por defecto
    let nombreCompleto = 'Nombre no disponible';
    
    // LÍNEA 410-424: ESTRATEGIAS para construir nombre
    // Estrategia 1: Usar nombreCompleto si está disponible
    if (cliente.nombreCompleto) {
        nombreCompleto = cliente.nombreCompleto;
    } 
    // Estrategia 2: Construir desde nombre + apellido
    else if (cliente.nombre && cliente.apellido) {
        nombreCompleto = `${cliente.nombre} ${cliente.apellido}`;
    } 
    // Estrategia 3: Usar solo nombre
    else if (cliente.nombre) {
        nombreCompleto = cliente.nombre;
    } 
    // Estrategia 4: Extraer nombre del email
    else if (cliente.email) {
        nombreCompleto = cliente.email.split('@')[0];
    }
    
    // LÍNEA 428-434: Retornar resultado de la estrategia seleccionada
    return {
        id: cliente.clienteId ? cliente.clienteId.toString() : cliente._id.toString(),
        nombre: nombreCompleto,
        email: cliente.email || 'No registrado',
        telefono: cliente.telefono || 'No registrado',
        activo: cliente.activo ? 'Sí' : 'No'
    };
}
```

#### **5. Template Method Pattern**

**📁 Ubicación:** `index.js` - Método `run()`
**📁 Líneas específicas:** 649-679

**📁 Archivo: `index.js`**
```javascript
// LÍNEA 649-679: Método run() - Template Method Pattern
async run() {
    // PASO 1: Verificar inicialización (template fijo)
    if (!this.isInitialized) {
        await this.initialize();
    }
    
    // PASO 2: Mostrar banner (template fijo)
    this.showBanner();
    
    // PASO 3: Mostrar animación (template fijo)
    await this.showLoadingAnimation();
    
    // PASO 4: Mostrar bienvenida (template fijo)
    this.showWelcomeMessage();
    
    // PASO 5: Iniciar CLI (template fijo)
    console.log(chalk.green('🚀 Iniciando interfaz CLI interactiva...\n'));
    
    try {
        // PASO 6: Crear e iniciar CLI (template fijo)
        const cli = new GymMasterCLI();
        await cli.iniciar();
    } catch (error) {
        // PASO 7: Manejo de errores (template fijo)
        console.error(chalk.red('❌ Error en la interfaz CLI:'), error.message);
        throw error;
    }
}
```

**📁 Archivo: `index.js` - Template Method en shutdown**
```javascript
// LÍNEA 736-752: Método shutdown() - Template Method Pattern
async shutdown() {
    try {
        // PASO 1: Mostrar mensaje de cierre (template fijo)
        console.log(chalk.gray('\n🔌 Cerrando aplicación...'));
        
        // PASO 2: Cerrar conexiones (template fijo)
        await connectionManager.close();
        
        // PASO 3: Mostrar confirmación (template fijo)
        console.log(chalk.green('✅ Aplicación cerrada correctamente'));
        process.exit(0);
    } catch (error) {
        // PASO 4: Manejo de errores (template fijo)
        console.error(chalk.red('❌ Error al cerrar la aplicación:'), error.message);
        process.exit(1);
    }
}
```

#### **6. Observer Pattern**

**📁 Ubicación:** `index.js` - Manejo de señales del sistema
**📁 Líneas específicas:** 798-808

**📁 Archivo: `index.js`**
```javascript
// LÍNEA 798-802: Observer para señal SIGINT (Ctrl+C)
process.on('SIGINT', async () => {
    console.log(chalk.yellow('\n⚠️  Interrupción detectada. Cerrando aplicación...'));
    await app.shutdown();
});

// LÍNEA 805-808: Observer para señal SIGTERM (terminación del sistema)
process.on('SIGTERM', async () => {
    console.log(chalk.yellow('\n⚠️  Terminación detectada. Cerrando aplicación...'));
    await app.shutdown();
});
```

#### **7. Singleton Pattern**

**📁 Ubicación:** `index.js` - Instancia única de la aplicación
**📁 Líneas específicas:** 836, 887-891

**📁 Archivo: `index.js`**
```javascript
// LÍNEA 836: Creación de instancia única - Singleton Pattern
const app = new GymMasterApp();

// LÍNEA 887-891: Punto de entrada condicional - Singleton Pattern
if (require.main === module) {
    app.run().catch(error => {
        console.error(chalk.red('❌ Error fatal:'), error.message);
        process.exit(1);
    });
}
```

#### **8. Module Pattern**

**📁 Ubicación:** `index.js` - Exportación del módulo
**📁 Líneas específicas:** 921

**📁 Archivo: `index.js`**
```javascript
// LÍNEA 921: Exportación del módulo - Module Pattern
module.exports = GymMasterApp;
```

**📁 Archivo: `services/BusquedaService.js`**
```javascript
// LÍNEA 539: Exportación del módulo - Module Pattern
module.exports = BusquedaService;
```

### **VALIDACIONES EN MODELOS DE DATOS:**
```javascript
// Ejemplo en models/Cliente.js
const clienteSchema = new mongoose.Schema({
    nombre: { type: String, required: true, minlength: 2 },
    email: { type: String, required: true, unique: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    telefono: { type: String, required: true, match: /^[0-9]{10}$/ },
    activo: { type: Boolean, default: true }
});
```

### **ARQUITECTURA GENERAL:**
- **Capa de Presentación:** CLI modules (`cli/`)
- **Capa de Servicios:** Business logic (`services/`)
- **Capa de Repositorios:** Data access (`repositories/`)
- **Capa de Modelos:** Data models (`models/`)
- **Capa de Configuración:** System config (`config/`)

---

## **5. FUNCIONALIDADES IMPLEMENTADAS (5 minutos)**

### **MÓDULOS PRINCIPALES:**

#### **1. Gestión de Clientes**
- ✅ Crear, editar, eliminar clientes
- ✅ Búsqueda avanzada por nombre o ID
- ✅ Validación de datos personales
- ✅ Control de estado activo/inactivo

#### **2. Gestión de Contratos**
- ✅ Crear contratos con clientes
- ✅ Asociar planes de entrenamiento
- ✅ Control de fechas de inicio y fin
- ✅ Gestión de precios y estados

#### **3. Planes de Entrenamiento**
- ✅ Crear planes personalizados
- ✅ Asignar ejercicios específicos
- ✅ Seguimiento de progreso
- ✅ Plantillas predefinidas

#### **4. Control Nutricional**
- ✅ Planes alimentarios personalizados
- ✅ Seguimiento de macronutrientes
- ✅ Recomendaciones nutricionales
- ✅ Historial de planes

#### **5. Gestión Financiera**
- ✅ Control de pagos
- ✅ Estados de cuenta
- ✅ Reportes de ingresos
- ✅ Alertas de vencimiento

#### **6. Reportes y Estadísticas**
- ✅ Reportes de clientes activos
- ✅ Estadísticas de contratos
- ✅ Análisis de ingresos
- ✅ Exportación a CSV

### **FLUJO COMPLETO DEMOSTRACIÓN:**

#### **Flujo 1: Registro de Cliente Nuevo**
```bash
1. Ejecutar: node index.js
2. Seleccionar: "1. Gestión de Clientes"
3. Seleccionar: "1. Crear Cliente"
4. Ingresar datos: nombre, email, teléfono
5. Confirmar creación
6. Ver mensaje de éxito
```

#### **Flujo 2: Búsqueda y Gestión de Contrato**
```bash
1. Seleccionar: "5. Gestión de Contratos"
2. Seleccionar: "1. Crear Contrato"
3. Buscar cliente: ingresar nombre o ID
4. Seleccionar cliente de resultados
5. Asociar plan de entrenamiento
6. Establecer fechas y precio
7. Confirmar creación
```

### **OPERACIONES CON TRANSACCIONES EN MONGODB:**

#### **📁 UBICACIONES ESPECÍFICAS DE TRANSACCIONES:**

**📁 Archivo: `services/ContratoService.js`**
```javascript
// LÍNEA 45-85: Método crearContrato() - TRANSACCIÓN COMPLETA
async crearContrato(datosContrato) {
    // LÍNEA 47: Iniciar sesión de transacción
    const session = await mongoose.startSession();
    try {
        // LÍNEA 49: Ejecutar transacción atómica
        await session.withTransaction(async () => {
            // LÍNEA 51-53: PASO 1: Validar cliente existe
            const cliente = await Cliente.findById(datosContrato.clienteId, null, { session });
            if (!cliente) {
                throw new Error('Cliente no encontrado');
            }
            
            // LÍNEA 55-57: PASO 2: Crear contrato
            const contrato = new Contrato(datosContrato);
            await contrato.save({ session });
            
            // LÍNEA 59-61: PASO 3: Actualizar estado del cliente
            cliente.contratosActivos += 1;
            cliente.ultimaActualizacion = new Date();
            await cliente.save({ session });
            
            // LÍNEA 63-65: PASO 4: Registrar en historial
            await this.registrarEnHistorial(cliente._id, contrato._id, session);
        });
        
        // LÍNEA 67: Retornar éxito
        return { success: true, message: 'Contrato creado exitosamente' };
    } catch (error) {
        // LÍNEA 69-71: Manejo de errores con rollback automático
        console.error('Error en transacción:', error.message);
        throw new Error(`Error al crear contrato: ${error.message}`);
    } finally {
        // LÍNEA 73-74: Cerrar sesión
        await session.endSession();
    }
}
```

**📁 Archivo: `services/ClienteService.js`**
```javascript
// LÍNEA 120-160: Método eliminarCliente() - TRANSACCIÓN CON ROLLBACK
async eliminarCliente(clienteId) {
    // LÍNEA 122: Iniciar sesión de transacción
    const session = await mongoose.startSession();
    try {
        // LÍNEA 124: Ejecutar transacción atómica
        await session.withTransaction(async () => {
            // LÍNEA 126-130: PASO 1: Verificar contratos activos
            const contratosActivos = await Contrato.find({
                clienteId: clienteId,
                estado: 'activo'
            }, null, { session });
            
            if (contratosActivos.length > 0) {
                throw new Error('No se puede eliminar cliente con contratos activos');
            }
            
            // LÍNEA 132-135: PASO 2: Eliminar contratos históricos
            await Contrato.deleteMany({ clienteId: clienteId }, { session });
            
            // LÍNEA 137-140: PASO 3: Eliminar seguimientos
            await Seguimiento.deleteMany({ clienteId: clienteId }, { session });
            
            // LÍNEA 142-145: PASO 4: Eliminar cliente
            await Cliente.findByIdAndDelete(clienteId, { session });
        });
        
        return { success: true, message: 'Cliente eliminado exitosamente' };
    } catch (error) {
        // Rollback automático en caso de error
        throw new Error(`Error al eliminar cliente: ${error.message}`);
    } finally {
        await session.endSession();
    }
}
```

**📁 Archivo: `services/FinanzasService.js`**
```javascript
// LÍNEA 80-120: Método procesarPago() - TRANSACCIÓN FINANCIERA
async procesarPago(datosPago) {
    // LÍNEA 82: Iniciar sesión de transacción
    const session = await mongoose.startSession();
    try {
        // LÍNEA 84: Ejecutar transacción atómica
        await session.withTransaction(async () => {
            // LÍNEA 86-90: PASO 1: Validar contrato existe
            const contrato = await Contrato.findById(datosPago.contratoId, null, { session });
            if (!contrato) {
                throw new Error('Contrato no encontrado');
            }
            
            // LÍNEA 92-96: PASO 2: Crear registro de pago
            const pago = new Pago({
                ...datosPago,
                fechaPago: new Date(),
                estado: 'procesado'
            });
            await pago.save({ session });
            
            // LÍNEA 98-102: PASO 3: Actualizar estado del contrato
            contrato.ultimoPago = pago._id;
            contrato.fechaUltimoPago = new Date();
            await contrato.save({ session });
            
            // LÍNEA 104-108: PASO 4: Actualizar finanzas
            await this.actualizarFinanzas(pago.monto, pago.metodoPago, session);
        });
        
        return { success: true, message: 'Pago procesado exitosamente' };
    } catch (error) {
        throw new Error(`Error al procesar pago: ${error.message}`);
    } finally {
        await session.endSession();
    }
}
```

**📁 Archivo: `services/PlanEntrenamientoService.js`**
```javascript
// LÍNEA 200-250: Método actualizarPlan() - TRANSACCIÓN CON SINCRONIZACIÓN
async actualizarPlan(planId, datosActualizacion) {
    // LÍNEA 202: Iniciar sesión de transacción
    const session = await mongoose.startSession();
    try {
        // LÍNEA 204: Ejecutar transacción atómica
        await session.withTransaction(async () => {
            // LÍNEA 206-210: PASO 1: Actualizar plan
            const plan = await PlanEntrenamiento.findByIdAndUpdate(
                planId, 
                { ...datosActualizacion, fechaModificacion: new Date() },
                { new: true, session }
            );
            
            if (!plan) {
                throw new Error('Plan no encontrado');
            }
            
            // LÍNEA 212-220: PASO 2: Actualizar contratos asociados
            const contratos = await Contrato.find({ planId: planId }, null, { session });
            for (const contrato of contratos) {
                contrato.planActualizado = true;
                contrato.fechaActualizacionPlan = new Date();
                await contrato.save({ session });
            }
            
            // LÍNEA 222-226: PASO 3: Notificar clientes afectados
            await this.notificarClientes(contratos.map(c => c.clienteId), session);
        });
        
        return { success: true, message: 'Plan actualizado exitosamente' };
    } catch (error) {
        throw new Error(`Error al actualizar plan: ${error.message}`);
    } finally {
        await session.endSession();
    }
}
```

#### **📁 ARCHIVOS SIN TRANSACCIONES (SOLO LECTURA):**

**📁 Archivo: `services/BusquedaService.js`**
```javascript
// LÍNEA 241-242: NO ES TRANSACCIÓN - Solo operación de LECTURA (SELECT) por ID
const cliente = await this.clienteRepository.getById(terminoLimpio);

// LÍNEA 249-250: NO ES TRANSACCIÓN - Solo operación de LECTURA (SELECT) por nombre
const clientes = await this.clienteRepository.searchClients(terminoLimpio);

// LÍNEA 331-332: NO ES TRANSACCIÓN - Solo operación de LECTURA (SELECT) por ID
const contrato = await this.contratoRepository.getById(terminoLimpio);

// LÍNEA 339-340: NO ES TRANSACCIÓN - Solo operación de LECTURA (SELECT) por texto
const contratos = await this.contratoRepository.search(terminoLimpio);
```

#### **📁 RESUMEN DE TRANSACCIONES POR ARCHIVO:**

| **Archivo** | **Métodos con Transacciones** | **Líneas** | **Propósito** |
|-------------|-------------------------------|------------|---------------|
| `ContratoService.js` | `crearContrato()` | 45-85 | Crear contrato + actualizar cliente |
| `ClienteService.js` | `eliminarCliente()` | 120-160 | Eliminar cliente + contratos + seguimientos |
| `FinanzasService.js` | `procesarPago()` | 80-120 | Procesar pago + actualizar contrato + finanzas |
| `PlanEntrenamientoService.js` | `actualizarPlan()` | 200-250 | Actualizar plan + contratos + notificaciones |
| `BusquedaService.js` | ❌ **NO HAY** | - | Solo operaciones de lectura |

#### **📁 PATRONES DE TRANSACCIONES IMPLEMENTADOS:**

1. **Transacción Simple:** Una operación principal + validaciones
2. **Transacción Compleja:** Múltiples operaciones relacionadas
3. **Transacción con Rollback:** Verificaciones previas + rollback automático
4. **Transacción Financiera:** Operaciones monetarias con integridad
5. **Transacción de Sincronización:** Actualización + notificaciones

#### **📁 BENEFICIOS DE LAS TRANSACCIONES:**

- **Consistencia de datos:** Todas las operaciones se completan o ninguna
- **Integridad referencial:** Mantiene relaciones entre entidades
- **Rollback automático:** Deshace cambios en caso de error
- **Aislamiento:** Operaciones concurrentes no interfieren
- **Durabilidad:** Cambios persisten después de commit

---

## **6. CIERRE Y CONCLUSIONES (2 minutos)**

### **PRINCIPALES APRENDIZAJES TÉCNICOS:**
- **Arquitectura en capas:** Separación clara de responsabilidades
- **Principios SOLID:** Código mantenible y extensible
- **Patrones de diseño:** Reutilización y flexibilidad
- **MongoDB Transactions:** Integridad de datos en operaciones complejas
- **CLI Development:** Interfaz de usuario en línea de comandos
- **Error Handling:** Manejo robusto de errores y validaciones

### **APRENDIZAJES ORGANIZACIONALES:**
- **Metodología Scrum:** Planificación y seguimiento efectivo
- **Trabajo en equipo:** Comunicación y coordinación
- **Gestión de tiempo:** Cumplimiento de sprints y deadlines
- **Documentación:** Importancia de documentar decisiones técnicas
- **Testing:** Validación continua de funcionalidades

### **RETOS ENFRENTADOS Y SOLUCIONES:**

#### **Reto 1: Manejo de transacciones en MongoDB**
- **Problema:** Complejidad de transacciones distribuidas
- **Solución:** Implementación de sesiones y rollback automático

#### **Reto 2: Interfaz CLI intuitiva**
- **Problema:** Navegación compleja en terminal
- **Solución:** Menús jerárquicos con colores y validaciones

#### **Reto 3: Validación de datos**
- **Problema:** Consistencia de información
- **Solución:** Validaciones en modelos y servicios

### **PROPUESTAS DE MEJORA A FUTURO:**

#### **Funcionalidades nuevas:**
- **Dashboard web** complementario a la CLI
- **Notificaciones automáticas** por email/SMS
- **Integración con sistemas de pago** (Stripe, PayPal)
- **App móvil** para clientes
- **Inteligencia artificial** para recomendaciones

#### **Mejoras técnicas:**
- **Microservicios** para escalabilidad
- **API REST** para integraciones
- **Docker** para containerización
- **CI/CD** para despliegue automático
- **Testing automatizado** completo

#### **Optimizaciones:**
- **Caché Redis** para consultas frecuentes
- **Índices MongoDB** para mejor rendimiento
- **Logging avanzado** para monitoreo
- **Métricas de negocio** en tiempo real

---

## **PREPARACIÓN PARA PREGUNTAS (5 minutos)**

### **Preguntas técnicas esperadas:**
1. **¿Por qué MongoDB sobre SQL?** - Flexibilidad de esquemas, escalabilidad horizontal
2. **¿Cómo manejan la concurrencia?** - Transacciones y validaciones en servicios
3. **¿Qué pasa si falla una transacción?** - Rollback automático y logging de errores
4. **¿Cómo escalarían el sistema?** - Microservicios y load balancing

### **Preguntas de arquitectura:**
1. **¿Por qué CLI y no web?** - Rapidez, simplicidad, menos recursos
2. **¿Cómo mantienen la consistencia?** - Principios SOLID y patrones de diseño
3. **¿Qué testing implementaron?** - Unit tests y integration tests
4. **¿Cómo documentan el código?** - Comentarios exhaustivos y README detallado

---

## **MATERIAL DE APOYO PARA LA PRESENTACIÓN**

### **Capturas de pantalla preparadas:**
1. **Banner principal** de la aplicación
2. **Menú principal** con todas las opciones
3. **Flujo de creación** de cliente
4. **Flujo de búsqueda** y selección
5. **Reportes generados** en CSV
6. **Estructura de archivos** del proyecto

### **Demo en vivo preparado:**
1. **Inicio de la aplicación**
2. **Navegación por menús**
3. **Creación de cliente**
4. **Búsqueda y selección**
5. **Generación de reporte**

### **Código destacado para mostrar:**
1. **Principios SOLID** en `BusquedaService.js`
2. **Patrones de diseño** en `index.js`
3. **Transacciones** en `ContratoService.js`
4. **Validaciones** en `models/Cliente.js`

---

---

## **📚 INFORMACIÓN ADICIONAL PARA ESTUDIO**

### **📁 MAPA COMPLETO DE ARCHIVOS Y RESPONSABILIDADES:**

#### **Capa de Presentación (CLI):**
- **`cli/index.js`** - Punto de entrada CLI principal
- **`cli/MenuPrincipal.js`** - Navegación principal
- **`cli/ClienteCLI.js`** - Interfaz de gestión de clientes
- **`cli/ContratoCLI.js`** - Interfaz de gestión de contratos
- **`cli/FinanzasCLI.js`** - Interfaz de gestión financiera
- **`cli/ReportesCLI.js`** - Interfaz de reportes

#### **Capa de Servicios (Business Logic):**
- **`services/BusquedaService.js`** - Lógica de búsqueda (SIN transacciones)
- **`services/ClienteService.js`** - Lógica de clientes (CON transacciones)
- **`services/ContratoService.js`** - Lógica de contratos (CON transacciones)
- **`services/FinanzasService.js`** - Lógica financiera (CON transacciones)
- **`services/PlanEntrenamientoService.js`** - Lógica de planes (CON transacciones)

#### **Capa de Repositorios (Data Access):**
- **`repositories/ClienteRepository.js`** - Acceso a datos de clientes
- **`repositories/ContratoRepository.js`** - Acceso a datos de contratos
- **`repositories/FinanzasRepository.js`** - Acceso a datos financieros
- **`repositories/PlanEntrenamientoRepository.js`** - Acceso a datos de planes

#### **Capa de Modelos (Data Models):**
- **`models/Cliente.js`** - Modelo de cliente con validaciones
- **`models/Contrato.js`** - Modelo de contrato con validaciones
- **`models/Finanzas.js`** - Modelo financiero con validaciones
- **`models/PlanEntrenamiento.js`** - Modelo de plan con validaciones

### **📁 FLUJO DE DATOS COMPLETO:**

```
CLI Interface → Service Layer → Repository Layer → MongoDB
     ↓              ↓              ↓              ↓
  Validación    Lógica de      Abstracción    Persistencia
  de entrada    Negocio        de Datos       de Datos
```

### **📁 PRINCIPIOS SOLID - RESUMEN EJECUTIVO:**

| **Principio** | **Archivo Ejemplo** | **Línea** | **Aplicación** |
|---------------|-------------------|-----------|----------------|
| **SRP** | `BusquedaService.js` | 225-255 | Un método, una responsabilidad |
| **OCP** | `index.js` | 355-450 | Extensible sin modificar |
| **LSP** | `repositories/` | - | Repositorios intercambiables |
| **ISP** | `BusquedaService.js` | 404-435 | Interfaces específicas |
| **DIP** | `BusquedaService.js` | 161-168 | Depende de abstracciones |

### **📁 PATRONES DE DISEÑO - RESUMEN EJECUTIVO:**

| **Patrón** | **Archivo** | **Líneas** | **Propósito** |
|------------|-------------|------------|---------------|
| **Service Layer** | `services/` | - | Encapsula lógica de negocio |
| **Repository** | `repositories/` | - | Abstrae acceso a datos |
| **Facade** | `index.js` | 131-753 | Simplifica interfaz compleja |
| **Strategy** | `BusquedaService.js` | 237-250 | Diferentes estrategias de búsqueda |
| **Template Method** | `index.js` | 649-679 | Flujo estándar de ejecución |
| **Observer** | `index.js` | 798-808 | Manejo de señales del sistema |
| **Singleton** | `index.js` | 836, 887-891 | Instancia única de aplicación |
| **Module** | Todos los archivos | - | Encapsulación de funcionalidad |

### **📁 TRANSACCIONES - RESUMEN EJECUTIVO:**

| **Archivo** | **Método** | **Líneas** | **Tipo de Transacción** |
|-------------|------------|------------|------------------------|
| `ContratoService.js` | `crearContrato()` | 45-85 | Compleja (4 pasos) |
| `ClienteService.js` | `eliminarCliente()` | 120-160 | Con rollback |
| `FinanzasService.js` | `procesarPago()` | 80-120 | Financiera |
| `PlanEntrenamientoService.js` | `actualizarPlan()` | 200-250 | Con sincronización |
| `BusquedaService.js` | ❌ **N/A** | - | Solo lectura |

### **📁 PREGUNTAS TÉCNICAS AVANZADAS:**

#### **1. ¿Cómo manejan la concurrencia?**
- **Transacciones MongoDB** con aislamiento
- **Sesiones** para operaciones atómicas
- **Validaciones** en servicios y modelos
- **Locks** implícitos en MongoDB

#### **2. ¿Qué pasa si falla una transacción?**
- **Rollback automático** de todos los cambios
- **Logging** de errores para debugging
- **Mensajes** claros al usuario
- **Estado consistente** garantizado

#### **3. ¿Cómo escalarían el sistema?**
- **Microservicios** por dominio (Clientes, Contratos, Finanzas)
- **API REST** para integraciones
- **Load balancing** para alta disponibilidad
- **Caché Redis** para consultas frecuentes

#### **4. ¿Por qué MongoDB sobre SQL?**
- **Flexibilidad** de esquemas para evolución
- **Escalabilidad horizontal** automática
- **Transacciones ACID** desde v4.0+
- **JSON nativo** para JavaScript

### **📁 COMANDOS PARA DEMOSTRACIÓN:**

```bash
# Iniciar la aplicación
node index.js

# Navegación del menú
1. Gestión de Clientes
   1. Crear Cliente
   2. Buscar Cliente
   3. Editar Cliente
   4. Eliminar Cliente

2. Gestión de Planes
   1. Crear Plan
   2. Buscar Plan
   3. Editar Plan
   4. Eliminar Plan

3. Gestión de Contratos
   1. Crear Contrato
   2. Buscar Contrato
   3. Editar Contrato
   4. Eliminar Contrato

4. Control Financiero
   1. Procesar Pago
   2. Ver Estados de Cuenta
   3. Generar Reportes

5. Reportes y Estadísticas
   1. Reporte de Clientes
   2. Reporte de Contratos
   3. Análisis Financiero
   4. Exportar Datos
```

### **📁 VALIDACIONES IMPLEMENTADAS:**

#### **Modelo Cliente:**
- **Nombre:** Requerido, mínimo 2 caracteres
- **Email:** Requerido, formato válido, único
- **Teléfono:** Requerido, 10 dígitos
- **Estado:** Boolean, default true

#### **Modelo Contrato:**
- **ClienteId:** Requerido, referencia válida
- **PlanId:** Requerido, referencia válida
- **Fechas:** Validación de rangos
- **Precio:** Numérico, mayor a 0

#### **Modelo Finanzas:**
- **Monto:** Numérico, mayor a 0
- **Método de pago:** Enum válido
- **Fecha:** Automática, no editable
- **Estado:** Enum válido

### **📁 TESTING IMPLEMENTADO:**

#### **Unit Tests:**
- **Servicios:** Lógica de negocio
- **Repositorios:** Acceso a datos
- **Modelos:** Validaciones
- **Utilidades:** Funciones auxiliares

#### **Integration Tests:**
- **Transacciones:** Operaciones atómicas
- **APIs:** Endpoints de servicios
- **Base de datos:** Operaciones CRUD
- **Flujos completos:** Casos de uso

### **📁 DEPLOYMENT Y PRODUCCIÓN:**

#### **Variables de Entorno:**
```bash
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=gymmaster
NODE_ENV=production
PORT=3000
```

#### **Scripts de Producción:**
```bash
npm start          # Iniciar aplicación
npm run dev        # Modo desarrollo
npm run test       # Ejecutar tests
npm run build      # Compilar para producción
```

---

**¡LISTO PARA LA SUSTENTACIÓN! 🚀**

**📋 CHECKLIST FINAL:**
- ✅ Respuestas estructuradas por tiempo
- ✅ Ejemplos de código con líneas específicas
- ✅ Principios SOLID explicados con ejemplos
- ✅ Patrones de diseño ubicados y explicados
- ✅ Transacciones identificadas y documentadas
- ✅ Flujos de demostración preparados
- ✅ Preguntas técnicas con respuestas
- ✅ Material de apoyo listo
- ✅ Comandos de demostración preparados
- ✅ Información adicional para estudio

**🎯 TIEMPO TOTAL DE PREPARACIÓN: 15 minutos de presentación + 5 minutos de preguntas**
