import { Scene } from "@babylonjs/core";
import { Effect } from "@babylonjs/core/Materials/effect";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { VertexData } from "@babylonjs/core/Meshes/mesh.vertexData.js";
import { ShaderMaterial } from "@babylonjs/core/Materials/shaderMaterial";
import { Vector4 } from "@babylonjs/core/Maths/math.vector";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";

Effect.ShadersStore["customVertexShader"] = `
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
    uniform mat4 view;
    uniform float sideLength;
    uniform float time;
    uniform vec3 playerPosition;
    uniform sampler2D heightTexture;
    uniform sampler2D windTexture;
    uniform sampler2D imageTexture;
    uniform vec4 vFogInfos;
    uniform vec3 vFogColor;
    
    varying vec4 vPosition;
    varying vec4 vNormal;
    varying vec2 vUV;
    varying float fFogDistance;
    varying vec4 vertexColor;

    void main() {
        vec4 p = vec4( position, 1. );
        vec2 zoneOffset = vec2( floor(bladeId / sideLength),  mod(bladeId, sideLength) );
        float transitionSpeed = 3.; 


        float randomHeightVariation = fract(sin(dot(vec2(zoneOffset.y, zoneOffset.x), vec2(12.9898, 56.233))) * 16758.5453);
        float scalePixel = 1. * sin(2. * time * randomHeightVariation);
        mat4 scale = mat4(
          scalePixel, 0, 0, 0,
            0, scalePixel, 0, 0,
            0, 0, scalePixel, 0,
            0, 0, 0, 1.
        );

        float randomRotationVariation = fract(sin(dot(vec2(zoneOffset.x, zoneOffset.y), vec2(12.9898, 78.233))) * 43758.5453) * clamp((1.-time/transitionSpeed), 0., 1.);
        mat4 lengthwiseRotation = mat4(
            cos(randomRotationVariation * PI * 2.), 0., -sin(randomRotationVariation * PI * 2.), 0.,
            0., 1., 0., 0.,
            sin(randomRotationVariation * PI * 2.), 0., cos(randomRotationVariation * PI * 2.), 0.,
            0., 0., 0., 1.
        );

        float randomLeanVariation = fract(sin(dot(vec2(zoneOffset.y, zoneOffset.x), vec2(12.9898, 78.233))) * 7919.) * clamp((time/transitionSpeed), 0., 1.) * clamp((1.-time/transitionSpeed), 0., 1.);
        mat4 lean = mat4(
            cos(randomRotationVariation * PI * 2.), -sin(randomRotationVariation * PI * 2.), 0., 0.,
            sin(randomRotationVariation * PI * 2.), cos(randomRotationVariation * PI * 2.), 0., 0.,
            0., 0., 1., 0.,
            0., 0., 0., 1.
        );

        float x = zoneOffset.x + sideLength*floor((0. + sideLength/2. - zoneOffset.x) / sideLength);
        float z = zoneOffset.y + sideLength*floor((0. + sideLength/2. - zoneOffset.y) / sideLength);
        mat4 position = mat4(
            1., 0, 0., 0.,
            0, 1., 0., 0.,
            0., 0., 1., 0.,
            x, clamp((time/transitionSpeed), 0., 1.) * 250. + clamp((1.-time/transitionSpeed), 0., 1.) * randomHeightVariation * 500., z, 1.
        );

        float textureValue = 0. + (texture(heightTexture, vec2( (x-2500.)/5000.+1./32./2., (z-2500.)/5000.+1./32./2. )).x-0.5) * 500.; // at z=-500, the texture coordinate is 0. at +500 it's 1.
        mat4 groundHeight = mat4(
            1., 0., 0., 0.,
            0., 1., 0., 0.,
            0., 0., 1., 0.,
            0., 0., 0., 1.
        );

        vPosition = groundHeight * (position * (lengthwiseRotation * (lean * (scale * p))));

        vec2 windIntensity = vec2(
          texture(windTexture, vec2( ((1.*time/3.)*100.+z+500.)/1000.+1./64./2., ((1.5*time/3.)*100.+x+500.)/1000.+1./64./2. )).x,
          texture(windTexture, vec2( ((1.*time/3.+0.1)*100.+z+500.)/1000.+1./64./2., ((1.5*time/3.+0.1)*100.+x+500.)/1000.+1./64./2. )).x
        );

        vPosition.xyz += clamp((1.-time/transitionSpeed), 0., 1.) * (0.6 + 0.4*(randomLeanVariation-0.5)) * vec3(
            200. * (50. * (windIntensity.y-0.5)),
            500. * (100. * (windIntensity.x-0.5)),
            500. * (50. * (windIntensity.x-0.5))
        );

        vPosition.y += clamp((1.-time/transitionSpeed/1.2), 0., 1.) * randomHeightVariation * 100.;

        float textureIntensity = step(0.5, texture(imageTexture, vec2( (x+256.)/512.*1.+1./256./2., (z+256.)/512.*1.+1./256./2. )).x);
        vec3 baseColor = vec3(
                              54./255. + (255.-54.)/255. * textureIntensity,
                              61./255. + (255.-61.)/255. * textureIntensity,
                              69./255. + (255.-69.)/255. * textureIntensity
                          );
                            
                                              
        vertexColor = vec4(baseColor.rgb, 1.);

        gl_Position = worldViewProjection * vPosition;
        vNormal = vec4(normal, 1.);
        vUV = uv;
    }
`

