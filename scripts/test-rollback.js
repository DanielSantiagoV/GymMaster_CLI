#!/usr/bin/env node

/**
 * Script de Prueba - Rollback de Seguimientos
 * Verifica que el rollback funciona correctamente en todos los escenarios
 */

const { MongoClient, ObjectId } = require('mongodb');
const chalk = require('chalk');

class RollbackTester {
    constructor() {
        this.db = null;
        this.testData = {
            clientes: [],
            planes: [],
            contratos: [],
            seguimientos: []
        };
    }

    async conectar() {
        try {
            const client = new MongoClient('mongodb://localhost:27017');
            await client.connect();
            this.db = client.db('gymmaster');
            console.log(chalk.green('✅ Conectado a MongoDB'));
        } catch (error) {
            console.log(chalk.red('❌ Error al conectar a MongoDB:', error.message));
            process.exit(1);
        }
    }

    async limpiarDatosPrueba() {
        try {
            console.log(chalk.yellow('🧹 Limpiando datos de prueba...'));
            
            await this.db.collection('clientes').deleteMany({ email: { $regex: /test-rollback/ } });
            await this.db.collection('planes').deleteMany({ nombre: { $regex: /Test Rollback/ } });
            await this.db.collection('contratos').deleteMany({ condiciones: { $regex: /Test Rollback/ } });
            await this.db.collection('seguimientos').deleteMany({ comentarios: { $regex: /Test Rollback/ } });
            
            console.log(chalk.green('✅ Datos de prueba limpiados'));
        } catch (error) {
            console.log(chalk.red('❌ Error al limpiar datos:', error.message));
        }
    }

