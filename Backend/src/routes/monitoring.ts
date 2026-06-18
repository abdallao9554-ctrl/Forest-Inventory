import express from 'express';
import { getAccessToken, getRemoteSensingIndex } from '../services/sentinel';
import dotenv from 'dotenv';
import * as GeoTIFF from 'geotiff';
import sharp from 'sharp';

dotenv.config();

const router = express.Router();

function getClassificationThresholds(index: string) {
    switch (index) {
        case 'NDVI':
        case 'EVI':
            return {
                low: 0.3,
                moderate: 0.6,
                labels: ['Low Vegetation', 'Moderate Vegetation', 'High Vegetation'],
                colors: ['#a16207', '#facc15', '#22c55e']
            };
        case 'NDMI':
            return {
                low: 0.0,
                moderate: 0.4,
                labels: ['Low Moisture', 'Moderate Moisture', 'High Moisture'],
                colors: ['#a16207', '#facc15', '#0d9488']
            };
        case 'NBR':
            return {
                low: 0.1,
                moderate: 0.5,
                labels: ['Disturbed', 'Transitional', 'Healthy'],
                colors: ['#dc2626', '#f59e0b', '#22c55e']
            };
        default:
            return {
                low: 0.3,
                moderate: 0.6,
                labels: ['Low', 'Moderate', 'High'],
                colors: ['#ef4444', '#f59e0b', '#22c55e']
            };
    }
}

async function processRemoteSensingData(buffer: any, index: string) {
    try {
        const tiff = await GeoTIFF.fromArrayBuffer(buffer);
        const image = await tiff.getImage();
        const rasters = await image.readRasters();
        const width = image.getWidth();
        const height = image.getHeight();
        const data = rasters[0] as Float32Array;

        let sum = 0;
        let count = 0;
        let min = Infinity;
        let max = -Infinity;
        const pixelData: number[][] = [];

        const thresholds = getClassificationThresholds(index);
        let lowCount = 0;
        let moderateCount = 0;
        let highCount = 0;

        for (let y = 0; y < height; y++) {
            const row: number[] = [];
            for (let x = 0; x < width; x++) {
                const val = data[y * width + x];
                if (!isNaN(val)) {
                    sum += val;
                    count++;
                    if (val < min) min = val;
                    if (val > max) max = val;

                    if (val < thresholds.low) lowCount++;
                    else if (val < thresholds.moderate) moderateCount++;
                    else highCount++;
                }
                row.push(val);
            }
            pixelData.push(row);
        }

        const mean = count > 0 ? sum / count : 0;
        
        let sqDiffSum = 0;
        for (let i = 0; i < data.length; i++) {
            if (!isNaN(data[i])) {
                sqDiffSum += Math.pow(data[i] - mean, 2);
            }
        }
        const stdDev = count > 0 ? Math.sqrt(sqDiffSum / count) : 0;

        // Create Real Histogram (10 bins)
        const histBins = 10;
        const histogram: { name: string, frequency: number }[] = [];
        const hMin = min === Infinity ? 0 : min;
        const hMax = max === -Infinity ? 1 : max;
        const step = (hMax - hMin) / histBins;
        
        for (let b = 0; b < histBins; b++) {
            const binStart = hMin + b * step;
            const binEnd = binStart + step;
            const freq = data.filter(v => v >= binStart && v < binEnd).length;
            histogram.push({
                name: `${binStart.toFixed(2)}-${binEnd.toFixed(2)}`,
                frequency: freq
            });
        }

        const classDistribution = [
            { name: thresholds.labels[0], value: Math.round((lowCount/count) * 100) || 0, color: thresholds.colors[0] },
            { name: thresholds.labels[1], value: Math.round((moderateCount/count) * 100) || 0, color: thresholds.colors[1] },
            { name: thresholds.labels[2], value: Math.round((highCount/count) * 100) || 0, color: thresholds.colors[2] },
        ];

        // Generate Visual PNG
        const rgba = new Uint8ClampedArray(width * height * 4);
        for (let i = 0; i < data.length; i++) {
            const val = data[i];
            const idx = i * 4;
            
            if (isNaN(val)) {
                rgba[idx] = 0; rgba[idx+1] = 0; rgba[idx+2] = 0; rgba[idx+3] = 0;
                continue;
            }

            const norm = (val - hMin) / (hMax - hMin);
            
            // Apply Index-specific colors or general ramp
            if (norm < 0.5) {
                rgba[idx] = 255;
                rgba[idx+1] = Math.round(norm * 2 * 255);
                rgba[idx+2] = 0;
            } else {
                rgba[idx] = Math.round((1 - (norm - 0.5) * 2) * 255);
                rgba[idx+1] = 255;
                rgba[idx+2] = 0;
            }
            rgba[idx+3] = 255;
        }

        const pngBuffer = await sharp(Buffer.from(rgba.buffer), {
            raw: { width, height, channels: 4 }
        }).png().toBuffer();

        return {
            stats: { 
                mean, 
                min: hMin, 
                max: hMax, 
                stdDev, 
                areaHa: Math.round(count * 0.01)
            },
            pixelData,
            imageUrl: `data:image/png;base64,${pngBuffer.toString('base64')}`,
            histogram,
            classDistribution
        };
    } catch (e) {
        console.error('Error processing TIFF:', e);
        throw e;
    }
}

