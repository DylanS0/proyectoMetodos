/**
 * ============================================================================
 * Datos por Defecto — Valores de Prueba para NexusCore Systems
 * ============================================================================
 * 
 * Contiene los datos de ejemplo proporcionados en el enunciado del proyecto
 * para cada sub-problema. Estos datos se usan como valores iniciales
 * en los formularios y para pruebas de validación.
 * 
 * @author NexusCore Systems
 */

/**
 * Datos por defecto para el Sub-problema A: Carga de Servidores (Mochila 0/1)
 * Capacidad máxima del servidor: 16 GB de RAM
 */
export const DEFAULT_KNAPSACK_DATA = {
  capacity: 16, // Capacidad del Servidor Maestro en GB de RAM
  items: [
    {
      name: 'Autenticación y Seguridad',
      weight: 3,  // Requisito de RAM (GB)
      value: 5    // Valor de Prioridad de Estabilidad
    },
    {
      name: 'Matchmaking (Emparejamiento)',
      weight: 4,
      value: 7
    },
    {
      name: 'Sincronización de Estado (Física)',
      weight: 7,
      value: 11
    },
    {
      name: 'Base de Datos Caché',
      weight: 5,
      value: 8
    }
  ]
};

/**
 * Datos por defecto para el Sub-problema B: Red de Distribución de Datos
 * Red de 4 etapas desde Nodo A hasta Nodo J
 */
export const DEFAULT_GRAPH_DATA = {
  source: 'A',
  destination: 'J',
  stages: [
    {
      // Etapa 1: Desde el servidor principal (A) a los nodos de la primera capa
      edges: [
        { from: 'A', to: 'B', latency: 4 },
        { from: 'A', to: 'C', latency: 6 },
        { from: 'A', to: 'D', latency: 3 }
      ]
    },
    {
      // Etapa 2: Desde la primera capa a la segunda
      edges: [
        { from: 'B', to: 'E', latency: 7 },
        { from: 'B', to: 'F', latency: 5 },
        { from: 'C', to: 'E', latency: 3 },
        { from: 'C', to: 'F', latency: 8 },
        { from: 'C', to: 'G', latency: 4 },
        { from: 'D', to: 'F', latency: 6 },
        { from: 'D', to: 'G', latency: 9 }
      ]
    },
    {
      // Etapa 3: Desde la segunda capa a la tercera
      edges: [
        { from: 'E', to: 'H', latency: 5 },
        { from: 'E', to: 'I', latency: 6 },
        { from: 'F', to: 'H', latency: 3 },
        { from: 'F', to: 'I', latency: 5 },
        { from: 'G', to: 'H', latency: 8 },
        { from: 'G', to: 'I', latency: 2 }
      ]
    },
    {
      // Etapa 4: Desde la tercera capa al servidor de respaldo regional (J)
      edges: [
        { from: 'H', to: 'J', latency: 4 },
        { from: 'I', to: 'J', latency: 7 }
      ]
    }
  ]
};

/**
 * Datos por defecto para la Parte II: Optimización de Marketing
 * Modelo: f(x1,x2) = 4x1 + 5x2 - 0.2x1² - 0.3x2²
 * Restricción: x1 + x2 ≤ 10, x1 ≥ 0, x2 ≥ 0
 */
export const DEFAULT_OPTIMIZER_DATA = {
  coefficients: {
    a: 4,    // Coeficiente lineal de x1 (Creadores de Contenido)
    b: 5,    // Coeficiente lineal de x2 (Anuncios Programáticos)
    c: 0.2,  // Coeficiente cuadrático de x1² (rendimiento decreciente)
    d: 0.3   // Coeficiente cuadrático de x2² (rendimiento decreciente)
  },
  budget: 10  // Presupuesto máximo: $10,000 (representado como 10 unidades de mil)
};
