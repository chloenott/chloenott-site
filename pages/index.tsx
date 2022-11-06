import React from "react";
import Router from 'next/router';
import styles from '../styles/index.module.css';
import type { NextPage } from 'next';

import { MeshBuilder, Mesh, Vector3 } from "@babylonjs/core";
import { Scene, Color4 } from "@babylonjs/core";
import SceneComponent from "../Components/babylon/SceneComponent";

import Particles from "../public/grassets/particles";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { DefaultRenderingPipeline } from "@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline";

let box: Mesh;

const onSceneReady = (scene: Scene) => {
  const canvas = scene.getEngine().getRenderingCanvas();
  scene.clearColor = window.matchMedia("(prefers-color-scheme: light)").matches ? new Color4(195/255, 209/255, 224/255, 1) : new Color4(25/255, 25/255, 25/255, 1);

  box = MeshBuilder.CreateBox("box", { size: 5 }, scene);
  box.visibility = 0;
  box.position.z += 53;
  box.position.x += 9;
  box.position.y += 900;
  box.scaling = new Vector3(5, 5, 5)
  box.renderingGroupId = 0;

  let camera = new ArcRotateCamera("arc", 0, 3*Math.PI/4, 400, box.position, scene);
  camera.fov = 0.5;
  // camera.maxZ = 1000000;
  // camera.upperBetaLimit = Math.PI/2.2;
  // camera.lowerBetaLimit = Math.PI/4;
  // camera.upperRadiusLimit = 1400;
  //camera.useAutoRotationBehavior = true;
  camera.attachControl(scene.getEngine().getRenderingCanvas());

  const particles = new Particles(scene, box, scene.clearColor);

  box.alphaIndex = particles.particles.alphaIndex;

  // var pipeline = new DefaultRenderingPipeline(
  //   "defaultPipeline", // The name of the pipeline
  //   false, // Do you want the pipeline to use HDR texture?
  //   scene, // The scene instance
  //   [camera] // The list of cameras to be attached to
  // );

  // pipeline.samples = 4;
  // pipeline.fxaaEnabled = true;

  // pipeline.bloomEnabled = true;
  // pipeline.bloomThreshold = 0.;
  // pipeline.bloomWeight = 0.5;
  // pipeline.grainEnabled = true;
  // pipeline.grain.intensity = 10;
  // pipeline.grain.animated = true;

  // setTimeout(() => {
  //   Router.push('/')
  // }, 9000);

};

const onRender = (scene: Scene) => {
};

const ParticleSpacePage: NextPage = () => {

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

export default ParticleSpacePage;