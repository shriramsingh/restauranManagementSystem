import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Table from '@/models/Table'

// Generate QR code using an external service (no npm package needed)
function generateQrCodeUrl(data: string, size: number = 200): string {
  const encoded = encodeURIComponent(data)
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}`
}

// GET /api/tables/[id]/qr — Generate QR code for a table
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const table = await Table.findById(params.id)
    if (!table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 })
    }

    // Build the customer menu URL with table ID
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const menuUrl = `${baseUrl}/customer/menu?tableId=${table._id}`

    const qrCodeUrl = generateQrCodeUrl(menuUrl, 300)

    return NextResponse.json({
      tableId: table._id.toString(),
      tableNumber: table.tableNumber,
      menuUrl,
      qrCodeUrl,
    })
  } catch (error: any) {
    console.error('Error generating QR code:', error)
    return NextResponse.json(
      { error: 'Failed to generate QR code', details: error.message },
      { status: 500 }
    )
  }
}
