import React from "react";
import { FreeCamera, Vector3, HemisphericLight, MeshBuilder, Mesh } from "@babylonjs/core";
import { Engine, Scene } from "@babylonjs/core";
import SceneComponent from "./SceneComponent";
import Header from "./Header";
import type { NextPage } from 'next'

let box: Mesh;

const onSceneReady = (scene: Scene) => {
  var camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);
  camera.setTarget(Vector3.Zero());

  const canvas = scene.getEngine().getRenderingCanvas();

  camera.attachControl(canvas, true);

  var light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
  light.intensity = 0.7;
  box = MeshBuilder.CreateBox("box", { size: 2 }, scene);
  box.position.y = 1;
  MeshBuilder.CreateGround("ground", { width: 6, height: 6 }, scene);
};

const onRender = (scene: Scene) => {
  if (box !== undefined) {
    var deltaTimeInMillis = scene.getEngine().getDeltaTime();

    const rpm = 10;
    box.rotation.y += (rpm / 60) * Math.PI * 2 * (deltaTimeInMillis / 1000);
  }
};

const Sample: NextPage = () => {
  return (
    <div>
      <Header />
      <SceneComponent onSceneReady={onSceneReady} onRender={onRender} />
    </div>
  )
}

export default Sample;