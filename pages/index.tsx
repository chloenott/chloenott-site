import React from "react";
import Router from 'next/router';
import styles from '../styles/index.module.css';
import type { NextPage } from 'next';

import { MeshBuilder, Mesh } from "@babylonjs/core";
import { Scene, Color4 } from "@babylonjs/core";
import SceneComponent from "../Components/babylon/SceneComponent";

import Particles from "../public/grassets/particles";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";

let box: Mesh;

const onSceneReady = (scene: Scene) => {
  const canvas = scene.getEngine().getRenderingCanvas();
  scene.clearColor = window.matchMedia("(prefers-color-scheme: light)").matches ? new Color4(54/255, 61/255, 69/255, 1) : new Color4(54/255, 61/255, 69/255, 1);

  box = MeshBuilder.CreateBox("box", { size: 5 }, scene);
  box.visibility = 0
  box.position.z += 58;
  box.position.x += 9;
  box.position.y += 250;

  let camera = new ArcRotateCamera("arc", -Math.PI/2, -Math.PI, 500, box.position, scene);
  camera.fov = 1.2;
  camera.maxZ = 1000000;
  camera.attachControl(scene.getEngine().getRenderingCanvas());

  new Particles(scene, box);

  setTimeout(() => {
    Router.push('/big_text')
  }, 9000);

};

const onRender = (scene: Scene) => {
};

const ParticleSpacePage: NextPage = () => {

  let maxTimerId = window.setTimeout(() => {}, 0);
  while (maxTimerId) {
    maxTimerId--;
    window.clearTimeout(maxTimerId);
  }

  return (
    <div className={styles.main}>
        <section className={styles.info_card}>
          <p className={styles.card_title}>Me</p><p className={styles.card_year}> 2022</p>
          <p className={styles.card_medium}>Babylon.js, GLSL</p>
        </section>

        <SceneComponent onSceneReady={onSceneReady} onRender={onRender} />
    </div>
  )
}

export default ParticleSpacePage;