# 🧪 PLAN DE PRUEBAS - ROLLBACK DE SEGUIMIENTOS

## 📋 **OBJETIVO**
Verificar que el rollback de seguimientos funciona correctamente en todos los escenarios implementados.

## 🎯 **ESCENARIOS DE PRUEBA**

### **ESCENARIO 1: Cancelación de Contrato**
**Objetivo**: Verificar que al cancelar un contrato se eliminen automáticamente los seguimientos.

#### **Pasos:**
1. **Crear cliente** con plan y contrato
2. **Registrar seguimientos** físicos (peso, medidas, etc.)
3. **Cancelar contrato** desde el menú de contratos
4. **Verificar** que los seguimientos se eliminaron

#### **Comandos de prueba:**
```bash
npm start
# 1. 👥 Clientes → ➕ Crear Nuevo Cliente
# 2. 🏋️ Planes → ➕ Crear Nuevo Plan
# 3. 📋 Contratos → ➕ Crear Contrato (asignar cliente a plan)
# 4. 📈 Seguimiento → ➕ Crear Seguimiento (registrar datos físicos)
# 5. 📋 Contratos → ❌ Cancelar Contrato
# 6. 📈 Seguimiento → 📋 Listar Seguimientos (verificar que no hay seguimientos)
```

---

### **ESCENARIO 2: Cancelación de Plan**
**Objetivo**: Verificar que al cancelar un plan se eliminen los seguimientos de todos los clientes.

#### **Pasos:**
1. **Crear plan** con múltiples clientes
2. **Registrar seguimientos** para cada cliente
3. **Cancelar plan** desde el menú de planes
4. **Verificar** que todos los seguimientos se eliminaron

#### **Comandos de prueba:**
```bash
npm start
# 1. 🏋️ Planes → ➕ Crear Nuevo Plan
# 2. 👥 Clientes → 🔗 Gestionar Planes del Cliente (asociar múltiples clientes)
# 3. 📈 Seguimiento → ➕ Crear Seguimiento (para cada cliente)
# 4. 🏋️ Planes → ❌ Eliminar Plan
# 5. 📈 Seguimiento → 📋 Listar Seguimientos (verificar que no hay seguimientos)
```

---

### **ESCENARIO 3: Desasociación de Plan**
**Objetivo**: Verificar que al desasociar un plan de un cliente se eliminen sus seguimientos.

#### **Pasos:**
1. **Asociar plan** a cliente
2. **Registrar seguimientos** del cliente
3. **Desasociar plan** del cliente
4. **Verificar** que los seguimientos se eliminaron

#### **Comandos de prueba:**
```bash
npm start
# 1. 👥 Clientes → 🔗 Gestionar Planes del Cliente
# 2. 📈 Seguimiento → ➕ Crear Seguimiento
# 3. 👥 Clientes → 🔗 Gestionar Planes del Cliente → ❌ Desasociar Plan
# 4. 📈 Seguimiento → 📋 Listar Seguimientos (verificar que no hay seguimientos)
```

---

### **ESCENARIO 4: Eliminación de Cliente**
**Objetivo**: Verificar que al eliminar un cliente se eliminen todos sus seguimientos.

#### **Pasos:**
1. **Crear cliente** con plan y seguimientos
2. **Eliminar cliente** (forzando eliminación)
3. **Verificar** que todos los seguimientos se eliminaron

#### **Comandos de prueba:**
```bash
npm start
# 1. 👥 Clientes → ➕ Crear Nuevo Cliente
# 2. 📈 Seguimiento → ➕ Crear Seguimiento (múltiples seguimientos)
# 3. 👥 Clientes → 🗑️ Eliminar Cliente (forzar eliminación)
# 4. 📈 Seguimiento → 📋 Listar Seguimientos (verificar que no hay seguimientos)
```

---

## 🔍 **VERIFICACIONES ESPECÍFICAS**

