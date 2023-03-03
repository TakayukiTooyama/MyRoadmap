import { createStore } from 'solid-js/store';
import { JSX, onCleanup } from 'solid-js';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

type VideoStore = {
  progress: { ratio: number; time: number; duration: number } | undefined;
  videoURL: string | undefined;
};

export const useFFmpeg = () => {
  const [videoStore, setVideoStore] = createStore<VideoStore>({
    progress: undefined,
    videoURL: undefined,
  });

  const ffmpeg = createFFmpeg({ progress: e => setVideoStore('progress', e), log: true });

  const transcode = async (file: File) => {
    const { name } = file;
    await ffmpeg.load();
    ffmpeg.FS('writeFile', name, await fetchFile(file));
    await ffmpeg.run('-i', name, 'output.mp4');
    const data = ffmpeg.FS('readFile', 'output.mp4');
    const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));

    setVideoStore('videoURL', url);
    setVideoStore('progress', undefined);
  };

  const handleFileChange: JSX.EventHandlerUnion<HTMLInputElement, Event> | undefined = e => {
    const target = e.target as HTMLInputElement;
    const file = (target.files as FileList)[0];
    transcode(file);
  };

  onCleanup(() => {
    if (videoStore.videoURL) {
      URL.revokeObjectURL(videoStore.videoURL);
    }
  });
  return {
    videoStore,
    handleFileChange,
  };
};
