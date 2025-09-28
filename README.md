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

## 🔧 Consideraciones Técnicas

### 📊 Rendimiento y Escalabilidad

#### **Optimización de Consultas MongoDB**
- **Índices Estratégicos**: Implementación de índices en campos frecuentemente consultados
- **Aggregation Pipeline**: Uso eficiente del Aggregation Framework para consultas complejas
- **Proyección de Campos**: Selección específica de campos para reducir transferencia de datos
- **Paginación**: Implementación de cursor-based pagination para grandes volúmenes de datos

```javascript
// Ejemplo: Índices optimizados
db.clientes.createIndex({ "email": 1 }, { unique: true });
db.clientes.createIndex({ "fechaRegistro": -1 });
db.contratos.createIndex({ "clienteId": 1, "estado": 1 });
db.seguimiento.createIndex({ "clienteId": 1, "fecha": -1 });
```

#### **Gestión de Memoria**
- **Streaming de Datos**: Procesamiento de grandes conjuntos de datos sin cargar todo en memoria
- **Lazy Loading**: Carga diferida de datos relacionados
- **Garbage Collection**: Optimización para evitar memory leaks en Node.js
- **Connection Pooling**: Reutilización eficiente de conexiones MongoDB

#### **Caching Strategy**
- **In-Memory Cache**: Cache de datos frecuentemente accedidos
- **TTL (Time To Live)**: Expiración automática de datos en cache
- **Cache Invalidation**: Estrategias para invalidar cache cuando los datos cambian

### 🔒 Seguridad y Autenticación

#### **Validación de Datos**
- **Input Sanitization**: Limpieza y validación de todos los inputs del usuario
- **Schema Validation**: Validación estricta usando esquemas JSON
- **SQL Injection Prevention**: Uso de parámetros preparados (aunque MongoDB es NoSQL)
- **XSS Protection**: Sanitización de datos antes de mostrar en CLI

```javascript
// Ejemplo: Validación de datos
const clienteSchema = {
    nombre: { type: String, required: true, minLength: 2, maxLength: 50 },
    email: { type: String, required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    telefono: { type: String, pattern: /^\+?[\d\s\-\(\)]+$/ },
    fechaNacimiento: { type: Date, max: new Date() }
};
```

#### **Manejo de Errores Seguro**
- **Error Logging**: Registro detallado de errores sin exponer información sensible
- **Graceful Degradation**: Manejo elegante de fallos del sistema
- **Retry Logic**: Reintentos automáticos para operaciones críticas
- **Circuit Breaker**: Patrón para evitar cascadas de fallos

#### **Auditoría y Logging**
- **Audit Trail**: Registro de todas las operaciones críticas
- **User Activity Logging**: Seguimiento de acciones del usuario
- **Performance Monitoring**: Monitoreo de rendimiento en tiempo real
- **Error Tracking**: Seguimiento detallado de errores y excepciones

### 🗄️ Gestión de Datos

#### **Transacciones ACID**
- **Atomicity**: Operaciones atómicas para mantener consistencia
- **Consistency**: Validaciones a nivel de aplicación y base de datos
- **Isolation**: Aislamiento de transacciones concurrentes
- **Durability**: Persistencia garantizada de datos

```javascript
// Ejemplo: Transacción ACID
async function crearClienteConContrato(datosCliente, datosContrato) {
    const session = client.startSession();
    try {
        await session.withTransaction(async () => {
            const cliente = await db.collection('clientes').insertOne(datosCliente, { session });
            const contrato = await db.collection('contratos').insertOne({
                ...datosContrato,
                clienteId: cliente.insertedId
            }, { session });
            return { cliente, contrato };
        });
    } finally {
        await session.endSession();
    }
}
```

#### **Backup y Recuperación**
- **Backup Automático**: Respaldos programados de la base de datos
- **Point-in-Time Recovery**: Recuperación a un momento específico
- **Data Export**: Exportación de datos en formatos estándar (CSV, JSON)
- **Disaster Recovery**: Plan de recuperación ante desastres

#### **Migración de Datos**
- **Schema Evolution**: Evolución del esquema sin pérdida de datos
- **Data Migration Scripts**: Scripts automatizados para migración de datos
- **Version Control**: Control de versiones para esquemas de base de datos
- **Rollback Capability**: Capacidad de revertir cambios en datos

### 🔄 Concurrencia y Sincronización

#### **Manejo de Concurrencia**
- **Optimistic Locking**: Control de concurrencia optimista
- **Pessimistic Locking**: Bloqueo pesimista para operaciones críticas
- **Race Condition Prevention**: Prevención de condiciones de carrera
- **Deadlock Avoidance**: Evitación de deadlocks en transacciones

#### **Sincronización de Datos**
- **Event Sourcing**: Patrón de almacenamiento de eventos
- **CQRS (Command Query Responsibility Segregation)**: Separación de comandos y consultas
- **Eventual Consistency**: Consistencia eventual para sistemas distribuidos
- **Conflict Resolution**: Resolución de conflictos en datos concurrentes

