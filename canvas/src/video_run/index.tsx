import { useRef, useState } from "react";

import { VideoCanvas } from "./VideoCanvas";

const source = "/videos/tooyama_crouch.mov";

const App = () => {
  const [isVideoMounted, setIsVideoMounted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="App">
      <video ref={videoRef} src={source} controls />;
      {isVideoMounted && videoRef.current && <VideoCanvas video={videoRef.current} />}
    </div>
  );
};

export default App;
