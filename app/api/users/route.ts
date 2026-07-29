import { NextResponse } from "next/server";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";

const allowedRoles = ['SUPER_ADMIN', 'TEACHER', 'HR', 'ACCOUNTANT', 'MARKETING_DESIGN', 'SALES'];
const allowedDepartments = ['Support teacher', 'Main teacher', 'Management', 'Sales', 'Boshqaruv', 'Other'];

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    
    const skip = (page - 1) * limit;

    const query = search 
      ? { $or: [{ name: { $regex: search, $options: "i" } }, { phone: { $regex: search, $options: "i" } }] }
      : {};

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    return NextResponse.json({
      users,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
      }
    });
  } catch (error) {
    console.error("GET USERS ERROR:", error);
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
    }

    await dbConnect();
    const body = await req.json();
    const { name, phone, password, department, role } = body;
    const normalizedPhone = typeof phone === 'string' ? phone.replace(/\D/g, '') : '';

    if (!/^998\d{9}$/.test(normalizedPhone)) {
      return NextResponse.json({ error: "Telefon raqamini +998 XX XXX XX XX formatida kiriting" }, { status: 400 });
    }
    if (!name?.trim() || typeof password !== 'string' || password.length < 4) {
      return NextResponse.json({ error: 'Ism va kamida 4 belgili parol kiriting' }, { status: 400 });
    }
    if (!allowedRoles.includes(role || 'TEACHER') || !allowedDepartments.includes(department)) {
      return NextResponse.json({ error: 'Rol yoki bo‘lim noto‘g‘ri tanlangan' }, { status: 400 });
    }

    const existingUser = await User.findOne({ phone: normalizedPhone });
    if (existingUser) {
      return NextResponse.json({ error: "Bu telefon raqami band" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      phone: normalizedPhone,
      password: hashedPassword,
      department,
      role: role || 'TEACHER',
      status: 'ACTIVE'
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("POST USER ERROR:", error);
    return NextResponse.json({ error: "Xodim qo'shishda xatolik" }, { status: 500 });
  }
}
