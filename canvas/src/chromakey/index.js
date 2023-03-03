const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");
const chara = new Image();
chara.src = "./otter.png";

function onResults(results) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.segmentationMask, 0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.globalCompositeOperation = "source-in";
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.globalCompositeOperation = "destination-atop";
  canvasCtx.drawImage(chara, 0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.restore();
  results.segmentationMask.close();
  results.image.close();
}
const selfieSegmentation = new SelfieSegmentation({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
  },
});
selfieSegmentation.setOptions({
  modelSelection: 1,
});
selfieSegmentation.onResults(onResults);

let imageCapture;
let prevTime;
const rawVideoCanvas = document.getElementById("rawVideoCanvas");
const videoTag = document.getElementById("videoTag");
async function drawImage() {
  if (Date.now() - prevTime > 60) {
    prevTime = Date.now();
    if (videoTag.currentTime != 0) {
      const imageBitMap = await createImageBitmap(videoTag);
      await selfieSegmentation.send({ image: imageBitMap });
    }
  }

  window.requestAnimationFrame(drawImage);
}

window.onload = async function () {
  const localMediaStream = await navigator.mediaDevices.getUserMedia({
    video: {
      width: 1080,
      height: 720,
      frameRate: 15,
    },
    audio: false,
  });
  videoTag.srcObject = localMediaStream;
  videoTag.play();
  prevTime = Date.now();
  window.requestAnimationFrame(drawImage);
};
