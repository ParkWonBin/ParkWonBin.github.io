import { open } from "shapefile";
import AdmZip from "adm-zip";
import fs from "fs";
import path from "path";
import proj4 from "proj4";

const DATA_DIR = "c:\\tmp\\data";
const OUT_DIR = "c:\\tmp\\geojson";

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// Get all zip files
const zipFiles = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.zip'));

for (const zipFile of zipFiles) {
    console.log(`\n=== Processing: ${zipFile} ===`);
    
    // Extract year from filename
    const yearMatch = zipFile.match(/(\d{4})/);
    const year = yearMatch ? yearMatch[1] : 'unknown';
    
    // Create temp extraction directory
    const extractDir = path.join(OUT_DIR, `_temp_${year}`);
    if (!fs.existsSync(extractDir)) fs.mkdirSync(extractDir, { recursive: true });
    
    try {
        const zip = new AdmZip(path.join(DATA_DIR, zipFile));
        zip.extractAllTo(extractDir, true);
        
        // Find .shp files
        const allFiles = fs.readdirSync(extractDir);
        const shpFiles = allFiles.filter(f => f.toLowerCase().endsWith('.shp'));
        
        console.log(`  Found SHP files: ${shpFiles.join(', ')}`);
        
        // Read PRJ file for coordinate system info
        const prjFiles = allFiles.filter(f => f.toLowerCase().endsWith('.prj'));
        let prjContent = null;
        if (prjFiles.length > 0) {
            prjContent = fs.readFileSync(path.join(extractDir, prjFiles[0]), 'utf-8');
            console.log(`  PRJ: ${prjContent.substring(0, 100)}...`);
        }
        
        for (const shpFile of shpFiles) {
            const shpPath = path.join(extractDir, shpFile);
            const dbfFile = shpFile.replace(/\.shp$/i, '.dbf');
            const dbfPath = path.join(extractDir, dbfFile);
            
            console.log(`  Converting: ${shpFile}`);
            
            const features = [];
            const source = await open(shpPath, dbfPath, { encoding: "euc-kr" });
            
            let result;
            while (!(result = await source.read()).done) {
                const feature = result.value;
                
                // Transform coordinates if needed (Korean coordinate systems to WGS84)
                if (prjContent && feature.geometry) {
                    try {
                        // Define source projection from PRJ content
                        const sourceProj = proj4.Proj(prjContent);
                        
                        const transformCoords = (coords) => {
                            if (typeof coords[0] === 'number') {
                                // It's a coordinate pair [x, y]
                                const [lng, lat] = proj4(prjContent, 'EPSG:4326', coords);
                                return [lng, lat];
                            }
                            return coords.map(transformCoords);
                        };
                        
                        feature.geometry.coordinates = transformCoords(feature.geometry.coordinates);
                    } catch (e) {
                        // If projection fails, coordinates might already be in WGS84
                        console.log(`    Projection transform note: ${e.message}`);
                    }
                }
                
                features.push(feature);
            }
            
            const geojson = {
                type: "FeatureCollection",
                features: features
            };
            
            const outName = `flood_${year}.geojson`;
            const outPath = path.join(OUT_DIR, outName);
            fs.writeFileSync(outPath, JSON.stringify(geojson));
            
            console.log(`  Output: ${outName} (${features.length} features)`);
        }
    } catch (err) {
        console.error(`  Error: ${err.message}`);
    }
    
    // Cleanup temp directory
    fs.rmSync(extractDir, { recursive: true, force: true });
}

console.log("\n=== Done! ===");
console.log("GeoJSON files in:", OUT_DIR);
