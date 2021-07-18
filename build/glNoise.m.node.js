var _Perlin = "#define GLSLIFY 1\n// #name: Perlin\n\nvec2 _fade(vec2 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }\nvec3 _fade(vec3 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }\n\n/**\n * Generates 2D Perlin Noise.\n *\n * @name gln_perlin\n * @function\n * @param {vec2} p  Point to sample Perlin Noise at.\n * @return {float}  Value of Perlin Noise at point \"p\".\n *\n * @example\n * float n = gln_perlin(position.xy);\n */\nfloat gln_perlin(vec2 P) {\n  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);\n  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);\n  Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation\n  vec4 ix = Pi.xzxz;\n  vec4 iy = Pi.yyww;\n  vec4 fx = Pf.xzxz;\n  vec4 fy = Pf.yyww;\n  vec4 i = gln_rand4(gln_rand4(ix) + iy);\n  vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...\n  vec4 gy = abs(gx) - 0.5;\n  vec4 tx = floor(gx + 0.5);\n  gx = gx - tx;\n  vec2 g00 = vec2(gx.x, gy.x);\n  vec2 g10 = vec2(gx.y, gy.y);\n  vec2 g01 = vec2(gx.z, gy.z);\n  vec2 g11 = vec2(gx.w, gy.w);\n  vec4 norm =\n      1.79284291400159 - 0.85373472095314 * vec4(dot(g00, g00), dot(g01, g01),\n                                                 dot(g10, g10), dot(g11, g11));\n  g00 *= norm.x;\n  g01 *= norm.y;\n  g10 *= norm.z;\n  g11 *= norm.w;\n  float n00 = dot(g00, vec2(fx.x, fy.x));\n  float n10 = dot(g10, vec2(fx.y, fy.y));\n  float n01 = dot(g01, vec2(fx.z, fy.z));\n  float n11 = dot(g11, vec2(fx.w, fy.w));\n  vec2 fade_xy = _fade(Pf.xy);\n  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);\n  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);\n  return 2.3 * n_xy;\n}\n\n/**\n * Generates 3D Perlin Noise.\n *\n * @name gln_perlin\n * @function\n * @param {vec3} p  Point to sample Perlin Noise at.\n * @return {float}  Value of Perlin Noise at point \"p\".\n *\n * @example\n * float n = gln_perlin(position.xyz);\n */\nfloat gln_perlin(vec3 P) {\n  vec3 Pi0 = floor(P);        // Integer part for indexing\n  vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1\n  Pi0 = mod(Pi0, 289.0);\n  Pi1 = mod(Pi1, 289.0);\n  vec3 Pf0 = fract(P);        // Fractional part for interpolation\n  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0\n  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);\n  vec4 iy = vec4(Pi0.yy, Pi1.yy);\n  vec4 iz0 = Pi0.zzzz;\n  vec4 iz1 = Pi1.zzzz;\n\n  vec4 ixy = _permute(_permute(ix) + iy);\n  vec4 ixy0 = _permute(ixy + iz0);\n  vec4 ixy1 = _permute(ixy + iz1);\n\n  vec4 gx0 = ixy0 / 7.0;\n  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;\n  gx0 = fract(gx0);\n  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);\n  vec4 sz0 = step(gz0, vec4(0.0));\n  gx0 -= sz0 * (step(0.0, gx0) - 0.5);\n  gy0 -= sz0 * (step(0.0, gy0) - 0.5);\n\n  vec4 gx1 = ixy1 / 7.0;\n  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;\n  gx1 = fract(gx1);\n  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);\n  vec4 sz1 = step(gz1, vec4(0.0));\n  gx1 -= sz1 * (step(0.0, gx1) - 0.5);\n  gy1 -= sz1 * (step(0.0, gy1) - 0.5);\n\n  vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);\n  vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);\n  vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);\n  vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);\n  vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);\n  vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);\n  vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);\n  vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);\n\n  vec4 norm0 = _taylorInvSqrt(\n      vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));\n  g000 *= norm0.x;\n  g010 *= norm0.y;\n  g100 *= norm0.z;\n  g110 *= norm0.w;\n  vec4 norm1 = _taylorInvSqrt(\n      vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));\n  g001 *= norm1.x;\n  g011 *= norm1.y;\n  g101 *= norm1.z;\n  g111 *= norm1.w;\n\n  float n000 = dot(g000, Pf0);\n  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));\n  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));\n  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));\n  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));\n  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));\n  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));\n  float n111 = dot(g111, Pf1);\n\n  vec3 fade_xyz = _fade(Pf0);\n  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111),\n                 fade_xyz.z);\n  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);\n  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);\n  return 2.2 * n_xyz;\n}\n\n/**\n * Generates 2D Fractional Brownian motion (fBm) from Perlin Noise.\n *\n * @name gln_pfbm\n * @function\n * @param {vec2} p               Point to sample fBm at.\n * @param {gln_tFBMOpts} opts    Options for generating Perlin Noise.\n * @return {float}               Value of fBm at point \"p\".\n *\n * @example\n * gln_tFBMOpts opts =\n *      gln_tFBMOpts(uSeed, 0.3, 2.0, 0.5, 1.0, 5, false, false);\n *\n * float n = gln_pfbm(position.xy, opts);\n */\nfloat gln_pfbm(vec2 p, gln_tFBMOpts opts) {\n  p += (opts.seed * 100.0);\n  float persistance = opts.persistance;\n  float lacunarity = opts.lacunarity;\n  float redistribution = opts.redistribution;\n  int octaves = opts.octaves;\n  bool terbulance = opts.terbulance;\n  bool ridge = opts.terbulance && opts.ridge;\n\n  float result = 0.0;\n  float amplitude = 1.0;\n  float frequency = 1.0;\n  float maximum = amplitude;\n\n  for (int i = 0; i < MAX_FBM_ITERATIONS; i++) {\n    if (i >= octaves)\n      break;\n\n    vec2 p = p * frequency * opts.scale;\n\n    float noiseVal = gln_perlin(p);\n\n    if (terbulance)\n      noiseVal = abs(noiseVal);\n\n    if (ridge)\n      noiseVal = -1.0 * noiseVal;\n\n    result += noiseVal * amplitude;\n\n    frequency *= lacunarity;\n    amplitude *= persistance;\n    maximum += amplitude;\n  }\n\n  float redistributed = pow(result, redistribution);\n  return redistributed / maximum;\n}\n\n/**\n * Generates 3D Fractional Brownian motion (fBm) from Perlin Noise.\n *\n * @name gln_pfbm\n * @function\n * @param {vec3} p               Point to sample fBm at.\n * @param {gln_tFBMOpts} opts    Options for generating Perlin Noise.\n * @return {float}               Value of fBm at point \"p\".\n *\n * @example\n * gln_tFBMOpts opts =\n *      gln_tFBMOpts(uSeed, 0.3, 2.0, 0.5, 1.0, 5, false, false);\n *\n * float n = gln_pfbm(position.xy, opts);\n */\nfloat gln_pfbm(vec3 p, gln_tFBMOpts opts) {\n  p += (opts.seed * 100.0);\n  float persistance = opts.persistance;\n  float lacunarity = opts.lacunarity;\n  float redistribution = opts.redistribution;\n  int octaves = opts.octaves;\n  bool terbulance = opts.terbulance;\n  bool ridge = opts.terbulance && opts.ridge;\n\n  float result = 0.0;\n  float amplitude = 1.0;\n  float frequency = 1.0;\n  float maximum = amplitude;\n\n  for (int i = 0; i < MAX_FBM_ITERATIONS; i++) {\n    if (i >= octaves)\n      break;\n\n    vec3 p = p * frequency * opts.scale;\n\n    float noiseVal = gln_perlin(p);\n\n    if (terbulance)\n      noiseVal = abs(noiseVal);\n\n    if (ridge)\n      noiseVal = -1.0 * noiseVal;\n\n    result += noiseVal * amplitude;\n\n    frequency *= lacunarity;\n    amplitude *= persistance;\n    maximum += amplitude;\n  }\n\n  float redistributed = pow(result, redistribution);\n  return redistributed / maximum;\n}"; // eslint-disable-line

