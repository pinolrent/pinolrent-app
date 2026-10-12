import { describe, expect, it } from 'vitest'
import { computeCropRect, cropOutputSize } from './image-crop'

const FRAME = { frameWidth: 420, frameHeight: 315 }

describe('computeCropRect', () => {
  it('reads the whole photo when the frame matches its aspect', () => {
    expect(
      computeCropRect({
        ...FRAME,
        imageWidth: 4032,
        imageHeight: 3024,
        scale: 1,
        translateX: 0,
        translateY: 0,
      })
    ).toEqual({ originX: 0, originY: 0, width: 4032, height: 3024 })
  })

  it('takes the sides of a photo wider than the frame', () => {
    expect(
      computeCropRect({
        ...FRAME,
        imageWidth: 4000,
        imageHeight: 2000,
        scale: 1,
        translateX: 0,
        translateY: 0,
      })
    ).toEqual({ originX: 667, originY: 0, width: 2667, height: 2000 })
  })

  it('takes the top and the bottom of a photo taller than the frame', () => {
    expect(
      computeCropRect({
        ...FRAME,
        imageWidth: 3024,
        imageHeight: 4032,
        scale: 1,
        translateX: 0,
        translateY: 0,
      })
    ).toEqual({ originX: 0, originY: 882, width: 3024, height: 2268 })
  })

  it('narrows the rectangle around the center when zoomed in', () => {
    expect(
      computeCropRect({
        ...FRAME,
        imageWidth: 4032,
        imageHeight: 3024,
        scale: 2,
        translateX: 0,
        translateY: 0,
      })
    ).toEqual({ originX: 1008, originY: 756, width: 2016, height: 1512 })
  })

  it('stops at the edges when the photo is panned all the way', () => {
    const zoomed = {
      ...FRAME,
      imageWidth: 4032,
      imageHeight: 3024,
      scale: 2,
    }

    expect(
      computeCropRect({ ...zoomed, translateX: -210, translateY: -157.5 })
    ).toEqual({ originX: 2016, originY: 1512, width: 2016, height: 1512 })
    expect(
      computeCropRect({ ...zoomed, translateX: 210, translateY: 157.5 })
    ).toEqual({ originX: 0, originY: 0, width: 2016, height: 1512 })
  })

  it('keeps the rectangle inside the photo from every zoom and pan', () => {
    const images: [number, number][] = [
      [4032, 3024],
      [3024, 4032],
      [4000, 2000],
      [1920, 1080],
      [800, 600],
      [1200, 1600],
      [500, 500],
    ]
    const frames: [number, number][] = [
      [420, 315],
      [358, 269],
      [213, 160],
      [1248, 336],
    ]

    for (const [imageWidth, imageHeight] of images) {
      for (const [frameWidth, frameHeight] of frames) {
        for (const scale of [1, 1.3, 2.5, 5]) {
          const effectiveScale =
            Math.max(frameWidth / imageWidth, frameHeight / imageHeight) * scale
          const boundX = Math.max(0, (imageWidth * effectiveScale - frameWidth) / 2)
          const boundY = Math.max(
            0,
            (imageHeight * effectiveScale - frameHeight) / 2
          )

          for (const [translateX, translateY] of [
            [0, 0],
            [boundX, boundY],
            [-boundX, -boundY],
            [boundX * 3, -boundY * 2],
          ]) {
            const rect = computeCropRect({
              frameWidth,
              frameHeight,
              imageWidth,
              imageHeight,
              scale,
              translateX,
              translateY,
            })

            expect(rect).not.toBeNull()
            expect(rect!.width).toBeGreaterThanOrEqual(1)
            expect(rect!.height).toBeGreaterThanOrEqual(1)
            expect(rect!.originX).toBeGreaterThanOrEqual(0)
            expect(rect!.originY).toBeGreaterThanOrEqual(0)
            expect(rect!.originX + rect!.width).toBeLessThanOrEqual(imageWidth)
            expect(rect!.originY + rect!.height).toBeLessThanOrEqual(imageHeight)
          }
        }
      }
    }
  })

  it('returns null when the photo has no usable dimensions', () => {
    for (const [imageWidth, imageHeight] of [
      [0, 0],
      [4032, 0],
      [NaN, NaN],
      [Infinity, Infinity],
    ]) {
      expect(
        computeCropRect({
          ...FRAME,
          imageWidth,
          imageHeight,
          scale: 1,
          translateX: 0,
          translateY: 0,
        })
      ).toBeNull()
    }
  })

  it('returns null when the frame cannot hold a crop', () => {
    expect(
      computeCropRect({
        frameWidth: 0,
        frameHeight: 0,
        imageWidth: 4032,
        imageHeight: 3024,
        scale: 1,
        translateX: 0,
        translateY: 0,
      })
    ).toBeNull()
  })

  it('reads a broken gesture value as the untouched position', () => {
    expect(
      computeCropRect({
        ...FRAME,
        imageWidth: 4032,
        imageHeight: 3024,
        scale: NaN,
        translateX: NaN,
        translateY: Infinity,
      })
    ).toEqual({ originX: 0, originY: 0, width: 4032, height: 3024 })
  })
})

describe('cropOutputSize', () => {
  it('scales a phone photo down to the maximum side', () => {
    expect(cropOutputSize({ originX: 0, originY: 0, width: 4032, height: 3024 })).toEqual(
      { width: 1280, height: 960 }
    )
  })

  it('keeps a small crop untouched', () => {
    expect(cropOutputSize({ originX: 0, originY: 0, width: 300, height: 200 })).toEqual(
      { width: 300, height: 200 }
    )
  })

  it('caps the longest side whatever the orientation', () => {
    expect(cropOutputSize({ originX: 0, originY: 0, width: 960, height: 1280 })).toEqual(
      { width: 960, height: 1280 }
    )
    expect(cropOutputSize({ originX: 0, originY: 0, width: 4000, height: 2000 })).toEqual(
      { width: 1280, height: 640 }
    )
  })
})
