import { CameraControls } from '@react-three/drei'
import {  useFrame } from "@react-three/fiber"
import { 
  uv, 
  vec4, 
  sin, 
  dot, 
  fract, 
  vec2, 
  floor, 
  mix, 
  float, 
  mat2, 
  time,
} from 'three/tsl'


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
// ====================================================================
// 模块 1: 噪声生成函数 (从 GLSL 转换而来)
// ====================================================================

/**
 * 伪随机数生成器 (对应 GLSL 的 rand 函数)
 * @param {Node} n - 输入的二维向量坐标节点
 * @returns {Node} - 返回一个 0.0 到 1.0 之间的伪随机浮点数节点
 */
const randTSL = (n) => {
  const sinDot = sin(dot(n, vec2(12.9898, 4.1414))).mul(43758.5453);
  return fract(sinDot);
};

/**
 * 平滑噪声函数 (对应 GLSL 的 noise 函数)
 * 通过双线性插值平滑随机值，形成云雾效果
 * @param {Node} p - 输入的二维向量坐标节点
 * @returns {Node} - 返回一个平滑的噪声值节点
 */
const noiseTSL = (p) => {
  const ip = floor(p);
  let u = fract(p);
  // 使用 Smoothstep 函数进行平滑处理
  u = u.mul(u).mul(float(3.0).sub(u.mul(2.0)));
  
  // 获取网格四个角的随机值
  const a = randTSL(ip);
  const b = randTSL(ip.add(vec2(1.0, 0.0)));
  const c = randTSL(ip.add(vec2(0.0, 1.0)));
  const d = randTSL(ip.add(vec2(1.0, 1.0)));

  // 水平方向插值
  const mix1 = mix(a, b, u.x);
  const mix2 = mix(c, d, u.x);
  
  // 垂直方向插值并增强对比度
  const res = mix(mix1, mix2, u.y);
  return res.mul(res);
};

// 用于旋转坐标的 2x2 矩阵
const mtx = mat2( 0.80,  0.60, -0.60,  0.80 );

/**
 * 分形布朗运动 (FBM) (对应 GLSL 的 fbm 函数)
 * 通过叠加多层不同频率和振幅的噪声来创造丰富的细节
 * @param {Node} p_in - 输入的二维向量坐标节点
 * @returns {Node} - 返回一个细节丰富的分形噪声值节点
 */
const fbmTSL = (p_in) => {
  let p = p_in.mul(0.7); // 整体放大坐标，让基础图案更丰富
  let f = float(0.0);
  

  // 叠加 6 层噪声 (Octaves)

  f = f.add(noiseTSL(p.add(time)).mul(0.5));
  p = mtx.mul(p).mul(2.02);

  f = f.add(noiseTSL(p).mul(0.25));
  p = mtx.mul(p).mul(2.03);

  f = f.add(noiseTSL(p).mul(0.125));
  p = mtx.mul(p).mul(2.01);

  f = f.add(noiseTSL(p).mul(0.0625));
  p = mtx.mul(p).mul(2.04);

  f = f.add(noiseTSL(p).mul(0.03125));
  p = mtx.mul(p).mul(2.01);

  f = f.add(noiseTSL(p.add(sin(time)))).mul(0.015625)

  // 归一化，确保结果大致在 0-1 范围
  return f.div(0.96875);
};

/**
 * 域扭曲图案函数 (对应 GLSL 的 pattern 函数)
 * 使用噪声来扰动噪声的坐标，产生卷曲效果
 * @param {Node} p - 输入的二维向量坐标节点
 * @returns {Node} - 返回最终的、扭曲后的灰度图案节点
 */
const patternTSL = (p) => {
  const q = fbmTSL(p);
  return fbmTSL(p.add(q));
};


// ====================================================================
// 模块 2: 颜色映射函数 (第一个练习的成果)
// ====================================================================

const colormapRedTSL = (x) => {
  return x.lessThan(0.2416).select(x.mul(3.254).add(0.2138), float(1.0));
};

const colormapGreenTSL = (x) => {
  return x.lessThan(0.2416).select(
    float(0.0),
    x.lessThan(0.4032).select(x.mul(3.0816).add(-0.7446), x.mul(0.8412).add(0.1588))
  );
};

const colormapBlueTSL = (x) => {
  const val1 = x.mul(3.254).add(0.2138);
  const val2 = float(0.498);
  const val3 = x.mul(3.106).add(-0.2524);
  const val4 = float(1.0);
  return x.lessThan(0.08736).select(
    val1,
    x.lessThan(0.2416).select(
      val2,
      x.lessThan(0.4032).select(val3, val4)
    )
  );
};

/**
 * 将所有颜色通道组合成最终的颜色映射函数
 * @param {Node} x - 输入的 0-1 范围的灰度值节点
 * @returns {Node} - 返回一个 vec4 颜色节点
 */
const colormapTSL = (x) => {
  const r = colormapRedTSL(x);
  const g = colormapGreenTSL(x);
  const b = colormapBlueTSL(x);
  return vec4(r, g, b, 1.0);
};


// ====================================================================
// 模块 3: 最终合成
// ====================================================================

// 1. 生成最终的灰度图案值
const shade = patternTSL(uv());
// 2. 将灰度值通过颜色映射函数转换为彩色
const finalColor = colormapTSL(shade);
// 3. 创建最终的材质颜色节点，使用彩色作为颜色，灰度值作为透明度
const colorLogic = vec4(finalColor.rgb, shade);
const ShowcaseEnd = () => {
  return (
    <group>
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[1.1, 0.1, 2, 3]} />
        <meshStandardNodeMaterial colorNode={colorLogic} />
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
