import { connectToMongoDB } from '@/dbConfig/dbConfig';
import User from '@/models/userModel';
import { NextRequest, NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

connectToMongoDB();

export async function POST(request: NextRequest) {
	try {
		// 1- grab the data inside the request
		const reqBody = await request.json();
		// 1.1 destructure the data
		const { email, password } = reqBody;
		console.log(reqBody);

		// 2- check if this user exists by checking it's email before login
		const user = await User.findOne({ email });
		// no valid user
		if (!user) {
			return NextResponse.json(
				{
					error: 'User does not exist in DB',
				},
				{ status: 400 }
			);
		}
		console.log(user);

		// 3- check if the password is correct
		// password is coming from the request
		// user.password is coming from the DB
		const validPassword = await bcryptjs.compare(password, user.password);
		// not valid password
		if (!validPassword) {
			return NextResponse.json({ error: 'Invalid password' }, { status: 400 });
		}

		// 4- create the TOKEN data
		const tokenData = {
			id: user._id,
			username: user.username,
			email: user.email,
		};

		// 4.1 - create TOKEN
		const token = await jwt.sign(tokenData, process.env.TOKEN_SECRET!, {
			expiresIn: '2d',
		});

		// user's cookies
		const response = NextResponse.json({
			message: 'Login Successful',
			success: true,
		});

		// 4.2- send TOKEN to user's cookies
		response.cookies.set('token', token, { httpOnly: true });
		return response;
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
