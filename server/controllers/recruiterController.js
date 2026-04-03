const Job = require('../models/Job');
const Application = require('../models/Application');

exports.getRecruiterAnalytics = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user.id }).select('_id title viewCount isActive createdAt');
    const jobIds = jobs.map((j) => j._id);

    const [totalJobs, totalApplications, statusAgg, topJobsAgg, recentApplicationsAgg] = await Promise.all([
      Job.countDocuments({ postedBy: req.user.id, isActive: true }),
      Application.countDocuments({ job: { $in: jobIds } }),
      Application.aggregate([
        { $match: { job: { $in: jobIds } } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Application.aggregate([
        { $match: { job: { $in: jobIds } } },
        {
          $group: {
            _id: '$job',
            applicationCount: { $sum: 1 },
            priorityCount: { $sum: { $cond: ['$isPriority', 1, 0] } },
            shortlistedCount: { $sum: { $cond: [{ $eq: ['$status', 'shortlisted'] }, 1, 0] } },
            hiredCount: { $sum: { $cond: [{ $eq: ['$status', 'hired'] }, 1, 0] } }
          }
        }
      ]),
      Application.aggregate([
        { $match: { job: { $in: jobIds } } },
        {
          $group: {
            _id: {
              year: { $year: '$appliedAt' },
              month: { $month: '$appliedAt' },
              day: { $dayOfMonth: '$appliedAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ])
    ]);

    const statusMap = statusAgg.reduce((acc, row) => {
      acc[row._id] = row.count;
      return acc;
    }, {});

    const shortlisted = statusMap.shortlisted || 0;
    const hired = statusMap.hired || 0;
    const rejected = statusMap.rejected || 0;
    const underReview = statusMap.under_review || 0;
    const averageApplicationsPerJob = totalJobs > 0 ? Number((totalApplications / totalJobs).toFixed(2)) : 0;
    const jobsById = jobs.reduce((acc, job) => {
      acc[job._id.toString()] = job;
      return acc;
    }, {});

    const topJobs = topJobsAgg
      .map((row) => {
        const job = jobsById[row._id.toString()];
        return {
          _id: row._id,
          title: job?.title || 'Untitled role',
          isActive: Boolean(job?.isActive),
          viewCount: job?.viewCount || 0,
          applicationCount: row.applicationCount || 0,
          priorityCount: row.priorityCount || 0,
          shortlistedCount: row.shortlistedCount || 0,
          hiredCount: row.hiredCount || 0
        };
      })
      .sort((a, b) => b.applicationCount - a.applicationCount)
      .slice(0, 5);

    const applicationTrend = recentApplicationsAgg.map((row) => ({
      date: `${row._id.year}-${String(row._id.month).padStart(2, '0')}-${String(row._id.day).padStart(2, '0')}`,
      count: row.count
    }));

    res.json({
      success: true,
      data: {
        totalJobs,
        totalApplications,
        shortlisted,
        hired,
        rejected,
        underReview,
        averageApplicationsPerJob,
        topJobs,
        applicationTrend
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
