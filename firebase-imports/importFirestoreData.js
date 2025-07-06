// importFirestoreData.js

const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const fs = require("fs");
const path = require("path");

// 1️⃣ Initialize the Admin SDK
initializeApp({
  credential: applicationDefault(),
});

const db = getFirestore();

async function importData() {
  // 2️⃣ Load and parse JSON
  const filePath = path.resolve(__dirname, "seed-data.json");
  const raw = fs.readFileSync(filePath, "utf8");
  const seed = JSON.parse(raw);

  // 3️⃣ Write each doc to Firestore
  for (const [collectionName, docs] of Object.entries(seed)) {
    for (const [docId, docData] of Object.entries(docs)) {
      await db.collection(collectionName).doc(docId).set(docData);
      console.log(`Imported ${collectionName}/${docId}`);
    }
  }

  console.log("✅ All seed data imported successfully");
}

importData().catch(err => {
  console.error("❌ Import failed:", err);
  process.exit(1);
});
