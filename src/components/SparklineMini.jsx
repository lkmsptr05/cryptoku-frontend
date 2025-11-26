// src/components/SparklineMini.jsx
import React from "react";
import { Sparklines, SparklinesLine } from "react-sparklines";
import useSparkline from "../hooks/useSparkline";

export default function SparklineMini({ symbol, positive, negative }) {
  const { points, loading, error } = useSparkline(symbol);

  if (loading || !points.length) {
    // placeholder kecil biar layout nggak loncat
    return (
      <div className="w-28 sm:w-32 h-[30px] flex items-center">
        <div className="w-full h-[2px] rounded-full bg-zinc-700/60 animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-28 sm:w-32 h-[30px] flex items-center justify-center text-xs text-zinc-500">
        -
      </div>
    );
  }

  const stroke = positive
    ? "rgb(52,211,153)"
    : negative
    ? "rgb(248,113,113)"
    : "rgb(148,163,184)";

  return (
    <div className="w-28 sm:w-32">
      <Sparklines data={points} width={100} height={30} margin={4}>
        <SparklinesLine
          style={{
            strokeWidth: 2.2,
            fill: "none",
            stroke,
          }}
        />
      </Sparklines>
    </div>
  );
}
