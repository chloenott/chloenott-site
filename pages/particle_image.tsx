import React from "react";
import Router from 'next/router';
import styles from '../styles/index.module.css';
import type { NextPage } from 'next';

import { MeshBuilder, Mesh, DepthOfFieldEffectBlurLevel } from "@babylonjs/core";
import { Scene, Color4 } from "@babylonjs/core";
import SceneComponent from "../Components/babylon/SceneComponent";

import Particles from "../public/grassets/particle_image";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { DefaultRenderingPipeline } from "@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline";

let box: Mesh;

const onSceneReady = (scene: Scene) => {
  const canvas = scene.getEngine().getRenderingCanvas();
  scene.clearColor = window.matchMedia("(prefers-color-scheme: light)").matches ? new Color4(25/255, 25/255, 25/255, 1) : new Color4(25/255, 25/255, 25/255, 1);

  box = MeshBuilder.CreateBox("box", { size: 5 }, scene);
  box.visibility = 1
  box.position.z += 53;
  box.position.x += 9;
  box.position.y += 750;

  let camera = new ArcRotateCamera("arc", -Math.PI/2, -Math.PI, 0, box.position, scene);
  camera.fov = 1.2;
  camera.maxZ = 1000000;
  camera.attachControl(scene.getEngine().getRenderingCanvas());

  new Particles(scene, box);

  var pipeline = new DefaultRenderingPipeline(
    "defaultPipeline",
    false,
    scene,
    [camera]
  );

  pipeline.samples = 4;
  pipeline.fxaaEnabled = true;

  pipeline.bloomEnabled = true;
  pipeline.bloomThreshold = 0.;
  pipeline.bloomWeight = 0.5;
  pipeline.grainEnabled = true;
  pipeline.grain.intensity = 10;
  pipeline.grain.animated = true;

  setTimeout(() => {
    Router.push('/grass_field')
  }, 4500);

};

const onRender = (scene: Scene) => {
  var deltaTimeInMillis = scene.getEngine().getDeltaTime();
};

const ParticleImage: NextPage = () => {

  if (typeof window !== "undefined") {
    let maxTimerId = window.setTimeout(() => {}, 0);
    while (maxTimerId) {
      maxTimerId--;
      window.clearTimeout(maxTimerId);
    }
  }

  return (
    <div className={styles.main}>
        <SceneComponent onSceneReady={onSceneReady} onRender={onRender} />
    </div>
  )
}

export default ParticleImage;