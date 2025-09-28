# 📤 Carpeta de Exportaciones - GymMaster CLI

## 📁 Ubicación
Esta carpeta contiene todos los archivos CSV exportados desde el sistema GymMaster CLI.

## 📊 Tipos de Archivos

### 👥 **clientes_YYYY-MM-DD_HH-mm-ss.csv**
- **Contenido**: Lista de clientes con información básica
- **Campos**: clienteId, nombre, email, activo, fechaRegistro, cantidadPlanes
- **Uso**: Análisis de base de clientes, reportes de marketing

### 🏋️ **planes_YYYY-MM-DD_HH-mm-ss.csv**
- **Contenido**: Planes de entrenamiento con estadísticas
- **Campos**: planId, nombre, nivel, estado, fechaCreacion, clientesAsociados, contratosTotal, duracionPromedio
- **Uso**: Análisis de popularidad de planes, optimización de ofertas

### 📊 **seguimiento_YYYY-MM-DD_HH-mm-ss.csv**
- **Contenido**: Evolución física de clientes
- **Campos**: cliente, totalRegistros, primerRegistro, ultimoRegistro, evolucionPeso, evolucionGrasa
- **Uso**: Análisis de progreso, identificación de tendencias

### 🍎 **nutricion_YYYY-MM-DD_HH-mm-ss.csv**
- **Contenido**: Planes nutricionales por cliente
- **Campos**: nutricionId, cliente, tipoPlan, estado, fechaCreacion, fechaActualizacion
- **Uso**: Seguimiento de planes nutricionales, análisis de cumplimiento

### 📄 **contratos_YYYY-MM-DD_HH-mm-ss.csv**
- **Contenido**: Contratos con información detallada
- **Campos**: contratoId, cliente, plan, estado, fechaInicio, fechaFin, duracionDias, diasRestantes
- **Uso**: Análisis de contratos, seguimiento de vencimientos

### 💰 **financiero_YYYY-MM-DD_HH-mm-ss.csv**
- **Contenido**: Movimientos financieros del gimnasio
- **Campos**: finanzasId, tipo, descripcion, monto, fecha, categoria, clienteId
- **Uso**: Análisis financiero, contabilidad, reportes fiscales

## 🔧 Cómo Usar los Archivos

### **📊 En Excel/Google Sheets:**
1. Abrir el archivo CSV
2. Los datos se importarán automáticamente en columnas
3. Usar filtros y gráficos para análisis

### **📈 En Power BI/Tableau:**
1. Conectar como fuente de datos CSV
2. Crear visualizaciones y dashboards
3. Automatizar actualizaciones periódicas

### **🐍 En Python/R:**
```python
import pandas as pd
df = pd.read_csv('clientes_2024-01-15_10-30-45.csv')
print(df.head())
```

## 📅 Convención de Nombres

### **Formato**: `tipo_YYYY-MM-DD_HH-mm-ss.csv`
- **tipo**: Tipo de datos (clientes, planes, seguimiento, etc.)
- **YYYY-MM-DD**: Fecha de exportación
- **HH-mm-ss**: Hora de exportación

### **Ejemplos**:
- `clientes_2024-01-15_10-30-45.csv`
- `planes_2024-01-15_14-22-18.csv`
- `financiero_2024-01-15_16-45-30.csv`

## 🗂️ Organización Recomendada

### **Por Fecha:**
```
exports/
├── 2024-01-15/
│   ├── clientes_2024-01-15_10-30-45.csv
│   ├── planes_2024-01-15_14-22-18.csv
│   └── financiero_2024-01-15_16-45-30.csv
├── 2024-01-16/
│   └── ...
```

### **Por Tipo:**
```
exports/
├── clientes/
│   ├── clientes_2024-01-15_10-30-45.csv
│   └── clientes_2024-01-16_09-15-22.csv
├── planes/
│   └── ...
```

## 🔄 Automatización

### **Script de Backup Diario:**
```bash
# Copiar exportaciones a carpeta de backup
cp -r exports/ backup/$(date +%Y-%m-%d)/
```

### **Script de Limpieza:**
```bash
# Eliminar archivos más antiguos de 30 días
find exports/ -name "*.csv" -mtime +30 -delete
```

## 📋 Mejores Prácticas

### **✅ Recomendado:**
- Exportar datos regularmente (semanal/mensual)
- Mantener copias de seguridad
- Documentar el propósito de cada exportación
- Usar filtros de fecha para datos específicos

### **❌ Evitar:**
- Exportar datos innecesarios
- Mantener archivos CSV por mucho tiempo
- Exportar datos sensibles sin cifrado
- Modificar archivos CSV manualmente

## 🛡️ Seguridad

### **Datos Sensibles:**
- Los archivos CSV contienen información de clientes
- Mantener acceso restringido a la carpeta
- Considerar cifrado para datos sensibles
- Cumplir con regulaciones de privacidad (GDPR, etc.)

### **Backup:**
- Hacer copias de seguridad regulares
- Almacenar en ubicaciones seguras
- Verificar integridad de archivos

## 📞 Soporte

Si tienes problemas con las exportaciones:
1. Verificar permisos de escritura en la carpeta
2. Comprobar espacio en disco disponible
3. Revisar logs del sistema
4. Contactar al administrador del sistema

---

**📝 Nota**: Esta carpeta se crea automáticamente la primera vez que exportas datos desde el sistema GymMaster CLI.
