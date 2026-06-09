import { ObjectId, type WithId } from "mongodb";
import { getDatabase } from "../db/mongo.js";
import {
  careerSaveCollectionName,
  type CareerSaveDocument,
} from "../models/careerSave.js";

export type CareerSaveDocumentProjection = WithId<
  Omit<CareerSaveDocument, "career"> & {
    career?: CareerSaveDocument["career"];
  }
>;

type CareerSaveUpdateFields = Pick<
  CareerSaveDocument,
  | "career"
  | "participants"
  | "saveName"
  | "schemaVersion"
  | "summary"
  | "updatedAt"
>;

async function getCareerSaveCollection() {
  const database = await getDatabase();

  return database.collection<CareerSaveDocument>(careerSaveCollectionName);
}

export function createCareerSaveObjectId() {
  return new ObjectId();
}

export async function ensureCareerSaveIndexes() {
  const collection = await getCareerSaveCollection();

  await collection.createIndex({ ownerId: 1, updatedAt: -1 });
  await collection.createIndex({ worldId: 1 });
  await collection.createIndex({ ownerId: 1, saveName: 1 });
}

export async function listCareerSaveDocumentsByOwner(ownerId: string) {
  const collection = await getCareerSaveCollection();
  const saves = await collection
    .find({ ownerId })
    .sort({ updatedAt: -1 })
    .project<Omit<CareerSaveDocument, "career">>({ career: 0 })
    .toArray();

  return saves as CareerSaveDocumentProjection[];
}

export async function findCareerSaveDocumentByIdAndOwner(
  _id: ObjectId,
  ownerId: string,
) {
  const collection = await getCareerSaveCollection();

  return collection.findOne({ _id, ownerId });
}

export async function insertCareerSaveDocument(
  document: CareerSaveDocument & { _id: ObjectId },
) {
  const collection = await getCareerSaveCollection();

  await collection.insertOne(document);

  return document as WithId<CareerSaveDocument>;
}

export async function updateCareerSaveDocument({
  _id,
  expectedRevision,
  ownerId,
  updateFields,
}: {
  _id: ObjectId;
  expectedRevision?: number;
  ownerId: string;
  updateFields: CareerSaveUpdateFields;
}) {
  const collection = await getCareerSaveCollection();
  const filter = expectedRevision ? { _id, ownerId, revision: expectedRevision } : { _id, ownerId };

  return collection.updateOne(filter, {
    $inc: {
      revision: 1,
    },
    $set: updateFields,
  });
}

export async function deleteCareerSaveDocument(_id: ObjectId, ownerId: string) {
  const collection = await getCareerSaveCollection();
  const result = await collection.deleteOne({ _id, ownerId });

  return result.deletedCount > 0;
}
