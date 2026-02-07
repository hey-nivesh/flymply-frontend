
import { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

export default function Earth() {
    const meshRef = useRef<THREE.Mesh>(null);
    const texture = useLoader(THREE.TextureLoader, '/earth-texture.jpg');

    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 16;

    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.001;
        }
    });

    return (
        <group>
            <Sphere ref={meshRef} args={[1, 128, 128]}>
                <meshPhongMaterial
                    map={texture}
                    specular={new THREE.Color('#4466aa')}
                    shininess={25}
                    emissive={new THREE.Color('#223355')}
                    emissiveIntensity={0.2}
                />
            </Sphere>

            {/* Atmosphere inner glow */}
            <Sphere args={[1.025, 64, 64]}>
                <meshBasicMaterial
                    color="#4da6ff"
                    transparent
                    opacity={0.15}
                    side={THREE.BackSide}
                />
            </Sphere>

            {/* Atmosphere outer glow */}
            <Sphere args={[1.08, 64, 64]}>
                <meshBasicMaterial
                    color="#1e90ff"
                    transparent
                    opacity={0.1}
                    side={THREE.BackSide}
                />
            </Sphere>
        </group>
    );
}
