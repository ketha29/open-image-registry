import { ProgressSpinner } from 'primereact/progressspinner';
import React from 'react';

const GlobalLoader = (props: { message?: string }) => {
  return (
    <div
      className="fixed top-0 left-0 w-full h-full flex align-items-center justify-content-center"
      style={{
        zIndex: 1100,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        className="bg-white px-6 py-5 border-round-xl flex flex-column align-items-center"
        style={{
          gap: '1rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          animation: 'scaleIn 0.2s ease-out',
        }}
      >
        <ProgressSpinner
          style={{ width: '40px', height: '40px' }}
          strokeWidth="3"
          pt={{
            circle: {
              style: {
                stroke: '#5a9a6e',
              },
            },
          }}
        />
        <p className="m-0 text-sm text-gray-600 font-medium">
          {props.message ? props.message : 'Processing request...'}
        </p>
      </div>
    </div>
  );
};

export default GlobalLoader;
