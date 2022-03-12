import React from "react"
import PetData, { PetState } from "../lib/pet_data"
import { useTick } from "./tick"
import { useCanvas } from "./sprite_hooks"

const MOD = 500
const SPEED = 40
const SPRITE_SIZE = 24
const BG_SIZE = 32
const PET_FRAME_COUNT = 2
const DROPPING_FRAME_COUNT = 3

export function usePetSprite({
  ctx,
  pet,
  width,
  height,
  padding,
  useBackground,
  lockState,
}: {
  ctx: CanvasRenderingContext2D
  pet: PetData
  width: number
  height: number
  padding: number
  faceDirection: "left" | "right"
  useBackground?: boolean
  lockState?: boolean
}) {
  const { frame } = useTick()
  const frameCounts: Partial<Record<PetState, number>> = {
    idle: 2,
    moving: 9,
  }
  const frameSpeeds: Partial<Record<PetState, number>> = {
    idle: 40,
    moving: 2,
  }
  const frameSlices: Partial<Record<PetState, number>> = {
    idle: 0,
    moving: 1,
  }
  const animKey: PetState = lockState ? "idle" : frameCounts[pet.state] ? pet.state : "idle"
  const petAnimFrame = React.useMemo(
    () => Math.floor(frame / frameSpeeds[animKey]) % frameCounts[animKey],
    [frame, animKey]
  )
  const bgAnimFrame = React.useMemo(
    () => Math.floor(((frame / SPEED) * 2) % (width * 2)) - width,
    [frame]
  )

  const draw = React.useCallback(
    (ctx: CanvasRenderingContext2D): void => {
      if (useBackground && pet.backgroundImage) {
        ctx.drawImage(pet.backgroundImage, 0, 0, BG_SIZE, BG_SIZE, 0, 0, width, height)
        ctx.drawImage(
          pet.backgroundImage,
          0,
          BG_SIZE,
          BG_SIZE,
          BG_SIZE,
          bgAnimFrame,
          0,
          width,
          height
        )
      }
      if (pet.spriteImage) {
        ctx.drawImage(
          pet.spriteImage,
          petAnimFrame * SPRITE_SIZE,
          frameSlices[animKey] * SPRITE_SIZE,
          SPRITE_SIZE,
          SPRITE_SIZE,
          padding,
          padding,
          width - padding * 2,
          height - padding * 2
        )
      }
    },
    [petAnimFrame, bgAnimFrame, animKey]
  )
  useCanvas(ctx, draw, { width, height })
}
