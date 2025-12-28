/**
 * Application composition and setup
 * Initializes the messaging service with Effect-TS
 */

import { Effect, Layer } from "effect";
import { NotificationService, NotificationServiceLive } from "./services";

/**
 * Create the notification service layer
 */
export const createNotificationLayer = (): Layer.Layer<NotificationService> => {
	return NotificationServiceLive;
};

/**
 * Run the messaging application
 */
export const runApp = async (): Promise<string> => {
	return Effect.runPromise(Effect.succeed("Messaging application started"));
};
