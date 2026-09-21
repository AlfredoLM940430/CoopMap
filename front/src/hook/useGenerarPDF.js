import { useCallback, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";

const H2C_OPTS = {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
    logging: false,
    ignoreElements: (el) => el.classList?.contains("no-pdf"),
};

const PAGE_W    = 210;
const PAGE_H    = 297;
const MARGIN    = 12;
const CONTENT_W = PAGE_W - MARGIN * 2;
const FOOTER_H  = 10;
const HEADER_H  = 16;
const USABLE_H  = PAGE_H - MARGIN * 2 - FOOTER_H;

const COLOR_PRIMARY   = [3, 22, 54];
const COLOR_SECONDARY = [59, 130, 246];

function dibujarFooter(pdf) {
    pdf.setTextColor(180, 180, 180);
    pdf.setFontSize(6.5);
    pdf.setFont("helvetica", "normal");
    pdf.text(
        `Reporte generado el ${new Date().toLocaleDateString("es-MX", { dateStyle: "long" })}  ·  Confidencial`,
        MARGIN,
        PAGE_H - 6
    );
    pdf.text(
        `${pdf.internal.getNumberOfPages()}`,
        PAGE_W - MARGIN,
        PAGE_H - 6,
        { align: "right" }
    );
}

function dibujarBanner(pdf, titulo, y) {
    pdf.setFillColor(...COLOR_PRIMARY);
    pdf.roundedRect(MARGIN, y, CONTENT_W, HEADER_H - 2, 2, 2, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.text(titulo.toUpperCase(), MARGIN + 4, y + 10);
}

export function useGenerarPDF() {
    const cargandoPDF = useRef(false);

    const generarPDF = useCallback(async (secciones, nombreArchivo = "reporte.pdf") => {
        if (cargandoPDF.current) return;
        cargandoPDF.current = true;

        try {
            const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
            let cursorY      = MARGIN;
            let primeraPagina = true;

            const nuevaPagina = () => {
                dibujarFooter(pdf);
                pdf.addPage();
                cursorY = MARGIN;
            };

            for (const seccion of secciones) {

                // ── 1. Capturar bloques
                const bloquesCaptados = [];
                for (const ref of seccion.bloques) {
                    if (!ref?.current) continue;
                    const canvas   = await html2canvas(ref.current, H2C_OPTS);
                    const ratio    = CONTENT_W / (canvas.width / 2);
                    const alturaMM = (canvas.height / 2) * ratio;
                    bloquesCaptados.push({ canvas, ratio, alturaMM });
                }
                if (bloquesCaptados.length === 0) continue;

                // ── 2. Altura banner ──
                const minimoJuntoAlBanner = Math.min(bloquesCaptados[0].alturaMM, 30);
                if (!primeraPagina && cursorY + HEADER_H + 2 + minimoJuntoAlBanner > PAGE_H - FOOTER_H) {
                    nuevaPagina();
                }

                // ── 3. Dibujar el banner ─────────────────────────────────────────
                dibujarBanner(pdf, seccion.titulo, cursorY);
                cursorY += HEADER_H + 2;
                primeraPagina = false;

                // ── 4. Insertar bloques uno a uno ────────────────────────────────
                for (const { canvas, ratio, alturaMM } of bloquesCaptados) {

                    if (cursorY + alturaMM > PAGE_H - FOOTER_H) {
                        if (alturaMM <= USABLE_H) {
                            nuevaPagina();
                        }
                    }

                    if (alturaMM > USABLE_H) {
                        const imgW        = canvas.width;
                        const espacioDisp = PAGE_H - FOOTER_H - cursorY;
                        let yRendered     = 0;

                        while (yRendered < alturaMM) {
                            const espacio  = yRendered === 0 ? espacioDisp : USABLE_H;
                            const fraccion = Math.min(espacio, alturaMM - yRendered);
                            const escala   = 2;
                            const pixY     = (yRendered / ratio) * escala;
                            const pixH     = (fraccion / ratio) * escala;

                            const tmp = document.createElement("canvas");
                            tmp.width  = imgW;
                            tmp.height = Math.ceil(pixH);
                            tmp.getContext("2d").drawImage(canvas, 0, pixY, imgW, pixH, 0, 0, imgW, pixH);

                            pdf.addImage(tmp.toDataURL("image/jpeg", 0.92), "JPEG", MARGIN, cursorY, CONTENT_W, fraccion);
                            yRendered += fraccion;
                            cursorY   += fraccion;

                            if (yRendered < alturaMM) nuevaPagina();
                        }
                    } else {
                        pdf.addImage(
                            canvas.toDataURL("image/jpeg", 0.92),
                            "JPEG",
                            MARGIN, cursorY,
                            CONTENT_W, alturaMM
                        );
                        cursorY += alturaMM + 3;
                    }
                }

                pdf.setDrawColor(...COLOR_SECONDARY);
                pdf.setLineWidth(0.3);
                pdf.line(MARGIN, cursorY, PAGE_W - MARGIN, cursorY);
                cursorY += 5;
            }

            dibujarFooter(pdf);
            pdf.save(nombreArchivo);

        } catch (err) {
            console.error("Error generando PDF:", err);
            alert("No se pudo generar el PDF. Intenta de nuevo.");
        } finally {
            cargandoPDF.current = false;
        }
    }, []);

    return { generarPDF, cargandoPDF };
}