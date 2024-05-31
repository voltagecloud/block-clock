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
  const circumference = 2 * Math.PI * radius;
  const startX = 50 + radius * Math.cos((startAngle - 90) * (Math.PI / 180));
  const startY = 50 + radius * Math.sin((startAngle - 90) * (Math.PI / 180));
  const endX = 50 + radius * Math.cos((endAngle - 90) * (Math.PI / 180));
  const endY = 50 + radius * Math.sin((endAngle - 90) * (Math.PI / 180));

  // Calculate the length of the arc
  const arcLength = circumference * (Math.abs(endAngle - startAngle) / 360);

  // Calculate the stroke dasharray to hide the beginning and end of the arc
  const trimLength = 2;
  const dashArray = `${arcLength - trimLength}px ${trimLength}px`;

  return svg`
    <path
      d="
        M ${startX},${startY}
        A ${radius},${radius} 0 ${endAngle - startAngle > 180 ? 1 : 0},1 ${endX},${endY}
      "
      stroke="yellow"
      stroke-width="${ringWidth}"
      fill="none"
      stroke-dasharray="${dashArray}"
      stroke-dashoffset="-${trimLength / 2}"
    ></path>
  `;
};
