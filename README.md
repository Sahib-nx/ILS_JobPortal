Change you apply for job and use this =>

export const ApplyForJob = async (req, res) => {
  try {
    const { jobId, applicantId } = req.params;

    // Validation
    if (!applicantId) {
      return res.status(400).json({ error: 'Applicant ID is required' });
    }

    // Find the job and populate the job poster details
    const job = await Job.findById(jobId).populate('postedBy', 'name email');
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Find the applicant details
    const applicant = await User.findById(applicantId);
    if (!applicant) {
      return res.status(404).json({ error: 'Applicant not found' });
    }

    // Check if user already applied
    const hasApplied = job.applicants.some(app => app.applicantId.toString() === applicantId);
    if (hasApplied) {
      return res.status(400).json({ error: 'You have already applied for this job' });
    }

    // Get resume URL from uploaded document (if any)
    let resumeUrl = '';
    if (req.file) {
      resumeUrl = req.file.path; // Cloudinary URL for the document
      console.log('Resume uploaded successfully:', resumeUrl);
    } else {
      console.log('No file received - application submitted without resume');
    }

    // Add applicant to job
    job.applicants.push({
      applicantId: applicantId,
      appliedAt: new Date(),
      resume: resumeUrl,
      status: 'pending'
    });

    // Save the job
    await job.save();

    // Get the application ID for response
    const applicationId = job.applicants[job.applicants.length - 1]._id;

    // Send confirmation email to the applicant (non-blocking)
    setImmediate(async () => {
      try {
        const applicantEmailSubject = `Application Confirmation: ${job.title}`;
        const applicantEmailBody = `
          <h2>Application Submitted Successfully!</h2>
          <p>Dear ${applicant.name},</p>
          <p>Thank you for applying to the position: <strong>${job.title}</strong></p>
          <p><strong>Job Details:</strong></p>
          <ul>
            <li>Location: ${job.location}</li>
            <li>Job Type: ${job.jobType}</li>
            <li>Posted by: ${job.postedBy.name}</li>
          </ul>
          <p>We have received your application and will review it shortly. You will be contacted if your profile matches our requirements.</p>
          <br>
          <p>Best regards,<br>Job Portal Team</p>
        `;

        await sendEmail(applicant.email, applicantEmailSubject, applicantEmailBody);
        console.log('Confirmation email sent successfully');
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
      }
    });

    // Send single success response
    res.status(200).json({
      message: 'Application submitted successfully',
      applicationId: applicationId,
      resumeUrl: resumeUrl || null,
    });

  } catch (error) {
    console.error('Error applying for job:', error);
    
    // Handle specific multer errors
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Document file size too large. Maximum 10MB allowed.' });
    }
    
    if (error.message && error.message.includes('Only PDF, DOC, and DOCX')) {
      return res.status(400).json({ error: error.message });
    }

    // Mongoose validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Invalid data provided' });
    }

    // MongoDB duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Duplicate application detected' });
    }

    // Generic error response - ALWAYS return JSON
    res.status(500).json({ error: 'Internal Server Error' });
  }
};




2.// Middleware to verify JWT token

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
    req.user = user;
    next();
  });
};




3. GET /verify - Verify token and get user data

router.get('/verify', authenticateToken, async (req, res) => {
  try {
    // Get fresh user data from database
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      message: 'Token is valid',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});



