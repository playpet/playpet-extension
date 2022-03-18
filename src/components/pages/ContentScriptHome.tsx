import React from "react"
import { usePetFromTick } from "../../lib/pet_hooks"
import { PetCanvas } from "../PetCanvas"
import { DroppingCanvas } from "../DroppingCanvas"
import { MOVE_DURATION, DOCUMENT_FRAME_SIZE, DROPPINGS_FRAME_SIZE } from "../../lib/consts"
import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import Typography from "@mui/material/Typography"
import { savePet } from "../../lib/pet_utils"
import { Coords } from "../../lib/types"
import { scalePosition, subtractPositions } from "../../lib/position"

export const ContentScriptHome: React.FC = () => {
  const pet = usePetFromTick()
  const [pos, setPos] = React.useState<Coords>({ x: 0, y: 0 })
  const [faceDirection, setDirection] = React.useState<"left" | "right">("left")
  const [freezeAnim, setFreezeAnim] = React.useState(true)
  const [grabbing, setGrabbing] = React.useState(false)
  const [grabOffset, setGrabOffset] = React.useState<Coords>({ x: 0, y: 0 })
  const [mousePos, setMousePos] = React.useState<Coords>({ x: 0, y: 0 })

  React.useEffect(() => {
    if (pet && freezeAnim) {
      const id = setTimeout(() => setFreezeAnim(false), 100)
      return () => clearTimeout(id)
    }
  }, [pet, freezeAnim])

  React.useEffect(() => {
    if (!pet) {
      return
    }
    if (pet.position.direction !== faceDirection) {
      setDirection(pet.position.direction)
    }

    if (pet.position.x !== pos.x || pet.position.y !== pos.y) {
      setPos(pet.position)
    }
  }, [pet?.position])

  const onMouseMove = React.useCallback(
    (e: MouseEvent) => {
      const mPos = { x: e.clientX, y: e.clientY }
      setMousePos(mPos)
    },
    [grabbing, mousePos]
  )
  const onMouseDown = React.useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      setGrabbing(true)
      const mousePos = { x: e.clientX, y: e.clientY }
      const objPos = { x: e.currentTarget.offsetLeft, y: e.currentTarget.offsetTop }
      const offset = subtractPositions(mousePos, objPos)
      const relPos = subtractPositions(mousePos, grabOffset)
      const scaledPos = scalePosition(relPos, {
        x: 1 / window.innerWidth,
        y: 1 / window.innerHeight,
      })
      setGrabOffset(offset)
      setMousePos(mousePos)
      setPos(scaledPos)
    },
    [grabbing]
  )
  const onMouseUp = React.useCallback(() => {
    setGrabbing(false)
    const relPos = subtractPositions(mousePos, grabOffset)
    const scaledPos = scalePosition(relPos, {
      x: 1 / window.innerWidth,
      y: 1 / window.innerHeight,
    })
    setPos(scaledPos)
    pet.moveTo(scaledPos)
    savePet(pet, { sync: true })
  }, [grabbing, mousePos, grabOffset])

  React.useEffect(() => {
    if (grabbing) {
      document.addEventListener("mousemove", onMouseMove)
      document.addEventListener("mouseup", onMouseUp)
      return () => {
        document.removeEventListener("mousemove", onMouseMove)
        document.removeEventListener("mouseup", onMouseUp)
      }
    }
  }, [grabbing, mousePos, grabOffset])

  if (!pet) {
    return null
  }

  return (
    <>
      <Box
        onMouseDownCapture={onMouseDown}
        style={{
          top: grabbing
            ? subtractPositions(mousePos, grabOffset).y + "px"
            : (pos.y * 100).toFixed(5) + "%",
          left: grabbing
            ? subtractPositions(mousePos, grabOffset).x + "px"
            : (pos.x * 100).toFixed(5) + "%",
          transition: [
            "transform 150ms ease-in-out",
            `left ${
              !freezeAnim && !grabbing ? MOVE_DURATION : 0
            }ms cubic-bezier(0.52, 0.25, 0.79, 1.02)`,
            `top ${
              !freezeAnim && !grabbing ? MOVE_DURATION : 0
            }ms cubic-bezier(0.52, 0.25, 0.79, 1.02)`,
          ].join(", "),
          transform: grabbing ? "scale(1.05)" : "scale(1)",
          cursor: !grabbing ? "grab" : "grabbing",
        }}
        sx={{
          position: "fixed",
          width: DOCUMENT_FRAME_SIZE,
          height: DOCUMENT_FRAME_SIZE,
          marginTop: 1,
          zIndex: 999999999999,
          "& > :last-child": {
            transform: "translateY(-10px)",
            opacity: 0,
            pointerEvents: "none",
            transition: "all 150ms ease-in-out",
          },
          "&:hover > :last-child": {
            transform: "translateY(0px)",
            opacity: 1,
            pointerEvents: "initial",
          },
        }}
      >
        <PetCanvas
          pet={pet}
          width={DOCUMENT_FRAME_SIZE}
          height={DOCUMENT_FRAME_SIZE}
          faceDirection={faceDirection}
        />
        <Grid container justifyContent="center">
          <Box
            sx={{
              background: "#00000080",
              color: "white",
              textAlign: "center",
              borderRadius: 1,
              padding: (theme) => theme.spacing(0, 0.5),
              cursor: "default",
            }}
          >
            <Typography variant="caption" noWrap>
              {pet.name} {pet.status ? `(${pet.status})` : null}
            </Typography>
          </Box>
        </Grid>
      </Box>
      {pet.objects.droppings.map((drop) => (
        <Box
          key={"dropping-" + drop.id}
          onClick={function () {
            pet.removeObject("droppings", drop.id)
            savePet(pet, { sync: true })
          }}
          sx={{
            position: "fixed",
            width: DROPPINGS_FRAME_SIZE,
            height: DROPPINGS_FRAME_SIZE,
            marginTop: 1,
            top: (drop.y * 100).toFixed(5) + "%",
            left: (drop.x * 100).toFixed(5) + "%",
            zIndex: 999999999999,
            cursor: "pointer",
            "& > :last-child": {
              transform: "translateY(-10px)",
              opacity: 0,
              pointerEvents: "none",
              transition: "all 150ms ease-in-out",
            },
            "&:hover > :last-child": {
              transform: "translateY(0px)",
              opacity: 1,
              pointerEvents: "initial",
            },
          }}
        >
          <DroppingCanvas
            dropping={drop}
            image={pet.droppingImage}
            width={DROPPINGS_FRAME_SIZE}
            height={DROPPINGS_FRAME_SIZE}
            padding={0}
          />
          <Grid container justifyContent="center">
            <Box
              sx={{
                background: "#00000080",
                color: "white",
                textAlign: "center",
                borderRadius: 1,
                padding: (theme) => theme.spacing(0, 0.5),
                cursor: "default",
              }}
            >
              <Typography variant="caption" noWrap>
                Click to clean
              </Typography>
            </Box>
          </Grid>
        </Box>
      ))}
    </>
  )
}
