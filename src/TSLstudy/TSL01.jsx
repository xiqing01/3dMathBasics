import { useRef } from "react"
import {  useFrame } from "@react-three/fiber"
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
      <octahedronGeometry args={[0.4, 0]} />
      <meshStandardNodeMaterial colorNode={colorLogic} />
    </mesh>
  )
}

export default function TSL01() {
  return (
    <>
        <Octahedron />
    </>
  )
}
