import { Canvas } from '@react-three/fiber'
import { WebGPURenderer } from 'three/webgpu'
import { CameraControls } from '@react-three/drei'

export const CanvasWebGPU = ({children}) => {

  return (
    <Canvas
      shadows camera={{ position: [0, 2, 5.3 ],  fov: 35, near: 1, far: 30 }}
      // WebGPU 渲染器设置
     gl={async (glProps) => {
       const renderer = new WebGPURenderer(glProps)
       await renderer.init()
       return renderer
     }}
    >
        <CameraControls
          truckSpeed={0} //相机平移
          minDistance={2.3} // 机可以离目标点最近的距离
          maxDistance={10} // 机可以离目标点最远的距离
          dollySpeed={1} //相机缩放（滚轮）的速度
          minPolarAngle={Math.PI / 8}  // 最小俯视角度 (30度，确保总是从上方看)
          maxPolarAngle={Math.PI / 2 - 0.2} // 最大俯视角度 (略小于90度，确保不会完全平视或仰视)
        />
        {children}

      
    </Canvas>
  )
}
