export const SelectorRango = ({radioKm, setRadioKm}) => {

    const MIN = 1000;
    const MAX = 5000;

    const handleManejarCambio = (e) => {
        setRadioKm(Number(e.target.value));
    };

    return (
    <div className="w-full max-w-sm p-2 bg-white rounded-xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-700">
                Radio de Análisis 
            </label>
            <span className="px-3 py-1 bg-blue-50 text-blue-600 font-bold rounded-lg text-sm">
                {radioKm.toLocaleString('es-MX')} km
            </span>
        </div>

        <input
            type="range"
            min={MIN}
            max={MAX}
            step={500}
            value={radioKm}
            onChange={handleManejarCambio}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />

        <div className="flex justify-between text-xs text-gray-400 font-medium">
            <span>1,000 km</span>
            <span>3,000 km</span>
            <span>5,000 km</span>
        </div>
    </div>
)};