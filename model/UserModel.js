/**
 * User Model for communicate users collection in Database
 */

'use strict'
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bCrypt = require('bcrypt-nodejs'),
    uuid = require('node-uuid'),
    cities = require('cities');

/**
 * Global Configuration for the user schema
 * @type {{ES_INDEX: string}}
 */
GLOBAL.UserConfig = {
    ES_INDEX: "idx_usr"
};
/**
 * Date Schema
 */
var DateObject = {
    year: {
        type: Number,
        trim: true,
        default: 0
    },
    month: {
        type: Number,
        trim: true,
        default: 0
    },
    date: {
        type: Number,
        trim: true,
        default: 0
    }
};
/**
 * Education information
 */
var EducationSchema = new Schema({
    school: {
        type: String,
        trim: true,
        default: null
    },
    date_attended_from: {
        type: String,
        trim: true,
        default: null
    },
    date_attended_to: {
        type: String,
        trim: true,
        default: null
    },
    degree: {
        type: String,
        trim: true,
        default: null
    },
    grade: {
        type: String,
        trim: true,
        default: null
    },
    activities_societies: {
        type: String,
        trim: true,
        default: null
    },
    description: {
        type: String,
        trim: true,
        default: null
    }
});

/**
 * WorkingExperience Schema
 */
var WorkingExperienceSchema = new Schema({
    company_name: {
        type: String,
        trim: true,
        default: null
    },
    title: {
        type: String,
        trim: true,
        default: null
    },
    location: {
        type: String,
        trim: true,
        default: null
    },
    start_date: DateObject,
    left_date: DateObject,
    description: {
        type: String,
        trim: true,
        default: null
    },
    is_current_work_place: {
        type: Boolean,
        trim: true,
        default: true,
    }
});

/**
 * User Basic information
 */
var UserSchema = new Schema({
    first_name: {
        type: String,
        trim: true,

    },
    last_name: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        unique: "Email should be unique",
        trim: true
    },
    user_name: {
        type: String,
        unique: "Username should be unique",
        trim: true
    },
    password: {
        type: String,
        trim: true
    },
    salt: {
        type: String
    },
    status: {
        type: Number,
        default: 1 // 1 - COMPLETED CREATE YOUR ACCOUNT | 2 - COMPLETED CHOOSE YOUR SECRETARY | 3 - COMPLETED GENERAL INFORMATION
    },
    secretary: {
        type: Schema.ObjectId,
        ref: 'Secretary',
        default: null
    },
    country: {
        type: String,
        trim: true,
        default: null
    },
    dob: {
        type: String,
        trim: true,
        default: null
    },
    zip_code: {
        type: String,
        trim: true,
        default: null
    },

    introduction: {
        type: String,
        trim: true,
        default: null
    },

    education_details: [EducationSchema],

    skills: [{
        skill_id: {
            type: Schema.ObjectId,
            ref: 'Skill',
            default: null,
        },
        is_day_to_day_comfort: 0
    }],

    working_experiences: [WorkingExperienceSchema],

    /* For reset password */
    resetPasswordToken: {
        type: String,
        trim: true,
        default: null
    },
    resetPasswordExpires: {
        type: Date,
        default: null
    },

    onlineMode: {type: Number, required: true},

    settings: {
        background: {
            type: String,
            trim: true,
            default: ''
        },
        sounds: {
            type: Boolean,
            default: false
        },
        weather_format: {
            type: String,
            trim: true,
            default: 'f'
        },
        clock_format: {
            type: Number,
            default: 12
        },

        widgets: {
            date_and_time: {type: Boolean, default: true},
            daily_quotes: {type: Boolean, default: true},
            weather: {type: Boolean, default: true},
            daily_interest: {type: Boolean, default: true},
            countdown: {type: Boolean, default: false},
            feedback: {type: Boolean, default: false},

            countdown_event: {type: String, trim: true, default: ''},
            countdown_date: {type: Date, default: Date.now},

            daily_interest_text: {type: String, trim: true, default: ''},
        }
    },

    created_at: {
        type: Date
    },

    updated_at: {
        type: Date
    }

}, {collection: "users"});


var createSalt = function () {
    return bCrypt.genSaltSync(10);
};

var createHash = function (salt, password) {
    return bCrypt.hashSync(password, salt, null);
};

