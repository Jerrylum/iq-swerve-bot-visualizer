
import type { Context } from "./Hardware.svelte";
import { DeviceType } from "./Hardware.svelte";

export async function main(context: Context) {
  const leftSteerMotor = context.getDevice(6, DeviceType.Motor);
  const rightSteerMotor = context.getDevice(3, DeviceType.Motor);
  const leftDriveMotor = context.getDevice(12, DeviceType.Motor);
  const rightDriveMotor = context.getDevice(9, DeviceType.Motor);

  setInterval(() => {
    
  }, 10);
}
