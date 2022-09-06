import React from "react";

import { Vector3, MeshBuilder, Mesh, DepthOfFieldEffectBlurLevel } from "@babylonjs/core";
import { Scene, Color3, Color4 } from "@babylonjs/core";
import SceneComponent from "../Components/babylon/SceneComponent";
import ChatWindow from "../Components/babylon/ChatWindow";
import type { NextPage } from 'next';

import Environment from "../public/grassets/environment";
import Grass from "../public/grassets/grass";
import Player from "../public/grassets/player";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { DefaultRenderingPipeline } from "@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline";

let box: Mesh;

const onSceneReady = (scene: Scene) => {
  const canvas = scene.getEngine().getRenderingCanvas();
  scene.clearColor = window.matchMedia("(prefers-color-scheme: light)").matches ? new Color4(70/255, 79/255, 89/255, 1) : new Color4(70/255, 79/255, 89/255, 1);

  scene.fogMode = Scene.FOGMODE_EXP2;
  scene.fogDensity = 0.0002;
  scene.fogStart = 700;
  scene.fogEnd = 900;
  scene.fogColor = new Color3(220/255, 220/255, 240/255);

  box = MeshBuilder.CreateBox("box", { size: 5 }, scene);
  box.visibility = 0
  box.position.y -= 50;

  let camera = new ArcRotateCamera("arc", -Math.PI, Math.PI / 2.1, 50, box.position, scene);
  camera.fov = 1.2
  camera.lowerRadiusLimit = 20;
  camera.upperRadiusLimit = 100;
  camera.maxZ = 1000000;
  camera.target = box.position.add(new Vector3(0, 5, 0));
  camera.lowerBetaLimit = Math.PI / 3
  camera.upperBetaLimit = Math.PI / 2.1
  camera.attachControl(scene.getEngine().getRenderingCanvas());
  camera.useAutoRotationBehavior = true;

  new Environment(scene, 1);
  new Environment(scene, 100);
  let grass: Grass = new Grass(scene, box);
  let player: Player
  player = new Player(scene, '1', camera, box);
  grass.box = player.mesh;

  var pipeline = new DefaultRenderingPipeline(
    "defaultPipeline", // The name of the pipeline
    false, // Do you want the pipeline to use HDR texture?
    scene, // The scene instance
    [camera] // The list of cameras to be attached to
  );

  pipeline.samples = 4;
  pipeline.fxaaEnabled = true;

  pipeline.depthOfFieldEnabled = false;
  pipeline.depthOfFieldBlurLevel = DepthOfFieldEffectBlurLevel.Low;
  pipeline.depthOfField.focusDistance = 50;
  pipeline.depthOfField.focalLength = 20;
  pipeline.depthOfField.fStop = 2;

  pipeline.bloomEnabled = true;
  pipeline.bloomThreshold = 0.1;
  pipeline.bloomWeight = 0.1;
  pipeline.grainEnabled = true;
  pipeline.grain.intensity = 3;

};

const onRender = (scene: Scene) => {
  if (box !== undefined) {
    var deltaTimeInMillis = scene.getEngine().getDeltaTime();
  }
};

const GrassFieldPage: NextPage = () => {
  const [chatVisible, toggleChatVisible] = React.useState(false);

  return (
    <div>
      <ChatWindow chatVisible={chatVisible} />
      
      <div
        onKeyDown={ (e) => {
          if (e.key == 'Enter' && !chatVisible) {
            toggleChatVisible(!chatVisible)}
          }
        }
        onClick={ (e) => {
          if (chatVisible) {
            toggleChatVisible(!chatVisible);
          }
      }}>

        <SceneComponent onSceneReady={onSceneReady} onRender={onRender} />

      </div>
    </div>
  )
}

export default GrassFieldPage;