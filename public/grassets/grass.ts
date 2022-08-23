import { Scene } from "@babylonjs/core";
import { Effect } from "@babylonjs/core/Materials/effect";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { VertexData } from "@babylonjs/core/Meshes/mesh.vertexData.js";
import { ShaderMaterial } from "@babylonjs/core/Materials/shaderMaterial";
import { Vector4 } from "@babylonjs/core/Maths/math.vector";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";

Effect.ShadersStore["customVertexShader"] = `
    precision highp float;

    attribute float bladeId;
    attribute vec3 position;
    attribute vec3 normal;
    attribute vec2 uv;

    uniform mat4 worldViewProjection;
    uniform mat4 view;
    uniform float sideLength;
    uniform float bladeSpacing;
    uniform float time;
    uniform vec3 playerPosition;

    uniform sampler2D heightTexture;
    uniform sampler2D windTexture;
    uniform sampler2D grassTexture;

    varying vec4 vPosition;
    varying vec4 vNormal;
    varying vec2 vUV;
    varying float py;
    varying float windIntensity;
    varying float fFogDistance;
    varying float temp;
    varying vec3 grassColor;

    void main() {
        vec4 p = vec4( position, 1. );

        float pi = 3.14159265358979323846264;
        float zoneOffsetA = floor(bladeId / sideLength);
        float zoneOffsetZ = mod(bladeId, sideLength);
        float random = fract(sin(dot(vec2(zoneOffsetA, zoneOffsetZ), vec2(12.9898, 78.233))) * 43758.5453);
        float random2 = fract(sin(dot(vec2(zoneOffsetZ, zoneOffsetA), vec2(12.9898, 78.233))) * 43758.5453);
        float doNotUpdateWithinZDistance = 1.0;
        float featherAdjustment = 0.75; // 1.5;

        float a = pi*2. / sideLength * (zoneOffsetA + 10.*random); // angle to place blade.
        float magicNumber = doNotUpdateWithinZDistance + featherAdjustment*(random-0.5); // TODO: The feathering method is not robust at all.
        float z = magicNumber * zoneOffsetZ;   // z-position to place blade.
        float r = 115.; // radius to place blade.
        
        // Don't believe the code: this is slow, random position-independent wind movement. See position-depdendent wind below.
        p.z += cos(time + random*2. + pi * zoneOffsetZ / 100.) * pow(p.y, 1.5) / 10.;
        p.x += cos(time + random2*2. + pi * zoneOffsetA / 100.) * pow(p.y, 1.5) / 10.;

        // Grass height variation.
        mat4 randomScale = mat4(
            2. + 4.*(random2-0.5), 0., 0., 0.,
            0., 2. + 4.*(random2-0.5), 0., 0.,
            0., 0., 2. + 4.*(random2-0.5), 0.,
            0., 0., 0., 1.
        );

        // Random rotation along length of blade.
        mat4 randomRotation = mat4(
            cos(random * pi * 2.), 0., sin(random * pi * 2.), 0.,
            0., 1., 0., 0.,
            -sin(random * pi * 2.), 0., cos(random * pi * 2.), 0.,
            0., 0., 0., 1.
        );

        // Set blade angle and z-position to prepare for placement onto cylinder.
        float zPos = z + (magicNumber*sideLength) * floor((playerPosition.z + (magicNumber*sideLength)/2. - magicNumber*zoneOffsetZ) / (magicNumber*sideLength));
        mat4 cylinderTransformation = mat4(
            sin(a+pi), -cos(a+pi), 0., 0.,
            cos(a+pi), sin(a+pi), 0., 0.,
            0., 0., 1., 0.,
            0., 0., zPos, 1.
        );

        // Set blade to ground height, snapping blade to cylinder surface.
        float textureValue = 50. + texture(heightTexture, vec2( (zPos+500.)/1000.+1./32./2., a/(2.*pi) + 1./32./2. )).x * 100.; //a/(pi*2.) // at z=-500, the texture coordinate is 0. at +500 it's 1.
        mat4 radiusAdjustment = mat4(
            1., 0., 0., 0.,
            0., 1., 0., 0.,
            0., 0., 1., 0.,
            textureValue * cos(a), textureValue * sin(a), 0., 1.
        );

        vPosition = radiusAdjustment * (cylinderTransformation * (randomRotation * (randomScale * p)));

        // Position-dependent wind.
        windIntensity = texture(windTexture, vec2( (time*100.+zPos+500.)/1000.+1./64./2., a/(2.*pi)+1./64./2. )).x;
        //windIntensity = texture(windTexture, vec2( (zPos+500.)/1000.+1./64./2., a/(2.*pi)+1./64./2. )).a;
        float height = p.y*4.;
        vPosition.z += 5.*(windIntensity-0.5) * pow(height, 2.) / 5.;

        // Grass bends away from player.
        float playerA = atan(playerPosition.y, playerPosition.x);
        float playerDist = clamp(distance(
            vec3(100.*cos(a), 100.*sin(a), zPos),
            vec3(100.*cos(playerA), 100.*sin(playerA), playerPosition.z)
            ), 0., 5.);
        vec4 playerDir = normalize(vec4(100.*cos(a), 100.*sin(a), zPos, 1.) - vec4(97.*cos(playerA), 97.*sin(playerA), playerPosition.z, 1.));
        vPosition += pow(p.y, 2.)/1.5 * (5.-playerDist) * playerDir;

        vNormal = cylinderTransformation * (randomRotation * vec4(normal, 1.)); // TODO: transformation should include the p.z and p.x time dependent modifications.
        vUV = uv;
        py = position.y; // Uncomment to add gradient back: position.y;
        //temp = position.y;

        grassColor = texture(grassTexture, vec2( (zPos+500.)/1000.*1.+1./256./2., a/(2.*pi)*1. + 1./256./2. )).xyz;

        fFogDistance = (view * vPosition).z;

        gl_Position = worldViewProjection * vPosition;
    }
`

