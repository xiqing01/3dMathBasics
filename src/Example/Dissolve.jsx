import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
    mx_fractal_noise_float,
    positionLocal,
    timerLocal,
    sin,
    smoothstep,
    sub,
    add,
    color,
    mix
} from 'three/tsl';
import { DoubleSide } from 'three'

const Dissolve  = () => {
    const meshRef = useRef();

    // Rotate sphere on Y and X axis | 让球体绕Y轴和X轴旋转
    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.1;
            meshRef.current.rotation.x += delta * 0.02;
        }
    });

    const material = useMemo(() => {
        // Key parameters | 关键参数
        const glowColor = color(0x00ffff);
        const glowWidth = 0.025;
        const noiseScale = 3.0;
        const animationSpeed = 0.1;

        // Noise and animated threshold | 噪点和动画阈值
        const scaledPosition = positionLocal.mul(noiseScale);
        const noisePatternNode = mx_fractal_noise_float(scaledPosition);
        const animatedThresholdNode = sin(timerLocal(animationSpeed)).mul(1).add(-0.27);

        // Glow band calculation | 发光带计算
        const rampUp = smoothstep(sub(animatedThresholdNode, glowWidth), animatedThresholdNode, noisePatternNode);
        const rampDown = smoothstep(animatedThresholdNode, add(animatedThresholdNode, glowWidth), noisePatternNode);
        const glowIntensityNode = rampUp.sub(rampDown);

        // Visible area (Alpha) | 可见区域 (Alpha)
        const alphaNode = smoothstep(sub(animatedThresholdNode, glowWidth), animatedThresholdNode, noisePatternNode);

        // Final color | 最终颜色
        const finalColorNode = mix(color('#0c0a09'), glowColor, glowIntensityNode);

        return (
            <meshStandardNodeMaterial
                colorNode={finalColorNode}
                emissiveNode={finalColorNode}
                opacityNode={alphaNode}
                transparent={true}
                side={DoubleSide}
            />
        );
    }, []);

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[0.4, 128, 128]} />
            {material}
        </mesh>
    );
}

export default Dissolve