import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math";
import { Vector4 } from "@babylonjs/core/Maths/math";
import { VertexData } from "@babylonjs/core/Meshes/mesh.vertexData.js";
import { InstancedMesh } from "@babylonjs/core/Meshes/instancedMesh";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Color4 } from "@babylonjs/core/Maths/math";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Color3 } from "@babylonjs/core/Maths/math";
import { Effect } from "@babylonjs/core/Materials/effect";
import { ShaderMaterial } from "@babylonjs/core/Materials/shaderMaterial";
import { Matrix } from "@babylonjs/core/Maths/math";
import { Nullable, FloatArray, IndicesArray } from "@babylonjs/core";

Effect.ShadersStore["groundVertexShader"] = `
    precision highp float;

    // Attributes
    attribute vec3 position;
    attribute vec2 uv;
    attribute vec3 normal;

    // Uniforms
    uniform mat4 viewProjection;
    uniform mat4 view;

    // Varying
    varying vec2 vUV;
    varying float fFogDistance;
    varying float lightIntensity;

    #include<instancesDeclaration>

    void main(void) {
        #include<instancesVertex>
        gl_Position = viewProjection * finalWorld * vec4(position, 1.0);

        fFogDistance = (view * finalWorld * vec4(position, 1.0)).z;

        vUV = uv;
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
    uniform vec4 vFogInfos;
    uniform vec3 vFogColor;
    uniform sampler2D grassTexture;

    varying float fFogDistance;
    varying vec2 vUV;
    varying float lightIntensity;

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
        vec3 color = 0.9*vec3(0, 0.8, 0.301);

        float fog = CalcFogFactor();
        color.rgb = fog * color.rgb + (1.0 - fog) * vFogColor;

        gl_FragColor = vec4(color, 1.);
    }
`

export default class Environment {
    public groundTexture: Texture;

    constructor(scene: Scene) {
        scene.collisionsEnabled = true;
        scene.clearColor = new Color4(146/256, 203/256, 223/256, 1.0);
        this.groundTexture = new Texture("/grassets/noiseTexture.png", scene);

        let core = Mesh.CreateCylinder("core", 50000, 20, 20, 6, 2, scene);
        core.rotation.x = Math.PI / 2;
        core.isPickable = false;
        let material = new StandardMaterial("material", scene);
        material.ambientColor = new Color3(1., 1., 1.);
        material.diffuseColor = new Color3(0.4, 0.4, 0.4);
        material.emissiveColor = new Color3(0.8, 0.9, 1.0);
        material.specularColor = new Color3(0, 0, 0);
        material.alpha = 0.5;
        core.material = material;

        core.createInstance("coreInstance");
        core.scaling = new Vector3(1.2, 1.2, 1.2);

        core.createInstance("coreInstance");
        core.scaling = new Vector3(1.4, 1.4, 1.41);

        this.loadLights(scene);
        this.loadGround(scene);
    }

    public loadLights(scene: Scene) {
        let lightAmbient = new HemisphericLight("ambientLight", new Vector3(0, 0, 0), scene);
        lightAmbient.intensity = 1.;
    }

