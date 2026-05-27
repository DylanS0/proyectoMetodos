/**
 * ============================================================================
 * Clase KnapsackSolver — Problema de la Mochila 0/1
 * ============================================================================
 * 
 * Resuelve el Problema de la Carga de Servidores usando Programación Dinámica
 * con enfoque de tabulación bottom-up.
 * 
 * Contexto NexusCore: Determinar la combinación óptima de microservicios
 * a desplegar en un Servidor Maestro con capacidad limitada de RAM,
 * maximizando el Valor de Prioridad de Estabilidad total del sistema.
 * 
 * Complejidad temporal: O(n * W) donde n = número de ítems, W = capacidad.
 * Complejidad espacial: O(n * W) para la tabla DP.
 * 
 * @author NexusCore Systems
 */
class KnapsackSolver {
  /**
   * Constructor de KnapsackSolver
   * @param {Array<Object>} items - Lista de microservicios [{name, weight, value}]
   * @param {number} capacity - Capacidad máxima del servidor en GB de RAM
   */
  constructor(items = [], capacity = 0) {
    this.items = items;         // Microservicios a evaluar
    this.capacity = capacity;   // Capacidad máxima de RAM (GB)
    this.dpTable = [];          // Tabla de programación dinámica
    this.selectedItems = [];    // Ítems seleccionados en la solución óptima
    this.maxValue = 0;          // Valor de prioridad máximo alcanzado
  }

  /**
   * Ejecuta el algoritmo de Programación Dinámica para resolver
   * el problema de la mochila 0/1 (tabulación bottom-up).
   * 
   * Construye la tabla dp[i][w] donde:
   *   i = número de ítems considerados (0..n)
   *   w = capacidad utilizada (0..W)
   *   dp[i][w] = máximo valor alcanzable con los primeros i ítems y capacidad w
   * 
   * Recurrencia:
   *   Si w_i > w:  dp[i][w] = dp[i-1][w]          (no cabe el ítem)
   *   Si no:       dp[i][w] = max(dp[i-1][w],       (no incluir ítem i)
   *                               dp[i-1][w-w_i] + v_i)  (incluir ítem i)
   * 
   * @returns {Object} Resultado con valor óptimo, ítems seleccionados, tabla DP
   */
  solve() {
    const n = this.items.length;
    const W = this.capacity;

    // Inicializar tabla DP con dimensiones (n+1) x (W+1), llena de ceros
    this.dpTable = Array.from(
      { length: n + 1 },
      () => Array(W + 1).fill(0)
    );

    // === LLENADO DE LA TABLA (Bottom-Up) ===
    for (let i = 1; i <= n; i++) {
      const item = this.items[i - 1]; // Ítem actual (índice base 0)

      for (let w = 0; w <= W; w++) {
        if (item.weight > w) {
          // El ítem no cabe en la capacidad actual: heredar valor anterior
          this.dpTable[i][w] = this.dpTable[i - 1][w];
        } else {
          // Decidir: ¿es mejor incluir o excluir el ítem?
          const valorSinItem = this.dpTable[i - 1][w];
          const valorConItem = this.dpTable[i - 1][w - item.weight] + item.value;
          this.dpTable[i][w] = Math.max(valorSinItem, valorConItem);
        }
      }
    }

    // El valor óptimo está en la esquina inferior derecha de la tabla
    this.maxValue = this.dpTable[n][W];

    // Reconstruir qué ítems fueron seleccionados
    this._backtrack();

    // Calcular peso total de los ítems seleccionados
    const totalWeight = this.selectedItems.reduce(
      (sum, item) => sum + item.weight, 0
    );

    return {
      maxValue: this.maxValue,
      selectedItems: this.selectedItems,
      dpTable: this.dpTable,
      totalWeight,
      capacity: this.capacity,
      totalItems: n
    };
  }

  /**
   * Reconstruye la solución óptima mediante backtracking en la tabla DP.
   * 
   * Recorre la tabla desde dp[n][W] hacia dp[0][0]:
   *   Si dp[i][w] ≠ dp[i-1][w], el ítem i fue incluido.
   *   Se resta su peso de w y se continúa con el ítem anterior.
   * 
   * @private
   */
  _backtrack() {
    let w = this.capacity;
    this.selectedItems = [];

    for (let i = this.items.length; i > 0; i--) {
      // Si el valor cambió respecto a la fila anterior, el ítem i fue incluido
      if (this.dpTable[i][w] !== this.dpTable[i - 1][w]) {
        this.selectedItems.push({ ...this.items[i - 1], index: i });
        w -= this.items[i - 1].weight; // Restar peso del ítem incluido
      }
    }

    // Invertir para mostrar en orden original
    this.selectedItems.reverse();
  }
}

export default KnapsackSolver;
