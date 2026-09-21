import Map, { NavigationControl, Popup, Source, Layer } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useMemo, useState } from 'react';
import { fetchDatosCoordenadas } from '../api/api';

export const MapView = (
        {ubicacion,             // ubicacionActiva 
        setUbicacionActiva, 
        consulta,               // ConsultaDENUE
        data}) => {

    const [viewport, setViewport] = useState({
        latitude: 22.114594,
        longitude: -103.265513,
        zoom: 13
    });

    const [popupInfo, setPopupInfo] = useState(null);
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        if (ubicacion && ubicacion.coordenadas) {
        const [lat, lon] = ubicacion.coordenadas.split(",");
        setViewport({
            latitude: parseFloat(lat),
            longitude: parseFloat(lon),
            zoom: 14,
            transitionDuration: 1000
        });
        }
    }, [ubicacion]);
    
    const buscarDatosPorCoordenadas = async (latitude, longitude) => {
        try {
            setCargando(true);
            const data = await fetchDatosCoordenadas(latitude, longitude);
            setUbicacionActiva(data);
        } catch (error) {
            alert(error.message); 
        } finally {
            setCargando(false);
        }
    };

    const datosGeoJson = useMemo(() => {
        const competidores = data?.competidores || [];
        const comercios = data?.comercios || [];
        const features = [];

        competidores.forEach(c => {
            const lat = parseFloat(c.latitud);
            const lon = parseFloat(c.longitud);

            if (!isNaN(lat) && !isNaN(lon)) {
                features.push({
                    type: "Feature",
                    properties: { ...c, tipo: "competidor" },
                    geometry: { type: "Point", coordinates: [lon, lat] }
                });
            }
        });

        comercios.forEach(c => {
            const lat = parseFloat(c.latitud);
            const lon = parseFloat(c.longitud);

            if (!isNaN(lat) && !isNaN(lon)) {
                features.push({
                    type: "Feature",
                    properties: { ...c, tipo: "comercio" },
                    geometry: { type: "Point", coordinates: [lon, lat] }
                });
            }
        });

        return { type: "FeatureCollection", features };
    }, [data]);

    const capaComerciosStyle = {
        id: "capa-comercios",
        type: "circle",
        filter: ["==", ["get", "tipo"], "comercio"],
        paint: {
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 12, 3, 16, 7],
            "circle-color": "#3b82f6",
            "circle-stroke-width": 1.5,
            "circle-stroke-color": "#ffffff"
        }
    };

    const capaCompetidoresStyle = {
        id: "capa-competidores",
        type: "circle",
        filter: ["==", ["get", "tipo"], "competidor"],
        paint: {
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 12, 4, 16, 9],
            "circle-color": "#dc2626",
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff"
        }
    };

    const handleMapClicks = (event) => {
        const features = event.target.queryRenderedFeatures(event.point, {
            layers: ["capa-comercios", "capa-competidores"]
        });

        if (features.length > 0) {
            const featureSeleccionada = features[0];
            const [lon, lat] = featureSeleccionada.geometry.coordinates;
            
            setPopupInfo({
                ...featureSeleccionada.properties,
                latitud: lat,
                longitud: lon
            });
            return;
        }

        setPopupInfo(null); 

        const { lng, lat } = event.lngLat;
        const latFija = parseFloat(lat.toFixed(6));
        const lngFija = parseFloat(lng.toFixed(6));
        
        //!consulta(latFija, lngFija); 
        buscarDatosPorCoordenadas(latFija, lngFija);
    };
    
    return (
        <>
        <div className="w-full h-full relative">

            {cargando && (
                <div className="absolute top-4 left-4 z-50 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md flex items-center space-x-2 border border-gray-200">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-semibold text-gray-700">Cargando datos...</span>
                </div>
            )}

            <Map
                onMove={evt => setViewport(evt.viewState)}
                {...viewport}
                mapLib={maplibregl}
                // mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
                mapStyle="https://api.maptiler.com/maps/streets-v2/style.json?key=uItntyYxuDtpzNDScXiv"
                onClick={handleMapClicks}
                interactiveLayerIds={["capa-comercios", "capa-competidores"]}
                style={{ width: '100%', height: '100%' }}
            >
                <NavigationControl position="top-right" />

                <Source type="geojson" data={datosGeoJson}>
                    <Layer {...capaComerciosStyle} />
                    <Layer {...capaCompetidoresStyle} />
                </Source>

                {popupInfo && (
                    <Popup
                        latitude={popupInfo.latitud}
                        longitude={popupInfo.longitud}
                        anchor="top"
                        onClose={() => setPopupInfo(null)}
                        closeOnClick={false}
                    >
                        <div className="p-2 max-w-xs font-sans">
                            <h4 className="font-bold text-sm text-[#031636] border-b pb-1 mb-1">
                                {popupInfo.nombre}
                            </h4>
                            <p className="text-xs text-gray-600 font-medium mb-1">{popupInfo.giro}</p>
                            <p className="text-[11px] text-gray-400 mb-2">{popupInfo.direccion}</p>
                            <div className="flex justify-between items-center bg-gray-50 p-1.5 rounded-lg border">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Personal:</span>
                                <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-semibold">
                                    {popupInfo.personal}
                                </span>
                            </div>
                        </div>
                    </Popup>
                )}
            </Map>
        </div>
    </>
)}