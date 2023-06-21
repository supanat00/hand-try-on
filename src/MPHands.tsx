import { ReactElement, useEffect } from "react";

import { Camera } from "@mediapipe/camera_utils";
import { Hands, HAND_CONNECTIONS } from "@mediapipe/hands";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";

export default function HandTracking(): ReactElement {
  useEffect(() => {
    const videoElement = document.getElementsByClassName(
      "input_video"
    )[0] as HTMLVideoElement;
    const canvasElement = document.getElementsByClassName(
      "output_canvas"
    )[0] as HTMLCanvasElement;
    const canvasCtx = canvasElement.getContext("2d");

    function onResults(results: {
      image: CanvasImageSource;
      multiHandLandmarks: any;
    }): void {
      if (!canvasCtx) {
        return;
      }

      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      canvasCtx.drawImage(
        results.image,
        0,
        0,
        canvasElement.width,
        canvasElement.height
      );
      if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
          drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
            color: "#00FF00",
            lineWidth: 5,
          });
          drawLandmarks(canvasCtx, landmarks, {
            color: "#FF0000",
            lineWidth: 2,
          });
        // Display landmark numbers
        for (let i = 0; i < landmarks.length; i++) {
        const [x, y] = [landmarks[i].x, landmarks[i].y];
        canvasCtx.fillText(i.toString(), x * canvasElement.width, y * canvasElement.height);
            }
        }
      }
      canvasCtx.restore();
    }

    const hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      },
    });
    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    hands.onResults(onResults);

    const camera = new Camera(videoElement, {
      onFrame: async () => {
        await hands.send({ image: videoElement });
      },
      width: 640,
      height: 480,
    });
    camera.start();
  }, []);

  return (
    <div className="container">
      <div className="video-container">
        <div className="column">
          <canvas className="output_canvas" width="640px" height="480px"></canvas>
          <video className="input_video"></video>
        </div>
      </div>
    </div>
  );
}