### 📈 Monitoreo y Observabilidad

#### **Métricas de Rendimiento**
- **Response Time**: Tiempo de respuesta de operaciones
- **Throughput**: Número de operaciones por segundo
- **Error Rate**: Tasa de errores del sistema
- **Resource Utilization**: Utilización de CPU, memoria y disco

#### **Health Checks**
- **Database Connectivity**: Verificación de conectividad a MongoDB
- **Service Health**: Estado de salud de todos los servicios
- **Dependency Checks**: Verificación de dependencias externas
- **Automated Alerts**: Alertas automáticas para problemas críticos

#### **Logging Estratégico**
- **Structured Logging**: Logs estructurados en formato JSON
- **Log Levels**: Diferentes niveles de logging (DEBUG, INFO, WARN, ERROR)
- **Correlation IDs**: Identificadores de correlación para rastrear requests
- **Performance Logging**: Logs específicos para análisis de rendimiento

### 🧪 Testing y Calidad

#### **Estrategias de Testing**
- **Unit Testing**: Pruebas unitarias para cada componente
- **Integration Testing**: Pruebas de integración entre módulos
- **End-to-End Testing**: Pruebas de extremo a extremo
- **Performance Testing**: Pruebas de rendimiento y carga

#### **Quality Assurance**
- **Code Coverage**: Cobertura de código en pruebas
- **Static Analysis**: Análisis estático de código
- **Dependency Scanning**: Escaneo de vulnerabilidades en dependencias
- **Code Review**: Revisión de código por pares

#### **Continuous Integration**
- **Automated Testing**: Ejecución automática de pruebas
- **Build Validation**: Validación de builds automáticos
- **Deployment Pipeline**: Pipeline de despliegue automatizado
- **Rollback Strategy**: Estrategia de rollback automático

### 🔧 Configuración y Despliegue

#### **Environment Management**
- **Environment Variables**: Gestión de variables de entorno
- **Configuration Files**: Archivos de configuración por ambiente
- **Secrets Management**: Gestión segura de secretos y credenciales
- **Feature Flags**: Banderas de características para control de funcionalidades

#### **Deployment Considerations**
- **Zero-Downtime Deployment**: Despliegue sin tiempo de inactividad
- **Blue-Green Deployment**: Estrategia de despliegue azul-verde
- **Canary Releases**: Lanzamientos canarios para validación
- **Rollback Procedures**: Procedimientos de rollback automatizados

#### **Infrastructure as Code**
- **Docker Containerization**: Containerización con Docker
- **Kubernetes Orchestration**: Orquestación con Kubernetes
- **Infrastructure Monitoring**: Monitoreo de infraestructura
- **Auto-scaling**: Escalado automático basado en demanda

### 📊 Análisis y Reportes

#### **Business Intelligence**
- **Data Analytics**: Análisis de datos de negocio
- **Trend Analysis**: Análisis de tendencias
- **Predictive Analytics**: Análisis predictivo
- **Custom Reports**: Reportes personalizados

#### **Performance Analytics**
- **Query Performance**: Análisis de rendimiento de consultas
- **Resource Usage**: Análisis de uso de recursos
- **Bottleneck Identification**: Identificación de cuellos de botella
- **Optimization Recommendations**: Recomendaciones de optimización

### 🛡️ Resilencia y Tolerancia a Fallos

#### **Fault Tolerance**
- **Circuit Breaker Pattern**: Patrón de cortacircuitos
- **Bulkhead Pattern**: Patrón de mamparos
- **Timeout Handling**: Manejo de timeouts
- **Retry Mechanisms**: Mecanismos de reintento

#### **Disaster Recovery**
- **Backup Strategies**: Estrategias de respaldo
- **Recovery Time Objective (RTO)**: Objetivo de tiempo de recuperación
- **Recovery Point Objective (RPO)**: Objetivo de punto de recuperación
- **Business Continuity**: Continuidad del negocio

### 📋 Consideraciones de Mantenimiento

#### **Code Maintenance**
- **Technical Debt Management**: Gestión de deuda técnica
- **Refactoring Strategy**: Estrategia de refactoring
- **Legacy Code Handling**: Manejo de código legacy
- **Documentation Maintenance**: Mantenimiento de documentación

#### **Operational Maintenance**
- **Regular Updates**: Actualizaciones regulares de dependencias
- **Security Patches**: Parches de seguridad
- **Performance Tuning**: Ajuste de rendimiento
- **Capacity Planning**: Planificación de capacidad

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

---

## 📊 Diagramas de Arquitectura del Sistema

### 🗄️ Diagrama de Entidad-Relación (ERD)