UserSchema.pre('save', function (next) {
    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

/**
 * Create User
 */
UserSchema.statics.create = function (UserData, callBack) {
    var _this = this;

    var newUser = new this();
    newUser.first_name = UserData.first_name;
    newUser.last_name = UserData.last_name;
    newUser.email = UserData.email;
    newUser.salt = createSalt();
    newUser.password = createHash(newUser.salt, UserData.password);
    newUser.status = UserData.status;
    newUser.secretary = UserData.secretary;
    newUser.user_name = UserData.user_name;
    newUser.onlineMode = _this.modes.ONLINE;

    newUser.save(function (err, resultSet) {

        if (!err) {
            callBack({
                status: 200,
                user: {
                    id: resultSet._id,
                    token: uuid.v1() + resultSet._id,
                    first_name: resultSet.first_name,
                    last_name: resultSet.last_name,
                    email: resultSet.email,
                    status: resultSet.status,
                    user_name: resultSet.user_name,
                    settings: resultSet.settings
                }

            });
        } else {
            console.log("Server Error --------")
            console.log(err)
            callBack({status: 400, error: err});
        }
    });
};

/*
 * Get User by user_name
 */
UserSchema.statics.findByUserName = function (user_name, callBack) {
    var _this = this;

    _this.findOne({
        user_name: user_name
    }, function (err, resultSet) {
        if (!err) {
            callBack({
                status: 200,
                user: resultSet
            });
        } else {
            console.log("Server Error --------")
            callBack({status: 400, error: err});
        }
    });
}

/**
 * Get User By Email ID
 */
UserSchema.statics.findByEmail = function (email, callBack) {
    var _this = this;

    _this.findOne({
        email: email
    }, function (err, resultSet) {
        if (!err) {
            callBack({
                status: 200,
                user: resultSet

            });
        } else {
            console.log("Server Error --------")
            callBack({status: 400, error: err});
        }
    });
};

/**
 * Get User By ID
 */
UserSchema.statics.findById = function (id, callBack) {
    var _this = this;

    _this.findOne({
        _id: id
    }, function (err, resultSet) {
        if (!err) {
            callBack({
                status: 200,
                user: resultSet
            });
        } else {
            console.log("Server Error --------")
            callBack({status: 400, error: err});
        }
    });
};

/**
 * Find User according to the criteria
 * @param criteria
 * @param callBack
 */
UserSchema.statics.findUser = function (criteria, callBack) {
    var _this = this;

    _this.findOne(criteria, function (err, resultSet) {
        if (!err) {
            callBack({
                status: 200,
                user: resultSet

            });
        } else {
            console.log("Server Error --------")
            callBack({status: 400, error: err});
        }
    });
};
/**
 * Add Secretary for the user
 */
UserSchema.statics.addSecretary = function (userId, secretaryId, callBack) {

    var _this = this;
    _this.update({_id: userId},
        {
            $set: {
                secretary: secretaryId,
                status: 2
            }
        }, function (err, resultSet) {

            if (!err) {
                callBack({
                    status: 200
                });
            } else {
                console.log("Server Error --------")
                callBack({status: 400, error: err});
            }
        });

};

/**
 * Update User profile based on the criterais
 * @param userId
 * @param data
 * @param callBack
 */
UserSchema.statics.saveUpdates = function (userId, data, callBack) {
    var _this = this;

    _this.findByIdAndUpdate({_id: userId},
        {$set: data}, {'new': true}, function (err, resultSet) {

            if (!err) {
                callBack({
                    status: 200,
                    user: resultSet
                });
            } else {
                console.log("Server Error --------")
                callBack({status: 400, error: err, user: resultSet});
            }
        });
};

/**
 * Get Connection Users based on the logged user
 * @param userId
 * @param criteria
 * @param callBack
 */
UserSchema.statics.getConnectionUsers = function (criteria, callBack) {

    var _async = require('async'),
        Connection = require('mongoose').model('Connection'),
        _this = this;

    _async.waterfall([
        function getUsersConnections(callBack) {

            Connection.getFriends(criteria.user_id, criteria.status, function (myFriends) {

                callBack(null, myFriends.friends)

            });
        },
        function getAllUsers(myFriends, callBack) {

            _this.getAllUsers(criteria.country, criteria.user_id, function (resultSet) {
                callBack(null, {
                    total_result: resultSet.total_result,
                    users: resultSet.users,
                    my_friends: myFriends
                })
            })
        },
        function mergeConnection(connections, callBack) {
            var _my_friends = connections.my_friends,
                _formattedFriendList = [],
                _allUsers = connections.users;


            for (var i = 0; i < _allUsers.length; i++) {
                var _c_users = {},
                    _my_friend = _my_friends[_allUsers[i].user_id.toString()];
                _allUsers[i].connection_status = 0;


                if (typeof _my_friend != 'undefined') {
                    _allUsers[i].connection_status = _my_friend.status;
                }
                _formattedFriendList.push(_allUsers[i]);
            }
            callBack(null, {
                total_result: connections.total_result,
                friends: _formattedFriendList
            })
        }


    ], function (err, resultSet) {

        if (!err) {
            callBack(resultSet)
        } else {
            console.log("LOOP ERROR")
            console.log(err)
        }

    });

};


/**
 * Add Education Details to a user
 * @param userId
 * @param educationDetails
 * @param callBack
 */
UserSchema.statics.addEducationDetail = function (userId, educationDetails, callBack) {

    var _this = this;

    var _educationDetails = {
        school: educationDetails.school,
        date_attended_from: educationDetails.date_attended_from,
        date_attended_to: educationDetails.date_attended_to,
        degree: educationDetails.degree,
        grade: educationDetails.grade,
        activities_societies: educationDetails.activities_societies,
        description: educationDetails.description
    };

    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }

    _this.update(
        {_id: userId},
        {
            $set: {
                created_at: this.created_at,
                updated_at: this.updated_at
            },
            $push: {
                education_details: _educationDetails
            }
        }, function (err, resultSet) {
            if (!err) {
                callBack({
                    status: 200
                });
            } else {
                console.log("Server Error --------")
                callBack({status: 400, error: err});
            }
        });

};


/**
 * retrieve particular educational detail of a user
 * @param userId
 * @param _education_id
 * @param callBack
 */
UserSchema.statics.retrieveEducationDetail = function (criteria, callBack) {

    var _this = this;
    _this.findOne(criteria)
        .exec(function (err, resultSet) {
            var ue = _this.formatEducation(resultSet);
            if (!err) {
                callBack({
                    status: 200,
                    user: ue

                });
            } else {
                console.log("Server Error --------")
                callBack({status: 400, error: err});
            }
        });


};


/**
 * update particular educational detail of a user
 * @param userId
 * @param educationDetails
 * @param callBack
 */
UserSchema.statics.updateEducationDetail = function (userId, educationDetails, callBack) {

    var _this = this;
    _this.update({_id: userId, "education_details._id": educationDetails._id},
        {
            $set: {
                "education_details.$.school": educationDetails.school,
                "education_details.$.date_attended_from": educationDetails.date_attended_from,
                "education_details.$.date_attended_to": educationDetails.date_attended_to,
                "education_details.$.degree": educationDetails.degree,
                "education_details.$.grade": educationDetails.grade,
                "education_details.$.activities_societies": educationDetails.activities_societies,
                "education_details.$.description": educationDetails.description,
            }
        }, function (err, resultSet) {
            if (!err) {
                callBack({
                    status: 200
                });
            } else {
                console.log("Server Error --------")
                console.log(err)
                callBack({status: 400, error: err});
            }
        });

};


/**
 * delete particular educational detail of a user
 * @param userId
 * @param educationId
 * @param callBack
 */
UserSchema.statics.deleteEducationDetail = function (userId, educationId, callBack) {

    var _this = this;

    _this.update({_id: userId},
        {$pull: {education_details: {_id: educationId}}}, function (err, resultSet) {
            if (!err) {
                callBack({
                    status: 200
                });
            } else {
                console.log("Server Error --------")
                callBack({status: 400, error: err});
            }
        });

};


/**
 * WORKING EXPERIENCE SECTION
 */


/**
 * Add Working Experience Details
 * @param userId
 * @param workingExperienceDetails
 * @param callBack
 */
UserSchema.statics.addWorkingExperience = function (userId, workingExperienceDetails, callBack) {

    var _this = this;

    var _workingExperienceDetails = {
        company_name: workingExperienceDetails.company_name,
        title: workingExperienceDetails.title,
        location: workingExperienceDetails.location,
        start_date: workingExperienceDetails.start_date,
        end_date: workingExperienceDetails.end_date,
        is_current_work_place: workingExperienceDetails.is_current_work_place,
        description: workingExperienceDetails.description
    }

    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }

    _this.update(
        {_id: userId},
        {
            $set: {
                created_at: this.created_at,
                updated_at: this.updated_at
            },
            $push: {
                working_experiences: _workingExperienceDetails
            }
        }, function (err, resultSet) {
            if (!err) {
                callBack({
                    status: 200
                });
            } else {
                console.log("Server Error --------")
                console.log(err)
                callBack({status: 400, error: err});
            }
        });

}

