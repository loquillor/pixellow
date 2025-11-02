
import React, { useRef, useEffect } from 'react';

export type VisualizerStyle = 'bars' | 'wave' | 'circle';

interface VisualizerProps {
  analyser: AnalyserNode;
  style: VisualizerStyle;
}

const Visualizer: React.FC<VisualizerProps> = ({ analyser, style }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let animationFrameId: number;
    
    const { width, height } = canvas;

    const draw = () => {
      animationFrameId = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);
      
      canvasCtx.clearRect(0, 0, width, height);

      switch (style) {
        case 'wave':
          drawWave(canvasCtx, dataArray, bufferLength, width, height);
          break;
        case 'circle':
          drawCircle(canvasCtx, dataArray, bufferLength, width, height);
          break;
        case 'bars':
        default:
          drawBars(canvasCtx, dataArray, bufferLength, width, height);
          break;
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [analyser, style]);

  return <canvas ref={canvasRef} width="150" height="60" />;
};

// --- Drawing Functions ---

const drawBars = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, bufferLength: number, width: number, height: number) => {
    const barWidth = (width / bufferLength) * 1.5;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height;
        
        const r = 25 + (dataArray[i] / 255) * 100;
        const g = 150 - (dataArray[i] / 255) * 50;
        const b = 200 + (dataArray[i] / 255) * 55;

        const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
        gradient.addColorStop(0, `rgb(0, 120, 150)`);
        gradient.addColorStop(1, `rgb(${r}, ${g}, ${b})`);

        ctx.fillStyle = gradient;
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);
        
        x += barWidth + 2;
    }
}

const drawWave = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, bufferLength: number, width: number, height: number) => {
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#06b6d4'; // cyan-500
    ctx.beginPath();
    
    const sliceWidth = width * 1.0 / bufferLength;
    let x = 0;

    for(let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 255.0;
        const y = v * height;

        if(i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }

        x += sliceWidth;
    }
    
    ctx.lineTo(width, height / 2);
    ctx.stroke();
}

const drawCircle = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, bufferLength: number, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 4;
    
    for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * (radius * 0.8);
        const angle = (i / bufferLength) * 2 * Math.PI;

        const x1 = centerX + Math.cos(angle) * radius;
        const y1 = centerY + Math.sin(angle) * radius;
        const x2 = centerX + Math.cos(angle) * (radius + barHeight);
        const y2 = centerY + Math.sin(angle) * (radius + barHeight);

        const r = 25 + (dataArray[i] / 255) * 100;
        const g = 150 - (dataArray[i] / 255) * 50;
        const b = 200 + (dataArray[i] / 255) * 55;

        ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
}


export default Visualizer;
