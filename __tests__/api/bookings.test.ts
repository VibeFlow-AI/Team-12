import { POST as createBookingHandler, GET as getBookingsHandler } from '@/app/api/bookings/route';
import { getDatabase } from '@/lib/mongodb-alt';
import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';

// Mock dependencies
jest.mock('@/lib/mongodb-alt');
jest.mock('next-auth');

const mockGetDatabase = getDatabase as jest.MockedFunction<typeof getDatabase>;
const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;

// Mock database collections
const mockSessions = {
  findOne: jest.fn(),
  insertOne: jest.fn(),
  updateOne: jest.fn(),
  aggregate: jest.fn(),
};

const mockUsers = {
  findOne: jest.fn(),
};

const mockMentorProfiles = {
  findOne: jest.fn(),
  updateOne: jest.fn(),
};

const mockNotifications = {
  insertOne: jest.fn(),
};

const mockAvailability = {
  findOne: jest.fn(),
};

const mockDb = {
  collection: jest.fn((name: string) => {
    switch (name) {
      case 'sessions':
        return mockSessions;
      case 'users':
        return mockUsers;
      case 'mentorProfiles':
        return mockMentorProfiles;
      case 'notifications':
        return mockNotifications;
      case 'availability':
        return mockAvailability;
      default:
        return {};
    }
  }),
};

describe('/api/bookings POST', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetDatabase.mockResolvedValue(mockDb as any);
  });

  it('should create a booking successfully', async () => {
    const mockSession = {
      user: {
        id: 'student123',
        name: 'John Doe',
        role: 'student'
      }
    };

    const requestBody = {
      mentorId: 'mentor123',
      sessionDate: '2024-12-25T00:00:00.000Z',
      sessionTime: '10:00',
      duration: '1hour',
      subject: 'Mathematics',
      message: 'Need help with calculus',
      sessionType: 'one_on_one'
    };

    const mockMentor = {
      _id: new ObjectId('mentor123'),
      role: 'mentor',
      onboardingCompleted: true,
      isActive: true
    };

    const mockMentorProfile = {
      userId: new ObjectId('mentor123'),
      hourlyRate: 50
    };

    mockGetServerSession.mockResolvedValue(mockSession as any);
    mockUsers.findOne.mockResolvedValue(mockMentor);
    mockMentorProfiles.findOne.mockResolvedValue(mockMentorProfile);
    
    // Mock availability check - no existing sessions
    mockSessions.findOne.mockResolvedValue(null);
    mockAvailability.findOne.mockResolvedValue({
      mentorId: new ObjectId('mentor123'),
      dayOfWeek: 3, // Wednesday
      startTime: '09:00',
      endTime: '17:00',
      isActive: true,
      exceptions: []
    });

    mockSessions.insertOne.mockResolvedValue({ 
      insertedId: new ObjectId('session123'),
      acknowledged: true 
    });

    const request = new NextRequest('http://localhost:3000/api/bookings', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await createBookingHandler(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.amount).toBe(50); // 1 hour * $50/hour
    expect(mockSessions.insertOne).toHaveBeenCalled();
    expect(mockNotifications.insertOne).toHaveBeenCalled();
    expect(mockMentorProfiles.updateOne).toHaveBeenCalled();
  });

  it('should return error if user is not authenticated', async () => {
    mockGetServerSession.mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/bookings', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await createBookingHandler(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return error if user is not a student', async () => {
    const mockSession = {
      user: {
        id: 'mentor123',
        role: 'mentor'
      }
    };

    mockGetServerSession.mockResolvedValue(mockSession as any);

    const request = new NextRequest('http://localhost:3000/api/bookings', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await createBookingHandler(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Access denied');
  });

  it('should return error if mentor is not available', async () => {
    const mockSession = {
      user: {
        id: 'student123',
        name: 'John Doe',
        role: 'student'
      }
    };

    const requestBody = {
      mentorId: 'mentor123',
      sessionDate: '2024-12-25T00:00:00.000Z',
      sessionTime: '10:00',
      duration: '1hour',
      subject: 'Mathematics',
      sessionType: 'one_on_one'
    };

    const mockMentor = {
      _id: new ObjectId('mentor123'),
      role: 'mentor',
      onboardingCompleted: true,
      isActive: true
    };

    const mockMentorProfile = {
      userId: new ObjectId('mentor123'),
      hourlyRate: 50
    };

    // Mock existing session conflict
    const existingSession = {
      mentorId: new ObjectId('mentor123'),
      sessionDate: new Date('2024-12-25'),
      sessionTime: '10:00',
      status: 'confirmed'
    };

    mockGetServerSession.mockResolvedValue(mockSession as any);
    mockUsers.findOne.mockResolvedValue(mockMentor);
    mockMentorProfiles.findOne.mockResolvedValue(mockMentorProfile);
    mockSessions.findOne.mockResolvedValue(existingSession);

    const request = new NextRequest('http://localhost:3000/api/bookings', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await createBookingHandler(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBe('Mentor is not available');
    expect(data.reason).toBe('Mentor already has a session at this time');
  });

  it('should validate input data', async () => {
    const mockSession = {
      user: {
        id: 'student123',
        role: 'student'
      }
    };

    const requestBody = {
      mentorId: '', // Invalid
      sessionDate: 'invalid-date',
      sessionTime: '25:00', // Invalid time
      duration: 'invalid-duration',
      subject: '',
      sessionType: 'invalid-type'
    };

    mockGetServerSession.mockResolvedValue(mockSession as any);

    const request = new NextRequest('http://localhost:3000/api/bookings', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await createBookingHandler(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
    expect(data.details).toBeDefined();
  });
});

describe('/api/bookings GET', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetDatabase.mockResolvedValue(mockDb as any);
  });

  it('should get bookings for student', async () => {
    const mockSession = {
      user: {
        id: 'student123',
        role: 'student'
      }
    };

    const mockBookings = [
      {
        _id: new ObjectId('session123'),
        sessionDate: new Date('2024-12-25'),
        sessionTime: '10:00',
        duration: '1hour',
        subject: 'Mathematics',
        status: 'confirmed',
        mentor: {
          name: 'Jane Smith',
          email: 'jane@example.com'
        }
      }
    ];

    mockGetServerSession.mockResolvedValue(mockSession as any);
    mockSessions.aggregate.mockReturnValue({
      toArray: jest.fn().mockResolvedValue(mockBookings)
    });

    const request = new NextRequest('http://localhost:3000/api/bookings');

    const response = await getBookingsHandler(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.bookings).toHaveLength(1);
    expect(data.bookings[0].id).toBe('session123');
  });

  it('should get bookings for mentor', async () => {
    const mockSession = {
      user: {
        id: 'mentor123',
        role: 'mentor'
      }
    };

    const mockBookings = [
      {
        _id: new ObjectId('session123'),
        sessionDate: new Date('2024-12-25'),
        sessionTime: '10:00',
        duration: '1hour',
        subject: 'Mathematics',
        status: 'pending',
        student: {
          name: 'John Doe',
          email: 'john@example.com'
        }
      }
    ];

    mockGetServerSession.mockResolvedValue(mockSession as any);
    mockSessions.aggregate.mockReturnValue({
      toArray: jest.fn().mockResolvedValue(mockBookings)
    });

    const request = new NextRequest('http://localhost:3000/api/bookings');

    const response = await getBookingsHandler(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.bookings).toHaveLength(1);
    expect(data.bookings[0].student.name).toBe('John Doe');
  });

  it('should return error if user is not authenticated', async () => {
    mockGetServerSession.mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/bookings');

    const response = await getBookingsHandler(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });
});