var glNoise = (function (exports) {
  'use strict';

  var _Perlin = "#define GLSLIFY 1\nvec2 _fade(vec2 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }\nvec3 _fade(vec3 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }\n\n/**\n * Generats Perlin Noise.\n *\n * @name gln_perlin\n * @function\n * @param {vec2} p  Point to sample Perlin Noise at.\n * @return {float}  Value of Perlin Noise at point \"p\".\n *\n * @example\n * float n = gln_perlin(position.xy);\n */\nfloat gln_perlin(vec2 P) {\n  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);\n  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);\n  Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation\n  vec4 ix = Pi.xzxz;\n  vec4 iy = Pi.yyww;\n  vec4 fx = Pf.xzxz;\n  vec4 fy = Pf.yyww;\n  vec4 i = gln_rand4(gln_rand4(ix) + iy);\n  vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...\n  vec4 gy = abs(gx) - 0.5;\n  vec4 tx = floor(gx + 0.5);\n  gx = gx - tx;\n  vec2 g00 = vec2(gx.x, gy.x);\n  vec2 g10 = vec2(gx.y, gy.y);\n  vec2 g01 = vec2(gx.z, gy.z);\n  vec2 g11 = vec2(gx.w, gy.w);\n  vec4 norm =\n      1.79284291400159 - 0.85373472095314 * vec4(dot(g00, g00), dot(g01, g01),\n                                                 dot(g10, g10), dot(g11, g11));\n  g00 *= norm.x;\n  g01 *= norm.y;\n  g10 *= norm.z;\n  g11 *= norm.w;\n  float n00 = dot(g00, vec2(fx.x, fy.x));\n  float n10 = dot(g10, vec2(fx.y, fy.y));\n  float n01 = dot(g01, vec2(fx.z, fy.z));\n  float n11 = dot(g11, vec2(fx.w, fy.w));\n  vec2 fade_xy = _fade(Pf.xy);\n  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);\n  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);\n  return 2.3 * n_xy;\n}\n\nfloat gln_perlin(vec3 P) {\n  vec3 Pi0 = floor(P);        // Integer part for indexing\n  vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1\n  Pi0 = mod(Pi0, 289.0);\n  Pi1 = mod(Pi1, 289.0);\n  vec3 Pf0 = fract(P);        // Fractional part for interpolation\n  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0\n  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);\n  vec4 iy = vec4(Pi0.yy, Pi1.yy);\n  vec4 iz0 = Pi0.zzzz;\n  vec4 iz1 = Pi1.zzzz;\n\n  vec4 ixy = _permute(_permute(ix) + iy);\n  vec4 ixy0 = _permute(ixy + iz0);\n  vec4 ixy1 = _permute(ixy + iz1);\n\n  vec4 gx0 = ixy0 / 7.0;\n  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;\n  gx0 = fract(gx0);\n  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);\n  vec4 sz0 = step(gz0, vec4(0.0));\n  gx0 -= sz0 * (step(0.0, gx0) - 0.5);\n  gy0 -= sz0 * (step(0.0, gy0) - 0.5);\n\n  vec4 gx1 = ixy1 / 7.0;\n  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;\n  gx1 = fract(gx1);\n  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);\n  vec4 sz1 = step(gz1, vec4(0.0));\n  gx1 -= sz1 * (step(0.0, gx1) - 0.5);\n  gy1 -= sz1 * (step(0.0, gy1) - 0.5);\n\n  vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);\n  vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);\n  vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);\n  vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);\n  vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);\n  vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);\n  vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);\n  vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);\n\n  vec4 norm0 = _taylorInvSqrt(\n      vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));\n  g000 *= norm0.x;\n  g010 *= norm0.y;\n  g100 *= norm0.z;\n  g110 *= norm0.w;\n  vec4 norm1 = _taylorInvSqrt(\n      vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));\n  g001 *= norm1.x;\n  g011 *= norm1.y;\n  g101 *= norm1.z;\n  g111 *= norm1.w;\n\n  float n000 = dot(g000, Pf0);\n  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));\n  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));\n  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));\n  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));\n  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));\n  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));\n  float n111 = dot(g111, Pf1);\n\n  vec3 fade_xyz = _fade(Pf0);\n  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111),\n                 fade_xyz.z);\n  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);\n  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);\n  return 2.2 * n_xyz;\n}\n\n/**\n * Generats Fractional Brownian motion (fBm) from Perlin Noise.\n *\n * @name gln_pfbm\n * @function\n * @param {vec2} p               Point to sample fBm at.\n * @param {gln_tFBMOpts} opts    Options for generating Perlin Noise.\n * @return {float}               Value of fBm at point \"p\".\n *\n * @example\n * gln_tFBMOpts opts =\n *      gln_tFBMOpts(uSeed, 0.3, 2.0, 0.5, 1.0, 5, false, false);\n *\n * float n = gln_pfbm(position.xy, opts);\n */\nfloat gln_pfbm(vec2 p, gln_tFBMOpts opts) {\n  p += (opts.seed * 100.0);\n  float persistance = opts.persistance;\n  float lacunarity = opts.lacunarity;\n  float redistribution = opts.redistribution;\n  int octaves = opts.octaves;\n  bool terbulance = opts.terbulance;\n  bool ridge = opts.terbulance && opts.ridge;\n\n  float result = 0.0;\n  float amplitude = 1.0;\n  float frequency = 1.0;\n  float maximum = amplitude;\n\n  for (int i = 0; i < MAX_FBM_ITERATIONS; i++) {\n    if (i >= octaves)\n      break;\n\n    vec2 p = p.xy * frequency * opts.scale;\n\n    float noiseVal = gln_perlin(p);\n\n    if (terbulance)\n      noiseVal = abs(noiseVal);\n\n    if (ridge)\n      noiseVal = -1.0 * noiseVal;\n\n    result += noiseVal * amplitude;\n\n    frequency *= lacunarity;\n    amplitude *= persistance;\n    maximum += amplitude;\n  }\n\n  float redistributed = pow(result, redistribution);\n  return redistributed / maximum;\n}"; // eslint-disable-line

  var _Simplex = "#define GLSLIFY 1\n\n/**\n * Generats Simplex Noise.\n *\n * @name gln_simplex\n * @function\n * @param {vec2} v  Point to sample Simplex Noise at.\n * @return {float}  Value of Simplex Noise at point \"p\".\n *\n * @example\n * float n = gln_simplex(position.xy);\n */\nfloat gln_simplex(vec2 v) {\n  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626,\n                      0.024390243902439);\n  vec2 i = floor(v + dot(v, C.yy));\n  vec2 x0 = v - i + dot(i, C.xx);\n  vec2 i1;\n  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);\n  vec4 x12 = x0.xyxy + C.xxzz;\n  x12.xy -= i1;\n  i = mod(i, 289.0);\n  vec3 p = gln_rand3(gln_rand3(i.y + vec3(0.0, i1.y, 1.0)) + i.x +\n                     vec3(0.0, i1.x, 1.0));\n  vec3 m = max(\n      0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);\n  m = m * m;\n  m = m * m;\n  vec3 x = 2.0 * fract(p * C.www) - 1.0;\n  vec3 h = abs(x) - 0.5;\n  vec3 ox = floor(x + 0.5);\n  vec3 a0 = x - ox;\n  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);\n  vec3 g;\n  g.x = a0.x * x0.x + h.x * x0.y;\n  g.yz = a0.yz * x12.xz + h.yz * x12.yw;\n  return 130.0 * dot(m, g);\n}\n\nfloat gln_simplex(vec3 v) {\n  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);\n  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);\n\n  // First corner\n  vec3 i = floor(v + dot(v, C.yyy));\n  vec3 x0 = v - i + dot(i, C.xxx);\n\n  // Other corners\n  vec3 g = step(x0.yzx, x0.xyz);\n  vec3 l = 1.0 - g;\n  vec3 i1 = min(g.xyz, l.zxy);\n  vec3 i2 = max(g.xyz, l.zxy);\n\n  //  x0 = x0 - 0. + 0.0 * C\n  vec3 x1 = x0 - i1 + 1.0 * C.xxx;\n  vec3 x2 = x0 - i2 + 2.0 * C.xxx;\n  vec3 x3 = x0 - 1. + 3.0 * C.xxx;\n\n  // Permutations\n  i = mod(i, 289.0);\n  vec4 p = _permute(_permute(_permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y +\n                             vec4(0.0, i1.y, i2.y, 1.0)) +\n                    i.x + vec4(0.0, i1.x, i2.x, 1.0));\n\n  // Gradients\n  // ( N*N points uniformly over a square, mapped onto an octahedron.)\n  float n_ = 1.0 / 7.0; // N=7\n  vec3 ns = n_ * D.wyz - D.xzx;\n\n  vec4 j = p - 49.0 * floor(p * ns.z * ns.z); //  mod(p,N*N)\n\n  vec4 x_ = floor(j * ns.z);\n  vec4 y_ = floor(j - 7.0 * x_); // mod(j,N)\n\n  vec4 x = x_ * ns.x + ns.yyyy;\n  vec4 y = y_ * ns.x + ns.yyyy;\n  vec4 h = 1.0 - abs(x) - abs(y);\n\n  vec4 b0 = vec4(x.xy, y.xy);\n  vec4 b1 = vec4(x.zw, y.zw);\n\n  vec4 s0 = floor(b0) * 2.0 + 1.0;\n  vec4 s1 = floor(b1) * 2.0 + 1.0;\n  vec4 sh = -step(h, vec4(0.0));\n\n  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;\n  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;\n\n  vec3 p0 = vec3(a0.xy, h.x);\n  vec3 p1 = vec3(a0.zw, h.y);\n  vec3 p2 = vec3(a1.xy, h.z);\n  vec3 p3 = vec3(a1.zw, h.w);\n\n  // Normalise gradients\n  vec4 norm =\n      _taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));\n  p0 *= norm.x;\n  p1 *= norm.y;\n  p2 *= norm.z;\n  p3 *= norm.w;\n\n  // Mix final noise value\n  vec4 m =\n      max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);\n  m = m * m;\n  return 42.0 *\n         dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));\n}\n\n/**\n * Generats Fractional Brownian motion (fBm) from Simplex Noise.\n *\n * @name gln_sfbm\n * @function\n * @param {vec2} v               Point to sample fBm at.\n * @param {gln_tFBMOpts} opts    Options for generating Simplex Noise.\n * @return {float}               Value of fBm at point \"p\".\n *\n * @example\n * gln_tFBMOpts opts =\n *      gln_tFBMOpts(uSeed, 0.3, 2.0, 0.5, 1.0, 5, false, false);\n *\n * float n = gln_sfbm(position.xy, opts);\n */\nfloat gln_sfbm(vec2 v, gln_tFBMOpts opts) {\n  v += (opts.seed * 100.0);\n  float persistance = opts.persistance;\n  float lacunarity = opts.lacunarity;\n  float redistribution = opts.redistribution;\n  int octaves = opts.octaves;\n  bool terbulance = opts.terbulance;\n  bool ridge = opts.terbulance && opts.ridge;\n\n  float result = 0.0;\n  float amplitude = 1.0;\n  float frequency = 1.0;\n  float maximum = amplitude;\n\n  for (int i = 0; i < MAX_FBM_ITERATIONS; i++) {\n    if (i >= octaves)\n      break;\n\n    vec2 p = v.xy * frequency * opts.scale;\n\n    float noiseVal = gln_simplex(p);\n\n    if (terbulance)\n      noiseVal = abs(noiseVal);\n\n    if (ridge)\n      noiseVal = -1.0 * noiseVal;\n\n    result += noiseVal * amplitude;\n\n    frequency *= lacunarity;\n    amplitude *= persistance;\n    maximum += amplitude;\n  }\n\n  float redistributed = pow(result, redistribution);\n  return redistributed / maximum;\n}"; // eslint-disable-line

  var _Voronoi = "#define GLSLIFY 1\n\n/**\n * Generats Voronoi Noise.\n *\n * @name gln_voronoi\n * @function\n * @param {vec2}  x                  Point to sample Voronoi Noise at.\n * @param {gln_tVoronoiOpts} opts    Options for generating Voronoi Noise.\n * @return {float}                   Value of Voronoi Noise at point \"p\".\n *\n * @example\n * gln_tVoronoiOpts opts = gln_tVoronoiOpts(uSeed, 0.0, 0.5, false);\n *\n * float n = gln_voronoi(position.xy, opts);\n */\nfloat gln_voronoi(vec2 x, gln_tVoronoiOpts opts) {\n  vec2 p = floor(x * opts.scale + (opts.seed * 1000.0));\n  vec2 f = fract(x * opts.scale + (opts.seed * 1000.0));\n\n  float min_dist = 1.0 - opts.distance; // distance\n\n  for (int j = -1; j <= 1; j++)\n    for (int i = -1; i <= 1; i++) {\n\n      vec2 neighbor = vec2(float(i), float(j));\n\n      vec2 point = gln_rand2(p + neighbor);\n\n      vec2 diff = neighbor + point - f;\n\n      float dist = length(diff) * 1.0;\n\n      min_dist = min(min_dist, dist);\n    }\n\n  if (opts.invert)\n    return 1.0 - min_dist;\n  else\n    return min_dist;\n}\n"; // eslint-disable-line

  var _Common = "#define GLSLIFY 1\n#define MAX_FBM_ITERATIONS 30\nvec4 _permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }\nvec4 _taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }\n\n/**\n * @typedef {struct} gln_tFBMOpts   Options for fBm generators.\n * @property {float} seed           Seed for PRNG generation.\n * @property {float} persistance    Factor by which successive layers of noise\n * will decrease in amplitude.\n * @property {float} lacunarity     Factor by which successive layers of noise\n * will increase in frequency.\n * @property {float} scale          \"Zoom level\" of generated noise.\n * @property {float} redistribution Flatness in the generated noise.\n * @property {int} octaves          Number of layers of noise to stack.\n * @property {boolean} terbulance   Enable terbulance\n * @property {boolean} ridge        Convert the fBm to Ridge Noise. Only works\n * when \"terbulance\" is set to true.\n */\nstruct gln_tFBMOpts // user defined structure.\n{\n  float seed;\n  float persistance;\n  float lacunarity;\n  float scale;\n  float redistribution;\n  int octaves;\n  bool terbulance;\n  bool ridge;\n};\n\n/**\n * @typedef {struct} gln_tVoronoiOpts   Options for Voronoi Noise generators.\n * @property {float} seed               Seed for PRNG generation.\n * @property {float} distance           Size of each generated cell\n * @property {float} scale              \"Zoom level\" of generated noise.\n * @property {boolean} invert           Invert generated noise.\n */\nstruct gln_tVoronoiOpts // user defined structure.\n{\n  float seed;\n  float distance;\n  float scale;\n  bool invert;\n};\n\n/**\n * Converts a number from one range to another.\n *\n * @name gln_map\n * @function\n * @param {} value      Value to map\n * @param {float} min1  Minimum for current range\n * @param {float} max1  Maximum for current range\n * @param {float} min2  Minimum for wanted range\n * @param {float} max2  Maximum for wanted range\n * @return {float} Mapped Value\n *\n * @example\n * float n = gln_map(-0.2, -1.0, 1.0, 0.0, 1.0);\n * // n = 0.4\n */\nfloat gln_map(float value, float min1, float max1, float min2, float max2) {\n  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);\n}\n\n/**\n * Normalized a value from the range [-1, 1] to the range [0,1].\n *\n * @name gln_normalize\n * @function\n * @param {float} v Value to normalize\n * @return {float} Normalized Value\n *\n * @example\n * float n = gln_normalize(-0.2);\n * // n = 0.4\n */\nfloat gln_normalize(float v) { return gln_map(v, -1.0, 1.0, 0.0, 1.0); }\n\n/**\n * Generats a random 2D Vector.\n *\n * @name gln_rand2\n * @function\n * @param {vec2} p Vector to hash to generate the random numbers from.\n * @return {vec2} Random vector.\n *\n * @example\n * vec2 n = gln_rand2(vec2(1.0, -4.2));\n */\nvec2 gln_rand2(vec2 p) {\n  return fract(\n      sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) *\n      43758.5453);\n}\n\n/**\n * Generats a random 3D Vector.\n *\n * @name gln_rand3\n * @function\n * @param {vec3} p Vector to hash to generate the random numbers from.\n * @return {vec3} Random vector.\n *\n * @example\n * vec3 n = gln_rand3(vec3(1.0, -4.2, 0.2));\n */\nvec3 gln_rand3(vec3 p) { return mod(((p * 34.0) + 1.0) * p, 289.0); }\n\n/**\n * Generats a random 4D Vector.\n *\n * @name gln_rand4\n * @function\n * @param {vec4} p Vector to hash to generate the random numbers from.\n * @return {vec4} Random vector.\n *\n * @example\n * vec4 n = gln_rand4(vec4(1.0, -4.2, 0.2, 2.2));\n */\nvec4 gln_rand4(vec4 p) { return mod(((p * 34.0) + 1.0) * p, 289.0); }\n\n/**\n * Generats a random number.\n *\n * @name gln_rand\n * @function\n * @param {float} n Value to hash to generate the number from.\n * @return {float} Random number.\n *\n * @example\n * float n = gln_rand(2.5);\n */\nfloat gln_rand(float n) { return fract(sin(n) * 1e4); }\n\n/**\n * Generats a random number.\n *\n * @name gln_rand\n * @function\n * @param {vec2} p Value to hash to generate the number from.\n * @return {float} Random number.\n *\n * @example\n * float n = gln_rand(vec2(2.5, -1.8));\n */\nfloat gln_rand(vec2 p) {\n  return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) *\n               (0.1 + abs(sin(p.y * 13.0 + p.x))));\n}\n"; // eslint-disable-line

  const _Head = "precision highp float;\n" + _Common + "\n";
  const Perlin = _Perlin;
  const Simplex = _Simplex;
  const Voronoi = _Voronoi;
  const Head = _Head;
  const _all = [Perlin, Simplex, Voronoi];
  const isNode = typeof process !== "undefined" &&
      process.versions != null &&
      process.versions.node != null;
  async function nodeFetch(s) {
      // @ts-ignore
      const fs = (await import('fs/promises')).default;
      // @ts-ignore
      const path = (await import('path')).default;
      const f = (await fs.readFile(path.resolve(s))).toString();
      return {
          text: async function () {
              return f;
          },
      };
  }
  /**
   * Loads Shaders without appeneding any Shader Chunks.
   *
   * @async
   * @param {string[]} shaders Array of paths to shaders.
   * @returns {Promise<string>}         Array of shaders corresponding to each path.
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
   * @returns {Promise<string[]>}          Array of shaders corresponding to each path with respective chunks applied.
   *
   * @example
   * const chunks = [
   *      [Perlin, Simplex],
   *      []
   * ];
   * const paths = [
   *      "vert.glsl",
   *      "frag.glsl",
   * ];
   * const [vert, frag] = await loadShaders(paths, chunks);
   */
  async function loadShaders(paths, chunks) {
      let shaders = await loadShadersRaw(paths);
      if (chunks) {
          shaders = shaders.map((s, i) => {
              return _Head + chunks[i].join("\n") + "\n" + s;
          });
      }
      else {
          shaders = shaders.map((s) => {
              return _Head + _all.join("\n") + "\n" + s;
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
              defines: _Head + _defines,
              header: _all.join("\n") + "\n" + _header,
              main: _main,
          };
      return {
          defines: _Head + _defines,
          header: chunks.join("\n") + "\n" + _header,
          main: _main,
      };
  }

  exports.Head = Head;
  exports.Perlin = Perlin;
  exports.Simplex = Simplex;
  exports.Voronoi = Voronoi;
  exports.loadShaders = loadShaders;
  exports.loadShadersCSM = loadShadersCSM;
  exports.loadShadersRaw = loadShadersRaw;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

}({}));