var _Simplex = "#define GLSLIFY 1\n// #name: Simplex\n\n/**\n * Generates 2D Simplex Noise.\n *\n * @name gln_simplex\n * @function\n * @param {vec2} v  Point to sample Simplex Noise at.\n * @return {float}  Value of Simplex Noise at point \"p\".\n *\n * @example\n * float n = gln_simplex(position.xy);\n */\nfloat gln_simplex(vec2 v) {\n  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626,\n                      0.024390243902439);\n  vec2 i = floor(v + dot(v, C.yy));\n  vec2 x0 = v - i + dot(i, C.xx);\n  vec2 i1;\n  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);\n  vec4 x12 = x0.xyxy + C.xxzz;\n  x12.xy -= i1;\n  i = mod(i, 289.0);\n  vec3 p = gln_rand3(gln_rand3(i.y + vec3(0.0, i1.y, 1.0)) + i.x +\n                     vec3(0.0, i1.x, 1.0));\n  vec3 m = max(\n      0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);\n  m = m * m;\n  m = m * m;\n  vec3 x = 2.0 * fract(p * C.www) - 1.0;\n  vec3 h = abs(x) - 0.5;\n  vec3 ox = floor(x + 0.5);\n  vec3 a0 = x - ox;\n  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);\n  vec3 g;\n  g.x = a0.x * x0.x + h.x * x0.y;\n  g.yz = a0.yz * x12.xz + h.yz * x12.yw;\n  return 130.0 * dot(m, g);\n}\n\n/**\n * Generates 3D Simplex Noise.\n *\n * @name gln_simplex\n * @function\n * @param {vec3} v  Point to sample Simplex Noise at.\n * @return {float}  Value of Simplex Noise at point \"p\".\n *\n * @example\n * float n = gln_simplex(position.xyz);\n */\nfloat gln_simplex(vec3 v) {\n  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);\n  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);\n\n  // First corner\n  vec3 i = floor(v + dot(v, C.yyy));\n  vec3 x0 = v - i + dot(i, C.xxx);\n\n  // Other corners\n  vec3 g = step(x0.yzx, x0.xyz);\n  vec3 l = 1.0 - g;\n  vec3 i1 = min(g.xyz, l.zxy);\n  vec3 i2 = max(g.xyz, l.zxy);\n\n  //  x0 = x0 - 0. + 0.0 * C\n  vec3 x1 = x0 - i1 + 1.0 * C.xxx;\n  vec3 x2 = x0 - i2 + 2.0 * C.xxx;\n  vec3 x3 = x0 - 1. + 3.0 * C.xxx;\n\n  // Permutations\n  i = mod(i, 289.0);\n  vec4 p = _permute(_permute(_permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y +\n                             vec4(0.0, i1.y, i2.y, 1.0)) +\n                    i.x + vec4(0.0, i1.x, i2.x, 1.0));\n\n  // Gradients\n  // ( N*N points uniformly over a square, mapped onto an octahedron.)\n  float n_ = 1.0 / 7.0; // N=7\n  vec3 ns = n_ * D.wyz - D.xzx;\n\n  vec4 j = p - 49.0 * floor(p * ns.z * ns.z); //  mod(p,N*N)\n\n  vec4 x_ = floor(j * ns.z);\n  vec4 y_ = floor(j - 7.0 * x_); // mod(j,N)\n\n  vec4 x = x_ * ns.x + ns.yyyy;\n  vec4 y = y_ * ns.x + ns.yyyy;\n  vec4 h = 1.0 - abs(x) - abs(y);\n\n  vec4 b0 = vec4(x.xy, y.xy);\n  vec4 b1 = vec4(x.zw, y.zw);\n\n  vec4 s0 = floor(b0) * 2.0 + 1.0;\n  vec4 s1 = floor(b1) * 2.0 + 1.0;\n  vec4 sh = -step(h, vec4(0.0));\n\n  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;\n  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;\n\n  vec3 p0 = vec3(a0.xy, h.x);\n  vec3 p1 = vec3(a0.zw, h.y);\n  vec3 p2 = vec3(a1.xy, h.z);\n  vec3 p3 = vec3(a1.zw, h.w);\n\n  // Normalise gradients\n  vec4 norm =\n      _taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));\n  p0 *= norm.x;\n  p1 *= norm.y;\n  p2 *= norm.z;\n  p3 *= norm.w;\n\n  // Mix final noise value\n  vec4 m =\n      max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);\n  m = m * m;\n  return 42.0 *\n         dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));\n}\n\n/**\n * Generates 2D Fractional Brownian motion (fBm) from Simplex Noise.\n *\n * @name gln_sfbm\n * @function\n * @param {vec2} v               Point to sample fBm at.\n * @param {gln_tFBMOpts} opts    Options for generating Simplex Noise.\n * @return {float}               Value of fBm at point \"p\".\n *\n * @example\n * gln_tFBMOpts opts =\n *      gln_tFBMOpts(uSeed, 0.3, 2.0, 0.5, 1.0, 5, false, false);\n *\n * float n = gln_sfbm(position.xy, opts);\n */\nfloat gln_sfbm(vec2 v, gln_tFBMOpts opts) {\n  v += (opts.seed * 100.0);\n  float persistance = opts.persistance;\n  float lacunarity = opts.lacunarity;\n  float redistribution = opts.redistribution;\n  int octaves = opts.octaves;\n  bool terbulance = opts.terbulance;\n  bool ridge = opts.terbulance && opts.ridge;\n\n  float result = 0.0;\n  float amplitude = 1.0;\n  float frequency = 1.0;\n  float maximum = amplitude;\n\n  for (int i = 0; i < MAX_FBM_ITERATIONS; i++) {\n    if (i >= octaves)\n      break;\n\n    vec2 p = v * frequency * opts.scale;\n\n    float noiseVal = gln_simplex(p);\n\n    if (terbulance)\n      noiseVal = abs(noiseVal);\n\n    if (ridge)\n      noiseVal = -1.0 * noiseVal;\n\n    result += noiseVal * amplitude;\n\n    frequency *= lacunarity;\n    amplitude *= persistance;\n    maximum += amplitude;\n  }\n\n  float redistributed = pow(result, redistribution);\n  return redistributed / maximum;\n}\n\n/**\n * Generates 3D Fractional Brownian motion (fBm) from Simplex Noise.\n *\n * @name gln_sfbm\n * @function\n * @param {vec3} v               Point to sample fBm at.\n * @param {gln_tFBMOpts} opts    Options for generating Simplex Noise.\n * @return {float}               Value of fBm at point \"p\".\n *\n * @example\n * gln_tFBMOpts opts =\n *      gln_tFBMOpts(uSeed, 0.3, 2.0, 0.5, 1.0, 5, false, false);\n *\n * float n = gln_sfbm(position.xy, opts);\n */\nfloat gln_sfbm(vec3 v, gln_tFBMOpts opts) {\n  v += (opts.seed * 100.0);\n  float persistance = opts.persistance;\n  float lacunarity = opts.lacunarity;\n  float redistribution = opts.redistribution;\n  int octaves = opts.octaves;\n  bool terbulance = opts.terbulance;\n  bool ridge = opts.terbulance && opts.ridge;\n\n  float result = 0.0;\n  float amplitude = 1.0;\n  float frequency = 1.0;\n  float maximum = amplitude;\n\n  for (int i = 0; i < MAX_FBM_ITERATIONS; i++) {\n    if (i >= octaves)\n      break;\n\n    vec3 p = v * frequency * opts.scale;\n\n    float noiseVal = gln_simplex(p);\n\n    if (terbulance)\n      noiseVal = abs(noiseVal);\n\n    if (ridge)\n      noiseVal = -1.0 * noiseVal;\n\n    result += noiseVal * amplitude;\n\n    frequency *= lacunarity;\n    amplitude *= persistance;\n    maximum += amplitude;\n  }\n\n  float redistributed = pow(result, redistribution);\n  return redistributed / maximum;\n}"; // eslint-disable-line

