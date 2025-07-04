//让一个物体追逐另一个物体

import * as THREE from "three";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { TextDisplay } from "../lib/TextDisplay"
import { Html } from "@react-three/drei"

const Chaser = ({ targetPosition }) => {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const currentPosition = meshRef.current.position;
    const directionVector = new THREE.Vector3().subVectors(
      targetPosition,
      currentPosition
    );

    if (directionVector.length() < 0.1) {
      return;
    }

    directionVector.normalize()

    const speed = 0.2 * delta
    console.log(delta)
    directionVector.multiplyScalar(speed)
    meshRef.current.position.add(directionVector)
    meshRef.current.lookAt(targetPosition);

  });

  

  return (
    <mesh ref={meshRef} position={[0, 0, 0.35]}>
      <sphereGeometry args={[0.2]} />
      <meshStandardMaterial color="red" />
    </mesh>
  );
};

export default function V01() {
  const targetPosition = new THREE.Vector3(0, 0, -0.3);

  return (
    <>
      
      {/* 目标 */}
      <mesh position={targetPosition}>
        <sphereGeometry args={[0.15]} />
        <meshStandardMaterial color="blue" />
      </mesh>

      {/* 追逐者 */}
      <Chaser targetPosition={targetPosition} />
    </>
  )
}