### **1. Verificar en MongoDB Compass**
```javascript
// Verificar que no hay seguimientos después del rollback
db.seguimientos.find({}).count()

// Verificar contratos cancelados
db.contratos.find({estado: "cancelado"})

// Verificar planes inactivos
db.planes.find({estado: "inactivo"})
```

### **2. Verificar Logs de Rollback**
Buscar en la consola mensajes como:
```
✅ Rollback completado: X seguimientos eliminados
🗑️ Eliminados X seguimientos del cliente - Motivo: Cancelación de plan
```

### **3. Verificar Integridad de Datos**
- ✅ **No hay seguimientos huérfanos** (sin cliente o contrato)
- ✅ **Contratos cancelados** tienen estado correcto
- ✅ **Planes inactivos** no tienen clientes asociados
- ✅ **Clientes eliminados** no tienen seguimientos

---

## 🚨 **CASOS DE ERROR A PROBAR**

### **1. Error en Transacción**
- Simular fallo de MongoDB
- Verificar que se hace rollback completo
- Verificar que no quedan datos inconsistentes

### **2. Error en Rollback de Seguimientos**
- Verificar que el sistema continúa funcionando
- Verificar que se registra el error
- Verificar que la operación principal se completa

### **3. Múltiples Operaciones Simultáneas**
- Probar cancelaciones concurrentes
- Verificar que las transacciones no se interfieren
- Verificar consistencia de datos

---

## 📊 **MÉTRICAS DE ÉXITO**

### **✅ Funcionalidad Correcta**
- [ ] Seguimientos se eliminan automáticamente
- [ ] No hay datos huérfanos en la base de datos
- [ ] Logs muestran rollback exitoso
- [ ] Sistema continúa funcionando después del rollback

### **✅ Rendimiento**
- [ ] Operaciones de rollback completan en tiempo razonable
- [ ] No hay bloqueos de base de datos
- [ ] Transacciones se ejecutan eficientemente

### **✅ Robustez**
- [ ] Manejo correcto de errores
- [ ] Logs informativos en caso de fallo
- [ ] Sistema se recupera de errores
- [ ] Datos permanecen consistentes

---

## 🎯 **SCRIPT DE PRUEBA AUTOMATIZADA**

```bash
# Crear script de prueba
echo "🧪 Iniciando pruebas de rollback..."

# 1. Crear datos de prueba
echo "📝 Creando datos de prueba..."
# (Ejecutar comandos de creación)

# 2. Verificar estado inicial
echo "🔍 Verificando estado inicial..."
# (Verificar que hay seguimientos)

# 3. Ejecutar rollback
echo "🔄 Ejecutando rollback..."
# (Cancelar contrato/plan)

# 4. Verificar resultado
echo "✅ Verificando resultado..."
# (Verificar que no hay seguimientos)

echo "🎉 Pruebas completadas!"
```

---

## 📝 **REPORTE DE PRUEBAS**

### **Plantilla de Reporte:**
```
🧪 REPORTE DE PRUEBAS - ROLLBACK DE SEGUIMIENTOS
================================================

Fecha: [FECHA]
Tester: [NOMBRE]

ESCENARIOS PROBADOS:
✅ Escenario 1: Cancelación de Contrato
✅ Escenario 2: Cancelación de Plan  
✅ Escenario 3: Desasociación de Plan
✅ Escenario 4: Eliminación de Cliente

RESULTADOS:
- Seguimientos eliminados: [NÚMERO]
- Tiempo de ejecución: [TIEMPO]
- Errores encontrados: [NÚMERO]
- Logs generados: [SÍ/NO]

ESTADO FINAL:
✅ ROLLBACK FUNCIONANDO CORRECTAMENTE
```

---

## 🚀 **PRÓXIMOS PASOS**

1. **Ejecutar pruebas** según el plan
2. **Documentar resultados** en el reporte
3. **Reportar bugs** si se encuentran
4. **Optimizar rendimiento** si es necesario
5. **Actualizar documentación** con hallazgos

**¡Listo para probar el rollback de seguimientos!** 🎉
