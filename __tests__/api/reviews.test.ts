import { POST as createReviewHandler, GET as getReviewsHandler } from '@/app/api/reviews/route';
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
const mockReviews = {
  findOne: jest.fn(),
  insertOne: jest.fn(),
  aggregate: jest.fn(),
  countDocuments: jest.fn(),
  find: jest.fn(),
};

const mockSessions = {
  findOne: jest.fn(),
};

const mockUsers = {
  findOne: jest.fn(),
};

const mockMentorProfiles = {
  updateOne: jest.fn(),
};

const mockNotifications = {
  insertOne: jest.fn(),
};

const mockDb = {
  collection: jest.fn((name: string) => {
    switch (name) {
      case 'reviews':
        return mockReviews;
      case 'sessions':
        return mockSessions;
      case 'users':
        return mockUsers;
      case 'mentorProfiles':
        return mockMentorProfiles;
      case 'notifications':
        return mockNotifications;
      default:
        return {};
    }
  }),
};

describe('/api/reviews POST', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetDatabase.mockResolvedValue(mockDb as any);
  });

  it('should create a review successfully', async () => {
    const mockSession = {
      user: {
        id: 'student123',
        name: 'John Doe',
        role: 'student'
      }
    };

    const requestBody = {
      sessionId: 'session123',
      rating: 5,
      comment: 'Excellent mentor! Very helpful and knowledgeable.',
      wouldRecommend: true,
      skills: ['Problem Solving', 'Technical Skills']
    };

    const mockSessionRecord = {
      _id: new ObjectId('session123'),
      studentId: new ObjectId('student123'),
      mentorId: new ObjectId('mentor123'),
      subject: 'Mathematics',
      status: 'completed'
    };

    mockGetServerSession.mockResolvedValue(mockSession as any);
    mockSessions.findOne.mockResolvedValue(mockSessionRecord);
    mockReviews.findOne.mockResolvedValue(null); // No existing review
    mockReviews.insertOne.mockResolvedValue({ 
      insertedId: new ObjectId('review123'),
      acknowledged: true 
    });

    // Mock the find operation for rating calculation
    mockReviews.find.mockReturnValue({
      toArray: jest.fn().mockResolvedValue([
        { rating: 5 },
        { rating: 4 },
        { rating: 5 }
      ])
    });

    const request = new NextRequest('http://localhost:3000/api/reviews', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await createReviewHandler(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.reviewId).toBe('review123');
    expect(mockReviews.insertOne).toHaveBeenCalled();
    expect(mockNotifications.insertOne).toHaveBeenCalled();
    expect(mockMentorProfiles.updateOne).toHaveBeenCalled();
  });

  it('should return error if user is not authenticated', async () => {
    mockGetServerSession.mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/reviews', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await createReviewHandler(request);
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

    const request = new NextRequest('http://localhost:3000/api/reviews', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await createReviewHandler(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Access denied');
  });

  it('should return error if session not found or not completed', async () => {
    const mockSession = {
      user: {
        id: 'student123',
        role: 'student'
      }
    };

    const requestBody = {
      sessionId: 'session123',
      rating: 5,
      comment: 'Great session!',
      wouldRecommend: true
    };

    mockGetServerSession.mockResolvedValue(mockSession as any);
    mockSessions.findOne.mockResolvedValue(null); // Session not found

    const request = new NextRequest('http://localhost:3000/api/reviews', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await createReviewHandler(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Session not found, not completed, or access denied');
  });

  it('should return error if review already exists', async () => {
    const mockSession = {
      user: {
        id: 'student123',
        role: 'student'
      }
    };

    const requestBody = {
      sessionId: 'session123',
      rating: 5,
      comment: 'Great session!',
      wouldRecommend: true
    };

    const mockSessionRecord = {
      _id: new ObjectId('session123'),
      studentId: new ObjectId('student123'),
      mentorId: new ObjectId('mentor123'),
      status: 'completed'
    };

    const existingReview = {
      _id: new ObjectId('review123'),
      sessionId: new ObjectId('session123'),
      studentId: new ObjectId('student123')
    };

    mockGetServerSession.mockResolvedValue(mockSession as any);
    mockSessions.findOne.mockResolvedValue(mockSessionRecord);
    mockReviews.findOne.mockResolvedValue(existingReview);

    const request = new NextRequest('http://localhost:3000/api/reviews', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await createReviewHandler(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBe('Review already exists for this session');
  });

  it('should validate input data', async () => {
    const mockSession = {
      user: {
        id: 'student123',
        role: 'student'
      }
    };

    const requestBody = {
      sessionId: '', // Invalid
      rating: 0, // Invalid (should be 1-5)
      comment: '', // Invalid (too short)
      wouldRecommend: 'yes' // Invalid (should be boolean)
    };

    mockGetServerSession.mockResolvedValue(mockSession as any);

    const request = new NextRequest('http://localhost:3000/api/reviews', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await createReviewHandler(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
    expect(data.details).toBeDefined();
  });
});

describe('/api/reviews GET', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetDatabase.mockResolvedValue(mockDb as any);
  });

  it('should get reviews for a mentor', async () => {
    const mockSession = {
      user: {
        id: 'user123',
        role: 'student'
      }
    };

    const mockReviewsData = [
      {
        _id: new ObjectId('review123'),
        rating: 5,
        comment: 'Excellent mentor!',
        wouldRecommend: true,
        skills: ['Problem Solving'],
        createdAt: new Date(),
        student: {
          name: 'John Doe',
          avatar: null
        },
        mentor: {
          name: 'Jane Smith',
          avatar: null
        },
        session: {
          subject: 'Mathematics',
          duration: '1hour',
          sessionDate: new Date()
        }
      }
    ];

    mockGetServerSession.mockResolvedValue(mockSession as any);
    mockReviews.aggregate.mockReturnValue({
      toArray: jest.fn().mockResolvedValue(mockReviewsData)
    });
    mockReviews.countDocuments.mockResolvedValue(1);

    const url = new URL('http://localhost:3000/api/reviews?mentorId=mentor123&limit=10&page=1');
    const request = new NextRequest(url);

    const response = await getReviewsHandler(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.reviews).toHaveLength(1);
    expect(data.reviews[0].id).toBe('review123');
    expect(data.pagination.totalCount).toBe(1);
  });

  it('should get reviews for a specific session', async () => {
    const mockSession = {
      user: {
        id: 'student123',
        role: 'student'
      }
    };

    const mockSessionRecord = {
      _id: new ObjectId('session123'),
      studentId: new ObjectId('student123'),
      mentorId: new ObjectId('mentor123')
    };

    const mockReviewsData = [
      {
        _id: new ObjectId('review123'),
        rating: 4,
        comment: 'Good session!',
        wouldRecommend: true,
        createdAt: new Date(),
        student: {
          name: 'John Doe'
        },
        mentor: {
          name: 'Jane Smith'
        },
        session: {
          subject: 'Physics'
        }
      }
    ];

    mockGetServerSession.mockResolvedValue(mockSession as any);
    mockSessions.findOne.mockResolvedValue(mockSessionRecord);
    mockReviews.aggregate.mockReturnValue({
      toArray: jest.fn().mockResolvedValue(mockReviewsData)
    });
    mockReviews.countDocuments.mockResolvedValue(1);

    const url = new URL('http://localhost:3000/api/reviews?sessionId=session123');
    const request = new NextRequest(url);

    const response = await getReviewsHandler(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.reviews).toHaveLength(1);
  });

  it('should return error if user is not authenticated', async () => {
    mockGetServerSession.mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/reviews');

    const response = await getReviewsHandler(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return error for unauthorized access to student reviews', async () => {
    const mockSession = {
      user: {
        id: 'other_user',
        role: 'student'
      }
    };

    mockGetServerSession.mockResolvedValue(mockSession as any);

    const url = new URL('http://localhost:3000/api/reviews?studentId=student123');
    const request = new NextRequest(url);

    const response = await getReviewsHandler(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Access denied');
  });

  it('should handle pagination correctly', async () => {
    const mockSession = {
      user: {
        id: 'user123',
        role: 'student'
      }
    };

    mockGetServerSession.mockResolvedValue(mockSession as any);
    mockReviews.aggregate.mockReturnValue({
      toArray: jest.fn().mockResolvedValue([])
    });
    mockReviews.countDocuments.mockResolvedValue(25);

    const url = new URL('http://localhost:3000/api/reviews?mentorId=mentor123&limit=10&page=3');
    const request = new NextRequest(url);

    const response = await getReviewsHandler(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.pagination.currentPage).toBe(3);
    expect(data.pagination.totalPages).toBe(3);
    expect(data.pagination.totalCount).toBe(25);
    expect(data.pagination.hasNextPage).toBe(false);
    expect(data.pagination.hasPreviousPage).toBe(true);
  });
});