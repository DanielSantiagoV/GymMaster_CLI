/**
 * Servicio de Plantillas Nutricionales - Proporciona plantillas predefinidas
 * para diferentes tipos de planes nutricionales
 */
class PlantillasNutricionService {
    constructor() {
        this.plantillas = {
            perdida_peso: {
                nombre: 'Pérdida de Peso',
                detallePlan: `PLAN NUTRICIONAL PARA PÉRDIDA DE PESO

OBJETIVO: Reducir peso corporal de manera saludable y sostenible

DISTRIBUCIÓN CALÓRICA:
• Proteínas: 25-30% (1.6-2.2g por kg de peso)
• Carbohidratos: 40-45% (preferiblemente complejos)
• Grasas: 25-30% (grasas saludables)

HORARIOS DE COMIDAS:
• Desayuno: 7:00-8:00 AM
• Media mañana: 10:00-11:00 AM
• Almuerzo: 1:00-2:00 PM
• Merienda: 4:00-5:00 PM
• Cena: 7:00-8:00 PM

ALIMENTOS RECOMENDADOS:
• Proteínas: Pollo, pescado, huevos, legumbres, tofu
• Carbohidratos: Avena, quinoa, arroz integral, batata
• Grasas: Aguacate, frutos secos, aceite de oliva
• Vegetales: Espinacas, brócoli, zanahorias, tomates
• Frutas: Manzanas, bayas, cítricos

ALIMENTOS A EVITAR:
• Azúcares refinados y dulces
• Alimentos procesados
• Bebidas azucaradas
• Frituras y grasas trans
• Alcohol en exceso

HIDRATACIÓN:
• 2.5-3 litros de agua diarios
• Infusiones sin azúcar
• Evitar bebidas azucaradas

RECOMENDACIONES ADICIONALES:
• Comer cada 3-4 horas
• Masticar lentamente
• Controlar porciones
• Realizar actividad física regular
• Dormir 7-8 horas diarias`,
                evaluacionNutricional: `EVALUACIÓN NUTRICIONAL PARA PÉRDIDA DE PESO

ANÁLISIS INICIAL:
• Peso actual: ___ kg
• Altura: ___ cm
• IMC: ___
• Objetivo de peso: ___ kg
• Tiempo estimado: ___ meses

RECOMENDACIONES ESPECÍFICAS:
• Déficit calórico moderado (300-500 kcal/día)
• Enfoque en pérdida de grasa, no músculo
• Progresión gradual y sostenible
• Monitoreo semanal de peso

SUPLEMENTACIÓN (si es necesaria):
• Multivitamínico
• Omega-3
• Vitamina D
• Proteína en polvo (si es necesario)

SEGUIMIENTO:
• Peso semanal
• Medidas corporales mensuales
• Ajustes según progreso
• Revisión cada 4-6 semanas`
            },
            ganancia_masa: {
                nombre: 'Ganancia de Masa Muscular',
                detallePlan: `PLAN NUTRICIONAL PARA GANANCIA DE MASA MUSCULAR

OBJETIVO: Aumentar masa muscular de manera eficiente y saludable

DISTRIBUCIÓN CALÓRICA:
• Proteínas: 30-35% (2.2-2.8g por kg de peso)
• Carbohidratos: 45-50% (para energía y recuperación)
• Grasas: 20-25% (grasas saludables)

HORARIOS DE COMIDAS:
• Desayuno: 7:00-8:00 AM
• Pre-entreno: 1 hora antes
• Post-entreno: 30 min después
• Almuerzo: 1:00-2:00 PM
• Merienda: 4:00-5:00 PM
• Cena: 7:00-8:00 PM
• Snack nocturno: 9:00-10:00 PM

ALIMENTOS RECOMENDADOS:
• Proteínas: Carne magra, pollo, pescado, huevos, lácteos
• Carbohidratos: Arroz, pasta, avena, quinoa, frutas
• Grasas: Frutos secos, aceite de oliva, aguacate
• Vegetales: Variedad de colores
• Frutas: Plátanos, manzanas, bayas

TIMING NUTRICIONAL:
• Pre-entreno: Carbohidratos + proteína ligera
• Post-entreno: Proteína + carbohidratos (ventana anabólica)
• Antes de dormir: Caseína o proteína lenta

SUPLEMENTACIÓN RECOMENDADA:
• Proteína en polvo (whey, caseína)
• Creatina monohidrato
• Beta-alanina
• Multivitamínico
• Omega-3

HIDRATACIÓN:
• 3-4 litros de agua diarios
• Electrolitos durante entrenamiento
• Bebidas isotónicas si es necesario

RECOMENDACIONES ADICIONALES:
• Superávit calórico de 300-500 kcal
• Comer cada 2-3 horas
• Enfoque en alimentos densos nutricionalmente
• Descanso adecuado para recuperación`,
                evaluacionNutricional: `EVALUACIÓN NUTRICIONAL PARA GANANCIA DE MASA

ANÁLISIS INICIAL:
• Peso actual: ___ kg
• Altura: ___ cm
• IMC: ___
• Objetivo de peso: ___ kg
• Tiempo estimado: ___ meses

RECOMENDACIONES ESPECÍFICAS:
• Superávit calórico controlado
• Enfoque en proteínas de alta calidad
• Timing nutricional optimizado
• Progresión gradual y consistente

SUPLEMENTACIÓN:
• Proteína: 1-2 batidos diarios
• Creatina: 3-5g diarios
• Multivitamínico completo
• Omega-3 para inflamación

SEGUIMIENTO:
• Peso semanal
• Medidas corporales mensuales
• Fuerza y rendimiento
• Ajustes según progreso`
            },
            mantenimiento: {
                nombre: 'Mantenimiento',
                detallePlan: `PLAN NUTRICIONAL DE MANTENIMIENTO

OBJETIVO: Mantener peso y composición corporal actual

DISTRIBUCIÓN CALÓRICA:
• Proteínas: 25-30% (1.6-2.0g por kg de peso)
• Carbohidratos: 45-50% (balanceados)
• Grasas: 25-30% (grasas saludables)

HORARIOS DE COMIDAS:
• Desayuno: 7:00-8:00 AM
• Media mañana: 10:00-11:00 AM
• Almuerzo: 1:00-2:00 PM
• Merienda: 4:00-5:00 PM
• Cena: 7:00-8:00 PM

ALIMENTOS RECOMENDADOS:
• Proteínas: Variedad de fuentes animales y vegetales
• Carbohidratos: Integrales y naturales
• Grasas: Aceite de oliva, frutos secos, aguacate
• Vegetales: Variedad de colores y tipos
• Frutas: Estacionales y variadas

PRINCIPIOS BÁSICOS:
• Equilibrio en macronutrientes
• Variedad en alimentos
• Moderación en porciones
• Hidratación adecuada
• Actividad física regular

FLEXIBILIDAD:
• 80% alimentación estructurada
• 20% flexibilidad social
• Comidas ocasionales permitidas
• Enfoque en sostenibilidad

HIDRATACIÓN:
• 2-3 litros de agua diarios
• Infusiones y tés
• Evitar exceso de cafeína

RECOMENDACIONES ADICIONALES:
• Comer conscientemente
• Escuchar señales de hambre/saciedad
• Mantener rutinas regulares
• Monitoreo ocasional de peso`,
                evaluacionNutricional: `EVALUACIÓN NUTRICIONAL DE MANTENIMIENTO

ANÁLISIS ACTUAL:
• Peso: ___ kg
• Altura: ___ cm
• IMC: ___
• Objetivo: Mantener peso actual

RECOMENDACIONES ESPECÍFICAS:
• Balance calórico neutro
• Enfoque en calidad nutricional
• Mantenimiento de hábitos saludables
• Flexibilidad controlada

SUPLEMENTACIÓN (opcional):
• Multivitamínico
• Omega-3
• Vitamina D (si es necesario)

SEGUIMIENTO:
• Peso mensual
• Medidas corporales trimestrales
• Ajustes según cambios en estilo de vida
• Revisión cada 3-6 meses`
            },
            deportivo: {
                nombre: 'Deportivo',
                detallePlan: `PLAN NUTRICIONAL DEPORTIVO

OBJETIVO: Optimizar rendimiento deportivo y recuperación

DISTRIBUCIÓN CALÓRICA:
• Proteínas: 25-30% (1.8-2.2g por kg de peso)
• Carbohidratos: 50-60% (para energía)
• Grasas: 20-25% (grasas saludables)

TIMING NUTRICIONAL:
• Pre-entreno (2-3h antes): Comida completa
• Pre-entreno (30-60min): Snack ligero
• Durante entreno: Hidratación + electrolitos
• Post-entreno (0-30min): Proteína + carbohidratos
• Post-entreno (1-2h): Comida completa

ALIMENTOS RECOMENDADOS:
• Proteínas: Carne magra, pollo, pescado, huevos, lácteos
• Carbohidratos: Arroz, pasta, avena, quinoa, frutas
• Grasas: Frutos secos, aceite de oliva, aguacate
• Vegetales: Variedad para micronutrientes
• Frutas: Plátanos, manzanas, bayas

HIDRATACIÓN DEPORTIVA:
• 3-4 litros de agua diarios
• Electrolitos durante ejercicio
• Bebidas isotónicas si es necesario
• Monitoreo de color de orina

SUPLEMENTACIÓN DEPORTIVA:
• Proteína en polvo
• Creatina monohidrato
• Beta-alanina
• Cafeína (pre-entreno)
• Multivitamínico
• Omega-3

RECOMENDACIONES ESPECÍFICAS:
• Carbohidratos según intensidad
• Proteínas para recuperación
• Hidratación antes, durante y después
• Sueño de calidad (7-9 horas)
• Descanso activo y pasivo`,
                evaluacionNutricional: `EVALUACIÓN NUTRICIONAL DEPORTIVA

ANÁLISIS DEPORTIVO:
• Deporte: ___
• Frecuencia entrenamiento: ___ veces/semana
• Duración sesiones: ___ minutos
• Intensidad: Baja/Media/Alta

RECOMENDACIONES ESPECÍFICAS:
• Calorías según gasto energético
• Carbohidratos según intensidad
• Proteínas para recuperación
• Hidratación optimizada

SUPLEMENTACIÓN:
• Proteína: 1-2 batidos diarios
• Creatina: 3-5g diarios
• Pre-entreno: Cafeína + beta-alanina
• Recuperación: Proteína + carbohidratos

SEGUIMIENTO:
• Peso corporal
• Rendimiento deportivo
• Recuperación entre sesiones
• Ajustes según temporada`
            },
            medico: {
                nombre: 'Médico',
                detallePlan: `PLAN NUTRICIONAL MÉDICO

OBJETIVO: Tratamiento nutricional para condiciones médicas específicas

CONSIDERACIONES MÉDICAS:
• Condición médica: ___
• Medicamentos: ___
• Restricciones: ___
• Objetivos terapéuticos: ___

DISTRIBUCIÓN CALÓRICA:
• Proteínas: 20-25% (según condición)
• Carbohidratos: 45-55% (tipo según condición)
• Grasas: 25-30% (calidad según condición)

ALIMENTOS PERMITIDOS:
• Según condición médica específica
• Enfoque en alimentos antiinflamatorios
• Evitar alimentos que interfieran con medicamentos
• Priorizar alimentos frescos y naturales

ALIMENTOS A EVITAR:
• Según restricciones médicas
• Alimentos que interfieran con medicamentos
• Alimentos que empeoren la condición
• Procesados y ultraprocesados

HIDRATACIÓN:
• Según recomendaciones médicas
• Considerar restricciones de líquidos si aplica
• Monitoreo de electrolitos si es necesario

SUPLEMENTACIÓN:
• Solo bajo supervisión médica
• Evitar interacciones con medicamentos
• Enfoque en deficiencias específicas

RECOMENDACIONES ADICIONALES:
• Seguimiento médico regular
• Monitoreo de síntomas
• Ajustes según evolución
• Coordinación con equipo médico`,
                evaluacionNutricional: `EVALUACIÓN NUTRICIONAL MÉDICA

CONDICIÓN MÉDICA:
• Diagnóstico: ___
• Medicamentos actuales: ___
• Restricciones alimentarias: ___
• Objetivos terapéuticos: ___

RECOMENDACIONES ESPECÍFICAS:
• Plan personalizado según condición
• Consideración de interacciones medicamentosas
• Enfoque en síntomas y calidad de vida
• Coordinación con equipo médico

SUPLEMENTACIÓN:
• Solo bajo prescripción médica
• Evitar automedicación
• Considerar interacciones
• Monitoreo de efectos

SEGUIMIENTO:
• Consultas médicas regulares
• Monitoreo de síntomas
• Ajustes según evolución
• Coordinación multidisciplinaria`
            },
            personalizado: {
                nombre: 'Personalizado',
                detallePlan: `PLAN NUTRICIONAL PERSONALIZADO

OBJETIVO: Plan adaptado a necesidades específicas del cliente

INFORMACIÓN PERSONAL:
• Objetivos específicos: ___
• Preferencias alimentarias: ___
• Restricciones: ___
• Horarios disponibles: ___

DISTRIBUCIÓN CALÓRICA:
• Proteínas: ___% (___g por kg de peso)
• Carbohidratos: ___% (según preferencias)
• Grasas: ___% (calidad según objetivos)

HORARIOS PERSONALIZADOS:
• Desayuno: ___
• Media mañana: ___
• Almuerzo: ___
• Merienda: ___
• Cena: ___
• Snacks: ___

ALIMENTOS PERSONALIZADOS:
• Según preferencias del cliente
• Considerando restricciones
• Adaptado a horarios
• Enfoque en sostenibilidad

RECOMENDACIONES ESPECÍFICAS:
• Adaptado a estilo de vida
• Considerando presupuesto
• Enfoque en adherencia
• Flexibilidad según necesidades

HIDRATACIÓN:
• Según necesidades personales
• Considerando actividad
• Adaptado a preferencias

SEGUIMIENTO PERSONALIZADO:
• Según objetivos específicos
• Adaptado a disponibilidad
• Enfoque en adherencia
• Ajustes según progreso`,
                evaluacionNutricional: `EVALUACIÓN NUTRICIONAL PERSONALIZADA

OBJETIVOS ESPECÍFICOS:
• Meta principal: ___
• Tiempo estimado: ___
• Preferencias: ___
• Restricciones: ___

RECOMENDACIONES PERSONALIZADAS:
• Plan adaptado a necesidades
• Considerando estilo de vida
• Enfoque en adherencia
• Flexibilidad controlada

SUPLEMENTACIÓN:
• Según necesidades específicas
• Considerando presupuesto
• Enfoque en eficiencia

SEGUIMIENTO:
• Según objetivos específicos
• Adaptado a disponibilidad
• Enfoque en progreso personal
• Ajustes según evolución`
            }
        };
    }

    /**
     * Obtiene la plantilla para un tipo de plan específico
     * @param {string} tipoPlan - Tipo de plan
     * @returns {Object} Plantilla del plan
     */
    getPlantilla(tipoPlan) {
        return this.plantillas[tipoPlan] || null;
    }

    /**
     * Obtiene todas las plantillas disponibles
     * @returns {Object} Todas las plantillas
     */
    getAllPlantillas() {
        return this.plantillas;
    }

    /**
     * Obtiene la lista de tipos de planes disponibles
     * @returns {Array} Lista de tipos de planes
     */
    getTiposPlanes() {
        return Object.keys(this.plantillas).map(key => ({
            value: key,
            name: this.plantillas[key].nombre
        }));
    }
}

module.exports = PlantillasNutricionService;
