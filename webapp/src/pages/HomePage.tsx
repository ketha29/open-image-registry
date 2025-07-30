import React from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Divider } from "primereact/divider";
import PopularImageCard from "../components/PopularImageCard";
import TerminalView from "../components/TerminalView";

const HomePage = () => {
  return (
    <React.Fragment>
      <div
        className="absolute left-0 right-0  flex align-items-center"
        style={{ bottom: "60vh", top: "10vh" }}
      >
        <div className="w-full flex justify-content-center">
          <Button
            outlined
            className="p-0 border-2 border-solid border-round-3xl border-teal-100 w-5"
          >
            <InputText
              width={1002}
              type="text"
              className=" border-none"
              placeholder="Search Docker Images . . . ."
              // onFocus={handleFocus}
              // onBlur={handleBlur}
            />
            <i className="pi pi-search text-teal-400 text-2xl pr-1"></i>
          </Button>
        </div>

        <div className=""></div>
      </div>
      <div className="absolute bottom-0 left-0 right-0">
        <div className="flex justify-content-center">
          <div className="w-6">
            <TerminalView />
          </div>
        </div>

        <Divider align="center">
          <div className="inline-flex align-items-center text-color text-lg font-medium">
            Popular Images
          </div>
        </Divider>

        <div className="flex gap-3 mt-2 pl-4 pr-4">
          <PopularImageCard
            registry="docker.com"
            namespace="tensorflow"
            repository="tensorflow"
            popularTags={["0.1", "0.2", "latest"]}
            downloads={302}
            cachehits={200}
            bandwidthSaved={5.5}
            isProxyCache={true}
          />

          <PopularImageCard
            registry="docker.com"
            namespace="tensorflow"
            repository="tensorflow"
            popularTags={["0.1", "0.2", "latest"]}
            downloads={302}
            cachehits={200}
            bandwidthSaved={5.5}
            isProxyCache={true}
          />

          <PopularImageCard
            registry="docker.com"
            namespace="tensorflow"
            repository="tensorflow"
            popularTags={["0.1", "0.2", "latest"]}
            downloads={302}
            cachehits={200}
            bandwidthSaved={5.5}
            isProxyCache={true}
          />

          <PopularImageCard
            registry="docker.com"
            namespace="tensorflow"
            repository="tensorflow"
            popularTags={["0.1", "0.2", "latest"]}
            downloads={302}
            cachehits={200}
            bandwidthSaved={5.5}
            isProxyCache={true}
          />

          <PopularImageCard
            registry="docker.com"
            namespace="tensorflow"
            repository="tensorflow"
            popularTags={["0.1", "0.2", "latest"]}
            downloads={302}
            cachehits={200}
            bandwidthSaved={5.5}
            isProxyCache={true}
          />
        </div>
        {/* <div className="pt-2 pr-4 pb-1 mb-1 flex flex-row text-sm justify-content-end align-items-end cursor-pointer underline text-blue-600">
          View All
        </div> */}
        <Divider align="center">
          <div className="inline-flex align-items-center text-color text-lg font-medium">
            Storage
          </div>
        </Divider>
        <span
          className="h-2rem bg-green-500 mt-1 flex"
          style={{ display: "inline-block" }}
        >
          <span
            className="h-2rem bg-purple-200 flex align-items-center justify-content-center"
            style={{ width: "40%", display: "inline-block" }}
          >
            Hosted Images - 40%
          </span>
          <span
            className="h-2rem bg-yellow-400 flex align-items-center justify-content-center"
            style={{ width: "20%", display: "inline-block" }}
          >
            Cached Images - 20%{" "}
          </span>
          <span
            className="h-2rem bg-green-500 flex align-items-center justify-content-center"
            style={{ width: "40%", display: "inline-block" }}
          >
            Free - 40%
          </span>
        </span>
        {/* <div className="pt-2 flex flex-row text-sm justify-content-end align-items-end cursor-pointer underline text-blue-600">
            Detailed View
          </div> */}
      </div>
    </React.Fragment>
  );
};

export default HomePage;
