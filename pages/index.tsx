import React from "react";
import Router from 'next/router';

import { Vector3, MeshBuilder, Mesh, DepthOfFieldEffectBlurLevel } from "@babylonjs/core";
import { Scene, Color3, Color4 } from "@babylonjs/core";
import SceneComponent from "../Components/babylon/SceneComponent";
import ChatWindow from "../Components/babylon/ChatWindow";
import Header from "../Components/Header";
import type { NextPage } from 'next';

import Particles from "../public/grassets/particles";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { DefaultRenderingPipeline } from "@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline";

let box: Mesh;

const onSceneReady = (scene: Scene) => {
  const canvas = scene.getEngine().getRenderingCanvas();
  scene.clearColor = window.matchMedia("(prefers-color-scheme: light)").matches ? new Color4(70/255, 79/255, 89/255, 1) : new Color4(70/255, 79/255, 89/255, 1);

  scene.fogMode = Scene.FOGMODE_EXP2;
  scene.fogDensity = 0.00000002;
  scene.fogStart = 700;
  scene.fogEnd = 900;
  scene.fogColor = new Color3(70/255, 79/255, 89/255);

  box = MeshBuilder.CreateBox("box", { size: 5 }, scene);
  box.visibility = 0
  box.position.z += 58;
  box.position.x += 9;
  box.position.y += 250;

  let camera = new ArcRotateCamera("arc", -Math.PI/2, -Math.PI, 500, box.position, scene);
  camera.fov = 1.2;
  camera.maxZ = 1000000;
  camera.attachControl(scene.getEngine().getRenderingCanvas());

  let particles: Particles = new Particles(scene, box);

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

  pipeline.bloomEnabled = false;
  pipeline.bloomThreshold = 0.1;
  pipeline.bloomWeight = 0.1;
  pipeline.grainEnabled = false;
  pipeline.grain.intensity = 3;

  setTimeout(() => {
    Router.push('/big_text')
  }, 9000);

};

const onRender = (scene: Scene) => {
  if (box !== undefined) {
    var deltaTimeInMillis = scene.getEngine().getDeltaTime();
  }
};

const ParticleSpacePage: NextPage = () => {
  const [chatVisible, toggleChatVisible] = React.useState(false);

  return (
    <div>
      <ChatWindow chatVisible={chatVisible} />

      <Header />

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

export default ParticleSpacePage;