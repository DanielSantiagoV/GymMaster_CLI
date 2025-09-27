# 🚀 Instalación Rápida de MongoDB

## Opción 1: Instalación Automática (Recomendada)

### 1. Descargar MongoDB Community Server
- Ve a: https://www.mongodb.com/try/download/community
- Selecciona: **Windows** y **MSI**
- Descarga e instala

### 2. Configurar MongoDB como Servicio
```bash
# Abrir CMD como Administrador
mongod --install --serviceName MongoDB --serviceDisplayName "MongoDB" --logpath "C:\data\log\mongod.log" --dbpath "C:\data\db"
```

### 3. Iniciar Servicio
```bash
net start MongoDB
```

## Opción 2: Instalación Manual

### 1. Crear directorios
```bash
mkdir C:\data\db
mkdir C:\data\log
```

### 2. Iniciar MongoDB
```bash
mongod --dbpath C:\data\db
```

## Opción 3: Usar MongoDB Atlas (En la nube)

### 1. Crear cuenta en MongoDB Atlas
- Ve a: https://www.mongodb.com/atlas
- Crea una cuenta gratuita

### 2. Crear cluster
- Selecciona plan gratuito
- Elige región más cercana
- Crea cluster

### 3. Obtener string de conexión
- Ve a "Connect" → "Connect your application"
- Copia el string de conexión

### 4. Configurar en tu aplicación
Crea un archivo `.env` con:
```
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/gymmaster
```

## Verificación

Después de instalar, ejecuta:
```bash
mongosh --eval "db.runCommand({ping: 1})"
```

Si funciona, ejecuta tu aplicación:
```bash
npm start
```

---

**💡 Recomendación:** Usa la Opción 1 (instalación local) para desarrollo.
