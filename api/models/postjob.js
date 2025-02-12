const mongoose = require('mongoose');

const postJobSchema = new mongoose.Schema({
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
   }
});

// Create a model for the postJob schema
const PostJob = mongoose.model('PostJob', postJobSchema);

module.exports = PostJob;
