import { Scene, Color4, Material } from "@babylonjs/core";
import { Effect } from "@babylonjs/core/Materials/effect";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { VertexData } from "@babylonjs/core/Meshes/mesh.vertexData.js";
import { ShaderMaterial } from "@babylonjs/core/Materials/shaderMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";

Effect.ShadersStore["particlesVertexShader"] = `
    precision highp float;
    #define FOGMODE_NONE 0.
    #define FOGMODE_EXP 1.
    #define FOGMODE_EXP2 2.
    #define FOGMODE_LINEAR 3.
    #define E 2.71828
    #define PI 3.14159265358979323846264

    attribute float bladeId;
    attribute vec3 position;
    attribute vec3 normal;
    attribute vec2 uv;
    uniform mat4 worldViewProjection;
    uniform mat4 worldView;
    uniform mat4 view;
    uniform mat4 projection;
    uniform float sideLength;
    uniform float time;
    uniform vec3 playerPosition;
    uniform sampler2D heightTexture;
    uniform sampler2D windTexture;
    uniform sampler2D imageTexture;
    uniform vec4 vFogInfos;
    uniform vec3 vFogColor;
    uniform vec4 particleColor;
    
    varying vec4 vPosition;
    varying vec4 vNormal;
    varying vec2 vUV;
    varying vec4 vertexColor;
    varying float textureIntensity;
    varying vec2 zoneOffset;

    void main() {
        vec4 p = vec4( position, 1. );
        zoneOffset = vec2( floor(bladeId / sideLength),  mod(bladeId, sideLength) );
        float transitionSpeed = 0.9; 
        float transitionProgress0To1 = clamp(pow(time*transitionSpeed, 5.), 0., 1.6); //1.6 is eyeballed to get the cube height to look right
        float explode = 1. + clamp(pow((time-10.)*transitionSpeed*5., 5.), 1., 100.);

        float random1 = fract(sin(dot(vec2(zoneOffset.x, zoneOffset.y), vec2(12.9898, 78.233))) * 43758.5453);
        float random2 = fract(sin(dot(vec2(zoneOffset.y, zoneOffset.x), vec2(12.9898, 78.233))) * 7919.);
        float random3 = fract(sin(dot(vec2(zoneOffset.y, zoneOffset.x), vec2(12.9898, 56.233))) * 16758.5453);

        float scalePixel = 40.*(abs(random3-0.5)+0.2) * (0.75 + 0.25*sin(2.*time*2.*(random1-1.)));

        float x = zoneOffset.x - sideLength/2.;
        float z = zoneOffset.y - sideLength/2.;
        float timeShift = time/500.;
        vec3 windIntensity = 500. * (vec3(
          texture(windTexture, vec2( timeShift + z/100.+1./64./2., timeShift + x/100.+1./64./2. )).x,
          texture(heightTexture, vec2( timeShift + z/200.+1./32./2., timeShift + x/200.+1./32./2. )).x,
          texture(heightTexture, vec2( z/200.+1./32./2., timeShift + x/200.+1./32./2. )).x
        ) - 0.5);
        float floatUpSlowly = 10.*cos(clamp(mod(time*clamp((10.*(random1-0.5)+0.5), 0.5, 1.) +10.*(random2-0.5), PI)+PI, PI, 2.*PI));  // Constrained to cos(pi) to cos(2*pi) which is 0 to 1, multiplied by 10, so 0 to 10 total.
        mat4 position = mat4(
            1., 0, 0., 0.,
            0, 1., 0., 0.,
            0., 0., 1., 0.,
            explode*(4.*x + 0.5*(windIntensity.x-0.5)), explode*(750. + (1.-transitionProgress0To1)*2000.*(random1) + 0.5 * floatUpSlowly * abs(0.1*(windIntensity.y-0.5))), explode*(4.*z + 0.5*(windIntensity.y-0.5)), 1.
        );

        mat4 scale = mat4(
          scalePixel, 0, 0, 0,
          0, scalePixel, 0, 0,
          0, 0, scalePixel, 0,
          0, 0, 0, 1.
        );
        vPosition = (scale * p);

        textureIntensity = 1. * sin(mod(floatUpSlowly/10.*PI, PI)); // Want the intensity to be pi out of phase with floatUpSlowly so the intensity change is fast near the min/max displacement. // + step(0.5, texture(imageTexture, vec2( (x+256.)/512.*1.+1./256./2., (z+256.)/512.*1.+1./256./2. )).x);

        gl_Position = projection * ((worldView * (position * vec4(0., 0., 0., 1.))) + vPosition);
        vNormal = vec4(normal, 1.);
        vUV = uv;
    }
`

