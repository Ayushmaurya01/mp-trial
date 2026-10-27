const Subject = require('../models/Subject');
const Unit = require('../models/Unit');
const Topic = require('../models/Topic');
const Attendance = require('../models/Attendance');
const Assignment = require('../models/Assignment');
const Lecture = require('../models/Lecture');

const seedUserData = async (studentId) => {
  // Clear existing student academic records if any
  await Subject.deleteMany({ student: studentId });
  await Unit.deleteMany({ student: studentId });
  await Topic.deleteMany({ student: studentId });
  await Attendance.deleteMany({ student: studentId });
  await Assignment.deleteMany({ student: studentId });
  await Lecture.deleteMany({ student: studentId });

  // Sample Subjects
  const sampleSubjects = [
    {
      name: 'Data Structures',
      code: 'CS301',
      faculty: 'Dr. Alan Turing',
      semester: 'Semester 5',
      description: 'Fundamental data structures including arrays, lists, stacks, queues, trees, and graphs.',
    },
    {
      name: 'Database Management Systems',
      code: 'CS302',
      faculty: 'Prof. Edgar Codd',
      semester: 'Semester 5',
      description: 'Relational model, SQL, normalization, transaction processing, and indexing.',
    },
    {
      name: 'Computer Networks',
      code: 'CS303',
      faculty: 'Dr. Vint Cerf',
      semester: 'Semester 5',
      description: 'OSI Model, TCP/IP protocol suite, network security, and routing algorithms.',
    },
    {
      name: 'Operating Systems',
      code: 'CS304',
      faculty: 'Prof. Linus Torvalds',
      semester: 'Semester 5',
      description: 'Process management, concurrency, memory management, and file systems.',
    },
  ];

  for (const subData of sampleSubjects) {
    const subject = await Subject.create({
      ...subData,
      student: studentId,
    });

    if (subject.name === 'Data Structures') {
      // Create Units
      const u1 = await Unit.create({
        subject: subject._id,
        student: studentId,
        unitNumber: 1,
        title: 'Introduction & Complexity Analysis',
        isCompleted: true,
      });
      const u2 = await Unit.create({
        subject: subject._id,
        student: studentId,
        unitNumber: 2,
        title: 'Arrays and Linked Lists',
        isCompleted: false,
      });
      const u3 = await Unit.create({
        subject: subject._id,
        student: studentId,
        unitNumber: 3,
        title: 'Stacks and Queues',
        isCompleted: false,
      });

      // Topics for Unit 1
      await Topic.create({ unit: u1._id, subject: subject._id, student: studentId, title: 'Algorithm Analysis', isCompleted: true });
      await Topic.create({ unit: u1._id, subject: subject._id, student: studentId, title: 'Asymptotic Notations', isCompleted: true });

      // Topics for Unit 2
      await Topic.create({ unit: u2._id, subject: subject._id, student: studentId, title: 'Singly Linked List', isCompleted: true });
      await Topic.create({ unit: u2._id, subject: subject._id, student: studentId, title: 'Doubly Linked List', isCompleted: true });
      await Topic.create({ unit: u2._id, subject: subject._id, student: studentId, title: 'Circular Linked List', isCompleted: false });
      await Topic.create({ unit: u2._id, subject: subject._id, student: studentId, title: 'Polynomial Representation', isCompleted: false });

      // Topics for Unit 3
      await Topic.create({ unit: u3._id, subject: subject._id, student: studentId, title: 'Stack Operations & Infix to Postfix', isCompleted: false });
      await Topic.create({ unit: u3._id, subject: subject._id, student: studentId, title: 'Queue & Circular Queue', isCompleted: false });

      // Attendance
      await Attendance.create({
        subject: subject._id,
        student: studentId,
        totalLectures: 50,
        presentLectures: 42,
        absentLectures: 8,
        minRequiredPercentage: 75,
      });

      // Assignments
      await Assignment.create({
        subject: subject._id,
        student: studentId,
        title: 'Implementation of Linked List Operations',
        description: 'Write C++/Java program for insertion, deletion, and reversal of singly linked list.',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        status: 'Completed',
      });
      await Assignment.create({
        subject: subject._id,
        student: studentId,
        title: 'Expression Evaluation using Stacks',
        description: 'Implement infix to postfix conversion and postfix evaluation.',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        status: 'Pending',
      });

      // Lectures
      await Lecture.create({
        subject: subject._id,
        student: studentId,
        lectureDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        topicCovered: 'Doubly Linked List Insertion & Deletion',
        status: 'Completed',
        notes: 'Covered node creation and pointer manipulation.',
      });
    } else if (subject.name === 'Database Management Systems') {
      const u1 = await Unit.create({
        subject: subject._id,
        student: studentId,
        unitNumber: 1,
        title: 'ER Modeling & Relational Algebra',
        isCompleted: true,
      });
      await Topic.create({ unit: u1._id, subject: subject._id, student: studentId, title: 'ER Diagrams', isCompleted: true });
      await Topic.create({ unit: u1._id, subject: subject._id, student: studentId, title: 'Relational Algebra Operators', isCompleted: true });

      await Attendance.create({
        subject: subject._id,
        student: studentId,
        totalLectures: 40,
        presentLectures: 36,
        absentLectures: 4,
        minRequiredPercentage: 75,
      });

      await Assignment.create({
        subject: subject._id,
        student: studentId,
        title: 'SQL Join & Group By Queries',
        description: 'Solve 15 SQL query exercises on complex joins.',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'Pending',
      });
    } else if (subject.name === 'Computer Networks') {
      const u1 = await Unit.create({
        subject: subject._id,
        student: subject.student,
        unitNumber: 1,
        title: 'Network Layers & Architecture',
        isCompleted: false,
      });
      await Topic.create({ unit: u1._id, subject: subject._id, student: studentId, title: 'OSI 7-Layer Model', isCompleted: true });
      await Topic.create({ unit: u1._id, subject: subject._id, student: studentId, title: 'TCP/IP vs OSI', isCompleted: false });

      // Low attendance example
      await Attendance.create({
        subject: subject._id,
        student: studentId,
        totalLectures: 30,
        presentLectures: 20,
        absentLectures: 10,
        minRequiredPercentage: 75,
      });
    } else {
      // Operating Systems
      const u1 = await Unit.create({
        subject: subject._id,
        student: studentId,
        unitNumber: 1,
        title: 'Process Management & Scheduling',
        isCompleted: true,
      });
      await Topic.create({ unit: u1._id, subject: subject._id, student: studentId, title: 'CPU Scheduling Algorithms', isCompleted: true });

      await Attendance.create({
        subject: subject._id,
        student: studentId,
        totalLectures: 35,
        presentLectures: 30,
        absentLectures: 5,
        minRequiredPercentage: 75,
      });
    }
  }
};

module.exports = seedUserData;