/**
 * Update Working Experience
 * @param userId
 * @param workingExperienceDetails
 * @param callBack
 */
UserSchema.statics.updateWorkingExperience = function (userId, expId, workingExperienceDetails, callBack) {
    var _this = this;
    _this.update({_id: userId, "working_experiences._id": expId},
        {$set: workingExperienceDetails}, function (err, resultSet) {
            if (!err) {
                callBack({
                    status: 200
                });
            } else {
                console.log("Server Error --------")
                callBack({status: 400, error: err});
            }
        },
        {upsert: true, multi: true});

}

/**
 * Delete Working Experience
 * @param userId
 * @param workingExperienceId
 * @param callBack
 */
UserSchema.statics.deleteWorkingExperience = function (userId, workingExperienceId, callBack) {

    var _this = this;

    _this.update({_id: userId},
        {$pull: {working_experiences: {_id: workingExperienceId}}}, function (err, resultSet) {
            if (!err) {
                callBack({
                    status: 200
                });
            } else {
                console.log("Server Error --------")
                callBack({status: 400, error: err});
            }
        });
};

/**
 * Add Collage and Nob detail summery
 * This function is only for add genral information about Job and Collage information.
 * Other fields are in set to null
 * @param userId
 * @param data
 * @param callBack
 */
UserSchema.statics.addCollageAndJob = function (userId, data, callBack) {
    var _this = this;

    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }


    var _educationDetails = {
        school: data.school,
        date_attended_to: data.grad_date,
    }

    var _workingExperienceDetails = {
        company_name: data.company_name,
        title: data.job_title,

    }
    _this.update({_id: userId},
        {
            $unset: {
                "education_details": [],
                "working_experiences": []
            }
        }, {multi: true},
        function (err, resultSet) {


            if (!err) {
                _this.update(
                    {_id: userId},
                    {
                        $set: {
                            created_at: _this.created_at,
                            updated_at: _this.updated_at,
                            status: data.status

                        },
                        $push: {
                            education_details: _educationDetails,
                            working_experiences: _workingExperienceDetails
                        }
                    }, function (err, resultSet) {
                        console.log(resultSet)
                        if (!err) {
                            callBack({
                                status: 200
                            });
                        } else {
                            console.log("Server Error --------")
                            callBack({status: 400, error: err});
                        }
                    });
            } else {
                console.log("Server Error --------")
                console.log(err)
                callBack({status: 400, error: err});
            }
        });


};


