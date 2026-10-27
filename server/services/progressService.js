const Subject = require('../models/Subject');
const Unit = require('../models/Unit');
const Topic = require('../models/Topic');
const Attendance = require('../models/Attendance');
const Assignment = require('../models/Assignment');
const Lecture = require('../models/Lecture');

/**
 * Calculates academic metrics for a single subject belonging to a student.
 */
const calculateSubjectProgress = async (studentId, subjectId) => {
  const subject = await Subject.findOne({ _id: subjectId, student: studentId });
  if (!subject) return null;

  // Fetch units & topics
  const units = await Unit.find({ subject: subjectId, student: studentId });
  const totalUnits = units.length;
  const completedUnits = units.filter((u) => u.isCompleted).length;

  const topics = await Topic.find({ subject: subjectId, student: studentId });
  const totalTopics = topics.length;
  const completedTopics = topics.filter((t) => t.isCompleted).length;

  // Fetch attendance
  const attendanceRecord = await Attendance.findOne({
    subject: subjectId,
    student: studentId,
  });

  const totalLectures = attendanceRecord ? attendanceRecord.totalLectures : 0;
  const presentLectures = attendanceRecord ? attendanceRecord.presentLectures : 0;
  const absentLectures = attendanceRecord ? attendanceRecord.absentLectures : 0;
  const minRequiredPercentage = attendanceRecord
    ? attendanceRecord.minRequiredPercentage
    : 75;

  const attendancePct =
    totalLectures > 0
      ? Math.round((presentLectures / totalLectures) * 1000) / 10
      : 0;

  // Fetch assignments
  const assignments = await Assignment.find({
    subject: subjectId,
    student: studentId,
  });
  const totalAssignments = assignments.length;
  const completedAssignments = assignments.filter(
    (a) => a.status === 'Completed'
  ).length;
  const pendingAssignments = totalAssignments - completedAssignments;

  const assignmentPct =
    totalAssignments > 0
      ? Math.round((completedAssignments / totalAssignments) * 1000) / 10
      : 0;

  const topicPct =
    totalTopics > 0
      ? Math.round((completedTopics / totalTopics) * 1000) / 10
      : 0;

  const unitPct =
    totalUnits > 0
      ? Math.round((completedUnits / totalUnits) * 1000) / 10
      : 0;

  // Subject overall progress formula: 40% Topic completion + 30% Attendance + 30% Assignment completion
  let progressScore = 0;
  let activeFactors = 0;

  if (totalTopics > 0) {
    progressScore += topicPct * 0.4;
    activeFactors += 0.4;
  }
  if (totalLectures > 0) {
    progressScore += attendancePct * 0.3;
    activeFactors += 0.3;
  }
  if (totalAssignments > 0) {
    progressScore += assignmentPct * 0.3;
    activeFactors += 0.3;
  }

  // Normalize if some components don't exist yet
  const normalizedProgress =
    activeFactors > 0 ? Math.round((progressScore / activeFactors) * 10) / 10 : 0;

  return {
    subject: {
      _id: subject._id,
      name: subject.name,
      code: subject.code,
      faculty: subject.faculty,
      semester: subject.semester,
    },
    units: {
      total: totalUnits,
      completed: completedUnits,
      percentage: unitPct,
    },
    topics: {
      total: totalTopics,
      completed: completedTopics,
      percentage: topicPct,
    },
    attendance: {
      totalLectures,
      presentLectures,
      absentLectures,
      percentage: attendancePct,
      minRequiredPercentage,
      isLowAttendance: totalLectures > 0 && attendancePct < minRequiredPercentage,
    },
    assignments: {
      total: totalAssignments,
      completed: completedAssignments,
      pending: pendingAssignments,
      percentage: assignmentPct,
    },
    overallSubjectProgress: normalizedProgress,
  };
};

/**
 * Calculates student-wide aggregated progress across all subjects.
 */