var _Worley = "#define GLSLIFY 1\n// #name: Worley\n\n/**\n * @typedef {struct} gln_tWorleyOpts   Options for Voronoi Noise generators.\n * @property {float} seed               Seed for PRNG generation.\n * @property {float} distance           Size of each generated cell\n * @property {float} scale              \"Zoom level\" of generated noise.\n * @property {boolean} invert           Invert generated noise.\n */\nstruct gln_tWorleyOpts {\n  float seed;\n  float distance;\n  float scale;\n  bool invert;\n};\n\n/**\n * Generates Voronoi Noise.\n *\n * @name gln_worley\n * @function\n * @param {vec2}  x                  Point to sample Voronoi Noise at.\n * @param {gln_tWorleyOpts} opts    Options for generating Voronoi Noise.\n * @return {float}                   Value of Voronoi Noise at point \"p\".\n *\n * @example\n * gln_tWorleyOpts opts = gln_tWorleyOpts(uSeed, 0.0, 0.5, false);\n *\n * float n = gln_worley(position.xy, opts);\n */\nfloat gln_worley(vec2 point, gln_tWorleyOpts opts) {\n  vec2 p = floor(point * opts.scale);\n  vec2 f = fract(point * opts.scale);\n  float res = 0.0;\n  for (int j = -1; j <= 1; j++) {\n    for (int i = -1; i <= 1; i++) {\n      vec2 b = vec2(i, j);\n      vec2 r = vec2(b) - f + gln_rand(p + b);\n      res += 1. / pow(dot(r, r), 8.);\n    }\n  }\n\n  float result = pow(1. / res, 0.0625);\n  if (opts.invert)\n    result = 1.0 - result;\n  return result;\n}\n\n/**\n * Generates Fractional Brownian motion (fBm) from Worley Noise.\n *\n * @name gln_wfbm\n * @function\n * @param {vec3} v               Point to sample fBm at.\n * @param {gln_tFBMOpts} opts    Options for generating Simplex Noise.\n * @return {float}               Value of fBm at point \"p\".\n *\n * @example\n * gln_tFBMOpts opts =\n *      gln_tFBMOpts(1.0, 0.3, 2.0, 0.5, 1.0, 5, false, false);\n *\n * gln_tWorleyOpts voronoiOpts =\n *     gln_tWorleyOpts(1.0, 1.0, 3.0, false);\n *\n * float n = gln_wfbm(position.xy, voronoiOpts, opts);\n */\nfloat gln_wfbm(vec2 v, gln_tFBMOpts opts, gln_tWorleyOpts vopts) {\n  v += (opts.seed * 100.0);\n  float persistance = opts.persistance;\n  float lacunarity = opts.lacunarity;\n  float redistribution = opts.redistribution;\n  int octaves = opts.octaves;\n  bool terbulance = opts.terbulance;\n  bool ridge = opts.terbulance && opts.ridge;\n\n  float result = 0.0;\n  float amplitude = 1.0;\n  float frequency = 1.0;\n  float maximum = amplitude;\n\n  for (int i = 0; i < MAX_FBM_ITERATIONS; i++) {\n    if (i >= octaves)\n      break;\n\n    vec2 p = v * frequency * opts.scale;\n\n    float noiseVal = gln_worley(p, vopts);\n\n    if (terbulance)\n      noiseVal = abs(noiseVal);\n\n    if (ridge)\n      noiseVal = -1.0 * noiseVal;\n\n    result += noiseVal * amplitude;\n\n    frequency *= lacunarity;\n    amplitude *= persistance;\n    maximum += amplitude;\n  }\n\n  float redistributed = pow(result, redistribution);\n  return redistributed / maximum;\n}\n"; // eslint-disable-line