Effect.ShadersStore["customFragmentShader"] = `
    precision highp float;

    #define FOGMODE_NONE 0.
    #define FOGMODE_EXP 1.
    #define FOGMODE_EXP2 2.
    #define FOGMODE_LINEAR 3.

    #define E 2.71828

    uniform vec4 vFogInfos;
    uniform vec3 vFogColor;

    varying vec2 vUV;
    varying vec4 vPosition;
    varying vec4 vNormal;
    varying float windIntensity;
    varying float fFogDistance;
    varying vec3 grassColor;
    varying float py;

    float CalcFogFactor(){
        float fogCoeff = 1.0;
        float fogStart = vFogInfos.y;
        float fogEnd = vFogInfos.z;
        float fogDensity = vFogInfos.w;

        if (FOGMODE_LINEAR == vFogInfos.x)
        {
        fogCoeff = (fogEnd - fFogDistance) / (fogEnd - fogStart);
        }
        else if (FOGMODE_EXP == vFogInfos.x)
        {
        fogCoeff = 1.0 / pow(E, fFogDistance * fogDensity);
        }
        else if (FOGMODE_EXP2 == vFogInfos.x)
        {
        fogCoeff = 1.0 / pow(E, fFogDistance * fFogDistance * fogDensity * fogDensity);
        }

        return clamp(fogCoeff, 0.0, 1.0);
    }

    void main(void) {
        vec3 color = (0.9+0.2*py) * vec3(0.0, 0.8, 0.301);

        float fog = CalcFogFactor();
        color.rgb = fog * color.rgb + (1.0 - fog) * vFogColor;

        gl_FragColor = vec4(color, 1.);
    }
`

export default class Grass {

  private time: number;
  private bladeCount: number;

  constructor(scene: Scene, player: Mesh) {
    this.time = 0;
    this.bladeCount = Math.pow(1000, 2);
    this.createGrassField(this.createSingleBlade(scene, player))
  }

  private createSingleBlade(scene: Scene, player: Mesh): Mesh {
    let singleBlade = new Mesh('singleBlade', scene);

    let vertexData = new VertexData();
    vertexData.positions = [
        0.02, 0, 0,
        0.08, 0, 0,
        0.01, 0.33, 0,
        0.09, 0.33, 0,
        0.02, 0.67, 0,
        0.08, 0.67, 0,
        0.05, 1, 0,
        0.05, 1, 0,
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
    ]
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
    ]
    vertexData.applyToMesh(singleBlade);

    let shaderMaterial = new ShaderMaterial("shader", scene, {
      vertex: "custom",
      fragment: "custom",
  }, {
      attributes: ["position", "normal", "uv", "bladeId"],
      uniforms: ["worldViewProjection", "world", "worldView", "view", "radius", "time", "playerPosition", "vFogColor", "vFogInfos"],
      samplers: ["heightTexture", 'windTexture', 'grassTexture'],
  });

    shaderMaterial.setFloat("sideLength", Math.sqrt(this.bladeCount));
    shaderMaterial.setFloat("bladeSpacing", 0.01);

    let heightTexture = new Texture("/grassets/noiseTexture-32x32.png", scene);
    shaderMaterial.setTexture("heightTexture", heightTexture);

    let windTexture = new Texture("/grassets/noiseTexture-64x64.png", scene);
    //let windTexture = new Texture("meow.png", this.scene);
    shaderMaterial.setTexture("windTexture", windTexture);

    let grassTexture = new Texture("/grassets/grassTexture.jpeg", scene);
    shaderMaterial.setTexture("grassTexture", grassTexture);

    //shaderMaterial.setMatrix("view", this.scene.getViewMatrix());
    shaderMaterial.setVector4("vFogInfos", new Vector4(scene.fogMode, scene.fogStart, scene.fogEnd, scene.fogDensity)); 
    shaderMaterial.setColor3("vFogColor", scene.fogColor);

    shaderMaterial.backFaceCulling = false;

    scene.registerBeforeRender( () => {
        this.time += 0.01 * scene.getAnimationRatio()
        shaderMaterial.setFloat("time", this.time);
        shaderMaterial.setVector3("playerPosition", player.position);
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

