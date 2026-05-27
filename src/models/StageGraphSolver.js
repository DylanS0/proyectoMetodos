/**
 * ============================================================================
 * Clase StageGraphSolver — Red de Distribución de Datos (Grafos por Etapas)
 * ============================================================================
 * 
 * Resuelve el problema de la ruta de menor latencia acumulada usando
 * Programación Dinámica hacia atrás (Backward).
 * 
 * Contexto NexusCore: Encontrar la ruta crítica de menor latencia desde
 * el servidor principal (Nodo origen) hasta los servidores de respaldo
 * regionales (Nodo destino) en una red multietapa.
 * 
 * Algoritmo Backward:
 *   f*(destino) = 0
 *   Para cada nodo desde la penúltima etapa hacia la primera:
 *     f*(nodo) = min { latencia(nodo, siguiente) + f*(siguiente) }
 *     decision*(nodo) = siguiente nodo que minimiza la latencia acumulada
 * 
 * @author NexusCore Systems
 */
class StageGraphSolver {
  /**
   * Constructor de StageGraphSolver
   * @param {Array<Object>} stages - Arreglo de etapas, cada una con aristas
   *   Formato: [{ edges: [{from, to, latency}] }, ...]
   * @param {string} source - Nodo origen de la red
   * @param {string} destination - Nodo destino de la red
   */
  constructor(stages = [], source = '', destination = '') {
    this.stages = stages;           // Etapas de la red con sus aristas
    this.source = source;           // Nodo de inicio (ej: 'A')
    this.destination = destination; // Nodo de destino (ej: 'J')
    this.optimalCosts = {};         // f*(nodo): costo mínimo desde cada nodo al destino
    this.decisions = {};            // decision*(nodo): siguiente nodo óptimo
    this.optimalPath = [];          // Ruta óptima reconstruida
    this.minLatency = Infinity;     // Latencia mínima total
  }

  /**
   * Ejecuta el algoritmo de Programación Dinámica Backward para encontrar
   * la ruta de menor latencia acumulada en la red por etapas.
   * 
   * Proceso:
   * 1. Inicializar f*(destino) = 0
   * 2. Recorrer las etapas de atrás hacia adelante
   * 3. Para cada arista en la etapa, calcular el costo acumulado
   * 4. Conservar el mínimo costo y la decisión óptima por nodo
   * 5. Reconstruir la ruta óptima desde el origen
   * 
   * @returns {Object} Resultado con ruta óptima, latencia mínima, costos por nodo
   */
  solve() {
    // === PASO 1: Inicialización ===
    // El costo desde el destino hasta sí mismo es 0
    this.optimalCosts = {};
    this.decisions = {};
    this.optimalCosts[this.destination] = 0;

    // Tabla de decisiones por etapa para visualización
    const stageDecisions = [];

    // === PASO 2: Recorrer etapas de atrás hacia adelante ===
    for (let s = this.stages.length - 1; s >= 0; s--) {
      const stage = this.stages[s];
      const stageInfo = {
        stageNumber: s + 1,
        decisions: []
      };

      // Agrupar aristas por nodo de origen para procesar cada nodo
      const nodeEdges = {};
      for (const edge of stage.edges) {
        if (!nodeEdges[edge.from]) {
          nodeEdges[edge.from] = [];
        }
        nodeEdges[edge.from].push(edge);
      }

      // === PASO 3: Evaluar cada nodo de origen en la etapa ===
      for (const [node, edges] of Object.entries(nodeEdges)) {
        let bestCost = Infinity;
        let bestNext = null;
        const nodeOptions = [];

        for (const edge of edges) {
          // Costo acumulado = latencia de la arista + f*(nodo siguiente)
          const costToDestination = this.optimalCosts[edge.to];

          // Verificar que el nodo siguiente ya fue procesado
          if (costToDestination === undefined) {
            continue; // Nodo no alcanzable, saltar
          }

          const totalCost = edge.latency + costToDestination;

          nodeOptions.push({
            to: edge.to,
            edgeLatency: edge.latency,
            costFromNext: costToDestination,
            totalCost
          });

          // === PASO 4: Conservar el mínimo ===
          if (totalCost < bestCost) {
            bestCost = totalCost;
            bestNext = edge.to;
          }
        }

        // Guardar la decisión óptima para este nodo
        this.optimalCosts[node] = bestCost;
        this.decisions[node] = bestNext;

        stageInfo.decisions.push({
          node,
          bestNext,
          bestCost,
          options: nodeOptions
        });
      }

      stageDecisions.unshift(stageInfo); // Agregar al inicio (orden correcto)
    }

    // === PASO 5: Reconstruir la ruta óptima ===
    this.minLatency = this.optimalCosts[this.source] || Infinity;
    this._reconstructPath();

    return {
      minLatency: this.minLatency,
      optimalPath: this.optimalPath,
      optimalCosts: { ...this.optimalCosts },
      decisions: { ...this.decisions },
      stageDecisions,
      source: this.source,
      destination: this.destination
    };
  }

  /**
   * Reconstruye la ruta óptima siguiendo las decisiones desde el nodo origen.
   * 
   * Proceso: Desde el origen, seguir decision*(nodo) hasta llegar al destino.
   * 
   * @private
   */
  _reconstructPath() {
    this.optimalPath = [];
    let current = this.source;

    // Seguir las decisiones óptimas hasta llegar al destino
    while (current && current !== this.destination) {
      this.optimalPath.push(current);
      current = this.decisions[current];

      // Protección contra bucles infinitos
      if (this.optimalPath.length > 100) {
        break;
      }
    }

    // Agregar el nodo destino al final de la ruta
    if (current === this.destination) {
      this.optimalPath.push(this.destination);
    }
  }
}

export default StageGraphSolver;