var _BlendModes = "#define GLSLIFY 1\n// #name: BlendModes\n\n#define gln_COPY 1\n#define gln_ADD 2\n#define gln_SUBSTRACT 3\n#define gln_MULTIPLY 4\n#define gln_ADDSUB 5\n#define gln_LIGHTEN 6\n#define gln_DARKEN 7\n#define gln_SWITCH 8\n#define gln_DIVIDE 9\n#define gln_OVERLAY 10\n#define gln_SCREEN 11\n#define gln_SOFTLIGHT 12\n\nfloat gln_softLight(float f, float b) {\n  return (f < 0.5)\n             ? b - (1.0 - 2.0 * f) * b * (1.0 - b)\n             : (b < 0.25)\n                   ? b + (2.0 * f - 1.0) * b * ((16.0 * b - 12.0) * b + 3.0)\n                   : b + (2.0 * f - 1.0) * (sqrt(b) - b);\n}\n\nvec4 gln_softLight(vec4 f, vec4 b) {\n  vec4 result;\n  result.x = gln_softLight(f.x, b.x);\n  result.y = gln_softLight(f.y, b.y);\n  result.z = gln_softLight(f.z, b.z);\n  result.a = gln_softLight(f.a, b.a);\n  return result;\n}\n\nvec4 gln_screen(vec4 f, vec4 b) {\n  vec4 result;\n\n  result = 1.0 - (1.0 - f) * (1.0 - b);\n\n  return result;\n}\n\nfloat gln_overlay(float f, float b) {\n  return (b < 0.5) ? 2.0 * f * b : 1.0 - 2.0 * (1.0 - f) * (1.0 - b);\n}\n\nvec4 gln_overlay(vec4 f, vec4 b) {\n  vec4 result;\n  result.x = gln_overlay(f.x, b.x);\n  result.y = gln_overlay(f.y, b.y);\n  result.z = gln_overlay(f.z, b.z);\n  result.a = gln_overlay(f.a, b.a);\n  return result;\n}\n\nvec4 gln_divide(vec4 f, vec4 b) {\n  vec4 result = vec4(0.0);\n\n  result = b / f;\n\n  return result;\n}\n\nvec4 gln_switch(vec4 f, vec4 b, float o) {\n  vec4 result = vec4(0.0);\n\n  result = max((f * o), (b * (1.0 - o)));\n\n  return result;\n}\n\nvec4 gln_darken(vec4 f, vec4 b) {\n  vec4 result = vec4(0.0);\n\n  result = min(f, b);\n\n  return result;\n}\n\nvec4 gln_lighten(vec4 f, vec4 b) {\n  vec4 result = vec4(0.0);\n\n  result = max(f, b);\n\n  return result;\n}\n\nfloat gln_addSub(float f, float b) { return f > 0.5 ? f + b : b - f; }\n\nvec4 gln_addSub(vec4 f, vec4 b) {\n  vec4 result = vec4(0.0);\n\n  result.r = gln_addSub(f.r, b.r);\n  result.g = gln_addSub(f.g, b.g);\n  result.b = gln_addSub(f.b, b.b);\n  result.a = gln_addSub(f.a, b.a);\n\n  return result;\n}\n\nvec4 gln_multiply(vec4 f, vec4 b) {\n  vec4 result = vec4(0.0);\n\n  result = f * b;\n  result.a = f.a + b.a * (1.0 - f.a);\n\n  return result;\n}\n\nvec4 gln_subtract(vec4 f, vec4 b) {\n  vec4 result = vec4(0.0);\n\n  result = b - f;\n  result.a = f.a + b.a * (1.0 - f.a);\n\n  return result;\n}\n\nvec4 gln_add(vec4 f, vec4 b) {\n  vec4 result = vec4(0.0);\n\n  result = f + b;\n  result.a = f.a + b.a * (1.0 - f.a);\n\n  return result;\n}\n\nvec4 gln_copy(vec4 f, vec4 b) {\n  vec4 result = vec4(0.0);\n\n  result.a = f.a + b.a * (1.0 - f.a);\n  result.rgb = ((f.rgb * f.a) + (b.rgb * b.a) * (1.0 - f.a));\n\n  return result;\n}\n\n/**\n * Enum for gl-Noise Blend Modes.\n * @name gln_BLENDMODES\n * @enum {number}\n * @property {number} gln_COPY The <b>Copy</b> blending mode will just place the\n * foreground on top of the background.\n * @property {number} gln_ADD The <b>Add</b> blending mode will add the\n * foreground input value to each corresponding pixel in the background.\n * @property {number} gln_SUBSTRACT The <b>Substract</b> blending mode will\n * substract the foreground input value from each corresponding pixel in the\n * background.\n * @property {number} gln_MULTIPLY The <b>Multiply</b> blending mode will\n * multiply the background input value by each corresponding pixel in the\n * foreground.\n * @property {number} gln_ADDSUB The <b>Add Sub</b> blending mode works as\n * following: <ul> <li> Foreground pixels with a value higher than 0.5 are added\n * to their respective background pixels. </li> <li> Foreground pixels with a\n * value lower than 0.5 are substracted from their respective background pixels.\n * </li>\n * </ul>\n * @property {number} gln_LIGHTEN The <b>Lighten (Max)</b> Blending mode will\n * pick the higher value between the background and the foreground.\n * @property {number} gln_DARKEN The <b>Darken (Min)</b> Blending mode will pick\n * the lower value between the background and the foreground.\n * @property {number} gln_DIVIDE The <b>Divide</b> blending mode will divide the\n * background input pixels value by each corresponding pixel in the foreground.\n * @property {number} gln_OVERLAY The <b>Overlay</b> blending mode combines\n * Multiply and Screen blend modes: <ul> <li> If the value of the lower layer\n * pixel is below 0.5, then a Multiply type blending is applied. </li> <li> If\n * the value of the lower layer pixel is above 0.5, then a Screen type blending\n * is applied. </li>\n * </ul>\n * @property {number} gln_SCREEN With <b>Screen</b> blend mode the values of the\n * pixels in the two inputs are inverted, multiplied, and then inverted\n * again.</br>The result is the opposite effect to multiply and is always equal\n * or higher (brighter) compared to the original.\n * @property {number} gln_SOFTLIGHT The <b>Soft Light</b> blend mode creates a\n * subtle lighter or darker result depending on the brightness of the foreground\n * color.\n * </br>Blend colors that are more than 50% brightness will lighten the\n * background pixels and colors that are less than 50% brightness will darken\n * the background pixels.\n */\n\n/**\n * Blends a Color with another.\n *\n * @name gln_blend\n * @function\n * @param {vec4} f  Foreground\n * @param {vec4} b  Background\n * @param {gln_BLENDMODES} type  Blend mode\n * @return {vec4} Mapped Value\n *\n * @example\n * vec4 logo = texture2D(uLogo, uv);\n * vec4 rect = texture2D(uRect, uv);\n *\n * vec4 final = gln_blend(logo, rect, gln_COPY);\n */\nvec4 gln_blend(vec4 f, vec4 b, int type) {\n\n  vec4 n;\n\n  if (type == gln_COPY) {\n    n = gln_copy(f, b);\n  } else if (type == gln_ADD) {\n    n = gln_add(f, b);\n  } else if (type == gln_SUBSTRACT) {\n    n = gln_subtract(f, b);\n  } else if (type == gln_MULTIPLY) {\n    n = gln_multiply(f, b);\n  } else if (type == gln_ADDSUB) {\n    n = gln_addSub(f, b);\n  } else if (type == gln_LIGHTEN) {\n    n = gln_lighten(f, b);\n  } else if (type == gln_DARKEN) {\n    n = gln_darken(f, b);\n  } else if (type == gln_DIVIDE) {\n    n = gln_divide(f, b);\n  } else if (type == gln_OVERLAY) {\n    n = gln_overlay(f, b);\n  } else if (type == gln_SCREEN) {\n    n = gln_screen(f, b);\n  } else if (type == gln_SOFTLIGHT) {\n    n = gln_softLight(f, b);\n  }\n\n  return n;\n}"; // eslint-disable-line