Effect.ShadersStore["particlesFragmentShader"] = `
    precision highp float;
    varying vec4 vertexColor;
    varying vec4 vNormal;
    uniform mat4 view;
    uniform sampler2D particleTexture;
    varying vec2 vUV;
    varying float textureIntensity;
    varying vec2 zoneOffset;

    void main(void) {
      float random3 = clamp(10.*(fract(sin(dot(vec2(zoneOffset.y, zoneOffset.x), vec2(12.9898, 56.233))) * 16758.5453) - 0.5), 0.5, 1.);
      vec4 innerGlow = (1.-10.*distance(vUV, vec2(0.5, 0.5))) * vec4(0./200., 0./200., 50./200., 0.);
      gl_FragColor = textureIntensity * (texture(particleTexture, vUV)) * 0.9;
    }
`

export default class Particles {

  private time: number;
  private bladeCount: number;
  public box: Mesh;
  private particleColor: Color4;
  public particles: Mesh;

  constructor(scene: Scene, box: Mesh, particleColor: Color4) {
    this.time = 0.5;
    this.box = box;
    this.bladeCount = Math.pow(300, 2);
    this.particleColor = particleColor;
    this.particles = this.createParticles(this.createParticle(scene));
  }

  private createParticle(scene: Scene): Mesh {
    let singleBlade = new Mesh('singleBlade', scene);

    let vertexData = new VertexData();
    let tipPosition = 0.02;
    vertexData.positions = [
        -0.5, -0.5, 0,
        0.5, -0.5, 0,
        -0.5, 0.5, 0,
        0.5, 0.5, 0
    ];
    vertexData.indices = [
        0, 1, 2,
        1, 3, 2,
    ];
    vertexData.normals = [
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
    ];
    vertexData.uvs = [
        0, 0,
        1, 0,
        0, 1,
        1, 1,
        0, 0,
        1, 0,
    ];
    vertexData.applyToMesh(singleBlade);

    let shaderMaterial = new ShaderMaterial("particles", scene, {
        vertex: "particles",
        fragment: "particles",
    }, {
        attributes: ["position", "normal", "uv", "bladeId"],
        uniforms: ["worldViewProjection", "worldView", "view", "projection", "radius", "time", "playerPosition", "particleColor"],
        samplers: ["heightTexture", 'windTexture', 'imageTexture', 'particleTexture'],
    });

    shaderMaterial.setFloat("sideLength", Math.sqrt(this.bladeCount));

    let heightTexture = new Texture("/grassets/noiseTexture-32x32.png", scene);
    heightTexture.updateSamplingMode(3);
    shaderMaterial.setTexture("heightTexture", heightTexture);

    let windTexture = new Texture("/grassets/noiseTexture-64x64.png", scene);
    shaderMaterial.setTexture("windTexture", windTexture);

    let imageTexture = new Texture("/grassets/imageTexture-512x512.jpg", scene);
    shaderMaterial.setTexture("imageTexture", imageTexture);

    let particleTexture = new Texture("/grassets/particleTexture-100x100.png", scene);
    shaderMaterial.setTexture("particleTexture", particleTexture);

    shaderMaterial.setColor4("particleColor", this.particleColor);

    shaderMaterial.backFaceCulling = false;
    shaderMaterial.transparencyMode = Material.MATERIAL_ALPHABLEND;

    scene.registerBeforeRender( () => {
        this.time += 0.01 * scene.getAnimationRatio()
        shaderMaterial.setFloat("time", this.time);
        shaderMaterial.setVector3("playerPosition", this.box.position);
        //this.box.position.y -= scene.getAnimationRatio();
    });

    singleBlade.material = shaderMaterial;
    singleBlade.hasVertexAlpha = true;

    return singleBlade;
  }

  private createParticles(singleBlade: Mesh): Mesh {
    let buffer = new Float32Array(16 * this.bladeCount)
    let bladeIds = new Float32Array(1 * this.bladeCount);

    for (let i = 0; i < Math.sqrt(this.bladeCount); i++) {
        for (let j = 0; j < Math.sqrt(this.bladeCount); j++) {
            let id = Math.sqrt(this.bladeCount) * i + j;
            bladeIds.set([id], id);
        }
    }

    singleBlade.thinInstanceSetBuffer("matrix", buffer, 16, true);
    singleBlade.thinInstanceSetBuffer("bladeId", bladeIds, 1, true);
    return singleBlade;
  }

}