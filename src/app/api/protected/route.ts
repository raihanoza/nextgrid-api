// // backend/app/api/protected/route.js
// import { NextResponse } from 'next/server';
// import jwt from 'jsonwebtoken';
// import cookie from 'cookie';

// export async function GET(req : Request) {
//   const cookies = cookie.parse(req.headers.get('cookie') || '');
//   const token = cookies.token;


//   if (!token) {
//     return NextResponse.json({ message: 'No token provided' }, { status: 401 });
//   }

//   try {
//     const decoded = jwt.verify(token, '123456');

//     // Proceed with the request
//     return NextResponse.json({ message: 'Authorized', user: decoded });
//   } catch (error) {
//     return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
//   }
// }
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

const SECRET_KEY = process.env.SECRET_KEY || '123456';

export async function GET(req: Request) {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const decoded = jwt.verify(token, SECRET_KEY);

    
    return NextResponse.json({ message: 'Protected data', data: decoded });
  } catch (err) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }
}
