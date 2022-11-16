import { Scene } from "@babylonjs/core";
import { Effect } from "@babylonjs/core/Materials/effect";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { VertexData } from "@babylonjs/core/Meshes/mesh.vertexData.js";
import { ShaderMaterial } from "@babylonjs/core/Materials/shaderMaterial";
import { Vector4 } from "@babylonjs/core/Maths/math.vector";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import Player from "./player";

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
    uniform mat4 worldView;
    uniform mat4 view;
    uniform float sideLength;
    uniform float time;
    uniform float timeElapsed;
    uniform vec3 playerPosition;
    uniform vec3 movementSpeed;
    uniform sampler2D heightTexture;
    uniform sampler2D windTexture;
    uniform sampler2D grassTexture;
    uniform sampler2D activeGrassTexture;
    uniform vec4 vFogInfos;
    uniform vec3 vFogColor;
    
    varying vec4 vPosition;
    varying vec4 vNormal;
    varying vec2 vUV;
    varying float fFogDistance;
    varying vec4 vertexColor;
    varying vec3 windVector;

    float CalcFogFactor(){
        float fogCoeff = 1.0;
        float fogStart = vFogInfos.y;
        float fogEnd = vFogInfos.z;
        float fogDensity = 0.005; //vFogInfos.w;
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
        float heightScale = 7. + 4.*(randomHeightVariation-0.5);
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
        float x = zoneOffset.x + sideLength*floor((playerPosition.x + sideLength/2. - zoneOffset.x) / sideLength);
        float z = zoneOffset.y + sideLength*floor((playerPosition.z + sideLength/2. - zoneOffset.y) / sideLength);
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
        windVector = heightScale/9. * (0.6 + 0.4*(randomLeanVariation-0.5)) * vec3(
          -0.8 * (slowWind),
          -1. * (abs(slowWind) + abs(fastWind)),
          -0.8 * (fastWind)
        );
        vPosition.xyz += windVector;
        windVector = normalize(windVector);

        vec4 playerDirection = vec4(x, playerPosition.y-1.1, z, 1.) - vec4(playerPosition.xyz, 1.);
        float distanceToPlayer = distance( vec3(x, playerPosition.y, z), playerPosition.xyz );
        float bendAwayFromPlayerStrength = length(movementSpeed)*10.*pow(p.y,1.)/(pow(max(1.,distanceToPlayer), 2.5));
        vPosition += bendAwayFromPlayerStrength * playerDirection;

        vec3 inactiveColor = texture(grassTexture, vec2( (x+2500.)/5000.*1.+1./256./2., (z+2500.)/5000.*1.+1./256./2. )).xyz;
        vec3 activeColor = 1.9*texture(activeGrassTexture, vec2( (x+2500.)/5000.*1.+1./256./2., (z+2500.)/5000.*1.+1./256./2. )).xyz;
        float activityLevel = pow(p.y, 0.1) * clamp((2.*timeElapsed-1.)*pow(clamp(1000.-distanceToPlayer, 0., 1000.)/1000., 10.), 0., 1.)/1.;
        vec3 baseColor = (1.-activityLevel)*inactiveColor + activityLevel*activeColor;
        fFogDistance = (view * vPosition).z;
        float ambientFog = CalcFogFactor();
        float dist = 500.;
        float blendToGroundFog = (100.+dist-clamp(1.5*fFogDistance, 0., dist))/dist;
        float randomColorVariation = fract(sin(dot(vec2(zoneOffset.x, zoneOffset.y), vec2(12.9898, 78.233))) * 7919.);
        float playerGlow = 2. / pow(max(distanceToPlayer, 5.), 1.2);
        float tipColorAdjustment = (1.-0.3*activityLevel) * p.y * blendToGroundFog * (-0.5 + 1.*playerGlow + (1.+3.*activityLevel)*0.05*randomColorVariation - 1.*(windIntensity.z-0.47) + (1.-0.6*activityLevel)*5.*abs(windIntensity.x-0.47) + (1.-0.6*activityLevel)*5.*abs(windIntensity.y-0.47));
        vec3 grassColor = baseColor * (0.95 + tipColorAdjustment);
        vertexColor = vec4(ambientFog * grassColor.rgb + (1.0 - ambientFog) * vFogColor, fFogDistance);
        gl_Position = worldViewProjection * vPosition;
        vNormal = worldView*(vec4(normal, 0.));
        vUV = uv;
    }
