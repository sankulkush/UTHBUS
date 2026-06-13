/**
 * UthBus Cloud Functions.
 *
 * Codebase is intentionally small. Today it hosts the nightly Firestore →
 * Cloud Storage backup (previously deferred on the Blaze plan). Region is
 * asia-south1 (Mumbai) to match the project's Storage location.
 */

import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";
import { setGlobalOptions } from "firebase-functions/v2";
import { v1 } from "@google-cloud/firestore";

setGlobalOptions({ region: "asia-south1" });

const firestoreAdmin = new v1.FirestoreAdminClient();

/**
 * Nightly Firestore export to GCS. Runs at 18:15 UTC (= 00:00 Asia/Kathmandu).
 *
 * Writes a timestamped export under gs://{projectId}-firestore-backups. The
 * destination bucket must exist and the functions runtime service account
 * needs the "Cloud Datastore Import Export Admin" role plus write access to
 * the bucket (see SETUP notes in the deploy step).
 */
export const scheduledFirestoreBackup = onSchedule(
  {
    schedule: "15 18 * * *", // 18:15 UTC daily
    timeZone: "UTC",
    retryCount: 2,
  },
  async () => {
    const projectId =
      process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT;
    if (!projectId) {
      logger.error("No project id in environment; cannot run backup.");
      return;
    }

    const databaseName = firestoreAdmin.databasePath(projectId, "(default)");
    // Per-day prefix so exports don't overwrite each other.
    const stamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const outputUriPrefix = `gs://${projectId}-firestore-backups/${stamp}`;

    try {
      const [operation] = await firestoreAdmin.exportDocuments({
        name: databaseName,
        outputUriPrefix,
        // Empty = export all collections.
        collectionIds: [],
      });
      logger.info(`Firestore export started → ${outputUriPrefix}`, {
        operation: operation.name,
      });
    } catch (err) {
      logger.error("Firestore export failed to start", err as Error);
      throw err; // let the retry policy take over
    }
  }
);