var _Common = "#define GLSLIFY 1\n// #name: Common\n\n#define MAX_FBM_ITERATIONS 30\n#define gln_PI 3.1415926538\nvec4 _permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }\nvec4 _taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }\n\n/**\n * @typedef {struct} gln_tFBMOpts   Options for fBm generators.\n * @property {float} seed           Seed for PRNG generation.\n * @property {float} persistance    Factor by which successive layers of noise\n * will decrease in amplitude.\n * @property {float} lacunarity     Factor by which successive layers of noise\n * will increase in frequency.\n * @property {float} scale          \"Zoom level\" of generated noise.\n * @property {float} redistribution Flatness in the generated noise.\n * @property {int} octaves          Number of layers of noise to stack.\n * @property {boolean} terbulance   Enable terbulance\n * @property {boolean} ridge        Convert the fBm to Ridge Noise. Only works\n * when \"terbulance\" is set to true.\n */\nstruct gln_tFBMOpts {\n  float seed;\n  float persistance;\n  float lacunarity;\n  float scale;\n  float redistribution;\n  int octaves;\n  bool terbulance;\n  bool ridge;\n};\n\n/**\n * Converts a number from one range to another.\n *\n * @name gln_map\n * @function\n * @param {} value      Value to map\n * @param {float} min1  Minimum for current range\n * @param {float} max1  Maximum for current range\n * @param {float} min2  Minimum for wanted range\n * @param {float} max2  Maximum for wanted range\n * @return {float} Mapped Value\n *\n * @example\n * float n = gln_map(-0.2, -1.0, 1.0, 0.0, 1.0);\n * // n = 0.4\n */\nfloat gln_map(float value, float min1, float max1, float min2, float max2) {\n  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);\n}\n\n/**\n * Normalized a value from the range [-1, 1] to the range [0,1].\n *\n * @name gln_normalize\n * @function\n * @param {float} v Value to normalize\n * @return {float} Normalized Value\n *\n * @example\n * float n = gln_normalize(-0.2);\n * // n = 0.4\n */\nfloat gln_normalize(float v) { return gln_map(v, -1.0, 1.0, 0.0, 1.0); }\n\n/**\n * Generates a random 2D Vector.\n *\n * @name gln_rand2\n * @function\n * @param {vec2} p Vector to hash to generate the random numbers from.\n * @return {vec2} Random vector.\n *\n * @example\n * vec2 n = gln_rand2(vec2(1.0, -4.2));\n */\nvec2 gln_rand2(vec2 p) {\n  return fract(\n      sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) *\n      43758.5453);\n}\n\n/**\n * Generates a random 3D Vector.\n *\n * @name gln_rand3\n * @function\n * @param {vec3} p Vector to hash to generate the random numbers from.\n * @return {vec3} Random vector.\n *\n * @example\n * vec3 n = gln_rand3(vec3(1.0, -4.2, 0.2));\n */\nvec3 gln_rand3(vec3 p) { return mod(((p * 34.0) + 1.0) * p, 289.0); }\n\n/**\n * Generates a random 4D Vector.\n *\n * @name gln_rand4\n * @function\n * @param {vec4} p Vector to hash to generate the random numbers from.\n * @return {vec4} Random vector.\n *\n * @example\n * vec4 n = gln_rand4(vec4(1.0, -4.2, 0.2, 2.2));\n */\nvec4 gln_rand4(vec4 p) { return mod(((p * 34.0) + 1.0) * p, 289.0); }\n\n/**\n * Generates a random number.\n *\n * @name gln_rand\n * @function\n * @param {float} n Value to hash to generate the number from.\n * @return {float} Random number.\n *\n * @example\n * float n = gln_rand(2.5);\n */\nfloat gln_rand(float n) { return fract(sin(n) * 1e4); }\n\n/**\n * Generates a random number.\n *\n * @name gln_rand\n * @function\n * @param {vec2} p Value to hash to generate the number from.\n * @return {float} Random number.\n *\n * @example\n * float n = gln_rand(vec2(2.5, -1.8));\n */\nfloat gln_rand(vec2 p) {\n  return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) *\n               (0.1 + abs(sin(p.y * 13.0 + p.x))));\n}\n"; // eslint-disable-line

