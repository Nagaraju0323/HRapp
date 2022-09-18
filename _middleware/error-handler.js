
function errorHandler(err, req, res, next) {
      
    console.log('------errormessage')
    switch (true) {
        
        case typeof err === 'string':
            // custom application error
            const is404 = err.toLowerCase().endsWith('not found');
            const statusCode = is404 ? 404 : 400;
            let datas = [];
            return res.status(statusCode).json({meta:{statusCode:statusCode,message: err} });
        case err.name === 'UnauthorizedError':
            // jwt authentication error
            const statusCodes = 401;
            return res.status(401).json({meta:{statusCode:statusCodes,message: 'Unauthorized'}});
        default:
            const statusCodess = 401;
            return res.status(500).json({meta:{statusCode:statusCodess,message: err.message}});
    }
}


function successResponse(res,data,status,message){
  
    // console.log('------message')
  
    if ( typeof data == 'undefined')
    {
    
      
        let jsonData = {
            meta:{
                statusCode:status,
                message:message
            }
        }
       return res.status(200).json(jsonData)
    }else {

        if (data.length == 0) {
            let jsonData = {
                meta:{
                    statusCode:404,
                    message:"not found"
                }
            }
        
           return res.status(404).json(jsonData)
        } else {
            let jsonData = {
                data:data,
                meta:{
                    statusCode:status,
                    message:message
                }
            }
        
           return res.status(200).json(jsonData)
        }

        

        
    }
}

module.exports.errorHandler = errorHandler
module.exports.successResponse = successResponse