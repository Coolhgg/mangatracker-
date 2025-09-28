import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connectivity...');
    
    // Test basic database connection with simple query
    const testQuery = 'SELECT 1 as test';
    const connectionTest = await db.all(testQuery);
    console.log('Connection test result:', connectionTest);

    // Test series table existence and structure
    const tableInfoQuery = "PRAGMA table_info(series)";
    const tableInfo = await db.all(tableInfoQuery);
    console.log('Series table structure:', tableInfo);

    // Query series data with limit
    const seriesQuery = `
      SELECT 
        id, 
        title, 
        slug, 
        description,
        status,
        created_at,
        updated_at
      FROM series 
      ORDER BY created_at DESC 
      LIMIT 10
    `;
    
    const seriesData = await db.all(seriesQuery);
    console.log('Series query result:', seriesData);

    // Get total count
    const countQuery = 'SELECT COUNT(*) as total FROM series';
    const countResult = await db.get(countQuery);
    console.log('Series count:', countResult);

    return NextResponse.json({
      success: true,
      message: 'Database connectivity test successful',
      data: {
        connectionTest: connectionTest,
        tableInfo: tableInfo,
        seriesCount: countResult?.total || 0,
        seriesData: seriesData,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Database test error:', error);
    console.error('Error details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack
    });
    
    return NextResponse.json({ 
      success: false,
      error: 'Database test failed: ' + (error?.message || 'Unknown error'),
      errorType: error?.name || 'DatabaseError',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Testing database insert operation...');
    
    const body = await request.json();
    const { title, slug } = body;

    // Validate required fields
    if (!title) {
      return NextResponse.json({ 
        error: "Title is required",
        code: "MISSING_TITLE" 
      }, { status: 400 });
    }

    if (!slug) {
      return NextResponse.json({ 
        error: "Slug is required",
        code: "MISSING_SLUG" 
      }, { status: 400 });
    }

    // Check if slug already exists
    const existingSeriesQuery = 'SELECT id FROM series WHERE slug = ?';
    const existingSeries = await db.get(existingSeriesQuery, [slug]);
    
    if (existingSeries) {
      return NextResponse.json({ 
        error: "Slug already exists",
        code: "DUPLICATE_SLUG" 
      }, { status: 400 });
    }

    // Insert new series using direct SQL
    const currentTimestamp = Math.floor(Date.now() / 1000); // SQLite timestamp
    
    const insertQuery = `
      INSERT INTO series (
        title, 
        slug, 
        description,
        status,
        created_at, 
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const insertValues = [
      title,
      slug,
      'Test series description',
      'ongoing',
      currentTimestamp,
      currentTimestamp
    ];

    console.log('Executing insert query:', insertQuery);
    console.log('Insert values:', insertValues);

    const insertResult = await db.run(insertQuery, insertValues);
    console.log('Insert result:', insertResult);

    // Get the inserted record
    const getInsertedQuery = 'SELECT * FROM series WHERE id = ?';
    const insertedRecord = await db.get(getInsertedQuery, [insertResult.lastInsertRowid]);
    console.log('Inserted record:', insertedRecord);

    return NextResponse.json({
      success: true,
      message: 'Series created successfully',
      data: insertedRecord,
      insertId: insertResult.lastInsertRowid,
      timestamp: new Date().toISOString()
    }, { status: 201 });

  } catch (error) {
    console.error('Database insert test error:', error);
    console.error('Error details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack
    });
    
    return NextResponse.json({ 
      success: false,
      error: 'Database insert test failed: ' + (error?.message || 'Unknown error'),
      errorType: error?.name || 'DatabaseInsertError',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const body = await request.json();
    const { title, description, status } = body;

    // Check if record exists
    const existingQuery = 'SELECT * FROM series WHERE id = ?';
    const existingRecord = await db.get(existingQuery, [parseInt(id)]);
    
    if (!existingRecord) {
      return NextResponse.json({ 
        error: 'Series not found' 
      }, { status: 404 });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    
    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }

    updates.push('updated_at = ?');
    values.push(Math.floor(Date.now() / 1000));
    values.push(parseInt(id));

    const updateQuery = `UPDATE series SET ${updates.join(', ')} WHERE id = ?`;
    
    console.log('Update query:', updateQuery);
    console.log('Update values:', values);

    await db.run(updateQuery, values);

    // Get updated record
    const updatedRecord = await db.get(existingQuery, [parseInt(id)]);

    return NextResponse.json({
      success: true,
      message: 'Series updated successfully',
      data: updatedRecord,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Database update test error:', error);
    return NextResponse.json({ 
      error: 'Database update test failed: ' + (error?.message || 'Unknown error')
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if record exists
    const existingQuery = 'SELECT * FROM series WHERE id = ?';
    const existingRecord = await db.get(existingQuery, [parseInt(id)]);
    
    if (!existingRecord) {
      return NextResponse.json({ 
        error: 'Series not found' 
      }, { status: 404 });
    }

    // Delete the record
    const deleteQuery = 'DELETE FROM series WHERE id = ?';
    const deleteResult = await db.run(deleteQuery, [parseInt(id)]);
    
    console.log('Delete result:', deleteResult);

    return NextResponse.json({
      success: true,
      message: 'Series deleted successfully',
      data: existingRecord,
      deletedId: parseInt(id),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Database delete test error:', error);
    return NextResponse.json({ 
      error: 'Database delete test failed: ' + (error?.message || 'Unknown error')
    }, { status: 500 });
  }
}