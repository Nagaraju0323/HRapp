
function errorHandler(err, req, res, next) {
      
    console.log('------errormessage')
    switch (true) {
        
        case typeof err === 'string':
            // custom application error
            const is404 = err.toLowerCase().endsWith('not found');
            const statusCode = is404 ? 404 : 400;
            return res.status(statusCode).json({data:[],meta:{statusCode:statusCode,message: err} });
        case err.name === 'UnauthorizedError':
            // jwt authentication error
            const statusCodes = 401;
            return res.status(401).json({data:[],meta:{statusCode:statusCodes,message: 'Unauthorized'}});
        default:
            const statusCodess = 401;
            return res.status(500).json({data:[],meta:{statusCode:statusCodess,message: err.message}});
    }
}


function successResponse(res,data,status,message){
  
    console.log('------message')
  
    if ( typeof data == 'undefined')
    {
        let datas = [];
        let jsonData = {
            data:datas,
            meta:{
                statusCode:status,
                message:message
            }
        }
       return res.status(200).json(jsonData)
    }else {

        let jsonData = {
            data:data,
            meta:{
                statusCode:status,
                message:message
            }
        }
    
       return res.status(200).json(jsonData)

        
    }
    
//     let jsonData = {
//         data:data,
//         meta:{
//             statusCode:status,
//             message:message
//         }
//     }

//    return res.status(200).json(jsonData)

}

module.exports.errorHandler = errorHandler
module.exports.successResponse = successResponse