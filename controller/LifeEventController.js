/**
 * This is life event category controller.
 */
var LifeEventController = {

    /**
     * Get Life event categories
     * @param req
     * @param res
     */
    getLifeEventCategories :function(req,res){
        var LifeEventCategory = require('mongoose').model('LifeEventCategory');

        LifeEventCategory.getLifeEventCategories(function(resultSet){
            var outPut = {}
            if(resultSet.status != 200){

                outPut['status']    = ApiHelper.getMessage(200, Alert.ERROR, Alert.ERROR);
                outPut['error']     = resultSet.error;
            }

            outPut['status']    = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
            outPut['life_event_categories']   = resultSet.life_event_categories;
            res.status(200).send(outPut);
            return ;
        });

    },
    getLifeEvents:function(req,res){


        var LifeEvent = require('mongoose').model('LifeEvent'),
            outPut ={};


        LifeEvent.getLifeEventsByCategory(req.query['cat_id'],function(resultSet){
            outPut['status']    = ApiHelper.getMessage(200, Alert.SUCCESS, Alert.SUCCESS);
            outPut['life_events']   = resultSet.life_events;
            res.status(200).send(outPut);
        });
    }
}



module.exports = LifeEventController;