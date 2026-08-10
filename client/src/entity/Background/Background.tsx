import { useRef, useEffect } from "react";

export const Background = () => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let c = ref.current;

    if (!c) return;

    let ctx = c.getContext("2d");

    function resizeCanvas() {
      if (!c) return;
      c.width = window.innerWidth;
      c.height = window.innerHeight;
    }

    resizeCanvas();

    window.addEventListener("resize", resizeCanvas);

    const lines = Array.from({ length: 50 }, () => {
      return {
        x: Math.random() * (c?.width ?? 0),
        y: Math.random() * (c?.height ?? 0),
        dx: (Math.random() - 0.5) * 0.5,
        dy: (Math.random() - 0.5) * 0.5,
      };
    });

    function draw() {
      if (!ctx) return;
      if (!c) return;

      ctx.clearRect(0, 0, c.width, c.height);

      ctx.strokeStyle = "rgba(180, 0, 255, 0.4)";
      ctx.shadowColor = "rgba(180, 0, 255, 0.6)";
      ctx.shadowBlur = 10;
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      for (let i = 0; i < lines.length; i++) {
        const p = lines[i];
        p.x += p.dx;
        p.y += p.dy;

        if (p.x < 0 || p.x > c.width) p.dx *= -1;
        if (p.y < 0 || p.y > c.height) p.dy *= -1;

        ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();

      requestAnimationFrame(draw);
    }

    draw();

    return () => {
      c = null;
      ctx = null;
    };
  }, []);

  return (
    <canvas
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        zIndex: -1,
      }}
      ref={ref}
      id="bg"
    ></canvas>
  );
};