```mermaid
erDiagram
    CLIENTE {
        ObjectId _id PK
        String nombre
        String email UK
        String telefono
        Date fechaNacimiento
        String direccion
        String contactoEmergencia
        String telefonoEmergencia
        String historialMedico
        String restricciones
        String estado
        Date fechaRegistro
        Date fechaUltimaActualizacion
    }
    
    PLAN_ENTRENAMIENTO {
        ObjectId _id PK
        String nombre
        String descripcion
        Number duracionMeses
        String nivel
        Array metasFisicas
        Number precio
        String condiciones
        String estado
        Date fechaCreacion
        Date fechaUltimaActualizacion
    }
    
    CONTRATO {
        ObjectId _id PK
        ObjectId clienteId FK
        ObjectId planId FK
        String numeroContrato UK
        Date fechaInicio
        Date fechaFin
        Number precio
        String condiciones
        String estado
        Date fechaCreacion
        Date fechaUltimaActualizacion
    }
    
    SEGUIMIENTO {
        ObjectId _id PK
        ObjectId clienteId FK
        ObjectId planId FK
        Date fecha
        Number peso
        Number grasaCorporal
        Number masaMuscular
        Object medidasCorporales
        Array fotos
        String comentarios
        String observacionesEntrenador
        Date fechaRegistro
    }
    
    NUTRICION {
        ObjectId _id PK
        ObjectId clienteId FK
        ObjectId planId FK
        String nombre
        String descripcion
        Object objetivosNutricionales
        Array restriccionesAlimentarias
        Object horariosComida
        String estado
        Date fechaCreacion
        Date fechaUltimaActualizacion
    }
    
    CONSUMO_ALIMENTO {
        ObjectId _id PK
        ObjectId clienteId FK
        ObjectId alimentoId FK
        Number cantidad
        Number calorias
        String comida
        Date fecha
        Date fechaRegistro
    }
    
    ALIMENTO {
        ObjectId _id PK
        String nombre
        String categoria
        Number caloriasPorGramo
        Object macronutrientes
        String descripcion
        String estado
        Date fechaCreacion
    }
    
    FINANZAS {
        ObjectId _id PK
        String tipo
        ObjectId clienteId FK
        Number monto
        String concepto
        String metodoPago
        String categoria
        Date fecha
        String estado
        Date fechaRegistro
    }
    
    PAGO {
        ObjectId _id PK
        ObjectId clienteId FK
        ObjectId contratoId FK
        Number monto
        String concepto
        String metodoPago
        Date fechaPago
        String estado
        String numeroTransaccion
        Date fechaRegistro
    }
    
    REPORTE {
        ObjectId _id PK
        String tipo
        ObjectId clienteId FK
        Object parametros
        Object datos
        Date fechaGeneracion
        String estado
    }
    
    AUDITORIA {
        ObjectId _id PK
        String entidad
        ObjectId entidadId
        String accion
        Object datosAnteriores
        Object datosNuevos
        String usuario
        Date fechaAccion
        String ip
    }

    %% Relaciones
    CLIENTE ||--o{ CONTRATO : "tiene"
    PLAN_ENTRENAMIENTO ||--o{ CONTRATO : "incluye"
    CLIENTE ||--o{ SEGUIMIENTO : "registra"
    PLAN_ENTRENAMIENTO ||--o{ SEGUIMIENTO : "monitorea"
    CLIENTE ||--o{ NUTRICION : "sigue"
    PLAN_ENTRENAMIENTO ||--o{ NUTRICION : "asocia"
    CLIENTE ||--o{ CONSUMO_ALIMENTO : "consume"
    ALIMENTO ||--o{ CONSUMO_ALIMENTO : "incluye"
    CLIENTE ||--o{ FINANZAS : "genera"
    CLIENTE ||--o{ PAGO : "realiza"
    CONTRATO ||--o{ PAGO : "incluye"
    CLIENTE ||--o{ REPORTE : "genera"
    CLIENTE ||--o{ AUDITORIA : "audita"
    PLAN_ENTRENAMIENTO ||--o{ AUDITORIA : "audita"
    CONTRATO ||--o{ AUDITORIA : "audita"
    SEGUIMIENTO ||--o{ AUDITORIA : "audita"
    NUTRICION ||--o{ AUDITORIA : "audita"
    FINANZAS ||--o{ AUDITORIA : "audita"
    PAGO ||--o{ AUDITORIA : "audita"
```

### 🔄 Diagrama de Flujo de Datos (DFD)

