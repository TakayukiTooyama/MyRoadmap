import { createRef, useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import { useWindowSize } from "react-use";

const URL = "/videos/tooyama_crouch.mov";
const useAnimationFrame = (isRunning: boolean, callback = () => {}) => {
  const reqIdRef = useRef<number>();

  // フレームごとにしたい処理を書く
  // useCallback で callback 関数が更新された時のみ関数を再生成
  const loop = useCallback(() => {
    if (isRunning) {
      reqIdRef.current = requestAnimationFrame(loop);
      callback(); // ループしたい処理をcallbackで渡す！！！
    }
  }, [isRunning, callback]);

  // loopを実行
  useEffect(() => {
    reqIdRef.current = requestAnimationFrame(loop);
    return () => {
      if (!reqIdRef.current) return;
      cancelAnimationFrame(reqIdRef.current);
    };
  }, [loop]);
};

const App = () => {
  /* 画面管理 */
  const { width } = useWindowSize();
  const [screenSize, setScreenSize] = useState(window.innerWidth);

  /* キャンバス管理 */
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D>();

  /* ビデオ管理 */
  const [isVideoMounted, setIsVideoMounted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  /* テスト */
  const [count, setCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);

  /* 動画が読み込まれた時の処理 */
  const hadlelLoadedMetadataVideo = () => {
    setVideo(videoRef.current);
    console.log("動画の準備が出来ました");
  };
  const hadlelCanPlay = () => {
    canvasSetUp();
    drawInitCanvas();
  };

  /* Canvasの設定 */
  const canvasSetUp = () => {
    if (!canvasRef.current) return;
    //TODO:キャンバスはサーバーから取得した動画のサイズを初期値にする
    canvasRef.current.width = screenSize;
    canvasRef.current.height = screenSize / (16 / 9);
    canvasRef.current.style.backgroundColor = "#222";
  };

  /* フレームごとに描画される要素 */
  const drawInitCanvas = () => {
    if (!video || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d") as CanvasRenderingContext2D;

    // 動画が描画されていない場合
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Dom要素は取得できている
    // refに変更があってもレンダリングされない
    // console.log("video", videoRef.current);
    // console.log("width", canvasRef.current.width);
    // console.log("height", canvasRef.current.height);
    ctx.drawImage(video, 0, 0, canvasRef.current.width, canvasRef.current.height / (16 / 9));
    console.log("セットアップ完了");
  };

  /* スクリーンサイズが変わった時の処理 */
  useEffect(() => {
    setScreenSize(window.innerWidth || 0);
    canvasSetUp();
  }, [width]);

  const countUp = useCallback(() => {
    setCount((prevCount) => ++prevCount);
    setVideo(videoRef.current);
  }, []);

  useAnimationFrame(isRunning, countUp);

  useEffect(() => {
    drawInitCanvas();
  }, [video]);

  const handleVideoPlay = () => {
    setIsRunning(true);
    videoRef.current?.play();
  };

  const handleVideoPause = () => {
    setIsRunning(false);
    videoRef.current?.pause();
  };

  const [fpsInfo, setFpsInfo] = useState(0);
  const [metaDataInfo, setMetaDataInfo] = useState<any>();
  const [fps, setFps] = useState<number[]>([]);
  const [requestTime, setRequestTime] = useState(0);
  const [timeline, setTimeline] = useState<number[]>([]);

  const startDrawing = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d") as CanvasRenderingContext2D;

    videoRef.current.addEventListener("play", () => {
      if (!("requestVideoFrameCallback" in HTMLVideoElement.prototype)) {
        return alert("Your browser does not support the `Video.requestVideoFrameCallback()` API.");
      }
    });

    let width = canvasRef.current.width;
    let height = canvasRef.current.height;

    // let frameCount = 0;
    let startTime = 0.0;
    // let lastTime = 0;

    const updateCanvas = (now: DOMHighResTimeStamp, metadata: VideoFrameCallbackMetadata) => {
      if (!videoRef.current) return;
      if (startTime === 0.0) {
        startTime = now;
      }
      ctx.drawImage(videoRef.current, 0, 0, width, height);
      setMetaDataInfo(JSON.stringify(metadata, null, 2));
      setTimeline((prev) => [...prev, metadata.mediaTime]);
      videoRef.current.requestVideoFrameCallback(updateCanvas);
    };

    videoRef.current.requestVideoFrameCallback(updateCanvas);
  };

  useEffect(() => {
    window.addEventListener("load", startDrawing);
  }, []);

  const handleClickButton = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      setTimeline([]);
      videoRef.current.play();
    } else {
      videoRef.current.pause();
      console.log(timeline);
    }
  };

  return (
    <>
      <div>
        {/* <video
          ref={videoRef}
          src={URL}
          width={window.innerWidth}
          height={window.innerWidth / (16 / 9)}
          muted
          onLoadedMetadata={hadlelLoadedMetadataVideo}
          onCanPlay={hadlelCanPlay}
        />
        <canvas ref={canvasRef}></canvas>
        <div>{count}</div> */}
        {/* <button onClick={handleVideoPlay}> START</button>
        <button onClick={handleVideoPause}> STOP</button> */}
      </div>

      <div>
        <video src={URL} ref={videoRef}></video>
        <canvas ref={canvasRef}></canvas>
        {/* {fps.map((f, idx) => (
          <p key={idx}>{f}</p>
        ))} */}
        <p>{metaDataInfo}</p>
        <button onClick={handleClickButton}>Start</button>
      </div>
    </>
  );
};

