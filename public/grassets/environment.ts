import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math";
import { Vector4 } from "@babylonjs/core/Maths/math";
import { VertexData } from "@babylonjs/core/Meshes/mesh.vertexData.js";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Effect } from "@babylonjs/core/Materials/effect";
import { ShaderMaterial } from "@babylonjs/core/Materials/shaderMaterial";
import { Matrix } from "@babylonjs/core/Maths/math";
import Player from "./player";

Effect.ShadersStore["groundVertexShader"] = `
    precision highp float;
    // Attributes
    attribute vec3 position;
    attribute vec2 uv;
    attribute vec3 normal;

    // Uniforms
    uniform mat4 viewProjection;
    uniform mat4 view;
    uniform float time;
    uniform vec3 movementSpeed;

    // Varying
    varying vec2 vUV;
    varying float fFogDistance;
    varying float lightIntensity;

    #include<instancesDeclaration>

    void main(void) {
        #include<instancesVertex>
        gl_Position = viewProjection * finalWorld * vec4(
                                                        position.x, 
                                                        position.y, 
                                                        position.z, 
                                                        1.0);
        fFogDistance = (view * finalWorld * vec4(position, 1.0)).z;
        vUV = uv; // + vec2(+0.5, time*100./1000.);
    }
`

Effect.ShadersStore["groundFragmentShader"] = `
    precision highp float;
    #define FOGMODE_NONE 0.
    #define FOGMODE_EXP 1.
    #define FOGMODE_EXP2 2.
    #define FOGMODE_LINEAR 3.
    #define E 2.71828

    uniform sampler2D windTexture;
    uniform sampler2D heightTexture;
    uniform float time;
    uniform vec4 vFogInfos;
    uniform vec3 vFogColor;
    uniform sampler2D grassTexture;
    uniform vec3 movementSpeed;

    varying float fFogDistance;
    varying vec2 vUV;
    varying float lightIntensity;

    float CalcFogFactor(){
        float fogCoeff = 1.0;
        float fogStart = vFogInfos.y;
        float fogEnd = vFogInfos.z;
        float fogDensity = 0.012; //vFogInfos.w;
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
        vec3 grassColor = 1.1*texture2D(grassTexture, vec2(vUV.y*1. + 1./256./2., vUV.x*1. + 1./256./2.)).xyz;
        float windIntensity = (texture2D(windTexture, vec2(time/3.*100./1000. + vUV.y + 1./64./2., time/3.*100./1000. + vUV.x + 1./64./2.)).x-0.5);
        float ambientFog = CalcFogFactor();
        vec3 color = 1.*grassColor + 0.*windIntensity*(clamp(1.*fFogDistance, 200., 1000.)-200.)/1000.;
        vec4 vertexColor = vec4(ambientFog * grassColor.rgb + (1.0 - ambientFog) * vFogColor, fFogDistance);
        gl_FragColor = vec4(.1, 0, 0, 0) + vec4(0., 0.75, 0.75, 1.0) * vertexColor;
    }
`

export default class Environment {
    private heightScale: number;
    private time: number;
    private player: Player;

    constructor(scene: Scene, heightScale: number, player: Player) {
        scene.collisionsEnabled = true;
        this.heightScale = heightScale;
        this.time = 0;
        this.player = player;

        this.loadLights(scene);
        this.loadGround(scene);
    }

    public loadLights(scene: Scene) {
        const lightAmbient = new HemisphericLight("ambientLight", new Vector3(0, 0, 0), scene);
        lightAmbient.intensity = 1.;
    }

