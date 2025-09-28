# 🏋️ GymMaster CLI - Sistema de Gestión de Gimnasio
<p align="center"> 
  <img src="https://media1.tenor.com/m/1ghY8kGML2sAAAAd/pepe-apu.gif" width="350"/> 
</p>

<p align="center"> 
  <img src="https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/MongoDB-6.20+-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/Inquirer.js-8.2.6-blue?style=for-the-badge&logo=terminal&logoColor=white" alt="Inquirer.js">
  <img src="https://img.shields.io/badge/Chalk-4.1.2-FF6B6B?style=for-the-badge&logo=terminal&logoColor=white" alt="Chalk">
  <img src="https://img.shields.io/badge/License-ISC-blue?style=for-the-badge" alt="ISC License">
  <img src="https://img.shields.io/badge/Status-Production-green?style=for-the-badge" alt="Production Ready">
  <img src="https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge" alt="Version">
</p>

> 🏋️ GymMaster CLI es un sistema de gestión completo para gimnasios desarrollado con Node.js, MongoDB Driver Nativo e Inquirer.js. 💻 Este proyecto demuestra la implementación de transacciones atómicas, consultas con Aggregation Framework y una arquitectura robusta. 🚀 Sistema CRUD completo para clientes, planes de entrenamiento, seguimiento de progreso, nutrición, contratos y finanzas, todo en una aplicación CLI interactiva de nivel empresarial.


--- 

## 📚 Fundamentos del Proyecto

### 🎯 ¿Qué es un Sistema de Gestión de Gimnasio?

Un sistema de gestión de gimnasio es una aplicación integral que maneja todos los aspectos operativos de un centro de fitness. En este proyecto, implementamos un sistema completo con transacciones atómicas, seguimiento de progreso y análisis de rendimiento usando MongoDB Driver Nativo.

### 🏗️ ¿Por qué MongoDB Driver Nativo?

El MongoDB Driver Nativo ofrece máximo rendimiento y control directo sobre las operaciones de base de datos sin capas de abstracción innecesarias como ODMs (Object Document Mapping). Esto resulta en:
- **Rendimiento superior**: Comunicación directa con MongoDB
- **Control total**: Acceso completo a todas las características de MongoDB
- **Transacciones reales**: Implementación de transacciones ACID nativas
- **Aggregation Framework**: Consultas complejas optimizadas

### ⚖️ Diferencias clave entre File System y Base de Datos

| Característica         | Sistema de Archivos                              | Base de Datos MongoDB                            |
|:-----------------------|:-------------------------------------------------|:-------------------------------------------------|
| **Escalabilidad**      | Limitada por sistema de archivos local          | Escalado horizontal y vertical ilimitado         |
| **Concurrencia**       | Problemas con acceso simultáneo                 | Transacciones ACID y control de concurrencia    |
| **Consultas**          | Carga completa y filtrado en memoria            | Consultas optimizadas con índices               |
| **Integridad**         | Sin validaciones automáticas                    | Validaciones a nivel de base de datos           |
| **Transacciones**      | Sin soporte para operaciones atómicas           | Transacciones ACID completas                    |
| **Agregaciones**       | Procesamiento manual de datos                   | Aggregation Framework nativo                    |

---

## 🧩 Diseño del Sistema

En lugar de usar archivos planos y operaciones síncronas, organizamos el código en una arquitectura modular con MongoDB como única fuente de verdad. El objetivo es crear un sistema escalable, mantenible y de alto rendimiento siguiendo mejores prácticas de la industria.

### 🗂️ Componentes Principales del Sistema

- **`Database`**: Configuración y gestión de conexiones MongoDB
- **`Models`**: Capa de acceso a datos que encapsula todas las operaciones MongoDB
- **`Services`**: Lógica de negocio que coordina operaciones entre UI y datos
- **`CLI`**: Interfaz de usuario CLI interactiva con Inquirer.js
- **`SeedData`**: Sistema de inicialización de datos de ejemplo

### ⚖️ Justificación: MongoDB vs Archivos Planos

La decisión clave fue migrar de archivos JSON a MongoDB para obtener ventajas empresariales:

- **Usamos MongoDB** para obtener escalabilidad, rendimiento y características empresariales
  - **Ventaja**: Transacciones ACID, índices, agregaciones, replicación
  - **Ejemplo**: Gestión de contratos con transacciones atómicas

