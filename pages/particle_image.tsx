import React from "react";
import Router from 'next/router';
import styles from '../styles/particle_image.module.css';
import type { NextPage } from 'next';

import { MeshBuilder, Mesh } from "@babylonjs/core";
import { Scene, Color4 } from "@babylonjs/core";
import SceneComponent from "../Components/babylon/SceneComponent";

import Particles from "../public/grassets/particle_image";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { DefaultRenderingPipeline } from "@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline";

let box: Mesh;

const onSceneReady = (scene: Scene) => {
  scene.clearColor = window.matchMedia("(prefers-color-scheme: light)").matches ? new Color4(25/255, 25/255, 25/255, 1) : new Color4(25/255, 25/255, 25/255, 1);

  box = MeshBuilder.CreateBox("box", { size: 5 }, scene);
  box.visibility = 1
  box.position.z += 53;
  box.position.x += 9;
  box.position.y += 750;

  const camera = new ArcRotateCamera("arc", -Math.PI/2, -Math.PI, 0, box.position, scene);
  camera.fov = 1.2;
  camera.maxZ = 1000000;
  camera.attachControl(scene.getEngine().getRenderingCanvas());

  new Particles(scene, box);

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
  pipeline.bloomWeight = 0.5;
  pipeline.grainEnabled = true;
  pipeline.grain.intensity = 10;
  pipeline.grain.animated = true;

  setTimeout(() => {
    Router.push('/particle_box')
  }, 4500);

};

const onRender = () => {
  // nothing to do here
};

const ParticleImage: NextPage = () => {
  return (
    <div className={styles.main}>
      <div className={styles.babylon}>
        <SceneComponent onSceneReady={onSceneReady} onRender={onRender} />
      </div>
    </div>
  )
}

export default ParticleImage;