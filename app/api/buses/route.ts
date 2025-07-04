import { NextResponse } from 'next/server';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';

// GET handler for fetching buses
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const operatorId = searchParams.get('operatorId');

    let busesRef = collection(firestore, 'buses');
    let busesQuery = operatorId 
      ? query(busesRef, where('operatorId', '==', operatorId))
      : busesRef;

    const snapshot = await getDocs(busesQuery);
    const buses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json(buses);
  } catch (error) {
    console.error('Error fetching buses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch buses' },
      { status: 500 }
    );
  }
}

// POST handler for creating a new bus
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Add timestamp
    const busData = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add the document to Firestore
    const busesRef = collection(firestore, 'buses');
    const docRef = await addDoc(busesRef, busData);

    // Fetch the created document
    const busDoc = await getDoc(doc(firestore, 'buses', docRef.id));
    
    return NextResponse.json({
      id: docRef.id,
      ...busDoc.data()
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating bus:', error);
    return NextResponse.json(
      { error: 'Failed to create bus' },
      { status: 500 }
    );
  }
}

// PUT handler for updating a bus
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Bus ID is required' },
        { status: 400 }
      );
    }

    const data = await request.json();
    
    // Add updated timestamp
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    // Update the document in Firestore
    const busRef = doc(firestore, 'buses', id);
    await updateDoc(busRef, updateData);

    // Fetch the updated document
    const busDoc = await getDoc(busRef);
    
    if (!busDoc.exists()) {
      return NextResponse.json(
        { error: 'Bus not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: busDoc.id,
      ...busDoc.data()
    });

  } catch (error) {
    console.error('Error updating bus:', error);
    return NextResponse.json(
      { error: 'Failed to update bus' },
      { status: 500 }
    );
  }
}

// DELETE handler for removing a bus
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Bus ID is required' },
        { status: 400 }
      );
    }

    // Delete the document from Firestore
    const busRef = doc(firestore, 'buses', id);
    await updateDoc(busRef, { 
      status: 'deleted',
      deletedAt: new Date().toISOString()
    });

    return NextResponse.json(
      { message: 'Bus deleted successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting bus:', error);
    return NextResponse.json(
      { error: 'Failed to delete bus' },
      { status: 500 }
    );
  }
}