- **Eliminamos archivos** para evitar limitaciones de sistemas de archivos
  - **Ventaja**: Sin bloqueos de archivos, sin problemas de concurrencia
  - **Ejemplo**: Múltiples entrenadores pueden registrar seguimiento simultáneamente

### 🧬 Estructura de Datos Optimizada

- **Esquema flexible**: MongoDB permite evolución del esquema sin migraciones
- **Índices inteligentes**: Optimización automática de consultas frecuentes
- **Validaciones en aplicación**: Control total sobre la integridad de datos
- **Operaciones atómicas**: Garantía de consistencia en operaciones complejas

---

## 📋 Descripción del Sistema

**GymMaster CLI** es una aplicación de consola que permite gestionar todos los aspectos de un gimnasio:

- 👥 **Gestión de Clientes**: Registro, actualización y seguimiento de clientes
- 📋 **Planes de Entrenamiento**: Creación y asignación de planes personalizados
- 📊 **Seguimiento Físico**: Registro de progreso, métricas y evolución
- 🥗 **Planes de Nutrición**: Control alimenticio y seguimiento nutricional
- 📄 **Gestión de Contratos**: Generación automática y control de contratos
- 💰 **Control Financiero**: Registro de ingresos, egresos y reportes financieros
- 📈 **Reportes y Estadísticas**: Análisis de progreso y rendimiento con Aggregation Framework

---

## 🏗️ Arquitectura del Sistema

### 📁 Estructura del Proyecto

```
GymMaster_CLI/
├── cli/                    # Interfaces CLI interactivas
│   ├── ClienteCLI.js      # Gestión de clientes
│   ├── PlanEntrenamientoCLI.js  # Gestión de planes
│   ├── SeguimientoCLI.js  # Seguimiento físico
│   ├── NutricionCLI.js    # Planes nutricionales
│   ├── ContratoCLI.js     # Gestión de contratos
│   ├── FinanzasCLI.js     # Control financiero
│   └── ReportesCLI.js     # Reportes y estadísticas
├── models/                 # Modelos de datos
├── repositories/           # Patrón Repository para acceso a datos
├── services/              # Lógica de negocio
├── config/                # Configuración y conexión a MongoDB
└── scripts/               # Scripts de utilidad y pruebas
```

### 🎯 Principios SOLID Aplicados

- **S (Single Responsibility)**: Cada clase tiene una responsabilidad específica
- **O (Open/Closed)**: Extensible sin modificar código existente
- **L (Liskov Substitution)**: Interfaces consistentes entre componentes
- **I (Interface Segregation)**: Interfaces específicas para cada funcionalidad
- **D (Dependency Inversion)**: Dependencias basadas en abstracciones

### 🔧 Patrones de Diseño Implementados

- **Repository Pattern**: Abstracción de acceso a datos MongoDB
- **Factory Pattern**: Creación de objetos complejos (contratos, planes)
- **Service Layer**: Lógica de negocio separada de la presentación

---

## 🎯 Principios SOLID Aplicados

### 📋 Implementación Detallada de SOLID

#### **S - Single Responsibility Principle (SRP)**
Cada clase tiene una única responsabilidad bien definida:

**Ejemplos de Implementación:**
- **`ClienteCLI.js`**: Solo maneja la interfaz de gestión de clientes
- **`ClienteService.js`**: Solo contiene lógica de negocio para clientes
- **`ClienteRepository.js`**: Solo maneja operaciones de persistencia de clientes
- **`ContratoService.js`**: Solo gestiona lógica de contratos
- **`FinanzasService.js`**: Solo maneja operaciones financieras

```javascript
// Ejemplo: ClienteService.js - Solo lógica de negocio de clientes
class ClienteService {
    async crearCliente(datosCliente) { /* Solo creación de clientes */ }
    async actualizarCliente(id, datos) { /* Solo actualización */ }
    async eliminarCliente(id) { /* Solo eliminación */ }
    async buscarCliente(criterios) { /* Solo búsqueda */ }
}
```

#### **O - Open/Closed Principle (OCP)**
Las clases están abiertas para extensión pero cerradas para modificación:

