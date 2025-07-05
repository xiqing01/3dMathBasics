
import { FractalNoiseMaterial } from './FractalNoiseMaterial'
import { BackSide, FrontSide, DoubleSide } from 'three'

// 地面组件
const Ground = ({ children }) => {
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  const materialProps = isMobile 
  ? { octaves: 2, warpingLevels: 1 } // Faster settings for mobile
  : { octaves: 3, warpingLevels: 2 }; // Higher quality for desktop

  // useControls 返回一个包含所有属性当前值的对象
 return (
   <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
     <boxGeometry args={[15, 15, 10]} />
     <FractalNoiseMaterial
       colorA='#585858'
       colorB='#032041'
       lacunarity={3.3}
       diminish={0.4}
       timeScale={0.01}
       side={BackSide}
       {...materialProps}
     />
     {children}
   </mesh>
 )
}

// 地面聚光灯
const Lighting = () => (
  <spotLight
    position={[0, 0, 6]}         // 灯光位置
    angle={0.3}                   // 光锥角度
    penumbra={0.3}                // 边缘柔化
    intensity={100}               // 亮度
    castShadow                    // 投射阴影
    shadow-mapSize-width={512}   // 阴影贴图分辨率
    shadow-mapSize-height={512}
  />
)

//展台底部
const ShowcaseEnd = () => {
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  const materialProps = isMobile 
  ? { octaves: 3, warpingLevels: 1 } // Faster settings for mobile
  : { octaves: 5, warpingLevels: 2 }; // Higher quality for desktop


  return (
    <group>
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow >
        <cylinderGeometry args={[1.3, 0.1, 2, 3]} />
        <FractalNoiseMaterial {...materialProps} />
      </mesh>
    </group>
  )
}

// 展柜中部
const ShowcaseMiddle = () => {
 const isMobile = /Mobi|Android/i.test(navigator.userAgent);
 const materialProps = isMobile 
 ? { octaves: 1, warpingLevels: 1 } // Faster settings for mobile
 : { octaves: 3, warpingLevels: 1 }; // Higher quality for desktop

  return (
    <group>
      <mesh position={[0, 0, 1.15]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <coneGeometry args={[1.15, 0.3, 3]} />
        <FractalNoiseMaterial colorA='#45484a'
        colorB='#032041'
        lacunarity={4} 
        diminish={0.1} 
        timeScale={0.11} 
        {...materialProps}
        />
       
      </mesh>
    </group>
  );
};

// 展柜玻璃罩
const ShowcaseGlass = () => (
  <group>
    <mesh position={[0, 0, 1.68]} rotation={[Math.PI / 2, 0, 0]} castShadow>
      <cylinderGeometry args={[1.22, 1.23, 1.55, 3]} />
      <meshPhysicalNodeMaterial
        transmission={0.97}
        roughness={0.05}
        metalness={0}
        ior={1.02}
        clearcoat={1} // 开启清漆
        clearcoatRoughness={0.05} // 清漆层非常光滑
        thickness={0.5}
        color="#f5f3ff"
      />
      
    </mesh>
  </group>
)

// ====================================================================
// 展厅主组件
// ====================================================================

export default function Hall({children}) {


  return (
    <>
      <ambientLight intensity={2.2} />
      <group >
        <Ground>
          <group>
            <Lighting />
          </group>
          <group position={[0,0,-0.6]} rotation={[0, 0, 0.9]}>
            <ShowcaseEnd />
            <ShowcaseMiddle />
            <ShowcaseGlass />
            
            {children}
          </group>
        </Ground>
      
      </group>
    </>
  )
}