Effect.ShadersStore["customFragmentShader"] = `
    precision highp float;
    varying vec4 vertexColor;
    varying vec4 vNormal;
    uniform mat4 view;

    void main(void) {
        
        gl_FragColor = vertexColor;
    }
`

export default class Particles {

  private time: number;
  private bladeCount: number;
  public box: Mesh;

  constructor(scene: Scene, box: Mesh) {
    this.time = 0;
    this.box = box;
    this.bladeCount = Math.pow(500, 2);
    this.createGrassField(this.createParticle(scene))
  }

  private createParticle(scene: Scene): Mesh {
    let singleBlade = new Mesh('singleBlade', scene);

    let vertexData = new VertexData();
    let tipPosition = 0.02;
    vertexData.positions = [
        -0.5, 0, -0.5,
        0.5, 0, -0.5,
        -0.5, 0, 0.5,
        0.5, 0, 0.5,
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

    let shaderMaterial = new ShaderMaterial("shader", scene, {
        vertex: "custom",
        fragment: "custom",
    }, {
        attributes: ["position", "normal", "uv", "bladeId"],
        uniforms: ["worldViewProjection", "view", "radius", "time", "playerPosition", "vFogColor", "vFogInfos"],
        samplers: ["heightTexture", 'windTexture', 'imageTexture'],
    });

    shaderMaterial.setFloat("sideLength", Math.sqrt(this.bladeCount));

    let heightTexture = new Texture("/grassets/noiseTexture-32x32.png", scene);
    heightTexture.updateSamplingMode(3);
    shaderMaterial.setTexture("heightTexture", heightTexture);

    let windTexture = new Texture("/grassets/noiseTexture-64x64.png", scene);
    shaderMaterial.setTexture("windTexture", windTexture);

    let imageTexture = new Texture("/grassets/imageTexture-512x512.jpg", scene);
    shaderMaterial.setTexture("imageTexture", imageTexture);

    shaderMaterial.setVector4("vFogInfos", new Vector4(scene.fogMode, scene.fogStart, scene.fogEnd, scene.fogDensity)); 
    shaderMaterial.setColor3("vFogColor", scene.fogColor);

    shaderMaterial.backFaceCulling = false;

    scene.registerBeforeRender( () => {
        this.time += 0.01 * scene.getAnimationRatio()
        shaderMaterial.setFloat("time", this.time);
        shaderMaterial.setVector3("playerPosition", this.box.position);
        this.box.position.y -= scene.getAnimationRatio();
    });

    singleBlade.material = shaderMaterial;

    return singleBlade;
  }

  private createGrassField(singleBlade: Mesh): Mesh {
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