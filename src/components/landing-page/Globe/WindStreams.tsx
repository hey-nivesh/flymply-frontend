
import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const WIND_CONFIGS = [
    // Northern jet stream bands
    { latCenter: 45, latAmplitude: 8, lngStart: -180, lngSpan: 360, radius: 1.018, segments: 80, speed: 0.4 },
    { latCenter: 50, latAmplitude: 12, lngStart: -120, lngSpan: 300, radius: 1.02, segments: 70, speed: 0.35 },
    { latCenter: 40, latAmplitude: 6, lngStart: -60, lngSpan: 280, radius: 1.016, segments: 65, speed: 0.45 },
    // Southern jet stream
    { latCenter: -45, latAmplitude: 10, lngStart: -180, lngSpan: 360, radius: 1.019, segments: 80, speed: 0.38 },
    { latCenter: -50, latAmplitude: 7, lngStart: -100, lngSpan: 320, radius: 1.017, segments: 75, speed: 0.42 },
    // Trade winds (equatorial)
    { latCenter: 10, latAmplitude: 4, lngStart: -180, lngSpan: 360, radius: 1.015, segments: 70, speed: -0.3 },
    { latCenter: -10, latAmplitude: 5, lngStart: -150, lngSpan: 340, radius: 1.014, segments: 65, speed: -0.28 },
    { latCenter: 15, latAmplitude: 3, lngStart: -80, lngSpan: 260, radius: 1.016, segments: 60, speed: -0.32 },
    // Polar winds
    { latCenter: 65, latAmplitude: 5, lngStart: -180, lngSpan: 360, radius: 1.015, segments: 60, speed: 0.25 },
    { latCenter: -60, latAmplitude: 6, lngStart: -180, lngSpan: 360, radius: 1.016, segments: 65, speed: 0.3 },
    // Additional mid-latitude
    { latCenter: 35, latAmplitude: 9, lngStart: 20, lngSpan: 300, radius: 1.021, segments: 70, speed: 0.36 },
    { latCenter: -35, latAmplitude: 8, lngStart: -60, lngSpan: 280, radius: 1.018, segments: 60, speed: 0.33 },
];

function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
    );
}

function WindStream({ config, index }: { config: typeof WIND_CONFIGS[0]; index: number }) {
    const lineObj = useMemo(() => {
        const pts: THREE.Vector3[] = [];
        const seed = index * 137.5;

        for (let i = 0; i < config.segments; i++) {
            const t = i / config.segments;
            const lng = config.lngStart + t * config.lngSpan;
            const wave = Math.sin(t * Math.PI * 2 + seed * 0.1) * config.latAmplitude
                + Math.sin(t * Math.PI * 4.5 + seed * 0.3) * (config.latAmplitude * 0.3)
                + Math.sin(t * Math.PI * 7 + seed * 0.7) * (config.latAmplitude * 0.1);
            const lat = config.latCenter + wave;
            pts.push(latLngToVector3(lat, lng, config.radius));
        }

        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        const mat = new THREE.LineBasicMaterial({
            color: '#88ccee',
            transparent: true,
            opacity: 0.12,
        });
        return new THREE.Line(geo, mat);
    }, [config, index]);

    useFrame(({ clock }) => {
        const mat = lineObj.material as THREE.LineBasicMaterial;
        const pulse = Math.sin(clock.getElapsedTime() * config.speed + index * 1.5);
        mat.opacity = 0.06 + pulse * 0.06;
    });

    return <primitive object={lineObj} />;
}

export default function WindStreams() {
    return (
        <group>
            {WIND_CONFIGS.map((config, i) => (
                <WindStream key={i} config={config} index={i} />
            ))}
        </group>
    );
}
