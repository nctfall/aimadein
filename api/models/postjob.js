const mongoose = require('mongoose');

const postJobSchema = new mongoose.Schema({
    user:{
           type:mongoose.Schema.Types.ObjectId,
           ref:"User",
           required:true
    },
    jobTitle: {
       type: String,
       required: true,
   },
   jobDescription: {
       type: String,
       required: true,
   },
   skills: [
       {
           type: String,
           required: true,
       }
   ],
   salary: {
       type: Number,
       required: true,
   },
   createdAt: {
       type: Date,
       default: Date.now
   },
   applicants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

// Create a model for the postJob schemas
const PostJob = mongoose.model('PostJob', postJobSchema);

module.exports = PostJob;
