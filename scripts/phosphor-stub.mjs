import { createElement } from "react";

function Icon(props) {
  const { weight: _weight, ...rest } = props;
  return createElement("svg", {
    "aria-hidden": "true",
    "data-testid": "phosphor-icon-stub",
    viewBox: "0 0 16 16",
    width: "1em",
    height: "1em",
    ...rest,
  });
}

export const CalendarBlankIcon = Icon;
export const ChartBarIcon = Icon;
export const CheckIcon = Icon;
export const ClipboardTextIcon = Icon;
export const DownloadSimpleIcon = Icon;
export const HouseIcon = Icon;
export const ListIcon = Icon;
export const PlusIcon = Icon;
export const SignOutIcon = Icon;
export const TrashIcon = Icon;

export default Icon;
