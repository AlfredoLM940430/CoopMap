import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import VistaEquipos from './VistaEquipos';
import VistaAuditoria from './VistaAuditoria';

export default function ExportadorOptimizado() {
    const [isGenerating, setIsGenerating] = useState(false);
    const exportContainerRef = useRef();

    const handleDownloadTodo = async () => {
        setIsGenerating(true);
        setTimeout(async () => {
        const elemento = exportContainerRef.current;
            if (elemento) {
                const canvas = await html2canvas(elemento, { scale: 1.5 });
                const imgData = canvas.toDataURL('image/png');
                
                const pdf = new jsPDF('p', 'mm', 'a4');
                pdf.save('reporte-completo.pdf');
            }

            setIsGenerating(false);
        }, 500); 
    };

  return (
    <div>
        <button onClick={handleDownloadTodo} disabled={isGenerating}>
            {isGenerating ? 'Procesando Reporte...' : 'Descargar Reporte Completo'}
        </button>

        {isGenerating && (
        <div 
            ref={exportContainerRef} 
            style={{ position: 'absolute', left: '-9999px', width: '800px', backgroundColor: '#fff' }}
        >
            <VistaEquipos isForPdf={true} />
            <VistaAuditoria isForPdf={true} />
        </div>
        )}
    </div>
)}