```mermaid
flowchart TD
    %% Entidades Externas
    A[👤 Cliente] 
    B[🏋️ Entrenador]
    C[💰 Sistema Financiero]
    D[📊 Sistema de Reportes]
    
    %% Procesos Principales
    E[📝 Gestión de Clientes]
    F[📋 Gestión de Planes]
    G[📊 Seguimiento Físico]
    H[🥗 Control Nutricional]
    I[📄 Gestión de Contratos]
    J[💰 Control Financiero]
    K[📈 Generación de Reportes]
    L[🔍 Sistema de Auditoría]
    
    %% Almacenes de Datos
    M[(🗄️ Base de Datos MongoDB)]
    N[(📁 Archivos de Exportación)]
    O[(📋 Logs de Auditoría)]
    
    %% Flujos de Datos
    A -->|Datos Personales| E
    A -->|Consultas| E
    A -->|Progreso Físico| G
    A -->|Consumo Alimentario| H
    A -->|Pagos| J
    
    B -->|Crear Planes| F
    B -->|Registrar Seguimiento| G
    B -->|Crear Planes Nutricionales| H
    B -->|Consultar Reportes| K
    
    C -->|Transacciones| J
    D -->|Datos Exportados| N
    
    %% Procesos a Almacenes
    E <-->|CRUD Clientes| M
    F <-->|CRUD Planes| M
    G <-->|CRUD Seguimiento| M
    H <-->|CRUD Nutrición| M
    I <-->|CRUD Contratos| M
    J <-->|CRUD Finanzas| M
    K <-->|Consultas| M
    L <-->|Registro| O
    
    %% Exportaciones
    K -->|Exportar Datos| N
    L -->|Logs| O
    
    %% Transacciones entre Procesos
    E -.->|Asociar Cliente| F
    F -.->|Generar Contrato| I
    I -.->|Registrar Pago| J
    G -.->|Actualizar Progreso| K
    H -.->|Actualizar Nutrición| K
    J -.->|Actualizar Finanzas| K
    
    %% Auditoría
    E -.->|Auditar| L
    F -.->|Auditar| L
    G -.->|Auditar| L
    H -.->|Auditar| L
    I -.->|Auditar| L
    J -.->|Auditar| L
```

### 🏗️ Diagrama de Arquitectura del Sistema

```mermaid
graph TB
    %% Capa de Presentación
    subgraph "🖥️ Capa de Presentación"
        CLI[CLI Interface]
        MENU[Menu Principal]
        CLI_CLIENTE[Cliente CLI]
        CLI_PLAN[Plan CLI]
        CLI_SEGUIMIENTO[Seguimiento CLI]
        CLI_NUTRICION[Nutrición CLI]
        CLI_CONTRATO[Contrato CLI]
        CLI_FINANZAS[Finanzas CLI]
        CLI_REPORTES[Reportes CLI]
    end
    
    %% Capa de Servicios
    subgraph "⚙️ Capa de Servicios"
        SERVICE_CLIENTE[Cliente Service]
        SERVICE_PLAN[Plan Service]
        SERVICE_SEGUIMIENTO[Seguimiento Service]
        SERVICE_NUTRICION[Nutrición Service]
        SERVICE_CONTRATO[Contrato Service]
        SERVICE_FINANZAS[Finanzas Service]
        SERVICE_REPORTES[Reportes Service]
        SERVICE_BUSQUEDA[Búsqueda Service]
        SERVICE_PROGRESO[Progreso Service]
    end
    
    %% Capa de Repositorios
    subgraph "🗄️ Capa de Repositorios"
        REPO_CLIENTE[Cliente Repository]
        REPO_PLAN[Plan Repository]
        REPO_SEGUIMIENTO[Seguimiento Repository]
        REPO_NUTRICION[Nutrición Repository]
        REPO_CONTRATO[Contrato Repository]
        REPO_FINANZAS[Finanzas Repository]
        REPO_PAGO[Pago Repository]
    end
    
    %% Capa de Modelos
    subgraph "📋 Capa de Modelos"
        MODEL_CLIENTE[Cliente Model]
        MODEL_PLAN[Plan Model]
        MODEL_SEGUIMIENTO[Seguimiento Model]
        MODEL_NUTRICION[Nutrición Model]
        MODEL_CONTRATO[Contrato Model]
        MODEL_FINANZAS[Finanzas Model]
        MODEL_PAGO[Pago Model]
    end
    
    %% Base de Datos
    subgraph "💾 Persistencia"
        MONGODB[(MongoDB Database)]
        COLLECTIONS[Collections]
        INDEXES[Índices]
        TRANSACTIONS[Transacciones]
    end
    
    %% Configuración
    subgraph "⚙️ Configuración"
        CONFIG[Config Manager]
        CONNECTION[Connection Manager]
        ENV[Environment Variables]
    end
    
    %% Conexiones entre capas
    CLI --> MENU
    MENU --> CLI_CLIENTE
    MENU --> CLI_PLAN
    MENU --> CLI_SEGUIMIENTO
    MENU --> CLI_NUTRICION
    MENU --> CLI_CONTRATO
    MENU --> CLI_FINANZAS
    MENU --> CLI_REPORTES
    
    CLI_CLIENTE --> SERVICE_CLIENTE
    CLI_PLAN --> SERVICE_PLAN
    CLI_SEGUIMIENTO --> SERVICE_SEGUIMIENTO
    CLI_NUTRICION --> SERVICE_NUTRICION
    CLI_CONTRATO --> SERVICE_CONTRATO
    CLI_FINANZAS --> SERVICE_FINANZAS
    CLI_REPORTES --> SERVICE_REPORTES
    
    SERVICE_CLIENTE --> REPO_CLIENTE
    SERVICE_PLAN --> REPO_PLAN
    SERVICE_SEGUIMIENTO --> REPO_SEGUIMIENTO
    SERVICE_NUTRICION --> REPO_NUTRICION
    SERVICE_CONTRATO --> REPO_CONTRATO
    SERVICE_FINANZAS --> REPO_FINANZAS
    SERVICE_REPORTES --> REPO_CLIENTE
    SERVICE_REPORTES --> REPO_PLAN
    SERVICE_REPORTES --> REPO_SEGUIMIENTO
    
    REPO_CLIENTE --> MODEL_CLIENTE
    REPO_PLAN --> MODEL_PLAN
    REPO_SEGUIMIENTO --> MODEL_SEGUIMIENTO
    REPO_NUTRICION --> MODEL_NUTRICION
    REPO_CONTRATO --> MODEL_CONTRATO
    REPO_FINANZAS --> MODEL_FINANZAS
    REPO_PAGO --> MODEL_PAGO
    
    MODEL_CLIENTE --> MONGODB
    MODEL_PLAN --> MONGODB
    MODEL_SEGUIMIENTO --> MONGODB
    MODEL_NUTRICION --> MONGODB
    MODEL_CONTRATO --> MONGODB
    MODEL_FINANZAS --> MONGODB
    MODEL_PAGO --> MONGODB
    
    CONFIG --> CONNECTION
    CONNECTION --> MONGODB
    ENV --> CONFIG
```

