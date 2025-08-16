const mongoose = require('mongoose');
const ProjectSubmission = require('../models/ProjectSubmission');
const CareerRole = require('../models/CareerRole');
const User = require('../models/User');

// Get all submissions with advanced filtering
exports.getAllSubmissions = async (req, res) => {
  try {
    const {
      status,
      careerId,
      mentorId,
      dateFrom,
      dateTo,
      page = 1,
      limit = 20,
      sortBy = 'submittedAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (careerId) filter.careerRole = careerId;
    if (mentorId) filter.mentor = mentorId;
    if (dateFrom || dateTo) {
      filter.submittedAt = {};
      if (dateFrom) filter.submittedAt.$gte = new Date(dateFrom);
      if (dateTo) filter.submittedAt.$lte = new Date(dateTo);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get submissions with populated data
    const rawSubmissions = await ProjectSubmission.find(filter)
      .populate('user', 'name email')
      .populate('careerRole', 'name description')
      .populate('mentor', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Transform submissions to match frontend expectations
    const submissions = rawSubmissions.map(submission => ({
      id: submission._id.toString(),
      user: {
        id: submission.user._id.toString(),
        name: submission.user.name,
        email: submission.user.email
      },
      career: submission.careerRole ? {
        id: submission.careerRole._id.toString(),
        name: submission.careerRole.name,
        description: submission.careerRole.description
      } : null,
      project: {
        id: submission.projectId || 'unknown',
        title: submission.title
      },
      title: submission.title,
      description: submission.description,
      submissionUrl: submission.submissionUrl,
      fileUrl: submission.fileUrl,
      attachments: submission.attachments || [],
      submittedAt: submission.submittedAt,
      status: submission.status,
      mentor: submission.mentor ? {
        id: submission.mentor._id.toString(),
        name: submission.mentor.name,
        email: submission.mentor.email
      } : null,
      feedback: submission.feedback,
      score: submission.score,
      reviewedAt: submission.reviewedAt,
      reviewNotes: submission.reviewNotes,
      timeSpent: submission.timeSpent,
      difficulty: submission.difficulty
    }));

    // Get total count for pagination
    const total = await ProjectSubmission.countDocuments(filter);

    // Get analytics
    const analytics = await getSubmissionsAnalytics(filter);

    res.status(200).json({
      submissions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      analytics
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get submission analytics
async function getSubmissionsAnalytics(filter = {}) {
  const totalSubmissions = await ProjectSubmission.countDocuments(filter);
  const pendingSubmissions = await ProjectSubmission.countDocuments({ ...filter, status: 'pending' });
  const approvedSubmissions = await ProjectSubmission.countDocuments({ ...filter, status: 'approved' });
  const rejectedSubmissions = await ProjectSubmission.countDocuments({ ...filter, status: 'rejected' });

  // Average review time
  const reviewedSubmissions = await ProjectSubmission.find({
    ...filter,
    status: { $in: ['approved', 'rejected'] },
    mentor: { $exists: true }
  });

  let avgReviewTime = 0;
  if (reviewedSubmissions.length > 0) {
    const totalReviewTime = reviewedSubmissions.reduce((acc, sub) => {
      const reviewTime = new Date(sub.updatedAt) - new Date(sub.submittedAt);
      return acc + reviewTime;
    }, 0);
    avgReviewTime = Math.round(totalReviewTime / reviewedSubmissions.length / (1000 * 60 * 60)); // hours
  }

  return {
    total: totalSubmissions,
    pending: pendingSubmissions,
    approved: approvedSubmissions,
    rejected: rejectedSubmissions,
    approvalRate: totalSubmissions > 0 ? (approvedSubmissions / totalSubmissions * 100).toFixed(1) : 0,
    avgReviewTimeHours: avgReviewTime
  };
}

// Get submission by ID with full details
exports.getSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    
    const submission = await ProjectSubmission.findById(id)
      .populate('user', 'name email')
      .populate('careerRole', 'name description')
      .populate('mentor', 'name email');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    res.status(200).json(submission);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Review submission (admin/mentor)
exports.reviewSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, feedback, score } = req.body;

    const submission = await ProjectSubmission.findById(id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Update submission
    submission.status = status || submission.status;
    submission.feedback = feedback || submission.feedback;
    submission.score = score !== undefined ? score : submission.score;
    submission.mentor = req.user.id;
    submission.reviewedAt = new Date();

    await submission.save();

    // Populate user data for response
    await submission.populate('user', 'name email');
    await submission.populate('careerRole', 'name');

    res.status(200).json({
      message: 'Submission reviewed successfully',
      submission
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Bulk review submissions
exports.bulkReviewSubmissions = async (req, res) => {
  try {
    const { submissionIds, status, feedback, score } = req.body;

    if (!submissionIds || !Array.isArray(submissionIds) || submissionIds.length === 0) {
      return res.status(400).json({ message: 'Submission IDs array is required' });
    }

    const updateData = {
      status,
      mentor: req.user.id,
      reviewedAt: new Date()
    };

    if (feedback !== undefined) updateData.feedback = feedback;
    if (score !== undefined) updateData.score = score;

    const result = await ProjectSubmission.updateMany(
      { _id: { $in: submissionIds } },
      updateData
    );

    res.status(200).json({
      message: 'Bulk review completed successfully',
      updatedCount: result.modifiedCount,
      totalRequested: submissionIds.length
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Assign mentor to submission
exports.assignMentor = async (req, res) => {
  try {
    const { id } = req.params;
    const { mentorId } = req.body;

    const submission = await ProjectSubmission.findById(id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Verify mentor exists and has mentor role
    const mentor = await User.findById(mentorId);
    if (!mentor || mentor.role !== 'mentor') {
      return res.status(400).json({ message: 'Invalid mentor ID or user is not a mentor' });
    }

    submission.mentor = mentorId;
    await submission.save();

    await submission.populate('mentor', 'name email');

    res.status(200).json({
      message: 'Mentor assigned successfully',
      submission
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get mentor workload
exports.getMentorWorkload = async (req, res) => {
  try {
    const mentors = await User.find({ role: 'mentor' }, 'name email');
    
    const mentorWorkload = await Promise.all(
      mentors.map(async (mentor) => {
        const pendingSubmissions = await ProjectSubmission.countDocuments({
          mentor: mentor._id,
          status: 'pending'
        });

        const totalSubmissions = await ProjectSubmission.countDocuments({
          mentor: mentor._id
        });

        const avgReviewTime = await ProjectSubmission.aggregate([
          {
            $match: {
              mentor: mentor._id,
              status: { $in: ['approved', 'rejected'] },
              reviewedAt: { $exists: true }
            }
          },
          {
            $group: {
              _id: null,
              avgTime: {
                $avg: {
                  $divide: [
                    { $subtract: ['$reviewedAt', '$submittedAt'] },
                    1000 * 60 * 60 // Convert to hours
                  ]
                }
              }
            }
          }
        ]);

        return {
          mentorId: mentor._id,
          mentorName: mentor.name,
          mentorEmail: mentor.email,
          pendingSubmissions,
          totalSubmissions,
          avgReviewTimeHours: avgReviewTime.length > 0 ? Math.round(avgReviewTime[0].avgTime) : 0
        };
      })
    );

    res.status(200).json(mentorWorkload);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get submissions by career path
exports.getSubmissionsByCareer = async (req, res) => {
  try {
    const { careerId } = req.params;
    const { status } = req.query;

    const filter = { careerRole: careerId };
    if (status) filter.status = status;

    const submissions = await ProjectSubmission.find(filter)
      .populate('user', 'name email')
      .populate('mentor', 'name email')
      .sort({ submittedAt: -1 });

    const analytics = await getSubmissionsAnalytics(filter);

    res.status(200).json({
      submissions,
      analytics
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get submissions by user
exports.getSubmissionsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;

    const filter = { user: userId };
    if (status) filter.status = status;

    const submissions = await ProjectSubmission.find(filter)
      .populate('careerRole', 'name')
      .populate('mentor', 'name email')
      .sort({ submittedAt: -1 });

    const analytics = await getSubmissionsAnalytics(filter);

    res.status(200).json({
      submissions,
      analytics
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete submission (admin only)
exports.deleteSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await ProjectSubmission.findById(id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    await ProjectSubmission.findByIdAndDelete(id);

    res.status(200).json({
      message: 'Submission deleted successfully'
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
