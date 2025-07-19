import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReviewCard from '@/components/reviews/review-card';

// Mock fetch
global.fetch = jest.fn();

const mockReview = {
  id: 'review123',
  rating: 5,
  comment: 'Excellent mentor! Very helpful and patient with explanations.',
  wouldRecommend: true,
  skills: ['Problem Solving', 'Technical Skills'],
  mentorResponse: 'Thank you for the kind words!',
  mentorResponseDate: '2024-01-15T10:00:00.000Z',
  createdAt: '2024-01-10T10:00:00.000Z',
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
    sessionDate: '2024-01-05T10:00:00.000Z'
  }
};

describe('ReviewCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders review information correctly', () => {
    render(<ReviewCard review={mockReview} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Excellent mentor! Very helpful and patient with explanations.')).toBeInTheDocument();
    expect(screen.getByText('Recommends')).toBeInTheDocument();
    expect(screen.getByText('With Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Mathematics')).toBeInTheDocument();
  });

  it('displays correct number of stars', () => {
    render(<ReviewCard review={mockReview} />);

    const stars = screen.getAllByRole('generic').filter(el => 
      el.className.includes('fill-yellow-400')
    );
    expect(stars).toHaveLength(5);
  });

  it('shows skills as badges', () => {
    render(<ReviewCard review={mockReview} />);

    expect(screen.getByText('Problem Solving')).toBeInTheDocument();
    expect(screen.getByText('Technical Skills')).toBeInTheDocument();
  });

  it('displays mentor response when available', () => {
    render(<ReviewCard review={mockReview} />);

    expect(screen.getByText('Thank you for the kind words!')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('responded')).toBeInTheDocument();
  });

  it('shows edit button for mentor response when user is mentor', () => {
    render(
      <ReviewCard 
        review={mockReview} 
        currentUserId="mentor123"
        currentUserRole="mentor"
      />
    );

    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('allows mentor to edit their response', async () => {
    const user = userEvent.setup();
    const mockUpdate = jest.fn();

    render(
      <ReviewCard 
        review={mockReview} 
        currentUserId="mentor123"
        currentUserRole="mentor"
        onUpdate={mockUpdate}
      />
    );

    // Click edit button
    await user.click(screen.getByText('Edit'));

    // Check textarea appears
    const textarea = screen.getByDisplayValue('Thank you for the kind words!');
    expect(textarea).toBeInTheDocument();

    // Edit the response
    await user.clear(textarea);
    await user.type(textarea, 'Updated response!');

    // Mock successful API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });

    // Click save
    await user.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/reviews/review123', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mentorResponse: 'Updated response!'
        }),
      });
    });
  });

  it('allows mentor to add response when none exists', async () => {
    const user = userEvent.setup();
    const reviewWithoutResponse = { ...mockReview, mentorResponse: undefined };

    render(
      <ReviewCard 
        review={reviewWithoutResponse} 
        currentUserId="mentor123"
        currentUserRole="mentor"
      />
    );

    // Click respond button
    await user.click(screen.getByText('Respond to review'));

    // Check textarea appears
    const textarea = screen.getByPlaceholderText('Write a response to this review...');
    expect(textarea).toBeInTheDocument();
  });

  it('shows delete button for student who wrote the review', () => {
    const mockDelete = jest.fn();

    render(
      <ReviewCard 
        review={mockReview} 
        currentUserId="student123"
        currentUserRole="student"
        onDelete={mockDelete}
      />
    );

    expect(screen.getByText('Delete Review')).toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    const mockDelete = jest.fn();

    render(
      <ReviewCard 
        review={mockReview} 
        currentUserId="student123"
        currentUserRole="student"
        onDelete={mockDelete}
      />
    );

    await user.click(screen.getByText('Delete Review'));

    expect(mockDelete).toHaveBeenCalledWith('review123');
  });

  it('displays thumbs down when not recommended', () => {
    const notRecommendedReview = { ...mockReview, wouldRecommend: false };

    render(<ReviewCard review={notRecommendedReview} />);

    expect(screen.getByText("Doesn't recommend")).toBeInTheDocument();
  });

  it('hides session info when showSession is false', () => {
    render(<ReviewCard review={mockReview} showSession={false} />);

    expect(screen.queryByText('With Jane Smith')).not.toBeInTheDocument();
    expect(screen.queryByText('Mathematics')).not.toBeInTheDocument();
  });

  it('shows user initials when no avatar is provided', () => {
    render(<ReviewCard review={mockReview} />);

    expect(screen.getByText('JD')).toBeInTheDocument(); // John Doe initials
  });

  it('handles API error when saving mentor response', async () => {
    const user = userEvent.setup();
    
    render(
      <ReviewCard 
        review={mockReview} 
        currentUserId="mentor123"
        currentUserRole="mentor"
      />
    );

    // Click edit button
    await user.click(screen.getByText('Edit'));

    // Mock API error
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed to save response' })
    });

    // Click save
    await user.click(screen.getByText('Save'));

    // The component should handle the error gracefully
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('validates empty response before saving', async () => {
    const user = userEvent.setup();
    
    render(
      <ReviewCard 
        review={mockReview} 
        currentUserId="mentor123"
        currentUserRole="mentor"
      />
    );

    // Click edit button
    await user.click(screen.getByText('Edit'));

    // Clear the textarea
    const textarea = screen.getByDisplayValue('Thank you for the kind words!');
    await user.clear(textarea);

    // Try to save empty response
    await user.click(screen.getByText('Save'));

    // Should not make API call
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('cancels editing when cancel button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <ReviewCard 
        review={mockReview} 
        currentUserId="mentor123"
        currentUserRole="mentor"
      />
    );

    // Click edit button
    await user.click(screen.getByText('Edit'));

    // Modify text
    const textarea = screen.getByDisplayValue('Thank you for the kind words!');
    await user.clear(textarea);
    await user.type(textarea, 'Different text');

    // Click cancel
    await user.click(screen.getByText('Cancel'));

    // Should restore original text
    expect(screen.getByText('Thank you for the kind words!')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Different text')).not.toBeInTheDocument();
  });
});