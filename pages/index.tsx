import React from "react";
import Image from 'next/image'
import styles from '../styles/grass_field.module.css';

import { Vector3, MeshBuilder, Mesh, DepthOfFieldEffectBlurLevel, CubeTexture } from "@babylonjs/core";
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

let box: Mesh;

const onSceneReady = (scene: Scene) => {
  scene.clearColor = window.matchMedia("(prefers-color-scheme: light)").matches ? new Color4(25/255, 25/255, 25/255, 1) : new Color4(25/255, 25/255, 25/255, 1);

  scene.fogMode = Scene.FOGMODE_EXP2;
  scene.fogDensity = 0.;
  scene.fogStart = 700;
  scene.fogEnd = 900;
  scene.fogColor = new Color3(16/255, 28/255, 49/255);

  box = MeshBuilder.CreateBox("box", { size: 0.1, height: 500 }, scene);
  box.visibility = 0
  box.position.y -= 50;

  const camera = new ArcRotateCamera("arc", -Math.PI, Math.PI / 2.1, 50, box.position, scene);
  camera.fov = 1.2
  camera.lowerRadiusLimit = 50;
  camera.upperRadiusLimit = 50;
  camera.maxZ = 1000000;
  camera.target = box.position.add(new Vector3(0, 5, 0));
  camera.lowerBetaLimit = Math.PI / 2
  camera.upperBetaLimit = Math.PI / 2
  camera.attachControl(scene.getEngine().getRenderingCanvas());
  //camera.useAutoRotationBehavior = true;

  const cubeTexture = new CubeTexture("/grassets/sky", scene);
  scene.createDefaultSkybox(cubeTexture, false, 10000);

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
  pipeline.depthOfField.fStop = 2.5;

  pipeline.bloomEnabled = true;
  pipeline.bloomThreshold = 0.01;
  pipeline.bloomWeight = 0.5;
  
  pipeline.grainEnabled = true;
  pipeline.grain.intensity = 10;
  pipeline.grain.animated = true;

};

const onRender = (scene: Scene) => {
  let zoomSpeedScalar: number;
  const camera = scene.activeCamera as ArcRotateCamera;
  if (camera.radius < 700) {
    zoomSpeedScalar = 5;
  } else if (camera.radius >= 700 && camera.radius < 8000) {
    zoomSpeedScalar = 2000;
  } else {
    zoomSpeedScalar = 0;
  }

  const deltaTimeInMillis = scene.getEngine().getDeltaTime();
  camera.radius += zoomSpeedScalar * deltaTimeInMillis / 60;
};

const GrassFieldPage: NextPage = () => {
  return (
    <div className={styles.main}>
      <div className={styles.babylon}>
        <SceneComponent onSceneReady={onSceneReady} onRender={onRender} />
      </div>
      <div className={styles.wasd}>
        <Image width={110} height={72} style={{ width: "auto", height: "auto" }} src="/wasd.svg" alt="Icon indicating W-A-S-D key movement control" />
      </div>
    </div>
  )
}

export default GrassFieldPage;