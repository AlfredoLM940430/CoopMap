import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

export const GraficoEdades = ({ datosRangos }) => {
    if (!datosRangos) return <p className="text-sm text-gray-400">Cargando gráfica...</p>;

    const data = {
        labels: Object.keys(datosRangos),
        datasets: [
            {
                label: 'Ingreso Promedio ($)',
                data: Object.values(datosRangos),
                backgroundColor: [
                    'rgba(54, 162, 235, 0.7)',   // Azul
                    'rgba(75, 192, 192, 0.7)',   // Verde menta
                    'rgba(255, 206, 86, 0.7)',   // Amarillo
                    'rgba(255, 99, 132, 0.7)',   // Rosa/Rojo
                    'rgba(153, 102, 255, 0.7)',  // Morado
                    'rgba(255, 159, 64, 0.7)',   // Naranja
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    boxWidth: 12,
                    padding: 15,
                    font: {
                        size: 11
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        let label = context.label || '';
                        if (label) label += ': ';
                        if (context.raw !== null) {
                            label += new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(context.raw);
                        }
                        return label;
                    }
                }
            },
            datalabels: {
                color: '#fff',
                font: {
                    weight: 'bold',
                    size: 12,
                },
                formatter: (value) => {
                    if (value === null) return '';
                    return new Intl.NumberFormat('es-MX', { 
                        style: 'currency', 
                        currency: 'MXN',
                        maximumFractionDigits: 0
                    }).format(value);
                },
                display: function(context) {
                    const dataset = context.dataset;
                    const count = dataset.data.length;
                    const value = dataset.data[context.dataIndex];
                    const total = dataset.data.reduce((a, b) => a + b, 0);
                    return (value / total) > 0.05; 
                }
            }
        },
    };

    return (
        <div className="w-full max-w-sm mx-auto h-[340px] md:h-[380px] pb-4 flex flex-col justify-between">
            <Pie data={data} options={options} />
        </div>
    );
};