import memjs from "memjs";
import logger from "./logger";

const memcached = memjs.Client.create("localhost:11211");
export function addUser(userid: string, socket: string): Promise<void> {
  return new Promise((resolve, reject) => {
    memcached.set(userid, socket, { expires: 14400 }, (err) => {
      if (err) {
        logger.error("Failed to store socket id", err);
        reject(err);
      } else resolve();
    });
  });
}
export function findUser(userid: string): Promise<string> {
  return new Promise((resolve, reject) => {
    memcached.get(userid, (err, data) => {
      if (err) {
        logger.error("Failed to retrieve socket id", err);
        reject(err);
      } else resolve(data ? data.toString() : ""); // ✅ convert Buffer to string
    });
  });
}

export function removeUser(userid: string): Promise<void> {
  return new Promise((resolve, reject) => {
    memcached.delete(userid, (err) => {
      if (err) {
        logger.error("Failed to delete passcode", err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}