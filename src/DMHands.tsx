import React, { useEffect } from 'react';
import { Camera } from '@mediapipe/camera_utils';
import { Hands } from '@mediapipe/hands';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { WebGLRenderer, Scene, PerspectiveCamera } from 'three';

export default function HandTracking(): React.ReactElement {
  useEffect(() => {
    const videoElement = document.getElementsByClassName(
      'input_video'
    )[0] as HTMLVideoElement;
    const canvasElement = document.getElementsByClassName(
      'output_canvas'
    )[0] as HTMLCanvasElement;
    const canvasCtx = canvasElement.getContext('2d');

    function onResults(results: { image: CanvasImageSource }): void {
      if (!canvasCtx) {
        return;
      }

      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

      // Load 3D model from .GLTF file
      const loader = new GLTFLoader();
      loader.loadAsync('/assets/RING/ring.gltf')
        .then((gltf) => {
          const model = gltf.scene;

          // Create a WebGL renderer and scene
          const renderer = new WebGLRenderer({ alpha: true });
          renderer.setSize(canvasElement.width, canvasElement.height);
          const scene = new Scene();
          scene.add(model);

          // Create a perspective camera
          const camera = new PerspectiveCamera(
            45,
            canvasElement.width / canvasElement.height,
            0.1,
            1000
          );
          camera.position.set(0, 0, 5);
          camera.lookAt(model.position);

          // Render the 3D model to a canvas element
          const renderedCanvas = renderer.domElement;
          renderer.render(scene, camera);

          // Draw the rendered canvas on the output canvas
          canvasCtx.drawImage(renderedCanvas, 0, 0);
        },
        undefined,
      );

      canvasCtx.restore();
    }

    const hands = new Hands({
      locateFile: (file: string) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      },
    });
    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 0,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    hands.onResults(onResults);

    const camera = new Camera(videoElement, {
      onFrame: async () => {
        await hands.send({ image: videoElement });
      },
      width: 1280,
      height: 720,
    });
    camera.start();
  }, []);

  return (
    <div className="container">
      <div className="video-container">
        <div className="column">
          <canvas className="output_canvas" width="1280px" height="720px"></canvas>
          <video className="input_video"></video>
        </div>
      </div>
    </div>
  );
}
