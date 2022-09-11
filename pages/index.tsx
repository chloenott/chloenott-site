import React from "react";
import Router from 'next/router';
import styles from '../styles/index.module.css';
import type { NextPage } from 'next';

import { MeshBuilder, Mesh } from "@babylonjs/core";
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
  box.visibility = 1
  box.position.z += 53;
  box.position.x += 9;
  box.position.y += 730;

  let camera = new ArcRotateCamera("arc", -Math.PI/2, -Math.PI, 0, box.position, scene);
  camera.fov = 0.5;
  camera.maxZ = 1000000;
  camera.attachControl(scene.getEngine().getRenderingCanvas());

  new Particles(scene, box, scene.clearColor);

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