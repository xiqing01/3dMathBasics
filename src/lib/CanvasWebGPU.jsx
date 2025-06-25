import React from 'react'
import { Canvas } from '@react-three/fiber'
import { WebGPURenderer } from 'three/webgpu'

export const CanvasWebGPU = ({children}) => {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 60 }}
      // WebGPU 渲染器设置
      gl={async (glProps) => {
        const renderer = new WebGPURenderer(glProps)
        await renderer.init()
        return renderer
      }}
    >
      {children}
    </Canvas>
  )
}