/**
 * Add skills to a user
 * @param userId
 * @param skills
 * @param callBack
 */
UserSchema.statics.addSkills = function (userId, skills, callBack) {

    var _this = this;

    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }

    _this.update(
        {_id: userId},
        {
            $set: {
                created_at: this.created_at,
                updated_at: this.updated_at
            },
            $push: {
                skills: {$each: skills}
            }
        }, function (err, resultSet) {
            if (!err) {
                callBack({
                    status: 200
                });
            } else {
                console.log("Server Error --------", err);
                callBack({status: 400, error: err});
            }
        });

};


/**
 * delete skills from a user
 * @param userId
 * @param skills
 * @param callBack
 */
UserSchema.statics.deleteSkills = function (userId, skills, callBack) {

    var _this = this;

    _this.update({_id: userId},
        {$pull: {"skills": {"skill_id" : {$in: skills}}}}, function (err, resultSet) {
            if (!err) {
                callBack({
                    status: 200
                });
            } else {
                console.log("Server Error --------")
                callBack({status: 400, error: err});
            }
        });


};


/**
 * Get User By Search Criteria
 */
UserSchema.statics.findByCriteria = function (criteria, callBack) {
    var _this = this;

    _this.findOne(criteria, function (err, resultSet) {

        if (!err) {
            callBack({
                status: 200,
                user: resultSet

            });
        } else {
            console.log("Server Error --------")
            callBack({status: 400, error: err});
        }
    });

};


/**
 * Update User profile based on the criteria
 * @param userId
 * @param data
 * @param callBack
 */
