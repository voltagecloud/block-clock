import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("my-ring")
export class Ring extends LitElement {
  render() {
    return html`
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <circle
          class="ring"
          cx="50"
          cy="50"
          r="50"
          stroke="blue"
          fill="none"
          fill-opacity="0"
        />
      </svg>
    `;
  }
}

// <script lang="ts">
//   export let fill = 0;
//   export let color = "#000";
//   export let strokeWidth = 1.5;

//   const radius = 50;

//   function calculateDashArray(f: number) {
//     const circumference = Math.PI * (radius * 2);
//     const progress = (f / 360) * circumference;
//     const remaining = circumference - progress;
//     return `${progress}px ${remaining}px`;
//   }
// </script>

// <div class="ring-container">
//   <svg viewBox="0 0 100 100" width="100%" height="100%">
//     <circle
//       class="ring"
//       cx="50"
//       cy="50"
//       r={radius - strokeWidth / 2}
//       stroke={color}
//       style={`stroke-dasharray: ${calculateDashArray(fill)}; stroke-width: ${strokeWidth};`}
//     />
//   </svg>
// </div>

// <style>
//   .ring-container {
//     display: inline-block;
//     position: relative;
//     width: 100%;
//     height: 100%;
//   }

//   .ring {
//     fill: none;
//     stroke-linecap: round;
//     /* Pick a transition that starts fast and ends slow */
//     transition: stroke-dasharray 2s ease-in-out;
//     transform: rotate(-90deg); /* Start fill from the top */
//     transform-origin: center;
//   }
// </style>