**Ejemplos de Implementación:**
- **`PlanEntrenamientoService.js`**: Extensible para nuevos tipos de planes sin modificar código existente
- **`ReportesService.js`**: Permite agregar nuevos tipos de reportes sin cambiar la estructura base
- **`NutricionService.js`**: Extensible para nuevos tipos de planes nutricionales

```javascript
// Ejemplo: Extensión sin modificación
class PlanEntrenamientoService {
    // Método base que puede ser extendido
    async crearPlan(tipoPlan, datos) {
        switch(tipoPlan) {
            case 'musculacion': return this.crearPlanMusculacion(datos);
            case 'cardio': return this.crearPlanCardio(datos);
            case 'funcional': return this.crearPlanFuncional(datos);
            // Fácil agregar nuevos tipos sin modificar este método
        }
    }
}
```

#### **L - Liskov Substitution Principle (LSP)**
Las subclases pueden sustituir a sus clases base sin alterar la funcionalidad:

**Ejemplos de Implementación:**
- **Repositorios**: Todos los repositorios implementan la misma interfaz
- **Servicios**: Todos los servicios siguen el mismo patrón de implementación
- **CLI Modules**: Todos los módulos CLI siguen la misma estructura

```javascript
// Ejemplo: Todos los repositorios son intercambiables
class BaseRepository {
    async create(data) { throw new Error('Must implement'); }
    async read(id) { throw new Error('Must implement'); }
    async update(id, data) { throw new Error('Must implement'); }
    async delete(id) { throw new Error('Must implement'); }
}

class ClienteRepository extends BaseRepository {
    // Implementación específica pero compatible
}
```

#### **I - Interface Segregation Principle (ISP)**
Interfaces específicas en lugar de interfaces grandes:

**Ejemplos de Implementación:**
- **`IClienteRepository`**: Solo métodos relacionados con clientes
- **`IContratoRepository`**: Solo métodos relacionados con contratos
- **`IFinanzasRepository`**: Solo métodos financieros
- **Servicios especializados**: Cada servicio tiene su interfaz específica

```javascript
// Ejemplo: Interfaces específicas
class IClienteRepository {
    async crearCliente(datos) { }
    async buscarCliente(criterios) { }
    async actualizarCliente(id, datos) { }
    async eliminarCliente(id) { }
}

class IContratoRepository {
    async crearContrato(datos) { }
    async buscarContrato(clienteId) { }
    async actualizarContrato(id, datos) { }
}
```

#### **D - Dependency Inversion Principle (DIP)**
Dependencias basadas en abstracciones, no en implementaciones concretas:

**Ejemplos de Implementación:**
- **Servicios dependen de interfaces de repositorios**, no de implementaciones concretas
- **CLI modules dependen de servicios**, no de repositorios directamente
- **Configuración inyectada** en lugar de hardcoded

```javascript
// Ejemplo: Inyección de dependencias
class ClienteService {
    constructor(clienteRepository, contratoRepository) {
        this.clienteRepository = clienteRepository;
        this.contratoRepository = contratoRepository;
    }
    
    async crearClienteConContrato(datosCliente, datosContrato) {
        // Usa abstracciones, no implementaciones concretas
        const cliente = await this.clienteRepository.create(datosCliente);
        const contrato = await this.contratoRepository.create({
            ...datosContrato,
            clienteId: cliente.id
        });
        return { cliente, contrato };
    }
}
```

---

## 🏗️ Patrones de Diseño Implementados

### 📋 Patrones Estructurales

#### **1. Repository Pattern**
**Ubicación**: `repositories/` directory
**Propósito**: Abstraer el acceso a datos MongoDB

**Implementación:**
```javascript
// repositories/ClienteRepository.js
class ClienteRepository {
    constructor(db) {
        this.db = db;
        this.collection = db.collection('clientes');
    }
    
    async create(clienteData) {
        return await this.collection.insertOne(clienteData);
    }
    
    async findById(id) {
        return await this.collection.findOne({ _id: new ObjectId(id) });
    }
    
    async update(id, updateData) {
        return await this.collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
    }
    
    async delete(id) {
        return await this.collection.deleteOne({ _id: new ObjectId(id) });
    }
}
```

**Beneficios:**
- Separación clara entre lógica de negocio y acceso a datos
- Fácil cambio de base de datos sin afectar servicios
- Reutilización de código de acceso a datos

