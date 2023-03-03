import { createCachedResource, useCacheBoundaryRefresh } from 'solid-cache';
import { For } from 'solid-js';

type Photo = {
  title: string;
  thumbnailUrl: string;
};

const getPhotos = async (): Promise<Photo[]> => {
  const res = await fetch(`https://jsonplaceholder.typicode.com/photos?_limit=20`);
  return res.json();
};

export const CachePhotoAlbum = () => {
  const { data: photos, isFetching } = createCachedResource({
    key: '/photo',
    get: () => getPhotos(),
  });
  const refresh = useCacheBoundaryRefresh();

  return (
    <>
      <button onClick={() => refresh()}>Refresh</button>
      <div style={{ opacity: isFetching() ? 0.5 : 1 }}>
        <For each={photos()} fallback={<div>...loading</div>}>
          {photo => (
            <figure>
              <img src={photo.thumbnailUrl} alt={photo.title} />
              <figcaption>{photo.title}</figcaption>
            </figure>
          )}
        </For>
      </div>
    </>
  );
};
