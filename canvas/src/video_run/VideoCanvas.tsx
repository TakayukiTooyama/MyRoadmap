import React, { FC, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

type VideoCanvasProps = {
  video: HTMLVideoElement;
};

export const VideoCanvas: FC<VideoCanvasProps> = (props) => {
  const { video } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [frameId, setFrameId] = useState(0);

  useEffect(() => {
    if (!canvasRef.current) return;
    const context = canvasRef.current.getContext("2d") as CanvasRenderingContext2D;
    context.fillStyle = "#000";
    context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    attachListener();
  }, []);

  const detachListener = () => {
    video.removeEventListener("play", handlePlay);
    video.removeEventListener("pause", handlePause);
  };
  useEffect(() => {
    return () => {
      window.cancelAnimationFrame(frameId);
      detachListener();
    };
  }, []);

  const attachListener = () => {
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
  };

  const handlePlay = () => {
    timerCallback();
  };

  const handlePause = () => {
    window.cancelAnimationFrame(frameId);
  };

  const timerCallback = () => {
    if (video.paused || video.ended) {
      return;
    }

    computeFrame();
    const frameId = window.requestAnimationFrame(timerCallback);
  };

  const getRatio = (canvas: HTMLCanvasElement) => {
    const ratio = video.videoWidth / video.videoHeight;
    const canvasRatio = canvas.width / canvas.height;
    if (canvasRatio > ratio) {
      const width = canvas.height * ratio;
      return {
        width,
        height: canvas.height,
        x: (canvas.width - width) / 2,
        y: 0,
      };
    } else {
      const height = canvas.width / ratio;
      return {
        width: canvas.width,
        height,
        x: 0,
        y: (canvas.height - height) / 2,
      };
    }
  };

  const computeFrame = () => {
    if (!canvasRef.current) return;
    const { x, y, width, height } = getRatio(canvasRef.current);
    cx.drawImage(video, x, y, width, height);
  };

  return <canvas ref={canvasRef} width={600} height={200} />;
};