UserSchema.statics.updatePassword = function (userId, password, callBack) {
    var _this = this;

    var _salt = createSalt();

    var info = {
        salt: _salt,
        password: createHash(_salt, password),
        resetPasswordToken: null,
        resetPasswordExpires: null
    }

    _this.update({_id: userId},
        {$set: info}, function (err, resultSet) {
            if (!err) {
                callBack({
                    status: 200
                });
            } else {
                console.log("Server Error --------")
                callBack({status: 400, error: err});
            }
        });
};

/**
 * Get user Based on User Id
 * @param userId
 * @param callBack
 */
UserSchema.statics.getUser = function (criteria, showOptions, callBack) {
    var _this = this;
    _this.findOne(criteria)
        .exec(function (err, resultSet) {
            if (!err) {
                callBack({
                    status: 200,
                    user: _this.formatUser(resultSet, showOptions)

                });
            } else {
                console.log("Server Error --------")
                callBack({status: 400, error: err});
            }
        });
}


/**
 * Get user password Based on User Id
 * @param userId
 * @param callBack
 */
UserSchema.statics.getUserAllDetails = function (criteria, callBack) {
    var _this = this;
    _this.findOne(criteria)
        .exec(function (err, resultSet) {
            if (!err) {
                var _profileData = {
                    id: resultSet._id,
                    token: uuid.v1() + resultSet._id,
                    first_name: resultSet.first_name,
                    last_name: resultSet.last_name,
                    email: resultSet.email,
                    status: resultSet.status,
                    user_name: resultSet.user_name,
                    country: resultSet.country,
                    dob: resultSet.dob,
                    secretary_id: resultSet.secretary
                };

                for (var i = 0; i < resultSet.working_experiences.length; i++) {
                    if (resultSet.working_experiences[i].is_current_work_place) {
                        _profileData['company_name'] = resultSet.working_experiences[i].company_name;
                        _profileData['job_title'] = resultSet.working_experiences[i].title;
                    }
                }

                if (resultSet.education_details.length > 0) {
                    _profileData['school'] = resultSet.education_details[0].school;
                    _profileData['grad_date'] = resultSet.education_details[0].date_attended_to;
                }
                callBack({
                    status: 200,
                    user: _profileData
                });
            } else {
                console.log("Server Error --------")
                callBack({status: 400, error: err});
            }
        });
}

/**
 * Get All registered users
 * Users are taking from elastic search
 * @param callBack
 */
UserSchema.statics.getAllUsers = function (q, userId, callBack) {
    var query = {
        q: q,
        index: 'idx_usr'
    };
    ES.search(query, function (esResultSet) {
        var tmp_arr = [];
        for (var a = 0; a < esResultSet.result.length; a++) {
            if (typeof userId != 'undefined' && esResultSet.result[a] != userId) {
                tmp_arr.push(esResultSet.result[a])
            }
        }
        callBack({total_result: esResultSet.result_count, users: tmp_arr});
        return 0
    });
}


/**
 * DATA FORMATTER HELPER FUNCTION WILL DEFINE HERE
 */


/**
 * Format User object
 * @param userObject
 * @returns {*}
 */
UserSchema.statics.formatUser = function (userObject, showOptions) {

    if (userObject) {
        var _temp_user = {
            user_id: userObject._id.toString(),
            email: userObject.email,
            first_name: userObject.first_name,
            last_name: userObject.last_name,
            zip_code: userObject.zip_code,
            dob: userObject.dob,
            country: userObject.country,
            user_name: userObject.user_name,
            introduction: userObject.introduction,
            onlineMode: userObject.onlineMode,
            settings: userObject.settings
        };
        for (var i = 0; i < userObject.working_experiences.length; i++) {
            if (userObject.working_experiences[i].is_current_work_place) {
                _temp_user['cur_exp_id'] = userObject.working_experiences[i]._id;
                _temp_user['cur_working_at'] = userObject.working_experiences[i].company_name;
                _temp_user['cur_designation'] = userObject.working_experiences[i].title;
            }
        }
        if (typeof showOptions.w_exp != 'undefined' && showOptions.w_exp) {
            _temp_user['working_experiences'] = [];
            _temp_user['working_experiences'] = this.formatWorkingExperiences(userObject);
        }
        if (typeof showOptions.edu != 'undefined' && showOptions.edu) {
            _temp_user['education_details'] = [];
            _temp_user['education_details'] = this.formatEducation(userObject);
        }

        if (typeof showOptions.skill != 'undefined' && showOptions.skill) {
            _temp_user['skills'] = [];
            _temp_user['skills'] = userObject.skills

        }

        if (typeof userObject.zip_code != 'undefined' && userObject.zip_code) {
            _temp_user['city_details'] = [];
            if (userObject.country == 'United States') {
                var cityByZip = this.getCityByZip(userObject.zip_code);
                _temp_user['city_details'] = cityByZip ? cityByZip : userObject.country;
            } else {
                _temp_user['city_details'] = userObject.country;
            }

        } else {
            _temp_user['city_details'] = userObject.country;
        }

        return _temp_user
    }

    return null;
}

