import React from "react";
import styles from '../../styles/UserInterface.module.css';

import { Vector3, MeshBuilder, Mesh, DepthOfFieldEffectBlurLevel } from "@babylonjs/core";
import { Scene, Color3, Color4 } from "@babylonjs/core";
import SceneComponent from "./SceneComponent";
import MessageContainer from "./MessageContainer";
import Header from "../../Components/Header";
import type { NextPage } from 'next'

import Environment from "../../public/grassets/environment";
import Grass from "../../public/grassets/grass";
import Player from "../../public/grassets/player";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { DefaultRenderingPipeline } from "@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline";

import { TextField, Divider, Button } from '@mui/material';
import { bgcolor, borderRadius } from "@mui/system";

let box: Mesh;

const onSceneReady = (scene: Scene) => {
  const canvas = scene.getEngine().getRenderingCanvas();
  scene.clearColor = window.matchMedia("(prefers-color-scheme: light)").matches ? new Color4(51/255, 51/255, 51/255, 0) : new Color4(51/255, 51/255, 51/255, 0);

  scene.fogMode = Scene.FOGMODE_LINEAR;
  scene.fogDensity = 0.001;
  scene.fogStart = 700;
  scene.fogEnd = 900;
  scene.fogColor = new Color3(220/256, 220/256, 240/256);

  box = MeshBuilder.CreateBox("box", { size: 5 }, scene);
  box.visibility = 0

  let camera = new ArcRotateCamera("arc", -Math.PI / 3, Math.PI / 2.1, 50, box.position, scene);
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
  setTimeout(() => {
    player = new Player(scene, '1', camera);
    grass.box = player.mesh;
  }, 1500);

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

const AnotherWorld: NextPage = () => {
  const [chatVisible, toggleChatVisible] = React.useState(false);
  const [textFieldValue, setTextFieldValue] = React.useState("");
  const [messageList, setMessageList] = React.useState([]);

  const handleSubmitTextField = (e) => {
    if (textFieldValue.length > 0) {
      const newMessage = {
        user: 'Fox',
        text: textFieldValue
      }
      setMessageList([...messageList, newMessage]);
      setTextFieldValue("");
    }
  }

  return (
    <div>
      <div className={styles.user_interface}>
        <div className={chatVisible ? styles.chat_window_visible : styles.chat_window_hidden}>

          <div className={styles.message_list}>
            {messageList.map( (message, index) => Object.keys(message).length > 0 && <MessageContainer key={index} user={message.user} text={message.text} />)}
          </div>

          <Divider variant="middle" textAlign="center" sx={{
            color: '##0e0f0f',
            fontFamily: 'Inter',
            fontWeight: 300,
            width: 586,
            alignItems: 'flex-start',
          }}>Nearby Chat</Divider>

          <TextField id="textfield" value={textFieldValue} label={textFieldValue ? "Press return key to send" : "Type here to enter message"} variant="filled" multiline maxRows={10} sx={{
            width: 618,
            borderRadius: 1,
            bgcolor: '#ffffff',
            fontFamily: 'Inter',
            }}
            onChange={(e) => {
              setTextFieldValue(e.target.value)
            }}
            onKeyDown={(e) => {
              if (e.key == 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmitTextField(e);
              }
            }}
          />
        </div>

      </div>
      <Header />
      <div
        className={styles.game_window}
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

export default AnotherWorld;