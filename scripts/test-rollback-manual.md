# 🧪 PRUEBA MANUAL - ROLLBACK DE SEGUIMIENTOS

## 🎯 **OBJETIVO**
Verificar manualmente que el rollback de seguimientos funciona correctamente.

## 📋 **PASOS PARA PROBAR**

### **PASO 1: Preparar Datos de Prueba**

1. **Ejecutar la aplicación:**
   ```bash
   npm start
   ```

2. **Crear un cliente de prueba:**
   - Seleccionar: `👥 Clientes` → `➕ Crear Nuevo Cliente`
   - Nombre: `Test Rollback`
   - Apellido: `Usuario`
   - Email: `test-rollback@example.com`
   - Teléfono: `1234567890`
   - Nivel: `Principiante`

3. **Crear un plan de prueba:**
   - Seleccionar: `🏋️ Planes` → `➕ Crear Nuevo Plan`
   - Nombre: `Test Rollback Plan`
   - Descripción: `Plan para pruebas de rollback`
   - Nivel: `Principiante`
   - Duración: `1 mes`

4. **Asociar plan al cliente:**
   - Seleccionar: `👥 Clientes` → `🔗 Gestionar Planes del Cliente`
   - Buscar cliente: `Test Rollback`
   - Seleccionar: `➕ Asociar Nuevo Plan`
   - Seleccionar: `Test Rollback Plan`
   - Precio: `100`
   - Duración: `1 mes`

### **PASO 2: Crear Seguimientos de Prueba**

5. **Crear seguimientos físicos:**
   - Seleccionar: `📈 Seguimiento` → `➕ Crear Seguimiento`
   - Buscar cliente: `Test Rollback`
   - **Seguimiento 1:**
     - Fecha: `Hoy`
     - Peso: `70 kg`
     - Grasa corporal: `15%`
     - Cintura: `80 cm`
     - Brazo: `30 cm`
     - Pecho: `100 cm`
     - Comentarios: `Test Rollback Seguimiento 1`
   
   - **Seguimiento 2:**
     - Fecha: `Hace 1 semana`
     - Peso: `71 kg`
     - Grasa corporal: `16%`
     - Cintura: `81 cm`
     - Brazo: `31 cm`
     - Pecho: `101 cm`
     - Comentarios: `Test Rollback Seguimiento 2`

6. **Verificar que los seguimientos se crearon:**
   - Seleccionar: `📈 Seguimiento` → `📋 Listar Seguimientos`
   - Deberías ver 2 seguimientos del cliente `Test Rollback`

### **PASO 3: Probar Rollback por Cancelación de Contrato**

7. **Cancelar el contrato:**
   - Seleccionar: `📋 Contratos` → `❌ Cancelar Contrato`
   - Buscar contrato del cliente `Test Rollback`
   - Motivo: `Test Rollback - Cancelación de contrato`
   - Confirmar cancelación

8. **Verificar rollback:**
   - Seleccionar: `📈 Seguimiento` → `📋 Listar Seguimientos`
   - **RESULTADO ESPERADO**: No debería haber seguimientos del cliente `Test Rollback`
   - **VERIFICAR EN CONSOLA**: Deberías ver mensajes como:
     ```
     ✅ Rollback completado: 2 seguimientos eliminados
     🗑️ Eliminados 2 seguimientos del contrato - Motivo: Test Rollback
     ```

### **PASO 4: Probar Rollback por Desasociación de Plan**

9. **Recrear datos de prueba:**
   - Repetir pasos 1-6 para crear nuevos datos

10. **Desasociar plan del cliente:**
    - Seleccionar: `👥 Clientes` → `🔗 Gestionar Planes del Cliente`
    - Buscar cliente: `Test Rollback`
    - Seleccionar: `❌ Desasociar Plan`
    - Seleccionar: `Test Rollback Plan`
    - Confirmar desasociación

11. **Verificar rollback:**
    - Seleccionar: `📈 Seguimiento` → `📋 Listar Seguimientos`
    - **RESULTADO ESPERADO**: No debería haber seguimientos del cliente `Test Rollback`

### **PASO 5: Probar Rollback por Eliminación de Cliente**

12. **Recrear datos de prueba:**
    - Repetir pasos 1-6 para crear nuevos datos

13. **Eliminar cliente:**
    - Seleccionar: `👥 Clientes` → `🗑️ Eliminar Cliente`
    - Buscar cliente: `Test Rollback`
    - Seleccionar: `Forzar eliminación`
    - Confirmar eliminación

