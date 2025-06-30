import { CameraControls, Environment, Lightformer } from '@react-three/drei'

import * as THREE from 'three';
import { 
  uniform,

  positionWorld,

} from 'three/tsl';


import { useControls } from 'leva'

//地面
const Ground = ({ children }) => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial color="#404040" roughness={0.5} />
      {children}
    </mesh>
  )
}

//地面聚光灯
const Lighting = () => {
  

  return (
    <spotLight
      position={[0, 0, 6]} // 灯光位置
      angle={0.5} // 光锥角度
      penumbra={0.3} // 边缘羽化/柔和度
      intensity={100} // 亮度
      castShadow // 关键：让这个光源投射阴影
      shadow-mapSize-width={2048} // 阴影贴图分辨率，越高越清晰
      shadow-mapSize-height={2048}
    />
  )
}

// 展柜

// 展柜底部组件
import { mix,fract,vec2,sin,floor,dot } from 'three/tsl'

const tslNoise = ({ st }) => {
  const random = (v) =>
    fract(sin(dot(v, vec2(12.9898, 78.233))).mul(43758.5453123))

  const i = floor(st)
  const f = fract(st)

  // 获取晶格四个角的随机值
  const a = random(i)
  const b = random(i.add(vec2(1.0, 0.0)))
  const c = random(i.add(vec2(0.0, 1.0)))
  const d = random(i.add(vec2(1.0, 1.0)))

  // 使用 smoothstep 计算平滑的插值因子
  const u = f.mul(f).mul(vec2(3.0).sub(f.mul(2.0)))

  // 执行双线性插值 (Bilinear Interpolation)
  // 这是比之前更清晰、更标准的 TSL 写法
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y)
}



const ShowcaseEnd = () => {


    // a. 将 props 转换为 TSL 的 uniform 节点
    const uColorA = uniform(new THREE.Color('#74ebd5'));
    const uColorB = uniform(new THREE.Color('#ACB6E5'));
    const uNoiseScale = uniform(0.5);
    const uNoiseSpeed = uniform(0.1);

    // b. 构建噪声坐标节点，并让它随时间动起来
    // nodeFrame.time 是 TSL 中获取时间的标准节点
    const animatedCoords = positionWorld.xz
      .mul(uNoiseScale)
      .add(vec2(0.0, sin(positionWorld.mul(uNoiseSpeed))));

    // c. 调用我们自己创建的纯 TSL 噪声函数
    const noiseValue = tslNoise(animatedCoords);

    // e. [核心] 将我们构建的颜色逻辑节点图连接到材质的 colorNode
   const  colorNode = mix(uColorA, uColorB, noiseValue);

    

  

  return(
    <group>
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
      <cylinderGeometry args={[1.1, 0.1, 2, 3]} />
      <meshStandardNodeMaterial colorNode={colorNode} />
      </mesh>
      
    </group>
  )
}
// 展柜内部组件
const ShowcaseMiddle = () => {
  return (
    <group>
      <mesh position={[0, 0, 1.1]} rotation={[Math.PI / 2, 0, 0]} castShadow>
      <coneGeometry args={[0.8, 0.3, 3]} />
      <meshStandardMaterial color="#888888" />
      </mesh>
    </group>
  )
}
// 展厅玻璃
const ShowcaseGlass = () => {
  return (
    <group>
      <mesh position={[0, 0, 1.3]} rotation={[Math.PI / 2, 0, 0]} castShadow>
      <cylinderGeometry args={[1, 1, 1, 3]} />
        <meshPhysicalNodeMaterial
          transmission={1}
          roughness={0.05}
          metalness={0}
          ior={1.5}
          thickness={0.3}
          color="#e8f5e9"

        />
      </mesh>
    </group>
  )
}

export default function Hall() {
  return (
    <>
      <ambientLight intensity={1.5} />
      <group>
        <Ground>
          <group>
            <Lighting />
          </group>
          <group>

            <ShowcaseEnd />
            <ShowcaseMiddle />
            <ShowcaseGlass />
          </group>
        </Ground>

        <CameraControls
          truckSpeed={0}
          dollySpeed={0}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2}
        />
      </group>
    </>
  )
}