`

Effect.ShadersStore["customFragmentShader"] = `
    precision highp float;
    varying vec4 vertexColor;
    varying vec4 vNormal;
    uniform mat4 view;
    varying vec2 vUV;
    varying vec3 windVector;

    void main(void) {
      gl_FragColor = (vec4(.1, 0, 0, 0) + vec4(0., 0.9, 0.9, 1.)) * vertexColor;
    }
`

export default class Grass {

  private time: number;
  private timeElapsed: number;
  private bladeCount: number;
  public player: Player;

  constructor(scene: Scene, player: Player) {
    this.time = 0;
    this.timeElapsed = 0;
    this.player = player;
    this.bladeCount = Math.pow(500, 2);
    this.createGrassField(this.createSingleBlade(scene))
  }

  private createSingleBlade(scene: Scene): Mesh {
    const singleBlade = new Mesh('singleBlade', scene);

    const vertexData = new VertexData();
    const tipPosition = 0.;
    vertexData.positions = [
        -0.01, 0, 0,
        0.01, 0, 0,
        -0.06, 0.7, 0,
        0.06, 0.7, 0,
        -0.025, 0.9, 0,
        0.025, 0.9, 0,
        tipPosition, 1, 0,
    ];
    vertexData.indices = [
        0, 1, 2,
        1, 3, 2,
        2, 3, 4,
        3, 5, 4,
        4, 5, 6,
    ];
    vertexData.normals = [
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
        0, 0.7,
        1, 0.7,
        0, 0.9,
        1, 0.9,
        0.5, 1,
    ];
    vertexData.applyToMesh(singleBlade);

    const shaderMaterial = new ShaderMaterial("grass", scene, {
        vertex: "custom",
        fragment: "custom",
    }, {
        attributes: ["position", "normal", "uv", "bladeId"],
        uniforms: ["worldViewProjection", "view", "worldView", "radius", "time", "timeElapsed", "playerPosition", "movementSpeed", "vFogColor", "vFogInfos"],
        samplers: ["heightTexture", 'windTexture', 'grassTexture', 'activeGrassTexture', 'milkywayTexture'],
    });

    shaderMaterial.setFloat("sideLength", Math.sqrt(this.bladeCount));

    const heightTexture = new Texture("/grassets/noiseTexture-32x32.png", scene);
    heightTexture.updateSamplingMode(3);
    shaderMaterial.setTexture("heightTexture", heightTexture);

    const windTexture = new Texture("/grassets/noiseTexture-512x512.png", scene);
    shaderMaterial.setTexture("windTexture", windTexture);

    const grassTexture = new Texture("/grassets/grassTexture3.jpeg", scene);
    shaderMaterial.setTexture("grassTexture", grassTexture);

    const activeGrassTexture = new Texture("/grassets/grassTexture2.jpeg", scene);
    shaderMaterial.setTexture("activeGrassTexture", activeGrassTexture);

    shaderMaterial.setVector4("vFogInfos", new Vector4(scene.fogMode, scene.fogStart, scene.fogEnd, scene.fogDensity)); 
    shaderMaterial.setColor3("vFogColor", scene.fogColor);

    shaderMaterial.backFaceCulling = false;

    scene.registerBeforeRender( () => {
        this.time += 0.01 * scene.getAnimationRatio() * (0.2-this.player.velocity.length()/2);
        if (this.player.velocity.length() > 0.4 && this.timeElapsed < 3) {
          this.timeElapsed += scene.getAnimationRatio()/60;
        } else if (this.timeElapsed > 0) {
          this.timeElapsed -= scene.getAnimationRatio()/60;
        } else {
          this.timeElapsed = 0;
        }
        shaderMaterial.setFloat("timeElapsed", this.timeElapsed);
        shaderMaterial.setFloat("time", this.time);
        shaderMaterial.setVector3("playerPosition", this.player.mesh.position);
        shaderMaterial.setVector3("movementSpeed", this.player.velocity);
    });

    singleBlade.material = shaderMaterial;

    return singleBlade;
  }

  private createGrassField(singleBlade: Mesh): Mesh {
    const buffer = new Float32Array(16 * this.bladeCount)
    const bladeIds = new Float32Array(1 * this.bladeCount);

    for (let i = 0; i < Math.sqrt(this.bladeCount); i++) {
        for (let j = 0; j < Math.sqrt(this.bladeCount); j++) {
            const id = Math.sqrt(this.bladeCount) * i + j;
            bladeIds.set([id], id);
        }
    }

    singleBlade.thinInstanceSetBuffer("matrix", buffer, 16, true);
    singleBlade.thinInstanceSetBuffer("bladeId", bladeIds, 1, true);
    return singleBlade;
  }

}