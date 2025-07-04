import { useMemo } from 'react'
import { 
  uv,
  color,
  vec3, 
  float, 
  mx_fractal_noise_float,
  mix,
  timerLocal
} from 'three/tsl'
import { BackSide, FrontSide, DoubleSide } from 'three'

// ====================================================================
// 1. Reusable Fractal Noise Material Component
// 1. 可复用的分形噪声材质组件
// ====================================================================

/**
 * @description A reusable React component for creating a meshStandardMaterial with an animated fractal noise effect using Three.js Node Material (TSL).
 * @description 一个可复用的 React 组件，用于通过 Three.js 节点材质（TSL）创建一个带有动画分形噪声效果的 meshStandardMaterial。
 * * @param {string} [colorA='#4b5563'] - The starting color of the gradient. / 渐变的起始颜色。
 * @param {string} [colorB='#93c5fd'] - The ending color of the gradient. / 渐变的结束颜色。
 * @param {number} [octaves=8] - The number of noise layers to combine, affecting detail. / 噪声叠加的层数，影响细节。
 * @param {number} [lacunarity=2.3] - The frequency multiplier for each successive octave. / 每个连续噪声层的频率倍增器。
 * @param {number} [diminish=0.45] - The amplitude multiplier for each successive octave. / 每个连续噪声层的振幅倍增器。
 * @param {number} [timeScale=0.03] - The speed of the animation. / 动画的速度。
 * @param {object} props - Other properties to be passed to meshStandardMaterial (e.g., roughness, metalness). / 其他传递给 meshStandardMaterial 的属性（如 roughness, metalness）。
 */
export const FractalNoiseMaterial = ({
  colorA = '#4b5563',
  colorB = '#93c5fd',
  octaves = 8,
  lacunarity = 2.3,
  diminish = 0.45,
  timeScale = 0.03,
  side = FrontSide,
  ...props 
}) => {
  // --- Memoize TSL Node ---
  // Memoize the TSL colorNode calculation. It only re-runs if the dependent props change, which is a key performance optimization.
  // 使用 useMemo 缓存 TSL 的 colorNode 计算。仅当依赖的 props 改变时才重新执行，这是一个关键的性能优化点。
  const colorNode = useMemo(() => {
    // --- TSL Logic for Fractal Pattern ---
    // This function defines the core logic for generating the noise pattern in TSL.
    // 此函数定义了在 TSL 中生成噪声图案的核心逻辑。
    const createFractalPattern = (p) => {
      // Animate the noise over time using the timeScale prop.
      // 使用 timeScale 属性让噪声随时间产生动画。
      const time = timerLocal().mul(timeScale);
      
      // Create a 3D vector for the noise function, with time as the z-component for animation.
      // 为噪声函数创建一个三维向量，使用时间作为 z 分量来实现动画。
      const p3 = vec3(p.x, p.y, time);
      
      // Convert component props (JS numbers) into TSL float nodes.
      // 将组件的 props（JS number类型）转换为 TSL 的 float 节点。
      const octavesFloat = float(octaves);
      const lacunarityFloat = float(lacunarity);
      const diminishFloat = float(diminish);

      // A helper function for Fractal Brownian Motion (FBM) noise.
      // 一个用于计算分形布朗运动（FBM）噪声的辅助函数。
      const fbm = (pos) => mx_fractal_noise_float(pos, octavesFloat, lacunarityFloat, diminishFloat);
      
      // Apply triple domain warping: feed the noise result back into the input coordinate. This creates complex, swirling effects.
      // 应用三重领域扭曲：将噪声结果反馈回输入坐标。这会产生复杂的漩涡效果。
      return fbm(p3.add(fbm(p3.add(fbm(p3)))));
    };

    // Scale the UV coordinates to adjust the size/frequency of the noise pattern. `uv()` gets the mesh's texture coordinates.
    // 缩放 UV 坐标以调整噪声图案的大小/频率。`uv()` 获取网格的纹理坐标。
    const scaledUV = uv().mul(4.0);

    // Generate the final noise value (a float between 0 and 1) for the current UV coordinate.
    // 为当前 UV 坐标生成最终的噪声值（一个 0 到 1 之间的浮点数）。
    const shade = createFractalPattern(scaledUV);

    // Convert hex color strings from props into TSL color nodes.
    // 将来自 props 的十六进制颜色字符串转换为 TSL 的 color 节点。
    const finalColorA = color(colorA);
    const finalColorB = color(colorB);

    // Linearly interpolate between colorA and colorB using the noise value (`shade`) as the mixing factor.
    // 使用噪声值（`shade`）作为混合因子，在 colorA 和 colorB 之间进行线性插值。
    return mix(finalColorA, finalColorB, shade);

  }, [colorA, colorB, octaves, lacunarity, diminish, timeScale]); // Dependency array for useMemo

  // --- Return R3F Component ---
  // Return the R3F material component, passing the generated TSL `colorNode` to its `colorNode` prop.
  // Spread other props like `roughness` to the material.
  // 返回 R3F 材质组件，将生成的 TSL `colorNode` 传递给其 `colorNode` 属性。
  // 同时将 `roughness` 等其他属性展开传递给该材质。
  return <meshStandardNodeMaterial colorNode={colorNode} {...props} side={side} />;
};