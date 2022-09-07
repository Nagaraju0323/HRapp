

// const jwt = require('express-jwt');
// const jwt = require('express-jwt');
// const expressJwt = require('express-jwt');
var jwt = require('express-jwt');
const { secret } = require('config.json');
const db = require('_helpers/db');
const { JsonWebTokenError } = require('jsonwebtoken');

module.exports = authorize;
// module.exports = authorizehr;


function authorize() {
    return [
        // authenticate JWT token and attach decoded token to request as req.user
        jwt({ secret, algorithms: ['HS256'] }),
      

        // attach full user record to request object
        async (req, res, next) => {
            // get user with id from token 'sub' (subject) property
            const user = await db.User.findByPk(req.user.sub);

            // check user still exists
            if (!user)
                return res.status(401).json({ message: 'Unauthorized' });

            // authorization successful
            req.user = user.get();
            next();
        }
    ];
}


// function authorizehr() {
//     return [
//         // authenticate JWT token and attach decoded token to request as req.user
//         jwt({ secret, algorithms: ['HS256'] }),
      

//         // attach full user record to request object
//         async (req, res, next) => {
//             // get user with id from token 'sub' (subject) property
//             const user = await db.Hr.findByPk(req.user.sub);

//             // check user still exists
//             if (!user)
//                 return res.status(401).json({ message: 'Unauthorized' });

//             // authorization successful
//             req.user = user.get();
//             next();
//         }
//     ];
// }




