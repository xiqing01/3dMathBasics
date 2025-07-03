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

// ====================================================================
// 1. 新建的可复用分形噪声材质组件
// ====================================================================
export  const FractalNoiseMaterial = ({
  colorA = '#4b5563',
  colorB = '#93c5fd',
  octaves = 8,
  lacunarity = 2.3,
  diminish = 0.45,
  timeScale = 0.03, // 将 'time' 属性命名为 timeScale 更具描述性
  ...props // 传递其他 meshStandardMaterial 的属性, 如 roughness
}) => {
  // 使用 useMemo 缓存 colorNode 的计算，仅在 props 变化时重新执行
  const colorNode = useMemo(() => {
    // 创建分形图案的 TSL 逻辑
    const createFractalPattern = (p) => {
      const time = timerLocal().mul(timeScale); // 使用 timeScale prop
      const p3 = vec3(p.x, p.y, time);
      
      // 从 props 创建 float 节点
      const octavesFloat = float(octaves);
      const lacunarityFloat = float(lacunarity);
      const diminishFloat = float(diminish);

      const fbm = (pos) => mx_fractal_noise_float(pos, octavesFloat, lacunarityFloat, diminishFloat);
      
      // 三重领域扭曲，生成复杂漩涡效果
      return fbm(p3.add(fbm(p3.add(fbm(p3)))));
    };

    const scaledUV = uv().mul(4.0);
    const shade = createFractalPattern(scaledUV);

    // 从 props 创建 color 节点
    const finalColorA = color(colorA);
    const finalColorB = color(colorB);

    // 返回最终混合颜色的节点
    return mix(finalColorA, finalColorB, shade);

  }, [colorA, colorB, octaves, lacunarity, diminish, timeScale]);

  // 返回一个 R3F 材质组件，并将计算出的 colorNode 作为 prop 传入
  return <meshStandardNodeMaterial colorNode={colorNode} {...props} />;
};