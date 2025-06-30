import { Canvas } from '@react-three/fiber'
import { WebGPURenderer } from 'three/webgpu'

export const CanvasWebGPU = ({children}) => {
  return (
    <Canvas
      shadows camera={{ position: [0, 0, 7], fov: 35, near: 1, far: 50 }}
      // WebGPU 渲染器设置
     gl={async (glProps) => {
       const renderer = new WebGPURenderer(glProps)
       await renderer.init()
       return renderer
     }}
    >
      <color attach="background" args={['#030712']} />
      {children}
    </Canvas>
  )
}
