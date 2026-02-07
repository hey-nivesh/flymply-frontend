
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FlightRoute {
    start: [number, number];
    end: [number, number];
    color: string;
}

const ROUTE_COLORS = ['#38bdf8', '#2dd4bf', '#f59e0b', '#818cf8', '#f472b6'];

function generateRandomRoutes(count: number): FlightRoute[] {
    const routes: FlightRoute[] = [];
    for (let i = 0; i < count; i++) {
        const startLat = (Math.random() * 130) - 60;
        const startLng = (Math.random() * 360) - 180;

        let endLat, endLng;
        do {
            endLat = (Math.random() * 130) - 60;
            endLng = (Math.random() * 360) - 180;
        } while (Math.abs(startLat - endLat) < 10 && Math.abs(startLng - endLng) < 10);

        routes.push({
            start: [startLat, startLng],
            end: [endLat, endLng],
            color: ROUTE_COLORS[Math.floor(Math.random() * ROUTE_COLORS.length)],
        });
    }
    return routes;
}

const ROUTES: FlightRoute[] = generateRandomRoutes(100);

function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
    );
}

function createArcCurve(start: [number, number], end: [number, number], radius: number) {
    const startV = latLngToVector3(start[0], start[1], radius);
    const endV = latLngToVector3(end[0], end[1], radius);
    const mid = new THREE.Vector3().addVectors(startV, endV).multiplyScalar(0.5);
    const dist = startV.distanceTo(endV);
    mid.normalize().multiplyScalar(radius + dist * 0.35);
    return new THREE.QuadraticBezierCurve3(startV, mid, endV);
}

function createPlaneGeometry(): THREE.BufferGeometry {
    const geo = new THREE.BufferGeometry();

    const vertices = new Float32Array([
        // Fuselage (elongated diamond)
        0, 0, 0.018,     // nose
        -0.003, 0, -0.012, // left back
        0.003, 0, -0.012,  // right back

        0, 0.002, 0.008, // top mid
        0, 0, 0.018,     // nose
        0, 0, -0.012,    // tail

        0, -0.001, 0.005, // bottom mid
        0, 0, 0.018,      // nose
        0, 0, -0.012,     // tail

        // Wings
        0, 0.001, 0.002,    // wing root front
        -0.022, 0, -0.004,  // left wingtip
        0, 0.001, -0.006,   // wing root back

        0, 0.001, 0.002,    // wing root front
        0.022, 0, -0.004,   // right wingtip
        0, 0.001, -0.006,   // wing root back

        // Tail fin (vertical)
        0, 0, -0.008,      // base front
        0, 0.01, -0.014,   // top
        0, 0, -0.014,      // base back

        // Tail wings (horizontal)
        0, 0.001, -0.01,    // root front
        -0.008, 0, -0.014,  // left tip
        0, 0.001, -0.014,   // root back

        0, 0.001, -0.01,    // root front
        0.008, 0, -0.014,   // right tip
        0, 0.001, -0.014,   // root back
    ]);

    geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geo.computeVertexNormals();
    return geo;
}

function FlightArc({ route, index }: { route: FlightRoute; index: number }) {
    const planeRef = useRef<THREE.Mesh>(null);

    const { curve, tubeGeometry, planeGeo } = useMemo(() => {
        const c = createArcCurve(route.start, route.end, 1.01);
        const tube = new THREE.TubeGeometry(c, 64, 0.002, 6, false);
        const plane = createPlaneGeometry();
        return { curve: c, tubeGeometry: tube, planeGeo: plane };
    }, [route]);

    useFrame(({ clock }) => {
        if (planeRef.current) {
            const t = (clock.getElapsedTime() * 0.12 + index * 0.13) % 1;
            const pos = curve.getPoint(t);
            const tangent = curve.getTangent(t).normalize();

            planeRef.current.position.copy(pos);

            const up = pos.clone().normalize();
            const lookTarget = pos.clone().add(tangent);
            planeRef.current.up.copy(up);
            planeRef.current.lookAt(lookTarget);
        }
    });

    return (
        <group>
            <mesh geometry={tubeGeometry}>
                <meshBasicMaterial color={route.color} transparent opacity={0.25} />
            </mesh>
            <mesh ref={planeRef} geometry={planeGeo}>
                <meshStandardMaterial
                    color="#ffffff"
                    emissive={route.color}
                    emissiveIntensity={0.6}
                    metalness={0.8}
                    roughness={0.2}
                    side={THREE.DoubleSide}
                />
            </mesh>
        </group>
    );
}

export default function FlightArcs() {
    return (
        <group>
            {ROUTES.map((route, i) => (
                <FlightArc key={i} route={route} index={i} />
            ))}
        </group>
    );
}