const calculateStudentOverallProgress = async (studentId) => {
  const subjects = await Subject.find({ student: studentId }).sort({ createdAt: -1 });

  if (subjects.length === 0) {
    return {
      overallAcademicProgress: 0,
      averageAttendance: 0,
      totalSubjects: 0,
      totalUnits: 0,
      completedUnits: 0,
      totalTopics: 0,
      completedTopics: 0,
      totalAssignments: 0,
      completedAssignments: 0,
      pendingAssignments: 0,
      lowAttendanceSubjectsCount: 0,
      subjectBreakdown: [],
      recentActivities: [],
    };
  }

  let totalSubjectProgressSum = 0;
  let totalLecturesSum = 0;
  let totalPresentLecturesSum = 0;
  let totalUnitsSum = 0;
  let completedUnitsSum = 0;
  let totalTopicsSum = 0;
  let completedTopicsSum = 0;
  let totalAssignmentsSum = 0;
  let completedAssignmentsSum = 0;
  let lowAttendanceSubjectsCount = 0;

  const subjectBreakdown = [];

  for (const subj of subjects) {
    const detail = await calculateSubjectProgress(studentId, subj._id);
    if (detail) {
      subjectBreakdown.push(detail);

      totalSubjectProgressSum += detail.overallSubjectProgress;
      totalLecturesSum += detail.attendance.totalLectures;
      totalPresentLecturesSum += detail.attendance.presentLectures;
      totalUnitsSum += detail.units.total;
      completedUnitsSum += detail.units.completed;
      totalTopicsSum += detail.topics.total;
      completedTopicsSum += detail.topics.completed;
      totalAssignmentsSum += detail.assignments.total;
      completedAssignmentsSum += detail.assignments.completed;

      if (detail.attendance.isLowAttendance) {
        lowAttendanceSubjectsCount++;
      }
    }
  }

  const overallAcademicProgress =
    subjects.length > 0
      ? Math.round((totalSubjectProgressSum / subjects.length) * 10) / 10
      : 0;

  const averageAttendance =
    totalLecturesSum > 0
      ? Math.round((totalPresentLecturesSum / totalLecturesSum) * 1000) / 10
      : 0;

  // Fetch recent lectures and assignments for quick activity feed
  const recentLectures = await Lecture.find({ student: studentId })
    .populate('subject', 'name code')
    .sort({ lectureDate: -1 })
    .limit(5);

  const recentAssignments = await Assignment.find({ student: studentId })
    .populate('subject', 'name code')
    .sort({ updatedAt: -1 })
    .limit(5);

  // Combine and format recent activity
  const recentActivities = [
    ...recentLectures.map((l) => ({
      id: l._id,
      type: 'Lecture',
      title: `${l.subject ? l.subject.name : 'Subject'} - ${l.topicCovered}`,
      subtitle: `Status: ${l.status}`,
      date: l.lectureDate,
    })),
    ...recentAssignments.map((a) => ({
      id: a._id,
      type: 'Assignment',
      title: `${a.subject ? a.subject.name : 'Subject'} - ${a.title}`,
      subtitle: `Status: ${a.status} (Due: ${new Date(a.dueDate).toLocaleDateString()})`,
      date: a.updatedAt,
    })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return {
    overallAcademicProgress,
    averageAttendance,
    totalSubjects: subjects.length,
    totalUnits: totalUnitsSum,
    completedUnits: completedUnitsSum,
    totalTopics: totalTopicsSum,
    completedTopics: completedTopicsSum,
    totalAssignments: totalAssignmentsSum,
    completedAssignments: completedAssignmentsSum,
    pendingAssignments: totalAssignmentsSum - completedAssignmentsSum,
    lowAttendanceSubjectsCount,
    subjectBreakdown,
    recentActivities,
  };
};

module.exports = {
  calculateSubjectProgress,
  calculateStudentOverallProgress,
};
