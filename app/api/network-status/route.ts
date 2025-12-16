import { NextResponse } from 'next/server';
import { fetchNetworkStatus } from '@/services/xandeum';

export const dynamic = 'force-dynamic';
export const revalidate = 30; // Revalidate every 30 seconds

export async function GET() {
  try {
    const networkData = await fetchNetworkStatus();
    return NextResponse.json(networkData);
  } catch (error: any) {
    console.error('API Error fetching network status:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to fetch network status',
        status: 'simulation',
        nodes: [],
        nodeCount: 0,
        lastUpdated: new Date()
      },
      { status: 500 }
    );
  }
}

