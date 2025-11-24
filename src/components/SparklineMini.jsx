// src/components/SparklineMini.jsx
import React, { useEffect, useState } from "react";
import { Sparklines, SparklinesLine } from "react-sparklines";
import { getSparkline } from "../services/api";

export default function SparklineMini({ symbol, positive, negative }) {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const data = await getSparkline(symbol);
        if (!cancelled) {
          setPoints(Array.isArray(data.points) ? data.points : []);
        }
      } catch (err) {
        console.error("SparklineMini error:", err.message);
        if (!cancelled) setPoints([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (symbol) load();

    return () => {
      cancelled = true;
    };
  }, [symbol]);

  if (loading || !points.length) {
    // placeholder kecil biar layout nggak loncat
    return (
      <div className="w-28 sm:w-32 h-[30px] flex items-center">
        <div className="w-full h-[2px] rounded-full bg-zinc-700/60 animate-pulse" />
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