var _GerstnerWave = "#define GLSLIFY 1\n// #name: GerstnerWave\n\n/**\n * @typedef {struct} gln_tGerstnerWaveOpts   Options for Gerstner Wave\n * generators.\n * @property {vec2} direction               Direction of the wave\n * @property {float} steepness              Steepness of the peeks\n * @property {float} wavelength             Wavelength of the waves\n */\nstruct gln_tGerstnerWaveOpts {\n  vec2 direction;\n  float steepness;\n  float wavelength;\n};\n\n/**\n * Implimentation of Gerstner Wave\n * Based on: https://catlikecoding.com/unity/tutorials/flow/waves/\n *\n * @name gln_GerstnerWave\n * @function\n * @param {vec3} p Point to sample Gerstner Waves at.\n * @param {gln_tGerstnerWaveOpts} opts\n * @param {float} dt\n *\n * @example\n * float n = gln_perlin(position.xy);\n */\nvec3 gln_GerstnerWave(vec3 p, gln_tGerstnerWaveOpts opts, float dt) {\n  float steepness = opts.steepness;\n  float wavelength = opts.wavelength;\n  float k = 2.0 * gln_PI / wavelength;\n  float c = sqrt(9.8 / k);\n  vec2 d = normalize(opts.direction);\n  float f = k * (dot(d, p.xy) - c * dt);\n  float a = steepness / k;\n\n  return vec3(d.x * (a * cos(f)), a * sin(f), d.y * (a * cos(f)));\n}\n"; // eslint-disable-line

