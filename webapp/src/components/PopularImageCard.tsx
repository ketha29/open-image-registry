import { Card } from "primereact/card";
import { Divider } from "primereact/divider";
import React, { useState } from "react";

type PopularImageCardProps = {
  registry: string;
  namespace: string;
  repository: string;
  popularTags: string[];
  downloads: number;
  cachehits: number;
  bandwidthSaved: number;
  isProxyCache: boolean;
};

const PopularImageCard = (props: PopularImageCardProps) => {
  return (
    <div className="border-teal-100 border-solid border-1 border-round-md shadow-1 pl-3 pr-3 pb-2 w-4">
      <div className=" flex justify-content-between pt-3  gap-2">
        <div className="text-color font-medium">
          {(props.namespace + "/" + props.repository).substring(0, 30)}
        </div>
        <div>
          <i className="pi pi-sync" style={{ fontSize: "0.8rem" }}></i>
        </div>
      </div>
      <div className="grid pt-3">
        {/* Row1 */}
        <div className="col-3 text-color-secondary text-sm">Tags</div>
        <div className="col-9 flex gap-1">
          {props.popularTags.map((t) => (
            <div className=" text-sm justify-content-end align-items-end cursor-pointer underline text-blue-300">
              {" "}
              {t}{" "}
            </div>
          ))}
        </div>
        {/* Row2 */}
        <div className="col-12 pl-2 pr-2 ">
          <div className="bg-json-or-code-view p-2 border-round-md">
            {props.registry}
          </div>
        </div>
      </div>

      <div className="flex justify-content-between">
        <div className="flex align-items-center cursor-pointer">
          <span className="text-sm">85/129</span>&nbsp;&nbsp;{" "}
          <i className="pi pi-download"  />
        </div>
        <Divider layout="vertical" />
        <div className="flex align-items-center justify-content-end cursor-pointer">
          <span className="text-sm">1.2/17.6 GB</span>&nbsp;&nbsp;{" "}
          <i className="pi pi-gauge"  />
        </div>
      </div>
    </div>
  );
};

export default PopularImageCard;