    private loadGround(scene: Scene): void {
        let groundBlock: Mesh;
        if (this.heightScale > 5) {
          groundBlock = new Mesh('mountains', scene);
        } else {
          groundBlock = new Mesh('ground', scene);
          groundBlock.isPickable = false;
        }
        
        const vertexData = new VertexData();

        const positions: Array<number> = [];
        const indices: Array<number> = [];
        const uvs: Array<number> = [];

        const indexMax = 64;
        const blockSize = this.heightScale > 5 ? 50000 : 1000;

        const heightTexture = new Texture("/grassets/noiseTexture-64x64.png", scene, undefined, undefined, 3, () => {
            heightTexture?.readPixels()?.then( (heightTextureData: ArrayBufferView) => {

                for (let xIndex=0; xIndex<=indexMax; xIndex++) {
                    for (let zIndex=0; zIndex<=indexMax; zIndex++) {
                        const buffer = heightTextureData.buffer;
                        const textureValue = new Uint8Array(buffer)[4*(xIndex%indexMax) + 4*(zIndex%indexMax)*indexMax]/255-0.5;
                        const groundHeight = textureValue * 500
                          * (this.heightScale > 5 ? (Math.abs(xIndex-indexMax/2) > 5 || Math.abs(zIndex-indexMax/2) > 5 ? this.heightScale : 0) : 1)
                          + (this.heightScale > 5 ? (Math.abs(xIndex-indexMax/2) > 5 || Math.abs(zIndex-indexMax/2) > 5 ? 1000 : 0) : -2)
                        
                        positions.push(
                            (xIndex-indexMax/2)/indexMax*blockSize,
                            groundHeight,
                            (zIndex-indexMax/2)/indexMax*blockSize
                        )

                        uvs.push(
                            zIndex/indexMax, xIndex/indexMax,
                        )
                    }
                }

                // Triangles between each adjacent circle.
                for (let xIndex=0; xIndex<indexMax; xIndex++) {
                    for (let zIndex=0; zIndex<indexMax; zIndex++) {
                        indices.push(
                            (zIndex+0)+(xIndex+0)*(indexMax+1), (zIndex+0)+(xIndex+1)*(indexMax+1), (zIndex+1)+(xIndex+0)*(indexMax+1), // clockwise face: origin, a-across from origin, z-across from origin
                            (zIndex+1)+(xIndex+0)*(indexMax+1), (zIndex+0)+(xIndex+1)*(indexMax+1), (zIndex+1)+(xIndex+1)*(indexMax+1), // clockwise face: a-across from origin, a and z across from origin, z-across from origin
                        );
                    }
                }
                
                vertexData.positions = positions;
                vertexData.indices = indices;
                vertexData.uvs = uvs;

                vertexData.normals = [];
                VertexData.ComputeNormals(vertexData.positions, vertexData.indices, vertexData.normals);

                vertexData.applyToMesh(groundBlock);

                const shaderMaterial = new ShaderMaterial("environment", scene, {
                    vertex: "ground",
                    fragment: "ground",
                }, {
                    attributes: ["position", "normal", "uv"],
                    uniforms: ["worldViewProjection", "world", "view", "time", "movementSpeed", "projection", "worldView", "viewProjection", "time", "vFogColor", "vFogInfos"],
                    samplers: ["windTexture", "heightTexture", "grassTexture"],
                });
        
                const heightTexture = new Texture("/grassets/noiseTexture-512x512.png", scene);
                shaderMaterial.setTexture("heightTexture", heightTexture);
        
                const windTexture = new Texture("/grassets/noiseTexture-64x64.png", scene);
                shaderMaterial.setTexture("windTexture", windTexture);

                const grassTexture = new Texture("/grassets/grassTexture3.jpeg", scene);
                shaderMaterial.setTexture("grassTexture", grassTexture);

                shaderMaterial.setMatrix("view", scene.getViewMatrix());
                shaderMaterial.setVector4("vFogInfos", new Vector4(scene.fogMode, scene.fogStart, scene.fogEnd, scene.fogDensity)); 
                shaderMaterial.setColor3("vFogColor", scene.fogColor);

                shaderMaterial.setVector3("movementSpeed", new Vector3(1, 0, 0));
        
                shaderMaterial.backFaceCulling = false;
        
                scene.registerBeforeRender( () => {
                  this.time += 0.01 * scene.getAnimationRatio()
                  shaderMaterial.setFloat("time", this.time);
                  if (this.heightScale > 5) {
                    shaderMaterial.setVector3("movementSpeed", this.player.velocity);
                  }
                });
        
                groundBlock.material = shaderMaterial;

                groundBlock.material.backFaceCulling = true;
                groundBlock.isVisible = true;
                groundBlock.isPickable = true;
                groundBlock.checkCollisions = true;

                const groundBlockQty = 4;
                const buffer = new Float32Array(16 * groundBlockQty * groundBlockQty);
                for (let i=0; i<groundBlockQty; i++) {
                    for (let j=0; j<groundBlockQty; j++) {
                        const matrix = Matrix.Translation((i-groundBlockQty/2)*blockSize, 0, (j-groundBlockQty/2)*blockSize);
                        matrix.copyToArray(buffer, i*16 + j*groundBlockQty*16);
                    }
                }

                groundBlock.thinInstanceSetBuffer("matrix", buffer, 16, true);
                groundBlock.thinInstanceEnablePicking = true;
            });
        });
    }
}