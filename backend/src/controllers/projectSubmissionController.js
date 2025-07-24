const ProjectSubmission = require('../models/ProjectSubmission');
const CareerRole = require('../models/CareerRole');

// User: Submit a project
exports.submitProject = async (req, res) => {
  try {
    const { careerRoleId, stepIndex, projectId, title, description, submissionUrl } = req.body;
    if (!careerRoleId || stepIndex === undefined || !projectId || !title) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    // Find the project definition in the career's roadmap (if available)
    let skills = [];
    const CareerRole = require('../models/CareerRole');
    const career = await CareerRole.findById(careerRoleId);
    if (career && Array.isArray(career.roadmap)) {
      for (const step of career.roadmap) {
        if (step.projects && Array.isArray(step.projects)) {
          const found = step.projects.find(p => p.id === projectId);
          if (found && found.skills) {
            skills = found.skills;
            break;
          }
        }
      }
    }
    let fileUrl = undefined;
    if (req.file) {
      // Save relative path for download endpoint
      fileUrl = `/api/submissions/${req.file.filename}/file`;
    }
    const submission = new ProjectSubmission({
      user: req.user.id,
      careerRole: careerRoleId,
      stepIndex,
      projectId,
      title,
      description,
      submissionUrl,
      fileUrl,
      skills
    });
    await submission.save();
    res.status(201).json(submission);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// User: List their submissions
exports.listUserSubmissions = async (req, res) => {
  try {
    const submissions = await ProjectSubmission.find({ user: req.user.id });
    res.status(200).json(submissions);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// User: Get a specific submission
exports.getSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const submission = await ProjectSubmission.findById(id);
    if (!submission) return res.status(404).json({ message: 'Submission not found.' });
    if (submission.user.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden.' });
    res.status(200).json(submission);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Mentor: List all submissions
exports.listAllSubmissions = async (req, res) => {
  try {
    const submissions = await ProjectSubmission.find({}).populate('user', 'name email');
    res.status(200).json(submissions);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Mentor: Review a submission
exports.reviewSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, feedback, score } = req.body;
    const submission = await ProjectSubmission.findById(id);
    if (!submission) return res.status(404).json({ message: 'Submission not found.' });
    submission.status = status || submission.status;
    submission.feedback = feedback || submission.feedback;
    submission.score = score !== undefined ? score : submission.score;
    submission.mentor = req.user.id;
    await submission.save();
    res.status(200).json(submission);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Download file for a submission
exports.downloadFile = async (req, res) => {
  try {
    const { id } = req.params;
    const submission = await ProjectSubmission.findById(id);
    if (!submission || !submission.fileUrl) {
      return res.status(404).json({ message: 'File not found.' });
    }
    // Extract filename from fileUrl
    const path = require('path');
    const fs = require('fs');
    const filename = submission.fileUrl.split('/')[3];
    const filePath = path.join(__dirname, '../../uploads', filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server.' });
    }
    res.download(filePath, submission.title + path.extname(filePath));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 