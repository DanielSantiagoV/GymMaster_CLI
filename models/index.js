/**
 * Índice de modelos - Exporta todas las clases de modelos
 * Facilita la importación de modelos en otras partes de la aplicación
 */

const Cliente = require('./Cliente');
const PlanEntrenamiento = require('./PlanEntrenamiento');
const Seguimiento = require('./Seguimiento');
const Nutricion = require('./Nutricion');
const Contrato = require('./Contrato');
const Finanzas = require('./Finanzas');

module.exports = {
    Cliente,
    PlanEntrenamiento,
    Seguimiento,
    Nutricion,
    Contrato,
    Finanzas
};
