/// <reference types="vite/client" />

declare namespace JSX {
    interface IntrinsicElements {
        'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
            src?: string;
            poster?: string;
            alt?: string;
            'shadow-intensity'?: string;
            'camera-controls'?: boolean;
            'auto-rotate'?: boolean;
            'rotation-per-second'?: string;
            'camera-orbit'?: string;
            'field-of-view'?: string;
            exposure?: string;
            'environment-image'?: string;
            'interaction-prompt'?: string;
            loading?: string;
            'ios-src'?: string;
        }, HTMLElement>;
    }
}