14. **Verificar rollback:**
    - Seleccionar: `📈 Seguimiento` → `📋 Listar Seguimientos`
    - **RESULTADO ESPERADO**: No debería haber seguimientos del cliente `Test Rollback`

### **PASO 6: Probar Rollback por Cancelación de Plan**

15. **Recrear datos de prueba:**
    - Repetir pasos 1-6 para crear nuevos datos

16. **Cancelar plan:**
    - Seleccionar: `🏋️ Planes` → `❌ Eliminar Plan`
    - Buscar plan: `Test Rollback Plan`
    - Confirmar eliminación

17. **Verificar rollback:**
    - Seleccionar: `📈 Seguimiento` → `📋 Listar Seguimientos`
    - **RESULTADO ESPERADO**: No debería haber seguimientos del cliente `Test Rollback`

## 🔍 **VERIFICACIONES ADICIONALES**

### **Verificar en MongoDB Compass:**
```javascript
// Verificar que no hay seguimientos huérfanos
db.seguimientos.find({comentarios: /Test Rollback/}).count()

// Verificar contratos cancelados
db.contratos.find({motivoCancelacion: /Test Rollback/})

// Verificar planes inactivos
db.planes.find({nombre: /Test Rollback Plan/})
```

### **Verificar Logs de Consola:**
Buscar mensajes como:
```
✅ Rollback completado: X seguimientos eliminados
🗑️ Eliminados X seguimientos del cliente - Motivo: Test Rollback
⚠️ Error en rollback de seguimientos: [mensaje de error]
```

## 📊 **CRITERIOS DE ÉXITO**

### **✅ Funcionalidad Correcta:**
- [ ] Seguimientos se eliminan automáticamente al cancelar contrato
- [ ] Seguimientos se eliminan automáticamente al desasociar plan
- [ ] Seguimientos se eliminan automáticamente al eliminar cliente
- [ ] Seguimientos se eliminan automáticamente al cancelar plan
- [ ] No hay datos huérfanos en la base de datos

### **✅ Logs Informativos:**
- [ ] Se muestran mensajes de rollback exitoso
- [ ] Se registra el número de seguimientos eliminados
- [ ] Se registra el motivo de la eliminación
- [ ] Se manejan errores de forma apropiada

### **✅ Consistencia de Datos:**
- [ ] Contratos cancelados tienen estado correcto
- [ ] Planes inactivos no tienen clientes asociados
- [ ] Clientes eliminados no tienen seguimientos
- [ ] No hay referencias rotas en la base de datos

## 🚨 **PROBLEMAS COMUNES Y SOLUCIONES**

### **Problema: Seguimientos no se eliminan**
**Solución:**
- Verificar que MongoDB está ejecutándose
- Verificar que las transacciones están habilitadas
- Revisar logs de error en la consola

### **Problema: Error en transacciones**
**Solución:**
- Verificar que MongoDB está configurado como replica set
- Usar el sistema híbrido de transacciones implementado
- Revisar la configuración de la base de datos

### **Problema: Datos no se limpian**
**Solución:**
- Verificar que los métodos de rollback se están ejecutando
- Revisar que los IDs de cliente/contrato son correctos
- Verificar que las consultas de eliminación son correctas

## 📝 **REPORTE DE PRUEBAS**

### **Plantilla de Reporte:**
```
🧪 REPORTE DE PRUEBAS MANUALES - ROLLBACK DE SEGUIMIENTOS
========================================================

Fecha: [FECHA]
Tester: [NOMBRE]
Versión: [VERSIÓN]

ESCENARIOS PROBADOS:
✅ Cancelación de Contrato: [PASÓ/FALLÓ]
✅ Desasociación de Plan: [PASÓ/FALLÓ]
✅ Eliminación de Cliente: [PASÓ/FALLÓ]
✅ Cancelación de Plan: [PASÓ/FALLÓ]

RESULTADOS:
- Seguimientos eliminados: [NÚMERO]
- Tiempo de ejecución: [TIEMPO]
- Errores encontrados: [NÚMERO]
- Logs generados: [SÍ/NO]

OBSERVACIONES:
[DESCRIBIR CUALQUIER PROBLEMA O COMPORTAMIENTO INESPERADO]

ESTADO FINAL:
✅ ROLLBACK FUNCIONANDO CORRECTAMENTE
❌ ROLLBACK NECESITA REVISIÓN
```

## 🎉 **CONCLUSIÓN**

Si todos los pasos se ejecutan correctamente y los seguimientos se eliminan automáticamente en cada escenario, entonces el rollback de seguimientos está funcionando correctamente.

**¡El sistema está listo para producción con rollback completo implementado!** 🚀
