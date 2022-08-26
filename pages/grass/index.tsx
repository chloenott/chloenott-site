import React from "react";
import { FreeCamera, Vector3, HemisphericLight, MeshBuilder, Mesh, MeshParticleEmitter, BoxParticleEmitter } from "@babylonjs/core";
import { Scene, Color3, Color4 } from "@babylonjs/core";
import SceneComponent from "./SceneComponent";
import Header from "../../Components/Header";
import type { NextPage } from 'next'
import Environment from "../../public/grassets/environment";
import Grass from "../../public/grassets/grass";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { LensRenderingPipeline } from "@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/lensRenderingPipeline";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { ParticleSystem } from "@babylonjs/core/Particles/particleSystem";


let box: Mesh;

const onSceneReady = (scene: Scene) => {
  const canvas = scene.getEngine().getRenderingCanvas();
  scene.clearColor = window.matchMedia("(prefers-color-scheme: light)").matches ? new Color4(189/255, 196/255, 200/255, 0) : new Color4(59/255, 60/255, 61/255, 0);

  scene.fogMode = Scene.FOGMODE_LINEAR;
  scene.fogDensity = 0.001;
  scene.fogStart = 800;
  scene.fogEnd = 1000
  scene.fogColor = new Color3(240/256, 240/256, 255/256);

  var light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
  light.intensity = 0.7;
  box = MeshBuilder.CreateBox("box", { size: 2 }, scene);
  box.visibility = 1;
  box.position.y += 10

  let camera = new ArcRotateCamera("arc", -Math.PI / 3, Math.PI / 2.2, 1000, box.position, scene);
  camera.fov = 0.8
  camera.lowerRadiusLimit = 50;
  camera.upperRadiusLimit = 150;
  camera.maxZ = 1000000;
  camera.target = box.position.add(new Vector3(0, 5, 0));
  camera.lowerBetaLimit = Math.PI / 2.5
  camera.upperBetaLimit = Math.PI / 2.1
  camera.attachControl(scene.getEngine().getRenderingCanvas());

  new Environment(scene, 1);
  new Environment(scene, 500);
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