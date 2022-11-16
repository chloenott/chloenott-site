import React from "react";
import Router from 'next/router';
import styles from '../styles/particle_box.module.css';
import type { NextPage } from 'next';

import { MeshBuilder, Mesh, Vector3 } from "@babylonjs/core";
import { Scene, Color4 } from "@babylonjs/core";
import SceneComponent from "../Components/babylon/SceneComponent";

import Particles from "../public/grassets/particles";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { DefaultRenderingPipeline } from "@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline";

let box: Mesh;

const onSceneReady = (scene: Scene) => {
  scene.clearColor = window.matchMedia("(prefers-color-scheme: light)").matches ? new Color4(25/255, 25/255, 25/255, 1) : new Color4(25/255, 25/255, 25/255, 1);

  box = MeshBuilder.CreateBox("box", { size: 5 }, scene);
  box.visibility = 0;
  box.position.z += 53;
  box.position.x += 9;
  box.position.y += 300;
  box.scaling = new Vector3(5, 5, 5)

  const camera = new ArcRotateCamera("arc", 0, 3*Math.PI/4, 400, box.position, scene);
  camera.fov = 0.5;
  camera.useAutoRotationBehavior = true;
  camera.attachControl(scene.getEngine().getRenderingCanvas());

  new Particles(scene, box, scene.clearColor);

  const pipeline = new DefaultRenderingPipeline(
    "defaultPipeline",
    false,
    scene,
    [camera]
  );

  pipeline.samples = 4;
  pipeline.fxaaEnabled = true;

  pipeline.bloomEnabled = true;
  pipeline.bloomThreshold = 0.;
  pipeline.bloomWeight = 0.3;
  pipeline.grainEnabled = true;
  pipeline.grain.intensity = 10;
  pipeline.grain.animated = true;

  setTimeout(() => {
    Router.push('/living_reduction')
  }, 8000);

};

const onRender = (scene: Scene) => {
  let zoomSpeedScalar: number;
  const camera = scene.activeCamera as ArcRotateCamera
  if (camera.radius < 700) {
    zoomSpeedScalar = 5
  } else if (camera.radius >= 700 && camera.radius < 8000) {
    zoomSpeedScalar = 2000
  } else {
    zoomSpeedScalar = 0
  }

  const deltaTimeInMillis = scene.getEngine().getDeltaTime();
  camera.radius += zoomSpeedScalar * deltaTimeInMillis / 60
};

const ParticleSpacePage: NextPage = () => {
  return (
    <div className={styles.main}>
      <div className={styles.babylon}>
        <SceneComponent onSceneReady={onSceneReady} onRender={onRender} />
      </div>
    </div>
  )
}

export default ParticleSpacePage;