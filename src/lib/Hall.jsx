
import { FractalNoiseMaterial } from './FractalNoiseMaterial'
import { useControls, folder } from 'leva'


// 地面组件
const Ground = ({ children }) => {

  // useControls 返回一个包含所有属性当前值的对象
 return (
   <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
     <planeGeometry args={[10, 10]} />
     <FractalNoiseMaterial
       colorA='#585858'
       colorB='#032041'
       octaves={4}
       lacunarity={3.3}
       diminish={0.4}
       timeScale={0.01}
     />
     {children}
   </mesh>
 )
}

// 地面聚光灯
const Lighting = () => (
  <spotLight
    position={[0, 0, 6]}         // 灯光位置
    angle={0.5}                   // 光锥角度
    penumbra={0.3}                // 边缘柔化
    intensity={100}               // 亮度
    castShadow                    // 投射阴影
    shadow-mapSize-width={2048}   // 阴影贴图分辨率
    shadow-mapSize-height={2048}
  />
)


const ShowcaseEnd = () => {

  return (
    <group>
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow >
        <cylinderGeometry args={[1.1, 0.1, 2, 3]} />
        <FractalNoiseMaterial />
      </mesh>
    </group>
  )
}

// 展柜中部
const ShowcaseMiddle = () => {
 

  return (
    <group>
      <mesh position={[0, 0, 1.15]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <coneGeometry args={[1.03, 0.45, 3]} />
        <FractalNoiseMaterial colorA='#45484a'
        colorB='#032041'
        octaves={6} 
        lacunarity={4} 
        diminish={0.1} 
        timeScale={0.11} />
      </mesh>
    </group>
  );
};

// 展柜玻璃罩
const ShowcaseGlass = () => (
  <group>
    <mesh position={[0, 0, 1.4]} rotation={[Math.PI / 2, 0, 0]} castShadow>
      <cylinderGeometry args={[1, 1, 1.1, 3]} />
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

// ====================================================================
// 展厅主组件
// ====================================================================

export default function Hall() {


  return (
    <>
      <ambientLight intensity={1.5} />
      <group >
        <Ground>
          <group>
            <Lighting />
          </group>
          <group rotation={[0, 0, 0.9]}>
            <ShowcaseEnd />
            <ShowcaseMiddle />
            <ShowcaseGlass />
          </group>
        </Ground>
      
      </group>
    </>
  )
}