import { NextResponse } from 'next/server';
import { fetchNetworkStatus, NetworkResponse } from '@/services/xandeum';

export const dynamic = 'force-dynamic';
export const revalidate = 30; // Revalidate every 30 seconds

export async function GET() {
  try {
    const networkData = await fetchNetworkStatus();
    
    // Serialize Date objects to ISO strings for JSON
    const serialized: NetworkResponse = {
      ...networkData,
      lastUpdated: networkData.lastUpdated instanceof Date 
        ? networkData.lastUpdated 
        : new Date(networkData.lastUpdated)
    };
    
    return NextResponse.json(serialized);
  } catch (error: any) {
    console.error('API Error fetching network status:', error);
    
    // Return a properly formatted NetworkResponse even on error
    const fallbackResponse: NetworkResponse = {
      status: 'simulation',
      nodes: [],
      nodeCount: 0,
      lastUpdated: new Date()
    };
    
    return NextResponse.json(fallbackResponse, { status: 200 });
  }
}

