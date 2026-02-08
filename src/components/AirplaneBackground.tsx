import { Activity } from "lucide-react";

export function AirplaneBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
      <div className="w-full h-full relative">
        <style>{`
                model-viewer {
                    width: 100%;
                    height: 100%;
                    background-color: transparent;
                    --poster-color: transparent;
                }
            `}</style>
        {/* @ts-ignore */}
        <model-viewer
          src="https://raw.githubusercontent.com/Ysurac/FlightAirMap-3dmodels/master/a320/glTF2/A320.glb"
          ios-src=""
          alt="A 3D model of an aeroplane"
          shadow-intensity="1"
          camera-controls
          disable-zoom
          auto-rotate
          rotation-per-second="15deg"
          camera-orbit="45deg 75deg 105%"
          field-of-view="30deg"
          exposure="1.2"
          environment-image="neutral"
          interaction-prompt="none"
          loading="eager"
        >
        </model-viewer>
      </div>
    </div>
  );
}
