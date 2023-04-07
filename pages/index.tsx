import React from "react";
import styles from '../styles/grass_field.module.css';

import { Vector3, Vector4, MeshBuilder, Mesh, DepthOfFieldEffectBlurLevel, CubeTexture, Texture, StandardMaterial, FresnelParameters } from "@babylonjs/core";
import { Scene, Color3, Color4 } from "@babylonjs/core";
import SceneComponent from "../Components/babylon/SceneComponent";
import type { NextPage } from 'next';
import Particles from "../public/grassets/grass_particles";

import Environment from "../public/grassets/environment";
import Grass from "../public/grassets/grass";
import Player from "../public/grassets/player";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { DefaultRenderingPipeline } from "@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline";
import HazeSpheres from "../public/grassets/haze_sphere";
import Link from "next/link";

let box: Mesh;
let skybox: Mesh;
let elapsedTime: number;

const onSceneReady = (scene: Scene) => {
  elapsedTime = 0;
  scene.clearColor = new Color4(0/255, 0/255, 0/255, 1);

  scene.fogMode = Scene.FOGMODE_EXP2;
  scene.fogDensity = 0.00002;
  scene.fogColor = new Color3(0/255, 0/255, 0/255);

  box = MeshBuilder.CreateBox("box", { size: 0.1, height: 1 }, scene);
  box.visibility = 0
  box.position.y += 0;
  box.position.z += 247;
  box.position.x += 140;

  for (let i = 0; i < 10; i++) {
    createCylinder(scene, i.toString(), 30+5*i, 20+Math.random()*50)
  }

  const camera = new ArcRotateCamera("arc", -Math.PI/0.9, Math.PI / 2.0, 1, box.position, scene);
  camera.fov = 1.5
  camera.inertia = 0.95
  camera.lowerRadiusLimit = 1;
  camera.upperRadiusLimit = 1;
  camera.maxZ = 1000000;
  camera.target = box.position.add(new Vector3(0, 0, 0));
  camera.lowerBetaLimit = Math.PI/4;
  camera.upperBetaLimit = 7*Math.PI/8;
  camera.attachControl(scene.getEngine().getRenderingCanvas());
  camera.angularSensibilityX = 5000
  camera.angularSensibilityY = 5000
  camera.collisionRadius = new Vector3(1, 1, 1);
  camera.checkCollisions = true;
  camera.minZ = 0;

  skybox = MeshBuilder.CreateBox("skyBox", { size: 10000.0 }, scene);
	const skyboxMaterial = new StandardMaterial("skyBox", scene);
	skyboxMaterial.backFaceCulling = false;
	skyboxMaterial.reflectionTexture = new CubeTexture("/grassets/sky", scene);
	skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
	skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
	skyboxMaterial.specularColor = new Color3(0, 0, 0);
	skybox.material = skyboxMaterial;	
  skybox.rotation.y = 9*Math.PI/8;
  skybox.rotation.x = Math.PI/5;

  const player: Player = new Player(scene, camera, box);
  const grass: Grass = new Grass(scene, player);
  grass.player.mesh = player.mesh;
  new Particles(scene, player, new Color4(150/255, 185/255, 244/255, 1.));
  new Environment(scene, 1, player);
  new HazeSpheres(scene, player);

  const pipeline = new DefaultRenderingPipeline(
    "defaultPipeline",
    false,
    scene,
    [camera]
  );

  pipeline.samples = 4;
  pipeline.fxaaEnabled = true;

  pipeline.depthOfFieldEnabled = false;
  pipeline.depthOfFieldBlurLevel = DepthOfFieldEffectBlurLevel.High;
  pipeline.depthOfField.focusDistance = 250000;
  pipeline.depthOfField.focalLength = 1000;
  pipeline.depthOfField.fStop = 3.5;

  pipeline.bloomEnabled = true;
  pipeline.bloomThreshold = 0.01;
  pipeline.bloomWeight = 0.5;
  pipeline.bloomKernel = 128;
  
  pipeline.grainEnabled = true;
  pipeline.grain.intensity = 30;
  pipeline.grain.animated = false;

};

const createCylinder = (scene: Scene, id: string, diameter: number, positionY: number) => {
  const faceUV = [];
	faceUV[0] =	new Vector4(0, 0, 0, 0);
  faceUV[1] =	new Vector4(0, 0, -1, 1);
  faceUV[2] = new Vector4(0, 0, 0, 0);
  const cylinder = MeshBuilder.CreateCylinder(id, { height: diameter/41*4, diameter: diameter, faceUV: faceUV, tessellation: 100 }, scene);
  cylinder.visibility = 1
  const cylinderMaterial = new StandardMaterial("cylinderMaterial", scene);
  cylinderMaterial.diffuseTexture = new Texture("/grassets/test.png", scene);
  cylinderMaterial.emissiveTexture = new Texture("/grassets/test.png", scene);
  cylinderMaterial.specularColor = new Color3(0, 0, 0);
  cylinderMaterial.useEmissiveAsIllumination = true;
  cylinderMaterial.opacityTexture = new Texture("/grassets/test.png", scene);
  cylinderMaterial.emissiveFresnelParameters = new FresnelParameters();
  cylinderMaterial.emissiveFresnelParameters.bias = 0.5;
  cylinderMaterial.emissiveFresnelParameters.power = -20;
  cylinderMaterial.backFaceCulling = false;
  cylinderMaterial.alpha = 0.4
  cylinderMaterial.transparencyMode = StandardMaterial.MATERIAL_ALPHABLEND;
  cylinderMaterial.alphaMode = StandardMaterial.MATERIAL_ALPHABLEND;
  cylinder.material = cylinderMaterial;
  cylinder.position.y += positionY;
  cylinder.position.z += 251;
  cylinder.position.x += 185;
}

const onRender = (scene: Scene) => {
  const deltaTimeInMillis = scene.getEngine().getDeltaTime();
  elapsedTime += deltaTimeInMillis;
  if (scene?.getMeshById("skyBox")) {
    skybox.rotation.z -= 0.0002 * deltaTimeInMillis / 60;
  }
  for (let i = 0; i < 10; i++) {
    scene!.getMeshById(i.toString())!.rotation.y += i * 0.001 * deltaTimeInMillis / 60;
    // scene!.getMeshById(i.toString())!.scalingDeterminant = 1.5+2*Math.sin(elapsedTime/6000+i);
    // scene!.getMeshById(i.toString())!.position.y = 50+5*Math.cos(elapsedTime/6000+i);
  }
};

const GrassFieldPage: NextPage = () => {
  return (
    <div className={styles.main}>
      <div className={styles.babylon}>
        <SceneComponent onSceneReady={onSceneReady} onRender={onRender} />
      </div>
      <p className={styles.milkywaycredit}>
        <Link className={styles.milkywaycredit_link} href="https://www.eso.org/public/usa/images/eso0932a/">The Milky Way panorama credit: ESO/S. Brunier</Link>
      </p>
    </div>
  )
}

export default GrassFieldPage;