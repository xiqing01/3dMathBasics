import { Fn, vec3, vec4, floor, fract, dot, step, max, negate } from 'three/tsl';

// Helper functions translated to TSL
const mm_hash12 = Fn(([p]) => {
    const a = fract(p);
    a.assign(a.sub(dot(a, a.add(37.83)).mul(a)));
    return fract(a.mul(vec3(1, 99, 9999).mul(a.yzx).add(p.zxy)));
});

const rnd_dir = Fn(([ip]) => {
    return fract(vec3(1, 99, 9999).mul(mm_hash12(ip.xy.add(ip.zz.mul(100))))).sub(0.5);
});

// Main 3D Simplex Noise function in TSL
export const simplex3d = Fn(([p_immutable]) => {
    const p = p_immutable.toVar();
    const ip = floor(p.add(dot(vec3(0.333333), p)));
    const p0 = p.sub(ip).add(dot(vec3(0.166666), ip));

    const f = step(p0.yzx, p0);
    const ff = f.mul(f.zxy);

    const v1 = f.sub(ff);
    const v2 = ff.sub(f.zxy).add(1);

    const p1 = p0.sub(v1).add(0.166666);
    const p2 = p0.sub(v2).add(0.333333);
    const p3 = p0.sub(1).add(0.5);

    const d = max(negate(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3))).add(0.58), 0);
    d.assign(d.mul(d));
    d.assign(d.mul(d));

    const noiseVal = dot(
        vec4(
            dot(p0, rnd_dir(ip)),
            dot(p1, rnd_dir(ip.add(v1))),
            dot(p2, rnd_dir(ip.add(v2))),
            dot(p3, rnd_dir(ip.add(1)))
        ),
        d
    );

    return noiseVal.mul(40).add(0.5);
});