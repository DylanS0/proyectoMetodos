import { useState } from 'react';
import StageGraphSolver from '../models/StageGraphSolver';
import Validator from '../utils/Validator';
import { DEFAULT_GRAPH_DATA } from '../data/defaultData';

/**
 * ============================================================================
 * Componente GraphModule — Red de Distribución de Datos (Parte I-B)
 * ============================================================================
 * 
 * Interfaz para el Sub-problema B: Encontrar la ruta de menor latencia
 * en una red por etapas usando Programación Dinámica Backward.
 * 
 * Permite al usuario:
 * - Definir etapas con sus conexiones (aristas con latencia)
 * - Agregar/eliminar etapas y conexiones dinámicamente
 * - Cargar la red de ejemplo del enunciado
 * - Visualizar la ruta óptima y tabla de decisiones
 * 
 * @param {Function} onResult - Callback para enviar resultados al componente padre
 */
function GraphModule({ onResult }) {
  // === ESTADOS DEL FORMULARIO ===
  const [source, setSource] = useState(DEFAULT_GRAPH_DATA.source);
  const [destination, setDestination] = useState(DEFAULT_GRAPH_DATA.destination);
  const [stages, setStages] = useState(
    DEFAULT_GRAPH_DATA.stages.map(stage => ({
      edges: stage.edges.map(edge => ({ ...edge }))
    }))
  );

  // === ESTADOS DE RESULTADOS Y UI ===
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState([]);

  /**
   * Agrega una nueva etapa vacía con una conexión inicial
   */
  const addStage = () => {
    setStages([...stages, { edges: [{ from: '', to: '', latency: '' }] }]);
  };

  /**
   * Elimina una etapa completa del formulario
   * @param {number} stageIndex - Índice de la etapa a eliminar
   */
  const removeStage = (stageIndex) => {
    if (stages.length <= 1) return;
    setStages(stages.filter((_, i) => i !== stageIndex));
  };

  /**
   * Agrega una nueva conexión (arista) a una etapa específica
   * @param {number} stageIndex - Índice de la etapa
   */
  const addEdge = (stageIndex) => {
    const updated = [...stages];
    updated[stageIndex].edges.push({ from: '', to: '', latency: '' });
    setStages(updated);
  };

  /**
   * Elimina una conexión de una etapa específica
   * @param {number} stageIndex - Índice de la etapa
   * @param {number} edgeIndex - Índice de la conexión a eliminar
   */
  const removeEdge = (stageIndex, edgeIndex) => {
    const updated = [...stages];
    if (updated[stageIndex].edges.length <= 1) return;
    updated[stageIndex].edges = updated[stageIndex].edges.filter((_, i) => i !== edgeIndex);
    setStages(updated);
  };

  /**
   * Actualiza un campo específico de una conexión
   * @param {number} stageIndex - Índice de la etapa
   * @param {number} edgeIndex - Índice de la conexión
   * @param {string} field - Campo a modificar ('from', 'to', 'latency')
   * @param {*} value - Nuevo valor
   */
  const updateEdge = (stageIndex, edgeIndex, field, value) => {
    const updated = [...stages];
    updated[stageIndex].edges[edgeIndex] = {
      ...updated[stageIndex].edges[edgeIndex],
      [field]: field === 'latency' ? value : value.toUpperCase()
    };
    setStages(updated);
  };

  /**
   * Carga los datos de ejemplo del enunciado
   */
  const loadDefaults = () => {
    setSource(DEFAULT_GRAPH_DATA.source);
    setDestination(DEFAULT_GRAPH_DATA.destination);
    setStages(
      DEFAULT_GRAPH_DATA.stages.map(stage => ({
        edges: stage.edges.map(edge => ({ ...edge }))
      }))
    );
    setResult(null);
    setErrors([]);
  };

  /**
   * Ejecuta el algoritmo de PD Backward con los datos del formulario
   */
  const solve = () => {
    // Preparar datos con latencias numéricas
    const parsedStages = stages.map(stage => ({
      edges: stage.edges.map(edge => ({
        from: edge.from.trim().toUpperCase(),
        to: edge.to.trim().toUpperCase(),
        latency: parseFloat(edge.latency)
      }))
    }));

    const parsedSource = source.trim().toUpperCase();
    const parsedDestination = destination.trim().toUpperCase();

    // Validar entrada
    const validation = Validator.validateGraphInput(
      parsedStages, parsedSource, parsedDestination
    );
    if (!validation.isValid) {
      setErrors(validation.errors);
      setResult(null);
      return;
    }

    setErrors([]);

    // Crear instancia del solver y ejecutar
    const solver = new StageGraphSolver(parsedStages, parsedSource, parsedDestination);
    const solverResult = solver.solve();

    setResult(solverResult);

    // Notificar al componente padre
    if (onResult) {
      onResult(solverResult);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* === SECCIÓN: ENTRADA DE DATOS === */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-nexus-text flex items-center gap-2">
              🌐 Red de Distribución de Datos
            </h2>
            <p className="text-xs text-nexus-text-dim mt-1">
              Defina la red por etapas con las latencias entre nodos (en ms)
            </p>
          </div>
          <button
            onClick={loadDefaults}
            className="nexus-btn nexus-btn-secondary text-xs"
            id="btn-load-graph-defaults"
          >
            📋 Cargar Ejemplo
          </button>
        </div>

        {/* Nodos origen y destino */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <label className="nexus-label" htmlFor="graph-source">
              Nodo Origen
            </label>
            <input
              id="graph-source"
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value.toUpperCase())}
              className="nexus-input"
              placeholder="Ej: A"
              maxLength={3}
            />
          </div>
          <div>
            <label className="nexus-label" htmlFor="graph-destination">
              Nodo Destino
            </label>
            <input
              id="graph-destination"
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value.toUpperCase())}
              className="nexus-input"
              placeholder="Ej: J"
              maxLength={3}
            />
          </div>
        </div>

        {/* Etapas y conexiones */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="nexus-label mb-0">Etapas de la Red</span>
            <button
              onClick={addStage}
              className="nexus-btn nexus-btn-secondary text-xs"
              id="btn-add-stage"
            >
              + Agregar Etapa
            </button>
          </div>

          {stages.map((stage, sIndex) => (
            <div
              key={sIndex}
              className="p-4 rounded-xl bg-nexus-bg/50 border border-nexus-border/50 space-y-3 animate-slide-in"
            >
              {/* Header de la etapa */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="nexus-badge nexus-badge-purple">
                    Etapa {sIndex + 1}
                  </span>
                  <span className="text-xs text-nexus-text-dim">
                    {stage.edges.length} conexión(es)
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => addEdge(sIndex)}
                    className="nexus-btn nexus-btn-secondary text-xs"
                  >
                    + Conexión
                  </button>
                  <button
                    onClick={() => removeStage(sIndex)}
                    className="nexus-btn nexus-btn-danger"
                    disabled={stages.length <= 1}
                  >
                    ✕ Etapa
                  </button>
                </div>
              </div>

              {/* Conexiones de la etapa */}
              {stage.edges.map((edge, eIndex) => (
                <div key={eIndex} className="flex items-end gap-2">
                  <div className="flex-1 min-w-0">
                    <label className="nexus-label" htmlFor={`edge-from-${sIndex}-${eIndex}`}>
                      Desde
                    </label>
                    <input
                      id={`edge-from-${sIndex}-${eIndex}`}
                      type="text"
                      value={edge.from}
                      onChange={(e) => updateEdge(sIndex, eIndex, 'from', e.target.value)}
                      className="nexus-input"
                      placeholder="Ej: A"
                      maxLength={3}
                    />
                  </div>
                  <div className="flex items-center pb-2 text-nexus-purple font-bold">
                    →
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="nexus-label" htmlFor={`edge-to-${sIndex}-${eIndex}`}>
                      Hacia
                    </label>
                    <input
                      id={`edge-to-${sIndex}-${eIndex}`}
                      type="text"
                      value={edge.to}
                      onChange={(e) => updateEdge(sIndex, eIndex, 'to', e.target.value)}
                      className="nexus-input"
                      placeholder="Ej: B"
                      maxLength={3}
                    />
                  </div>
                  <div className="w-24">
                    <label className="nexus-label" htmlFor={`edge-latency-${sIndex}-${eIndex}`}>
                      Latencia (ms)
                    </label>
                    <input
                      id={`edge-latency-${sIndex}-${eIndex}`}
                      type="number"
                      min="1"
                      value={edge.latency}
                      onChange={(e) => updateEdge(sIndex, eIndex, 'latency', e.target.value)}
                      className="nexus-input"
                      placeholder="ms"
                    />
                  </div>
                  <button
                    onClick={() => removeEdge(sIndex, eIndex)}
                    className="nexus-btn nexus-btn-danger shrink-0"
                    disabled={stage.edges.length <= 1}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Botón ejecutar */}
        <div className="mt-6">
          <button
            onClick={solve}
            className="nexus-btn nexus-btn-primary w-full sm:w-auto"
            id="btn-solve-graph"
          >
            ⚡ Encontrar Ruta de Menor Latencia
          </button>
        </div>
      </div>

      {/* === SECCIÓN: ERRORES === */}
      {errors.length > 0 && (
        <div className="nexus-alert nexus-alert-error animate-fade-in">
          <span className="shrink-0">⚠️</span>
          <div>
            <p className="font-semibold mb-1">Errores de validación:</p>
            <ul className="list-disc list-inside space-y-0.5">
              {errors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* === SECCIÓN: RESULTADOS === */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Resumen de la solución */}
          <div className="glass-card">
            <h3 className="text-base font-bold text-nexus-text mb-4 flex items-center gap-2">
              ✅ Ruta Óptima Encontrada
            </h3>

            {/* Métrica principal */}
            <div className="result-highlight mb-6">
              <div className="result-value">{result.minLatency} ms</div>
              <div className="result-label">Latencia Mínima Acumulada</div>
            </div>

            {/* Ruta visual */}
            <h4 className="text-sm font-semibold text-nexus-text-dim mb-3 uppercase tracking-wider">
              Ruta de Menor Latencia: {result.source} → {result.destination}
            </h4>
            <div className="flex items-center justify-center flex-wrap gap-1 p-4 rounded-xl bg-nexus-bg/50 border border-nexus-border/50">
              {result.optimalPath.map((node, i) => (
                <div key={i} className="flex items-center">
                  <div className="path-node">{node}</div>
                  {i < result.optimalPath.length - 1 && (
                    <div className="path-arrow">→</div>
                  )}
                </div>
              ))}
            </div>

            {/* Detalle de latencias por tramo */}
            <div className="mt-4 overflow-x-auto rounded-lg border border-nexus-border">
              <table className="nexus-table">
                <thead>
                  <tr>
                    <th>Tramo</th>
                    <th>Latencia (ms)</th>
                    <th>Acumulado (ms)</th>
                  </tr>
                </thead>
                <tbody>
                  {result.optimalPath.slice(0, -1).map((node, i) => {
                    const nextNode = result.optimalPath[i + 1];
                    // Buscar la latencia de la arista en las etapas
                    let edgeLatency = 0;
                    for (const stage of stages) {
                      const edge = stage.edges.find(
                        e => e.from.toString().toUpperCase() === node &&
                             e.to.toString().toUpperCase() === nextNode
                      );
                      if (edge) {
                        edgeLatency = parseFloat(edge.latency);
                        break;
                      }
                    }
                    // Calcular acumulado sumando latencias de tramos previos
                    let accumulated = 0;
                    for (let j = 0; j <= i; j++) {
                      const n = result.optimalPath[j];
                      const nn = result.optimalPath[j + 1];
                      for (const stage of stages) {
                        const e = stage.edges.find(
                          ed => ed.from.toString().toUpperCase() === n &&
                                ed.to.toString().toUpperCase() === nn
                        );
                        if (e) {
                          accumulated += parseFloat(e.latency);
                          break;
                        }
                      }
                    }
                    return (
                      <tr key={i}>
                        <td className="font-sans">
                          <span className="text-nexus-cyan font-semibold">{node}</span>
                          <span className="text-nexus-text-dim mx-1">→</span>
                          <span className="text-nexus-purple font-semibold">{nextNode}</span>
                        </td>
                        <td>{edgeLatency} ms</td>
                        <td className="highlight-cell">{accumulated} ms</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabla de decisiones backward */}
          <div className="glass-card">
            <h3 className="text-base font-bold text-nexus-text mb-4 flex items-center gap-2">
              📐 Tabla de Decisiones — PD Backward
            </h3>
            <p className="text-xs text-nexus-text-dim mb-4">
              Para cada nodo, se muestra el costo mínimo f*(nodo) al destino y la decisión óptima.
            </p>

            <div className="overflow-x-auto rounded-lg border border-nexus-border">
              <table className="nexus-table">
                <thead>
                  <tr>
                    <th>Nodo</th>
                    <th>f*(nodo)</th>
                    <th>Decisión Óptima</th>
                    <th>Opciones Evaluadas</th>
                  </tr>
                </thead>
                <tbody>
                  {result.stageDecisions.map((stage) =>
                    stage.decisions.map((dec, i) => (
                      <tr key={`${stage.stageNumber}-${i}`}>
                        <td>
                          <span className={`nexus-badge ${
                            result.optimalPath.includes(dec.node)
                              ? 'nexus-badge-green'
                              : 'nexus-badge-purple'
                          }`}>
                            {dec.node}
                          </span>
                        </td>
                        <td className={
                          result.optimalPath.includes(dec.node) ? 'highlight-cell' : ''
                        }>
                          {dec.bestCost} ms
                        </td>
                        <td className="font-sans font-medium">
                          → {dec.bestNext}
                        </td>
                        <td className="font-sans text-xs text-nexus-text-dim">
                          {dec.options.map(opt =>
                            `${opt.to}(${opt.edgeLatency}+${opt.costFromNext}=${opt.totalCost})`
                          ).join(', ')}
                        </td>
                      </tr>
                    ))
                  )}
                  {/* Nodo destino */}
                  <tr>
                    <td>
                      <span className="nexus-badge nexus-badge-green">{result.destination}</span>
                    </td>
                    <td className="highlight-cell">0 ms</td>
                    <td className="font-sans text-nexus-text-dim">— (destino)</td>
                    <td className="font-sans text-xs text-nexus-text-dim">Nodo final</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GraphModule;
