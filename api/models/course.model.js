import { model, Schema } from 'mongoose';

const lectureSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Lecture title is required'],
      minlength: [5, 'Lecture title must be at least 5 characters'],
      maxlength: [100, 'Lecture title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Lecture description is required'],
      minlength: [10, 'Lecture description must be at least 10 characters'],
    },
    lecture: {
      public_id: {
        type: String,
        required: [true, 'Lecture public ID is required'],
      },
      secure_url: {
        type: String,
        required: [true, 'Lecture secure URL is required'],
      },
    },
  },
  { _id: false } // Prevents automatic creation of _id for nested schema
);

const courseSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      minlength: [8, 'Title must be at least 8 characters'],
      maxlength: [50, 'Title cannot be more than 50 characters'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      minlength: [20, 'Description must be at least 20 characters long'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    lectures: {
      type: [lectureSchema],
      default: [],
    },
    thumbnail: {
      public_id: {
        type: String,
      },
      secure_url: {
        type: String,
      },
    },
    numberOfLectures: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: String,
      required: [true, 'Course instructor name is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to update the number of lectures
courseSchema.pre('save', function (next) {
  this.numberOfLectures = this.lectures.length;
  next();
});

const Course = model('Course', courseSchema);

export default Course;
