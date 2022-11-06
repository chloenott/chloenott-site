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
  box.position.y += 300;
  box.scaling = new Vector3(5, 5, 5)

  let camera = new ArcRotateCamera("arc", 0, 3*Math.PI/4, 400, box.position, scene);
  camera.fov = 0.5;
  // camera.maxZ = 1000000;
  // camera.upperBetaLimit = Math.PI/2.2;
  // camera.lowerBetaLimit = Math.PI/4;
  // camera.upperRadiusLimit = 1400;
  camera.useAutoRotationBehavior = true;
  camera.attachControl(scene.getEngine().getRenderingCanvas());

  const particles = new Particles(scene, box, scene.clearColor);

  var pipeline = new DefaultRenderingPipeline(
    "defaultPipeline", // The name of the pipeline
    false, // Do you want the pipeline to use HDR texture?
    scene, // The scene instance
    [camera] // The list of cameras to be attached to
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
    Router.push('/')
  }, 19000);

};

const onRender = (scene: Scene) => {
  var zoomSpeedScalar;
  if (scene.activeCamera.radius < 700) {
    var zoomSpeedScalar = 5
  } else if (scene.activeCamera.radius >= 700 && scene.activeCamera.radius < 8000) {
    var zoomSpeedScalar = 2000
  } else {
    var zoomSpeedScalar = 0
  }

  var deltaTimeInMillis = scene.getEngine().getDeltaTime();
  scene.activeCamera.radius += zoomSpeedScalar * deltaTimeInMillis / 60
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
    // <div className={styles.main}>
    //     <SceneComponent onSceneReady={onSceneReady} onRender={onRender} />
    // </div>

    <div className={styles.main}>
      <p className={styles.bigText_123}>
        <span className={styles.bigText_1}>there are 90,000 software developers in washington state</span>
        <br></br>
        <span className={styles.bigText_2}>imagine the sheer chaos if chloe joined the party</span>
      </p>
      <p className={styles.bigText_chloewho}>what does that even mean?</p>
      <p className={styles.bigText_gladyouasked}>THE. SHEER. CHAOS.</p>
      <div>
        <SceneComponent onSceneReady={onSceneReady} onRender={onRender} />
      </div>
    </div>
  )
}

export default ParticleSpacePage;