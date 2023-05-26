interface StoredConfig {
    blur: number;
    brightness: number;
    contrast: number;
    saturation: number;
    refreshrate: number;
    disabledColor: {
        r: number;
        g: number;
        b: number;
    };
    closeToTray: boolean;
    startWithWindows: boolean;
    startInTray: boolean;
}