### 🔄 Diagrama de Flujo de Transacciones

```mermaid
sequenceDiagram
    participant U as Usuario
    participant CLI as CLI Interface
    participant S as Service Layer
    participant R as Repository
    participant DB as MongoDB
    participant A as Auditoría
    
    Note over U,A: Flujo de Creación de Cliente con Plan
    
    U->>CLI: Crear Cliente
    CLI->>S: ClienteService.crearCliente()
    S->>R: ClienteRepository.create()
    R->>DB: insertOne(cliente)
    DB-->>R: clienteId
    R-->>S: Cliente creado
    S-->>CLI: Cliente creado
    CLI-->>U: Cliente creado exitosamente
    
    U->>CLI: Asignar Plan
    CLI->>S: PlanService.asignarPlan()
    
    Note over S,DB: Transacción ACID
    S->>DB: startSession()
    S->>DB: startTransaction()
    
    S->>R: PlanRepository.findById()
    R->>DB: findOne(plan)
    DB-->>R: plan data
    R-->>S: plan encontrado
    
    S->>R: ClientePlanRepository.create()
    R->>DB: insertOne(clientePlan)
    DB-->>R: asociación creada
    
    S->>R: ContratoRepository.create()
    R->>DB: insertOne(contrato)
    DB-->>R: contrato creado
    
    S->>DB: commitTransaction()
    DB-->>S: transacción exitosa
    S->>DB: endSession()
    
    S->>A: AuditoriaService.registrar()
    A->>DB: insertOne(auditoria)
    
    S-->>CLI: Plan asignado exitosamente
    CLI-->>U: Plan asignado con contrato generado
    
    Note over U,A: Flujo de Rollback en caso de error
    
    U->>CLI: Eliminar Seguimiento
    CLI->>S: SeguimientoService.eliminar()
    
    S->>R: SeguimientoRepository.verificarDependencias()
    R->>DB: find(dependencias)
    DB-->>R: dependencias encontradas
    
    alt Dependencias encontradas
        R-->>S: Error: Dependencias existentes
        S-->>CLI: Error: No se puede eliminar
        CLI-->>U: Error con explicación
    else Sin dependencias
        S->>DB: startSession()
        S->>DB: startTransaction()
        
        S->>R: SeguimientoRepository.delete()
        R->>DB: deleteOne(seguimiento)
        
        S->>R: ClienteRepository.actualizarEstadisticas()
        R->>DB: updateOne(estadisticas)
        
        S->>DB: commitTransaction()
        S->>A: AuditoriaService.registrarEliminacion()
        
        S-->>CLI: Seguimiento eliminado
        CLI-->>U: Eliminación exitosa
    end
```

### 📊 Diagrama de Estados del Sistema