var _Curl = "#define GLSLIFY 1\n// #name: Curl\n// #deps: Simplex\n\nvec3 _snois3(vec3 x) {\n  float s = gln_simplex(vec3(x));\n  float s1 = gln_simplex(vec3(x.y - 19.1, x.z + 33.4, x.x + 47.2));\n  float s2 = gln_simplex(vec3(x.z + 74.2, x.x - 124.5, x.y + 99.4));\n  vec3 c = vec3(s, s1, s2);\n  return c;\n}\n\n/**\n * Generates 3D Curl Noise.\n *\n * @name gln_curl\n * @function\n * @param {vec2} p  Point to sample Curl Noise at.\n * @return {float}  Value of Curl Noise at point \"p\".\n *\n * @example\n * vec3 n = gln_curl(position);\n */\nvec3 gln_curl(vec3 p) {\n  const float e = .1;\n  vec3 dx = vec3(e, 0.0, 0.0);\n  vec3 dy = vec3(0.0, e, 0.0);\n  vec3 dz = vec3(0.0, 0.0, e);\n\n  vec3 p_x0 = _snois3(p - dx);\n  vec3 p_x1 = _snois3(p + dx);\n  vec3 p_y0 = _snois3(p - dy);\n  vec3 p_y1 = _snois3(p + dy);\n  vec3 p_z0 = _snois3(p - dz);\n  vec3 p_z1 = _snois3(p + dz);\n\n  float x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;\n  float y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;\n  float z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;\n\n  const float divisor = 1.0 / (2.0 * e);\n  return normalize(vec3(x, y, z) * divisor);\n}"; // eslint-disable-line

