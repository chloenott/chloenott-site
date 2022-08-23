import React from "react";
import { FreeCamera, Vector3, HemisphericLight, MeshBuilder, Mesh } from "@babylonjs/core";
import { Scene, Color3, Color4 } from "@babylonjs/core";
import SceneComponent from "./SceneComponent";
import Header from "../../Components/Header";
import type { NextPage } from 'next'
import Grass from "./grass";

let box: Mesh;

const onSceneReady = (scene: Scene) => {
  var camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);
  camera.setTarget(Vector3.Zero());

  const canvas = scene.getEngine().getRenderingCanvas();
  scene.clearColor = window.matchMedia("(prefers-color-scheme: light)").matches ? new Color4(189/255, 196/255, 200/255, 0) : new Color4(59/255, 60/255, 61/255, 0);

  camera.attachControl(canvas, true);

  scene.fogMode = Scene.FOGMODE_EXP2;
  scene.fogDensity = 0.0010;
  scene.fogStart = 50;
  scene.fogEnd = 2000;
  scene.fogColor = new Color3(6/256, 25/256, 64/256);

  var light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
  light.intensity = 0.7;
  box = MeshBuilder.CreateBox("box", { size: 2 }, scene);
  box.position.y = 10;
  MeshBuilder.CreateGround("ground", { width: 6, height: 6 }, scene);

  new Grass(scene, box);
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