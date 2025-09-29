const ConfigCLI = require('./cli/ConfigCLI');
const DatabaseConfig = require('./config/database');

async function testConfigFunctions() {
    try {
        console.log('🧪 PROBANDO FUNCIONES ESPECÍFICAS DE CONFIGURACIÓN');
        console.log('================================================\n');
        
        // Conectar a la base de datos
        console.log('1️⃣ Conectando a base de datos...');
        const dbConfig = new DatabaseConfig();
        const connection = await dbConfig.connect();
        console.log('✅ Conexión a base de datos establecida');
        
        // Crear instancia de ConfigCLI
        console.log('\n2️⃣ Creando instancia de ConfigCLI...');
        const configCLI = new ConfigCLI(connection.db);
        console.log('✅ ConfigCLI instanciado');
        
        // Probar función de estado del sistema
        console.log('\n3️⃣ Probando verEstadoSistema()...');
        await configCLI.verEstadoSistema();
        
        // Probar función de estado de conexión
        console.log('\n4️⃣ Probando verEstadoConexion()...');
        await configCLI.verEstadoConexion();
        
        // Probar función de listar índices
        console.log('\n5️⃣ Probando listarIndices()...');
        await configCLI.listarIndices();
        
        // Probar función de ver variables de entorno
        console.log('\n6️⃣ Probando verVariablesEntorno()...');
        await configCLI.verVariablesEntorno();
        
        console.log('\n🎉 TODAS LAS FUNCIONES FUNCIONAN CORRECTAMENTE');
        
    } catch (error) {
        console.log('❌ Error:', error.message);
        console.log('Stack:', error.stack);
    }
}

testConfigFunctions();


