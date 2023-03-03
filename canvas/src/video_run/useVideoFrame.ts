import React, { useEffect, useRef, useState } from "react";

type VideoEventListenerMap = {
  [EventName in keyof HTMLMediaElementEventMap]?: EventListener;
};

export const useVideoFrames = (
  frameCallback = (_videoTime: number, _frameId?: number) => {}
): [HTMLVideoElement | null, React.RefCallback<HTMLVideoElement>] => {
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);

  const callbackRef = useRef(frameCallback);
  callbackRef.current = frameCallback;

  useEffect(() => {
    if (!video) return;

    let frameId: number | null;
    let requestFrame = requestAnimationFrame;
    let cancelFrame = cancelAnimationFrame;

    if ("requestVideoFrameCallback" in HTMLVideoElement.prototype) {
      const vid = video as HTMLVideoElement & {
        requestVideoFrameCallback: typeof requestAnimationFrame;
        cancelVideoFrameCallback: typeof cancelAnimationFrame;
      };
      requestFrame = vid.requestVideoFrameCallback.bind(vid);
      cancelFrame = vid.cancelVideoFrameCallback.bind(vid);
    }

    const callbackFrame = (now: number, metadata?: any) => {
      frameId = requestFrame(callbackFrame);
      const videoTime = metadata?.mediaTime ?? video.currentTime;
      const frame = metadata?.presentedFrames ?? 0;
      callbackRef.current(videoTime, frame);
    };

    const eventListeners: VideoEventListenerMap = {
      loadeddata() {
        requestAnimationFrame(() => callbackRef.current(video.currentTime));
      },
      play() {
        frameId = requestFrame(callbackFrame);
      },
      pause() {
        cancelFrame(frameId ?? 0);
        frameId = null;
      },
      timeupdate() {
        requestAnimationFrame(() => callbackRef.current(video.currentTime));
      },
    };

    Object.keys(eventListeners).forEach((eventName) => {
      const eventListener = eventListeners[eventName as keyof HTMLMediaElementEventMap];
      if (eventListener != null) {
        video.addEventListener(eventName, eventListener);
      }
    });

    return () => {
      cancelFrame(frameId ?? 0);

      Object.keys(eventListeners).forEach((eventName) => {
        const eventListener = eventListeners[eventName as keyof HTMLMediaElementEventMap];
        if (eventListener != null) {
          video.removeEventListener(eventName, eventListener);
        }
      });
    };
  }, [video]);

  return [video, setVideo];
};
