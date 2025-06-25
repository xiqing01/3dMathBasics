import { useRef, useMemo } from 'react'
import {  useFrame, extend, useThree } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'

/**
 * RaymarchMaterial
 * 这个着色器使用光线步进技术在片元着色器中绘制整个场景。
 * 顶点着色器非常简单，只负责传递 UV 坐标。
 */
const RaymarchMaterial = shaderMaterial(
  // Uniforms
  {
    u_time: 0,
    u_resolution: new THREE.Vector2(),
  },
  // Vertex Shader (顶点着色器)
  `
    // vUv 用于将顶点自身的 UV 坐标传递给片元着色器。
    // UV 坐标是 2D 坐标，用于在几何体表面进行贴图，范围通常从 (0,0) 到 (1,1)。
    varying vec2 vUv;

    void main() {
      vUv = uv;
      // gl_Position 是一个特殊的内置变量，用于存储顶点的最终裁剪空间位置。
      // 这个变换将模型的本地坐标转换到屏幕上。
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader (片元着色器)
  `
    // 从顶点着色器接收的 UV 坐标
    varying vec2 vUv; 
    
    // 从 React 接收的 uniform 变量
    uniform float u_time;
    uniform vec2 u_resolution;

    // --- 配置参数 (这些值直接来自你的 Shadertoy 代码) ---
    const float WAVE_AMPLITUDE = 0.15;
    const vec2 WAVE_FREQUENCY = vec2(3.0, 2.5);
    const float WAVE_SPEED = 1.0;
    const vec3 PLANE_COLOR = vec3(0.1, 0.4, 0.8);
    const float MAX_DIST = 100.0;
    const float SURF_DIST = 0.001;

    /**
     * 场景的距离函数 (SDF - Signed Distance Function)
     * 它计算空间中任意点 p 到场景中最近物体的距离。
     * 我们用它来描述一个无限延伸的波浪平面。
     */
    float map(vec3 p) {
      float waveX = sin(p.x * WAVE_FREQUENCY.x + u_time * WAVE_SPEED) * WAVE_AMPLITUDE;
      float waveZ = cos(p.z * WAVE_FREQUENCY.y + u_time * WAVE_SPEED) * WAVE_AMPLITUDE;
      
      // 一个无限平面的 SDF 是 p.y
      // 我们减去波浪的高度来让平面产生起伏
      return p.y - (waveX + waveZ);
    }
    
    /**
     * 计算表面法线 (Normal)
     * 通过在 p 点附近极小的范围内采样 SDF，来估算表面的梯度，即法线方向。
     * 这是光线步进中计算光照的基础。
     */
    vec3 getNormal(vec3 p) {
        vec2 e = vec2(0.001, 0.0);
        float d = map(p);
        vec3 n = d - vec3(
            map(p - e.xyy),
            map(p - e.yxy),
            map(p - e.yyx)
        );
        return normalize(n);
    }
    
    /**
     * 计算光照
     * 使用一个简单的方向光来模拟光照效果。
     */
    float getLight(vec3 p, vec3 normal) {
        vec3 lightDir = normalize(vec3(1.0, 1.0, -1.0));
        float diffuse = max(dot(normal, lightDir), 0.0); // 兰伯特光照模型
        float ambient = 0.2; // 环境光
        return diffuse * 0.8 + ambient;
    }

    /**
     * 主函数
     * 为屏幕上的每个像素计算最终颜色。
     */
    void main() {
        // --- 1. 设置相机和光线 ---
        vec2 uv = (vUv - 0.5) * u_resolution / u_resolution.y;

        vec3 ro = vec3(0.0, 2.0, -4.0); // 相机位置
        vec3 target = vec3(0.0, 0.0, 0.0); // 目标点
        
        vec3 camFwd = normalize(target - ro);
        vec3 camRight = normalize(cross(vec3(0.0, 1.0, 0.0), camFwd));
        vec3 camUp = cross(camFwd, camRight);
        vec3 rd = normalize(camFwd + uv.x * camRight + uv.y * camUp); // 光线方向

        // --- 2. 光线步进 (Raymarching) ---
        float totalDist = 0.0;
        vec3 p = ro;
        
        for (int i = 0; i < 100; i++) {
            float dist = map(p);
            
            if (dist < SURF_DIST) {
                // --- 3. 击中表面，计算颜色 ---
                vec3 normal = getNormal(p);
                float light = getLight(p, normal);
                
                vec3 color = PLANE_COLOR * light;
                
                // 添加一些基于世界坐标的颜色变化，增加细节
                float colorMix = (sin(p.x * 5.0 + u_time) + 1.0) / 2.0;
                color = mix(color, vec3(1.0, 1.0, 0.8), colorMix * 0.3);

                gl_FragColor = vec4(color, 1.0);
                return;
            }
            
            if (totalDist > MAX_DIST) {
                break;
            }
            
            totalDist += dist;
            p += rd * dist;
        }

        // 如果没有击中任何物体，就用一个渐变的背景色
        gl_FragColor = vec4(vec3(0.5, 0.7, 1.0) * (1.0 - uv.y * 0.5), 1.0);
    }
  `
);

extend({ RaymarchMaterial });

const SceneContent = () => {
  const materialRef = useRef();
  const { size } = useThree(); // 获取视口尺寸

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.u_time = clock.getElapsedTime();
    }
  });

  // 使用 useMemo 来确保 u_resolution 只在尺寸变化时更新
  const resolution = useMemo(() => new THREE.Vector2(size.width, size.height), [size]);

  return (
    <mesh>
      {/* 这里的 planeGeometry 只是一个矩形画布，分段数不需要很高。
        我们用它来运行我们的片元着色器。
      */}
      <planeGeometry args={[4, 4]} />
      <raymarchMaterial 
        ref={materialRef} 
        key={RaymarchMaterial.key}
        u_resolution={resolution}
      />
    </mesh>
  );
};

export default function WavingPlane()  {
  return (
    <>
        {/* 在这个技术中，我们不需要场景里的灯光和 OrbitControls，因为相机和光照都是在着色器内部代码里定义的 */}
        <SceneContent />
    </>
  );
}