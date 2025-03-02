import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export interface IMedia {
  id: number;
  title: string;
  categories: string[];
  details: object;
  type: "movie" | "show";
}

export interface IMovie extends IMedia {
  type: "movie";
}

export interface IShow extends IMedia {
  type: "show";
}
