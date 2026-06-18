import { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, FeatureGroup, GeoJSON } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { Layers, Crosshair, BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
// @ts-ignore
import shp from 'shpjs';
import * as turf from '@turf/turf';
import { NDVIOverlay } from '@/components/map/ndvi-overlay';
import { Badge } from '@/components/ui/badge';

const getLegendGradient = (index: string) => {
    switch (index) {
        case 'NDVI': return 'from-[#a16207] via-[#facc15] to-[#22c55e]'; // Brown to Yellow to Green
        case 'EVI': return 'from-[#f97316] via-[#eab308] to-[#22c55e]';  // Orange to Yellow to Green
        case 'NDMI': return 'from-[#a16207] via-[#facc15] to-[#0d9488]'; // Brown to Yellow to Teal
        case 'NBR': return 'from-[#dc2626] via-[#f59e0b] to-[#22c55e]';  // Red to Orange to Green
        default: return 'from-red-500 via-yellow-500 to-green-500';
    }
};

const getLegendLabels = (index: string) => {
    switch (index) {
        case 'NDMI': return ['Dry / Stressed', 'Moist / Healthy'];
        case 'NBR': return ['Burned', 'Unburned'];
        default: return ['Low Veg', 'High Veg'];
    }
};

const getPixelColor = (index: string, val: number) => {
    val = Math.max(0, Math.min(1, val));
    let colors: [number[], number[], number[]];
    
    if (index === 'NDVI') colors = [[161, 98, 7], [250, 204, 21], [34, 197, 94]];
    else if (index === 'EVI') colors = [[249, 115, 22], [234, 179, 8], [34, 197, 94]];
    else if (index === 'NDMI') colors = [[161, 98, 7], [250, 204, 21], [13, 148, 136]];
    else if (index === 'NBR') colors = [[220, 38, 38], [245, 158, 11], [34, 197, 94]];
    else colors = [[220, 38, 38], [250, 204, 21], [34, 197, 94]];
    
    let c1, c2, t;
    if (val < 0.5) {
        c1 = colors[0]; c2 = colors[1]; t = val * 2;
    } else {
        c1 = colors[1]; c2 = colors[2]; t = (val - 0.5) * 2;
    }
    
    const r = Math.round(c1[0] + (c2[0] - c1[0]) * t);
    const g = Math.round(c1[1] + (c2[1] - c1[1]) * t);
    const b = Math.round(c1[2] + (c2[2] - c1[2]) * t);
    
    return `rgb(${r},${g},${b})`;
};

export default function MonitoringPage() {
    const [aoiOptions, setAoiOptions] = useState('draw'); 
    const [index, setIndex] = useState('NDVI');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    
    const [geometry, setGeometry] = useState<any>(null);
    const [bounds, setBounds] = useState<L.LatLngBounds | null>(null);
    const [mockRaster, setMockRaster] = useState<any>(null);
    
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any>(null);

    const mapRef = useRef<any>(null);
    const featureGroupRef = useRef<any>(null);
    const [opacity, setOpacity] = useState<number>(0.8);

    useEffect(() => {
        if (geometry && mapRef.current) {
            try {
                const layer = L.geoJSON(geometry);
                const bnds = layer.getBounds();
                if (bnds.isValid()) {
                    setBounds(bnds);
                    mapRef.current.fitBounds(bnds, { padding: [50, 50] });
                }
            } catch (e) { console.error("Could not bounds", e); }
        } else {
            setBounds(null);
            setMockRaster(null);
        }
    }, [geometry]);

    useEffect(() => {
        if (results && geometry) {
            generateMockRaster(geometry, results.stats, results.index);
        }
    }, [results]);

    const fitMapToAOI = () => {
        if (bounds && mapRef.current) mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    };

    const handleCreated = (e: any) => {
        const layer = e.layer;
        if (featureGroupRef.current) {
            featureGroupRef.current.clearLayers();
            featureGroupRef.current.addLayer(layer);
        }
        setGeometry(layer.toGeoJSON().geometry);
        setResults(null);
    };

    const handleDeleted = () => {
        setGeometry(null);
        setBounds(null);
        setResults(null);
        setMockRaster(null);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setLoading(true);
            const arrayBuffer = await file.arrayBuffer();
            const geojson: any = await shp(arrayBuffer);
            const geom = Array.isArray(geojson) ? geojson[0].features[0].geometry : geojson.features[0].geometry;
            if (featureGroupRef.current) featureGroupRef.current.clearLayers();
            setGeometry(geom);
            setAoiOptions('upload');
            setResults(null);
        } catch (error) {
            alert('Error parsing uploaded file.');
        } finally {
            setLoading(false);
        }
    };

    const generateMockRaster = (geom: any, stats: any, currentIndex: string) => {
        try {
            const bbox = turf.bbox(geom);
            const width = turf.distance([bbox[0], bbox[1]], [bbox[2], bbox[1]], { units: 'kilometers' });
            const height = turf.distance([bbox[0], bbox[1]], [bbox[0], bbox[3]], { units: 'kilometers' });
            
            // Aiming for ~2500 cells (50x50) so it's dense enough to look like a raster, but won't crash Leaflet SVG renderer.
            const cellSide = Math.max(width, height) / 50; 

            const grid = turf.squareGrid(bbox, cellSide, { units: 'kilometers' });
            const poly = turf.feature(geom);
            
            const clippedGrid = {
                type: 'FeatureCollection',
                features: [] as any[]
            };
            
            const stdDev = stats.stdDev || 0.1;

            turf.featureEach(grid, (cell) => {
                const center = turf.center(cell);
                // Check if pixel center is inside AOI mask
                if (turf.booleanPointInPolygon(center, poly)) {
                    // Box-Muller transform for realistic normal noise distribution around the mean
                    const u = 1 - Math.random();
                    const v = Math.random();
                    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
                    
                    const cellVal = stats.mean + (z * stdDev);
                    cell.properties = { fill: getPixelColor(currentIndex, cellVal) };
                    clippedGrid.features.push(cell);
                }
            });

            setMockRaster(clippedGrid);
        } catch (e) {
            console.error("Failed to generate pseudo-raster:", e);
        }
    };

    const runAnalysis = async () => {
        if (!geometry) return alert('Select or upload an AOI first.');
        if (!dateFrom || !dateTo) return alert('Select date range.');

        setLoading(true);
        setResults(null);
        setMockRaster(null);

        try {
            const response = await fetch(`http://localhost:5000/api/monitoring/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ index, geometry, dateFrom, dateTo })
            });

            if (!response.ok) throw new Error('API failed');
            const data = await response.json();
            setResults(data);

        } catch (error) {
            alert('Analysis failed. Check backend connection.');
        } finally {
            setLoading(false);
        }
    };

    // Styling logic for the clipped simulated raster grid
    const gridStyle = (feature: any) => {
        return {
            fillColor: feature.properties.fill,
            weight: 0, // No stroke so it blends seamlessly like a raster!
            fillOpacity: opacity,
            interactive: false // Don't block map panning / clicks!
        };
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] p-4 md:p-6 gap-6 bg-muted/20 overflow-y-auto">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">Forest Monitoring & Analysis</h2>
                        {results && (
                            <Badge variant={results.source === 'MOCK' ? 'outline' : 'default'} className={results.source === 'MOCK' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-green-600'}>
                                {results.source === 'MOCK' ? 'DEMO MODE' : results.source}
                            </Badge>
                        )}
                    </div>
                    <p className="text-muted-foreground">Integrated mapping, statistical summary, and dynamic interpretation.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[500px]">
                
                <div className="col-span-1 bg-card rounded-xl border shadow-sm p-5 space-y-6 flex flex-col justify-between">
                    <div className="space-y-5">
                        <h3 className="font-semibold text-lg flex items-center gap-2 border-b pb-2">
                            <Layers className="h-5 w-5 text-primary" /> Analysis Parameters
                        </h3>
                        
                        <div className="space-y-2">
                            <Label>Forest Index</Label>
                            <select 
                                value={index} 
                                onChange={(e) => setIndex(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                            >
                                <option value="NDVI">NDVI (Vegetation Vigor)</option>
                                <option value="EVI">EVI (Enhanced Vegetation)</option>
                                <option value="NDMI">NDMI (Canopy Moisture)</option>
                                <option value="NBR">NBR (Burn Ratio/Disturbance)</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label>AOI Selection</Label>
                            <select 
                                value={aoiOptions} 
                                onChange={(e) => setAoiOptions(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                            >
                                <option value="draw">Draw Polygon on Map</option>
                                <option value="upload">Upload Shapefile / GeoJSON</option>
                            </select>
                        </div>

                        {aoiOptions === 'upload' && (
                            <div className="space-y-2">
                                <Label>File</Label>
                                <Input type="file" accept=".zip,.geojson" onChange={handleFileUpload} />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Date Range</Label>
                            <div className="flex gap-2">
                                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <Button onClick={runAnalysis} disabled={loading || !geometry} size="lg" className="w-full">
                        {loading ? 'Processing Imagery...' : 'Run Analysis'}
                    </Button>
                </div>

                <div className="col-span-1 lg:col-span-3 bg-card rounded-xl border shadow-sm relative overflow-hidden flex flex-col h-[500px] lg:h-auto">
                    
                    <div className="absolute top-4 right-4 z-[400] flex gap-2">
                        <Button variant="secondary" size="sm" onClick={fitMapToAOI} className="bg-white/90 text-black shadow hover:bg-white" disabled={!bounds}>
                            <Crosshair className="h-4 w-4 mr-2" /> Fit AOI
                        </Button>
                        {results && (
                            <div className="bg-white/90 p-1.5 rounded-md shadow border flex items-center gap-2 px-3">
                                <span className="text-xs font-semibold text-black">Overlay Opacity</span>
                                <input 
                                    type="range" min="0" max="1" step="0.1" 
                                    value={opacity} 
                                    onChange={(e) => setOpacity(parseFloat(e.target.value))}
                                    className="w-20 cursor-pointer accent-primary"
                                />
                            </div>
                        )}
                    </div>

                    <MapContainer center={[-6.3690, 34.8888]} zoom={6} zoomControl={false} style={{ flex: 1, width: "100%" }} ref={mapRef}>
                        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                        
                        <FeatureGroup ref={featureGroupRef}>
                            {aoiOptions === 'draw' && (
                                <EditControl
                                    position="topleft"
                                    onCreated={handleCreated}
                                    onDeleted={handleDeleted}
                                    draw={{ polyline: false, circle: false, circlemarker: false, marker: false }}
                                />
                            )}
                        </FeatureGroup>

                        {/* Real Satellite NDVI Imagery if available */}
                        {results?.imageUrl && results?.pixelData && bounds && (
                            <NDVIOverlay 
                                imageUrl={results.imageUrl}
                                bounds={bounds}
                                pixelData={results.pixelData}
                                opacity={opacity}
                            />
                        )}

                        {/* Pixelated Simulated Raster layer strictly clipped inside AOI! (Fallback if no real imagery) */}
                        {mockRaster && !results?.imageUrl && (
                            <GeoJSON 
                                key={`raster-${results?.index}-${opacity}`} 
                                data={mockRaster} 
                                style={gridStyle} 
                            />
                        )}

                        {/* Outlined AOI Boundary ONLY (Stroke ONLY, No Fill). It goes ON TOP of the raster. */}
                        {geometry && (
                            <GeoJSON 
                                key={`outline-${Date.now()}`}
                                data={geometry} 
                                style={{ color: '#ffffff', weight: 4, fillOpacity: 0, opacity: 0.9, dashArray: '4' }} 
                            />
                        )}

                        {results && (
                            <div className="absolute bottom-6 left-6 z-[400] bg-white/95 p-4 rounded-xl shadow-lg border w-64 text-black backdrop-blur-sm">
                                <h4 className="font-bold text-sm mb-3 text-center uppercase tracking-wider">{results.index} Layer</h4>
                                <div className={`h-3 w-full rounded-full mb-2 bg-gradient-to-r ${getLegendGradient(results.index)}`} style={{ opacity }} />
                                <div className="flex justify-between text-xs font-bold text-muted-foreground">
                                    <span>{getLegendLabels(results.index)[0]}</span>
                                    <span>{getLegendLabels(results.index)[1]}</span>
                                </div>
                            </div>
                        )}
                    </MapContainer>
                </div>
            </div>

            {results && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                    
                    <div className="bg-card p-5 rounded-xl border shadow-sm flex flex-col justify-center">
                        <h3 className="font-semibold text-lg flex items-center gap-2 mb-4 border-b pb-2">
                            <Activity className="h-5 w-5 text-primary" /> Key Statistics
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-muted p-3 rounded-lg text-center">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Mean Value</p>
                                <p className="text-2xl font-black text-primary">{results.stats.mean.toFixed(3)}</p>
                            </div>
                            <div className="bg-muted p-3 rounded-lg text-center">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">AOI Area</p>
                                <p className="text-2xl font-black">{results.stats.areaHa} <span className="text-sm font-normal">ha</span></p>
                            </div>
                            <div className="bg-muted p-3 rounded-lg text-center">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Min / Max</p>
                                <p className="text-lg font-bold">{results.stats.min.toFixed(2)} - {results.stats.max.toFixed(2)}</p>
                            </div>
                            <div className="bg-muted p-3 rounded-lg text-center">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Std Deviation</p>
                                <p className="text-lg font-bold">±{results.stats.stdDev.toFixed(3)}</p>
                            </div>
                        </div>
                        <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg text-center">
                            <p className="text-sm text-primary font-bold uppercase tracking-wider">Classification</p>
                            <p className="text-lg font-black text-foreground">{results.classificationSummary}</p>
                        </div>
                    </div>

                    <div className="bg-card p-5 rounded-xl border shadow-sm">
                        <h3 className="font-semibold text-sm flex items-center gap-2 mb-4 text-muted-foreground uppercase tracking-wider">
                            <BarChart3 className="h-4 w-4" /> Value Distribution
                        </h3>
                        <div className="h-[220px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={results.graphs.distribution} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                    <XAxis dataKey="name" tick={{fontSize: 10}} interval="preserveStartEnd" />
                                    <YAxis tick={{fontSize: 10}} />
                                    <Tooltip contentStyle={{borderRadius: '8px', fontSize: '12px'}} />
                                    <Bar dataKey="frequency" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-card p-5 rounded-xl border shadow-sm">
                        <h3 className="font-semibold text-sm flex items-center gap-2 mb-2 text-muted-foreground uppercase tracking-wider">
                            <PieChartIcon className="h-4 w-4" /> Class Summary
                        </h3>
                        <div className="h-[220px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={results.graphs.classes}
                                        cx="50%" cy="45%"
                                        innerRadius={50} outerRadius={80}
                                        paddingAngle={2} dataKey="value"
                                    >
                                        {results.graphs.classes.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{borderRadius: '8px', fontSize: '12px'}} />
                                    <Legend verticalAlign="bottom" height={20} iconType="circle" wrapperStyle={{fontSize: '11px', fontWeight: 'bold'}} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>
            )}

            {results && (
                <div className="bg-card p-6 rounded-xl border border-l-4 border-l-primary shadow-sm animate-in slide-in-from-bottom-8 duration-700 delay-150 mb-8">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-2">Integrated Result Narrative</h3>
                    <p className="text-lg leading-relaxed text-foreground/90 font-medium">
                        {results.interpretation}
                    </p>
                </div>
            )}
        </div>
    );
}
