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
    uniform vec3 movementSpeed;
    uniform sampler2D heightTexture;
    uniform sampler2D windTexture;
    uniform sampler2D grassTexture;
    uniform vec4 vFogInfos;
    uniform vec3 vFogColor;
    
    varying vec4 vPosition;
    varying vec4 vNormal;
    varying vec2 vUV;
    varying float fFogDistance;
    varying vec4 vertexColor;
    float CalcFogFactor(){
        float fogCoeff = 1.0;
        float fogStart = vFogInfos.y;
        float fogEnd = vFogInfos.z;
        float fogDensity = vFogInfos.w;
        if (FOGMODE_LINEAR == vFogInfos.x) {
            fogCoeff = (fogEnd - fFogDistance) / (fogEnd - fogStart);
        }
        else if (FOGMODE_EXP == vFogInfos.x) {
            fogCoeff = 1.0 / pow(E, fFogDistance * fogDensity);
        }
        else if (FOGMODE_EXP2 == vFogInfos.x) {
            fogCoeff = 1.0 / pow(E, fFogDistance * fFogDistance * fogDensity * fogDensity);
        }
        return clamp(fogCoeff, 0.0, 1.0);
    }
    void main() {
        vec4 p = vec4( position, 1. );
        vec2 zoneOffset = vec2( floor(bladeId / sideLength),  mod(bladeId, sideLength) );
        float randomHeightVariation = fract(sin(dot(vec2(zoneOffset.y, zoneOffset.x), vec2(12.9898, 78.233))) * 43758.5453);
        float heightScale = 10. + 5.*(randomHeightVariation-0.5);
        mat4 scale = mat4(
            12., 0, 0, 0,
            0, heightScale, 0, 0,
            0, 0, 12., 0,
            0, 0, 0, 1.
        );
        float randomRotationVariation = fract(sin(dot(vec2(zoneOffset.x, zoneOffset.y), vec2(12.9898, 78.233))) * 43758.5453);
        mat4 lengthwiseRotation = mat4(
            cos(randomRotationVariation * PI * 2.), 0., -sin(randomRotationVariation * PI * 2.), 0.,
            0., 1., 0., 0.,
            sin(randomRotationVariation * PI * 2.), 0., cos(randomRotationVariation * PI * 2.), 0.,
            0., 0., 0., 1.
        );
        float randomLeanVariation = fract(sin(dot(vec2(zoneOffset.y, zoneOffset.x), vec2(12.9898, 78.233))) * 7919.);
        mat4 lean = mat4(
            cos((randomLeanVariation-0.5) * PI/8.), -sin((randomLeanVariation-0.5) * PI/8.), 0., 0.,
            sin((randomLeanVariation-0.5) * PI/8.), cos((randomLeanVariation-0.5) * PI/8.), 0., 0.,
            0., 0., 1., 0.,
            0., 0., 0., 1.
        );
        float x = zoneOffset.x + sideLength*floor((sideLength/2. - zoneOffset.x) / sideLength);
        float z = zoneOffset.y + sideLength*floor((sideLength/2. - zoneOffset.y) / sideLength);
        mat4 position = mat4(
            1., 0, 0., 0.,
            0, 1., 0., 0.,
            0., 0., 1., 0.,
            x, 0, z, 1.
        );
        float textureValue = 0. + (texture(heightTexture, vec2( (x-2500.)/5000.+1./32./2., (z-2500.)/5000.+1./32./2. )).x-0.5) * 500.; // at z=-500, the texture coordinate is 0. at +500 it's 1.
        mat4 groundHeight = mat4(
            1., 0., 0., 0.,
            0., 1., 0., 0.,
            0., 0., 1., 0.,
            0., textureValue, 0., 1.
        );
        vPosition = groundHeight * (position * (lengthwiseRotation * (lean * (scale * p))));
        vec3 windIntensity = vec3(
          texture(windTexture, vec2( ((3.*time/3.)*100.+z+500.)/1000.+1./64./2., ((1.5*time/3.)*100.+x+500.)/1000.+1./64./2. )).x,
          texture(windTexture, vec2( ((3.*time/3.)*100.+z+550.)/1000.+1./64./2., ((1.5*time/3.)*100.+x+550.)/1000.+1./64./2. )).x,
          texture(windTexture, vec2( ((-0./4.+0.1)*100.+z+500.)/1000.+1./64./2., ((0./4.+0.1)*100.+x+500.)/1000.+1./64./2. )).x
        );
        float slowWind = -8. * (windIntensity.y-0.5) * pow(p.y, 1.5) * heightScale;
        float fastWind = -8. * (windIntensity.x-0.5) * pow(p.y, 1.5) * heightScale;
        vPosition.xyz += (0.6 + 0.4*(randomLeanVariation-0.5)) * vec3(
            -0.8 * (slowWind),
            -1. * (abs(slowWind) + abs(fastWind)),
            -0.8 * (fastWind)
        );

        vec4 playerDirection = vec4(x, playerPosition.y-1.1, z, 1.) - vec4(playerPosition.xyz, 1.);
        float distanceToPlayer = distance( vec3(x, playerPosition.y, z), playerPosition.xyz );
        float bendAwayFromPlayerStrength = length(movementSpeed)*10.*pow(p.y,1.)/(pow(max(1.,distanceToPlayer), 2.5));
        vPosition += bendAwayFromPlayerStrength * playerDirection;

        vec3 baseColor = 1. * texture(grassTexture, vec2( (x+2500.)/5000.*1.+1./256./2., (z+2500.)/5000.*1.+1./256./2. )).xyz;
        fFogDistance = (view * vPosition).z;
        float ambientFog = CalcFogFactor();
        float dist = 500.;
        float blendToGroundFog = (100.+dist-clamp(1.5*fFogDistance, 0., dist))/dist;
        float randomColorVariation = fract(sin(dot(vec2(zoneOffset.x, zoneOffset.y), vec2(12.9898, 78.233))) * 7919.);
        float playerGlow = 1.0 / pow(distanceToPlayer, 1.2);
        float tipColorAdjustment = p.y * blendToGroundFog * (5.*playerGlow - 0.05*randomColorVariation + 5.*(windIntensity.z-0.47) - 1.*abs(windIntensity.x-0.47) - 1.*abs(windIntensity.y-0.47));
        vec3 grassColor = baseColor * (1.1 + tipColorAdjustment);
        vertexColor = vec4(ambientFog * grassColor.rgb + (1.0 - ambientFog) * vFogColor, fFogDistance);
        gl_Position = worldViewProjection * vPosition;
        vNormal = vec4(normal, 1.); // TODO: transformation should include the p.z and p.x time dependent modifications.
        vUV = uv;
    }
