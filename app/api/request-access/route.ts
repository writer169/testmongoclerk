import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';

const uri = process.env.MONGODB_URI!;

let client: MongoClient | null = null;

async function connectToMongo() {
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }
  if (!client) {
    console.log('Connecting to MongoDB...');
    client = new MongoClient(uri);
    await client.connect();
    console.log('MongoDB connected');
  }
  return client;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Request body:', body);
    
    // Извлекаем все необходимые данные из запроса
    const { 
      userId, 
      appId, 
      userEmail, 
      userFirstName, 
      userLastName 
    } = body;

    // Проверка обязательных данных
    if (!userId || !appId) {
      console.error('Missing userId or appId:', { userId, appId });
      return NextResponse.json(
        { message: 'Missing userId or appId' },
        { status: 400 }
      );
    }

    // Проверка допустимых значений appId
    const validAppIds = ['weather', 'notes'];
    if (!validAppIds.includes(appId)) {
      console.error('Invalid appId:', appId);
      return NextResponse.json(
        { message: 'Invalid appId. Must be one of: ' + validAppIds.join(', ') },
        { status: 400 }
      );
    }

    const client = await connectToMongo();
    const dbName = 'authapp';
    const db = client.db(dbName);
    const collection = db.collection('auth_approvals');

    console.log('Using database:', dbName);
    console.log('Using collection: auth_approvals');

    // Проверка на дублирующий запрос
    const existingRequest = await collection.findOne({ userId, appId });
    if (existingRequest) {
      console.log('Existing request found:', existingRequest);
      
      // Обновляем существующий запрос с сохранением пользовательских данных
      const updateData = {
        status: 'pending',
        requestedAt: new Date(),
        approvedAt: null,
        rejectedAt: null,
        rejectionReason: null
      };

      // Добавляем пользовательские данные, если они переданы
      if (userEmail) updateData.userEmail = userEmail;
      if (userFirstName) updateData.userFirstName = userFirstName;
      if (userLastName) updateData.userLastName = userLastName;

      const updateResult = await collection.updateOne(
        { userId, appId },
        { $set: updateData }
      );
      
      console.log('Update result:', updateResult);
      return NextResponse.json(
        { message: 'Access request updated successfully' },
        { status: 200 }
      );
    }

    // Создание нового запроса с полными пользовательскими данными
    const requestData = {
      userId,
      appId,
      userEmail: userEmail || null,
      userFirstName: userFirstName || null,
      userLastName: userLastName || null,
      status: 'pending',
      requestedAt: new Date(),
      approvedAt: null,
      rejectedAt: null,
      rejectionReason: null,
    };

    const insertResult = await collection.insertOne(requestData);
    console.log('New request created:', { ...requestData, _id: insertResult.insertedId });

    return NextResponse.json(
      { message: 'Access request created successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}