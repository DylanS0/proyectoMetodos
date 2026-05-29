import { useState } from 'react';
import { Groq } from 'groq-sdk';
import { jsPDF } from 'jspdf'; // <-- Importamos jsPDF

function StrategicAnalysis({ results }) {
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Verificamos si faltan módulos por resolver
  const { knapsack, graph, optimizer } = results;
  const isReady = knapsack && graph && optimizer;

  const generateAnalysis = async () => {
    if (!isReady) return;

    setIsLoading(true);
    setError(null);

    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY; 
      
      const groq = new Groq({ 
        apiKey: apiKey,
        dangerouslyAllowBrowser: true 
      });

      const prompt = `
        Actúa como el Chief Technology Officer (CTO) de NexusCore Systems. 
        Analiza la viabilidad de negocio de los siguientes resultados obtenidos por el motor matemático de nuestra plataforma:

        1. CARGA DE SERVIDORES (Mochila 0/1):
        - RAM Utilizada: ${knapsack.totalWeight} GB de ${knapsack.capacity} GB.
        - Prioridad Total: ${knapsack.maxValue}
        - Microservicios Activos: ${knapsack.selectedItems.map(i => i.name).join(', ')}

        2. RED DE DISTRIBUCIÓN (Grafos por Etapas):
        - Ruta óptima seleccionada: ${graph.path?.join(' -> ') || 'No definida'}
        - Latencia/Costo total: ${graph.totalCost || graph.latency} ms

        3. ESTRATEGIA DE MARKETING (Optimización No Lineal):
        - Retorno de Inversión (ROI): ${optimizer.roi || optimizer.maxValue}%
        - Inversión en canales: ${optimizer.allocation ? JSON.stringify(optimizer.allocation) : 'No especificada'}
        
        Tu tarea es entregar un análisis estructurado evaluando:
        - Si la latencia obtenida es competitiva en la industria actual.
        - El riesgo técnico de la distribución de memoria seleccionada en los servidores.
        - La eficiencia del retorno de inversión en marketing digital ante los rendimientos decrecientes.
        
        Responde de forma clara, con tono ejecutivo y estructurado en párrafos cortos o viñetas. Evita usar formato Markdown excesivo. Esta respuesta debe tener como titulo "Conclusiones Estratégicas del Asistente de IA"
      `;

      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: "Eres un CTO experto en arquitectura en la nube, rendimiento de software y estrategia de negocio." },
          { role: "user", content: prompt }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.5,
      });

      setAnalysis(completion.choices[0].message.content);

    } catch (err) {
      console.error("Error al conectar con Groq:", err);
      setError("Error de conexión con la IA. Verifica tu API Key y la consola.");
    } finally {
      setIsLoading(false);
    }
  };

  // === NUEVA FUNCIÓN: GENERACIÓN Y DESCARGA DEL PDF ===
  const downloadPDF = () => {
    if (!analysis) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // 1. Encabezado Estilizado
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80); // Color oscuro ejecutivo
    doc.text("NexusCore Systems", 14, 20);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(127, 140, 141);
    doc.text("Plataforma de Optimización Operacional", 14, 26);
    
    // Línea divisoria decorativa
    doc.setDrawColor(52, 152, 219);
    doc.setLineWidth(0.5);
    doc.line(14, 30, 196, 30);

    // 2. Resumen de las métricas que alimentaron a la IA
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(44, 62, 80);
    doc.text("MÉTRICAS MATEMÁTICAS EVALUADAS:", 14, 38);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`• Servidores (Mochila): ${knapsack.totalWeight} GB / ${knapsack.capacity} GB (Prioridad: ${knapsack.maxValue})`, 14, 45);
    doc.text(`• Red de Distribución: Latencia de ${graph.totalCost || graph.latency} ms en ruta [${graph.path?.join(' -> ') || 'N/D'}]`, 14, 51);
    doc.text(`• Plan de Marketing: ROI Proyectado del ${optimizer.roi || optimizer.maxValue}%`, 14, 57);

    // Segunda línea divisoria
    doc.setDrawColor(220, 220, 220);
    doc.line(14, 63, 196, 63);

    // 3. Título del Reporte de la IA
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(142, 68, 173); // Color Púrpura elegante para contrastar la IA
    doc.text("Conclusiones Estratégicas del Asistente de IA (Reporte CTO)", 14, 72);

    // 4. Procesamiento del texto largo con paginación automática
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(51, 51, 51);

    // splitTextToSize formatea el string largo en un array de líneas que caben exactamente en el ancho (180mm)
    const lineasTexto = doc.splitTextToSize(analysis, 180);
    
    let Y_coordenada = 80;
    const altoLinea = 6; // Espaciado entre líneas en mm
    const limitePagina = 275; // Altura máxima antes de saltar de hoja

    lineasTexto.forEach((linea) => {
      // Si la línea actual supera el límite de la hoja, creamos una nueva página
      if (Y_coordenada > limitePagina) {
        doc.addPage();
        Y_coordenada = 20; // Reseteamos la altura en la nueva hoja
      }
      doc.text(linea, 14, Y_coordenada);
      Y_coordenada += altoLinea;
    });

    // 5. Descargar el archivo terminado
    doc.save("Reporte_Estrategico_NexusCore.pdf");
  };

  return (
    <div className="glass-card animate-fade-in p-8 border border-nexus-border rounded-xl">
      <div className="text-center mb-8">
        <span className="text-5xl mb-4 block">🤖</span>
        <h2 className="text-2xl font-bold text-nexus-text mb-2">
          Conclusiones Estratégicas del Asistente de IA
        </h2>
        <p className="text-nexus-text-dim text-sm max-w-xl mx-auto">
          Evaluación técnica y de negocio generada por el motor cognitivo basada en los resultados de los tres módulos.
        </p>
      </div>

      {/* Indicadores de estado de cada módulo */}
      <div className="flex justify-center gap-4 mb-8">
        <div className={`nexus-badge ${knapsack ? 'nexus-badge-green' : 'nexus-badge-purple'}`}>
          {knapsack ? '✓' : '○'} Servidores
        </div>
        <div className={`nexus-badge ${graph ? 'nexus-badge-green' : 'nexus-badge-purple'}`}>
          {graph ? '✓' : '○'} Grafos
        </div>
        <div className={`nexus-badge ${optimizer ? 'nexus-badge-green' : 'nexus-badge-purple'}`}>
          {optimizer ? '✓' : '○'} Marketing
        </div>
      </div>

      {!isReady ? (
        <div className="text-center p-6 bg-nexus-surface rounded-lg border border-nexus-border/50">
          <p className="text-nexus-text font-medium">⚠️ Faltan datos para el análisis</p>
          <p className="text-nexus-text-dim text-sm mt-2">
            Debes ejecutar y resolver los 3 módulos anteriores antes de solicitar el reporte del CTO.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <button
            onClick={generateAnalysis}
            disabled={isLoading}
            className="nexus-btn nexus-btn-primary px-8 py-3 text-lg w-full sm:w-auto"
          >
            {isLoading ? '⏳ Analizando Datos Operacionales...' : '⚡ Generar Reporte CTO'}
          </button>
        </div>
      )}

      {error && (
        <div className="mt-6 nexus-alert nexus-alert-error animate-fade-in">
          {error}
        </div>
      )}

      {analysis && (
        <div className="mt-8 p-6 rounded-lg bg-nexus-surface/80 border border-nexus-purple/30 shadow-lg animate-slide-in text-left">
          {/* Encabezado del reporte con el nuevo botón de descarga */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-3 border-b border-nexus-border/50">
            <h3 className="text-lg font-bold text-nexus-purple flex items-center gap-2">
              📋 Reporte Ejecutivo
            </h3>
            <button
              onClick={downloadPDF}
              className="nexus-btn text-xs bg-emerald-600 hover:bg-emerald-700 text-white border-none flex items-center gap-1.5 px-3 py-1.5 rounded transition-all shadow-md shadow-emerald-900/20"
            >
              📥 Descargar Reporte (PDF)
            </button>
          </div>
          
          <div className="text-nexus-text text-sm leading-relaxed whitespace-pre-wrap font-sans">
            {analysis}
          </div>
        </div>
      )}
    </div>
  );
}

export default StrategicAnalysis;