    async crearDatosPrueba() {
        try {
            console.log(chalk.yellow('📝 Creando datos de prueba...'));

            // 1. Crear cliente de prueba
            const cliente = {
                _id: new ObjectId(),
                nombre: 'Test',
                apellido: 'Rollback',
                email: 'test-rollback@example.com',
                telefono: '1234567890',
                nivel: 'principiante',
                activo: true,
                planes: [],
                fechaRegistro: new Date()
            };

            const clienteResult = await this.db.collection('clientes').insertOne(cliente);
            this.testData.clientes.push(clienteResult.insertedId);

            // 2. Crear plan de prueba
            const plan = {
                _id: new ObjectId(),
                nombre: 'Test Rollback Plan',
                descripcion: 'Plan para pruebas de rollback',
                nivel: 'principiante',
                duracion: 1,
                estado: 'activo',
                clientes: [clienteResult.insertedId],
                fechaCreacion: new Date()
            };

            const planResult = await this.db.collection('planes').insertOne(plan);
            this.testData.planes.push(planResult.insertedId);

            // 3. Crear contrato de prueba
            const contrato = {
                _id: new ObjectId(),
                clienteId: clienteResult.insertedId,
                planId: planResult.insertedId,
                condiciones: 'Test Rollback Contrato',
                duracionMeses: 1,
                precio: 100,
                fechaInicio: new Date(),
                fechaFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                estado: 'vigente'
            };

            const contratoResult = await this.db.collection('contratos').insertOne(contrato);
            this.testData.contratos.push(contratoResult.insertedId);

            // 4. Crear seguimientos de prueba
            for (let i = 1; i <= 3; i++) {
                const seguimiento = {
                    _id: new ObjectId(),
                    clienteId: clienteResult.insertedId,
                    contratoId: contratoResult.insertedId,
                    fecha: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000),
                    peso: 70 + i,
                    grasaCorporal: 15 + i,
                    medidas: {
                        cintura: 80 + i,
                        brazo: 30 + i,
                        pecho: 100 + i
                    },
                    comentarios: `Test Rollback Seguimiento ${i}`,
                    fotos: [],
                    fechaCreacion: new Date()
                };

                const seguimientoResult = await this.db.collection('seguimientos').insertOne(seguimiento);
                this.testData.seguimientos.push(seguimientoResult.insertedId);
            }

            console.log(chalk.green('✅ Datos de prueba creados:'));
            console.log(chalk.blue(`   - Cliente: ${clienteResult.insertedId}`));
            console.log(chalk.blue(`   - Plan: ${planResult.insertedId}`));
            console.log(chalk.blue(`   - Contrato: ${contratoResult.insertedId}`));
            console.log(chalk.blue(`   - Seguimientos: ${this.testData.seguimientos.length}`));

        } catch (error) {
            console.log(chalk.red('❌ Error al crear datos de prueba:', error.message));
        }
    }

    async verificarSeguimientosIniciales() {
        try {
            const count = await this.db.collection('seguimientos').countDocuments({
                comentarios: { $regex: /Test Rollback/ }
            });
            
            console.log(chalk.blue(`📊 Seguimientos iniciales: ${count}`));
            return count;
        } catch (error) {
            console.log(chalk.red('❌ Error al verificar seguimientos:', error.message));
            return 0;
        }
    }

    async probarRollbackContrato() {
        try {
            console.log(chalk.yellow('🔄 Probando rollback por cancelación de contrato...'));

            // Simular cancelación de contrato
            await this.db.collection('contratos').updateOne(
                { _id: this.testData.contratos[0] },
                { $set: { estado: 'cancelado', motivoCancelacion: 'Test Rollback' } }
            );

            // Simular rollback de seguimientos
            const seguimientoRepo = require('../repositories/SeguimientoRepository');
            const seguimientoRepository = new seguimientoRepo(this.db);
            
            const rollbackResult = await seguimientoRepository.deleteFollowUpsByContractWithRollback(
                this.testData.contratos[0],
                'Test Rollback - Cancelación de contrato'
            );

            console.log(chalk.green(`✅ Rollback de contrato completado: ${rollbackResult.eliminados} seguimientos eliminados`));
            return rollbackResult.eliminados;

        } catch (error) {
            console.log(chalk.red('❌ Error en rollback de contrato:', error.message));
            return 0;
        }
    }

    async probarRollbackCliente() {
        try {
            console.log(chalk.yellow('🔄 Probando rollback por eliminación de cliente...'));

            // Simular rollback de seguimientos del cliente
            const seguimientoRepo = require('../repositories/SeguimientoRepository');
            const seguimientoRepository = new seguimientoRepo(this.db);
            
            const rollbackResult = await seguimientoRepository.deleteFollowUpsByClientWithRollback(
                this.testData.clientes[0],
                'Test Rollback - Eliminación de cliente'
            );

            console.log(chalk.green(`✅ Rollback de cliente completado: ${rollbackResult.eliminados} seguimientos eliminados`));
            return rollbackResult.eliminados;

        } catch (error) {
            console.log(chalk.red('❌ Error en rollback de cliente:', error.message));
            return 0;
        }
    }

    async verificarSeguimientosFinales() {
        try {
            const count = await this.db.collection('seguimientos').countDocuments({
                comentarios: { $regex: /Test Rollback/ }
            });
            
            console.log(chalk.blue(`📊 Seguimientos finales: ${count}`));
            return count;
        } catch (error) {
            console.log(chalk.red('❌ Error al verificar seguimientos finales:', error.message));
            return -1;
        }
    }

    async generarReporte(iniciales, eliminadosContrato, eliminadosCliente, finales) {
        console.log(chalk.cyan('\n📋 REPORTE DE PRUEBAS - ROLLBACK DE SEGUIMIENTOS'));
        console.log(chalk.gray('================================================'));
        console.log(chalk.white(`Fecha: ${new Date().toLocaleString()}`));
        console.log(chalk.white(`Tester: Script Automatizado`));
        console.log('');
        
        console.log(chalk.blue('📊 RESULTADOS:'));
        console.log(chalk.white(`   Seguimientos iniciales: ${iniciales}`));
        console.log(chalk.white(`   Eliminados por contrato: ${eliminadosContrato}`));
        console.log(chalk.white(`   Eliminados por cliente: ${eliminadosCliente}`));
        console.log(chalk.white(`   Seguimientos finales: ${finales}`));
        console.log('');
        
        const exito = finales === 0 && (eliminadosContrato > 0 || eliminadosCliente > 0);
        
        if (exito) {
            console.log(chalk.green('✅ ESTADO: ROLLBACK FUNCIONANDO CORRECTAMENTE'));
            console.log(chalk.green('✅ Todos los seguimientos fueron eliminados'));
            console.log(chalk.green('✅ El rollback está funcionando como se esperaba'));
        } else {
            console.log(chalk.red('❌ ESTADO: ROLLBACK NO FUNCIONA CORRECTAMENTE'));
            console.log(chalk.red('❌ Algunos seguimientos no fueron eliminados'));
            console.log(chalk.red('❌ Revisar la implementación del rollback'));
        }
        
        return exito;
    }

    async ejecutarPruebas() {
        try {
            console.log(chalk.cyan('🧪 INICIANDO PRUEBAS DE ROLLBACK DE SEGUIMIENTOS'));
            console.log(chalk.gray('================================================\n'));

            // 1. Conectar a MongoDB
            await this.conectar();

            // 2. Limpiar datos de prueba anteriores
            await this.limpiarDatosPrueba();

            // 3. Crear datos de prueba
            await this.crearDatosPrueba();

            // 4. Verificar seguimientos iniciales
            const iniciales = await this.verificarSeguimientosIniciales();

            // 5. Probar rollback por contrato
            const eliminadosContrato = await this.probarRollbackContrato();

            // 6. Probar rollback por cliente
            const eliminadosCliente = await this.probarRollbackCliente();

            // 7. Verificar seguimientos finales
            const finales = await this.verificarSeguimientosFinales();

            // 8. Generar reporte
            const exito = await this.generarReporte(iniciales, eliminadosContrato, eliminadosCliente, finales);

            // 9. Limpiar datos de prueba
            await this.limpiarDatosPrueba();

            console.log(chalk.cyan('\n🎉 PRUEBAS COMPLETADAS'));
            
            if (exito) {
                console.log(chalk.green('✅ El rollback de seguimientos está funcionando correctamente'));
                process.exit(0);
            } else {
                console.log(chalk.red('❌ El rollback de seguimientos necesita revisión'));
                process.exit(1);
            }

        } catch (error) {
            console.log(chalk.red('❌ Error durante las pruebas:', error.message));
            process.exit(1);
        }
    }
}

// Ejecutar pruebas si se llama directamente
if (require.main === module) {
    const tester = new RollbackTester();
    tester.ejecutarPruebas();
}

module.exports = RollbackTester;
