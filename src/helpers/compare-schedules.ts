export default (lastSchedule: Buffer, newSchedule: Buffer) => {
  return lastSchedule.equals(newSchedule);
};
