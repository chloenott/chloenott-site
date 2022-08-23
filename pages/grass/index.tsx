import React from "react";
import { FreeCamera, Vector3, HemisphericLight, MeshBuilder, Mesh } from "@babylonjs/core";
import { Scene, Color3, Color4 } from "@babylonjs/core";
import SceneComponent from "./SceneComponent";
import Header from "../../Components/Header";
import type { NextPage } from 'next'
import Environment from "../../public/grassets/environment";
import Grass from "../../public/grassets/grass";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";

let box: Mesh;

const onSceneReady = (scene: Scene) => {
  const canvas = scene.getEngine().getRenderingCanvas();
  scene.clearColor = window.matchMedia("(prefers-color-scheme: light)").matches ? new Color4(189/255, 196/255, 200/255, 0) : new Color4(59/255, 60/255, 61/255, 0);

  scene.fogMode = Scene.FOGMODE_EXP2;
  scene.fogDensity = 0.0015;
  scene.fogColor = new Color3(146/256, 203/256, 223/256);

  var light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
  light.intensity = 0.7;
  box = MeshBuilder.CreateBox("box", { size: 2 }, scene);
  box.position.y = -90;
  box.visibility = 0;

  let camera = new ArcRotateCamera("arc", -Math.PI / 2, Math.PI / 2, 25, box.position, scene);
  camera.fov = 0.8;
  camera.lowerRadiusLimit = 0;
  camera.upperRadiusLimit = 300;
  camera.attachControl(scene.getEngine().getRenderingCanvas());
  camera.checkCollisions = true;
  camera.collisionRadius = new Vector3(0.5, 0.5, 0.5);

  new Environment(scene);
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