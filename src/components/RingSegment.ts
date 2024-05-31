import { svg } from "lit";

export interface RingSegmentProps {
  ringWidth: number;
  startAngle: number;
  endAngle: number;
}

export const RingSegment = ({
  startAngle,
  endAngle,
  ringWidth,
}: RingSegmentProps) => {
  const radius = 50 - ringWidth / 2;
  const startX = 50 + radius * Math.cos((startAngle - 90) * (Math.PI / 180));
  const startY = 50 + radius * Math.sin((startAngle - 90) * (Math.PI / 180));
  const endX = 50 + radius * Math.cos((endAngle - 90) * (Math.PI / 180));
  const endY = 50 + radius * Math.sin((endAngle - 90) * (Math.PI / 180));

  return svg`
    <path
      d="
        M ${startX},${startY}
        A ${radius},${radius} 0 ${endAngle - startAngle > 180 ? 1 : 0},1 ${endX},${endY}
      "
      stroke="yellow"
      stroke-width="${ringWidth}"
      fill="none"
      stroke-linecap="round"
    ></path>
  `;
};
