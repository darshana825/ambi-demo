/**
 * Connection test controller
 */

var TestConnectionController ={
    getConnection:function(req,res){
        var User = require('mongoose').model('User');


        if(typeof req.query.pg  != 'undefined' &&
            req.query.pg != "" && req.query.pg > 1){
            criteria['pg'] = req.query.pg -1;
        }

        var criteria= {
            user_id: Util.toObjectId(req.params['id']),
            status: [ConnectionStatus.REQUEST_ACCEPTED, ConnectionStatus.REQUEST_SENT],
            country:"United States"
        }
        User.getConnectionUsers(criteria,function(resultSet){
            res.status(200).send(resultSet);
            return 0
            /*var outPut	={};
console.log(resultSet)
            if(resultSet.status !== 400){

                outPut['status'] = ApiHelper.getMessage(200,Alert.SUCCESS,Alert.SUCCESS);
                outPut['header'] ={
                    total_result:resultSet.total_result,
                    result_per_page:Config.CONNECTION_RESULT_PER_PAGE,
                    current_page:req.query.pg,
                    total_pages:Math.ceil(resultSet.total_result/Config.CONNECTION_RESULT_PER_PAGE)
                };

                outPut['connections'] = resultSet.users

                res.status(200).send(resultSet);
                return 0
            }else{
                outPut['status'] = ApiHelper.getMessage(400,Alert.CONNECTION_USERS_EMPTY,Alert.ERROR);

                res.status(400).send(outPut);
                return 0;
            }*/

        });
    },
    myConnections:function(req,res){
        var Connection = require('mongoose').model('Connection');
        var criteria = {
            user_id :req.params['id'],
            q:req.params['q']
        }


        Connection.getMyConnection(criteria,function(resultSet){
            res.status(200).send(resultSet);
            return 0
        })


    },

    getFriendRequests:function(req,res){
        var Connection =require('mongoose').model('Connection');

        var criteria ={
            user_id:req.params['id'],
            pg:0,
            result_per_page:3

        }
        Connection.getConnectionRequests(criteria,function(resultSet){
            res.status(200).send(resultSet);
            return 0
        });
    },

    acceptFriendRequest:function(req,res){


        var Connection =require('mongoose').model('Connection');

        var criteria ={
            sender_id  :req.body.sender_id,
            user_id:req.params['id']
        }

        Connection.acceptConnectionRequest(criteria,function(resultSet){
            res.status(200).send(resultSet);
            return 0
        });

    }
}


module.exports =TestConnectionController;