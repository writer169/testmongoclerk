import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';

const uri = process.env.MONGODB_URI!;

let client: MongoClient;
async function connectToMongo() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  return client;
}

export async function POST(request: Request) {
  try {
    const { userId, appId } = await request.json();

    if (!userId || !appId) {
      return NextResponse.json(
        { message: 'Missing userId or appId' },
        { status: 400 }
      );
    }

    const client = await connectToMongo();
    const db = client.db('your_database_name');
    const collection = db.collection('access_requests');

    const existingRequest = await collection.findOne({ userId, appId });
    if (existingRequest) {
      return NextResponse.json(
        { message: 'Access request already exists' },
        { status: 400 }
      );
    }

    const requestData = {
      userId,
      appId,
      status: 'pending',
      requestedAt: new Date(),
      approvedAt: null,
    };

    await collection.insertOne(requestData);

    return NextResponse.json(
      { message: 'Access request created successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error creating access request:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}