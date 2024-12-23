import { IconProps } from "./IconProps";

/** Pin icon with check mark.
 * https://fonts.google.com/icons?selected=Material+Symbols+Outlined:where_to_vote:FILL@0;wght@400;GRAD@0;opsz@24&icon.size=24&icon.color=%235f6368&icon.query=location
 */
export function CheckedPin({ size }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height={size ?? "24px"}
      viewBox="0 -960 960 960"
      width={size ?? "24px"}
      fill="#00cc00"
    >
      <path d="m438-436 194-194-47.67-47.67L438-531.33l-62-62-47.67 47.66L438-436Zm42 268q129.33-118 191.33-214.17 62-96.16 62-169.83 0-115-73.5-188.17-73.5-73.16-179.83-73.16-106.33 0-179.83 73.16Q226.67-667 226.67-552q0 73.67 63 169.83Q352.67-286 480-168Zm0 88Q319-217 239.5-334.5T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 100-79.5 217.5T480-80Zm0-480Z" />
    </svg>
  );
}
