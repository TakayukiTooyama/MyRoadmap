import { Show } from 'solid-js';
import { useFFmpeg } from '~/hooks';
export const VideoProcessing = () => {
  let fileRef: any;
  const { videoStore, handleFileChange } = useFFmpeg();
  return (
    <div>
      <input type="file" name="file" id="file" hidden onChange={handleFileChange} ref={fileRef} />
      <button onClick={() => fileRef.click()}>Select Video File</button>

      <Show when={videoStore.progress}>
        <p>Ratio</p>
        <p>{Math.round((videoStore.progress?.ratio ?? 0) * 100)} %</p>

        <p>Duration</p>
        <p>{videoStore.progress?.duration}</p>

        <p>Time</p>
        <p>{videoStore.progress?.time}</p>
      </Show>

      <Show when={videoStore.videoURL}>
        <video src={videoStore.videoURL} width={'400px'} height={'400px'} autoplay controls />
      </Show>
    </div>
  );
};
