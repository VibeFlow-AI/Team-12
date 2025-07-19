"use server";

import { getDb } from "@/lib/mongodb";
import { Sample } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function addSample(formData: FormData) {
  const id = formData.get("id") as string;

  if (!id || !id.trim()) {
    return { error: "Sample ID is required" };
  }

  try {
    const db = await getDb();
    const collection = db.collection("samples");
    
    // Check if sample with this ID already exists
    const existingSample = await collection.findOne({ id: id.trim() });
    if (existingSample) {
      return { error: "Sample with this ID already exists" };
    }

    const sample = {
      id: id.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(sample);

    revalidatePath("/");
    return { success: true, sample: { ...sample, _id: result.insertedId } };
  } catch (error) {
    console.error("Error creating sample:", error);
    return { error: "Failed to create sample" };
  }
}

export async function deleteSample(id: string) {
  try {
    const db = await getDb();
    const collection = db.collection("samples");
    
    const result = await collection.deleteOne({ id });
    
    if (result.deletedCount === 0) {
      return { error: "Sample not found" };
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting sample:", error);
    return { error: "Failed to delete sample" };
  }
}

export async function getSamples(): Promise<{ success: boolean; samples: Sample[]; error?: string }> {
  try {
    const db = await getDb();
    const collection = db.collection("samples");
    
    const documents = await collection.find({}).sort({ createdAt: -1 }).toArray();
    
    // Transform MongoDB documents to Sample objects
    const samples = documents.map(doc => ({
      _id: doc._id.toString(),
      id: doc.id,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
    
    return { success: true, samples };
  } catch (error) {
    console.error("Error fetching samples:", error);
    return { success: false, error: "Failed to fetch samples", samples: [] };
  }
}