`

Effect.ShadersStore["customFragmentShader"] = `
    precision highp float;
    varying vec4 vertexColor;
    varying vec4 vNormal;
    uniform mat4 view;

    void main(void) {
        
        gl_FragColor = vec4(.1, 0, 0, 0) + vec4(0., 0.9, 0.9, 1.) * vertexColor;
    }
`

export default class Grass {

  private time: number;
  private bladeCount: number;
  public box: Mesh;

  constructor(scene: Scene, box: Mesh) {
    this.time = 0;
    this.box = box;
    this.bladeCount = Math.pow(500, 2);
    this.createGrassField(this.createSingleBlade(scene))
  }

  private createSingleBlade(scene: Scene): Mesh {
    let singleBlade = new Mesh('singleBlade', scene);

    let vertexData = new VertexData();
    let tipPosition = 0.;
    vertexData.positions = [
        -0.01, 0, 0,
        0.01, 0, 0,
        -0.06, 0.7, 0,
        0.06, 0.7, 0,
        -0.025, 0.9, 0,
        0.025, 0.9, 0,
        tipPosition, 1, 0,
        tipPosition, 1, 0,
    ];
    vertexData.indices = [
        0, 1, 2,
        1, 3, 2,
        2, 3, 4,
        3, 4, 5,
        4, 5, 6,
        5, 6, 7,
    ];
    vertexData.normals = [
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
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
        0, 0,
        1, 0,
        0, 0,
        1, 0,
        0, 1,
        1, 1,
        0, 0,
        1, 0,
        0, 0,
        1, 0,
    ];
    vertexData.applyToMesh(singleBlade);

    let shaderMaterial = new ShaderMaterial("grass", scene, {
        vertex: "custom",
        fragment: "custom",
    }, {
        attributes: ["position", "normal", "uv", "bladeId"],
        uniforms: ["worldViewProjection", "view", "radius", "time", "playerPosition", "movementSpeed", "vFogColor", "vFogInfos"],
        samplers: ["heightTexture", 'windTexture', 'grassTexture'],
    });

    shaderMaterial.setFloat("sideLength", Math.sqrt(this.bladeCount));

    let heightTexture = new Texture("/grassets/noiseTexture-32x32.png", scene);
    heightTexture.updateSamplingMode(3);
    shaderMaterial.setTexture("heightTexture", heightTexture);

    let windTexture = new Texture("/grassets/noiseTexture-64x64.png", scene);
    shaderMaterial.setTexture("windTexture", windTexture);

    let grassTexture = new Texture("/grassets/grassTexture3.jpeg", scene);
    shaderMaterial.setTexture("grassTexture", grassTexture);

    shaderMaterial.setVector4("vFogInfos", new Vector4(scene.fogMode, scene.fogStart, scene.fogEnd, scene.fogDensity)); 
    shaderMaterial.setColor3("vFogColor", scene.fogColor);

    shaderMaterial.backFaceCulling = false;

    scene.registerBeforeRender( () => {
        this.time += 0.01 * scene.getAnimationRatio()
        shaderMaterial.setFloat("time", this.time);
        shaderMaterial.setVector3("playerPosition", this.box.position);
        shaderMaterial.setVector3("movementSpeed", this.box['velocity']);
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