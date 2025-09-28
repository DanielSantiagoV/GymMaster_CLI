# 🔧 CONFIGURAR MONGODB COMO REPLICA SET

## 📋 **PASOS MANUALES**

### **1️⃣ Detener MongoDB**
```bash
# En Windows (como administrador)
net stop MongoDB

# O si usas servicios
sc stop MongoDB
```

### **2️⃣ Iniciar MongoDB con Replica Set**
```bash
# Opción A: Comando directo
mongod --replSet rs0 --dbpath "C:\data\db"

# Opción B: Con archivo de configuración
mongod --config "C:\Program Files\MongoDB\Server\8.0\bin\mongod.cfg" --replSet rs0
```

### **3️⃣ En otra terminal, inicializar el Replica Set**
```bash
mongosh
```

Dentro de mongosh:
```javascript
rs.initiate({
    _id: 'rs0',
    members: [
        { _id: 0, host: 'localhost:27017' }
    ]
})
```

### **4️⃣ Verificar estado**
```javascript
rs.status()
```

### **5️⃣ Actualizar URI de conexión**
Cambiar en `.env`:
```
MONGODB_URI=mongodb://localhost:27017/?replicaSet=rs0
```

## 🚀 **MÉTODO AUTOMÁTICO (Script)**

### **Opción A: Usar el script .bat**
```bash
scripts\configurar-replica-set.bat
```

### **Opción B: Usar el script Node.js**
```bash
node scripts\setup-replica-set.js
```

## ✅ **VERIFICAR QUE FUNCIONA**

Después de configurar, ejecutar:
```bash
node -e "
const { MongoClient } = require('mongodb');
async function test() {
    const client = new MongoClient('mongodb://localhost:27017/?replicaSet=rs0');
    await client.connect();
    const session = client.startSession();
    await session.withTransaction(async () => {
        console.log('✅ Transacciones funcionando!');
    });
    await session.endSession();
    await client.close();
}
test().catch(console.error);
"
```

## ⚠️ **NOTAS IMPORTANTES**

1. **Reinicio requerido**: MongoDB debe reiniciarse con `--replSet`
2. **URI actualizada**: Usar `?replicaSet=rs0` en la conexión
3. **Persistencia**: La configuración se mantiene entre reinicios
4. **Opcional**: Solo necesario para transacciones, no afecta funcionalidad básica
