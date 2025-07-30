import React, { useState } from "react";
import { Button } from "primereact/button";

const TerminalView = ({ registryUrl = "localhost:5000" }) => {
  const [activeTab, setActiveTab] = useState("push");

  const commands: { [key: string]: string[] } = {
    push: [
      `docker tag myapp:latest ${registryUrl}/myapp:latest`,
      `docker push ${registryUrl}/myapp:latest`,
    ],
    pull: [
      `docker pull ${registryUrl}/myapp:latest`,
      `docker run -d ${registryUrl}/myapp:latest`,
    ],
    login: [`docker login ${registryUrl}`],
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="">
      <div
        className="border-round-lg overflow-hidden"
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Tab Header */}
        <div
          className="flex border-bottom-1 border-200"
          style={{ backgroundColor: "#f8f9fa" }}
        >
          {["push", "pull", "login"].map((tab) => (
            <button
              key={tab}
              className={`px-2 py-2 text-sm font-medium border-none cursor-pointer transition-all duration-200 ${
                activeTab === tab
                  ? "text-green-600 border-bottom-2 border-green-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              style={{
                backgroundColor: "transparent",
                borderBottom: activeTab === tab ? "2px solid #10b981" : "none",
                textTransform: "capitalize",
              }}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Terminal Content */}
        <div
          className="p-2"
          style={{
            backgroundColor: "#1f2937",
            minHeight: "100px",
            minWidth: "500px",
          }}
        >
          <div className="space-y-2">
            {commands[activeTab].map((command, index) => (
              <div
                key={index}
                className="flex align-items-center justify-content-between p-2 pt-1 pb-1  border-round hover:bg-gray-800 cursor-pointer transition-all duration-200"
                onClick={() => copyToClipboard(command)}
              >
                <div className="flex align-items-center">
                  <span
                    className="mr-0"
                    style={{ color: "#10b981", fontSize: "14px" }}
                  >
                    $
                  </span>
                  <span
                    className="font-mono text-sm"
                    style={{ color: "#f3f4f6" }}
                  >
                    {command}
                  </span>
                </div>
                <Button
                  icon="pi pi-copy"
                  className="p-button-text p-button-sm"
                  style={{
                    color: "#9ca3af",
                    padding: "0.15rem",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(command);
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerminalView;
