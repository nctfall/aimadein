const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
   name:{
       type:String,
       required:true,
   },
   email:{
       type:String,
       required:true,
       unique:true,
   },
   password:{
       type:String,
       required:true,
   },
   verified:{
       type:Boolean,
       default:false
   },
   verificationToken:String,
   profileImage:String,
   userDescription:{
       type:String,
       default:null
   },
   userType: {
    type: String,
    enum: ['company', 'employee'], // Only allows 'company' or 'employee'
    required: true
   },
   connections:[
       {
           type:mongoose.Schema.Types.ObjectId,
           ref:"User"
       }
   ],
   connectionRequests:[
       {
           type:mongoose.Schema.Types.ObjectId,
           ref:"User"
       }
   ],
   sentConnectionRequests:[
       {
           type:mongoose.Schema.Types.ObjectId,
           ref:"User"
       }
   ],
   posts:[
       {
           type:mongoose.Schema.Types.ObjectId,
           //ref:"Post"
           ref: function() {
            return this.userType === 'employee' ? 'Post' : 'PostJob';
        }
        
       }
   ],
   createdAt:{
       type:Date,
       default:Date.now
   },

   address: {
    street: {
        type: String,
        default: null
    },
    city: {
        type: String,
        default: null
    },
    state: {
        type: String,
        default: null
    },
    zipCode: {
        type: String,
        default: null
    },
    country: {
        type: String,
        default: null
    }
},
skills: [
    {
        type: String,
        default: []
    }
],
education: [
    {
        degree: {
            type: String,
            default: null
        },
        institution: {
            type: String,
            default: null
        },
        yearOfGraduation: {
            type: Number,
            default: null
        },
        fieldOfStudy: {
            type: String,
            default: null
        }
    }
],

workExperience: [
    {
        companyName: {
            type: String,
            default: null
        },
        jobTitle: {
            type: String,
            default: null
        },
        startDate: {
            type: Date,
            default: null
        },
        endDate: {
            type: Date,
            default: null
        },
        responsibilities: {
            type: String,
            default: null
        }
    }
]
});

// Add pre-save hook to ensure workExperience and education are only added for employees
userSchema.pre('save', function(next) {
    if (this.userType === 'employee') {
        if (!this.education || !Array.isArray(this.education)) {
            this.education = [];
        }
        if (!this.workExperience || !Array.isArray(this.workExperience)) {
            this.workExperience = [];
        }
    } else {
        // Ensure the education and workExperience fields are empty for non-employees
        this.education = [];
        this.workExperience = [];
    }
    next();
 });

const User = mongoose.model("User",userSchema);

module.exports = User;