import { MongoClient, ServerApiVersion } from "mongodb";

if (!process.env.MONGO_URI) {
  throw new Error("Mongo Uri not found");
}

const client = new MongoClient(process.env.MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function getDB(dbName) {
  try {
    await client.connect();
    console.log(">>>>Connected to DB<<<<");
    return client.db(dbName);
  } catch (error) {
    console.log(error);
  }
}

export async function getCollection(collectionName) {
  const db = await getDB("nextblogdb");
  if (db) return db.collection(collectionName);

  return null;
}
