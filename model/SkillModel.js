/**
 * Skill Model will communicate with skills collection
 */

'use strict'
var  mongoose = require('mongoose'),
    Schema   = mongoose.Schema;


var SkillSchema = new Schema({
    name:{
        type:String,
    },
    created_at:{
        type:Date
    },
    updated_at:{
        type:Date
    }

},{collection:"skills"});

SkillSchema.pre('save', function(next){
    var now = new Date();
    this.updated_at = now;
    if ( !this.created_at ) {
        this.created_at = now;
    }
    next();
});


/**
 * Create new skill
 * @param SkillData
 * @param callBack
 */
SkillSchema.statics.create = function(SkillData,callBack){

    this.collection.insert(SkillData,function(err,resultSet){
        if(! err){
            callBack({status:200, result:resultSet});
        }else{
            console.log("Server Error --------");
            console.log(err);
            callBack({status:400,error:err});
        }

    });

};


/**
 * get all the skills in the collection
 * @param callBack
 */
SkillSchema.statics.getSkills =function(callBack){
    var _this = this;
    _this.find({})
        .exec(function(err,resultSet){
            if(! err){

                var skills = [];

                for(var i =0; i < resultSet.length;i++ ){
                    skills.push({
                        id:resultSet[i]._id,
                        name:resultSet[i].name
                    });
                }
                callBack({status:200,result:skills});
            }else{
                console.log(err)
                callBack({status:400,error:err})
            }
        });
};

/**
 * Get a Skill by Id
 * @param id
 * @param callBack
 */
SkillSchema.statics.getSkillById=function(skillId,callBack){

    this.findOne({_id:skillId}).
        exec(function(err,resultSet){
            if(! err){

                var skill = {
                    id:resultSet._id,
                    name:resultSet.name
                };
                callBack({status:200,skill:skill});
            }else{
                console.log(err)
                callBack({status:400,error:err})
            }
        });
};


/**
 * update a skill
 * @param id
 * @param data
 * @param callBack
 */
SkillSchema.statics.updateSkill=function(skillId, data, callBack){

    console.log(skillId); console.log(data);

    var _this = this;

    _this.update({_id:skillId},
        {$set:data},function(err,resultSet){
            if(!err){
                callBack({status:200});
            }else{
                console.log("Server Error --------")
                callBack({status:400,error:err});
            }
        });



};


/**
 * delete a skill
 * @param skillId
 * @param callBack
 */
SkillSchema.statics.deleteSkill=function(skillId, callBack){

    var _this = this;

    _this.findOneAndRemove({_id:skillId},function(err,resultSet){
            if(!err){
                callBack({status:200});
            }else{
                console.log("Server Error --------")
                callBack({status:400,error:err});
            }
        });

};

mongoose.model('Skill',SkillSchema);