    private loadGround(scene: Scene): void {
        let groundBlock = new Mesh('ground', scene);

        let vertexData = new VertexData();

        let curveVertices: Vector3[] = [];
        let positions: Array<number> = [];
        let indices: Array<number> = [];
        let uvs: Array<number> = [];
        
        let segmentsA = 32;
        let segmentsZ = 32;
        let radius = 116;
        let depth = 1000;
        let alpha = 2*Math.PI

        let heightTexture = new Texture("/grassets/noiseTexture-32x32.png", scene, undefined, undefined, undefined, () => {
            heightTexture.readPixels().then( (heightTextureData) => {

                // Pushes a tube of circles, each circle with "segments" number of vertices, into the curveVertices array (tube).
                for (let zIndex=0; zIndex<=segmentsZ; zIndex++) {
                    for (let i=0; i<=segmentsA; i++) {
                        //let random = Math.random();
                        let random = 50 + (heightTextureData[4*(zIndex%segmentsZ) + 4*(i%segmentsA)*32]/255) * 100.; // 4*2*i + 4*zIndex*64
                        positions.push(
                            (random) * Math.cos(alpha*(i/segmentsA)),
                            (random) * Math.sin(alpha*(i/segmentsA)),
                            zIndex*depth/segmentsZ - depth/2
                        )

                        uvs.push(
                            i/segmentsA, zIndex/segmentsZ,
                        )
                    }
                }

                // Triangles between each adjacent circle.
                for (let zIndex=0; zIndex<segmentsZ; zIndex++) {
                    for (let i=0; i<segmentsA; i++) {
                        indices.push(
                            (i+0)+(zIndex+0)*(segmentsA+1), (i+1)+(zIndex+0)*(segmentsA+1), (i+0)+(zIndex+1)*(segmentsA+1), // clockwise face: origin, a-across from origin, z-across from origin
                            (i+1)+(zIndex+0)*(segmentsA+1), (i+1)+(zIndex+1)*(segmentsA+1), (i+0)+(zIndex+1)*(segmentsA+1), // clockwise face: a-across from origin, a and z across from origin, z-across from origin
                        );
                    }
                }
                
                vertexData.positions = positions;
                vertexData.indices = indices;
                vertexData.uvs = uvs;

                vertexData.normals = [];
                VertexData.ComputeNormals(vertexData.positions, vertexData.indices, vertexData.normals);

                vertexData.applyToMesh(groundBlock);

                let shaderMaterial = new ShaderMaterial("shader", scene, {
                    vertex: "ground",
                    fragment: "ground",
                }, {
                    attributes: ["position", "normal", "uv"],
                    uniforms: ["worldViewProjection", "world", "view", "projection", "worldView", "viewProjection", "vFogColor", "vFogInfos"],
                    samplers: ["windTexture", "heightTexture", "grassTexture"],
                });
        
                let heightTexture = new Texture("/grassets/noiseTexture-32x32.png", scene);
                shaderMaterial.setTexture("heightTexture", heightTexture);
        
                let windTexture = new Texture("/grassets/noiseTexture-64x64.png", scene);
                shaderMaterial.setTexture("windTexture", windTexture);

                let grassTexture = new Texture("/grassets/grassTexture.jpeg", scene);
                shaderMaterial.setTexture("grassTexture", grassTexture);

                shaderMaterial.setMatrix("view", scene.getViewMatrix());
                shaderMaterial.setVector4("vFogInfos", new Vector4(scene.fogMode, scene.fogStart, scene.fogEnd, scene.fogDensity)); 
                shaderMaterial.setColor3("vFogColor", scene.fogColor);
        
                shaderMaterial.backFaceCulling = false;
        
                groundBlock.material = shaderMaterial;

                groundBlock.material.backFaceCulling = true;
                groundBlock.isVisible = true;
                groundBlock.isPickable = false;

                let groundBlockQty = 30;
                let buffer = new Float32Array(16 * groundBlockQty);

                // let matrix1 = Matrix.Translation(0, 0, (-1) * 1000);
                // let matrix2 = Matrix.Translation(0, 0, (0) * 1000);
                // let matrix3 = Matrix.Translation(0, 0, (1) * 1000);
                // matrix1.copyToArray(buffer, 0 * 16);
                // matrix2.copyToArray(buffer, 1 * 16);
                // matrix3.copyToArray(buffer, 2 * 16);

                for (let i=0; i<groundBlockQty; i++) {
                    let matrix = Matrix.Translation(0, 0, (i-Math.floor(groundBlockQty/2))*1000);
                    matrix.copyToArray(buffer, i * 16);
                }

                groundBlock.thinInstanceSetBuffer("matrix", buffer, 16, true);
                groundBlock.thinInstanceEnablePicking = true;
            });
        });
    }
}