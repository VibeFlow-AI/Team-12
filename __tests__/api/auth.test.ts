import { POST as signupHandler } from '@/app/api/auth/register/route';
import { getDatabase } from '@/lib/mongodb-alt';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';

// Mock dependencies
jest.mock('@/lib/mongodb-alt');
jest.mock('bcryptjs');

const mockGetDatabase = getDatabase as jest.MockedFunction<typeof getDatabase>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

// Mock database collections
const mockUsers = {
  findOne: jest.fn(),
  insertOne: jest.fn(),
  updateOne: jest.fn(),
};

const mockDb = {
  collection: jest.fn().mockReturnValue(mockUsers),
};

describe('/api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetDatabase.mockResolvedValue(mockDb as any);
  });

  it('should create a new user successfully', async () => {
    const requestBody = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123!',
      role: 'student'
    };

    mockUsers.findOne.mockResolvedValue(null); // User doesn't exist
    mockBcrypt.hash.mockResolvedValue('hashedPassword' as never);
    mockUsers.insertOne.mockResolvedValue({ insertedId: 'user123', acknowledged: true });

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await signupHandler(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.message).toBe('User created successfully');
    expect(mockBcrypt.hash).toHaveBeenCalledWith('Password123!', 12);
    expect(mockUsers.insertOne).toHaveBeenCalled();
  });

  it('should return error if user already exists', async () => {
    const requestBody = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123!',
      role: 'student'
    };

    mockUsers.findOne.mockResolvedValue({ email: 'john@example.com' }); // User exists

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await signupHandler(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBe('User already exists');
    expect(mockUsers.insertOne).not.toHaveBeenCalled();
  });

  it('should validate required fields', async () => {
    const requestBody = {
      name: '',
      email: 'invalid-email',
      password: '123', // Too short
      role: 'invalid-role'
    };

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await signupHandler(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
    expect(data.details).toBeDefined();
  });

  it('should handle database errors', async () => {
    const requestBody = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123!',
      role: 'student'
    };

    mockUsers.findOne.mockResolvedValue(null);
    mockBcrypt.hash.mockResolvedValue('hashedPassword' as never);
    mockUsers.insertOne.mockRejectedValue(new Error('Database error'));

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await signupHandler(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });
});