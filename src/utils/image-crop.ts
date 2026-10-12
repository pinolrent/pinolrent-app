// Geometry for the cropper. The preview draws the source image inside a frame
// with `transform: [{ translateX }, { translateY }, { scale }]`, and the crop
// has to read the frame back from that same layout: the rectangle returned
// here is the part of the source image the frame is showing.
//
// The math lives out of the modal because it is the part that has to be exact.
// A rectangle that leaves the image, or that collapses to zero, is rejected by
// both encoders — the canvas one and expo-image-manipulator — and the failure
// surfaces as a plain "no pudimos recortar la imagen" with nothing to retry.

// The API re-encodes every upload and caps it at 5 MB, and a car photo is
// shown at card size: 1280 px on the longest side keeps the jpeg around a few
// hundred KB and the canvas small enough to encode anywhere.
export const MAX_CROP_SIDE = 1280

export interface CropViewport {
  frameWidth: number
  frameHeight: number
  imageWidth: number
  imageHeight: number
  scale: number
  translateX: number
  translateY: number
}

export interface CropRect {
  originX: number
  originY: number
  width: number
  height: number
}

function isPositive(value: number): boolean {
  return Number.isFinite(value) && value > 0
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

// Whole-pixel rectangle of the source image visible in the frame, guaranteed
// to fit inside it. Returns null when the dimensions of the image are missing
// or broken (a file the browser could not decode, for instance): there is no
// crop to compute then, and no amount of retrying will produce one.
export function computeCropRect({
  frameWidth,
  frameHeight,
  imageWidth,
  imageHeight,
  scale,
  translateX,
  translateY,
}: CropViewport): CropRect | null {
  if (
    !isPositive(frameWidth) ||
    !isPositive(frameHeight) ||
    !isPositive(imageWidth) ||
    !isPositive(imageHeight)
  ) {
    return null
  }

  // A gesture can leave a non-finite value behind; read it as untouched
  // instead of letting a NaN reach the encoder.
  const zoom = isPositive(scale) ? scale : 1
  const panX = Number.isFinite(translateX) ? translateX : 0
  const panY = Number.isFinite(translateY) ? translateY : 0

  // The image always covers the frame, so scale 1 is the widest possible view
  // and the size never exceeds the image itself.
  const effectiveScale =
    Math.max(frameWidth / imageWidth, frameHeight / imageHeight) * zoom
  const width = clamp(Math.round(frameWidth / effectiveScale), 1, imageWidth)
  const height = clamp(Math.round(frameHeight / effectiveScale), 1, imageHeight)
  // Source pixel sitting at the top-left corner of the frame. Both sizes are
  // clamped first, so the upper bound of the origin can never go negative.
  const originX = clamp(
    Math.round(-(frameWidth / 2 + panX) / effectiveScale + imageWidth / 2),
    0,
    imageWidth - width
  )
  const originY = clamp(
    Math.round(-(frameHeight / 2 + panY) / effectiveScale + imageHeight / 2),
    0,
    imageHeight - height
  )

  return { originX, originY, width, height }
}

// Output size of the crop, scaled down to `maxSide` when it is larger. The
// encoding is proportional to this, so a 12 MP phone photo becomes a small,
// fast canvas instead of a full-resolution one.
export function cropOutputSize(
  rect: CropRect,
  maxSide: number = MAX_CROP_SIDE
): { width: number; height: number } {
  const longest = Math.max(rect.width, rect.height)
  if (longest <= maxSide) return { width: rect.width, height: rect.height }

  const ratio = maxSide / longest
  return {
    width: Math.max(1, Math.round(rect.width * ratio)),
    height: Math.max(1, Math.round(rect.height * ratio)),
  }
}
