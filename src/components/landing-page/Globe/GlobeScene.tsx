
import { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Sparkles } from '@react-three/drei';
import Earth from './Earth';
import FlightArcs from './FlightArcs';
import WindStreams from './WindStreams';

function CameraController() {
    const { camera } = useThree();
    const targetDistance = useRef(4.5);
    const currentDistance = useRef(2.2);
    const initialZoomDone = useRef(false);

    useEffect(() => {
        camera.position.set(0, 0.5, 2.2);
        camera.lookAt(0, 0, 0);

        const timer = setTimeout(() => {
            targetDistance.current = 3.2;
            initialZoomDone.current = true;
        }, 300);

        const handleScroll = () => {
            if (!initialZoomDone.current) return;
            const scrollY = window.scrollY;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const scrollFraction = Math.min(scrollY / Math.max(maxScroll, 1), 1);
            targetDistance.current = 3.2 - scrollFraction * 1.4;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            clearTimeout(timer);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [camera]);

    useFrame(() => {
        currentDistance.current += (targetDistance.current - currentDistance.current) * 0.03;
        const dir = camera.position.clone().normalize();
        camera.position.copy(dir.multiplyScalar(currentDistance.current));
    });

    return null;
}

export default function GlobeScene() {
    return (
        <div className="fixed inset-0 w-full h-full">
            <Canvas
                camera={{ position: [0, 0.5, 2.2], fov: 50, near: 0.1, far: 100 }}
                gl={{ antialias: true, alpha: true }}
                style={{ background: 'transparent' }}
            >
                <color attach="background" args={['#02040a']} />
                <fog attach="fog" args={['#02040a', 20, 100]} />

                <ambientLight intensity={2.0} />
                <directionalLight position={[5, 3, 5]} intensity={5.0} color="#e0f2fe" />
                <directionalLight position={[-3, -2, -3]} intensity={3.0} color="#0ea5e9" />
                <pointLight position={[2, 2, 2]} intensity={5.0} color="#38bdf8" />

                <Stars radius={100} depth={50} count={7000} factor={4} saturation={0} fade speed={0.5} />
                <Stars radius={50} depth={50} count={1000} factor={6} saturation={1} fade speed={1.5} />
                <Sparkles count={500} scale={12} size={4} speed={0.4} opacity={0.5} color="#ffffff" />

                <CameraController />

                <group rotation={[0.3, -0.5, 0.1]}>
                    <Earth />
                    <FlightArcs />
                    <WindStreams />
                </group>

                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    autoRotate
                    autoRotateSpeed={0.3}
                    minPolarAngle={Math.PI * 0.3}
                    maxPolarAngle={Math.PI * 0.7}
                />
            </Canvas>
        </div>
    );
}
