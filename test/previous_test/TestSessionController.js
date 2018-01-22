/**
 * This is test session controller
 */


var TestSessionController ={

    addToSession :function(req,res){
        var user ={
            first_name:req.body.fName,
            last_name:req.body.lName,
            email:req.body.email,

        }

        req.session.user = JSON.stringify(user);


        res.json(req.session.user);

    },
    getSession:function(req,res){
        res.json(req.session.user);
    },
    logout:function(req,res){
        req.session.destroy(function(err){
            if(err){
                res.json(err);
            } else {
                res.json("done");
            }
        });
    }
}



module.exports = TestSessionController;