function generateInterpretation(index: string, mean: number) {
    if (index === 'NDVI' || index === 'EVI') {
        if (mean > 0.6) return "Vegetation condition is generally high across the selected forest block. The canopy appears dense and healthy with strong photosynthetic activity.";
        if (mean > 0.3) return "Moderate vegetation detected. This suggests possible sparse canopy, transition zones, or seasonal variation in leaf area.";
        return "Low vegetation vigor detected, indicating possible disturbance, bare ground, or severe stress across the majority of the Area of Interest.";
    } else if (index === 'NDMI') {
        if (mean > 0.4) return "High moisture content in the canopy, indicating healthy, stress-free trees with sufficient water supply.";
        if (mean > 0) return "Moisture stress appears moderate. The forest might be entering a dry season or experiencing localized water deficits.";
        return "Severe water stress detected. There is a high risk of drought impact or declining forest health in this zone.";
    } else if (index === 'NBR') {
        if (mean > 0.5) return "Healthy unburned vegetation dominates the selected AOI, showing no recent signs of fire disturbance.";
        if (mean > 0.1) return "Low severity burn or recovering area detected. Vegetation may be regenerating from a past disturbance event.";
        return "Possible recent disturbance or burn area detected in the canopy zones. Immediate field verification is recommended.";
    }
    return "Analysis complete.";
}

router.post('/analyze', async (req, res) => {
    try {
        const { index, geometry } = req.body;
        if (!index || !geometry) {
            return res.status(400).json({ error: 'Missing required parameters.' });
        }

        let realData: any = null;
        let source = "MOCK";

        if (process.env.SENTINEL_CLIENT_ID && process.env.SENTINEL_CLIENT_ID !== 'your_client_id_here') {
            try {
                const token = await getAccessToken(process.env.SENTINEL_CLIENT_ID, process.env.SENTINEL_CLIENT_SECRET!);
                const from = req.body.dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
                const to = req.body.dateTo || new Date().toISOString();
                
                const buffer = await getRemoteSensingIndex(geometry, from, to, token, index);
                realData = await processRemoteSensingData(buffer, index);
                source = "SENTINEL-2 L2A";
            } catch (err: any) {
                console.error('Sentinel Hub real call failed, falling back to mock:', err.message);
            }
        }

        if (!realData) {
            // Mock fallback
            await new Promise(resolve => setTimeout(resolve, 1000));
            const mean = Math.random() * (0.8 - 0.1) + 0.1;
            const min = Math.max(0, mean - 0.2);
            const max = Math.min(1, mean + 0.2);
            
            const stats = { mean, min, max, stdDev: 0.1, areaHa: 150 };
            
            // Use static interpretation and generate mock graphs
            // For simplicity, we reuse the existing mock generator logic if needed
            // But user wants clearly labelled mock mode
            
            // Better mock graphs for consistency
            const histogram = Array.from({length: 10}, (_, i) => ({
                name: `${(min + i*(max-min)/10).toFixed(2)}`,
                frequency: Math.floor(Math.random() * 50 + 10)
            }));
            
            const thresholds = getClassificationThresholds(index);
            const classDistribution = [
                { name: thresholds.labels[0], value: 30, color: thresholds.colors[0] },
                { name: thresholds.labels[1], value: 40, color: thresholds.colors[1] },
                { name: thresholds.labels[2], value: 30, color: thresholds.colors[2] },
            ];

            return res.json({
                success: true,
                source,
                index,
                stats,
                classificationSummary: thresholds.labels[1],
                interpretation: generateInterpretation(index, mean) + " (DEMO MODE)",
                graphs: {
                    distribution: histogram,
                    classes: classDistribution
                }
            });
        }

        return res.json({
            success: true,
            source,
            index,
            stats: realData.stats,
            imageUrl: realData.imageUrl,
            pixelData: realData.pixelData,
            classificationSummary: realData.classDistribution.reduce((prev: any, current: any) => (prev.value > current.value) ? prev : current).name,
            interpretation: generateInterpretation(index, realData.stats.mean),
            graphs: {
                distribution: realData.histogram,
                classes: realData.classDistribution
            }
        });

    } catch (error) {
        console.error('Error in analysis:', error);
        res.status(500).json({ error: 'Failed analysis.' });
    }
});

export default router;