const Perlin = _Perlin;
const Simplex = _Simplex;
const Worley = _Worley;
const BlendModes = _BlendModes;
const Common = _Common;
const GerstnerWave = _GerstnerWave;
const Curl = _Curl;
const _all = [Perlin, Simplex, Worley, BlendModes, GerstnerWave, Curl];
const All = _all;
const isNode = typeof process !== "undefined" && process.versions != null && process.versions.node != null;
//~START~
async function nodeFetch(s) {
    // @ts-ignore
    const fs = await import('fs');
    // @ts-ignore
    const path = (await import('path')).default;
    const f = fs.readFileSync(path.resolve(s));
    return {
        text: async function () {
            return f.toString();
        },
    };
}
//~END~
function getDeps(chunks) {
    let names = [];
    let deps = [];
    chunks.forEach((chunk) => {
        const name = chunk.match(/#name: (.*)\n/);
        const dep = chunk.match(/#deps: (.*)\n/);
        names.push(name ? name[1] : undefined);
        deps.push(dep ? dep[1].split(" ") : []);
    });
    return { names, deps };
}
function verifyDeps(chunks) {
    const { names, deps } = getDeps(chunks);
    let missing_dependancy = [];
    let missing_dependant;
    deps.forEach((dep, i) => {
        dep.forEach((d, j) => {
            if (!names.includes(d)) {
                missing_dependancy.push({
                    outter: i,
                    inner: j,
                });
                missing_dependant = names[i];
            }
        });
    });
    if (missing_dependancy.length !== 0) {
        const dependancies = missing_dependancy.map((e) => deps[e.outter][e.inner]);
        throw new Error(`glNoise: Missing dependencies "${dependancies.join(", ")}" for "${missing_dependant}"`);
    }
}
/**
 * Loads Shaders without appeneding any Shader Chunks.
 *
 * @async
 * @param {string[]} shaders Array of paths to shaders.
 * @returns {Promise<string[]>}         Array of shaders corresponding to each path.
 *
 * @example
 * const [vert, frag] = await loadShadersRaw(["vert.glsl", "frag.glsl"]);
 */
async function loadShadersRaw(shaders) {
    const _fetch = isNode ? nodeFetch : window.fetch;
    return Promise.all(shaders.map(async (s) => {
        return (await _fetch(s)).text();
    }));
}
/**
 * Loads shaders with specified Shader Chunks.
 * If chunks not specified, all chunks will be appended.
 *
 * @async
 * @param {string[]} paths      Array of Paths to shaders.
 * @param {string[][]} chunks   Array of chunks to append to each shader
 * @param {string[]} headers    Array of headers to be appended to each shader. Can be used to provide precision;
 * @returns {Promise<string[]>}          Array of shaders corresponding to each path with respective chunks applied.
 *
 * @example
 * const head = `
 * precision highp float;
 * ${Common}
 * `;
 *
 * const chunks = [
 *      [Perlin, Simplex],
 *      []
 * ];
 * const paths = [
 *      "vert.glsl",
 *      "frag.glsl",
 * ];
 * const [vert, frag] = await loadShaders(paths, chunks, head);
 */
async function loadShaders(paths, chunks, headers) {
    if (!paths || paths.length <= 0)
        throw new Error("glNoise: LoadShaders requires atleast one path.");
    if (!headers)
        headers = new Array(paths.length).fill(Common);
    let shaders = await loadShadersRaw(paths);
    if (chunks) {
        shaders = shaders.map((s, i) => {
            let c;
            if (chunks[i])
                c = chunks[i];
            else
                c = _all;
            verifyDeps(c);
            let h;
            if (headers[i])
                h = headers[i];
            else
                h = Common;
            return h + c.join("\n") + "\n" + s;
        });
    }
    else {
        shaders = shaders.map((s, i) => {
            let h;
            if (headers[i])
                h = headers[i];
            else
                h = Common;
            return h + _all.join("\n") + "\n" + s;
        });
    }
    return shaders;
}
/**
 * Loads shaders with Shader Chunks for use with [THREE-CustomShaderMaterial.]{@link https://github.com/FarazzShaikh/THREE-CustomShaderMaterial}
 * If chunks not specified, all chunks will be appended.
 *
 * @async
 * @param {Object} shaders              Paths of shaders.
 * * @param {string} shaders.defines        Path of definitions shader.
 * * @param {string} shaders.header         Path of header shader.
 * * @param {string} shaders.main           Path of main shader.
 * @param {string[]} chunks             Array of chunks to append into the Header Section.
 * @returns {Promise<Object>}                    CSM friendly shader.
 *
 * @example
 * const chunks =  [Perlin, Simplex];
 * const paths = [
 *      defines: "defines.glsl",
 *      header: "header.glsl",
 *      main: "main.glsl",
 * ];
 * const {defines, header, main} = await loadShadersCSM(paths, chunks);
 */
async function loadShadersCSM(shaders, chunks) {
    const _fetch = isNode ? nodeFetch : window.fetch;
    let _defines = "", _header = "", _main = "";
    if (shaders.defines)
        _defines = await (await _fetch(shaders.defines)).text();
    if (shaders.header)
        _header = await (await _fetch(shaders.header)).text();
    if (shaders.main)
        _main = await (await _fetch(shaders.main)).text();
    if (!chunks)
        return {
            defines: _defines + Common,
            header: _all.join("\n") + "\n" + _header,
            main: _main,
        };
    verifyDeps(chunks);
    return {
        defines: _defines + Common,
        header: chunks.join("\n") + "\n" + _header,
        main: _main,
    };
}

export { All, BlendModes, Common, Curl, GerstnerWave, Perlin, Simplex, Worley, loadShaders, loadShadersCSM, loadShadersRaw };