import { svg } from "lit";
import { DEFAULT_TRIM_LENGTH } from "../utils/constants";

export interface RingSegmentProps {
  ringWidth: number;
  startAngle: number;
  endAngle: number;
  color: string;
}

export const RingSegment = ({
  startAngle,
  endAngle,
  ringWidth,
  color = "yellow",
}: RingSegmentProps) => {
  const radius = 50 - ringWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const startX = 50 + radius * Math.cos((startAngle - 90) * (Math.PI / 180));
  const startY = 50 + radius * Math.sin((startAngle - 90) * (Math.PI / 180));
  const endX = 50 + radius * Math.cos((endAngle - 90) * (Math.PI / 180));
  const endY = 50 + radius * Math.sin((endAngle - 90) * (Math.PI / 180));

  // Calculate the length of the arc
  const arcLength = circumference * (Math.abs(endAngle - startAngle) / 360);

  // Calculate the stroke dasharray to hide the beginning and end of the arc
  if (arcLength < DEFAULT_TRIM_LENGTH) {
    return svg``;
  }
  const dashArray = `${arcLength - DEFAULT_TRIM_LENGTH}px ${DEFAULT_TRIM_LENGTH}px`;

  console.log(color);

  return svg`
    <path
      d="
        M ${startX},${startY}
        A ${radius},${radius} 0 ${endAngle - startAngle > 180 ? 1 : 0},1 ${endX},${endY}
      "
      stroke="${color}"
      stroke-width="${ringWidth}"
      fill="none"
      stroke-dasharray="${dashArray}"
      stroke-dashoffset="-${DEFAULT_TRIM_LENGTH / 2}"
    ></path>
  `;
};
