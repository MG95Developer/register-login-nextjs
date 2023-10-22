import { connectToMongoDB } from '@/dbConfig/dbConfig';

import User from '@/models/userModel';

import { NextRequest, NextResponse } from 'next/server';

import bcryptjs from 'bcryptjs';

connectToMongoDB();

// POST route (Create a new user inside the DB)
export async function POST(request: NextRequest) {
	try {
		// grab data from body
		const reqBody = await request.json();

		// destructure the incoming variables
		const { username, email, password } = reqBody;

		// REMOVE IN PRODUCTION
		console.log(reqBody);

		const user = await User.findOne({ email });

		if (user) {
			return NextResponse.json(
				{
					error: 'This user already exists',
				},
				{ status: 400 }
			);
		}

		// hash password
		const salt = await bcryptjs.genSalt(10);
		const hashedPassword = await bcryptjs.hash(password, salt);

		// create a new user
		const newUser = new User({
			username,
			email,
			password: hashedPassword,
		});

		// save it inside the DB
		const savedUser = await newUser.save();

		return NextResponse.json({
			message: 'User created!',
			success: true,
			savedUser,
		});
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
