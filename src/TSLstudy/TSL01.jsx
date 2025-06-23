import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { WebGPURenderer } from "three/webgpu"
import { time, positionLocal, sin, vec3 } from "three/tsl"

// 八面体组件
const Octahedron = (props) => {
  const meshRef = useRef()

  // 使用 TSL 的 time 和 positionLocal 来创建动态颜色逻辑
  const colorLogic = vec3(
    sin(positionLocal.x.mul(2).add(time)).add(1).mul(0.5),
    sin(positionLocal.y.mul(2).add(time)).add(1).mul(0.5),
    sin(positionLocal.z.mul(2).add(time)).add(1).mul(0.5)
  )

  // useFrame 更新八面体的旋转
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01
      meshRef.current.rotation.y += 0.01
    }
  })

  return (
    <mesh {...props} ref={meshRef}>
      <octahedronGeometry />
      <meshStandardNodeMaterial colorNode={colorLogic} />
    </mesh>
  )
}

export default function TSL01() {
  return (
    <div className="w-dvw h-dvh bg-gray-950">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        // WebGPU 渲染器设置
        gl={async (glProps) => {
          const renderer = new WebGPURenderer(glProps)
          await renderer.init()
          return renderer
        }}
      >
        <OrbitControls />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          decay={0}
          intensity={Math.PI}
        />
        <ambientLight intensity={Math.PI / 2} />
        <pointLight 
          position={[-10, -10, -10]} 
          decay={0} 
          intensity={Math.PI} 
        />
        <Octahedron />
      </Canvas>
    </div>
  )
}
