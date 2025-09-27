import { NextRequest, NextResponse } from 'next/server';

// Validation helper function - same as in avatars endpoint
function validateMeasurements(measurements: any) {
  const errors: string[] = [];

  // Check if measurements object exists
  if (!measurements || typeof measurements !== 'object') {
    return { isValid: false, errors: ['Measurements object is required'] };
  }

  // Required fields with their validation rules
  const requiredFields = {
    height: { min: 100, max: 250, unit: 'cm' },
    bust: { min: 60, max: 150, unit: 'cm' },
    waist: { min: 50, max: 120, unit: 'cm' },
    hips: { min: 60, max: 150, unit: 'cm' },
    shoulders: { min: 30, max: 70, unit: 'cm' }
  };

  // Validate each required field
  for (const [field, rules] of Object.entries(requiredFields)) {
    const value = measurements[field];

    // Check if field exists
    if (value === undefined || value === null) {
      errors.push(`${field} is required`);
      continue;
    }

    // Check if field is numeric
    if (typeof value !== 'number' || isNaN(value)) {
      errors.push(`${field} must be a valid number`);
      continue;
    }

    // Check if value is positive
    if (value <= 0) {
      errors.push(`${field} must be a positive number`);
      continue;
    }

    // Check if value is within valid range
    if (value < rules.min || value > rules.max) {
      errors.push(`${field} must be between ${rules.min} and ${rules.max} ${rules.unit}`);
      continue;
    }
  }

  // Check for unexpected fields
  const allowedFields = Object.keys(requiredFields);
  const providedFields = Object.keys(measurements);
  const unexpectedFields = providedFields.filter(field => !allowedFields.includes(field));

  if (unexpectedFields.length > 0) {
    errors.push(`Unexpected fields: ${unexpectedFields.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Extract measurements from request body
    const { measurements } = body;

    // Validate measurements
    const validation = validateMeasurements(measurements);

    if (!validation.isValid) {
      return NextResponse.json({
        error: 'Invalid measurements provided',
        code: 'INVALID_MEASUREMENTS',
        validationErrors: validation.errors
      }, { status: 400 });
    }

    // Return success response with validation results
    return NextResponse.json({
      message: 'Measurements validation successful',
      isValid: true,
      measurements: measurements,
      validationSummary: {
        height: `${measurements.height} cm`,
        bust: `${measurements.bust} cm`, 
        waist: `${measurements.waist} cm`,
        hips: `${measurements.hips} cm`,
        shoulders: `${measurements.shoulders} cm`
      }
    }, { status: 200 });

  } catch (error) {
    console.error('POST error:', error);
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json({
        error: 'Invalid JSON format in request body',
        code: 'INVALID_JSON'
      }, { status: 400 });
    }

    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}