#### **2. Service Layer Pattern**
**Ubicación**: `services/` directory
**Propósito**: Encapsular lógica de negocio compleja

**Implementación:**
```javascript
// services/ClienteService.js
class ClienteService {
    constructor(clienteRepository, contratoRepository) {
        this.clienteRepository = clienteRepository;
        this.contratoRepository = contratoRepository;
    }
    
    async crearClienteConContrato(datosCliente, datosContrato) {
        // Lógica de negocio compleja
        const cliente = await this.clienteRepository.create(datosCliente);
        const contrato = await this.contratoRepository.create({
            ...datosContrato,
            clienteId: cliente._id
        });
        return { cliente, contrato };
    }
}
```

### 📋 Patrones Creacionales

#### **3. Factory Pattern**
**Ubicación**: `services/` directory
**Propósito**: Crear objetos complejos (contratos, planes)

**Implementación:**
```javascript
// services/ContratoService.js
class ContratoFactory {
    static crearContrato(tipoPlan, datosCliente, datosPlan) {
        switch(tipoPlan) {
            case 'musculacion':
                return new ContratoMusculacion(datosCliente, datosPlan);
            case 'cardio':
                return new ContratoCardio(datosCliente, datosPlan);
            case 'funcional':
                return new ContratoFuncional(datosCliente, datosPlan);
            default:
                throw new Error('Tipo de plan no válido');
        }
    }
}
```

### 📋 Patrones de Comportamiento

#### **4. Command Pattern**
**Ubicación**: `cli/` directory
**Propósito**: Encapsular operaciones CLI como comandos

**Implementación:**
```javascript
// cli/ClienteCLI.js
class ClienteCommand {
    constructor(clienteService) {
        this.clienteService = clienteService;
    }
    
    async ejecutarCrearCliente(datos) {
        return await this.clienteService.crearCliente(datos);
    }
    
    async ejecutarActualizarCliente(id, datos) {
        return await this.clienteService.actualizarCliente(id, datos);
    }
}
```

#### **5. Observer Pattern**
**Ubicación**: `services/` directory
**Propósito**: Notificar cambios en el sistema

**Implementación:**
```javascript
// services/ProgresoService.js
class ProgresoService {
    constructor() {
        this.observers = [];
    }
    
    agregarObserver(observer) {
        this.observers.push(observer);
    }
    
    notificarCambioProgreso(progreso) {
        this.observers.forEach(observer => {
            observer.actualizarProgreso(progreso);
        });
    }
}
```

### 📋 Patrones Arquitectónicos

#### **6. MVC Pattern (Model-View-Controller)**
**Implementación:**
- **Model**: `models/` directory (Cliente.js, Contrato.js, etc.)
- **View**: `cli/` directory (ClienteCLI.js, ContratoCLI.js, etc.)
- **Controller**: `services/` directory (ClienteService.js, ContratoService.js, etc.)

#### **7. Dependency Injection**
**Ubicación**: `config/` directory
**Propósito**: Inyectar dependencias en lugar de crearlas

**Implementación:**
```javascript
// config/index.js
class DependencyContainer {
    constructor() {
        this.services = new Map();
    }
    
    register(name, factory) {
        this.services.set(name, factory);
    }
    
    get(name) {
        const factory = this.services.get(name);
        return factory();
    }
}

// Uso en la aplicación
const container = new DependencyContainer();
container.register('clienteRepository', () => new ClienteRepository(db));
container.register('clienteService', () => new ClienteService(
    container.get('clienteRepository')
));
```

### 📋 Patrones de Persistencia

#### **8. Unit of Work Pattern**
**Ubicación**: `services/` directory
**Propósito**: Manejar transacciones MongoDB

**Implementación:**
```javascript
// services/TransaccionService.js
class UnitOfWork {
    constructor(db) {
        this.db = db;
        this.session = db.client.startSession();
    }
    
    async ejecutarTransaccion(operaciones) {
        try {
            this.session.startTransaction();
            
            for (const operacion of operaciones) {
                await operacion(this.session);
            }
            
            await this.session.commitTransaction();
        } catch (error) {
            await this.session.abortTransaction();
            throw error;
        } finally {
            await this.session.endSession();
        }
    }
}
```

### 📊 Resumen de Implementación

