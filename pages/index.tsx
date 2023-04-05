import React from "react";
import Image from 'next/image'
import styles from '../styles/grass_field.module.css';

import { Vector3, MeshBuilder, Mesh, DepthOfFieldEffectBlurLevel, CubeTexture, Texture, StandardMaterial } from "@babylonjs/core";
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

const onSceneReady = (scene: Scene) => {
  scene.clearColor = new Color4(0/255, 0/255, 0/255, 1);

  scene.fogMode = Scene.FOGMODE_EXP2;
  scene.fogDensity = 0.00002;
  scene.fogColor = new Color3(255/255, 255/255, 255/255);

  box = MeshBuilder.CreateBox("box", { size: 0.1, height: 1 }, scene);
  box.visibility = 0
  box.position.y += 0;

  const camera = new ArcRotateCamera("arc", -Math.PI/0.9, Math.PI / 1.7, 1, box.position, scene);
  camera.fov = 1.9
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

  skybox = MeshBuilder.CreateBox("skyBox", { size: 10000.0 }, scene);
	const skyboxMaterial = new StandardMaterial("skyBox", scene);
	skyboxMaterial.backFaceCulling = false;
	skyboxMaterial.reflectionTexture = new CubeTexture("/grassets/sky", scene);
	skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
	skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
	skyboxMaterial.specularColor = new Color3(0, 0, 0);
	skybox.material = skyboxMaterial;	
  skybox.rotation.y = 9*Math.PI/8;
  skybox.rotation.x = -Math.PI/5;

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

  pipeline.depthOfFieldEnabled = true;
  pipeline.depthOfFieldBlurLevel = DepthOfFieldEffectBlurLevel.High;
  pipeline.depthOfField.focusDistance = 250000;
  pipeline.depthOfField.focalLength = 1000;
  pipeline.depthOfField.fStop = 3.5;

  pipeline.bloomEnabled = true;
  pipeline.bloomThreshold = 0.01;
  pipeline.bloomWeight = 0.5;
  pipeline.bloomKernel = 128;
  
  pipeline.grainEnabled = true;
  pipeline.grain.intensity = 20;
  pipeline.grain.animated = false;

};

const onRender = (scene: Scene) => {
  const deltaTimeInMillis = scene.getEngine().getDeltaTime();
  if (scene?.getMeshById("skyBox")) {
    skybox.rotation.z -= 0.0002 * deltaTimeInMillis / 60;
  }
};

const GrassFieldPage: NextPage = () => {
  return (
    <div className={styles.main}>
      <div className={styles.babylon}>
        <SceneComponent onSceneReady={onSceneReady} onRender={onRender} />
      </div>
      <div className={styles.wasd}>
        <Image width={73} height={48} style={{ width: "auto", height: "auto", alignItems: "right" }} src="/wasd.png" alt="Icon indicating W-A-S-D key movement control" />
      </div>
      <p className={styles.milkywaycredit}>
        <Link className={styles.milkywaycredit_link} href="https://www.eso.org/public/usa/images/eso0932a/">The Milky Way panorama credit: ESO/S. Brunier</Link>
      </p>
    </div>
  )
}

export default GrassFieldPage;