/**
 * Get US City By Zip Code
 * @param zipCode
 */
UserSchema.statics.getCityByZip = function (zipCode) {
    var cityObject = cities.zip_lookup(zipCode);
    if (typeof cityObject == 'undefined' || cityObject == '' || cityObject == null) {
        return null;
    }
    var city = cityObject.city
    if (typeof city == 'undefined' || city == '' || city == null) {
        return null;
    }
    return city;
}

/**
 * Format Education Detail
 * @param userObject
 */
UserSchema.statics.formatEducation = function (userObject) {
    var _temp_user = []
    for (var i = 0; i < userObject.education_details.length; i++) {
        _temp_user.push({
            "edu_id": userObject.education_details[i]._id,
            "description": userObject.education_details[i].description,
            "activities_societies": userObject.education_details[i].activities_societies,
            "grade": userObject.education_details[i].grade,
            "degree": userObject.education_details[i].degree,
            "date_attended_to": userObject.education_details[i].date_attended_to,
            "date_attended_from": userObject.education_details[i].date_attended_from,
            "school": userObject.education_details[i].school
        });
    }
    return _temp_user;

}


UserSchema.statics.formatWorkingExperiences = function (userObject) {
    var _temp_we = [],
        _tmp_start_years = [],

        _tmp_we_by_year = {};
    for (var i = 0; i < userObject.working_experiences.length; i++) {


        if (userObject.working_experiences[i].is_current_work_place) {
            _temp_we.push({
                "exp_id": userObject.working_experiences[i]._id,
                "company_name": userObject.working_experiences[i].company_name,
                "title": userObject.working_experiences[i].title,
                "location": userObject.working_experiences[i].location,
                "start_date": userObject.working_experiences[i].start_date,
                "left_date": userObject.working_experiences[i].left_date,
                "description": userObject.working_experiences[i].description,
                "is_current_work_place": userObject.working_experiences[i].is_current_work_place
            });
        } else {
            var _strt_year = userObject.working_experiences[i].start_date.year;
            if (_tmp_start_years.indexOf(Number(_strt_year)) == -1)
                _tmp_start_years.push(Number(_strt_year));

            if (typeof _tmp_we_by_year[_strt_year] == 'undefined')
                _tmp_we_by_year[_strt_year] = [];
            _tmp_we_by_year[_strt_year].push({
                "exp_id": userObject.working_experiences[i]._id,
                "company_name": userObject.working_experiences[i].company_name,
                "title": userObject.working_experiences[i].title,
                "location": userObject.working_experiences[i].location,
                "start_date": userObject.working_experiences[i].start_date,
                "left_date": userObject.working_experiences[i].left_date,
                "description": userObject.working_experiences[i].description,
                "is_current_work_place": userObject.working_experiences[i].is_current_work_place
            });
        }

    }
    _tmp_start_years.sort(function (a, b) {
        return b - a;
    });
    for (var i = 0; i < _tmp_start_years.length; i++) {
        var _year = _tmp_start_years[i];
        for (var a = 0; a < _tmp_we_by_year[_year].length; a++) {
            _temp_we.push(_tmp_we_by_year[_year][a]);
        }
    }
    return _temp_we;
}


