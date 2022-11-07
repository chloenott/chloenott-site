import React from "react";

import { Vector3, MeshBuilder, Mesh, DepthOfFieldEffectBlurLevel } from "@babylonjs/core";
import { Scene, Color3, Color4 } from "@babylonjs/core";
import SceneComponent from "../Components/babylon/SceneComponent";
import ChatWindow from "../Components/babylon/ChatWindow";
import type { NextPage } from 'next';
import Particles from "../public/grassets/grass_particles";

import Environment from "../public/grassets/environment";
import Grass from "../public/grassets/grass";
import Player from "../public/grassets/player";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { DefaultRenderingPipeline } from "@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline";

let box: Mesh;

const onSceneReady = (scene: Scene) => {
  const canvas = scene.getEngine().getRenderingCanvas();
  scene.clearColor = window.matchMedia("(prefers-color-scheme: light)").matches ? new Color4(195/255, 209/255, 224/255, 1) : new Color4(25/255, 25/255, 25/255, 1);

  scene.fogMode = Scene.FOGMODE_EXP2;
  scene.fogDensity = 0.005;
  scene.fogStart = 700;
  scene.fogEnd = 900;
  scene.fogColor = new Color3(255/255, 255/255, 255/255);

  box = MeshBuilder.CreateBox("box", { size: 0.1, height: 500 }, scene);
  box.visibility = 1
  box.position.y -= 50;

  let camera = new ArcRotateCamera("arc", -Math.PI, Math.PI / 2.1, 50, box.position, scene);
  camera.fov = 1.2
  camera.lowerRadiusLimit = 50;
  camera.upperRadiusLimit = 50;
  camera.maxZ = 1000000;
  camera.target = box.position.add(new Vector3(0, 5, 0));
  camera.lowerBetaLimit = Math.PI / 2
  camera.upperBetaLimit = Math.PI / 2
  camera.attachControl(scene.getEngine().getRenderingCanvas());
  camera.useAutoRotationBehavior = true;

  new Environment(scene, 1);
  new Environment(scene, 100);
  let grass: Grass = new Grass(scene, box);
  let player: Player
  const particles = new Particles(scene, box, scene.clearColor);
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

  pipeline.depthOfFieldEnabled = true;
  pipeline.depthOfFieldBlurLevel = DepthOfFieldEffectBlurLevel.High;
  pipeline.depthOfField.focusDistance = 65000;
  pipeline.depthOfField.focalLength = 50;
  pipeline.depthOfField.fStop = 0.1;

  pipeline.bloomEnabled = true;
  pipeline.bloomThreshold = 0.1;
  pipeline.bloomWeight = 0.1;
  pipeline.grainEnabled = true;
  pipeline.grain.intensity = 10;
  pipeline.grain.animated = true;

};

const onRender = (scene: Scene) => {
  const onRender = (scene: Scene) => {
    var zoomSpeedScalar: number;
    var camera = scene.activeCamera as ArcRotateCamera
    if (camera.radius < 700) {
      var zoomSpeedScalar = 5
    } else if (camera.radius >= 700 && camera.radius < 8000) {
      var zoomSpeedScalar = 2000
    } else {
      var zoomSpeedScalar = 0
    }
  
    var deltaTimeInMillis = scene.getEngine().getDeltaTime();
    camera.radius += zoomSpeedScalar * deltaTimeInMillis / 60
  };
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