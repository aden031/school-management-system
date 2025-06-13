import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import connectToDatabase from "@/lib/db"
import User from "@/lib/models/user"

export async function POST(request: Request) {
  try {
    const { Email, password, studentId } = await request.json();

    if ((!Email && !studentId) || !password) {
      return NextResponse.json(
        { error: "Email or studentId and password are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Search for user by either Email or studentId
    const query: any = {};
    if (Email) query.Email = Email;
    if (studentId) query.studentId = studentId;

    const user = await User.findOne(query);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email/studentId or password" },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid email/studentId or password" },
        { status: 401 }
      );
    }

    const { password: _, ...userData } = user.toObject();
    return NextResponse.json(userData);
  } catch (error) {
    console.error("POST /api/users/login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
