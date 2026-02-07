
import React, { Suspense } from 'react';

// Lazy load the GlobeScene to avoid loading Three.js on server (if SSR) or blocking main thread
const GlobeScene = React.lazy(() => import('./Globe/GlobeScene'));

export default function GlobeBackground() {
    return (
        <Suspense
            fallback={
                <div className="fixed inset-0 flex items-center justify-center bg-slate-950">
                    <div className="text-slate-400 text-sm tracking-widest uppercase animate-pulse">
                        Loading Globe...
                    </div>
                </div>
            }
        >
            <GlobeScene />
        </Suspense>
    );
}
