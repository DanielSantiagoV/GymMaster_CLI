#!/usr/bin/env node

/**
 * SCRIPT DE LIMPIEZA PARA DEMO DE SUSTENTACIÓN
 * 
 * Este script limpia los datos de prueba creados para la demostración
 * de principios SOLID y patrones de diseño en GymMaster CLI.
 * 
 * USO: node clean-demo.js
 */

const chalk = require('chalk');
const inquirer = require('inquirer');
const { ConnectionManager } = require('../config/connection');

class CleanDemo {
    constructor() {
        this.db = null;
    }

    /**
     * Inicia la limpieza de la demo
     */
    async iniciar() {
        try {
            console.log(chalk.blue.bold('\n🧹 LIMPIEZA DE DEMO - GYMMASTER CLI'));
            console.log(chalk.gray('=====================================\n'));
            
            // Conectar a la base de datos
            await this.conectarBaseDatos();
            
            // Confirmar limpieza
            const confirmar = await this.confirmarLimpieza();
            
            if (confirmar) {
                // Limpiar datos de prueba
                await this.limpiarDatosPrueba();
                
                console.log(chalk.green.bold('\n✅ LIMPIEZA COMPLETA'));
                console.log(chalk.gray('==================\n'));
                
                console.log(chalk.cyan('📋 Datos eliminados:'));
                console.log(chalk.gray('   ✅ Clientes de prueba'));
                console.log(chalk.gray('   ✅ Planes de entrenamiento'));
                console.log(chalk.gray('   ✅ Contratos de prueba'));
                console.log(chalk.gray('   ✅ Seguimientos de prueba'));
                console.log(chalk.gray('   ✅ Planes nutricionales de prueba\n'));
                
            } else {
                console.log(chalk.yellow('⚠️  Limpieza cancelada\n'));
            }
            
        } catch (error) {
            console.error(chalk.red('❌ Error en la limpieza:'), error.message);
        }
    }

    /**
     * Conecta a la base de datos
     */
    async conectarBaseDatos() {
        console.log(chalk.yellow('🔌 Conectando a MongoDB...'));
        
        try {
            const connection = await ConnectionManager.initialize();
            this.db = connection.db;
            console.log(chalk.green('✅ Conexión exitosa a MongoDB\n'));
        } catch (error) {
            console.log(chalk.red('❌ Error de conexión:'), error.message);
            console.log(chalk.yellow('💡 Asegúrate de que MongoDB esté ejecutándose\n'));
            throw error;
        }
    }

    /**
     * Confirma la limpieza
     */
    async confirmarLimpieza() {
        const confirmar = await inquirer.prompt([{
            type: 'confirm',
            name: 'limpiar',
            message: '¿Estás seguro de que deseas eliminar todos los datos de prueba?',
            default: false
        }]);

        return confirmar.limpiar;
    }

    /**
     * Limpia los datos de prueba
     */
    async limpiarDatosPrueba() {
        console.log(chalk.yellow('🧹 Limpiando datos de prueba...\n'));
        
        try {
            // Limpiar planes nutricionales
            await this.limpiarPlanesNutricionales();
            
            // Limpiar seguimientos
            await this.limpiarSeguimientos();
            
            // Limpiar contratos
            await this.limpiarContratos();
            
            // Limpiar planes de entrenamiento
            await this.limpiarPlanesEntrenamiento();
            
            // Limpiar clientes
            await this.limpiarClientes();
            
        } catch (error) {
            console.log(chalk.red('❌ Error al limpiar datos:'), error.message);
            throw error;
        }
    }

    /**
     * Limpia planes nutricionales
     */
    async limpiarPlanesNutricionales() {
        console.log(chalk.cyan('🍎 Limpiando planes nutricionales...'));
        
        try {
            const result = await this.db.collection('nutricion').deleteMany({
                email: { $regex: /@demo\.com$/ }
            });
            
            console.log(chalk.gray(`   ✅ ${result.deletedCount} planes nutricionales eliminados`));
        } catch (error) {
            console.log(chalk.yellow('   ⚠️  Error al limpiar planes nutricionales:'), error.message);
        }
    }

    /**
     * Limpia seguimientos
     */
    async limpiarSeguimientos() {
        console.log(chalk.cyan('📊 Limpiando seguimientos...'));
        
        try {
            // Obtener IDs de clientes de demo
            const clientesDemo = await this.db.collection('clientes').find({
                email: { $regex: /@demo\.com$/ }
            }).toArray();
            
            if (clientesDemo.length > 0) {
                const clienteIds = clientesDemo.map(c => c._id);
                const result = await this.db.collection('seguimientos').deleteMany({
                    clienteId: { $in: clienteIds }
                });
                
                console.log(chalk.gray(`   ✅ ${result.deletedCount} seguimientos eliminados`));
            } else {
                console.log(chalk.gray('   ✅ No hay seguimientos de demo para eliminar'));
            }
        } catch (error) {
            console.log(chalk.yellow('   ⚠️  Error al limpiar seguimientos:'), error.message);
        }
    }

    /**
     * Limpia contratos
     */
    async limpiarContratos() {
        console.log(chalk.cyan('📄 Limpiando contratos...'));
        
        try {
            // Obtener IDs de clientes de demo
            const clientesDemo = await this.db.collection('clientes').find({
                email: { $regex: /@demo\.com$/ }
            }).toArray();
            
            if (clientesDemo.length > 0) {
                const clienteIds = clientesDemo.map(c => c._id);
                const result = await this.db.collection('contratos').deleteMany({
                    clienteId: { $in: clienteIds }
                });
                
                console.log(chalk.gray(`   ✅ ${result.deletedCount} contratos eliminados`));
            } else {
                console.log(chalk.gray('   ✅ No hay contratos de demo para eliminar'));
            }
        } catch (error) {
            console.log(chalk.yellow('   ⚠️  Error al limpiar contratos:'), error.message);
        }
    }

    /**
     * Limpia planes de entrenamiento
     */
    async limpiarPlanesEntrenamiento() {
        console.log(chalk.cyan('📋 Limpiando planes de entrenamiento...'));
        
        try {
            const result = await this.db.collection('planes').deleteMany({
                nombre: { $in: ['Plan Principiante', 'Plan Intermedio', 'Plan Avanzado'] }
            });
            
            console.log(chalk.gray(`   ✅ ${result.deletedCount} planes de entrenamiento eliminados`));
        } catch (error) {
            console.log(chalk.yellow('   ⚠️  Error al limpiar planes de entrenamiento:'), error.message);
        }
    }

    /**
     * Limpia clientes
     */
    async limpiarClientes() {
        console.log(chalk.cyan('👥 Limpiando clientes...'));
        
        try {
            const result = await this.db.collection('clientes').deleteMany({
                email: { $regex: /@demo\.com$/ }
            });
            
            console.log(chalk.gray(`   ✅ ${result.deletedCount} clientes eliminados`));
        } catch (error) {
            console.log(chalk.yellow('   ⚠️  Error al limpiar clientes:'), error.message);
        }
    }
}

// Ejecutar la limpieza si se llama directamente
if (require.main === module) {
    const clean = new CleanDemo();
    clean.iniciar().catch(error => {
        console.error(chalk.red('❌ Error fatal:'), error.message);
        process.exit(1);
    });
}

module.exports = CleanDemo;
