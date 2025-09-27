# Configuración de MongoDB para Transacciones

Este proyecto utiliza transacciones de MongoDB para garantizar la integridad de los datos. Para que las transacciones funcionen, MongoDB debe estar configurado como un **replica set**.

## 🚀 Configuración Rápida

### 1. Verificar el estado actual
```bash
npm run check-replica
```

### 2. Configurar replica set (si es necesario)
```bash
npm run setup-replica
```

### 3. Verificar que funciona
```bash
npm run check-replica
```

## 📋 Pasos Manuales (Alternativa)

Si los scripts automáticos no funcionan, puedes configurar manualmente:

### 1. Conectar a MongoDB
```bash
mongosh
```

### 2. Inicializar replica set
```javascript
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "localhost:27017" }
  ]
})
```

### 3. Verificar estado
```javascript
rs.status()
```

### 4. Salir de mongosh
```javascript
exit
```

## 🔧 Configuración de la Aplicación

La aplicación ya está configurada para usar el replica set. La URI de conexión incluye el parámetro `replicaSet=rs0`:

```javascript
mongodb://localhost:27017/?replicaSet=rs0
```

## ✅ Verificación

Para verificar que todo funciona correctamente:

1. **Ejecutar verificación:**
   ```bash
   npm run check-replica
   ```

2. **Deberías ver:**
   ```
   ✅ Las transacciones están disponibles
   📊 Información del replica set:
      Nombre: rs0
      Estado: Primario
      Miembros: 1
   ```

## 🚨 Solución de Problemas

### Error: "Transaction numbers are only allowed on a replica set"
- **Causa:** MongoDB no está configurado como replica set
- **Solución:** Ejecutar `npm run setup-replica`

### Error: "replSetInitiate failed"
- **Causa:** El replica set ya está inicializado
- **Solución:** Verificar con `npm run check-replica`

### Error: "not master"
- **Causa:** El nodo no es el primario
- **Solución:** Esperar a que el replica set esté listo (puede tomar unos segundos)

## 📚 Información Adicional

- **Replica Set:** Un conjunto de instancias de MongoDB que mantienen el mismo conjunto de datos
- **Transacciones:** Operaciones atómicas que garantizan consistencia de datos
- **Primario:** El nodo que acepta operaciones de escritura
- **Secundario:** Nodos que replican datos del primario

## 🎯 Beneficios de las Transacciones

1. **Consistencia:** Los datos se mantienen consistentes
2. **Rollback:** Si algo falla, se revierten todos los cambios
3. **Integridad:** Garantiza que las operaciones complejas se completen o fallen completamente
4. **Confiabilidad:** Reduce la posibilidad de datos corruptos

---

**Nota:** Una vez configurado el replica set, todas las operaciones críticas del sistema (crear, actualizar, eliminar seguimientos) utilizarán transacciones automáticamente.