UserSchema.statics.formatSkills = function (userObject, callBack) {
    var Skill = require('mongoose').model('Skill'),
        _async = require('async'),
        _tmp_out = {
            'day_to_day_comforts': [],
            'experienced': []
        };

    if (userObject.skills != undefined && userObject.skills) {
        _async.each(userObject.skills,
            function (skill, callBack) {

                Skill.getSkillById(Util.toObjectId(skill.skill_id), function (resultSet) {

                    if (skill.is_day_to_day_comfort === 1) {
                        _tmp_out['day_to_day_comforts'].push({
                            id: resultSet.skill.id,
                            name: resultSet.skill.name
                        });
                        callBack();

                    } else {
                        //if(skill.is_day_to_day_comfort === 0){
                        _tmp_out['experienced'].push({
                            id: resultSet.skill.id,
                            name: resultSet.skill.name
                        });
                        callBack();
                    }

                });

            },
            function (err) {

                callBack(_tmp_out);
            });
    } else {
        callBack(_tmp_out);
    }

}
/**
 * Format Connection users data
 * @param resultSet
 * @returns {*}
 */
UserSchema.statics.formatConnectionUserDataSet = function (resultSet) {
    var _tmp_object = [];
    for (var i = 0; i < resultSet.length; i++) {

        _tmp_object.push(this.formatUser(resultSet[i]));
    }
    return _tmp_object;
};


/**
 * CACHE IMPLEMENTATION
 */
UserSchema.statics.addUserToCache = function (userId, callBack) {
    var _async = require('async'),
        Connection = require('mongoose').model('Connection'),
        Upload = require('mongoose').model('Upload'),
        _this = this;
    _async.waterfall([
        function getUserById(callBack) {
            var _search_param = {
                    _id: Util.toObjectId(userId),
                },
                showOptions = {
                    w_exp: false,
                    edu: false
                };

            _this.getUser(_search_param, showOptions, function (resultSet) {
                if (resultSet.status == 200) {
                    callBack(null, resultSet.user)
                }
            })
        },
        function getConnectionCount(profileData, callBack) {

            if (profileData != null) {
                Connection.getFriendsCount(profileData.user_id, function (connectionCount) {
                    profileData['connection_count'] = connectionCount;
                    callBack(null, profileData);
                    return 0
                });
            } else {
                callBack(null, null)
            }
        },
        function getProfileImage(profileData, callBack) {


            Upload.getProfileImage(profileData.user_id.toString(), function (profileImageData) {

                if (profileImageData.status != 200) {
                    profileData['images'] = {
                        'profile_image': {
                            id: "DEFAULT",
                            file_name: "/images/default-profile-image.png",
                            file_type: ".png",
                            http_url: Config.DEFAULT_PROFILE_IMAGE
                        }
                    };
                } else {
                    profileData['images'] = profileImageData.image;

                }


                callBack(null, profileData)
                return 0;
            });

        }

    ], function (err, profileData) {
        var outPut = {};
        if (!err) {

            outPut['status'] = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
            outPut['profile_data'] = profileData;

            var payLoad = {
                index: "idx_usr",
                id: profileData.user_id,
                type: 'user',
                data: profileData,
                tag_fields: ['first_name', 'last_name', 'email', 'user_name', 'country']
            }

            ES.createIndex(payLoad, function (resultSet) {
                callBack(resultSet)
                return 0;
            });

        } else {
            callBack(err)
            return 0;
        }
    })
}

