import { Canvas } from '@react-three/fiber'
import { WebGPURenderer } from 'three/webgpu'
import { CameraControls } from '@react-three/drei'




export const CanvasWebGPU = ({children}) => {
  return (
    <Canvas
      shadows camera={{ position: [0, 0, 7],  fov: 35, near: 1, far: 50 }}
      // WebGPU 渲染器设置
     gl={async (glProps) => {
       const renderer = new WebGPURenderer(glProps)
       await renderer.init()
       return renderer
     }}
    >
      <color attach="background" args={['#030712']} />
      <CameraControls
        truckSpeed={0}
        dollySpeed={0}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
      />
      {children}
    </Canvas>
  )
}
