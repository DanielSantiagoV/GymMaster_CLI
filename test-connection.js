const DatabaseConfig = require('./config/database');

async function testConnection() {
    console.log('🔍 Probando conexión...');
    
    try {
        const dbConfig = new DatabaseConfig();
        console.log('📡 Intentando conectar...');
        
        const connection = await dbConfig.connect();
        console.log('✅ Conexión exitosa!');
        
        // Probar una operación simple
        const db = connection.db;
        const collection = db.collection('test');
        
        console.log('🧪 Probando operación...');
        await collection.insertOne({ test: 'data' });
        console.log('✅ Operación exitosa!');
        
        await dbConfig.disconnect();
        console.log('🎉 Todo funciona correctamente!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
    }
}

testConnection();