```mermaid
stateDiagram-v2
    [*] --> Inicializacion
    
    Inicializacion --> ConectandoMongoDB : Verificar conexión
    ConectandoMongoDB --> ConfiguracionCompleta : Conexión exitosa
    ConectandoMongoDB --> ErrorConexion : Error de conexión
    ErrorConexion --> [*] : Salir del sistema
    
    ConfiguracionCompleta --> MenuPrincipal : Sistema listo
    
    MenuPrincipal --> GestionClientes : Opción 1
    MenuPrincipal --> GestionPlanes : Opción 2
    MenuPrincipal --> SeguimientoFisico : Opción 3
    MenuPrincipal --> ControlNutricional : Opción 4
    MenuPrincipal --> GestionContratos : Opción 5
    MenuPrincipal --> ControlFinanciero : Opción 6
    MenuPrincipal --> ReportesEstadisticas : Opción 7
    MenuPrincipal --> ConfiguracionSistema : Opción 8
    MenuPrincipal --> [*] : Opción 9 (Salir)
    
    GestionClientes --> MenuPrincipal : Volver
    GestionPlanes --> MenuPrincipal : Volver
    SeguimientoFisico --> MenuPrincipal : Volver
    ControlNutricional --> MenuPrincipal : Volver
    GestionContratos --> MenuPrincipal : Volver
    ControlFinanciero --> MenuPrincipal : Volver
    ReportesEstadisticas --> MenuPrincipal : Volver
    ConfiguracionSistema --> MenuPrincipal : Volver
    
    state GestionClientes {
        [*] --> ListarClientes
        ListarClientes --> CrearCliente : Crear
        ListarClientes --> ActualizarCliente : Actualizar
        ListarClientes --> EliminarCliente : Eliminar
        ListarClientes --> BuscarCliente : Buscar
        CrearCliente --> ListarClientes : Completado
        ActualizarCliente --> ListarClientes : Completado
        EliminarCliente --> ListarClientes : Completado
        BuscarCliente --> ListarClientes : Completado
    }
    
    state GestionPlanes {
        [*] --> ListarPlanes
        ListarPlanes --> CrearPlan : Crear
        ListarPlanes --> AsignarPlan : Asignar
        ListarPlanes --> RenovarPlan : Renovar
        ListarPlanes --> CancelarPlan : Cancelar
        CrearPlan --> ListarPlanes : Completado
        AsignarPlan --> ListarPlanes : Completado
        RenovarPlan --> ListarPlanes : Completado
        CancelarPlan --> ListarPlanes : Completado
    }
    
    state SeguimientoFisico {
        [*] --> ListarSeguimientos
        ListarSeguimientos --> RegistrarProgreso : Registrar
        ListarSeguimientos --> VerProgreso : Ver
        ListarSeguimientos --> EliminarRegistro : Eliminar
        RegistrarProgreso --> ListarSeguimientos : Completado
        VerProgreso --> ListarSeguimientos : Completado
        EliminarRegistro --> ListarSeguimientos : Completado
    }
```

---

## 🎯 Funcionalidades Mínimas Implementadas

### 👥 Gestión de Clientes

#### **Operaciones CRUD Completas**
- **Crear Clientes**: Registro completo con validaciones estrictas
  - Datos personales (nombre, email, teléfono, fecha de nacimiento)
  - Información de contacto y emergencia
  - Historial médico y restricciones
  - Validación de unicidad de email

- **Listar Clientes**: Visualización organizada y filtrable
  - Lista completa con paginación
  - Filtros por estado, plan activo, fecha de registro
  - Búsqueda por nombre, email o teléfono
  - Ordenamiento por diferentes criterios

- **Actualizar Clientes**: Modificación segura de datos
  - Actualización de información personal
  - Cambio de estado del cliente
  - Modificación de datos de contacto
  - Historial de cambios auditado

- **Eliminar Clientes**: Eliminación con validaciones
  - Verificación de dependencias (contratos activos)
  - Eliminación lógica (soft delete) por defecto
  - Eliminación física solo si no hay dependencias
  - Rollback automático en caso de error

#### **Asociación con Planes de Entrenamiento**
- **Asignación Múltiple**: Un cliente puede tener varios planes
- **Validación de Compatibilidad**: Verificación de restricciones médicas
- **Historial de Planes**: Seguimiento de todos los planes asignados
- **Estados de Asociación**: Activo, pausado, finalizado, cancelado

**Implementación Técnica:**
```javascript
// Ejemplo: Asociación cliente-plan
async function asociarClientePlan(clienteId, planId, datosContrato) {
    const session = client.startSession();
    try {
        await session.withTransaction(async () => {
            // Verificar que el cliente existe
            const cliente = await ClienteRepository.findById(clienteId);
            if (!cliente) throw new Error('Cliente no encontrado');
            
            // Verificar que el plan existe
            const plan = await PlanRepository.findById(planId);
            if (!plan) throw new Error('Plan no encontrado');
            
            // Crear asociación
            await ClientePlanRepository.create({
                clienteId,
                planId,
                fechaInicio: new Date(),
                estado: 'activo'
            });
            
            // Generar contrato automáticamente
            await ContratoService.generarContrato(clienteId, planId, datosContrato);
        });
    } finally {
        await session.endSession();
    }
}
```

### 📋 Gestión de Planes de Entrenamiento

#### **Creación de Planes Personalizados**
- **Estructura Completa**: Nombre, duración, metas físicas, nivel
- **Niveles de Dificultad**: Principiante, intermedio, avanzado
- **Metas Específicas**: Objetivos cuantificables y medibles
- **Duración Flexible**: Planes de 1, 3, 6, 12 meses o personalizados

#### **Asociación Automática con Contratos**
- **Generación Automática**: Contrato creado al asignar plan
- **Campos Obligatorios**: Condiciones, duración, precio, fechas
- **Validaciones**: Verificación de compatibilidad cliente-plan
- **Estados de Plan**: Activo, pausado, finalizado, cancelado