UserSchema.statics.validatePassword = function(data, callback) {
    var _this = this;
    var criteria = {email: data.email}
    _this.findOne(criteria, function (err, resultSet) {
        if (!err) {
            if (resultSet == null) {
                callback({status: 404, error: Alert.USER_NOT_FOUND});
            } else if (resultSet.password != createHash(resultSet.salt, data.password)) {
                callback({status: 401, error: Alert.INVALID_PASSWORD});
            } else {
                callback({status: 200, error: null});
            }
        }
    });
},

    /**
     * authenticating user
     */
    UserSchema.statics.authenticate = function (data, callback) {
        var _this = this;
        var criteria = {email: data.user_name}
        _this.findOne(criteria, function (err, resultSet) {

        if (!err) {
            if (resultSet == null) {
                callback({status: 200, error: Alert.USER_NOT_FOUND});
            } else if (resultSet.password != createHash(resultSet.salt, data.password)) {
                callback({status: 200, error: Alert.INVALID_PASSWORD});
            } else {
                var _async = require('async'),
                    Secretary = require('mongoose').model('Secretary'),
                    Upload = require('mongoose').model('Upload');

                _async.waterfall([
                    function formatUserData(callBack) {

                        // TWILIO.token.identity = resultSet.user_name;

                        var _profileData = {
                            id: resultSet._id,
                            token: uuid.v1() + resultSet._id,
                            first_name: resultSet.first_name,
                            last_name: resultSet.last_name,
                            email: resultSet.email,
                            status: resultSet.status,
                            user_name: resultSet.user_name,
                            country: resultSet.country,
                            dob: resultSet.dob,
                            secretary_id: resultSet.secretary,
                            online_mode:resultSet.onlineMode,
                            settings: resultSet.settings,
                            // twilio_token: TWILIO.token.toJwt()
                        };

                        for (var i = 0; i < resultSet.working_experiences.length; i++) {
                            if (resultSet.working_experiences[i].is_current_work_place) {
                                _profileData['company_name'] = resultSet.working_experiences[i].company_name;
                                _profileData['job_title'] = resultSet.working_experiences[i].title;
                            }
                        }

                        if (resultSet.education_details.length > 0) {
                            _profileData['school'] = resultSet.education_details[0].school;
                            _profileData['grad_date'] = resultSet.education_details[0].date_attended_to;
                        }

                        callBack(null, _profileData);
                    },
                    function getSecretary(profileData, callBack) {

                        if (profileData.secretary_id != null) {
                            Secretary.getSecretaryById(profileData.secretary_id, function (secretary) {
                                profileData['secretary_image_url'] = secretary.image_name;
                                profileData['secretary_name'] = secretary.full_name;
                                callBack(null, profileData);
                                return 0
                            });
                        } else {
                            callBack(null, profileData)
                        }
                    },
                    function getProfileImage(profileData, callBack) {

                        if (profileData != null) {
                            Upload.getProfileImage(profileData.id.toString(), function (profileImageData) {
                                profileData['profile_image'] = (profileImageData.status != 400) ? (profileImageData.image.hasOwnProperty('profile_image') ? profileImageData.image.profile_image.http_url : Config.DEFAULT_PROFILE_IMAGE) : Config.DEFAULT_PROFILE_IMAGE;
                                callBack(null, profileData)
                                return 0;
                            });
                        } else {
                            callBack(null, null)
                        }
                    }

                ], function (err, profileData) {
                    var outPut = {};
                    if (!err) {

                        callback({status: 200, user: profileData});


                    } else {
                        callback(err)
                        return 0;
                    }
                })
            }
        } else {
            console.log("Server Error --------")
            callback({status: 400, error: err});
        }
    });

};


/**
 * authenticating user
 */
UserSchema.statics.getApiVerification = function (data, callback) {
    var _this = this;
    var criteria = {email: data.user_name}
    _this.findOne(criteria, function (err, resultSet) {

        if (!err) {
            if (resultSet == null) {
                callback({status: 200, error: Alert.USER_NOT_FOUND});
            } else {
                var code = Config.API_KEY + data.dt;
                var vCode = createHash(resultSet.salt, code);
                var vName = createHash(resultSet.salt, resultSet.user_name);
                callback({status: 200, verificationCode: vCode, verificationName: vName});
            }
        } else {
            console.log("Error while getting api verification code --------")
            callback({status: 400, error: err});
        }
    });

};

UserSchema.statics.getSenderDetails = function (related_senders, callBack) {
    var _this = this;
    var _async = require('async');

    var users = [];
    _async.waterfall([
        function getUserDetails(callBack) {
            _async.eachSeries(related_senders, function (user, callBack) {
                var query = {
                    q: "user_id:" + user.toString(),
                    index: 'idx_usr'
                };
                //Find User from Elastic search
                ES.search(query, function (csResultSet) {
                    if (csResultSet != undefined) {
                        var _result = csResultSet.result[0];
                        var _images = _result['images'];
                        var _pic = _images.hasOwnProperty('http_url') ? _images['http_url'] : _images.hasOwnProperty('profile_image') ? _images['profile_image']['http_url'] : "images/default-profile-pic.png";
                        _pic = _pic == undefined ? "images/default-profile-pic.png" : _pic;
                        users.push(
                            {
                                sender_id: user,
                                sender_name: _result['first_name'] + " " + _result['last_name'],
                                sender_user_name: _result['user_name'],
                                profile_image: _pic
                            }
                        );
                    }

                    callBack(null);
                });

            }, function (err) {
                callBack(null);
            });
        }
    ], function (err) {
        if (!err) {
            callBack({status: 200, users_list: users});
        } else {
            callBack({status: 400, error: err});
        }
    });

};

UserSchema.statics.modes = {
    ONLINE: 1,
    OFFLINE: 2,
    WORK_MODE: 3
};

mongoose.model('User', UserSchema);
