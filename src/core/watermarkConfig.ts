const WATERMARK_CONFIG_BY_TIER: Record<string, { logoSize: number, marginRight: number, marginBottom: number, alphaVariant?: string }> = {
    '0.5k': { logoSize: 48, marginRight: 32, marginBottom: 32 },
    '1k': { logoSize: 96, marginRight: 64, marginBottom: 64 },
    '2k': { logoSize: 96, marginRight: 64, marginBottom: 64 },
    '4k': { logoSize: 96, marginRight: 64, marginBottom: 64 },
    '2k-new-margin': {
        logoSize: 96,
        marginRight: 192,
        marginBottom: 192,
        alphaVariant: '20260520'
    }
};

const GEMINI_3X_CURRENT_1K_WATERMARK_CONFIG = {
    logoSize: 48,
    marginRight: 32,
    marginBottom: 32
};

function createEntries(modelFamily: string, resolutionTier: string, rows: [string, number, number][]) {
    return rows.map(([aspectRatio, width, height]) => ({
        modelFamily,
        resolutionTier,
        aspectRatio,
        width,
        height
    }));
}

const OFFICIAL_GEMINI_IMAGE_SIZES = [
    ...createEntries('gemini-3.x-image', '0.5k', [
        ['1:1', 512, 512],
        ['1:4', 256, 1024],
        ['1:8', 192, 1536],
        ['2:3', 424, 632],
        ['3:2', 632, 424],
        ['3:4', 448, 600],
        ['4:1', 1024, 256],
        ['4:3', 600, 448],
        ['4:5', 464, 576],
        ['5:4', 576, 464],
        ['8:1', 1536, 192],
        ['9:16', 384, 688],
        ['16:9', 688, 384],
        ['21:9', 792, 168]
    ]),
    ...createEntries('gemini-3.x-image', '1k', [
        ['1:1', 1024, 1024],
        ['1:4', 512, 2048],
        ['1:8', 384, 3072],
        ['2:3', 848, 1264],
        ['3:2', 1264, 848],
        ['3:4', 896, 1200],
        ['4:1', 2048, 512],
        ['4:3', 1200, 896],
        ['4:5', 928, 1152],
        ['5:4', 1152, 928],
        ['8:1', 3072, 384],
        ['9:16', 768, 1376],
        ['16:9', 1376, 768],
        ['16:9', 1408, 768],
        ['21:9', 1584, 672]
    ]),
    ...createEntries('gemini-3.x-image', '2k', [
        ['1:1', 2048, 2048],
        ['1:4', 1024, 4096],
        ['1:8', 768, 6144],
        ['2:3', 1696, 2528],
        ['3:2', 2528, 1696],
        ['3:4', 1792, 2400],
        ['4:1', 4096, 1024],
        ['4:3', 2400, 1792],
        ['4:5', 1856, 2304],
        ['5:4', 2304, 1856],
        ['8:1', 6144, 768],
        ['9:16', 1536, 2752],
        ['16:9', 2752, 1536],
        ['21:9', 3168, 1344]
    ]),
    ...createEntries('gemini-3.x-image', '2k-new-margin', [
        ['16:9', 2816, 1536]
    ]),
    ...createEntries('gemini-3.x-image', '4k', [
        ['1:1', 4096, 4096],
        ['1:4', 2048, 8192],
        ['1:8', 1536, 12288],
        ['2:3', 3392, 5056],
        ['3:2', 5056, 3392],
        ['3:4', 3584, 4800],
        ['4:1', 8192, 2048],
        ['4:3', 4800, 3584],
        ['4:5', 3712, 4608],
        ['5:4', 4608, 3712],
        ['8:1', 12288, 1536],
        ['9:16', 3072, 5504],
        ['16:9', 5504, 3072],
        ['21:9', 6336, 2688]
    ]),
    ...createEntries('gemini-2.5-flash-image', '1k', [
        ['1:1', 1024, 1024],
        ['2:3', 832, 1248],
        ['3:2', 1248, 832],
        ['3:4', 864, 1184],
        ['4:3', 1184, 864],
        ['4:5', 896, 1152],
        ['5:4', 1152, 896],
        ['9:16', 768, 1344],
        ['16:9', 1344, 768],
        ['21:9', 1536, 672]
    ])
];

const OFFICIAL_GEMINI_IMAGE_SIZE_INDEX = new Map<string, any>();
for (const entry of OFFICIAL_GEMINI_IMAGE_SIZES) {
    const key = `${entry.width}x${entry.height}`;
    if (!OFFICIAL_GEMINI_IMAGE_SIZE_INDEX.has(key)) {
        OFFICIAL_GEMINI_IMAGE_SIZE_INDEX.set(key, entry);
    }
}

function normalizeDimension(value: number) {
    if (!Number.isFinite(value)) return null;
    const rounded = Math.round(value);
    return rounded > 0 ? rounded : null;
}

export function matchOfficialGeminiImageSize(width: number, height: number) {
    const normalizedWidth = normalizeDimension(width);
    const normalizedHeight = normalizeDimension(height);
    if (!normalizedWidth || !normalizedHeight) return null;

    return OFFICIAL_GEMINI_IMAGE_SIZE_INDEX.get(`${normalizedWidth}x${normalizedHeight}`) ?? null;
}

function getEntryConfig(entry: any) {
    if (entry?.modelFamily === 'gemini-3.x-image' && entry.resolutionTier === '1k') {
        return GEMINI_3X_CURRENT_1K_WATERMARK_CONFIG;
    }
    return WATERMARK_CONFIG_BY_TIER[entry.resolutionTier] ?? null;
}

export function resolveOfficialGeminiWatermarkConfig(width: number, height: number) {
    const match = matchOfficialGeminiImageSize(width, height);
    if (!match) return null;
    return getEntryConfig(match);
}

export function detectWatermarkConfig(imageWidth: number, imageHeight: number) {
    const officialConfig = resolveOfficialGeminiWatermarkConfig(imageWidth, imageHeight);
    if (officialConfig) {
        return { ...officialConfig };
    }

    if (imageWidth > 1024 && imageHeight > 1024) {
        return {
            logoSize: 96,
            marginRight: 64,
            marginBottom: 64
        };
    }

    return {
        logoSize: 48,
        marginRight: 32,
        marginBottom: 32
    };
}