#### **Gestión de Estados de Planes**
- **Renovación**: Extensión automática con nuevos términos
- **Cancelación**: Cancelación con rollback de datos relacionados
- **Finalización**: Cierre completo con archivo de historial
- **Pausa Temporal**: Suspensión temporal sin pérdida de datos

**Implementación Técnica:**
```javascript
// Ejemplo: Gestión de estados de planes
class PlanEntrenamientoService {
    async renovarPlan(planId, nuevaDuracion, nuevosTerminos) {
        const session = client.startSession();
        try {
            await session.withTransaction(async () => {
                // Actualizar plan existente
                await PlanRepository.update(planId, {
                    fechaFin: new Date(Date.now() + nuevaDuracion),
                    estado: 'renovado',
                    terminos: nuevosTerminos
                });
                
                // Crear nuevo contrato
                await ContratoService.crearContratoRenovacion(planId, nuevosTerminos);
                
                // Notificar al cliente
                await NotificacionService.enviarRenovacion(planId);
            });
        } finally {
            await session.endSession();
        }
    }
    
    async cancelarPlan(planId, motivo) {
        // Implementación de cancelación con rollback
        return await this.ejecutarCancelacionConRollback(planId, motivo);
    }
}
```

### 📊 Seguimiento Físico

#### **Registro de Avances Semanales**
- **Métricas Corporales**: Peso, grasa corporal, masa muscular
- **Medidas Corporales**: Circunferencias, pliegues cutáneos
- **Documentación Visual**: Fotos de progreso (antes/después)
- **Comentarios Detallados**: Observaciones del entrenador y cliente

#### **Visualización de Progreso**
- **Historial Cronológico**: Evolución temporal de todas las métricas
- **Gráficos de Progreso**: Visualización de tendencias
- **Comparativas**: Comparación con objetivos y períodos anteriores
- **Reportes Automáticos**: Resúmenes semanales y mensuales

#### **Gestión de Registros con Rollback**
- **Eliminación Segura**: Verificación de impacto en consistencia
- **Rollback Automático**: Recuperación de datos relacionados
- **Validación de Dependencias**: Verificación antes de eliminar
- **Auditoría Completa**: Registro de todas las operaciones

**Implementación Técnica:**
```javascript
// Ejemplo: Seguimiento con rollback
class SeguimientoService {
    async eliminarRegistroSeguimiento(registroId) {
        const session = client.startSession();
        try {
            await session.withTransaction(async () => {
                // Verificar dependencias
                const dependencias = await this.verificarDependencias(registroId);
                if (dependencias.length > 0) {
                    throw new Error('No se puede eliminar: existen dependencias');
                }
                
                // Eliminar registro
                await SeguimientoRepository.delete(registroId);
                
                // Actualizar estadísticas del cliente
                await this.actualizarEstadisticasCliente(registroId);
                
                // Registrar en auditoría
                await AuditoriaService.registrarEliminacion(registroId);
            });
        } catch (error) {
            // Rollback automático en caso de error
            await this.ejecutarRollback(registroId);
            throw error;
        } finally {
            await session.endSession();
        }
    }
}
```

### 🥗 Nutrición

#### **Planes de Alimentación Personalizados**
- **Asociación Completa**: Vinculación con cliente y plan de entrenamiento
- **Objetivos Nutricionales**: Metas calóricas y macronutrientes
- **Restricciones Alimentarias**: Alergias, intolerancias, preferencias
- **Horarios de Comida**: Distribución de comidas según el plan

#### **Registro Diario de Alimentos**
- **Base de Datos Nutricional**: Catálogo completo de alimentos
- **Cálculo Automático**: Calorías y macronutrientes por porción
- **Registro por Comidas**: Desayuno, almuerzo, cena, snacks
- **Validación Nutricional**: Verificación de objetivos diarios

#### **Reportes Nutricionales**
- **Análisis Semanal**: Resumen de consumo calórico y nutricional
- **Comparación con Objetivos**: Desviaciones y recomendaciones
- **Tendencias Nutricionales**: Evolución del consumo alimentario
- **Alertas Nutricionales**: Notificaciones por desviaciones importantes

**Implementación Técnica:**
```javascript
// Ejemplo: Sistema nutricional
class NutricionService {
    async registrarAlimento(clienteId, alimentoId, cantidad, comida, fecha) {
        const session = client.startSession();
        try {
            await session.withTransaction(async () => {
                // Obtener información nutricional del alimento
                const alimento = await AlimentoRepository.findById(alimentoId);
                const calorias = alimento.caloriasPorGramo * cantidad;
                
                // Registrar consumo
                await ConsumoAlimentoRepository.create({
                    clienteId,
                    alimentoId,
                    cantidad,
                    calorias,
                    comida,
                    fecha: new Date(fecha)
                });
                
                // Actualizar totales diarios
                await this.actualizarTotalesDiarios(clienteId, fecha, calorias);
                
                // Verificar objetivos nutricionales
                await this.verificarObjetivosNutricionales(clienteId, fecha);
            });
        } finally {
            await session.endSession();
        }
    }
    
    async generarReporteNutricionalSemanal(clienteId, fechaInicio) {
        // Implementación de reporte nutricional semanal
        return await this.calcularReporteSemanal(clienteId, fechaInicio);
    }
}
```