| Patrón | Ubicación | Propósito | Beneficio |
|--------|-----------|-----------|-----------|
| **Repository** | `repositories/` | Abstracción de datos | Separación de responsabilidades |
| **Service Layer** | `services/` | Lógica de negocio | Reutilización y mantenimiento |
| **Factory** | `services/` | Creación de objetos | Flexibilidad en creación |
| **Command** | `cli/` | Operaciones CLI | Encapsulación de comandos |
| **Observer** | `services/` | Notificaciones | Desacoplamiento |
| **MVC** | Todo el proyecto | Arquitectura general | Organización clara |
| **Dependency Injection** | `config/` | Gestión de dependencias | Testabilidad |
| **Unit of Work** | `services/` | Transacciones | Consistencia de datos |

---

## 🚀 Características Técnicas

### 💾 Persistencia de Datos
- **MongoDB Driver Nativo**: Control directo y máximo rendimiento
- **Transacciones ACID**: Operaciones atómicas para consistencia
- **Índices Optimizados**: Consultas eficientes en colecciones grandes
- **Aggregation Framework**: Análisis complejos de datos

### 🎨 Experiencia de Usuario
- **Inquirer.js**: Formularios interactivos y navegación intuitiva
- **Chalk**: Mensajes coloridos y feedback visual claro
- **Validaciones Robustas**: Prevención de errores de entrada
- **Manejo de Errores**: Mensajes claros y recuperación graceful

### 🔄 Operaciones Críticas
- **Rollback Manual**: Recuperación de datos en operaciones complejas
- **Transacciones MongoDB**: Consistencia en operaciones multi-documento
- **Validaciones de Integridad**: Verificación de datos antes de persistir
- **Logs de Auditoría**: Seguimiento de operaciones importantes

---

## 📊 Funcionalidades Principales

### 👥 Gestión de Clientes
- Registro completo con validaciones
- Asociación con planes de entrenamiento
- Historial de seguimiento integrado
- Búsqueda y filtrado avanzado

### 📋 Planes de Entrenamiento
- Creación de planes personalizados
- Niveles: principiante, intermedio, avanzado
- Estados: activo, cancelado, finalizado
- Renovación y modificación automática

### 📊 Seguimiento Físico
- Registro periódico de métricas
- Historial cronológico completo
- Análisis de progreso
- Rollback de registros inconsistentes

### 🥗 Control Nutricional
- Planes alimenticios personalizados
- Registro diario de alimentos
- Cálculo automático de calorías
- Reportes nutricionales semanales

### 📄 Gestión de Contratos
- Generación automática al asignar planes
- Control de fechas y precios
- Estados y renovaciones
- Vinculación cliente-plan

### 💰 Control Financiero
- Registro de ingresos y egresos
- Clasificación por tipo y cliente
- Consultas por fecha y período
- Transacciones atómicas para pagos

---

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js 20+
- MongoDB 6.20+
- npm o yarn

### Instalación
```bash
# Clonar el repositorio
git clone https://github.com/DanielSantiagoV/GymMaster_CLI.git
cd GymMaster_CLI

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tu configuración MongoDB
```

### Configuración MongoDB
```bash
# Configurar replica set (requerido para transacciones)
npm run setup-replica

# Verificar configuración
npm run check-replica

# Iniciar MongoDB con replica set
npm run start-mongodb
```

### Ejecución
```bash
# Iniciar la aplicación
npm start

# Modo desarrollo
npm run dev
```

---

## 🚀 Instalación Completa del Repositorio

### 📋 Prerrequisitos del Sistema

#### Sistema Operativo
- **Windows 10/11** (recomendado)
- **Linux Ubuntu 20.04+** 
- **macOS 10.15+**

