import { useEffect, useRef, useState } from "react";
export default function Drawing() {
  const [drawing, setDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D>(null);

  const startDraw = ({ nativeEvent }: any) => {
    if (!ctxRef.current) return;
    const { offsetX, offsetY } = nativeEvent;
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(offsetX, offsetY);
    setDrawing(true);
  };

  const stopDraw = () => {
    if (!ctxRef.current) return;
    ctxRef.current.closePath();
    setDrawing(false);
  };
  const draw = ({ nativeEvent }: any) => {
    if (!drawing || !ctxRef.current) return;
    const { offsetX, offsetY } = nativeEvent;
    ctxRef.current.lineTo(offsetX, offsetY);
    ctxRef.current.stroke();
  };
  const clear = () => {
    if (!canvasRef.current || !ctxRef.current) return;
    ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    // For supporting computers with higher screen densities, we double the screen density
    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    // Setting the context to enable us draw
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    ctx.scale(2, 2);
    ctx.lineCap = "round";
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 20;
    if (!ctxRef.current) return;
    ctxRef.current = ctx;
  }, []);

  return (
    <>
      <canvas onMouseDown={startDraw} onMouseUp={stopDraw} onMouseMove={draw} ref={canvasRef} />
    </>
  );
}
