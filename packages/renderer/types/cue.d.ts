interface Device {
    enabled: boolean;
    showLeds: boolean;
    model: string;
    ledsCount: number;
    sizeX: number;
    sizeY: number;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

interface ImgDataCoordinate {
    ledId: number;
    sx: number;
    sy: number;
    sw: number;
    sh: number;
}