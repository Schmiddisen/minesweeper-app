import React from "react";
import Svg, { G, Circle, Line } from "react-native-svg";

export default function BombIcon({ size = 200, color = "#F5C644" }) {
  const spikeCount = 8;
  const spikeLength = 4;
  const center = 32;
  const radius = 20;

  const spikes = Array.from({ length: spikeCount }, (_, i) => {
    const angle = (i * 360) / spikeCount;
    const rad = (angle * Math.PI) / 180;
    const x1 = center + (radius) * Math.cos(rad);
    const y1 = center + (radius) * Math.sin(rad);
    const x2 = center + (radius + spikeLength) * Math.cos(rad);
    const y2 = center + (radius + spikeLength) * Math.sin(rad);
    return (
      <Line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
    );
  });

  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <G>
        {spikes}
        <Circle cx={center} cy={center} r={radius} fill={color} />
        <Circle cx={center} cy={center} r={3} fill="black" />
      </G>
    </Svg>
  );
}
