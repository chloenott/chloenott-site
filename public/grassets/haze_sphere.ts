import { Scene, MeshBuilder, Engine } from "@babylonjs/core";
import { Effect } from "@babylonjs/core/Materials/effect";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { ShaderMaterial } from "@babylonjs/core/Materials/shaderMaterial";
import { Vector4 } from "@babylonjs/core/Maths/math.vector";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import Player from "./player";

Effect.ShadersStore["hazeSphereVertexShader"] = `
    precision highp float;

    #define E 2.71828
    #define PI 3.14159265358979323846264

    attribute vec3 position;
    attribute vec3 normal;
    attribute vec2 uv;
    uniform mat4 worldViewProjection;
    uniform mat4 worldView;
    uniform float time;
    uniform vec3 playerPosition;
    uniform vec3 movementSpeed;
    uniform sampler2D noiseTextureLowRes;
    uniform sampler2D noiseTextureHighRes;
    
    varying vec4 vPosition;
    varying vec4 vNormal;
    varying vec2 vUV;

    void main() {
        vec4 vPosition = vec4( position, 1. );
        gl_Position = worldViewProjection * vPosition;
        vNormal = worldView*(vec4(normal, 0.));
        vUV = uv;
    }
`

Effect.ShadersStore["hazeSphereFragmentShader"] = `
    #define PI 3.14159265358979323846264

    precision highp float;
    varying vec4 vNormal;
    varying vec2 vUV;
    uniform sampler2D noiseTextureHighRes;
    uniform float time;

    void main(void) {
      float filter1 = sin(time*2.*PI)*1.*(texture(noiseTextureHighRes, vec2(vUV.x*1., vUV.y*1. + time/20.)).x - 0.5) + 1.;
      float filter2 = cos(time*2.*PI)*1.*(texture(noiseTextureHighRes, vec2(vUV.x*1., vUV.y*1. - time/20.)).x - 0.5) + 1.;
      float filter3 = cos(time*2.*PI)*1.*(texture(noiseTextureHighRes, vec2(vUV.x*2., vUV.y*2. + time/9.)).x - 0.5) + 1.;
      float filter4 = sin(time*2.*PI)*1.*(texture(noiseTextureHighRes, vec2(vUV.x*2., vUV.y*2. - time/9.)).x - 0.5) + 1.;
      gl_FragColor = filter1 * filter2 * filter3 * filter4 * vec4(1., 1., 1., 1.);
    }
`

export default class HazeSpheres {

  private time: number;
  private layerQty: number;
  private player: Player;
  private hazeSpheres: Mesh;

  constructor(scene: Scene, player: Player) {
    this.time = 0;
    this.player = player;
    this.layerQty = 1;
    this.hazeSpheres = this.createHazeSpheres(this.createHazeSphere(scene))
  }

  private createHazeSphere(scene: Scene): Mesh {
    const singleSphere = MeshBuilder.CreateSphere("singleSphere", { diameter: 1000 }, scene)

    const shaderMaterial = new ShaderMaterial("hazeSphere", scene, {
        vertex: "hazeSphere",
        fragment: "hazeSphere",
    }, {
        attributes: ["position", "normal", "uv", "bladeId"],
        uniforms: ["worldViewProjection", "view", "worldView", "radius", "time", "playerPosition", "movementSpeed", "vFogColor", "vFogInfos"],
        samplers: ["noiseTextureLowRes", "noiseTextureHighRes"],
    });

    const noiseTextureLowRes = new Texture("/grassets/noiseTexture-32x32.png", scene);
    shaderMaterial.setTexture("noiseTextureLowRes", noiseTextureLowRes);

    const noiseTextureHighRes = new Texture("/grassets/noiseTexture-512x512.png", scene);
    shaderMaterial.setTexture("noiseTextureHighRes", noiseTextureHighRes);

    shaderMaterial.setVector4("vFogInfos", new Vector4(scene.fogMode, scene.fogStart, scene.fogEnd, scene.fogDensity)); 
    shaderMaterial.setColor3("vFogColor", scene.fogColor);

    shaderMaterial.backFaceCulling = false;
    shaderMaterial.alphaMode = Engine.ALPHA_MULTIPLY;

    scene.registerBeforeRender( () => {
        this.time += 0.01 * scene.getAnimationRatio() * (0.2-this.player.velocity.length()/2)
        shaderMaterial.setFloat("time", this.time);
        shaderMaterial.setVector3("playerPosition", this.player.mesh.position);
        shaderMaterial.setVector3("movementSpeed", this.player.velocity);
        this.hazeSpheres.position = this.player.mesh.position;
    });

    singleSphere.material = shaderMaterial;
    singleSphere.hasVertexAlpha = true;

    return singleSphere;
  }

  private createHazeSpheres(singleSphere: Mesh): Mesh {
    const buffer = new Float32Array(16 * this.layerQty)
    const bladeIds = new Float32Array(1 * this.layerQty);

    for (let i = 0; i < Math.sqrt(this.layerQty); i++) {
        for (let j = 0; j < Math.sqrt(this.layerQty); j++) {
            const id = Math.sqrt(this.layerQty) * i + j;
            bladeIds.set([id], id);
        }
    }

    singleSphere.thinInstanceSetBuffer("matrix", buffer, 16, true);
    singleSphere.thinInstanceSetBuffer("bladeId", bladeIds, 1, true);
    return singleSphere;
  }

}