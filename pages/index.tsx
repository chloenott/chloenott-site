import React from "react";
import Router from 'next/router';

import { MeshBuilder, Mesh } from "@babylonjs/core";
import { Scene, Color4 } from "@babylonjs/core";
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

  let particles: Particles = new Particles(scene, box);

  var pipeline = new DefaultRenderingPipeline(
    "defaultPipeline", // The name of the pipeline
    false, // Do you want the pipeline to use HDR texture?
    scene, // The scene instance
    [camera] // The list of cameras to be attached to
  );

  pipeline.samples = 4;
  pipeline.fxaaEnabled = false;

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