### 📄 Contratos

#### **Generación Automática**
- **Creación Automática**: Contrato generado al asignar plan
- **Campos Obligatorios**: Condiciones, duración, precio, fechas
- **Plantillas Personalizables**: Diferentes tipos de contrato por plan
- **Validaciones Legales**: Verificación de términos y condiciones

#### **Gestión de Contratos**
- **Estados de Contrato**: Activo, suspendido, finalizado, cancelado
- **Renovación Automática**: Extensión con nuevos términos
- **Modificaciones**: Cambios con historial de versiones
- **Archivo**: Almacenamiento permanente de contratos finalizados

**Implementación Técnica:**
```javascript
// Ejemplo: Gestión de contratos
class ContratoService {
    async generarContrato(clienteId, planId, datosAdicionales) {
        const session = client.startSession();
        try {
            await session.withTransaction(async () => {
                // Obtener datos del cliente y plan
                const cliente = await ClienteRepository.findById(clienteId);
                const plan = await PlanRepository.findById(planId);
                
                // Crear contrato
                const contrato = await ContratoRepository.create({
                    clienteId,
                    planId,
                    numeroContrato: await this.generarNumeroContrato(),
                    fechaInicio: new Date(),
                    fechaFin: new Date(Date.now() + plan.duracion),
                    precio: plan.precio,
                    condiciones: plan.condiciones,
                    estado: 'activo',
                    ...datosAdicionales
                });
                
                // Notificar al cliente
                await NotificacionService.enviarContrato(cliente.email, contrato);
                
                return contrato;
            });
        } finally {
            await session.endSession();
        }
    }
}
```

### 💰 Gestión Financiera

#### **Registro de Ingresos**
- **Mensualidades**: Pagos recurrentes de planes
- **Sesiones Individuales**: Clases personalizadas
- **Servicios Adicionales**: Suplementos, equipamiento
- **Categorización**: Clasificación por tipo de ingreso

#### **Registro de Egresos**
- **Gastos Operativos**: Mantenimiento, servicios, personal
- **Inversiones**: Equipamiento, mejoras
- **Servicios Externos**: Contrataciones, consultorías
- **Gastos Variables**: Suministros, marketing

#### **Consultas Financieras**
- **Balance General**: Ingresos vs egresos por período
- **Análisis por Cliente**: Rentabilidad por cliente
- **Tendencias Financieras**: Evolución de ingresos y gastos
- **Proyecciones**: Estimaciones futuras basadas en datos históricos

#### **Transacciones Atómicas**
- **Consistencia Garantizada**: Operaciones ACID para pagos
- **Rollback Automático**: Recuperación en caso de fallos
- **Validaciones**: Verificación de fondos y disponibilidad
- **Auditoría Completa**: Registro de todas las transacciones

**Implementación Técnica:**
```javascript
// Ejemplo: Gestión financiera con transacciones
class FinanzasService {
    async procesarPago(clienteId, monto, concepto, metodoPago) {
        const session = client.startSession();
        try {
            await session.withTransaction(async () => {
                // Verificar disponibilidad de fondos
                const balance = await this.obtenerBalance();
                if (balance < monto) {
                    throw new Error('Fondos insuficientes');
                }
                
                // Registrar ingreso
                const ingreso = await IngresoRepository.create({
                    clienteId,
                    monto,
                    concepto,
                    metodoPago,
                    fecha: new Date(),
                    estado: 'procesado'
                });
                
                // Actualizar balance
                await this.actualizarBalance(monto);
                
                // Registrar en auditoría
                await AuditoriaService.registrarTransaccion(ingreso);
                
                return ingreso;
            });
        } finally {
            await session.endSession();
        }
    }
    
    async consultarBalanceFinanciero(fechaInicio, fechaFin, clienteId = null) {
        // Implementación de consulta de balance
        return await this.calcularBalance(fechaInicio, fechaFin, clienteId);
    }
}
```

### 🔄 Integración y Consistencia

#### **Transacciones Cross-Module**
- **Operaciones Complejas**: Múltiples módulos en una transacción
- **Rollback Coordinado**: Recuperación consistente entre módulos
- **Validaciones Cruzadas**: Verificación de integridad entre entidades
- **Sincronización**: Mantenimiento de consistencia de datos

#### **Auditoría y Trazabilidad**
- **Log Completo**: Registro de todas las operaciones
- **Trazabilidad**: Seguimiento de cambios en el tiempo
- **Responsabilidad**: Identificación de usuarios y operaciones
- **Recuperación**: Capacidad de restaurar estados anteriores

---