#### Software Requerido
- **Node.js 20.0+** ([Descargar Node.js](https://nodejs.org/))
- **MongoDB 6.20+** ([Descargar MongoDB](https://www.mongodb.com/try/download/community))
- **Git** ([Descargar Git](https://git-scm.com/))
- **npm 9.0+** (incluido con Node.js)

### 🔧 Instalación Paso a Paso

#### 1. Clonar el Repositorio
```bash
# Clonar el repositorio desde GitHub
git clone https://github.com/DanielSantiagoV/GymMaster_CLI.git

# Navegar al directorio del proyecto
cd GymMaster_CLI

# Verificar que estás en el directorio correcto
ls -la
```

#### 2. Instalar Dependencias
```bash
# Instalar todas las dependencias del proyecto
npm install

# Verificar que las dependencias se instalaron correctamente
npm list --depth=0
```

#### 3. Configurar Variables de Entorno
```bash
# Crear archivo de variables de entorno
cp .env.example .env

# Editar el archivo .env con tu configuración
# En Windows:
notepad .env

# En Linux/macOS:
nano .env
```

**Contenido del archivo `.env`:**
```env
# Configuración de MongoDB
MONGODB_URI=mongodb://localhost:27017/gymmaster
MONGODB_DATABASE=gymmaster

# Configuración de la aplicación
NODE_ENV=development
APP_PORT=3000

# Configuración de logs
LOG_LEVEL=info
```

#### 4. Configurar MongoDB

##### Opción A: MongoDB Local
```bash
# Instalar MongoDB Community Server
# Windows: Descargar desde mongodb.com
# Linux: 
sudo apt-get install mongodb-community
# macOS: 
brew install mongodb-community

# Iniciar MongoDB
# Windows:
net start MongoDB

# Linux:
sudo systemctl start mongod

# macOS:
brew services start mongodb-community
```

##### Opción B: MongoDB Atlas (Cloud)
```bash
# 1. Crear cuenta en MongoDB Atlas
# 2. Crear cluster gratuito
# 3. Obtener connection string
# 4. Actualizar MONGODB_URI en .env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gymmaster
```

#### 5. Configurar Replica Set (Requerido para Transacciones)
```bash
# Configurar replica set para transacciones
npm run setup-replica

# Verificar configuración
npm run check-replica

# Si hay problemas, usar script de corrección
npm run fix-mongodb
```

#### 6. Inicializar Base de Datos
```bash
# Crear colecciones e índices
node scripts/setup-database.js

# Insertar datos de ejemplo (opcional)
node scripts/seed-data.js
```

### 🧪 Verificación de la Instalación

#### 1. Probar Conexión a MongoDB
```bash
# Verificar conexión
npm run check-replica

# Probar conexión manual
node test-connection.js
```

#### 2. Ejecutar Pruebas del Sistema
```bash
# Prueba rápida de rollback
npm run test-rollback

# Prueba completa del sistema
npm run test-rollback-full
```

#### 3. Iniciar la Aplicación
```bash
# Iniciar en modo producción
npm start

# Iniciar en modo desarrollo
npm run dev
```

### 🔧 Configuración Avanzada

#### Configuración de MongoDB para Producción
```bash
# Crear usuario administrador
mongo
use admin
db.createUser({
  user: "admin",
  pwd: "password123",
  roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]
})

# Configurar autenticación
# Editar /etc/mongod.conf (Linux) o mongod.cfg (Windows)
security:
  authorization: enabled

# Reiniciar MongoDB
sudo systemctl restart mongod  # Linux
net stop MongoDB && net start MongoDB  # Windows
```

#### Configuración de Variables de Entorno por Ambiente

**Desarrollo (.env.development):**
```env
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/gymmaster_dev
LOG_LEVEL=debug
```

**Producción (.env.production):**
```env
NODE_ENV=production
MONGODB_URI=mongodb://username:password@localhost:27017/gymmaster
LOG_LEVEL=error
```

### 🐛 Solución de Problemas Comunes

#### Error: MongoDB no se conecta
```bash
# Verificar que MongoDB esté ejecutándose
# Windows:
net start MongoDB

# Linux:
sudo systemctl status mongod

# Verificar puerto
netstat -an | grep 27017
```

#### Error: Replica Set no configurado
```bash
# Reconfigurar replica set
npm run fix-mongodb

# Verificar configuración
npm run check-replica
```

#### Error: Dependencias no instaladas
```bash
# Limpiar cache de npm
npm cache clean --force

# Eliminar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

#### Error: Permisos en Windows
```bash
# Ejecutar como administrador
# O configurar permisos para la carpeta del proyecto
```

### 📊 Verificación de la Instalación Completa

#### Checklist de Verificación
- [ ] ✅ Node.js 20+ instalado
- [ ] ✅ MongoDB 6.20+ instalado y ejecutándose
- [ ] ✅ Repositorio clonado correctamente
- [ ] ✅ Dependencias instaladas (`npm install`)
- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ Replica set configurado
- [ ] ✅ Conexión a MongoDB verificada
- [ ] ✅ Aplicación inicia sin errores
- [ ] ✅ Pruebas de rollback funcionando
- [ ] ✅ Base de datos inicializada

#### Comandos de Verificación
```bash
# Verificar versiones
node --version
npm --version
mongod --version

# Verificar conexión
npm run check-replica

# Verificar aplicación
npm start
# Presionar Ctrl+C para salir
```

### 🚀 Primer Uso

#### 1. Iniciar la Aplicación
```bash
npm start
```

#### 2. Configurar Datos Iniciales
- Crear primer cliente
- Configurar planes de entrenamiento
- Establecer configuración del sistema

#### 3. Explorar Funcionalidades
- Gestión de clientes
- Planes de entrenamiento
- Seguimiento físico
- Control nutricional
- Gestión de contratos
- Control financiero
- Reportes y estadísticas

### 📚 Documentación Adicional

- [Guía de Instalación MongoDB](docs/INSTALAR_MONGODB.md)
- [Configuración MongoDB](docs/MONGODB_SETUP.md)
- [Solución de Problemas](docs/SOLUCION_RAPIDA.md)
- [Implementación de Rollback](docs/ROLLBACK_IMPLEMENTATION.md)

---

## 🧪 Pruebas y Validación

### Scripts de Prueba
```bash
# Prueba rápida de rollback
npm run test-rollback

# Prueba completa de rollback
npm run test-rollback-full

# Verificar conexión MongoDB
npm run check-replica
```

### Validación de Transacciones
- Pruebas de rollback en operaciones críticas
- Validación de consistencia de datos
- Verificación de transacciones ACID
- Pruebas de concurrencia

---

## 📚 Documentación Adicional

- [Análisis de Progreso](docs/ANALISIS_PROGRESO.md)
- [Configuración MongoDB](docs/MONGODB_SETUP.md)
- [Implementación de Rollback](docs/ROLLBACK_IMPLEMENTATION.md)
- [Módulo de Nutrición](docs/MODULO_NUTRICION.md)
- [Módulo de Reportes](docs/MODULO_REPORTES.md)

---

## 📁 Estructura de Archivos

```
📁 GymMaster_CLI/
├── 📁 cli/                      # Interfaces CLI interactivas
│   ├── 📄 ClienteCLI.js        # Gestión de clientes
│   ├── 📄 ConfigCLI.js         # Configuración del sistema
│   ├── 📄 ContratoCLI.js       # Gestión de contratos
│   ├── 📄 FinanzasCLI.js       # Control financiero
│   ├── 📄 index.js             # Punto de entrada CLI
│   ├── 📄 MenuPrincipal.js     # Menú principal interactivo
│   ├── 📄 NutricionCLI.js      # Planes nutricionales
│   ├── 📄 PlanEntrenamientoCLI.js # Gestión de planes
│   ├── 📄 ReportesCLI.js       # Reportes y estadísticas
│   └── 📄 SeguimientoCLI.js    # Seguimiento físico
├── 📁 config/                   # Configuración del sistema
│   ├── 📄 connection.js         # Gestión de conexiones MongoDB
│   ├── 📄 database.js          # Configuración de base de datos
│   ├── 📄 index.js             # Configuración principal
│   └── 📄 simple-database.js    # Base de datos simplificada
├── 📁 docs/                     # Documentación del proyecto
│   ├── 📄 ANALISIS_PROGRESO.md # Análisis de progreso
│   ├── 📄 COMO_PROBAR_ROLLBACK.md # Guía de pruebas rollback
│   ├── 📄 INSTALAR_MONGODB.md  # Instalación MongoDB
│   ├── 📄 MEJORAS_VALIDACION.md # Mejoras de validación
│   ├── 📄 MODULO_CONFIGURACION.md # Módulo configuración
│   ├── 📄 MODULO_NUTRICION.md  # Módulo nutrición
│   ├── 📄 MODULO_REPORTES.md   # Módulo reportes
│   ├── 📄 MONGODB_SETUP.md     # Configuración MongoDB
│   ├── 📄 PLAN_PRUEBAS_ROLLBACK.md # Plan de pruebas
│   ├── 📄 ROLLBACK_IMPLEMENTATION.md # Implementación rollback
│   ├── 📄 SOLUCION_MONGODB.md  # Solución MongoDB
│   ├── 📄 SOLUCION_RAPIDA.md   # Solución rápida
│   └── 📄 test-rollback-manual.md # Pruebas manuales
├── 📁 exports/                  # Exportaciones de datos
│   ├── 📄 clientes_*.csv       # Exportaciones de clientes
│   └── 📄 README.md            # Documentación de exportaciones
├── 📁 models/                   # Modelos de datos
│   ├── 📄 Cliente.js           # Modelo de clientes
│   ├── 📄 Cliente.json         # Esquema de clientes
│   ├── 📄 Contrato.js          # Modelo de contratos
│   ├── 📄 Contrato.json        # Esquema de contratos
│   ├── 📄 Finanzas.js          # Modelo financiero
│   ├── 📄 Finanzas.json        # Esquema financiero
│   ├── 📄 index.js             # Exportaciones de modelos
│   ├── 📄 Nutricion.js         # Modelo nutricional
│   ├── 📄 Nutricion.json       # Esquema nutricional
│   ├── 📄 Pago.js              # Modelo de pagos
│   ├── 📄 PlanEntrenamiento.js  # Modelo de planes
│   ├── 📄 PlanEntrenamiento.json # Esquema de planes
│   ├── 📄 Seguimiento.js       # Modelo de seguimiento
│   └── 📄 Seguimiento.json     # Esquema de seguimiento
├── 📁 repositories/             # Patrón Repository
│   ├── 📄 ClienteRepository.js # Repositorio de clientes
│   ├── 📄 ContratoRepository.js # Repositorio de contratos
│   ├── 📄 FinanzasRepository.js # Repositorio financiero
│   ├── 📄 index.js             # Exportaciones de repositorios
│   ├── 📄 NutricionRepository.js # Repositorio nutricional
│   ├── 📄 PagoRepository.js    # Repositorio de pagos
│   ├── 📄 PlanEntrenamientoRepository.js # Repositorio de planes
│   └── 📄 SeguimientoRepository.js # Repositorio de seguimiento
├── 📁 scripts/                  # Scripts de utilidad
│   ├── 📄 check-replica-set.js # Verificación de replica set
│   ├── 📄 configurar-replica-set.bat # Configuración Windows
│   ├── 📄 configurar-replica-set-manual.md # Guía manual
│   ├── 📄 fix-mongodb-replica.js # Corrección MongoDB
│   ├── 📄 quick-test-rollback.js # Prueba rápida rollback
│   ├── 📄 setup-replica-set.js # Configuración replica set
│   ├── 📄 start-mongodb-replica.bat # Inicio MongoDB
│   ├── 📄 test-rollback-manual.md # Pruebas manuales
│   └── 📄 test-rollback.js     # Pruebas de rollback
├── 📁 services/                 # Lógica de negocio
│   ├── 📄 BusquedaService.js   # Servicio de búsqueda
│   ├── 📄 ClienteIntegradoService.js # Servicio integrado
│   ├── 📄 ClienteService.js    # Servicio de clientes
│   ├── 📄 ContratoService.js   # Servicio de contratos
│   ├── 📄 FinanzasService.js   # Servicio financiero
│   ├── 📄 index.js             # Exportaciones de servicios
│   ├── 📄 NutricionService.js  # Servicio nutricional
│   ├── 📄 PlanClienteService.js # Servicio plan-cliente
│   ├── 📄 PlanEntrenamientoService.js # Servicio de planes
│   ├── 📄 PlantillasNutricionService.js # Plantillas nutrición
│   ├── 📄 ProgresoService.js  # Servicio de progreso
│   ├── 📄 ReportesService.js   # Servicio de reportes
│   └── 📄 SeguimientoService.js # Servicio de seguimiento
├── 📁 backups/                  # Respaldo de datos
├── 📄 index.js                  # Punto de entrada principal
├── 📄 package.json             # Configuración del proyecto
├── 📄 package-lock.json        # Lock de dependencias
├── 📄 README.md                # Documentación principal
├── 📄 REGLAS.TXT               # Especificaciones del proyecto
├── 📄 test-config.js           # Configuración de pruebas
└── 📄 test-connection.js       # Pruebas de conexión
```