export default App;

/* TODO
1.初期ロードでキャンバスに動画を描画できるようにする
*/

/* メモ
1.createElementでの初回表示だけ描画されなかった
2.beginPathをできるだけ図形ごとに書かないとctx.storkeなどが毎回呼ばれてしまい線がどんどん太くなってくる
3.save(), restore()で囲むとその範囲だけスタイルが適用される
4.useRefはコンテンツが変更されても通知されない
  （https://reactjs.org/docs/hooks-reference.html#useref）
5..currentプロパティを変更しても再レンダリングは発生しない（描画が更新されない）
  コールバックrefを使用することで解決できるかもしれない
  （https://reactjs.org/docs/hooks-faq.html#how-can-i-measure-a-dom-node）
6.React Hook Flow（https://github.com/donavon/hook-flow/blob/master/hook-flow.pdf）
7.document.getElementByIdではなくuseRefを使う理由（https://www.javascriptstuff.com/use-refs-not-ids/）
8.なぜsourceタグが必要なのか → 指定した動画がブラウザに対応してなく再生されなかった場合の代替ファイルを指定できるため
  （https://webukatu.com/wordpress/blog/14993/）

9.requestFrameCallbackの返り値であるmetadata.mediatTimeは全て一緒。しかし、毎回全フレームが呼ばれるとは限らない（ネット環境の問題）

*/

/* 参考記事
・https://zenn.dev/yend724/articles/20211119-x1fph5dvdldsx4po
・https://medium.com/web-dev-survey-from-kyoto/how-to-use-html-canvas-with-react-hooks-web-dev-survey-from-kyoto-e633812023b1
*/

/* 表示方法2 */
// useEffect(() => {
//   const canvas = document.createElement("canvas");
//   canvas.width = window.innerWidth
//   canvas.height = window.innerHeight
//   const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
//   ctx.rect(100, 100, canvas.width, canvas.height);
//   ctx.fill();
// }, []);

/* 表示方法3 */
// useEffect(() => {
//   const canvas = document.getElementById("#canvas");
//   canvas.width = window.innerWidth
//   canvas.height = window.innerHeight
//   const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
//   ctx.rect(100, 100, canvas.width, canvas.height);
//   ctx.fill();
// }, []);

/* Stroke */
// ctx.strokeStyle = "#fff";
// ctx.beginPath();
// ctx.rect(100, 100, 100, 100);
// ctx.stroke();
// ctx.beginPath();
// ctx.rect(100, 100, 300, 300);
// ctx.stroke();

/* fillRect */
// ctx.fillStyle = "#fff";
// ctx.beginPath();
// ctx.fillRect(100, 100, 100, 100);

/* Circle */
// ctx.fillStyle = "#fff";
// ctx.beginPath();
// // (centerX, centerY, radius, startAngle, endAngle, 反時計回りにするか)
// ctx.arc(canvasRef.current.width / 2, canvasRef.current.height / 2, 100, 0, Math.PI * 2);
// ctx.fill();

/* Line */
// ctx.strokeStyle = "#fff";
// ctx.fillStyle = "#00f";
// ctx.lineWidth = 1;
// ctx.beginPath();
// ctx.moveTo(20, 20);
// ctx.lineTo(50, 50);
// ctx.lineTo(50, 70);
// ctx.closePath();
// ctx.fill();
// ctx.stroke();

/* Text */
// ctx.fillStyle = "#fff";
// ctx.font = "30px Candara";
// ctx.textAlign = "left";
// ctx.textBaseline = "top";
// ctx.fillText("canvas", 10, 10);
