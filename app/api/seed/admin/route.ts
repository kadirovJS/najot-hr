import { NextResponse } from "next/server";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db";

export async function GET() {
  await dbConnect();
  
  const adminExists = await User.findOne({ role: 'SUPER_ADMIN' });
  
  if (adminExists) {
    return NextResponse.json({ message: "Admin allaqachon mavjud" }, { status: 400 });
  }
  
  const hashedPassword = await bcrypt.hash("admin123", 10);
  
  const admin = await User.create({
    name: "Super Admin",
    phone: "998901234567",
    password: hashedPassword,
    role: "SUPER_ADMIN",
    department: "Boshqaruv"
  });
  
  return NextResponse.json({ 
    message: "Super Admin yaratildi", 
    phone: admin.phone, 
    password: "admin123" 
  });
}