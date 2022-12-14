import { useEffect, useRef } from "react";
import { Engine, Scene } from "@babylonjs/core";
import { Nullable } from '@babylonjs/core/types.js';

const SceneComponent = ({ onRender, onSceneReady } : { onRender: (scene: Scene) => void, onSceneReady: (scene: Scene) => void} ) => {
  const reactCanvas = useRef<Nullable<HTMLCanvasElement>>(null);

  useEffect(() => {
    const { current: canvas } = reactCanvas;

    if (!canvas) return;

    const engine = new Engine(canvas);
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    
    const scene = new Scene(engine);
    if (scene.isReady()) {
      onSceneReady(scene);
      canvas.id = 'canvasReady'
    } else {
      scene.onReadyObservable.addOnce((scene) => onSceneReady(scene));
    }

    engine.runRenderLoop(() => {
      if (typeof onRender === "function") onRender(scene);
      scene.render();
    });

    const resize = () => {
      scene.getEngine().resize();
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
    };

    if (window) {
      window.addEventListener("resize", resize);
    }

    return () => {
      scene.getEngine().dispose();

      if (window) {
        window.removeEventListener("resize", resize);
      }
    };
  }, [onRender, onSceneReady]);

  return <canvas ref={reactCanvas} id='canvasNotReady' />;
};

export default SceneComponent;